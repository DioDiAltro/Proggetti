# Come è fatto il sito (e come si aggiunge un capitolo)

Guida per chi scrive o modifica capitoli. Il capitolo modello è
`assets/js/chapters/ordinamento/sort-semplici.js`: quando un dubbio non è
risolto qui, si fa come lì.

## Cartelle

```
UNI/
├── index.html                  guscio della pagina: carica CSS e script in ordine
├── assets/
│   ├── css/
│   │   ├── base.css            token di colore, tipografia, impaginazione, riquadri, tabelle, bottoni
│   │   ├── components.css      codice, visualizzatore passo-passo, array, alberi, grafici, quiz, .lab
│   │   └── areas/<parte>.css   stili specifici di una parte (uno per parte)
│   └── js/
│       ├── core/               asd.js (utilità), outline.js (indice), highlight.js, code.js,
│       │                       stepper.js, quiz.js, app.js (navigazione, va caricato per ultimo)
│       ├── viz/                viste riusabili: array, tree, plot (+ memory, list, hash, graph, table)
│       ├── sources/<parte>.js  GENERATI da tools/build-sources.mjs: non modificarli a mano
│       └── chapters/<parte>/   un file per capitolo + _comune.js con le utilità della parte
├── esempi/<parte>/*.cpp        programmi C++ completi (+ .out con l'output atteso, + .in facoltativo)
├── tools/                      build-sources.mjs, check-cpp.mjs, smoke.mjs
└── docs/                       design.md, questo file
```

Gli script sono **classici** (niente `import`/`export`): il sito deve aprirsi
anche con doppio clic su `index.html` (`file://`). Ogni file è una funzione
autoeseguita che aggiunge pezzi all'oggetto globale `ASD`. Niente `fetch` di
file locali (da `file://` non funziona): tutto passa da script.

## Scrivere un capitolo

### 1. Il programma C++

Ogni pezzo di codice importante è un **programma completo** in
`esempi/<parte>/<nome>.cpp` che compila senza warning con
`g++ -std=c++17 -Wall -Wextra -pedantic` e stampa qualcosa di controllabile.

- Commenti e messaggi in italiano; nomi delle funzioni come nei libri
  (`insertionSort`, `binarySearch`, `bfs`), variabili brevi e convenzionali
  (`i`, `j`, `n`, `key`, `lo`, `hi`) o in italiano quando sono descrittive
  (`minimo`, `scambiato`). `using namespace std;` sì, `#include <bits/stdc++.h>` no.
- Array come `vector<int>&` passati per riferimento; indici da 0.
- Niente input da tastiera nei programmi d'esempio: i dati sono scritti nel
  `main`, così il programma gira anche su Compiler Explorer senza input.
- Memoria: ogni `new` ha il suo `delete` (il controllo usa AddressSanitizer e
  segnala le perdite).

Marcatori (sono commenti, il compilatore li ignora; il sito li toglie dal
codice mostrato):

```cpp
//@region sort                         ← inizio di una regione mostrabile da sola
void insertionSort(vector<int>& a) {
    for (int i = 1; i < n; i++) {      //@outer   ← etichetta di riga
        ...
}
//@endregion
```

Poi:

```bash
node tools/check-cpp.mjs ordinamento         # compila ed esegue (con AddressSanitizer)
node tools/check-cpp.mjs ordinamento --update   # crea/aggiorna i .out (controllali!)
node tools/build-sources.mjs ordinamento     # rigenera assets/js/sources/ordinamento.js
```

### 2. Il file del capitolo

```js
(function () {
  'use strict';
  const { m, box, table } = ASD;

  ASD.chapter({
    id: 'sort-semplici',                    // lo stesso id di outline.js
    title: 'Ordinamenti semplici',
    lead: 'Una o due frasi che dicono di cosa parla il capitolo.',
    minutes: 35,
    prereq: ['cpp-funzioni', 'cx-costo'],    // capitoli da leggere prima (facoltativo)
    goals: ['cosa si sa fare alla fine', '…'], // 3-5 obiettivi concreti
    render(el) {
      el.innerHTML = `
<section id="idea">
  <h2>Titolo della sezione</h2>
  <p>…</p>
  <div data-mount="vis"></div>
</section>
<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;
      ASD.mount(el, {
        vis: (host) => ASD.stepper(host, { … }),
        quiz: (host) => ASD.quiz(host, [ … ]),
      });
    },
  });
})();
```

- Ogni `<section>` ha un `id` breve e un `<h2>`: diventano l'indice "In questo
  capitolo" e gli indirizzi `#capitolo--sezione`.
- Dentro le sezioni: `<h3>` per i sottotitoli (mai saltare livelli).
- Link a un altro capitolo: `${ASD.link('bst')}` oppure
  `${ASD.link('bst', 'cancellazione', 'testo del link')}`.
- Formule: `${m('T(n) = 2T(n/2) + Θ(n)')}`. Le lettere singole diventano
  corsive, `^` e `_` apici e pedici (`n^{2}`, `log_2 n`), `-` diventa il segno
  meno, `<=` `>=` `!=` `->` `*` diventano ≤ ≥ ≠ → ·. Una formula su una riga
  sua: `<p class="formula">${m('…')}</p>`.
- Riquadri: `${box('ricorda', '…')}`, `${box('errore', '…')}`,
  `${box('esame', '…')}`, `${box('nota', '…', 'Titolo')}`.
