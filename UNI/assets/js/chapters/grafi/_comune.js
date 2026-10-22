/* ASD a quadretti — utilità comuni ai capitoli della parte "grafi".

   ASD.grafi.esempi.<nome>        grafi d'esempio con le coordinate dei nodi (gli stessi dei main in esempi/grafi)
   ASD.grafi.adj(g)               liste di adiacenza nello stesso ordine del C++ (push_back nell'ordine degli archi)
   ASD.grafi.parse(text, o)       "0-1, 1>2:4" → grafo; lancia Error con un messaggio in italiano
   ASD.grafi.format(g)            grafo → testo per il campo di input
   ASD.grafi.input(g, o)          specifica di input per lo Stepper (testo, esempi, analisi)
   ASD.grafi.snap(g, o)           stato per ASD.viz.GraphScene
   ASD.grafi.check.*              controlli indipendenti per validate(): BFS, cammini minimi, MST, ordine topologico
   ASD.grafi.legend.*             legende dei colori
   Convenzioni: nodi numerati da 0 (come gli indici di vector), sorgente sempre 0. */
(function () {
  'use strict';

  const G = (ASD.grafi = ASD.grafi || {});

  G.INF = '∞';
  G.MAX_N = 9;
  G.MAX_E = 16;

  /* ---------------------------------------------------------- esempi */

  G.esempi = {
    // Rappresentare un grafo: 6 nodi, 8 archi (orientati come nel disegno "orientato")
    intro: {
      n: 6,
      directed: false,
      pos: [[40, 40], [160, 40], [280, 70], [40, 170], [160, 170], [280, 190]],
      edges: [[0, 1, 4], [3, 0, 2], [4, 0, 5], [1, 2, 3], [1, 4, 1], [3, 4, 6], [4, 5, 2], [5, 2, 7]],
    },
    // costruzione delle liste: lo stesso grafo, non pesato, archi come in rappresentazioni.cpp
    liste: {
      n: 6,
      directed: false,
      pos: [[40, 40], [160, 40], [280, 70], [40, 170], [160, 170], [280, 190]],
      edges: [[0, 1], [0, 3], [0, 4], [1, 2], [1, 4], [3, 4], [4, 5], [2, 5]],
    },
    // BFS: come in bfs.cpp
    bfs: {
      n: 7,
      directed: false,
      pos: [[30, 115], [110, 40], [110, 190], [190, 115], [270, 40], [270, 190], [350, 115]],
      edges: [[0, 1], [0, 2], [1, 3], [1, 4], [2, 3], [2, 5], [3, 6], [4, 6], [5, 6]],
    },
    // DFS: come in dfs.cpp (due alberi, archi di tutti i tipi)
    dfs: {
      n: 6,
      directed: true,
      pos: [[40, 40], [160, 40], [100, 150], [230, 150], [290, 40], [350, 150]],
      edges: [[0, 1], [0, 2], [1, 2], [2, 0], [3, 2], [3, 4], [4, 5], [5, 3]],
    },
    // DAG: come in topologico.cpp
    dag: {
      n: 7,
      directed: true,
      pos: [[160, 30], [160, 115], [280, 50], [40, 50], [280, 180], [40, 180], [160, 205]],
      edges: [[3, 0], [3, 1], [5, 1], [5, 6], [0, 2], [1, 2], [1, 4], [6, 4]],
    },
    // Dijkstra: come in dijkstra.cpp
    dijkstra: {
      n: 6,
      directed: true,
      pos: [[30, 115], [140, 40], [140, 190], [260, 40], [260, 190], [360, 115]],
      edges: [[0, 1, 7], [0, 2, 2], [2, 1, 3], [2, 4, 8], [1, 3, 1], [1, 4, 2], [3, 5, 5], [4, 5, 1]],
    },
    // il controesempio con un peso negativo: come in controesempio.cpp
    negativo: {
      n: 4,
      directed: true,
      pos: [[40, 110], [170, 40], [170, 180], [300, 40]],
      edges: [[0, 1, 2], [0, 2, 4], [2, 1, -3], [1, 3, 2]],
    },
    // Bellman-Ford: come in bellman_ford.cpp (ordine degli archi "sfortunato")
    bf: {
      n: 5,
      directed: true,
      pos: [[40, 115], [170, 40], [170, 190], [300, 40], [300, 190]],
      edges: [[3, 4, 2], [1, 3, 3], [2, 1, -2], [0, 2, 5], [0, 1, 4], [2, 4, 6]],
    },
    // MST: come in kruskal.cpp e prim.cpp (pareggi: i due algoritmi scelgono alberi diversi)
    mst: {
      n: 6,
      directed: false,
      pos: [[40, 40], [170, 40], [170, 170], [40, 170], [300, 40], [300, 170]],
      edges: [[0, 1, 1], [0, 3, 2], [1, 2, 2], [1, 4, 3], [2, 3, 1], [2, 5, 4], [4, 5, 2], [2, 4, 5]],
    },
  };
  G.esempi.bfCiclo = Object.assign({}, G.esempi.bf, { edges: G.esempi.bf.edges.concat([[3, 2, -5]]) });

  /* ------------------------------------------------ strutture di base */

  const key = (u, v, directed) => ASD.viz.GraphView.key(u, v, directed);
  G.key = key;

  /** Liste di adiacenza nello stesso ordine del programma C++. Pesato: elementi [v, w]. */
  G.adj = function (g) {
    const weighted = isWeighted(g);
    const adj = Array.from({ length: g.n }, () => []);
    for (const [u, v, w] of g.edges) {
      adj[u].push(weighted ? [v, w] : v);
      if (!g.directed) adj[v].push(weighted ? [u, w] : u);
    }
    return adj;
  };

  function isWeighted(g) {
    return g.weighted != null ? g.weighted : g.edges.some((e) => e.length > 2 && e[2] != null);
  }
  G.isWeighted = isWeighted;

  /** Copia del grafo (per lo stato dei fotogrammi). */
  G.clone = (g) => JSON.parse(JSON.stringify(g));

  const arrow = (g) => (g.directed ? '→' : '–');
  G.arrow = arrow;
  /** Nome di un arco nel testo: "2→1" oppure "2–1". */
  G.edgeName = (g, u, v) => `${u}${arrow(g)}${v}`;

  G.fmtD = (d) => (d === Infinity || d == null ? G.INF : String(d));

  /** Disposizione su un cerchio (per i grafi scritti a mano con più nodi dell'esempio). */
  G.circle = function (n) {
    const R = 95 + Math.max(0, n - 6) * 9;
    const cx = R + 30;
    const cy = R + 20;
    return Array.from({ length: n }, (_, i) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
      return [Math.round(cx + R * Math.cos(a)), Math.round(cy + R * Math.sin(a))];
    });
  };

  /* ------------------------------------------------- lettura dell'input */

  /**
   * Legge "0-1, 0-2:4; 2>3:-1". Separatori: virgola, punto e virgola, a capo.
   * o: { directed, weighted, negative (pesi negativi ammessi), like (grafo di cui riusare il disegno) }
   */
  G.parse = function (text, o) {
    const parts = String(text)
      .split(/[,;\n]+/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (!parts.length) throw new Error('Scrivi almeno un arco, per esempio 0-1.');
    if (parts.length > G.MAX_E) throw new Error(`Al massimo ${G.MAX_E} archi, così il disegno resta leggibile.`);
    const edges = [];
    const seen = new Set();
    let n = 0;
    const sep = o.directed ? '>' : '-';
    for (const p of parts) {
      const m = /^(\d+)\s*(?:->|→|>|-|–)\s*(\d+)\s*(?:[:=(]\s*(-?\d+)\s*\)?)?$/.exec(p);
      if (!m) throw new Error(`«${p}» non è un arco: scrivi u${sep}v${o.weighted ? ':peso' : ''}, per esempio 0${sep}1${o.weighted ? ':4' : ''}.`);
      const u = Number(m[1]);
      const v = Number(m[2]);
      if (u >= G.MAX_N || v >= G.MAX_N) throw new Error(`«${p}»: al massimo ${G.MAX_N} nodi, numerati da 0 a ${G.MAX_N - 1}.`);
      if (u === v) throw new Error(`«${p}»: niente cappi (archi da un nodo a se stesso).`);
      let w = null;
      if (o.weighted) {
        if (m[3] == null) throw new Error(`Manca il peso di «${p}»: scrivi per esempio ${u}${sep}${v}:4.`);
        w = Number(m[3]);
        if (Math.abs(w) > 99) throw new Error(`«${p}»: pesi tra -99 e 99.`);
        if (w < 0 && !o.negative) throw new Error(`«${p}»: qui i pesi devono essere non negativi${o.negHint ? '. ' + o.negHint : '.'}`);
      } else if (m[3] != null) {
        throw new Error(`In questo grafo gli archi non hanno peso: scrivi solo ${u}${sep}${v}.`);
      }
      const k = key(u, v, o.directed);
      if (seen.has(k)) throw new Error(`L'arco «${p}» compare due volte.`);
      seen.add(k);
      edges.push(o.weighted ? [u, v, w] : [u, v]);
      n = Math.max(n, u + 1, v + 1);
    }
    n = Math.max(n, 2);
    // il disegno: quello dell'esempio se i nodi bastano, altrimenti un cerchio (stabile tra una modifica e l'altra)
    const base = o.base;
    const like = o.like;
    let pos;
    if (base && n <= base.pos.length) pos = base.pos.slice(0, n);
    else if (like && like.pos.length >= n && like.pos.length > (base ? base.pos.length : 0)) pos = like.pos.slice(0, n);
    else pos = G.circle(n);
    return { n, directed: Boolean(o.directed), pos, edges };
  };

  G.format = function (g) {
    const sep = g.directed ? '>' : '-';
    return g.edges.map((e) => `${e[0]}${sep}${e[1]}${e.length > 2 && e[2] != null ? ':' + e[2] : ''}`).join(', ');
  };

  /** Specifica d'input per lo Stepper. o: { weighted, negative, negHint, presets: [{label, value}] } */
  G.input = function (base, o = {}) {
    const weighted = o.weighted != null ? o.weighted : isWeighted(base);
    const sep = base.directed ? '>' : '-';
    let like = base;
    const remember = (v) => {
      like = v;
      return v;
    };
    return {
      value: base,
      label: o.label || `Archi (u${sep}v${weighted ? ':peso' : ''})`,
      parse: (text) => {
        const g = G.parse(text, { directed: base.directed, weighted, negative: o.negative, negHint: o.negHint, base, like });
        if (o.check) o.check(g);
        return remember(g);
      },
      format: G.format,
      presets: [{ label: 'Esempio', value: () => remember(base) }].concat(
        (o.presets || []).map((p) => ({ label: p.label, value: () => remember(typeof p.value === 'function' ? p.value() : p.value) }))
      ),
    };
  };

  /* ------------------------------------------------------------ stato */

  /** Stato per GraphScene: { g: stato del grafo, p: pannelli }. */
  G.snap = function (graph, o = {}) {
    return {
      g: { graph, nodes: o.nodes || {}, edges: o.edges || {}, tags: o.tags || {}, tagCls: o.tagCls || {}, eTags: o.eTags || {} },
      p: o.p || {},
    };
  };

  /** Riga di tabella con una colonna per nodo. */
  G.nodeHead = (n, corner = '') => [corner].concat(Array.from({ length: n }, (_, i) => String(i)));

  /** Coda (queue) per il pannello a celle: la testa a sinistra. */
  G.queueCells = (q, o = {}) => ({
    a: q.slice(),
    ids: q.map((x, i) => (o.ids ? o.ids[i] : x)),
    marks: o.marks || (q.length && o.front ? { 0: 'active' } : {}),
    ptrs: q.length ? { testa: 0 } : {},
    empty: o.empty || 'vuota',
  });

  /* ---------------------------------------------- controlli indipendenti */

  G.check = {
    /** Distanze in numero di archi (BFS senza colori). */
    bfsDist(g, s) {
      const adj = G.adj(Object.assign({}, g, { weighted: false, edges: g.edges.map((e) => [e[0], e[1]]) }));
      const dist = Array(g.n).fill(-1);
      dist[s] = 0;
      const q = [s];
      while (q.length) {
        const u = q.shift();
        for (const v of adj[u]) if (dist[v] === -1) {
          dist[v] = dist[u] + 1;
          q.push(v);
        }
      }
      return dist;
    },

    /** Bellman-Ford di controllo: distanze (Infinity se irraggiungibile) o null se c'è un ciclo negativo raggiungibile. */
    shortest(g, s) {
      const E = [];
      for (const [u, v, w] of g.edges) {
        E.push([u, v, w]);
        if (!g.directed) E.push([v, u, w]);
      }
      const d = Array(g.n).fill(Infinity);
      d[s] = 0;
      for (let k = 0; k < g.n - 1; k++) for (const [u, v, w] of E) if (d[u] + w < d[v]) d[v] = d[u] + w;
      for (const [u, v, w] of E) if (d[u] + w < d[v]) return null;
      return d;
    },

    /** Peso della foresta di copertura minima (Prim O(V^2) su ogni componente). */
    msf(g, onlyFrom) {
      const n = g.n;
      const W = Array.from({ length: n }, () => Array(n).fill(Infinity));
      for (const [u, v, w] of g.edges) {
        W[u][v] = Math.min(W[u][v], w);
        W[v][u] = Math.min(W[v][u], w);
      }
      const inT = Array(n).fill(false);
      let total = 0;
      let edges = 0;
      const starts = onlyFrom != null ? [onlyFrom] : [...Array(n).keys()];
      for (const s of starts) {
        if (inT[s]) continue;
        const key = Array(n).fill(Infinity);
        key[s] = 0;
        for (;;) {
          let u = -1;
          for (let v = 0; v < n; v++) if (!inT[v] && key[v] < Infinity && (u === -1 || key[v] < key[u])) u = v;
          if (u === -1) break;
          inT[u] = true;
          if (u !== s) {
            total += key[u];
            edges++;
          }
          for (let v = 0; v < n; v++) if (!inT[v] && W[u][v] < key[v]) key[v] = W[u][v];
        }
      }
      return { total, edges };
    },

    /** L'ordine è una permutazione dei nodi e ogni arco va da sinistra a destra? Restituisce un messaggio o null. */
    topo(order, g) {
      if (order.length !== g.n) return `l'ordine ha ${order.length} nodi invece di ${g.n}`;
      const at = Array(g.n).fill(-1);
      order.forEach((u, i) => (at[u] = i));
      if (at.some((x) => x < 0)) return 'l\'ordine non contiene tutti i nodi';
      for (const [u, v] of g.edges) if (at[u] > at[v]) return `l'arco ${u}→${v} va all'indietro nell'ordine`;
      return null;
    },

    /** Il grafo orientato ha un ciclo? */
    hasCycle(g) {
      const adj = G.adj(Object.assign({}, g, { weighted: false, edges: g.edges.map((e) => [e[0], e[1]]) }));
      const col = Array(g.n).fill(0);
      const visit = (u) => {
        col[u] = 1;
        for (const v of adj[u]) {
          if (col[v] === 1) return true;
          if (col[v] === 0 && visit(v)) return true;
        }
        col[u] = 2;
        return false;
      };
      for (let u = 0; u < g.n; u++) if (col[u] === 0 && visit(u)) return true;
      return false;
    },

    /** Componenti connesse (non orientato): etichette come in componenti.cpp. */
    components(n, edges) {
      const adj = Array.from({ length: n }, () => []);
      for (const [u, v] of edges) {
        adj[u].push(v);
        adj[v].push(u);
      }
      const comp = Array(n).fill(-1);
      let c = 0;
      for (let u = 0; u < n; u++) {
        if (comp[u] !== -1) continue;
        const st = [u];
        comp[u] = c;
        while (st.length) {
          const x = st.pop();
          for (const y of adj[x]) if (comp[y] === -1) {
            comp[y] = c;
            st.push(y);
          }
        }
        c++;
      }
      return { comp, count: c };
    },
  };

  /* ------------------------------------------------------------ legende */

  G.legend = {
    visita: [
      { k: 'gr-white', label: 'bianco: da scoprire' },
      { k: 'gr-gray', label: 'grigio: scoperto' },
      { k: 'gr-black', label: 'nero: finito' },
      { k: 'gr-active', label: 'u, il nodo in lavorazione' },
      { k: 'gr-e-compare', label: 'arco esaminato' },
      { k: 'gr-e-tree', label: 'arco dell\'albero' },
    ],
    dfs: [
      { k: 'gr-gray', label: 'grigio: aperto' },
      { k: 'gr-black', label: 'nero: finito' },
      { k: 'gr-active', label: 'u' },
      { k: 'gr-e-tree', label: 'T albero' },
      { k: 'gr-e-back', label: 'B all\'indietro' },
      { k: 'gr-e-forward', label: 'F in avanti' },
      { k: 'gr-e-cross', label: 'C di attraversamento' },
    ],
    cammini: [
      { k: 'gr-gray', label: 'raggiunto' },
      { k: 'gr-done', label: 'fatto: distanza definitiva' },
      { k: 'gr-active', label: 'u estratto' },
      { k: 'gr-e-compare', label: 'arco esaminato' },
      { k: 'gr-e-new', label: 'rilassamento riuscito' },
      { k: 'gr-e-tree', label: 'padre[v] → v' },
    ],
  };

  /* --------------------------------------------------------- piccole utilità */

  /** Ordina una coda con priorità di coppie [d, v] come std::priority_queue con greater (in cima la minima). */
  G.pqSorted = (pq) => pq.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  /** Estrae la coppia minima (come pq.top(); pq.pop();). */
  G.pqPop = (pq) => {
    let best = 0;
    for (let i = 1; i < pq.length; i++) if (pq[i][0] < pq[best][0] || (pq[i][0] === pq[best][0] && pq[i][1] < pq[best][1])) best = i;
    return pq.splice(best, 1)[0];
  };

  /** Pannello della coda con priorità: gettoni in ordine, la cima per prima; le copie vecchie barrate. */
  G.pqPanel = (pq, isStale, o = {}) => ({
    items: G.pqSorted(pq).map((p, i) => ({
      t: `(${p[0]}, ${p[1]})`,
      cls: [i === 0 ? 'top' : null, isStale(p) ? 'stale' : null, o.just && o.just[0] === p[0] && o.just[1] === p[1] ? 'new' : null],
    })),
    empty: 'vuota',
    note: o.note,
  });

  /** Elenco "a, b e c". */
  G.list = (xs) => (xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' e ' + xs[xs.length - 1]);
})();
