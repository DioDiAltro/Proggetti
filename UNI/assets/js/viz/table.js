/* ASD a quadretti — vista di una tabella di programmazione dinamica (HTML).

   new ASD.viz.TableView(el, { label, ariaLabel })
   view.render({
     rows:   ['0', '1', '2'],              // intestazioni di riga: testo, oppure
             [{ label: 'B', sub: '1' }],   //   etichetta grande + riga piccola sotto
     cols:   ['0', '1', '2', '3'],         // intestazioni di colonna (stesso formato)
     corner: 'i \\ w',                     // testo nell'angolo in alto a sinistra
     cells:  [[0, 0, 0, 0],                // valori: numeri o testo ('∞', '–');
              [0, 1, null, null]],         //   null = cella ancora da calcolare (vuota)
     cur:    [1, 2],                       // la cella che si sta calcolando (blu pieno)
     deps:   [[0, 2], [0, 1]],             // le celle da cui dipende (evidenziatore)
     path:   [[2, 3], [1, 2]],             // cammino della ricostruzione (verde)
     marks:  { '1,2': 'key' },             // altri stati per cella (anche un array):
                                           //   compare | swap | done | key | new | out
     arrows: { '1,2': '↖' },               // freccia piccola nell'angolo (LCS: ↖ ↑ ←)
     rowMarks: { 1: 'key' },               // stati delle intestazioni di riga
     colMarks: { 2: 'compare' },           //   e di colonna (compare | done | key | out)
     label:  'K[i][w] = …'                 // riga di spiegazione sopra la tabella
   });

   Le chiavi delle celle sono 'riga,colonna' (ASD.viz.TableView.key(i, j)).
   La tabella scorre di lato dentro il suo contenitore (la prima colonna resta
   ferma) e la cella in calcolo viene sempre portata in vista.
   Gli stati sono classi CSS (is-active, is-compare, is-path, …) definite in
   assets/css/areas/tecniche.css; i colori vengono solo dai token. */
