/* ASD a quadretti — capitolo "Ordinamenti semplici" (selection, insertion, bubble).
   È anche il capitolo modello: struttura, riquadri, visualizzazioni e verifica
   finale sono quelli che seguono tutti gli altri capitoli. */
(function () {
  'use strict';

  const { m, box, table } = ASD;
  const S = ASD.sorting;

  ASD.chapter({
    id: 'sort-semplici',
    title: 'Ordinamenti semplici',
    lead:
      'Selection sort, insertion sort e bubble sort: tre modi di ordinare con due cicli annidati. Sui dati grandi sono lenti, ma sono la palestra perfetta per imparare a eseguire un algoritmo a mano e a contarne i passi.',
    minutes: 35,
    prereq: ['cpp-funzioni', 'cx-costo'],
    goals: [
      'eseguire a mano i tre algoritmi e scrivere l\'array dopo ogni passata, come si chiede allo scritto',
      `contare i confronti nel caso migliore e peggiore e arrivare a ${m('Θ(n)')} o ${m('Θ(n^2)')}`,
      'sapere quali sono stabili, quali lavorano sul posto e quale conviene sui dati quasi ordinati',
    ],

    render(el) {
      el.innerHTML = `
<section id="problema">
  <h2>Il problema dell'ordinamento</h2>
  <p>Dato un array <code>a</code> di <var>n</var> elementi, vogliamo riordinarlo in modo che
  ${m('a[0] <= a[1] <= … <= a[n-1]')}. Gli algoritmi di questo capitolo lavorano solo
  <strong>confrontando</strong> coppie di elementi e <strong>spostandoli</strong>: per questo il loro costo si misura
  contando confronti e scambi.</p>
  <p>Due proprietà che all'esame vengono chieste sempre:</p>
  <dl>
    <dt>Sul posto (in loco, <i>in place</i>)</dt>
    <dd>l'algoritmo usa solo una quantità costante di memoria in più, ${m('O(1)')}, oltre all'array.</dd>
    <dt>Stabile</dt>
    <dd>due elementi uguali restano nell'ordine in cui erano. Conta quando si ordinano record per un campo:
    ordinando gli studenti per voto, quelli con lo stesso voto restano in ordine alfabetico.</dd>
  </dl>
  ${box('nota', `I libri (Cormen e gli altri) scrivono gli array da <code>A[1]</code> ad <code>A[n]</code>. In C++ gli indici
  vanno da <code>0</code> a <code>n-1</code>: tutti i cicli qui sotto sono già tradotti. Se all'esame ti danno lo pseudocodice
  "da 1", trasporta ogni indice di uno.`, 'Indici da 0')}
</section>

<section id="selection">
  <h2>Selection sort</h2>
  <p><strong>Idea.</strong> Cerca il minimo di tutto l'array e mettilo in <code>a[0]</code>; poi cerca il minimo di
  quello che resta e mettilo in <code>a[1]</code>; e così via. Dopo il passo <var>i</var> le prime <var>i</var>+1 caselle
  contengono i più piccoli, in ordine, e non verranno più toccate.</p>
  <div data-mount="selection"></div>
  <h3>Quanto costa</h3>
  <p>Il ciclo interno fa sempre un confronto per ogni <code>j</code> da <code>i+1</code> a <code>n-1</code>, cioè
  ${m('n-1-i')} confronti. Sommando su tutti i passi:</p>
  <p class="formula">${m('(n-1) + (n-2) + … + 1 = n(n-1)/2')}</p>
  <p>Il conto <strong>non dipende dall'input</strong>: anche un array già ordinato costa ${m('n(n-1)/2')} confronti.
  Quindi il selection sort è ${m('Θ(n^2)')} in ogni caso. In compenso fa solo ${m('n-1')} scambi: conviene quando
  spostare un elemento costa molto più che confrontarlo.</p>
  ${box('errore', `<p>Il selection sort <strong>non è stabile</strong>. Con <code>[2<sub>a</sub>, 2<sub>b</sub>, 1]</code> il primo passo
  scambia <code>2<sub>a</sub></code> con <code>1</code> e ottiene <code>[1, 2<sub>b</sub>, 2<sub>a</sub>]</code>: i due 2 si sono invertiti.</p>`)}
</section>

<section id="insertion">
  <h2>Insertion sort</h2>
  <p><strong>Idea.</strong> È come riordinare le carte in mano: si prende una carta alla volta e la si inserisce al posto
  giusto tra quelle già ordinate, facendo scorrere a destra le carte più grandi.</p>
  <p>Prima del passo <var>i</var> la parte <code>a[0..i-1]</code> è ordinata (ma non ancora definitiva). Si salva
  <code>a[i]</code> in <code>key</code>, si spostano di una casella a destra gli elementi più grandi di <code>key</code> e
  la si mette nel buco che resta.</p>
  <div data-mount="insertion"></div>
  <h3>Quanto costa</h3>
  ${table({
    head: ['Caso', 'Quando', 'Confronti', 'Complessità'],
    rows: [
      ['Migliore', 'array già ordinato: il <code>while</code> si ferma subito', m('n-1'), m('Θ(n)')],
      ['Peggiore', 'array al contrario: ogni key scorre fino all\'inizio', m('n(n-1)/2'), m('Θ(n^2)')],
      ['Medio', 'ordine casuale: ogni key scorre in media a metà', `circa ${m('n^2/4')}`, m('Θ(n^2)')],
    ],
  })}
  <p>Il numero di spostamenti è esattamente il numero di <strong>inversioni</strong> dell'input, cioè le coppie
  ${m('i < j')} con ${m('a[i] > a[j]')}. Per questo l'insertion sort è velocissimo sui dati <em>quasi</em> ordinati:
  poche inversioni, pochi spostamenti. È stabile (il <code>while</code> si ferma davanti a un elemento uguale, con
  <code>&gt;</code> e non <code>&gt;=</code>) e lavora sul posto.</p>
  ${box('errore', `<p>L'ordine delle condizioni nel <code>while</code> conta: <code>j &gt;= 0 &amp;&amp; a[j] &gt; key</code>.
  L'operatore <code>&amp;&amp;</code> valuta la seconda condizione solo se la prima è vera (<i>valutazione corto circuito</i>).
  Scritto al contrario, quando <code>j</code> arriva a <code>-1</code> il programma legge <code>a[-1]</code>: fuori dall'array,
  comportamento indefinito.</p>`)}
  ${box('nota', `Il conto riga per riga dell'insertion sort, con il costo di ogni istruzione scritto a margine, è l'esempio
  guidato del capitolo ${ASD.link('cx-metodo', null, 'Il metodo per calcolare la complessità')}.`, 'Per approfondire')}
</section>

<section id="bubble">
  <h2>Bubble sort</h2>
  <p><strong>Idea.</strong> Si scorre l'array confrontando le coppie vicine <code>a[j]</code> e <code>a[j+1]</code>;
  se sono nell'ordine sbagliato si scambiano. Alla fine della prima passata il massimo è "risalito" in fondo, come una
  bolla; alla fine della seconda anche il secondo più grande, e così via.</p>
  <p>La variabile <code>scambiato</code> serve a fermarsi prima: se in una passata intera non si scambia nulla,
  l'array è già ordinato.</p>
  <div data-mount="bubble"></div>
  <h3>Quanto costa</h3>
  <p>Nel caso peggiore (array al contrario) ogni passata fa ${m('n-1-i')} confronti e altrettanti scambi:
  ${m('n(n-1)/2')} in tutto, ${m('Θ(n^2)')}. Nel caso migliore (già ordinato) basta una passata senza scambi:
  ${m('n-1')} confronti, ${m('Θ(n)')}. <strong>Senza</strong> la variabile <code>scambiato</code> il caso migliore
  sarebbe ${m('Θ(n^2)')} anche lui.</p>
  ${box('ricorda', `<p>Dopo la passata <var>i</var> del bubble sort l'ultimo elemento della parte esaminata è definitivo
  (le caselle verdi crescono da destra). Nel selection sort, invece, le caselle definitive crescono da sinistra.</p>`)}
</section>

<section id="confronto">
  <h2>Quale conviene?</h2>
  ${table({
    caption: 'I tre ordinamenti semplici a confronto',
    head: ['Algoritmo', 'Migliore', 'Medio', 'Peggiore', 'Scambi (peggiore)', 'Stabile', 'Sul posto'],
    rows: [
      ['Selection sort', m('Θ(n^2)'), m('Θ(n^2)'), m('Θ(n^2)'), m('n-1'), 'no', 'sì'],
      ['Insertion sort', m('Θ(n)'), m('Θ(n^2)'), m('Θ(n^2)'), `${m('n(n-1)/2')} spostamenti`, 'sì', 'sì'],
      ['Bubble sort', m('Θ(n)'), m('Θ(n^2)'), m('Θ(n^2)'), m('n(n-1)/2'), 'sì', 'sì'],
    ],
  })}
  <p>Prova tu: scegli il tipo di input e guarda come crescono i confronti. Le curve tratteggiate sono le formule
  ${m('n(n-1)/2')} e ${m('n-1')}: i punti misurati ci cadono sopra.</p>
  <div data-mount="gara"></div>
  <p>Lo stesso esperimento in C++, con array di 1000 elementi. Il programma conta i confronti facendoli passare tutti
  da una funzione <code>minore</code>:</p>
  <div data-mount="conta"></div>
  <p>Output del programma:</p>
  <pre class="code-out" tabindex="0"><code>n = 1000    ordinato   inverso   casuale
selection      499500    499500    499500
insertion         999    499500    258560
bubble            999    499500    499455</code></pre>
  <p>${m('499500 = 1000·999/2')} e ${m('999 = n-1')}: esattamente le formule. Sull'input casuale l'insertion sort fa
  circa ${m('n^2/4 = 250000')} confronti, metà degli altri due.</p>
</section>

<section id="esame">
  <h2>All'esame</h2>
  <p>Le domande tipiche su questi algoritmi sono di tre tipi.</p>
  <ol>
    <li><strong>Simulazione</strong>: "dato l'array [7, 3, 9, 1, 5], scrivi il suo stato dopo ogni iterazione del ciclo
    esterno dell'insertion sort". Usa la visualizzazione qui sopra per controllarti: inserisci l'array, premi
    <kbd>→</kbd> fino a ogni riga <code>a[j + 1] = key</code> e confronta.</li>
    <li><strong>Conteggio</strong>: "quanti confronti fa il bubble sort su un array già ordinato di <var>n</var> elementi?"
    Si risponde con la somma dei cicli, come sopra.</li>
    <li><strong>Proprietà</strong>: "quale di questi algoritmi è stabile?", "quale conviene se l'input è quasi ordinato?".</li>
  </ol>
  ${box('esame', `<p>Quando scrivi lo stato dell'array dopo ogni passata, scrivi anche cosa è già al suo posto definitivo
  (selection: a sinistra; bubble: a destra; insertion: nulla fino alla fine, la parte di sinistra è solo ordinata
  <em>tra sé</em>). È il dettaglio che distingue chi ha capito da chi ha imparato a memoria.</p>`)}
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        selection: (host) =>
          ASD.stepper(host, {
            id: 'selection',
            title: 'Selection sort passo per passo',
            code: { src: 'ordinamento/selection_sort', region: 'sort' },
            input: { kind: 'array', value: [29, 10, 14, 37, 13, 5], presets: S.presets(7) },
            view: (stage) => new ASD.viz.ArrayView(stage),
            trace: S.trace.selection,
            counters: [
              { key: 'confronti', label: 'confronti' },
              { key: 'scambi', label: 'scambi' },
            ],
            legend: S.legend.filter((x) => x.k !== 'hole'),
            validate: S.validate,
          }),
        insertion: (host) =>
          ASD.stepper(host, {
            id: 'insertion',
            title: 'Insertion sort passo per passo',
            code: { src: 'ordinamento/insertion_sort', region: 'sort' },
            input: { kind: 'array', value: [5, 2, 4, 6, 1, 3], presets: S.presets(7) },
            view: (stage) => new ASD.viz.ArrayView(stage, { float: true }),
            trace: S.trace.insertion,
            counters: [
              { key: 'confronti', label: 'confronti' },
              { key: 'spostamenti', label: 'spostamenti' },
            ],
            legend: S.legend,
            validate: S.validate,
          }),
        bubble: (host) =>
          ASD.stepper(host, {
            id: 'bubble',
            title: 'Bubble sort passo per passo',
            code: { src: 'ordinamento/bubble_sort', region: 'sort' },
            input: { kind: 'array', value: [5, 1, 4, 2, 8], presets: S.presets(7) },
            view: (stage) => new ASD.viz.ArrayView(stage),
            trace: S.trace.bubble,
            counters: [
              { key: 'confronti', label: 'confronti' },
              { key: 'scambi', label: 'scambi' },
            ],
            legend: S.legend.filter((x) => x.k !== 'hole' && x.k !== 'key'),
            validate: S.validate,
          }),
        gara: mountGara,
        conta: (host) => ASD.code(host, { src: 'ordinamento/conta_confronti', maxHeight: 360 }),
        quiz: (host) =>
          ASD.quiz(host, [
            {
              q: 'Quanti confronti fa l\'insertion sort su un array <strong>già ordinato</strong> di <var>n</var> elementi?',
              options: [m('n-1'), m('n'), m('n(n-1)/2'), m('n log n')],
              answer: 0,
              explain: `Per ogni <code>i</code> da 1 a ${m('n-1')} il <code>while</code> fa un solo confronto, trova
              ${m('a[i-1] <= key')} e si ferma. Sono ${m('n-1')} confronti: caso migliore ${m('Θ(n)')}.`,
            },
            {
              q: 'Qual è lo stato dell\'array <code>[5, 1, 4, 2, 8]</code> dopo la <strong>prima passata</strong> del bubble sort?',
              options: ['<code>[1, 4, 2, 5, 8]</code>', '<code>[1, 2, 4, 5, 8]</code>', '<code>[1, 5, 4, 2, 8]</code>', '<code>[5, 1, 4, 2, 8]</code>'],
              answer: 0,
              explain: `5 e 1 si scambiano, poi 5 e 4, poi 5 e 2; 5 e 8 sono in ordine. Risultato <code>[1, 4, 2, 5, 8]</code>:
              l'8 era già in fondo, il 5 è salito fino a toccarlo. Puoi verificarlo nella visualizzazione del bubble sort.`,
            },
            {
              q: 'Quali di questi algoritmi, nella versione vista qui, sono <strong>stabili</strong>?',
              options: ['Selection sort', 'Insertion sort', 'Bubble sort'],
              answer: [1, 2],
              explain: `Insertion e bubble spostano un elemento solo oltre elementi <em>strettamente</em> maggiori
              (<code>&gt;</code>), quindi due uguali non si scavalcano mai. Il selection sort invece fa scambi "a distanza"
              che possono invertire due elementi uguali.`,
            },
            {
              q: 'Quanti confronti fa il <strong>selection sort</strong> su un array già ordinato di 10 elementi?',
              options: ['9', '10', '45', '100'],
              answer: 2,
              explain: `Il selection sort non si accorge che l'array è ordinato: fa sempre ${m('n(n-1)/2')} confronti,
              qui ${m('10·9/2 = 45')}.`,
            },
            {
              q: 'Nell\'insertion sort, perché nel <code>while</code> si scrive <code>j &gt;= 0</code> <strong>prima</strong> di <code>a[j] &gt; key</code>?',
              options: [
                'Perché così il ciclo è più veloce',
                'Perché <code>&amp;&amp;</code> valuta la seconda condizione solo se la prima è vera: si evita di leggere <code>a[-1]</code>',
                'È indifferente: il compilatore riordina le condizioni',
              ],
              answer: 1,
              explain: `È la valutazione corto circuito di <code>&amp;&amp;</code>: se <code>j &gt;= 0</code> è falso,
              <code>a[j]</code> non viene letto. Il compilatore <strong>non</strong> riordina le condizioni, proprio perché il
              significato del programma cambierebbe.`,
            },
          ]),
      });
    },
  });

  /* Grafico: confronti in funzione di n per i tre algoritmi. */
  function mountGara(host) {
    const { h } = ASD;
    const kinds = [
      { id: 'casuale', label: 'casuale', make: (n) => ASD.randomArray(n, 1, 1000) },
      { id: 'ordinato', label: 'già ordinato', make: (n) => Array.from({ length: n }, (_, i) => i) },
      { id: 'inverso', label: 'al contrario', make: (n) => Array.from({ length: n }, (_, i) => n - i) },
    ];
    const lab = h('div.lab');
    const head = h('div.lab-head', h('h3', { text: 'Quanti confronti? Misura in diretta' }));
    const body = h('div.lab-body');
    const out = h('div.lab-out');
    const controls = h('div.lab-controls');
    lab.append(head, body, controls, out);
    host.append(lab);

    const radios = h('fieldset.st-input', { style: { border: '0', padding: '0', margin: '0' } }, h('legend.visually-hidden', { text: 'Tipo di input' }));
    const idBase = ASD.uid('gara');
    let kind = kinds[0];
    for (const k of kinds) {
      const id = idBase + '-' + k.id;
      const input = h('input', { type: 'radio', name: idBase, id, value: k.id, checked: k === kind });
      input.addEventListener('change', () => {
        kind = k;
        draw();
      });
      radios.append(h('label.chip', { for: id }, input, k.label));
    }
    const nId = idBase + '-n';
    const nOut = h('output', { for: nId });
    const nInput = h('input', { type: 'range', id: nId, min: '10', max: '200', step: '10', value: '60', oninput: () => draw() });
    controls.append(h('span.field', 'Input', radios), h('label.slider', { for: nId }, h('span', 'n massimo'), nInput, nOut));

    const plot = new ASD.viz.Plot(body, {
      x: { min: 0, max: 60, label: 'n', integer: true },
      y: { min: 0, label: 'confronti' },
      height: 300,
      ariaLabel: 'Confronti in funzione di n per selection, insertion e bubble sort',
    });

    function draw() {
      const N = Number(nInput.value);
      nOut.textContent = String(N);
      const ns = [];
      for (let n = 2; n <= N; n += Math.max(1, Math.round(N / 20))) ns.push(n);
      if (ns[ns.length - 1] !== N) ns.push(N);
      const series = { selection: [], insertion: [], bubble: [] };
      let lastCounts = null;
      for (const n of ns) {
        const arr = kind.make(n);
        const c = {
          selection: S.count.selection(arr),
          insertion: S.count.insertion(arr),
          bubble: S.count.bubble(arr),
        };
        for (const k in series) series[k].push([n, c[k].confronti]);
        lastCounts = c;
      }
      plot.o.x.max = N;
      plot.set({
        series: [
          { id: 'f1', label: 'n(n−1)/2', slot: 8, fn: (n) => (n * (n - 1)) / 2, dashed: true },
          { id: 'f2', label: 'n−1', slot: 6, fn: (n) => Math.max(0, n - 1), dashed: true },
          { id: 'sel', label: 'selection', slot: 1, points: series.selection, line: true },
          { id: 'ins', label: 'insertion', slot: 2, points: series.insertion, line: true },
          { id: 'bub', label: 'bubble', slot: 7, points: series.bubble, line: true },
        ],
      });
      out.innerHTML =
        `<p style="margin:0">Con <var>n</var> = ${N} e input <strong>${kind.label}</strong>: selection ` +
        `<strong>${lastCounts.selection.confronti}</strong> confronti, insertion <strong>${lastCounts.insertion.confronti}</strong>, ` +
        `bubble <strong>${lastCounts.bubble.confronti}</strong>. Formula del caso peggiore: ${m(`n(n-1)/2 = ${(N * (N - 1)) / 2}`)}.</p>`;
    }
    draw();
  }
})();
