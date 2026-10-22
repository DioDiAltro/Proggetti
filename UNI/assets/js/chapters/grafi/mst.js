/* ASD a quadretti — capitolo "Alberi di copertura minimi": definizione,
   proprietà del taglio (con uno strumento per provarla), Kruskal con
   union-find, Prim con la coda con priorità, lo stesso grafo con alberi
   diversi dello stesso peso. */
(function () {
  'use strict';

  const { m, box, table, h } = ASD;
  const G = ASD.grafi;
  const fmt = G.fmtD;

  ASD.chapter({
    id: 'mst',
    title: 'Alberi di copertura minimi',
    lead:
      'Collegare tutti i nodi spendendo il meno possibile: è il problema dell\'albero di copertura minimo (MST). Lo risolvono due algoritmi golosi, Kruskal e Prim, che scelgono sempre l\'arco più leggero possibile. Funzionano entrambi grazie alla stessa proprietà, quella del taglio.',
    minutes: 45,
    prereq: ['visite', 'heap'],
    goals: [
      'dire che cos\'è un albero di copertura minimo e quando è unico',
      'enunciare la proprietà del taglio e usarla per giustificare Kruskal e Prim',
      'eseguire a mano Kruskal con union-find (compressione dei cammini, unione per rango) e Prim con la coda con priorità',
      `ricordare i costi: ${m('Θ(m log m)')} per Kruskal, ${m('Θ(m log n)')} per Prim con lo heap`,
    ],

    render(el) {
      el.innerHTML = `
<section id="problema">
  <h2>Il problema</h2>
  <p>Sia ${m('G')} un grafo <strong>non orientato, connesso e pesato</strong>. Un <strong>albero di copertura</strong>
  (<i>spanning tree</i>) è un insieme di archi che collega tutti i nodi senza formare cicli: è un albero che "copre" tutto il
  grafo, quindi ha esattamente ${m('n - 1')} archi. Il suo peso è la somma dei pesi dei suoi archi. Un <strong>albero di
  copertura minimo</strong> (MST, <i>minimum spanning tree</i>) è uno di peso minimo.</p>
  <p>Esempio classico: i nodi sono città, i pesi il costo per posare un cavo tra due città. L'MST è la rete più economica che
  le collega tutte.</p>
  <ul>
    <li>Se tutti i pesi sono <strong>distinti</strong>, l'MST è unico.</li>
    <li>Con pesi uguali ce ne possono essere diversi, tutti con lo stesso peso minimo: lo vedremo con Kruskal e Prim sullo
    stesso grafo.</li>
    <li>I pesi negativi non danno problemi: conta solo quale arco è più leggero di quale.</li>
  </ul>
  ${box('errore', `<p>L'MST <strong>non</strong> è l'albero dei cammini minimi. Triangolo con archi ${m('0–1')} (2),
  ${m('1–2')} (2), ${m('0–2')} (3): l'MST prende ${m('0–1')} e ${m('1–2')}, peso 4; l'albero dei cammini minimi da 0 prende
  ${m('0–1')} e ${m('0–2')}, peso 5, perché per andare da 0 a 2 l'arco diretto (3) batte il giro da 1 (4). Il primo minimizza
  il totale dei pesi, il secondo ogni singola distanza da 0.</p>`)}
</section>

<section id="taglio">
  <h2>La proprietà del taglio</h2>
  <p>Un <strong>taglio</strong> divide i nodi in due parti: un insieme ${m('S')} e il resto ${m('V \\ S')}, entrambi non vuoti.
  Un arco <strong>attraversa</strong> il taglio se ha un estremo da una parte e uno dall'altra.</p>
  ${box('ricorda', `<p><strong>Proprietà del taglio.</strong> Per ogni taglio, un arco di peso minimo tra quelli che lo
  attraversano appartiene a qualche MST. Se è l'unico arco di peso minimo, appartiene a tutti gli MST.</p>`)}
  <p><strong>Perché.</strong> Prendi un MST ${m('T')} che non contiene l'arco leggero ${m('e')}. Aggiungendo ${m('e')} a
  ${m('T')} si forma un ciclo, e il ciclo deve attraversare il taglio una seconda volta, con un arco ${m('f')} di ${m('T')}.
  Togli ${m('f')}: è ancora un albero di copertura, e pesa ${m('w(e) - w(f) <= 0')} in più. Quindi anche lui è minimo, e
  contiene ${m('e')}.</p>
  <p>Prova tu: tocca i nodi per spostarli dentro o fuori da ${m('S')}. Gli archi che attraversano il taglio sono in viola,
  quello (o quelli) di peso minimo in verde.</p>
  <div data-mount="taglio"></div>
  <p>I due algoritmi sono due modi di scegliere il taglio a ogni passo. Kruskal prende l'arco più leggero che unisce due
  pezzi diversi della foresta costruita finora (taglio: un pezzo contro il resto). Prim fa crescere un solo albero e prende
  l'arco più leggero che esce dall'albero (taglio: l'albero contro il resto).</p>
  ${box('nota', `Il rovescio della medaglia è la <strong>proprietà del ciclo</strong>: l'arco più pesante di un ciclo, se è
  l'unico con quel peso, non sta in nessun MST. È il motivo per cui Kruskal può scartare un arco che chiude un ciclo: arriva
  dopo tutti gli altri archi del ciclo, quindi è il più pesante.`, 'Proprietà del ciclo')}
</section>

<section id="kruskal">
  <h2>Kruskal</h2>
  <p><strong>Idea.</strong> Ordina gli archi dal più leggero al più pesante e scorrili: prendi un arco se collega due nodi che
  non sono ancora collegati dagli archi presi; altrimenti scartalo, perché chiuderebbe un ciclo. All'inizio ogni nodo è un
  pezzo da solo; ogni arco preso fonde due pezzi; dopo ${m('n - 1')} archi presi resta un pezzo solo.</p>
  <p>Per sapere al volo se due nodi stanno nello stesso pezzo serve una struttura <strong>union-find</strong> (insiemi
  disgiunti), descritta nella prossima sezione: <code>unisci(u, v)</code> fonde i due insiemi e restituisce
  <code>false</code> se erano già lo stesso.</p>
  <div data-mount="kruskal" class="gr-host"></div>
  <h3>Quanto costa</h3>
  <p>L'ordinamento costa ${m('Θ(m log m)')}. Poi ${m('m')} chiamate a <code>unisci</code>, ognuna con due
  <code>trova</code>: con le due ottimizzazioni dell'union-find costano in tutto ${m('O(m · α(n))')}, dove ${m('α')} è una
  funzione che cresce così lentamente da non superare 4 per qualsiasi ${m('n')} reale. Domina l'ordinamento:</p>
  <p class="formula">${m('T(n, m) = Θ(m log m) = Θ(m log n)')} &nbsp;&nbsp; (perché ${m('log m <= 2 log n')})</p>
</section>

<section id="union-find">
  <h2>Union-find</h2>
  <p>Ogni insieme è un albero, rappresentato con un vettore <code>padre</code>: la radice (con
  <code>padre[x] == x</code>) è il <strong>rappresentante</strong> dell'insieme. <code>trova(x)</code> risale da ${m('x')} fino
  alla radice; due nodi stanno nello stesso insieme se hanno la stessa radice. <code>unisci</code> attacca una radice
  all'altra.</p>
  <div data-mount="uf-code"></div>
  <p>Senza accorgimenti gli alberi possono diventare catene lunghe ${m('n')}, e <code>trova</code> costa ${m('O(n)')}. Due
  ottimizzazioni, entrambe nel codice qui sopra:</p>
  <ul>
    <li><strong>unione per rango</strong>: <code>rango</code> stima l'altezza dell'albero; l'albero più basso va sotto quello
    più alto, così l'altezza cresce solo unendo due alberi di pari rango, e resta ${m('O(log n)')};</li>
    <li><strong>compressione dei cammini</strong>: mentre <code>trova</code> risale, attacca ogni nodo del percorso
    direttamente alla radice (<code>padre[x] = trova(padre[x])</code>): le ricerche successive fanno un passo solo.</li>
  </ul>
  ${table({
    caption: 'Costo di una sequenza di m operazioni su n elementi',
    head: ['Union-find', 'trova', 'Totale per m operazioni'],
    rows: [
      ['senza ottimizzazioni', m('O(n)'), m('O(m · n)')],
      ['solo unione per rango', m('O(log n)'), m('O(m log n)')],
      ['rango + compressione dei cammini', `${m('O(α(n))')} ammortizzato`, m('O(m · α(n))')],
    ],
  })}
  ${box('esame', `<p>Negli esercizi su Kruskal ti possono chiedere lo stato di <code>padre</code> dopo ogni unione. Il
  visualizzatore qui sopra mostra il vettore a ogni passo: guarda cosa succede quando <code>trova</code> comprime un
  cammino. E segui le convenzioni del corso: qui, a parità di rango, va sotto la radice del secondo argomento.</p>`)}
</section>

<section id="prim">
  <h2>Prim</h2>
  <p><strong>Idea.</strong> Parti da un nodo e fai crescere un albero. A ogni passo aggiungi il nodo fuori dall'albero
  collegato all'albero con l'arco più leggero. <code>key[v]</code> è il peso di quell'arco (∞ se ${m('v')} non è ancora
  collegato), <code>padre[v]</code> l'altro estremo.</p>
  <p>Il codice è quasi identico a ${ASD.link('cammini-minimi', 'dijkstra', 'Dijkstra')}: coda con priorità di coppie, cancellazione
  pigra con <code>inAlbero</code> al posto di <code>fatto</code>. Cambia solo il confronto: Dijkstra guarda la distanza
  totale <code>dist[u] + w</code>, Prim solo il peso dell'arco <code>w</code>.</p>
  <div data-mount="prim" class="gr-host"></div>
  <h3>Quanto costa</h3>
  <p>Come Dijkstra. Ogni arco viene esaminato due volte, una per estremo, ma fa entrare in coda al più una coppia: quando lo
  si guarda dal secondo estremo, il primo è già nell'albero. Quindi entrano al più ${m('m + 1')} coppie, e ogni operazione
  sullo heap costa ${m('O(log m) = O(log n)')}:</p>
  <p class="formula">${m('T(n, m) = Θ(m log n)')} con lo heap (grafo connesso) &nbsp;&nbsp; ${m('Θ(n^2)')} con un array, meglio sui grafi densi</p>
</section>

<section id="stesso-peso">
  <h2>Stesso peso, alberi diversi</h2>
  <p>Le visualizzazioni qui sopra usano lo stesso grafo. Kruskal e Prim restituiscono due alberi diversi, entrambi di peso
  9. Il motivo sono i pareggi: gli archi ${m('0–3')} e ${m('1–2')} pesano 2 tutti e due, e servono allo stesso scopo (collegare
  ${m('{0, 1}')} con ${m('{2, 3}')}). Kruskal, a parità di peso, esamina prima ${m('0–3')} e lo prende; quando arriva a
  ${m('1–2')}, i due pezzi sono già uniti e lo scarta. Prim invece, partito da 0, prende subito 1 (arco di peso 1). A quel punto
  in coda ci sono le coppie (2, 2) e (2, 3), di pari peso: la <code>pair</code> confronta poi il nodo, ed esce prima 2, collegato
  da 1. Solo dopo entra 3, da 2, con l'arco di peso 1: ${m('0–3')} non gli serve più.</p>
  <div data-mount="due"></div>
  <p>Output dei due programmi:</p>
  <div class="cols">
    <pre class="code-out" tabindex="0"><code>Archi dell'MST (Kruskal), nell'ordine in cui entrano:
  0 - 1  peso 1
  2 - 3  peso 1
  0 - 3  peso 2
  4 - 5  peso 2
  1 - 4  peso 3
Peso totale: 9</code></pre>
    <pre class="code-out" tabindex="0"><code>Archi dell'MST (Prim, partendo da 0):
  0 - 1
  1 - 2
  2 - 3
  1 - 4
  4 - 5
Peso totale: 9</code></pre>
  </div>
</section>

<section id="costi">
  <h2>Quanto costano</h2>
  ${table({
    caption: 'Alberi di copertura minimi (n nodi, m archi, grafo connesso)',
    head: ['Algoritmo', 'Struttura', 'Tempo', 'Quando conviene'],
    rows: [
      ['Kruskal', 'ordinamento + union-find', m('Θ(m log m) = Θ(m log n)'), 'grafi sparsi; archi già in un elenco'],
      ['Prim con heap', '<code>priority_queue</code>', m('Θ(m log n)'), 'grafi sparsi; liste di adiacenza'],
      ['Prim con array', 'vettore <code>key</code>, minimo cercato a mano', m('Θ(n^2)'), 'grafi densi (matrice di adiacenza)'],
    ],
  })}
</section>

<section id="esame">
  <h2>All'esame</h2>
  <ol>
    <li><strong>Simulazione</strong>: «esegui Kruskal: in che ordine entrano gli archi, quali vengono scartati?» oppure
    «esegui Prim da ${m('a')}: <code>key</code> e <code>padre</code> dopo ogni estrazione». Scrivi il grafo dell'esercizio nei
    visualizzatori per controllarti.</li>
    <li><strong>Teoria</strong>: enuncia la proprietà del taglio e usala per dire perché un certo arco sta (o non sta)
    nell'MST.</li>
    <li><strong>Union-find</strong>: lo stato di <code>padre</code> e <code>rango</code> dopo una serie di unioni.</li>
  </ol>
  ${box('esame', `<p>Quando i pesi hanno pareggi, l'MST che trovi dipende da come rompi i pareggi. Dichiara la regola che
  usi (per esempio: a parità di peso, l'arco con gli estremi più piccoli) e controlla sempre il peso totale: è l'unica cosa
  che deve tornare a tutti.</p>`)}
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        taglio: mountTaglio,
        kruskal: (host) =>
          ASD.stepper(host, {
            id: 'kruskal',
            title: 'Kruskal passo per passo',
            code: { src: 'grafi/kruskal', region: 'kruskal' },
            input: G.input(G.esempi.mst, { negative: true }),
            view: (stage) =>
              new ASD.viz.GraphScene(stage, {
                panels: [
                  { id: 'archi', kind: 'chips', title: 'Archi in ordine di peso' },
                  { id: 'insiemi', kind: 'chips', title: 'Insiemi (pezzi della foresta)' },
                  { id: 'uf', kind: 'table', title: 'Union-find' },
                ],
              }),
            trace: traceKruskal,
            counters: [
              { key: 'presi', label: 'archi presi' },
              { key: 'scartati', label: 'scartati' },
            ],
            legend: [
              { k: 'gr-e-compare', label: 'arco esaminato' },
              { k: 'gr-e-done', label: 'preso: nell\'MST' },
              { k: 'gr-e-rejected', label: 'scartato: chiuderebbe un ciclo' },
            ],
            validate: (g, frames) => {
              const res = frames[frames.length - 1].state.res;
              const want = G.check.msf(g);
              if (res.totale !== want.total) return `peso ${res.totale}, atteso ${want.total}`;
              if (res.presi !== want.edges) return `${res.presi} archi presi, attesi ${want.edges}`;
              return null;
            },
          }),
        'uf-code': (host) => ASD.code(host, { src: 'grafi/kruskal', region: 'unionfind' }),
        prim: (host) =>
          ASD.stepper(host, {
            id: 'prim',
            title: 'Prim passo per passo (da 0)',
            code: { src: 'grafi/prim', region: 'prim' },
            input: G.input(G.esempi.mst, { negative: true }),
            view: (stage) =>
              new ASD.viz.GraphScene(stage, {
                view: { tagW: 38 },
                panels: [
                  { id: 'pq', kind: 'chips', title: 'Coda con priorità <code>pq</code> (in cima la prima)' },
                  { id: 'tab', kind: 'table', title: 'Vettori' },
                ],
              }),
            trace: tracePrim,
            counters: [
              { key: 'push', label: 'push' },
              { key: 'pop', label: 'pop' },
            ],
            legend: [
              { k: 'gr-done', label: 'nell\'albero' },
              { k: 'gr-gray', label: 'collegato, fuori dall\'albero' },
              { k: 'gr-active', label: 'u estratto' },
              { k: 'gr-e-done', label: 'arco dell\'MST' },
              { k: 'gr-e-tree', label: 'miglior arco verso v (key)' },
              { k: 'gr-e-compare', label: 'arco esaminato' },
            ],
            validate: (g, frames) => {
              const res = frames[frames.length - 1].state.res;
              const want = G.check.msf(g, 0);
              return res.totale === want.total ? null : `peso ${res.totale}, atteso ${want.total}`;
            },
          }),
        due: mountDue,
        quiz: (host) =>
          ASD.quiz(host, [
            {
              q: 'Quanti archi ha un albero di copertura di un grafo connesso con <var>n</var> nodi e <var>m</var> archi?',
              options: [m('n - 1'), m('n'), m('m - 1'), 'dipende dai pesi'],
              answer: 0,
              explain: `Un albero con ${m('n')} nodi ha sempre ${m('n - 1')} archi, qualunque siano i pesi. I pesi decidono
              <em>quali</em> archi, non quanti.`,
            },
            {
              q: 'Kruskal scarta l\'arco (u, v) quando…',
              options: [
                'il peso è maggiore di quello dell\'arco precedente',
                '<code>trova(u) == trova(v)</code>: u e v sono già collegati, e l\'arco chiuderebbe un ciclo',
                'u o v sono già stati toccati da un arco preso',
                'il peso è negativo',
              ],
              answer: 1,
              explain: `Gli archi arrivano in ordine crescente, quindi il peso non basta per scartare. Si scarta solo un arco
              con gli estremi già nello stesso pezzo: per la proprietà del ciclo è il più pesante del ciclo che chiuderebbe.
              Un nodo può avere molti archi nell'MST (pensa al centro di una stella).`,
            },
            {
              q: 'Qual è la complessità di Kruskal su un grafo connesso con <var>n</var> nodi e <var>m</var> archi?',
              options: [m('Θ(m log m)'), m('Θ(n^2)'), m('Θ(m · α(n))'), m('Θ(n + m)')],
              answer: 0,
              explain: `Domina l'ordinamento degli archi, ${m('Θ(m log m)')}, che è anche ${m('Θ(m log n)')}. Le operazioni di
              union-find, con rango e compressione dei cammini, costano in tutto solo ${m('O(m · α(n))')}.`,
            },
            {
              q: 'Dopo <code>unisci(0, 1)</code>, <code>unisci(2, 3)</code>, <code>unisci(0, 3)</code> (codice della pagina, 4 nodi), quanto vale <code>trova(3)</code>?',
              options: ['0', '1', '2', '3'],
              answer: 0,
              explain: `<code>unisci(0, 1)</code>: ranghi uguali, 1 va sotto 0 e ${m('rango[0] = 1')}. <code>unisci(2, 3)</code>:
              3 sotto 2, ${m('rango[2] = 1')}. <code>unisci(0, 3)</code>: le radici sono 0 e 2, ranghi uguali, 2 va sotto 0.
              Ora <code>trova(3)</code> sale da 3 a 2 a 0, e la compressione attacca 3 direttamente a 0.`,
            },
            {
              q: 'Che differenza c\'è tra il codice di Prim e quello di Dijkstra?',
              options: [
                'Prim usa una pila, Dijkstra una coda con priorità',
                'Prim confronta il peso dell\'arco (<code>w &lt; key[v]</code>), Dijkstra la distanza totale (<code>dist[u] + w &lt; dist[v]</code>)',
                'Prim funziona solo sui grafi orientati',
                'nessuna: calcolano la stessa cosa',
              ],
              answer: 1,
              explain: `La struttura è la stessa: coda con priorità, cancellazione pigra, un nodo definitivo alla volta. Prim
              chiede «quanto costa collegare ${m('v')} all'albero?», Dijkstra «quanto costa arrivare a ${m('v')} da ${m('s')}?».
              Per questo producono alberi diversi.`,
            },
            {
              q: 'Kruskal e Prim, sullo stesso grafo connesso, restituiscono sempre lo stesso albero?',
              options: [
                'sì, sempre',
                'no: con pesi uguali possono dare alberi diversi, ma con lo stesso peso totale',
                'no, e anche il peso totale può essere diverso',
              ],
              answer: 1,
              explain: `Entrambi restituiscono un MST, quindi il peso è sempre il minimo. Se i pesi sono tutti distinti l'MST è
              unico e gli alberi coincidono; con i pareggi possono scegliere archi diversi, come nell'esempio di questa pagina
              (peso 9 in entrambi i casi).`,
            },
          ]),
      });
    },
  });

  /* ------------------------------------------------------------- Kruskal */

  /** Colori dei pezzi: solo gli insiemi con almeno due nodi, in ordine di nodo più piccolo. */
  function pieces(n, trova) {
    const groups = new Map();
    for (let v = 0; v < n; v++) {
      const r = trova(v);
      if (!groups.has(r)) groups.set(r, []);
      groups.get(r).push(v);
    }
    const list = [...groups.values()].sort((a, b) => a[0] - b[0]);
    const color = {};
    let k = 0;
    for (const set of list) {
      if (set.length > 1) {
        k++;
        for (const v of set) color[v] = 'c' + (((k - 1) % 6) + 1);
      }
    }
    return { list, color };
  }

  function traceKruskal(g) {
    const t = new ASD.Tracer(['presi', 'scartati']);
    const n = g.n;
    const archi = g.edges.map(([u, v, w]) => ({ u, v, w }));
    const padre = Array.from({ length: n }, (_, i) => i);
    const rango = Array(n).fill(0);
    // trova senza compressione: solo per disegnare gli insiemi
    const radice = (x) => {
      while (padre[x] !== x) x = padre[x];
      return x;
    };
    const trova = (x) => {
      if (padre[x] !== x) padre[x] = trova(padre[x]);
      return padre[x];
    };
    let sorted = null;
    const stato = []; // per ogni arco ordinato: null | 'done' | 'rejected'
    let totale = 0;
    let presi = 0;

    const snap = (o = {}) => {
      const { list, color } = pieces(n, radice);
      const nodes = {};
      for (let v = 0; v < n; v++) nodes[v] = color[v] ? [color[v]] : [];
      const edges = {};
      if (sorted) {
        sorted.forEach((e, i) => {
          const k = G.key(e.u, e.v, false);
          const c = [];
          if (stato[i]) c.push(stato[i]);
          if (i === o.cur) c.push('compare');
          edges[k] = c;
        });
      }
      const chips = (sorted || archi).map((e, i) => ({
        t: `${e.u}–${e.v} <small>${e.w}</small>`,
        cls: sorted ? [stato[i] === 'rejected' ? 'rejected' : stato[i], i === o.cur ? 'compare' : null] : null,
      }));
      return G.snap(g, {
        nodes,
        edges,
        p: {
          archi: { items: chips, note: sorted ? null : 'non ancora ordinati' },
          insiemi: { items: list.map((set) => ({ t: '{' + set.join(', ') + '}', cls: ['set', set.length > 1 ? color[set[0]] : null] })) },
          uf: {
            head: G.nodeHead(n, 'x'),
            rows: [
              { th: 'padre', cells: padre.map(String), cls: o.chgP || {} },
              { th: 'rango', cells: rango.map(String), cls: o.chgR || {} },
            ],
          },
        },
      });
    };

    const lista = archi.slice().sort((a, b) => a.w - b.w || a.u - b.u || a.v - b.v);
    sorted = lista;
    t.step(
      'sort',
      `Ordino gli archi per peso crescente (a parità di peso, per estremi): ${lista.map((e) => `${e.u}–${e.v} (${e.w})`).join(', ')}.`,
      {},
      snap()
    );
    t.step('uf', `<code>UnionFind uf(${n})</code>: ogni nodo è un insieme da solo, <code>padre[x] = x</code> e <code>rango[x] = 0</code>.`, {}, snap());
    lista.forEach((e, i) => {
      const before = padre.slice();
      const ru = trova(e.u);
      const rv = trova(e.v);
      const compressi = [];
      for (let x = 0; x < n; x++) if (padre[x] !== before[x]) compressi.push(x);
      const chgP = {};
      const chgR = {};
      for (const x of compressi) chgP[x] = 'new';
      const comp = compressi.length ? ` La ricerca comprime il cammino: ${compressi.map((x) => `padre[${x}] = ${padre[x]}`).join(', ')}.` : '';
      if (ru === rv) {
        stato[i] = 'rejected';
        t.count('scartati');
        t.step(
          'unisci',
          `Arco ${e.u}–${e.v} (peso ${e.w}): trova(${e.u}) = trova(${e.v}) = ${ru}, sono già nello stesso pezzo.${comp} L'arco chiuderebbe un ciclo: <code>unisci</code> restituisce false e l'arco è <b>scartato</b>.`,
          { u: e.u, v: e.v, w: e.w, totale },
          snap({ cur: i, chgP })
        );
        return;
      }
      let a = ru;
      let b = rv;
      if (rango[a] < rango[b]) [a, b] = [b, a];
      padre[b] = a;
      chgP[b] = 'new';
      const pari = rango[a] === rango[b];
      if (pari) {
        rango[a]++;
        chgR[a] = 'new';
      }
      stato[i] = 'done';
      t.step(
        'unisci',
        `Arco ${e.u}–${e.v} (peso ${e.w}): trova(${e.u}) = ${ru}, trova(${e.v}) = ${rv}, pezzi diversi.${comp} <code>unisci</code>: ` +
          (pari ? `ranghi uguali, ${b} va sotto ${a} e rango[${a}] sale a ${rango[a]}.` : `${b} ha rango minore e va sotto ${a}.`) +
          ' Restituisce true.',
        { u: e.u, v: e.v, w: e.w, totale },
        snap({ cur: i, chgP, chgR })
      );
      presi++;
      t.count('presi');
      t.step('prendi', `<code>albero.push_back</code>: l'arco ${e.u}–${e.v} entra nell'MST (${presi} di ${n - 1}).`, { u: e.u, v: e.v, w: e.w, totale }, snap({ cur: i }));
      totale += e.w;
      t.step('totale', `<code>totale += ${e.w}</code>, ora ${totale}.`, { u: e.u, v: e.v, w: e.w, totale }, snap({ cur: i }));
    });
    t.step('fine', `Restituisco totale = ${totale}.`, { totale }, snap());
    const comps = pieces(n, radice).list.length;
    const fin = snap();
    fin.res = { totale, presi };
    t.step(
      null,
      comps === 1
        ? `Fine: ${presi} archi presi (${m('n - 1')}), peso totale <b>${totale}</b>. Gli archi scartati chiudevano un ciclo: ognuno era il più pesante del suo ciclo.`
        : `Fine: il grafo non è connesso, e Kruskal restituisce una foresta di copertura minima (${comps} pezzi, ${presi} archi, peso ${totale}).`,
      { totale },
      fin
    );
    return t.frames;
  }

  /* ---------------------------------------------------------------- Prim */

  function tracePrim(g) {
    const t = new ASD.Tracer(['push', 'pop']);
    const n = g.n;
    const adj = G.adj(g);
    const key = Array(n).fill(Infinity);
    const inAlbero = Array(n).fill(false);
    const padre = Array(n).fill(-1);
    const pq = [];
    let totale = 0;
    let u = null;

    const snap = (o = {}) => {
      const nodes = {};
      for (let v = 0; v < n; v++) {
        const c = [];
        if (v === u && o.active) c.push('active');
        else if (inAlbero[v]) c.push('done');
        else if (key[v] < Infinity) c.push(o.newNode === v ? 'new' : 'gray');
        if (v === 0) c.push('src');
        nodes[v] = c;
      }
      const edges = {};
      for (let v = 0; v < n; v++) {
        if (padre[v] === -1) continue;
        edges[G.key(padre[v], v, false)] = inAlbero[v] ? 'done' : 'tree';
      }
      if (o.e) {
        const k = G.key(o.e[0], o.e[1], false);
        edges[k] = [].concat(edges[k] || [], 'compare');
      }
      const tags = {};
      for (let v = 0; v < n; v++) tags[v] = 'key=' + fmt(key[v]);
      const chg = o.chg || {};
      return G.snap(g, {
        nodes,
        edges,
        tags,
        tagCls: chg.key != null ? { [chg.key]: 'new' } : {},
        p: {
          pq: G.pqPanel(pq, (p) => inAlbero[p[1]] || p[0] > key[p[1]], { just: o.pushed, note: 'coppie (peso, nodo); barrate le copie vecchie' }),
          tab: {
            head: G.nodeHead(n, 'v'),
            rows: [
              { th: 'key', cells: key.map(fmt), cls: chg.key != null ? { [chg.key]: 'new' } : {} },
              { th: 'padre', cells: padre.map(String), cls: chg.padre != null ? { [chg.padre]: 'new' } : {} },
              { th: 'inAlbero', cells: inAlbero.map((b) => (b ? '1' : '0')), cls: chg.in != null ? { [chg.in]: 'new' } : {} },
            ],
            colCls: u != null && o.active ? { [u]: 'active' } : {},
          },
        },
      });
    };

    key[0] = 0;
    t.step('init', `<code>key[0] = 0</code>: l'albero parte dal nodo 0. Gli altri nodi hanno key = ∞: nessun arco li collega ancora all'albero.`, { totale }, snap({ chg: { key: 0 } }));
    pq.push([0, 0]);
    t.count('push');
    t.step('push-s', '<code>pq.push({0, 0})</code>.', { totale }, snap({ pushed: [0, 0] }));
    while (pq.length) {
      const [k, x] = G.pqPop(pq);
      u = x;
      t.count('pop');
      t.step('top', `Estraggo la coppia in cima: <b>(k, u) = (${k}, ${u})</b>.`, { k, u, totale }, snap({ active: true }));
      if (inAlbero[u]) {
        t.step('skip', `${u} è già nell'albero: copia vecchia, <code>continue</code>.`, { k, u, totale }, snap({ active: true }));
        u = null;
        continue;
      }
      t.step('skip', `${u} non è ancora nell'albero: è il nodo esterno collegato con l'arco più leggero${u ? ` (${padre[u]}–${u}, peso ${k})` : ''}.`, { k, u, totale }, snap({ active: true }));
      inAlbero[u] = true;
      t.step('prendi', u === 0 ? '<code>inAlbero[0] = true</code>: l\'albero è il solo nodo 0.' : `<code>inAlbero[${u}] = true</code>: l'arco ${padre[u]}–${u} entra nell'MST.`, { k, u, totale }, snap({ active: true, chg: { in: u } }));
      totale += k;
      t.step('totale', `<code>totale += ${k}</code>, ora ${totale}. Guardo gli archi di ${u} verso i nodi fuori dall'albero.`, { k, u, totale }, snap({ active: true }));
      for (const [v, w] of adj[u]) {
        if (!inAlbero[v] && w < key[v]) {
          t.step('relax', `Arco ${u}–${v} di peso ${w}: ${v} è fuori dall'albero e ${w} &lt; key[${v}] = ${fmt(key[v])}: è un collegamento migliore.`, { u, v, w, totale }, snap({ active: true, e: [u, v] }));
          key[v] = w;
          t.step('key', `<code>key[${v}] = ${w}</code>.`, { u, v, w, totale }, snap({ active: true, e: [u, v], chg: { key: v }, newNode: v }));
          padre[v] = u;
          t.step('padre', `<code>padre[${v}] = ${u}</code>.`, { u, v, w, totale }, snap({ active: true, e: [u, v], chg: { padre: v }, newNode: v }));
          pq.push([w, v]);
          t.count('push');
          t.step('push', `<code>pq.push({${w}, ${v}})</code>.`, { u, v, w, totale }, snap({ active: true, pushed: [w, v], newNode: v }));
        } else {
          t.step(
            'relax',
            inAlbero[v] ? `Arco ${u}–${v}: ${v} è già nell'albero, l'arco non serve.` : `Arco ${u}–${v} di peso ${w}: key[${v}] = ${fmt(key[v])} è già ≤ ${w}, niente da cambiare.`,
            { u, v, w, totale },
            snap({ active: true, e: [u, v] })
          );
        }
      }
    }
    u = null;
    t.step('fine', `La coda è vuota: restituisco totale = ${totale}.`, { totale }, snap());
    const fuori = inAlbero.map((b, v) => (b ? -1 : v)).filter((v) => v >= 0);
    const fin = snap();
    fin.res = { totale };
    t.step(
      null,
      fuori.length
        ? `Fine, ma ${G.list(fuori.map(String))} ${fuori.length === 1 ? 'non è raggiungibile' : 'non sono raggiungibili'} da 0: il grafo non è connesso, e Prim copre solo la componente di 0 (peso ${totale}).`
        : `Fine: peso totale <b>${totale}</b>, con gli archi verdi. ${t.c.push} push e ${t.c.pop} pop, ognuno ${m('O(log n)')}: ${m('Θ(m log n)')}.`,
      { totale },
      fin
    );
    return t.frames;
  }

  /* ------------------------------------------- strumento: la proprietà del taglio */

  function mountTaglio(host) {
    const g = G.esempi.mst;
    const n = g.n;
    let S = new Set([0]);
    const lab = h('div.lab.gr-lab');
    lab.append(h('div.lab-head', h('h3', { text: 'La proprietà del taglio' })));
    const body = h('div.lab-body.quadretti');
    const controls = h('div.lab-controls');
    const out = h('div.lab-out', { 'aria-live': 'polite' });
    lab.append(body, controls, out);
    host.append(lab);
    const view = new ASD.viz.GraphView(body, {
      onNode: (v) => {
        if (S.has(v)) S.delete(v);
        else S.add(v);
        draw();
      },
      tagW: 30,
      maxScale: 1.1,
    });
    const presets = [
      { label: 'S = {0}', set: [0] },
      { label: 'S = {0, 1}', set: [0, 1] },
      { label: 'S = {0, 1, 2, 3}', set: [0, 1, 2, 3] },
      { label: 'Svuota', set: [] },
    ];
    for (const p of presets) {
      const b = h('button.btn.btn-sm', { type: 'button', text: p.label });
      b.addEventListener('click', () => {
        S = new Set(p.set);
        draw();
      });
      controls.append(b);
    }
    controls.prepend(h('span.gr-hint', { html: 'Tocca un nodo (o raggiungilo con <kbd>Tab</kbd> e premi <kbd>Invio</kbd>) per metterlo in S o toglierlo.' }));

    function draw() {
      const nodes = {};
      const tags = {};
      for (let v = 0; v < n; v++) {
        nodes[v] = S.has(v) ? 'sel' : null;
        tags[v] = S.has(v) ? 'S' : '';
      }
      const crossing = g.edges.filter(([u, v]) => S.has(u) !== S.has(v));
      const min = crossing.length ? Math.min(...crossing.map((e) => e[2])) : null;
      const edges = {};
      for (const e of crossing) edges[G.key(e[0], e[1], false)] = e[2] === min ? 'done' : 'cut';
      view.render({ graph: g, nodes, edges, tags, tagCls: Object.fromEntries([...S].map((v) => [v, 'strong'])) });
      const nome = (e) => `${e[0]}–${e[1]} (${e[2]})`;
      let txt;
      if (!S.size || S.size === n) {
        txt = `Un taglio ha bisogno di nodi da tutte e due le parti: ${S.size ? 'togli' : 'metti'} almeno un nodo ${S.size ? 'da' : 'in'} ${m('S')}.`;
      } else {
        const light = crossing.filter((e) => e[2] === min);
        txt =
          `${m('S')} = {${[...S].sort((a, b) => a - b).join(', ')}}. Archi che attraversano il taglio: ${crossing.map(nome).join(', ')}. ` +
          (light.length === 1
            ? `Il più leggero è <strong>${nome(light[0])}</strong>: è l'unico di peso ${min}, quindi sta in <em>ogni</em> MST.`
            : `Ci sono ${light.length} archi di peso minimo ${min} (${light.map(nome).join(', ')}): ognuno sta in almeno un MST, e ogni MST ne contiene almeno uno.`);
      }
      out.innerHTML = `<p>${txt}</p>`;
    }
    draw();
  }

  /* ----------------------------------------- due MST dello stesso peso */

  function mountDue(host) {
    const g = G.esempi.mst;
    const alberi = [
      { t: 'Kruskal', d: 'prende 0–3: a parità di peso 2 viene prima di 1–2 nell\'ordinamento.', e: [[0, 1], [2, 3], [0, 3], [4, 5], [1, 4]] },
      { t: 'Prim da 0', d: 'prende 1–2: raggiunge 2 da 1, e poi 3 da 2 con l\'arco di peso 1.', e: [[0, 1], [1, 2], [2, 3], [1, 4], [4, 5]] },
    ];
    const grid = h('div.gr-due');
    for (const a of alberi) {
      const pic = h('div.gr-card-pic.quadretti');
      const fig = h('figure.gr-card', pic, h('figcaption', h('strong', `${a.t}, peso 9.`), ' ', a.d));
      grid.append(fig);
      const edges = {};
      for (const e of g.edges) edges[G.key(e[0], e[1], false)] = 'out';
      for (const [u, v] of a.e) edges[G.key(u, v, false)] = 'done';
      const v = new ASD.viz.GraphView(pic, { maxScale: 1, ariaLabel: `MST trovato da ${a.t}: archi ${a.e.map((e) => e.join('–')).join(', ')}` });
      v.render({ graph: g, edges });
    }
    host.append(grid);
  }
})();
