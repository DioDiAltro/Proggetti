# ASD a quadretti

Corso accelerato e interattivo per l'esame di **Algoritmi e Strutture Dati** in
**C++**: il C++ che serve, gli algoritmi visualizzati riga per riga sul codice
vero, e un metodo passo-passo per calcolare la complessità.

## Come si apre

- **Sul computer:** apri `index.html` con il browser (doppio clic). Funziona
  anche senza internet; online carica anche i caratteri tipografici.
- **Come sito:** si può pubblicare con GitHub Pages puntando alla cartella `UNI`.

## Cosa c'è dentro

| Parte | Contenuto |
|---|---|
| Inizio | come si usa il sito; compilare ed eseguire (g++, terminale, Compiler Explorer) |
| 1 · C++ essenziale | basi, funzioni e riferimenti, puntatori e memoria, struct, classi e template, STL, ricorsione |
| 2 · Complessità | contare i passi, O/Ω/Θ, il metodo per calcolarla, laboratorio, ricorrenze e teorema master |
| 3 · Ricerca e ordinamento | ricerca lineare e binaria, ordinamenti semplici, merge sort, quicksort, counting e radix sort, limite Ω(n log n), confronto finale |
| 4 · Strutture dati | liste concatenate, pile e code, tabelle hash, alberi e visite, alberi binari di ricerca, heap |
| 5 · Grafi | rappresentazioni, BFS e DFS, ordinamento topologico, Dijkstra e Bellman-Ford, Kruskal (union-find) e Prim |
| 6 · Tecniche | greedy (attività, Huffman), programmazione dinamica, zaino 0/1, LCS, distanza di edit |
| 7 · Verso l'esame | formulario con tutti i costi, esercizi e simulazioni con soluzione spiegata |

In ogni capitolo:

- **visualizzazioni passo-passo**: l'algoritmo gira sul disegno e la riga di
  C++ che sta eseguendo si evidenzia, con le variabili e i contatori
  (confronti, scambi…); si può cambiare l'input;
- **laboratori** per provare a mano (alberi, tabelle hash, grafi, la
  complessità di un frammento di codice…);
- riquadri **Da ricordare**, **Errore tipico**, **All'esame**, la tabella dei
  costi e una **verifica rapida** con le risposte spiegate.

Il segno "fatto" dei capitoli resta salvato nel browser.

Ogni esempio di codice è un programma completo in `esempi/`, compilato e
controllato con:

```bash
g++ -std=c++17 -Wall -Wextra -pedantic esempi/ordinamento/insertion_sort.cpp -o insertion
./insertion
```

## Per chi modifica il sito

- [`docs/design.md`](docs/design.md): obiettivi, assunzioni, scelte.
- [`docs/architettura.md`](docs/architettura.md): come è fatto e come si aggiunge un capitolo.
- Verifiche: `node tools/check-cpp.mjs` (esempi C++), `node tools/smoke.mjs`
  (tutti i capitoli in un browser headless; serve Playwright).
