/* ASD a quadretti — capitolo "Programmazione dinamica".
   I due ingredienti (sottostruttura ottima, sottoproblemi ripetuti),
   Fibonacci in tre modi con il contatore di chiamate e l'albero delle
   chiamate, la ricetta in sei passi, il resto minimo con la tabella
   riempita passo per passo (ASD.viz.TableView). */
(function () {
  'use strict';

  const { h, m, box, table } = ASD;
  const T = ASD.tecniche;

  ASD.chapter({
    id: 'dp',
    title: 'Programmazione dinamica',
    lead:
      'Quando un problema si spezza in sottoproblemi che si ripetono, conviene risolvere ognuno una volta sola e scriverne il risultato in una tabella. È la programmazione dinamica (dynamic programming): trasforma algoritmi esponenziali in algoritmi polinomiali, e si applica sempre con la stessa ricetta.',
    minutes: 45,
    prereq: ['cpp-ricorsione', 'cx-ricorrenze', 'greedy'],
    goals: [
      'riconoscere i due ingredienti, sottostruttura ottima e sottoproblemi ripetuti, e distinguere la PD dal divide et impera e dal greedy',
      'scrivere Fibonacci in tre modi (ricorsione, memoizzazione, tabulazione) e contarne le chiamate',
      'applicare la ricetta in sei passi: sottoproblema, ricorrenza, casi base, ordine di calcolo, ricostruzione, costo',
      `risolvere il resto con il minimo numero di monete anche dove il greedy sbaglia, in ${m('Θ(k\u2009R)')}`,
    ],

    render(el) {
      el.innerHTML = `
<section id="idea">
  <h2>Due ingredienti</h2>
  <p>La programmazione dinamica (PD, in inglese <i>dynamic programming</i>) è una tecnica per i problemi che hanno due
  caratteristiche.</p>
  <dl>
    <dt>Sottostruttura ottima</dt>
    <dd>la soluzione ottima si costruisce dalle soluzioni ottime di sottoproblemi più piccoli dello stesso tipo. È la
    stessa proprietà che serve agli ${ASD.link('greedy', null, 'algoritmi greedy')}.</dd>
    <dt>Sottoproblemi ripetuti (<i>overlapping subproblems</i>)</dt>
    <dd>la ricorsione "ingenua" incontra gli stessi sottoproblemi molte volte. La PD invece risolve ogni sottoproblema una
    volta sola e ne salva il risultato.</dd>
  </dl>
  <p>Il confronto con le altre due tecniche aiuta a riconoscerla.</p>
  ${table({
    head: ['Tecnica', 'Sottoproblemi', 'Idea'],
    rows: [
      ['Divide et impera', 'disgiunti: ognuno si incontra una volta sola', 'divide, risolve le parti, combina (merge sort, quicksort)'],
      ['Greedy', 'uno solo dopo ogni scelta', 'fa la scelta che adesso sembra migliore e non torna indietro'],
      ['Programmazione dinamica', 'ripetuti: ognuno si risolve una volta e si salva', 'per ogni sottoproblema prova tutte le scelte e tiene la migliore'],
    ],
  })}
  ${box('nota', `<p>Il nome è di Richard Bellman, anni Cinquanta: "programmazione" nel senso di pianificazione, una tabella
  di decisioni (come nella "programmazione lineare"), non di scrittura di codice.</p>`, 'Da dove viene il nome')}
</section>

<section id="fibonacci">
  <h2>Fibonacci in tre modi</h2>
  <p>I numeri di Fibonacci sono ${m('F(0) = 0')}, ${m('F(1) = 1')} e ${m('F(n) = F(n-1) + F(n-2)')}: 0, 1, 1, 2, 3, 5,
  8, 13, 21… Non è un problema di ottimo, ma mostra bene il secondo ingrediente.</p>

  <h3>1. Ricorsione semplice</h3>
  <div data-mount="fib-ric"></div>
  <p>Il codice copia la definizione, ma per calcolare ${m('F(5)')} calcola ${m('F(3)')} due volte, ${m('F(2)')} tre volte,
  ${m('F(1)')} cinque volte. Il numero di chiamate ${m('C(n)')} segue quasi la stessa ricorrenza dei numeri di
  Fibonacci:</p>
  <p class="formula">${m('C(0) = C(1) = 1')}, &nbsp; ${m('C(n) = 1 + C(n-1) + C(n-2)')} &nbsp; ⇒ &nbsp; ${m('C(n) = 2F(n+1) - 1')}</p>
  <p>e ${m('F(n)')} cresce come ${m('φ^n')}, con ${m('φ = (1 + √5)/2 ≈ 1,618')}: il tempo è <strong>esponenziale</strong>,
  ${m('Θ(φ^n)')}. Per ${m('n = 30')} servono 2 692 537 chiamate, per ${m('n = 50')} più di 40 miliardi.</p>

  <h3>2. Memoizzazione (dall'alto, <i>top-down</i>)</h3>
  <div data-mount="fib-memo"></div>
  <p>Stessa ricorsione, più un array <code>memo</code> inizializzato a −1, che vuol dire "non ancora calcolato". Prima di
  calcolare ${m('F(n)')} si guarda se è già nell'array; dopo averlo calcolato lo si salva. Ogni valore da ${m('F(0)')} a
  ${m('F(n)')} si calcola una volta sola: le chiamate diventano ${m('2n - 1')} e il tempo ${m('Θ(n)')}. Lo spazio è
  ${m('Θ(n)')}: l'array più la pila delle chiamate, profonda <var>n</var>.</p>

  <h3>3. Tabulazione (dal basso, <i>bottom-up</i>)</h3>
  <div data-mount="fib-tab"></div>
  <p>Si riempie la tabella in ordine, dai casi base in su: quando serve ${m('f[i]')}, i valori ${m('f[i-1]')} e
  ${m('f[i-2]')} sono già pronti. Niente ricorsione, un ciclo di ${m('n - 1')} iterazioni: tempo ${m('Θ(n)')}. Ogni passo
  usa solo gli ultimi due valori, quindi bastano due variabili al posto del vettore: spazio ${m('Θ(1)')}.</p>

  <h3>Conta le chiamate</h3>
  <p>Sposta <var>n</var> e confronta i tre modi. Per <var>n</var> piccolo vedi anche l'albero delle chiamate: nella
  ricorsione semplice sono rossi i nodi che ricalcolano un valore già calcolato prima; con la memoizzazione quei nodi
  diventano foglie viola, risolte leggendo l'array.</p>
  <div data-mount="fiblab"></div>
  <p>Il programma completo misura le stesse quantità:</p>
  <pre class="code-out" tabindex="0"><code> n       F(n)   chiamate (semplice)   chiamate (memo)   iterazioni
10         55                   177                19            9
20       6765                 21891                39           19
30     832040               2692537                59           29
F(90) = 2880067194370816120</code></pre>
  ${box('errore', `<p>${m('F(47) = 2 971 215 073')} non sta in un <code>int</code> a 32 bit (al massimo 2 147 483 647): da lì in poi
  il conto con gli <code>int</code> va in overflow, che per gli interi con segno in C++ è comportamento indefinito, e il
  risultato è sbagliato senza nessun avviso. Usa <code>long long</code>, che basta fino a ${m('F(92)')}.</p>`)}
</section>

<section id="ricetta">
  <h2>La ricetta in sei passi</h2>
  <p>Ogni algoritmo di programmazione dinamica si progetta con gli stessi passi. Scrivili sempre in quest'ordine, anche
  all'esame.</p>
  <ol>
    <li><strong>Sottoproblema.</strong> Scrivi a parole cosa vuol dire una casella della tabella, con i suoi indici e i
    loro intervalli: "${m('dp[x]')} = numero minimo di monete per formare l'importo <var>x</var>, per
    ${m('0 <= x <= R')}". È il passo più importante: se il sottoproblema è sbagliato, niente di quello che segue funziona.</li>
    <li><strong>Ricorrenza.</strong> Come si ottiene una casella da caselle più piccole. Di solito si ragiona
    sull'<em>ultima scelta</em> (l'ultima moneta, l'ultimo oggetto, l'ultimo carattere) e si prende la migliore tra tutte
    quelle possibili.</li>
    <li><strong>Casi base.</strong> I sottoproblemi così piccoli da avere una risposta diretta, come ${m('dp[0] = 0')}.</li>
    <li><strong>Ordine di calcolo.</strong> Ogni casella va calcolata dopo quelle che legge: per esempio <var>x</var>
    crescente, oppure riga per riga. Con la memoizzazione l'ordine lo decide la ricorsione.</li>
    <li><strong>Ricostruzione.</strong> La tabella dà il <em>valore</em> ottimo, non la soluzione. Per sapere quali scelte
    la realizzano, salva la scelta migliore di ogni casella (oppure ricavala dalla tabella) e ripercorri le scelte
    all'indietro partendo dalla risposta.</li>
    <li><strong>Costo.</strong> Tempo = numero di sottoproblemi × lavoro per ognuno, più la ricostruzione. Spazio = la
    dimensione della tabella.</li>
  </ol>
  ${box('ricorda', `<p>Sottoproblema a parole, ricorrenza con i casi base, ordine di calcolo, ricostruzione, costo =
  sottoproblemi × lavoro per sottoproblema. Se il passo 1 non sai scriverlo in una frase, non partire con il codice.</p>`)}
</section>

<section id="monete">
  <h2>Il resto con il minimo numero di monete</h2>
  <p>Torniamo al ${ASD.link('greedy', 'resto', 'problema del resto')}: monete di <var>k</var> tagli diversi, ognuno
  disponibile senza limiti, e un importo <var>R</var> da formare con il minor numero di monete. Con le monete {1, 3, 4}
  il greedy per 6 dava 4 + 1 + 1. Applichiamo la ricetta.</p>
  <ol>
    <li><strong>Sottoproblema</strong>: ${m('dp[x]')} = numero minimo di monete per formare l'importo <var>x</var>, per
    ${m('0 <= x <= R')}; vale ∞ se <var>x</var> non si può formare.</li>
    <li><strong>Ricorrenza</strong>: l'ultima moneta del resto di <var>x</var> è una certa <var>c</var> ≤ <var>x</var>;
    prima di lei ci sono le monete per ${m('x - c')}, e quelle devono essere il minimo possibile (sottostruttura ottima).
    Quale sia <var>c</var> non lo sappiamo: le proviamo tutte e teniamo la migliore.
    <p class="formula">${m('dp[x] = 1 + min { dp[x - c] : c <= x }')}</p></li>
    <li><strong>Caso base</strong>: ${m('dp[0] = 0')}, zero monete per l'importo zero.</li>
    <li><strong>Ordine</strong>: ${m('x = 1, 2, …, R')}, perché ${m('dp[x]')} legge solo importi più piccoli.</li>
    <li><strong>Ricostruzione</strong>: ${m('scelta[x]')} è la moneta che ha dato il minimo. Da <var>R</var> si toglie
    ${m('scelta[R]')}, poi la scelta di quello che resta, fino a 0.</li>
    <li><strong>Costo</strong>: ${m('R + 1')} sottoproblemi, ognuno prova <var>k</var> monete: tempo ${m('Θ(k\u2009R)')},
    spazio ${m('Θ(R)')}.</li>
  </ol>
  <div data-mount="monete"></div>
  <p>Il programma completo confronta la PD con il greedy. Con {1, 3, 4} il greedy sbaglia per 6, 10, 14, … (gli importi
  da 6 in su che divisi per 4 danno resto 2); con le monete dell'euro non sbaglia mai fino a 5 €. Con monete {2, 4}
  l'importo 7 non si può formare: ${m('dp[7]')} resta ∞.</p>
  <pre class="code-out" tabindex="0"><code>Monete {1, 3, 4}, importo 6: 2 monete = 3 3
Importi fino a 30 dove il greedy usa più monete: 6 (3 invece di 2) 10 (4 invece di 3) 14 (5 invece di 4) 18 (6 invece di 5) 22 (7 invece di 6) 26 (8 invece di 7) 30 (9 invece di 8)
Euro, importi da 1 a 500 centesimi: il greedy sbaglia 0 volte
Monete {2, 4}, importo 7: impossibile</code></pre>
  ${box('errore', `<p>Nella condizione <code>c &lt;= x &amp;&amp; dp[x - c] + 1 &lt; dp[x]</code> l'ordine conta: se
  <code>c &gt; x</code> la seconda parte non viene valutata, e così non si legge <code>dp</code> in una posizione
  negativa (fuori dal <code>vector</code>, comportamento indefinito). E l'infinito è <code>INF = 1000000000</code>, non
  <code>INT_MAX</code>: con <code>INT_MAX</code> il conto <code>dp[x - c] + 1</code> andrebbe in overflow.</p>`)}
  ${box('nota', `<p>Quanti modi ci sono di salire <var>n</var> gradini con passi da 1 o da 2? L'ultimo passo è da 1 o da 2,
  quindi ${m('modi[n] = modi[n-1] + modi[n-2]')}, con ${m('modi[0] = modi[1] = 1')}: è Fibonacci spostato di uno,
  ${m('modi[n] = F(n+1)')}. Quando si <em>contano</em> le soluzioni, la ricorrenza somma i casi invece di prenderne il
  minimo.</p>`, 'Contare invece di ottimizzare')}
</section>

<section id="top-down">
  <h2>Memoizzazione o tabulazione?</h2>
  ${table({
    head: ['', 'Memoizzazione (top-down)', 'Tabulazione (bottom-up)'],
    rows: [
      ['Come si scrive', 'la ricorsione della ricorrenza, più un array dei risultati', 'cicli che riempiono la tabella'],
      ['Ordine di calcolo', 'lo decide la ricorsione', 'lo scegli tu: ogni casella dopo quelle che legge'],
      ['Sottoproblemi risolti', 'solo quelli che servono davvero', 'tutti quelli della tabella'],
      ['Costo in più', 'chiamate e pila; con input grandi rischio di <i>stack overflow</i>', 'nessuno'],
      ['Risparmiare memoria', 'difficile', 'facile: spesso bastano l\'ultima riga o gli ultimi valori'],
    ],
  })}
  <p>Quando servono tutti i sottoproblemi, come qui, le due versioni hanno lo stesso costo asintotico; la
  memoizzazione conviene se ne servono pochi. All'esame si usa quasi sempre la tabulazione: la tabella si disegna, si
  riempie a mano e il costo si legge contando i cicli.</p>
</section>

<section id="esame">
  <h2>All'esame</h2>
  <p>Le domande di PD hanno quasi sempre questa forma: "scrivi la ricorrenza", "riempi la tabella per questo input",
  "ricostruisci la soluzione", "qual è il costo?". Gli esempi classici sono nel capitolo
  ${ASD.link('dp-problemi', null, 'Problemi classici di PD')}.</p>
  ${table({
    caption: 'I costi del capitolo',
    head: ['Algoritmo', 'Tempo', 'Spazio'],
    rows: [
      ['Fibonacci, ricorsione semplice', m('Θ(φ^n)'), `${m('Θ(n)')} (la pila)`],
      ['Fibonacci, memoizzazione', m('Θ(n)'), m('Θ(n)')],
      ['Fibonacci, tabulazione', m('Θ(n)'), `${m('Θ(n)')}, oppure ${m('Θ(1)')} con due variabili`],
      ['Resto minimo (k tagli, importo R)', m('Θ(k\u2009R)'), m('Θ(R)')],
    ],
  })}
  ${box('esame', `<p>Scrivi prima la definizione del sottoproblema e la ricorrenza con i casi base, poi la tabella. Una
  tabella giusta senza ricorrenza vale poco, perché non spiega da dove vengono i numeri; una ricorrenza giusta con un
  errore di conto nella tabella vale quasi tutto.</p>`)}
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        'fib-ric': (host) => ASD.code(host, { src: 'tecniche/fibonacci', region: 'ricorsiva' }),
        'fib-memo': (host) => ASD.code(host, { src: 'tecniche/fibonacci', region: 'memo' }),
        'fib-tab': (host) => ASD.code(host, { src: 'tecniche/fibonacci', region: 'tab' }),
        fiblab: mountFibLab,
        monete: (host) =>
          ASD.stepper(host, {
            id: 'resto-pd',
            title: 'Resto minimo: la tabella passo per passo',
            code: { src: 'tecniche/resto_pd', region: 'pd' },
            input: {
              label: 'Monete ; importo',
              value: { coins: [1, 3, 4], R: 6 },
              parse: parseMonete,
              format: (v) => `${v.coins.join(' ')} ; ${v.R}`,
              presets: [
                { label: '{1, 3, 4} e 6', value: { coins: [1, 3, 4], R: 6 } },
                { label: '{1, 3, 4} e 10', value: { coins: [1, 3, 4], R: 10 } },
                { label: '{1, 5, 10, 12} e 15', value: { coins: [1, 5, 10, 12], R: 15 } },
                { label: '{2, 4} e 7', value: { coins: [2, 4], R: 7 } },
              ],
            },
            view: (stage) => new ASD.viz.TableView(stage, { ariaLabel: 'Tabella dp del resto minimo' }),
            trace: traceMonete,
            counters: [
              { key: 'confronti', label: 'monete provate' },
              { key: 'aggiornamenti', label: 'miglioramenti' },
            ],
            legend: [
              { k: 'active', label: 'dp[x] in calcolo' },
              { k: 'compare', label: 'dp[x − c] letto' },
              { k: 'done', label: 'ricostruzione' },
              { k: 'out', label: 'non ancora calcolato' },
            ],
            validate: validateMonete,
          }),
        quiz: (host) =>
          ASD.quiz(host, [
            {
              q: 'Quante chiamate fa <code>fib(5)</code> nella versione ricorsiva semplice (casi base <code>n &lt;= 1</code>)?',
              options: ['5', '9', '15', '32'],
              answer: 2,
              explain: `${m('C(n) = 2F(n+1) - 1')}: per ${m('n = 5')} è ${m('2 * F(6) - 1 = 2 * 8 - 1 = 15')}. Contando a mano:
              ${m('C(0) = C(1) = 1')}, ${m('C(2) = 3')}, ${m('C(3) = 5')}, ${m('C(4) = 9')}, ${m('C(5) = 1 + 9 + 5 = 15')}.
              9 è il numero di chiamate con la memoizzazione, ${m('2n - 1')}.`,
            },
            {
              q: 'Qual è il costo di Fibonacci con la <strong>memoizzazione</strong>?',
              options: [`tempo ${m('Θ(φ^n)')}, spazio ${m('Θ(n)')}`, `tempo ${m('Θ(n)')}, spazio ${m('Θ(n)')}`, `tempo ${m('Θ(n)')}, spazio ${m('Θ(1)')}`, `tempo ${m('Θ(log n)')}, spazio ${m('Θ(n)')}`],
              answer: 1,
              explain: `Ogni valore da ${m('F(0)')} a ${m('F(n)')} si calcola una volta, con lavoro costante: ${m('Θ(n)')}. Lo
              spazio è l'array <code>memo</code> più la pila delle chiamate, profonda <var>n</var>: ${m('Θ(n)')}. Lo spazio
              ${m('Θ(1)')} si ottiene con la tabulazione a due variabili.`,
            },
            {
              q: 'Con le monete {1, 3, 4}, quanto vale <code>dp[7]</code>?',
              options: ['1', '2', '3', '4'],
              answer: 1,
              explain: `${m('dp[7] = 1 + min(dp[6], dp[4], dp[3]) = 1 + min(2, 1, 1) = 2')}: 7 = 4 + 3. Il greedy qui non
              sbaglia (prende 4 e poi 3), ma lo sa solo chi ha fatto il conto.`,
            },
            {
              q: 'Che cosa distingue la programmazione dinamica dal divide et impera?',
              options: [
                'La PD divide il problema in due metà',
                'Nella PD i sottoproblemi si ripetono, e ognuno si risolve una volta sola salvando il risultato',
                'La PD non usa la ricorsione',
                'Il divide et impera vale solo per l\'ordinamento',
              ],
              answer: 1,
              explain: `Nel divide et impera (merge sort) i sottoproblemi sono disgiunti: salvarli non serve. Quando invece si
              ripetono, come in Fibonacci, la PD li risolve una volta e li riusa. La ricorsione si può usare benissimo: è la
              memoizzazione.`,
            },
            {
              q: 'In quanti modi si salgono 5 gradini con passi da 1 o da 2?',
              options: ['5', '6', '8', '10'],
              answer: 2,
              explain: `${m('modi[n] = modi[n-1] + modi[n-2]')} con ${m('modi[0] = modi[1] = 1')}: 1, 1, 2, 3, 5, <strong>8</strong>.
              È ${m('F(6) = 8')}.`,
            },
            {
              q: 'Qual è il costo dell\'algoritmo per il resto minimo con <var>k</var> tagli di monete e importo <var>R</var>?',
              options: [m('Θ(k + R)'), m('Θ(k\u2009R)'), m('Θ(R log R)'), m('Θ(k^R)')],
              answer: 1,
              explain: `Ci sono ${m('R + 1')} sottoproblemi e per ognuno si provano le <var>k</var> monete: ${m('Θ(k\u2009R)')}. È
              polinomiale nel <em>valore</em> di <var>R</var>, non nella sua lunghezza in cifre: per questo si dice
              pseudo-polinomiale (lo vedi con lo zaino 0/1).`,
            },
          ]),
      });
    },
  });

  /* ======================================================================
     Fibonacci: contatore di chiamate e albero delle chiamate
     ====================================================================== */

  function fibNum(n) {
    let a = 0;
    let b = 1;
    for (let i = 0; i < n; i++) [a, b] = [b, a + b];
    return a;
  }

  /** Albero delle chiamate. memo = true: le chiamate già risolte diventano foglie. */
  function callTree(n, memo) {
    const nodes = {};
    let next = 0;
    const done = new Set();
    const visit = (k) => {
      const id = 'c' + next++;
      if (memo && done.has(k)) {
        nodes[id] = { label: String(k), kids: [], cls: 'key' };
        return id;
      }
      const first = !done.has(k);
      const node = { label: String(k), kids: [], cls: first ? 'done' : 'swap' };
      nodes[id] = node;
      if (k >= 2) node.kids = [visit(k - 1), visit(k - 2)];
      done.add(k);
      return id;
    };
    const root = visit(n);
    return { root, nodes, count: next };
  }

  function mountFibLab(host) {
    const lab = h('div.lab');
    const head = h('div.lab-head', h('h3', { text: 'Contatore di chiamate' }));
    const body = h('div.lab-body.quadretti');
    const controls = h('div.lab-controls');
    const out = h('div.lab-out', { 'aria-live': 'polite' });
    lab.append(head, body, controls, out);
    host.append(lab);

    const treeBox = h('div.tc-fib-tree');
    const msg = h('p.tc-fib-msg', { hidden: true });
    const legend = h('div.st-legend.tc-fib-legend', { 'aria-label': 'Legenda dei colori' });
    body.append(treeBox, msg, legend);
    const tree = new ASD.viz.TreeView(treeBox, { layout: 'tidy', shape: 'circle', r: 15, gap: 9, pad: 16, levelH: 48, ariaLabel: 'Albero delle chiamate di fib' });

    const MODES = [
      { id: 'semplice', label: 'ricorsione semplice', limit: 7 },
      { id: 'memo', label: 'memoizzazione', limit: 9 },
    ];
    const mode = T.radios('Albero delle chiamate', MODES, () => draw(), 'semplice');
    const nSlider = T.slider('n', { min: 0, max: 45, value: 5 }, () => draw());
    controls.append(nSlider.el, mode.el);

    const fmtN = (v) => v.toLocaleString('it-IT');

    function draw() {
      const n = nSlider.value();
      const md = mode.value();
      const memo = md.id === 'memo';
      legend.hidden = n > md.limit;
      if (n <= md.limit) {
        const t = callTree(n, memo);
        tree.root.hidden = false;
        msg.hidden = true;
        tree.render({ root: t.root, nodes: t.nodes });
      } else {
        tree.root.hidden = true;
        msg.hidden = false;
        const calls = memo ? Math.max(1, 2 * n - 1) : 2 * fibNum(n + 1) - 1;
        msg.textContent = `Con n = ${n} l'albero ha ${fmtN(calls)} nodi: troppo grande da disegnare. Scendi fino a n = ${md.limit} per vederlo.`;
      }
      legend.replaceChildren(
        ...(memo
          ? [h('span', h('i.k-done'), 'calcolato (una volta sola)'), h('span', h('i.k-key'), 'letto da memo')]
          : [h('span', h('i.k-done'), 'calcolato la prima volta'), h('span', h('i.k-swap'), 'ricalcolato: lavoro sprecato')])
      );
      const naive = 2 * fibNum(n + 1) - 1;
      const memoCalls = n === 0 ? 1 : 2 * n - 1;
      const iters = Math.max(0, n - 1);
      out.innerHTML =
        `<p class="tc-out-line">${m(`F(${n}) = ${fibNum(n)}`)}</p>` +
        table({
          cls: 'tc-fib-counts',
          head: ['Versione', 'Quante', 'Formula', 'Costo'],
          rows: [
            ['Ricorsione semplice', `<span class="tc-num">${fmtN(naive)}</span> chiamate`, m('2F(n+1) - 1'), m('Θ(φ^n)')],
            ['Memoizzazione', `<span class="tc-num">${fmtN(memoCalls)}</span> chiamate`, m('2n - 1'), m('Θ(n)')],
            ['Tabulazione', `<span class="tc-num">${fmtN(iters)}</span> iterazioni`, m('n - 1'), m('Θ(n)')],
          ],
        });
    }
    draw();
  }

  /* ======================================================================
     Resto minimo: traccia di minimoMonete() e ricostruisci()
     ====================================================================== */

  function parseMonete(text) {
    const parts = String(text).split(';');
    if (parts.length !== 2) throw new Error('Scrivi le monete, un punto e virgola e l\'importo: per esempio 1 3 4 ; 6.');
    const coins = ASD.parseNumbers(parts[0], { min: 1, max: 20, minLen: 1, maxLen: 5 });
    if (new Set(coins).size !== coins.length) throw new Error('Ogni taglio di moneta va scritto una volta sola.');
    const R = ASD.parseNumbers(parts[1], { min: 1, max: 16, minLen: 1, maxLen: 1 })[0];
    return { coins, R };
  }

  const show = (v) => (v === Infinity ? '∞' : String(v));

  function traceMonete({ coins, R }) {
    const t = new ASD.Tracer(['confronti', 'aggiornamenti']);
    const dp = new Array(R + 1).fill(Infinity);
    const sc = new Array(R + 1).fill(0);
    const rows = [{ label: 'dp[x]' }, { label: 'scelta[x]' }];
    const cols = dp.map((_, x) => ({ label: String(x) }));
    const label = `${m('dp[x]')} = numero minimo di monete per formare <var>x</var> · ${m('scelta[x]')} = l'ultima moneta usata · monete {${coins.join(', ')}}`;
    const snap = (o = {}) => {
      const upto = o.upto == null ? R : o.upto;
      const marks = {};
      for (let x = upto + 1; x <= R; x++) {
        marks[T.key(0, x)] = 'out';
        marks[T.key(1, x)] = 'out';
      }
      return {
        rows,
        cols,
        corner: 'x',
        label,
        cells: [dp.map(show), sc.map((c) => (c === 0 ? '–' : c))],
        marks,
        cur: o.cur || null,
        deps: o.deps || [],
        path: o.path || [],
        result: o.result || null,
      };
    };

    t.step('init', `<code>dp</code> ha ${R + 1} caselle, da 0 a ${R}, tutte a INF (∞): per ora nessun importo si sa formare. <code>scelta</code> parte da 0, scritto –: nessuna moneta.`, {}, snap({ upto: -1 }));
    dp[0] = 0;
    t.step('base', `Caso base: <code>dp[0] = 0</code>, l'importo 0 si forma con zero monete.`, {}, snap({ upto: 0, cur: [0, 0] }));
    for (let x = 1; x <= R; x++) {
      t.step('outer', `<b>x = ${x}</b>: provo ogni moneta <var>c</var> come ultima moneta del resto di ${x}.`, { x, 'dp[x]': show(dp[x]) }, snap({ upto: x, cur: [0, x] }));
      for (const c of coins) {
        t.count('confronti');
        if (c > x) {
          t.step('cmp', `c = ${c} &gt; x = ${x}: la moneta è troppo grande, la condizione è falsa e <code>dp[x − c]</code> non si legge.`, { x, c, 'dp[x]': show(dp[x]) }, snap({ upto: x, cur: [0, x] }));
          continue;
        }
        const prev = dp[x - c];
        const cand = prev + 1;
        const better = cand < dp[x];
        let note;
        if (prev === Infinity) note = `c = ${c}: <code>dp[${x - c}]</code> è ∞, quindi da ${x - c} non si arriva: con questa moneta niente da fare.`;
        else
          note = `c = ${c}: <code>dp[${x} − ${c}] + 1</code> = dp[${x - c}] + 1 = ${cand} ${better ? '&lt;' : '≥'} dp[${x}] = ${show(dp[x])}: ${better ? '<b>migliora</b>.' : 'non migliora.'}`;
        t.step('cmp', note, { x, c, 'dp[x]': show(dp[x]) }, snap({ upto: x, cur: [0, x], deps: [[0, x - c]] }));
        if (better) {
          dp[x] = cand;
          sc[x] = c;
          t.count('aggiornamenti');
          t.step('update', `<code>dp[${x}] = ${cand}</code> e <code>scelta[${x}] = ${c}</code>: ${x} = (resto di ${x - c}) + una moneta da ${c}.`, { x, c, 'dp[x]': show(dp[x]) }, snap({ upto: x, cur: [0, x], deps: [[0, x - c]] }));
        }
      }
    }
    const k = dp[R];
    t.step('ret', k === Infinity ? `<code>dp[${R}]</code> è rimasto ∞: con queste monete ${R} non si può formare.` : `<code>dp[${R}] = ${k}</code>: è il minimo numero di monete per ${R}. Ora ricostruisco quali.`, {}, snap({ cur: [0, R] }));
    if (k === Infinity) {
      t.step(null, `Nessuna combinazione di monete {${coins.join(', ')}} fa ${R}: la risposta è "impossibile".`, {}, snap({ result: { k: Infinity, usate: null } }));
      return t.frames;
    }
    const usate = [];
    const path = [];
    for (let x = R; x > 0; x -= sc[x]) {
      path.push([0, x], [1, x]);
      t.step('rec', `x = ${x} &gt; 0: l'ultima moneta del resto di ${x} è <code>scelta[${x}] = ${sc[x]}</code>.`, { x }, snap({ path: path.slice() }));
      usate.push(sc[x]);
      t.step('rec-take', `La metto tra le monete usate (${usate.join(' + ')}) e passo a x = ${x} − ${sc[x]} = ${x - sc[x]}.`, { x }, snap({ path: path.slice() }));
    }
    path.push([0, 0]);
    t.step('rec', `x = 0: il resto è completo.`, { x: 0 }, snap({ path: path.slice() }));
    const g = T.coins.greedy(coins, R);
    const gText = g ? `il greedy ne usa ${g.length} (${g.join(' + ')})` : 'il greedy non riesce nemmeno a formarlo';
    t.step(
      null,
      `Finito: ${R} = ${usate.join(' + ')}, <b>${k} ${k === 1 ? 'moneta' : 'monete'}</b>. Per confronto, ${gText}. Costo: ${R} importi × ${coins.length} monete provate.`,
      {},
      snap({ path: path.slice(), result: { k, usate } })
    );
    return t.frames;
  }

  function validateMonete(input, frames) {
    const st = frames[frames.length - 1].state;
    if (!st.result) return 'manca il risultato nell\'ultimo passo';
    const expected = T.brute.coins(input.coins, input.R);
    if (st.result.k !== expected) return `dp[R] = ${st.result.k}, la visita in ampiezza dice ${expected}`;
    if (st.result.usate) {
      const sum = st.result.usate.reduce((a, b) => a + b, 0);
      if (sum !== input.R) return `le monete ricostruite fanno ${sum}, non ${input.R}`;
      if (st.result.usate.length !== st.result.k) return 'il numero di monete ricostruite non è dp[R]';
      if (st.result.usate.some((c) => !input.coins.includes(c))) return 'una moneta ricostruita non è tra quelle date';
    }
    return null;
  }
})();
