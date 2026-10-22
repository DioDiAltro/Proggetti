/* ASD a quadretti — visualizzatore passo-passo.

   Un algoritmo si visualizza in due tempi:
   1. una funzione "trace" lo esegue in JavaScript e registra un fotogramma per
      ogni passo con ASD.Tracer (riga di codice, spiegazione, variabili,
      contatori, stato da disegnare);
   2. lo Stepper riproduce i fotogrammi: evidenzia la riga nel codice C++,
      ridisegna lo stato con una "vista" (ASD.viz.ArrayView, TreeView, ...),
      e offre avanti, indietro, play, velocità e linea del tempo.

   Così si può tornare indietro, saltare alla fine e cambiare l'input. */
(function () {
  'use strict';

  const { h } = ASD;

  const clone =
    typeof structuredClone === 'function'
      ? (v) => structuredClone(v)
      : (v) => (v === undefined ? v : JSON.parse(JSON.stringify(v)));

  /** Registra i fotogrammi di un'esecuzione. */
  ASD.Tracer = class Tracer {
    /** @param {string[]} counters nomi dei contatori, es. ['confronti', 'scambi'] */
    constructor(counters = []) {
      this.frames = [];
      this.c = {};
      for (const k of counters) this.c[k] = 0;
    }

    count(name, by = 1) {
      this.c[name] = (this.c[name] || 0) + by;
    }

    /**
     * Aggiunge un fotogramma.
     * @param {string|number|null} line etichetta //@nome nel sorgente (o numero di riga)
     * @param {string} note spiegazione in italiano (può contenere HTML semplice)
     * @param {object} vars variabili da mostrare, es. {i: 2, key: 7}
     * @param {object} state stato per la vista (copiato in profondità)
     */
    step(line, note, vars, state) {
      this.frames.push({ line, note, vars: vars ? { ...vars } : {}, count: { ...this.c }, state: clone(state || {}) });
      return this;
    }
  };

  const SPEEDS = [
    { id: 'lento', label: 'Lenta', ms: 1300 },
    { id: 'normale', label: 'Normale', ms: 700 },
    { id: 'veloce', label: 'Veloce', ms: 300 },
    { id: 'turbo', label: 'Turbo', ms: 70 },
  ];

  const ARRAY_INPUT = {
    label: 'Array',
    parse: (s) => ASD.parseNumbers(s, { min: 1, max: 99, minLen: 2, maxLen: 16 }),
    format: (v) => v.join(', '),
  };

  ASD.Stepper = class Stepper {
    /**
     * @param {HTMLElement} host
     * @param {object} o
     *   title     titolo del riquadro
     *   code      { src, region } oppure { code, file } per il pannello C++ (facoltativo)
     *   view      (elementoPalco, stepper) => oggetto con render(state, frame)
     *   trace     (input) => array di fotogrammi (ASD.Tracer.frames)
     *   input     { kind: 'array' | 'custom', value, label, parse, format, presets: [{label, value}] }
     *   counters  [{ key, label }] contatori da mostrare (chiavi usate in tracer.count)
     *   legend    [{ k: 'compare'|'swap'|'done'|'key'|'active'|'out'|'hole', label }]
     *   validate  (input, frames) => messaggio d'errore oppure null (controllo usato dai test)
     *   compact   true per la versione ridotta (senza intestazione)
     *   loop      () => nuovo input; se presente, a fine corsa riparte da solo
     */
    constructor(host, o) {
      this.o = Object.assign({ title: 'Passo per passo', counters: [], legend: null }, o);
      if (this.o.input && this.o.input.kind === 'array') this.o.input = Object.assign({}, ARRAY_INPUT, this.o.input);
      this.id = ASD.uid('st-' + (o.id || 'vis'));
      this.frames = [];
      this.i = 0;
      this.playing = false;
      this.warned = new Set();
      const saved = ASD.store.get('speed', 'normale');
      this.speed = SPEEDS.find((s) => s.id === saved) || SPEEDS[1];
      this.build(host);
      this.view = this.o.view(this.stageView, this);
      this.load(this.o.input ? this.o.input.value : undefined);
      ASD.steppers.push(this);
      this.observeVisibility();
    }

    /* ---------------------------------------------------------- costruzione */

    build(host) {
      const o = this.o;
      this.root = h('section.stepper', { 'aria-labelledby': this.id + '-t', 'data-stepper': this.id });
      if (o.compact) this.root.classList.add('compact');

      // intestazione: titolo e input
      const head = h('div.st-head', h('h3.st-title', { id: this.id + '-t', text: o.title }));
      if (o.input && !o.compact) head.append(this.buildInput());
      this.root.append(head);

      // corpo: codice + palco
      const main = h('div.st-main');
      this.stage = h('div.st-stage.quadretti');
      this.stageView = h('div.st-view');
      this.stage.append(this.stageView);
      if (o.legend && o.legend.length) {
        const lg = h('div.st-legend', { 'aria-label': 'Legenda dei colori' });
        for (const item of o.legend) lg.append(h('span', h('i.k-' + item.k), item.label));
        this.stage.append(lg);
      }
      if (o.code) {
        const codeHost = h('div.st-code');
        this.code = new ASD.CodePanel(codeHost, Object.assign({ maxHeight: o.compact ? 240 : undefined }, o.code));
        main.append(codeHost);
      }
      main.append(this.stage);
      this.root.append(main);

      // stato: spiegazione, variabili, contatori
      this.noteEl = h('p.st-note', { 'aria-live': 'polite' });
      this.factsEl = h('div.st-facts');
      this.root.append(h('div.st-status', this.noteEl, this.factsEl));

      // comandi
      const btn = (icon, label, fn) =>
        h('button.icon-btn', { type: 'button', 'aria-label': label, title: label, html: ASD.icon(icon), onclick: fn });
      this.btnFirst = btn('first', 'Torna all\'inizio', () => this.go(0));
      this.btnPrev = btn('prev', 'Passo indietro', () => this.prev());
      this.btnNext = btn('next', 'Passo avanti', () => this.next());
      this.btnLast = btn('last', 'Vai alla fine', () => this.go(this.frames.length - 1));
      this.btnPlay = h('button.btn.btn-primary.st-play', { type: 'button', onclick: () => this.toggle() });
      this.range = h('input', {
        type: 'range',
        min: '0',
        max: '0',
        value: '0',
        id: this.id + '-tl',
        'aria-label': 'Linea del tempo',
        oninput: () => {
          this.pause();
          this.go(Number(this.range.value));
        },
      });
      this.posEl = h('span.st-pos', { 'aria-hidden': 'true' });
      const speedId = this.id + '-sp';
      const speedSel = h(
        'select',
        {
          id: speedId,
          onchange: (e) => {
            this.speed = SPEEDS.find((s) => s.id === e.target.value) || SPEEDS[1];
            ASD.store.set('speed', this.speed.id);
            this.applySpeed();
          },
        },
        SPEEDS.map((s) => h('option', { value: s.id, selected: s.id === this.speed.id }, s.label))
      );
      const controls = h(
        'div.st-controls',
        h('div.st-buttons', this.btnFirst, this.btnPrev, this.btnPlay, this.btnNext, this.btnLast),
        h('div.st-timeline', this.range, this.posEl),
        h('label.st-speed', { for: speedId }, 'Velocità', speedSel)
      );
      this.root.append(controls);

      // tastiera: frecce per i passi quando il fuoco è dentro il riquadro
      this.root.addEventListener('keydown', (e) => {
        if (e.target.closest('input, select, textarea')) return;
        const map = { ArrowRight: () => this.next(), ArrowLeft: () => this.prev(), Home: () => this.go(0), End: () => this.go(this.frames.length - 1) };
        if (map[e.key] && !e.altKey && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          this.pause();
          map[e.key]();
        }
      });

      host.append(this.root);
      this.applySpeed();
      this.updatePlay();
    }

    buildInput() {
      const inp = this.o.input;
      const id = this.id + '-in';
      this.inputEl = h('input', {
        type: 'text',
        id,
        value: inp.format ? inp.format(inp.value) : String(inp.value),
        spellcheck: 'false',
        autocomplete: 'off',
      });
      this.errEl = h('p.st-err', { role: 'alert', hidden: true });
      const form = h(
        'form.st-input',
        {
          onsubmit: (e) => {
            e.preventDefault();
            this.applyText(this.inputEl.value);
          },
        },
        h('label', { for: id, text: inp.label || 'Input' }),
        this.inputEl,
        h('button.btn.btn-sm', { type: 'submit' }, 'Applica')
      );
      const presets = inp.presets || [];
      if (presets.length) {
        const box = h('span.st-presets');
        for (const p of presets) {
          box.append(
            h('button.btn.btn-sm.btn-ghost', {
              type: 'button',
              text: p.label,
              onclick: () => {
                const v = typeof p.value === 'function' ? p.value() : p.value;
                this.inputEl.value = inp.format ? inp.format(v) : String(v);
                this.setInput(v);
              },
            })
          );
        }
        form.append(box);
      }
      form.append(this.errEl);
      return form;
    }

    applyText(text) {
      const inp = this.o.input;
      try {
        const v = inp.parse ? inp.parse(text) : text;
        this.errEl.hidden = true;
        this.setInput(v);
      } catch (err) {
        this.errEl.textContent = err.message;
        this.errEl.hidden = false;
      }
    }

    setInput(v) {
      this.pause();
      this.load(v);
    }

    /* ------------------------------------------------------------ dati */

    load(value) {
      this.value = value;
      let frames;
      try {
        frames = this.o.trace(value);
      } catch (err) {
        console.error(`[stepper ${this.id}] errore nella traccia`, err);
        this.noteEl.textContent = 'Errore nella simulazione: ' + err.message;
        return;
      }
      if (!Array.isArray(frames) || frames.length === 0) {
        console.error(`[stepper ${this.id}] la traccia non ha prodotto fotogrammi`);
        return;
      }
      this.frames = frames;
      if (this.o.validate) {
        const problem = this.o.validate(value, frames);
        if (problem) console.error(`[stepper ${this.id}] controllo fallito: ${problem}`);
      }
      if (this.view && this.view.reset) this.view.reset();
      this.range.max = String(frames.length - 1);
      this.go(0);
    }

    /* -------------------------------------------------------- navigazione */

    go(i) {
      if (!this.frames.length) return;
      i = ASD.clamp(Math.round(i), 0, this.frames.length - 1);
      const f = this.frames[i];
      const before = this.frames[i - 1];
      this.i = i;
      try {
        this.view.render(f.state, f, this);
      } catch (err) {
        console.error(`[stepper ${this.id}] errore nel disegno del passo ${i}`, err);
      }

      if (this.code) {
        if (f.line == null) this.code.clear();
        else if (!this.code.highlight(f.line) && !this.warned.has(f.line)) {
          this.warned.add(f.line);
          console.warn(`[stepper ${this.id}] etichetta di codice inesistente: "${f.line}"`);
        }
      }

      // spiegazione
      let badge = '';
      if (this.code && f.line != null) {
        const idx = this.code.indexOf(f.line);
        if (idx != null) badge = `<span class="st-line">riga ${idx - this.code.range[0] + 1}</span>`;
      }
      this.noteEl.innerHTML = badge + (f.note || '');

      // variabili e contatori
      const facts = [];
      for (const [k, v] of Object.entries(f.vars || {})) {
        const changed = before && before.vars && before.vars[k] !== v;
        const el = h('span.st-var' + (changed ? '.is-changed' : ''));
        el.innerHTML = `<b>${ASD.esc(k)}</b> = ${ASD.esc(formatVal(v))}`;
        facts.push(el);
      }
      if (facts.length && this.o.counters.length) facts.push(h('span.st-sep', { 'aria-hidden': 'true' }));
      for (const c of this.o.counters) {
        const el = h('span.st-count', c.label + ' ', h('strong', { text: String(f.count[c.key] || 0) }));
        facts.push(el);
      }
      this.factsEl.replaceChildren(...facts);

      this.range.value = String(i);
      this.range.setAttribute('aria-valuetext', `Passo ${i + 1} di ${this.frames.length}`);
      this.posEl.textContent = `Passo ${i + 1} di ${this.frames.length}`;
      const last = this.frames.length - 1;
      this.btnFirst.disabled = this.btnPrev.disabled = i === 0;
      this.btnNext.disabled = this.btnLast.disabled = i === last;
      if (i === last && this.playing && !this.o.loop) this.pause();
      else this.updatePlay();
    }

    next() {
      this.go(this.i + 1);
    }

    prev() {
      this.go(this.i - 1);
    }

    /* --------------------------------------------------------- riproduzione */

    toggle() {
      if (this.playing) this.pause();
      else this.play();
    }

    play() {
      if (!this.frames.length) return;
      if (this.i >= this.frames.length - 1) this.go(0);
      this.playing = true;
      this.noteEl.setAttribute('aria-live', 'off');
      this.updatePlay();
      this.schedule();
    }

    pause() {
      this.playing = false;
      clearTimeout(this.timer);
      this.noteEl.setAttribute('aria-live', 'polite');
      this.updatePlay();
    }

    schedule() {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        if (!this.playing) return;
        if (this.i >= this.frames.length - 1) {
          if (this.o.loop) {
            this.timer = setTimeout(() => {
              if (!this.playing) return;
              this.load(this.o.loop());
              this.schedule();
            }, 1800);
            return;
          }
          this.pause();
          return;
        }
        this.next();
        this.schedule();
      }, this.speed.ms);
    }

    updatePlay() {
      const label = this.playing ? 'Pausa' : this.i >= this.frames.length - 1 && this.frames.length > 1 ? 'Da capo' : 'Avvia';
      this.btnPlay.innerHTML = ASD.icon(this.playing ? 'pause' : 'play') + `<span>${label}</span>`;
      this.btnPlay.setAttribute('aria-pressed', String(this.playing));
    }

    applySpeed() {
      const dur = Math.min(320, Math.round(this.speed.ms * 0.7));
      this.root.style.setProperty('--av-dur', (ASD.motionOK() ? dur : 0) + 'ms');
    }

    observeVisibility() {
      ASD.on('leave', () => this.pause());
      if (!('IntersectionObserver' in window)) return;
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (!e.isIntersecting && this.playing) {
            this.resumeOnShow = Boolean(this.o.loop);
            this.pause();
          } else if (e.isIntersecting && this.resumeOnShow) {
            this.resumeOnShow = false;
            this.play();
          }
        }
      });
      io.observe(this.root);
    }
  };

  function formatVal(v) {
    if (Array.isArray(v)) return '[' + v.join(', ') + ']';
    if (v === null) return '—';
    if (typeof v === 'boolean') return v ? 'true' : 'false';
    return String(v);
  }

  /** Scorciatoia: ASD.stepper(el, {...}) */
  ASD.stepper = (host, o) => new ASD.Stepper(host, o);
})();
