/* ASD a quadretti — capitolo "Confronto finale".
   Tutti gli ordinamenti in una tabella, la gara sugli stessi dati (confronti e
   spostamenti misurati, grafico al crescere di n), quale usare quando,
   std::sort (introsort) e std::stable_sort. */
(function () {
  'use strict';

  const { m, box, table, h } = ASD;
  const S = ASD.sorting;

  const ALGS = [
    { id: 'selection', label: 'Selection sort', slot: 1 },
    { id: 'insertion', label: 'Insertion sort', slot: 2 },
    { id: 'bubble', label: 'Bubble sort', slot: 7 },
    { id: 'merge', label: 'Merge sort', slot: 3 },
    { id: 'quick', label: 'Quicksort', slot: 4 },
    { id: 'heap', label: 'Heapsort', slot: 5 },
    { id: 'counting', label: 'Counting sort' },
  ];

  ASD.chapter({
    id: 'sort-confronto',
    title: 'Confronto finale',
    lead:
      'Tutti gli ordinamenti del corso uno accanto all\'altro: la tabella delle proprietà da sapere all\'esame, una gara sugli stessi dati per vedere i numeri veri, e cosa usare quando scrivi codice C++.',
    minutes: 30,
    prereq: ['sort-semplici', 'merge-sort', 'quick-sort', 'sort-lineari'],
    goals: [
      'ricostruire la tabella dei costi e delle proprietà di ogni ordinamento, sapendo spiegare ogni casella',
      'prevedere come cambiano confronti e spostamenti con input ordinati, al contrario o con molti valori uguali',
      'scegliere l\'ordinamento giusto per una situazione data',
      'usare <code>std::sort</code> e <code>std::stable_sort</code> con un comparatore corretto',
    ],

    render(el) {
      el.innerHTML = `
<section id="tabella">
  <h2>Tutti gli ordinamenti in una tabella</h2>
  <p>Questa è la tabella che all'esame devi saper ricostruire. Ogni casella ha un perché, scritto nei capitoli di ogni
  algoritmo: se una casella non ti torna, torna lì.</p>
  ${table({
    caption: 'Tempo, memoria e proprietà (n elementi; k = valore massimo; d cifre in base b)',
    head: ['Algoritmo', 'Migliore', 'Medio', 'Peggiore', 'Memoria in più', 'Stabile', 'Sul posto'],
    rows: [
      [`${ASD.link('sort-semplici', 'selection', 'Selection sort')}`, m('Θ(n^2)'), m('Θ(n^2)'), m('Θ(n^2)'), m('O(1)'), 'no', 'sì'],
      [`${ASD.link('sort-semplici', 'insertion', 'Insertion sort')}`, m('Θ(n)'), m('Θ(n^2)'), m('Θ(n^2)'), m('O(1)'), 'sì', 'sì'],
      [`${ASD.link('sort-semplici', 'bubble', 'Bubble sort')}`, m('Θ(n)'), m('Θ(n^2)'), m('Θ(n^2)'), m('O(1)'), 'sì', 'sì'],
      [`${ASD.link('merge-sort', null, 'Merge sort')}`, m('Θ(n log n)'), m('Θ(n log n)'), m('Θ(n log n)'), m('Θ(n)'), 'sì', 'no'],
      [`${ASD.link('quick-sort', null, 'Quicksort')}`, m('Θ(n log n)'), m('Θ(n log n)'), m('Θ(n^2)'), `${m('O(log n)')} medio, ${m('Θ(n)')} peggiore (stack)`, 'no', 'sì'],
      [`${ASD.link('heap', null, 'Heapsort')}`, m('Θ(n log n)'), m('Θ(n log n)'), m('Θ(n log n)'), m('O(1)'), 'no', 'sì'],
      [`${ASD.link('sort-lineari', 'counting', 'Counting sort')}`, m('Θ(n + k)'), m('Θ(n + k)'), m('Θ(n + k)'), m('Θ(n + k)'), 'sì', 'no'],
      [`${ASD.link('sort-lineari', 'radix', 'Radix sort')}`, m('Θ(d(n + b))'), m('Θ(d(n + b))'), m('Θ(d(n + b))'), m('Θ(n + b)'), 'sì', 'no'],
    ],
  })}
  <p>Tre righe da leggere con attenzione:</p>
  <ul>
    <li>il caso migliore ${m('Θ(n)')} di insertion e bubble sort arriva sull'array già ordinato (il bubble sort solo con la
    variabile <code>scambiato</code>);</li>
    <li>il quicksort ha il caso peggiore ${m('Θ(n^2)')}, ma con il pivot casuale il tempo <em>atteso</em> è
    ${m('Θ(n log n)')} su ogni input;</li>
    <li>il caso migliore ${m('Θ(n log n)')} dell'heapsort vale con elementi distinti: se sono tutti uguali, ogni
    ricostruzione dello heap si ferma subito e basta ${m('Θ(n)')}. L'heapsort è spiegato nel capitolo
    ${ASD.link('heap')}.</li>
  </ul>
  ${box('ricorda', `<p>Tra gli ordinamenti per confronti, solo il <strong>merge sort</strong> è insieme stabile e
  ${m('Θ(n log n)')} nel caso peggiore; solo l'<strong>heapsort</strong> è insieme sul posto e ${m('Θ(n log n)')} nel
  caso peggiore. Nessuno dei sei ha tutte e tre le proprietà.</p>`)}
</section>

<section id="gara">
  <h2>La gara</h2>
  <p>Stesso input per tutti, e si contano due cose:</p>
  <dl>
    <dt>confronti</dt>
    <dd>quante volte due elementi vengono confrontati;</dd>
    <dt>spostamenti</dt>
    <dd>quante volte un elemento viene copiato: in una casella dell'array, nel buffer del merge, in variabili come
    <code>key</code> e <code>pivot</code>. Uno scambio vale 3 copie.</dd>
  </dl>
  <p>Gli algoritmi sono esattamente quelli dei capitoli precedenti (quicksort con pivot in ultima posizione). Scegli il tipo
  di input e la dimensione; il grafico ripete la gara per valori di <var>n</var> crescenti. Parte in scala logaritmica:
  ogni tacca dell'asse verticale vale dieci volte la precedente, così le curve basse non spariscono sotto quelle
  quadratiche. Toglila per vedere le distanze vere.</p>
  <div data-mount="gara"></div>
  <p>Cose da notare, che all'esame diventano domande:</p>
  <ul>
    <li>sull'input <strong>già ordinato</strong> insertion e bubble sort fanno ${m('n - 1')} confronti, il quicksort con
    pivot in ultima posizione ne fa ${m('n(n-1)/2')}: il migliore e il peggiore si scambiano di posto;</li>
    <li>con <strong>pochi valori distinti</strong> il quicksort di Lomuto peggiora molto: tutti gli elementi uguali al
    pivot finiscono dalla stessa parte;</li>
    <li>il selection sort fa sempre ${m('n(n-1)/2')} confronti, ma pochissimi spostamenti: ${m('3(n-1)')};</li>
    <li>sull'input casuale il merge sort fa meno confronti di tutti, ma ${m('2n')} spostamenti a ogni livello della
    ricorsione;</li>
    <li>il counting sort non fa confronti, ma con valori fino a 9999 deve scorrere anche diecimila contatori.</li>
  </ul>
  <p>Lo stesso conteggio in C++, con 2000 elementi, tutti i confronti contati da una funzione <code>minore</code>:</p>
  <div data-mount="conta"></div>
  <pre class="code-out" tabindex="0"><code>n = 2000    casuale  ordinato   inverso  pochi distinti
selection   1999000   1999000   1999000         1999000
insertion   1006193      1999   1999000          911731
bubble      1998747      1999   1999000         1975780
merge         19427     11088     10864           18855
quick         23643   1999000   1999000          205368
heap          37636     39159     35964           34904</code></pre>
</section>

<section id="quale">
  <h2>Quale usare quando</h2>
  ${table({
    head: ['Situazione', 'Scelta', 'Perché'],
    rows: [
      ['Pochi elementi (qualche decina)', 'insertion sort', 'poche istruzioni e niente ricorsione: per <var>n</var> piccolo batte gli algoritmi Θ(n log n)'],
      ['Dati quasi ordinati', 'insertion sort', `costa ${m('Θ(n + I)')}, con <var>I</var> = numero di inversioni`],
      ['Uso generale, dati in memoria', 'quicksort con pivot casuale, o <code>std::sort</code>', 'il più veloce in media, sul posto'],
      ['Serve la stabilità', 'merge sort, o <code>std::stable_sort</code>', `stabile e ${m('Θ(n log n)')} garantito`],
      ['Garanzia sul caso peggiore senza memoria in più', 'heapsort', `${m('Θ(n log n)')} sempre, sul posto`],
      ['Chiavi intere in un intervallo piccolo', 'counting sort', `${m('Θ(n + k)')}, lineare se ${m('k = O(n)')}`],
      ['Interi grandi, stringhe di lunghezza fissa', 'radix sort', `${m('Θ(d(n + b))')}`],
      ['Liste concatenate', 'merge sort', 'non serve l\'accesso diretto agli elementi e la fusione non ha bisogno di buffer'],
      ['Dati che non stanno in memoria', 'merge sort esterno', 'legge e scrive i file in sequenza'],
      ['Spostare un elemento costa molto', 'selection sort (o ordinare gli indici)', `solo ${m('n - 1')} scambi`],
    ],
  })}
  ${box('esame', `<p>Le domande "quale algoritmo useresti se…" si risolvono cercando la <em>parola chiave</em>:
  "stabile" porta al merge sort, "senza memoria in più e garantito" all'heapsort, "quasi ordinato" all'insertion sort,
  "interi tra 0 e 100" al counting sort. Motiva sempre con la proprietà, non con il nome.</p>`)}
</section>

<section id="stl">
  <h2>In C++: std::sort e std::stable_sort</h2>
  <p>Nel codice vero non si scrive un ordinamento a mano: si usa <code>&lt;algorithm&gt;</code>. Le due funzioni da
  conoscere lavorano su un intervallo di iteratori <code>[first, last)</code>, semiaperto come in
  ${ASD.link('ricerca', 'bound', 'lower_bound')}:</p>
  <div data-mount="sort"></div>
  <dl>
    <dt><code>std::sort</code></dt>
    <dd>garantisce ${m('O(n log n)')} confronti anche nel caso peggiore (dal C++11). Le librerie lo realizzano con
    l'<strong>introsort</strong>: un quicksort con il pivot scelto come mediano di tre; se la ricorsione diventa troppo
    profonda (oltre circa ${m('2 log_2 n')} livelli) passa all'heapsort su quel pezzo, e lascia i pezzi piccoli (fino a
    una quindicina di elementi) a un insertion sort finale. <strong>Non è stabile.</strong></dd>
    <dt><code>std::stable_sort</code></dt>
    <dd>un merge sort: stabile, ${m('O(n log n)')} se può allocare un buffer; se la memoria non c'è, ripiega su una
    versione ${m('O(n log^2 n)')} che fonde sul posto.</dd>
  </dl>
  <p>Per ordinare con un criterio tuo si passa un <strong>comparatore</strong>: una funzione che riceve due elementi e
  risponde alla domanda "il primo deve venire prima del secondo?".</p>
  <div data-mount="confronto"></div>
  <div data-mount="stable"></div>
  <p>Output del programma completo:</p>
  <pre class="code-out" tabindex="0"><code>v: 9 5 5 6 2 1
30 Bruno
30 Elena
28 Anna
28 Carla
28 Fabio
25 Dario</code></pre>
  <p>Gli studenti erano in ordine alfabetico; dopo <code>stable_sort</code> per voto, a parità di voto sono ancora in
  ordine alfabetico. Con <code>sort</code> l'ordine tra Anna, Carla e Fabio non sarebbe garantito.</p>
  ${box('errore', `<p>Scrivere il comparatore con <code>&lt;=</code> (o <code>&gt;=</code>). Il comparatore deve essere
  un "minore stretto": per due elementi uguali deve rispondere <code>false</code> in entrambi i versi. Con
  <code>&lt;=</code> il contratto è violato e il comportamento di <code>std::sort</code> è indefinito: può ordinare
  male, o leggere fuori dal vettore e far terminare il programma.</p>`)}
  ${box('nota', `<p>Se ti servono solo i primi <var>k</var> elementi in ordine, <code>std::partial_sort</code> lo fa in
  ${m('O(n log k)')} con uno heap; se ti serve solo l'elemento che starebbe in posizione <var>k</var> (per esempio la
  mediana), <code>std::nth_element</code> lo trova in ${m('O(n)')} in media.</p>`, 'Altre funzioni utili')}
</section>

<section id="esame">
  <h2>All'esame</h2>
  <ol>
    <li><strong>La tabella</strong>: migliore, medio e peggiore di ogni algoritmo, memoria, stabilità. Spesso chiesta in
    forma di vero/falso: "il quicksort è stabile", "il merge sort lavora sul posto"…</li>
    <li><strong>Gli input particolari</strong>: "quanti confronti fa X su un array già ordinato / al contrario?"</li>
    <li><strong>La scelta motivata</strong>: "devi ordinare 10<sup>6</sup> record per data mantenendo l'ordine per
    nome: quale algoritmo?" (merge sort: serve la stabilità).</li>
    <li><strong>Il limite inferiore</strong>: "si può ordinare per confronti in ${m('o(n log n)')}?" No, per l'albero di
    decisione.</li>
  </ol>
  ${box('esame', `<p>Non imparare la tabella a memoria come una griglia di simboli: per ogni casella ricorda
  l'<em>esempio</em> che la giustifica (l'array già ordinato per il quicksort, <code>[2, 2, 1]</code> per la
  stabilità del selection sort, il buffer per il merge sort). Con l'esempio la casella la ricostruisci anche quando
  l'emozione la cancella.</p>`)}
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        gara: mountGara,
        conta: (host) => ASD.code(host, { src: 'ordinamento/conta_tutti', maxHeight: 360 }),
        sort: (host) => ASD.code(host, { src: 'ordinamento/std_sort', region: 'sort' }),
        confronto: (host) => ASD.code(host, { src: 'ordinamento/std_sort', region: 'confronto' }),
        stable: (host) => ASD.code(host, { src: 'ordinamento/std_sort', region: 'stable' }),
        quiz: (host) =>
          ASD.quiz(host, [
            {
              q: `Quale di questi ordinamenti è <strong>stabile</strong> e ${m('Θ(n log n)')} nel caso peggiore?`,
              options: ['Quicksort', 'Heapsort', 'Merge sort', 'Insertion sort'],
              answer: 2,
              explain: `Il quicksort e l'heapsort non sono stabili (e il quicksort è ${m('Θ(n^2)')} nel caso peggiore);
              l'insertion sort è stabile ma ${m('Θ(n^2)')}. Il merge sort è stabile grazie al <code>&lt;=</code> nella
              fusione ed è ${m('Θ(n log n)')} sempre.`,
            },
            {
              q: 'Devi ordinare un array enorme, con la garanzia di Θ(n log n) anche nel caso peggiore e senza usare memoria in più. Cosa scegli?',
              options: ['Heapsort', 'Merge sort', 'Quicksort', 'Counting sort'],
              answer: 0,
              explain: `Il merge sort usa un buffer ${m('Θ(n)')}; il quicksort è ${m('Θ(n^2)')} nel caso peggiore; il counting
              sort richiede chiavi intere piccole e memoria ${m('Θ(n + k)')}. L'heapsort è ${m('Θ(n log n)')} sempre e lavora
              sul posto.`,
            },
            {
              q: 'L\'array è quasi ordinato: solo pochi elementi sono fuori posto. Quale ordinamento conviene?',
              options: ['Insertion sort', 'Selection sort', 'Quicksort con pivot in ultima posizione', 'Merge sort'],
              answer: 0,
              explain: `L'insertion sort costa ${m('Θ(n + I)')}, dove <var>I</var> è il numero di inversioni: con pochi elementi
              fuori posto è quasi lineare. Il selection sort fa sempre ${m('n(n-1)/2')} confronti, e il quicksort con pivot in
              ultima posizione su un array quasi ordinato è vicino al suo caso peggiore.`,
            },
            {
              q: 'Quali affermazioni su <code>std::sort</code> sono vere?',
              options: [
                'Garantisce O(n log n) confronti anche nel caso peggiore',
                'È stabile',
                'Di solito è realizzato con l\'introsort: quicksort che passa all\'heapsort se la ricorsione è troppo profonda',
                'Accetta un comparatore scritto con <code>&lt;=</code>',
              ],
              answer: [0, 2],
              explain: `Non è stabile: per la stabilità c'è <code>std::stable_sort</code>. Il comparatore deve essere un minore
              stretto: con <code>&lt;=</code> il comportamento è indefinito.`,
            },
            {
              q: 'Su un array <strong>già ordinato</strong> di <var>n</var> elementi, quale fa più confronti?',
              options: ['Insertion sort', 'Bubble sort (con la variabile scambiato)', 'Quicksort con pivot in ultima posizione', 'Merge sort'],
              answer: 2,
              explain: `Insertion e bubble sort ne fanno ${m('n - 1')}, il merge sort circa ${m('(n/2) log_2 n')}. Il quicksort con
              pivot in ultima posizione sceglie sempre il massimo: ${m('n(n-1)/2')} confronti, il suo caso peggiore.`,
            },
            {
              q: 'Quale ordinamento fa meno <strong>spostamenti</strong> nel caso peggiore?',
              options: ['Selection sort', 'Insertion sort', 'Bubble sort', 'Merge sort'],
              answer: 0,
              explain: `Il selection sort fa un solo scambio per posizione: ${m('n - 1')} scambi in tutto, anche se i confronti
              sono sempre ${m('n(n-1)/2')}. Insertion e bubble sort nel caso peggiore spostano ${m('Θ(n^2)')} volte, il merge
              sort ${m('Θ(n log n)')}.`,
            },
          ]),
      });
    },
  });

  /* ------------------------------------------------------------- la gara */

  function mountGara(host) {
    const lab = h('div.lab.ord-gara');
    const body = h('div.lab-body');
    const controls = h('div.lab-controls');
    const out = h('div.lab-out', { 'aria-live': 'polite' });
    lab.append(h('div.lab-head', h('h3', { text: 'Stesso input per tutti: confronti e spostamenti' })), controls, body, out);
    host.append(lab);

    // comandi: tipo di input, n, nuovo input, scala del grafico
    const idBase = ASD.uid('gara-tipo');
    const radios = h('fieldset.ord-radios', h('legend.visually-hidden', { text: 'Tipo di input' }));
    let kind = S.kinds[0];
    for (const k of S.kinds) {
      const id = idBase + '-' + k.id;
      const input = h('input', { type: 'radio', name: idBase, id, value: k.id, checked: k === kind });
      input.addEventListener('change', () => {
        kind = k;
        regen();
      });
      radios.append(h('label.chip', { for: id }, input, k.label));
    }
    const nId = ASD.uid('gara-n');
    const nOut = h('output', { for: nId });
    const nInput = h('input', { type: 'range', id: nId, min: '10', max: '2000', step: '10', value: '500' });
    const again = h('button.btn.btn-sm', { type: 'button', text: 'Nuovo input' });
    const logId = ASD.uid('gara-log');
    const logBox = h('input', { type: 'checkbox', id: logId, checked: true });
    controls.append(
      h('span.field', 'Input', radios),
      h('label.slider', { for: nId }, h('span', 'n (elementi)'), nInput, nOut),
      again,
      h('label.chip', { for: logId }, logBox, 'grafico in scala logaritmica')
    );

    const tblWrap = h('div.tbl-wrap');
    const plotBox = h('div.ord-gara-plot');
    body.append(tblWrap, plotBox);
    const plot = new ASD.viz.Plot(plotBox, {
      x: { min: 0, max: 500, label: 'n', integer: true },
      y: { min: 10, label: 'confronti', log: true },
      height: 300,
      ariaLabel: 'Confronti in funzione di n per i sei ordinamenti per confronti',
    });

    let input = null;
    let timer = null;
    nInput.addEventListener('input', () => {
      nOut.textContent = nInput.value;
      clearTimeout(timer);
      timer = setTimeout(regen, 150);
    });
    again.addEventListener('click', regen);
    logBox.addEventListener('change', () => plot.setAxis('y', { log: logBox.checked, min: logBox.checked ? 10 : 0 }));

    function regen() {
      const n = Number(nInput.value);
      nOut.textContent = String(n);
      input = kind.make(n);
      drawTable();
      drawPlot();
    }

    function drawTable() {
      const n = input.length;
      const res = ALGS.map((a) => Object.assign({ alg: a }, S.gara[a.id](input)));
      const maxC = Math.max(...res.map((r) => r.confronti), 1);
      const maxS = Math.max(...res.map((r) => r.spostamenti), 1);
      const cell = (v, max) => h('td', h('span.ord-num', { text: ASD.fmt(v) }), h('span.ord-bar', { 'aria-hidden': 'true', style: { width: (100 * v) / max + '%' } }));
      const tb = h('tbody');
      for (const r of res) tb.append(h('tr', h('th', { scope: 'row', text: r.alg.label }), cell(r.confronti, maxC), cell(r.spostamenti, maxS)));
      const ref = (label, v) => h('tr.ord-ref', h('th', { scope: 'row', html: label }), h('td', { text: ASD.fmt(Math.round(v)) }), h('td'));
      tb.append(ref(m('n(n-1)/2'), (n * (n - 1)) / 2), ref(m('n log_2 n'), n > 1 ? n * Math.log2(n) : 0));
      const t = h(
        'table.tbl.ord-gara-tbl',
        h('caption', { text: `n = ${ASD.fmt(n)}, input ${kind.label}` }),
        h('thead', h('tr', h('th', { scope: 'col', text: 'Algoritmo' }), h('th', { scope: 'col', text: 'Confronti' }), h('th', { scope: 'col', text: 'Spostamenti' }))),
        tb
      );
      tblWrap.replaceChildren(t);
      const cmp = res.filter((r) => r.alg.id !== 'counting');
      const best = cmp.reduce((p, q) => (q.confronti < p.confronti ? q : p));
      const worst = cmp.reduce((p, q) => (q.confronti > p.confronti ? q : p));
      const cnt = res.find((r) => r.alg.id === 'counting');
      out.innerHTML =
        `<p style="margin:0">Meno confronti: <strong>${best.alg.label}</strong> (${ASD.fmt(best.confronti)}). ` +
        `Più confronti: <strong>${worst.alg.label}</strong> (${ASD.fmt(worst.confronti)}` +
        (best.confronti > 0 ? `, ${ASD.fmt(Math.round(worst.confronti / best.confronti))} volte tanto` : '') +
        `). Il counting sort non confronta, ma oltre agli ${ASD.fmt(n)} elementi scorre ${ASD.fmt(cnt.k + 1)} contatori (valore massimo ${ASD.fmt(cnt.k)}).</p>`;
    }

    function drawPlot() {
      const N = input.length;
      const ns = [];
      for (let q = 1; q <= 10; q++) ns.push(Math.max(2, Math.round((N * q) / 10)));
      const series = {};
      for (const a of ALGS) if (a.slot) series[a.id] = [];
      for (const n of ns) {
        const arr = n === N ? input : kind.make(n);
        for (const a of ALGS) if (a.slot) series[a.id].push([n, S.gara[a.id](arr).confronti]);
      }
      plot.o.x.max = N;
      plot.set({
        series: [
          { id: 'q', label: 'n(n−1)/2', slot: 8, fn: (x) => (x * (x - 1)) / 2, dashed: true },
          { id: 'nl', label: 'n log₂ n', slot: 6, fn: (x) => (x > 1 ? x * Math.log2(x) : 0), dashed: true },
        ].concat(ALGS.filter((a) => a.slot).map((a) => ({ id: a.id, label: a.label.replace(' sort', ''), slot: a.slot, points: series[a.id], line: true }))),
      });
    }

    regen();
  }
})();
