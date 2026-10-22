/* ASD a quadretti — vista di un array: barre (per gli ordinamenti) o celle.

   new ASD.viz.ArrayView(el, { mode: 'bars' | 'cells', label, height })
   view.render({
     a:      [5, 2, null, 6],        // valori; null = cella vuota ("buco")
     ids:    [0, 1, 2, 3],           // identità degli elementi: se ci sono, gli
                                     // spostamenti si vedono come movimenti
     marks:  { 0: 'compare', 3: ['done'] },  // compare | swap | done | key | pivot | min | active
     ptrs:   { i: 1, j: 0 },         // frecce con nome sotto le celle
     range:  [lo, hi],               // le celle fuori dall'intervallo si attenuano
     float:  { value: 7, id: 9, at: 2, label: 'key' }, // elemento sollevato sopra la cella `at`
     brackets: [{ from: 0, to: 3 }], // parentesi sotto un sotto-array
     max:    50                      // scala delle barre (altrimenti il massimo dei valori)
   });
   Gli stati sono classi CSS (is-compare, ...) definite in components.css. */
(function () {
  'use strict';

  const { h } = ASD;

  ASD.viz.ArrayView = class ArrayView {
    constructor(host, o = {}) {
      this.o = Object.assign({ mode: 'bars', height: 170, maxSlot: 58, minSlot: 16, showIndex: true }, o);
      this.root = h('div.av' + (this.o.mode === 'cells' ? '.cells' : ''));
      if (this.o.mode !== 'cells') this.root.style.setProperty('--av-h', this.o.height + 'px');
      if (this.o.label) this.root.append(h('div.av-label', { text: this.o.label }));
      this.floatZone = h('div.av-float');
      this.track = h('div.av-track');
      this.axis = h('div.av-axis', { 'aria-hidden': 'true' });
      this.ptrRow = h('div.av-ptrs', { 'aria-hidden': 'true' });
      this.root.append(this.floatZone, this.track, this.axis, this.ptrRow);
      if (!this.o.showIndex) this.axis.hidden = true;
      host.append(this.root);
      this.items = new Map();
      this.holes = [];
      this.last = null;
      if ('ResizeObserver' in window) {
        let w = host.clientWidth;
        this.ro = new ResizeObserver(() => {
          const nw = host.clientWidth;
          if (this.last && Math.abs(nw - w) > 1) {
            w = nw;
            this.render(this.last, true);
          }
        });
        this.ro.observe(host);
      }
    }

    reset() {
      for (const it of this.items.values()) it.el.remove();
      this.items.clear();
    }

    render(st, fromResize) {
      this.last = st;
      const a = st.a || [];
      const n = a.length;
      const ids = st.ids || a.map((_, i) => i);
      const avail = this.root.parentElement ? this.root.parentElement.clientWidth : 600;
      const slot = Math.max(this.o.minSlot, Math.min(this.o.maxSlot, (avail || 600) / Math.max(n, 1)));
      // larghezza esatta dell'array, centrato; se non ci sta, il palco scorre di lato
      this.root.style.width = slot * n + 'px';
      this.root.style.marginInline = 'auto';
      const xs = (i) => i * slot;

      const vals = a.filter((v) => v != null);
      if (st.float) vals.push(st.float.value);
      const max = st.max || Math.max(1, ...vals.map((v) => Math.abs(v)));
      this.root.classList.toggle('small-vals', slot < 24);
      this.root.classList.toggle('has-float', Boolean(st.float) || Boolean(this.o.float));

      const marks = st.marks || {};
      const inRange = (i) => !st.range || (i >= st.range[0] && i <= st.range[1]);
      const seen = new Set();

      const place = (id, value, i, extra) => {
        let it = this.items.get(id);
        const fresh = !it;
        if (fresh) {
          it = this.makeItem();
          this.items.set(id, it);
          this.track.append(it.el);
          it.el.style.transition = 'none';
        }
        seen.add(id);
        it.el.style.width = slot + 'px';
        it.el.style.setProperty('--x', xs(i) + 'px');
        it.el.style.setProperty('--y', (extra && extra.lift ? -this.liftPx() : 0) + 'px');
        if (this.o.mode === 'cells') it.cell.textContent = String(value);
        else {
          it.bar.style.setProperty('--h', (Math.abs(value) / max) * 100 + '%');
          it.val.textContent = String(value);
        }
        const cls = ['av-item'];
        const m = extra && extra.mark ? extra.mark : marks[i];
        for (const k of [].concat(m || [])) cls.push('is-' + k);
        if (!(extra && extra.lift) && !inRange(i)) cls.push('is-out');
        it.el.className = cls.join(' ');
        if (fresh || fromResize) {
          void it.el.offsetWidth;
          it.el.style.transition = '';
        }
      };

      a.forEach((v, i) => {
        if (v != null) place(ids[i], v, i);
      });
      if (st.float) place(st.float.id != null ? st.float.id : 'float', st.float.value, st.float.at, { lift: true, mark: st.float.mark || 'key' });

      for (const [id, it] of this.items) {
        if (!seen.has(id)) {
          it.el.remove();
          this.items.delete(id);
        }
      }

      // buchi (celle vuote)
      const holeIdx = [];
      a.forEach((v, i) => v == null && holeIdx.push(i));
      while (this.holes.length < holeIdx.length) {
        const hl = h('div.av-hole');
        this.track.append(hl);
        this.holes.push(hl);
      }
      this.holes.forEach((hl, k) => {
        if (k < holeIdx.length) {
          hl.hidden = false;
          const w = this.o.mode === 'cells' ? Math.min(40, slot * 0.88) : Math.min(46, slot * 0.72);
          hl.style.width = w + 'px';
          hl.style.left = (slot - w) / 2 + 'px';
          hl.style.setProperty('--x', xs(holeIdx[k]) + 'px');
        } else hl.hidden = true;
      });

      // etichetta dell'elemento sollevato
      if (!this.floatTag) {
        this.floatTag = h('div.av-float-tag');
        this.floatZone.append(this.floatTag);
      }
      if (st.float && st.float.label) {
        this.floatTag.hidden = false;
        this.floatTag.textContent = st.float.label;
        this.floatTag.style.setProperty('--x', xs(st.float.at) + slot / 2 + 8 + 'px');
      } else this.floatTag.hidden = true;

      // indici
      if (this.o.showIndex) {
        const key = n + ':' + slot;
        if (this.axisKey !== key) {
          this.axisKey = key;
          this.axis.replaceChildren(
            ...a.map((_, i) => h('span.av-idx', { text: String(i), style: { left: xs(i) + 'px', width: slot + 'px' } }))
          );
        }
      }

      // parentesi sotto i sotto-array
      for (const b of this.axis.querySelectorAll('.av-range')) b.remove();
      for (const br of st.brackets || []) {
        this.axis.append(
          h('span.av-range', { style: { left: xs(br.from) + 3 + 'px', width: (br.to - br.from + 1) * slot - 6 + 'px', top: '15px' } })
        );
      }

      this.renderPtrs(st.ptrs || {}, xs, slot, n);
    }

    makeItem() {
      if (this.o.mode === 'cells') {
        const cell = h('div.av-cell');
        return { el: h('div.av-item', cell), cell };
      }
      const val = h('span.av-val');
      const bar = h('div.av-bar');
      return { el: h('div.av-item', val, bar), bar, val };
    }

    liftPx() {
      return this.o.mode === 'cells' ? 52 : 58;
    }

    renderPtrs(ptrs, xs, slot, n) {
      const groups = new Map();
      for (const [name, idx] of Object.entries(ptrs)) {
        if (idx == null || idx < -1 || idx > n) continue;
        if (!groups.has(idx)) groups.set(idx, []);
        groups.get(idx).push(name);
      }
      const rowsEnd = [];
      const els = [];
      const sorted = [...groups.entries()].sort((p, q) => p[0] - q[0]);
      for (const [idx, names] of sorted) {
        const text = names.join(',');
        const w = Math.max(slot, text.length * 7.5 + 6);
        const left = xs(idx) + slot / 2 - w / 2;
        let row = rowsEnd.findIndex((end) => end <= left);
        if (row === -1) {
          row = rowsEnd.length;
          rowsEnd.push(0);
        }
        rowsEnd[row] = left + w + 2;
        els.push(h('span.av-ptr', { text, style: { left: left + 'px', width: w + 'px', top: row * 18 + 'px' } }));
      }
      this.ptrRow.className = 'av-ptrs' + (rowsEnd.length > 1 ? ' rows-' + Math.min(3, rowsEnd.length) : '');
      this.ptrRow.replaceChildren(...els);
    }
  };
})();
