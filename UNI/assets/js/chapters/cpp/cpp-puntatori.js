/* ASD a quadretti — capitolo "Puntatori e memoria": indirizzi, &, *, nullptr,
   puntatori e riferimenti, array e aritmetica dei puntatori, stack e heap,
   new/delete, perdite di memoria, puntatori pendenti, doppie delete, perché
   esiste vector, e struct Nodo come primo passo verso le liste.
   Tre visualizzazioni della memoria con le frecce dei puntatori. */
(function () {
  'use strict';

  const { m, box, table } = ASD;
  const C = ASD.cpp;

  ASD.chapter({
    id: 'cpp-puntatori',
    title: 'Puntatori e memoria',
    lead:
      'Un puntatore è una variabile che contiene un indirizzo di memoria. Con i puntatori si costruiscono liste, alberi e grafi, e si usa la memoria dinamica con new e delete. Qui li vedi disegnati: lo stack con le variabili locali, lo heap con la memoria dinamica, e le frecce tra i due.',
    minutes: 50,
    prereq: ['cpp-funzioni'],
    goals: [
      'usare <code>&amp;</code> e <code>*</code> e leggere ad alta voce un\'espressione con i puntatori',
      'spiegare la differenza tra puntatore e riferimento',
      'scorrere un array con l\'aritmetica dei puntatori e passarlo a una funzione insieme alla sua lunghezza',
      'allocare e liberare memoria con <code>new</code>/<code>delete</code> e <code>new[]</code>/<code>delete[]</code>, riconoscendo perdite, puntatori pendenti e doppie delete',
      'dichiarare la <code>struct Nodo</code>, un valore più il puntatore al nodo successivo: il mattone delle liste concatenate',
    ],

    render(el) {
      el.innerHTML = `
<section id="indirizzi">
  <h2>Indirizzi e puntatori</h2>
  <p>La memoria è una lunga fila di byte numerati: il numero di un byte è il suo <strong>indirizzo</strong>. Un
  <code>int</code> occupa 4 byte consecutivi, e il suo indirizzo è quello del primo. L'operatore <code>&amp;</code>
  (<i>address-of</i>) dà l'indirizzo di una variabile; un <strong>puntatore</strong> è una variabile che contiene un
  indirizzo. L'operatore <code>*</code> (<i>dereferenziazione</i>) fa il contrario: dato il puntatore, raggiunge la
  casella a cui punta.</p>
  ${table({
    caption: 'Come si leggono ad alta voce',
    head: ['Codice', 'Si legge', 'Effetto'],
    rows: [
      ['<code>int* p;</code>', '<code>p</code> è un puntatore a <code>int</code>', 'una casella che conterrà l\'indirizzo di un <code>int</code>'],
      ['<code>p = &amp;x;</code>', '<code>p</code> prende l\'indirizzo di <code>x</code>', '«<code>p</code> punta a <code>x</code>»: nel disegno, una freccia'],
      ['<code>*p</code>', 'la casella puntata da <code>p</code>', 'si segue la freccia: si legge o si scrive <code>x</code>'],
      ['<code>*p = 5;</code>', 'scrivi 5 dove punta <code>p</code>', '<code>x</code> diventa 5'],
      ['<code>p = nullptr;</code>', '<code>p</code> non punta a niente', 'nessuna freccia; <code>*p</code> sarebbe un errore'],
      ['<code>p-&gt;val</code>', 'il campo <code>val</code> dell\'oggetto puntato', 'abbreviazione di <code>(*p).val</code>, si usa con le struct'],
    ],
  })}
  <p>Il simbolo <code>*</code> ha due ruoli: nella dichiarazione (<code>int* p</code>) dice che <code>p</code> è un
  puntatore; in un'espressione (<code>*p = 5</code>) segue la freccia. Lo stesso vale per <code>&amp;</code>: in una
  dichiarazione (<code>int&amp; r</code>) crea un riferimento, in un'espressione (<code>&amp;x</code>) prende un
  indirizzo.</p>
  <div data-mount="base"></div>
  ${C.out(`x = 10, *p = 10
dopo *p = 20: x = 20
p punta a x? sì
ora *p = 7
dopo r = 30: x = 30
q è nullo: non va dereferenziato
in una condizione nullptr vale false`)}
  ${box('errore', `<p>In <code>int* p, q;</code> l'asterisco vale solo per <code>p</code>: <code>q</code> è un
  <code>int</code>. Il compilatore se ne accorge appena provi a usarlo come puntatore:</p>
  ${C.term(`decl.cpp:5:9: error: invalid conversion from 'int*' to 'int' [-fpermissive]
    5 |     q = &x;
      |         ^~`)}
  <p>Dichiara un puntatore per riga, oppure scrivi <code>int *p, *q;</code>.</p>`)}
  ${box('errore', `<p>Dereferenziare <code>nullptr</code> (o un puntatore non inizializzato) è comportamento indefinito:
  di solito il programma si chiude con <code>Segmentation fault</code>. Un puntatore dichiarato senza valore è peggio di
  uno nullo, perché punta a un indirizzo a caso e scriverci può rovinare altri dati in silenzio. Inizializza sempre:
  <code>int* p = nullptr;</code>.</p>`)}
</section>

<section id="riferimenti">
  <h2>Puntatori e riferimenti</h2>
  <p>Un riferimento (${ASD.link('cpp-funzioni', 'passaggio', 'visto con le funzioni')}) e un puntatore servono entrambi a
  raggiungere un'altra variabile, ma non sono la stessa cosa:</p>
  ${table({
    head: ['', 'Puntatore <code>int* p</code>', 'Riferimento <code>int&amp; r</code>'],
    rows: [
      ['Che cos\'è', 'una variabile che contiene un indirizzo', 'un altro nome di una variabile che esiste già'],
      ['Va inizializzato subito?', 'no, ma conviene (<code>nullptr</code>)', 'sì, sempre'],
      ['Può non puntare a niente?', 'sì: <code>nullptr</code>', 'no'],
      ['Può cambiare bersaglio?', 'sì: <code>p = &amp;y;</code>', 'no: <code>r = y;</code> copia il valore di <code>y</code> nella variabile di <code>r</code>'],
      ['Come si usa il valore', '<code>*p</code>', '<code>r</code>, come una variabile normale'],
      ['Aritmetica', 'sì: <code>p + 1</code>, <code>p++</code>', 'no'],
      ['Uso tipico', 'memoria dinamica, nodi di liste e alberi', 'parametri delle funzioni'],
    ],
  })}
  ${box('ricorda', `<p>Per i parametri delle funzioni usa i riferimenti. I puntatori servono quando il bersaglio può
  mancare o cambiare nel tempo: il <code>next</code> di un nodo, la radice di un albero, un elemento creato con
  <code>new</code>.</p>`)}
</section>

<section id="array">
  <h2>Array e aritmetica dei puntatori</h2>
  <p>Un array C, <code>int a[5]</code>, è un blocco di 5 <code>int</code> uno dopo l'altro. Usato come valore, il nome
  <code>a</code> «decade» nel puntatore al primo elemento, <code>&amp;a[0]</code>. Sommare <var>i</var> a un puntatore lo
  sposta di <var>i</var> elementi (cioè di ${m('i * sizeof(int)')} byte), quindi <code>*(p + i)</code>,
  <code>p[i]</code> e <code>a[i]</code> sono la stessa casella. La differenza tra due puntatori nello stesso array è il
  numero di elementi che li separa.</p>
  <div data-mount="scorri"></div>
  <p>La posizione <code>a + 5</code>, subito dopo l'ultimo elemento, si può calcolare e confrontare ma non leggere: è lo
  stesso ruolo di <code>v.end()</code> nei contenitori della STL.</p>
  <h3>Passare un array a una funzione</h3>
  <p>Una funzione non riceve mai un array C intero: riceve il puntatore al primo elemento. La lunghezza si perde, e va
  passata a parte:</p>
  <div data-mount="funzione"></div>
  ${C.out(`somma con la funzione:  66
tra &a[1] e &a[4] ci sono 3 elementi`)}
  ${box('errore', `<p>Il trucco <code>sizeof(a) / sizeof(a[0])</code> funziona solo dove <code>a</code> è dichiarato come
  array. Dentro una funzione <code>a</code> è un puntatore: <code>sizeof(a)</code> vale 8 (la dimensione di un indirizzo)
  e il conto dà 2, qualunque sia la lunghezza vera. g++ avvisa:</p>
  ${C.term(`sz.cpp:3:20: warning: 'sizeof' on array function parameter 'a' will return size of 'int*' [-Wsizeof-array-argument]
    3 |     int n = sizeof(a) / sizeof(a[0]);
      |                   ~^~`)}
  <p>Passa sempre la lunghezza, o meglio usa <code>const vector&lt;int&gt;&amp;</code>, che la conosce.</p>`)}
  ${box('errore', `<p>Nessuno controlla gli indici: con <code>int a[5]</code>, leggere <code>a[5]</code> o
  <code>a[-1]</code> non dà errore di compilazione, legge memoria che non è dell'array. È comportamento indefinito: a
  volte stampa numeri a caso, a volte chiude il programma, a volte sembra funzionare.</p>`)}
</section>

<section id="heap">
  <h2>Stack e heap: new e delete</h2>
  <p>Le variabili locali stanno nello <strong>stack</strong>, nel frame della loro funzione, e spariscono da sole alla
  fine del blocco. Lo <strong>heap</strong> (o memoria dinamica) è la zona da cui chiedi spazio esplicitamente:
  <code>new</code> crea un oggetto e restituisce il suo indirizzo, <code>delete</code> lo distrugge. Gli oggetti nello
  heap non hanno un nome: li raggiungi solo tramite puntatori.</p>
  ${table({
    head: ['', 'Stack', 'Heap'],
    rows: [
      ['Chi lo gestisce', 'il programma, da solo: un frame per ogni chiamata', 'tu: <code>new</code> per creare, <code>delete</code> per liberare'],
      ['Quanto vive un oggetto', 'fino alla fine del suo blocco', 'finché non chiami <code>delete</code>, anche dopo la fine della funzione che l\'ha creato'],
      ['Dimensione', 'piccolo (1-8 MB)', 'grande (la RAM libera)'],
      ['Array', 'lunghezza fissa, nota al compilatore', 'lunghezza decisa durante l\'esecuzione: <code>new int[n]</code>'],
      ['Come lo raggiungi', 'con il nome della variabile', 'con un puntatore'],
    ],
  })}
  <p>Nel programma qui sotto ci sono tutti i pezzi: un puntatore a una variabile locale, un <code>int</code> e un array
  creati sullo heap, la scrittura attraverso un puntatore, le due <code>delete</code> e il puntatore pendente che
  resta dopo.</p>
  <div data-mount="dinamica"></div>
  ${box('nota', `<p>Gli indirizzi nel disegno sono inventati e corti, per leggerli meglio. Quelli veri hanno 12 cifre
  esadecimali (per esempio <code>0x7ffd5c2a1b3c</code>) e cambiano a ogni esecuzione. Conta solo l'idea: un puntatore
  contiene l'indirizzo della casella a cui punta.</p>`, 'Indirizzi inventati')}
  ${table({
    caption: 'Le operazioni sulla memoria e quanto costano',
    head: ['Operazione', 'Che cosa fa', 'Costo'],
    rows: [
      ['<code>new T</code>, <code>new T(v)</code>', 'crea un oggetto sullo heap (con <code>(v)</code> lo inizializza) e ne restituisce l\'indirizzo', 'costante nei conti di complessità'],
      ['<code>new T[n]</code>', 'crea un array di <var>n</var> elementi; per i tipi base i valori non sono inizializzati', 'costante; ' + m('Θ(n)') + ' se lo inizializzi con <code>new T[n]()</code> o con un ciclo'],
      ['<code>delete p</code>, <code>delete[] p</code>', 'distrugge l\'oggetto o l\'array; su <code>nullptr</code> non fa niente', 'costante (per tipi con distruttore, ' + m('Θ(n)') + ' per un array)'],
      ['<code>a[i]</code>, <code>*(p + i)</code>', 'accesso a un elemento', m('Θ(1)')],
      ['scorrere <var>n</var> elementi con <code>p++</code>', 'visita tutto l\'array', m('Θ(n)')],
    ],
  })}
  ${box('errore', `<p><code>int a[n];</code> con <code>n</code> variabile non è C++ standard: g++ lo accetta come
  estensione, ma con <code>-pedantic</code> avvisa e altri compilatori lo rifiutano.</p>
  ${C.term(`vla.cpp:3:9: warning: ISO C++ forbids variable length array 'a' [-Wvla]
    3 |     int a[n];
      |         ^`)}
  <p>Per un array di lunghezza decisa a tempo di esecuzione usa <code>vector&lt;int&gt; a(n);</code> (o
  <code>new int[n]</code>).</p>`)}
</section>

<section id="errori">
  <h2>Perdite, puntatori pendenti, doppie delete</h2>
  <p>Con <code>new</code> e <code>delete</code> la responsabilità è tua, e ci sono tre errori classici. Spesso non danno
  sintomi subito: il programma sembra funzionare. Per scovarli si compila con <code>-fsanitize=address</code>
  (AddressSanitizer, con g++ e clang su Linux e macOS): è il controllo che usano anche gli esempi di questo sito. Ecco
  che cosa dice nei tre casi.</p>
  <h3>Perdita di memoria (memory leak)</h3>
  <div data-mount="leak"></div>
  ${C.term(`==13093==ERROR: LeakSanitizer: detected memory leaks

Direct leak of 4 byte(s) in 1 object(s) allocated from:
    #0 0x7f97022fe548 in operator new(unsigned long)
    #1 0x5558be93423f in main leak.cpp:2`)}
  <p>Il primo blocco non è più raggiungibile da nessun puntatore, quindi non si potrà mai liberare. In un ciclo o in un
  programma che gira a lungo, la memoria occupata cresce senza limite.</p>
  <h3>Puntatore pendente (dangling pointer)</h3>
  <div data-mount="pendente"></div>
  ${C.term(`==13121==ERROR: AddressSanitizer: heap-use-after-free on address 0x502000000010
READ of size 4 at 0x502000000010 thread T0
    #0 0x561d4970c498 in main uaf.cpp:5`)}
  <p>Dopo <code>delete q</code>, <code>q</code> contiene ancora il vecchio indirizzo, ma quella memoria non è più tua:
  può essere già stata data a qualcun altro. Lo stesso succede con un puntatore a una variabile locale di una funzione
  che è finita.</p>
  <h3>Doppia delete</h3>
  <div data-mount="doppia"></div>
  ${C.term(`==13189==ERROR: AddressSanitizer: attempting double-free on 0x502000000010 in thread T0:`)}
  <p>Liberare due volte lo stesso blocco rovina le strutture interne dell'allocatore. Dopo una <code>delete</code>
  metti il puntatore a <code>nullptr</code>: <code>delete</code> su <code>nullptr</code> non fa niente.</p>
  ${box('errore', `<p>Un array creato con <code>new[]</code> si libera con <code>delete[]</code>, un oggetto creato con
  <code>new</code> con <code>delete</code>. Mescolarli è comportamento indefinito; g++ avvisa
  (<code>-Wmismatched-new-delete</code>) e AddressSanitizer lo segnala come <code>alloc-dealloc-mismatch</code>.</p>`)}
  <h3>Perché esiste vector</h3>
  <p><code>vector</code> fa tutto questo lavoro al posto tuo: tiene i suoi elementi in un array sullo heap, lo libera da
  solo quando la variabile esce dal suo blocco (lo fa il suo distruttore, vedi ${ASD.link('cpp-classi')}), conosce la sua
  lunghezza, cresce con <code>push_back</code>, controlla gli indici con <code>at</code> e, quando lo copi, copia gli
  elementi. Niente perdite, niente doppie delete.</p>
  ${box('ricorda', `<p>Nel codice dell'esame usa <code>vector</code> per gli array. <code>new</code> e <code>delete</code>
  servono per i nodi delle strutture collegate (liste, alberi), dove ogni elemento è un oggetto a sé collegato agli altri
  da puntatori. E ogni <code>new</code> deve avere il suo <code>delete</code>.</p>`)}
</section>

<section id="nodo">
  <h2>Verso le liste: struct Nodo</h2>
  <p>Una <code>struct</code> raggruppa più campi in un tipo nuovo (i dettagli sono in ${ASD.link('cpp-classi')}). Questa
  ha un campo speciale: un puntatore a un altro <code>Nodo</code>. Ogni nodo sa dov'è il successivo, e l'ultimo ha
  <code>next == nullptr</code>: è una <strong>lista concatenata</strong>.</p>
  <ul>
    <li><code>new Nodo{x, testa}</code> crea un nodo sullo heap con <code>val = x</code> e <code>next = testa</code>.</li>
    <li><code>p-&gt;val</code> è il campo <code>val</code> del nodo puntato da <code>p</code>, cioè <code>(*p).val</code>.</li>
    <li>Si scorre con un puntatore <code>p</code> che parte da <code>testa</code> e avanza con <code>p = p-&gt;next</code>
    finché non diventa <code>nullptr</code>.</li>
    <li>Si libera nodo per nodo, salvando il successivo <em>prima</em> della <code>delete</code>.</li>
  </ul>
  <div data-mount="lista"></div>
  ${box('errore', `<p>Nel ciclo che libera la lista, <code>delete p; p = p-&gt;next;</code> legge <code>p-&gt;next</code>
  da un nodo appena distrutto: è un <i>heap-use-after-free</i>. Prima si salva il successivo
  (<code>Nodo* dopo = p-&gt;next;</code>), poi si libera.</p>`)}
  ${table({
    caption: 'Costi sulla lista di n nodi',
    head: ['Operazione', 'Costo', 'Perché'],
    rows: [
      ['inserire in testa', m('Θ(1)'), 'un <code>new</code> e due assegnamenti, qualunque sia <var>n</var>'],
      ['scorrere o stampare', m('Θ(n)'), 'si visita ogni nodo una volta'],
      ['raggiungere l\'<var>i</var>-esimo', m('Θ(i)'), 'non c\'è <code>a[i]</code>: bisogna seguire <var>i</var> frecce'],
      ['liberare tutto', m('Θ(n)'), 'una <code>delete</code> per nodo'],
    ],
  })}
  <p>Inserimento in mezzo, cancellazione, liste doppie e con il puntatore all'ultimo nodo sono nel capitolo
  ${ASD.link('liste')}.</p>
</section>

<section id="esame">
  <h2>All'esame</h2>
  <ol>
    <li><strong>Disegna la memoria</strong> dopo alcune istruzioni: caselle per le variabili, frecce per i puntatori,
    <code>nullptr</code> scritto per esteso, i blocchi liberati cancellati.</li>
    <li><strong>Che cosa stampa?</strong> Con <code>*p</code>, <code>p[i]</code>, <code>p + 1</code> e riferimenti
    mescolati: segui le frecce una alla volta.</li>
    <li><strong>Trova l'errore</strong>: la <code>delete</code> mancante, quella doppia, <code>delete</code> al posto di
    <code>delete[]</code>, l'uso di un puntatore dopo la <code>delete</code>.</li>
    <li><strong>Scrivi una funzione su una lista</strong>: stampa, conta, libera. Il ciclo è sempre quello con
    <code>p = p-&gt;next</code>, e il caso della lista vuota (<code>testa == nullptr</code>) va gestito.</li>
  </ol>
  ${box('esame', `<p>Quando scrivi codice con i puntatori, chiediti per ogni <code>-&gt;</code>: questo puntatore può
  essere <code>nullptr</code> qui? Nelle liste il caso della lista vuota e quello dell'ultimo nodo sono quelli che
  fanno perdere punti.</p>`)}
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        base: (host) => ASD.code(host, { src: 'cpp/puntatori_base', maxHeight: 380 }),
        scorri: mountScorri,
        funzione: (host) => ASD.code(host, { src: 'cpp/array_puntatori', region: 'funzione' }),
        dinamica: mountDinamica,
        leak: (host) =>
          ASD.code(host, {
            file: 'leak.cpp',
            code: `int main() {
    int* p = new int(1);
    p = new int(2);      // il primo blocco non ha più nessun puntatore
    delete p;            // libera solo il secondo
    return 0;
}`,
            notes: { 3: 'perso!' },
          }),
        pendente: (host) =>
          ASD.code(host, {
            file: 'uaf.cpp',
            code: `#include <iostream>
int main() {
    int* q = new int(7);
    delete q;
    std::cout << *q << '\\n';   // q punta a memoria liberata
    return 0;
}`,
            notes: { 5: 'pendente!' },
          }),
        doppia: (host) =>
          ASD.code(host, {
            file: 'df.cpp',
            code: `int main() {
    int* q = new int(7);
    delete q;
    delete q;            // seconda volta sullo stesso blocco
    return 0;
}`,
            notes: { 4: 'due volte!' },
          }),
        lista: mountLista,
        quiz: (host) =>
          ASD.quiz(host, [
            {
              q: 'Che cosa stampa?',
              code: `int x = 5;
int* p = &x;
*p = *p + 3;
int& r = x;
r *= 2;
cout << x;`,
              options: ['<code>5</code>', '<code>8</code>', '<code>16</code>', '<code>10</code>'],
              answer: 2,
              explain: `<code>*p</code> è <code>x</code>: <code>*p = *p + 3</code> porta <code>x</code> a 8. <code>r</code> è un
              altro nome di <code>x</code>: <code>r *= 2</code> la porta a 16. Puntatore e riferimento hanno modificato la
              stessa casella.`,
            },
            {
              q: 'Che cosa stampa?',
              code: `int a[4] = {10, 20, 30, 40};
int* p = a + 1;
cout << *p << ' ' << p[2] << ' ' << *(p - 1);`,
              options: ['<code>20 40 10</code>', '<code>20 30 10</code>', '<code>11 12 9</code>', '<code>10 30 40</code>'],
              answer: 0,
              explain: `<code>a + 1</code> punta ad <code>a[1]</code> = 20. <code>p[2]</code> è <code>*(p + 2)</code>, due
              elementi più avanti: <code>a[3]</code> = 40. <code>*(p - 1)</code> torna ad <code>a[0]</code> = 10. L'aritmetica
              conta elementi, non byte, e non somma ai valori.`,
            },
            {
              q: 'Dopo <code>int* q = new int(7); delete q;</code>, che cosa contiene <code>q</code>?',
              options: [
                '<code>nullptr</code>: <code>delete</code> lo azzera',
                'Il vecchio indirizzo: <code>q</code> è pendente e non va più dereferenziato',
                'Il valore 7',
                'Niente: anche <code>q</code> viene distrutto',
              ],
              answer: 1,
              explain: `<code>delete</code> libera il blocco ma non tocca il puntatore, che continua a contenere lo stesso
              indirizzo. Usare <code>*q</code> da qui in poi è comportamento indefinito. Per questo dopo una
              <code>delete</code> conviene scrivere <code>q = nullptr;</code>.`,
            },
            {
              q: 'Quale frammento <strong>non</strong> perde memoria?',
              options: [
                '<code>int* p = new int(1); p = new int(2); delete p;</code>',
                '<code>int* a = new int[10]; a = nullptr;</code>',
                '<code>int* p = new int(1); int* q = p; delete q;</code>',
                '<code>for (int i = 0; i &lt; 3; i++) { int* p = new int(i); }</code>',
              ],
              answer: 2,
              explain: `Nel terzo <code>p</code> e <code>q</code> puntano allo stesso blocco, e una sola <code>delete</code>
              lo libera: tutto a posto (purché poi nessuno usi più <code>p</code>). Nel primo si perde il primo blocco, nel
              secondo l'array, nell'ultimo i tre blocchi creati nel ciclo: <code>p</code> sparisce a ogni giro.`,
            },
            {
              q: 'Dove sta l\'errore?',
              code: `int n = 100;
int* a = new int[n];
for (int i = 0; i < n; i++) a[i] = i;
delete a;`,
              options: [
                'In <code>new int[n]</code>: <var>n</var> non è una costante',
                'Nel ciclo: <code>a[i]</code> non si può usare con un puntatore',
                'In <code>delete a</code>: un array creato con <code>new[]</code> si libera con <code>delete[] a</code>',
                'Non c\'è nessun errore',
              ],
              answer: 2,
              explain: `<code>new int[n]</code> accetta una lunghezza decisa durante l'esecuzione (è proprio il suo scopo) e
              <code>a[i]</code> vuol dire <code>*(a + i)</code>. L'errore è la <code>delete</code> senza parentesi quadre:
              comportamento indefinito, che g++ segnala con <code>-Wmismatched-new-delete</code>.`,
            },
            {
              q: 'Con <code>struct Nodo { int val; Nodo* next; };</code> e <code>Nodo* p</code> che punta a un nodo, quale espressione legge il valore del nodo successivo?',
              options: ['<code>p.next.val</code>', '<code>p-&gt;next-&gt;val</code>', '<code>*p.next.val</code>', '<code>p-&gt;val-&gt;next</code>'],
              answer: 1,
              explain: `<code>p-&gt;next</code> è il puntatore al nodo successivo, e un altro <code>-&gt;val</code> ne legge
              il valore. Il punto si usa con un oggetto, non con un puntatore; e <code>*p.next</code> verrebbe letto come
              <code>*(p.next)</code>, perché il punto lega più forte dell'asterisco. Attenzione: se <code>p-&gt;next</code>
              è <code>nullptr</code>, <code>p-&gt;next-&gt;val</code> è un errore.`,
            },
          ]),
      });
      C.capitolo(el);
    },
  });

  /* ------------------------------------------------- aritmetica dei puntatori */

  function mountScorri(host) {
    ASD.stepper(host, {
      id: 'scorri',
      title: 'Un puntatore che scorre un array',
      code: { src: 'cpp/array_puntatori', region: 'scorri' },
      view: C.vista({ heap: false, console: true, legend: ['ptr', 'hl', 'read'] }),
      trace: traceScorri,
      validate: C.outputUguale(['4 15 23', 'somma con il puntatore: 66']),
    });
  }

  function traceScorri() {
    const t = new ASD.Tracer();
    const M = new C.Memoria();
    const a = [4, 8, 15, 16, 23];
    M.call('main', 'main()');
    M.decl({ id: 'a', type: 'int', name: 'a', cells: a.slice(), past: true });
    t.step(
      'decl',
      '<code>int a[5]</code>: cinque <code>int</code> uno dopo l\'altro nel frame di main. Dopo l\'ultimo c\'è la posizione «fine», <code>a + 5</code>: esiste come indirizzo, ma lì non c\'è un elemento.',
      {},
      M.snap()
    );
    const punta = (k) => ({ ptr: `main.a[${k}]`, value: k === 5 ? 'a + 5' : `&a[${k}]` });
    M.decl(Object.assign({ id: 'p', type: 'int*', name: 'p' }, punta(0)));
    t.step('p', '<code>int* p = a</code>: il nome dell\'array, usato come valore, diventa l\'indirizzo del primo elemento. <code>p</code> punta ad <code>a[0]</code>.', {}, M.snap());
    M.read('main.a[0]', 'main.a[2]', 'main.a[4]');
    M.print('4 15 23\n');
    t.step(
      'print1',
      '<code>*p</code> è <code>a[0]</code> = 4; <code>*(p + 2)</code> è la casella due posti più avanti, <code>a[2]</code> = 15; <code>p[4]</code> vuol dire <code>*(p + 4)</code>, cioè <code>a[4]</code> = 23.',
      {},
      M.snap()
    );
    M.decl({ id: 'tot', type: 'int', name: 'tot', value: 0 });
    t.step('tot', '<code>tot</code> parte da 0.', {}, M.snap());
    M.set('main.p', punta(0));
    t.step('for', '<code>p = a</code>: si riparte dal primo elemento. La condizione <code>p != a + 5</code> confronta due indirizzi: è vera, si entra nel ciclo.', { p: 'a + 0' }, M.snap());
    let tot = 0;
    for (let k = 0; k < 5; k++) {
      const prima = tot;
      tot += a[k];
      M.read(`main.a[${k}]`);
      M.set('main.tot', tot);
      t.step('add', `<code>tot += *p</code>: <code>*p</code> è <code>a[${k}]</code> = ${a[k]}, quindi tot = ${prima} + ${a[k]} = <b>${tot}</b>.`, { p: `a + ${k}` }, M.snap());
      M.set('main.p', punta(k + 1));
      t.step(
        'for',
        k < 4
          ? `<code>p++</code>: p avanza di un elemento (4 byte, la dimensione di un <code>int</code>) e punta ad <code>a[${k + 1}]</code>. <code>p != a + 5</code>: si continua.`
          : '<code>p++</code>: ora p vale <code>a + 5</code>, la posizione «fine». <code>p != a + 5</code> è falso e il ciclo finisce, senza leggere quella casella.',
        { p: `a + ${k + 1}` },
        M.snap()
      );
    }
    M.read('main.tot');
    M.print(`somma con il puntatore: ${tot}\n`);
    t.step('print2', `Stampa la somma: <b>${tot}</b>. Lo stesso ciclo con un indice sarebbe <code>for (int i = 0; i &lt; 5; i++) tot += a[i];</code>.`, {}, M.snap());
    return t.frames;
  }

  /* ---------------------------------------------------------- new e delete */

  function mountDinamica(host) {
    ASD.stepper(host, {
      id: 'dinamica',
      title: 'Stack e heap passo per passo',
      code: { src: 'cpp/memoria_dinamica', region: 'main' },
      view: C.vista({ console: true, legend: ['ptr', 'dangling', 'freed', 'hl'] }),
      trace: traceDinamica,
      validate: (input, frames) => {
        const last = frames[frames.length - 1].state;
        if ((last.heap || []).some((b) => !b.freed)) return 'alla fine resta memoria non liberata';
        return C.outputUguale(['20 8 9'])(input, frames);
      },
    });
  }

  function traceDinamica() {
    const t = new ASD.Tracer(['new', 'delete']);
    const M = new C.Memoria();
    M.call('main', 'main()');
    M.decl({ id: 'x', type: 'int', name: 'x', value: 10, addr: '0x7f10' });
    t.step('x', '<code>int x = 10</code>: nel frame di main nasce la casella di <code>x</code>. Il suo indirizzo, <code>&amp;x</code>, è 0x7f10.', {}, M.snap());
    M.decl({ id: 'p', type: 'int*', name: 'p', ptr: 'main.x', value: '0x7f10' });
    t.step('p', '<code>int* p = &amp;x</code>: <code>p</code> contiene l\'indirizzo di <code>x</code>. La freccia è il modo di disegnare «p punta a x».', {}, M.snap());
    M.read('main.p');
    M.set('main.x', 20);
    t.step('deref', '<code>*p = 20</code>: si segue la freccia e si scrive nella casella di <code>x</code>, che ora vale 20 senza essere stata nominata.', {}, M.snap());
    M.decl({ id: 'q', type: 'int*', name: 'q', ptr: null });
    t.step('q', '<code>int* q = nullptr</code>: <code>q</code> non punta a niente. È il valore sicuro per un puntatore che non ha ancora un bersaglio.', {}, M.snap());
    t.count('new');
    M.alloc({ id: 'h1', label: 'new int(7)', value: 7, addr: '0x5a20' });
    M.set('main.q', { ptr: 'h1', value: '0x5a20' });
    t.step(
      'new',
      '<code>new int(7)</code> chiede allo heap lo spazio per un <code>int</code>, ci scrive 7 e restituisce l\'indirizzo, che finisce in <code>q</code>. Questa casella non ha un nome: si raggiunge solo da <code>q</code>.',
      {},
      M.snap()
    );
    M.read('main.q');
    M.set('h1', 8);
    t.step('q-inc', '<code>*q += 1</code>: il valore sullo heap diventa 8.', {}, M.snap());
    M.decl({ id: 'n', type: 'int', name: 'n', value: 4 });
    t.step('n', '<code>int n = 4</code>.', {}, M.snap());
    t.count('new');
    M.read('main.n');
    M.alloc({ id: 'h2', label: 'new int[4]', cells: [null, null, null, null], addr: '0x5a40' });
    M.decl({ id: 'a', type: 'int*', name: 'a', ptr: 'h2[0]', value: '0x5a40' });
    t.step(
      'new-arr',
      '<code>new int[n]</code> crea sullo heap un array di 4 <code>int</code>: la lunghezza si decide durante l\'esecuzione. Le caselle non sono inizializzate (?). <code>a</code> punta alla prima.',
      {},
      M.snap()
    );
    M.group('ciclo', 'ciclo for');
    for (let i = 0; i <= 4; i++) {
      if (i === 0) M.decl({ id: 'i', type: 'int', name: 'i', value: 0 }, null, 'ciclo');
      else M.set('main.i', i);
      if (i === 4) {
        t.step('for', '<code>i = 4</code>: <code>i &lt; n</code> è falso, il ciclo finisce e <code>i</code> sparisce con lui.', {}, M.snap());
        break;
      }
      t.step('for', `<code>i = ${i}</code>: ${i} &lt; 4, si esegue il corpo.`, {}, M.snap());
      M.read('main.a');
      M.set(`h2[${i}]`, i * i);
      t.step('a-i', `<code>a[${i}] = ${i} * ${i}</code> = ${i * i}. <code>a[${i}]</code> è la casella ${i} posti dopo quella puntata da <code>a</code>.`, {}, M.snap());
    }
    M.ungroup('ciclo');
    M.read('main.x', 'h1', 'h2[3]');
    M.print('20 8 9\n');
    t.step('print', 'Si stampano <code>x</code> (20), <code>*q</code> (8) e <code>a[3]</code> (9).', {}, M.snap());
    t.count('delete');
    M.free('h1', 'liberato (delete)');
    t.step(
      'delete',
      '<code>delete q</code>: la casella torna al sistema. Ma <code>q</code> contiene ancora 0x5a20: ora è un <strong>puntatore pendente</strong> (freccia rossa). Leggere o scrivere <code>*q</code> da qui in poi è comportamento indefinito.',
      {},
      M.snap()
    );
    M.set('main.q', { ptr: null });
    t.step('q-null', '<code>q = nullptr</code>: adesso <code>q</code> dice chiaramente che non punta a niente. Un\'altra <code>delete q</code> non farebbe danni.', {}, M.snap());
    t.count('delete');
    M.free('h2', 'liberato (delete[])');
    t.step('delete-arr', '<code>delete[] a</code>: un array creato con <code>new[]</code> si libera con <code>delete[]</code>. Anche <code>a</code> ora è pendente.', {}, M.snap());
    M.set('main.a', { ptr: null });
    t.step('a-null', '<code>a = nullptr</code>.', {}, M.snap());
    M.discard('h1');
    M.discard('h2');
    M.state('out');
    t.step('ret', '<code>return 0</code>: il frame di main sparisce. Ogni <code>new</code> ha avuto la sua <code>delete</code>: nessuna memoria persa.', {}, M.snap());
    return t.frames;
  }

  /* ------------------------------------------------------------ la lista */

  function mountLista(host) {
    ASD.stepper(host, {
      id: 'nodi',
      title: 'Costruire, stampare e liberare una lista',
      code: { src: 'cpp/nodo', region: 'tutto' },
      view: C.vista({ console: true, legend: ['ptr', 'ref', 'dangling', 'freed', 'hl'] }),
      trace: traceLista,
      validate: (input, frames) => {
        const last = frames[frames.length - 1].state;
        if ((last.heap || []).some((b) => !b.freed)) return 'alla fine resta un nodo non liberato';
        return C.outputUguale(['3 5 8'])(input, frames);
      },
    });
  }

  function traceLista() {
    const t = new ASD.Tracer(['new', 'delete']);
    const M = new C.Memoria();
    const valori = [8, 5, 3];
    const addr = { 8: '0x5a20', 5: '0x5a40', 3: '0x5a60' };
    const id = (x) => 'h' + x;
    M.call('main', 'main()');
    M.decl({ id: 'valori', type: 'vector<int>', name: 'valori', value: '{8, 5, 3}' });
    t.step('m-valori', 'In <code>main</code> c\'è il vettore dei valori da mettere nella lista.', {}, M.snap());
    M.decl({ id: 'lista', type: 'Nodo*', name: 'lista', uninit: true });
    M.note('aspetta costruisci');
    M.call('cos', 'costruisci(valori)');
    M.decl({ id: 'valori', type: 'const vector<int>&', name: 'valori', ref: 'main.valori', value: 'alias' });
    t.step('m-costruisci', '<code>main</code> chiama <code>costruisci(valori)</code>: il vettore arriva per riferimento costante, senza copia.', {}, M.snap());
    M.decl({ id: 'testa', type: 'Nodo*', name: 'testa', ptr: null });
    t.step('c-testa', '<code>Nodo* testa = nullptr</code>: la lista è vuota.', {}, M.snap());

    // ---- costruisci: inserimento in testa
    let testa = null;
    for (const x of valori) {
      M.group('giro', 'corpo del for');
      M.decl({ id: 'x', type: 'int', name: 'x', value: x }, null, 'giro');
      M.read('main.valori');
      t.step('c-for', `Nuovo giro del ciclo: <code>x = ${x}</code>.`, {}, M.snap());
      t.count('new');
      const next = testa
        ? { id: 'next', type: 'Nodo*', name: 'next', ptr: id(testa), value: addr[testa] }
        : { id: 'next', type: 'Nodo*', name: 'next', ptr: null };
      M.alloc({ id: id(x), label: 'new Nodo', addr: addr[x], fields: [{ id: 'val', type: 'int', name: 'val', value: x }, next] }, { first: true });
      M.decl({ id: 'nuovo', type: 'Nodo*', name: 'nuovo', ptr: id(x), value: addr[x] }, null, 'giro');
      t.step(
        'c-new',
        testa
          ? `<code>new Nodo{${x}, testa}</code>: nasce sullo heap un nodo con <code>val = ${x}</code> e <code>next</code> uguale alla testa attuale, il nodo ${testa}.`
          : `<code>new Nodo{${x}, testa}</code>: nasce sullo heap un nodo con <code>val = ${x}</code> e <code>next = nullptr</code>, perché la lista è vuota.`,
        {},
        M.snap()
      );
      testa = x;
      M.read('cos.nuovo');
      M.set('cos.testa', { ptr: id(x), value: addr[x] });
      t.step('c-link', `<code>testa = nuovo</code>: il nodo ${x} diventa il primo della lista. Alla fine del giro <code>x</code> e <code>nuovo</code> spariscono, il nodo resta.`, {}, M.snap());
      M.ungroup('giro');
    }
    t.step('c-for', 'I valori sono finiti e il ciclo termina. Inserendo sempre in testa, la lista è venuta al contrario: 3, 5, 8.', {}, M.snap());
    M.read('cos.testa');
    M.note('ritorna ' + addr[3]);
    M.state('out');
    t.step('c-ret', '<code>return testa</code>: costruisci restituisce l\'indirizzo del primo nodo. I nodi stanno sullo heap e restano anche quando il frame sparisce.', {}, M.snap());
    M.ret();
    M.note(null);
    M.set('main.lista', { ptr: id(3), value: addr[3], uninit: false });
    t.step('m-costruisci', '<code>lista</code> riceve l\'indirizzo del primo nodo. Il frame di costruisci non c\'è più, i nodi sì.', {}, M.snap());

    // ---- stampa: scorrere con p = p->next
    const ordine = [3, 5, 8];
    M.note('aspetta stampa');
    M.call('sta', 'stampa(testa)');
    M.decl({ id: 'testa', type: 'const Nodo*', name: 'testa', ptr: id(3), value: addr[3] });
    t.step('m-stampa', '<code>main</code> chiama <code>stampa(lista)</code>: il puntatore viene copiato nel parametro <code>testa</code>.', {}, M.snap());
    M.group('scorri', 'ciclo for');
    ordine.forEach((v, k) => {
      if (k === 0) M.decl({ id: 'p', type: 'const Nodo*', name: 'p', ptr: id(v), value: addr[v] }, null, 'scorri');
      else {
        M.read(`${id(ordine[k - 1])}.next`);
        M.set('sta.p', { ptr: id(v), value: addr[v] });
      }
      t.step(
        's-for',
        k === 0 ? '<code>p = testa</code>: p parte dal primo nodo. <code>p != nullptr</code>: si entra nel ciclo.' : `<code>p = p-&gt;next</code>: p passa al nodo ${v}. Non è <code>nullptr</code>: si continua.`,
        {},
        M.snap()
      );
      M.read(`${id(v)}.val`);
      M.print(v + ' ');
      t.step('s-print', `<code>p-&gt;val</code> vale ${v}: lo stampa.`, {}, M.snap());
    });
    M.read('h8.next');
    M.set('sta.p', { ptr: null });
    t.step('s-for', '<code>p = p-&gt;next</code>: il nodo 8 è l\'ultimo, il suo <code>next</code> è <code>nullptr</code>. La condizione è falsa e il ciclo finisce.', {}, M.snap());
    M.ungroup('scorri');
    M.print('\n');
    t.step('s-end', 'A capo, e <code>stampa</code> finisce.', {}, M.snap());
    M.ret();
    M.note(null);

    // ---- libera: salvare il successivo prima di delete
    M.note('aspetta libera');
    M.call('lib', 'libera(testa)');
    M.decl({ id: 'testa', type: 'Nodo*', name: 'testa', ptr: id(3), value: addr[3] });
    t.step('m-libera', '<code>main</code> chiama <code>libera(lista)</code>.', {}, M.snap());
    ordine.forEach((v, k) => {
      const dopo = ordine[k + 1];
      M.read('lib.testa');
      t.step('l-while', `<code>testa != nullptr</code>: c'è ancora il nodo ${v} da liberare.`, {}, M.snap());
      M.group('corpo', 'corpo del while');
      M.read(`${id(v)}.next`);
      M.decl(
        dopo ? { id: 'dopo', type: 'Nodo*', name: 'dopo', ptr: id(dopo), value: addr[dopo] } : { id: 'dopo', type: 'Nodo*', name: 'dopo', ptr: null },
        null,
        'corpo'
      );
      t.step(
        'l-dopo',
        dopo
          ? `<code>dopo = testa-&gt;next</code>: prima di distruggere il nodo ${v} si salva dove sta il successivo, il nodo ${dopo}.`
          : '<code>dopo = testa-&gt;next</code>: il nodo 8 è l\'ultimo, <code>dopo</code> vale <code>nullptr</code>.',
        {},
        M.snap()
      );
      t.count('delete');
      M.free(id(v), 'liberato (delete)');
      t.step(
        'l-delete',
        `<code>delete testa</code>: il nodo ${v} viene distrutto e <code>testa</code> resta pendente${k === 0 ? ', come <code>lista</code> nel frame di main' : ''}.`,
        {},
        M.snap()
      );
      M.read('lib.dopo');
      M.set('lib.testa', dopo ? { ptr: id(dopo), value: addr[dopo] } : { ptr: null });
      t.step('l-next', dopo ? `<code>testa = dopo</code>: si passa al nodo ${dopo}, grazie al puntatore salvato.` : '<code>testa = dopo</code>, cioè <code>nullptr</code>.', {}, M.snap());
      M.ungroup('corpo');
    });
    M.read('lib.testa');
    t.step('l-while', '<code>testa == nullptr</code>: tutti i nodi sono stati liberati.', {}, M.snap());
    M.ret();
    M.note(null);
    t.step('m-libera', 'Di nuovo in <code>main</code>. Attenzione: <code>lista</code> contiene ancora l\'indirizzo del primo nodo, che non esiste più. È pendente.', {}, M.snap());
    M.set('main.lista', { ptr: null });
    for (const v of ordine) M.discard(id(v));
    t.step('m-null', '<code>lista = nullptr</code>: nessun puntatore indica più memoria liberata, e lo heap è vuoto.', {}, M.snap());
    return t.frames;
  }
})();
