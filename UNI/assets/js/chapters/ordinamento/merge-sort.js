/* ASD a quadretti — capitolo "Merge sort".
   Divide et impera, la fusione (merge) con il buffer, il merge sort completo
   con l'albero delle chiamate, l'analisi Θ(n log n) con l'albero di ricorsione. */
(function () {
  'use strict';

  const { m, box, table, h } = ASD;
  const S = ASD.sorting;

  const ESEMPIO = [38, 27, 43, 3, 9, 82, 10, 19];

  ASD.chapter({
    id: 'merge-sort',
    title: 'Merge sort',
    lead:
      'Il primo ordinamento ricorsivo: dividi l\'array a metà, ordina le due metà e poi fondile. Costa Θ(n log n) in ogni caso ed è stabile, ma ha bisogno di un array ausiliario.',
    minutes: 40,
    prereq: ['cpp-ricorsione', 'sort-semplici'],
    goals: [
      'eseguire a mano la fusione (merge) di due sequenze ordinate e contarne i confronti',
      'simulare <code>mergeSort</code> scrivendo l\'array dopo ogni fusione, nell\'ordine in cui le chiamate avvengono davvero',
      `scrivere la ricorrenza ${m('T(n) = 2T(n/2) + Θ(n)')} e risolverla con l'albero di ricorsione`,
      'spiegare perché è stabile e perché non lavora sul posto',
    ],

    render(el) {
      el.innerHTML = `
<section id="idea">
  <h2>Divide et impera</h2>
  <p>Gli ordinamenti semplici, nel caso peggiore, fanno ${m('Θ(n^2)')} confronti: ogni elemento viene confrontato con
  quasi tutti gli altri. Il merge sort cambia strategia e usa la tecnica <strong>divide et impera</strong> (<i>divide and conquer</i>),
  in tre passi:</p>
  <ol>
    <li><strong>dividi</strong>: spezza <code>a[lo..hi]</code> in due metà, <code>a[lo..mid]</code> e
    <code>a[mid+1..hi]</code>;</li>
    <li><strong>risolvi</strong>: ordina le due metà con due chiamate ricorsive;</li>
    <li><strong>combina</strong>: fondi le due metà ordinate in un'unica sequenza ordinata. Questa operazione si chiama
    fusione (<i>merge</i>).</li>
  </ol>
  <p>La ricorsione si ferma quando il pezzo ha un solo elemento (o nessuno): è già ordinato. Dividere costa pochissimo,
  basta calcolare <code>mid</code>; tutto il lavoro sta nella fusione.</p>
  <div data-mount="figura"></div>
  <p>La figura mostra i pezzi livello per livello, ma il programma non lavora così: la ricorsione ordina
  <em>tutta</em> la metà sinistra prima di toccare la destra. L'ordine vero delle fusioni lo vedi più sotto, nel
  merge sort passo per passo.</p>
</section>

<section id="merge">
  <h2>La fusione (merge)</h2>
  <p>Immagina due pile di carte già ordinate, a faccia in su. Per fonderle guardi le due carte in cima, prendi la più
  piccola e la metti nella pila di uscita. Ripeti finché una delle due pile finisce; poi metti in fondo quello che resta
  dell'altra, che è già in ordine.</p>
  <p>Nel codice le due pile sono <code>a[lo..mid]</code> e <code>a[mid+1..hi]</code>, le loro cime sono gli indici
  <code>i</code> e <code>j</code>, e la pila di uscita è il <strong>buffer</strong> <code>b</code>, riempito dalla
  posizione <code>k</code>. Alla fine <code>b</code> viene ricopiato in <code>a[lo..hi]</code>. Nell'input scrivi le due
  metà separate da una barra <code>|</code>; gli apici distinguono i valori uguali (<code>2′</code> è il secondo 2).</p>
  <div data-mount="merge" class="ord-stepper"></div>
  ${box('nota', `<p><code>b[k++] = a[i++];</code> fa tre cose in una riga: copia <code>a[i]</code> in <code>b[k]</code>,
  poi aumenta di uno sia <code>k</code> sia <code>i</code>. Con <code>k++</code> l'espressione vale il valore
  <em>vecchio</em> di <code>k</code>, e l'aumento avviene subito dopo. Scritto per esteso:
  <code>b[k] = a[i]; k = k + 1; i = i + 1;</code></p>`, 'Il C++ di questa riga')}
  <h3>Quanto costa la fusione</h3>
  <p>Ogni confronto manda un elemento in <code>b</code>; quando una metà finisce, gli elementi rimasti dell'altra passano
  senza confronti. Con <var>m</var> elementi in tutto, divisi in due metà di ${m('m_1')} e ${m('m_2')}:</p>
  ${table({
    head: ['Quantità', 'Valore', 'Quando'],
    rows: [
      ['Confronti, al massimo', m('m - 1'), 'le due metà si alternano fino all\'ultimo elemento'],
      ['Confronti, al minimo', m('min(m_1, m_2)'), 'una metà finisce prima che l\'altra venga toccata (per esempio tutta la sinistra è più piccola)'],
      ['Spostamenti', m('2m'), 'sempre: ogni elemento entra in <code>b</code> e torna in <code>a</code>'],
      ['Memoria in più', m('Θ(m)'), 'il buffer <code>b</code>'],
    ],
  })}
  <p>La fusione costa quindi ${m('Θ(m)')}: lineare nel numero di elementi da fondere.</p>
  ${box('errore', `<p>Scrivere <code>a[i] &lt; a[j]</code> invece di <code>a[i] &lt;= a[j]</code>. L'array viene
  ordinato lo stesso, ma a parità di valore vince l'elemento di destra: due elementi uguali si scambiano di posto e
  l'ordinamento non è più <strong>stabile</strong>. Prova con <code>2, 4 | 2, 3</code>: con <code>&lt;=</code> il
  <code>2</code> di sinistra resta davanti a <code>2′</code>.</p>`)}
  ${box('errore', `<p>Dimenticare i due cicli degli avanzi (<code>while (i &lt;= mid)</code> e
  <code>while (j &lt;= hi)</code>). Il primo ciclo si ferma appena una metà è finita: senza gli altri due, gli elementi
  rimasti nell'altra metà non arrivano mai in <code>b</code>, e in <code>a</code> finiscono gli zeri del buffer.</p>`)}
</section>

<section id="algoritmo">
  <h2>Il merge sort completo</h2>
  <p><code>mergeSort(a, lo, hi)</code> ordina <code>a[lo..hi]</code>; per ordinare tutto l'array si chiama
  <code>mergeSort(a, 0, n - 1)</code>. La fusione qui è una riga sola, <code>merge(a, lo, mid, hi)</code>: i suoi
  passi interni li hai visti sopra.</p>
  <div data-mount="sort" class="ord-stepper"></div>
  <p>Sotto le barre c'è l'<strong>albero delle chiamate</strong>: ogni nodo è una chiamata, con l'intervallo di indici
  che ordina. La forma dell'albero dipende solo da <var>n</var>, non dai valori: per questo è disegnato tutto fin
  dall'inizio, con le chiamate future tratteggiate. Le chiamate grigie sono in attesa: hanno chiamato una metà e aspettano
  che finisca. Insieme alla chiamata in corso formano lo <strong>stack</strong> delle chiamate, il cammino evidenziato
  dalla radice in giù.</p>
  ${box('esame', `<p>"Scrivi l'array dopo ogni chiamata a <code>merge</code>": le fusioni avvengono nell'ordine delle
  chiamate, cioè in profondità e da sinistra. Con 8 elementi l'ordine è
  <code>[0..1]</code>, <code>[2..3]</code>, <code>[0..3]</code>, <code>[4..5]</code>, <code>[6..7]</code>,
  <code>[4..7]</code>, <code>[0..7]</code>. L'errore più comune è fondere prima tutte le coppie e poi le quaterne,
  "a livelli", come nella figura: il risultato finale è lo stesso, gli stati intermedi no.</p>`)}
  ${box('errore', `<p>Dividere male l'intervallo. Con <code>mid = lo + (hi - lo) / 2</code> le metà devono essere
  <code>[lo, mid]</code> e <code>[mid + 1, hi]</code>. Se scrivi <code>mergeSort(a, lo, mid - 1)</code> e
  <code>mergeSort(a, mid, hi)</code>, con due elementi (<code>hi = lo + 1</code>) viene <code>mid = lo</code>: la
  seconda chiamata riceve di nuovo <code>[lo, hi]</code>, identico, e la ricorsione non finisce più (lo stack si
  esaurisce e il programma si blocca).</p>`)}
</section>

<section id="analisi">
  <h2>Analisi: Θ(n log n)</h2>
  <p>Sia ${m('T(n)')} il tempo per ordinare <var>n</var> elementi. Una chiamata su <var>n</var> elementi fa due chiamate
  su <var>n</var>/2 elementi e una fusione di costo ${m('Θ(n)')}; con un solo elemento costa una costante:</p>
  <p class="formula">${m('T(n) = 2T(n/2) + Θ(n)')}, &nbsp; ${m('T(1) = Θ(1)')}</p>
  <p>Per risolverla disegna l'<strong>albero di ricorsione</strong>: ogni nodo è un sottoproblema e porta scritta la sua
  dimensione. Al livello 0 c'è un pezzo di <var>n</var> elementi, al livello 1 due pezzi di <var>n</var>/2, al livello 2
  quattro pezzi di <var>n</var>/4… Sposta il cursore e guarda la somma di ogni livello, a destra in rosso.</p>
  <div data-mount="albero"></div>
  <p>Due osservazioni chiudono il conto:</p>
  <ul>
    <li>ogni livello somma <var>n</var> elementi, perché i pezzi di un livello sono una divisione dell'array: fonderli
    tutti costa ${m('c * n')};</li>
    <li>i livelli sono ${m('log_2 n + 1')}, perché la dimensione si dimezza a ogni livello fino a 1 (per <var>n</var> non
    potenza di 2 sono ${m('⌈log_2 n⌉ + 1')}).</li>
  </ul>
  <p class="formula">${m('T(n) = c n (log_2 n + 1) = c n log_2 n + c n = Θ(n log n)')}</p>
  <p>Lo stesso risultato con il teorema master: ${m('a = 2')}, ${m('b = 2')}, ${m('f(n) = Θ(n) = Θ(n^{log_2 2})')}, è
  il secondo caso e ${m('T(n) = Θ(n log n)')}. I dettagli sono in
  ${ASD.link('cx-ricorrenze', null, 'Ricorrenze e teorema master')}.</p>
  ${box('ricorda', `<p>Il merge sort costa ${m('Θ(n log n)')} in <strong>ogni</strong> caso: migliore, medio e
  peggiore. Le divisioni non guardano i valori, e la fusione costa sempre ${m('Θ(n)')} per livello. Cambia solo un po' il
  numero esatto di confronti: per <var>n</var> potenza di 2 sta tra ${m('(n/2) log_2 n')} (per esempio array già
  ordinato) e ${m('n log_2 n - n + 1')}.</p>`)}
  <p>Quanto conviene, in pratica? Con ${m('n = 10^6')} un ordinamento semplice fa circa ${m('n^2/2 = 5 * 10^{11}')}
  confronti, il merge sort circa ${m('n log_2 n ≈ 2 * 10^7')}: venticinquemila volte meno.</p>
</section>

<section id="proprieta">
  <h2>Stabile, ma non sul posto</h2>
  ${table({
    caption: 'Merge sort in una tabella',
    head: ['Proprietà', 'Merge sort', 'Perché'],
    rows: [
      ['Caso migliore', m('Θ(n log n)'), 'le divisioni non dipendono dai valori'],
      ['Caso medio', m('Θ(n log n)'), ''],
      ['Caso peggiore', m('Θ(n log n)'), ''],
      ['Memoria in più', `${m('Θ(n)')} + ${m('O(log n)')}`, 'il buffer della fusione, più lo stack della ricorsione'],
      ['Stabile', 'sì', '<code>a[i] &lt;= a[j]</code>: a parità vince la metà sinistra'],
      ['Sul posto', 'no', 'serve il buffer'],
    ],
  })}
  <p>La memoria in più è il prezzo del merge sort. Il buffer della fusione più grande ha <var>n</var> caselle, e lo stack
  delle chiamate aperte arriva a ${m('⌈log_2 n⌉ + 1')} chiamate: in tutto ${m('Θ(n)')}. Il ${ASD.link('quick-sort')}
  invece lavora sul posto.</p>
  <p>Il merge sort non si accorge se l'array è già ordinato: fa comunque tutte le divisioni e tutte le fusioni. Una
  variante comune aggiunge, prima della fusione, <code>if (a[mid] &lt;= a[mid + 1]) return;</code>: se l'ultimo della
  metà sinistra non supera il primo della destra, le due metà sono già in ordine tra loro. Con questa riga un array già
  ordinato costa ${m('Θ(n)')}.</p>
  ${box('nota', `<p>Gli ordinamenti stabili delle librerie vere sono merge sort "ibridi": sotto una certa dimensione
  (qualche decina di elementi) ordinano i pezzi con l'insertion sort, che sugli array piccoli è più veloce, e poi li
  fondono. Il merge sort è anche il modo naturale di ordinare una lista concatenata (lì la fusione non ha bisogno del
  buffer) e i file troppo grandi per stare in memoria.</p>`, 'Nella pratica')}
</section>

<section id="esame">
  <h2>All'esame</h2>
  <p>Le domande tipiche sul merge sort:</p>
  <ol>
    <li><strong>Fusione a mano</strong>: "fondi [2, 4, 5, 7] e [1, 2, 3, 6] e conta i confronti". Scrivi
    <code>b</code> casella per casella e, a ogni passo, quale coppia hai confrontato. Qui sono 7.</li>
    <li><strong>Simulazione</strong>: "scrivi lo stato dell'array dopo ogni <code>merge</code>". Segui l'albero delle
    chiamate in profondità, da sinistra.</li>
    <li><strong>Analisi</strong>: "scrivi e risolvi la ricorrenza". ${m('T(n) = 2T(n/2) + Θ(n)')}, albero di ricorsione o
    teorema master, ${m('Θ(n log n)')}.</li>
    <li><strong>Proprietà</strong>: "è stabile? è sul posto? quanta memoria usa?" Sì, no, ${m('Θ(n)')}.</li>
  </ol>
  ${box('esame', `<p>Se ti chiedono il costo "nel caso migliore", non rispondere ${m('Θ(n)')} per analogia con
  l'insertion sort: il merge sort nella versione standard è ${m('Θ(n log n)')} anche su un array già ordinato. Se vuoi
  citare la variante con il controllo <code>a[mid] &lt;= a[mid + 1]</code>, dillo esplicitamente.</p>`)}
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        figura: (host) => host.append(dividiFondi(ESEMPIO)),
        merge: (host) =>
          ASD.stepper(host, {
            id: 'merge',
            title: 'La fusione passo per passo',
            code: { src: 'ordinamento/merge_sort', region: 'merge' },
            input: {
              label: 'Metà sinistra | metà destra',
              value: { left: [2, 4, 5, 7], right: [1, 2, 3, 6] },
              parse: parseHalves,
              format: (v) => `${v.left.join(', ')} | ${v.right.join(', ')}`,
              presets: [
                { label: 'Dal libro', value: { left: [2, 4, 5, 7], right: [1, 2, 3, 6] } },
                { label: 'Casuale', value: randomHalves },
                { label: 'Alternate', value: { left: [1, 3, 5, 7], right: [2, 4, 6, 8] } },
                { label: 'Una metà prima', value: { left: [1, 2, 3, 4], right: [5, 6, 7, 8] } },
              ],
            },
            view: (stage) =>
              new S.MultiView(stage, [
                { key: 'a', label: 'a', mode: 'cells', regionRows: 1 },
                { key: 'b', label: 'b (buffer)', mode: 'cells' },
              ]),
            trace: traceMerge,
            counters: [
              { key: 'confronti', label: 'confronti' },
              { key: 'spostamenti', label: 'spostamenti' },
            ],
            legend: [
              { k: 'compare', label: 'confronto' },
              { k: 'key', label: 'appena scritto' },
              { k: 'out', label: 'già copiato in b' },
              { k: 'done', label: 'fuso' },
              { k: 'hole', label: 'casella libera' },
            ],
            validate: validateMerge,
          }),
        sort: (host) =>
          ASD.stepper(host, {
            id: 'mergesort',
            title: 'Merge sort passo per passo',
            code: { src: 'ordinamento/merge_sort', region: 'sort' },
            input: {
              kind: 'array',
              value: ESEMPIO,
              parse: (s) => ASD.parseNumbers(s, { min: 1, max: 99, minLen: 1, maxLen: 12 }),
              presets: S.presets(8),
            },
            view: (stage) =>
              new S.MultiView(stage, [
                { key: 'a', mode: 'bars', height: 130 },
                { key: 'tree', kind: 'tree', label: 'Albero delle chiamate (indici lo–hi)', tree: { minBoxW: 36, gap: 10, levelH: 54 } },
              ]),
            trace: traceMergeSort,
            counters: [
              { key: 'chiamate', label: 'chiamate' },
              { key: 'confronti', label: 'confronti' },
            ],
            legend: [
              { k: 'active', label: 'chiamata in corso' },
              { k: 'visited', label: 'in attesa' },
              { k: 'done', label: 'finita' },
              { k: 'future', label: 'non ancora chiamata' },
              { k: 'key', label: 'appena fuso' },
              { k: 'out', label: 'fuori dall\'intervallo' },
            ],
            validate: S.validateKey('a'),
          }),
        albero: mountAlbero,
        quiz: (host) =>
          ASD.quiz(host, [
            {
              q: 'Quanti confronti fa <code>merge</code> per fondere <code>[1, 3, 5, 7]</code> e <code>[2, 4, 6, 8]</code>?',
              options: ['4', '7', '8', '16'],
              answer: 1,
              explain: `Le due metà si alternano fino alla fine: ogni confronto manda un elemento in <code>b</code> e solo
              l'ultimo, l'8, passa senza confronto. ${m('m - 1 = 8 - 1 = 7')}: è il caso peggiore della fusione.`,
            },
            {
              q: 'E per fondere <code>[1, 2, 3, 4]</code> e <code>[5, 6, 7, 8]</code>?',
              options: ['4', '7', '8', '1'],
              answer: 0,
              explain: `1, 2, 3 e 4 vengono confrontati ciascuno con 5 e vanno in <code>b</code>; a quel punto la metà
              sinistra è finita e 5, 6, 7, 8 passano con il ciclo degli avanzi, senza confronti. È il caso migliore:
              ${m('min(m_1, m_2) = 4')}.`,
            },
            {
              q: 'Qual è la complessità del merge sort su un array <strong>già ordinato</strong> di <var>n</var> elementi?',
              options: [m('Θ(n)'), m('Θ(n log n)'), m('Θ(n^2)'), m('Θ(log n)')],
              answer: 1,
              explain: `La versione standard fa sempre tutte le divisioni e tutte le fusioni: ${m('log_2 n')} livelli da
              ${m('Θ(n)')} ciascuno. Diventa ${m('Θ(n)')} solo con la variante che salta la fusione quando
              <code>a[mid] &lt;= a[mid + 1]</code>.`,
            },
            {
              q: 'Perché nella fusione si scrive <code>a[i] &lt;= a[j]</code> e non <code>a[i] &lt; a[j]</code>?',
              options: [
                'Per rendere l\'ordinamento stabile: a parità di valore passa prima l\'elemento della metà sinistra',
                'Perché con <code>&lt;</code> l\'array non verrebbe ordinato',
                'Per fare meno confronti',
              ],
              answer: 0,
              explain: `Con <code>&lt;</code> l'array viene ordinato lo stesso e i confronti sono gli stessi, ma tra due
              uguali vincerebbe quello di destra, che nell'input stava dopo: due elementi uguali si scambierebbero di posto.`,
            },
            {
              q: 'Quale ricorrenza descrive il tempo del merge sort?',
              options: [m('T(n) = 2T(n/2) + Θ(n)'), m('T(n) = T(n/2) + Θ(1)'), m('T(n) = T(n-1) + Θ(n)'), m('T(n) = 2T(n/2) + Θ(1)')],
              answer: 0,
              explain: `Due chiamate su metà array e una fusione lineare. La seconda è la ricerca binaria (${m('Θ(log n)')}),
              la terza è il quicksort nel caso peggiore (${m('Θ(n^2)')}), la quarta darebbe ${m('Θ(n)')}.`,
            },
            {
              q: 'Quali affermazioni sul merge sort (versione di questo capitolo) sono vere?',
              options: [
                'Usa memoria in più Θ(n)',
                'Lavora sul posto',
                'Fa 2n − 1 chiamate di mergeSort in tutto',
                'Con 8 elementi la prima fusione è quella di a[0..1]',
              ],
              answer: [0, 2, 3],
              explain: `Non lavora sul posto: il buffer della fusione arriva a <var>n</var> caselle. Le chiamate sono
              ${m('2n - 1')}: <var>n</var> foglie (un elemento) e ${m('n - 1')} chiamate che fondono. La prima fusione è in
              fondo al ramo più a sinistra dell'albero: <code>merge(a, 0, 0, 1)</code>.`,
            },
          ]),
      });
    },
  });

  /* ----------------------------------------------- figura "dividi e fondi" */

  function dividiFondi(arr) {
    const n = arr.length;
    // pezzi di ogni livello, con la stessa divisione del codice (mid = lo + (hi - lo) / 2)
    const levels = [[[0, n - 1]]];
    for (;;) {
      const next = [];
      let split = false;
      for (const [lo, hi] of levels[levels.length - 1]) {
        if (lo < hi) {
          const mid = lo + Math.floor((hi - lo) / 2);
          next.push([lo, mid], [mid + 1, hi]);
          split = true;
        } else next.push([lo, hi]);
      }
      if (!split) break;
      levels.push(next);
    }
    const row = (groups, cls) =>
      h('div.ord-dc-row' + (cls ? '.' + cls : ''), ...groups.map((g) => h('div.ord-dc-group', ...g.map((v) => h('span', { text: String(v) })))));
    const fig = h('figure.ord-dc', { 'aria-label': 'Le divisioni e le fusioni del merge sort su ' + arr.join(', ') });
    for (const lev of levels) fig.append(row(lev.map(([lo, hi]) => arr.slice(lo, hi + 1))));
    fig.append(h('p.ord-dc-sep', { 'aria-hidden': 'true', text: '↓ ora si fonde ↓' }));
    for (let k = levels.length - 2; k >= 0; k--) {
      fig.append(row(levels[k].map(([lo, hi]) => arr.slice(lo, hi + 1).sort((p, q) => p - q)), k === 0 ? 'is-final' : 'is-merge'));
    }
    fig.append(h('figcaption', { text: 'In alto le divisioni a metà, fino ai pezzi di un elemento; in basso le fusioni, che rimettono insieme i pezzi in ordine.' }));
    return fig;
  }

  /* ---------------------------------------------------------- la fusione */

  function parseHalves(text) {
    const parts = String(text).split('|');
    if (parts.length !== 2) throw new Error('Scrivi le due metà separate da una barra |. Esempio: 2, 4, 5, 7 | 1, 2, 3, 6');
    const opt = { min: 0, max: 99, minLen: 1, maxLen: 8 };
    const left = ASD.parseNumbers(parts[0], opt);
    const right = ASD.parseNumbers(parts[1], opt);
    if (!S.isSorted(left) || !S.isSorted(right)) throw new Error('Ogni metà deve essere già ordinata: la fusione lavora su due sequenze ordinate.');
    return { left, right };
  }

  function randomHalves() {
    const n1 = ASD.randInt(3, 5);
    const n2 = ASD.randInt(3, 5);
    const sorted = (k) => ASD.randomArray(k, 1, 30).sort((p, q) => p - q);
    return { left: sorted(n1), right: sorted(n2) };
  }

  function traceMerge(input) {
    const a = input.left.concat(input.right);
    const lab = S.tagDuplicates(a);
    const n = a.length;
    const lo = 0;
    const mid = input.left.length - 1;
    const hi = n - 1;
    const t = new ASD.Tracer(['confronti', 'spostamenti']);
    const bl = new Array(n).fill(null);
    const used = new Set();
    let aShown = lab.slice();
    const regions = [
      { from: lo, to: mid, label: 'metà sinistra' },
      { from: mid + 1, to: hi, label: 'metà destra' },
    ];
    const state = (o = {}) => {
      const am = {};
      for (const u of used) am[u] = 'out';
      Object.assign(am, o.am || {});
      return {
        a: { a: aShown.slice(), marks: am, ptrs: o.ap || {}, regions: o.noRegions ? [] : regions },
        b: { a: bl.slice(), marks: o.bm || {}, ptrs: o.bp || {} },
        result: o.result,
      };
    };
    const ap = (i, j) => {
      const p = {};
      if (i <= mid) p.i = i;
      if (j <= hi) p.j = j;
      return p;
    };

    t.step(
      'buffer',
      `<code>merge(a, ${lo}, ${mid}, ${hi})</code>: a[${lo}..${mid}] e a[${mid + 1}..${hi}] sono già ordinate. Creo il buffer <code>b</code> con hi − lo + 1 = ${n} caselle.`,
      { lo, mid, hi },
      state()
    );
    let i = lo;
    let j = mid + 1;
    let k = 0;
    t.step('init', `<code>i = ${i}</code> parte dalla metà sinistra, <code>j = ${j}</code> dalla metà destra, <code>k = 0</code> dalla prima casella di b.`, { i, j, k }, state({ ap: ap(i, j), bp: { k } }));
    while (i <= mid && j <= hi) {
      t.count('confronti');
      const left = a[i] <= a[j];
      let why;
      if (!left) why = `${a[i]} &gt; ${a[j]}: prendo quello di destra.`;
      else if (a[i] === a[j]) why = `Sono uguali, e con <code>&lt;=</code> vince quello di sinistra: è questo che rende la fusione stabile.`;
      else why = `${a[i]} ≤ ${a[j]}: prendo quello di sinistra.`;
      t.step('cmp', `Confronto a[${i}] = ${lab[i]} con a[${j}] = ${lab[j]}. ${why}`, { i, j, k }, state({ am: { [i]: 'compare', [j]: 'compare' }, ap: ap(i, j), bp: { k } }));
      if (left) {
        bl[k] = lab[i];
        used.add(i);
        t.count('spostamenti');
        t.step('take-left', `<code>b[${k}] = a[${i}] = ${lab[i]}</code>, poi i e k avanzano: i = ${i + 1}, k = ${k + 1}.`, { i: i + 1, j, k: k + 1 }, state({ bm: { [k]: 'key' }, ap: ap(i + 1, j), bp: { k: k + 1 } }));
        i++;
      } else {
        bl[k] = lab[j];
        used.add(j);
        t.count('spostamenti');
        t.step('take-right', `<code>b[${k}] = a[${j}] = ${lab[j]}</code>, poi j e k avanzano: j = ${j + 1}, k = ${k + 1}.`, { i, j: j + 1, k: k + 1 }, state({ bm: { [k]: 'key' }, ap: ap(i, j + 1), bp: { k: k + 1 } }));
        j++;
      }
      k++;
    }
    t.step(
      'loop',
      i > mid ? `<code>i = ${i} &gt; mid = ${mid}</code>: la metà sinistra è finita e il ciclo si ferma.` : `<code>j = ${j} &gt; hi = ${hi}</code>: la metà destra è finita e il ciclo si ferma.`,
      { i, j, k },
      state({ ap: ap(i, j), bp: k < n ? { k } : {} })
    );
    if (i > mid) t.step('rest-left', `<code>i &gt; mid</code>: della metà sinistra non resta niente, questo ciclo non fa nulla.`, { i, j, k }, state({ ap: ap(i, j), bp: k < n ? { k } : {} }));
    while (i <= mid) {
      bl[k] = lab[i];
      used.add(i);
      t.count('spostamenti');
      t.step('rest-left', `Avanzo della metà sinistra: <code>b[${k}] = a[${i}] = ${lab[i]}</code>, senza confronti.`, { i: i + 1, j, k: k + 1 }, state({ bm: { [k]: 'key' }, ap: ap(i + 1, j), bp: k + 1 < n ? { k: k + 1 } : {} }));
      i++;
      k++;
    }
    if (j > hi) t.step('rest-right', `<code>j &gt; hi</code>: della metà destra non resta niente, questo ciclo non fa nulla.`, { i, j, k }, state({ bp: k < n ? { k } : {} }));
    while (j <= hi) {
      bl[k] = lab[j];
      used.add(j);
      t.count('spostamenti');
      t.step('rest-right', `Avanzo della metà destra: <code>b[${k}] = a[${j}] = ${lab[j]}</code>, senza confronti.`, { i, j: j + 1, k: k + 1 }, state({ bm: { [k]: 'key' }, ap: ap(i, j + 1), bp: k + 1 < n ? { k: k + 1 } : {} }));
      j++;
      k++;
    }
    aShown = bl.slice();
    used.clear();
    t.count('spostamenti', n);
    const done = {};
    const out = {};
    for (let q = 0; q < n; q++) {
      done[q] = 'done';
      out[q] = 'out';
    }
    t.step('copy', `Il ciclo ricopia b[0..${n - 1}] in a[${lo}..${hi}], una casella alla volta: altri ${n} spostamenti. Ora a[${lo}..${hi}] è ordinato.`, { k: n }, state({ am: done, bm: out, noRegions: true }));
    t.step(
      null,
      `Finito: ${t.c.confronti} confronti per fondere ${n} elementi (al massimo n − 1 = ${n - 1}) e ${t.c.spostamenti} spostamenti (sempre 2n = ${2 * n}).`,
      {},
      Object.assign(state({ am: done, bm: out, noRegions: true }), { result: aShown.slice() })
    );
    return t.frames;
  }

  /** La fusione è giusta se il risultato è ordinato e i valori uguali tengono l'ordine degli apici (stabilità). */
  function validateMerge(input, frames) {
    return S.checkStable(frames[frames.length - 1].state.result || [], input.left.concat(input.right));
  }

  /* ------------------------------------------------- il merge sort completo */

  function traceMergeSort(input) {
    const a = input.slice();
    const n = a.length;
    const ids = a.map((_, i) => i);
    const t = new ASD.Tracer(['chiamate', 'confronti']);
    const nodes = {};
    const build = (lo, hi) => {
      const id = lo + '-' + hi;
      const kids = [];
      if (lo < hi) {
        const mid = lo + Math.floor((hi - lo) / 2);
        kids.push(build(lo, mid), build(mid + 1, hi));
      }
      nodes[id] = { label: lo === hi ? String(lo) : `${lo}–${hi}`, kids };
      return id;
    };
    const root = build(0, n - 1);
    const cls = {};
    const stack = [];
    const tree = () => {
      const nn = {};
      for (const id in nodes) nn[id] = { label: nodes[id].label, kids: nodes[id].kids, cls: cls[id] || 'future' };
      const edges = {};
      for (let q = 1; q < stack.length; q++) edges[stack[q - 1] + '>' + stack[q]] = 'path';
      return { root, nodes: nn, edges };
    };
    const view = (o = {}) => ({
      a: { a: a.slice(), ids: ids.slice(), range: o.range || null, brackets: o.brackets || [], marks: o.marks || {} },
      tree: tree(),
    });
    const fmt = (lo, hi) => '[' + a.slice(lo, hi + 1).join(', ') + ']';

    const ms = (lo, hi, depth) => {
      const id = lo + '-' + hi;
      t.count('chiamate');
      stack.push(id);
      cls[id] = 'active';
      const vars = { lo, hi, livello: depth };
      if (lo >= hi) {
        t.step('base', `<code>mergeSort(a, ${lo}, ${hi})</code>: un solo elemento, ${a[lo]}. È già ordinato: la chiamata finisce subito.`, vars, view({ range: [lo, hi], marks: { [lo]: 'active' } }));
        cls[id] = 'done';
        stack.pop();
        return;
      }
      t.step('base', `Chiamata <code>mergeSort(a, ${lo}, ${hi})</code>: ${hi - lo + 1} elementi da ordinare, ${fmt(lo, hi)}. lo &lt; hi, quindi si divide.`, vars, view({ range: [lo, hi] }));
      const mid = lo + Math.floor((hi - lo) / 2);
      const br = [
        { from: lo, to: mid },
        { from: mid + 1, to: hi },
      ];
      const v2 = Object.assign({}, vars, { mid });
      t.step('mid', `<code>mid = ${lo} + ${hi - lo}/2 = ${lo} + ${mid - lo} = ${mid}</code>: metà sinistra a[${lo}..${mid}], metà destra a[${mid + 1}..${hi}].`, v2, view({ range: [lo, hi], brackets: br }));
      t.step('left', `Chiamo <code>mergeSort(a, ${lo}, ${mid})</code> sulla metà sinistra. Questa chiamata resta in attesa finché quella non finisce.`, v2, view({ range: [lo, hi], brackets: br }));
      cls[id] = 'visited';
      ms(lo, mid, depth + 1);
      cls[id] = 'active';
      t.step('right', `Di nuovo in <code>mergeSort(a, ${lo}, ${hi})</code>: la metà sinistra ora è ordinata, ${fmt(lo, mid)}. Chiamo <code>mergeSort(a, ${mid + 1}, ${hi})</code> sulla destra.`, v2, view({ range: [lo, hi], brackets: br }));
      cls[id] = 'visited';
      ms(mid + 1, hi, depth + 1);
      cls[id] = 'active';
      t.step('merge', `Le due metà sono ordinate: ${fmt(lo, mid)} e ${fmt(mid + 1, hi)}. <code>merge(a, ${lo}, ${mid}, ${hi})</code> le fonde.`, v2, view({ range: [lo, hi], brackets: br }));
      // la fusione (stabile), con gli identificativi per far scorrere le barre
      const L = [];
      const R = [];
      for (let q = lo; q <= mid; q++) L.push([a[q], ids[q]]);
      for (let q = mid + 1; q <= hi; q++) R.push([a[q], ids[q]]);
      let i = 0;
      let j = 0;
      let k = lo;
      let c = 0;
      while (i < L.length && j < R.length) {
        c++;
        const e = L[i][0] <= R[j][0] ? L[i++] : R[j++];
        a[k] = e[0];
        ids[k] = e[1];
        k++;
      }
      for (; i < L.length; i++, k++) [a[k], ids[k]] = L[i];
      for (; j < R.length; j++, k++) [a[k], ids[k]] = R[j];
      t.count('confronti', c);
      const marks = {};
      for (let q = lo; q <= hi; q++) marks[q] = lo === 0 && hi === n - 1 ? 'done' : 'key';
      t.step('merge', `Dopo la fusione (${c} confront${c === 1 ? 'o' : 'i'}): a[${lo}..${hi}] = ${fmt(lo, hi)}, ordinato. La chiamata finisce.`, v2, view({ range: [lo, hi], marks }));
      cls[id] = 'done';
      stack.pop();
    };

    if (n === 0) return t.step(null, 'Array vuoto.', {}, view()).frames;
    ms(0, n - 1, 0);
    const all = {};
    for (let q = 0; q < n; q++) all[q] = 'done';
    t.step(
      null,
      `Finito. Chiamate: ${t.c.chiamate} = 2n − 1 (${n} con un solo elemento e ${n - 1} che fondono). Confronti: ${t.c.confronti}` +
        (n > 1 ? `, contro gli n(n−1)/2 = ${(n * (n - 1)) / 2} del selection sort.` : '.'),
      {},
      view({ marks: all })
    );
    return t.frames;
  }

  /* -------------------------------------- laboratorio: l'albero di ricorsione */

  function mountAlbero(host) {
    const lab = h('div.lab.ord-lab');
    const body = h('div.lab-body.quadretti');
    const controls = h('div.lab-controls');
    const out = h('div.lab-out.ord-lab-out', { 'aria-live': 'polite' });
    lab.append(h('div.lab-head', h('h3', { text: 'Albero di ricorsione del merge sort' })), body, controls, out);
    host.append(lab);
    const view = new ASD.viz.TreeView(body, { layout: 'tidy', shape: 'circle', r: 16, gap: 10, levelH: 56, ariaLabel: 'Albero di ricorsione: dimensioni dei sottoproblemi' });

    const id = ASD.uid('albero-n');
    const nOut = h('output', { for: id });
    const range = h('input', { type: 'range', id, min: '1', max: '16', step: '1', value: '8' });
    controls.append(h('label.slider', { for: id }, h('span', 'n (elementi da ordinare)'), range, nOut));
    range.addEventListener('input', draw);

    function draw() {
      const n = Number(range.value);
      nOut.textContent = String(n);
      const nodes = {};
      const byLevel = [];
      let next = 0;
      const build = (size, depth) => {
        const id = 'n' + next++;
        const kids = size > 1 ? [build(Math.ceil(size / 2), depth + 1), build(Math.floor(size / 2), depth + 1)] : [];
        nodes[id] = { label: String(size), kids, cls: size === 1 ? 'done' : null };
        (byLevel[depth] = byLevel[depth] || []).push({ id, size });
        return id;
      };
      const root = build(n, 0);
      const rows = [];
      byLevel.forEach((lev, d) => {
        const sum = lev.reduce((s, x) => s + x.size, 0);
        nodes[lev[lev.length - 1].id].note = '= ' + sum;
        const merging = lev.filter((x) => x.size > 1);
        rows.push([
          String(d),
          String(lev.length),
          String(sum),
          merging.length ? `${merging.length} fusion${merging.length === 1 ? 'e' : 'i'}, ${merging.reduce((s, x) => s + x.size, 0)} elementi` : 'solo casi base',
        ]);
      });
      view.render({ root, nodes });
      const L = byLevel.length;
      const pow = Number.isInteger(Math.log2(n));
      out.innerHTML =
        `<p><strong>${L} livell${L === 1 ? 'o' : 'i'}</strong> = ${pow ? m(`log_2 ${n} + 1`) : m(`⌈log_2 ${n}⌉ + 1`)}. Ogni livello somma al massimo ${n} elementi: le fusioni di un livello costano ${m('Θ(n)')}. In tutto ${m('Θ(n) * Θ(log n) = Θ(n log n)')}.</p>` +
        `<div class="ord-levels">${table({ head: ['Livello', 'Pezzi', 'Elementi in tutto', 'Lavoro di fusione'], rows })}</div>`;
    }
    draw();
  }
})();
