/* ASD a quadretti — pannello del codice.
   Mostra un sorgente (da esempi/ oppure scritto al volo), con numeri di riga,
   colori della sintassi, riga corrente evidenziata e annotazioni "a penna
   rossa" a margine. Se il sorgente è un programma completo offre il link per
   eseguirlo su Compiler Explorer. */
(function () {
  'use strict';

  const { h } = ASD;

  const GODBOLT_COMPILER = 'g142';
  const GODBOLT_FLAGS = '-std=c++17 -Wall -O2';

  function toBase64Url(bytes) {
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  /** Link che apre il programma su godbolt.org, pronto da eseguire. */
  ASD.godboltUrl = async function (source) {
    const state = {
      sessions: [
        {
          id: 1,
          language: 'c++',
          source,
          compilers: [],
          executors: [
            {
              compiler: { id: GODBOLT_COMPILER, libs: [], options: GODBOLT_FLAGS },
              arguments: '',
              stdin: '',
              compilerOutputVisible: true,
              stdinVisible: false,
            },
          ],
        },
      ],
    };
    const json = JSON.stringify(state).replace(/[\u007f-￿]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
    let bytes = new TextEncoder().encode(json);
    if (typeof CompressionStream === 'function') {
      try {
        const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate'));
        bytes = new Uint8Array(await new Response(stream).arrayBuffer());
      } catch (_) {
        /* senza compressione l'URL è solo più lungo */
      }
    }
    return 'https://godbolt.org/clientstate/' + toBase64Url(bytes);
  };

  ASD.CodePanel = class CodePanel {
    /**
     * @param {HTMLElement} host dove inserire il pannello
     * @param {object} o
     *   src     id del sorgente in esempi/ (es. 'ordinamento/insertion_sort')
     *   region  nome della regione da mostrare (il resto con "Programma completo")
     *   code    in alternativa a src: codice scritto al volo (frammento)
     *   file    nome da mostrare in testa
     *   notes   annotazioni a margine: { etichetta | numeroRiga: 'html' }
     *   total   riga finale sotto il codice (html), per esempio la somma dei costi
     *   run     false per nascondere il link a Compiler Explorer
     *   maxHeight  altezza massima in px dell'area scorrevole
     */
    constructor(host, o = {}) {
      this.o = o;
      this.src = o.src ? ASD.source(o.src) : ASD.parseSource(o.code || '', o.file || 'frammento.cpp');
      this.region = o.region && this.src.regions[o.region] ? o.region : null;
      if (o.region && !this.region) console.warn(`[ASD] regione "${o.region}" assente in ${this.src.file}`);
      this.full = !this.region;
      this.notes = o.notes || {};
      this.htmlLines = ASD.highlight(this.src.text);
      this.current = null;
      this.build(host);
      this.renderLines();
    }

    get range() {
      return this.full ? [0, this.src.lines.length - 1] : this.src.regions[this.region];
    }

    build(host) {
      const file = this.o.file || this.src.file.split('/').pop();
      this.fileEl = h('span.code-file', { text: file });
      const actions = h('span.code-actions');

      if (this.region) {
        this.toggleBtn = h(
          'button.code-btn',
          { type: 'button', 'aria-pressed': 'false', onclick: () => this.setFull(!this.full) },
          h('span', { html: ASD.icon('expand') }),
          'Programma completo'
        );
        actions.append(this.toggleBtn);
      }

      if (this.o.copy !== false) {
        this.copyBtn = h('button.code-btn', { type: 'button', onclick: () => this.copy() });
        this.copyBtn.innerHTML = ASD.icon('copy') + '<span>Copia</span>';
        actions.append(this.copyBtn);
      }

      const runnable = this.o.run !== undefined ? this.o.run : Boolean(this.o.src);
      if (runnable) {
        this.runLink = h('a.code-btn', {
          href: 'https://godbolt.org/',
          target: '_blank',
          rel: 'noopener',
          html: ASD.icon('external') + '<span>Esegui online</span>',
          title: 'Apre il programma completo su Compiler Explorer (godbolt.org)',
        });
        actions.append(this.runLink);
        ASD.godboltUrl(this.src.text).then(
          (url) => (this.runLink.href = url),
          () => {}
        );
      }

      this.body = h('div.code-body', { tabindex: '0', role: 'region', 'aria-label': 'Codice: ' + file });
      this.body.style.position = 'relative';
      if (this.o.maxHeight) this.body.style.setProperty('--code-max', this.o.maxHeight + 'px');
      this.codeEl = h('code');
      this.body.append(h('pre', this.codeEl));

      this.root = h('figure.code', h('figcaption.code-head', this.fileEl, actions), this.body);
      if (this.o.total) {
        this.totalEl = h('div.code-total', { html: this.o.total });
        this.root.append(this.totalEl);
      }
      host.append(this.root);
    }

    renderLines() {
      const [a, b] = this.range;
      const frag = document.createDocumentFragment();
      this.lineEls = new Map();
      const noteAt = this.noteMap();
      for (let i = a; i <= b; i++) {
        const row = i - a + 1;
        const ln = h('span.ln', { dataset: { i: String(i) } });
        ln.append(h('span.ln-no', { text: String(row), 'aria-hidden': 'true' }));
        const src = h('span.ln-src');
        src.innerHTML = this.htmlLines[i] || ' ';
        ln.append(src);
        const note = noteAt.get(i);
        ln.append(h('span.ln-note', note ? { html: note } : null));
        frag.append(ln);
        this.lineEls.set(i, ln);
      }
      this.codeEl.replaceChildren(frag);
      if (this.current != null) this.highlight(this.current, { scroll: false });
    }

    noteMap() {
      const m = new Map();
      for (const [ref, html] of Object.entries(this.notes)) {
        const i = this.indexOf(/^\d+$/.test(ref) ? Number(ref) : ref);
        if (i != null) m.set(i, html);
      }
      return m;
    }

    /** Indice assoluto di riga da un'etichetta o da un numero di riga (1 = prima riga mostrata). */
    indexOf(ref) {
      if (ref == null) return null;
      if (typeof ref === 'number') return this.range[0] + ref - 1;
      const i = this.src.labels[ref];
      return i === undefined ? null : i;
    }

    hasLabel(ref) {
      return typeof ref === 'number' || this.src.labels[ref] !== undefined;
    }

    setFull(full) {
      if (!this.region) return;
      this.full = full;
      this.toggleBtn.setAttribute('aria-pressed', String(full));
      this.renderLines();
    }

    /** Evidenzia la riga indicata (etichetta o numero). Restituisce false se non esiste. */
    highlight(ref, { scroll = true } = {}) {
      this.current = ref;
      for (const el of this.codeEl.querySelectorAll('.ln.is-current')) el.classList.remove('is-current');
      const i = this.indexOf(ref);
      if (i == null) return false;
      let el = this.lineEls.get(i);
      if (!el && !this.full) {
        // la riga sta fuori dalla regione mostrata: si passa al programma completo
        this.setFull(true);
        el = this.lineEls.get(i);
      }
      if (!el) return false;
      el.classList.add('is-current');
      if (scroll) this.scrollTo(el);
      return true;
    }

    clear() {
      this.current = null;
      for (const el of this.codeEl.querySelectorAll('.ln.is-current')) el.classList.remove('is-current');
    }

    /** Righe con evidenziazione leggera (per esempio il corpo di un ciclo). */
    mark(refs) {
      for (const el of this.codeEl.querySelectorAll('.ln.is-mark')) el.classList.remove('is-mark');
      for (const r of refs || []) {
        const el = this.lineEls.get(this.indexOf(r));
        if (el) el.classList.add('is-mark');
      }
    }

    setNotes(notes, total) {
      this.notes = notes || {};
      const noteAt = this.noteMap();
      for (const [i, el] of this.lineEls) {
        const n = el.querySelector('.ln-note');
        n.innerHTML = noteAt.get(i) || '';
      }
      if (total !== undefined) {
        if (!this.totalEl) {
          this.totalEl = h('div.code-total');
          this.root.append(this.totalEl);
        }
        this.totalEl.innerHTML = total;
        this.totalEl.hidden = !total;
      }
    }

    scrollTo(el) {
      const body = this.body;
      if (body.scrollHeight <= body.clientHeight + 2) return;
      const pad = 40;
      const top = el.offsetTop;
      const bottom = top + el.offsetHeight;
      let target = null;
      if (top < body.scrollTop + pad) target = top - pad;
      else if (bottom > body.scrollTop + body.clientHeight - pad) target = bottom - body.clientHeight + pad;
      if (target != null) body.scrollTo({ top: Math.max(0, target), behavior: ASD.motionOK() ? 'smooth' : 'auto' });
    }

    visibleText() {
      const [a, b] = this.range;
      return this.src.lines.slice(a, b + 1).join('\n') + '\n';
    }

    async copy() {
      const label = this.copyBtn.querySelector('span');
      try {
        await navigator.clipboard.writeText(this.visibleText());
        label.textContent = 'Copiato';
      } catch (_) {
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(this.codeEl);
        sel.removeAllRanges();
        sel.addRange(range);
        label.textContent = 'Selezionato: premi Ctrl+C';
      }
      clearTimeout(this.copyTimer);
      this.copyTimer = setTimeout(() => (label.textContent = 'Copia'), 2200);
    }
  };

  /** Scorciatoia: ASD.code(el, {src: 'ordinamento/insertion_sort', region: 'sort'}) */
  ASD.code = (host, o) => new ASD.CodePanel(host, o);
})();
