/* ASD a quadretti — l'indice del corso.
   Ordine e titoli dei capitoli stanno qui; il contenuto di ogni capitolo sta in
   assets/js/chapters/<parte>/<id>.js e si registra con ASD.chapter({...}).
   Un capitolo senza file compare nell'indice come "in preparazione". */
(function () {
  'use strict';

  ASD.parts = [
    {
      id: 'inizio',
      title: 'Inizio',
      chapters: [
        { id: 'home', title: 'Benvenuti' },
        { id: 'setup', title: 'Compilare ed eseguire', todo: 'Come installare g++, compilare da terminale e usare Compiler Explorer.' },
      ],
    },
    {
      id: 'cpp',
      n: 1,
      title: 'C++ essenziale',
      chapters: [
        { id: 'cpp-basi', title: 'Basi del linguaggio', todo: 'Struttura di un programma, tipi, input/output, operatori, controllo di flusso.' },
        { id: 'cpp-funzioni', title: 'Funzioni e riferimenti', todo: 'Parametri per valore e per riferimento, lo stack delle chiamate.' },
        { id: 'cpp-puntatori', title: 'Puntatori e memoria', todo: 'Indirizzi, puntatori, array, new e delete, stack e heap.' },
        { id: 'cpp-classi', title: 'Struct, classi e template', todo: 'Tipi definiti dall\'utente, costruttori, distruttori, template.' },
        { id: 'cpp-stl', title: 'La libreria standard (STL)', todo: 'vector, string, stack, queue, priority_queue, set, map e i loro costi.' },
        { id: 'cpp-ricorsione', title: 'Ricorsione', todo: 'Caso base, passo ricorsivo, stack delle chiamate, albero delle chiamate.' },
      ],
    },
    {
      id: 'complessita',
      n: 2,
      title: 'Complessità',
      chapters: [
        { id: 'cx-costo', title: 'Contare i passi', todo: 'Modello di costo, operazione dominante, caso migliore, peggiore e medio.' },
        { id: 'cx-notazioni', title: 'Notazioni O, Ω, Θ', todo: 'Definizioni con c e n₀, proprietà, crescita delle funzioni.' },
        { id: 'cx-metodo', title: 'Il metodo per calcolarla', todo: 'Le regole per cicli, cicli annidati, logaritmi e chiamate, con il codice annotato.' },
        { id: 'cx-laboratorio', title: 'Laboratorio', todo: 'Misura i passi di frammenti di codice e indovina la complessità.' },
        { id: 'cx-ricorrenze', title: 'Ricorrenze e teorema master', todo: 'Albero di ricorsione, sostituzione, teorema master.' },
      ],
    },
    {
      id: 'ordinamento',
      n: 3,
      title: 'Ricerca e ordinamento',
      chapters: [
        { id: 'ricerca', title: 'Ricerca lineare e binaria', todo: 'Ricerca sequenziale, ricerca binaria iterativa e ricorsiva, lower_bound.' },
        { id: 'sort-semplici', title: 'Ordinamenti semplici' },
        { id: 'merge-sort', title: 'Merge sort', todo: 'Divide et impera, la fusione, l\'albero di ricorsione.' },
        { id: 'quick-sort', title: 'Quicksort', todo: 'Partizione, scelta del pivot, caso peggiore e medio.' },
        { id: 'sort-lineari', title: 'Ordinamenti in tempo lineare', todo: 'Limite inferiore Ω(n log n), counting sort, radix sort.' },
        { id: 'sort-confronto', title: 'Confronto finale', todo: 'Tutti gli ordinamenti a confronto sugli stessi dati.' },
      ],
    },
    {
      id: 'strutture',
      n: 4,
      title: 'Strutture dati',
      chapters: [
        { id: 'liste', title: 'Liste concatenate', todo: 'Nodi e puntatori, inserimento, cancellazione, liste doppie.' },
        { id: 'pile-code', title: 'Pile e code', todo: 'LIFO e FIFO, implementazioni con array e con liste, coda circolare.' },
        { id: 'hash', title: 'Tabelle hash', todo: 'Funzioni hash, liste di trabocco, indirizzamento aperto, fattore di carico.' },
        { id: 'alberi', title: 'Alberi binari e visite', todo: 'Terminologia, rappresentazione, visite in profondità e per livelli.' },
        { id: 'bst', title: 'Alberi binari di ricerca', todo: 'Ricerca, inserimento, cancellazione, altezza e bilanciamento.' },
        { id: 'heap', title: 'Heap e code con priorità', todo: 'Heap binario su array, heapify, build-heap, heapsort.' },
      ],
    },
    {
      id: 'grafi',
      n: 5,
      title: 'Grafi',
      chapters: [
        { id: 'grafi-intro', title: 'Rappresentare un grafo', todo: 'Terminologia, matrice e liste di adiacenza, costi.' },
        { id: 'visite', title: 'Visite BFS e DFS', todo: 'Visita in ampiezza e in profondità, ordinamento topologico.' },
        { id: 'cammini-minimi', title: 'Cammini minimi', todo: 'Dijkstra e Bellman-Ford.' },
        { id: 'mst', title: 'Alberi di copertura minimi', todo: 'Kruskal con union-find, Prim.' },
      ],
    },
    {
      id: 'tecniche',
      n: 6,
      title: 'Tecniche di progetto',
      chapters: [
        { id: 'greedy', title: 'Algoritmi greedy', todo: 'Scelta golosa, selezione di attività, quando il greedy sbaglia.' },
        { id: 'dp', title: 'Programmazione dinamica', todo: 'Sottoproblemi, memoizzazione e tabulazione.' },
        { id: 'dp-problemi', title: 'Problemi classici di PD', todo: 'Zaino 0/1, sottosequenza comune più lunga, distanza di edit.' },
      ],
    },
    {
      id: 'esame',
      n: 7,
      title: 'Verso l\'esame',
      chapters: [
        { id: 'formulario', title: 'Formulario', todo: 'Tutti i costi in una pagina.' },
        { id: 'esercizi', title: 'Esercizi d\'esame', todo: 'Esercizi misti con soluzione spiegata.' },
      ],
    },
  ];
})();
