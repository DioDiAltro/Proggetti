/* ASD a quadretti — capitolo "Quicksort".
   Partizione di Lomuto (con le zone dell'invariante), quicksort completo con
   l'albero delle chiamate che cresce, casi migliore/medio/peggiore, pivot
   casuale, partizione di Hoare, stabilità, stack e confronto con il merge sort. */
(function () {
  'use strict';

  const { m, box, table, h } = ASD;
  const S = ASD.sorting;

  const LIBRO = [2, 8, 7, 1, 3, 5, 6, 4];

  ASD.chapter({
    id: 'quick-sort',
    title: 'Quicksort',
    lead:
      'Anche il quicksort divide e ricorre, ma mette il lavoro all\'inizio: sceglie un pivot e sposta a sinistra i più piccoli e a destra i più grandi. Di solito è il più veloce di tutti; con il pivot sbagliato diventa quadratico.',
    minutes: 45,
    prereq: ['merge-sort', 'cpp-ricorsione'],
    goals: [
      'eseguire a mano la partizione di Lomuto e dire dove finisce il pivot',
      'simulare il quicksort completo e disegnarne l\'albero delle chiamate',
      `spiegare perché il caso medio è ${m('Θ(n log n)')} e il peggiore ${m('Θ(n^2)')}, e su quali input succede`,
      'sapere a cosa serve il pivot casuale, perché il quicksort non è stabile e quanto stack usa',
    ],

    render(el) {
      el.innerHTML = `
<section id="idea">
  <h2>L'idea: dividere bene</h2>
  <p>Il merge sort divide a caso (a metà) e lavora quando ricombina. Il quicksort fa il contrario: lavora quando divide,
  così che ricombinare non costi niente. Per ordinare <code>a[lo..hi]</code>:</p>
  <ol>
    <li><strong>scegli un pivot</strong>, un elemento dell'intervallo (qui: l'ultimo, <code>a[hi]</code>);</li>
    <li><strong>partiziona</strong>: riordina l'intervallo in modo che a sinistra del pivot ci siano solo elementi ≤ pivot
    e a destra solo elementi &gt; pivot. Il pivot finisce in una posizione <code>p</code> che è già quella
    <strong>definitiva</strong>;</li>
    <li><strong>ricorri</strong> su <code>a[lo..p-1]</code> e su <code>a[p+1..hi]</code>.</li>
  </ol>
  <p>Quando le due parti sono ordinate, tutto l'intervallo è ordinato: gli elementi a sinistra di <code>p</code> sono già
  tutti minori o uguali a quelli a destra. Non serve nessuna fusione, e nessun array ausiliario.</p>
</section>

<section id="partizione">
  <h2>La partizione di Lomuto</h2>
  <p>La partizione scorre l'intervallo una volta sola con l'indice <code>j</code> e tiene un secondo indice
  <code>i</code>: la fine della zona dei piccoli. A ogni passo l'intervallo è diviso in quattro zone, che sotto le barre
  vedi come parentesi:</p>
  <ul>
    <li><code>a[lo..i]</code>: elementi ≤ pivot;</li>
    <li><code>a[i+1..j-1]</code>: elementi &gt; pivot;</li>
    <li><code>a[j..hi-1]</code>: elementi ancora da guardare;</li>
    <li><code>a[hi]</code>: il pivot.</li>
  </ul>
  <p>Se <code>a[j]</code> è &gt; pivot, basta andare avanti: la zona dei grandi si allunga da sola. Se è ≤ pivot, la zona
  dei piccoli cresce di una casella (<code>i++</code>) e <code>a[j]</code> si scambia con <code>a[i]</code>, che era il
  primo dei grandi. Alla fine il pivot si scambia con <code>a[i+1]</code> e va in mezzo.</p>
  <div data-mount="partition" class="ord-stepper"></div>
  ${box('ricorda', `<p>Dopo <code>partition</code> il pivot è nella sua <strong>posizione definitiva</strong>: non si
  muoverà più. La partizione fa sempre esattamente ${m('hi - lo')} confronti, cioè ${m('n - 1')} su <var>n</var>
  elementi: costa ${m('Θ(n)')}, qualunque sia l'input.</p>`)}
  ${box('nota', `<p>Lo pseudocodice del Cormen (PARTITION) è proprio questo, con gli indici da 1. Se all'esame trovi la
  partizione di <em>Hoare</em>, è un'altra procedura con lo stesso scopo: la vedi più sotto.</p>`, 'Sul libro')}
</section>

<section id="algoritmo">
  <h2>Il quicksort completo</h2>
  <p><code>quickSort(a, lo, hi)</code> ordina <code>a[lo..hi]</code>; per tutto l'array si chiama
  <code>quickSort(a, 0, n - 1)</code>. Qui la partizione è una riga sola: il suo lavoro interno l'hai visto sopra.
  Le barre verdi sono elementi già nella posizione definitiva.</p>
  <div data-mount="sort" class="ord-stepper"></div>
  <p>Questa volta l'albero delle chiamate <strong>cresce mentre l'algoritmo procede</strong>: la sua forma dipende da
  dove finiscono i pivot, cioè dai valori. Prova il bottone <strong>Già ordinato</strong>: il pivot è sempre il massimo,
  la parte destra è sempre vuota (∅) e l'albero diventa un lungo filo, alto quanto l'array.</p>
  ${box('esame', `<p>"Applica il quicksort a [...] e scrivi l'array dopo ogni partizione": scrivi anche il pivot e la
  posizione <code>p</code> in cui finisce, e procedi in profondità, prima la parte sinistra. Come nel merge sort, chi
  procede "a livelli" ottiene stati intermedi diversi da quelli del codice.</p>`)}
</section>

<section id="analisi">
  <h2>Caso migliore, peggiore e medio</h2>
  <p>Una chiamata su <var>n</var> elementi fa una partizione, ${m('Θ(n)')}, e due chiamate su <var>k</var> e
  ${m('n - k - 1')} elementi, dove <var>k</var> dipende da dove finisce il pivot:</p>
  <p class="formula">${m('T(n) = T(k) + T(n - k - 1) + Θ(n)')}</p>
  <h3>Caso migliore: il pivot divide a metà</h3>
  <p>Se il pivot finisce sempre al centro, ${m('T(n) = 2T(n/2) + Θ(n)')}: è la ricorrenza del merge sort, e
  ${m('T(n) = Θ(n log n)')}. L'albero delle chiamate è bilanciato, alto ${m('log_2 n')}.</p>
  <h3>Caso peggiore: il pivot è il minimo o il massimo</h3>
  <p>Se il pivot finisce sempre a un estremo, una parte è vuota e l'altra ha ${m('n - 1')} elementi:</p>
  <p class="formula">${m('T(n) = T(n - 1) + Θ(n)')} &nbsp;⇒&nbsp; ${m('(n-1) + (n-2) + … + 1 = n(n-1)/2')} confronti, ${m('Θ(n^2)')}</p>
  <p>Con il pivot preso dall'ultima posizione succede proprio sugli input più "innocui":</p>
  <ul>
    <li>array <strong>già ordinato</strong>: il pivot è sempre il massimo;</li>
    <li>array <strong>al contrario</strong>: il pivot è alternativamente il minimo e il massimo;</li>
    <li>array con <strong>tutti gli elementi uguali</strong>: con <code>a[j] &lt;= pivot</code> tutti finiscono a sinistra.</li>
  </ul>
  ${box('errore', `<p>Pensare che il caso peggiore del quicksort sia un input "strano". Con il pivot fisso in ultima (o
  prima) posizione il caso peggiore è l'array già ordinato, che nella pratica capita spessissimo.</p>`)}
  <h3>Caso medio</h3>
  <p>Su un input in ordine casuale il pivot cade quasi sempre "abbastanza" in mezzo, e basta: anche se ogni partizione
  dividesse sempre 9 a 1, l'albero sarebbe alto ${m('log_{10/9} n')} e il costo resterebbe ${m('Θ(n log n)')}. Il conto
  esatto (lo trovi sul Cormen) dà in media circa ${m('2n ln n ≈ 1,39 n log_2 n')} confronti per <var>n</var> grande.</p>
  <p>Misuralo: il grafico conta i confronti per <var>n</var> crescente, sull'input casuale e su quello già ordinato.</p>
  <div data-mount="grafico"></div>
  <p>Lo stesso esperimento in C++, con 2000 elementi. Il programma conta anche la profondità massima della ricorsione,
  cioè quante chiamate sono aperte insieme nel momento peggiore:</p>
  <div data-mount="casi"></div>
  <pre class="code-out" tabindex="0"><code>n = 2000                   confronti  profondità
casuale                        23843          25
già ordinato                 1999000        2000
al contrario                 1999000        2000
tutti uguali                 1999000        2000
già ordinato, pivot a caso     24747          24
n(n-1)/2 = 1999000</code></pre>
  <p>${m('1999000 = 2000 * 1999/2')}: esattamente il caso peggiore. Sull'input casuale i confronti sono circa ottanta
  volte meno, e la profondità è 25 invece di 2000.</p>
</section>

<section id="pivot">
  <h2>Scegliere il pivot</h2>
  <p>Il pivot fisso in ultima posizione è comodo da spiegare ma fragile. Le scelte usate davvero:</p>
  <dl>
    <dt>Pivot casuale (quicksort randomizzato)</dt>
    <dd>si sceglie una posizione a caso in <code>[lo, hi]</code>, la si scambia con <code>a[hi]</code> e si partiziona
    come prima. Nessun input è più "cattivo" degli altri: il tempo <strong>atteso</strong> è ${m('Θ(n log n)')} su
    <em>ogni</em> input. Il caso peggiore ${m('Θ(n^2)')} esiste ancora, ma richiede una sequenza di scelte sfortunate
    con probabilità trascurabile.</dd>
    <dt>Mediano di tre</dt>
    <dd>si prende il valore di mezzo tra <code>a[lo]</code>, <code>a[mid]</code> e <code>a[hi]</code>. Sugli array già
    ordinati o al contrario sceglie il centro esatto.</dd>
  </dl>
  <div data-mount="random"></div>
  <h3>La partizione di Hoare</h3>
  <p>È la partizione originale di Hoare, l'inventore del quicksort: due indici partono dalle estremità e si vengono
  incontro; <code>i</code> si ferma sul primo elemento ≥ pivot, <code>j</code> sul primo ≤ pivot, e la coppia fuori posto
  si scambia. Quando gli indici si incrociano, <code>a[lo..j]</code> contiene elementi ≤ pivot e
  <code>a[j+1..hi]</code> elementi ≥ pivot.</p>
  <div data-mount="hoare"></div>
  <pre class="code-out" tabindex="0"><code>Dopo la partizione: 1 3 2 5 9 8 7 6
j = 3: a[0..3] &lt;= pivot &lt;= a[4..7]
Ordinato:           1 2 3 5 6 7 8 9</code></pre>
  <p>Rispetto a Lomuto fa in media circa tre volte meno scambi, e con molti elementi uguali divide a metà invece di
  degenerare. In cambio è più delicata: il pivot non finisce per forza in <code>a[j]</code>, quindi le chiamate
  ricorsive sono su <code>[lo, j]</code> e <code>[j + 1, hi]</code>, con <code>j</code> incluso.</p>
  ${box('errore', `<p>Mescolare le due versioni: usare la partizione di Hoare con le chiamate di Lomuto
  (<code>p - 1</code> e <code>p + 1</code>) salta degli elementi e non ordina; usare quelle di Hoare con la partizione di
  Lomuto può non terminare. Ogni partizione va con le sue chiamate.</p>`)}
</section>

<section id="proprieta">
  <h2>Stabilità, memoria, confronto con il merge sort</h2>
  <h3>Non è stabile</h3>
  <p>Gli scambi della partizione spostano gli elementi "a distanza", saltando quelli in mezzo. Con
  <code>[2<sub>a</sub>, 2<sub>b</sub>, 1]</code> il pivot è 1, nessun elemento è ≤ 1, e l'ultimo scambio mette il pivot in
  <code>a[0]</code> mandando <code>2<sub>a</sub></code> in fondo: <code>[1, 2<sub>b</sub>, 2<sub>a</sub>]</code>. I due 2
  si sono invertiti.</p>
  <h3>Lavora sul posto, ma usa lo stack</h3>
  <p>Il quicksort non usa array ausiliari: è un ordinamento <strong>sul posto</strong>. La ricorsione però occupa lo
  stack: le chiamate aperte insieme sono quanto l'albero è alto, cioè ${m('O(log n)')} in media e <var>n</var> nel caso
  peggiore. Con un milione di elementi già ordinati, un milione di chiamate annidate fanno esaurire lo stack e il
  programma si interrompe. Il rimedio: chiamare la ricorsione solo sulla parte più piccola e continuare con un ciclo
  sulla più grande.</p>
  <div data-mount="piccola"></div>
  <p>Ogni chiamata ricorsiva riceve al massimo metà dell'intervallo, quindi lo stack resta ${m('O(log n)')} anche nel
  caso peggiore. Il programma completo misura la profondità massima su 5000 elementi, con le due versioni:</p>
  <pre class="code-out" tabindex="0"><code>n = 5000                        profondità massima
già ordinato, due ricorsioni    5000
già ordinato, parte piccola     2
casuale, due ricorsioni         27
casuale, parte piccola          9</code></pre>
  <p>Il tempo, invece, non cambia: sull'array già ordinato i confronti restano ${m('n(n-1)/2')}. Per quello serve un pivot
  migliore.</p>
  <h3>Quicksort o merge sort?</h3>
  ${table({
    head: ['', 'Merge sort', 'Quicksort'],
    rows: [
      ['Caso migliore', m('Θ(n log n)'), m('Θ(n log n)')],
      ['Caso medio', m('Θ(n log n)'), `${m('Θ(n log n)')}, circa ${m('1,39 n log_2 n')} confronti`],
      ['Caso peggiore', m('Θ(n log n)'), `${m('Θ(n^2)')} (con il pivot casuale: improbabile)`],
      ['Memoria in più', `${m('Θ(n)')} buffer + ${m('O(log n)')} stack`, `stack ${m('O(log n)')} in media, ${m('Θ(n)')} nel peggiore`],
      ['Stabile', 'sì', 'no'],
      ['Sul posto', 'no', 'sì'],
      ['Dove sta il lavoro', 'nel ricombinare (merge)', 'nel dividere (partition)'],
    ],
  })}
  <p>Nella pratica il quicksort è di solito il più veloce: fa pochi spostamenti, lavora su caselle vicine (la cache del
  processore ringrazia) e non alloca memoria. Il merge sort vince quando serve la stabilità, quando serve una garanzia
  sul caso peggiore, o quando si ordinano liste concatenate. La funzione <code>std::sort</code> del C++ è un quicksort
  "protetto": lo vedi nel ${ASD.link('sort-confronto')}.</p>
</section>

<section id="esame">
  <h2>All'esame</h2>
  <ol>
    <li><strong>Partizione a mano</strong>: "applica PARTITION a [2, 8, 7, 1, 3, 5, 6, 4]". Scrivi <code>i</code>,
    <code>j</code> e l'array dopo ogni scambio; risultato <code>[2, 1, 3, 4, 7, 5, 6, 8]</code> con il pivot in
    <code>a[3]</code>.</li>
    <li><strong>Caso peggiore</strong>: "quanti confronti su un array ordinato di <var>n</var> elementi?" ${m('n(n-1)/2')}:
    scrivi la somma, non solo il risultato.</li>
    <li><strong>Ricorrenze</strong>: migliore ${m('T(n) = 2T(n/2) + Θ(n)')}, peggiore ${m('T(n) = T(n-1) + Θ(n)')}.</li>
    <li><strong>Proprietà</strong>: stabile? (no) sul posto? (sì) quanto stack? (${m('O(log n)')} in media).</li>
  </ol>
  ${box('esame', `<p>Se la domanda è "qual è la complessità del quicksort", la risposta completa ha tre parti:
  ${m('Θ(n log n)')} nel caso medio e migliore, ${m('Θ(n^2)')} nel caso peggiore, e quando succede il caso peggiore (pivot
  sempre minimo o massimo, per esempio array già ordinato con pivot in ultima posizione).</p>`)}
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        partition: (host) =>
          ASD.stepper(host, {
            id: 'partition',
            title: 'La partizione di Lomuto passo per passo',
            code: { src: 'ordinamento/quick_sort', region: 'partition' },
            input: {
              kind: 'array',
              value: LIBRO,
              parse: (s) => ASD.parseNumbers(s, { min: 1, max: 99, minLen: 2, maxLen: 12 }),
              presets: [{ label: 'Dal libro', value: LIBRO }].concat(S.presets(8)),
            },
            view: (stage) => new S.MultiView(stage, [{ key: 'a', mode: 'bars', height: 140, regionRows: 2 }]),
            trace: tracePartition,
            counters: [
              { key: 'confronti', label: 'confronti' },
              { key: 'scambi', label: 'scambi' },
            ],
            legend: [
              { k: 'key', label: 'pivot' },
              { k: 'compare', label: 'a[j] confrontato' },
              { k: 'swap', label: 'scambio' },
              { k: 'done', label: 'posizione definitiva' },
            ],
            validate: validatePartition,
          }),
        sort: (host) =>
          ASD.stepper(host, {
            id: 'quicksort',
            title: 'Quicksort passo per passo',
            code: { src: 'ordinamento/quick_sort', region: 'sort' },
            input: {
              kind: 'array',
              value: LIBRO,
              parse: (s) => ASD.parseNumbers(s, { min: 1, max: 99, minLen: 1, maxLen: 12 }),
              presets: S.presets(8).concat([{ label: 'Tutti uguali', value: () => new Array(7).fill(ASD.randInt(10, 60)) }]),
            },
            view: (stage) =>
              new S.MultiView(stage, [
                { key: 'a', mode: 'bars', height: 130, regionRows: 1 },
                { key: 'tree', kind: 'tree', label: 'Albero delle chiamate (indici lo–hi, ∅ = intervallo vuoto)', tree: { minBoxW: 36, gap: 10, levelH: 50 } },
              ]),
            trace: traceQuick,
            counters: [
              { key: 'chiamate', label: 'chiamate' },
              { key: 'confronti', label: 'confronti' },
            ],
            legend: [
              { k: 'active', label: 'chiamata in corso' },
              { k: 'visited', label: 'in attesa' },
              { k: 'key', label: 'pivot' },
              { k: 'done', label: 'al posto definitivo / chiamata finita' },
              { k: 'out', label: 'fuori dall\'intervallo' },
            ],
            validate: S.validateKey('a'),
          }),
        grafico: mountGrafico,
        casi: (host) => ASD.code(host, { src: 'ordinamento/quick_casi', maxHeight: 360 }),
        random: (host) => ASD.code(host, { src: 'ordinamento/quick_casi', region: 'random' }),
        hoare: (host) => ASD.code(host, { src: 'ordinamento/quick_hoare', region: 'hoare' }),
        piccola: (host) => ASD.code(host, { src: 'ordinamento/quick_stack', region: 'piccola' }),
        quiz: (host) =>
          ASD.quiz(host, [
            {
              q: 'Com\'è l\'array <code>[2, 8, 7, 1, 3, 5, 6, 4]</code> dopo <code>partition(a, 0, 7)</code> (Lomuto, pivot = ultimo)?',
              options: ['<code>[2, 1, 3, 4, 7, 5, 6, 8]</code>', '<code>[1, 2, 3, 4, 5, 6, 7, 8]</code>', '<code>[2, 1, 3, 4, 8, 7, 5, 6]</code>', '<code>[4, 2, 1, 3, 8, 7, 5, 6]</code>'],
              answer: 0,
              explain: `Il pivot è 4. Sono ≤ 4 il 2, l'1 e il 3: ognuno viene scambiato con il primo dei grandi, nell'ordine.
              Dopo il ciclo l'array è <code>[2, 1, 3, 8, 7, 5, 6, 4]</code>, e l'ultimo scambio mette il 4 in
              <code>a[3]</code> mandando l'8 in fondo. La partizione non ordina le due zone: le divide soltanto.`,
            },
            {
              q: 'Quanti confronti fa il quicksort (Lomuto, pivot = ultimo) su un array <strong>già ordinato</strong> di <var>n</var> elementi?',
              options: [m('n - 1'), m('n log_2 n'), m('n(n-1)/2'), m('n^2')],
              answer: 2,
              explain: `Il pivot è sempre il massimo: la partizione su <var>m</var> elementi fa ${m('m - 1')} confronti e lascia
              una parte di ${m('m - 1')} elementi. In tutto ${m('(n-1) + (n-2) + … + 1 = n(n-1)/2')}.`,
            },
            {
              q: 'Con il pivot in ultima posizione, quali input portano al caso peggiore Θ(n²)?',
              options: ['Array già ordinato', 'Array al contrario', 'Array con tutti gli elementi uguali', 'Array in ordine casuale'],
              answer: [0, 1, 2],
              explain: `Nei primi tre casi il pivot finisce sempre a un estremo dell'intervallo (con tutti uguali, perché
              <code>a[j] &lt;= pivot</code> è sempre vero). Su un input casuale, invece, il caso medio è ${m('Θ(n log n)')}.`,
            },
            {
              q: 'Cosa garantisce la scelta del pivot a caso?',
              options: [
                'Che il tempo atteso sia Θ(n log n) su qualunque input',
                'Che il caso peggiore diventi Θ(n log n)',
                'Che l\'ordinamento diventi stabile',
              ],
              answer: 0,
              explain: `Il caso peggiore resta ${m('Θ(n^2)')}, ma ora dipende dalle scelte casuali e non dall'input: nessun input è
              "cattivo", e la probabilità di scelte sempre sfortunate è trascurabile. La stabilità non c'entra.`,
            },
            {
              q: 'Quanta memoria in più usa il quicksort (versione di questo capitolo), oltre all\'array?',
              options: [
                'Solo lo stack della ricorsione: O(log n) in media, Θ(n) nel caso peggiore',
                'Un buffer di n caselle, come il merge sort',
                'Nessuna: O(1) sempre',
              ],
              answer: 0,
              explain: `Non ci sono array ausiliari, ma ogni chiamata aperta occupa spazio sullo stack. Le chiamate aperte insieme
              sono quanto l'albero è alto: ${m('O(log n)')} se è bilanciato, <var>n</var> se è un filo (array già ordinato).`,
            },
            {
              q: 'Il quicksort è stabile?',
              options: ['No: gli scambi a distanza possono invertire due elementi uguali', 'Sì, perché usa <code>&lt;=</code>', 'Sì, ma solo con il pivot casuale'],
              answer: 0,
              explain: `Con <code>[2<sub>a</sub>, 2<sub>b</sub>, 1]</code> l'ultimo scambio della partizione porta
              <code>2<sub>a</sub></code> in fondo: il risultato è <code>[1, 2<sub>b</sub>, 2<sub>a</sub>]</code>.`,
            },
          ]),
      });
    },
  });


  /* --------------------------------------------------- partizione di Lomuto */

  function tracePartition(input) {
    const a = input.slice();
    const n = a.length;
    const ids = a.map((_, i) => i);
    const lo = 0;
    const hi = n - 1;
    const t = new ASD.Tracer(['confronti', 'scambi']);
    const pivot = a[hi];
    const regs = (i, j) => {
      const r = [];
      if (i >= lo) r.push({ from: lo, to: i, label: '≤ pivot', cls: 'le' });
      if (j - 1 >= i + 1) r.push({ from: i + 1, to: j - 1, label: '> pivot', cls: 'gt' });
      if (hi - 1 >= j) r.push({ from: j, to: hi - 1, label: 'da vedere', cls: 'todo' });
      return r;
    };
    const ptrs = (i, j) => {
      const p = {};
      if (i >= lo) p.i = i;
      if (j != null && j < hi) p.j = j;
      return p;
    };
    const swap = (x, y) => {
      [a[x], a[y]] = [a[y], a[x]];
      [ids[x], ids[y]] = [ids[y], ids[x]];
    };
    const st = (o = {}) => ({
      a: { a: a.slice(), ids: ids.slice(), marks: Object.assign(o.pivotAt === null ? {} : { [o.pivotAt == null ? hi : o.pivotAt]: 'pivot' }, o.marks || {}), ptrs: o.ptrs || {}, regions: o.regions || [] },
      result: o.result,
    });

    t.step('pivot', `<code>pivot = a[${hi}] = ${pivot}</code>: il pivot è l'ultimo elemento dell'intervallo.`, { lo, hi, pivot }, st({ regions: regs(lo - 1, lo) }));
    let i = lo - 1;
    t.step('i-init', `<code>i = lo − 1 = ${i}</code>: la zona dei ≤ pivot, <code>a[lo..i]</code>, per ora è vuota.`, { i, pivot }, st({ regions: regs(i, lo) }));
    for (let j = lo; j < hi; j++) {
      t.count('confronti');
      const small = a[j] <= pivot;
      t.step(
        'cmp',
        small
          ? `<code>a[${j}] = ${a[j]}</code> ≤ ${pivot}: deve entrare nella zona dei piccoli.`
          : `<code>a[${j}] = ${a[j]}</code> &gt; ${pivot}: resta dov'è. La zona dei grandi si allunga di una casella.`,
        { i, j, pivot },
        st({ marks: { [j]: 'compare' }, ptrs: ptrs(i, j), regions: regs(i, j) })
      );
      if (small) {
        i++;
        t.step('inc', `<code>i = ${i}</code>: la zona dei piccoli si prepara ad allungarsi fino ad a[${i}].`, { i, j, pivot }, st({ marks: { [j]: 'compare' }, ptrs: ptrs(i, j), regions: regs(i - 1, j) }));
        swap(i, j);
        t.count('scambi');
        t.step(
          'swap',
          i === j
            ? `<code>swap(a[${i}], a[${j}])</code>: è la stessa casella, non cambia niente. Ora a[${lo}..${i}] sono tutti ≤ ${pivot}.`
            : `<code>swap(a[${i}], a[${j}])</code>: ${a[i]} entra nella zona dei piccoli, ${a[j]} (era il primo dei grandi) va in a[${j}], in fondo alla zona dei grandi.`,
          { i, j, pivot },
          st({ marks: i === j ? { [i]: 'swap' } : { [i]: 'swap', [j]: 'swap' }, ptrs: ptrs(i, j), regions: regs(i, j + 1) })
        );
      }
    }
    const p = i + 1;
    swap(p, hi);
    t.count('scambi');
    t.step(
      'place',
      p === hi
        ? `Ciclo finito. <code>swap(a[${p}], a[${hi}])</code>: il pivot è già in a[${hi}], tutti gli altri sono ≤ ${pivot}.`
        : `Ciclo finito. <code>swap(a[${p}], a[${hi}])</code>: il pivot ${pivot} va in a[${p}], tra le due zone; ${a[hi]} va in fondo.`,
      { i, pivot },
      st({ pivotAt: p, marks: p === hi ? { [p]: 'swap' } : { [p]: 'swap', [hi]: 'swap' }, regions: regs(i, hi) })
    );
    const final = [];
    if (p > lo) final.push({ from: lo, to: p - 1, label: '≤ pivot', cls: 'le' });
    if (p < hi) final.push({ from: p + 1, to: hi, label: '> pivot', cls: 'gt' });
    t.step('ret', `<code>return ${p}</code>: a[${p}] = ${pivot} è nella sua posizione definitiva.`, { p, pivot }, st({ pivotAt: null, marks: { [p]: 'done' }, regions: final, result: p }));
    t.step(
      null,
      `Finito: ${t.c.confronti} confronti (sempre hi − lo = ${hi - lo}) e ${t.c.scambi} scambi. A sinistra ${p - lo} element${p - lo === 1 ? 'o' : 'i'} ≤ ${pivot}, a destra ${hi - p} &gt; ${pivot}, ciascuna parte ancora in disordine.`,
      {},
      st({ pivotAt: null, marks: { [p]: 'done' }, regions: final, result: p })
    );
    return t.frames;
  }

  function validatePartition(input, frames) {
    const st = frames[frames.length - 1].state;
    const a = st.a.a;
    const p = st.result;
    const pivot = input[input.length - 1];
    if (a[p] !== pivot) return `a[${p}] dovrebbe essere il pivot ${pivot}`;
    for (let k = 0; k < p; k++) if (a[k] > pivot) return `a[${k}] = ${a[k]} è a sinistra ma è > pivot`;
    for (let k = p + 1; k < a.length; k++) if (a[k] <= pivot) return `a[${k}] = ${a[k]} è a destra ma è ≤ pivot`;
    if (a.slice().sort((x, y) => x - y).join() !== input.slice().sort((x, y) => x - y).join()) return 'elementi diversi dall\'input';
    return null;
  }

  /* ------------------------------------------------- il quicksort completo */

  function traceQuick(input) {
    const a = input.slice();
    const n = a.length;
    const ids = a.map((_, i) => i);
    const t = new ASD.Tracer(['chiamate', 'confronti']);
    const nodes = {};
    const cls = {};
    const stack = [];
    const fixed = new Set();
    let root = null;
    let count = 0;
    const swap = (x, y) => {
      [a[x], a[y]] = [a[y], a[x]];
      [ids[x], ids[y]] = [ids[y], ids[x]];
    };
    const tree = () => {
      const nn = {};
      for (const id in nodes) nn[id] = { label: nodes[id].label, kids: nodes[id].kids.slice(), cls: cls[id] };
      const edges = {};
      for (let q = 1; q < stack.length; q++) edges[stack[q - 1] + '>' + stack[q]] = 'path';
      return { root, nodes: nn, edges };
    };
    const view = (o = {}) => {
      const marks = {};
      for (const f of fixed) marks[f] = 'done';
      Object.assign(marks, o.marks || {});
      return { a: { a: a.slice(), ids: ids.slice(), range: o.range || null, marks, regions: o.regions || [] }, tree: tree() };
    };
    const fmt = (lo, hi) => (lo > hi ? '[]' : '[' + a.slice(lo, hi + 1).join(', ') + ']');

    const qs = (lo, hi, depth, parent) => {
      const id = 'c' + count++;
      t.count('chiamate');
      nodes[id] = { label: lo > hi ? '∅' : lo === hi ? String(lo) : `${lo}–${hi}`, kids: [] };
      if (parent) nodes[parent].kids.push(id);
      else root = id;
      stack.push(id);
      cls[id] = 'active';
      const vars = { lo, hi, livello: depth };
      if (lo >= hi) {
        if (lo === hi) fixed.add(lo);
        t.step(
          'base',
          lo > hi
            ? `<code>quickSort(a, ${lo}, ${hi})</code>: intervallo vuoto. <code>lo &lt; hi</code> è falso e la chiamata finisce subito.`
            : `<code>quickSort(a, ${lo}, ${hi})</code>: un solo elemento, ${a[lo]}. È già nella sua posizione definitiva.`,
          vars,
          view({ range: [lo, hi] })
        );
        cls[id] = 'done';
        stack.pop();
        return;
      }
      t.step('base', `Chiamata <code>quickSort(a, ${lo}, ${hi})</code>: ${hi - lo + 1} elementi, ${fmt(lo, hi)}. lo &lt; hi: si partiziona.`, vars, view({ range: [lo, hi] }));
      const pivot = a[hi];
      t.step('part', `<code>partition(a, ${lo}, ${hi})</code> con pivot a[${hi}] = ${pivot}.`, vars, view({ range: [lo, hi], marks: { [hi]: 'pivot' } }));
      let i = lo - 1;
      let c = 0;
      for (let j = lo; j < hi; j++) {
        c++;
        if (a[j] <= pivot) swap(++i, j);
      }
      const p = i + 1;
      swap(p, hi);
      fixed.add(p);
      t.count('confronti', c);
      const regions = [];
      if (p > lo) regions.push({ from: lo, to: p - 1, label: '≤ ' + pivot, cls: 'le' });
      if (p < hi) regions.push({ from: p + 1, to: hi, label: '> ' + pivot, cls: 'gt' });
      const v2 = Object.assign({}, vars, { p });
      const sbil = p === lo || p === hi ? ' Divisione sbilanciata: una delle due parti è vuota.' : '';
      t.step(
        'part',
        `Dopo la partizione (${c} confront${c === 1 ? 'o' : 'i'}): <code>p = ${p}</code>, il ${pivot} è al suo posto definitivo. A sinistra ${fmt(lo, p - 1)}, a destra ${fmt(p + 1, hi)}.${sbil}`,
        v2,
        view({ range: [lo, hi], regions })
      );
      t.step('left', `Chiamo <code>quickSort(a, ${lo}, ${p - 1})</code> sulla parte sinistra.`, v2, view({ range: [lo, hi], regions }));
      cls[id] = 'visited';
      qs(lo, p - 1, depth + 1, id);
      cls[id] = 'active';
      t.step('right', `Di nuovo in <code>quickSort(a, ${lo}, ${hi})</code>: la parte sinistra è ordinata. Chiamo <code>quickSort(a, ${p + 1}, ${hi})</code> sulla destra.`, v2, view({ range: [lo, hi], regions }));
      cls[id] = 'visited';
      qs(p + 1, hi, depth + 1, id);
      cls[id] = 'done';
      stack.pop();
    };

    qs(0, n - 1, 0, null);
    let height = 0;
    const depthOf = (id, d) => {
      height = Math.max(height, d);
      for (const k of nodes[id].kids) depthOf(k, d + 1);
    };
    depthOf(root, 0);
    // l'albero cresce durante l'esecuzione: si riserva da subito la sua altezza finale
    for (const f of t.frames) f.state.tree.minDepth = height;
    const worst = (n * (n - 1)) / 2;
    t.step(
      null,
      `Finito: ${t.c.confronti} confronti e ${t.c.chiamate} chiamate; l'albero ha ${height + 1} livelli.` +
        (t.c.confronti === worst && n > 2 ? ` I confronti sono n(n−1)/2 = ${worst}: è il caso peggiore.` : ` Il caso peggiore ne farebbe n(n−1)/2 = ${worst}.`),
      {},
      view()
    );
    return t.frames;
  }

  /* ---------------------------------------------- laboratorio: i confronti */

  function mountGrafico(host) {
    const lab = h('div.lab');
    const body = h('div.lab-body');
    const controls = h('div.lab-controls');
    const out = h('div.lab-out', { 'aria-live': 'polite' });
    lab.append(h('div.lab-head', h('h3', { text: 'Quanti confronti fa il quicksort?' })), body, controls, out);
    host.append(lab);

    const id = ASD.uid('qs-n');
    const nOut = h('output', { for: id });
    const range = h('input', { type: 'range', id, min: '100', max: '2000', step: '100', value: '600' });
    const logId = ASD.uid('qs-log');
    const logBox = h('input', { type: 'checkbox', id: logId });
    const again = h('button.btn.btn-sm', { type: 'button', text: 'Nuovi dati casuali' });
    controls.append(
      h('label.slider', { for: id }, h('span', 'n massimo'), range, nOut),
      h('label.chip', { for: logId }, logBox, 'scala logaritmica'),
      again
    );

    const plot = new ASD.viz.Plot(body, {
      x: { min: 0, max: 600, label: 'n', integer: true },
      y: { min: 0, label: 'confronti' },
      height: 300,
      ariaLabel: 'Confronti del quicksort in funzione di n: input casuale, già ordinato, già ordinato con pivot casuale',
    });

    let timer = null;
    const schedule = () => {
      nOut.textContent = range.value;
      clearTimeout(timer);
      timer = setTimeout(draw, 60);
    };
    range.addEventListener('input', schedule);
    again.addEventListener('click', draw);
    logBox.addEventListener('change', () => {
      plot.setAxis('y', { log: logBox.checked, min: logBox.checked ? 10 : 0 });
    });

    function draw() {
      const N = Number(range.value);
      nOut.textContent = String(N);
      const ns = [];
      for (let k = 1; k <= 12; k++) ns.push(Math.max(10, Math.round((N * k) / 12)));
      const cas = [];
      const ord = [];
      const rnd = [];
      let last = null;
      for (const n of ns) {
        const sorted = Array.from({ length: n }, (_, i) => i);
        const c1 = S.count.quick(ASD.randomArray(n, 0, 9999)).confronti;
        const c2 = S.count.quick(sorted).confronti;
        const c3 = S.count.quick(sorted, { random: true }).confronti;
        cas.push([n, c1]);
        ord.push([n, c2]);
        rnd.push([n, c3]);
        last = { n, c1, c2, c3 };
      }
      plot.o.x.max = N;
      plot.set({
        series: [
          { id: 'q', label: 'n(n−1)/2', slot: 8, fn: (x) => (x * (x - 1)) / 2, dashed: true },
          { id: 'nl', label: 'n log₂ n', slot: 6, fn: (x) => (x > 1 ? x * Math.log2(x) : 0), dashed: true },
          { id: 'ord', label: 'già ordinato', slot: 2, points: ord, line: true },
          { id: 'cas', label: 'casuale', slot: 1, points: cas, line: true },
          { id: 'rnd', label: 'pivot a caso', slot: 3, points: rnd, line: true },
        ],
      });
      out.innerHTML =
        `<p style="margin:0">Con <var>n</var> = ${last.n}: input casuale <strong>${ASD.fmt(last.c1)}</strong> confronti, già ordinato ` +
        `<strong>${ASD.fmt(last.c2)}</strong> (= ${m(`n(n-1)/2`)}), già ordinato con pivot a caso <strong>${ASD.fmt(last.c3)}</strong>. ` +
        `Per confronto, ${m('n log_2 n')} ≈ ${ASD.fmt(Math.round(last.n * Math.log2(last.n)))}. Attiva la scala logaritmica per vedere le curve basse.</p>`;
    }
    draw();
  }
})();
