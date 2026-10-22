/* ASD a quadretti — viste delle strutture lineari: liste, pile, code circolari.

   1. ASD.viz.ListView — lista concatenata: nodi [ val | next ] (o [ prev | val | next ])
      e frecce, disegnata in SVG.

   new ASD.viz.ListView(el, { doubly: false, ariaLabel: 'Lista' })
   view.render({
     nodes: {                                  // i nodi che esistono, con id stabili
       a: { val: 8, next: 'b', cls: 'compare' },
       b: { val: 15, next: null },             // null = nullptr: simbolo di terra nel campo
       s: { sentinel: true, prev: 'b', next: 'a' },   // liste doppie: anche prev
     },
     row: ['a', 'b'],              // nodi della riga principale, da sinistra a destra
     float: { n: 0.5 },            // nodi sollevati sopra la riga (appena creati): la
                                   // posizione 0.5 sta tra la casella 0 e la 1, -0.5 prima della 0
     drop: ['b'],                  // nodi abbassati sotto la riga (staccati dalla lista):
                                   // restano nella loro casella di row
     ptrs: { head: 'a', p: 'b', prev: null },  // puntatori con nome; null = nullptr
     nullAt: 'right',              // dove stanno i puntatori nulli: 'left' | 'right'
                                   // oppure { prev: 'left', next: 'right' }
     hot: ['a', 'head']            // frecce appena cambiate: id di nodo = il suo next,
                                   // 'a.prev' = il suo prev, nome = puntatore con nome
   });
   Classi dei nodi: compare, swap, done, found, key, new, visited, out (staccato,
   bordo tratteggiato), freed (memoria già restituita con delete).
   Dentro uno Stepper l'ingombro si calcola su tutti i fotogrammi, così il
   disegno non salta; gli spostamenti dei nodi sono animati (non con
   prefers-reduced-motion). Se non c'è posto, il disegno scorre di lato.

   2. ASD.viz.StackView — una o più pile in verticale, la cima in alto (HTML).

   view.render({ cols: [{
     label: 'a',                   // nome sotto la colonna
     a: [10, 20, 30, null], n: 2,  // array con capacità: valide le prime n caselle,
                                   // le altre sono libere (un valore vecchio si attenua)
     items: ['(', '['],            // in alternativa: solo gli elementi (pila senza capacità)
     marks: { 1: 'key' },          // classi per indice
     ptrs: { n: 2 },               // etichette con freccia a destra della casella
     note: 'cap 4'                 // testo piccolo sotto il nome
   }] });

   3. ASD.viz.CircularView — array circolare di una coda (SVG).

   view.render({
     a: [6, 7, 3, 4, null],        // contenuto delle caselle (null = mai scritta)
     head: 2, n: 4,                // la coda è a[head], a[head+1], ... modulo la capacità
     marks: { 0: 'new' },
     ptrs: { head: 2, tail: 1 },   // frecce sotto le caselle
     wrap: true                    // un indice ha appena fatto il giro: l'arco si evidenzia
   });
   Le caselle fuori dalla coda che contengono ancora un valore vecchio si
   attenuano: in C++ dequeue non cancella niente, sposta solo head. */
