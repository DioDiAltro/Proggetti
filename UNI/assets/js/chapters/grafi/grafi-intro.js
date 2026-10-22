/* ASD a quadretti — capitolo "Rappresentare un grafo": vocabolario, quanti
   archi può avere un grafo, matrice e liste di adiacenza (con un pannello che
   le tiene sincronizzate al disegno), costruzione in C++ da un elenco di archi,
   tabella dei costi. */
(function () {
  'use strict';

  const { m, box, table, h } = ASD;
  const G = ASD.grafi;

  ASD.chapter({
    id: 'grafi-intro',
    title: 'Rappresentare un grafo',
    lead:
      'Un grafo è fatto di nodi collegati da archi: incroci e strade, pagine e link, esami e propedeuticità. Prima di qualsiasi algoritmo bisogna decidere come tenerlo in memoria, e la scelta tra matrice e liste di adiacenza cambia il costo di tutto quello che viene dopo.',
    minutes: 30,
    prereq: ['cpp-stl', 'cx-notazioni'],
    goals: [
      'usare il vocabolario giusto: orientato, pesato, grado, cammino, ciclo, connesso, DAG, albero',
      `sapere quanti archi può avere un grafo e cosa vuol dire sparso o denso (${m('m = O(n^2)')})`,
      'costruire in C++ matrice e liste di adiacenza a partire da un elenco di archi',
      'dire quanto costano spazio, «(u, v) è un arco?» e «scorri i vicini di u» nelle due rappresentazioni, e scegliere quella giusta',
    ],

    render(el) {
      el.innerHTML = `
<section id="nodi-archi">
  <h2>Nodi e archi</h2>
  <p>Un grafo ${m('G = (V, E)')} è un insieme ${m('V')} di <strong>nodi</strong> (o vertici, <i>vertices</i>) e un insieme
  ${m('E')} di <strong>archi</strong> (<i>edges</i>) che collegano coppie di nodi. Si scrive ${m('n = |V|')} per il numero di
  nodi e ${m('m = |E|')} per il numero di archi: le complessità di tutta questa parte sono funzioni di ${m('n')} e ${m('m')}.</p>
  <dl>
    <dt>Non orientato</dt>
    <dd>un arco è una coppia <em>non ordinata</em> ${m('{u, v}')}: si percorre nei due sensi. Esempio: due persone che si
    conoscono.</dd>
    <dt>Orientato (diretto, <i>directed</i>)</dt>
    <dd>un arco è una coppia <em>ordinata</em> ${m('(u, v)')}, da ${m('u')} a ${m('v')}: si disegna con una freccia. Esempio:
    «per sostenere Algoritmi devi aver passato Programmazione».</dd>
    <dt>Pesato</dt>
    <dd>ogni arco ha un numero, il <strong>peso</strong> ${m('w(u, v)')}: una lunghezza, un costo, un tempo.</dd>
    <dt>Adiacenti</dt>
    <dd>${m('u')} e ${m('v')} sono adiacenti (vicini) se c'è l'arco tra loro.</dd>
    <dt>Grado</dt>
    <dd>nel non orientato, ${m('grado(v)')} è il numero di archi che toccano ${m('v')}. Nell'orientato si distinguono il
    <strong>grado uscente</strong> (<i>out-degree</i>, archi che partono da ${m('v')}) e il <strong>grado entrante</strong>
    (<i>in-degree</i>, archi che arrivano in ${m('v')}).</dd>
  </dl>
  <p>Una conseguenza che all'esame torna spesso: ogni arco ha due estremi, quindi sommando i gradi si conta ogni arco due
  volte.</p>
  <p class="formula">${m('Σ_{v} grado(v) = 2m')} &nbsp;&nbsp; (orientato: ${m('Σ_{v} uscente(v) = Σ_{v} entrante(v) = m')})</p>
  <div data-mount="galleria"></div>
  ${box('nota', `I libri numerano i nodi da 1 a ${m('n')}, oppure li chiamano con le lettere (${m('s, t, x, y, z')} nel
  Cormen). In C++ un nodo è l'indice di un <code>vector</code>, quindi qui i nodi vanno da <code>0</code> a <code>n-1</code>.
  Se all'esame il grafo ha i nodi da 1, o dichiari i vettori di dimensione <code>n+1</code> e non usi la casella 0, o togli 1 a
  ogni nodo.`, 'Nodi da 0')}
</section>

<section id="cammini-cicli">
  <h2>Cammini, cicli, connessione</h2>
  <dl>
    <dt>Cammino (<i>path</i>)</dt>
    <dd>una sequenza di nodi ${m('v_0, v_1, …, v_k')} in cui ogni coppia consecutiva è un arco. La sua <strong>lunghezza</strong>
    è il numero di archi, ${m('k')} (nei grafi pesati di solito si intende la somma dei pesi). È <strong>semplice</strong> se
    non ripete nodi.</dd>
    <dt>Ciclo</dt>
    <dd>un cammino di almeno un arco che torna al nodo di partenza (${m('v_0 = v_k')}). Nel non orientato servono almeno tre
    archi distinti: andare e tornare sullo stesso arco non è un ciclo.</dd>
    <dt>DAG</dt>
    <dd>un grafo orientato senza cicli (<i>directed acyclic graph</i>). Sono i grafi delle dipendenze e hanno un ordinamento
    topologico (${ASD.link('visite', 'topologico', 'capitolo sulle visite')}).</dd>
    <dt>Connesso</dt>
    <dd>(non orientato) da ogni nodo c'è un cammino verso ogni altro. Se non lo è, si spezza in <strong>componenti
    connesse</strong>: i pezzi più grandi che sono connessi.</dd>
    <dt>Fortemente connesso</dt>
    <dd>(orientato) per ogni coppia ${m('u, v')} c'è un cammino da ${m('u')} a ${m('v')} <em>e</em> uno da ${m('v')} a
    ${m('u')}. Le frecce contano: un grafo orientato può essere "tutto d'un pezzo" a vederlo e non essere fortemente
    connesso.</dd>
    <dt>Albero</dt>
    <dd>un grafo non orientato connesso e senza cicli. Una <strong>foresta</strong> è un grafo senza cicli: ogni sua
    componente è un albero.</dd>
  </dl>
  ${box('ricorda', `<p>Un albero con ${m('n')} nodi ha esattamente ${m('n - 1')} archi. Se ne togli uno si sconnette; se ne
  aggiungi uno si forma un ciclo. Più in generale, un grafo non orientato con ${m('c')} componenti ha almeno ${m('n - c')}
  archi, ed è senza cicli esattamente quando ne ha ${m('n - c')}.</p>`)}
</section>

<section id="quanti-archi">
  <h2>Quanti archi può avere un grafo</h2>
  <p>Senza cappi (archi da un nodo a se stesso) e senza archi ripetuti, ogni coppia di nodi dà al massimo un arco:</p>
  <p class="formula">${m('m <= n(n-1)/2')} (non orientato) &nbsp;&nbsp; ${m('m <= n(n-1)')} (orientato) &nbsp;&nbsp; quindi ${m('m = O(n^2)')}</p>
  <p>È il motivo per cui i libri scrivono ${m('|E| <= |V|^2')}. Un grafo è <strong>denso</strong> quando ${m('m')} è
  dell'ordine di ${m('n^2')}, <strong>sparso</strong> quando è molto più piccolo, tipicamente ${m('m = O(n)')}: in una rete
  stradale ogni incrocio ha pochi vicini, anche se gli incroci sono milioni.</p>
  <p>Due conseguenze che serviranno nei prossimi capitoli:</p>
  <ul>
    <li>se il grafo è connesso, ${m('m >= n - 1')}, quindi ${m('Θ(n + m) = Θ(m)')};</li>
    <li>${m('m <= n^2')} implica ${m('log m <= 2 log n')}: scrivere ${m('O(m log m)')} o ${m('O(m log n)')} è la stessa cosa.</li>
  </ul>
</section>

<section id="rappresentazioni">
  <h2>Matrice e liste di adiacenza</h2>
  <p>Le rappresentazioni in memoria sono due.</p>
  <ul>
    <li><strong>Matrice di adiacenza</strong>: una tabella ${m('n × n')} con ${m('M[u][v] = 1')} se c'è l'arco da ${m('u')} a
    ${m('v')}, 0 altrimenti. Nel non orientato è simmetrica. Nel pesato la casella contiene il peso, e dove l'arco manca un
    valore speciale (∞, oppure 0 se i pesi sono tutti positivi). Occupa ${m('n^2')} caselle anche se gli archi sono pochi.</li>
    <li><strong>Liste di adiacenza</strong>: per ogni nodo ${m('u')}, l'elenco dei suoi vicini. In C++ è un
    <code>vector&lt;vector&lt;int&gt;&gt; adj(n)</code>: <code>adj[u]</code> contiene i vicini di ${m('u')}. Occupa ${m('n')}
    liste più un elemento per arco (due nel non orientato, perché l'arco sta nella lista di entrambi gli estremi).</li>
  </ul>
  <p>Prova tu: tocca un nodo, un arco, una casella della matrice o un elemento di una lista. Lo stesso pezzo si accende nelle
  tre viste. Con <em>Modifica</em> attivo, un tocco su una casella aggiunge o toglie l'arco.</p>
  <div data-mount="rep"></div>
  ${box('errore', `<p>Nel grafo orientato l'arco ${m('(u, v)')} sta <em>solo</em> nella lista di ${m('u')}. Per sapere chi
  entra in ${m('v')} (il grado entrante) le liste non bastano: bisogna scorrerle tutte, oppure costruire a parte le liste dei
  predecessori.</p>`)}
</section>

<section id="cpp">
  <h2>Costruire il grafo in C++</h2>
  <p>Nei programmi d'esempio il grafo non si legge da tastiera: è scritto nel <code>main</code> come <strong>elenco di
  archi</strong>, una coppia per arco. Poi una funzione lo trasforma nella rappresentazione che serve.</p>
  <div data-mount="main"></div>
  <p>Ecco come nascono le liste di adiacenza. Per ogni arco ${m('{u, v}')} si aggiunge ${m('v')} in fondo alla lista di
  ${m('u')} e, visto che il grafo non è orientato, ${m('u')} in fondo alla lista di ${m('v')}. L'ordine dei vicini in ogni
  lista è quello in cui gli archi compaiono nell'elenco: conta, perché BFS e DFS esaminano i vicini proprio in quell'ordine.</p>
  <div data-mount="costruisci" class="gr-host"></div>
  <p>La matrice si costruisce allo stesso modo, ma prima va creata tutta, ${m('n × n')} caselle a zero:</p>
  <div data-mount="matrice"></div>
  <h3>Grafi pesati</h3>
  <p>Con i pesi, ogni elemento di una lista diventa una coppia (vicino, peso): <code>pair&lt;int, int&gt;</code>, con
  <code>.first</code> il vicino e <code>.second</code> il peso. Con il <code>for</code> sugli elementi e i <i>structured
  bindings</i> del C++17 si scrive <code>for (auto [v, w] : adj[u])</code>.</p>
  <div data-mount="pesato"></div>
  <p>Output del programma completo:</p>
  <pre class="code-out" tabindex="0"><code>Matrice di adiacenza (6 x 6):
    0 1 2 3 4 5
 0: 0 1 0 1 1 0
 1: 1 0 1 0 1 0
 2: 0 1 0 0 0 1
 3: 1 0 0 0 1 0
 4: 1 1 0 1 0 1
 5: 0 0 1 0 1 0

Liste di adiacenza:
 adj[0]: 1 3 4   (grado 3)
 adj[1]: 0 2 4   (grado 3)
 adj[2]: 1 5   (grado 2)
 adj[3]: 0 4   (grado 2)
 adj[4]: 0 1 3 5   (grado 4)
 adj[5]: 4 2   (grado 2)
Somma dei gradi = 16 = 2 * 8 archi

(1, 4) è un arco? sì / sì
(2, 3) è un arco? no / no

Liste pesate, coppie (vicino, peso):
 adj[0]: (1, 4) (3, 2) (4, 5)
 adj[1]: (0, 4) (2, 3) (4, 1)
 adj[2]: (1, 3) (5, 7)
 adj[3]: (0, 2) (4, 6)
 adj[4]: (0, 5) (1, 1) (3, 6) (5, 2)
 adj[5]: (4, 2) (2, 7)</code></pre>
  <p>Nota <code>adj[5]: 4 2</code>: l'arco ${m('{4, 5}')} viene prima di ${m('{2, 5}')} nell'elenco, quindi 4 entra per primo
  nella lista di 5.</p>
  ${box('errore', `<p>Due sviste classiche. <strong>Dimenticare <code>adj[v].push_back(u)</code></strong> nel grafo non
  orientato: il grafo diventa orientato senza che tu lo voglia, e una visita che parte da ${m('v')} non vede più ${m('u')}.
  <strong>Non dare la dimensione</strong>: con <code>vector&lt;vector&lt;int&gt;&gt; adj;</code> il vettore è vuoto e
  <code>adj[u]</code> è fuori dai limiti (comportamento indefinito). Serve <code>adj(n)</code>, oppure
  <code>adj.assign(n, {})</code>.</p>`)}
</section>

<section id="costi">
  <h2>Quanto costa</h2>
  ${table({
    caption: 'Costi delle due rappresentazioni (n nodi, m archi)',
    head: ['Operazione', 'Matrice di adiacenza', 'Liste di adiacenza'],
    rows: [
      ['Spazio', m('Θ(n^2)'), m('Θ(n + m)')],
      ['«(u, v) è un arco?»', m('Θ(1)'), `${m('O(grado(u))')}: si scorre <code>adj[u]</code>`],
      ['Scorrere i vicini di u', `${m('Θ(n)')}: tutta la riga`, m('Θ(grado(u))')],
      ['Scorrere tutti gli archi (una visita)', m('Θ(n^2)'), m('Θ(n + m)')],
      ['Aggiungere un arco', m('Θ(1)'), `${m('Θ(1)')} (<code>push_back</code>, ammortizzato)`],
      ['Togliere l\'arco (u, v)', m('Θ(1)'), `${m('O(grado(u))')} per trovarlo (più ${m('O(grado(v))')} se non orientato)`],
      ['Grado (uscente) di u', `${m('Θ(n)')}: contare la riga`, `${m('Θ(1)')}: <code>adj[u].size()</code>`],
      ['Grado entrante di v (orientato)', `${m('Θ(n)')}: contare la colonna`, `${m('Θ(n + m)')}: tutte le liste`],
    ],
  })}
  <p>La riga che pesa di più è la quarta. Quasi tutti gli algoritmi sui grafi (visite, cammini minimi, alberi di copertura)
  scorrono i vicini di ogni nodo. Con le liste il totale è la somma dei gradi, ${m('Θ(n + m)')}; con la matrice ogni nodo
  paga una riga intera, ${m('Θ(n^2)')}, anche quando gli archi sono pochi.</p>
  ${box('ricorda', `<p>Grafo sparso, o algoritmo che scorre i vicini: <strong>liste</strong>. Grafo denso, o tante domande
  «(u, v) è un arco?»: <strong>matrice</strong>. In C++, nel dubbio, liste: <code>vector&lt;vector&lt;int&gt;&gt;</code>.</p>`)}
  ${box('esame', `<p>Quando dai la complessità di un algoritmo su grafi, dichiara la rappresentazione. «La BFS costa
  ${m('Θ(n + m)')}» è vero con le liste; con la matrice di adiacenza la stessa BFS costa ${m('Θ(n^2)')}. Le due cose
  coincidono solo sui grafi densi.</p>`)}
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        galleria: mountGalleria,
        rep: mountRep,
        main: (host) => ASD.code(host, { src: 'grafi/rappresentazioni', region: 'main' }),
        costruisci: (host) =>
          ASD.stepper(host, {
            id: 'liste',
            title: 'Dall\'elenco degli archi alle liste',
            code: { src: 'grafi/rappresentazioni', region: 'liste' },
            input: G.input(G.esempi.liste),
            view: (stage) =>
              new ASD.viz.GraphScene(stage, {
                panels: [
                  { id: 'archi', kind: 'chips', title: 'Elenco degli archi (dal <code>main</code>)' },
                  { id: 'adj', kind: 'rows', title: 'Liste <code>adj</code>' },
                ],
              }),
            trace: traceListe,
            counters: [{ key: 'push', label: 'push_back' }],
            legend: [
              { k: 'gr-e-compare', label: 'arco che si sta leggendo' },
              { k: 'gr-e-ghost', label: 'non ancora letto' },
              { k: 'key', label: 'appena aggiunto' },
            ],
            validate: (g, frames) => {
              const last = frames[frames.length - 1].state.p.adj.rows;
              const want = G.adj(g);
              for (let u = 0; u < g.n; u++) {
                const got = last[u].items.map((x) => Number(x.t)).join(',');
                if (got !== want[u].join(',')) return `adj[${u}] = [${got}], atteso [${want[u].join(',')}]`;
              }
              return null;
            },
          }),
        matrice: (host) => ASD.code(host, { src: 'grafi/rappresentazioni', region: 'matrice' }),
        pesato: (host) => ASD.code(host, { src: 'grafi/rappresentazioni', region: 'pesato' }),
        quiz: (host) =>
          ASD.quiz(host, [
            {
              q: 'Un grafo non orientato ha 7 nodi con gradi 3, 3, 2, 2, 2, 1, 1. Quanti archi ha?',
              options: ['7', '14', '12', '6'],
              answer: 0,
              explain: `La somma dei gradi è ${m('3+3+2+2+2+1+1 = 14')} e ogni arco viene contato due volte, una per
              estremo: ${m('m = 14/2 = 7')}. Se la somma dei gradi fosse dispari, il grafo non potrebbe esistere.`,
            },
            {
              q: 'Quanto spazio occupa la <strong>matrice</strong> di adiacenza di un grafo con <var>n</var> nodi e <var>m</var> archi?',
              options: [m('Θ(n^2)'), m('Θ(n + m)'), m('Θ(m)'), m('Θ(n · m)')],
              answer: 0,
              explain: `La matrice ha sempre ${m('n × n')} caselle, qualunque sia il numero di archi. Sono le liste a occupare
              ${m('Θ(n + m)')}: ${m('n')} liste più un elemento per arco (due nel non orientato).`,
            },
            {
              q: 'Con le <strong>liste</strong> di adiacenza, quanto costa rispondere a «(u, v) è un arco?»',
              options: [m('Θ(1)'), m('O(grado(u))'), m('Θ(n^2)'), m('Θ(log n)')],
              answer: 1,
              explain: `Bisogna scorrere <code>adj[u]</code> cercando ${m('v')}: nel caso peggiore (arco assente) si leggono
              tutti i ${m('grado(u)')} elementi. Con la matrice basterebbe la casella ${m('M[u][v]')}, ${m('Θ(1)')}.`,
            },
            {
              q: 'Quali di queste frasi sono vere per un <strong>albero</strong> con <var>n</var> nodi?',
              options: [
                `ha esattamente ${m('n - 1')} archi`,
                'è connesso',
                'ha almeno un ciclo',
                'togliendo un arco qualsiasi si sconnette',
              ],
              answer: [0, 1, 3],
              explain: `Un albero è connesso e senza cicli, e ha ${m('n - 1')} archi: è il minimo per restare connesso, quindi
              ogni arco è indispensabile e toglierne uno lo spezza in due.`,
            },
            {
              q: 'Che cosa stampa questo frammento?',
              code: `vector<vector<int>> adj(3);
vector<pair<int, int>> archi = {{0, 1}, {2, 0}, {1, 2}};
for (auto [u, v] : archi) {
    adj[u].push_back(v);
    adj[v].push_back(u);
}
for (int x : adj[0]) cout << x << ' ';`,
              options: ['<code>1 2</code>', '<code>2 1</code>', '<code>1</code>', '<code>0 1 2</code>'],
              answer: 0,
              explain: `Il primo arco ${m('{0, 1}')} mette 1 in <code>adj[0]</code>. Il secondo, ${m('{2, 0}')}, esegue
              <code>adj[2].push_back(0)</code> e poi <code>adj[0].push_back(2)</code>. Il terzo non tocca <code>adj[0]</code>.
              Quindi <code>adj[0] = [1, 2]</code>: l'ordine è quello degli archi nell'elenco.`,
            },
            {
              q: 'Un grafo orientato ha 1000 nodi e 3000 archi. Quale rappresentazione conviene per una visita?',
              options: [
                `la matrice: ${m('Θ(1)')} per ogni arco`,
                `le liste: ${m('Θ(n + m)')}, circa 4000 passi contro circa un milione`,
                'è indifferente: la visita costa uguale',
              ],
              answer: 1,
              explain: `Il grafo è sparso (${m('m = 3n')}). Con le liste la visita costa ${m('Θ(n + m)')}, qui circa 4000
              operazioni; con la matrice ${m('Θ(n^2)')}, un milione di caselle lette quasi tutte inutilmente.`,
            },
          ]),
      });
    },
  });

  /* ----------------------------------------------------- galleria di esempi */

  function mountGalleria(host) {
    const cards = [
      {
        t: 'Non orientato, connesso.',
        d: 'Da ogni nodo si arriva a ogni altro.',
        g: { n: 4, directed: false, pos: [[20, 20], [120, 20], [120, 100], [20, 100]], edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]] },
      },
      {
        t: 'Non connesso.',
        d: 'Due componenti connesse: {0, 1, 2} e {3, 4}.',
        g: { n: 5, directed: false, pos: [[20, 25], [100, 25], [60, 100], [150, 25], [150, 100]], edges: [[0, 1], [1, 2], [2, 0], [3, 4]] },
        nodes: { 0: 'c1', 1: 'c1', 2: 'c1', 3: 'c2', 4: 'c2' },
      },
      {
        t: 'Fortemente connesso.',
        d: 'Seguendo le frecce si va da ogni nodo a ogni altro.',
        g: { n: 4, directed: true, pos: [[20, 20], [120, 20], [120, 100], [20, 100]], edges: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]] },
      },
      {
        t: 'DAG.',
        d: 'Orientato e senza cicli: le frecce vanno tutte "in avanti".',
        g: { n: 4, directed: true, pos: [[15, 60], [80, 15], [80, 105], [145, 60]], edges: [[0, 1], [0, 2], [1, 2], [1, 3], [2, 3]] },
      },
      {
        t: 'Albero.',
        d: 'Connesso e senza cicli: 5 nodi, 4 archi.',
        g: { n: 5, directed: false, pos: [[80, 15], [35, 65], [125, 65], [10, 115], [60, 115]], edges: [[0, 1], [0, 2], [1, 3], [1, 4]] },
      },
      {
        t: 'Pesato.',
        d: 'Ogni arco ha un peso; il cammino 0–1–2 pesa 6 e batte l\'arco diretto, 7.',
        g: { n: 3, directed: false, pos: [[20, 95], [80, 20], [140, 95]], edges: [[0, 1, 4], [1, 2, 2], [0, 2, 7]] },
      },
    ];
    const grid = h('div.gr-gallery');
    for (const c of cards) {
      const pic = h('div.gr-card-pic.quadretti');
      const fig = h('figure.gr-card', pic, h('figcaption', h('strong', c.t), ' ', c.d));
      grid.append(fig);
      const v = new ASD.viz.GraphView(pic, { r: 14, maxScale: 1.15, ariaLabel: c.t + ' ' + c.d });
      v.render({ graph: c.g, nodes: c.nodes || {} });
    }
    host.append(grid);
  }

  /* ------------------------------------- pannello: disegno, matrice, liste */

  function mountRep(host) {
    const base = G.esempi.intro;
    const n = base.n;
    let edges = base.edges.map((e) => e.slice());
    let directed = false;
    let weighted = false;
    let edit = false;
    let sel = null; // { kind: 'node', u } | { kind: 'cell', u, v }
    let msg = '';

    const uid = ASD.uid('gr-rep');
    const lab = h('div.lab.gr-lab.gr-rep');
    lab.append(h('div.lab-head', h('h3', { text: 'Tre modi di guardare lo stesso grafo' })));
    const body = h('div.lab-body.quadretti.gr-rep-body');
    const drawHost = h('div.gr-rep-draw');
    const matWrap = h('div.gr-mat-wrap');
    const lists = h('ol.gr-lists');
    body.append(
      h('div.gr-rep-col', h('h4.gr-rep-h', { text: 'Disegno' }), drawHost),
      h('div.gr-rep-col', h('h4.gr-rep-h', { html: 'Matrice di adiacenza <code>M</code>' }), matWrap),
      h('div.gr-rep-col', h('h4.gr-rep-h', { html: 'Liste di adiacenza <code>adj</code>' }), lists)
    );
    const controls = h('div.lab-controls');
    const out = h('div.lab-out', { 'aria-live': 'polite' });
    lab.append(body, controls, out);
    host.append(lab);

    // comandi
    const kind = h('fieldset.gr-radios', h('legend.gr-legend-t', { text: 'Archi' }));
    for (const [val, text] of [['no', 'non orientati'], ['si', 'orientati']]) {
      const id = `${uid}-dir-${val}`;
      const input = h('input', { type: 'radio', name: uid + '-dir', id, value: val, checked: val === 'no' });
      input.addEventListener('change', () => {
        directed = val === 'si';
        if (!directed) dedupe();
        sel = null;
        msg = '';
        draw();
      });
      kind.append(h('label.chip', { for: id }, input, text));
    }
    const wId = uid + '-w';
    const wInput = h('input', { type: 'checkbox', id: wId });
    wInput.addEventListener('change', () => {
      weighted = wInput.checked;
      draw();
    });
    const eId = uid + '-edit';
    const eInput = h('input', { type: 'checkbox', id: eId });
    eInput.addEventListener('change', () => {
      edit = eInput.checked;
      msg = edit ? 'Modifica attiva: tocca una casella della matrice per aggiungere o togliere quell\'arco.' : '';
      draw();
    });
    const reset = h('button.btn.btn-sm', { type: 'button', text: 'Ripristina l\'esempio' });
    reset.addEventListener('click', () => {
      edges = base.edges.map((e) => e.slice());
      sel = null;
      msg = '';
      draw();
    });
    controls.append(
      kind,
      h('label.chip.gr-check', { for: wId }, wInput, 'con i pesi'),
      h('label.chip.gr-check', { for: eId }, eInput, 'Modifica'),
      reset
    );

    const view = new ASD.viz.GraphView(drawHost, {
      onNode: (u) => select({ kind: 'node', u }),
      onEdge: (k, e) => select({ kind: 'cell', u: e[0], v: e[1] }),
      maxScale: 1.1,
    });

    const find = (u, v) => edges.findIndex((e) => (e[0] === u && e[1] === v) || (!directed && e[0] === v && e[1] === u));
    const weightOf = (u, v) => {
      const i = find(u, v);
      return i < 0 ? null : edges[i][2];
    };
    const graph = () => ({ n, directed, weighted, pos: base.pos, edges: edges.map((e) => (weighted ? [e[0], e[1], e[2]] : [e[0], e[1]])) });

    function dedupe() {
      const seen = new Set();
      edges = edges.filter((e) => {
        const k = G.key(e[0], e[1], false);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
    }

    function select(s) {
      if (s.kind === 'cell' && edit && s.u !== s.v) {
        const i = find(s.u, s.v);
        if (i >= 0) {
          edges.splice(i, 1);
          msg = `Tolto l'arco ${G.edgeName({ directed }, s.u, s.v)}.`;
        } else {
          edges.push([s.u, s.v, 1 + ((s.u * 3 + s.v * 5) % 9)]);
          msg = `Aggiunto l'arco ${G.edgeName({ directed }, s.u, s.v)}${weighted ? ` (peso ${edges[edges.length - 1][2]})` : ''}.`;
        }
      } else msg = '';
      const same = sel && s.kind === sel.kind && s.u === sel.u && s.v === sel.v;
      sel = same && !edit ? null : s;
      draw();
    }

    // tabella della matrice: si costruisce una volta, poi si aggiorna
    const matButtons = [];
    const rowHeads = [];
    const colHeads = [];
    const mat = h('table.gr-mat');
    mat.append(h('caption.visually-hidden', { text: 'Matrice di adiacenza: riga u, colonna v' }));
    const hr = h('tr', h('th.gr-mat-corner', { scope: 'col', html: '<span class="visually-hidden">u \\ v</span>' }));
    for (let v = 0; v < n; v++) {
      const b = h('button.gr-mh', { type: 'button', text: String(v), 'aria-label': `Nodo ${v} (colonna ${v})` });
      b.addEventListener('click', () => select({ kind: 'node', u: v }));
      colHeads.push(b);
      hr.append(h('th', { scope: 'col' }, b));
    }
    mat.append(h('thead', hr));
    const tb = h('tbody');
    for (let u = 0; u < n; u++) {
      const b = h('button.gr-mh', { type: 'button', text: String(u), 'aria-label': `Nodo ${u} (riga ${u})` });
      b.addEventListener('click', () => select({ kind: 'node', u }));
      rowHeads.push(b);
      const tr = h('tr', h('th', { scope: 'row' }, b));
      matButtons.push([]);
      for (let v = 0; v < n; v++) {
        const c = h('button.gr-mc', { type: 'button' });
        c.addEventListener('click', () => select({ kind: 'cell', u, v }));
        matButtons[u].push(c);
        tr.append(h('td', c));
      }
      tb.append(tr);
    }
    mat.append(tb);
    matWrap.append(mat);
    const facts = h('p.gr-rep-facts');
    matWrap.append(facts);

    function draw() {
      const g = graph();
      const adj = G.adj(g);
      // classi della selezione
      const nodeC = {};
      const edgeC = {};
      const cellC = {};
      const rowC = {};
      const colC = {};
      const itemC = {};
      const listC = {};
      const addC = (map, k, c) => (map[k] = [].concat(map[k] || [], c));
      if (sel && sel.kind === 'node') {
        const u = sel.u;
        nodeC[u] = 'sel';
        rowC[u] = 'sel';
        listC[u] = 'sel';
        if (!directed) colC[u] = 'sel';
        else colC[u] = 'in';
        for (const e of edges) {
          if (e[0] === u || (!directed && e[1] === u)) addC(edgeC, G.key(e[0], e[1], directed), 'sel');
          else if (directed && e[1] === u) addC(edgeC, G.key(e[0], e[1], directed), 'new');
        }
        for (let v = 0; v < n; v++) {
          addC(cellC, `${u}-${v}`, 'row');
          addC(cellC, `${v}-${u}`, directed ? 'col' : 'row');
        }
        adj.forEach((list, x) => list.forEach((it, j) => {
          const v = weighted ? it[0] : it;
          if (x === u) addC(itemC, `${x}-${j}`, 'sel');
          else if (v === u) addC(itemC, `${x}-${j}`, directed ? 'in' : 'sel');
        }));
      } else if (sel && sel.kind === 'cell') {
        const { u, v } = sel;
        const yes = find(u, v) >= 0;
        addC(cellC, `${u}-${v}`, yes ? 'hit' : 'miss');
        if (!directed && u !== v) addC(cellC, `${v}-${u}`, yes ? 'hit' : 'miss');
        nodeC[u] = yes ? 'sel' : 'compare';
        nodeC[v] = yes ? 'sel' : 'compare';
        if (yes) addC(edgeC, G.key(u, v, directed), 'sel');
        adj.forEach((list, x) => list.forEach((it, j) => {
          const y = weighted ? it[0] : it;
          if ((x === u && y === v) || (!directed && x === v && y === u)) addC(itemC, `${x}-${j}`, 'sel');
          else if (!yes && x === u) addC(itemC, `${x}-${j}`, 'scan');
        }));
        if (!yes) listC[u] = 'scan';
        rowC[u] = 'sel';
        colC[v] = 'sel';
      }

      view.render({ graph: g, nodes: nodeC, edges: edgeC });

      // matrice
      for (let u = 0; u < n; u++) {
        for (let v = 0; v < n; v++) {
          const c = matButtons[u][v];
          const w = weightOf(u, v);
          const yes = w != null && u !== v;
          const val = weighted ? (yes ? String(w) : '∞') : yes ? '1' : '0';
          c.textContent = val;
          const cls = ['gr-mc'];
          if (yes) cls.push('is-one');
          for (const x of [].concat(cellC[`${u}-${v}`] || [])) cls.push('is-' + x);
          if (edit && u !== v) cls.push('is-edit');
          c.className = cls.join(' ');
          c.setAttribute(
            'aria-label',
            `M[${u}][${v}] = ${val}` + (yes ? `: arco ${directed ? `da ${u} a ${v}` : `tra ${u} e ${v}`}` : ': nessun arco') + (edit && u !== v ? '. Premi per ' + (yes ? 'toglierlo' : 'aggiungerlo') : '')
          );
          c.setAttribute('aria-pressed', String(Boolean(cellC[`${u}-${v}`])));
        }
        rowHeads[u].className = 'gr-mh' + (rowC[u] ? ' is-' + rowC[u] : '');
        colHeads[u].className = 'gr-mh' + (colC[u] ? ' is-' + colC[u] : '');
      }

      // liste
      lists.replaceChildren(
        ...adj.map((list, u) => {
          const headB = h('button.gr-lh' + (listC[u] ? '.is-' + listC[u] : ''), { type: 'button', html: `adj[${u}]`, 'aria-label': `Lista adj[${u}], vicini di ${u}` });
          headB.addEventListener('click', () => select({ kind: 'node', u }));
          const items = h('span.gr-li-items');
          if (!list.length) items.append(h('span.gr-rows-none', { text: 'vuota' }));
          list.forEach((it, j) => {
            const v = weighted ? it[0] : it;
            const text = weighted ? `(${it[0]}, ${it[1]})` : String(it);
            const b = h('button.gr-li' + [].concat(itemC[`${u}-${j}`] || []).map((x) => '.is-' + x).join(''), {
              type: 'button',
              text,
              'aria-label': `In adj[${u}]: ${v}${weighted ? ', peso ' + it[1] : ''}`,
            });
            b.addEventListener('click', () => select({ kind: 'cell', u, v }));
            items.append(b);
          });
          return h('li', headB, items);
        })
      );

      const mm = edges.length;
      const elems = directed ? mm : 2 * mm;
      facts.innerHTML = `${m(`n = ${n}`)}, ${m(`m = ${mm}`)} · matrice: ${m(`n^2 = ${n * n}`)} caselle · liste: ${n} liste e ${elems} elementi (${directed ? m('m') : m('2m')})`;

      out.innerHTML = '<p>' + (msg ? msg + ' ' : '') + explain(adj) + '</p>';
    }

    function explain(adj) {
      if (!sel) {
        return 'Tocca (oppure raggiungi con <kbd>Tab</kbd> e premi <kbd>Invio</kbd>) un nodo, un arco, una casella della matrice o un elemento di una lista.';
      }
      const listOf = (u) => '[' + adj[u].map((it) => (weighted ? `(${it[0]}, ${it[1]})` : it)).join(', ') + ']';
      if (sel.kind === 'node') {
        const u = sel.u;
        if (!directed) {
          const d = adj[u].length;
          return `Nodo <b>${u}</b>, grado ${d}. Nella matrice è la riga ${u}, uguale alla colonna ${u} perché la matrice è simmetrica: ${d} caselle ${weighted ? 'con un peso' : 'a 1'}. Nelle liste è <code>adj[${u}] = ${listOf(u)}</code>. Per scorrere i vicini di ${u} la matrice legge tutta la riga, ${n} caselle (${m('Θ(n)')}); le liste leggono solo i ${d} vicini (${m('Θ(grado)')}).`;
        }
        const outD = adj[u].length;
        const inD = edges.filter((e) => e[1] === u).length;
        return `Nodo <b>${u}</b>: grado uscente ${outD} (la riga ${u} e la lista <code>adj[${u}] = ${listOf(u)}</code>), grado entrante ${inD} (la colonna ${u} e, in viola, le liste in cui compare ${u}). Il grado uscente con le liste è <code>adj[${u}].size()</code>, ${m('Θ(1)')}; per quello entrante bisogna cercare ${u} in tutte le liste.`;
      }
      const { u, v } = sel;
      if (u === v) return `La diagonale: ${m(`M[${u}][${u}]`)} direbbe se c'è un cappio, cioè un arco da ${u} a se stesso. Nei grafi di questo corso non ce ne sono.`;
      const w = weightOf(u, v);
      const name = directed ? `da ${u} a ${v}` : `tra ${u} e ${v}`;
      const d = adj[u].length;
      if (w != null) {
        return `${m(`M[${u}][${v}] = ${weighted ? w : 1}`)}: c'è l'arco ${name}${weighted ? `, di peso ${w}` : ''}.${directed ? '' : ` Anche ${m(`M[${v}][${u}]`)} lo dice: la matrice è simmetrica.`} Nelle liste ${v} sta in <code>adj[${u}]</code>${directed ? '' : ` e ${u} sta in <code>adj[${v}]</code>`}. Per chiedersi «(${u}, ${v}) è un arco?» la matrice legge una casella, ${m('Θ(1)')}; le liste scorrono <code>adj[${u}]</code> fino a trovare ${v}, ${m(`O(grado(${u}))`)}.`;
      }
      return `${m(`M[${u}][${v}] = ${weighted ? '∞' : 0}`)}: nessun arco ${name}. La matrice lo dice con una casella; con le liste bisogna scorrere <b>tutta</b> <code>adj[${u}]</code> (${d} element${d === 1 ? 'o' : 'i'}, in giallo) per essere sicuri che ${v} non ci sia.${weighted ? ' Nel pesato, dove l\'arco manca si scrive un valore speciale: ∞ (in C++ una costante <code>INF</code>), oppure 0 se i pesi sono tutti positivi.' : ''}`;
    }

    draw();
  }

  /* --------------------------------------- traccia: costruzione delle liste */

  function traceListe(g) {
    const t = new ASD.Tracer(['push']);
    const n = g.n;
    const E = g.edges;
    const adj = Array.from({ length: n }, () => []);
    const snap = (i, phase, fresh) => {
      const edges = {};
      E.forEach(([u, v], j) => {
        const k = G.key(u, v, false);
        if (j === i) edges[k] = 'compare';
        else if (j > i) edges[k] = 'ghost';
      });
      const nodes = {};
      if (i >= 0 && i < E.length) {
        const [u, v] = E[i];
        if (phase === 'uv') {
          nodes[u] = 'active';
          nodes[v] = 'key';
        } else if (phase === 'vu') {
          nodes[v] = 'active';
          nodes[u] = 'key';
        } else {
          nodes[u] = 'compare';
          nodes[v] = 'compare';
        }
      }
      return G.snap(g, {
        nodes,
        edges,
        p: {
          archi: {
            items: E.map(([u, v], j) => ({ t: `{${u}, ${v}}`, cls: j === i ? 'compare' : j < i ? 'done' : null })),
          },
          adj: {
            rows: adj.map((list, u) => ({
              head: `adj[${u}]`,
              cls: fresh && fresh[0] === u ? 'active' : null,
              items: list.map((v, j) => ({ t: String(v), cls: fresh && fresh[0] === u && fresh[1] === j ? 'new' : null })),
            })),
          },
        },
      });
    };
    t.step('crea', `<code>vector&lt;vector&lt;int&gt;&gt; adj(${n})</code>: ${n} liste vuote, una per nodo, da <code>adj[0]</code> a <code>adj[${n - 1}]</code>.`, { n }, snap(-1));
    E.forEach(([u, v], i) => {
      t.step('arco', `Arco numero ${i + 1} di ${E.length} dell'elenco: <b>{${u}, ${v}}</b>, quindi <code>u = ${u}</code> e <code>v = ${v}</code>.`, { u, v }, snap(i, 'arco'));
      adj[u].push(v);
      t.count('push');
      t.step('uv', `<code>adj[${u}].push_back(${v})</code>: ${v} va in fondo alla lista di ${u}, che diventa [${adj[u].join(', ')}].`, { u, v }, snap(i, 'uv', [u, adj[u].length - 1]));
      adj[v].push(u);
      t.count('push');
      t.step('vu', `<code>adj[${v}].push_back(${u})</code>: il grafo non è orientato, quindi lo stesso arco si scrive anche nella lista di ${v}, che diventa [${adj[v].join(', ')}].`, { u, v }, snap(i, 'vu', [v, adj[v].length - 1]));
    });
    const deg = adj.map((l) => l.length);
    t.step(
      'fine',
      `Restituisco <code>adj</code>. Ogni arco è stato scritto due volte: ${t.c.push} elementi = ${m(`2m = 2·${E.length}`)}. La lunghezza di <code>adj[u]</code> è il grado di u (${deg.map((d, u) => `${u}: ${d}`).join(', ')}).`,
      {},
      snap(E.length)
    );
    return t.frames;
  }
})();
