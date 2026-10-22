/* ASD a quadretti — vista di un albero (SVG).

   new ASD.viz.TreeView(el, { layout: 'binary' | 'tidy', shape: 'circle' | 'box' })
   view.render({
     root: 'a',                       // oppure roots: ['a', 'x'] per una foresta
     nodes: {
       a: { label: '8', kids: ['b', 'c'], cls: 'active', sub: 'i = 0', note: 'n/2' },
       b: { label: '3', kids: [null, 'd'] },     // binario: [sinistro, destro]
       ...
     },
     edges: { 'a>b': 'path' }         // classi facoltative sugli archi
   });

   layout 'binary': x = posizione in ordine simmetrico (in-order), come si
   disegna un albero binario di ricerca; 'tidy': i genitori stanno al centro dei
   figli (alberi di ricorsione, alberi n-ari).
   Classi dei nodi: active, compare, swap, done, found, key, new, visited, out. */
(function () {
  'use strict';

  const { h, s } = ASD;

  ASD.viz.TreeView = class TreeView {
    constructor(host, o = {}) {
      this.o = Object.assign({ layout: 'binary', shape: 'circle', r: 18, boxH: 30, minBoxW: 44, levelH: 66, gap: 14, pad: 24 }, o);
      this.svg = s('svg', { role: 'img', 'aria-label': this.o.ariaLabel || 'Albero' });
      this.gEdges = s('g', { class: 'tv-edges' });
      this.gNodes = s('g', { class: 'tv-nodes' });
      this.svg.append(this.gEdges, this.gNodes);
      this.root = h('div.tv', this.svg);
      host.append(this.root);
      this.nodeEls = new Map();
      this.edgeEls = new Map();
    }

    reset() {
      this.gEdges.replaceChildren();
      this.gNodes.replaceChildren();
      this.nodeEls.clear();
      this.edgeEls.clear();
    }

    nodeWidth(n) {
      if (this.o.shape !== 'box') return this.o.r * 2;
      return Math.max(this.o.minBoxW, String(n.label).length * 8.2 + 18);
    }

    layout(st) {
      const nodes = st.nodes || {};
      const roots = st.roots || (st.root != null ? [st.root] : []);
      const pos = new Map();
      let maxDepth = 0;
      let unit = 0;
      for (const id in nodes) unit = Math.max(unit, this.nodeWidth(nodes[id]));
      unit += this.o.gap;

      if (this.o.layout === 'binary') {
        let rank = 0;
        const visit = (id, depth) => {
          if (id == null || !nodes[id]) return;
          const k = nodes[id].kids || [];
          visit(k[0], depth + 1);
          pos.set(id, { x: rank++ * unit, depth });
          maxDepth = Math.max(maxDepth, depth);
          visit(k[1], depth + 1);
        };
        for (const r of roots) {
          visit(r, 0);
          rank += 0.5;
        }
      } else {
        let slot = 0;
        const visit = (id, depth) => {
          const n = nodes[id];
          maxDepth = Math.max(maxDepth, depth);
          const kids = (n.kids || []).filter((k) => k != null && nodes[k]);
          if (!kids.length) {
            pos.set(id, { x: slot++ * unit, depth });
            return;
          }
          for (const k of kids) visit(k, depth + 1);
          const xs = kids.map((k) => pos.get(k).x);
          pos.set(id, { x: (Math.min(...xs) + Math.max(...xs)) / 2, depth });
        };
        for (const r of roots) if (nodes[r]) visit(r, 0);
      }
      return { pos, maxDepth, unit };
    }

    render(st) {
      const nodes = st.nodes || {};
      const { pos, maxDepth, unit } = this.layout(st);
      const pad = this.o.pad;
      const halfH = this.o.shape === 'box' ? this.o.boxH / 2 : this.o.r;
      let maxX = 0;
      for (const p of pos.values()) maxX = Math.max(maxX, p.x);
      const hasSub = Object.values(nodes).some((n) => n.sub);
      const hasNote = Object.values(nodes).some((n) => n.note);
      const W = maxX + unit + pad * 2 + (hasNote ? 40 : 0);
      const H = maxDepth * this.o.levelH + halfH * 2 + pad * 2 + (hasSub ? 16 : 0);
      this.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      this.svg.setAttribute('width', W);
      this.svg.setAttribute('height', H);
      const X = (p) => pad + unit / 2 + p.x;
      const Y = (p) => pad + halfH + p.depth * this.o.levelH;

      // archi
      const seenE = new Set();
      for (const [id, n] of Object.entries(nodes)) {
        if (!pos.has(id)) continue;
        for (const k of n.kids || []) {
          if (k == null || !pos.has(k)) continue;
          const key = id + '>' + k;
          seenE.add(key);
          let ln = this.edgeEls.get(key);
          if (!ln) {
            ln = s('line', { class: 'tv-edge' });
            this.edgeEls.set(key, ln);
            this.gEdges.append(ln);
          }
          const a = pos.get(id);
          const b = pos.get(k);
          ln.setAttribute('x1', X(a));
          ln.setAttribute('y1', Y(a));
          ln.setAttribute('x2', X(b));
          ln.setAttribute('y2', Y(b));
          const cls = st.edges && st.edges[key];
          ln.setAttribute('class', 'tv-edge' + (cls ? ' is-' + cls : ''));
        }
      }
      for (const [key, ln] of this.edgeEls) {
        if (!seenE.has(key)) {
          ln.remove();
          this.edgeEls.delete(key);
        }
      }

      // nodi
      const seenN = new Set();
      for (const [id, n] of Object.entries(nodes)) {
        const p = pos.get(id);
        if (!p) continue;
        seenN.add(id);
        let g = this.nodeEls.get(id);
        if (!g) {
          g = this.makeNode();
          this.nodeEls.set(id, g);
          this.gNodes.append(g.el);
        }
        const w = this.nodeWidth(n);
        if (this.o.shape === 'box') {
          g.shape.setAttribute('x', -w / 2);
          g.shape.setAttribute('y', -this.o.boxH / 2);
          g.shape.setAttribute('width', w);
          g.shape.setAttribute('height', this.o.boxH);
        }
        g.el.setAttribute('transform', `translate(${X(p)} ${Y(p)})`);
        g.label.textContent = String(n.label);
        g.sub.textContent = n.sub != null ? String(n.sub) : '';
        g.sub.setAttribute('y', halfH + 13);
        g.note.textContent = n.note != null ? String(n.note) : '';
        g.note.setAttribute('x', w / 2 + 6);
        const cls = ['tv-node'];
        for (const c of [].concat(n.cls || [])) cls.push('is-' + c);
        g.el.setAttribute('class', cls.join(' '));
      }
      for (const [id, g] of this.nodeEls) {
        if (!seenN.has(id)) {
          g.el.remove();
          this.nodeEls.delete(id);
        }
      }
    }

    makeNode() {
      const shape = this.o.shape === 'box' ? s('rect', { rx: 5 }) : s('circle', { r: this.o.r });
      const label = s('text', { x: 0, y: 0 });
      const sub = s('text', { class: 'tv-sub', x: 0 });
      const note = s('text', { class: 'tv-note', y: 0, 'text-anchor': 'start' });
      note.style.textAnchor = 'start';
      const el = s('g', { class: 'tv-node' }, shape, label, sub, note);
      return { el, shape, label, sub, note };
    }
  };

  /** Utilità: da un albero binario fatto di oggetti {val, left, right} allo stato per la vista. */
  ASD.viz.treeFromNodes = function (rootObj, opts = {}) {
    const nodes = {};
    let next = 0;
    const ids = new Map();
    const idOf = (n) => {
      if (!ids.has(n)) ids.set(n, n.id != null ? String(n.id) : 'n' + next++);
      return ids.get(n);
    };
    const visit = (n) => {
      if (!n) return null;
      const id = idOf(n);
      const l = visit(n.left);
      const r = visit(n.right);
      nodes[id] = { label: n.val, kids: [l, r], cls: opts.cls ? opts.cls(n) : n.cls };
      return id;
    };
    const root = visit(rootObj);
    return { root, nodes };
  };
})();
