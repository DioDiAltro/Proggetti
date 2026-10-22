/* ASD a quadretti — capitolo "Il metodo per calcolarla": la ricetta, le regole
   per ogni costrutto, il conto guidato dell'insertion sort, gli esempi svolti,
   le somme che servono, le trappole. È il capitolo che risponde alla domanda
   "come si calcola la complessità di un algoritmo?". */
(function () {
  'use strict';

  const { h, m, box, table } = ASD;
  const c = (k) => `c<sub>${k}</sub>`;

  /* Le regole: frammento annotato + spiegazione. */
  const RULES = [
    {
      id: 'sequenza',
      title: 'Istruzioni semplici e sequenze',
      code: 'int x = a[0] + 1;\nint y = x * 2;\nscambia(a[0], a[1]);',
      notes: { 1: '1', 2: '1', 3: '1' },
      total: `${m('T = 1 + 1 + 1 = Θ(1)')}`,
      text: `<p>Assegnamenti, operazioni aritmetiche, confronti, accessi a un array: costo costante, ${m('Θ(1)')}.
      Le istruzioni <strong>in sequenza</strong> si sommano, e in una somma conta il termine più grande:
      ${m('Θ(n) + Θ(n^2) = Θ(n^2)')}.</p>`,
    },
    {
      id: 'if',
      title: 'if / else',
      code: 'if (a[0] > 0) {\n    for (int i = 0; i < n; i++) s += a[i];\n} else {\n    s = 0;\n}',
      notes: { 1: '1', 2: 'n', 4: '1' },
      total: `${m('T(n) <= 1 + max(n, 1) = O(n)')}`,
      text: `<p>Costo della condizione più il costo del ramo eseguito. Nel caso peggiore si prende il ramo più caro:
      ${m('T = T_cond + max(T_if, T_else)')}. Qui il caso peggiore è ${m('Θ(n)')}, il migliore ${m('Θ(1)')}.</p>`,
    },
    {
      id: 'ciclo',
      title: 'Un ciclo',
      code: 'int somma = 0;\nfor (int i = 0; i < n; i++) {\n    somma += a[i];\n}',
      notes: { 1: '1', 2: 'n + 1 test', 3: 'n volte' },
      total: `${m('T(n) = 1 + (n+1) + n = 2n + 2 = Θ(n)')}`,
      text: `<p>Numero di giri per costo di un giro. Il test della condizione si fa una volta in più dei giri (l'ultimo,
      falso, fa uscire), ma a fine conto non cambia nulla: ${m('Θ(n)')}.</p>`,
    },
    {
      id: 'annidati',
      title: 'Cicli annidati indipendenti',
      code: 'for (int i = 0; i < n; i++)\n    for (int j = 0; j < m; j++)\n        c[i][j] = a[i][j] + b[i][j];',
      notes: { 1: 'n giri', 2: 'm giri per ogni i', 3: 'n · m' },
      total: `${m('T(n, m) = Θ(n · m)')}`,
      text: `<p>Se il numero di giri del ciclo interno non dipende dall'indice esterno, si <strong>moltiplica</strong>.
      Con due dimensioni diverse (righe e colonne, vertici e archi) il risultato le contiene entrambe: non si scrive
      ${m('Θ(n^2)')} se ${m('m')} può essere molto diverso da ${m('n')}.</p>`,
    },
    {
      id: 'dipendenti',
      title: 'Cicli annidati dipendenti',
      code: 'for (int i = 0; i < n; i++)\n    for (int j = i + 1; j < n; j++)\n        if (a[i] == a[j]) return true;',
      notes: { 1: 'n giri', 2: 'n − 1 − i giri', 3: 'Σ (n−1−i)' },
      total: `${m('T(n) = (n-1) + (n-2) + … + 0 = n(n-1)/2 = Θ(n^2)')}`,
      text: `<p>Se il ciclo interno dipende da ${m('i')} non si moltiplica: si <strong>somma</strong> il numero di giri per
      ogni ${m('i')}. Qui ${m('Σ_{i=0}^{n-1} (n-1-i) = n(n-1)/2')}. Moltiplicare (${m('n · n')}) darebbe comunque un tetto
      corretto, ${m('O(n^2)')}, ma per il ${m('Θ')} serve la somma.</p>`,
    },
    {
      id: 'log',
      title: 'Indice che si moltiplica o si divide',
      code: 'for (int i = 1; i < n; i *= 2)\n    op++;\n\nwhile (n > 1)\n    n = n / 2;',
      notes: { 1: '⌈log<sub>2</sub> n⌉ giri', 4: '⌊log<sub>2</sub> n⌋ giri' },
      total: `${m('T(n) = Θ(log n)')}`,
      text: `<p>Se l'indice raddoppia (o si dimezza) a ogni giro, dopo ${m('k')} giri vale ${m('2^k')} (o ${m('n/2^k')}).
      Il ciclo finisce quando ${m('2^k >= n')}: ${m('k = log_2 n')}. Con <code>i *= 3</code> sarebbe ${m('log_3 n')}: per la
      notazione è lo stesso, ${m('Θ(log n)')}.</p>`,
    },
    {
      id: 'chiamate',
      title: 'Chiamate di funzione',
      code: 'sort(v.begin(), v.end());           // v ha n elementi\nfor (int i = 0; i < n; i++)\n    if (binary_search(v.begin(), v.end(), q[i]))\n        trovati++;',
      notes: { 1: 'Θ(n log n)', 2: 'n giri', 3: 'Θ(log n) a giro' },
      total: `${m('T(n) = Θ(n log n) + n · Θ(log n) = Θ(n log n)')}`,
      text: `<p>Una chiamata costa quanto la funzione chiamata <em>con quei parametri</em>. Le funzioni della libreria
      standard non sono gratis: <code>sort</code> è ${m('Θ(n log n)')}, <code>binary_search</code> ${m('Θ(log n)')},
      <code>find</code> e <code>count</code> ${m('Θ(n)')}, <code>v.erase(v.begin())</code> ${m('Θ(n)')} (sposta tutti gli
      altri). I costi sono in ${ASD.link('cpp-stl')}.</p>`,
    },
    {
      id: 'ricorsione',
      title: 'Ricorsione',
      code: 'int somma(const vector<int>& a, int n) {\n    if (n == 0) return 0;\n    return a[n - 1] + somma(a, n - 1);\n}',
      notes: { 2: '1', 3: '1 + T(n−1)' },
      total: `${m('T(n) = T(n-1) + Θ(1)')} &nbsp;⇒&nbsp; ${m('T(n) = Θ(n)')}`,
      text: `<p>Una funzione ricorsiva non si conta "a giri": si scrive una <strong>ricorrenza</strong>, cioè il costo per
      ${m('n')} in funzione del costo per input più piccoli, e la si risolve. Il metodo è nel capitolo
      ${ASD.link('cx-ricorrenze')}.</p>`,
    },
  ];

  /* Esempi svolti per la galleria. */
  const EXAMPLES = [
    {
      id: 'triangolo',
      title: 'Triangolo',
      code: 'for (int i = 0; i < n; i++)\n    for (int j = 0; j < i; j++)\n        op++;',
      notes: { 1: 'n giri', 2: 'i giri per ogni i', 3: '0 + 1 + … + (n−1)' },
      steps: [
        `Il ciclo esterno fa ${m('n')} giri, con ${m('i = 0, 1, …, n-1')}.`,
        `Con ${m('i')} fissato il ciclo interno fa ${m('i')} giri (${m('j')} va da 0 a ${m('i-1')}).`,
        `Totale: ${m('Σ_{i=0}^{n-1} i = 0 + 1 + … + (n-1) = n(n-1)/2')}.`,
      ],
      result: m('n(n-1)/2 = Θ(n^2)'),
    },
    {
      id: 'raddoppio',
      title: 'Raddoppio',
      code: 'for (int i = 1; i < n; i *= 2)\n    op++;',
      notes: { 1: '⌈log<sub>2</sub> n⌉ giri', 2: '⌈log<sub>2</sub> n⌉' },
      steps: [
        `Dopo ${m('k')} giri l'indice vale ${m('2^k')}: 1, 2, 4, 8, …`,
        `Il ciclo continua finché ${m('2^k < n')}, cioè finché ${m('k < log_2 n')}.`,
        `Quindi i giri sono ${m('⌈log_2 n⌉')}: con ${m('n = 1024')} sono 10, con ${m('n = 10^6')} sono 20.`,
      ],
      result: m('Θ(log n)'),
    },
    {
      id: 'dimezza',
      title: 'Dimezza e scorri',
      code: 'for (int i = n; i > 0; i /= 2)\n    for (int j = 0; j < i; j++)\n        op++;',
      notes: { 1: 'circa log<sub>2</sub> n giri', 2: 'i giri', 3: 'n + n/2 + n/4 + …' },
      steps: [
        `Il ciclo esterno fa circa ${m('log_2 n')} giri, ma i giri non costano tutti uguale: quello interno ne fa ${m('i')}.`,
        `${m('i')} vale ${m('n, n/2, n/4, …, 1')}: il totale è ${m('n + n/2 + n/4 + … + 1')}.`,
        `È una serie geometrica di ragione ${m('1/2')}: ${m('n(1 + 1/2 + 1/4 + …) < 2n')}.`,
        `"Giri esterni per giri interni massimi" darebbe ${m('n log n')}: un tetto corretto ma non stretto. Il conto vero è lineare.`,
      ],
      result: m('Θ(n)'),
    },
    {
      id: 'chiamata',
      title: 'Cicli e chiamate',
      code: 'for (int i = 0; i < n; i++)\n    if (find(v.begin(), v.end(), q[i]) != v.end())\n        trovati++;',
      notes: { 1: 'n giri', 2: 'Θ(n) a giro' },
      steps: [
        `<code>find</code> scorre tutto <code>v</code> nel caso peggiore: ${m('Θ(n)')} per chiamata.`,
        `La chiamata sta in un ciclo di ${m('n')} giri: ${m('n · Θ(n) = Θ(n^2)')}.`,
        `Ordinando prima <code>v</code> (${m('Θ(n log n)')}) e usando <code>binary_search</code> (${m('Θ(log n)')}) il totale scende a ${m('Θ(n log n)')}.`,
      ],
      result: m('Θ(n^2)'),
    },
    {
      id: 'uscita',
      title: 'Uscita anticipata',
      code: 'int i = 0;\nwhile (i < n && a[i] != x)\n    i++;\nreturn i < n;',
      notes: { 2: 'da 1 a n + 1 test', 3: 'da 0 a n volte' },
      steps: [
        `Il numero di giri dipende da dove si trova ${m('x')}, non solo da ${m('n')}.`,
        `Caso migliore: ${m('x = a[0]')}, un solo test. ${m('Θ(1)')}.`,
        `Caso peggiore: ${m('x')} non c'è, ${m('n')} giri. ${m('Θ(n)')}.`,
        `Caso medio, se ${m('x')} è in una posizione a caso: circa ${m('n/2')} giri, ancora ${m('Θ(n)')}.`,
      ],
      result: `migliore ${m('Θ(1)')}, peggiore ${m('Θ(n)')}`,
    },
    {
      id: 'radice',
      title: 'Fino alla radice',
      code: 'bool primo(int n) {\n    if (n < 2) return false;\n    for (int d = 2; d * d <= n; d++)\n        if (n % d == 0) return false;\n    return true;\n}',
      notes: { 3: 'al più √n − 1 giri', 4: '1 a giro' },
      steps: [
        `Si provano i divisori ${m('d')} finché ${m('d^2 <= n')}, cioè ${m('d <= √n')}.`,
        `Nel caso peggiore (${m('n')} primo) i giri sono circa ${m('√n')}: ${m('Θ(√n)')}.`,
        `Qui ${m('n')} è il <em>valore</em> del numero, non la lunghezza dell'input. Un numero di ${m('b')} cifre binarie vale fino a ${m('2^b')}, quindi ${m('√n = 2^{b/2}')}: esponenziale nel numero di cifre.`,
      ],
      result: m('Θ(√n)'),
    },
    {
      id: 'cubico',
      title: 'Tre cicli',
      code: 'for (int i = 0; i < n; i++)\n    for (int j = i; j < n; j++) {\n        int s = 0;\n        for (int k = i; k <= j; k++)\n            s += a[k];\n        migliore = max(migliore, s);\n    }',
      notes: { 1: 'n giri', 2: 'n − i giri', 4: 'j − i + 1 giri' },
      steps: [
        `È la soluzione "forza bruta" del massimo sottovettore: prova ogni coppia ${m('i <= j')} e somma da capo ${m('a[i..j]')}.`,
        `Per ogni coppia il ciclo più interno fa ${m('j - i + 1')} giri. Sommando: ${m('Σ_i Σ_{j >= i} (j - i + 1) = n(n+1)(n+2)/6')}.`,
        `Senza il conto esatto: le coppie sono circa ${m('n^2/2')} e il ciclo interno fa in media circa ${m('n/3')} giri, quindi ordine ${m('n^3')}.`,
      ],
      result: m('Θ(n^3)'),
    },
  ];

  function mountRegole(host) {
    for (const r of RULES) {
      const wrap = h('div.cx-rule', { id: 'regola-' + r.id });
      const left = h('div');
      const right = h('div');
      right.append(h('h3', { text: r.title }));
      right.insertAdjacentHTML('beforeend', r.text);
      wrap.append(right, left);
      host.append(wrap);
      ASD.code(left, { code: r.code, file: 'frammento.cpp', notes: r.notes, total: r.total, run: false });
    }
  }

  function mountGalleria(host) {
    const lab = h('div.lab');
    const head = h('div.lab-head', h('h3', { text: 'Esempi svolti' }));
    const chips = h('div.cx-snips', { role: 'group', 'aria-label': 'Scegli un esempio' });
    const body = h('div.lab-body');
    lab.append(head, h('div.lab-controls', chips), body);
    host.append(lab);
    const buttons = EXAMPLES.map((ex, k) => {
      const b = h('button.btn.btn-sm', { type: 'button', 'aria-pressed': String(k === 0), text: ex.title });
      b.addEventListener('click', () => show(k));
      chips.append(b);
      return b;
    });
    function show(k) {
      const ex = EXAMPLES[k];
      buttons.forEach((b, j) => b.setAttribute('aria-pressed', String(j === k)));
      body.replaceChildren();
      const grid = h('div.cx-lab-grid');
      const left = h('div');
      const right = h('div');
      grid.append(left, right);
      body.append(grid);
      ASD.code(left, { code: ex.code, file: 'esempio.cpp', notes: ex.notes, run: false });
      const ol = h('ol.cx-steps');
      for (const s of ex.steps) ol.append(h('li', { html: s }));
      right.append(ol, h('p.cx-result', { html: 'Risultato: ' + ex.result }));
    }
    show(0);
  }

  /* Il conto guidato dell'insertion sort (stile Cormen, con indici da 0). */
  function insertionSteps() {
    const S = (s) => m(s);
    return [
      {
        line: null,
        text: `Ogni riga, eseguita una volta, costa una costante ${c('k')}. Il costo totale è la somma, riga per riga, di <em>costo × numero di esecuzioni</em>. Premi <kbd>→</kbd> per scrivere i numeri a margine.`,
        board: [`${S('T(n) = Σ')} (costo della riga) × (quante volte viene eseguita)`],
      },
      {
        line: 2,
        text: `<code>int n = a.size();</code> si esegue una volta sola.`,
        notes: { 2: `${c(0)} · 1` },
      },
      {
        line: 'outer',
        text: `Il <code>for</code> fa ${m('n-1')} giri (${m('i = 1, …, n-1')}), ma il test <code>i &lt; n</code> si valuta ${m('n')} volte: l'ultima, falsa, fa uscire dal ciclo.`,
        notes: { outer: `${c(1)} · n` },
      },
      {
        line: 'key',
        text: `Il corpo del <code>for</code> viene eseguito una volta per giro: ${m('n-1')} volte.`,
        notes: { key: `${c(2)} · (n−1)` },
      },
      {
        line: 'j-init',
        text: `Anche questa: ${m('n-1')} volte.`,
        notes: { 'j-init': `${c(3)} · (n−1)` },
      },
      {
        line: 'cmp',
        text: `Il test del <code>while</code> dipende dai dati. Chiamiamo ${m('t_i')} il numero di volte che viene valutato mentre si inserisce <code>a[i]</code>: almeno 1, al massimo ${m('i+1')} (quando <code>j</code> arriva a −1).`,
        notes: { cmp: `${c(4)} · Σ t<sub>i</sub>` },
        board: [`${S('t_i =')} numero di test del <code>while</code> per un certo ${S('i')}, con ${S('1 <= t_i <= i + 1')}`],
      },
      {
        line: 'shift',
        text: `Il corpo del <code>while</code> si esegue una volta in meno del test: ${m('t_i - 1')} volte per ogni ${m('i')}.`,
        notes: { shift: `${c(5)} · Σ (t<sub>i</sub> − 1)` },
      },
      {
        line: 'dec',
        text: `Stesso numero della riga sopra.`,
        notes: { dec: `${c(6)} · Σ (t<sub>i</sub> − 1)` },
      },
      {
        line: 'place',
        text: `Una volta per giro del <code>for</code>: ${m('n-1')} volte.`,
        notes: { place: `${c(7)} · (n−1)` },
      },
      {
        line: null,
        text: 'Sommo tutto. Le costanti non le conosciamo (dipendono dal computer), ma non servono: conta come crescono i termini.',
        total: `<span class="mano">T(n) = c<sub>0</sub> + c<sub>1</sub>n + (c<sub>2</sub>+c<sub>3</sub>+c<sub>7</sub>)(n−1) + c<sub>4</sub>Σt<sub>i</sub> + (c<sub>5</sub>+c<sub>6</sub>)Σ(t<sub>i</sub>−1)</span>`,
        board: [`${S('T(n) = c_0 + c_1 n + (c_2 + c_3 + c_7)(n-1) + c_4 Σ t_i + (c_5 + c_6) Σ (t_i - 1)')}`],
      },
      {
        line: 'cmp',
        text: `<strong>Caso migliore</strong>: l'array è già ordinato. Per ogni ${m('i')} il primo test trova ${m('a[i-1] <= key')} e il <code>while</code> non parte: ${m('t_i = 1')}.`,
        board: [`Migliore: ${S('t_i = 1')} ⇒ ${S('Σ t_i = n - 1')}, ${S('Σ (t_i - 1) = 0')} ⇒ ${S('T(n) = a n + b = Θ(n)')}`],
      },
      {
        line: 'shift',
        text: `<strong>Caso peggiore</strong>: l'array è al contrario. Ogni <code>key</code> scorre fino all'inizio: ${m('t_i = i + 1')}.`,
        board: [
          `Peggiore: ${S('Σ_{i=1}^{n-1} (i + 1) = n(n+1)/2 - 1')}, ${S('Σ_{i=1}^{n-1} i = n(n-1)/2')}`,
          `⇒ ${S('T(n) = a n^2 + b n + c = Θ(n^2)')}`,
        ],
      },
      {
        line: null,
        text: `Morale: il ciclo esterno da solo vale ${m('Θ(n)')}, è il ciclo interno a decidere. Nella pratica si salta subito al ciclo più interno e si contano i suoi giri: è quello che fa il resto di questo capitolo.`,
        board: [`<span class="mano">si conta il ciclo più interno: è lui che decide</span>`],
      },
    ];
  }

  ASD.chapter({
    id: 'cx-metodo',
    title: 'Il metodo per calcolare la complessità',
    lead:
      'Una ricetta in cinque passi e una regola per ogni costrutto del C++. Poi un conto completo riga per riga, come sul quaderno, e una serie di esempi svolti con le trappole che all\'esame tornano sempre.',
    minutes: 45,
    prereq: ['cx-costo', 'cx-notazioni'],
    goals: [
      'applicare sempre la stessa ricetta: dimensione, operazione dominante, conteggio, somma, semplificazione',
      'contare i giri di cicli semplici, annidati, dipendenti e con indice che raddoppia',
      'riconoscere le serie che compaiono più spesso (aritmetica, geometrica, armonica)',
      'evitare le trappole classiche: limiti costanti, chiamate nascoste, cicli che dimezzano',
      'scrivere la soluzione d\'esame in modo completo e motivato',
    ],

    render(el) {
      el.innerHTML = `
<section id="ricetta">
  <h2>La ricetta in cinque passi</h2>
  <ol>
    <li><strong>Decidi cos'è ${m('n')}.</strong> La dimensione dell'input: elementi dell'array, nodi, vertici e archi.
    Se le dimensioni sono due (una matrice ${m('n × m')}, un grafo), tienile entrambe.</li>
    <li><strong>Trova l'operazione dominante.</strong> Di solito è nel ciclo più interno.</li>
    <li><strong>Scrivi a margine quante volte viene eseguita</strong> ogni riga importante, in funzione di ${m('n')}
    (e dei dati, se cambia tra caso migliore e peggiore).</li>
    <li><strong>Somma.</strong> Cicli in sequenza: si sommano. Cicli annidati: si moltiplicano se indipendenti, si
    sommano giro per giro se dipendenti. Ricorsione: si scrive una ricorrenza.</li>
    <li><strong>Semplifica.</strong> Tieni il termine che cresce di più, togli le costanti, scrivi ${m('Θ')} (o ${m('O')}
    se hai solo un limite superiore).</li>
  </ol>
  ${box('ricorda', `<p>Le annotazioni a margine scritte "a penna rossa" in questo capitolo sono esattamente quello che
  conviene fare sul foglio d'esame: accanto a ogni ciclo, il numero dei suoi giri.</p>`)}
</section>

<section id="regole">
  <h2>Una regola per ogni costrutto</h2>
  <div data-mount="regole"></div>
</section>

<section id="insertion">
  <h2>Un conto completo: l'insertion sort riga per riga</h2>
  <p>Ecco il metodo applicato fino in fondo, con il codice del capitolo ${ASD.link('sort-semplici', 'insertion', 'Ordinamenti semplici')}.
  Avanza un passo alla volta: a margine compare il costo di ogni riga, sulla lavagna il ragionamento.</p>
  <div data-mount="insertion"></div>
</section>

<section id="esempi">
  <h2>Esempi svolti</h2>
  <p>Sette frammenti tipici. Prima di leggere la soluzione, prova a scrivere tu i numeri a margine.</p>
  <div data-mount="galleria"></div>
  <p>Per allenarti con altri frammenti e vedere i passi misurati davvero, vai al ${ASD.link('cx-laboratorio', null, 'Laboratorio')}.</p>
</section>

<section id="somme">
  <h2>Le somme che servono</h2>
  ${table({
    head: ['Somma', 'Valore', 'Crescita', 'Dove compare'],
    rows: [
      [m('Σ_{i=1}^{n} 1'), m('n'), m('Θ(n)'), 'un ciclo semplice'],
      [m('Σ_{i=1}^{n} i'), m('n(n+1)/2'), m('Θ(n^2)'), 'cicli annidati "a triangolo"'],
      [m('Σ_{i=1}^{n} i^2'), m('n(n+1)(2n+1)/6'), m('Θ(n^3)'), 'tre cicli dipendenti'],
      [m('Σ_{i=0}^{k} 2^i'), m('2^{k+1} - 1'), m('Θ(2^k)'), 'alberi binari: nodi per livello'],
      [m('n + n/2 + n/4 + …'), m('< 2n'), m('Θ(n)'), 'cicli che dimezzano, build-heap'],
      [m('Σ_{i=1}^{n} 1/i = H_n'), m('ln n + O(1)'), m('Θ(log n)'), 'passo che cresce, quicksort medio'],
      [m('Σ_{i=1}^{n} log i = log(n!)'), '', m('Θ(n log n)'), 'limite inferiore degli ordinamenti'],
      ['quante volte dimezzo n prima di arrivare a 1', m('⌊log_2 n⌋'), m('Θ(log n)'), 'ricerca binaria, alberi bilanciati'],
    ],
  })}
  <p>La regola d'oro per le serie geometriche: se ogni termine è una frazione fissa del precedente, la somma vale quanto il
  termine più grande, a meno di una costante. Se ogni termine è un multiplo fisso del precedente (${m('1 + 2 + 4 + … + 2^k')}),
  domina l'ultimo.</p>
</section>

<section id="trappole">
  <h2>Le trappole</h2>
  <ul>
    <li><strong>Limite costante</strong>: <code>for (int i = 0; i &lt; 1000; i++)</code> è ${m('Θ(1)')}, anche se 1000 sembra
    tanto. Conta solo come il costo dipende da ${m('n')}.</li>
    <li><strong>Passo costante</strong>: <code>i += 2</code> o <code>i += 100</code> danno ${m('n/2')} o ${m('n/100')} giri,
    sempre ${m('Θ(n)')}. Il logaritmo arriva solo se l'indice si <em>moltiplica</em>.</li>
    <li><strong>Ciclo interno costante</strong>: <code>for (j = 0; j &lt; 5; j++)</code> dentro un ciclo di ${m('n')} giri
    dà ${m('5n = Θ(n)')}, non ${m('n^2')}.</li>
    <li><strong>Il ciclo che dimezza</strong> con un ciclo interno fino a <code>i</code>: ${m('Θ(n)')}, non
    ${m('Θ(n log n)')} (esempio "Dimezza e scorri").</li>
    <li><strong>Chiamate nascoste</strong>: <code>v.erase(v.begin())</code>, <code>v.insert(v.begin(), x)</code>,
    <code>find</code>, <code>count</code> costano ${m('Θ(n)')}; dentro un ciclo diventano ${m('Θ(n^2)')}. Anche
    <code>s = s + "x"</code> su una stringa copia tutta la stringa (meglio <code>s += 'x'</code>).</li>
    <li><strong>La condizione del ciclo si ripete</strong>: <code>for (i = 0; i &lt; strlen(s); i++)</code> ricalcola la
    lunghezza a ogni giro, ${m('Θ(n)')} ciascuna: ${m('Θ(n^2)')}. Con <code>v.size()</code> invece non c'è problema,
    costa ${m('Θ(1)')}.</li>
  </ul>
  ${box('errore', `<p>"Due cicli annidati, quindi ${m('n^2')}" è la scorciatoia che fa sbagliare più spesso. Conta sempre i giri
  di ciascun ciclo: annidati con limiti ${m('n')} e ${m('log n')} fanno ${m('n log n')}; annidati con un indice che dimezza
  possono fare ${m('n')}; annidati con limite costante fanno ${m('n')}.</p>`)}
</section>

<section id="esame">
  <h2>All'esame: come si scrive la soluzione</h2>
  <p>Una traccia che funziona sempre:</p>
  <ol>
    <li>"Sia ${m('n')} = … (la dimensione dell'input)."</li>
    <li>"L'operazione dominante è … alla riga …"</li>
    <li>"Il ciclo esterno esegue … iterazioni; per ogni ${m('i')} il ciclo interno ne esegue …"</li>
    <li>"In totale: ${m('Σ … = …')}" (la somma scritta e risolta).</li>
    <li>"Quindi ${m('T(n) = Θ(…)')} nel caso peggiore" (e il caso migliore, se diverso).</li>
  </ol>
  ${box('esame', `<p>Se il conto esatto è difficile, puoi dare un limite superiore e uno inferiore separati. Esempio per il
  triangolo: "i giri sono al più ${m('n · n')}, quindi ${m('O(n^2)')}; e per ${m('i >= n/2')} il ciclo interno fa almeno
  ${m('n/2')} giri, che con ${m('n/2')} valori di ${m('i')} danno almeno ${m('n^2/4')}, quindi ${m('Ω(n^2)')}. Dunque
  ${m('Θ(n^2)')}." È una dimostrazione completa.</p>`)}
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        regole: mountRegole,
        insertion: (host) =>
          ASD.cx.derivation(host, {
            id: 'conto-insertion',
            title: 'Insertion sort: il conto riga per riga',
            boardTitle: 'La lavagna',
            code: { src: 'ordinamento/insertion_sort', region: 'sort', run: true },
            steps: insertionSteps(),
          }),
        galleria: mountGalleria,
        quiz: (host) =>
          ASD.quiz(host, [
            {
              q: 'Qual è la complessità di questo frammento?',
              code: 'for (int i = 0; i < n; i++)\n    for (int j = 0; j < n; j++)\n        for (int k = 0; k < 10; k++)\n            op++;',
              options: [m('Θ(n)'), m('Θ(n^2)'), m('Θ(n^3)'), m('Θ(10n^2)')],
              answer: 1,
              explain: `Il ciclo più interno fa sempre 10 giri: è una costante. Totale ${m('10n^2 = Θ(n^2)')}. (${m('Θ(10n^2)')} è la stessa classe, ma
              le costanti non si scrivono.)`,
            },
            {
              q: 'E questo?',
              code: 'for (int i = 1; i < n; i *= 3)\n    op++;',
              options: [m('Θ(n/3)'), m('Θ(log n)'), m('Θ(√n)')],
              answer: 1,
              explain: `L'indice si moltiplica per 3: dopo ${m('k')} giri vale ${m('3^k')}, i giri sono ${m('⌈log_3 n⌉')}. La base del logaritmo
              non conta: ${m('Θ(log n)')}.`,
            },
            {
              q: 'Quante volte viene eseguito <code>op++</code>?',
              code: 'for (int i = 0; i < n; i++)\n    for (int j = i; j < n; j++)\n        op++;',
              options: [m('n^2'), m('n(n+1)/2'), m('n(n-1)/2'), m('n log n')],
              answer: 1,
              explain: `Per ogni ${m('i')} il ciclo interno fa ${m('n - i')} giri (da ${m('i')} a ${m('n-1')} compreso): ${m('n + (n-1) + … + 1 = n(n+1)/2')}.`,
            },
            {
              q: 'Complessità di due cicli uno dopo l\'altro, il primo con <var>n</var> giri, il secondo con <var>n</var>² giri?',
              options: [m('Θ(n^3)'), m('Θ(n^2)'), m('Θ(n + n^2)'), m('Θ(n)')],
              answer: 1,
              explain: `In sequenza si sommano: ${m('n + n^2')}. Nella somma vince il termine più grande: ${m('Θ(n^2)')}. Si moltiplicherebbero solo se
              fossero annidati.`,
            },
            {
              q: 'Complessità di questo frammento (attenzione: <code>n</code> cambia)?',
              code: 'while (n > 1) {\n    n = n / 2;\n    for (int i = 0; i < n; i++)\n        op++;\n}',
              options: [m('Θ(log n)'), m('Θ(n)'), m('Θ(n log n)')],
              answer: 1,
              explain: `I giri del ciclo interno sono ${m('n/2 + n/4 + n/8 + … < n')}: serie geometrica, ${m('Θ(n)')}. Il ciclo esterno fa ${m('log n')}
              giri ma sempre più corti.`,
            },
            {
              q: 'Un ciclo di <var>n</var> giri contiene <code>v.erase(v.begin())</code> su un vector di <var>n</var> elementi. Complessità?',
              options: [m('Θ(n)'), m('Θ(n log n)'), m('Θ(n^2)')],
              answer: 2,
              explain: `Cancellare il primo elemento di un vector sposta indietro tutti gli altri: ${m('Θ(n)')} a chiamata (in media ${m('n/2')}
              elementi sul totale). Ripetuto ${m('n')} volte: ${m('Θ(n^2)')}. Con una <code>deque</code> e <code>pop_front</code> sarebbe ${m('Θ(n)')} in tutto.`,
            },
          ]),
      });
    },
  });
})();
