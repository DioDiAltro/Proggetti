/* ASD a quadretti — capitolo "Ordinamenti in tempo lineare".
   Il limite inferiore Ω(n log n) per gli ordinamenti per confronti (albero di
   decisione per n = 3), counting sort, radix sort LSD, bucket sort. */
(function () {
  'use strict';

  const { m, box, table } = ASD;
  const S = ASD.sorting;

  const CORMEN = [2, 5, 3, 0, 2, 3, 0, 3];
  const RADIX0 = [329, 457, 657, 839, 436, 720, 355];

  ASD.chapter({
    id: 'sort-lineari',
    title: 'Ordinamenti in tempo lineare',
    lead:
      'Nessun ordinamento che confronta gli elementi può fare meglio di Ω(n log n). Ma se le chiavi sono interi in un intervallo piccolo si può smettere di confrontare e usare i valori come indici: counting sort e radix sort ordinano in tempo lineare.',
    minutes: 40,
    prereq: ['merge-sort', 'quick-sort'],
    goals: [
      'spiegare con l\'albero di decisione perché ogni ordinamento per confronti fa Ω(n log n) confronti nel caso peggiore',
      'eseguire a mano il counting sort: conteggi, somme prefisse, posizionamento da destra',
      'eseguire a mano il radix sort LSD e spiegare perché ogni passata deve essere stabile',
      `dire quando conviene un ordinamento lineare: ${m('Θ(n + k)')} va bene solo se <var>k</var> non è molto più grande di <var>n</var>`,
    ],

    render(el) {
      el.innerHTML = `
<section id="limite">
  <h2>Il limite Ω(n log n)</h2>
  <p>Selection, insertion, bubble, merge, quick e heap sort hanno una cosa in comune: scoprono l'ordine degli elementi
  solo <strong>confrontandoli a coppie</strong>. Si chiamano ordinamenti per confronti (<i>comparison sorts</i>). Il
  migliore tra quelli visti fa ${m('Θ(n log n)')} confronti. Si può fare di meglio? Con i soli confronti, no.</p>
  <h3>L'albero di decisione</h3>
  <p>Fissato <var>n</var>, tutte le esecuzioni possibili di un ordinamento per confronti si disegnano con un albero
  binario:</p>
  <ul>
    <li>ogni nodo interno è un confronto tra due elementi dell'input, per esempio <code>0:1</code> = "il primo elemento
    contro il secondo";</li>
    <li>a sinistra si va se il primo è ≤ del secondo, a destra se è &gt;;</li>
    <li>ogni foglia è un ordine finale. La foglia <code>1,0,2</code> significa: prima l'elemento che stava in posizione 1,
    poi quello in posizione 0, poi quello in posizione 2.</li>
  </ul>
  <p>Un'esecuzione è un cammino dalla radice a una foglia, e i confronti fatti sono la lunghezza del cammino. Qui sotto
  c'è l'albero dell'insertion sort con tre elementi: scegli i tre valori e guarda quale cammino percorre il codice.
  Sotto ogni foglia ci sono i tuoi valori messi in quell'ordine: solo una foglia li dà ordinati.</p>
  <div data-mount="decisione" class="ord-stepper"></div>
  <h3>Il ragionamento</h3>
  <ol>
    <li>L'albero deve avere <strong>almeno ${m('n!')} foglie</strong>: ogni permutazione dell'input può essere quella
    giusta, e due input ordinati in modo diverso devono finire in foglie diverse.</li>
    <li>Un albero binario di altezza <var>h</var> ha <strong>al massimo ${m('2^h')} foglie</strong>.</li>
    <li>Quindi ${m('2^h >= n!')}, cioè ${m('h >= log_2(n!)')}. E ${m('log_2(n!) = Θ(n log n)')}: basta guardare la
    metà più grande dei fattori, ${m('n! >= (n/2)^{n/2}')}, da cui ${m('log_2(n!) >= (n/2) log_2(n/2)')}.</li>
  </ol>
  <p>L'altezza <var>h</var> è il numero di confronti nel caso peggiore. Conclusione:</p>
  ${box('ricorda', `<p><strong>Ogni</strong> ordinamento per confronti fa ${m('Ω(n log n)')} confronti nel caso peggiore.
  Merge sort e heapsort, che sono ${m('O(n log n)')} anche nel caso peggiore, sono quindi <em>asintoticamente
  ottimi</em>: nessun algoritmo per confronti può batterli di più di una costante.</p>`)}
  ${table({
    caption: 'Quanto è stretto il limite',
    head: ['n', 'n!', `${m('⌈log_2 n!⌉')}: confronti minimi nel caso peggiore`, 'merge sort, caso peggiore'],
    rows: [
      ['3', '6', '3', '3'],
      ['4', '24', '5', '5'],
      ['5', '120', '7', '8'],
      ['10', '3 628 800', '22', '25'],
      ['100', '≈ 9,3 · 10<sup>157</sup>', '525', '573'],
      ['1000', '≈ 4,0 · 10<sup>2567</sup>', '8530', '8977'],
    ],
  })}
  <p>Il merge sort è vicinissimo al minimo possibile: con 1000 elementi fa al massimo il 5% di confronti in più. Il
  limite vale anche per il caso medio, con un ragionamento simile sulla profondità media delle foglie.</p>
  ${box('errore', `<p>Dire che "nessun algoritmo di ordinamento può essere più veloce di ${m('n log n')}". Il limite vale
  per gli algoritmi che usano <strong>solo confronti</strong>. Gli algoritmi del resto del capitolo non confrontano mai
  due elementi: guardano i valori e li usano come indici. Il limite non li riguarda.</p>`)}
</section>

<section id="counting">
  <h2>Counting sort</h2>
  <p>Supponi che le chiavi siano interi tra 0 e <var>k</var>, con <var>k</var> piccolo: voti da 0 a 30, età, cifre da 0 a
  9. Allora puoi <strong>contare</strong> quante volte compare ogni valore e da lì calcolare dove va ogni elemento, senza
  mai confrontarne due. Il counting sort lavora in tre fasi:</p>
  <ol>
    <li><strong>conta</strong>: <code>c[v]</code> = quante volte compare il valore <var>v</var>;</li>
    <li><strong>somme prefisse</strong>: <code>c[v] += c[v-1]</code>, così <code>c[v]</code> diventa quanti elementi sono
    ≤ <var>v</var>, cioè la posizione subito dopo l'ultimo <var>v</var> nell'output;</li>
    <li><strong>posiziona</strong>: scorrendo l'input <em>da destra</em>, ogni elemento <var>v</var> fa scendere
    <code>c[v]</code> di uno e va in <code>b[c[v]]</code>.</li>
  </ol>
  <div data-mount="counting" class="ord-stepper"></div>
  <p>Nell'esempio, dopo le somme prefisse <code>c[3] = 7</code>: i valori ≤ 3 sono 7, quindi i tre 3 occupano le
  posizioni 4, 5 e 6 dell'output, e il primo 3 trovato da destra (<code>3″</code>) prende la 6.</p>
  <h3>Quanto costa</h3>
  ${table({
    head: ['Fase', 'Iterazioni', 'Costo'],
    rows: [
      ['Azzerare <code>c</code>', m('k + 1'), m('Θ(k)')],
      ['Contare', m('n'), m('Θ(n)')],
      ['Somme prefisse', m('k'), m('Θ(k)')],
      ['Posizionare', m('n'), m('Θ(n)')],
      ['<strong>Totale</strong>', '', `<strong>${m('Θ(n + k)')}</strong>, memoria ${m('Θ(n + k)')}`],
    ],
  })}
  <p>Se ${m('k = O(n)')} il counting sort è lineare: ${m('Θ(n)')}. Se invece <var>k</var> è enorme rispetto a
  <var>n</var>, per esempio 1000 numeri tra 0 e un miliardo, l'array <code>c</code> da un miliardo di caselle costa molto
  più di qualsiasi ordinamento per confronti.</p>
  ${box('ricorda', `<p>Il posizionamento va <strong>da destra a sinistra</strong>: il primo elemento di valore
  <var>v</var> che si incontra è l'ultimo dell'input, e prende l'ultima casella riservata ai <var>v</var>. Così gli
  elementi uguali escono nell'ordine in cui erano: il counting sort è <strong>stabile</strong>. Guarda gli apici
  nell'output: <code>0, 0′, 2, 2′, 3, 3′, 3″, 5</code>.</p>`)}
  ${box('errore', `<p>Scorrere l'input da sinistra con lo stesso codice (<code>c[a[i]]--</code> e poi
  <code>b[c[a[i]]] = a[i]</code>). L'array esce ordinato, ma gli elementi uguali escono in ordine inverso: l'algoritmo
  non è più stabile, e il radix sort qui sotto smette di funzionare. Altro errore: valori negativi o maggiori di
  <var>k</var>, che fanno leggere <code>c</code> fuori dai limiti. Se i valori stanno in ${m('[min, max]')}, si conta
  <code>c[a[i] - min]</code> con ${m('k = max - min')}.</p>`)}
</section>

<section id="radix">
  <h2>Radix sort</h2>
  <p>Il counting sort non regge chiavi grandi. Il radix sort le spezza in <strong>cifre</strong> e ordina una cifra alla
  volta, partendo dalla meno significativa (LSD, <i>least significant digit</i>): prima per le unità, poi per le decine,
  poi per le centinaia. Ogni passata è un counting sort sulla cifra, con ${m('k = 9')}.</p>
  <div data-mount="radix" class="ord-stepper"></div>
  <p>Dopo la passata sulle unità i numeri sono ordinati per l'ultima cifra; dopo quella sulle decine, per le ultime due;
  dopo quella sulle centinaia, per tutte e tre. Il motivo è la <strong>stabilità</strong>: nella passata delle decine,
  due numeri con la stessa cifra delle decine restano nell'ordine della passata precedente, cioè ordinati per unità.</p>
  ${box('errore', `<p>Usare una passata non stabile. Con <code>[21, 12, 22, 11]</code>, dopo le unità hai
  <code>[21, 11, 12, 22]</code>. Nella passata delle decine 11 e 12 hanno la stessa cifra, 1: se la passata non è stabile
  può scambiarli e il risultato finale è <code>[12, 11, 22, 21]</code>, sbagliato.</p>`)}
  <h3>Quanto costa</h3>
  <p>Con <var>d</var> cifre in base <var>b</var> (qui ${m('b = 10')}) ogni passata costa ${m('Θ(n + b)')}, quindi in tutto
  ${m('Θ(d(n + b))')}. Se <var>d</var> e <var>b</var> sono costanti, è ${m('Θ(n)')}. La base si può scegliere: per interi a
  32 bit, con base ${m('2^{16}')} bastano 2 passate. Memoria in più ${m('Θ(n + b)')}: non lavora sul posto.</p>
  ${box('nota', `<p>Ordinare a partire dalla cifra più significativa (MSD) sembra più naturale, ma dopo la prima passata
  bisogna ordinare separatamente ogni gruppo con la stessa prima cifra, ricorsivamente. Il LSD invece passa sempre su
  tutto l'array e non ha bisogno di ricorsione: per questo è la versione dei libri.</p>`, 'Perché dalle unità')}
</section>

<section id="bucket">
  <h2>Bucket sort</h2>
  <p>Il terzo algoritmo lineare dei libri. Serve per numeri reali distribuiti <strong>uniformemente</strong> in
  ${m('[0, 1)')}: si preparano <var>n</var> secchi (<i>buckets</i>), il secchio <var>i</var> raccoglie i valori in
  ${m('[i/n, (i+1)/n)')}, si ordina ogni secchio con l'insertion sort e si concatenano i secchi in ordine.</p>
  <p>Se i dati sono davvero uniformi, ogni secchio riceve in media un elemento e il tempo <strong>atteso</strong> è
  ${m('Θ(n)')}. Se invece finiscono tutti nello stesso secchio, resta un insertion sort su <var>n</var> elementi:
  ${m('Θ(n^2)')} nel caso peggiore.</p>
</section>

<section id="quando">
  <h2>Quando si usano</h2>
  ${table({
    caption: 'Gli ordinamenti lineari a confronto',
    head: ['Algoritmo', 'Funziona se', 'Tempo', 'Memoria in più', 'Stabile'],
    rows: [
      ['Counting sort', 'chiavi intere in ' + m('[0, k]'), m('Θ(n + k)'), m('Θ(n + k)'), 'sì (posizionando da destra)'],
      ['Radix sort LSD', `chiavi con <var>d</var> cifre in base <var>b</var>`, m('Θ(d(n + b))'), m('Θ(n + b)'), 'sì'],
      ['Bucket sort', 'reali uniformi in ' + m('[0, 1)'), `${m('Θ(n)')} atteso, ${m('Θ(n^2)')} peggiore`, m('Θ(n)'), 'sì'],
    ],
  })}
  <p>Sono più veloci degli ordinamenti per confronti solo quando le loro ipotesi valgono: chiavi intere (o scomponibili
  in cifre) e un intervallo di valori non troppo grande rispetto a <var>n</var>. Per ordinare oggetti qualsiasi con un
  criterio qualsiasi, per esempio studenti per cognome e poi per voto, servono i confronti.</p>
</section>

<section id="esame">
  <h2>All'esame</h2>
  <ol>
    <li><strong>Limite inferiore</strong>: "dimostra che ogni ordinamento per confronti richiede ${m('Ω(n log n)')}
    confronti". Le tre righe del ragionamento: almeno ${m('n!')} foglie, al massimo ${m('2^h')} foglie,
    ${m('h >= log_2 n! = Θ(n log n)')}.</li>
    <li><strong>Counting sort a mano</strong>: scrivi <code>c</code> dopo il conteggio, dopo le somme prefisse e l'array
    <code>b</code> man mano che si riempie, da destra.</li>
    <li><strong>Radix sort a mano</strong>: scrivi l'array dopo ogni passata.</li>
    <li><strong>Domanda trabocchetto</strong>: "il counting sort contraddice il limite ${m('Ω(n log n)')}?" No: non è un
    ordinamento per confronti.</li>
  </ol>
  ${box('esame', `<p>Quando scrivi la complessità del counting sort, scrivi ${m('Θ(n + k)')} e non ${m('Θ(n)')}: il
  ${m('Θ(n)')} vale solo se ${m('k = O(n)')}, e chi corregge vuole vedere che lo sai.</p>`)}
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        decisione: (host) =>
          ASD.stepper(host, {
            id: 'decisione',
            title: 'Insertion sort con tre elementi: l\'albero di decisione',
            code: { src: 'ordinamento/insertion_sort', region: 'sort' },
            input: {
              label: 'Tre valori',
              value: [7, 3, 5],
              parse: (s) => ASD.parseNumbers(s, { min: 1, max: 99, minLen: 3, maxLen: 3 }),
              format: (v) => v.join(', '),
              presets: [
                { label: 'Già ordinato', value: [3, 5, 7] },
                { label: 'Al contrario', value: [7, 5, 3] },
                { label: 'Casuale', value: () => ASD.randomDistinct(3, 1, 60) },
              ],
            },
            view: (stage) =>
              new S.MultiView(stage, [
                { key: 'a', label: 'a', mode: 'cells' },
                { key: 'tree', kind: 'tree', label: 'Albero di decisione (a sinistra se ≤, a destra se >)', tree: { minBoxW: 44, gap: 12, levelH: 62 } },
              ]),
            trace: traceDecisione,
            counters: [{ key: 'confronti', label: 'confronti' }],
            legend: [
              { k: 'compare', label: 'confronto in corso' },
              { k: 'visited', label: 'confronti già fatti' },
              { k: 'done', label: 'foglia raggiunta' },
            ],
            validate: (input, frames) => {
              const tr = frames[frames.length - 1].state.tree;
              const leaf = Object.values(tr.nodes).find((nd) => nd.cls === 'done');
              if (!leaf) return 'nessuna foglia raggiunta';
              const order = leaf.label.split(',').map(Number).map((i) => input[i]);
              return S.isSorted(order) ? null : 'la foglia raggiunta non ordina l\'input';
            },
          }),
        counting: (host) =>
          ASD.stepper(host, {
            id: 'counting',
            title: 'Counting sort passo per passo',
            code: { src: 'ordinamento/counting_sort', region: 'counting' },
            input: {
              label: 'Interi da 0 a 9',
              value: CORMEN,
              parse: (s) => ASD.parseNumbers(s, { min: 0, max: 9, minLen: 2, maxLen: 12 }),
              format: (v) => v.join(', '),
              presets: [
                { label: 'Dal libro', value: CORMEN },
                { label: 'Casuale', value: () => ASD.randomArray(ASD.randInt(7, 10), 0, 6) },
                { label: 'Tutti diversi', value: () => ASD.randomDistinct(7, 0, 9) },
              ],
            },
            view: (stage) =>
              new S.MultiView(stage, [
                { key: 'a', label: 'a (input)', mode: 'cells' },
                { key: 'c', label: 'c (contatori, indice = valore)', mode: 'cells' },
                { key: 'b', label: 'b (output)', mode: 'cells' },
              ]),
            trace: traceCounting,
            counters: [
              { key: 'confronti', label: 'confronti tra elementi' },
              { key: 'passi', label: 'iterazioni dei cicli' },
            ],
            legend: [
              { k: 'compare', label: 'elemento letto' },
              { k: 'key', label: 'appena scritto' },
              { k: 'done', label: 'ordinato' },
              { k: 'hole', label: 'casella libera' },
            ],
            validate: validateCounting,
          }),
        radix: (host) =>
          ASD.stepper(host, {
            id: 'radix',
            title: 'Radix sort passo per passo',
            code: { src: 'ordinamento/radix_sort', region: 'radix' },
            input: {
              label: 'Interi da 0 a 999',
              value: RADIX0,
              parse: (s) => ASD.parseNumbers(s, { min: 0, max: 999, minLen: 2, maxLen: 10 }),
              format: (v) => v.join(', '),
              presets: [
                { label: 'Dal libro', value: RADIX0 },
                { label: 'Casuale', value: () => ASD.randomArray(7, 1, 999) },
                { label: 'Due cifre', value: [21, 12, 22, 11, 35, 53] },
              ],
            },
            view: (stage) =>
              new S.MultiView(stage, [
                { key: 'a', label: 'a', mode: 'cells' },
                { key: 'd', label: 'cifra della passata', mode: 'cells', cls: 'ord-digits', showIndex: false },
                { key: 'c', label: 'c (contatori delle cifre 0–9)', mode: 'cells' },
                { key: 'b', label: 'b', mode: 'cells' },
              ]),
            trace: traceRadix,
            counters: [
              { key: 'passate', label: 'passate' },
              { key: 'confronti', label: 'confronti tra elementi' },
            ],
            legend: [
              { k: 'compare', label: 'elemento letto' },
              { k: 'key', label: 'appena scritto' },
              { k: 'done', label: 'ordinato' },
            ],
            validate: S.validateKey('a'),
          }),
        quiz: (host) =>
          ASD.quiz(host, [
            {
              q: 'Quante foglie deve avere, almeno, l\'albero di decisione di un ordinamento per confronti su <var>n</var> elementi distinti?',
              options: [m('n'), m('n log_2 n'), m('n!'), m('2^n')],
              answer: 2,
              explain: `Ogni permutazione dell'input può essere l'ordine giusto, e input con ordini diversi devono finire in foglie
              diverse: servono almeno ${m('n!')} foglie. Da ${m('2^h >= n!')} viene l'altezza ${m('h >= log_2 n! = Ω(n log n)')}.`,
            },
            {
              q: 'Perché il counting sort, che costa Θ(n + k), non contraddice il limite Ω(n log n)?',
              options: [
                'Perché non confronta mai due elementi: usa i valori come indici',
                'Perché il limite vale solo per gli algoritmi ricorsivi',
                'Perché Θ(n + k) è sempre maggiore di n log n',
              ],
              answer: 0,
              explain: `Il limite riguarda gli ordinamenti che scoprono l'ordine solo con confronti. Il counting sort legge il
              valore di ogni elemento e lo usa come indice in <code>c</code>: ottiene informazioni che un confronto non dà.`,
            },
            {
              q: `Counting sort su <code>[3, 0, 3, 1]</code> con ${m('k = 3')}: com'è <code>c</code> dopo le somme prefisse?`,
              options: ['<code>[1, 1, 0, 2]</code>', '<code>[1, 2, 2, 4]</code>', '<code>[0, 1, 2, 4]</code>', '<code>[1, 2, 3, 4]</code>'],
              answer: 1,
              explain: `Dopo il conteggio <code>c = [1, 1, 0, 2]</code> (un 0, un 1, nessun 2, due 3). Le somme prefisse danno
              <code>[1, 2, 2, 4]</code>: per esempio c'è 1 elemento ≤ 0 e ce ne sono 2 ≤ 1. La prima risposta è il conteggio
              prima delle somme.`,
            },
            {
              q: 'Devi ordinare 1000 interi compresi tra 0 e un miliardo. Il counting sort conviene?',
              options: [
                'No: costa Θ(n + k) con k = 10⁹, molto più di un ordinamento Θ(n log n)',
                'Sì: è lineare, quindi batte sempre gli ordinamenti per confronti',
                'Sì, ma solo se i numeri sono distinti',
              ],
              answer: 0,
              explain: `Con ${m('k = 10^9')} servono un miliardo di contatori da azzerare e scorrere. Un merge sort su 1000
              elementi fa circa 10 000 confronti. Qui conviene un ordinamento per confronti, oppure un radix sort.`,
            },
            {
              q: 'Perché nel radix sort LSD ogni passata deve essere stabile?',
              options: [
                'Per non perdere l\'ordine ottenuto con le cifre meno significative, quando due numeri hanno la stessa cifra',
                'Per fare meno passate',
                'Non serve: basta che ogni passata ordini secondo la cifra',
              ],
              answer: 0,
              explain: `Nella passata delle decine, 11 e 12 hanno la stessa cifra: solo una passata stabile li lascia nell'ordine
              che la passata delle unità aveva già sistemato.`,
            },
            {
              q: 'Radix sort LSD su <code>[329, 457, 657, 839, 436, 720, 355]</code>: com\'è l\'array dopo la <strong>prima</strong> passata?',
              options: ['720, 355, 436, 457, 657, 329, 839', '329, 355, 436, 457, 657, 720, 839', '720, 329, 436, 839, 355, 457, 657'],
              answer: 0,
              explain: `La prima passata guarda le unità: 0, 5, 6, 7, 7, 9, 9. A parità di cifra (457 e 657, 329 e 839) resta
              l'ordine dell'input. La terza risposta è l'array dopo la seconda passata, la seconda dopo la terza.`,
            },
          ]),
      });
    },
  });

  /* --------------------------------------- albero di decisione (insertion sort, n = 3) */

  /** Esegue l'insertion sort registrando i confronti tra elementi (indici dell'input). */
  function insertionPath(vals) {
    const a = vals.slice();
    const ids = a.map((_, i) => i);
    const path = [];
    for (let i = 1; i < a.length; i++) {
      const key = a[i];
      const kid = ids[i];
      let j = i - 1;
      while (j >= 0) {
        const bigger = a[j] > key;
        path.push({ p: ids[j], q: kid, dir: bigger ? 'R' : 'L' });
        if (!bigger) break;
        a[j + 1] = a[j];
        ids[j + 1] = ids[j];
        j--;
      }
      a[j + 1] = key;
      ids[j + 1] = kid;
    }
    return { path, order: ids };
  }

  /** Albero di decisione completo: si costruisce eseguendo tutte le 6 permutazioni di valori distinti. */
  function decisionTree() {
    const nodes = {};
    const perms = [
      [1, 2, 3],
      [1, 3, 2],
      [2, 1, 3],
      [2, 3, 1],
      [3, 1, 2],
      [3, 2, 1],
    ];
    for (const pv of perms) {
      const { path, order } = insertionPath(pv);
      let id = 'r';
      for (const c of path) {
        if (!nodes[id]) nodes[id] = { label: `${c.p}:${c.q}`, kids: [id + 'L', id + 'R'] };
        id += c.dir;
      }
      nodes[id] = { label: order.join(','), kids: [], leaf: true, order };
    }
    return nodes;
  }

  function traceDecisione(input) {
    const nodes = decisionTree();
    const { path } = insertionPath(input);
    const frames = S.trace.insertion(input);
    const ids = path.reduce((acc, c) => acc.concat(acc[acc.length - 1] + c.dir), ['r']); // nodi visitati
    const tree = (k, comparing) => {
      const nn = {};
      for (const [id, nd] of Object.entries(nodes)) {
        nn[id] = {
          label: nd.label,
          kids: nd.kids,
          sub: nd.leaf ? nd.order.map((i) => input[i]).join(' ') : undefined,
        };
      }
      const edges = {};
      for (let q = 0; q < k; q++) {
        nn[ids[q]].cls = q === k - 1 && comparing ? 'compare' : 'visited';
        if (!(q === k - 1 && comparing)) edges[ids[q] + '>' + ids[q + 1]] = 'path';
      }
      return { root: 'r', nodes: nn, edges };
    };
    let prev = 0;
    const out = frames.map((f, idx) => {
      const k = f.count.confronti;
      const comparing = f.line === 'cmp' && k > prev;
      prev = k;
      const st = { a: f.state, tree: tree(k, comparing) };
      let note = f.note;
      if (comparing) {
        const c = path[k - 1];
        note += ` Nell'albero: nodo <code>${c.p}:${c.q}</code>, si va ${c.dir === 'L' ? 'a sinistra (≤)' : 'a destra (&gt;)'}.`;
      }
      if (idx === frames.length - 1) {
        const leaf = ids[ids.length - 1];
        st.tree.nodes[leaf].cls = 'done';
        note = `Foglia <code>${nodes[leaf].label}</code>: l'ordine giusto è ${nodes[leaf].order.map((i) => input[i]).join(' ≤ ')}. Confronti: ${k}, cioè la profondità di questa foglia. L'albero è alto 3 = ${ASD.mathHTML('⌈log_2 3!⌉')}: con tre elementi nessun ordinamento per confronti può garantire meno di 3 confronti.`;
      }
      return Object.assign({}, f, { note, state: st });
    });
    return out;
  }

  /* ------------------------------------------------------------ counting sort */

  function traceCounting(input) {
    const a = input.slice();
    const n = a.length;
    const lab = S.tagDuplicates(a);
    const k = Math.max(...a);
    const t = new ASD.Tracer(['confronti', 'passi']);
    const c = new Array(k + 1).fill(0);
    const bl = new Array(n).fill(null);
    let showB = false;
    const st = (o = {}) => ({
      a: { a: lab.slice(), marks: o.am || {}, ptrs: o.ap || {} },
      c: { a: c.slice(), marks: o.cm || {}, ptrs: o.cp || {} },
      b: showB ? { a: bl.slice(), marks: o.bm || {}, ptrs: o.bp || {} } : null,
      result: o.result,
    });
    t.step('c-init', `k = ${k}, il valore più grande. Creo <code>c</code> con k + 1 = ${k + 1} contatori, tutti a 0.`, { n, k }, st());
    for (let i = 0; i < n; i++) {
      c[a[i]]++;
      t.count('passi');
      t.step('count', `a[${i}] = ${lab[i]}: <code>c[${a[i]}]++</code>, ora c[${a[i]}] = ${c[a[i]]}.`, { i, 'a[i]': a[i] }, st({ am: { [i]: 'compare' }, ap: { i }, cm: { [a[i]]: 'key' } }));
    }
    for (let v = 1; v <= k; v++) {
      const old = c[v];
      c[v] += c[v - 1];
      t.count('passi');
      t.step(
        'prefix',
        `<code>c[${v}] += c[${v - 1}]</code>: ${old} + ${c[v - 1]} = ${c[v]}. Ci sono ${c[v]} element${c[v] === 1 ? 'o' : 'i'} ≤ ${v}.`,
        { v },
        st({ cm: { [v]: 'key', [v - 1]: 'compare' }, cp: { v } })
      );
    }
    showB = true;
    t.step('b-init', `Creo l'output <code>b</code> con n = ${n} caselle. Ora <code>c[v]</code> è la posizione subito dopo l'ultimo v.`, { n }, st());
    for (let i = n - 1; i >= 0; i--) {
      const v = a[i];
      c[v]--;
      t.count('passi');
      t.step('dec', `a[${i}] = ${lab[i]}: <code>c[${v}]--</code>, ora c[${v}] = ${c[v]}: è la sua posizione in b.`, { i, 'a[i]': v }, st({ am: { [i]: 'compare' }, ap: { i }, cm: { [v]: 'key' }, bp: { pos: c[v] } }));
      bl[c[v]] = lab[i];
      t.step('place', `<code>b[${c[v]}] = ${lab[i]}</code>.`, { i, 'a[i]': v }, st({ am: { [i]: 'compare' }, ap: { i }, bm: { [c[v]]: 'key' } }));
    }
    const done = {};
    for (let q = 0; q < n; q++) done[q] = 'done';
    t.step('ret', `<code>return b</code>: ordinato. Gli uguali sono rimasti nell'ordine dell'input (guarda gli apici): è stabile.`, {}, st({ bm: done, result: bl.slice() }));
    t.step(
      null,
      `Finito con <b>0 confronti</b> tra elementi. I cicli hanno fatto ${t.c.passi} iterazioni: n + k + n = ${n} + ${k} + ${n}, cioè ${ASD.mathHTML('Θ(n + k)')}.`,
      {},
      st({ bm: done, result: bl.slice() })
    );
    return t.frames;
  }

  function validateCounting(input, frames) {
    const res = frames[frames.length - 1].state.result || [];
    if (res.length !== input.length) return 'lunghezza sbagliata';
    const order = ['', '′', '″', '‴'];
    for (let q = 1; q < res.length; q++) {
      const v1 = parseInt(res[q - 1], 10);
      const v2 = parseInt(res[q], 10);
      if (v1 > v2) return 'non ordinato';
      const t1 = String(res[q - 1]).replace(/^\d+/, '');
      const t2 = String(res[q]).replace(/^\d+/, '');
      if (v1 === v2 && order.indexOf(t1) > order.indexOf(t2)) return 'non stabile';
    }
    return null;
  }

  /* -------------------------------------------------------------- radix sort */

  function traceRadix(input) {
    let a = input.slice();
    const n = a.length;
    const t = new ASD.Tracer(['passate', 'confronti']);
    const massimo = Math.max(...a);
    const nomi = { 1: 'unità', 10: 'decine', 100: 'centinaia' };
    const digits = (esp) => a.map((x) => Math.floor(x / esp) % 10);
    const st = (o = {}) => ({
      a: { a: a.slice(), marks: o.am || {}, ptrs: o.ap || {} },
      d: o.esp ? { a: digits(o.esp), marks: o.dm || {} } : null,
      c: o.c ? { a: o.c.slice(), marks: o.cm || {} } : null,
      b: o.b ? { a: o.b.slice(), marks: o.bm || {} } : null,
    });
    let esp = 1;
    for (; Math.floor(massimo / esp) > 0; esp *= 10) {
      const nome = nomi[esp] || 'cifra di peso ' + esp;
      t.count('passate');
      t.step('pass', `<code>esp = ${esp}</code>: ${Math.floor(massimo / esp)} &gt; 0, passata sulla cifra delle <b>${nome}</b>.`, { esp }, st({ esp }));
      t.step('call', `<code>countingSortCifra(a, ${esp})</code>: un counting sort stabile che guarda solo le ${nome}.`, { esp }, st({ esp }));
      const c = new Array(10).fill(0);
      for (const x of a) c[Math.floor(x / esp) % 10]++;
      t.step('count', `Il primo ciclo conta le cifre: c[d] = quanti numeri hanno ${d0(nome)} d.`, { esp }, st({ esp, c }));
      for (let d = 1; d < 10; d++) c[d] += c[d - 1];
      t.step('prefix', `Somme prefisse: ora c[d] = quanti numeri hanno ${d0(nome)} ≤ d, cioè la posizione dopo l'ultimo con cifra d.`, { esp }, st({ esp, c }));
      const b = new Array(n).fill(null);
      for (let i = n - 1; i >= 0; i--) {
        const d = Math.floor(a[i] / esp) % 10;
        c[d]--;
        b[c[d]] = a[i];
        t.step(
          'place',
          `a[${i}] = ${a[i]}, cifra ${d}: c[${d}] scende a ${c[d]} e <code>b[${c[d]}] = ${a[i]}</code>.`,
          { esp, i, d },
          st({ esp, c, b, am: { [i]: 'compare' }, ap: { i }, dm: { [i]: 'compare' }, cm: { [d]: 'key' }, bm: { [c[d]]: 'key' } })
        );
      }
      a = b.slice();
      t.step(
        'copy',
        `<code>a = b</code>: ora a è ordinato secondo le ${nome}; a parità di cifra è rimasto l'ordine della passata prima.`,
        { esp },
        st({ esp })
      );
    }
    const done = {};
    for (let q = 0; q < n; q++) done[q] = 'done';
    t.step('pass', `<code>esp = ${esp}</code>: ${massimo} / ${esp} = 0, il massimo non ha altre cifre e il ciclo finisce.`, { esp }, st({ am: done }));
    t.step(null, `Finito in ${t.c.passate} passate (le cifre del massimo, ${massimo}), senza nessun confronto tra elementi.`, {}, st({ am: done }));
    return t.frames;
  }

  function d0(nome) {
    return 'la cifra delle ' + nome;
  }
})();
