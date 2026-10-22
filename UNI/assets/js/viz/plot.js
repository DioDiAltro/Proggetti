/* ASD a quadretti — grafico di funzioni e di misure (SVG).

   const p = new ASD.viz.Plot(el, {
     x: { min: 1, max: 64, label: 'n', integer: true },
     y: { min: 0, max: 'auto', label: 'passi', log: false },
     height: 300, ariaLabel: 'Crescita delle funzioni'
   });
   p.set({
     series: [
       { id: 'n2', label: 'n²', slot: 1, fn: (n) => n * n },          // curva
       { id: 'mis', label: 'misurati', slot: 2, points: [[1, 1], ...] } // punti misurati
     ],
     bands: [{ from: 10, to: 64 }],                  // zona evidenziata sull'asse x
     vlines: [{ x: 10, label: 'n₀' }],               // linee verticali tratteggiate
     bad: [[3, 40]]                                  // punti in rosso (violazioni)
   });

   Colori: slot 1..8 = --series-1..8 (ordine fisso, validato per il daltonismo).
   Il testo usa sempre i colori dell'inchiostro; ogni serie ha la sua etichetta
   alla fine della linea, la legenda, il mirino col valore al passaggio del
   puntatore (anche da tastiera) e la tabella dei valori. */
(function () {
  'use strict';

  const { h, s } = ASD;

  function niceStep(span, target) {
    const raw = span / Math.max(1, target);
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const f = raw / mag;
    return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * mag;
  }

  function linearTicks(min, max, target) {
    const step = niceStep(max - min, target);
    const out = [];
    for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-9; v += step) out.push(Math.round(v * 1e9) / 1e9);
    return out;
  }

  ASD.viz.Plot = class Plot {
    constructor(host, o = {}) {
      this.o = Object.assign({ height: 300, legend: true, table: true, endLabels: true }, o);
      this.o.x = Object.assign({ min: 0, max: 10, label: 'n', integer: false }, o.x);
      this.o.y = Object.assign({ min: 0, max: 'auto', label: '', log: false }, o.y);
      this.root = h('div.plot');
      this.legendEl = h('ul.plot-legend');
      this.svg = s('svg', { role: 'img', 'aria-label': this.o.ariaLabel || 'Grafico', tabindex: '0', focusable: 'true' });
      this.tip = h('div.plot-tip', { hidden: true });
      this.tableBox = h('details.plot-table', h('summary', 'Valori in tabella'));
      this.root.append(this.legendEl, this.svg, this.tip);
      if (this.o.table) this.root.append(this.tableBox);
      host.append(this.root);
      this.data = { series: [] };
      this.bindHover();
      if ('ResizeObserver' in window) {
        let w = 0;
        new ResizeObserver(() => {
          const nw = this.root.clientWidth;
          if (Math.abs(nw - w) > 2) {
            w = nw;
            this.draw();
          }
        }).observe(this.root);
      }
    }

    set(data) {
      this.data = Object.assign({ series: [], bands: [], vlines: [], bad: [] }, data);
      this.draw();
    }

    setAxis(axis, patch) {
      Object.assign(this.o[axis], patch);
      this.draw();
    }

    /** Valori campionati di una serie nel dominio corrente. */
    samples(se) {
      if (se.points) return se.points.filter(([x]) => x >= this.o.x.min && x <= this.o.x.max);
      const { min, max, integer } = this.o.x;
      const out = [];
      if (integer) {
        const step = Math.max(1, Math.ceil((max - min) / 400));
        for (let x = Math.ceil(min); x <= max; x += step) out.push([x, se.fn(x)]);
        if (out.length && out[out.length - 1][0] !== max) out.push([max, se.fn(max)]);
      } else {
        const N = 300;
        for (let k = 0; k <= N; k++) {
          const x = min + ((max - min) * k) / N;
          out.push([x, se.fn(x)]);
        }
      }
      return out.filter(([, y]) => Number.isFinite(y));
    }

    draw() {
      const W = Math.max(280, this.root.clientWidth || 600);
      const H = this.o.height;
      const m = { top: 14, right: this.o.endLabels ? 78 : 18, bottom: 44, left: 58 };
      this.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      this.svg.setAttribute('width', W);
      this.svg.setAttribute('height', H);
      this.svg.replaceChildren();
      const series = this.data.series || [];
      const all = series.map((se) => ({ se, pts: this.samples(se) }));
      this.cache = all;

      const { x, y } = this.o;
      let yMax = y.max;
      if (yMax === 'auto') {
        yMax = 0;
        for (const { pts } of all) for (const [, v] of pts) yMax = Math.max(yMax, v);
        for (const [, v] of this.data.bad || []) yMax = Math.max(yMax, v);
        yMax = yMax || 1;
        yMax *= 1.05;
      }
      const log = y.log;
      const yMin = log ? Math.max(1e-9, y.min || 1) : y.min;
      const pw = W - m.left - m.right;
      const ph = H - m.top - m.bottom;
      const sx = (v) => m.left + ((v - x.min) / (x.max - x.min || 1)) * pw;
      const sy = log
        ? (v) => m.top + ph - ((Math.log10(Math.max(v, yMin)) - Math.log10(yMin)) / (Math.log10(yMax) - Math.log10(yMin) || 1)) * ph
        : (v) => m.top + ph - ((v - yMin) / (yMax - yMin || 1)) * ph;
      this.scale = { sx, sy, m, pw, ph, W, H, yMax, yMin };

      // zone e griglia
      const gGrid = s('g', { class: 'p-grid' });
      const gAxis = s('g', { class: 'p-axis' });
      for (const b of this.data.bands || []) {
        const x1 = sx(Math.max(x.min, b.from));
        const x2 = sx(Math.min(x.max, b.to));
        if (x2 > x1) this.svg.append(s('rect', { class: b.cls === 'bad' ? 'p-bad' : 'p-band', x: x1, y: m.top, width: x2 - x1, height: ph }));
      }
      const yt = log ? this.logTicks(yMin, yMax) : linearTicks(yMin, yMax, 5);
      for (const v of yt) {
        const py = sy(v);
        gGrid.append(s('line', { x1: m.left, x2: m.left + pw, y1: py, y2: py }));
        gAxis.append(s('text', { x: m.left - 8, y: py, 'text-anchor': 'end', 'dominant-baseline': 'middle' }, ASD.fmtCompact(v)));
      }
      const xt = x.ticks || linearTicks(x.min, x.max, Math.max(3, Math.floor(pw / 80)));
      for (const v of xt) {
        if (v < x.min || v > x.max) continue;
        const px = sx(v);
        gAxis.append(s('line', { x1: px, x2: px, y1: m.top + ph, y2: m.top + ph + 5 }));
        gAxis.append(s('text', { x: px, y: m.top + ph + 18, 'text-anchor': 'middle' }, ASD.fmtCompact(v)));
      }
      gAxis.append(s('line', { x1: m.left, x2: m.left + pw, y1: m.top + ph, y2: m.top + ph }));
      gAxis.append(s('line', { x1: m.left, x2: m.left, y1: m.top, y2: m.top + ph }));
      if (x.label) gAxis.append(s('text', { class: 'p-title', x: m.left + pw, y: m.top + ph + 34, 'text-anchor': 'end' }, x.label));
      if (y.label) gAxis.append(s('text', { class: 'p-title', x: 4, y: 10, 'text-anchor': 'start' }, y.label + (log ? ' (scala logaritmica)' : '')));
      this.svg.append(gGrid, gAxis);

      for (const vl of this.data.vlines || []) {
        if (vl.x < x.min || vl.x > x.max) continue;
        const px = sx(vl.x);
        this.svg.append(s('line', { class: 'p-vline', x1: px, x2: px, y1: m.top, y2: m.top + ph }));
        if (vl.label) this.svg.append(s('text', { class: 'p-title', x: px + 5, y: m.top + 12 }, vl.label));
      }

      // serie (ritagliate all'area del grafico)
      const clipId = ASD.uid('clip');
      const defs = s('defs', null, s('clipPath', { id: clipId }, s('rect', { x: m.left, y: m.top - 2, width: pw + 2, height: ph + 4 })));
      this.svg.append(defs);
      const gSeries = s('g', { 'clip-path': `url(#${clipId})` });
      const ends = [];
      for (const { se, pts } of all) {
        if (!pts.length) continue;
        const cls = 's' + (se.slot || 1);
        if (se.fn) {
          let d = '';
          let started = false;
          let lastIn = null;
          for (const [px, py] of pts) {
            const yy = Math.min(py, yMax * 50);
            d += (started ? 'L' : 'M') + sx(px).toFixed(1) + ' ' + sy(yy).toFixed(1);
            started = true;
            if (py <= yMax) lastIn = [px, py];
          }
          gSeries.append(s('path', { class: `p-line ${cls}${se.dashed ? ' dashed' : ''}`, d }));
          const last = pts[pts.length - 1];
          if (last[1] <= yMax) ends.push({ se, x: sx(last[0]), y: sy(last[1]) });
          else if (lastIn) {
            // la curva esce dall'alto: l'etichetta va dove esce
            const exit = this.exitX(se, lastIn[0], x.max, yMax);
            ends.push({ se, x: sx(exit), y: m.top + 2, top: true });
          }
        } else {
          if (se.line) {
            const d = pts.map(([px, py], k) => (k ? 'L' : 'M') + sx(px).toFixed(1) + ' ' + sy(py).toFixed(1)).join('');
            gSeries.append(s('path', { class: `p-line ${cls}${se.dashed ? ' dashed' : ''}`, d }));
          }
          for (const [px, py] of pts) gSeries.append(s('circle', { class: `p-pt ${cls}`, cx: sx(px), cy: sy(py), r: 4.5 }));
          const last = pts[pts.length - 1];
          ends.push({ se, x: sx(last[0]), y: sy(Math.min(last[1], yMax)) });
        }
      }
      for (const [px, py] of this.data.bad || []) {
        gSeries.append(s('circle', { class: 'p-pt bad', cx: sx(px), cy: sy(Math.min(py, yMax)), r: 5 }));
      }
      this.svg.append(gSeries);

      // etichette alla fine delle linee, senza sovrapposizioni
      if (this.o.endLabels && ends.length) {
        ends.sort((a, b) => a.y - b.y);
        let prev = -Infinity;
        for (const e of ends) {
          const ly = Math.max(e.y, prev + 15);
          prev = ly;
          const lx = e.top ? e.x + 6 : m.left + pw + 6;
          if (Math.abs(ly - e.y) > 6 && !e.top) {
            this.svg.append(s('line', { class: 'p-cross', x1: e.x + 2, y1: e.y, x2: lx - 2, y2: ly }));
          }
          this.svg.append(s('line', { class: `p-line s${e.se.slot || 1}`, x1: lx, y1: ly, x2: lx + 10, y2: ly }));
          this.svg.append(s('text', { class: 'p-endlabel', x: lx + 14, y: ly, 'dominant-baseline': 'middle' }, e.se.label + (e.top ? ' ↑' : '')));
        }
      }

      // livello per il mirino
      this.cross = s('line', { class: 'p-cross', y1: m.top, y2: m.top + ph, visibility: 'hidden' });
      this.hit = s('rect', { class: 'p-hit', x: m.left, y: m.top, width: pw, height: ph });
      this.svg.append(this.cross, this.hit);

      this.drawLegend(series);
      this.drawTable(all);
    }

    exitX(se, from, to, yMax) {
      let lo = from;
      let hi = to;
      for (let k = 0; k < 40; k++) {
        const mid = (lo + hi) / 2;
        if (se.fn(mid) <= yMax) lo = mid;
        else hi = mid;
      }
      return lo;
    }

    logTicks(min, max) {
      const out = [];
      for (let p = Math.floor(Math.log10(min)); p <= Math.ceil(Math.log10(max)); p++) {
        const v = Math.pow(10, p);
        if (v >= min && v <= max) out.push(v);
      }
      return out;
    }

    drawLegend(series) {
      if (!this.o.legend || series.length < 2) {
        this.legendEl.hidden = true;
        return;
      }
      this.legendEl.hidden = false;
      this.legendEl.replaceChildren(
        ...series.map((se) => {
          const li = h('li', h('span.key' + (se.dashed ? '.dashed' : '') + (se.points && !se.line ? '' : ''), { style: { color: `var(--series-${se.slot || 1})` } }));
          li.append(document.createTextNode(se.label));
          return li;
        })
      );
    }

    drawTable(all) {
      if (!this.o.table) return;
      const xs = new Set();
      for (const { se, pts } of all) {
        if (se.points) for (const [x] of pts) xs.add(x);
      }
      if (!xs.size) {
        const ticks = this.o.x.integer
          ? [...new Set(linearTicks(this.o.x.min, this.o.x.max, 8).map((v) => Math.max(this.o.x.min, Math.round(v))))]
          : linearTicks(this.o.x.min, this.o.x.max, 8);
        ticks.forEach((t) => xs.add(t));
      }
      const cols = [...xs].sort((a, b) => a - b);
      const table = h('table.tbl');
      const head = h('tr', h('th', { scope: 'col', text: this.o.x.label || 'x' }), ...all.map(({ se }) => h('th', { scope: 'col', text: se.label })));
      table.append(h('thead', head));
      const body = h('tbody');
      for (const xv of cols) {
        const row = h('tr', h('th', { scope: 'row', text: ASD.fmt(xv) }));
        for (const { se } of all) row.append(h('td', { text: this.valueAt(se, xv) == null ? '—' : ASD.fmtCompact(this.valueAt(se, xv)) }));
        body.append(row);
      }
      table.append(body);
      const wrap = h('div.tbl-wrap', table);
      this.tableBox.replaceChildren(this.tableBox.firstChild, wrap);
    }

    valueAt(se, xv) {
      if (se.fn) return se.fn(xv);
      const p = (se.points || []).find(([x]) => x === xv);
      return p ? p[1] : null;
    }

    bindHover() {
      const show = (xv, clientX, clientY) => {
        if (!this.scale) return;
        const { sx } = this.scale;
        const series = this.data.series || [];
        if (!series.length) return;
        this.cross.setAttribute('x1', sx(xv));
        this.cross.setAttribute('x2', sx(xv));
        this.cross.setAttribute('visibility', 'visible');
        const rows = series
          .map((se) => ({ se, v: this.valueAt(se, xv) }))
          .filter((r) => r.v != null && Number.isFinite(r.v))
          .sort((a, b) => b.v - a.v);
        const list = h('ul');
        for (const r of rows) {
          list.append(h('li', h('span.key', { style: { color: `var(--series-${r.se.slot || 1})` } }), h('strong', { text: ASD.fmtCompact(r.v) }), h('span', { text: r.se.label })));
        }
        this.tip.replaceChildren(h('p.tip-x', { text: `${this.o.x.label || 'x'} = ${ASD.fmt(xv)}` }), list);
        this.tip.hidden = false;
        const box = this.root.getBoundingClientRect();
        const tw = this.tip.offsetWidth;
        let left = (clientX != null ? clientX - box.left : sx(xv)) + 14;
        if (left + tw > box.width) left = left - tw - 28;
        const top = clientY != null ? clientY - box.top + 12 : 40;
        this.tip.style.transform = `translate(${Math.max(0, left)}px, ${top}px)`;
      };
      const hide = () => {
        this.tip.hidden = true;
        if (this.cross) this.cross.setAttribute('visibility', 'hidden');
      };
      const snap = (xv) => {
        const { min, max, integer } = this.o.x;
        const pointXs = [];
        for (const se of this.data.series || []) if (se.points) for (const [x] of se.points) pointXs.push(x);
        if (pointXs.length) return pointXs.reduce((best, x) => (Math.abs(x - xv) < Math.abs(best - xv) ? x : best), pointXs[0]);
        xv = ASD.clamp(xv, min, max);
        return integer ? Math.round(xv) : Math.round(xv * 100) / 100;
      };
      this.svg.addEventListener('pointermove', (e) => {
        if (!this.scale) return;
        const r = this.svg.getBoundingClientRect();
        const { m, pw } = this.scale;
        const px = ((e.clientX - r.left) / r.width) * this.scale.W;
        if (px < m.left || px > m.left + pw) return hide();
        const xv = this.o.x.min + ((px - m.left) / pw) * (this.o.x.max - this.o.x.min);
        this.kx = snap(xv);
        show(this.kx, e.clientX, e.clientY);
      });
      this.svg.addEventListener('pointerleave', hide);
      this.svg.addEventListener('blur', hide);
      this.svg.addEventListener('keydown', (e) => {
        if (!['ArrowLeft', 'ArrowRight', 'Escape'].includes(e.key)) return;
        e.preventDefault();
        if (e.key === 'Escape') return hide();
        const { min, max } = this.o.x;
        const step = this.o.x.integer ? Math.max(1, Math.round((max - min) / 40)) : (max - min) / 40;
        this.kx = snap((this.kx == null ? min : this.kx) + (e.key === 'ArrowRight' ? step : -step));
        show(this.kx);
      });
    }
  };
})();
