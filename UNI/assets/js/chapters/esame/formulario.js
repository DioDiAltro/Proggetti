/* ASD a quadretti — capitolo "Formulario": tutti i costi del corso in una
   pagina, con un collegamento al capitolo dove sono spiegati. */
(function () {
  'use strict';

  const { m, table, box } = ASD;
  const L = (id, text, sec) => ASD.link(id, sec || null, text);

  ASD.chapter({
    id: 'formulario',
    title: 'Formulario',
    lead:
      'Tutti i costi del corso in una pagina: notazioni, somme, ricorrenze, ordinamenti, strutture dati, grafi, STL e tecniche. Ogni riga porta al capitolo dove è spiegata.',
    minutes: 10,
    goals: [
      'ripassare in pochi minuti prima dell\'esame',
      'confrontare strutture e algoritmi per scegliere quello giusto',
      'ritrovare subito il capitolo che spiega una formula',
    ],

    render(el) {
      el.innerHTML = `
<section id="notazioni">
  <h2>Notazioni</h2>
  ${table({
    head: ['', 'Definizione', 'Si legge'],
    rows: [
      [m('f = O(g)'), `${m('∃ c > 0, n_0 : f(n) <= c g(n)')} per ogni ${m('n >= n_0')}`, 'cresce al più come'],
      [m('f = Ω(g)'), `${m('∃ c > 0, n_0 : f(n) >= c g(n)')} per ogni ${m('n >= n_0')}`, 'cresce almeno come'],
      [m('f = Θ(g)'), `${m('f = O(g)')} e ${m('f = Ω(g)')}`, 'cresce esattamente come'],
      [m('lim f/g = 0'), `${m('f = O(g)')}, non ${m('Ω(g)')}`, ''],
      [m('lim f/g = c > 0'), m('f = Θ(g)'), ''],
    ],
  })}
  <p class="formula">${m('1 ≺ log log n ≺ log n ≺ √n ≺ n ≺ n log n ≺ n^2 ≺ n^3 ≺ 2^n ≺ n! ≺ n^n')}</p>
  <p>Costanti e termini minori si eliminano; la base del logaritmo non conta; ${m('log(n!) = Θ(n log n)')}.
  ${L('cx-notazioni', 'Notazioni O, Ω, Θ')} · ${L('cx-metodo', 'Il metodo')}</p>
</section>

<section id="somme">
  <h2>Somme e conteggi</h2>
  ${table({
    head: ['Somma', 'Valore', 'Crescita'],
    rows: [
      [m('Σ_{i=1}^{n} i'), m('n(n+1)/2'), m('Θ(n^2)')],
      [m('Σ_{i=1}^{n} i^2'), m('n(n+1)(2n+1)/6'), m('Θ(n^3)')],
      [m('Σ_{i=0}^{k} 2^i'), m('2^{k+1} - 1'), m('Θ(2^k)')],
      [m('n + n/2 + n/4 + …'), m('< 2n'), m('Θ(n)')],
      [m('Σ_{i=1}^{n} 1/i'), m('ln n + O(1)'), m('Θ(log n)')],
      ['dimezzamenti di ' + m('n') + ' fino a 1', m('⌊log_2 n⌋'), m('Θ(log n)')],
    ],
  })}
</section>

<section id="ricorrenze">
  <h2>Ricorrenze</h2>
  <p>Teorema master per ${m('T(n) = aT(n/b) + Θ(n^d)')}, con ${m('a >= 1')}, ${m('b > 1')}:</p>
  ${table({
    head: ['Confronto', 'Risultato', 'Chi domina'],
    rows: [
      [m('d < log_b a'), m('Θ(n^{log_b a})'), 'le foglie'],
      [m('d = log_b a'), m('Θ(n^d log n)'), 'tutti i livelli uguali'],
      [m('d > log_b a'), m('Θ(n^d)'), 'la radice'],
    ],
  })}
  ${table({
    head: ['Ricorrenza', 'Soluzione', 'Esempio'],
    rows: [
      [m('T(n-1) + Θ(1)'), m('Θ(n)'), 'somma ricorsiva'],
      [m('T(n-1) + Θ(n)'), m('Θ(n^2)'), 'quicksort nel caso peggiore'],
      [m('T(n/2) + Θ(1)'), m('Θ(log n)'), 'ricerca binaria'],
      [m('2T(n/2) + Θ(1)'), m('Θ(n)'), 'visita di un albero'],
      [m('2T(n/2) + Θ(n)'), m('Θ(n log n)'), 'merge sort'],
      [m('2T(n-1) + Θ(1)'), m('Θ(2^n)'), 'torre di Hanoi'],
      [m('T(n-1) + T(n-2) + Θ(1)'), m('Θ(φ^n)'), 'Fibonacci ricorsivo'],
    ],
  })}
  <p>${L('cx-ricorrenze', 'Ricorrenze e teorema master')}</p>
</section>

<section id="ordinamento">
  <h2>Ricerca e ordinamento</h2>
  ${table({
    head: ['Algoritmo', 'Migliore', 'Medio', 'Peggiore', 'Memoria extra', 'Stabile', 'Sul posto'],
    rows: [
      [L('sort-semplici', 'Selection sort', 'selection'), m('Θ(n^2)'), m('Θ(n^2)'), m('Θ(n^2)'), m('O(1)'), 'no', 'sì'],
      [L('sort-semplici', 'Insertion sort', 'insertion'), m('Θ(n)'), m('Θ(n^2)'), m('Θ(n^2)'), m('O(1)'), 'sì', 'sì'],
      [L('sort-semplici', 'Bubble sort', 'bubble'), m('Θ(n)'), m('Θ(n^2)'), m('Θ(n^2)'), m('O(1)'), 'sì', 'sì'],
      [L('merge-sort', 'Merge sort'), m('Θ(n log n)'), m('Θ(n log n)'), m('Θ(n log n)'), m('Θ(n)'), 'sì', 'no'],
      [L('quick-sort', 'Quicksort'), m('Θ(n log n)'), m('Θ(n log n)'), m('Θ(n^2)'), `${m('O(log n)')} di stack in media`, 'no', 'sì'],
      [L('heap', 'Heapsort'), m('Θ(n log n)'), m('Θ(n log n)'), m('Θ(n log n)'), m('O(1)'), 'no', 'sì'],
      [L('sort-lineari', 'Counting sort'), m('Θ(n + k)'), m('Θ(n + k)'), m('Θ(n + k)'), m('Θ(n + k)'), 'sì', 'no'],
      [L('sort-lineari', 'Radix sort'), m('Θ(d(n + b))'), m('Θ(d(n + b))'), m('Θ(d(n + b))'), m('Θ(n + b)'), 'sì', 'no'],
    ],
  })}
  <p>Ogni ordinamento per confronto fa ${m('Ω(n log n)')} confronti nel caso peggiore. Counting e radix sort non confrontano:
  ${m('k')} è l'ampiezza dei valori, ${m('d')} il numero di cifre in base ${m('b')}.</p>
  ${table({
    head: ['Ricerca', 'Migliore', 'Peggiore', 'Requisito'],
    rows: [
      [L('ricerca', 'Lineare'), m('Θ(1)'), m('Θ(n)'), 'nessuno'],
      [L('ricerca', 'Binaria'), m('Θ(1)'), m('Θ(log n)'), 'array ordinato'],
    ],
  })}
</section>

<section id="strutture">
  <h2>Strutture dati</h2>
  ${table({
    head: ['Struttura', 'Accesso per posizione', 'Ricerca', 'Inserimento', 'Cancellazione'],
    rows: [
      ['Array / <code>vector</code>', m('Θ(1)'), m('Θ(n)'), `${m('Θ(1)')} amm. in fondo, ${m('Θ(n)')} in mezzo`, m('Θ(n)')],
      ['Array ordinato', m('Θ(1)'), m('Θ(log n)'), m('Θ(n)'), m('Θ(n)')],
      [L('liste', 'Lista concatenata'), m('Θ(n)'), m('Θ(n)'), `${m('Θ(1)')} in testa o dopo un nodo dato`, `${m('Θ(1)')} dato il nodo (lista doppia)`],
      [L('pile-code', 'Pila / coda'), '—', '—', `${m('Θ(1)')} (push / enqueue)`, `${m('Θ(1)')} (pop / dequeue)`],
      [L('hash', 'Tabella hash'), '—', `${m('Θ(1)')} medio, ${m('Θ(n)')} peggiore`, `${m('Θ(1)')} medio`, `${m('Θ(1)')} medio`],
      [L('bst', 'Albero binario di ricerca'), '—', `${m('Θ(h)')}: da ${m('log n')} a ${m('n')}`, m('Θ(h)'), m('Θ(h)')],
      [L('bst', 'Albero bilanciato (AVL, rosso-nero)'), '—', m('Θ(log n)'), m('Θ(log n)'), m('Θ(log n)')],
      [L('heap', 'Heap binario'), `massimo ${m('Θ(1)')}`, m('Θ(n)'), m('Θ(log n)'), `estrai max ${m('Θ(log n)')}`],
    ],
  })}
  <p>Costruire uno heap da ${m('n')} elementi costa ${m('Θ(n)')}. Union-find con unione per rango e compressione dei cammini:
  costo ammortizzato quasi costante per operazione (${L('mst', 'Alberi di copertura minimi')}).</p>
</section>

<section id="grafi">
  <h2>Grafi</h2>
  <p>Con ${m('V')} vertici ed ${m('E')} archi. Matrice di adiacenza: spazio ${m('Θ(V^2)')}; liste di adiacenza: spazio ${m('Θ(V + E)')}.</p>
  ${table({
    head: ['Algoritmo', 'Problema', 'Costo (liste)', 'Note'],
    rows: [
      [L('visite', 'BFS'), 'visita, cammini minimi senza pesi', m('Θ(V + E)'), 'usa una coda'],
      [L('visite', 'DFS'), 'visita, componenti, cicli', m('Θ(V + E)'), 'ricorsione o pila'],
      [L('visite', 'Ordinamento topologico'), 'ordine di un DAG', m('Θ(V + E)'), 'solo grafi aciclici'],
      [L('cammini-minimi', 'Dijkstra'), 'cammini minimi da una sorgente', m('Θ((V + E) log V)'), 'pesi non negativi'],
      [L('cammini-minimi', 'Bellman-Ford'), 'cammini minimi da una sorgente', m('Θ(V · E)'), 'pesi negativi, trova i cicli negativi'],
      [L('cammini-minimi', 'Floyd-Warshall'), 'cammini minimi tra tutte le coppie', m('Θ(V^3)'), 'programmazione dinamica'],
      [L('mst', 'Kruskal'), 'albero di copertura minimo', m('Θ(E log E)'), 'ordina gli archi + union-find'],
      [L('mst', 'Prim'), 'albero di copertura minimo', m('Θ(E log V)'), 'coda con priorità'],
    ],
  })}
</section>

<section id="stl">
  <h2>La STL in una tabella</h2>
  ${table({
    head: ['Contenitore / funzione', 'Operazione', 'Costo'],
    rows: [
      ['<code>vector</code>', '<code>push_back</code>, <code>pop_back</code>, <code>[]</code>', `${m('Θ(1)')} (push_back ammortizzato)`],
      ['<code>vector</code>', '<code>insert</code> / <code>erase</code> in mezzo o in testa', m('Θ(n)')],
      ['<code>deque</code>', 'push / pop in testa e in fondo, <code>[]</code>', m('Θ(1)')],
      ['<code>list</code>', 'insert / erase dato un iteratore', m('Θ(1)')],
      ['<code>stack</code>, <code>queue</code>', 'push, pop, top / front', m('Θ(1)')],
      ['<code>priority_queue</code>', '<code>push</code>, <code>pop</code> / <code>top</code>', `${m('Θ(log n)')} / ${m('Θ(1)')}`],
      ['<code>set</code>, <code>map</code>', 'insert, find, erase, count', m('Θ(log n)')],
      ['<code>unordered_set</code>, <code>unordered_map</code>', 'insert, find, erase', `${m('Θ(1)')} medio, ${m('Θ(n)')} peggiore`],
      ['<code>sort</code>, <code>stable_sort</code>', 'ordina', m('Θ(n log n)')],
      ['<code>binary_search</code>, <code>lower_bound</code>', 'su intervallo ordinato', m('Θ(log n)')],
      ['<code>find</code>, <code>count</code>, <code>min_element</code>', 'scansione', m('Θ(n)')],
    ],
  })}
  <p>${L('cpp-stl', 'La libreria standard (STL)')}</p>
</section>

<section id="tecniche">
  <h2>Tecniche</h2>
  ${table({
    head: ['Tecnica', 'Idea', 'Esempi e costi'],
    rows: [
      ['Divide et impera', 'dividi, risolvi i pezzi ricorsivamente, combina', `merge sort ${m('Θ(n log n)')}, ricerca binaria ${m('Θ(log n)')}`],
      [L('greedy', 'Greedy'), 'a ogni passo la scelta che sembra migliore; va dimostrata', `selezione di attività ${m('Θ(n log n)')}, Dijkstra, Kruskal, Prim`],
      [L('dp', 'Programmazione dinamica'), 'sottoproblemi sovrapposti, si risolvono una volta sola e si salvano', `Fibonacci ${m('Θ(n)')}, zaino 0/1 ${m('Θ(nW)')}, LCS ${m('Θ(nm)')}, edit distance ${m('Θ(nm)')}`],
    ],
  })}
  ${box('esame', `<p>Il costo di una programmazione dinamica è sempre <em>numero di sottoproblemi × costo per sottoproblema</em>.
  Per lo zaino: ${m('(n+1)(W+1)')} caselle, ${m('Θ(1)')} ciascuna, quindi ${m('Θ(nW)')}.</p>`)}
</section>`;
    },
  });
})();
