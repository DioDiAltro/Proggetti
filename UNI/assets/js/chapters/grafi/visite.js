/* ASD a quadretti — capitolo "Visite BFS e DFS": visita in ampiezza con la
   coda e i colori, visita in profondità ricorsiva con i tempi d/f e la
   classificazione degli archi, componenti connesse, cicli, ordinamento
   topologico (DFS e Kahn). */
(function () {
  'use strict';

  const { m, box, table, h } = ASD;
  const G = ASD.grafi;

  ASD.chapter({
    id: 'visite',
    title: 'Visite BFS e DFS',
    lead:
      'Visitare un grafo vuol dire raggiungere tutti i nodi raggiungibili da un punto di partenza, senza girare in tondo. Ci sono due modi di farlo: a cerchi concentrici con una coda (BFS) o andando in fondo e tornando indietro (DFS). Quasi ogni algoritmo sui grafi è una di queste due visite con qualcosa in più.',
    minutes: 50,
    prereq: ['grafi-intro', 'pile-code', 'cpp-ricorsione'],
    goals: [
      'eseguire a mano BFS e DFS rispettando l\'ordine delle liste, con colori, distanze e tempi di scoperta e fine',
      `spiegare perché entrambe costano ${m('Θ(n + m)')} con le liste e ${m('Θ(n^2)')} con la matrice`,
      'classificare gli archi di una DFS e usarli per trovare un ciclo',
      'contare le componenti connesse e ordinare topologicamente un DAG in due modi',
    ],

    render(el) {
      el.innerHTML = `
<section id="idea">
  <h2>Visitare un grafo</h2>
  <p>Una visita parte da un nodo ${m('s')} (la sorgente) e raggiunge tutti i nodi collegati a ${m('s')}. L'idea è sempre la
  stessa: tieni da parte i nodi <em>scoperti ma non ancora esaminati</em> (la <strong>frangia</strong>); a ogni passo ne
  prendi uno e scopri i suoi vicini che non avevi ancora visto.</p>
  <p>Due dettagli decidono tutto:</p>
  <ul>
    <li><strong>quale nodo prendi dalla frangia</strong>: il più vecchio (una <strong>coda</strong>, FIFO) dà la visita in
    ampiezza, BFS (<i>breadth-first search</i>); il più recente (una <strong>pila</strong>, LIFO, o la ricorsione, che usa la
    pila delle chiamate) dà la visita in profondità, DFS (<i>depth-first search</i>);</li>
    <li><strong>segnare i nodi già visti</strong>: un grafo può avere cicli, e senza segni la visita ci girerebbe dentro per
    sempre.</li>
  </ul>
  <p>Per segnare i nodi il Cormen usa tre colori, e li useremo anche qui:</p>
  <dl>
    <dt>Bianco</dt><dd>non ancora scoperto.</dd>
    <dt>Grigio</dt><dd>scoperto, ma la visita non ha ancora finito con lui (è nella frangia, o la sua chiamata è aperta).</dd>
    <dt>Nero</dt><dd>finito: tutti i suoi vicini sono stati esaminati.</dd>
  </dl>
</section>

<section id="bfs">
  <h2>Visita in ampiezza (BFS)</h2>
  <p><strong>Idea.</strong> Come un sasso nello stagno: prima la sorgente, poi tutti i nodi a un arco di distanza, poi tutti
  quelli a due archi, e così via. La coda garantisce l'ordine: chi è stato scoperto prima viene esaminato prima.</p>
  <p>Nel riquadro qui sotto c'è il codice della funzione <code>bfs</code>, con la riga in esecuzione evidenziata. Tieni d'occhio
  la coda: i nodi entrano in fondo ed escono dalla testa, e in ogni momento contiene nodi di al massimo due "livelli"
  consecutivi.</p>
  <div data-mount="bfs" class="gr-host"></div>
  <h3>Che cosa calcola</h3>
  <ul>
    <li><code>dist[v]</code> è il <strong>numero minimo di archi</strong> da ${m('s')} a ${m('v')}: la BFS risolve i cammini
    minimi quando gli archi non hanno peso (${ASD.link('cammini-minimi', 'bfs', 'lo riprendiamo nei cammini minimi')}).</li>
    <li>Gli archi ${m('(padre[v], v)')} formano l'<strong>albero BFS</strong>: il cammino da ${m('s')} a ${m('v')} nell'albero
    è un cammino minimo. Si legge al contrario, risalendo i padri (funzione <code>cammino</code> in fondo a
    <code>bfs.cpp</code>).</li>
    <li>I nodi che restano bianchi, con <code>dist = -1</code>, non sono raggiungibili da ${m('s')}.</li>
  </ul>
  <h3>Quanto costa</h3>
  <p>Ogni nodo diventa grigio una volta sola, quindi entra ed esce dalla coda al massimo una volta: ${m('O(n)')} operazioni
  sulla coda, ognuna ${m('Θ(1)')}. Quando un nodo ${m('u')} esce, il <code>for</code> scorre <code>adj[u]</code> una volta
  sola. In totale si scorrono tutte le liste: ${m('Σ grado(u) = 2m')} controlli nel non orientato, ${m('m')} nell'orientato.
  Più l'inizializzazione dei vettori, ${m('Θ(n)')}:</p>
  <p class="formula">${m('T(n, m) = Θ(n) + Θ(m) = Θ(n + m)')}</p>
  ${box('ricorda', `<p>${m('Θ(n + m)')} vale con le liste di adiacenza. Con la matrice, per trovare i vicini di ${m('u')}
  bisogna leggere tutta la riga: ${m('n')} caselle per ognuno degli ${m('n')} nodi, ${m('Θ(n^2)')}.</p>`)}
  ${box('nota', `Il nero non serve all'algoritmo: il test è solo «bianco o no». Per questo nel codice di tutti i giorni i colori
  spariscono e si scrive <code>if (dist[v] == -1)</code>: un nodo con distanza ancora −1 è bianco. Il nero aiuta però a
  ragionare, e all'esame ti possono chiedere i colori dopo un certo passo.`, 'Senza colori')}
</section>

<section id="dfs">
  <h2>Visita in profondità (DFS)</h2>
  <p><strong>Idea.</strong> Come esplorare un labirinto con un gomitolo: vai avanti finché trovi strade nuove; quando sei in un
  vicolo cieco torni indietro fino all'ultimo bivio con una strada non provata. La ricorsione fa il lavoro del gomitolo: ogni
  chiamata aperta è un bivio a cui tornare.</p>
  <p>Il Cormen segna due tempi per ogni nodo, con un unico contatore <code>tempo</code> che avanza: ${m('d[u]')} quando
  ${m('u')} viene scoperto (diventa grigio) e ${m('f[u]')} quando finisce (diventa nero). Il ciclo in <code>dfs()</code>
  riparte da ogni nodo ancora bianco, quindi la DFS visita tutto il grafo e produce una <strong>foresta</strong>.</p>
  <div data-mount="dfs" class="gr-host"></div>
  <p>Il default è un grafo orientato con due alberi. Con il bottone <em>DAG</em> la stessa DFS gira sul grafo
  dell'${ASD.link('visite', 'topologico', 'ordinamento topologico')}: guarda il pannello "ordine di fine".</p>
  <h3>Tempi e parentesi</h3>
  <p>Gli intervalli ${m('[d[u], f[u]]')} si comportano come parentesi: due intervalli sono o uno dentro l'altro (e allora un
  nodo è discendente dell'altro nella foresta) o separati. Non si accavallano mai. Nell'esempio: ${m('[1, 6]')} contiene
  ${m('[2, 5]')}, che contiene ${m('[3, 4]')}; ${m('[7, 12]')} è separato da tutti e tre.</p>
  <h3>Classificare gli archi</h3>
  <p>Quando la DFS esamina l'arco ${m('(u, v)')}, il colore di ${m('v')} dice di che arco si tratta:</p>
  ${table({
    caption: 'Classificazione degli archi in una DFS (grafo orientato)',
    head: ['Colore di v', 'Tipo di arco', 'Che cosa vuol dire', 'Con i tempi'],
    rows: [
      ['bianco', 'dell\'albero (T, <i>tree</i>)', 'v si scopre adesso, da u', m('d[u] < d[v] < f[v] < f[u]')],
      ['grigio', 'all\'indietro (B, <i>back</i>)', 'v è un antenato ancora aperto: <strong>ciclo</strong>', m('d[v] < d[u] < f[u] < f[v]')],
      ['nero, con d[u] < d[v]', 'in avanti (F, <i>forward</i>)', 'v è un discendente già finito', m('d[u] < d[v] < f[v] < f[u]')],
      ['nero, con d[u] > d[v]', 'di attraversamento (C, <i>cross</i>)', 'v è finito prima che u fosse scoperto', m('d[v] < f[v] < d[u] < f[u]')],
    ],
  })}
  <p>Nel grafo non orientato restano solo archi dell'albero e all'indietro: un arco "in avanti" sarebbe già stato percorso nel
  verso opposto come arco dell'albero o all'indietro.</p>
  <h3>Quanto costa</h3>
  <p>Ogni nodo viene scoperto una volta (<code>dfsVisita</code> parte solo da nodi bianchi) e ogni lista viene scorsa una volta,
  quando il suo nodo è grigio. Come per la BFS: ${m('Θ(n + m)')} con le liste, ${m('Θ(n^2)')} con la matrice.</p>
  ${box('errore', `<p>La ricorsione usa la pila delle chiamate: su un grafo che è una lunga catena di ${m('10^6')} nodi la DFS
  ricorsiva fa ${m('10^6')} chiamate annidate e il programma può finire la memoria della pila (<i>stack overflow</i>). La
  versione iterativa usa una <code>stack&lt;int&gt;</code> esplicita al posto delle chiamate. All'esame la versione ricorsiva
  va benissimo.</p>`)}
  ${box('esame', `<p>Nelle simulazioni a mano la regola è: <strong>i vicini si esaminano nell'ordine delle liste</strong> (di
  solito crescente). Scrivi accanto a ogni nodo ${m('d/f')} come nel Cormen, e quando ti chiedono il tipo di un arco guarda il
  colore di ${m('v')} nel momento in cui l'arco viene esaminato, non alla fine.</p>`)}
</section>

<section id="componenti">
  <h2>Componenti connesse</h2>
  <p>In un grafo non orientato una visita che parte da ${m('u')} raggiunge esattamente la componente di ${m('u')}. Per trovarle
  tutte basta il ciclo esterno della DFS: ogni volta che trovi un nodo non ancora visitato, è l'inizio di una componente
  nuova. Il vettore <code>comp</code> fa anche da segno di "visitato" (−1 = bianco).</p>
  <div data-mount="comp-code"></div>
  <p>Prova tu: tocca un arco per toglierlo, oppure un arco tratteggiato per aggiungerlo. Le componenti si ricalcolano, e sotto
  c'è il conto degli archi che dice se il grafo ha un ciclo.</p>
  <div data-mount="comp"></div>
  ${box('esame', `<p>«Due nodi ${m('u')} e ${m('v')} sono collegati?» Una visita da ${m('u')}, ${m('O(n + m)')}. Se le
  domande sono tante, calcola una volta sola <code>comp</code> e poi rispondi in ${m('Θ(1)')} confrontando
  <code>comp[u] == comp[v]</code>.</p>`)}
</section>

<section id="cicli">
  <h2>Trovare un ciclo</h2>
  <p>La classificazione degli archi dà subito la regola per i grafi orientati: <strong>c'è un ciclo se e solo se la DFS trova
  un arco all'indietro</strong>, cioè un arco verso un nodo grigio. Il nodo grigio è un antenato ancora aperto: il cammino
  nell'albero da lui fino a ${m('u')}, più l'arco ${m('(u, v)')}, è un ciclo.</p>
  <div data-mount="ciclo-o"></div>
  <p>Nel grafo non orientato la regola cambia: il padre di ${m('u')} è sempre un vicino già visitato (l'arco da cui siamo
  arrivati), e non è un ciclo. Si passa quindi anche il padre, e un ciclo c'è se si trova un vicino già visitato
  <em>diverso dal padre</em>.</p>
  <div data-mount="ciclo-n"></div>
  <p>Output di <code>ciclo.cpp</code>: lo stesso elenco di archi letto nei due modi dà risposte diverse.</p>
  <pre class="code-out" tabindex="0"><code>Orientato     0->1, 1->2, 0->2, 2->3: ciclo? false
Non orientato 0-1, 1-2, 0-2, 2-3:     ciclo? true
Orientato     0->1, 1->2, 2->0, 2->3: ciclo? true
Non orientato 0-1, 0-2, 2-3:          ciclo? false</code></pre>
  ${box('errore', `<p>Usare la regola del grigio su un grafo non orientato: appena scendi da ${m('u')} a ${m('v')}, il primo
  vicino di ${m('v')} che guardi può essere ${m('u')}, che è grigio. La regola direbbe «ciclo» anche su un albero.</p>`)}
</section>

<section id="topologico">
  <h2>Ordinamento topologico</h2>
  <p>Un <strong>ordinamento topologico</strong> di un grafo orientato è una fila di tutti i nodi in cui ogni arco
  ${m('(u, v)')} va da sinistra a destra: ${m('u')} viene prima di ${m('v')}. È l'ordine in cui sostenere gli esami rispettando
  le propedeuticità, o in cui compilare i file rispettando le dipendenze. Esiste <strong>se e solo se il grafo è un
  DAG</strong>: con un ciclo ${m('u → … → u')}, ${m('u')} dovrebbe venire prima di se stesso. Di solito non è unico.</p>
  <h3>Con la DFS: tempi di fine decrescenti</h3>
  <p>In un DAG non ci sono archi all'indietro, quindi per ogni arco ${m('(u, v)')} vale ${m('f[v] < f[u]')}: ${m('v')} finisce
  prima di ${m('u')}. Basta allora mettere in fila i nodi per tempo di fine <em>decrescente</em>. In C++ si aggiunge ogni nodo a
  un vettore quando finisce e alla fine si rovescia il vettore.</p>
  <div data-mount="topo-dfs"></div>
  <h3>Algoritmo di Kahn: togliere le sorgenti</h3>
  <p>Un nodo senza archi entranti (grado entrante 0) può andare per primo. Lo metti in fila, togli i suoi archi uscenti, e
  altri nodi possono restare senza archi entranti. Si contano i gradi entranti una volta, poi una coda tiene i nodi pronti.</p>
  <div data-mount="kahn" class="gr-host"></div>
  <p>Output di <code>topologico.cpp</code>: due ordini diversi, entrambi validi.</p>
  <pre class="code-out" tabindex="0"><code>DFS (fine decrescente): 5 6 3 1 4 0 2
Kahn (gradi entranti):  3 5 0 1 6 2 4
Con l'arco 2 -> 3 Kahn ordina solo 2 nodi su 7: c'è un ciclo.</code></pre>
  ${box('ricorda', `<p>Entrambi gli algoritmi costano ${m('Θ(n + m)')}. Kahn ha un vantaggio: se il grafo ha un ciclo se ne
  accorge da solo, perché i nodi del ciclo non arrivano mai a grado entrante 0 e l'ordine finisce corto.</p>`)}
</section>

<section id="costi">
  <h2>Quanto costano</h2>
  ${table({
    caption: 'Costi con le liste di adiacenza (n nodi, m archi); con la matrice ogni Θ(n + m) diventa Θ(n²)',
    head: ['Algoritmo', 'Tempo', 'Spazio in più', 'Struttura'],
    rows: [
      ['BFS', m('Θ(n + m)'), m('Θ(n)'), 'coda (FIFO)'],
      ['DFS', m('Θ(n + m)'), m('Θ(n)'), 'pila delle chiamate (o <code>stack</code>)'],
      ['Componenti connesse', m('Θ(n + m)'), m('Θ(n)'), 'DFS o BFS da ogni nodo bianco'],
      ['C\'è un ciclo?', m('O(n + m)'), m('Θ(n)'), 'DFS con i colori'],
      ['Ordinamento topologico', m('Θ(n + m)'), m('Θ(n)'), 'DFS (tempi di fine) o coda (Kahn)'],
    ],
  })}
</section>

<section id="esame">
  <h2>All'esame</h2>
  <ol>
    <li><strong>Simulazione</strong>: «esegui una BFS/DFS dal nodo 0 e scrivi l'ordine di visita, ${m('d')} (e ${m('f')}), i
    padri». Usa le visualizzazioni qui sopra scrivendo il grafo dell'esercizio nel campo degli archi, nello stesso ordine delle
    liste.</li>
    <li><strong>Proprietà</strong>: «perché la BFS trova i cammini con meno archi?», «quando un arco è all'indietro?».</li>
    <li><strong>Progetto</strong>: «scrivi un algoritmo che dice se un grafo è connesso / ha un ciclo / quanti nodi stanno a
    distanza ${m('k')} da ${m('s')}». Quasi sempre è una visita con una riga in più: dillo, e la complessità è quella della
    visita.</li>
  </ol>
  ${box('esame', `<p>Se un esercizio dà il grafo come disegno senza liste, dichiara l'ordine che usi per i vicini (di solito
  crescente) prima di simulare: la visita è determinata solo con un ordine fissato, e il correttore deve poterti seguire.</p>`)}
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        bfs: (host) =>
          ASD.stepper(host, {
            id: 'bfs',
            title: 'BFS passo per passo (sorgente 0)',
            code: { src: 'grafi/bfs', region: 'bfs' },
            input: G.input(G.esempi.bfs, {
              presets: [{ label: 'Non connesso', value: Object.assign({}, G.esempi.bfs, { edges: G.esempi.bfs.edges.filter((e) => e[1] !== 6) }) }],
            }),
            view: (stage) =>
              new ASD.viz.GraphScene(stage, {
                view: { tagW: 30 },
                panels: [
                  { id: 'coda', kind: 'cells', title: 'Coda <code>q</code> (si estrae dalla testa)' },
                  { id: 'tab', kind: 'table', title: 'Vettori' },
                ],
              }),
            trace: traceBFS,
            counters: [
              { key: 'estratti', label: 'nodi estratti' },
              { key: 'controlli', label: 'vicini esaminati' },
            ],
            legend: G.legend.visita,
            validate: (g, frames) => {
              const res = frames[frames.length - 1].state.res;
              const want = G.check.bfsDist(g, 0);
              if (res.dist.join(',') !== want.join(',')) return `dist = [${res.dist}], atteso [${want}]`;
              for (let v = 0; v < g.n; v++) {
                const p = res.padre[v];
                if (p !== -1 && res.dist[v] !== res.dist[p] + 1) return `padre[${v}] = ${p} non è a distanza ${res.dist[v] - 1}`;
              }
              return null;
            },
          }),
        dfs: (host) =>
          ASD.stepper(host, {
            id: 'dfs',
            title: 'DFS passo per passo',
            code: { src: 'grafi/dfs', region: 'dfs' },
            input: G.input(G.esempi.dfs, { presets: [{ label: 'DAG', value: G.esempi.dag }] }),
            view: (stage) =>
              new ASD.viz.GraphScene(stage, {
                view: { tagW: 36 },
                panels: [
                  { id: 'pila', kind: 'stack', title: 'Chiamate aperte (cima in alto)' },
                  { id: 'fine', kind: 'chips', title: 'Ordine di fine (f crescente)' },
                ],
              }),
            trace: traceDFS,
            counters: [{ key: 'archi', label: 'archi esaminati' }],
            legend: G.legend.dfs,
            validate: validateDFS,
          }),
        'comp-code': (host) => ASD.code(host, { src: 'grafi/componenti', region: 'componenti' }),
        comp: mountComponenti,
        'ciclo-o': (host) => ASD.code(host, { src: 'grafi/ciclo', region: 'orientato' }),
        'ciclo-n': (host) => ASD.code(host, { src: 'grafi/ciclo', region: 'non-orientato' }),
        'topo-dfs': (host) => ASD.code(host, { src: 'grafi/topologico', region: 'dfs' }),
        kahn: (host) =>
          ASD.stepper(host, {
            id: 'kahn',
            title: 'Algoritmo di Kahn passo per passo',
            code: { src: 'grafi/topologico', region: 'kahn' },
            input: G.input(G.esempi.dag, {
              presets: [{ label: 'Con un ciclo', value: Object.assign({}, G.esempi.dag, { edges: G.esempi.dag.edges.concat([[2, 3]]) }) }],
            }),
            view: (stage) =>
              new ASD.viz.GraphScene(stage, {
                panels: [
                  { id: 'tab', kind: 'table', title: 'Gradi entranti' },
                  { id: 'coda', kind: 'cells', title: 'Coda <code>q</code> dei nodi pronti' },
                  { id: 'ordine', kind: 'chips', title: '<code>ordine</code>' },
                ],
              }),
            trace: traceKahn,
            counters: [{ key: 'archi', label: 'archi tolti' }],
            legend: [
              { k: 'gr-active', label: 'u estratto' },
              { k: 'gr-new', label: 'pronto: in coda' },
              { k: 'gr-done', label: 'già in ordine' },
              { k: 'gr-e-compare', label: 'arco che si conta o si toglie' },
              { k: 'gr-e-ghost', label: 'arco tolto' },
            ],
            validate: (g, frames) => {
              const ordine = frames[frames.length - 1].state.res.ordine;
              if (G.check.hasCycle(g)) return ordine.length < g.n ? null : 'grafo con ciclo, ma l\'ordine contiene tutti i nodi';
              return G.check.topo(ordine, g);
            },
          }),
        quiz: (host) =>
          ASD.quiz(host, [
            {
              q: 'Su quale struttura dati si basa la BFS, e perché?',
              options: [
                'una pila: esamina per primo il nodo scoperto più di recente',
                'una coda: esamina i nodi nell\'ordine in cui li ha scoperti, quindi per distanza crescente da s',
                'una coda con priorità ordinata per grado',
              ],
              answer: 1,
              explain: `La coda (FIFO) fa uscire prima i nodi scoperti prima: tutti quelli a distanza ${m('k')} escono prima di
              quelli a distanza ${m('k + 1')}. È questo che rende <code>dist</code> il numero minimo di archi. Con una pila
              (o con la ricorsione) si ottiene la DFS.`,
            },
            {
              q: 'Grafo non orientato con liste <code>adj[0] = {1, 2}</code>, <code>adj[1] = {0, 3}</code>, <code>adj[2] = {0, 3}</code>, <code>adj[3] = {1, 2, 4}</code>, <code>adj[4] = {3}</code>. In che ordine la <strong>DFS</strong> da 0 scopre i nodi?',
              options: ['<code>0 1 2 3 4</code>', '<code>0 1 3 2 4</code>', '<code>0 2 3 1 4</code>', '<code>0 1 3 4 2</code>'],
              answer: 1,
              explain: `Da 0 il primo vicino è 1; da 1 il primo vicino bianco è 3; da 3 il primo bianco è 2 (1 è grigio). Da 2
              i vicini 0 e 3 sono grigi: 2 finisce, si torna a 3 e si scopre 4. Ordine 0, 1, 3, 2, 4. La BFS invece darebbe
              0, 1, 2, 3, 4.`,
            },
            {
              q: 'Quanto costa una DFS se il grafo è rappresentato con la <strong>matrice</strong> di adiacenza?',
              options: [m('Θ(n + m)'), m('Θ(n^2)'), m('Θ(m log n)'), m('Θ(n)')],
              answer: 1,
              explain: `Ogni nodo viene esaminato una volta, ma per trovare i suoi vicini bisogna leggere la sua riga intera,
              ${m('n')} caselle: ${m('n · n = Θ(n^2)')}, anche se gli archi sono pochi.`,
            },
            {
              q: 'In una DFS su un grafo orientato esamini l\'arco (u, v) e v è <strong>grigio</strong>. Che cosa puoi concludere?',
              options: [
                'il grafo ha un ciclo',
                'v è un discendente di u',
                'l\'arco è di attraversamento',
                'u è la radice dell\'albero',
              ],
              answer: 0,
              explain: `Un nodo grigio ha la chiamata ancora aperta: è un antenato di ${m('u')} sulla pila. Il cammino
              nell'albero da ${m('v')} a ${m('u')}, più l'arco ${m('(u, v)')}, chiude un ciclo. È un arco all'indietro.`,
            },
            {
              q: 'Quali sono ordinamenti topologici del DAG con archi 3→0, 3→1, 5→1, 5→6, 0→2, 1→2, 1→4, 6→4?',
              options: ['<code>3 5 0 1 6 2 4</code>', '<code>5 3 1 0 6 4 2</code>', '<code>0 3 5 1 6 2 4</code>', '<code>3 0 2 5 1 4 6</code>'],
              answer: [0, 1],
              explain: `Basta controllare ogni arco. Le prime due file li rispettano tutti (la prima è quella di Kahn). La terza
              mette 0 prima di 3, ma c'è l'arco 3→0. La quarta mette 4 prima di 6, ma c'è 6→4. Un DAG ha spesso più ordinamenti
              topologici validi.`,
            },
            {
              q: 'Un grafo non orientato ha 10 nodi, 3 componenti connesse e 9 archi. Ha un ciclo?',
              options: [
                'no: 9 archi sono pochi',
                `sì: senza cicli avrebbe esattamente ${m('n - c = 7')} archi`,
                'non si può dire senza il disegno',
              ],
              answer: 1,
              explain: `Una foresta con ${m('c')} componenti (alberi) ha ${m('n - c')} archi, perché ogni albero ne ha uno meno
              dei suoi nodi. Qui ${m('10 - 3 = 7')}: con 9 archi ce ne sono 2 in più, e ognuno chiude un ciclo.`,
            },
          ]),
      });
    },
  });

  /* ---------------------------------------------------------------- BFS */

  const COL = { B: 'B', G: 'G', N: 'N' };

  function traceBFS(g) {
    const t = new ASD.Tracer(['estratti', 'controlli']);
    const n = g.n;
    const s = 0;
    const adj = G.adj(g);
    const colore = Array(n).fill('B');
    const dist = Array(n).fill(-1);
    const padre = Array(n).fill(-1);
    const q = [];
    let u = null;

    const snap = (o = {}) => {
      const nodes = {};
      for (let v = 0; v < n; v++) {
        const c = [];
        if (v === u && colore[v] === 'G') c.push('active');
        else if (colore[v] === 'G') c.push('gray');
        else if (colore[v] === 'N') c.push('black');
        if (v === s) c.push('src');
        nodes[v] = c;
      }
      const edges = {};
      for (let v = 0; v < n; v++) if (padre[v] !== -1) edges[G.key(padre[v], v, false)] = 'tree';
      if (o.e) edges[G.key(o.e[0], o.e[1], false)] = [].concat(edges[G.key(o.e[0], o.e[1], false)] || [], 'compare');
      const tags = {};
      for (let v = 0; v < n; v++) if (dist[v] !== -1) tags[v] = 'd=' + dist[v];
      const cls = { colore: {}, dist: {}, padre: {} };
      if (o.chg) cls[o.chg[0]][o.chg[1]] = 'new';
      const st = G.snap(g, {
        nodes,
        edges,
        tags,
        tagCls: o.chg && o.chg[0] === 'dist' ? { [o.chg[1]]: 'new' } : {},
        p: {
          coda: G.queueCells(q, { marks: o.qNew != null ? { [q.length - 1]: 'new' } : {} }),
          tab: {
            head: G.nodeHead(n, 'v'),
            rows: [
              { th: 'colore', cells: colore.map((c) => COL[c]), cls: cls.colore },
              { th: 'dist', cells: dist.map(String), cls: cls.dist },
              { th: 'padre', cells: padre.map(String), cls: cls.padre },
            ],
            colCls: u != null ? { [u]: 'active' } : {},
            note: undefined,
          },
        },
      });
      st.p.tab.note = 'B bianco, G grigio, N nero; −1 = non raggiunto';
      return st;
    };

    colore[s] = 'G';
    t.step('init', `La sorgente è <b>s = 0</b>: <code>colore[0] = GRIGIO</code>, cioè scoperta. Gli altri nodi sono bianchi.`, { s }, snap({ chg: ['colore', s] }));
    dist[s] = 0;
    t.step('init-d', `<code>dist[0] = 0</code>: la sorgente è a zero archi da se stessa.`, { s }, snap({ chg: ['dist', s] }));
    q.push(s);
    t.step('push-s', `<code>q.push(0)</code>: la coda contiene solo la sorgente.`, { s }, snap({ qNew: true }));
    while (q.length) {
      u = q.shift();
      t.count('estratti');
      t.step(
        'front',
        `La coda non è vuota: estraggo dalla testa <b>u = ${u}</b> (dist ${dist[u]}). Esamino i suoi vicini nell'ordine di <code>adj[${u}]</code> = [${adj[u].join(', ')}].`,
        { u },
        snap()
      );
      for (const v of adj[u]) {
        t.count('controlli');
        if (colore[v] === 'B') {
          t.step('check', `Vicino <b>v = ${v}</b>: è BIANCO, mai visto. Lo scopro passando da ${u}.`, { u, v }, snap({ e: [u, v] }));
          colore[v] = 'G';
          t.step('gray', `<code>colore[${v}] = GRIGIO</code>: ${v} è scoperto.`, { u, v }, snap({ e: [u, v], chg: ['colore', v] }));
          dist[v] = dist[u] + 1;
          t.step('dist', `<code>dist[${v}] = dist[${u}] + 1 = ${dist[v]}</code>: un arco più in là di ${u}.`, { u, v }, snap({ e: [u, v], chg: ['dist', v] }));
          padre[v] = u;
          t.step('padre', `<code>padre[${v}] = ${u}</code>: l'arco ${u}–${v} entra nell'albero BFS.`, { u, v }, snap({ e: [u, v], chg: ['padre', v] }));
          q.push(v);
          t.step('push', `<code>q.push(${v})</code>: ${v} va in fondo alla coda e aspetta il suo turno.`, { u, v }, snap({ qNew: true }));
        } else {
          const why = colore[v] === 'G' ? 'GRIGIO: è già stato scoperto ed è in coda' : 'NERO: è già stato visitato del tutto';
          t.step('check', `Vicino <b>v = ${v}</b>: è ${why}. Niente da fare.`, { u, v }, snap({ e: [u, v] }));
        }
      }
      colore[u] = 'N';
      t.step('black', `Tutti i vicini di ${u} sono stati esaminati: <code>colore[${u}] = NERO</code>.`, { u }, snap({ chg: ['colore', u] }));
    }
    u = null;
    t.step('while', `La coda è vuota: il ciclo <code>while</code> finisce.`, {}, snap());
    const bianchi = colore.map((c, v) => (c === 'B' ? v : -1)).filter((v) => v >= 0);
    const fin = snap();
    fin.res = { dist: dist.slice(), padre: padre.slice() };
    t.step(
      null,
      `Fine. Ogni nodo raggiunto è entrato in coda una volta (${t.c.estratti} estrazioni) e ogni lista è stata letta una volta (${t.c.controlli} vicini esaminati ${g.directed ? '= m' : '= 2m'}): ${m('Θ(n + m)')}. Gli archi blu sono l'albero BFS; <code>dist</code> è il numero minimo di archi da 0.` +
        (bianchi.length ? ` ${G.list(bianchi.map(String))} ${bianchi.length === 1 ? 'è rimasto bianco: non è raggiungibile' : 'sono rimasti bianchi: non sono raggiungibili'} da 0 (dist = −1).` : ''),
      {},
      fin
    );
    return t.frames;
  }

  /* ---------------------------------------------------------------- DFS */

  const LETTER = { tree: 'T', back: 'B', forward: 'F', cross: 'C' };

  function traceDFS(g) {
    const t = new ASD.Tracer(['archi']);
    const n = g.n;
    const adj = G.adj(g);
    const colore = Array(n).fill('B');
    const d = Array(n).fill(0);
    const f = Array(n).fill(0);
    const padre = Array(n).fill(-1);
    let tempo = 0;
    const tipo = {};
    const pila = [];
    const fine = [];

    const snap = (o = {}) => {
      const top = pila.length ? pila[pila.length - 1] : null;
      const nodes = {};
      for (let v = 0; v < n; v++) {
        if (v === top && colore[v] === 'G') nodes[v] = 'active';
        else if (colore[v] === 'G') nodes[v] = 'gray';
        else if (colore[v] === 'N') nodes[v] = 'black';
      }
      const edges = {};
      const eTags = {};
      for (const [k, ty] of Object.entries(tipo)) {
        edges[k] = ty;
        eTags[k] = LETTER[ty];
      }
      if (o.e) {
        const k = G.key(o.e[0], o.e[1], true);
        edges[k] = [].concat(edges[k] || [], 'compare');
      }
      const tags = {};
      for (let v = 0; v < n; v++) if (d[v]) tags[v] = f[v] ? `${d[v]}/${f[v]}` : `${d[v]}/`;
      return G.snap(g, {
        nodes,
        edges,
        eTags,
        tags,
        tagCls: o.newTag != null ? { [o.newTag]: 'new' } : {},
        p: {
          pila: { items: pila.map((x, i) => ({ t: `dfsVisita(${x})`, cls: i === pila.length - 1 ? 'active' : null })), empty: 'nessuna chiamata aperta' },
          fine: { items: fine.map((x, i) => ({ t: `${x}<small>f=${f[x]}</small>`, cls: o.newTag === x && i === fine.length - 1 ? 'new' : null })), empty: 'nessun nodo finito' },
        },
      });
    };

    function visita(u) {
      pila.push(u);
      colore[u] = 'G';
      t.step('gray', `Entro in <code>dfsVisita(${u})</code>: <code>colore[${u}] = GRIGIO</code>. La chiamata di ${u} resta aperta sulla pila finché ${u} non finisce.`, { u, tempo }, snap());
      d[u] = ++tempo;
      t.step('d', `<code>d[${u}] = ++tempo = ${tempo}</code>: è il tempo di scoperta di ${u}. Ora esamino <code>adj[${u}]</code> = [${adj[u].join(', ')}].`, { u, tempo }, snap({ newTag: u }));
      for (const v of adj[u]) {
        t.count('archi');
        const k = G.key(u, v, true);
        if (colore[v] === 'B') {
          tipo[k] = 'tree';
          t.step('check', `Arco ${u}→${v}: ${v} è BIANCO. È un arco <b>dell'albero</b> (T): la visita scende in ${v}.`, { u, v, tempo }, snap({ e: [u, v] }));
          padre[v] = u;
          t.step('padre', `<code>padre[${v}] = ${u}</code>.`, { u, v, tempo }, snap({ e: [u, v] }));
          t.step('call', `Chiamo <code>dfsVisita(${v})</code>. La chiamata di ${u} si ferma qui e aspetta sulla pila.`, { u, v, tempo }, snap({ e: [u, v] }));
          visita(v);
          t.step('call', `<code>dfsVisita(${v})</code> è finita: torno in <code>dfsVisita(${u})</code>, dove ero rimasto, e passo al vicino successivo.`, { u, v, tempo }, snap());
        } else if (colore[v] === 'G') {
          tipo[k] = 'back';
          t.step(
            'check',
            `Arco ${u}→${v}: ${v} è GRIGIO, cioè la sua chiamata è ancora aperta: ${v} è un antenato di ${u}. Arco <b>all'indietro</b> (B): il grafo ha un ciclo.`,
            { u, v, tempo },
            snap({ e: [u, v] })
          );
        } else if (d[u] < d[v]) {
          tipo[k] = 'forward';
          t.step('check', `Arco ${u}→${v}: ${v} è NERO e d[${u}] = ${d[u]} &lt; d[${v}] = ${d[v]}: ${v} è un discendente di ${u}, già finito. Arco <b>in avanti</b> (F).`, { u, v, tempo }, snap({ e: [u, v] }));
        } else {
          tipo[k] = 'cross';
          t.step(
            'check',
            `Arco ${u}→${v}: ${v} è NERO e d[${v}] = ${d[v]} &lt; d[${u}] = ${d[u]}: ${v} è finito prima che ${u} venisse scoperto. Arco <b>di attraversamento</b> (C).`,
            { u, v, tempo },
            snap({ e: [u, v] })
          );
        }
      }
      colore[u] = 'N';
      t.step('black', `Tutti i vicini di ${u} sono stati esaminati: <code>colore[${u}] = NERO</code>.`, { u, tempo }, snap());
      f[u] = ++tempo;
      fine.push(u);
      t.step('f', `<code>f[${u}] = ++tempo = ${tempo}</code>: tempo di fine di ${u}. La chiamata <code>dfsVisita(${u})</code> ritorna.`, { u, tempo }, snap({ newTag: u }));
      pila.pop();
    }

    for (let u = 0; u < n; u++) {
      if (colore[u] === 'B') {
        t.step('root', `Ciclo in <code>dfs()</code>: <b>u = ${u}</b> è BIANCO, quindi parte da qui ${u === 0 ? 'il primo albero' : 'un nuovo albero'} della foresta: chiamo <code>dfsVisita(${u})</code>.`, { u, tempo }, snap());
        visita(u);
      } else {
        t.step('root', `Ciclo in <code>dfs()</code>: u = ${u} è già NERO, visitato da un albero precedente. Si passa oltre.`, { u, tempo }, snap());
      }
    }
    const back = Object.values(tipo).includes('back');
    const desc = fine.slice().reverse();
    const fin = snap();
    fin.res = { d: d.slice(), f: f.slice(), padre: padre.slice(), tipo: Object.assign({}, tipo) };
    t.step(
      null,
      `Fine: ${m(`2n = ${2 * n}`)} tempi, uno di scoperta e uno di fine per nodo, e ${t.c.archi} archi esaminati, ${m('Θ(n + m)')}. ` +
        (back
          ? 'C\'è almeno un arco all\'indietro (B): il grafo ha un ciclo, quindi non ha un ordinamento topologico.'
          : `Nessun arco all'indietro: il grafo è un DAG. Per tempo di fine decrescente i nodi danno un ordinamento topologico: <b>${desc.join(' ')}</b>.`),
      { tempo },
      fin
    );
    return t.frames;
  }

  function validateDFS(g, frames) {
    const { d, f, padre, tipo } = frames[frames.length - 1].state.res;
    const n = g.n;
    const times = d.concat(f).sort((a, b) => a - b);
    for (let i = 0; i < 2 * n; i++) if (times[i] !== i + 1) return 'i tempi non sono 1..2n';
    for (let v = 0; v < n; v++) {
      if (!(d[v] < f[v])) return `d[${v}] >= f[${v}]`;
      const p = padre[v];
      if (p !== -1 && !(d[p] < d[v] && f[v] < f[p])) return `padre[${v}] = ${p} non contiene ${v}`;
    }
    for (const [u, v] of g.edges) {
      const isBack = d[v] <= d[u] && f[u] <= f[v];
      if (isBack !== (tipo[G.key(u, v, true)] === 'back')) return `classificazione dell'arco ${u}→${v} incoerente`;
      if (!isBack && !(f[v] < f[u])) return `arco ${u}→${v}: f[${v}] dovrebbe essere minore di f[${u}]`;
    }
    return null;
  }

  /* --------------------------------------------------------------- Kahn */

  function traceKahn(g) {
    const t = new ASD.Tracer(['archi']);
    const n = g.n;
    const adj = G.adj(g);
    const entranti = Array(n).fill(0);
    const q = [];
    const ordine = [];
    const tolti = new Set();
    let u = null;

    const snap = (o = {}) => {
      const nodes = {};
      for (let v = 0; v < n; v++) {
        if (v === u) nodes[v] = 'active';
        else if (ordine.includes(v)) nodes[v] = 'done';
        else if (q.includes(v)) nodes[v] = 'key';
      }
      const edges = {};
      for (const k of tolti) edges[k] = 'ghost';
      if (o.e) edges[G.key(o.e[0], o.e[1], true)] = 'compare';
      return G.snap(g, {
        nodes,
        edges,
        p: {
          tab: {
            head: G.nodeHead(n, 'v'),
            rows: [{ th: 'entranti', cells: entranti.map(String), cls: o.chg != null ? { [o.chg]: 'new' } : {} }],
            colCls: u != null ? { [u]: 'active' } : {},
          },
          coda: G.queueCells(q, { marks: o.qNew ? { [q.length - 1]: 'new' } : {} }),
          ordine: { items: ordine.map((x, i) => ({ t: String(x), cls: o.oNew && i === ordine.length - 1 ? 'new' : 'done' })), empty: 'vuoto' },
        },
      });
    };

    for (let x = 0; x < n; x++) {
      for (const v of adj[x]) {
        entranti[v]++;
        t.step('conta', `Arco ${x}→${v}: <code>entranti[${v}]++</code>, ora ${entranti[v]}.`, { u: x, v }, snap({ e: [x, v], chg: v }));
      }
    }
    for (let x = 0; x < n; x++) {
      if (entranti[x] === 0) {
        q.push(x);
        t.step('sorgenti', `<code>entranti[${x}] == 0</code>: nessun arco entra in ${x}, può andare per primo: <code>q.push(${x})</code>.`, { u: x }, snap({ qNew: true }));
      } else {
        t.step('sorgenti', `<code>entranti[${x}] = ${entranti[x]}</code>: ${x} deve aspettare che i suoi predecessori siano in fila.`, { u: x }, snap());
      }
    }
    while (q.length) {
      u = q.shift();
      t.step('estrai', `Estraggo <b>u = ${u}</b> dalla coda: non ha archi entranti rimasti, quindi tutti i suoi predecessori sono già in <code>ordine</code>.`, { u }, snap());
      ordine.push(u);
      t.step('ordine', `<code>ordine.push_back(${u})</code>: ordine = [${ordine.join(', ')}].`, { u }, snap({ oNew: true }));
      for (const v of adj[u]) {
        entranti[v]--;
        t.count('archi');
        tolti.add(G.key(u, v, true));
        const r = entranti[v];
        t.step(
          'togli',
          `Tolgo l'arco ${u}→${v}: <code>entranti[${v}]--</code>, ora ${r}.` + (r ? ` ${v} ha ancora ${r} arc${r === 1 ? 'o' : 'hi'} entrant${r === 1 ? 'e' : 'i'}.` : ''),
          { u, v },
          snap({ e: [u, v], chg: v })
        );
        if (r === 0) {
          q.push(v);
          t.step('push', `<code>entranti[${v}] == 0</code>: ${v} è pronto, <code>q.push(${v})</code>.`, { u, v }, snap({ qNew: true }));
        }
      }
    }
    u = null;
    t.step('while', 'La coda è vuota: il ciclo finisce.', {}, snap());
    const fin = snap();
    fin.res = { ordine: ordine.slice() };
    const resto = [];
    for (let v = 0; v < n; v++) if (!ordine.includes(v)) resto.push(v);
    t.step(
      'fine',
      ordine.length === n
        ? `Restituisco ordine = [${ordine.join(', ')}]: tutti gli ${n} nodi, e ogni arco va da sinistra a destra. Ogni arco è stato contato una volta e tolto una volta: ${m('Θ(n + m)')}.`
        : `Restituisco solo ${ordine.length} nodi su ${n}. ${G.list(resto.map(String))} hanno ancora archi entranti che non spariranno mai: stanno su un ciclo, o dopo un ciclo. Il grafo non è un DAG.`,
      {},
      fin
    );
    return t.frames;
  }

  /* -------------------------------------------- componenti: strumento */

  function mountComponenti(host) {
    const n = 8;
    const pos = [[40, 40], [150, 40], [95, 125], [40, 205], [235, 45], [335, 95], [215, 195], [325, 210]];
    const tutti = [[0, 1], [0, 2], [1, 2], [2, 3], [4, 5], [6, 7], [1, 4], [3, 6], [5, 7]];
    const on = tutti.map((_, i) => i < 6);
    const lab = h('div.lab.gr-lab');
    lab.append(h('div.lab-head', h('h3', { text: 'Componenti connesse: togli e aggiungi archi' })));
    const body = h('div.lab-body.quadretti');
    const out = h('div.lab-out', { 'aria-live': 'polite' });
    const controls = h('div.lab-controls');
    lab.append(body, controls, out);
    host.append(lab);
    const view = new ASD.viz.GraphView(body, {
      onEdge: (k) => {
        const i = tutti.findIndex(([u, v]) => G.key(u, v, false) === k);
        on[i] = !on[i];
        draw(`${on[i] ? 'Aggiunto' : 'Tolto'} l'arco ${tutti[i][0]}–${tutti[i][1]}.`);
      },
      tagW: 24,
      maxScale: 1.1,
    });
    const reset = h('button.btn.btn-sm', { type: 'button', text: 'Ripristina' });
    reset.addEventListener('click', () => {
      tutti.forEach((_, i) => (on[i] = i < 6));
      draw('');
    });
    controls.append(h('span.gr-hint', { text: 'Archi tratteggiati: assenti. Un tocco (o Invio) su un arco lo aggiunge o lo toglie.' }), reset);

    function draw(msg) {
      const edges = tutti.filter((_, i) => on[i]);
      const { comp, count } = G.check.components(n, edges);
      const nodes = {};
      const tags = {};
      for (let v = 0; v < n; v++) {
        nodes[v] = 'c' + ((comp[v] % 6) + 1);
        tags[v] = 'C' + comp[v];
      }
      const eCls = {};
      tutti.forEach(([u, v], i) => (eCls[G.key(u, v, false)] = on[i] ? null : 'ghost'));
      view.render({ graph: { n, directed: false, pos, edges: tutti }, nodes, edges: eCls, tags });
      const groups = [];
      for (let c = 0; c < count; c++) groups.push('{' + comp.map((x, v) => (x === c ? v : -1)).filter((v) => v >= 0).join(', ') + '}');
      const mm = edges.length;
      const minimo = n - count;
      const cicli =
        mm === minimo
          ? `${m(`m = ${mm} = n - c = ${n} - ${count}`)}: il grafo è una <strong>foresta</strong>, senza cicli.`
          : `${m(`m = ${mm} > n - c = ${minimo}`)}: ${mm - minimo === 1 ? 'c\'è un arco in più' : `ci sono ${mm - minimo} archi in più`} rispetto a una foresta, quindi <strong>c'è almeno un ciclo</strong>.`;
      out.innerHTML =
        `<p>${msg ? msg + ' ' : ''}<strong>${count} component${count === 1 ? 'e' : 'i'}</strong>: ${groups.join(' ')}. ` +
        `Il vettore del programma è <code>comp = [${comp.join(', ')}]</code>. ${cicli}</p>`;
    }
    draw('');
  }
})();
