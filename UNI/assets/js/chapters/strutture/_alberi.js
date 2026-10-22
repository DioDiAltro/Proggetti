/* ASD a quadretti — utilità comuni ai capitoli sugli alberi (alberi, bst, heap): ASD.trees.

   Modello: un nodo è { id, key, left, right }. L'id resta lo stesso per tutta
   un'esecuzione: così la vista sposta i cerchi invece di ridisegnarli.
     T.node(key)              nuovo nodo
     T.fromLevel(arr)         dalla rappresentazione posizionale (figli di i in 2i+1 e 2i+2, null = vuoto)
     T.toLevel(root)          il contrario
     T.fromKeys(keys)         albero binario di ricerca per inserimenti successivi
     T.clone(root)            copia (stessi id)
     T.size, T.height, T.pre, T.ino, T.post, T.levelOrder
   Viste:
     T.state(root, o)         stato per ASD.viz.TreeView (o.cls, o.sub, o.note, o.edges, o.extra)
     T.fit(tv, minScale)      il disegno si adatta alla larghezza; se non ci sta, scorre di lato
     T.levelGuides(tv, depth) righe tratteggiate e "livello k" a sinistra del disegno
     new T.Stage(host, o)     albero + pannelli (pila delle chiamate, coda, output, array)
     new T.HeapView(host, o)  lo stesso heap come array e come albero, con gli stessi stati
   Stepper:
     T.field(stepper, o)      aggiunge un campo al modulo di input dello stepper
     T.choice(host, o)        gruppo di scelte a bottoni (radio)
     T.parse.*, T.format.*    lettura e scrittura degli input con messaggi in italiano
   Le tracce dei singoli capitoli stanno nei file dei capitoli (T.trace.*). */
