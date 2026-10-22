/* ASD a quadretti — vista della memoria: lo stack delle chiamate e lo heap.

   new ASD.viz.MemoryView(el, {
     heap: true,                    // false: solo lo stack (programmi senza new)
     legend: ['ptr', 'ref', 'dangling', 'freed', 'hl', 'read'],  // legenda (facoltativa)
     stackTitle, stackHint, heapTitle, heapHint, ariaLabel
   });
   view.render({
     stack: [                       // dal fondo (main) alla cima: la cima è disegnata IN ALTO
       { id: 'main', name: 'main()', note: 'ritorna 13', cls: 'active',   // folded: true = solo l'intestazione
         vars: [
           { id: 'x', type: 'int', name: 'x', value: 5, cls: 'hl', addr: '0x7f10' },
           { id: 'p', type: 'int*', name: 'p', ptr: 'main.x', value: '0x7f10' },   // freccia verso x
           { id: 'q', type: 'int*', name: 'q', ptr: null },                        // nullptr, scritto
           { id: 'r', type: 'int&', name: 'r', ref: 'main.x', value: 'alias di x' },// riferimento
           { id: 'a', type: 'int', name: 'a', cells: [4, 8, null], cellCls: { 1: 'hl' }, past: true },
           { id: 'o', type: 'Punto', name: 'o', fields: [{ id: 'x', type: 'int', name: 'x', value: 1 }] },
           { group: 'blocco { }', id: 'b', vars: [ ... ] },   // variabili di un blocco interno
         ] },
     ],
     heap: [
       { id: 'h1', label: 'new int', value: 7, addr: '0x5a20' },
       { id: 'h2', label: 'new int[4]', cells: [0, 1, null, 9], cellCls: { 2: 'hl' } },
       { id: 'h3', label: 'new Nodo', fields: [ ... ], freed: true },   // liberato con delete
     ],
   });

   Bersagli di ptr e ref: 'frame.var', 'frame.var.campo', 'frame.var[i]', 'h1', 'h1[i]',
   'h1.campo' (le variabili di un gruppo stanno nello spazio dei nomi del loro frame;
   gli id dei blocchi non devono coincidere con quelli dei frame).
   - value null o undefined, oppure uninit: true → valore indeterminato, scritto "?";
   - ptr: null → "nullptr"; un puntatore verso un blocco liberato (o con dangling: true)
     è pendente e la sua freccia è rossa; verso un bersaglio che non c'è più resta senza freccia;
   - past: true aggiunge dopo l'ultima cella la posizione "fine" (a + n), che si può puntare
     ma non leggere.
   Stati (cls) di variabili, celle (cellCls) e blocchi: hl (appena modificato), read (appena
   letto), new, err, done, out. Frame: active (la cima, predefinito), out (sta per uscire).

   Disegno: a sinistra lo stack, a destra lo heap; sotto i 540 px di larghezza uno sopra
   l'altro. Le frecce sono un livello SVG sopra il disegno: escono a destra della casella
   del puntatore, corrono in un corridoio verticale (a destra di ogni colonna) e
   arrivano al bersaglio senza attraversare le caselle. Si ricalcolano a ogni
   cambio di dimensione. */
