/* ASD a quadretti — capitolo "Heap e code con priorità".
   Code con priorità, heap binario in un array (indici da 0), proprietà del
   max-heap (laboratorio di controllo), inserimento con sift-up, estrazione del
   massimo con sift-down, build-heap in O(n) (stepper e grafico), heapsort
   (stepper con barre e albero affiancati), std::priority_queue. */
(function () {
  'use strict';

  const { m, box, table, h } = ASD;
  const T = ASD.trees;
  const HP = (T.heap = T.heap || {});

  const HEAP8 = [25, 20, 17, 5, 2, 13, 8, 4];
  const HEAP9 = [30, 25, 17, 20, 2, 13, 8, 4, 5];
  const INPUT8 = [5, 13, 2, 25, 7, 17, 20, 8];

  /* ------------------------------------------------- funzioni senza fotogrammi */

  HP.parent = (i) => Math.floor((i - 1) / 2);

  /** Coppie (padre, figlio) che violano la proprietà del max-heap. */
  HP.violations = function (a) {
    const out = [];
    for (let i = 1; i < a.length; i++) if (a[HP.parent(i)] < a[i]) out.push({ p: HP.parent(i), c: i });
    return out;
  };
  HP.isHeap = (a) => HP.violations(a).length === 0;

  HP.siftDown = function (a, i, n) {
    while (2 * i + 1 < n) {
      let mm = 2 * i + 1;
      const r = mm + 1;
      if (r < n && a[r] > a[mm]) mm = r;
      if (a[i] >= a[mm]) return;
      [a[i], a[mm]] = [a[mm], a[i]];
      i = mm;
    }
  };

  HP.build = function (a) {
    for (let i = Math.floor(a.length / 2) - 1; i >= 0; i--) HP.siftDown(a, i, a.length);
    return a;
  };

  HP.randomHeap = (n) => HP.build(ASD.randomDistinct(n, 1, 99));

  /** Altezza del nodo i in un heap di n elementi: si scende sempre a sinistra. */
  HP.heightAt = (i, n) => {
    let hh = 0;
    for (let c = 2 * i + 1; c < n; c = 2 * c + 1) hh++;
    return hh;
  };

  /* --------------------------------------------------- stato per la vista */

  /** Stato per T.HeapView a partire dall'array e dalle opzioni del fotogramma. */
  function heapState(a, ids, o = {}) {
    const marks = {};
    const add = (i, c) => {
      if (i == null || i < 0 || i >= a.length) return;
      marks[i] = [].concat(marks[i] || [], c);
    };
    for (const i of o.cmp || []) add(i, 'compare');
    for (const i of o.swap || []) add(i, 'swap');
    if (o.key != null) add(o.key, 'key');
    if (o.act != null) add(o.act, 'active');
    if (o.newAt != null) add(o.newAt, 'key');
    for (const i of o.dim || []) add(i, 'out');
    // "già heap" solo dove non c'è uno stato più importante (il testo resterebbe illeggibile)
    for (const i of o.visited || []) if (!marks[i]) add(i, 'visited');
    return {
      a: a.slice(),
      ids: ids.slice(),
      n: o.n == null ? a.length : o.n,
      marks,
      ptrs: o.ptrs || {},
      done: o.done || [],
      pathEdges: o.path || [],
      float: o.float || null,
      result: o.result,
    };
  }

  /**
   * Fotogrammi di siftDown(a, i, n). Le etichette (down-*) sono le stesse in
   * heap_maxheap.cpp e in heap_heapsort.cpp. ctx.extra() aggiunge allo stato
   * quello che serve al chiamante (parte ordinata, massimo estratto, …).
   */
  function traceSiftDown(t, a, ids, i, n, ctx) {
    const S = (o) => heapState(a, ids, Object.assign({ n }, ctx.extra(), o));
    const V = (o) => Object.assign({ i, n }, o);
    for (;;) {
      const l = 2 * i + 1;
      if (!(l < n)) {
        t.step(
          'down-loop',
          `2·${i}+1 = ${l} ≥ n = ${n}: a[${i}] non ha figli dentro l'heap, il ciclo finisce. ${a[i]} è al suo posto.`,
          V({}),
          S({ act: i, ptrs: { i } })
        );
        return;
      }
      t.step('down-loop', `2·${i}+1 = ${l} &lt; n = ${n}: a[${i}] = ${a[i]} ha almeno un figlio, si controlla.`, V({}), S({ act: i, ptrs: { i } }));
      let mm = l;
      const r = l + 1;
      const hasR = r < n;
      t.step(
        'down-kids',
        `m = 2·${i}+1 = ${l} (figlio sinistro, ${a[l]})${hasR ? `, r = 2·${i}+2 = ${r} (figlio destro, ${a[r]})` : `, r = ${r}: fuori dall'heap, il figlio destro non c'è`}.`,
        V({ m: l, r }),
        S({ act: i, cmp: hasR ? [l, r] : [l], ptrs: { i, m: l } })
      );
      if (hasR) t.count('confronti');
      if (hasR && a[r] > a[mm]) mm = r;
      t.step(
        'down-max',
        hasR
          ? mm === r
            ? `a[r] = ${a[r]} &gt; a[m] = ${a[l]}: il figlio più grande è il destro, m = ${r}.`
            : `a[r] = ${a[r]} &gt; a[m] = ${a[l]}? No: il più grande è il sinistro, m resta ${l}.`
          : `r non è &lt; n: m resta il figlio sinistro, ${l}.`,
        V({ m: mm, r }),
        S({ act: i, key: mm, ptrs: { i, m: mm } })
      );
      t.count('confronti');
      const stop = a[i] >= a[mm];
      t.step(
        'down-stop',
        stop
          ? `a[i] = ${a[i]} ≥ a[m] = ${a[mm]}: il padre è già più grande dei figli, la proprietà vale. <code>return</code>.`
          : `a[i] = ${a[i]} &lt; a[m] = ${a[mm]}: il padre è più piccolo del figlio maggiore, vanno scambiati.`,
        V({ m: mm, r }),
        S({ cmp: [i, mm], ptrs: { i, m: mm } })
      );
      if (stop) return;
      [a[i], a[mm]] = [a[mm], a[i]];
      [ids[i], ids[mm]] = [ids[mm], ids[i]];
      t.count('scambi');
      t.step(
        'down-swap',
        `swap(a[${i}], a[${mm}]): ${a[i]} sale, ${a[mm]} scende. Si scambia con il figlio <em>maggiore</em>: così il nuovo padre è più grande di tutti e due i figli.`,
        V({ m: mm, r }),
        S({ swap: [i, mm], ptrs: { i, m: mm }, path: [mm] })
      );
      i = mm;
      t.step('down-move', `i = m = ${i}: si continua dal punto in cui è sceso ${a[i]}.`, V({ m: mm }), S({ act: i, ptrs: { i } }));
    }
  }

  /* ----------------------------------------------------------- tracce */

  T.trace.heapInsert = function (input) {
    const a = input.a.slice();
    const ids = a.map((_, i) => i);
    const x = input.x;
    const t = new ASD.Tracer(['confronti', 'scambi']);
    const S = (o) => heapState(a, ids, o);
    a.push(x);
    ids.push(a.length - 1);
    let i = a.length - 1;
    const newId = ids[i];
    const at = () => ids.indexOf(newId);
    t.step(
      'ins-push',
      `<code>a.push_back(${x})</code>: ${x} va nella prima casella libera, a[${i}]. L'albero resta completo, ma ${x} potrebbe essere più grande del padre.`,
      { x, i },
      S({ newAt: i, ptrs: { i } })
    );
    t.step('ins-up', `<code>siftUp(a, ${i})</code>: ${x} risale finché trova un padre più grande o arriva alla radice.`, { x, i }, S({ newAt: i, ptrs: { i } }));
    for (;;) {
      if (i === 0) {
        t.step('up-cmp', `i = 0: ${a[0]} è arrivato alla radice. La condizione <code>i &gt; 0</code> è falsa e il ciclo finisce.`, { x, i }, S({ newAt: 0, ptrs: { i } }));
        break;
      }
      const p = HP.parent(i);
      t.count('confronti');
      const go = a[p] < a[i];
      t.step(
        'up-cmp',
        go
          ? `padre(${i}) = (${i}−1)/2 = ${p}. a[${p}] = ${a[p]} &lt; a[${i}] = ${a[i]}: il padre è più piccolo, si scambia.`
          : `padre(${i}) = (${i}−1)/2 = ${p}. a[${p}] = ${a[p]} ≥ a[${i}] = ${a[i]}: la proprietà vale, il ciclo finisce.`,
        { x, i, 'padre(i)': p },
        S({ cmp: [i, p], ptrs: { i, padre: p } })
      );
      if (!go) break;
      [a[p], a[i]] = [a[i], a[p]];
      [ids[p], ids[i]] = [ids[i], ids[p]];
      t.count('scambi');
      t.step('up-swap', `swap(a[${p}], a[${i}]): ${a[p]} sale, ${a[i]} scende.`, { x, i, 'padre(i)': p }, S({ swap: [p, i], ptrs: { i, padre: p }, path: [i] }));
      i = p;
      t.step('up-move', `i = padre(i) = ${i}.`, { x, i }, S({ newAt: at(), ptrs: { i } }));
    }
    const lg = Math.floor(Math.log2(a.length));
    t.step(
      null,
      `Fatto: ${x} è salito di ${t.c.scambi} ${t.c.scambi === 1 ? 'livello' : 'livelli'}. Al massimo si sale dalla foglia alla radice, ⌊log₂ n⌋ = ${lg} scambi: l'inserimento costa O(log n).`,
      {},
      S({ newAt: at(), result: a.slice() })
    );
    return t.frames;
  };

  T.trace.heapExtract = function (input) {
    const a = input.a.slice();
    const ids = a.map((_, i) => i);
    let next = a.length;
    const t = new ASD.Tracer(['confronti', 'scambi']);
    const massimo = a[0];
    const float = { value: massimo, id: 'max', at: 0, mark: 'key' };
    const S = (o) => heapState(a, ids, Object.assign({ float }, o));
    t.step('ext-max', `<code>massimo = a[0] = ${massimo}</code>: in un max-heap il massimo è sempre nella radice. Lo metto da parte (la casella sollevata).`, { massimo }, S({ key: 0 }));
    const last = a.length - 1;
    a[0] = a[last];
    ids[0] = ids[last];
    ids[last] = next++;
    t.step(
      'ext-last',
      last
        ? `<code>a[0] = a.back()</code>: l'ultimo elemento, ${a[0]}, prende il posto della radice. Così la forma resta completa; ma ${a[0]} è piccolo e dovrà scendere.`
        : `<code>a[0] = a.back()</code>: c'è un solo elemento, si copia su se stesso.`,
      { massimo },
      S({ swap: [0], dim: last ? [last] : [] })
    );
    a.pop();
    ids.pop();
    t.step('ext-pop', `<code>a.pop_back()</code>: tolgo l'ultima casella. L'heap ha ${a.length} ${a.length === 1 ? 'elemento' : 'elementi'}.`, { massimo, n: a.length }, S({ act: a.length ? 0 : null }));
    t.step('ext-down', `<code>siftDown(a, 0, ${a.length})</code>: ${a.length ? `${a[0]} scende finché non è più grande dei suoi figli.` : 'l\'heap è vuoto, non c\'è niente da sistemare.'}`, { massimo, n: a.length }, S({ act: a.length ? 0 : null }));
    traceSiftDown(t, a, ids, 0, a.length, { extra: () => ({ float }) });
    t.step('ext-ret', `<code>return massimo</code>: ${massimo}.`, { massimo }, S({}));
    t.step(
      null,
      `Estratto ${massimo}. Il nuovo massimo, ${a.length ? a[0] : '—'}, è in a[0]. Si è sceso al più di un livello per scambio, ⌊log₂ n⌋ livelli in tutto: O(log n).`,
      {},
      S({ result: { a: a.slice(), max: massimo } })
    );
    return t.frames;
  };

  /** Fotogrammi di buildHeap (usati da solo e dentro l'heapsort). */
  function traceBuild(t, a, ids, ctx) {
    const n = a.length;
    const heapish = new Set();
    const subtree = (i) => {
      const out = [];
      const go = (j) => {
        if (j >= n) return;
        out.push(j);
        go(2 * j + 1);
        go(2 * j + 2);
      };
      go(i);
      return out;
    };
    for (let j = Math.floor(n / 2); j < n; j++) heapish.add(j);
    const extra = () => Object.assign({ visited: [...heapish] }, ctx.extra());
    const S = (o) => heapState(a, ids, Object.assign(extra(), o));
    const first = Math.floor(n / 2) - 1;
    if (first < 0) {
      t.step('build-loop', `n = ${n}: i = n/2 − 1 = −1, non c'è nessun nodo interno. Un solo elemento è già un heap.`, { n }, S({}));
      return;
    }
    for (let i = first; i >= 0; i--) {
      t.step(
        'build-loop',
        i === first
          ? `n = ${n}. Le foglie a[${Math.floor(n / 2)}..${n - 1}] (in grigio) sono heap da sole. Si parte dall'ultimo nodo interno: i = n/2 − 1 = ${i}.`
          : `i = ${i}: i sottoalberi dei suoi figli sono già heap (in grigio).`,
        { i, n },
        S({ act: i, ptrs: { i } })
      );
      t.step('build-down', `<code>siftDown(a, ${i}, ${n})</code>: sistemo il sottoalbero con radice a[${i}] = ${a[i]}.`, { i, n }, S({ act: i, ptrs: { i } }));
      traceSiftDown(t, a, ids, i, n, { extra });
      for (const j of subtree(i)) heapish.add(j);
    }
    t.step('build-loop', `i = −1: il ciclo finisce. Tutto l'array è un max-heap; il massimo, ${a[0]}, è in a[0].`, { n }, S({}));
  }

  T.trace.buildHeap = function (input) {
    const a = input.a.slice();
    const ids = a.map((_, i) => i);
    const t = new ASD.Tracer(['confronti', 'scambi']);
    traceBuild(t, a, ids, { extra: () => ({}) });
    const n = a.length;
    let bound = 0;
    for (let i = 0; i < n; i++) bound += HP.heightAt(i, n);
    t.step(
      null,
      `Fatto con ${t.c.scambi} scambi e ${t.c.confronti} confronti. Ogni nodo può scendere al più quanto la sua altezza: la somma delle altezze qui è ${bound}, meno di n = ${n}. Ecco perché build-heap costa O(n).`,
      {},
      heapState(a, ids, { result: a.slice() })
    );
    return t.frames;
  };

  T.trace.heapsort = function (input) {
    const a = input.a.slice();
    const ids = a.map((_, i) => i);
    const n = a.length;
    const t = new ASD.Tracer(['confronti', 'scambi']);
    const done = [];
    t.step('hs-build', `Prima fase: <code>buildHeap(a)</code> trasforma l'array in un max-heap, in O(n).`, { n }, heapState(a, ids, {}));
    traceBuild(t, a, ids, { extra: () => ({}) });
    for (let i = n - 1; i > 0; i--) {
      const S = (o) => heapState(a, ids, Object.assign({ done: done.slice() }, o));
      t.step(
        'hs-loop',
        `i = ${i}: l'heap è a[0..${i}]${done.length ? `, la parte ordinata (in verde) è a[${i + 1}..${n - 1}]` : ''}. Il massimo dell'heap è a[0] = ${a[0]}.`,
        { i, n },
        S({ n: i + 1, key: 0, ptrs: { i } })
      );
      [a[0], a[i]] = [a[i], a[0]];
      [ids[0], ids[i]] = [ids[i], ids[0]];
      t.count('scambi');
      done.unshift(i);
      t.step(
        'hs-swap',
        `swap(a[0], a[${i}]): il massimo ${a[i]} va in fondo, nella sua posizione definitiva. In a[0] è arrivato ${a[0]}.`,
        { i, n },
        heapState(a, ids, { done: done.slice(), n: i, swap: [0], ptrs: { i } })
      );
      t.step(
        'hs-down',
        `<code>siftDown(a, 0, ${i})</code>: l'heap adesso è a[0..${i - 1}]; ${a[0]} scende al suo posto.`,
        { i, n },
        heapState(a, ids, { done: done.slice(), n: i, act: 0 })
      );
      traceSiftDown(t, a, ids, 0, i, { extra: () => ({ done: done.slice(), n: i }) });
    }
    done.unshift(0);
    t.step('hs-loop', `i = 0: il ciclo finisce. Resta a[0] = ${a[0]}, il più piccolo, già al suo posto.`, { n }, heapState(a, ids, { done: done.slice(), n: 0 }));
    t.step(
      null,
      `Ordinato: ${a.join(' ')}. ${t.c.confronti} confronti e ${t.c.scambi} scambi. n − 1 estrazioni da O(log n) ciascuna: O(n log n), sul posto.`,
      {},
      heapState(a, ids, { done: done.slice(), n: 0, result: a.slice() })
    );
    return t.frames;
  };

  /* ---------------------------------------------------------------- capitolo */

  ASD.chapter({
    id: 'heap',
    title: 'Heap e code con priorità',
    lead:
      'Uno heap è un albero binario completo salvato in un array, in cui ogni padre è più grande dei suoi figli. Dà il massimo in O(1) e lo toglie in O(log n): è la struttura che sta dietro alle code con priorità, all\'heapsort e a std::priority_queue.',
    minutes: 50,
    prereq: ['alberi', 'sort-semplici'],
    goals: [
      `passare da un indice dell'array al padre e ai figli con gli indici da 0: ${m('(i-1)/2')}, ${m('2i+1')}, ${m('2i+2')}`,
      'controllare se un array è un max-heap ed eseguire a mano sift-up e sift-down',
      `spiegare perché build-heap costa ${m('O(n)')} e non ${m('O(n log n)')}`,
      'eseguire l\'heapsort a mano e dire perché è sul posto ma non stabile',
      'usare std::priority_queue come max-heap e come min-heap',
    ],

    render(el) {
      el.innerHTML = `
<section id="coda">
  <h2>Code con priorità</h2>
  <p>Una <strong>coda con priorità</strong> (<i>priority queue</i>) contiene elementi con una chiave, la priorità, e offre
  tre operazioni: <strong>inserisci</strong> un elemento, leggi il <strong>massimo</strong>, <strong>estrai</strong> il
  massimo. Non esce il primo arrivato, come in una ${ASD.link('pile-code', null, 'coda')}, ma il più importante. Servono
  ovunque ci sia "il prossimo da servire": i processi di un sistema operativo, gli eventi di una simulazione, gli algoritmi
  di ${ASD.link('cammini-minimi', null, 'Dijkstra')} e di ${ASD.link('mst', null, 'Prim')}.</p>
  ${table({
    caption: 'Tre modi di fare una coda con priorità',
    head: ['Struttura', 'Inserisci', 'Massimo', 'Estrai massimo'],
    rows: [
      ['Array non ordinato', m('O(1)'), m('Θ(n)'), m('Θ(n)')],
      ['Array ordinato', m('Θ(n)'), m('O(1)'), m('O(1)')],
      ['<strong>Heap binario</strong>', m('O(log n)'), m('O(1)'), m('O(log n)')],
    ],
  })}
  <p>L'array non ordinato è veloce a inserire e lento a estrarre; quello ordinato il contrario. Lo heap è il compromesso:
  tutte e due le operazioni in ${m('O(log n)')}, e il massimo sempre pronto in cima.</p>
</section>

<section id="struttura">
  <h2>Un albero completo dentro un array</h2>
  <p>Uno <strong>heap binario</strong> ha due proprietà.</p>
  <ol>
    <li><strong>Forma</strong>: è un albero binario ${ASD.link('alberi', 'forme', 'completo')}, cioè tutti i livelli sono pieni
    tranne l'ultimo, riempito da sinistra. Per questo si salva in un array senza buchi, livello per livello, come si è visto
    in ${ASD.link('alberi', 'array', 'Un albero in un array')}.</li>
    <li><strong>Ordine</strong> (max-heap): ogni nodo è maggiore o uguale ai suoi figli, ${m('a[padre(i)] >= a[i]')}. Quindi
    ogni nodo è il massimo del suo sottoalbero, e la radice <code>a[0]</code> è il massimo di tutto.</li>
  </ol>
  <p>Con gli indici da 0 del C++:</p>
  <div data-mount="codice-indici"></div>
  ${box('errore', `<p>Il Cormen e molti appunti usano gli array da 1: padre ${m('⌊i/2⌋')}, figli ${m('2i')} e ${m('2i + 1')}.
  Copiati su un array C++ che parte da 0 danno indici sbagliati di uno. Un trucco per ricordare la versione da 0: i figli di
  0 devono essere 1 e 2. Attenzione anche al padre della radice: in C++ <code>(0 - 1) / 2</code> vale 0 (la divisione tra
  interi tronca verso lo zero), non −1. Per questo il codice controlla <code>i &gt; 0</code> prima di salire.</p>`)}
  <p>Qualche conseguenza da sapere:</p>
  <ul>
    <li>l'altezza è ${m('⌊log_2 n⌋')}: l'albero è completo;</li>
    <li>le foglie sono <code>a[n/2]</code> … <code>a[n-1]</code> (con la divisione intera): mezzo array; l'ultimo nodo
    interno è <code>a[n/2 - 1]</code>;</li>
    <li>in un max-heap il <strong>minimo</strong> sta in una foglia, ma non si sa quale;</li>
    <li>fratelli e cugini non sono ordinati tra loro: uno heap <em>non</em> è un array ordinato, e cercare una chiave
    qualsiasi costa ${m('O(n)')}. Un array ordinato in modo decrescente, invece, è sempre un max-heap.</li>
  </ul>
  <p>Prova tu: scrivi un array e guarda se è un max-heap. Gli archi rossi sono le coppie padre-figlio sbagliate.</p>
  <div data-mount="controlla"></div>
  ${box('nota', `Un <strong>min-heap</strong> è lo stesso con la disuguaglianza rovesciata: ogni padre è minore o uguale ai
  figli e il minimo sta in <code>a[0]</code>. Tutto quello che segue vale uguale, scambiando "maggiore" con "minore".`, 'Min-heap')}
</section>

<section id="inserimento">
  <h2>Inserimento: sift-up</h2>
  <p>Per non rompere la forma, il nuovo elemento va nella prima casella libera, in fondo all'array (l'ultimo livello si
  riempie da sinistra). Ma può essere più grande di suo padre: allora si scambiano, e si ripete finché il padre è più grande
  oppure si arriva alla radice. L'elemento <strong>risale</strong> (<i>sift-up</i>, <i>bubble-up</i>).</p>
  <div data-mount="inserisci"></div>
  <p>Ogni scambio fa salire l'elemento di un livello: al più ${m('⌊log_2 n⌋')} scambi, quindi ${m('O(log n)')}. Lo scambio non
  rompe niente sotto: il padre che scende era più grande di tutto il suo vecchio sottoalbero.</p>
</section>

<section id="estrazione">
  <h2>Estrazione del massimo: sift-down</h2>
  <p>Il massimo è in <code>a[0]</code>. Per toglierlo senza lasciare un buco, si mette in <code>a[0]</code> l'<strong>ultimo</strong>
  elemento e si accorcia l'array: la forma è salva. Il nuovo <code>a[0]</code> però è di solito piccolo: lo si fa
  <strong>scendere</strong> (<i>sift-down</i>), scambiandolo ogni volta con il <strong>maggiore</strong> dei due figli,
  finché è più grande di entrambi o diventa una foglia.</p>
  <div data-mount="estrai"></div>
  ${box('errore', `<p>Scambiare con il figlio <em>sinistro</em> (o con uno qualsiasi) invece che con il maggiore. Se il padre
  scende verso il figlio minore, quel figlio sale sopra il fratello più grande e la proprietà salta. Il confronto
  <code>a[r] &gt; a[m]</code> serve proprio a scegliere il maggiore.</p>`)}
  <p>Anche qui un livello per scambio, al più ${m('⌊log_2 n⌋')}, con 2 confronti per livello: ${m('O(log n)')}. Nel Cormen
  questa procedura si chiama MAX-HEAPIFY, nel Demetrescu fixHeap.</p>
</section>

<section id="build">
  <h2>Costruire uno heap in tempo lineare</h2>
  <p>Per trasformare un array qualsiasi in uno heap si potrebbero inserire gli elementi uno alla volta: ${m('n')} sift-up, fino
  a ${m('O(n log n)')}. C'è un modo migliore, <strong>build-heap</strong>: le foglie (metà dell'array) sono già heap da sole;
  si fa sift-down su ogni nodo interno, dall'ultimo (<code>n/2 - 1</code>) fino alla radice. Quando si arriva al nodo
  <var>i</var>, i sottoalberi dei suoi figli sono già heap, e un sift-down basta a sistemare il sottoalbero di <var>i</var>.</p>
  <div data-mount="build"></div>
  <h3>Perché O(n)</h3>
  <p>Un sift-down da un nodo di altezza <var>h</var> fa al più <var>h</var> scambi. Ma i nodi alti sono pochi: metà dei nodi
  sono foglie (altezza 0, nessuno scambio), circa un quarto ha altezza 1, un ottavo altezza 2, e così via. In totale, al più</p>
  <p class="formula">${m('n/4 · 1 + n/8 · 2 + n/16 · 3 + … = n · Σ_{h>=1} h/2^{h+1} = n')}</p>
  <p>scambi, perché ${m('Σ_{h>=1} h/2^h = 2')}. Gli n sift-up invece costano tanto proprio dove i nodi sono tanti: le foglie,
  che sono metà, salirebbero di ${m('log_2 n')} livelli ciascuna. Il grafico confronta i due limiti (il numero massimo di
  scambi) al crescere di <var>n</var>.</p>
  <div data-mount="grafico"></div>
  ${box('ricorda', `<p>Build-heap costa ${m('O(n)')}: lo si dimostra sommando le altezze dei nodi, non moltiplicando
  ${m('n/2')} sift-down per ${m('O(log n)')} (quello dà solo il limite superiore ${m('O(n log n)')}, giusto ma largo).</p>`)}
</section>

<section id="heapsort">
  <h2>Heapsort</h2>
  <p>Con uno heap si ordina sul posto. Prima build-heap; poi, per <var>i</var> da ${m('n - 1')} a 1: si scambia
  <code>a[0]</code> (il massimo dell'heap) con <code>a[i]</code>, che così è al suo posto definitivo, e si fa sift-down di
  <code>a[0]</code> sull'heap ridotto <code>a[0..i-1]</code>. L'heap si accorcia da destra e la parte ordinata cresce in
  fondo.</p>
  <div data-mount="heapsort"></div>
  <ul>
    <li><strong>Costo</strong>: build-heap ${m('O(n)')} più ${m('n - 1')} sift-down da ${m('O(log n)')}: ${m('O(n log n)')}
    anche nel caso peggiore, a differenza del ${ASD.link('quick-sort', null, 'quicksort')}.</li>
    <li><strong>Sul posto</strong>: usa ${m('O(1)')} memoria in più, a differenza del ${ASD.link('merge-sort', null, 'merge sort')}.</li>
    <li><strong>Non stabile</strong>: con <code>[2<sub>a</sub>, 2<sub>b</sub>, 1]</code> (che è già un max-heap) il primo
    scambio manda 2<sub>a</sub> in fondo e il risultato è <code>[1, 2<sub>b</sub>, 2<sub>a</sub>]</code>: i due 2 si sono
    invertiti.</li>
  </ul>
  ${box('esame', `<p>Domanda classica: "esegui l'heapsort su [5, 13, 2, 25, 7, 17, 20, 8] e scrivi l'array dopo build-heap e dopo
  ogni estrazione". Scrivi l'array, ma disegna anche l'albero accanto: sift-up e sift-down si fanno guardando l'albero, poi
  si ricopia l'array livello per livello. Dopo build-heap qui viene <code>25 13 20 8 7 17 2 5</code>.</p>`)}
</section>

<section id="stl">
  <h2>std::priority_queue</h2>
  <p>In C++ la coda con priorità è pronta: <code>std::priority_queue</code> (in <code>&lt;queue&gt;</code>) è uno heap su un
  <code>vector</code>. Per default è un <strong>max-heap</strong>: <code>top()</code> dà il più grande. Per un min-heap si
  passa il confronto <code>greater&lt;int&gt;</code> (in <code>&lt;functional&gt;</code>).</p>
  <div data-mount="codice-stl"></div>
  <p>Output del programma:</p>
  <pre class="code-out" tabindex="0"><code>top: 25
estratti: 25 13 7 5 2
estratti dal min-heap: 2 5 7 13 25
priorità 5: backup
priorità 2: stampa
priorità 1: pulizia</code></pre>
  ${box('errore', `<p><code>pop()</code> non restituisce niente: <code>int x = pq.pop();</code> non compila. Prima si legge con
  <code>top()</code>, poi si toglie con <code>pop()</code>. E <code>top()</code> su una coda vuota è un comportamento
  indefinito: controlla <code>empty()</code>.</p>`)}
  ${box('nota', `<p><code>priority_queue</code> non permette di cambiare la priorità di un elemento già dentro (la
  <i>decrease-key</i> di Dijkstra). Il trucco usuale: si inserisce di nuovo l'elemento con la priorità nuova e, quando esce
  la copia vecchia, la si ignora. In <code>&lt;algorithm&gt;</code> ci sono anche <code>make_heap</code>,
  <code>push_heap</code>, <code>pop_heap</code> e <code>sort_heap</code>, che lavorano su un vector qualsiasi.</p>`, 'Da sapere')}
</section>

<section id="costi">
  <h2>Quanto costa</h2>
  ${table({
    caption: 'Heap binario con n elementi',
    head: ['Operazione', 'Costo', 'Perché'],
    rows: [
      ['Massimo (<code>top</code>)', m('O(1)'), 'è in <code>a[0]</code>'],
      ['Inserimento (<code>push</code>)', m('O(log n)'), 'sift-up: al più un livello per scambio'],
      ['Estrazione del massimo (<code>pop</code>)', m('O(log n)'), 'sift-down: 2 confronti per livello'],
      ['Build-heap', m('O(n)'), 'somma delle altezze dei nodi, minore di n'],
      ['Heapsort', m('O(n log n)'), 'anche nel caso peggiore; sul posto; non stabile'],
      ['Cercare una chiave qualsiasi', m('O(n)'), 'lo heap non è ordinato tra fratelli'],
      ['Padre e figli di <code>a[i]</code>', m('O(1)'), `${m('(i-1)/2')}, ${m('2i+1')}, ${m('2i+2')}`],
    ],
  })}
</section>

<section id="esame">
  <h2>All'esame</h2>
  <ol>
    <li><strong>È uno heap?</strong> Per ogni <var>i</var> da 0 a ${m('n/2 - 1')} confronta <code>a[i]</code> con
    <code>a[2i+1]</code> e <code>a[2i+2]</code>.</li>
    <li><strong>Simulazione</strong>: "inserisci 30 nello heap …", "estrai il massimo da …", "costruisci lo heap con build-heap
    da …": disegna l'albero, fai gli scambi, ricopia l'array.</li>
    <li><strong>Teoria</strong>: perché build-heap è ${m('O(n)')}; dove sta il minimo di un max-heap; heapsort è stabile?
    è sul posto?</li>
    <li><strong>Indici</strong>: con gli array da 1 o da 0? Leggi bene il testo e usa le formule giuste.</li>
  </ol>
  ${box('esame', `<p>Errore che costa punti: nel sift-down confrontare il padre con un solo figlio. Si sceglie prima il
  <strong>maggiore</strong> dei figli, poi lo si confronta con il padre.</p>`)}
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        'codice-indici': (host) => ASD.code(host, { src: 'strutture/heap_maxheap', region: 'indici' }),
        controlla: mountControlla,
        inserisci: mountInserisci,
        estrai: mountEstrai,
        build: mountBuild,
        grafico: mountGrafico,
        heapsort: mountHeapsort,
        'codice-stl': (host) => ASD.code(host, { src: 'strutture/heap_stl', maxHeight: 440 }),
        quiz: mountQuiz,
      });
    },
  });

  /* ------------------------------------------------------------ stepper */

  const heapLegend = [
    { k: 'active', label: 'nodo corrente' },
    { k: 'compare', label: 'confronto' },
    { k: 'swap', label: 'scambio' },
    { k: 'key', label: 'figlio maggiore / nuovo' },
  ];

  /** Input "array" per gli stepper dello heap. mustBeHeap: rifiuta un array che non è un max-heap. */
  function arrayInput(o) {
    return {
      label: 'Array',
      parse: (s) => {
        const a = T.parse.keys(s, { min: 1, max: 99, minLen: o.minLen || 1, maxLen: o.maxLen || 12, distinct: false });
        if (o.mustBeHeap) {
          const v = HP.violations(a)[0];
          if (v) {
            throw new Error(
              `Non è un max-heap: a[${v.p}] = ${a[v.p]} è minore di suo figlio a[${v.c}] = ${a[v.c]}. Scegli un preset o costruiscilo prima con build-heap.`
            );
          }
        }
        return Object.assign({ a }, o.extra ? o.extra() : {});
      },
      format: (v) => {
        if (o.sync) o.sync(v);
        return v.a.join(' ');
      },
    };
  }

  function mountInserisci(host) {
    const ui = {};
    const inp = arrayInput({ mustBeHeap: true, maxLen: 14, extra: () => ({ x: T.parse.int(ui.x, 'Inserisci') }), sync: (v) => ui.x && (ui.x.value = String(v.x)) });
    const st = ASD.stepper(host, {
      id: 'heap-inserisci',
      title: 'Inserimento con sift-up',
      code: { src: 'strutture/heap_maxheap', region: 'siftup' },
      input: Object.assign(inp, {
        value: { a: HEAP8.slice(), x: 30 },
        presets: [
          { label: 'Fino in cima (30)', value: () => ({ a: HEAP8.slice(), x: 30 }) },
          { label: 'A metà (22)', value: () => ({ a: HEAP8.slice(), x: 22 }) },
          { label: 'Subito fermo (3)', value: () => ({ a: HEAP8.slice(), x: 3 }) },
          { label: 'Casuale', value: () => ({ a: HP.randomHeap(ASD.randInt(6, 11)), x: ASD.randInt(1, 99) }) },
        ],
      }),
      view: (stage) => new T.HeapView(stage, { mode: 'cells' }),
      trace: T.trace.heapInsert,
      counters: [
        { key: 'confronti', label: 'confronti' },
        { key: 'scambi', label: 'scambi' },
      ],
      legend: heapLegend,
      validate: (input, frames) => {
        const r = frames[frames.length - 1].state.result;
        if (!r || !HP.isHeap(r)) return 'il risultato non è un max-heap';
        const want = input.a.concat(input.x).sort((x, y) => x - y).join(',');
        return r.slice().sort((x, y) => x - y).join(',') === want ? null : 'gli elementi non tornano';
      },
    });
    ui.x = T.field(st, { name: 'x', label: 'Inserisci', type: 'number', value: st.value.x, min: 1, max: 99 });
  }

  function mountEstrai(host) {
    const st = ASD.stepper(host, {
      id: 'heap-estrai',
      title: 'Estrazione del massimo con sift-down',
      code: { src: 'strutture/heap_maxheap', region: 'siftdown' },
      input: Object.assign(arrayInput({ mustBeHeap: true, maxLen: 14 }), {
        value: { a: HEAP9.slice() },
        presets: [
          { label: 'Esempio', value: () => ({ a: HEAP9.slice() }) },
          { label: 'Ordinato decrescente', value: () => ({ a: [90, 80, 70, 60, 50, 40, 30, 20, 10] }) },
          { label: 'Casuale', value: () => ({ a: HP.randomHeap(ASD.randInt(7, 12)) }) },
        ],
      }),
      view: (stage) => new T.HeapView(stage, { mode: 'cells', float: true }),
      trace: T.trace.heapExtract,
      counters: [
        { key: 'confronti', label: 'confronti' },
        { key: 'scambi', label: 'scambi' },
      ],
      legend: heapLegend,
      validate: (input, frames) => {
        const r = frames[frames.length - 1].state.result;
        if (!r) return 'manca il risultato';
        if (r.max !== Math.max(...input.a)) return 'estratto ' + r.max + ' invece del massimo';
        if (!HP.isHeap(r.a)) return 'dopo l\'estrazione non è un max-heap';
        const rest = input.a.slice().sort((x, y) => x - y);
        rest.pop();
        return r.a.slice().sort((x, y) => x - y).join(',') === rest.join(',') ? null : 'gli elementi non tornano';
      },
    });
    return st;
  }

  function mountBuild(host) {
    ASD.stepper(host, {
      id: 'heap-build',
      title: 'Build-heap passo per passo',
      code: { src: 'strutture/heap_heapsort', region: 'build' },
      input: Object.assign(arrayInput({ maxLen: 14 }), {
        value: { a: INPUT8.slice() },
        presets: [
          { label: 'Esempio', value: () => ({ a: INPUT8.slice() }) },
          { label: 'Crescente', value: () => ({ a: [10, 20, 30, 40, 50, 60, 70, 80, 90] }) },
          { label: 'Casuale', value: () => ({ a: ASD.randomDistinct(ASD.randInt(7, 11), 1, 99) }) },
        ],
      }),
      view: (stage) => new T.HeapView(stage, { mode: 'cells' }),
      trace: T.trace.buildHeap,
      counters: [
        { key: 'confronti', label: 'confronti' },
        { key: 'scambi', label: 'scambi' },
      ],
      legend: heapLegend.concat([{ k: 'visited', label: 'sottoalbero già heap' }]),
      validate: (input, frames) => {
        const r = frames[frames.length - 1].state.result;
        if (!r || !HP.isHeap(r)) return 'il risultato non è un max-heap';
        const want = HP.build(input.a.slice()).join(',');
        return r.join(',') === want ? null : `heap ${r.join(',')}, atteso ${want}`;
      },
    });
  }

  function mountHeapsort(host) {
    ASD.stepper(host, {
      id: 'heapsort',
      title: 'Heapsort: albero e array insieme',
      code: { src: 'strutture/heap_heapsort', region: 'sort' },
      input: Object.assign(arrayInput({ maxLen: 12, minLen: 2 }), {
        value: { a: INPUT8.slice() },
        presets: [
          { label: 'Casuale', value: () => ({ a: ASD.randomDistinct(7, 5, 60) }) },
          { label: 'Già ordinato', value: () => ({ a: ASD.randomDistinct(7, 5, 60).sort((x, y) => x - y) }) },
          { label: 'Al contrario', value: () => ({ a: ASD.randomDistinct(7, 5, 60).sort((x, y) => y - x) }) },
        ],
      }),
      view: (stage) => new T.HeapView(stage, { mode: 'bars', height: 150 }),
      trace: T.trace.heapsort,
      counters: [
        { key: 'confronti', label: 'confronti' },
        { key: 'scambi', label: 'scambi' },
      ],
      legend: [
        { k: 'active', label: 'nodo corrente' },
        { k: 'compare', label: 'confronto' },
        { k: 'swap', label: 'scambio' },
        { k: 'key', label: 'figlio maggiore / massimo' },
        { k: 'done', label: 'ordinato, fuori dall\'heap' },
      ],
      validate: (input, frames) => {
        const r = frames[frames.length - 1].state.result;
        const want = input.a.slice().sort((x, y) => x - y).join(',');
        return r && r.join(',') === want ? null : 'l\'array finale non è ordinato';
      },
    });
  }

  /* ------------------------------------------------------------ laboratori */

  function mountControlla(host) {
    const lab = h('div.lab.tr-lab');
    const body = h('div.lab-body.quadretti');
    const controls = h('div.lab-controls');
    const out = h('div.lab-out.tr-lab-out', { 'aria-live': 'polite' });
    lab.append(h('div.lab-head', h('h3', { text: 'È un max-heap?' })), body, controls, out);
    host.append(lab);
    const view = new T.HeapView(body, { mode: 'cells' });
    const id = ASD.uid('tr-heap-arr');
    const field = h('input', { type: 'text', id, value: '20 15 18 7 9 16 5', class: 'tr-wide', spellcheck: 'false', autocomplete: 'off' });
    const err = h('p.st-err', { role: 'alert', hidden: true });
    const btn = (text, fn, cls = '') => h('button.btn.btn-sm' + cls, { type: 'button', text, onclick: fn });
    const set = (a) => {
      field.value = a.join(' ');
      check();
    };
    controls.append(
      h(
        'div.tr-ops',
        h('label.field', { for: id }, 'Array (indici da 0)', field),
        btn('Controlla', () => check()),
        h(
          'span.tr-ops-group',
          btn('Uno heap', () => set(HP.randomHeap(9)), '.btn-ghost'),
          btn('Quasi', () => {
            const a = HP.randomHeap(9);
            const i = ASD.randInt(1, 8);
            const p = HP.parent(i);
            [a[i], a[p]] = [a[p], a[i]];
            set(a);
          }, '.btn-ghost'),
          btn('Decrescente', () => set(ASD.randomDistinct(9, 1, 99).sort((x, y) => y - x)), '.btn-ghost'),
          btn('Casuale', () => set(ASD.randomDistinct(9, 1, 99)), '.btn-ghost')
        )
      ),
      err
    );

    function check() {
      let a;
      try {
        a = T.parse.keys(field.value, { min: 0, max: 99, minLen: 1, maxLen: 15, distinct: false });
        err.hidden = true;
      } catch (e) {
        err.textContent = e.message;
        err.hidden = false;
        return;
      }
      const bad = HP.violations(a);
      const cmp = [...new Set(bad.map((v) => v.p))];
      view.reset();
      view.render({ a, marks: Object.fromEntries(cmp.map((p) => [p, 'compare'])), bad: bad.map((v) => v.c) });
      const last = Math.floor(a.length / 2) - 1;
      out.innerHTML = bad.length
        ? `<p><strong>Non è un max-heap</strong>: ${bad.length} ${bad.length === 1 ? 'coppia sbagliata' : 'coppie sbagliate'}. ${bad
            .slice(0, 4)
            .map((v) => `a[${v.p}] = ${a[v.p]} &lt; a[${v.c}] = ${a[v.c]}`)
            .join('; ')}${bad.length > 4 ? '; …' : ''}.</p><p class="tr-lab-sum">Basta controllare i nodi interni, da a[0] ad a[${last}]: ognuno contro i figli 2i+1 e 2i+2.</p>`
        : `<p><strong>È un max-heap</strong>: ogni nodo interno (da a[0] ad a[${Math.max(0, last)}]) è ≥ dei suoi figli. Il massimo è a[0] = ${a[0]}.</p><p class="tr-lab-sum">Il minimo, ${Math.min(
            ...a
          )}, è in una foglia: le foglie sono a[${Math.floor(a.length / 2)}..${a.length - 1}].</p>`;
    }
    check();
  }

  /** Limiti sugli scambi: build-heap (somma delle altezze) contro n inserimenti (somma delle profondità). */
  function mountGrafico(host) {
    const lab = h('div.lab');
    const body = h('div.lab-body');
    const controls = h('div.lab-controls');
    const out = h('div.lab-out', { 'aria-live': 'polite' });
    lab.append(h('div.lab-head', h('h3', { text: 'Scambi nel caso peggiore: build-heap contro n inserimenti' })), body, controls, out);
    host.append(lab);
    const id = ASD.uid('tr-build-n');
    const nIn = h('input', { type: 'range', id, min: '16', max: '512', step: '16', value: '128', oninput: () => draw() });
    const nOut = h('output', { for: id });
    controls.append(h('label.slider', { for: id }, h('span', 'n massimo'), nIn, nOut));
    const plot = new ASD.viz.Plot(body, {
      x: { min: 1, max: 128, label: 'n', integer: true },
      y: { min: 0, label: 'scambi' },
      height: 280,
      ariaLabel: 'Numero massimo di scambi per costruire uno heap: build-heap resta sotto n, gli inserimenti crescono come n log n',
    });
    const sumHeights = (n) => {
      let s = 0;
      for (let i = 0; i < n; i++) s += HP.heightAt(i, n);
      return s;
    };
    const sumDepths = (n) => {
      let s = 0;
      for (let i = 1; i <= n; i++) s += Math.floor(Math.log2(i));
      return s;
    };
    function draw() {
      const N = Number(nIn.value);
      nOut.textContent = String(N);
      plot.o.x.max = N;
      plot.set({
        series: [
          { id: 'ins', label: 'inserimenti', slot: 2, fn: sumDepths },
          { id: 'n', label: 'n', slot: 7, fn: (n) => n, dashed: true },
          { id: 'bh', label: 'build-heap', slot: 1, fn: sumHeights },
        ],
      });
      out.innerHTML = `<p style="margin:0">Con <var>n</var> = ${N}: build-heap fa al più <strong>${sumHeights(N)}</strong> scambi
      (la somma delle altezze dei nodi, sempre sotto <var>n</var>); inserendo gli elementi uno alla volta si arriva fino a
      <strong>${sumDepths(N)}</strong> (la somma delle profondità, che cresce come ${m('n log n')}).</p>`;
    }
    draw();
  }

  /* ---------------------------------------------------------------- quiz */

  function mountQuiz(host) {
    ASD.quiz(host, [
      {
        q: 'Quale di questi array è un <strong>max-heap</strong> (indici da 0)?',
        options: [
          '<code>[20, 15, 18, 7, 9, 16, 5]</code>',
          '<code>[20, 15, 18, 16, 9, 7, 5]</code>',
          '<code>[18, 20, 15, 7, 9, 16, 5]</code>',
          '<code>[20, 18, 15, 7, 9, 16, 5]</code>',
        ],
        answer: 0,
        explain: `Si controlla ogni nodo interno contro i figli ${m('2i+1')} e ${m('2i+2')}. Nel primo: 20 ≥ 15, 18; 15 ≥ 7, 9;
        18 ≥ 16, 5. Nel secondo 15 &lt; 16 (a[1] e a[3]), nel terzo 18 &lt; 20 (a[0] e a[1]), nel quarto 15 &lt; 16 (a[2] e a[5]).`,
      },
      {
        q: 'In un max-heap con 10 elementi, dove può stare il <strong>minimo</strong>?',
        options: ['solo in <code>a[9]</code>', 'in una qualsiasi foglia, da <code>a[5]</code> ad <code>a[9]</code>', 'in <code>a[0]</code>', 'in una posizione qualsiasi'],
        answer: 1,
        explain: `Un nodo interno ha almeno un figlio minore o uguale a lui, quindi il minimo (con chiavi distinte) è una foglia.
        Le foglie sono da ${m('a[n/2] = a[5]')} ad ${m('a[n-1] = a[9]')}, e qualunque di loro può essere il minimo.`,
      },
      {
        q: 'Che array resta dopo l\'estrazione del massimo da <code>[9, 7, 8, 3, 5, 6]</code>?',
        options: ['<code>[8, 7, 6, 3, 5]</code>', '<code>[8, 7, 6, 5, 3]</code>', '<code>[7, 8, 6, 3, 5]</code>', '<code>[6, 7, 8, 3, 5]</code>'],
        answer: 0,
        explain: `Il 6 (ultimo) va in a[0]: <code>[6, 7, 8, 3, 5]</code>. Il figlio maggiore di 6 è 8 (a[2]): si scambiano,
        <code>[8, 7, 6, 3, 5]</code>. a[2] non ha figli (2·2+1 = 5 non è &lt; 5): fine. L'ultima opzione è l'array prima del
        sift-down.`,
      },
      {
        q: 'Perché build-heap costa O(n) e non O(n log n)?',
        options: [
          'perché la maggior parte dei nodi è vicina alle foglie e scende di pochi livelli',
          'perché sift-down costa O(1)',
          'perché si parte dalla radice e si scende una volta sola',
          'perché l\'array in input è già quasi ordinato',
        ],
        answer: 0,
        explain: `Metà dei nodi sono foglie e non scendono; un quarto scende al più di 1 livello, un ottavo di 2…: la somma è
        ${m('n · Σ h/2^{h+1} = n')}. Solo la radice può scendere di ${m('log_2 n')} livelli. Il sift-down di per sé costa
        ${m('O(h)')}, non ${m('O(1)')}, e build-heap parte dal fondo, non dalla radice.`,
      },
      {
        q: 'Quali affermazioni sull\'heapsort sono vere?',
        options: ['costa O(n log n) anche nel caso peggiore', 'è stabile', 'ordina sul posto, con O(1) memoria in più', 'su un array già ordinato costa O(n)'],
        answer: [0, 2],
        explain: `Build-heap ${m('O(n)')} più ${m('n - 1')} sift-down da ${m('O(log n)')}, sempre. Lavora dentro l'array.
        Non è stabile: <code>[2<sub>a</sub>, 2<sub>b</sub>, 1]</code> diventa <code>[1, 2<sub>b</sub>, 2<sub>a</sub>]</code>.
        Un array già ordinato non aiuta: le estrazioni costano ${m('O(log n)')} l'una lo stesso.`,
      },
      {
        q: 'Che cosa stampa questo codice?',
        code: `priority_queue<int> pq;
pq.push(3);
pq.push(8);
pq.push(5);
cout << pq.top() << ' ';
pq.pop();
cout << pq.top();`,
        options: ['<code>8 5</code>', '<code>3 5</code>', '<code>3 8</code>', '<code>8 3</code>'],
        answer: 0,
        explain: `<code>priority_queue&lt;int&gt;</code> è un max-heap: <code>top()</code> dà il massimo, 8; dopo
        <code>pop()</code> il massimo è 5. Con <code>greater&lt;int&gt;</code> come terzo parametro sarebbe un min-heap e
        stamperebbe <code>3 5</code>.`,
      },
    ]);
  }
})();
