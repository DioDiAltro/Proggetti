/* ASD a quadretti — vista di un grafo (SVG) e "scena" grafo + strutture dati.

   const v = new ASD.viz.GraphView(el, { r, tagW, tagLines, ariaLabel, onNode, onEdge });
   v.render({
     graph: {                                  // il grafo: di solito lo stesso in tutti i fotogrammi
       n: 6,
       pos: [[40, 40], [160, 40], ...],        // coordinate dei nodi in unità SVG (circa 110-130 tra
                                               // due nodi vicini: il disegno si adatta al contenitore)
       edges: [[0, 1, 4], [0, 3, 2], ...],     // archi [u, v] oppure [u, v, peso]
       directed: false,                        // true: frecce da u a v (archi opposti diventano curve)
       weighted: true,                         // mostra i pesi (predefinito: se gli archi ne hanno uno)
       labels: ['s', 'a', ...],                // facoltativo: testo dentro i nodi (predefinito l'indice)
       bend: { '0-2': 0.3 },                   // facoltativo: curvatura di un arco (± frazione della lunghezza)
       tagAt: { 3: 'left' },                   // facoltativo: dove vanno le etichette di un nodo
                                               //   (below, above, left, right, below-right, ...)
       wAt: { '0-1': 0.4 }                     // facoltativo: posizione del peso lungo l'arco (0..1)
     },
     nodes:  { 0: 'active', 3: ['gray', 'src'] },   // classi dei nodi
     edges:  { '0-1': 'tree', '2-0': 'compare' },   // classi degli archi; chiave 'u-v' (non orientato:
                                                    // vale anche 'v-u')
     tags:   { 0: 'd 0', 2: ['3/4', 'p 1'] },       // etichette piccole accanto ai nodi (1 o 2 righe)
     tagCls: { 0: 'new' },                          // classe delle etichette (new = appena cambiata)
     eTags:  { '2-0': 'I' }                         // testo sull'arco, al posto del peso
   });

   Classi dei nodi: active (blu pieno), compare (giallo), done/found (verde), key/new/min (viola),
   swap (rosso), visited, gray e black (i colori della visita del Cormen), src (doppio cerchio:
   la sorgente), sel (selezionato), out (attenuato), c1..c6 (gruppi: componenti, insiemi).
   Classi degli archi: compare (esaminato ora, evidenziatore), tree/path (blu), done (verde),
   new (viola), swap/rejected (rosso tratteggiato), back/forward/cross (classificazione della DFS),
   ghost (non ancora letto), sel, out, cut (attraversa il taglio).
   Le posizioni dei pesi e delle etichette si calcolano una volta per grafo, evitando nodi, altri
   archi e altre etichette: non saltano da un fotogramma all'altro.

   const sc = new ASD.viz.GraphScene(el, { view: {...opzioni di GraphView}, panels: [
     { id: 'coda', kind: 'cells', title: 'Coda Q' },        // ArrayView a celle (code, pile)
     { id: 'pq', kind: 'chips', title: 'Coda con priorità' }, // gettoni in fila
     { id: 'tab', kind: 'table', title: 'dist e padre' },   // tabella piccola
     { id: 'st', kind: 'stack', title: 'Chiamate aperte' }, // pila verticale (cima in alto)
     { id: 'adj', kind: 'rows', title: 'Liste' }             // righe "intestazione → elementi"
   ]});
   sc.render({ g: {...stato di GraphView}, p: {
     coda: { a: [3, 5], ids: [3, 5], marks: { 0: 'active' }, ptrs: { testa: 0 } },
     pq:   { items: [{ t: '(2, 2)', cls: 'top' }, { t: '(7, 1)', cls: 'stale' }], empty: 'vuota' },
     tab:  { head: ['', '0', '1'], rows: [{ th: 'dist', cells: ['0', '∞'], cls: { 1: 'new' } }] },
     st:   { items: [{ t: 'dfsVisita(0)' }, { t: 'dfsVisita(1)', cls: 'active' }] },   // [0] = fondo
     adj:  { rows: [{ head: 'adj[0]', items: [{ t: '1' }, { t: '3', cls: 'new' }] }] }
   }});
   Ogni pannello accetta anche note: '...' (riga di commento sotto). */