- Tabelle: `${table({ caption, head: [...], rows: [[...], ...] })}` (celle in
  HTML; la prima colonna è l'intestazione della riga).
- Codice: `ASD.code(host, { src: 'parte/nome', region: 'sort' })`. Per un
  frammento di poche righe che non è un programma completo:
  `ASD.code(host, { code: '…', file: 'frammento.cpp' })` (niente link per
  eseguirlo). Annotazioni a margine (penna rossa):
  `notes: { outer: 'n volte', 5: '1' }` (etichetta o numero di riga).

### 3. Il testo

- Italiano semplice, frasi brevi, seconda persona singolare ("prova a…").
  Termini inglesi tra parentesi quando servono (`pila (stack)`).
- Niente emoji, niente punti esclamativi a raffica, niente "è importante
  notare che". Si spiega cosa succede e perché.
- Ogni capitolo: "Cosa impari" (goals), le sezioni, **almeno una
  visualizzazione o uno strumento interattivo**, un riquadro "Da ricordare",
  uno "Errore tipico", uno "All'esame", la tabella dei costi quando ci sono
  operazioni, e "Verifica rapida" con 4-6 domande spiegate.
- Le domande del quiz spiegano il perché anche quando la risposta è giusta.

## Visualizzazioni passo-passo

Un algoritmo si visualizza così:

1. una funzione **traccia** lo esegue in JavaScript, uguale al codice C++, e
   registra un fotogramma per ogni passo:

```js
function trace(input) {
  const t = new ASD.Tracer(['confronti', 'scambi']);   // contatori
  const a = input.slice();
  for (let i = 0; i < a.length; i++) {
    t.count('confronti');
    t.step('cmp',                                    // etichetta //@cmp nel .cpp
           `Confronto a[${i}] con …`,                 // spiegazione (HTML semplice)
           { i },                                     // variabili da mostrare
           { a: a.slice(), marks: { [i]: 'compare' }, ptrs: { i } }); // stato per la vista
  }
  t.step(null, 'Finito.', {}, { a });                // line null = nessuna riga evidenziata
  return t.frames;
}
```

2. lo **Stepper** li riproduce:

```js
ASD.stepper(host, {
  id: 'insertion',
  title: 'Insertion sort passo per passo',
  code: { src: 'ordinamento/insertion_sort', region: 'sort' },
  input: { kind: 'array', value: [5, 2, 4, 6, 1, 3], presets: ASD.sorting.presets(7) },
  view: (stage) => new ASD.viz.ArrayView(stage),
  trace,
  counters: [{ key: 'confronti', label: 'confronti' }],
  legend: [{ k: 'compare', label: 'confronto' }],     // compare | swap | done | key | active | out | hole
  validate: (input, frames) => null,                  // messaggio d'errore se il risultato è sbagliato
});
```

Per un input che non è un array: `input: { value, label, parse(text) → valore
oppure throw new Error('messaggio'), format(valore) → testo, presets }`.

Regole:

- Ogni `step` deve riferirsi a un'etichetta che esiste nel sorgente (il test
  automatico segnala quelle mancanti) e deve corrispondere alla riga che il
  C++ sta davvero eseguendo.
- Lo stato è copiato a ogni passo: passa copie (`a.slice()`) o oggetti nuovi.
- Massimo qualche centinaio di passi per l'input di partenza: input piccoli
  (6-10 elementi), il lettore può allargarli.
- Un `validate` che controlla il risultato finale (ordinato? distanze giuste?)
  rende il test automatico molto più utile.

### Viste disponibili

| Vista | File | Stato |
|---|---|---|
| `ASD.viz.ArrayView(el, { mode: 'bars' \| 'cells', float, height })` | `viz/array.js` | `{ a, ids, marks, ptrs, range, float, brackets, max }` |
| `ASD.viz.TreeView(el, { layout: 'binary' \| 'tidy', shape: 'circle' \| 'box' })` | `viz/tree.js` | `{ root, nodes: { id: { label, kids, cls, sub, note } }, edges }` |
| `ASD.viz.Plot(el, { x, y, height })` | `viz/plot.js` | `plot.set({ series, bands, vlines, bad })` |

Una vista è qualsiasi oggetto con `render(state, frame)` (e facoltativo
`reset()`). Per disegnare più cose insieme (un array e la sua pila, un grafo
e la coda della BFS) si crea una vista composta che divide il palco in parti e
chiama le viste figlie. Colori solo dai token CSS (`var(--pen)`,
`var(--hl)`, …): mai esadecimali nel JavaScript.

Classi di stato comuni (array, alberi e le altre viste le usano allo stesso
modo): `compare` (giallo evidenziatore), `swap` (rosso), `done`/`found`
(verde), `key`/`pivot`/`min`/`new` (viola), `active` (blu pieno), `visited`,
`out` (attenuato).

## Strumenti interattivi diversi da uno stepper

Per un laboratorio (cursori, grafici, calcolatori) c'è la cornice `.lab`:

```html
<div class="lab">
  <div class="lab-head"><h3>Titolo</h3></div>
  <div class="lab-body quadretti">…</div>     <!-- quadretti: facoltativo -->
  <div class="lab-controls">…</div>
  <div class="lab-out">…</div>
</div>
```

Ogni controllo ha un `<label>` collegato con `for`/`id` (usa `ASD.uid('nome')`
per id unici). Cursori: `<label class="slider" for="id"><span>n</span><input
type="range" id="id"><output></output></label>`.

## Verifiche automatiche

```bash
node tools/check-cpp.mjs      # tutti gli esempi C++: compilano, girano, output atteso
node tools/build-sources.mjs  # rigenera i sorgenti del sito
node tools/smoke.mjs          # apre ogni capitolo in Chromium e fa girare tutte le visualizzazioni
node tools/smoke.mjs bst --shots /tmp/foto   # un capitolo, con screenshot
```

Prima di considerare finito un capitolo: i tre comandi passano senza errori,
e gli screenshot (chiaro, scuro, telefono) sono stati guardati.
