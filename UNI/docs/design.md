# ASD a quadretti — documento di progetto

Questo documento fissa cosa stiamo costruendo e perché. Se qualcosa qui non
corrisponde a quello che vi serve per l'esame, correggetelo: il resto del
progetto segue da qui.

## 1. Obiettivo

Un corso accelerato, interattivo, per preparare l'esame di **Algoritmi e
Strutture Dati (ASD)** usando il **C++**. Lo usano due persone che studiano
insieme: una che il C++ lo conosce ma deve rinfrescarlo, una che deve
impararlo da capo.

Il sito riesce se, alla fine, chi lo usa sa:

1. leggere e scrivere il C++ che serve all'esame (funzioni, riferimenti,
   puntatori, classi, template, STL);
2. **calcolare la complessità** di un algoritmo da solo, sia di codice
   iterativo (cicli, cicli annidati, cicli logaritmici) sia ricorsivo
   (ricorrenze, albero di ricorsione, teorema master);
3. eseguire "a mano" gli algoritmi del programma (come si fa allo scritto) e
   ricostruirne il codice;
4. scegliere la struttura dati giusta sapendo il costo di ogni operazione.

## 2. Cosa ci ha chiesto l'utente (testuale)

- corso accelerato / sito interattivo "bellissimo";
- esempi di codice C++ **con visualizzazione**;
- orientato all'esame di algoritmi e strutture dati;
- un modo per capire **come si calcola la complessità**;
- il tutto nella cartella `UNI` della repo.

## 3. Assunzioni (da confermare)

| Assunzione | Perché | Se è sbagliata |
|---|---|---|
| Programma "classico" di ASD italiano: complessità, ricorrenze, ordinamento, liste/pile/code, hash, alberi/BST/heap, grafi (visite, cammini minimi, MST), divide et impera, greedy, programmazione dinamica | È il programma dei testi più adottati (Cormen et al.; Demetrescu–Finocchi–Italiano; Bertossi–Montresor) | Mandateci il programma del vostro corso e adattiamo l'indice |
| C++17, compilatore `g++` (MinGW su Windows) | Nella repo c'è già codice compilato con MinGW | Gli esempi sono C++ standard: funzionano anche con clang e MSVC |
| Array con indici da 0 (C++), mentre i libri spesso partono da 1 | È il C++ vero | Il sito lo segnala ogni volta che conta |
| `using namespace std;` negli esempi | Codice più corto, ed è quello che si vede a lezione | Nel capitolo sulle basi spieghiamo quando evitarlo |
| Sito in italiano, termini inglesi tra parentesi | STL e documentazione sono in inglese | — |

## 4. Fuori dal perimetro (per ora)

- Compilare il C++ dentro il browser: ogni esempio ha un link che lo apre già
  pronto su Compiler Explorer (godbolt.org), dove si esegue.
- Account, server, salvataggi condivisi: i progressi restano nel browser di chi
  studia.
- Implementazioni complete di alberi bilanciati (AVL, rosso-neri): solo le
  rotazioni e l'idea.

## 5. Indice del corso

| Parte | Capitoli |
|---|---|
| 0 · Inizio | Home, Compilare ed eseguire |
| 1 · C++ essenziale | Basi del linguaggio · Funzioni e riferimenti · Puntatori e memoria dinamica · Struct, classi e template · STL · Ricorsione |
| 2 · Complessità | Contare i passi · Notazioni O, Ω, Θ · Il metodo per calcolarla · Laboratorio · Ricorrenze e teorema master |
| 3 · Ricerca e ordinamento | Ricerca lineare e binaria · Ordinamenti semplici · Merge sort · Quicksort · Ordinamenti lineari · Confronto finale |
| 4 · Strutture dati | Liste concatenate · Pile e code · Tabelle hash · Alberi binari · Alberi binari di ricerca · Heap e code con priorità |
| 5 · Grafi | Rappresentare un grafo · Visite BFS e DFS · Cammini minimi · Alberi di copertura minimi |
| 6 · Tecniche | Algoritmi greedy · Programmazione dinamica · Problemi classici di PD |
| 7 · Verso l'esame | Formulario · Esercizi d'esame |

