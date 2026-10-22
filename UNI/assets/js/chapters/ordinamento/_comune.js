/* ASD a quadretti — utilità comuni ai capitoli di ricerca e ordinamento.

   ASD.sorting.trace.<algoritmo>(array)  → fotogrammi per lo Stepper
   ASD.sorting.count.<algoritmo>(array)  → { confronti, ... } senza fotogrammi
                                            (per tabelle e grafici veloci)
   ASD.sorting.presets(n)                → bottoni "Casuale", "Già ordinato", ...
   ASD.sorting.validate(input, frames)   → controlla che l'ultimo fotogramma sia ordinato
   ASD.sorting.legend                    → legenda dei colori delle barre */
(function () {
  'use strict';

  const sorting = (ASD.sorting = ASD.sorting || { trace: {}, count: {} });

  sorting.legend = [
    { k: 'compare', label: 'confronto' },
    { k: 'swap', label: 'scambio' },
    { k: 'key', label: 'key / minimo' },
    { k: 'done', label: 'al posto giusto' },
    { k: 'hole', label: 'casella libera' },
  ];

  sorting.presets = (n = 8, lo = 5, hi = 60) => [
    { label: 'Casuale', value: () => ASD.randomDistinct(n, lo, hi) },
    { label: 'Già ordinato', value: () => ASD.randomDistinct(n, lo, hi).sort((x, y) => x - y) },
    { label: 'Al contrario', value: () => ASD.randomDistinct(n, lo, hi).sort((x, y) => y - x) },
  ];

  sorting.isSorted = (a) => a.every((v, i) => i === 0 || a[i - 1] <= v);

  sorting.validate = (input, frames) => {
    const last = frames[frames.length - 1].state;
    const a = last.a || [];
    if (a.length !== input.length) return 'lunghezza diversa dall\'input';
    if (!sorting.isSorted(a)) return 'l\'array finale non è ordinato: ' + a.join(',');
    const s1 = input.slice().sort((x, y) => x - y).join(',');
    const s2 = a.slice().sort((x, y) => x - y).join(',');
    if (s1 !== s2) return 'gli elementi finali non sono quelli di partenza';
    return null;
  };

  /** Costruisce lo stato per ArrayView. */
  function snap(a, ids, o = {}) {
    const marks = {};
    const add = (i, k) => {
      if (i == null || i < 0) return;
      marks[i] = marks[i] ? [].concat(marks[i], k) : k;
    };
    for (const i of o.done || []) add(i, 'done');
    for (const i of o.cmp || []) add(i, 'compare');
    for (const i of o.swap || []) add(i, 'swap');
    if (o.min != null) add(o.min, 'min');
    if (o.key != null) add(o.key, 'key');
    return { a: a.slice(), ids: ids.slice(), marks, ptrs: o.ptrs || {}, float: o.float || null, range: o.range || null };
  }
  sorting.snap = snap;

  const range = (from, to) => Array.from({ length: Math.max(0, to - from) }, (_, k) => from + k);

  /* --------------------------------------------------------- selection sort */

  sorting.trace.selection = function (input) {
    const t = new ASD.Tracer(['confronti', 'scambi']);
    const a = input.slice();
    const ids = a.map((_, i) => i);
    const n = a.length;
    for (let i = 0; i < n - 1; i++) {
      const done = range(0, i);
      t.step('outer', `Passo <b>i = ${i}</b>: cerco il minimo tra a[${i}] e a[${n - 1}].`, { i }, snap(a, ids, { done, ptrs: { i } }));
      let m = i;
      t.step('min-init', `Per ora il candidato minimo è a[${i}] = ${a[i]}.`, { i, minimo: m }, snap(a, ids, { done, min: m, ptrs: { i, min: m } }));
      for (let j = i + 1; j < n; j++) {
        t.count('confronti');
        const less = a[j] < a[m];
        t.step(
          'cmp',
          `Confronto a[${j}] = ${a[j]} con il minimo a[${m}] = ${a[m]}: ${less ? '<b>è più piccolo</b>.' : 'non è più piccolo.'}`,
          { i, j, minimo: m },
          snap(a, ids, { done, cmp: [j], min: m, ptrs: { i, j, min: m } })
        );
        if (less) {
          m = j;
          t.step('new-min', `Il nuovo minimo è a[${m}] = ${a[m]}.`, { i, j, minimo: m }, snap(a, ids, { done, min: m, ptrs: { i, j, min: m } }));
        }
      }
      t.count('scambi');
      [a[i], a[m]] = [a[m], a[i]];
      [ids[i], ids[m]] = [ids[m], ids[i]];
      t.step(
        'swap',
        m === i
          ? `Il minimo era già in a[${i}]: lo scambio con se stesso non cambia nulla. a[0..${i}] è al suo posto definitivo.`
          : `Scambio a[${i}] e a[${m}]. Ora a[${i}] = ${a[i]} è al suo posto definitivo.`,
        { i, minimo: m },
        snap(a, ids, { done: range(0, i), swap: m === i ? [i] : [i, m], ptrs: { i, min: m } })
      );
    }
    const c = (n * (n - 1)) / 2;
    t.step(null, `Finito. Confronti fatti: ${n}·${n - 1}/2 = <b>${c}</b>, sempre, qualunque sia l'input. Scambi: n − 1 = ${n - 1}.`, {}, snap(a, ids, { done: range(0, n) }));
    return t.frames;
  };

  sorting.count.selection = function (input) {
    const a = input.slice();
    const n = a.length;
    let confronti = 0;
    let scambi = 0;
    for (let i = 0; i < n - 1; i++) {
      let m = i;
      for (let j = i + 1; j < n; j++) {
        confronti++;
        if (a[j] < a[m]) m = j;
      }
      [a[i], a[m]] = [a[m], a[i]];
      scambi++;
    }
    return { confronti, scambi, spostamenti: 3 * scambi };
  };

  /* --------------------------------------------------------- insertion sort */

  sorting.trace.insertion = function (input) {
    const t = new ASD.Tracer(['confronti', 'spostamenti']);
    const a = input.slice();
    const ids = a.map((_, i) => i);
    const n = a.length;
    t.step('outer', `a[0] da solo è già una sequenza ordinata: si parte da i = 1.`, { i: 1 }, snap(a, ids, { ptrs: { i: 1 } }));
    for (let i = 1; i < n; i++) {
      if (i > 1) t.step('outer', `Passo <b>i = ${i}</b>: a[0..${i - 1}] è ordinato, ora inserisco a[${i}] = ${a[i]}.`, { i }, snap(a, ids, { ptrs: { i } }));
      const key = a[i];
      const keyId = ids[i];
      const view = a.slice();
      view[i] = null;
      const float = (at) => ({ value: key, id: keyId, at, label: 'key' });
      const st = (o) => snap(view, ids, o);
      t.step('key', `Salvo a[${i}] in <code>key = ${key}</code>. La sua casella si può sovrascrivere: il valore è al sicuro in key.`, { i, key }, st({ float: float(i), ptrs: { i } }));
      let j = i - 1;
      t.step('j-init', `<code>j = ${j}</code>: parto dall'elemento subito a sinistra.`, { i, j, key }, st({ float: float(i), ptrs: { i, j } }));
      for (;;) {
        if (j < 0) {
          t.step('cmp', `<code>j = −1</code>: sono arrivato all'inizio dell'array, il ciclo finisce. Grazie a <code>j >= 0</code> valutato per primo, a[−1] non viene mai letto.`, { i, j, key }, st({ float: float(j + 1), ptrs: { i } }));
          break;
        }
        t.count('confronti');
        const bigger = view[j] > key;
        t.step(
          'cmp',
          bigger ? `a[${j}] = ${view[j]} &gt; key = ${key}: va spostato a destra.` : `a[${j}] = ${view[j]} ≤ key = ${key}: il ciclo si ferma, il posto di key è a[${j + 1}].`,
          { i, j, key },
          st({ float: float(j + 1), cmp: [j], ptrs: { i, j } })
        );
        if (!bigger) break;
        view[j + 1] = view[j];
        ids[j + 1] = ids[j];
        view[j] = null;
        t.count('spostamenti');
        t.step('shift', `Copio a[${j}] in a[${j + 1}]: la casella libera si sposta a sinistra.`, { i, j, key }, st({ float: float(j), swap: [j + 1], ptrs: { i, j } }));
        j--;
        t.step('dec', `<code>j = ${j}</code>.`, { i, j, key }, st({ float: float(j + 1), ptrs: j >= 0 ? { i, j } : { i } }));
      }
      view[j + 1] = key;
      ids[j + 1] = keyId;
      for (let k = 0; k < n; k++) a[k] = view[k];
      t.step('place', `Metto key = ${key} in a[${j + 1}]. Ora a[0..${i}] è ordinato.`, { i, j, key }, snap(a, ids, { key: j + 1, ptrs: { i } }));
    }
    const sp = t.c.spostamenti;
    t.step(
      null,
      `Finito con ${t.c.confronti} confronti e ${sp} spostamenti. Gli spostamenti sono esattamente le coppie di elementi in ordine sbagliato (inversioni) dell'input.`,
      {},
      snap(a, ids, { done: range(0, n) })
    );
    return t.frames;
  };

  sorting.count.insertion = function (input) {
    const a = input.slice();
    const n = a.length;
    let confronti = 0;
    let spostamenti = 0;
    for (let i = 1; i < n; i++) {
      const key = a[i];
      let j = i - 1;
      while (j >= 0) {
        confronti++;
        if (!(a[j] > key)) break;
        a[j + 1] = a[j];
        spostamenti++;
        j--;
      }
      a[j + 1] = key;
    }
    return { confronti, spostamenti, scambi: 0 };
  };

  /* ------------------------------------------------------------ bubble sort */

  sorting.trace.bubble = function (input) {
    const t = new ASD.Tracer(['confronti', 'scambi']);
    const a = input.slice();
    const ids = a.map((_, i) => i);
    const n = a.length;
    let fine = n;
    for (let i = 0; i < n - 1; i++) {
      const done = range(n - i, n);
      t.step('outer', `Passata <b>i = ${i}</b>${i ? `: le ultime ${i} caselle sono già al loro posto` : ''}.`, { i }, snap(a, ids, { done, ptrs: { i } }));
      let scambiato = false;
      t.step('flag', `<code>scambiato = false</code>: per ora in questa passata nessuno scambio.`, { i, scambiato }, snap(a, ids, { done, ptrs: { i } }));
      for (let j = 0; j < n - 1 - i; j++) {
        t.count('confronti');
        const wrong = a[j] > a[j + 1];
        t.step(
          'cmp',
          `Confronto a[${j}] = ${a[j]} e a[${j + 1}] = ${a[j + 1]}: ${wrong ? '<b>sono nell\'ordine sbagliato</b>.' : 'sono in ordine.'}`,
          { i, j, scambiato },
          snap(a, ids, { done, cmp: [j, j + 1], ptrs: { j } })
        );
        if (wrong) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          [ids[j], ids[j + 1]] = [ids[j + 1], ids[j]];
          scambiato = true;
          t.count('scambi');
          t.step('swap', `Scambio: il più grande dei due sale di una casella verso destra.`, { i, j, scambiato }, snap(a, ids, { done, swap: [j, j + 1], ptrs: { j } }));
        }
      }
      fine = n - 1 - i;
      if (!scambiato) {
        t.step('stop', `Nessuno scambio in tutta la passata: l'array è ordinato e il ciclo si interrompe con <code>break</code>.`, { i, scambiato }, snap(a, ids, { done: range(0, n) }));
        fine = 0;
        break;
      }
      t.step('stop', `C'è stato almeno uno scambio: serve un'altra passata. a[${fine}] = ${a[fine]} è al suo posto.`, { i, scambiato }, snap(a, ids, { done: range(fine, n) }));
    }
    t.step(null, `Finito con ${t.c.confronti} confronti e ${t.c.scambi} scambi.`, {}, snap(a, ids, { done: range(0, n) }));
    return t.frames;
  };

  sorting.count.bubble = function (input) {
    const a = input.slice();
    const n = a.length;
    let confronti = 0;
    let scambi = 0;
    for (let i = 0; i < n - 1; i++) {
      let sc = false;
      for (let j = 0; j < n - 1 - i; j++) {
        confronti++;
        if (a[j] > a[j + 1]) {
          [a[j], a[j + 1]] = [a[j + 1], a[j]];
          scambi++;
          sc = true;
        }
      }
      if (!sc) break;
    }
    return { confronti, scambi, spostamenti: 3 * scambi };
  };

  /* ==========================================================================
     Aggiunte per i capitoli ricerca, merge-sort, quick-sort, sort-lineari,
     sort-confronto. Le funzioni qui sopra restano come sono (le usano
     sort-semplici e la pagina iniziale).

     ASD.sorting.MultiView        vista composta: più array (e un albero) nello stesso palco
     ASD.sorting.tagDuplicates    [2, 5, 2] → ['2', '5', '2′']: distingue i valori uguali
     ASD.sorting.count.merge|quick|heap|counting   conteggi veloci, senza fotogrammi
     ASD.sorting.gara.<algoritmo> confronti e spostamenti misurati tutti allo stesso modo
     ASD.sorting.kinds            i tipi di input dei laboratori (casuale, ordinato, ...)
     ========================================================================== */

  const { h } = ASD;

  /**
   * Vista composta: più disegni uno sotto l'altro nello stesso palco, per
   * esempio l'array e il buffer del merge, oppure input, conteggi e output
   * del counting sort. Ogni pezzo è una vista del nucleo (ArrayView o TreeView).
   *
   *   new ASD.sorting.MultiView(stage, [
   *     { key: 'a', label: 'a', mode: 'cells' },                         // ArrayView
   *     { key: 'b', label: 'b (buffer)', mode: 'cells' },
   *     { key: 't', kind: 'tree', label: 'chiamate', layout: 'tidy' },   // TreeView
   *   ], { cls: 'ord-merge' });
   *
   * render(state): state[key] è lo stato del pezzo. Se manca, il pezzo resta
   * invisibile ma occupa il suo spazio: così i comandi del visualizzatore non si
   * spostano sotto il mouse tra un passo e l'altro.
   * Per un array, state[key].regions = [{ from, to, label, cls }] disegna sotto
   * le celle delle parentesi con un nome ("≤ pivot", ...): le etichette che non
   * ci stanno scendono su una riga nuova, mai una sopra l'altra. L'opzione
   * regionRows del pezzo riserva da subito lo spazio per quel numero di righe.
   * Per un albero, state[key].minDepth riserva l'altezza di un albero con quei
   * livelli (utile quando l'albero cresce durante l'esecuzione).
   */
  class MultiView {
    constructor(stage, parts, o = {}) {
      this.root = h('div.ord-multi' + (o.cls ? '.' + o.cls.split(' ').join('.') : ''));
      stage.append(this.root);
      this.parts = parts.map((p) => {
        const box = h('div.ord-piece' + (p.cls ? '.' + p.cls : ''));
        this.root.append(box);
        if (p.kind === 'tree') {
          if (p.label) box.append(h('p.ord-piece-label', { text: p.label }));
          const view = new ASD.viz.TreeView(box, Object.assign({ layout: 'tidy', shape: 'box', ariaLabel: p.ariaLabel || p.label || 'Albero' }, p.tree || {}));
          return Object.assign({}, p, { box, view });
        }
        const view = new ASD.viz.ArrayView(box, {
          mode: p.mode || 'cells',
          label: p.label,
          height: p.height || (p.mode === 'bars' ? 150 : undefined),
          maxSlot: p.maxSlot || 58,
          showIndex: p.showIndex !== false,
        });
        const regions = h('div.ord-regions', { 'aria-hidden': 'true' });
        view.root.append(regions);
        return Object.assign({}, p, { box, view, regions });
      });
      this.last = null;
      if ('ResizeObserver' in window) {
        let w = 0;
        this.ro = new ResizeObserver(() => {
          const nw = this.root.clientWidth;
          if (this.last && Math.abs(nw - w) > 1) {
            w = nw;
            requestAnimationFrame(() => this.drawAllRegions());
          }
        });
        this.ro.observe(this.root);
      }
    }

    reset() {
      for (const p of this.parts) if (p.view.reset) p.view.reset();
    }

    render(st) {
      this.last = st;
      for (const p of this.parts) {
        const s = st[p.key];
        p.box.style.visibility = s ? '' : 'hidden';
        if (s) p.box.removeAttribute('aria-hidden');
        else p.box.setAttribute('aria-hidden', 'true');
        if (!s) continue;
        p.view.render(s);
        if (p.regions) this.drawRegions(p, s.regions || []);
        if (p.kind === 'tree') {
          const o = p.view.o;
          const half = o.shape === 'box' ? o.boxH / 2 : o.r;
          p.view.root.style.minHeight = s.minDepth != null ? s.minDepth * o.levelH + half * 2 + o.pad * 2 + 'px' : '';
        }
      }
    }

    drawAllRegions() {
      if (!this.last) return;
      for (const p of this.parts) {
        const s = this.last[p.key];
        if (s && p.regions) this.drawRegions(p, s.regions || []);
      }
    }

    /** Parentesi con nome sotto l'array: posizioni in pixel, righe impilate se serve. */
    drawRegions(p, regions) {
      const n = (this.last && this.last[p.key] && this.last[p.key].a ? this.last[p.key].a.length : 0) || 1;
      const width = parseFloat(p.view.root.style.width) || 0;
      const slot = width / n;
      const rowsEnd = [];
      const els = [];
      for (const r of regions) {
        if (r.to < r.from) continue;
        const left = r.from * slot;
        const w = (r.to - r.from + 1) * slot;
        const textW = String(r.label || '').length * 6.6 + 8;
        const center = left + w / 2;
        const tl = Math.max(-slot / 2, center - textW / 2);
        let row = rowsEnd.findIndex((end) => end <= tl);
        if (row === -1) {
          row = rowsEnd.length;
          rowsEnd.push(-Infinity);
        }
        rowsEnd[row] = tl + textW + 4;
        const br = h('span.ord-reg' + (r.cls ? '.is-' + r.cls : ''), { style: { left: left + 3 + 'px', width: Math.max(4, w - 6) + 'px' } });
        const label = h('span.ord-reg-label', { text: r.label || '', style: { left: center + 'px', top: 12 + row * 15 + 'px' } });
        els.push(br, label);
      }
      const rows = Math.max(regions.length ? 1 : 0, rowsEnd.length, p.regionRows || 0);
      p.regions.style.height = rows ? 14 + rows * 15 + 'px' : '0px';
      p.regions.replaceChildren(...els);
    }
  }
  sorting.MultiView = MultiView;

  /** Come validate, per gli stati di una MultiView: controlla l'array del pezzo `key` (es. 'a'). */
  sorting.validateKey = (key) => (input, frames) => sorting.validate(input, [{ state: frames[frames.length - 1].state[key] || {} }]);

  /** Distingue i valori ripetuti con gli apici: [2, 5, 2, 2] → ['2', '5', '2′', '2″']. */
  sorting.tagDuplicates = function (values) {
    const seen = new Map();
    const MARKS = ['', '′', '″', '‴'];
    return values.map((v) => {
      const k = seen.get(v) || 0;
      seen.set(v, k + 1);
      return String(v) + (k < MARKS.length ? MARKS[k] : `(${k + 1})`);
    });
  };

  /** Tipi di input dei laboratori. */
  sorting.kinds = [
    { id: 'casuale', label: 'casuale', make: (n) => ASD.randomArray(n, 0, 9999) },
    { id: 'ordinato', label: 'già ordinato', make: (n) => Array.from({ length: n }, (_, i) => i) },
    { id: 'inverso', label: 'al contrario', make: (n) => Array.from({ length: n }, (_, i) => n - i) },
    { id: 'pochi', label: 'pochi valori distinti', make: (n) => ASD.randomArray(n, 0, 9) },
  ];

  /* ----------------------------------------------- conteggi senza fotogrammi */

  /** Merge sort come esempi/ordinamento/merge_sort.cpp. Spostamenti: scritture nel buffer e ritorno in a. */
  sorting.count.merge = function (input) {
    const a = input.slice();
    const n = a.length;
    const b = new Array(n);
    let confronti = 0;
    let spostamenti = 0;
    let chiamate = 0;
    const sort = (lo, hi) => {
      chiamate++;
      if (lo >= hi) return;
      const mid = lo + ((hi - lo) >> 1);
      sort(lo, mid);
      sort(mid + 1, hi);
      let i = lo;
      let j = mid + 1;
      let k = 0;
      while (i <= mid && j <= hi) {
        confronti++;
        b[k++] = a[i] <= a[j] ? a[i++] : a[j++];
      }
      while (i <= mid) b[k++] = a[i++];
      while (j <= hi) b[k++] = a[j++];
      for (k = 0; k < hi - lo + 1; k++) a[lo + k] = b[k];
      spostamenti += 2 * (hi - lo + 1);
    };
    if (n) sort(0, n - 1);
    return { confronti, spostamenti, chiamate, a };
  };

  /**
   * Quicksort con la partizione di Lomuto (pivot = ultimo), come quick_sort.cpp.
   * o.random: pivot scelto a caso (o.rng = generatore in [0, 1), predefinito Math.random).
   * Usa una pila esplicita: niente ricorsione profonda in JavaScript sugli input ordinati.
   * profondita = massimo numero di chiamate annidate (contando anche quelle su intervalli vuoti).
   */
  sorting.count.quick = function (input, o = {}) {
    const a = input.slice();
    const n = a.length;
    const rnd = o.random ? o.rng || Math.random : null;
    let confronti = 0;
    let scambi = 0;
    let spostamenti = 0;
    let chiamate = 0;
    let profondita = 0;
    const swap = (x, y) => {
      const t = a[x];
      a[x] = a[y];
      a[y] = t;
      scambi++;
      spostamenti += 3;
    };
    const stack = [[0, n - 1, 1]];
    while (stack.length) {
      const [lo, hi, d] = stack.pop();
      chiamate++;
      if (d > profondita) profondita = d;
      if (lo >= hi) continue;
      if (rnd) swap(lo + Math.floor(rnd() * (hi - lo + 1)), hi);
      const pivot = a[hi];
      spostamenti++;
      let i = lo - 1;
      for (let j = lo; j < hi; j++) {
        confronti++;
        if (a[j] <= pivot) swap(++i, j);
      }
      swap(i + 1, hi);
      const p = i + 1;
      stack.push([p + 1, hi, d + 1], [lo, p - 1, d + 1]);
    }
    return { confronti, scambi, spostamenti, chiamate, profondita, a };
  };

  /** Heapsort (max-heap su array, sift-down con scambi): solo il conteggio, la visualizzazione sta nel capitolo heap. */
  sorting.count.heap = function (input) {
    const a = input.slice();
    const n = a.length;
    let confronti = 0;
    let scambi = 0;
    const swap = (x, y) => {
      const t = a[x];
      a[x] = a[y];
      a[y] = t;
      scambi++;
    };
    const sift = (i, size) => {
      while (2 * i + 1 < size) {
        let f = 2 * i + 1;
        if (f + 1 < size) {
          confronti++;
          if (a[f] < a[f + 1]) f++;
        }
        confronti++;
        if (!(a[i] < a[f])) break;
        swap(i, f);
        i = f;
      }
    };
    for (let i = (n >> 1) - 1; i >= 0; i--) sift(i, n);
    for (let fine = n - 1; fine > 0; fine--) {
      swap(0, fine);
      sift(0, fine);
    }
    return { confronti, scambi, spostamenti: 3 * scambi, a };
  };

  /** Counting sort stabile (interi ≥ 0), come counting_sort.cpp. operazioni ≈ n + k: i passi dei quattro cicli. */
  sorting.count.counting = function (input) {
    const n = input.length;
    let k = 0;
    for (const v of input) if (v > k) k = v;
    const c = new Array(k + 1).fill(0);
    for (const v of input) c[v]++;
    for (let v = 1; v <= k; v++) c[v] += c[v - 1];
    const b = new Array(n);
    for (let i = n - 1; i >= 0; i--) b[--c[input[i]]] = input[i];
    return { confronti: 0, spostamenti: n, k, operazioni: 2 * n + k + 1, a: b };
  };

  /**
   * Misure uniformi per il confronto finale.
   *   confronti   = confronti tra due elementi
   *   spostamenti = assegnamenti di un elemento (in una casella, nel buffer o in
   *                 una variabile come key o pivot); uno scambio ne conta 3.
   */
  sorting.gara = {
    selection: (a) => {
      const r = sorting.count.selection(a);
      return { confronti: r.confronti, spostamenti: 3 * r.scambi };
    },
    insertion: (a) => {
      const r = sorting.count.insertion(a);
      return { confronti: r.confronti, spostamenti: r.spostamenti + 2 * Math.max(0, a.length - 1) };
    },
    bubble: (a) => {
      const r = sorting.count.bubble(a);
      return { confronti: r.confronti, spostamenti: 3 * r.scambi };
    },
    merge: (a) => {
      const r = sorting.count.merge(a);
      return { confronti: r.confronti, spostamenti: r.spostamenti };
    },
    quick: (a) => {
      const r = sorting.count.quick(a);
      return { confronti: r.confronti, spostamenti: r.spostamenti };
    },
    heap: (a) => {
      const r = sorting.count.heap(a);
      return { confronti: r.confronti, spostamenti: r.spostamenti };
    },
    counting: (a) => {
      const r = sorting.count.counting(a);
      return { confronti: 0, spostamenti: r.spostamenti, k: r.k };
    },
  };
})();
