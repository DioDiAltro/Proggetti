/* ASD a quadretti — capitolo "Esercizi d'esame": esercizi misti nello stile
   dello scritto, ognuno con la soluzione spiegata da aprire dopo averci provato.
   Le soluzioni di simulazione sono state ricontrollate con un programma a parte;
   quelle di programmazione sono programmi in esempi/esame/. */
(function () {
  'use strict';

  const { h, m, box } = ASD;

  /* ------------------------------------------------------------- esercizi */

  const COMPLESSITA = [
    {
      title: 'Passo che cresce',
      q: 'Qual è la complessità del frammento, in funzione di <var>n</var>?',
      code: 'for (int i = 1; i <= n; i++)\n    for (int j = 1; j <= n; j += i)\n        x++;',
      sol: `<p>Per un certo ${m('i')} il ciclo interno fa circa ${m('n/i')} giri (${m('j')} avanza di ${m('i')} alla volta). Il totale è
      ${m('n/1 + n/2 + n/3 + … + n/n = n · H_n')}, dove ${m('H_n ≈ ln n')} è la serie armonica.</p>
      <p><strong>${m('Θ(n log n)')}</strong>. (Con ${m('n = 1000')} il frammento esegue <code>x++</code> 8053 volte; ${m('n ln n ≈ 6908')}.)</p>`,
    },
    {
      title: 'Dimezza fuori, scorri tutto dentro',
      q: 'Qual è la complessità? Confrontala con l\'esempio "Dimezza e scorri" del capitolo sul metodo.',
      code: 'int i = n;\nwhile (i > 0) {\n    for (int j = 0; j < n; j++)\n        x++;\n    i /= 2;\n}',
      sol: `<p>Il ciclo esterno fa ${m('⌊log_2 n⌋ + 1')} giri, e questa volta il ciclo interno fa <em>sempre</em> ${m('n')} giri
      (il suo limite è ${m('n')}, non ${m('i')}). Si moltiplica: ${m('n(⌊log_2 n⌋ + 1)')}.</p>
      <p><strong>${m('Θ(n log n)')}</strong>. Nell'esempio "Dimezza e scorri" il ciclo interno arrivava a ${m('i')}, e il totale
      era ${m('Θ(n)')}: guarda sempre il limite del ciclo interno.</p>`,
    },
    {
      title: 'Limite quadratico',
      q: 'Quante volte viene eseguito <code>x++</code>? Che complessità ha il frammento?',
      code: 'for (int i = 0; i < n; i++)\n    for (int j = 0; j < i * i; j++)\n        x++;',
      sol: `<p>Per ogni ${m('i')} il ciclo interno fa ${m('i^2')} giri: ${m('Σ_{i=0}^{n-1} i^2 = (n-1)n(2n-1)/6')}.</p>
      <p><strong>${m('Θ(n^3)')}</strong>. (Con ${m('n = 100')}: 328 350 volte, esattamente la formula.)</p>`,
    },
    {
      title: 'Metà sì, metà no',
      q: 'Qual è la complessità nel caso peggiore?',
      code: 'for (int i = 0; i < n; i++) {\n    if (i % 2 == 0)\n        for (int j = 0; j < n; j++)\n            x++;\n    else\n        x++;\n}',
      sol: `<p>Metà dei giri (gli ${m('i')} pari, circa ${m('n/2')}) esegue un ciclo di ${m('n')}; l'altra metà fa un'operazione
      sola. Totale circa ${m('n^2/2 + n/2')}.</p>
      <p><strong>${m('Θ(n^2)')}</strong>: una costante (un mezzo) davanti a ${m('n^2')} non cambia la classe.</p>`,
    },
    {
      title: 'Il valore non è il lavoro',
      q: 'Scrivi la ricorrenza del tempo di calcolo di <code>f</code> e risolvila.',
      code: 'int f(int n) {\n    if (n <= 1) return 1;\n    return f(n / 2) + f(n / 2) + n;\n}',
      sol: `<p>Due chiamate su ${m('n/2')}; fuori dalle chiamate solo due somme, cioè lavoro <strong>costante</strong>: il
      "${m('+ n')}" è un valore che viene sommato, non un ciclo di ${m('n')} giri.</p>
      <p>${m('T(n) = 2T(n/2) + Θ(1)')}: master con ${m('a = 2')}, ${m('b = 2')}, ${m('d = 0 < log_2 2 = 1')}, caso 1.
      <strong>${m('Θ(n)')}</strong>. (Calcolare <code>f(n/2)</code> una volta sola e raddoppiarla darebbe
      ${m('T(n) = T(n/2) + Θ(1) = Θ(log n)')}.)</p>`,
    },
    {
      title: 'Ricorsione con un ciclo',
      q: 'Scrivi la ricorrenza e risolvila.',
      code: 'int g(int n) {\n    if (n <= 1) return 1;\n    int s = 0;\n    for (int i = 0; i < n; i++) s += i;\n    return g(n - 1) + s;\n}',
      sol: `<p>Una chiamata su ${m('n-1')} più un ciclo di ${m('n')} giri: ${m('T(n) = T(n-1) + Θ(n)')}. Il teorema master non si
      applica (il problema si accorcia di uno); srotolando: ${m('n + (n-1) + … + 1 = n(n+1)/2')}.</p>
      <p><strong>${m('Θ(n^2)')}</strong>.</p>`,
    },
  ];

  const SIMULAZIONI = [
    {
      title: 'Insertion sort',
      q: `Esegui l'insertion sort sull'array <code>[7, 3, 9, 1, 5]</code> e scrivi lo stato dell'array dopo ogni iterazione del
      ciclo esterno.`,
      sol: `<ol>
        <li>${m('i = 1')}: <code>[3, 7, 9, 1, 5]</code> (il 3 scavalca il 7)</li>
        <li>${m('i = 2')}: <code>[3, 7, 9, 1, 5]</code> (il 9 è già a posto: un solo confronto)</li>
        <li>${m('i = 3')}: <code>[1, 3, 7, 9, 5]</code> (l'1 scorre fino all'inizio: tre spostamenti)</li>
        <li>${m('i = 4')}: <code>[1, 3, 5, 7, 9]</code></li>
      </ol><p>Puoi rivederlo passo per passo nella ${ASD.link('sort-semplici', 'insertion', 'visualizzazione dell\'insertion sort')}
      scrivendo questo array come input.</p>`,
    },
    {
      title: 'Partizione di Lomuto',
      q: `Esegui la partizione di Lomuto su <code>[4, 8, 2, 7, 1, 5]</code>: il pivot è l'ultimo elemento, si scorre l'array con
      ${m('j')} e ogni elemento ${m('<=')} pivot viene scambiato in avanti nella zona "piccoli". Scrivi l'array finale e la
      posizione del pivot.`,
      sol: `<p>Pivot 5. Gli elementi ${m('<= 5')} che incontro sono 4, 2, 1: finiscono nelle prime tre caselle nell'ordine in cui li
      trovo. Passaggi: 4 resta in a[0]; 2 si scambia con 8 → <code>[4, 2, 8, 7, 1, 5]</code>; 1 si scambia con 8 →
      <code>[4, 2, 1, 7, 8, 5]</code>. Alla fine il pivot si scambia con a[3]:</p>
      <p><code>[4, 2, 1, 5, 8, 7]</code>, pivot in posizione 3. A sinistra solo elementi ${m('<= 5')}, a destra solo ${m('> 5')}.</p>`,
    },
    {
      title: 'Albero binario di ricerca',
      q: `Inserisci in un BST vuoto, nell'ordine, le chiavi 50, 30, 70, 20, 40, 60, 80, 35. Poi cancella il 30 usando il
      successore. Scrivi la visita in preordine prima e dopo la cancellazione.`,
      sol: `<p>Prima: preordine <code>50 30 20 40 35 70 60 80</code>. Il 30 ha due figli: si sostituisce con il suo successore, il
      minimo del sottoalbero destro, cioè 35 (che era foglia, figlio sinistro di 40).</p>
      <p>Dopo: preordine <code>50 35 20 40 70 60 80</code>; la visita simmetrica resta ordinata,
      <code>20 35 40 50 60 70 80</code>.</p>
      <div data-mount="bst-alberi"></div>`,
    },
    {
      title: 'Heap',
      q: `Inserisci in un max-heap vuoto (array con indici da 0) i valori 5, 3, 8, 1, 9, 2. Scrivi l'array finale, poi esegui
      un'estrazione del massimo e scrivi l'array risultante.`,
      sol: `<ul>
        <li>5 → <code>[5]</code>; 3 → <code>[5, 3]</code></li>
        <li>8 → sale sopra il 5: <code>[8, 3, 5]</code>; 1 → <code>[8, 3, 5, 1]</code></li>
        <li>9 → sale due volte (sopra il 3, poi sopra l'8): <code>[9, 8, 5, 1, 3]</code></li>
        <li>2 → il padre è 5, resta lì: <code>[9, 8, 5, 1, 3, 2]</code></li>
      </ul>
      <p>Estrazione: il 9 esce, l'ultimo elemento (2) va in radice e scende scambiandosi sempre con il figlio maggiore: prima con
      l'8, poi con il 3. Risultato <code>[8, 3, 5, 1, 2]</code>.</p>`,
    },
    {
      title: 'Visite di un grafo',
      q: `Grafo non orientato con archi A–B, A–C, B–D, C–D, C–E, D–F, E–F; le liste di adiacenza sono in ordine alfabetico.
      Scrivi l'ordine di visita della BFS e della DFS (ricorsiva) partendo da A, e le distanze trovate dalla BFS.`,
      sol: `<p><strong>BFS</strong>: A, B, C, D, E, F. Distanze: A = 0; B = C = 1; D = E = 2; F = 3. (D viene scoperto da B, che
      esce dalla coda prima di C.)</p>
      <p><strong>DFS</strong>: A, B, D, C, E, F. Da A si va subito a B, da B a D, da D a C (B è già visitato), da C a E, da E a F.</p>`,
    },
    {
      title: 'Dijkstra',
      q: `Grafo orientato con archi pesati S→A 4, S→B 1, B→A 2, A→C 1, B→C 5, C→D 3, B→D 8. Esegui Dijkstra da S: ordine di
      estrazione dei vertici, distanze finali e cammino minimo verso D.`,
      sol: `<p>Estrazioni: S (0), B (1), A (3), C (4), D (7).</p>
      <ul>
        <li>da S: A = 4, B = 1</li>
        <li>da B: A migliora a 1 + 2 = 3; C = 6; D = 9</li>
        <li>da A: C migliora a 3 + 1 = 4</li>
        <li>da C: D migliora a 4 + 3 = 7</li>
      </ul>
      <p>Distanze: S 0, A 3, B 1, C 4, D 7. Cammino verso D (seguendo i padri all'indietro): S → B → A → C → D.</p>`,
    },
    {
      title: 'Kruskal',
      q: `Grafo non orientato con archi A–B 4, A–C 1, B–C 2, B–D 5, C–D 8, C–E 10, D–E 2. Trova un albero di copertura minimo
      con Kruskal, indicando gli archi scartati.`,
      sol: `<p>Archi in ordine di peso: A–C 1, B–C 2, D–E 2, A–B 4, B–D 5, C–D 8, C–E 10.</p>
      <p>Prendo A–C, B–C, D–E. Scarto A–B (A e B sono già collegati tramite C: chiuderebbe un ciclo). Prendo B–D, che unisce
      {A, B, C} e {D, E}. Ho 4 archi per 5 vertici: fine.</p>
      <p>Peso totale <strong>10</strong> (archi A–C, B–C, D–E, B–D).</p>`,
    },
    {
      title: 'Zaino 0/1',
      q: `Capacità ${m('W = 7')}; oggetti (peso, valore): (1, 1), (3, 4), (4, 5), (5, 7). Qual è il valore massimo e quali oggetti
      si prendono?`,
      sol: `<p>Valore massimo <strong>9</strong>, con gli oggetti (3, 4) e (4, 5): peso 7. Il greedy per rapporto valore/peso prenderebbe
      prima (5, 7) (rapporto 1,4) e poi (1, 1): valore 8, peggiore. È per questo che lo zaino 0/1 si risolve con la
      programmazione dinamica (${ASD.link('dp-problemi')}).</p>`,
    },
    {
      title: 'Sottosequenza comune più lunga',
      q: 'Qual è la lunghezza della LCS di <code>ABCBDAB</code> e <code>BDCABA</code>? Scrivine una.',
      sol: `<p>Lunghezza <strong>4</strong>. Una LCS è <code>BCBA</code> (altre: <code>BDAB</code>, <code>BCAB</code>). È l'esempio
      classico del Cormen: la tabella ha ${m('8 × 7')} caselle e si riempie in ${m('Θ(nm)')}.</p>`,
    },
  ];

  const PROGRAMMAZIONE = [
    {
      title: 'Invertire una lista',
      q: 'Scrivi una funzione <code>Nodo* inverti(Nodo* head)</code> che inverte una lista concatenata semplice senza creare nodi nuovi. Costo richiesto: Θ(n) tempo, O(1) memoria.',
      src: 'esame/inverti_lista',
      note: 'Tre puntatori: <code>prev</code>, <code>curr</code> e il successivo salvato prima di girare la freccia. Funziona anche sulla lista vuota.',
    },
    {
      title: 'È un albero di ricerca?',
      q: 'Scrivi una funzione che dice se un albero binario è un BST.',
      src: 'esame/verifica_bst',
      note: 'L\'errore tipico è controllare solo ogni nodo con i suoi figli: l\'albero di destra nel <code>main</code> supera quel controllo ma non è un BST. Ogni nodo deve rispettare i limiti di tutti gli antenati. Costo Θ(n).',
    },
    {
      title: 'Fondere due array ordinati',
      q: 'Dati due vector ordinati di lunghezza <var>n</var> e <var>m</var>, scrivi una funzione che restituisce la loro fusione ordinata in Θ(n + m).',
      src: 'esame/fondi',
      note: 'È la procedura merge del merge sort. Con <code>&lt;=</code> a parità si prende dal primo array: la fusione è stabile.',
    },
    {
      title: 'Componenti connesse',
      q: 'Dato un grafo non orientato con liste di adiacenza, conta le sue componenti connesse.',
      src: 'esame/componenti',
      note: 'Ogni DFS lanciata da un vertice non visitato colora un\'intera componente. Ogni vertice e ogni arco vengono guardati un numero costante di volte: Θ(V + E).',
    },
  ];

  /* ------------------------------------------------------------- disegno */

  function mountList(host, list, prefix) {
    list.forEach((ex, k) => {
      const card = h('article.es');
      card.append(h('h3', { html: `<span class="es-n">${prefix}.${k + 1}</span> ${ex.title}` }));
      card.append(h('div.es-q', { html: `<p>${ex.q}</p>` }));
      if (ex.code) {
        const box2 = h('div');
        card.append(box2);
        ASD.code(box2, { code: ex.code, file: 'esercizio.cpp', run: false });
      }
      const det = h('details.es-sol', h('summary', { text: 'Mostra la soluzione' }));
      const solBox = h('div.es-sol-body');
      if (ex.src) {
        if (ex.note) solBox.append(h('p', { html: ex.note }));
        const cb = h('div');
        solBox.append(cb);
        det.addEventListener(
          'toggle',
          () => {
            if (det.open && !cb.firstChild) ASD.code(cb, { src: ex.src, region: 'soluzione' });
          },
          { once: false }
        );
      } else {
        solBox.innerHTML = ex.sol;
        det.addEventListener('toggle', () => {
          if (det.open) ASD.mount(solBox, { 'bst-alberi': mountBst });
        });
      }
      det.append(solBox);
      card.append(det);
      host.append(card);
    });
  }

  function mountBst(host) {
    if (host.firstChild) return;
    const ins = (t, v) => (!t ? { val: v, left: null, right: null, id: 'k' + v } : v < t.val ? ((t.left = ins(t.left, v)), t) : ((t.right = ins(t.right, v)), t));
    let t = null;
    for (const v of [50, 30, 70, 20, 40, 60, 80, 35]) t = ins(t, v);
    const before = ASD.viz.treeFromNodes(t, { cls: (n) => (n.val === 30 ? 'swap' : n.val === 35 ? 'key' : null) });
    // dopo: il 35 prende il posto del 30
    const t2 = { val: 50, id: 'k50', left: { val: 35, id: 'k35', left: { val: 20, id: 'k20' }, right: { val: 40, id: 'k40' } }, right: { val: 70, id: 'k70', left: { val: 60, id: 'k60' }, right: { val: 80, id: 'k80' } } };
    const after = ASD.viz.treeFromNodes(t2, { cls: (n) => (n.val === 35 ? 'key' : null) });
    const grid = h('div.cols');
    const a = h('figure.es-fig', h('figcaption', { text: 'Prima: il 30 (rosso) ha due figli, il successore è 35 (viola)' }));
    const b = h('figure.es-fig', h('figcaption', { text: 'Dopo: il 35 ha preso il posto del 30' }));
    grid.append(a, b);
    host.append(grid);
    new ASD.viz.TreeView(a, { layout: 'binary', r: 17, levelH: 56 }).render(before);
    new ASD.viz.TreeView(b, { layout: 'binary', r: 17, levelH: 56 }).render(after);
  }

  ASD.chapter({
    id: 'esercizi',
    title: 'Esercizi d\'esame',
    lead:
      'Esercizi nello stile dello scritto: complessità di frammenti e di funzioni ricorsive, simulazioni di algoritmi, piccoli programmi da scrivere. Prova sempre prima su carta, poi apri la soluzione.',
    minutes: 90,
    prereq: ['formulario'],
    goals: [
      'allenarti sui tipi di esercizio che si trovano allo scritto',
      'scrivere soluzioni complete e motivate, non solo il risultato',
      'controllare a posteriori il tuo ragionamento con le soluzioni spiegate',
    ],

    render(el) {
      el.innerHTML = `
<section id="come">
  <h2>Come usare questa pagina</h2>
  <p>Un esercizio alla volta: leggilo, prendi un foglio, scrivi la soluzione completa come se dovessi consegnarla, e solo dopo
  apri <strong>Mostra la soluzione</strong>. Se sbagli, torna al capitolo collegato e rifai l'esercizio il giorno dopo.</p>
  ${box('esame', `<p>Allo scritto il risultato da solo vale poco: conta il ragionamento. Per la complessità scrivi la somma o la
  ricorrenza; per una simulazione scrivi gli stati intermedi; per un programma spiega l'idea in una frase e il costo.</p>`)}
</section>

<section id="complessita">
  <h2>Complessità</h2>
  <div data-mount="complessita"></div>
</section>

<section id="simulazioni">
  <h2>Simulazioni</h2>
  <div data-mount="simulazioni"></div>
</section>

<section id="programmazione">
  <h2>Programmazione</h2>
  <p>Le soluzioni sono programmi completi nella cartella <code>esempi/esame/</code>: compilano, girano e controllano anche i casi
  limite (lista vuota, array vuoto).</p>
  <div data-mount="programmazione"></div>
</section>

<section id="vero-falso">
  <h2>Vero o falso</h2>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        complessita: (host) => mountList(host, COMPLESSITA, 'C'),
        simulazioni: (host) => mountList(host, SIMULAZIONI, 'S'),
        programmazione: (host) => mountList(host, PROGRAMMAZIONE, 'P'),
        quiz: (host) =>
          ASD.quiz(host, [
            {
              q: 'Un algoritmo Θ(n log n) è sempre più veloce di uno Θ(n²).',
              options: ['Vero', 'Falso'],
              answer: 1,
              explain: `Falso: lo è per ${m('n')} abbastanza grande. Per input piccoli le costanti possono far vincere l'algoritmo
              quadratico (è per questo che le librerie usano l'insertion sort sui pezzetti piccoli).`,
            },
            {
              q: 'La ricerca binaria su una lista concatenata ordinata costa Θ(log n).',
              options: ['Vero', 'Falso'],
              answer: 1,
              explain: `Falso: per arrivare all'elemento centrale di una lista bisogna scorrerla, ${m('Θ(n)')}. La ricerca binaria
              richiede accesso diretto per posizione, cioè un array.`,
            },
            {
              q: 'Il quicksort con il pivot scelto come ultimo elemento è Θ(n²) su un array già ordinato.',
              options: ['Vero', 'Falso'],
              answer: 0,
              explain: `Vero: il pivot è sempre il massimo, ogni partizione stacca un solo elemento e la ricorrenza diventa
              ${m('T(n) = T(n-1) + Θ(n) = Θ(n^2)')}.`,
            },
            {
              q: 'In un albero binario di ricerca con n nodi, la ricerca costa sempre O(log n).',
              options: ['Vero', 'Falso'],
              answer: 1,
              explain: `Falso: costa ${m('O(h)')}, e l'altezza ${m('h')} arriva a ${m('n-1')} se l'albero è degenere (per esempio inserendo
              chiavi già ordinate). ${m('O(log n)')} è garantito solo con alberi bilanciati.`,
            },
            {
              q: 'Costruire un heap da n elementi con build-heap costa Θ(n).',
              options: ['Vero', 'Falso'],
              answer: 0,
              explain: `Vero: la maggior parte dei nodi è in basso e scende di poco. La somma delle altezze è ${m('O(n)')}, anche se
              ogni singolo heapify costa fino a ${m('O(log n)')}.`,
            },
            {
              q: 'Dijkstra funziona correttamente anche con archi di peso negativo, purché non ci siano cicli negativi.',
              options: ['Vero', 'Falso'],
              answer: 1,
              explain: `Falso: Dijkstra considera definitiva la distanza di un vertice appena lo estrae, e un arco negativo trovato
              dopo potrebbe migliorarla. Con pesi negativi si usa Bellman-Ford.`,
            },
            {
              q: 'Ogni algoritmo di ordinamento per confronto fa Ω(n log n) confronti nel caso peggiore.',
              options: ['Vero', 'Falso'],
              answer: 0,
              explain: `Vero: l'albero di decisione deve avere almeno ${m('n!')} foglie, quindi altezza almeno ${m('log_2(n!) = Θ(n log n)')}.
              Counting sort e radix sort non lo contraddicono: non confrontano.`,
            },
            {
              q: 'Una tabella hash con liste di trabocco garantisce ricerche Θ(1) anche nel caso peggiore.',
              options: ['Vero', 'Falso'],
              answer: 1,
              explain: `Falso: ${m('Θ(1)')} è il costo medio, con una buona funzione hash e fattore di carico limitato. Nel caso peggiore
              tutte le chiavi finiscono nella stessa lista: ${m('Θ(n)')}.`,
            },
          ]),
      });
    },
  });
})();