Ogni capitolo ha: cosa impari, spiegazione breve, codice C++ vero (compilato e
testato), almeno una visualizzazione passo-passo o uno strumento interattivo,
riquadri "Da ricordare", "Errore tipico", "All'esame", la tabella dei costi e
una verifica rapida finale con le soluzioni spiegate.

## 6. Il pezzo forte: calcolare la complessità

La parte 2 insegna un **metodo in passi**, sempre lo stesso:

1. scegli l'operazione dominante (quella che si ripete di più);
2. scrivi a margine di ogni riga quante volte viene eseguita, come sul
   quaderno (il sito lo fa con annotazioni scritte "a penna rossa");
3. somma: cicli in sequenza si sommano, cicli annidati si moltiplicano o
   diventano una sommatoria, un indice che raddoppia dà un logaritmo;
4. se c'è ricorsione, scrivi la ricorrenza e risolvila (albero di ricorsione o
   teorema master);
5. tieni il termine che cresce di più e butta le costanti.

Strumenti interattivi della parte 2:

- **contatore di passi**: esegue un algoritmo e conta le operazioni, nel caso
  migliore e peggiore;
- **grafico di O, Ω, Θ** con i cursori per `c` e `n₀`: si vede quando la
  definizione è soddisfatta;
- **codice annotato a margine**: ogni riga mostra il suo costo e la somma
  finale;
- **laboratorio**: frammenti di codice da far girare con `n` crescente; il sito
  misura i passi, li disegna accanto alle curve candidate e chiede di indovinare;
- **albero di ricorsione** disegnato livello per livello e **calcolatore del
  teorema master**.

## 7. Identità visiva

Il mondo di chi studia ASD è il quaderno a quadretti, la penna, l'evidenziatore,
la lavagna dell'aula. Il sito usa quei materiali:

- **tema chiaro "quaderno"**: carta bianca, quadretti azzurri nelle aree dove
  si disegna, inchiostro blu della penna come colore d'accento;
- **tema scuro "lavagna"**: ardesia scura, testo color gesso, gessetti
  colorati per gli stati;
- **evidenziatore giallo** sulla riga di codice in esecuzione;
- **penna rossa** per le annotazioni di costo a margine e gli errori tipici;
- caratteri: STIX Two Text (titoli e formule, il carattere delle pubblicazioni
  scientifiche), IBM Plex Sans (testo), IBM Plex Mono (codice), Caveat (solo per
  le annotazioni scritte a mano).

Tutte le coppie testo/sfondo sono state calcolate e verificate (WCAG AA o
superiore) nei due temi.

## 8. Scelte tecniche

- **Sito statico**, HTML + CSS + JavaScript senza framework e senza passaggi di
  build per chi lo usa: si apre `index.html` con doppio clic e funziona anche
  offline (tranne i caratteri, che hanno un ripiego di sistema).
- Script "classici" (non moduli ES) perché i moduli non si caricano da
  `file://`.
- **Una sola fonte per il codice C++**: i programmi stanno in `esempi/` come
  file `.cpp` veri. Uno script li impacchetta per il sito; un altro li compila
  con `g++ -std=c++17 -Wall -Wextra -pedantic` e confronta l'output atteso. Così
  il codice mostrato è lo stesso che compila.
- Le visualizzazioni sono **tracce**: una funzione JavaScript esegue lo stesso
  algoritmo del codice C++ e registra un fotogramma per ogni passo (riga
  corrente, variabili, contatori, stato disegnato). Il lettore va avanti,
  indietro, salta, cambia l'input.
- Un test automatico (Playwright) apre ogni capitolo, fa girare tutte le
  visualizzazioni fino in fondo e segnala errori, etichette di codice
  inesistenti e sbordamenti a larghezza di telefono.

I dettagli per chi scrive capitoli sono in [`architettura.md`](architettura.md).
