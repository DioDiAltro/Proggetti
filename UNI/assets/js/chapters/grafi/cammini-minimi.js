/* ASD a quadretti — capitolo "Cammini minimi": il rilassamento (con uno
   strumento per provarlo a mano), la BFS per i grafi non pesati, Dijkstra con
   std::priority_queue e cancellazione pigra, il controesempio con un peso
   negativo, Bellman-Ford, la ricostruzione del cammino, Floyd-Warshall. */
(function () {
  'use strict';

  const { m, box, table, h } = ASD;
  const G = ASD.grafi;
  const fmt = G.fmtD;

  ASD.chapter({
    id: 'cammini-minimi',
    title: 'Cammini minimi',
    lead:
      'Qual è la strada più corta da qui a lì? Con gli archi pesati la risposta non è il cammino con meno archi. Tutti gli algoritmi di questo capitolo fanno la stessa mossa, il rilassamento di un arco; cambia l\'ordine in cui la fanno, e da quello dipendono costo e casi in cui funzionano.',
    minutes: 55,
    prereq: ['visite', 'heap'],
    goals: [
      'rilassare un arco e spiegare perché tutti gli algoritmi di cammino minimo sono fatti di rilassamenti',
      'eseguire a mano Dijkstra con la coda con priorità e la tabella delle distanze, e ricostruire i cammini dai padri',
      `spiegare con un controesempio perché Dijkstra non va usato con pesi negativi, e usare Bellman-Ford (${m('Θ(n * m)')})`,
      'scegliere l\'algoritmo giusto: BFS, Dijkstra, Bellman-Ford o Floyd-Warshall',
    ],

    render(el) {
      el.innerHTML = `
<section id="problema">
  <h2>Il problema</h2>
  <p>In un grafo pesato il <strong>peso di un cammino</strong> è la somma dei pesi dei suoi archi. La <strong>distanza</strong>
  ${m('δ(s, v)')} è il peso minimo di un cammino da ${m('s')} a ${m('v')}, ed è ${m('∞')} se ${m('v')} non è raggiungibile.
  Il problema dei <strong>cammini minimi da sorgente singola</strong> chiede ${m('δ(s, v)')} per tutti i nodi ${m('v')}.</p>
  <p>Gli algoritmi tengono due vettori, come la BFS:</p>
  <ul>
    <li><code>dist[v]</code>: il peso del miglior cammino da ${m('s')} a ${m('v')} trovato <em>finora</em>. Parte da ${m('∞')}
    (in C++ una costante <code>INF</code>) e può solo scendere; alla fine vale ${m('δ(s, v)')};</li>
    <li><code>padre[v]</code>: il nodo da cui arriva quel cammino. I padri formano l'<strong>albero dei cammini
    minimi</strong>.</li>
  </ul>
  <p>Due fatti reggono tutto il capitolo. Un pezzo di un cammino minimo è a sua volta minimo (se ci fosse una scorciatoia per il
  pezzo, ci sarebbe anche per il cammino intero). E se esiste un <strong>ciclo di peso negativo</strong> raggiungibile da
  ${m('s')}, i cammini minimi non sono definiti: girando nel ciclo il peso scende quanto si vuole.</p>
</section>

<section id="rilassamento">
  <h2>Rilassare un arco</h2>
  <p>Hai già un cammino per ${m('v')} che pesa <code>dist[v]</code>. Se arrivare a ${m('u')} e poi prendere l'arco
  ${m('(u, v)')} costa meno, quello diventa il nuovo miglior cammino per ${m('v')}:</p>
  <div data-mount="relax-code"></div>
  <p>Un rilassamento non sbaglia mai: <code>dist[v]</code> resta sempre il peso di un cammino vero, quindi non scende mai sotto
  ${m('δ(s, v)')}. Se rilassi gli archi di un cammino minimo nell'ordine in cui compaiono, alla fine l'ultimo nodo ha la
  distanza giusta, qualunque altro rilassamento tu abbia fatto in mezzo. Gli algoritmi si distinguono per l'ordine in cui
  scelgono gli archi da rilassare.</p>
  <p>Prova tu: tocca un arco per rilassarlo. Il grafo ha un peso negativo, ma nessun ciclo negativo.</p>
  <div data-mount="rilassa"></div>
</section>

<section id="bfs">
  <h2>Grafi non pesati: basta la BFS</h2>
  <p>Se tutti gli archi pesano uguale, il cammino minimo è quello con meno archi, e lo trova la
  ${ASD.link('visite', 'bfs', 'BFS')} in ${m('Θ(n + m)')}: è proprio <code>dist</code> della BFS. Con i pesi diversi la BFS non
  basta. Esempio: archi ${m('0 → 1')} di peso 10, ${m('0 → 2')} e ${m('2 → 1')} di peso 1. La BFS raggiunge 1 con un arco solo
  e direbbe ${m('dist[1] = 10')}, ma ${m('0 → 2 → 1')} pesa 2.</p>
  ${box('nota', `Con pesi interi piccoli si può "spezzare" ogni arco di peso ${m('w')} in ${m('w')} archi da 1 e usare la BFS,
  ma il grafo cresce con la somma dei pesi. In generale si usa Dijkstra.`, 'Un trucco che non scala')}
</section>

<section id="dijkstra">
  <h2>L'algoritmo di Dijkstra</h2>
  <p><strong>Idea.</strong> È una BFS in cui la coda è ordinata per distanza. A ogni passo si prende, tra i nodi raggiunti e non
  ancora definitivi, quello con <code>dist</code> più piccola, lo si dichiara <strong>fatto</strong> (la sua distanza non cambierà
  più) e si rilassano i suoi archi uscenti. È un algoritmo goloso (<i>greedy</i>): la scelta del nodo più vicino non viene mai
  rimessa in discussione.</p>
  <p><strong>Perché funziona</strong>, se i pesi sono ${m('>= 0')}. Quando ${m('u')} esce con la distanza minima tra i nodi non
  fatti, ogni altro cammino verso ${m('u')} deve passare prima per un nodo non fatto ${m('x')}, che ha già
  ${m('dist[x] >= dist[u]')}; da ${m('x')} a ${m('u')} si possono solo aggiungere pesi non negativi. Nessun cammino può battere
  <code>dist[u]</code>.</p>
  <h3>Il codice, con std::priority_queue</h3>
  <p>La coda con priorità della STL è un ${ASD.link('heap', null, 'heap')} che tiene in cima il massimo; con
  <code>greater&lt;pair&lt;int, int&gt;&gt;</code> tiene in cima il <strong>minimo</strong>. Le coppie sono (distanza, nodo):
  il <code>pair</code> si confronta prima sul primo elemento, quindi in cima c'è la distanza minore. Non ha però un'operazione
  per diminuire la priorità di un elemento già dentro (il <i>decrease-key</i> dei libri). Il trucco: quando
  <code>dist[v]</code> migliora si inserisce una coppia nuova e la vecchia resta lì; quando la vecchia esce, ${m('v')} è già
  fatto e la si salta. Si chiama <strong>cancellazione pigra</strong> (<i>lazy deletion</i>).</p>
  <div data-mount="dijkstra" class="gr-host"></div>
  <h3>Quanto costa</h3>
  <p>Ogni rilassamento riuscito fa un <code>push</code>, e ogni arco viene rilassato al più una volta, quando il suo nodo di
  partenza diventa fatto: nella coda entrano al più ${m('m + 1')} coppie, ed escono al più ${m('m + 1')} volte. Ogni
  operazione sullo heap costa ${m('O(log m)')}, cioè ${m('O(log n)')} perché ${m('m <= n^2')}. Con ${m('Θ(n)')} per
  inizializzare i vettori:</p>
  <p class="formula">${m('T(n, m) = Θ((n + m) log n)')} nel caso peggiore (${m('Θ(m log n)')} se il grafo è connesso)</p>
  ${table({
    caption: 'Dijkstra con code con priorità diverse',
    head: ['Coda con priorità', 'Estrai il minimo', 'Diminuisci una distanza', 'Totale'],
    rows: [
      ['array non ordinato (il Dijkstra originale)', m('Θ(n)'), m('Θ(1)'), m('Θ(n^2)')],
      ['heap binario (<code>priority_queue</code>)', m('O(log n)'), `${m('O(log n)')} (un <code>push</code> nuovo)`, m('Θ((n + m) log n)')],
      ['heap di Fibonacci (solo teoria)', `${m('O(log n)')} ammortizzato`, `${m('O(1)')} ammortizzato`, m('O(m + n log n)')],
    ],
  })}
  <p>Con un grafo denso (${m('m ≈ n^2')}) la versione con l'array, ${m('Θ(n^2)')}, batte quella con lo heap,
  ${m('Θ(n^2 log n)')}. Con un grafo sparso vince lo heap.</p>
  ${box('esame', `<p>La simulazione a mano di Dijkstra si scrive come una tabella: una riga per estrazione, una colonna per
  nodo, con <code>dist</code> (e <code>padre</code>) dopo che il nodo estratto ha rilassato i suoi archi. I nodi escono in
  ordine di distanza crescente: è un buon controllo sul risultato. Se ti chiedono la coda con priorità, ricordati delle copie
  vecchie.</p>`)}
</section>

<section id="negativi">
  <h2>Pesi negativi: dove Dijkstra sbaglia</h2>
  <p>Il ragionamento «da un nodo non fatto si possono solo aggiungere pesi» crolla con un arco negativo. Ecco il controesempio
  più piccolo: archi ${m('0 → 1')} (2), ${m('0 → 2')} (4), ${m('2 → 1')} (−3), ${m('1 → 3')} (2). Il cammino migliore per 3 è
  ${m('0 → 2 → 1 → 3')}, che pesa ${m('4 - 3 + 2 = 3')}.</p>
  <div data-mount="negativo" class="gr-host"></div>
  <p>Quando 1 esce dalla coda con distanza 2 viene dichiarato fatto e rilassa ${m('1 → 3')}: ${m('dist[3] = 4')}. Solo dopo
  esce 2 e scopre che 1 si raggiunge con ${m('4 - 3 = 1')}. <code>dist[1]</code> migliora, ma 1 è già fatto: la sua nuova
  coppia viene saltata e il miglioramento non arriva mai a 3. Il programma <code>controesempio.cpp</code> confronta i due
  algoritmi sullo stesso grafo:</p>
  <pre class="code-out" tabindex="0"><code>nodo  Dijkstra  Bellman-Ford
  0       0          0
  1       1          1
  2       4          4
  3       4          3   &lt;- sbagliato</code></pre>
  ${box('nota', `<p>Molti programmi saltano le copie vecchie con <code>if (d &gt; dist[u]) continue;</code> invece che con
  l'array <code>fatto</code>. Con pesi non negativi le due versioni fanno esattamente le stesse operazioni. Con pesi negativi
  la seconda lascia uscire un nodo più volte: qui darebbe il risultato giusto, ma il tempo non è più
  ${m('O((n + m) log n)')} (esistono grafi su cui diventa esponenziale), e con un ciclo negativo non termina. In nessuno dei
  due casi Dijkstra è lo strumento giusto per i pesi negativi.</p>`, 'Una variante diffusa')}
  ${box('errore', `<p>«Aggiungo a tutti i pesi una costante grande, così diventano positivi, e uso Dijkstra.» Non funziona:
  un cammino con ${m('k')} archi aumenta di ${m('k')} volte la costante, quindi i cammini con più archi vengono penalizzati e
  il minimo può cambiare.</p>`)}
</section>

<section id="bellman-ford">
  <h2>Bellman-Ford</h2>
  <p><strong>Idea.</strong> Niente scelte furbe: rilassa <em>tutti</em> gli archi, nell'ordine dell'elenco, e ripeti
  ${m('n - 1')} volte. Perché basta: un cammino minimo non ha cicli, quindi ha al massimo ${m('n - 1')} archi. Al giro 1 il
  primo arco di ogni cammino minimo viene sicuramente rilassato, al giro 2 il secondo, e così via: dopo il giro ${m('k')} sono
  giuste tutte le distanze che si ottengono con al massimo ${m('k')} archi.</p>
  <p>Funziona con i pesi negativi, e in più <strong>scopre i cicli negativi</strong>: se dopo ${m('n - 1')} giri un arco si può
  ancora rilassare, c'è un ciclo di peso negativo raggiungibile da ${m('s')}.</p>
  <div data-mount="bf" class="gr-host"></div>
  <p>L'elenco degli archi del default è in un ordine "sfortunato": ogni giro sistema un solo arco del cammino
  ${m('0 → 2 → 1 → 3 → 4')}, e servono tutti i ${m('n - 1 = 4')} giri. Con il bottone <em>Ciclo negativo</em> si aggiunge
  ${m('3 → 2')} di peso −5: il ciclo ${m('2 → 1 → 3 → 2')} pesa ${m('-2 + 3 - 5 = -4')}.</p>
  <p>Output di <code>bellman_ford.cpp</code> sui due grafi:</p>
  <pre class="code-out" tabindex="0"><code>dist: 0 3 5 6 8   padre: -1 2 0 1 3
c'è un ciclo di peso negativo raggiungibile da 0</code></pre>
  <h3>Quanto costa</h3>
  <p>${m('n - 1')} giri, ognuno con ${m('m')} rilassamenti da ${m('Θ(1)')}, più il giro di controllo: ${m('Θ(n · m)')}. Su un
  grafo denso è ${m('Θ(n^3)')}: molto più lento di Dijkstra, ed è il prezzo dei pesi negativi.</p>
  ${box('errore', `<p>Il controllo <code>dist[a.u] != INF</code> non è un dettaglio. Se <code>dist[a.u]</code> vale
  <code>INF = numeric_limits&lt;int&gt;::max()</code>, la somma <code>INF + a.w</code> con un peso positivo va in
  <i>overflow</i> (comportamento indefinito; in pratica diventa un numero negativo), e un nodo irraggiungibile "migliora"
  un vicino.</p>`)}
  ${box('nota', `Se in un giro nessuna distanza cambia, non cambierà più niente: molte implementazioni escono subito con una
  variabile booleana. Il caso peggiore resta ${m('Θ(n · m)')}.`, 'Uscita anticipata')}
</section>

<section id="cammino">
  <h2>Ricostruire il cammino</h2>
  <p><code>padre[v]</code> dice da dove si arriva a ${m('v')} nel cammino minimo. Risalendo i padri da ${m('t')} si arriva alla
  sorgente (che ha <code>padre = -1</code>): il cammino esce al contrario, e lo si rovescia. Costa ${m('O(n)')}: il cammino ha
  al massimo ${m('n')} nodi.</p>
  <div data-mount="cammino-code"></div>
  <p>Output di <code>dijkstra.cpp</code> sul grafo della visualizzazione:</p>
  <pre class="code-out" tabindex="0"><code>dist[0] = 0   cammino: 0
dist[1] = 5   cammino: 0 2 1
dist[2] = 2   cammino: 0 2
dist[3] = 6   cammino: 0 2 1 3
dist[4] = 7   cammino: 0 2 1 4
dist[5] = 8   cammino: 0 2 1 4 5</code></pre>
  ${box('errore', `<p>Controlla <code>dist[t] == INF</code> prima di ricostruire: per un nodo irraggiungibile
  <code>padre[t]</code> è −1 e la funzione restituirebbe il "cammino" fatto solo da ${m('t')}.</p>`)}
</section>

<section id="floyd">
  <h2>Floyd-Warshall in breve</h2>
  <p>A volte servono le distanze fra <strong>tutte</strong> le coppie di nodi. Floyd-Warshall è programmazione dinamica su una
  matrice ${m('n × n')}: ${m('D[i][j]')} parte dal peso dell'arco (${m('∞')} se manca, 0 sulla diagonale) e al passo ${m('k')}
  diventa la distanza minima da ${m('i')} a ${m('j')} usando come nodi intermedi solo ${m('0, 1, …, k')}:</p>
  <p class="formula">${m('D[i][j] = min(D[i][j], D[i][k] + D[k][j])')}</p>
  <div data-mount="fw-code"></div>
  <p>Tre cicli annidati su ${m('n')}: ${m('Θ(n^3)')} tempo e ${m('Θ(n^2)')} spazio. Ammette pesi negativi (non cicli negativi:
  si riconoscono da un ${m('D[i][i] < 0')} alla fine). Il ciclo su ${m('k')} deve essere quello <strong>esterno</strong>.</p>
  <pre class="code-out" tabindex="0"><code>Prima (pesi degli archi):
    0    3  inf    7
  inf    0    2  inf
    5  inf    0    1
    2  inf  inf    0
Dopo (distanze minime):
    0    3    5    6
    5    0    2    3
    3    6    0    1
    2    5    7    0</code></pre>
  <p>Per esempio ${m('D[0][3]')} scende da 7 (l'arco diretto) a 6, passando per 1 e 2: ${m('3 + 2 + 1')}.</p>
</section>

<section id="confronto">
  <h2>Quale algoritmo?</h2>
  ${table({
    caption: 'Cammini minimi: quando usare cosa (n nodi, m archi, liste di adiacenza)',
    head: ['Situazione', 'Algoritmo', 'Tempo'],
    rows: [
      ['archi senza peso (o tutti uguali)', 'BFS', m('Θ(n + m)')],
      ['pesi ≥ 0, una sorgente', 'Dijkstra con heap', m('Θ((n + m) log n)')],
      ['pesi ≥ 0, grafo denso', 'Dijkstra con array', m('Θ(n^2)')],
      ['DAG, pesi qualsiasi', 'rilassamento in ordine topologico', m('Θ(n + m)')],
      ['pesi negativi, o cicli negativi da scoprire', 'Bellman-Ford', m('Θ(n · m)')],
      ['tutte le coppie', 'Floyd-Warshall', m('Θ(n^3)')],
    ],
  })}
  ${box('ricorda', `<p>Dijkstra: pesi non negativi, coda con priorità, ogni nodo fatto una volta. Bellman-Ford: pesi
  qualsiasi, ${m('n - 1')} giri su tutti gli archi, un giro in più per i cicli negativi. Floyd-Warshall: tutte le coppie,
  tre cicli con ${m('k')} fuori.</p>`)}
</section>

<section id="esame">
  <h2>All'esame</h2>
  <ol>
    <li><strong>Simulazione</strong>: «esegui Dijkstra da ${m('s')}: ordine di estrazione, <code>dist</code> e
    <code>padre</code> dopo ogni passo». Scrivi il grafo dell'esercizio nel campo degli archi qui sopra per controllarti.</li>
    <li><strong>Teoria</strong>: «perché Dijkstra non funziona con pesi negativi? Dai un controesempio» (quello di questa pagina
    ha quattro nodi: ricostruiscilo a memoria), «perché a Bellman-Ford bastano ${m('n - 1')} giri?».</li>
    <li><strong>Scelta</strong>: «quale algoritmo usi, e con che complessità, se…». La tabella qui sopra è la risposta.</li>
  </ol>
  ${box('esame', `<p>Nei giri di Bellman-Ford l'ordine degli archi conta per i valori intermedi, non per il risultato finale.
  Se l'esercizio non lo dà, dichiaralo prima di cominciare.</p>`)}
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;

      const dijkstraScene = (stage) =>
        new ASD.viz.GraphScene(stage, {
          view: { tagW: 34 },
          panels: [
            { id: 'pq', kind: 'chips', title: 'Coda con priorità <code>pq</code> (in cima la prima)' },
            { id: 'tab', kind: 'table', title: 'Vettori' },
          ],
        });

      ASD.mount(el, {
        'relax-code': (host) =>
          ASD.code(host, {
            file: 'rilassamento.cpp',
            code: `// rilassamento dell'arco (u, v) di peso w
if (dist[u] + w < dist[v]) {
    dist[v] = dist[u] + w;   // c'è un cammino migliore per v: passa da u
    padre[v] = u;
}`,
          }),
        rilassa: mountRilassa,
        dijkstra: (host) =>
          ASD.stepper(host, {
            id: 'dijkstra',
            title: 'Dijkstra passo per passo (sorgente 0)',
            code: { src: 'grafi/dijkstra', region: 'dijkstra' },
            input: G.input(G.esempi.dijkstra, { negHint: 'Per i pesi negativi c\'è Bellman-Ford, più sotto.' }),
            view: dijkstraScene,
            trace: traceDijkstra,
            counters: [
              { key: 'push', label: 'push' },
              { key: 'pop', label: 'pop' },
            ],
            legend: G.legend.cammini,
            validate: (g, frames) => {
              const res = frames[frames.length - 1].state.res;
              const want = G.check.shortest(g, 0);
              for (let v = 0; v < g.n; v++) if (res.dist[v] !== want[v]) return `dist[${v}] = ${res.dist[v]}, atteso ${want[v]}`;
              return null;
            },
          }),
        negativo: (host) =>
          ASD.stepper(host, {
            id: 'negativo',
            title: 'Dijkstra sul controesempio',
            compact: true,
            code: { src: 'grafi/dijkstra', region: 'dijkstra' },
            input: { value: G.esempi.negativo },
            view: dijkstraScene,
            trace: traceDijkstra,
            counters: [
              { key: 'push', label: 'push' },
              { key: 'pop', label: 'pop' },
            ],
            legend: G.legend.cammini,
            validate: (g, frames) => {
              const res = frames[frames.length - 1].state.res;
              const want = G.check.shortest(g, 0);
              return res.dist.some((d, v) => d !== want[v]) ? null : 'il controesempio non fa sbagliare Dijkstra';
            },
          }),
        bf: (host) =>
          ASD.stepper(host, {
            id: 'bellman-ford',
            title: 'Bellman-Ford passo per passo (sorgente 0)',
            code: { src: 'grafi/bellman_ford', region: 'bf' },
            input: G.input(G.esempi.bf, { negative: true, presets: [{ label: 'Ciclo negativo', value: G.esempi.bfCiclo }] }),
            view: (stage) =>
              new ASD.viz.GraphScene(stage, {
                view: { tagW: 34 },
                panels: [
                  { id: 'archi', kind: 'chips', title: 'Elenco degli archi, nell\'ordine' },
                  { id: 'tab', kind: 'table', title: 'Vettori' },
                ],
              }),
            trace: traceBF,
            counters: [
              { key: 'rilassamenti', label: 'rilassamenti' },
              { key: 'riusciti', label: 'riusciti' },
            ],
            legend: [
              { k: 'gr-gray', label: 'raggiunto' },
              { k: 'gr-new', label: 'distanza appena migliorata' },
              { k: 'gr-e-compare', label: 'arco che si rilassa' },
              { k: 'gr-e-new', label: 'rilassamento riuscito' },
              { k: 'gr-e-tree', label: 'padre[v] → v' },
              { k: 'gr-e-rejected', label: 'migliora ancora: ciclo negativo' },
            ],
            validate: (g, frames) => {
              const res = frames[frames.length - 1].state.res;
              const want = G.check.shortest(g, 0);
              if (want === null) return res.ok ? 'c\'è un ciclo negativo ma Bellman-Ford non lo ha visto' : null;
              if (!res.ok) return 'ciclo negativo segnalato per sbaglio';
              for (let v = 0; v < g.n; v++) if (res.dist[v] !== want[v]) return `dist[${v}] = ${res.dist[v]}, atteso ${want[v]}`;
              return null;
            },
          }),
        'cammino-code': (host) => ASD.code(host, { src: 'grafi/dijkstra', region: 'cammino' }),
        'fw-code': (host) => ASD.code(host, { src: 'grafi/floyd_warshall', region: 'fw' }),
        quiz: (host) =>
          ASD.quiz(host, [
            {
              q: 'Nel grafo della visualizzazione di Dijkstra (sorgente 0), in che ordine i nodi diventano <strong>fatti</strong>?',
              options: ['<code>0 2 1 3 4 5</code>', '<code>0 1 2 3 4 5</code>', '<code>0 2 4 1 3 5</code>', '<code>0 2 1 4 3 5</code>'],
              answer: 0,
              explain: `Escono per distanza crescente: 0 (0), 2 (2), 1 (5), 3 (6), 4 (7), 5 (8). La coppia (7, 1), rimasta
              in coda da prima che <code>dist[1]</code> scendesse a 5, esce prima di (7, 4) ma viene saltata perché 1 è già
              fatto.`,
            },
            {
              q: 'Perché Dijkstra non va usato con pesi negativi?',
              options: [
                '<code>priority_queue</code> non accetta numeri negativi',
                'dichiara definitiva la distanza di un nodo quando lo estrae, ma un arco negativo esaminato dopo potrebbe accorciarla',
                'con un peso negativo il ciclo <code>while</code> non termina mai',
                `diventa ${m('Θ(n^3)')}`,
              ],
              answer: 1,
              explain: `La correttezza si basa su «da un nodo non ancora fatto si possono solo aggiungere pesi». Con un arco
              negativo un cammino che passa per un nodo estratto dopo può costare meno: nel controesempio 1 diventa fatto con
              2, ma ${m('0 → 2 → 1')} costa 1. Con l'array <code>fatto</code> il programma termina, solo che sbaglia.`,
            },
            {
              q: 'Qual è la complessità di Bellman-Ford su un grafo con <var>n</var> nodi e <var>m</var> archi?',
              options: [m('Θ(n + m)'), m('Θ((n + m) log n)'), m('Θ(n · m)'), m('Θ(n^3)')],
              answer: 2,
              explain: `${m('n - 1')} giri, e in ogni giro si rilassano tutti gli ${m('m')} archi in tempo costante; il giro di
              controllo aggiunge ${m('m')}. Totale ${m('Θ(n · m)')}, che diventa ${m('Θ(n^3)')} solo se il grafo è denso.`,
            },
            {
              q: 'Dopo gli <var>n</var>&nbsp;−&nbsp;1 giri, il giro di controllo di Bellman-Ford trova un arco che migliora ancora una distanza. Che cosa vuol dire?',
              options: [
                'che servivano più giri: bisogna ripetere',
                'che c\'è un ciclo di peso negativo raggiungibile dalla sorgente',
                'che il grafo non è connesso',
                'che l\'ordine degli archi era sbagliato',
              ],
              answer: 1,
              explain: `Senza cicli negativi ogni cammino minimo ha al più ${m('n - 1')} archi, e dopo ${m('n - 1')} giri tutte
              le distanze sono definitive: nessun arco può più migliorare niente. Se uno ci riesce, esiste un cammino sempre più
              leggero, cioè un ciclo negativo.`,
            },
            {
              q: 'Gli archi non hanno peso e servono i cammini con meno archi da <var>s</var>. Quale algoritmo usi?',
              options: [
                `la BFS, ${m('Θ(n + m)')}`,
                `Dijkstra, ${m('Θ((n + m) log n)')}`,
                `Bellman-Ford, ${m('Θ(n · m)')}`,
                `Floyd-Warshall, ${m('Θ(n^3)')}`,
              ],
              answer: 0,
              explain: `Funzionerebbero anche gli altri (con tutti i pesi uguali a 1), ma la BFS dà lo stesso risultato in
              tempo lineare: la coda FIFO estrae già i nodi per distanza crescente.`,
            },
            {
              q: 'Con sorgente 0, <code>padre = [-1, 2, 0, 1, 1, 4]</code>. Qual è il cammino minimo da 0 a 5?',
              options: ['<code>0 2 1 4 5</code>', '<code>5 4 1 2 0</code>', '<code>0 1 4 5</code>', '<code>0 4 5</code>'],
              answer: 0,
              explain: `Si risale: ${m('padre[5] = 4')}, ${m('padre[4] = 1')}, ${m('padre[1] = 2')}, ${m('padre[2] = 0')},
              ${m('padre[0] = -1')}. Letto al contrario: 0, 2, 1, 4, 5. La seconda risposta è la risalita, ma il cammino va da 0 a 5.`,
            },
          ]),
      });
    },
  });

  /* ------------------------------------------------------------ Dijkstra */

  function traceDijkstra(g) {
    const t = new ASD.Tracer(['push', 'pop']);
    const n = g.n;
    const s = 0;
    const adj = G.adj(g);
    const dist = Array(n).fill(Infinity);
    const fatto = Array(n).fill(false);
    const padre = Array(n).fill(-1);
    const pq = [];
    let u = null;
    const neg = g.edges.some((e) => e[2] < 0);

    const snap = (o = {}) => {
      const nodes = {};
      for (let v = 0; v < n; v++) {
        const c = [];
        if (v === u && o.active) c.push('active');
        else if (fatto[v]) c.push('done');
        else if (dist[v] < Infinity) c.push('gray');
        if (o.newNode === v && !(v === u && o.active)) c.splice(0, c.length, 'new');
        if (v === s) c.push('src');
        nodes[v] = c;
      }
      const edges = {};
      for (let v = 0; v < n; v++) if (padre[v] !== -1) edges[G.key(padre[v], v, true)] = 'tree';
      if (o.e) {
        const k = G.key(o.e[0], o.e[1], true);
        edges[k] = [].concat(edges[k] || [], o.eCls || 'compare');
      }
      const tags = {};
      for (let v = 0; v < n; v++) tags[v] = 'd=' + fmt(dist[v]);
      const chg = o.chg || {};
      return G.snap(g, {
        nodes,
        edges,
        tags,
        tagCls: chg.dist != null ? { [chg.dist]: 'new' } : {},
        p: {
          pq: G.pqPanel(pq, (p) => fatto[p[1]] || p[0] > dist[p[1]], { just: o.pushed, note: 'coppie (distanza, nodo); barrate le copie vecchie' }),
          tab: {
            head: G.nodeHead(n, 'v'),
            rows: [
              { th: 'dist', cells: dist.map(fmt), cls: chg.dist != null ? { [chg.dist]: 'new' } : {} },
              { th: 'padre', cells: padre.map(String), cls: chg.padre != null ? { [chg.padre]: 'new' } : {} },
              { th: 'fatto', cells: fatto.map((b) => (b ? '1' : '0')), cls: chg.fatto != null ? { [chg.fatto]: 'new' } : {} },
            ],
            colCls: u != null && o.active ? { [u]: 'active' } : {},
          },
        },
      });
    };

    dist[s] = 0;
    t.step('init', `<code>dist[0] = 0</code>: la sorgente. Gli altri nodi partono da ∞, cioè non ancora raggiunti.`, { s }, snap({ chg: { dist: s } }));
    pq.push([0, s]);
    t.count('push');
    t.step('push-s', `<code>pq.push({0, 0})</code>: in coda la coppia (distanza 0, nodo 0).`, { s }, snap({ pushed: [0, s] }));
    while (pq.length) {
      const [d, x] = G.pqPop(pq);
      u = x;
      t.count('pop');
      t.step('top', `Estraggo la coppia in cima, quella con la distanza minore: <b>(d, u) = (${d}, ${u})</b>.`, { d, u }, snap({ active: true }));
      if (fatto[u]) {
        t.step('skip', `<code>fatto[${u}]</code> è vero: ${u} è già uscito, con distanza ${fmt(dist[u])}. Questa è una copia vecchia: <code>continue</code>.`, { d, u }, snap({ active: true }));
        u = null;
        continue;
      }
      t.step('skip', `<code>fatto[${u}]</code> è falso: è la prima volta che ${u} esce dalla coda. Si prosegue.`, { d, u }, snap({ active: true }));
      fatto[u] = true;
      t.step(
        'fatto',
        `<code>fatto[${u}] = true</code>: dist[${u}] = ${dist[u]} è definitiva${neg ? ' (o almeno, Dijkstra lo crede)' : ''}. Ora rilasso gli archi uscenti da ${u}.`,
        { d, u },
        snap({ active: true, chg: { fatto: u } })
      );
      for (const [v, w] of adj[u]) {
        const nd = dist[u] + w;
        if (nd < dist[v]) {
          const late = fatto[v];
          t.step(
            'relax',
            `Arco ${u}→${v} di peso ${w}: dist[${u}] + ${w} = ${nd} &lt; dist[${v}] = ${fmt(dist[v])}. ` +
              (late ? `Migliora, ma <b>${v} è già fatto</b>: con un peso negativo la distanza "definitiva" non lo era.` : 'C\'è un cammino migliore per ' + v + '.'),
            { u, v, w },
            snap({ active: true, e: [u, v] })
          );
          dist[v] = nd;
          t.step('update', `<code>dist[${v}] = ${nd}</code>.`, { u, v, w }, snap({ active: true, e: [u, v], eCls: 'new', chg: { dist: v }, newNode: v }));
          padre[v] = u;
          t.step('padre', `<code>padre[${v}] = ${u}</code>: il miglior cammino per ${v} ora arriva da ${u}.`, { u, v, w }, snap({ active: true, e: [u, v], eCls: 'new', chg: { padre: v }, newNode: v }));
          pq.push([nd, v]);
          t.count('push');
          const old = pq.filter((p) => p[1] === v && p[0] > nd);
          t.step(
            'push',
            `<code>pq.push({${nd}, ${v}})</code>.` +
              (late
                ? ` Quando questa coppia uscirà, ${v} sarà già fatto e verrà saltata: il miglioramento non arriverà ai nodi dopo ${v}.`
                : old.length
                ? ` La vecchia coppia (${old[0][0]}, ${v}) resta in coda: quando uscirà, ${v} sarà già fatto e verrà saltata.`
                : ''),
            { u, v, w },
            snap({ active: true, pushed: [nd, v], newNode: v })
          );
        } else {
          t.step(
            'relax',
            `Arco ${u}→${v} di peso ${w}: dist[${u}] + ${w} = ${nd} ≥ dist[${v}] = ${fmt(dist[v])}. Nessun miglioramento.`,
            { u, v, w },
            snap({ active: true, e: [u, v] })
          );
        }
      }
    }
    u = null;
    t.step('while', 'La coda è vuota: il ciclo finisce.', {}, snap());
    const fin = snap();
    fin.res = { dist: dist.slice(), padre: padre.slice() };
    let note;
    if (neg) {
      const want = G.check.shortest(g, 0);
      const wrong = want ? dist.map((d, v) => (d !== want[v] ? v : -1)).filter((v) => v >= 0) : [];
      note = want
        ? wrong.length
          ? `Fine, ma il risultato è <b>sbagliato</b>: ${wrong.map((v) => `dist[${v}] vale ${fmt(dist[v])}, la distanza vera è ${fmt(want[v])}`).join('; ')}. Con un arco negativo un nodo "fatto" poteva ancora migliorare.`
          : 'Fine. Con questi pesi negativi Dijkstra se l\'è cavata, ma è stata fortuna: non c\'è nessuna garanzia.'
        : 'Fine, ma il grafo ha un ciclo negativo: le distanze non sono definite.';
    } else {
      note = `Fine. dist = [${dist.map(fmt).join(', ')}]. ${t.c.push} push e ${t.c.pop} pop: ognuno costa ${m('O(log n)')}, per un totale di ${m('O((n + m) log n)')}. Gli archi blu formano l'albero dei cammini minimi.`;
    }
    t.step(null, note, {}, fin);
    return t.frames;
  }

  /* ------------------------------------------------------- Bellman-Ford */

  function traceBF(g) {
    const t = new ASD.Tracer(['rilassamenti', 'riusciti']);
    const n = g.n;
    const s = 0;
    const E = g.edges;
    const dist = Array(n).fill(Infinity);
    const padre = Array(n).fill(-1);
    let giro = 0;

    const snap = (o = {}) => {
      const nodes = {};
      for (let v = 0; v < n; v++) {
        const c = [];
        if (o.newNode === v) c.push('new');
        else if (dist[v] < Infinity) c.push('gray');
        if (v === s) c.push('src');
        nodes[v] = c;
      }
      const edges = {};
      for (let v = 0; v < n; v++) if (padre[v] !== -1) edges[G.key(padre[v], v, true)] = 'tree';
      if (o.i != null) {
        const k = G.key(E[o.i][0], E[o.i][1], true);
        edges[k] = [].concat(edges[k] || [], o.eCls || 'compare');
      }
      const tags = {};
      for (let v = 0; v < n; v++) tags[v] = 'd=' + fmt(dist[v]);
      const chg = o.chg || {};
      return G.snap(g, {
        nodes,
        edges,
        tags,
        tagCls: chg.dist != null ? { [chg.dist]: 'new' } : {},
        p: {
          archi: {
            items: E.map(([a, b, w], i) => ({ t: `${a}→${b} <small>${w}</small>`, cls: i === o.i ? o.chipCls || 'compare' : null })),
            note: o.fase === 'verifica' ? 'giro di controllo' : giro ? `giro ${giro} di ${n - 1}` : null,
          },
          tab: {
            head: G.nodeHead(n, 'v'),
            rows: [
              { th: 'dist', cells: dist.map(fmt), cls: chg.dist != null ? { [chg.dist]: 'new' } : {} },
              { th: 'padre', cells: padre.map(String), cls: chg.padre != null ? { [chg.padre]: 'new' } : {} },
            ],
          },
        },
      });
    };

    dist[s] = 0;
    t.step('init', `<code>dist[0] = 0</code>; tutti gli altri a ∞.`, { s }, snap({ chg: { dist: s } }));
    let changed = true;
    for (giro = 1; giro <= n - 1; giro++) {
      const prima = changed;
      t.step(
        'giro',
        `<b>Giro ${giro} di ${n - 1}</b>: rilasso tutti gli archi, nell'ordine dell'elenco.` +
          (giro > 1 ? (prima ? ` Dopo il giro ${giro - 1}: dist = [${dist.map(fmt).join(', ')}].` : ' Nel giro precedente nessuna distanza è cambiata: da qui in poi non cambierà più niente, ma questo codice continua lo stesso.') : ''),
        { giro },
        snap()
      );
      changed = false;
      E.forEach(([a, b, w], i) => {
        t.count('rilassamenti');
        if (dist[a] !== Infinity && dist[a] + w < dist[b]) {
          const nd = dist[a] + w;
          t.step('relax', `Arco ${a}→${b} (peso ${w}): dist[${a}] + ${w} = ${nd} &lt; dist[${b}] = ${fmt(dist[b])}: migliora.`, { giro, u: a, v: b }, snap({ i }));
          dist[b] = nd;
          t.count('riusciti');
          changed = true;
          t.step('update', `<code>dist[${b}] = ${nd}</code>.`, { giro, u: a, v: b }, snap({ i, eCls: 'new', chipCls: 'new', chg: { dist: b }, newNode: b }));
          padre[b] = a;
          t.step('padre', `<code>padre[${b}] = ${a}</code>.`, { giro, u: a, v: b }, snap({ i, eCls: 'new', chipCls: 'new', chg: { padre: b }, newNode: b }));
        } else if (dist[a] === Infinity) {
          t.step('relax', `Arco ${a}→${b}: dist[${a}] = ∞, ${a} non è ancora raggiunto. Per ora l'arco non serve.`, { giro, u: a, v: b }, snap({ i }));
        } else {
          t.step('relax', `Arco ${a}→${b} (peso ${w}): dist[${a}] + ${w} = ${dist[a] + w} ≥ dist[${b}] = ${fmt(dist[b])}: niente.`, { giro, u: a, v: b }, snap({ i }));
        }
      });
    }
    giro = 0;
    let ok = true;
    for (let i = 0; i < E.length; i++) {
      const [a, b, w] = E[i];
      if (dist[a] !== Infinity && dist[a] + w < dist[b]) {
        t.step('verifica', `Controllo ${a}→${b}: dist[${a}] + ${w} = ${dist[a] + w} &lt; dist[${b}] = ${fmt(dist[b])}. <b>Migliora ancora</b>, dopo ${n - 1} giri.`, { u: a, v: b }, snap({ i, eCls: 'swap', chipCls: 'swap', fase: 'verifica' }));
        t.step('negativo', `<code>return false</code>: esiste un ciclo di peso negativo raggiungibile da 0, e le distanze non sono definite.`, { u: a, v: b }, snap({ i, eCls: 'swap', chipCls: 'swap', fase: 'verifica' }));
        ok = false;
        break;
      }
      t.step('verifica', `Controllo ${a}→${b}: non migliora.`, { u: a, v: b }, snap({ i, fase: 'verifica' }));
    }
    if (ok) t.step('ok', `<code>return true</code>: nessun arco migliora più, quindi non ci sono cicli negativi raggiungibili e dist è definitiva.`, {}, snap({ fase: 'verifica' }));
    const fin = snap();
    fin.res = { dist: dist.slice(), padre: padre.slice(), ok };
    t.step(
      null,
      ok
        ? `Fine. dist = [${dist.map(fmt).join(', ')}]. ${t.c.rilassamenti} tentativi di rilassamento (${n - 1} giri per ${E.length} archi, più il controllo), ${t.c.riusciti} riusciti: ${m('Θ(n · m)')}.`
        : `Fine: ciclo negativo. Ogni giro in più farebbe scendere ancora le distanze dei nodi sul ciclo.`,
      {},
      fin
    );
    return t.frames;
  }

  /* --------------------------------------------- strumento: rilassa tu */

  function mountRilassa(host) {
    const g = G.esempi.bf;
    const n = g.n;
    const truth = G.check.shortest(g, 0);
    let dist;
    let padre;
    let tot;
    let utili;
    let last;
    const lab = h('div.lab.gr-lab');
    lab.append(h('div.lab-head', h('h3', { text: 'Rilassa tu' })));
    const body = h('div.lab-body.quadretti');
    const controls = h('div.lab-controls');
    const out = h('div.lab-out', { 'aria-live': 'polite' });
    lab.append(body, controls, out);
    host.append(lab);
    const view = new ASD.viz.GraphView(body, { onEdge: (k, e) => relax(e), tagW: 34, maxScale: 1.1 });
    const reset = h('button.btn.btn-sm', { type: 'button', text: 'Ricomincia' });
    reset.addEventListener('click', () => {
      start();
      draw();
    });
    controls.append(h('span.gr-hint', { html: 'Tocca un arco (o raggiungilo con <kbd>Tab</kbd> e premi <kbd>Invio</kbd>) per rilassarlo. In verde le distanze già giuste.' }), reset);

    function start() {
      dist = Array(n).fill(Infinity);
      dist[0] = 0;
      padre = Array(n).fill(-1);
      tot = 0;
      utili = 0;
      last = null;
    }

    function relax([u, v, w]) {
      tot++;
      if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
        last = { u, v, w, ok: true, prima: dist[v] };
        dist[v] = dist[u] + w;
        padre[v] = u;
        utili++;
      } else last = { u, v, w, ok: false };
      draw();
    }

    function draw() {
      const nodes = {};
      const tags = {};
      const tagCls = {};
      for (let v = 0; v < n; v++) {
        const c = [];
        if (dist[v] === truth[v]) c.push('done');
        if (v === 0) c.push('src');
        nodes[v] = c;
        tags[v] = 'd=' + fmt(dist[v]);
      }
      const edges = {};
      for (let v = 0; v < n; v++) if (padre[v] !== -1) edges[G.key(padre[v], v, true)] = 'tree';
      if (last) {
        const k = G.key(last.u, last.v, true);
        edges[k] = [].concat(edges[k] || [], last.ok ? 'new' : 'compare');
        if (last.ok) tagCls[last.v] = 'new';
      }
      view.render({ graph: g, nodes, edges, tags, tagCls });
      const all = dist.every((d, v) => d === truth[v]);
      let msg = '';
      if (last) {
        const { u, v, w } = last;
        if (last.ok) msg = `Arco ${u}→${v} (peso ${w}): ${m(`dist[${u}] + ${w} = ${dist[v]} < ${fmt(last.prima)}`)}, quindi <code>dist[${v}] = ${dist[v]}</code> e <code>padre[${v}] = ${u}</code>.`;
        else if (dist[u] === Infinity) msg = `Arco ${u}→${v}: <code>dist[${u}]</code> è ancora ∞, l'arco per ora non serve.`;
        else msg = `Arco ${u}→${v} (peso ${w}): ${m(`dist[${u}] + ${w} = ${dist[u] + w} >= dist[${v}] = ${fmt(dist[v])}`)}, niente da migliorare.`;
      }
      const conto = `Rilassamenti: <strong>${tot}</strong>, riusciti: ${utili}.`;
      const fine = all
        ? ` <strong>Tutte le distanze sono giuste</strong>: nessun arco può più migliorare niente. ${tot <= n - 1 ? 'Ordine perfetto: un rilassamento per ogni arco dell\'albero dei cammini minimi.' : `Il minimo era ${n - 1}, uno per arco dell'albero dei cammini minimi, rilassati nell'ordine giusto. Bellman-Ford non conosce quell'ordine e li prova tutti, giro dopo giro.`}`
        : ` Riesci a sistemare tutte le distanze con ${n - 1} rilassamenti?`;
      out.innerHTML = `<p>${msg ? msg + ' ' : ''}${conto}${fine}</p>`;
    }

    start();
    draw();
  }
})();
