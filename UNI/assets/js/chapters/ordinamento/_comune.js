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
})();