(function () {
  'use strict';

  const { h } = ASD;
  const T = (ASD.trees = ASD.trees || {});
  T.trace = T.trace || {};

  /* ----------------------------------------------------------------- modello */

  let seq = 0;
  T.node = (key) => ({ id: 'n' + ++seq, key, left: null, right: null });

  /** Albero dalla rappresentazione posizionale: a[i] ha i figli in a[2i+1] e a[2i+2]. */
  T.fromLevel = function (arr) {
    const nodes = arr.map((v) => (v == null ? null : T.node(v)));
    nodes.forEach((n, i) => {
      if (!n) return;
      n.left = nodes[2 * i + 1] || null;
      n.right = nodes[2 * i + 2] || null;
    });
    return nodes[0] || null;
  };

  /** Rappresentazione posizionale di un albero (senza i null in fondo). */
  T.toLevel = function (root) {
    const out = [];
    const put = (n, i) => {
      if (!n) return;
      out[i] = n.key;
      put(n.left, 2 * i + 1);
      put(n.right, 2 * i + 2);
    };
    put(root, 0);
    for (let i = 0; i < out.length; i++) if (out[i] === undefined) out[i] = null;
    return out;
  };

  /** Inserimento in un BST senza fotogrammi (le chiavi uguali si ignorano). */
  T.bstInsert = function (root, key) {
    const n = T.node(key);
    if (!root) return n;
    let t = root;
    for (;;) {
      if (key === t.key) return root;
      const side = key < t.key ? 'left' : 'right';
      if (!t[side]) {
        t[side] = n;
        return root;
      }
      t = t[side];
    }
  };

  T.fromKeys = (keys) => keys.reduce((r, k) => T.bstInsert(r, k), null);

  T.clone = (n) => (n ? { id: n.id, key: n.key, left: T.clone(n.left), right: T.clone(n.right) } : null);

  T.size = (n) => (n ? 1 + T.size(n.left) + T.size(n.right) : 0);
  T.height = (n) => (n ? 1 + Math.max(T.height(n.left), T.height(n.right)) : -1);

  T.pre = (n, out = []) => (n && (out.push(n), T.pre(n.left, out), T.pre(n.right, out)), out);
  T.ino = (n, out = []) => (n && (T.ino(n.left, out), out.push(n), T.ino(n.right, out)), out);
  T.post = (n, out = []) => (n && (T.post(n.left, out), T.post(n.right, out), out.push(n)), out);
  T.levelOrder = function (root) {
    const out = [];
    const q = root ? [root] : [];
    while (q.length) {
      const n = q.shift();
      out.push(n);
      if (n.left) q.push(n.left);
      if (n.right) q.push(n.right);
    }
    return out;
  };
  T.keys = (list) => list.map((n) => n.key);

  /** Profondità di ogni nodo: { id: profondità }. */
  T.depths = function (root) {
    const d = {};
    const go = (n, k) => {
      if (!n) return;
      d[n.id] = k;
      go(n.left, k + 1);
      go(n.right, k + 1);
    };
    go(root, 0);
    return d;
  };

  /** Il padre di ogni nodo: { id: nodoPadre }. */
  T.parents = function (root) {
    const p = {};
    const go = (n) => {
      if (!n) return;
      if (n.left) p[n.left.id] = n;
      if (n.right) p[n.right.id] = n;
      go(n.left);
      go(n.right);
    };
    go(root);
    return p;
  };

  T.isBST = function (root) {
    const keys = T.keys(T.ino(root));
    return keys.every((k, i) => i === 0 || keys[i - 1] < k);
  };

  /** Albero casuale con n nodi, profondità al più maxDepth, valori distinti (non è un BST). */
  T.randomLevel = function (n, maxDepth = 3, lo = 1, hi = 99) {
    const max = 2 ** (maxDepth + 1) - 1;
    n = Math.min(n, max);
    const used = new Set([0]);
    while (used.size < n) {
      const free = [];
      for (const p of used) for (const c of [2 * p + 1, 2 * p + 2]) if (c < max && !used.has(c)) free.push(c);
      used.add(free[Math.floor(Math.random() * free.length)]);
    }
    const vals = ASD.randomDistinct(n, lo, hi);
    const arr = [];
    let k = 0;
    const top = Math.max(...used);
    for (let i = 0; i <= top; i++) arr.push(used.has(i) ? vals[k++] : null);
    return arr;
  };

  /* ------------------------------------------------------ stato per la vista */

  /**
   * Stato per ASD.viz.TreeView a partire da un albero di nodi.
   * o.cls   { id: 'active' | ['done', 'key'] }   classi dei nodi
   * o.sub   { id: 'testo' }                       etichetta sotto il nodo
   * o.note  { id: 'testo' }                       annotazione a destra
   * o.edges { 'idPadre>idFiglio': 'path' }        classi degli archi
   * o.extra [nodo, …]                             altre radici (foresta)
   * o.label (nodo) => testo                       etichetta del nodo (predefinita: la chiave)
   */
  T.state = function (root, o = {}) {
    const nodes = {};
    const visit = (n) => {
      if (!n || nodes[n.id]) return n ? n.id : null;
      const l = visit(n.left);
      const r = visit(n.right);
      const node = { label: o.label ? o.label(n) : String(n.key), kids: [l, r] };
      if (o.cls && o.cls[n.id]) node.cls = o.cls[n.id];
      if (o.sub && o.sub[n.id] != null) node.sub = o.sub[n.id];
      if (o.note && o.note[n.id] != null) node.note = o.note[n.id];
      nodes[n.id] = node;
      return n.id;
    };
    const rootId = visit(root);
    const extra = (o.extra || []).map(visit).filter((x) => x != null);
    const st = { nodes, edges: Object.assign({}, o.edges) };
    if (extra.length) st.roots = [rootId, ...extra].filter((x) => x != null);
    else st.root = rootId;
    return st;
  };

  /** Archi del cammino che passa per i nodi dati (in ordine, dal più alto): classi 'path'. */
  T.pathEdges = function (list, cls = 'path') {
    const e = {};
    for (let i = 1; i < list.length; i++) if (list[i - 1] && list[i]) e[list[i - 1].id + '>' + list[i].id] = cls;
    return e;
  };

  /**
   * Adatta il disegno di una TreeView alla larghezza disponibile: si rimpicciolisce
   * fino a minScale; sotto quella soglia resta a quella scala e il riquadro scorre di lato.
   */
  T.fit = function (tv, minScale = 0.7) {
    const svg = tv.svg;
    const w = Number(svg.getAttribute('width')) || 0;
    svg.style.maxWidth = 'none';
    svg.style.height = 'auto';
    svg.style.width = w ? `clamp(${Math.round(w * minScale)}px, 100%, ${w}px)` : '';
  };

  /** Righe dei livelli: "livello 0", "livello 1", … a sinistra del disegno (dopo tv.render). */
  T.levelGuides = function (tv, maxDepth, label) {
    const svg = tv.svg;
    const old = svg.querySelector('.tr-levels');
    if (old) old.remove();
    if (maxDepth < 0) return;
    const [, , W, H] = (svg.getAttribute('viewBox') || '0 0 0 0').split(/\s+/).map(Number);
    const L = 64;
    const o = tv.o;
    const g = ASD.s('g', { class: 'tr-levels', 'aria-hidden': 'true' });
    for (let d = 0; d <= maxDepth; d++) {
      const y = o.pad + (o.shape === 'box' ? o.boxH / 2 : o.r) + d * o.levelH;
      g.append(ASD.s('line', { x1: -L + 4, x2: W - 4, y1: y, y2: y }));
      g.append(ASD.s('text', { x: -L + 4, y: y - 5 }, label ? label(d) : 'livello ' + d));
    }
    svg.insertBefore(g, svg.firstChild);
    svg.setAttribute('viewBox', `${-L} 0 ${W + L} ${H}`);
    svg.setAttribute('width', W + L);
  };

  /* ------------------------------------------------------- vista composta */

  /**
   * Albero con pannelli accanto, per gli stepper:
   *   stato = { tree: T.state(...), levels: profonditàMassima | undefined,
   *             panels: [ { kind: 'stack' | 'queue' | 'seq' | 'array', id, title, items, hi, top, ... } ],
   *             caption: 'testo sotto l'albero' }
   *   stack: items = ['f(10)', …] dal fondo alla cima, oppure [{ text, note }]
   *   queue: items dalla testa (fronte) alla coda; hi = indice evidenziato
   *   seq:   sequenza (per esempio l'output); hi = indice evidenziato
   *   array: celle con ASD.viz.ArrayView (a, marks, ptrs, range, brackets); top: true lo mette sopra l'albero
   */
  T.Stage = class Stage {
    constructor(host, o = {}) {
      this.o = Object.assign({ r: 17, gap: 10, levelH: 62, minScale: 0.7, ariaLabel: 'Albero binario' }, o);
      this.root = h('div.tr-stage');
      this.top = h('div.tr-panels.tr-panels-top');
      this.treeBox = h('div.tr-tree');
      this.tv = new ASD.viz.TreeView(this.treeBox, {
        r: this.o.r,
        gap: this.o.gap,
        levelH: this.o.levelH,
        pad: this.o.pad || 20,
        ariaLabel: this.o.ariaLabel,
      });
      this.emptyEl = h('p.tr-empty', { hidden: true });
      this.captionEl = h('p.tr-caption', { hidden: true });
      this.bottom = h('div.tr-panels');
      this.root.append(this.top, this.treeBox, this.emptyEl, this.captionEl, this.bottom);
      host.append(this.root);
      const stage = host.closest && host.closest('.st-stage');
      if (stage) stage.classList.add('tr-st-stage');
      this.panelEls = new Map();
    }

    reset() {
      this.tv.reset();
      for (const p of this.panelEls.values()) if (p.av) p.av.reset();
    }

    render(st) {
      const tree = st.tree || { nodes: {} };
      this.tv.render(tree);
      if (st.levels != null) T.levelGuides(this.tv, st.levels, st.levelLabel ? (d) => st.levelLabel.replace('{d}', d) : null);
      T.fit(this.tv, this.o.minScale);
      const empty = !Object.keys(tree.nodes || {}).length;
      this.treeBox.hidden = empty;
      this.emptyEl.hidden = !empty;
      this.emptyEl.textContent = st.emptyText || 'Albero vuoto: la radice è nullptr.';
      this.captionEl.hidden = !st.caption;
      this.captionEl.innerHTML = st.caption || '';
      this.renderPanels(st.panels || []);
    }

    renderPanels(list) {
      const seen = new Set();
      const topKids = [];
      const bottomKids = [];
      for (const p of list) {
        const key = p.id || p.kind;
        seen.add(key);
        let el = this.panelEls.get(key);
        if (!el) {
          el = this.makePanel(p);
          this.panelEls.set(key, el);
        }
        this.fillPanel(el, p);
        (p.top ? topKids : bottomKids).push(el.root);
      }
      for (const [key, el] of this.panelEls) {
        if (!seen.has(key)) {
          el.root.remove();
          this.panelEls.delete(key);
        }
      }
      this.top.replaceChildren(...topKids);
      this.bottom.replaceChildren(...bottomKids);
      this.top.hidden = !topKids.length;
      this.bottom.hidden = !bottomKids.length;
    }

    makePanel(p) {
      const title = h('p.tr-panel-title');
      const root = h('div.tr-panel.tr-panel-' + p.kind, title);
      const el = { root, title };
      if (p.kind === 'array') {
        el.box = h('div.tr-panel-arr');
        root.append(el.box);
        el.av = new ASD.viz.ArrayView(el.box, { mode: 'cells', maxSlot: 44, minSlot: 26 });
      } else {
        el.list = h(p.kind === 'stack' ? 'ol.tr-stack' : p.kind === 'queue' ? 'ol.tr-queue' : 'ol.tr-seq');
        root.append(el.list);
      }
      return el;
    }

    fillPanel(el, p) {
      el.title.innerHTML = p.title || '';
      if (p.kind === 'array') {
        el.av.render({ a: p.a, marks: p.marks || {}, ptrs: p.ptrs || {}, range: p.range || null, brackets: p.brackets || [] });
        return;
      }
      const items = p.items || [];
      if (!items.length) {
        el.list.replaceChildren(h('li.tr-none', { text: p.empty || 'vuota' }));
        return;
      }
      const lis = items.map((it, i) => {
        const o = typeof it === 'object' && it !== null ? it : { text: it };
        const li = h('li', h('span.tr-txt', { text: String(o.text) }));
        if (o.note) li.append(h('span.tr-note', { text: o.note }));
        if (o.cls) for (const c of [].concat(o.cls)) li.classList.add('is-' + c);
        if (p.hi === i) li.classList.add('is-hi');
        return li;
      });
      if (p.kind === 'stack') {
        lis.reverse();
        lis[0].classList.add('is-top');
      }
      el.list.replaceChildren(...lis);
    }
  };

  /**
   * Un heap disegnato due volte: come array (celle o barre) e come albero.
   *   stato = { a, ids, n (dimensione dell'heap: gli elementi da n in poi sono fuori),
   *             marks: { indice: classe }, ptrs: { nome: indice }, bad: [indici in cui il padre è più piccolo],
   *             done: [indici già ordinati] }
   * Gli stessi indici hanno le stesse classi nelle due viste. Sotto ogni nodo c'è
   * il suo indice nell'array; i puntatori (i, m, …) sono scritti accanto ai nodi.
   */
  T.HeapView = class HeapView {
    constructor(host, o = {}) {
      this.o = Object.assign({ mode: 'cells', height: 150, minScale: 0.62 }, o);
      this.wrap = h('div.tr-heap-wrap');
      this.root = h('div.tr-heap' + (this.o.mode === 'bars' ? '.tr-heap-bars' : '.tr-heap-cells'));
      this.arrBox = h('div.tr-heap-arr');
      this.treeBox = h('div.tr-heap-tree');
      this.av = new ASD.viz.ArrayView(this.arrBox, {
        mode: this.o.mode,
        height: this.o.height,
        maxSlot: this.o.mode === 'cells' ? 46 : 52,
        minSlot: 22,
        float: this.o.float,
      });
      this.tv = new ASD.viz.TreeView(this.treeBox, { r: 17, gap: 8, levelH: 58, pad: 18, ariaLabel: 'L\'heap disegnato come albero' });
      this.root.append(this.treeBox, this.arrBox);
      this.wrap.append(this.root);
      host.append(this.wrap);
      const stage = host.closest && host.closest('.st-stage');
      if (stage) stage.classList.add('tr-st-stage');
    }

    reset() {
      this.av.reset();
      this.tv.reset();
    }

    render(st) {
      const a = st.a || [];
      const ids = st.ids || a.map((_, i) => i);
      const n = st.n == null ? a.length : st.n;
      const marks = Object.assign({}, st.marks);
      for (const i of st.done || []) marks[i] = [].concat(marks[i] || [], 'done');
      for (const i of st.bad || []) marks[i] = [].concat(marks[i] || [], 'swap');
      this.av.render({ a, ids, marks, ptrs: st.ptrs || {}, range: st.range || null, max: st.max, float: st.float || null });

      // albero: il nodo nella posizione i ha i figli in 2i+1 e 2i+2
      const nodes = {};
      const edges = {};
      const ptrAt = {};
      for (const [name, i] of Object.entries(st.ptrs || {})) if (i != null && i >= 0 && i < a.length) (ptrAt[i] = ptrAt[i] || []).push(name);
      const bad = new Set(st.bad || []);
      a.forEach((v, i) => {
        if (v == null) return;
        const id = 'h' + ids[i];
        const kids = [2 * i + 1, 2 * i + 2].map((c) => (c < a.length && a[c] != null ? 'h' + ids[c] : null));
        const cls = [].concat(marks[i] || []);
        if (i >= n && !cls.includes('done')) cls.push('out');
        nodes[id] = { label: String(v), kids, cls, sub: '[' + i + ']' };
        if (ptrAt[i]) nodes[id].note = ptrAt[i].join(',');
        kids.forEach((k, j) => {
          if (!k) return;
          const c = 2 * i + 1 + j;
          if (c >= n) edges[id + '>' + k] = 'out';
          else if (bad.has(c)) edges[id + '>' + k] = 'bad';
          else if (st.pathEdges && st.pathEdges.includes(c)) edges[id + '>' + k] = 'path';
        });
      });
      this.tv.render({ root: a.length && a[0] != null ? 'h' + ids[0] : null, nodes, edges });
      T.fit(this.tv, this.o.minScale);
    }
  };

  /* ------------------------------------------------------------ input */

  const EMPTY = new Set(['-', '_', '.', 'x', 'null', 'nullptr', '∅']);

  T.parse = {
    /** "10 4 7 2 9 - 5" → [10, 4, 7, 2, 9, null, 5] (rappresentazione posizionale). */
    level(text, o = {}) {
      const { maxPos = 31, maxNodes = 15, min = 0, max = 99 } = o;
      const parts = String(text).trim().split(/[\s,;]+/).filter(Boolean);
      if (!parts.length) throw new Error('Scrivi almeno la radice.');
      if (parts.length > maxPos) throw new Error(`Al massimo ${maxPos} posizioni (profondità ${Math.log2(maxPos + 1) - 1}).`);
      const arr = parts.map((p) => {
        if (EMPTY.has(p.toLowerCase())) return null;
        const v = Number(p);
        if (!Number.isInteger(v)) throw new Error(`"${p}" non è un intero né "-" (posizione vuota).`);
        if (v < min || v > max) throw new Error(`I valori devono stare tra ${min} e ${max}.`);
        return v;
      });
      while (arr.length && arr[arr.length - 1] == null) arr.pop();
      if (!arr.length || arr[0] == null) throw new Error('Manca la radice: la posizione 0 non può essere vuota.');
      const seen = new Set();
      let count = 0;
      arr.forEach((v, i) => {
        if (v == null) return;
        count++;
        if (i > 0 && arr[(i - 1) >> 1] == null) {
          throw new Error(`Il ${v} in posizione ${i} non ha un padre: la posizione ${(i - 1) >> 1} è vuota.`);
        }
        if (seen.has(v)) throw new Error(`I valori devono essere tutti diversi: il ${v} compare due volte.`);
        seen.add(v);
      });
      if (count > maxNodes) throw new Error(`Al massimo ${maxNodes} nodi, così si vede bene.`);
      return arr;
    },

    /** Chiavi distinte, per esempio per costruire un BST. */
    keys(text, o = {}) {
      const { min = 1, max = 99, minLen = 1, maxLen = 15, distinct = true } = o;
      const a = ASD.parseNumbers(text, { min, max, minLen, maxLen });
      if (distinct) {
        const seen = new Set();
        for (const v of a) {
          if (seen.has(v)) throw new Error(`Le chiavi devono essere tutte diverse: il ${v} compare due volte.`);
          seen.add(v);
        }
      }
      return a;
    },

    /** Un solo intero letto da un campo (con nome per il messaggio d'errore). */
    int(el, name, min = 1, max = 99) {
      const raw = el ? String(el.value).trim() : '';
      const v = Number(raw);
      if (raw === '' || !Number.isInteger(v)) throw new Error(`${name}: scrivi un numero intero.`);
      if (v < min || v > max) throw new Error(`${name}: deve stare tra ${min} e ${max}.`);
      return v;
    },
  };

  T.format = {
    level: (arr) => arr.map((v) => (v == null ? '-' : String(v))).join(' '),
    keys: (a) => a.join(' '),
  };

  /**
   * Aggiunge un campo al modulo di input di uno stepper (prima del bottone "Applica").
   * Premere Invio nel campo applica tutto l'input. Restituisce l'elemento <input>.
   */
  T.field = function (stepper, o) {
    const form = stepper.root.querySelector('form.st-input');
    const id = ASD.uid(stepper.id + '-' + (o.name || 'campo'));
    const input = h('input', {
      type: o.type || 'text',
      id,
      value: o.value != null ? String(o.value) : '',
      inputmode: o.type === 'number' ? 'numeric' : null,
      min: o.min,
      max: o.max,
      spellcheck: 'false',
      autocomplete: 'off',
      class: 'tr-field' + (o.type === 'number' ? ' tr-field-num' : ''),
    });
    const label = h('label', { for: id, text: o.label });
    const submit = form.querySelector('button[type="submit"]');
    form.insertBefore(label, submit);
    form.insertBefore(input, submit);
    return input;
  };

  /**
   * Gruppo di scelte a bottoni (radio con l'aspetto di .chip).
   * o = { legend, options: [{ v, label }], value, onChange(v) }. Restituisce { el, set(v) }.
   */
  T.choice = function (host, o) {
    const name = ASD.uid('tr-scelta');
    const fs = h('fieldset.tr-choice', h('legend', { text: o.legend }));
    const inputs = new Map();
    for (const opt of o.options) {
      const id = name + '-' + opt.v;
      const input = h('input', { type: 'radio', name, id, value: opt.v, checked: opt.v === o.value });
      input.addEventListener('change', () => input.checked && o.onChange(opt.v));
      inputs.set(opt.v, input);
      fs.append(h('label.chip', { for: id }, input, opt.label));
    }
    host.append(fs);
    return {
      el: fs,
      set(v) {
        const inp = inputs.get(v);
        if (inp) inp.checked = true;
      },
    };
  };

  /** Mette una scelta nella testata di uno stepper, prima del modulo di input. */
  T.headChoice = function (stepper, o) {
    const head = stepper.root.querySelector('.st-head');
    const holder = h('div.tr-head-choice');
    const form = head.querySelector('form.st-input');
    head.insertBefore(holder, form);
    return T.choice(holder, o);
  };

  /** Ordinale per le etichette sotto i nodi: 1°, 2°, … */
  T.ord = (k) => k + '°';
})();