(function () {
  'use strict';

  const { h, s } = ASD;

  const GEO = {
    wide: { name: 'w', H: 36, VW: 42, PW: 22, G: 48 },
    narrow: { name: 'n', H: 34, VW: 36, PW: 20, G: 36 },
  };
  const LINE = 15; // altezza di una riga di etichette
  const ARC = 24; // altezza degli archi sopra e sotto la riga
  const f1 = (v) => (Math.round(v * 10) / 10).toString();

  /** Durata dell'animazione: la variabile --av-dur che lo Stepper imposta (0 se il moto è ridotto). */
  function durationOf(el) {
    if (!ASD.motionOK() || document.hidden) return 0;
    const ms = parseFloat(getComputedStyle(el).getPropertyValue('--av-dur'));
    return Number.isFinite(ms) ? ms : 0;
  }

  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  function dedupe(pts) {
    const out = [];
    for (const p of pts) {
      const q = out[out.length - 1];
      if (!q || Math.abs(q[0] - p[0]) > 0.01 || Math.abs(q[1] - p[1]) > 0.01) out.push(p);
    }
    return out;
  }

  /** Spezzata con gli angoli arrotondati; l'ultimo tratto si accorcia per far posto alla punta. */
  function pathD(pts, r = 6, back = 5) {
    pts = dedupe(pts).map((p) => p.slice());
    if (pts.length < 2) return '';
    const n = pts.length;
    const [x1, y1] = pts[n - 2];
    const [x2, y2] = pts[n - 1];
    const len = Math.hypot(x2 - x1, y2 - y1);
    if (len > back + 1) {
      pts[n - 1] = [x2 - ((x2 - x1) / len) * back, y2 - ((y2 - y1) / len) * back];
    }
    let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i - 1];
      const [bx, by] = pts[i];
      const [cx, cy] = pts[i + 1];
      const d1 = Math.hypot(bx - ax, by - ay);
      const d2 = Math.hypot(cx - bx, cy - by);
      const rr = Math.min(r, d1 / 2, d2 / 2);
      const px = bx - ((bx - ax) / d1) * rr;
      const py = by - ((by - ay) / d1) * rr;
      const qx = bx + ((cx - bx) / d2) * rr;
      const qy = by + ((cy - by) / d2) * rr;
      d += ` L${f1(px)} ${f1(py)} Q${f1(bx)} ${f1(by)} ${f1(qx)} ${f1(qy)}`;
    }
    const last = pts[pts.length - 1];
    return d + ` L${f1(last[0])} ${f1(last[1])}`;
  }

  /** Punta di freccia (triangolo) alla fine della spezzata. */
  function headD(pts, size = 7) {
    pts = dedupe(pts);
    if (pts.length < 2) return '';
    const [x1, y1] = pts[pts.length - 2];
    const [x2, y2] = pts[pts.length - 1];
    const a = Math.atan2(y2 - y1, x2 - x1);
    const w = 0.42;
    return (
      `M${f1(x2)} ${f1(y2)} L${f1(x2 - size * Math.cos(a - w))} ${f1(y2 - size * Math.sin(a - w))} ` +
      `L${f1(x2 - size * Math.cos(a + w))} ${f1(y2 - size * Math.sin(a + w))} Z`
    );
  }

  /** Simbolo di "terra" (nullptr) centrato in (cx, cy). */
  function groundD(cx, cy, k = 1) {
    const t = (v) => f1(v);
    return (
      `M${t(cx)} ${t(cy - 8 * k)} V${t(cy + 1 * k)} ` +
      `M${t(cx - 6 * k)} ${t(cy + 1 * k)} H${t(cx + 6 * k)} ` +
      `M${t(cx - 4 * k)} ${t(cy + 4.5 * k)} H${t(cx + 4 * k)} ` +
      `M${t(cx - 2 * k)} ${t(cy + 8 * k)} H${t(cx + 2 * k)}`
    );
  }
  ASD.viz.groundD = groundD;

  const textW = (str) => String(str).length * 7.7 + 8;

  /* ======================================================== ListView */

  ASD.viz.ListView = class ListView {
    constructor(host, o = {}) {
      this.o = Object.assign({ doubly: false, ariaLabel: 'Lista concatenata' }, o);
      this.svg = s('svg', { class: 'll-svg', role: 'img', 'aria-label': this.o.ariaLabel });
      this.gNodes = s('g', { class: 'll-nodes' });
      this.gLinks = s('g', { class: 'll-links' });
      this.gPtrs = s('g', { class: 'll-ptrs' });
      this.svg.append(this.gNodes, this.gLinks, this.gPtrs);
      this.root = h('div.ll', this.svg);
      host.append(this.root);
      this.host = host;
      this.nodeEls = new Map();
      this.shown = null;
      this.extKey = null;
      if ('ResizeObserver' in window) {
        let w = host.clientWidth;
        this.ro = new ResizeObserver(() => {
          const nw = host.clientWidth;
          if (this.last && Math.abs(nw - w) > 1) {
            w = nw;
            this.render(this.last.st, this.last.frame, this.last.stepper, true);
          }
        });
        this.ro.observe(host);
      }
    }

    reset() {
      cancelAnimationFrame(this.raf);
      for (const el of this.nodeEls.values()) el.g.remove();
      this.nodeEls.clear();
      this.shown = null;
      this.extKey = null;
    }

    geo() {
      const avail = this.host.clientWidth || 600;
      const base = avail < 520 ? GEO.narrow : GEO.wide;
      const g = Object.assign({}, base, { doubly: Boolean(this.o.doubly) });
      g.W = g.VW + g.PW * (g.doubly ? 2 : 1);
      g.U = g.W + g.G;
      g.valOff = g.doubly ? g.PW : 0;
      g.nextOff = g.valOff + g.VW + g.PW / 2;
      g.prevOff = g.PW / 2;
      return g;
    }

    /* ----------------------------------------------------------- posizioni */

    place(st, g, X0, Y) {
      const pos = new Map();
      const nodes = st.nodes || {};
      const drop = new Set(st.drop || []);
      (st.row || []).forEach((id, i) => {
        if (!nodes[id]) return;
        const d = drop.has(id);
        pos.set(id, { x: X0 + i * g.U, y: d ? Y.drop : Y.row, where: d ? 'drop' : 'row' });
      });
      for (const [id, at] of Object.entries(st.float || {})) {
        if (nodes[id]) pos.set(id, { x: X0 + at * g.U, y: Y.float, where: 'float' });
      }
      return pos;
    }

    /** Tutte le frecce dei campi next (e prev) con il loro percorso. */
    links(st, pos, g) {
      const out = [];
      const hot = new Set(st.hot || []);
      const nodes = st.nodes || {};
      for (const [id, P] of pos) {
        const node = nodes[id];
        for (const kind of g.doubly ? ['next', 'prev'] : ['next']) {
          const dy = g.doubly ? (kind === 'next' ? -5 : 5) : 0;
          const F = { x: P.x + (kind === 'next' ? g.nextOff : g.prevOff), y: P.y + g.H / 2 + dy };
          const to = node[kind];
          const isHot = hot.has(kind === 'next' ? id : id + '.prev');
          if (to == null) {
            out.push({ id, kind, F, nil: true, hot: isHot });
            continue;
          }
          const Q = pos.get(to);
          if (!Q) continue; // punta a un nodo che non si disegna
          const r = this.route(P, Q, kind, F, pos, g);
          out.push({ id, kind, F, pts: r.pts, arc: r.arc || null, hot: isHot });
        }
      }
      return out;
    }

    route(A, B, kind, F, pos, g) {
      const H = g.H;
      const W = g.W;
      const vc = B.x + g.valOff + g.VW / 2;
      if (Math.abs(A.y - B.y) > 0.5) {
        // righe diverse: un tratto dritto fino al bordo del campo val
        return { pts: [[F.x, F.y], [vc, B.y > A.y ? B.y : B.y + H]] };
      }
      const lo = Math.min(A.x, B.x);
      const hi = Math.max(A.x, B.x);
      let between = false;
      for (const P of pos.values()) {
        if (P !== A && P !== B && Math.abs(P.y - A.y) < 0.5 && P.x > lo + 1 && P.x < hi - 1) between = true;
      }
      const yB = B.y + H / 2 + (g.doubly ? (kind === 'next' ? -5 : 5) : 0);
      if (kind === 'next') {
        if (B.x > A.x && !between) return { pts: [[F.x, F.y], [B.x, F.y]] };
        if (B.x < A.x && !between) {
          // freccia all'indietro tra vicini: esce in alto e rientra dal bordo destro di B
          const top = A.y - 12;
          const gx = B.x + W + g.G / 2;
          return { pts: [[F.x, F.y], [F.x, top], [gx, top], [gx, yB], [B.x + W, yB]], arc: 'above' };
        }
        const top = A.y - ARC;
        return { pts: [[F.x, F.y], [F.x, top], [vc, top], [vc, B.y]], arc: 'above' };
      }
      if (B.x < A.x && !between) return { pts: [[F.x, F.y], [B.x + W, F.y]] };
      if (B.x > A.x && !between) {
        const bot = A.y + H + 12;
        const gx = B.x - g.G / 2;
        return { pts: [[F.x, F.y], [F.x, bot], [gx, bot], [gx, yB], [B.x, yB]], arc: 'below' };
      }
      const bot = A.y + H + ARC;
      return { pts: [[F.x, F.y], [F.x, bot], [vc, bot], [vc, B.y + H]], arc: 'below' };
    }

    nullSide(st, name) {
      const n = st.nullAt;
      if (n && typeof n === 'object') return n[name] || 'right';
      return n || 'right';
    }

    /** Puntatori con nome raggruppati per destinazione, con la loro x. */
    groups(st, pos, g, X0) {
      const map = new Map();
      const rowLen = (st.row || []).filter((id) => st.nodes && st.nodes[id]).length;
      for (const [name, to] of Object.entries(st.ptrs || {})) {
        let key;
        let cx;
        let where;
        if (to == null) {
          const side = this.nullSide(st, name);
          key = 'nil:' + side;
          where = 'nil';
          if (side === 'left') cx = X0 - g.G / 2 - 6;
          else cx = rowLen ? X0 + (rowLen - 1) * g.U + g.W + g.G / 2 + 6 : X0 + g.valOff + g.VW / 2;
        } else {
          const P = pos.get(to);
          if (!P) continue;
          key = 'n:' + to;
          cx = P.x + g.valOff + g.VW / 2;
          where = P.where;
        }
        if (!map.has(key)) map.set(key, { names: [], to, cx, where, P: to == null ? null : pos.get(to) });
        map.get(key).names.push(name);
      }
      return [...map.values()];
    }

    /** Ingombro di uno stato (x con la casella 0 in x = 0). */
    measure(st, g) {
      const Y = { float: -1000, row: 0, drop: 1000 };
      const pos = this.place(st, g, 0, Y);
      let minX = 0;
      let maxX = g.W;
      for (const P of pos.values()) {
        minX = Math.min(minX, P.x);
        maxX = Math.max(maxX, P.x + g.W);
      }
      const links = this.links(st, pos, g);
      let ptrLines = 0;
      let floatLines = 0;
      for (const gr of this.groups(st, pos, g, 0)) {
        const w = Math.max(...gr.names.map(textW));
        minX = Math.min(minX, gr.cx - w / 2);
        maxX = Math.max(maxX, gr.cx + w / 2);
        if (gr.where === 'float') floatLines = Math.max(floatLines, gr.names.length);
        else ptrLines = Math.max(ptrLines, gr.names.length);
      }
      return {
        minX,
        maxX,
        ptrLines,
        floatLines,
        arcAbove: links.some((l) => l.arc === 'above'),
        arcBelow: links.some((l) => l.arc === 'below'),
        hasFloat: Object.keys(st.float || {}).length > 0,
        hasDrop: (st.drop || []).length > 0,
      };
    }

    extent(states, g) {
      const e = { minX: 0, maxX: 0, ptrLines: 0, floatLines: 0, arcAbove: false, arcBelow: false, hasFloat: false, hasDrop: false };
      for (const st of states) {
        const m = this.measure(st, g);
        e.minX = Math.min(e.minX, m.minX);
        e.maxX = Math.max(e.maxX, m.maxX);
        e.ptrLines = Math.max(e.ptrLines, m.ptrLines);
        e.floatLines = Math.max(e.floatLines, m.floatLines);
        for (const k of ['arcAbove', 'arcBelow', 'hasFloat', 'hasDrop']) e[k] = e[k] || m[k];
      }
      const pad = 12;
      e.X0 = pad - e.minX;
      e.width = Math.ceil(e.maxX - e.minX + 2 * pad);
      let y = 8;
      if (e.floatLines) {
        e.Yfptr = y;
        y += e.floatLines * LINE + 20;
      }
      e.Yfloat = y;
      if (e.hasFloat) y += g.H + 36;
      if (e.arcAbove) y += ARC + 6;
      e.Yrow = y;
      y += g.H;
      if (e.arcBelow) y += ARC + 6;
      e.Ydrop = y + 28;
      if (e.hasDrop) y += 28 + g.H;
      e.Yptr = y + 4;
      if (e.ptrLines) y += 4 + 18 + e.ptrLines * LINE;
      e.height = Math.ceil(y + 10);
      return e;
    }

    /* -------------------------------------------------------------- disegno */

    render(st, frame, stepper, fromResize) {
      this.last = { st, frame, stepper };
      const g = this.geo();
      const frames = stepper && stepper.frames && stepper.frames.length ? stepper.frames : null;
      const key = frames || st;
      if (this.extKey !== key || this.extGeo !== g.name) {
        if (this.extGeo && this.extGeo !== g.name) this.reset();
        this.ext = this.extent(frames ? frames.map((f) => f.state) : [st], g);
        this.extKey = key;
        this.extGeo = g.name;
        this.shown = null;
      }
      const e = this.ext;
      this.svg.setAttribute('viewBox', `0 0 ${e.width} ${e.height}`);
      this.svg.setAttribute('width', e.width);
      this.svg.setAttribute('height', e.height);
      this.svg.setAttribute('aria-label', this.describe(st));

      const target = this.place(st, g, e.X0, { float: e.Yfloat, row: e.Yrow, drop: e.Ydrop });
      cancelAnimationFrame(this.raf);
      const from = this.shown;
      const dur = fromResize ? 0 : durationOf(this.root);
      let moving = false;
      if (from && dur > 0) {
        for (const [id, P] of target) {
          const F = from.get(id);
          if (F && (Math.abs(F.x - P.x) > 0.5 || Math.abs(F.y - P.y) > 0.5)) moving = true;
        }
      }
      if (!moving) {
        this.draw(st, target, g, e);
        this.shown = target;
        return;
      }
      const t0 = performance.now();
      const tick = (now) => {
        const t = Math.min(1, Math.max(0, (now - t0) / dur));
        const k = ease(t);
        const cur = new Map();
        for (const [id, P] of target) {
          const F = from.get(id);
          cur.set(id, F ? { x: F.x + (P.x - F.x) * k, y: F.y + (P.y - F.y) * k, where: P.where } : P);
        }
        this.draw(st, cur, g, e);
        this.shown = cur;
        if (t < 1) this.raf = requestAnimationFrame(tick);
        else this.shown = target;
      };
      tick(t0);
    }

    draw(st, pos, g, e) {
      const nodes = st.nodes || {};
      // nodi (persistenti: si spostano)
      const seen = new Set();
      for (const [id, P] of pos) {
        const n = nodes[id];
        seen.add(id);
        let el = this.nodeEls.get(id);
        if (!el) {
          el = this.makeNode(g);
          this.nodeEls.set(id, el);
          this.gNodes.append(el.g);
        }
        el.g.setAttribute('transform', `translate(${f1(P.x)} ${f1(P.y)})`);
        const cls = ['ll-node'];
        for (const c of [].concat(n.cls || [])) cls.push('is-' + c);
        if (n.sentinel) cls.push('is-sentinel');
        el.g.setAttribute('class', cls.join(' '));
        el.val.textContent = n.sentinel ? 'sent' : n.val == null ? '' : String(n.val);
      }
      for (const [id, el] of this.nodeEls) {
        if (!seen.has(id)) {
          el.g.remove();
          this.nodeEls.delete(id);
        }
      }

      // frecce dei campi next / prev
      const L = [];
      for (const l of this.links(st, pos, g)) {
        if (l.nil) {
          L.push(s('path', { class: 'll-ground' + (l.hot ? ' is-hot' : ''), d: groundD(l.F.x, pos.get(l.id).y + g.H / 2, g.doubly ? 0.8 : 1) }));
          continue;
        }
        const hot = l.hot ? ' is-hot' : '';
        L.push(s('path', { class: 'll-link' + hot, d: pathD(l.pts) }));
        L.push(s('path', { class: 'll-tip' + hot, d: headD(l.pts) }));
        L.push(s('circle', { class: 'll-dot' + hot, cx: f1(l.F.x), cy: f1(l.F.y), r: 3 }));
      }
      this.gLinks.replaceChildren(...L);

      // puntatori con nome
      const P = [];
      const hotNames = new Set(st.hot || []);
      for (const gr of this.groups(st, pos, g, e.X0)) {
        const hot = gr.names.some((nm) => hotNames.has(nm));
        const cls = hot ? ' is-hot' : '';
        if (gr.where === 'float') {
          const base = e.Yfptr + 12;
          gr.names.forEach((nm, k) => P.push(...this.label(nm, gr.cx, base + k * LINE, hotNames.has(nm))));
          const y1 = e.Yfptr + gr.names.length * LINE + 4;
          const pts = [[gr.cx, y1], [gr.cx, gr.P.y - 2]];
          P.push(s('path', { class: 'll-parrow' + cls, d: pathD(pts, 0, 4) }), s('path', { class: 'll-ptip' + cls, d: headD(pts, 6) }));
          continue;
        }
        const top = e.Yptr;
        if (gr.where === 'nil') {
          P.push(s('path', { class: 'll-pground' + cls, d: groundD(gr.cx, top + 10, 0.85) }));
        } else {
          const pts = [[gr.cx, top + 16], [gr.cx, gr.P.y + g.H + 2]];
          P.push(s('path', { class: 'll-parrow' + cls, d: pathD(pts, 0, 4) }), s('path', { class: 'll-ptip' + cls, d: headD(pts, 6) }));
        }
        gr.names.forEach((nm, k) => P.push(...this.label(nm, gr.cx, top + 30 + k * LINE, hotNames.has(nm))));
      }
      this.gPtrs.replaceChildren(...P);
    }

    label(text, cx, baseline, hot) {
      const out = [];
      if (hot) {
        const w = textW(text) - 2;
        out.push(s('rect', { class: 'll-hl', x: f1(cx - w / 2), y: f1(baseline - 11.5), width: f1(w), height: 15, rx: 2 }));
      }
      out.push(s('text', { class: 'll-pname', x: f1(cx), y: f1(baseline) }, text));
      return out;
    }

    makeNode(g) {
      const kids = [s('rect', { class: 'll-box', width: g.W, height: g.H, rx: 4 })];
      const v0 = g.valOff;
      const hatch = [];
      for (let k = 1; k <= 4; k++) {
        const x = v0 + (g.VW * k) / 5;
        hatch.push(`M${f1(x - 6)} ${g.H - 3}L${f1(x + 6)} 3`);
      }
      kids.push(s('path', { class: 'll-hatch', d: hatch.join('') }));
      if (g.doubly) kids.push(s('line', { class: 'll-sep', x1: g.PW, x2: g.PW, y1: 0, y2: g.H }));
      kids.push(s('line', { class: 'll-sep', x1: v0 + g.VW, x2: v0 + g.VW, y1: 0, y2: g.H }));
      const val = s('text', { class: 'll-val', x: v0 + g.VW / 2, y: g.H / 2 + 1 });
      kids.push(val);
      return { g: s('g', { class: 'll-node' }, ...kids), val };
    }

    /** Descrizione per chi usa un lettore di schermo: head → 8 → 15 → nullptr. */
    describe(st) {
      const nodes = st.nodes || {};
      const ptrs = st.ptrs || {};
      const start = 'head' in ptrs ? ptrs.head : (st.row || [])[0];
      const parts = [];
      const seen = new Set();
      let id = start;
      while (id != null && nodes[id] && !seen.has(id)) {
        seen.add(id);
        parts.push(nodes[id].sentinel ? 'sentinella' : String(nodes[id].val));
        id = nodes[id].next;
      }
      parts.push(id == null ? 'nullptr' : 'di nuovo ' + (nodes[id] && nodes[id].sentinel ? 'la sentinella' : 'il primo nodo'));
      const extra = Object.entries(ptrs)
        .filter(([k]) => k !== 'head')
        .map(([k, v]) => `${k} ${v == null ? '= nullptr' : '→ ' + (nodes[v] ? (nodes[v].sentinel ? 'sentinella' : nodes[v].val) : '?')}`);
      return `${this.o.ariaLabel}: ${'head' in ptrs ? 'head → ' : ''}${parts.join(' → ')}${extra.length ? '. ' + extra.join(', ') : ''}`;
    }
  };

  /* ======================================================= StackView */

  ASD.viz.StackView = class StackView {
    constructor(host, o = {}) {
      this.o = Object.assign({ ariaLabel: 'Pila' }, o);
      this.root = h('div.str-stacks', { role: 'img', 'aria-label': this.o.ariaLabel });
      host.append(this.root);
    }

    reset() {}

    rowsOf(c) {
      let r = c.a ? c.a.length : Math.max((c.items || []).length, c.cap || 0);
      for (const v of Object.values(c.ptrs || {})) if (v != null) r = Math.max(r, v + 1);
      return Math.max(r, 1);
    }

    render(st, frame, stepper) {
      const cols = st.cols || [st];
      let rows = 0;
      const states = stepper && stepper.frames && stepper.frames.length ? stepper.frames.map((f) => f.state) : [st];
      for (const x of states) for (const c of x.cols || [x]) rows = Math.max(rows, this.rowsOf(c));
      this.root.replaceChildren(...cols.map((c) => this.col(c, rows)));
      this.root.setAttribute('aria-label', this.describe(cols));
    }

    col(c, rows) {
      const arr = c.a || null;
      const n = arr ? (c.n != null ? c.n : arr.length) : (c.items || []).length;
      const vals = arr || c.items || [];
      const cells = arr ? arr.length : c.cap || (c.items || []).length;
      const ptrAt = new Map();
      for (const [name, idx] of Object.entries(c.ptrs || {})) {
        if (idx == null) continue;
        if (!ptrAt.has(idx)) ptrAt.set(idx, []);
        ptrAt.get(idx).push(name);
      }
      const list = h('div.str-cells');
      for (let i = rows - 1; i >= 0; i--) {
        const row = h('div.str-row');
        const real = i < cells || (!arr && i < vals.length);
        row.append(h('span.str-idx', { text: real ? String(i) : '' }));
        const cls = ['str-cell'];
        let text = '';
        if (!real) cls.push('is-ghost');
        else if (i < n) text = String(vals[i]);
        else if (arr && vals[i] != null) {
          cls.push('is-stale');
          text = String(vals[i]);
        } else cls.push('is-free');
        for (const k of [].concat((c.marks || {})[i] || [])) cls.push('is-' + k);
        row.append(h('span', { class: cls.join(' '), text }));
        const names = ptrAt.get(i);
        row.append(h('span.str-ptr', { text: names ? '← ' + names.join(', ') : '' }));
        list.append(row);
      }
      if (!arr && !vals.length && !c.cap) {
        const first = list.lastChild;
        first.children[1].className = 'str-cell is-empty';
        first.children[1].textContent = 'vuota';
      }
      const fig = h('figure.str-col', list);
      if (c.label || c.note) {
        const cap = h('figcaption.str-cap', c.label ? h('code', { text: c.label }) : null, c.note ? h('span', { text: ' ' + c.note }) : null);
        fig.append(cap);
      }
      return fig;
    }

    describe(cols) {
      return cols
        .map((c) => {
          const vals = c.a ? c.a.slice(0, c.n != null ? c.n : c.a.length) : c.items || [];
          return `${c.label || this.o.ariaLabel}: ${vals.length ? 'dal fondo alla cima ' + vals.join(', ') : 'vuota'}`;
        })
        .join('; ');
    }
  };

  /* ===================================================== CircularView */

  ASD.viz.CircularView = class CircularView {
    constructor(host, o = {}) {
      this.o = Object.assign({ ariaLabel: 'Array circolare della coda' }, o);
      this.svg = s('svg', { class: 'str-circ-svg', role: 'img', 'aria-label': this.o.ariaLabel });
      this.root = h('div.str-circ', this.svg);
      this.host = host;
      host.append(this.root);
    }

    reset() {}

    render(st) {
      const a = st.a || [];
      const cap = a.length;
      const narrow = (this.host.clientWidth || 600) < 420;
      const CW = narrow ? 40 : 48;
      const CH = 40;
      const padX = 30;
      const x0 = padX;
      const y0 = 26;
      const W = padX * 2 + cap * CW;
      const inQueue = new Map();
      for (let k = 0; k < (st.n || 0); k++) inQueue.set((st.head + k) % cap, k + 1);

      const out = [];
      for (let i = 0; i < cap; i++) {
        const x = x0 + i * CW;
        const cls = ['str-ccell'];
        const inside = inQueue.has(i);
        if (!inside && a[i] != null) cls.push('is-stale');
        if (!inside && a[i] == null) cls.push('is-free');
        for (const k of [].concat((st.marks || {})[i] || [])) cls.push('is-' + k);
        const gCell = s('g', { class: cls.join(' ') });
        gCell.append(s('rect', { x: x, y: y0, width: CW, height: CH }));
        if (a[i] != null) gCell.append(s('text', { class: 'str-cval', x: x + CW / 2, y: y0 + CH / 2 + 1 }, String(a[i])));
        out.push(gCell);
        if (inside) out.push(s('text', { class: 'str-order', x: x + CW / 2, y: y0 - 8 }, inQueue.get(i) + '°'));
        out.push(s('text', { class: 'str-cidx', x: x + CW / 2, y: y0 + CH + 14 }, String(i)));
      }

      // puntatori sotto le caselle
      const at = new Map();
      for (const [name, idx] of Object.entries(st.ptrs || {})) {
        if (idx == null) continue;
        if (!at.has(idx)) at.set(idx, []);
        at.get(idx).push(name);
      }
      const ptrTop = y0 + CH + 22;
      let lines = 1;
      for (const [idx, names] of at) {
        const cx = x0 + idx * CW + CW / 2;
        const pts = [[cx, ptrTop + 16], [cx, ptrTop + 1]];
        out.push(s('path', { class: 'str-parrow', d: pathD(pts, 0, 4) }), s('path', { class: 'str-ptip', d: headD(pts, 6) }));
        names.forEach((nm, k) => out.push(s('text', { class: 'str-pname', x: cx, y: ptrTop + 29 + k * LINE }, nm)));
        lines = Math.max(lines, names.length);
      }

      // l'arco che riporta dall'ultima casella alla prima
      const yb = ptrTop + 22 + 2 * LINE;
      const xr = x0 + cap * CW;
      const ym = y0 + CH / 2;
      const loop = [[xr, ym], [xr + 16, ym], [xr + 16, yb], [x0 - 16, yb], [x0 - 16, ym], [x0, ym]];
      const hot = st.wrap ? ' is-hot' : '';
      out.unshift(s('path', { class: 'str-wrap' + hot, d: pathD(loop, 8, 5) }), s('path', { class: 'str-wtip' + hot, d: headD(loop, 7) }));
      const lbl = `dopo a[${cap - 1}] viene a[0]`;
      const lw = lbl.length * 6.4 + 12;
      out.push(s('rect', { class: 'str-wbg', x: (x0 + xr) / 2 - lw / 2, y: yb - 8, width: lw, height: 16, rx: 3 }));
      out.push(s('text', { class: 'str-wlabel' + hot, x: (x0 + xr) / 2, y: yb + 1 }, lbl));

      const H = yb + 14;
      this.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      this.svg.setAttribute('width', W);
      this.svg.setAttribute('height', H);
      this.svg.replaceChildren(...out);
      const q = [];
      for (let k = 0; k < (st.n || 0); k++) q.push(a[(st.head + k) % cap]);
      this.svg.setAttribute(
        'aria-label',
        `${this.o.ariaLabel}: capacità ${cap}, ${q.length ? 'in coda dal primo all\'ultimo ' + q.join(', ') : 'coda vuota'}` +
          Object.entries(st.ptrs || {})
            .map(([k, v]) => `, ${k} = ${v}`)
            .join('')
      );
    }
  };
})();
