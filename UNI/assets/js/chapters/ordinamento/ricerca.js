/* ASD a quadretti — capitolo "Ricerca lineare e binaria".
   Ricerca lineare, ricerca binaria iterativa e ricorsiva, quante iterazioni
   (Θ(log n)), lower_bound / upper_bound e gli errori tipici. */
(function () {
  'use strict';

  const { m, box, table, h } = ASD;
  const S = ASD.sorting;

  const ARRAY0 = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
  const BOUNDS0 = [1, 3, 3, 3, 5, 8, 8, 10];

  ASD.chapter({
    id: 'ricerca',
    title: 'Ricerca lineare e binaria',
    lead:
      'Trovare un valore in un array: guardando tutti gli elementi, in Θ(n), oppure dimezzando a ogni passo la parte da esaminare, in Θ(log n), se l\'array è ordinato. La ricerca binaria è corta da scrivere e facile da sbagliare: qui la smonti riga per riga.',
    minutes: 35,
    prereq: ['cpp-funzioni', 'cx-costo'],
    goals: [
      'scrivere la ricerca lineare e la ricerca binaria, iterativa e ricorsiva, senza errori di indice',
      'simulare a mano la ricerca binaria scrivendo <code>lo</code>, <code>mid</code> e <code>hi</code> a ogni iterazione',
      `spiegare perché bastano ${m('⌊log_2 n⌋ + 1')} iterazioni e perché l'array deve essere ordinato`,
      'usare <code>lower_bound</code>, <code>upper_bound</code> e <code>binary_search</code> e sapere cosa restituiscono',
    ],

    render(el) {
      el.innerHTML = `
<section id="lineare">
  <h2>Ricerca lineare</h2>
  <p>Il problema: dato un array <code>a</code> di <var>n</var> interi e un valore <var>x</var>, trovare una posizione
  <code>i</code> con <code>a[i] == x</code>, oppure dire che <var>x</var> non c'è. Le funzioni di questo capitolo
  restituiscono l'indice, oppure <code>-1</code> quando <var>x</var> manca: −1 non è mai un indice valido.</p>
  <p>Il modo più semplice è guardare gli elementi uno alla volta, da sinistra a destra, finché trovi <var>x</var> o
  finisce l'array. È la ricerca lineare (o sequenziale, <i>linear search</i>) e funziona su <strong>qualunque</strong>
  array, anche disordinato.</p>
  <div data-mount="lineare"></div>
  <h3>Quanto costa</h3>
  <p>L'operazione dominante è il confronto <code>a[i] == x</code>. Quanti confronti servono dipende da dove sta
  <var>x</var>:</p>
  ${table({
    head: ['Caso', 'Quando', 'Confronti', 'Complessità'],
    rows: [
      ['Migliore', '<var>x</var> è in <code>a[0]</code>', '1', m('Θ(1)')],
      ['Peggiore', '<var>x</var> non c\'è (oppure è in <code>a[n-1]</code>)', m('n'), m('Θ(n)')],
      ['Medio', '<var>x</var> c\'è, in una posizione a caso', m('(n+1)/2'), m('Θ(n)')],
    ],
  })}
  <p>Nel caso medio, se ogni posizione è ugualmente probabile, si guarda in media metà array: ${m('(1 + 2 + … + n)/n = (n+1)/2')}
  confronti. Le costanti si buttano: è ${m('Θ(n)')}, come il caso peggiore.</p>
</section>

<section id="binaria">
  <h2>Ricerca binaria</h2>
  <p>Se l'array è <strong>ordinato</strong> si può fare molto meglio. È quello che fai con un dizionario: lo apri a metà,
  guardi una parola e sai subito se quella che cerchi sta prima o dopo. Metà del dizionario non la guardi più.</p>
  <p>Nel codice la parte ancora da esaminare è <code>a[lo..hi]</code>, estremi compresi. A ogni iterazione:</p>
  <ol>
    <li>calcoli la posizione centrale <code>mid</code>;</li>
    <li>se <code>a[mid] == x</code> hai finito;</li>
    <li>se <code>a[mid] &lt; x</code>, anche tutti gli elementi a sinistra di <code>mid</code> sono minori di
    <var>x</var> (l'array è ordinato): <var>x</var> può stare solo in <code>a[mid+1..hi]</code>, quindi
    <code>lo = mid + 1</code>;</li>
    <li>altrimenti <code>a[mid] &gt; x</code> e <var>x</var> può stare solo in <code>a[lo..mid-1]</code>:
    <code>hi = mid - 1</code>.</li>
  </ol>
  <p>Il ciclo va avanti finché l'intervallo non è vuoto, cioè finché <code>lo &lt;= hi</code>. Prova con un input tuo:
  scrivi l'array, una barra <code>|</code> e il valore da cercare. Le caselle attenuate sono quelle già scartate.</p>
  <div data-mount="binaria"></div>
  ${box('ricorda', `<p>L'<strong>invariante</strong> della ricerca binaria: <em>se x è nell'array, allora sta in
  <code>a[lo..hi]</code></em>. All'inizio è vero, perché l'intervallo è tutto l'array, e ogni iterazione scarta solo
  elementi che non possono essere <var>x</var>. Quando l'intervallo diventa vuoto (<code>lo &gt; hi</code>),
  <var>x</var> non c'è.</p>`)}
  <h3>Perché mid = lo + (hi − lo) / 2</h3>
  <p>La divisione tra interi tronca: con <code>lo = 0</code> e <code>hi = 9</code> viene
  <code>mid = 0 + 9/2 = 4</code>. Quando gli elementi rimasti sono in numero pari, <code>mid</code> è il primo dei
  due centrali.</p>
  <p>In matematica ${m('lo + (hi - lo)/2')} e ${m('(lo + hi)/2')} sono la stessa cosa. In C++ no: la somma
  <code>lo + hi</code> può superare il valore massimo di un <code>int</code> (2 147 483 647, circa 2,1 miliardi), e
  l'overflow di un intero con segno è comportamento indefinito. <code>hi - lo</code> invece non supera mai
  <code>hi</code>, e <code>lo + (hi - lo) / 2</code> sta sempre tra <code>lo</code> e <code>hi</code>.</p>
  ${box('nota', `Non è un'ipotesi da libro: nel 2006 si scoprì che la ricerca binaria della libreria standard di Java
  usava <code>(lo + hi) / 2</code> e sbagliava sugli array con più di un miliardo di elementi. Era lì da anni e
  nessuno se n'era accorto, perché con array piccoli le due formule danno lo stesso risultato.`, 'Un errore famoso')}
</section>

<section id="passi">
  <h2>Quante iterazioni: Θ(log n)</h2>
  <p>Ogni iterazione che non trova <var>x</var> lascia al massimo metà degli elementi: se l'intervallo ne ha
  <var>s</var>, ne restano al più ${m('⌊s/2⌋')}. Partendo da <var>n</var>, dopo <var>k</var> iterazioni ne restano al
  più ${m('⌊n/2^k⌋')}. La domanda diventa: <strong>quante volte puoi dimezzare <var>n</var> prima di arrivare a 0?</strong></p>
  <div data-mount="dimezza"></div>
  <p>La risposta è ${m('⌊log_2 n⌋ + 1')}, che è anche il numero di cifre di <var>n</var> scritto in binario: dimezzare
  significa togliere l'ultima cifra binaria. Quindi la ricerca binaria fa al massimo ${m('⌊log_2 n⌋ + 1')} iterazioni,
  ognuna di costo costante: ${m('Θ(log n)')} nel caso peggiore. Nel caso migliore <var>x</var> è proprio nel primo
  <code>mid</code>: ${m('Θ(1)')}.</p>
  ${table({
    caption: 'Confronti nel caso peggiore',
    head: ['n', 'Ricerca lineare', 'Ricerca binaria'],
    rows: [
      ['10', '10', '4'],
      ['1 000', '1 000', '10'],
      ['1 000 000', '1 000 000', '20'],
      ['1 000 000 000', '1 000 000 000', '30'],
    ],
  })}
  ${box('esame', `<p>"Quante iterazioni fa al massimo la ricerca binaria su 1000 elementi?" Trova la potenza di 2 appena
  sotto: ${m('2^9 = 512 <= 1000 < 1024 = 2^{10}')}, quindi ${m('⌊log_2 1000⌋ = 9')} e le iterazioni sono al massimo
  ${m('9 + 1 = 10')}. Se ti chiedono solo l'ordine di grandezza, basta ${m('Θ(log n)')}.</p>`)}
</section>

<section id="ricorsiva">
  <h2>La versione ricorsiva</h2>
  <p>La stessa idea si scrive con la ricorsione: l'intervallo <code>[lo, hi]</code> viaggia nei parametri e ogni
  chiamata, se non trova <var>x</var>, ne fa <strong>una sola</strong> sulla metà giusta. Il caso base è l'intervallo
  vuoto.</p>
  <div data-mount="ricorsiva"></div>
  <p>Cerchiamo 13 nell'array di prima, <code>[2, 5, 8, 12, 16, 23, 38, 56, 72, 91]</code>, che non lo contiene:</p>
  <ol>
    <li><code>binarySearchRec(a, 13, 0, 9)</code>: <code>mid = 4</code>, <code>a[4] = 16 &gt; 13</code>, cerca a sinistra;</li>
    <li><code>binarySearchRec(a, 13, 0, 3)</code>: <code>mid = 1</code>, <code>a[1] = 5 &lt; 13</code>, cerca a destra;</li>
    <li><code>binarySearchRec(a, 13, 2, 3)</code>: <code>mid = 2</code>, <code>a[2] = 8 &lt; 13</code>, cerca a destra;</li>
    <li><code>binarySearchRec(a, 13, 3, 3)</code>: <code>mid = 3</code>, <code>a[3] = 12 &lt; 13</code>, cerca a destra;</li>
    <li><code>binarySearchRec(a, 13, 4, 3)</code>: <code>lo &gt; hi</code>, intervallo vuoto: restituisce −1, e il −1
    risale uguale lungo tutte le chiamate aperte.</li>
  </ol>
  <p>Il tempo si legge dalla ricorrenza ${m('T(n) = T(n/2) + Θ(1)')}, che dà ${m('Θ(log n)')}
  (${ASD.link('cx-ricorrenze', null, 'ricorrenze e teorema master')}). La memoria invece cambia: ogni chiamata aperta
  occupa spazio sullo stack, e le chiamate aperte arrivano a ${m('⌊log_2 n⌋ + 2')}. Memoria in più ${m('O(log n)')},
  contro ${m('O(1)')} della versione iterativa.</p>
  ${box('nota', `La chiamata ricorsiva è l'ultima cosa che la funzione fa: si chiama <em>ricorsione di coda</em>
  (<i>tail recursion</i>). Per questo si trasforma direttamente nel ciclo <code>while</code> della versione iterativa;
  con le ottimizzazioni attive (<code>-O2</code>) molti compilatori la trasformano da soli.`, 'Ricorsione di coda')}
</section>

<section id="ordinato">
  <h2>Perché l'array deve essere ordinato</h2>
  <p>Il passo "<code>a[mid] &lt; x</code>, quindi <var>x</var> non sta a sinistra" è giusto solo se a sinistra di
  <code>mid</code> ci sono elementi minori o uguali ad <code>a[mid]</code>. Su un array disordinato la ricerca binaria
  scarta mezzo array senza motivo e può non trovare un <var>x</var> che c'è. Prova il bottone
  <strong>Non ordinato</strong> nella ${ASD.link('ricerca', 'binaria', 'visualizzazione della ricerca binaria')}: cerca 9 in <code>[9, 2, 7, 4, 1, 8, 3]</code>,
  guarda 4, 8 e 3, va sempre a destra e restituisce −1, mentre 9 è in <code>a[0]</code>.</p>
  ${box('errore', `<p>Usare la ricerca binaria su un array non ordinato. Il programma compila e gira, ma la risposta può
  essere sbagliata senza nessun messaggio. Se l'array non è ordinato, o lo ordini prima o usi la ricerca lineare.</p>`)}
  <p>Ordinare costa ${m('Θ(n log n)')} (lo vedi in ${ASD.link('merge-sort')}), più di una ricerca lineare. Conviene
  quando le ricerche sono tante. Con <var>k</var> ricerche su <var>n</var> elementi:</p>
  <ul>
    <li>solo ricerche lineari: ${m('k * n')} confronti;</li>
    <li>ordinare una volta e poi ricerche binarie: ${m('n log_2 n + k log_2 n')}.</li>
  </ul>
  <p>Con ${m('n = 10^6')} e ${m('k = 1000')}: un miliardo di confronti contro circa venti milioni. Con una ricerca sola,
  invece, vince la lineare.</p>
</section>

<section id="bound">
  <h2>lower_bound e upper_bound</h2>
  <p>Se un valore compare più volte, la ricerca binaria restituisce <em>una</em> delle sue posizioni, non per forza la
  prima. Spesso serve di più: dove compare la prima volta, quante volte compare, dove inserirlo senza rompere l'ordine.
  Rispondono due varianti della ricerca binaria:</p>
  <dl>
    <dt><code>lower_bound(x)</code></dt>
    <dd>la prima posizione <code>i</code> con <code>a[i] &gt;= x</code>;</dd>
    <dt><code>upper_bound(x)</code></dt>
    <dd>la prima posizione <code>i</code> con <code>a[i] &gt; x</code>.</dd>
  </dl>
  <p>Se nessun elemento va bene, la risposta è <var>n</var>: la posizione "dopo l'ultimo". Gli elementi uguali a
  <var>x</var> sono esattamente <code>a[lower..upper-1]</code>, quindi compaiono <code>upper − lower</code> volte. E se
  inserisci <var>x</var> in posizione <code>lower</code> (o <code>upper</code>) l'array resta ordinato. Sposta il
  cursore e guarda dove cadono:</p>
  <div data-mount="bounds"></div>
  <h3>Come si scrive</h3>
  <p>Qui conviene un intervallo <strong>semiaperto</strong> <code>[lo, hi)</code>: <code>lo</code> è dentro,
  <code>hi</code> è la prima posizione fuori. All'inizio <code>hi = n</code>, così anche la risposta <var>n</var> è
  possibile. Due differenze dalla ricerca binaria di prima:</p>
  <ul>
    <li>il ciclo <strong>non si ferma</strong> quando trova <var>x</var>: va avanti finché l'intervallo è vuoto
    (<code>lo == hi</code>);</li>
    <li>quando <code>a[mid] &gt;= x</code> si scrive <code>hi = mid</code> e non <code>mid - 1</code>, perché
    <code>mid</code> stesso potrebbe essere la risposta.</li>
  </ul>
  <div data-mount="lower"></div>
  <p><code>upperBound</code> è identica tranne un carattere: <code>&lt;=</code> al posto di <code>&lt;</code>. Così
  anche gli elementi uguali a <var>x</var> finiscono a sinistra della risposta.</p>
  <div data-mount="upper"></div>
  <h3>Nella libreria standard</h3>
  <p>In <code>&lt;algorithm&gt;</code> ci sono già <code>lower_bound</code>, <code>upper_bound</code> e
  <code>binary_search</code>, che risponde solo sì o no. Lavorano su un intervallo di iteratori
  <code>[first, last)</code>, semiaperto come il nostro, e i primi due restituiscono un iteratore: sottraendo
  <code>a.begin()</code> si ottiene l'indice.</p>
  <div data-mount="stl"></div>
  <p>Output del programma completo, che mette a confronto le funzioni scritte a mano (<code>lower</code>,
  <code>upper</code>) e quelle della libreria (i tre valori dopo <code>libreria:</code>):</p>
  <pre class="code-out" tabindex="0"><code>a = 1 3 3 3 5 8 8 10
x =  3:  lower 1  upper 4  occorrenze 3   libreria: 1 4 true
x =  4:  lower 4  upper 4  occorrenze 0   libreria: 4 4 false
x =  8:  lower 5  upper 7  occorrenze 2   libreria: 5 7 true
x =  0:  lower 0  upper 0  occorrenze 0   libreria: 0 0 false
x = 11:  lower 8  upper 8  occorrenze 0   libreria: 8 8 false</code></pre>
  ${box('nota', `<p><code>std::binary_search</code> dice solo <em>se</em> <var>x</var> c'è. Se ti serve anche
  <em>dove</em>, usa <code>lower_bound</code> e controlla il risultato: <var>x</var> c'è se la posizione è minore di
  <var>n</var> e <code>a[pos] == x</code>.</p>`, 'Quale usare')}
</section>

<section id="errori">
  <h2>Errori tipici</h2>
  <p>La ricerca binaria è famosa perché si spiega in un minuto e si sbaglia facilmente. Gli errori sono quasi sempre di
  uno: un <code>+ 1</code> che manca, un <code>&lt;</code> al posto di <code>&lt;=</code>.</p>
  <h3>Il ciclo infinito: lo = mid</h3>
  <p>Con <code>lo = mid</code> al posto di <code>lo = mid + 1</code>, quando l'intervallo ha due elementi
  <code>mid</code> coincide con <code>lo</code>: se <code>a[mid] &lt; x</code>, <code>lo</code> non si sposta e il
  ciclo ripete gli stessi passi per sempre. Qui sotto succede cercando 12, che pure è nell'array:</p>
  <div data-mount="bug"></div>
  <h3>Intervalli mescolati</h3>
  <p>Intervallo chiuso <code>[lo, hi]</code> o semiaperto <code>[lo, hi)</code>: vanno bene tutti e due, ma ogni riga
  deve rispettare la stessa scelta.</p>
  ${table({
    head: ['', 'Chiuso [lo, hi]', 'Semiaperto [lo, hi)'],
    rows: [
      ['Inizio', '<code>hi = n - 1</code>', '<code>hi = n</code>'],
      ['Condizione del ciclo', '<code>lo &lt;= hi</code>', '<code>lo &lt; hi</code>'],
      ['Scartare da mid in su', '<code>hi = mid - 1</code>', '<code>hi = mid</code>'],
      ['Scartare da mid in giù', '<code>lo = mid + 1</code>', '<code>lo = mid + 1</code>'],
      ['Intervallo vuoto quando', '<code>lo &gt; hi</code>', '<code>lo == hi</code>'],
    ],
  })}
  ${box('errore', `<p>Scrivere <code>hi = n</code> e poi <code>while (lo &lt;= hi)</code>. Se <var>x</var> è più grande di
  tutti, <code>lo</code> arriva a <var>n</var>, <code>mid</code> vale <var>n</var> e il programma legge
  <code>a[n]</code>, una casella fuori dall'array. L'operatore <code>[]</code> di <code>vector</code> non controlla gli
  indici: comportamento indefinito, spesso senza nessun messaggio.</p>`)}
</section>

<section id="esame">
  <h2>All'esame</h2>
  ${table({
    caption: 'Riepilogo dei costi',
    head: ['Algoritmo', 'Migliore', 'Peggiore', 'Memoria in più', 'Richiede'],
    rows: [
      ['Ricerca lineare', m('Θ(1)'), m('Θ(n)'), m('O(1)'), 'niente'],
      ['Ricerca binaria iterativa', m('Θ(1)'), m('Θ(log n)'), m('O(1)'), 'array ordinato'],
      ['Ricerca binaria ricorsiva', m('Θ(1)'), m('Θ(log n)'), `${m('O(log n)')} di stack`, 'array ordinato'],
      ['<code>lower_bound</code>, <code>upper_bound</code>', m('Θ(log n)'), m('Θ(log n)'), m('O(1)'), 'array ordinato'],
    ],
  })}
  <p>Le richieste più frequenti:</p>
  <ol>
    <li><strong>Simulazione</strong>: "cerca 23 in [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]: scrivi lo, hi e mid a ogni
    iterazione". Fai una tabella con una riga per iterazione e controllati con la visualizzazione.</li>
    <li><strong>Conteggio</strong>: "quanti confronti al massimo con <var>n</var> = 1000?" Sono ${m('⌊log_2 n⌋ + 1 = 10')}.</li>
    <li><strong>Codice</strong>: "scrivi la ricerca binaria ricorsiva e la sua ricorrenza".</li>
  </ol>
  ${box('esame', `<p>Nella simulazione scrivi sempre come calcoli <code>mid</code> (per esempio
  <code>mid = 5 + (9 − 5)/2 = 7</code>) e quale metà scarti. Se sbagli un conto, chi corregge vede che il metodo è
  giusto; se scrivi solo i numeri, vede solo l'errore.</p>`)}
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        lineare: (host) => ASD.code(host, { src: 'ordinamento/ricerca_lineare', region: 'lineare', notes: { cmp: 'da 1 a n volte' } }),
        binaria: (host) =>
          ASD.stepper(host, {
            id: 'binaria',
            title: 'Ricerca binaria passo per passo',
            code: { src: 'ordinamento/ricerca_binaria', region: 'binaria' },
            input: {
              label: 'Array | x',
              value: { a: ARRAY0, x: 23 },
              parse: (s) => parseSearch(s),
              format: fmtSearch,
              presets: [
                { label: 'Trovato', value: { a: ARRAY0, x: 23 } },
                { label: 'Non c\'è', value: { a: ARRAY0, x: 60 } },
                { label: 'Casuale (16)', value: randomSearch },
                { label: 'Non ordinato', value: { a: [9, 2, 7, 4, 1, 8, 3], x: 9 } },
              ],
            },
            view: (stage) => new ASD.viz.ArrayView(stage, { mode: 'cells', minSlot: 26 }),
            trace: traceBinary,
            counters: [{ key: 'iterazioni', label: 'iterazioni' }],
            legend: [
              { k: 'compare', label: 'a[mid]' },
              { k: 'done', label: 'trovato' },
              { k: 'out', label: 'scartato' },
            ],
            validate: validateSearch,
          }),
        dimezza: mountDimezza,
        ricorsiva: (host) => ASD.code(host, { src: 'ordinamento/ricerca_ricorsiva', region: 'ricorsiva' }),
        bounds: mountBounds,
        lower: (host) =>
          ASD.stepper(host, {
            id: 'lower-bound',
            title: 'lowerBound passo per passo',
            code: { src: 'ordinamento/lower_bound', region: 'lower' },
            input: {
              label: 'Array ordinato | x',
              value: { a: BOUNDS0, x: 3 },
              parse: (s) => parseSearch(s, { sorted: true }),
              format: fmtSearch,
              presets: [
                { label: 'x ripetuto', value: { a: BOUNDS0, x: 3 } },
                { label: 'x assente', value: { a: BOUNDS0, x: 6 } },
                { label: 'x più grande di tutti', value: { a: BOUNDS0, x: 12 } },
              ],
            },
            view: (stage) => new ASD.viz.ArrayView(stage, { mode: 'cells', minSlot: 26 }),
            trace: traceLower,
            counters: [{ key: 'iterazioni', label: 'iterazioni' }],
            legend: [
              { k: 'compare', label: 'a[mid]' },
              { k: 'done', label: 'risposta' },
              { k: 'hole', label: 'posizione n (fuori dall\'array)' },
            ],
            validate: (input, frames) => {
              const r = frames[frames.length - 1].state.result;
              const want = input.a.findIndex((v) => v >= input.x);
              const exp = want === -1 ? input.a.length : want;
              return r === exp ? null : `lowerBound = ${r}, atteso ${exp}`;
            },
          }),
        upper: (host) => ASD.code(host, { src: 'ordinamento/lower_bound', region: 'upper' }),
        stl: (host) => ASD.code(host, { src: 'ordinamento/lower_bound', region: 'stl' }),
        bug: (host) =>
          ASD.stepper(host, {
            id: 'bug-lo-mid',
            title: 'Errore: lo = mid',
            code: { code: BUG_CODE, file: 'ricerca_sbagliata.cpp' },
            input: {
              label: 'Array | x',
              value: { a: [2, 5, 8, 12], x: 12 },
              parse: (s) => parseSearch(s),
              format: fmtSearch,
              presets: [
                { label: 'Cerca 12', value: { a: [2, 5, 8, 12], x: 12 } },
                { label: 'Cerca 2', value: { a: [2, 5, 8, 12], x: 2 } },
              ],
            },
            view: (stage) => new ASD.viz.ArrayView(stage, { mode: 'cells', minSlot: 26 }),
            trace: traceBug,
            counters: [{ key: 'iterazioni', label: 'iterazioni' }],
            legend: [
              { k: 'compare', label: 'a[mid]' },
              { k: 'swap', label: 'bloccato' },
              { k: 'out', label: 'scartato' },
            ],
          }),
        quiz: (host) =>
          ASD.quiz(host, [
            {
              q: 'Al massimo quante iterazioni fa la ricerca binaria su un array ordinato di <strong>1000</strong> elementi?',
              options: ['10', '11', '500', '1000'],
              answer: 0,
              explain: `${m('2^9 = 512 <= 1000 < 1024 = 2^{10}')}, quindi ${m('⌊log_2 1000⌋ = 9')} e le iterazioni sono al
              massimo ${m('9 + 1 = 10')}. Dopo 10 dimezzamenti di 1000 non resta nessun elemento: 1000, 500, 250, 125, 62,
              31, 15, 7, 3, 1.`,
            },
            {
              q: 'Cerchi 23 in <code>[2, 5, 8, 12, 16, 23, 38, 56, 72, 91]</code> con la ricerca binaria. Quali valori di <code>a[mid]</code> guarda, in ordine?',
              options: ['16, 56, 23', '16, 38, 23', '16, 23', '2, 5, 8, 12, 16, 23'],
              answer: 0,
              explain: `<code>lo = 0, hi = 9</code>: <code>mid = 4</code>, 16 &lt; 23, quindi <code>lo = 5</code>. Poi
              <code>mid = 5 + 4/2 = 7</code>, 56 &gt; 23, quindi <code>hi = 6</code>. Poi <code>mid = 5 + 1/2 = 5</code>:
              <code>a[5] = 23</code>, trovato. L'ultima risposta è la ricerca lineare.`,
            },
            {
              q: 'Perché si calcola <code>mid = lo + (hi - lo) / 2</code> invece di <code>(lo + hi) / 2</code>?',
              options: [
                'Perché <code>lo + hi</code> può superare il massimo di un <code>int</code> e andare in overflow',
                'Perché dà un risultato diverso, più vicino al centro',
                'Perché la divisione è più veloce',
              ],
              answer: 0,
              explain: `Con interi non negativi le due formule danno lo stesso valore, ma <code>lo + hi</code> può superare
              2 147 483 647 e l'overflow di un <code>int</code> è comportamento indefinito. <code>hi - lo</code> non va mai
              in overflow.`,
            },
            {
              q: 'In <code>[1, 3, 3, 3, 5, 8, 8, 10]</code>, quanto valgono <code>lower_bound</code> e <code>upper_bound</code> di 8 (come indici)?',
              options: ['5 e 7', '5 e 6', '6 e 7', '4 e 7'],
              answer: 0,
              explain: `Il primo elemento &gt;= 8 è <code>a[5] = 8</code>; il primo &gt; 8 è <code>a[7] = 10</code>. Gli 8
              sono <code>a[5..6]</code>: ${m('7 - 5 = 2')} occorrenze.`,
            },
            {
              q: 'Quale di queste modifiche alla ricerca binaria (intervallo chiuso) può far girare il ciclo all\'infinito?',
              options: [
                '<code>lo = mid</code> al posto di <code>lo = mid + 1</code>',
                '<code>mid = (lo + hi) / 2</code> al posto di <code>lo + (hi - lo) / 2</code>',
                'Controllare prima <code>a[mid] &gt; x</code> e poi <code>a[mid] &lt; x</code>',
              ],
              answer: 0,
              explain: `Quando <code>hi = lo + 1</code> (o <code>hi = lo</code>), <code>mid</code> vale <code>lo</code>: con
              <code>lo = mid</code> l'intervallo non si restringe più e gli stessi passi si ripetono per sempre. La seconda
              modifica rischia solo l'overflow su array enormi; la terza non cambia nulla.`,
            },
            {
              q: 'Quali affermazioni sono vere?',
              options: [
                'La ricerca lineare funziona anche su un array non ordinato',
                'La ricerca binaria ricorsiva usa memoria in più O(log n) per lo stack',
                'Su un array non ordinato la ricerca binaria segnala un errore',
                'Nel caso migliore la ricerca binaria fa un solo confronto',
              ],
              answer: [0, 1, 3],
              explain: `La terza è falsa: su un array non ordinato la ricerca binaria non se ne accorge e può rispondere −1
              anche se <var>x</var> c'è. Le altre sono vere: la lineare non usa l'ordine, le chiamate ricorsive aperte sono
              ${m('O(log n)')}, e se <var>x</var> è nel primo <code>mid</code> basta un confronto.`,
            },
          ]),
      });
    },
  });

  /* ------------------------------------------------------------- input */

  /** "2, 5, 8 | 5" → { a: [2, 5, 8], x: 5 } */
  function parseSearch(text, o = {}) {
    const parts = String(text).split('|');
    if (parts.length !== 2) throw new Error('Scrivi l\'array, poi una barra | e il valore da cercare. Esempio: 2, 5, 8, 12 | 8');
    const a = ASD.parseNumbers(parts[0], { min: 0, max: 99, minLen: 1, maxLen: 16 });
    const raw = parts[1].replace(/^\s*x\s*=/i, '').trim();
    const x = Number(raw);
    if (!raw || !Number.isInteger(x) || x < 0 || x > 99) throw new Error('Dopo la barra | serve un solo intero tra 0 e 99: il valore da cercare.');
    if (o.sorted && !S.isSorted(a)) throw new Error('Qui l\'array deve essere ordinato in modo crescente.');
    return { a, x };
  }

  const fmtSearch = (v) => `${v.a.join(', ')} | ${v.x}`;

  function randomSearch() {
    const a = ASD.randomDistinct(16, 1, 99).sort((p, q) => p - q);
    const x = Math.random() < 0.75 ? a[ASD.randInt(0, a.length - 1)] : ASD.randInt(1, 99);
    return { a, x };
  }

  function validateSearch(input, frames) {
    if (!S.isSorted(input.a)) return null; // su un array disordinato la risposta non è garantita
    const r = frames[frames.length - 1].state.result;
    if (r === -1) return input.a.includes(input.x) ? `${input.x} c'è ma la traccia restituisce -1` : null;
    return input.a[r] === input.x ? null : `restituito ${r}, ma a[${r}] non è ${input.x}`;
  }

  /* ---------------------------------------------- ricerca binaria (chiusa) */

  function traceBinary(input) {
    const a = input.a;
    const x = input.x;
    const n = a.length;
    const t = new ASD.Tracer(['iterazioni']);
    const sorted = S.isSorted(a);
    const inside = (o) => {
      const p = {};
      for (const [k, v] of Object.entries(o)) if (v >= 0 && v < n) p[k] = v;
      return p;
    };
    const st = (lo, hi, o = {}) => ({ a: a.slice(), range: [lo, hi], marks: o.marks || {}, ptrs: inside(o.ptrs || { lo, hi }), result: o.result });
    const maxIt = Math.floor(Math.log2(n)) + 1;
    const fine = (result) => {
      const k = t.c.iterazioni;
      let note = `Finito in <b>${k}</b> iterazion${k === 1 ? 'e' : 'i'}. Con ${n} elementi il massimo è ${ASD.mathHTML('⌊log_2 n⌋ + 1')} = ${maxIt}.`;
      const real = a.indexOf(x);
      if (!sorted && result === -1 && real >= 0) {
        note = `L'array non è ordinato: ${x} c'era, in a[${real}], ma la ricerca binaria ha scartato la metà sbagliata e ha risposto −1.`;
      }
      t.step(null, note, {}, st(0, n - 1, { marks: result >= 0 ? { [result]: 'done' } : {}, ptrs: {}, result }));
    };

    let lo = 0;
    let hi = n - 1;
    t.step(
      'init',
      `Cerco <b>x = ${x}</b>. All'inizio l'intervallo è tutto l'array: <code>lo = 0</code>, <code>hi = n − 1 = ${hi}</code>.` +
        (sorted ? '' : ' <b>Attenzione: l\'array non è ordinato</b>, la risposta potrebbe essere sbagliata.'),
      { lo, hi, x },
      st(lo, hi)
    );
    for (;;) {
      if (lo > hi) {
        t.step('loop', `<code>lo = ${lo}</code> &gt; <code>hi = ${hi}</code>: l'intervallo è vuoto, il ciclo finisce.`, { lo, hi, x }, st(lo, hi, { ptrs: {} }));
        break;
      }
      const size = hi - lo + 1;
      t.step('loop', `<code>lo = ${lo}</code> ≤ <code>hi = ${hi}</code>: rest${size === 1 ? 'a 1 elemento' : `ano ${size} elementi`} da esaminare.`, { lo, hi, x }, st(lo, hi));
      const half = Math.floor((hi - lo) / 2);
      const mid = lo + half;
      t.count('iterazioni');
      const cmp = { marks: { [mid]: 'compare' }, ptrs: { lo, mid, hi } };
      t.step(
        'mid',
        `<code>mid = lo + (hi − lo) / 2 = ${lo} + ${hi - lo}/2 = ${lo} + ${half} = ${mid}</code>` + ((hi - lo) % 2 ? ': la divisione tra interi tronca.' : '.'),
        { lo, hi, mid, x },
        st(lo, hi, cmp)
      );
      if (a[mid] === x) {
        t.step('eq', `<code>a[${mid}] = ${a[mid]}</code> è uguale a x.`, { lo, hi, mid, x }, st(lo, hi, { marks: { [mid]: 'done' }, ptrs: { lo, mid, hi } }));
        t.step('found', `Trovato: la funzione restituisce <b>${mid}</b>.`, { lo, hi, mid, x }, st(lo, hi, { marks: { [mid]: 'done' }, ptrs: { mid }, result: mid }));
        fine(mid);
        return t.frames;
      }
      t.step('eq', `<code>a[${mid}] = ${a[mid]}</code> è diverso da x = ${x}.`, { lo, hi, mid, x }, st(lo, hi, cmp));
      const oldLo = lo;
      const oldHi = hi;
      if (a[mid] < x) {
        t.step(
          'lt',
          `${a[mid]} &lt; ${x}: ` +
            (sorted ? `anche a[${oldLo}..${mid}] sono tutti minori di ${x}, quindi x può stare solo a destra di mid.` : 'la ricerca binaria conclude che x può stare solo a destra di mid.'),
          { lo, hi, mid, x },
          st(lo, hi, cmp)
        );
        lo = mid + 1;
        t.step('right', `<code>lo = mid + 1 = ${lo}</code>: scarto a[${oldLo}..${mid}].`, { lo, hi, mid, x }, st(lo, hi));
      } else {
        t.step(
          'lt',
          `${a[mid]} &gt; ${x}: ` + (sorted ? `anche a[${mid}..${oldHi}] sono tutti maggiori di ${x}, quindi x può stare solo a sinistra di mid.` : 'la ricerca binaria conclude che x può stare solo a sinistra di mid.'),
          { lo, hi, mid, x },
          st(lo, hi, cmp)
        );
        hi = mid - 1;
        t.step('left', `<code>hi = mid − 1 = ${hi}</code>: scarto a[${mid}..${oldHi}].`, { lo, hi, mid, x }, st(lo, hi));
      }
    }
    t.step('notfound', `${x} non c'è: la funzione restituisce <b>−1</b>.`, { lo, hi, x }, st(lo, hi, { ptrs: {}, result: -1 }));
    fine(-1);
    return t.frames;
  }

  /* --------------------------------------- lowerBound (intervallo semiaperto) */

  function traceLower(input) {
    const a = input.a;
    const x = input.x;
    const n = a.length;
    const t = new ASD.Tracer(['iterazioni']);
    const view = a.concat([null]); // la casella n, "dopo l'ultimo"
    const st = (lo, hi, o = {}) => ({ a: view.slice(), range: [lo, hi - 1], marks: o.marks || {}, ptrs: o.ptrs || { lo, hi }, result: o.result });
    let lo = 0;
    let hi = n;
    t.step(
      'init',
      `Cerco il primo elemento ≥ ${x}. Intervallo semiaperto: <code>lo = 0</code>, <code>hi = n = ${n}</code>. La casella tratteggiata è la posizione ${n}, dopo l'ultimo elemento: anche lei può essere la risposta.`,
      { lo, hi, x },
      st(lo, hi)
    );
    for (;;) {
      if (lo >= hi) {
        t.step('loop', `<code>lo = hi = ${lo}</code>: l'intervallo è vuoto, il ciclo finisce. La risposta è <code>lo</code>.`, { lo, hi, x }, st(lo, hi));
        break;
      }
      t.step('loop', `<code>lo = ${lo}</code> &lt; <code>hi = ${hi}</code>: la risposta è una posizione tra ${lo} e ${hi}.`, { lo, hi, x }, st(lo, hi));
      const half = Math.floor((hi - lo) / 2);
      const mid = lo + half;
      t.count('iterazioni');
      const cmp = { marks: { [mid]: 'compare' }, ptrs: { lo, mid, hi } };
      t.step('mid', `<code>mid = ${lo} + ${hi - lo}/2 = ${lo} + ${half} = ${mid}</code>.`, { lo, hi, mid, x }, st(lo, hi, cmp));
      if (a[mid] < x) {
        t.step('cmp', `<code>a[${mid}] = ${a[mid]}</code> &lt; ${x}: a[${mid}] e tutti quelli alla sua sinistra sono minori di ${x}, la risposta è dopo mid.`, { lo, hi, mid, x }, st(lo, hi, cmp));
        lo = mid + 1;
        t.step('right', `<code>lo = mid + 1 = ${lo}</code>.`, { lo, hi, mid, x }, st(lo, hi));
      } else {
        t.step(
          'cmp',
          `<code>a[${mid}] = ${a[mid]}</code> ≥ ${x}: mid potrebbe essere la risposta, ma potrebbe essercene una più a sinistra.` +
            (a[mid] === x ? ' Anche se a[mid] è proprio x, il ciclo non si ferma.' : ''),
          { lo, hi, mid, x },
          st(lo, hi, cmp)
        );
        hi = mid;
        t.step('left', `<code>hi = mid = ${hi}</code>: mid resta tra i candidati, per questo non si scrive mid − 1.`, { lo, hi, mid, x }, st(lo, hi));
      }
    }
    const note =
      lo < n
        ? `return <b>${lo}</b>: a[${lo}] = ${a[lo]} è il primo elemento ≥ ${x}` + (lo > 0 ? ` (a[${lo - 1}] = ${a[lo - 1]} è più piccolo).` : '.')
        : `return <b>${n}</b>: nessun elemento è ≥ ${x}, la risposta è n, la posizione dopo l'ultimo.`;
    const mk = lo < n ? { [lo]: 'done' } : {};
    t.step('ret', note, { lo, hi, x }, st(lo, hi, { marks: mk, ptrs: { lo }, result: lo }));
    const occ = a.filter((v) => v === x).length;
    t.step(
      null,
      `Finito in ${t.c.iterazioni} iterazioni. lowerBound non si ferma quando incontra x: fa sempre circa ${ASD.mathHTML('log_2 n')} iterazioni.` +
        (occ ? ` Qui ${x} compare ${occ === 1 ? 'una volta' : occ + ' volte'}, a partire da a[${lo}].` : ` ${x} non c'è: inserito in posizione ${lo}, l'array resterebbe ordinato.`),
      {},
      st(0, n, { marks: mk, ptrs: {}, result: lo })
    );
    return t.frames;
  }

  /* --------------------------------------------- l'errore lo = mid (ciclo infinito) */

  const BUG_CODE = [
    'int lo = 0, hi = n - 1;  //@init',
    'while (lo <= hi) {  //@loop',
    '    int mid = lo + (hi - lo) / 2;  //@mid',
    '    if (a[mid] == x) return mid;  //@eq',
    '    if (a[mid] < x) lo = mid;  // ERRORE //@right',
    '    else hi = mid - 1;  //@left',
    '}',
    'return -1;  //@notfound',
  ].join('\n');

  function traceBug(input) {
    const a = input.a;
    const x = input.x;
    const n = a.length;
    const t = new ASD.Tracer(['iterazioni']);
    const inside = (o) => {
      const p = {};
      for (const [k, v] of Object.entries(o)) if (v >= 0 && v < n) p[k] = v;
      return p;
    };
    const st = (lo, hi, o = {}) => ({ a: a.slice(), range: [lo, hi], marks: o.marks || {}, ptrs: inside(o.ptrs || { lo, hi }) });
    let lo = 0;
    let hi = n - 1;
    let prev = null;
    t.step('init', `Cerco x = ${x}: <code>lo = 0</code>, <code>hi = ${hi}</code>.`, { lo, hi, x }, st(lo, hi));
    for (;;) {
      if (lo > hi) {
        t.step('loop', `<code>lo &gt; hi</code>: intervallo vuoto, il ciclo finisce.`, { lo, hi, x }, st(lo, hi, { ptrs: {} }));
        t.step('notfound', `return −1. Questa volta il ciclo è finito: l'errore non sempre si vede.`, { lo, hi, x }, st(lo, hi, { ptrs: {} }));
        return t.frames;
      }
      if (prev && prev[0] === lo && prev[1] === hi) {
        const mid = lo + Math.floor((hi - lo) / 2);
        t.step(
          'loop',
          `<b>lo = ${lo} e hi = ${hi}, gli stessi del giro precedente.</b> Da qui il programma ripete per sempre gli stessi passi: ciclo infinito, il programma non termina. Con <code>lo = mid + 1</code> l'intervallo si sarebbe ristretto.`,
          { lo, hi, x },
          st(lo, hi, { marks: { [mid]: 'swap' }, ptrs: { lo, mid, hi } })
        );
        return t.frames;
      }
      prev = [lo, hi];
      t.step('loop', `<code>lo = ${lo}</code> ≤ <code>hi = ${hi}</code>: si entra nel ciclo.`, { lo, hi, x }, st(lo, hi));
      const mid = lo + Math.floor((hi - lo) / 2);
      t.count('iterazioni');
      const cmp = { marks: { [mid]: 'compare' }, ptrs: { lo, mid, hi } };
      t.step('mid', `<code>mid = ${lo} + ${hi - lo}/2 = ${lo} + ${mid - lo} = ${mid}</code>.`, { lo, hi, mid, x }, st(lo, hi, cmp));
      if (a[mid] === x) {
        t.step('eq', `a[${mid}] = ${a[mid]} è x: return ${mid}. Questa volta va bene: l'errore non sempre si vede.`, { lo, hi, mid, x }, st(lo, hi, { marks: { [mid]: 'done' }, ptrs: { mid } }));
        return t.frames;
      }
      t.step('eq', `a[${mid}] = ${a[mid]} non è ${x}.`, { lo, hi, mid, x }, st(lo, hi, cmp));
      if (a[mid] < x) {
        lo = mid;
        t.step('right', `${a[mid]} &lt; ${x}, quindi <code>lo = mid = ${lo}</code>.` + (mid === prev[0] ? ' <b>lo non è cambiato.</b>' : ''), { lo, hi, mid, x }, st(lo, hi, cmp));
      } else {
        hi = mid - 1;
        t.step('left', `${a[mid]} &gt; ${x}, quindi <code>hi = mid − 1 = ${hi}</code>.`, { lo, hi, mid, x }, st(lo, hi));
      }
    }
  }

  /* -------------------------------------- laboratorio: quante volte si dimezza n */

  function mountDimezza(host) {
    const VALUES = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 16, 17, 31, 32, 33, 63, 64, 100, 127, 128, 1000, 1023, 1024, 1025, 10000, 65535,
      65536, 100000, 1000000, 1048576, 1000000000,
    ];
    const lab = h('div.lab.ord-lab');
    const body = h('div.lab-body');
    const controls = h('div.lab-controls');
    const out = h('div.lab-out');
    lab.append(h('div.lab-head', h('h3', { text: 'Quante volte puoi dimezzare n?' })), body, controls, out);
    host.append(lab);

    const id = ASD.uid('dimezza-n');
    const nOut = h('output', { for: id });
    const range = h('input', { type: 'range', id, min: '0', max: String(VALUES.length - 1), step: '1', value: String(VALUES.indexOf(1000)) });
    controls.append(h('label.slider', { for: id }, h('span', 'n (numero di elementi)'), range, nOut));

    const big = h('div.ord-big');
    const chain = h('ol.ord-chain', { 'aria-label': 'Dimezzamenti successivi di n' });
    body.append(big, h('p', { style: { margin: '0 0 8px', fontSize: 'var(--fs-sm)', color: 'var(--ink-2)' }, text: 'Gli elementi che restano dopo ogni iterazione, nel caso peggiore (x più grande di tutti):' }), chain);

    function draw() {
      const n = VALUES[Number(range.value)];
      nOut.textContent = ASD.fmt(n);
      const steps = [];
      for (let s = n; s >= 1; s = Math.floor(s / 2)) steps.push(s);
      big.replaceChildren(
        h('div', h('span', { text: 'Ricerca lineare, caso peggiore' }), h('strong', { text: ASD.fmt(n) + (n === 1 ? ' confronto' : ' confronti') })),
        h('div', h('span', { text: 'Ricerca binaria, caso peggiore' }), h('strong', { text: steps.length + (steps.length === 1 ? ' iterazione' : ' iterazioni') }))
      );
      chain.replaceChildren(...steps.map((s) => h('li', h('span.ord-step', { text: ASD.fmt(s) }))));
      const lg = Math.log2(n);
      const pow = Number.isInteger(lg);
      out.innerHTML =
        `<p style="margin:0">${ASD.m(`⌊log_2 ${n}⌋ + 1 = ${Math.floor(lg)} + 1 = ${steps.length}`)}: ` +
        (pow
          ? `${ASD.fmt(n)} è una potenza di 2 (${ASD.m(`2^{${lg}}`)}), e proprio qui il numero di iterazioni sale di uno. Prova con il valore appena prima.`
          : `il conto sale di uno solo quando <var>n</var> raggiunge la potenza di 2 successiva, ${ASD.fmt(2 ** Math.ceil(lg))}.`) +
        `</p>`;
    }
    range.addEventListener('input', draw);
    draw();
  }

  /* ----------------------------------- laboratorio: lower_bound e upper_bound */

  function lowerBound(a, x) {
    let lo = 0;
    let hi = a.length;
    while (lo < hi) {
      const mid = lo + ((hi - lo) >> 1);
      if (a[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  function upperBound(a, x) {
    let lo = 0;
    let hi = a.length;
    while (lo < hi) {
      const mid = lo + ((hi - lo) >> 1);
      if (a[mid] <= x) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  function mountBounds(host) {
    let arr = BOUNDS0.slice();
    const lab = h('div.lab.ord-lab');
    const body = h('div.lab-body.quadretti');
    const controls = h('div.lab-controls');
    const out = h('div.lab-out.ord-lab-out', { 'aria-live': 'polite' });
    lab.append(h('div.lab-head', h('h3', { text: 'Dove cadono lower_bound e upper_bound' })), body, controls, out);
    host.append(lab);
    const stage = h('div.ord-lab-array');
    body.append(stage);
    const view = new ASD.viz.ArrayView(stage, { mode: 'cells', minSlot: 26 });

    const id = ASD.uid('bounds-x');
    const xOut = h('output', { for: id });
    const range = h('input', { type: 'range', id, step: '1' });
    const again = h('button.btn.btn-sm', { type: 'button', text: 'Nuovo array' });
    controls.append(h('label.slider', { for: id }, h('span', 'x (valore cercato)'), range, xOut), again);

    const setRange = (x) => {
      range.min = String(arr[0] - 1);
      range.max = String(arr[arr.length - 1] + 1);
      range.value = String(x);
    };
    again.addEventListener('click', () => {
      const n = ASD.randInt(7, 10);
      arr = ASD.randomArray(n, 1, 12).sort((p, q) => p - q);
      setRange(arr[ASD.randInt(0, n - 1)]);
      draw();
    });
    range.addEventListener('input', () => draw());

    function draw() {
      const x = Number(range.value);
      xOut.textContent = String(x);
      const n = arr.length;
      const lb = lowerBound(arr, x);
      const ub = upperBound(arr, x);
      const marks = {};
      for (let i = lb; i < ub; i++) marks[i] = 'done';
      view.render({ a: arr.concat([null]), marks, ptrs: { lower: lb, upper: ub } });
      const occ = ub - lb;
      out.innerHTML =
        `<p><code>lower_bound(${x}) = ${lb}</code>: ` +
        (lb < n ? `il primo elemento ≥ ${x} è a[${lb}] = ${arr[lb]}.` : `nessun elemento è ≥ ${x}, quindi la risposta è n = ${n}.`) +
        `</p><p><code>upper_bound(${x}) = ${ub}</code>: ` +
        (ub < n ? `il primo elemento &gt; ${x} è a[${ub}] = ${arr[ub]}.` : `nessun elemento è &gt; ${x}, quindi la risposta è n = ${n}.`) +
        `</p><p>Occorrenze di ${x}: <code>upper − lower = ${ub} − ${lb} = <b>${occ}</b></code>` +
        (occ ? ` (le caselle verdi). <code>binary_search</code> direbbe <code>true</code>.` : `. <code>binary_search</code> direbbe <code>false</code>; inserendo ${x} in posizione ${lb} l'array resterebbe ordinato.`) +
        `</p>`;
    }
    setRange(3);
    draw();
  }
})();