(function () {
  'use strict';

  const { h, s } = ASD;

  const LEGEND = {
    ptr: 'puntatore',
    ref: 'riferimento (alias)',
    dangling: 'puntatore pendente',
    freed: 'memoria liberata',
    hl: 'appena modificato',
    read: 'appena letto',
  };

  const clsOf = (cls) =>
    []
      .concat(cls || [])
      .filter(Boolean)
      .map((c) => ' is-' + c)
      .join('');

  /* ------------------------------------------------ geometria delle frecce */

  function simplify(pts) {
    const out = [];
    for (const p of pts) {
      const q = out[out.length - 1];
      if (q && Math.abs(q.x - p.x) < 0.5 && Math.abs(q.y - p.y) < 0.5) continue;
      out.push(p);
    }
    // toglie i punti in mezzo a due segmenti allineati
    for (let i = out.length - 2; i > 0; i--) {
      const a = out[i - 1];
      const b = out[i];
      const c = out[i + 1];
      const sameX = Math.abs(a.x - b.x) < 0.5 && Math.abs(b.x - c.x) < 0.5;
      const sameY = Math.abs(a.y - b.y) < 0.5 && Math.abs(b.y - c.y) < 0.5;
      if (sameX || sameY) out.splice(i, 1);
    }
    return out;
  }

  /** Spezzata con gli angoli arrotondati. */
  function roundedPath(pts, r) {
    const f = (v) => Math.round(v * 10) / 10;
    let d = `M${f(pts[0].x)} ${f(pts[0].y)}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const p0 = pts[i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const d1 = Math.hypot(p1.x - p0.x, p1.y - p0.y) || 1;
      const d2 = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
      const rr = Math.min(r, d1 / 2, d2 / 2);
      const ax = p1.x + ((p0.x - p1.x) * rr) / d1;
      const ay = p1.y + ((p0.y - p1.y) * rr) / d1;
      const bx = p1.x + ((p2.x - p1.x) * rr) / d2;
      const by = p1.y + ((p2.y - p1.y) * rr) / d2;
      d += `L${f(ax)} ${f(ay)}Q${f(p1.x)} ${f(p1.y)} ${f(bx)} ${f(by)}`;
    }
    const last = pts[pts.length - 1];
    return d + `L${f(last.x)} ${f(last.y)}`;
  }

  const segments = (pts) => pts.slice(1).map((p, i) => [pts[i], p]);

  /** Incrocio tra due segmenti orizzontali/verticali (gli estremi non contano). */
  function crosses([p1, p2], [q1, q2]) {
    const aH = Math.abs(p1.y - p2.y) < 0.5;
    const bH = Math.abs(q1.y - q2.y) < 0.5;
    if (aH === bH) return false;
    const [h1, h2, v1, v2] = aH ? [p1, p2, q1, q2] : [q1, q2, p1, p2];
    const x = v1.x;
    const y = h1.y;
    return (
      x > Math.min(h1.x, h2.x) + 0.5 &&
      x < Math.max(h1.x, h2.x) - 0.5 &&
      y > Math.min(v1.y, v2.y) + 0.5 &&
      y < Math.max(v1.y, v2.y) - 0.5
    );
  }

  function countCrossings(polys) {
    let c = 0;
    for (let i = 0; i < polys.length; i++) {
      for (let j = i + 1; j < polys.length; j++) {
        for (const a of segments(polys[i])) for (const b of segments(polys[j])) if (crosses(a, b)) c++;
      }
    }
    return c;
  }

  function permutations(k) {
    const out = [];
    const rec = (prefix, rest) => {
      if (!rest.length) return out.push(prefix);
      rest.forEach((x, i) => rec(prefix.concat(x), rest.slice(0, i).concat(rest.slice(i + 1))));
    };
    rec([], Array.from({ length: k }, (_, i) => i));
    return out;
  }

  /* ------------------------------------------------------------------ vista */

  ASD.viz.MemoryView = class MemoryView {
    constructor(host, o = {}) {
      this.o = Object.assign(
        {
          heap: true,
          legend: null,
          gutter: 46,
          stackTitle: 'Stack',
          stackHint: 'la chiamata in corso è in cima',
          heapTitle: 'Heap',
          heapHint: 'memoria dinamica',
          ariaLabel: 'Memoria del programma',
        },
        o
      );
      this.root = h('div', { class: 'mem' + (this.o.heap ? '' : ' mem-noheap'), role: 'group', 'aria-label': this.o.ariaLabel });
      this.root.style.setProperty('--mem-gutter', this.o.gutter + 'px');
      this.panes = h('div.mem-panes');
      this.stackPane = h('div.mem-pane.mem-stack', this.title(this.o.stackTitle, this.o.stackHint));
      this.frames = h('div.mem-frames');
      this.stackPane.append(this.frames);
      this.panes.append(this.stackPane);
      if (this.o.heap) {
        this.heapPane = h('div.mem-pane.mem-heap', this.title(this.o.heapTitle, this.o.heapHint));
        this.blocks = h('div.mem-blocks');
        this.heapPane.append(this.blocks);
        this.panes.append(this.heapPane);
      }
      this.svg = s('svg', { class: 'mem-arrows', 'aria-hidden': 'true', focusable: 'false' });
      this.root.append(this.panes, this.svg);
      if (this.o.legend && this.o.legend.length) this.root.append(this.legend(this.o.legend));
      host.append(this.root);

      this.keys = new Map();
      this.links = [];
      let raf = 0;
      const redraw = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => this.drawArrows());
      };
      if ('ResizeObserver' in window) {
        // ridisegna quando cambia la larghezza, quando la pagina torna visibile
        // (il capitolo viene staccato e riattaccato) e quando cambia l'altezza dei riquadri
        this.ro = new ResizeObserver(redraw);
        this.ro.observe(this.root);
        this.ro.observe(this.panes);
      }
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(redraw, () => {});
    }

    title(text, hint) {
      return h('p.mem-title', h('strong', text), hint ? h('span', ' · ' + hint) : null);
    }

    reset() {
      this.keys.clear();
      this.links = [];
    }

    /* ------------------------------------------------------------ disegno */

    render(st) {
      st = st || {};
      this.keys.clear();
      this.links = [];
      const stack = st.stack || [];
      const frag = document.createDocumentFragment();
      for (let i = stack.length - 1; i >= 0; i--) frag.append(this.frame(stack[i], i === stack.length - 1));
      if (!stack.length) frag.append(h('p.mem-empty', 'vuoto'));
      this.frames.replaceChildren(frag);
      if (this.o.heap) {
        const heap = st.heap || [];
        if (heap.length) this.blocks.replaceChildren(...heap.map((b) => this.block(b)));
        else this.blocks.replaceChildren(h('p.mem-empty', 'vuoto: nessun new'));
      }
      this.resolve();
      this.drawArrows();
    }

    frame(f, isTop) {
      const cls = f.cls !== undefined ? f.cls : isTop ? 'active' : null;
      const el = h('div', { class: 'mem-frame' + clsOf(cls) });
      const head = h('div.mem-frame-head', h('span.mem-fname', f.name || f.id));
      if (f.note) head.append(h('span.mem-fnote', f.note));
      el.append(head);
      if (f.folded) {
        // frame chiuso: le sue variabili non interessano in questo esempio
        el.classList.add('is-folded');
        return el;
      }
      const vars = h('div.mem-vars');
      if (f.vars && f.vars.length) for (const v of f.vars) vars.append(this.variable(v, f.id));
      else vars.append(h('p.mem-empty', 'nessuna variabile locale'));
      el.append(vars);
      return el;
    }

    variable(v, ns) {
      if (v.group != null) {
        const g = h('div', { class: 'mem-group' + clsOf(v.cls) }, h('p.mem-group-title', v.group));
        const list = v.vars || [];
        for (const x of list) g.append(this.variable(x, ns));
        if (!list.length) g.append(h('p.mem-empty', 'ancora vuoto'));
        return g;
      }
      const key = ns + '.' + v.id;
      const row = h('div', { class: 'mem-var' + clsOf(v.cls) });
      const sig = h('span.mem-sig', h('span.mem-type', v.type || ''), ' ', h('span.mem-name', v.name + (v.cells ? `[${v.cells.length}]` : '')));
      const decl = h('span.mem-decl', sig);
      if (v.addr) decl.append(h('span.mem-addr', `&${v.name} = ${v.addr}`));
      row.append(decl);
      if (v.cells) {
        row.classList.add('has-cells');
        row.append(this.cells(v.cells, v.cellCls, v.past, key, v.name));
        this.reg(key, row, v.name);
      } else if (v.fields) {
        row.classList.add('has-fields');
        const box = h('div.mem-fields');
        for (const f of v.fields) box.append(this.variable(f, key));
        row.append(box);
        this.reg(key, row, v.name);
      } else {
        row.append(this.value(v, key, v.name));
      }
      return row;
    }

    /** La casella con il valore. Con key la casella è un bersaglio possibile. */
    value(v, key, label) {
      const box = h('span.mem-val');
      let text;
      if (v.ptr !== undefined) {
        box.classList.add('is-ptr');
        if (v.ptr === null) {
          box.classList.add('is-null');
          text = 'nullptr';
        } else {
          text = v.value != null ? String(v.value) : '';
          this.links.push({ from: box, to: v.ptr, kind: v.dangling ? 'dangling' : 'ptr' });
        }
      } else if (v.ref !== undefined) {
        box.classList.add('is-ref');
        text = v.value != null ? String(v.value) : 'alias';
        this.links.push({ from: box, to: v.ref, kind: 'ref' });
      } else if (v.uninit || v.value == null) {
        box.classList.add('is-uninit');
        box.title = 'valore indeterminato';
        text = '?';
      } else text = String(v.value);
      box.append(h('span.mem-txt', text));
      if (key) this.reg(key, box, label);
      return box;
    }

    cells(list, cellCls, past, key, name) {
      const row = h('div.mem-cells');
      const cc = cellCls || {};
      const n = list.length;
      for (let i = 0; i < n + (past ? 1 : 0); i++) {
        const end = i === n;
        const val = end ? null : list[i];
        const box = h('span', { class: 'mem-cell-box' + (!end && val == null ? ' is-uninit' : '') + clsOf(cc[i]) }, end ? '' : val == null ? '?' : String(val));
        this.reg(`${key}[${i}]`, box, end ? `la posizione dopo l'ultima di ${name}` : `${name}[${i}]`);
        row.append(h('span', { class: 'mem-cell' + (end ? ' is-past' : '') }, box, h('span.mem-idx', end ? 'fine' : String(i))));
      }
      return row;
    }

    block(b) {
      const el = h('div', { class: 'mem-block' + (b.freed ? ' is-freed' : '') + (b.cells ? ' has-cells' : '') + clsOf(b.cls) });
      const label = b.label || b.id;
      this.reg(b.id, el, 'blocco ' + label);
      if (b.cells) el.append(this.cells(b.cells, b.cellCls, b.past, b.id, label));
      else if (b.fields) {
        const box = h('div.mem-fields');
        for (const f of b.fields) box.append(this.variable(f, b.id));
        el.append(box);
      } else el.append(this.value({ value: b.value, uninit: b.uninit }));
      const cap = h('p.mem-cap', label);
      if (b.addr) cap.append(h('span.mem-cap-addr', ' · ' + b.addr));
      if (b.freed) cap.append(h('span.mem-cap-freed', ' · ' + (b.freedLabel || 'liberato')));
      el.append(cap);
      return el;
    }

    reg(key, el, desc) {
      el.dataset.key = key;
      el.dataset.desc = desc || key;
      this.keys.set(key, el);
    }

    /** Collega le frecce ai bersagli: pendenti, mancanti, testo per i lettori di schermo. */
    resolve() {
      for (const L of this.links) {
        const t = this.keys.get(L.to);
        L.target = t || null;
        let hidden;
        if (!t) {
          L.from.classList.add('is-dangling');
          hidden = 'punta a memoria che non esiste più';
        } else {
          if (L.kind === 'ptr' && t.closest('.mem-block.is-freed')) L.kind = 'dangling';
          if (L.kind === 'dangling') L.from.classList.add('is-dangling');
          hidden =
            L.kind === 'ref'
              ? `è un altro nome di ${t.dataset.desc}`
              : L.kind === 'dangling'
                ? `punta a ${t.dataset.desc}, che è stato liberato`
                : `punta a ${t.dataset.desc}`;
        }
        L.from.append(h('span.visually-hidden', ' (' + hidden + ')'));
      }
    }

    /* -------------------------------------------------------------- frecce */

    drawArrows() {
      const svg = this.svg;
      svg.replaceChildren();
      const links = this.links.filter((L) => L.target);
      if (!links.length || !this.root.isConnected) return;
      const R = this.root.getBoundingClientRect();
      if (R.width < 4 || R.height < 4) return;
      const rect = (el) => {
        const r = el.getBoundingClientRect();
        return { l: r.left - R.left, t: r.top - R.top, r: r.right - R.left, b: r.bottom - R.top, w: r.width, h: r.height };
      };
      const G = this.o.gutter;
      const sp = rect(this.stackPane);
      const hp = this.heapPane ? rect(this.heapPane) : null;
      const side = Boolean(hp) && hp.l > sp.r + 4;
      const gutterOf = (pane) => {
        const P = pane === this.heapPane && hp ? hp : sp;
        if (side && pane === this.stackPane) return [sp.r, hp.l];
        return [P.r, P.r + G];
      };

      const items = [];
      for (const L of links) {
        const F = rect(L.from);
        const T = rect(L.target);
        if (!F.w || !T.w) continue;
        const pane = L.from.closest('.mem-pane');
        const [g0, g1] = gutterOf(pane);
        const it = { L, F, T, g0, g1, sx: F.r - 7, sy: F.t + F.h / 2, cell: L.target.classList.contains('mem-cell-box') };
        if (!it.cell) {
          // altezza d'arrivo: la prima casella del bersaglio (o la riga del nome per un oggetto)
          const el = L.target;
          let anchor = null;
          if (el.classList.contains('mem-val')) anchor = el;
          else if (el.classList.contains('mem-block')) anchor = el.querySelector('.mem-val, .mem-cell-box');
          else if (el.classList.contains('mem-var')) anchor = el.querySelector('.mem-sig');
          const A = anchor ? rect(anchor) : T;
          it.ey = A.t + A.h / 2;
        }
        items.push(it);
      }
      if (!items.length) return;

      // più frecce sullo stesso bersaglio: punte affiancate
      const byTarget = new Map();
      for (const it of items) {
        if (!byTarget.has(it.L.to)) byTarget.set(it.L.to, []);
        byTarget.get(it.L.to).push(it);
      }
      for (const list of byTarget.values()) list.forEach((it, j) => (it.off = (j - (list.length - 1) / 2) * 7));

      // un corridoio per ogni colonna: ogni freccia ha la sua corsia
      const groups = new Map();
      for (const it of items) {
        const k = Math.round(it.g0);
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k).push(it);
      }
      for (const list of groups.values()) this.assignLanes(list);

      for (const it of items) {
        const pts = this.route(it);
        svg.append(this.arrow(pts, it.L.kind));
      }
    }

    route(it) {
      const { sx, sy, T, lane } = it;
      const pts = [
        { x: sx, y: sy },
        { x: lane, y: sy },
      ];
      if (it.cell) {
        // nelle celle si entra dall'alto: sopra le celle c'è sempre una fascia libera
        const ex = T.l + T.w / 2 + (it.off || 0);
        const yy = T.t - 10;
        pts.push({ x: lane, y: yy }, { x: ex, y: yy }, { x: ex, y: T.t });
      } else {
        const ey = it.ey + (it.off || 0);
        const ex = T.l > lane + 2 ? T.l : T.r;
        pts.push({ x: lane, y: ey }, { x: ex, y: ey });
      }
      return simplify(pts);
    }

    assignLanes(list) {
      const k = list.length;
      const { g0, g1 } = list[0];
      const width = Math.max(10, g1 - g0);
      const step = k > 1 ? Math.min(10, (width - 16) / (k - 1)) : 0;
      const lanes = list.map((_, i) => (k > 1 ? g0 + 8 + i * step : g0 + Math.min(16, width / 2)));
      for (const it of list) it.vspan = Math.abs((it.cell ? it.T.t : it.ey) - it.sy);
      let best = null;
      const perms = k <= 6 ? permutations(k) : [list.map((_, i) => i).sort((a, b) => list[a].vspan - list[b].vspan)];
      for (const perm of perms) {
        list.forEach((it, i) => (it.lane = lanes[perm[i]]));
        const polys = list.map((it) => this.route(it));
        // prima meno incroci, poi le frecce più lunghe nelle corsie più esterne
        let cost = countCrossings(polys) * 1000;
        list.forEach((it, i) => (cost += it.vspan * (k - 1 - perm[i]) * 0.01));
        if (!best || cost < best.cost) best = { cost, perm };
      }
      list.forEach((it, i) => (it.lane = lanes[best.perm[i]]));
    }

    arrow(pts, kind) {
      const head = 6.5;
      const wing = 3.8;
      const n = pts.length;
      const tip = pts[n - 1];
      const prev = pts[n - 2];
      const len = Math.hypot(tip.x - prev.x, tip.y - prev.y) || 1;
      const ux = (tip.x - prev.x) / len;
      const uy = (tip.y - prev.y) / len;
      const base = { x: tip.x - ux * head, y: tip.y - uy * head };
      const line = pts.slice(0, -1).concat([len > head + 1 ? base : tip]);
      const g = s('g', { class: 'mem-link is-' + kind });
      g.append(
        s('path', { class: 'mem-line', d: roundedPath(line, 7) }),
        s('path', {
          class: 'mem-head',
          d: `M${tip.x} ${tip.y}L${base.x - uy * wing} ${base.y + ux * wing}L${base.x + uy * wing} ${base.y - ux * wing}Z`,
        }),
        s('circle', { class: 'mem-dot', cx: pts[0].x, cy: pts[0].y, r: 3.2 })
      );
      return g;
    }

    legend(keys) {
      const ul = h('ul.mem-legend', { 'aria-label': 'Legenda' });
      for (const k of keys) {
        let sample;
        if (k === 'ptr' || k === 'ref' || k === 'dangling') {
          sample = s(
            'svg',
            { class: 'mem-link is-' + k, width: 32, height: 10, viewBox: '0 0 32 10', 'aria-hidden': 'true', focusable: 'false' },
            s('path', { class: 'mem-line', d: 'M4 5H24' }),
            s('path', { class: 'mem-head', d: 'M30.5 5L24 1.2V8.8Z' }),
            s('circle', { class: 'mem-dot', cx: 4, cy: 5, r: 2.8 })
          );
        } else sample = h('i', { class: 'mem-sw mem-sw-' + k, 'aria-hidden': 'true' });
        ul.append(h('li', sample, LEGEND[k] || k));
      }
      return ul;
    }
  };
})();