(function () {
  'use strict';

  const { h } = ASD;

  const key = (i, j) => i + ',' + j;

  function headParts(x) {
    if (x == null) return { label: '', sub: '' };
    if (typeof x === 'object') return { label: x.label == null ? '' : String(x.label), sub: x.sub == null ? '' : String(x.sub) };
    return { label: String(x), sub: '' };
  }

  function fmt(v) {
    if (v == null) return '';
    if (v === Infinity) return '∞';
    if (v === -Infinity) return '−∞';
    return String(v);
  }

  ASD.viz.TableView = class TableView {
    constructor(host, o = {}) {
      this.o = Object.assign({ label: null, ariaLabel: 'Tabella della programmazione dinamica' }, o);
      this.root = h('div.tc-tv');
      this.labelEl = h('p.tc-tv-label', { hidden: true });
      this.table = h('table.tc-tv-table');
      this.caption = h('caption.visually-hidden', { text: this.o.ariaLabel });
      this.table.append(this.caption);
      this.scroller = h('div.tc-tv-scroll', this.table);
      this.root.append(this.labelEl, this.scroller);
      host.append(this.root);
      this.shape = null;
      if ('ResizeObserver' in window) {
        this.ro = new ResizeObserver(() => this.updateScroll());
        this.ro.observe(this.scroller);
      }
    }

    reset() {
      this.shape = null;
      this.scroller.scrollLeft = 0;
    }

    /** Ricostruisce righe e colonne quando cambia la forma della tabella. */
    build(st) {
      const rows = st.rows || [];
      const cols = st.cols || [];
      const head = h('tr');
      this.cornerEl = h('th.tc-tv-corner', { scope: 'col' });
      head.append(this.cornerEl);
      this.colEls = cols.map((c) => {
        const p = headParts(c);
        const th = h('th.tc-tv-ch', { scope: 'col' }, h('span.tc-tv-hl', { text: p.label }), p.sub ? h('span.tc-tv-hs', { text: p.sub }) : null);
        head.append(th);
        return th;
      });
      const body = h('tbody');
      this.rowEls = [];
      this.cellEls = [];
      rows.forEach((r) => {
        const p = headParts(r);
        const th = h('th.tc-tv-rh', { scope: 'row' }, h('span.tc-tv-hl', { text: p.label }), p.sub ? h('span.tc-tv-hs', { text: p.sub }) : null);
        const tr = h('tr', th);
        const line = cols.map(() => {
          const ar = h('span.tc-tv-ar', { 'aria-hidden': 'true' });
          const v = h('span.tc-tv-v');
          const td = h('td.tc-tv-cell', ar, v);
          tr.append(td);
          return { td, ar, v };
        });
        this.rowEls.push(th);
        this.cellEls.push(line);
        body.append(tr);
      });
      this.table.replaceChildren(this.caption, h('thead', head), body);
    }

    render(st) {
      st = st || {};
      const sig = JSON.stringify([st.rows || [], st.cols || []]);
      if (sig !== this.shape) {
        this.build(st);
        this.shape = sig;
      }
      const label = st.label != null ? st.label : this.o.label;
      this.labelEl.hidden = !label;
      if (label) this.labelEl.innerHTML = label;
      this.cornerEl.textContent = st.corner || '';

      // stati di ogni cella
      const states = new Map();
      const add = (k, c) => {
        if (!states.has(k)) states.set(k, []);
        states.get(k).push(c);
      };
      for (const [k, v] of Object.entries(st.marks || {})) for (const c of [].concat(v)) add(k, c);
      for (const p of st.path || []) add(key(p[0], p[1]), 'path');
      for (const p of st.deps || []) add(key(p[0], p[1]), 'compare');
      if (st.cur) add(key(st.cur[0], st.cur[1]), 'active');

      const cells = st.cells || [];
      const arrows = st.arrows || {};
      this.cellEls.forEach((line, i) => {
        line.forEach((c, j) => {
          const val = cells[i] ? cells[i][j] : null;
          const k = key(i, j);
          const cls = ['tc-tv-cell'];
          if (val == null) cls.push('is-empty');
          else if (val === Infinity || val === '∞') cls.push('is-inf');
          const arrow = arrows[k] || '';
          if (arrow) cls.push('has-ar');
          for (const s of states.get(k) || []) cls.push('is-' + s);
          c.td.className = cls.join(' ');
          c.v.textContent = fmt(val);
          c.ar.textContent = arrow;
        });
      });

      const headState = (els, map) => {
        els.forEach((th, i) => {
          const base = th.classList.contains('tc-tv-rh') ? 'tc-tv-rh' : 'tc-tv-ch';
          const m = map && map[i];
          th.className = [base].concat([].concat(m || []).map((x) => 'is-' + x)).join(' ');
        });
      };
      headState(this.rowEls, st.rowMarks);
      headState(this.colEls, st.colMarks);

      this.updateScroll();
      if (st.cur) this.bringIntoView([st.cur].concat(st.deps || []));
      else if (st.path && st.path.length) this.bringIntoView([st.path[st.path.length - 1]]);
    }

    /**
     * Scorre in orizzontale perché si vedano la prima cella della lista (quella in
     * calcolo) e, se ci stanno, anche le altre (le dipendenze). Lo scorrimento si
     * ferma sempre all'inizio di una colonna, così accanto alla prima colonna
     * ferma non restano pezzi di caselle.
     */
    bringIntoView(cells) {
      const sc = this.scroller;
      const row = this.cellEls[0];
      if (!row || !row.length || sc.scrollWidth <= sc.clientWidth + 1) return;
      const cols = cells.map((c) => c && c[1]).filter((j) => j != null && j >= 0 && j < row.length);
      if (!cols.length) return;
      // coordinate rispetto alla tabella (è lei l'offsetParent delle celle)
      const left = (j) => row[j].td.offsetLeft;
      const right = (j) => row[j].td.offsetLeft + row[j].td.offsetWidth;
      const lead = left(0); // le celle a sinistra di qui finiscono sotto la colonna ferma
      const span = sc.clientWidth - lead;
      let a = Math.min(...cols);
      let b = Math.max(...cols);
      if (right(b) - left(a) > span) a = b = cols[0];
      const S = sc.scrollLeft;
      if (left(a) >= S + lead - 0.5 && right(b) <= S + sc.clientWidth + 0.5) return;
      let first = a; // la colonna da mettere subito dopo quella ferma
      if (left(a) >= S + lead) {
        // si va verso destra: il minimo spostamento che mostra b
        for (let k = 0; k <= a; k++) {
          if (right(b) <= left(k) - lead + sc.clientWidth + 0.5) {
            first = k;
            break;
          }
        }
      }
      sc.scrollLeft = Math.max(0, left(first) - lead);
    }

    /** Se la tabella non ci sta, il contenitore diventa raggiungibile da tastiera. */
    updateScroll() {
      const sc = this.scroller;
      const over = sc.scrollWidth > sc.clientWidth + 1;
      this.root.classList.toggle('is-scroll', over);
      if (over) {
        sc.setAttribute('tabindex', '0');
        sc.setAttribute('role', 'region');
        sc.setAttribute('aria-label', this.o.ariaLabel + ' (scorre di lato)');
      } else {
        sc.removeAttribute('tabindex');
        sc.removeAttribute('role');
        sc.removeAttribute('aria-label');
      }
    }
  };

  ASD.viz.TableView.key = key;
})();