(function () {
  'use strict';

  const { h, s } = ASD;

  const CH = 7.3; // larghezza stimata di un carattere mono a 12px (il disegno può essere ancora fuori dal documento)
  const LINE = 13.5; // interlinea delle etichette dei nodi
  const ARROW = 10; // lunghezza della punta di freccia
  const ARROW_W = 5; // semi-larghezza della punta

  const keyOf = (u, v, directed) => (directed || u < v ? `${u}-${v}` : `${v}-${u}`);

  /* ------------------------------------------------------------ geometria */

  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const len = (a) => Math.hypot(a[0], a[1]);
  const unit = (a) => {
    const l = len(a) || 1;
    return [a[0] / l, a[1] / l];
  };

  /** Arco come curva di Bézier quadratica (retta se bend = 0), accorciata ai bordi dei nodi. */
  function edgeGeom(pu, pv, bend, r, arrow) {
    const d = sub(pv, pu);
    const L = len(d) || 1;
    const nr = [-d[1] / L, d[0] / L]; // normale (a destra di chi va da u a v, con la y verso il basso)
    const mid = [(pu[0] + pv[0]) / 2, (pu[1] + pv[1]) / 2];
    const c = [mid[0] + nr[0] * bend * L, mid[1] + nr[1] * bend * L];
    const at = (t) => {
      const m = 1 - t;
      return [m * m * pu[0] + 2 * m * t * c[0] + t * t * pv[0], m * m * pu[1] + 2 * m * t * c[1] + t * t * pv[1]];
    };
    const tan = (t) => unit([2 * (1 - t) * (c[0] - pu[0]) + 2 * t * (pv[0] - c[0]), 2 * (1 - t) * (c[1] - pu[1]) + 2 * t * (pv[1] - c[1])]);
    // t in cui la curva esce da un cerchio di raggio rr attorno a un estremo
    const cut = (center, rr, fromStart) => {
      let lo = fromStart ? 0 : 0.5;
      let hi = fromStart ? 0.5 : 1;
      for (let k = 0; k < 30; k++) {
        const mid2 = (lo + hi) / 2;
        const inside = len(sub(at(mid2), center)) < rr;
        if (fromStart === inside) lo = mid2;
        else hi = mid2;
      }
      return (lo + hi) / 2;
    };
    const t0 = cut(pu, r + 0.5, true);
    const tTip = cut(pv, r + (arrow ? 1 : 0.5), false);
    const t1 = arrow ? cut(pv, r + 1 + ARROW - 2.5, false) : tTip;
    // tratto [t0, t1]: estremi e punto di controllo della sotto-curva
    const p0 = at(t0);
    const p1 = at(t1);
    const q = [
      (1 - t0) * (1 - t1) * pu[0] + ((1 - t0) * t1 + t0 * (1 - t1)) * c[0] + t0 * t1 * pv[0],
      (1 - t0) * (1 - t1) * pu[1] + ((1 - t0) * t1 + t0 * (1 - t1)) * c[1] + t0 * t1 * pv[1],
    ];
    const path = bend
      ? `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}Q${q[0].toFixed(1)} ${q[1].toFixed(1)} ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`
      : `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}L${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`;
    let head = null;
    if (arrow) {
      const tip = at(tTip);
      const dir = tan(tTip);
      const base = [tip[0] - dir[0] * ARROW, tip[1] - dir[1] * ARROW];
      const pp = [-dir[1], dir[0]];
      head = `M${tip[0].toFixed(1)} ${tip[1].toFixed(1)}L${(base[0] + pp[0] * ARROW_W).toFixed(1)} ${(base[1] + pp[1] * ARROW_W).toFixed(1)}L${(base[0] - pp[0] * ARROW_W).toFixed(1)} ${(base[1] - pp[1] * ARROW_W).toFixed(1)}Z`;
    }
    const samples = [];
    for (let k = 0; k <= 14; k++) samples.push(at(t0 + ((tTip - t0) * k) / 14));
    const normalAt = (t) => {
      const tg = tan(t);
      return [-tg[1], tg[0]];
    };
    return { path, head, at, tan, normalAt, samples, t0, t1: tTip };
  }

  /** Il segmento ab entra nel rettangolo? (Liang-Barsky) */
  function segBox(a, b, box) {
    let t0 = 0;
    let t1 = 1;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const p = [-dx, dx, -dy, dy];
    const q = [a[0] - box.x0, box.x1 - a[0], a[1] - box.y0, box.y1 - a[1]];
    for (let i = 0; i < 4; i++) {
      if (p[i] === 0) {
        if (q[i] < 0) return false;
      } else {
        const r = q[i] / p[i];
        if (p[i] < 0) {
          if (r > t1) return false;
          if (r > t0) t0 = r;
        } else {
          if (r < t0) return false;
          if (r < t1) t1 = r;
        }
      }
    }
    return true;
  }

  /** Distanza minima di un punto da una spezzata. */
  const polyDist = (pts, p) => {
    let best = Infinity;
    for (let k = 1; k < pts.length; k++) {
      const a = pts[k - 1];
      const b = pts[k];
      const ab = sub(b, a);
      const l2 = ab[0] * ab[0] + ab[1] * ab[1] || 1;
      const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / l2));
      best = Math.min(best, Math.hypot(a[0] + ab[0] * t - p[0], a[1] + ab[1] * t - p[1]));
    }
    return best;
  };

  const polyBox = (pts, box) => {
    for (let k = 1; k < pts.length; k++) if (segBox(pts[k - 1], pts[k], box)) return true;
    return false;
  };

  const boxCircle = (box, c, r) => {
    const x = Math.max(box.x0, Math.min(c[0], box.x1));
    const y = Math.max(box.y0, Math.min(c[1], box.y1));
    return Math.hypot(x - c[0], y - c[1]) < r;
  };

  const boxBox = (a, b, m = 0) => a.x0 < b.x1 + m && b.x0 < a.x1 + m && a.y0 < b.y1 + m && b.y0 < a.y1 + m;

  const boxAt = (c, w, hh) => ({ x0: c[0] - w / 2, x1: c[0] + w / 2, y0: c[1] - hh / 2, y1: c[1] + hh / 2 });

  /* Direzioni possibili per le etichette di un nodo: angolo (gradi, y in basso) e preferenza. */
  const DIRS = [
    { id: 'below', a: 90, pref: 10 },
    { id: 'above', a: 270, pref: 8 },
    { id: 'right', a: 0, pref: 5 },
    { id: 'left', a: 180, pref: 5 },
    { id: 'below-right', a: 45, pref: 2 },
    { id: 'below-left', a: 135, pref: 2 },
    { id: 'above-right', a: 315, pref: 1 },
    { id: 'above-left', a: 225, pref: 1 },
  ];

  /** Riquadro e ancoraggio del testo delle etichette di un nodo in una direzione. */
  function tagLayout(c, r, dir, w, lines) {
    const hh = lines * LINE;
    const k = r * 0.72;
    let x;
    let anchor;
    let top; // y del bordo superiore del blocco di testo
    switch (dir) {
      case 'below':
        x = c[0];
        anchor = 'middle';
        top = c[1] + r + 2;
        break;
      case 'above':
        x = c[0];
        anchor = 'middle';
        top = c[1] - r - 3 - hh;
        break;
      case 'right':
        x = c[0] + r + 5;
        anchor = 'start';
        top = c[1] - hh / 2;
        break;
      case 'left':
        x = c[0] - r - 5;
        anchor = 'end';
        top = c[1] - hh / 2;
        break;
      case 'below-right':
        x = c[0] + k + 2;
        anchor = 'start';
        top = c[1] + k - 1;
        break;
      case 'below-left':
        x = c[0] - k - 2;
        anchor = 'end';
        top = c[1] + k - 1;
        break;
      case 'above-right':
        x = c[0] + k + 2;
        anchor = 'start';
        top = c[1] - k + 1 - hh;
        break;
      default: // above-left
        x = c[0] - k - 2;
        anchor = 'end';
        top = c[1] - k + 1 - hh;
    }
    const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'start' ? x : x - w;
    return { x, anchor, top, box: { x0, x1: x0 + w, y0: top, y1: top + hh } };
  }

  const angDist = (a, b) => {
    const d = Math.abs(((a - b) % 360) + 360) % 360;
    return d > 180 ? 360 - d : d;
  };

  /* ---------------------------------------------------------- GraphView */

  ASD.viz.GraphView = class GraphView {
    constructor(host, o = {}) {
      this.o = Object.assign({ r: 17, tagW: 40, tagLines: 1, maxScale: 1.2, ariaLabel: '' }, o);
      this.svg = s('svg', { class: 'gr-svg', role: o.onNode || o.onEdge ? 'group' : 'img', 'aria-label': this.o.ariaLabel || 'Grafo' });
      this.gEdges = s('g', { class: 'gr-edges' });
      this.gW = s('g', { class: 'gr-ws' });
      this.gNodes = s('g', { class: 'gr-nodes' });
      this.gTags = s('g', { class: 'gr-tags', 'aria-hidden': 'true' });
      this.svg.append(this.gEdges, this.gW, this.gNodes, this.gTags);
      this.root = h('div.gr-view', this.svg);
      host.append(this.root);
      this.sig = null;
      this.g = null;
    }

    static key(u, v, directed) {
      return keyOf(u, v, directed);
    }

    reset() {
      /* la struttura si ricostruisce da sola quando cambia il grafo */
    }

    render(st) {
      st = st || {};
      const g = st.graph || this.o.graph;
      if (!g) return;
      const sig = JSON.stringify([g.n, g.pos, g.edges, g.directed, g.weighted, g.labels, g.bend, g.tagAt, g.wAt, this.o.tagLines, this.o.tagW]);
      if (sig !== this.sig) {
        this.sig = sig;
        this.build(g);
      }
      this.update(st);
    }

    /* --------------------------------------------------------- costruzione */

    build(g) {
      const o = this.o;
      const r = o.r;
      const n = g.n;
      const pos = g.pos;
      const directed = Boolean(g.directed);
      const edges = g.edges || [];
      const weighted = g.weighted != null ? g.weighted : edges.some((e) => e.length > 2 && e[2] != null);
      this.g = { n, directed, weighted, edges };
      this.gEdges.replaceChildren();
      this.gW.replaceChildren();
      this.gNodes.replaceChildren();
      this.gTags.replaceChildren();

      // archi: geometria (gli archi opposti u->v e v->u si curvano ognuno dalla sua parte)
      const present = new Set(edges.map((e) => `${e[0]}-${e[1]}`));
      const geoms = edges.map(([u, v]) => {
        const k = keyOf(u, v, directed);
        const fixed = g.bend && g.bend[k] != null;
        let bend = fixed ? g.bend[k] : 0;
        if (!bend && directed && present.has(`${v}-${u}`)) bend = 0.2;
        let geo = edgeGeom(pos[u], pos[v], bend, r, directed);
        if (!fixed) {
          // un arco non deve passare sopra un altro nodo: se succede, si curva un po'
          const hits = (gm) => {
            for (let j = 0; j < n; j++) if (j !== u && j !== v && polyDist(gm.samples, pos[j]) < r + 5) return true;
            return false;
          };
          if (hits(geo)) {
            for (const b of [0.2, -0.2, 0.32, -0.32, 0.45, -0.45]) {
              const alt = edgeGeom(pos[u], pos[v], bend + b, r, directed);
              if (!hits(alt)) {
                geo = alt;
                break;
              }
            }
          }
        }
        return geo;
      });

      // pesi (o etichette d'arco): posti dove non toccano nodi, altri archi, altre etichette
      const placed = [];
      this.wPos = edges.map((e, i) => {
        const k = keyOf(e[0], e[1], directed);
        const text = weighted ? String(e[2]) : 'M';
        const w = Math.max(19, 9 + CH * text.length);
        const hh = 17;
        const fixed = g.wAt && g.wAt[k] != null ? [].concat(g.wAt[k]) : null;
        const ts = fixed ? [fixed[0]] : [0.5, 0.42, 0.58, 0.34, 0.66, 0.27, 0.73];
        const offs = fixed ? [fixed[1] || 0] : [0, 13, -13];
        let best = null;
        for (const t of ts) {
          for (const off of offs) {
            const p = geoms[i].at(t);
            const nr = geoms[i].normalAt(t);
            const c = [p[0] + nr[0] * off, p[1] + nr[1] * off];
            const box = boxAt(c, w, hh);
            let pen = Math.abs(t - 0.5) * 6 + (off ? 9 : 0);
            for (let j = 0; j < n; j++) if (boxCircle(box, pos[j], r + 3)) pen += 120;
            for (const b of placed) if (boxBox(box, b, 2)) pen += 80;
            for (let j = 0; j < edges.length; j++) if (j !== i && polyBox(geoms[j].samples, box)) pen += 30;
            if (!best || pen < best.pen) best = { pen, c, box, w };
          }
        }
        placed.push(best.box);
        return best;
      });

      // etichette dei nodi: dalla parte più lontana dagli archi che escono dal nodo
      const lines = o.tagLines;
      const tagBoxes = [];
      this.tagPos = [];
      for (let i = 0; i < n; i++) {
        const c = pos[i];
        const angles = [];
        edges.forEach(([u, v], j) => {
          if (u !== i && v !== i) return;
          const smp = geoms[j].samples;
          const far = u === i ? smp[Math.min(4, smp.length - 1)] : smp[Math.max(smp.length - 5, 0)];
          const d = sub(far, c);
          angles.push((Math.atan2(d[1], d[0]) * 180) / Math.PI);
        });
        const forced = g.tagAt && g.tagAt[i];
        let best = null;
        for (const dir of DIRS) {
          if (forced && dir.id !== forced) continue;
          const lay = tagLayout(c, r, dir.id, o.tagW, lines);
          let score = dir.pref + (angles.length ? Math.min(...angles.map((a) => angDist(a, dir.a))) : 180) * 0.6;
          for (let j = 0; j < n; j++) if (j !== i && boxCircle(lay.box, pos[j], r + 2)) score -= 200;
          for (const wp of this.wPos) if (weighted && boxBox(lay.box, wp.box, 1)) score -= 90;
          edges.forEach(([u, v], j) => {
            if (u !== i && v !== i && polyBox(geoms[j].samples, lay.box)) score -= 70;
          });
          for (const b of tagBoxes) if (boxBox(lay.box, b, 2)) score -= 120;
          if (!best || score > best.score) best = { score, lay };
        }
        tagBoxes.push(best.lay.box);
        this.tagPos.push(best.lay);
      }

      // elementi SVG
      this.edgeEls = new Map();
      edges.forEach((e, i) => {
        const [u, v] = e;
        const k = keyOf(u, v, directed);
        const geo = geoms[i];
        const kids = [];
        if (o.onEdge) kids.push(s('path', { class: 'gr-e-hit', d: geo.path }));
        kids.push(s('path', { class: 'gr-e-halo', d: geo.path }), s('path', { class: 'gr-e-line', d: geo.path }));
        if (geo.head) kids.push(s('path', { class: 'gr-e-head', d: geo.head }));
        const el = s('g', { class: 'gr-edge', 'data-key': k }, ...kids);
        if (o.onEdge) {
          const label = directed ? `Arco da ${this.label(g, u)} a ${this.label(g, v)}` : `Arco tra ${this.label(g, u)} e ${this.label(g, v)}`;
          el.setAttribute('tabindex', '0');
          el.setAttribute('role', 'button');
          el.setAttribute('aria-label', label + (weighted ? `, peso ${e[2]}` : ''));
          el.addEventListener('click', () => o.onEdge(k, e));
          el.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') {
              ev.preventDefault();
              o.onEdge(k, e);
            }
          });
        }
        this.gEdges.append(el);
        // peso o etichetta d'arco
        const wp = this.wPos[i];
        const rect = s('rect', { class: 'gr-w-bg', x: (-wp.w / 2).toFixed(1), y: -8.5, width: wp.w.toFixed(1), height: 17, rx: 8.5 });
        const txt = s('text', { class: 'gr-w-t', x: 0, y: 0.5 }, weighted ? String(e[2]) : '');
        const wg = s('g', { class: 'gr-w' + (weighted ? '' : ' is-empty'), transform: `translate(${wp.c[0].toFixed(1)} ${wp.c[1].toFixed(1)})`, 'aria-hidden': 'true' }, rect, txt);
        // il peso copre l'arco: un clic sul peso vale come un clic sull'arco (da tastiera si usa l'arco)
        if (o.onEdge) wg.addEventListener('click', () => o.onEdge(k, e));
        this.gW.append(wg);
        this.edgeEls.set(k, { el, wg, rect, txt, w: e[2], base: weighted ? String(e[2]) : '' });
      });

      this.nodeEls = [];
      for (let i = 0; i < n; i++) {
        const c = pos[i];
        const ring = s('circle', { class: 'gr-n-ring', r: r + 4 });
        const circle = s('circle', { class: 'gr-n-c', r });
        const label = s('text', { class: 'gr-n-t', x: 0, y: 0.5 }, this.label(g, i));
        const el = s('g', { class: 'gr-node', transform: `translate(${c[0]} ${c[1]})` }, ring, circle, label);
        if (o.onNode) {
          el.setAttribute('tabindex', '0');
          el.setAttribute('role', 'button');
          el.setAttribute('aria-label', 'Nodo ' + this.label(g, i));
          el.addEventListener('click', () => o.onNode(i));
          el.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') {
              ev.preventDefault();
              o.onNode(i);
            }
          });
        }
        this.gNodes.append(el);
        const lay = this.tagPos[i];
        const tag = s('text', { class: 'gr-tag', x: lay.x.toFixed(1), y: lay.top.toFixed(1), 'text-anchor': lay.anchor });
        tag.style.textAnchor = lay.anchor;
        this.gTags.append(tag);
        this.nodeEls.push({ el, tag, lay, text: null });
      }

      // riquadro del disegno: nodi, etichette, pesi e curve
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      const grow = (b) => {
        x0 = Math.min(x0, b.x0);
        y0 = Math.min(y0, b.y0);
        x1 = Math.max(x1, b.x1);
        y1 = Math.max(y1, b.y1);
      };
      for (let i = 0; i < n; i++) grow(boxAt(pos[i], 2 * (r + 5), 2 * (r + 5)));
      for (const b of tagBoxes) grow(b);
      if (weighted) for (const wp of this.wPos) grow(wp.box);
      for (const geo of geoms) for (const p of geo.samples) grow(boxAt(p, 4, 4));
      const pad = 4;
      const vw = x1 - x0 + 2 * pad;
      const vh = y1 - y0 + 2 * pad;
      this.svg.setAttribute('viewBox', `${(x0 - pad).toFixed(1)} ${(y0 - pad).toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}`);
      this.svg.style.maxWidth = Math.round(vw * o.maxScale) + 'px';
      this.svg.style.aspectRatio = `${vw.toFixed(1)} / ${vh.toFixed(1)}`;
      if (!o.ariaLabel) {
        this.svg.setAttribute('aria-label', `Grafo ${directed ? 'orientato' : 'non orientato'}${weighted ? ' pesato' : ''} con ${n} nodi e ${edges.length} archi`);
      }
    }

    label(g, i) {
      return g.labels && g.labels[i] != null ? String(g.labels[i]) : String(i);
    }

    /* ------------------------------------------------------- aggiornamento */

    update(st) {
      if (!this.g) return;
      const { directed } = this.g;
      const nodeCls = st.nodes || {};
      const edgeCls = st.edges || {};
      const tags = st.tags || {};
      const tagCls = st.tagCls || {};
      const eTags = st.eTags || {};
      const look = (map, u, v) => {
        const a = map[`${u}-${v}`];
        if (a != null || directed) return a;
        return map[`${v}-${u}`];
      };

      this.nodeEls.forEach((ne, i) => {
        const cls = ['gr-node'];
        for (const c of [].concat(nodeCls[i] || [])) if (c) cls.push('is-' + c);
        ne.el.setAttribute('class', cls.join(' '));
        if (ne.el.hasAttribute('role')) ne.el.setAttribute('aria-pressed', String(cls.includes('is-sel')));
        const t = tags[i];
        const text = t == null ? '' : [].concat(t).join('\n');
        if (text !== ne.text) {
          ne.text = text;
          const parts = t == null ? [] : [].concat(t).map(String);
          ne.tag.replaceChildren(
            ...parts.map((p, k) => s('tspan', { x: ne.lay.x.toFixed(1), dy: k === 0 ? '0.95em' : '1.12em' }, p))
          );
        }
        const tc = ['gr-tag'];
        for (const c of [].concat(tagCls[i] || [])) if (c) tc.push('is-' + c);
        ne.tag.setAttribute('class', tc.join(' '));
      });

      for (const e of this.g.edges) {
        const [u, v] = e;
        const k = keyOf(u, v, directed);
        const ee = this.edgeEls.get(k);
        if (!ee) continue;
        const cls = ['gr-edge'];
        for (const c of [].concat(look(edgeCls, u, v) || [])) if (c) cls.push('is-' + c);
        ee.el.setAttribute('class', cls.join(' '));
        if (ee.el.hasAttribute('role')) ee.el.setAttribute('aria-pressed', String(cls.includes('is-sel')));
        const et = look(eTags, u, v);
        const text = et != null ? String(et) : ee.base;
        if (ee.txt.textContent !== text) ee.txt.textContent = text;
        const wc = ['gr-w'];
        if (!text) wc.push('is-empty');
        if (this.o.onEdge) wc.push('is-click');
        for (const c of [].concat(look(edgeCls, u, v) || [])) if (c) wc.push('is-' + c);
        ee.wg.setAttribute('class', wc.join(' '));
      }
    }
  };

  /* --------------------------------------------------------- GraphScene */

  /** Pannelli laterali: le strutture dati dell'algoritmo. */
  const PANELS = {
    cells(body) {
      const view = new ASD.viz.ArrayView(body, { mode: 'cells', maxSlot: 40, minSlot: 26, showIndex: false });
      const empty = h('p.gr-empty', { text: 'vuota', hidden: true });
      body.append(empty);
      return {
        reset: () => view.reset(),
        render(st) {
          const a = (st && st.a) || [];
          empty.hidden = a.length > 0;
          if (st && st.empty) empty.textContent = st.empty;
          view.root.hidden = !a.length;
          view.render({ a, ids: st && st.ids, marks: (st && st.marks) || {}, ptrs: a.length ? (st && st.ptrs) || {} : {} });
        },
      };
    },

    chips(body) {
      const list = h('ol.gr-chips');
      const empty = h('p.gr-empty', { text: 'vuota', hidden: true });
      body.append(list, empty);
      return {
        render(st) {
          const items = (st && st.items) || [];
          empty.hidden = items.length > 0;
          if (st && st.empty) empty.textContent = st.empty;
          list.replaceChildren(
            ...items.map((it) => {
              const li = h('li.gr-chip' + [].concat(it.cls || []).filter(Boolean).map((c) => '.is-' + c).join(''));
              li.innerHTML = it.t;
              if (it.title) li.title = it.title;
              return li;
            })
          );
        },
      };
    },

    stack(body) {
      const list = h('ol.gr-stack');
      const empty = h('p.gr-empty', { text: 'vuota', hidden: true });
      body.append(list, empty);
      return {
        render(st) {
          const items = (st && st.items) || [];
          empty.hidden = items.length > 0;
          if (st && st.empty) empty.textContent = st.empty;
          // la cima in alto: si disegna dall'ultimo al primo
          list.replaceChildren(
            ...items
              .slice()
              .reverse()
              .map((it) => {
                const li = h('li' + [].concat(it.cls || []).filter(Boolean).map((c) => '.is-' + c).join(''));
                li.innerHTML = it.t;
                return li;
              })
          );
        },
      };
    },

    table(body) {
      const wrap = h('div.gr-tab-wrap');
      body.append(wrap);
      let key = '';
      let table = null;
      return {
        render(st) {
          if (!st) {
            wrap.replaceChildren();
            key = '';
            return;
          }
          const head = st.head || [];
          const rows = st.rows || [];
          const shape = head.join('|') + '#' + rows.map((r) => r.th + ':' + r.cells.length).join('|');
          if (shape !== key) {
            key = shape;
            table = h('table.gr-tab');
            if (head.length) table.append(h('thead', h('tr', head.map((c, i) => h('th', { scope: 'col', html: c, class: i === 0 ? 'gr-tab-corner' : null })))));
            const tb = h('tbody');
            for (const r of rows) {
              const tr = h('tr', h('th', { scope: 'row', html: r.th }));
              for (let i = 0; i < r.cells.length; i++) tr.append(h('td'));
              tb.append(tr);
            }
            table.append(tb);
            wrap.replaceChildren(table);
          }
          const colCls = st.colCls || {};
          table.querySelectorAll('thead th').forEach((th, i) => {
            const c = i > 0 ? colCls[i - 1] : null;
            th.className = (i === 0 ? 'gr-tab-corner' : '') + (c ? ' is-' + [].concat(c).join(' is-') : '');
          });
          table.querySelectorAll('tbody tr').forEach((tr, ri) => {
            const r = rows[ri];
            const tds = tr.querySelectorAll('td');
            tds.forEach((td, ci) => {
              const v = r.cells[ci];
              const html = v == null ? '' : String(v);
              if (td.innerHTML !== html) td.innerHTML = html;
              const cc = [].concat((r.cls && r.cls[ci]) || [], colCls[ci] || []).filter(Boolean);
              td.className = cc.map((c) => 'is-' + c).join(' ');
            });
          });
        },
      };
    },

    rows(body) {
      const list = h('ol.gr-rows');
      body.append(list);
      return {
        render(st) {
          const rows = (st && st.rows) || [];
          list.replaceChildren(
            ...rows.map((r) => {
              const li = h('li' + [].concat(r.cls || []).filter(Boolean).map((c) => '.is-' + c).join(''));
              li.append(h('span.gr-rows-h', { html: r.head }));
              const items = h('span.gr-rows-i');
              if (!r.items.length) items.append(h('span.gr-rows-none', { text: r.none || 'vuota' }));
              for (const it of r.items) {
                items.append(h('span.gr-rows-x' + [].concat(it.cls || []).filter(Boolean).map((c) => '.is-' + c).join(''), { html: it.t }));
              }
              li.append(items);
              return li;
            })
          );
        },
      };
    },
  };

  ASD.viz.GraphScene = class GraphScene {
    constructor(host, o = {}) {
      this.o = o;
      this.root = h('div.gr-scene');
      const inner = h('div.gr-scene-in' + ((o.panels || []).length ? '.has-side' : ''));
      const main = h('div.gr-scene-graph');
      const side = h('div.gr-scene-side');
      inner.append(main, side);
      this.root.append(inner);
      host.append(this.root);
      this.view = new ASD.viz.GraphView(main, o.view || {});
      this.panels = (o.panels || []).map((p) => {
        const title = h('p.gr-ptitle', { html: p.title || '' });
        const body = h('div.gr-pbody');
        const note = h('p.gr-pnote', { hidden: true });
        const box = h('div.gr-panel.gr-panel-' + p.kind, title, body, note);
        side.append(box);
        const impl = PANELS[p.kind](body, p);
        return { id: p.id, impl, note, box };
      });
    }

    reset() {
      for (const p of this.panels) if (p.impl.reset) p.impl.reset();
    }

    render(st) {
      st = st || {};
      this.view.render(st.g || {});
      const ps = st.p || {};
      for (const p of this.panels) {
        const ps1 = ps[p.id];
        p.box.hidden = ps1 === false;
        if (ps1 === false) continue;
        p.impl.render(ps1);
        const note = ps1 && ps1.note;
        p.note.hidden = !note;
        if (note) p.note.innerHTML = note;
      }
    }
  };
})();
