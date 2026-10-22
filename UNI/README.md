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
| 1 · C++ essenziale | basi, funzioni e riferimenti, puntatori e memoria, classi e template, STL, ricorsione |
| 2 · Complessità | contare i passi, O/Ω/Θ, il metodo per calcolarla, laboratorio, ricorrenze e teorema master |
| 3 · Ricerca e ordinamento | ricerca binaria, ordinamenti semplici, merge sort, quicksort, ordinamenti lineari |
| 4 · Strutture dati | liste, pile e code, hash, alberi, alberi binari di ricerca, heap |
| 5 · Grafi | rappresentazioni, BFS e DFS, cammini minimi, alberi di copertura minimi |
| 6 · Tecniche | greedy, programmazione dinamica |
| 7 · Verso l'esame | formulario, esercizi |

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
