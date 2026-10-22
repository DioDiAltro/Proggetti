/* ASD a quadretti — vista di una tabella hash (HTML).

   new ASD.viz.HashView(el, { mode: 'chain' | 'open' })
   view.render({
     mode: 'open',                      // facoltativo: altrimenti quello del costruttore
     t: [[24, 17, 10], [], ...],        // 'chain': per ogni casella la sua lista, dalla testa
     t: [10, null, 'DEL', 24, ...],     // 'open': chiave, null (vuota) o 'DEL' (cancellata,
                                        //  la "tombstone"): ASD.viz.HashView.DEL
     marks: { 3: 'compare' },           // classi delle caselle
     nodeMarks: { '3:1': 'found' },     // 'chain': classi dei nodi, 'casella:posizione'
     probes: [3, 4, 5],                 // caselle ispezionate, in ordine: numerate 1, 2, 3...
     key: { html: 'k = 31, h(k) = 3' }  // la chiave in gioco, scritta sopra la tabella
   });
   Classi: compare (ispezione in corso), found / done, swap, new / key, out.
   La tabella è in verticale (una riga per casella, le liste di trabocco verso
   destra): così resta leggibile anche sul telefono; una lista lunga scorre di lato. */
(function () {
  'use strict';

  const { h } = ASD;
  const DEL = 'DEL';

  function ground() {
    const svg = ASD.s('svg', { class: 'hs-ground', viewBox: '0 0 20 22', width: 20, height: 22, 'aria-hidden': 'true', focusable: 'false' });
    svg.append(ASD.s('path', { d: ASD.viz.groundD ? ASD.viz.groundD(10, 11, 0.95) : 'M10 3V12M4 12H16M6 15.5H14M8 19H12' }));
    return svg;
  }

  ASD.viz.HashView = class HashView {
    constructor(host, o = {}) {
      this.o = Object.assign({ mode: 'chain', ariaLabel: 'Tabella hash' }, o);
      this.keyEl = h('p.hs-key', { 'aria-live': 'off' });
      this.list = h('ol.hs-table', { 'aria-label': this.o.ariaLabel });
      this.root = h('div.hs', this.keyEl, this.list);
      host.append(this.root);
    }

    reset() {}

    render(st) {
      const mode = st.mode || this.o.mode;
      const t = st.t || [];
      this.root.className = 'hs hs-' + mode;
      this.keyEl.innerHTML = st.key ? st.key.html : '&nbsp;';
      const marks = st.marks || {};
      const nodeMarks = st.nodeMarks || {};
      const order = new Map();
      (st.probes || []).forEach((i, k) => {
        if (!order.has(i)) order.set(i, k + 1);
      });
      const rows = [];
      for (let i = 0; i < t.length; i++) {
        const li = h('li.hs-row');
        li.append(h('span.hs-probe', order.has(i) ? { text: String(order.get(i)), title: 'ispezione n. ' + order.get(i) } : null));
        li.append(h('span.hs-idx', { text: String(i) }));
        const cls = ['hs-slot'];
        for (const k of [].concat(marks[i] || [])) cls.push('is-' + k);
        if (order.has(i)) cls.push('is-probed');
        if (mode === 'chain') {
          const chain = t[i] || [];
          const slot = h('span', { class: cls.join(' ') });
          if (chain.length) slot.append(h('span.hs-dot', { 'aria-hidden': 'true' }));
          else slot.append(ground(), h('span.visually-hidden', { text: 'lista vuota' }));
          const line = h('span.hs-chain', slot);
          chain.forEach((k, pos) => {
            const ncls = ['hs-node'];
            for (const c of [].concat(nodeMarks[i + ':' + pos] || [])) ncls.push('is-' + c);
            const next = h('span.hs-next');
            if (pos === chain.length - 1) next.append(ground());
            else next.append(h('span.hs-dot', { 'aria-hidden': 'true' }));
            line.append(h('span.hs-arrow', { 'aria-hidden': 'true' }), h('span', { class: ncls.join(' ') }, h('span.hs-k', { text: String(k) }), next));
          });
          li.append(line);
        } else {
          const v = t[i];
          if (v === DEL) cls.push('is-tomb');
          if (v == null) cls.push('is-empty');
          const slot = h('span', { class: cls.join(' ') });
          if (v === DEL) slot.append(h('span', { text: 'canc.' }), h('span.visually-hidden', { text: ' (cancellata)' }));
          else if (v == null) slot.append(h('span.visually-hidden', { text: 'vuota' }));
          else slot.append(h('span', { text: String(v) }));
          li.append(slot);
        }
        rows.push(li);
      }
      this.list.replaceChildren(...rows);
    }
  };

  ASD.viz.HashView.DEL = DEL;
})();
