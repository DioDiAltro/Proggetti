/* ASD a quadretti — spazio dei nomi globale e utilità condivise.
   Tutti gli script del sito sono "classici" (non moduli ES) perché devono
   funzionare anche aprendo index.html da disco (file://). Ogni file aggiunge
   pezzi all'oggetto globale ASD. */
(function () {
  'use strict';

  const ASD = (window.ASD = window.ASD || {});

  ASD.viz = ASD.viz || {};
  ASD.chapters = ASD.chapters || {};
  ASD.sources = ASD.sources || {};
  ASD.steppers = ASD.steppers || [];

  /* ---------------------------------------------------------------- DOM */

  /**
   * Crea un elemento. h('button.btn.btn-sm', {type: 'button', onclick: fn}, 'Testo')
   * Proprietà speciali: class, text, html, style (stringa o oggetto), dataset,
   * on<evento> (funzione). true crea un attributo vuoto, false/null lo salta.
   */
  ASD.h = function h(tag, props, ...kids) {
    const parts = String(tag).split('.');
    const el = document.createElement(parts[0] || 'div');
    if (parts.length > 1) el.className = parts.slice(1).join(' ');
    if (props && (typeof props !== 'object' || props instanceof Node || Array.isArray(props))) {
      kids.unshift(props);
      props = null;
    }
    if (props) {
      for (const [k, v] of Object.entries(props)) {
        if (v == null || v === false) continue;
        if (k === 'class') el.className = (el.className ? el.className + ' ' : '') + v;
        else if (k === 'text') el.textContent = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'style' && typeof v === 'object') {
          for (const [prop, val] of Object.entries(v)) {
            if (prop.startsWith('--')) el.style.setProperty(prop, val);
            else el.style[prop] = val;
          }
        }
        else if (k === 'dataset') Object.assign(el.dataset, v);
        else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    appendKids(el, kids);
    return el;
  };

  function appendKids(el, kids) {
    for (const k of kids) {
      if (k == null || k === false) continue;
      if (Array.isArray(k)) appendKids(el, k);
      else el.append(k instanceof Node ? k : document.createTextNode(String(k)));
    }
  }

  /** Elemento SVG. */
  ASD.s = function s(tag, attrs, ...kids) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) if (v != null && v !== false) el.setAttribute(k, v);
    appendKids(el, kids);
    return el;
  };

  ASD.$ = (sel, root) => (root || document).querySelector(sel);
  ASD.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  ASD.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ESC[c]);

  /** Collega i segnaposto <div data-mount="nome"> di un capitolo alle funzioni che li riempiono. */
  ASD.mount = function mount(root, map) {
    for (const el of ASD.$$('[data-mount]', root)) {
      const fn = map[el.dataset.mount];
      if (!fn) {
        console.warn(`[ASD] nessuna funzione per data-mount="${el.dataset.mount}"`);
        continue;
      }
      try {
        fn(el);
      } catch (err) {
        console.error(`[ASD] errore nel montare "${el.dataset.mount}"`, err);
        el.append(ASD.h('p.box.box-errore', { text: 'Questo strumento non è riuscito a partire: ' + err.message }));
      }
    }
  };

  const used = new Set();
  /** Id unico e leggibile, utile per collegare <label> e controlli. */
  ASD.uid = function uid(base) {
    const clean = String(base || 'x').toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    let id = clean;
    let n = 2;
    while (used.has(id) || document.getElementById(id)) id = `${clean}-${n++}`;
    used.add(id);
    return id;
  };

  /* ------------------------------------------------------------ formule */

  const NO_ITALIC = new Set(['O', 'o']);
  const OPS = [
    ['<=', '≤'],
    ['>=', '≥'],
    ['!=', '≠'],
    ['->', '→'],
    ['*', '·'],
    ['-', '−'],
  ];

  /** Converte una formula testuale in HTML: lettere singole in corsivo, ^ e _ in apice/pedice. */
  ASD.mathHTML = function mathHTML(src) {
    src = String(src);
    let out = '';
    let i = 0;
    const readScript = () => {
      if (src[i] === '{') {
        let depth = 0;
        let j = i;
        for (; j < src.length; j++) {
          if (src[j] === '{') depth++;
          else if (src[j] === '}' && --depth === 0) break;
        }
        const inner = src.slice(i + 1, j);
        i = j + 1;
        return mathHTML(inner);
      }
      const m = /^[A-Za-z0-9Ͱ-Ͽ]+|^./.exec(src.slice(i));
      i += m[0].length;
      return mathHTML(m[0]);
    };
    while (i < src.length) {
      const c = src[i];
      const op = OPS.find(([a]) => src.startsWith(a, i));
      if (op) {
        out += op[1];
        i += op[0].length;
      } else if (c === '^' || c === '_') {
        i++;
        const tag = c === '^' ? 'sup' : 'sub';
        out += `<${tag}>${readScript()}</${tag}>`;
      } else if (/[A-Za-z]/.test(c)) {
        const m = /^[A-Za-z]+/.exec(src.slice(i));
        const w = m[0];
        out += w.length === 1 && !NO_ITALIC.has(w) ? `<var>${w}</var>` : w;
        i += w.length;
      } else {
        out += ESC[c] || c;
        i++;
      }
    }
    return out;
  };

  /** Formula pronta da inserire nel testo: ASD.m('T(n) = 2T(n/2) + n') */
  ASD.m = (src) => `<span class="m">${ASD.mathHTML(src)}</span>`;

  /* ----------------------------------------------- blocchi di testo pronti */

  const BOX_LABELS = { ricorda: 'Da ricordare', errore: 'Errore tipico', esame: 'All\'esame', nota: 'Approfondimento' };

  /** Riquadro: ASD.box('ricorda', '<p>…</p>') — tipi: ricorda, errore, esame, nota. */
  ASD.box = function (kind, html, label) {
    const body = /^\s*</.test(html) ? html : `<p>${html}</p>`;
    return `<div class="box box-${kind}"><p class="box-label">${label || BOX_LABELS[kind] || ''}</p>${body}</div>`;
  };

  /**
   * Tabella: ASD.table({ caption, head: ['Algoritmo', 'Migliore'], rows: [['Insertion', 'Θ(n)'], …] })
   * Le celle sono HTML. Con rowHeaders (predefinito) la prima colonna è un'intestazione di riga.
   */
  ASD.table = function ({ caption, head, rows, rowHeaders = true, cls = '' }) {
    const th = (head || []).map((c) => `<th scope="col">${c}</th>`).join('');
    const body = rows
      .map((r) => '<tr>' + r.map((c, i) => (i === 0 && rowHeaders ? `<th scope="row">${c}</th>` : `<td>${c}</td>`)).join('') + '</tr>')
      .join('');
    return `<div class="tbl-wrap"><table class="tbl ${cls}">${caption ? `<caption>${caption}</caption>` : ''}${th ? `<thead><tr>${th}</tr></thead>` : ''}<tbody>${body}</tbody></table></div>`;
  };

  /* -------------------------------------------------------- memoria locale */

  ASD.store = {
    get(key, fallback) {
      try {
        const v = window.localStorage.getItem('asd:' + key);
        return v == null ? fallback : JSON.parse(v);
      } catch (_) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem('asd:' + key, JSON.stringify(value));
      } catch (_) {
        /* memoria non disponibile: si continua senza salvare */
      }
    },
  };

  ASD.motionOK = () => !window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------- numeri */

  ASD.clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  ASD.randInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

  ASD.randomArray = (n, lo = 1, hi = 50) => Array.from({ length: n }, () => ASD.randInt(lo, hi));

  /** Array casuale senza ripetizioni (più leggibile nelle visualizzazioni). */
  ASD.randomDistinct = function (n, lo = 1, hi = 50) {
    const pool = [];
    for (let v = lo; v <= hi; v++) pool.push(v);
    ASD.shuffle(pool);
    return pool.slice(0, Math.min(n, pool.length));
  };

  ASD.shuffle = function (a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  /** Legge "5, 2, 4 6" in [5, 2, 4, 6]; lancia un Error con un messaggio in italiano. */
  ASD.parseNumbers = function (str, o = {}) {
    const { min = -999, max = 999, minLen = 1, maxLen = 20, integer = true } = o;
    const parts = String(str).split(/[\s,;]+/).filter(Boolean);
    if (parts.length < minLen) throw new Error(`Servono almeno ${minLen} numeri.`);
    if (parts.length > maxLen) throw new Error(`Al massimo ${maxLen} numeri, così si vede bene.`);
    return parts.map((p) => {
      const v = Number(p.replace(',', '.'));
      if (!Number.isFinite(v)) throw new Error(`"${p}" non è un numero.`);
      if (integer && !Number.isInteger(v)) throw new Error(`"${p}" non è un intero.`);
      if (v < min || v > max) throw new Error(`I valori devono stare tra ${min} e ${max}.`);
      return v;
    });
  };

  ASD.fmt = (v) => (typeof v === 'number' ? v.toLocaleString('it-IT', { maximumFractionDigits: 2 }) : String(v));

  ASD.fmtCompact = function (v) {
    if (!Number.isFinite(v)) return '∞';
    if (Math.abs(v) < 10000) return ASD.fmt(Math.round(v * 100) / 100);
    try {
      return new Intl.NumberFormat('it-IT', { notation: 'compact', maximumFractionDigits: 1 }).format(v);
    } catch (_) {
      return v.toExponential(1);
    }
  };

  /* --------------------------------------------------------------- icone */

  const ICONS = {
    play: '<path d="M7 4.5v15l12-7.5z"/>',
    pause: '<rect x="6" y="4.5" width="4" height="15" rx="1"/><rect x="14" y="4.5" width="4" height="15" rx="1"/>',
    first: '<path d="M18 19 9 12l9-7z"/><path d="M5.5 5v14"/>',
    last: '<path d="m6 5 9 7-9 7z"/><path d="M18.5 5v14"/>',
    prev: '<path d="m15 18-6-6 6-6"/>',
    next: '<path d="m9 18 6-6-6-6"/>',
    reset: '<path d="M3 12a9 9 0 1 0 2.64-6.36L3 8.3"/><path d="M3 3v5.3h5.3"/>',
    shuffle: '<path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="m15 15 6 6"/><path d="m4 4 5 5"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
    close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    right: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    left: '<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>',
    code: '<path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/>',
    expand: '<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="m21 3-7 7"/><path d="m3 21 7-7"/>',
    book: '<path d="M2 4.5h6a4 4 0 0 1 4 4V21a3 3 0 0 0-3-3H2z"/><path d="M22 4.5h-6a4 4 0 0 0-4 4V21a3 3 0 0 1 3-3h7z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.4"/><path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 0 0 7.07 7.07l1.33-1.33"/>',
  };

  /** Icona SVG in stile tratto (24×24, tratto 2, estremi arrotondati). */
  ASD.icon = function (name, cls) {
    const body = ICONS[name] || '';
    return `<svg class="${cls || 'ico'}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
  };

  /** Il marchio: un array ordinato disegnato sui quadretti. */
  ASD.brandMark = function () {
    const cells = [];
    const heights = [1, 2, 3, 4];
    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 4; r++) {
        const filled = 3 - r < heights[c];
        cells.push(
          `<rect x="${1 + c * 7}" y="${1 + r * 7}" width="6" height="6" rx="1" ${
            filled ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-opacity=".35"'
          }/>`
        );
      }
    }
    return `<svg class="brand-mark" viewBox="0 0 30 30" width="30" height="30" aria-hidden="true" focusable="false">${cells.join('')}</svg>`;
  };

  /* ------------------------------------------------------ capitoli e indice */

  /** Registra un capitolo. Il titolo nell'indice viene da outline.js. */
  ASD.chapter = function (def) {
    if (!def || !def.id) throw new Error('ASD.chapter: manca l\'id');
    if (typeof def.render !== 'function') throw new Error(`ASD.chapter(${def.id}): manca render()`);
    ASD.chapters[def.id] = def;
  };

  /** Tutti i capitoli in ordine, con la parte di appartenenza. */
  ASD.flatChapters = function () {
    const list = [];
    for (const part of ASD.parts || []) for (const ch of part.chapters) list.push({ ...ch, part });
    return list;
  };

  ASD.findChapter = function (id) {
    return ASD.flatChapters().find((c) => c.id === id) || null;
  };

  /** Link a un capitolo (o a una sua sezione): ASD.link('bst', 'cancellazione', 'testo'). */
  ASD.link = function (id, section, text) {
    const ch = ASD.findChapter(id);
    const label = text || (ch ? ch.title : id);
    const href = '#' + id + (section ? '--' + section : '');
    return `<a href="${href}">${ASD.esc(label)}</a>`;
  };

  /* ------------------------------------------------------- codice sorgente */

  /** Aggiunge sorgenti C++ (generati da tools/build-sources.mjs a partire da esempi/). */
  ASD.addSources = function (map) {
    for (const [id, v] of Object.entries(map)) ASD.sources[id] = v;
  };

  const parsed = new Map();

  /**
   * Legge un sorgente con i marcatori:
   *   //@region nome   …   //@endregion   → regione mostrabile da sola
   *   codice;  //@etichetta              → etichetta di riga (per evidenziarla)
   *   //@check …                          → istruzioni per tools/check-cpp.mjs
   * I marcatori non compaiono nel codice mostrato.
   */
  ASD.parseSource = function (raw, file) {
    const out = { file: file || 'esempio.cpp', lines: [], regions: {}, labels: {} };
    const open = [];
    const lines = String(raw).replace(/\r\n?/g, '\n').replace(/\n+$/, '').split('\n');
    for (const line of lines) {
      const t = line.trim();
      let m;
      if ((m = /^\/\/@region\s+([\w-]+)\s*$/.exec(t))) {
        open.push([m[1], out.lines.length]);
        continue;
      }
      if ((m = /^\/\/@endregion(?:\s+([\w-]+))?\s*$/.exec(t))) {
        const idx = m[1] ? open.findIndex(([n]) => n === m[1]) : open.length - 1;
        if (idx >= 0) {
          const [name, start] = open.splice(idx, 1)[0];
          out.regions[name] = [start, out.lines.length - 1];
        }
        continue;
      }
      if (/^\/\/@check\b/.test(t)) continue;
      const lm = /\s*\/\/@([\w-]+(?:\s+@[\w-]+)*)\s*$/.exec(line);
      let text = line;
      if (lm) {
        text = line.slice(0, lm.index);
        for (const name of lm[1].split(/\s+/)) out.labels[name.replace(/^@/, '')] = out.lines.length;
      }
      out.lines.push(text);
    }
    for (const [name, start] of open) out.regions[name] = [start, out.lines.length - 1];
    out.text = out.lines.join('\n');
    return out;
  };

  ASD.source = function (id) {
    if (parsed.has(id)) return parsed.get(id);
    const entry = ASD.sources[id];
    if (!entry) throw new Error(`Sorgente "${id}" non trovato: hai lanciato tools/build-sources.mjs?`);
    const p = ASD.parseSource(entry.code, entry.file);
    p.id = id;
    parsed.set(id, p);
    return p;
  };

  /* -------------------------------------------------------------- eventi */

  ASD.emit = (name, detail) => document.dispatchEvent(new CustomEvent('asd:' + name, { detail }));
  ASD.on = (name, fn) => document.addEventListener('asd:' + name, (e) => fn(e.detail, e));
})();
