/* ASD a quadretti — capitolo "Basi del linguaggio": struttura di un programma,
   tipi, variabili, input/output, operatori, controllo di flusso, errori del
   compilatore. Lo strumento interattivo è un programma eseguito riga per riga
   con le variabili disegnate come caselle di memoria. */
(function () {
  'use strict';

  const { m, box, table } = ASD;
  const C = ASD.cpp;

  ASD.chapter({
    id: 'cpp-basi',
    title: 'Basi del linguaggio',
    lead:
      'Com\'è fatto un programma C++, i tipi di base, le variabili, l\'input e l\'output, gli operatori e le istruzioni di controllo. È il minimo per leggere e scrivere il codice dell\'esame: se il C++ lo conosci già, usalo come ripasso veloce; se parti da zero, leggilo con calma e fai girare ogni esempio.',
    minutes: 40,
    prereq: ['setup'],
    goals: [
      'leggere un programma C++ completo e dire che cosa stampa, riga per riga',
      'scegliere il tipo giusto (int, long long, double, char, bool) e accorgerti quando un int trabocca',
      'usare gli operatori senza sorprese: divisione intera, resto, ++, && e || con la valutazione corto circuito',
      'scrivere cicli for, while e do-while e controllarli con break e continue',
      'leggere un messaggio d\'errore del compilatore e trovare la riga sbagliata',
    ],

    render(el) {
      el.innerHTML = `
<section id="struttura">
  <h2>Com'è fatto un programma</h2>
  <p>Tutti i programmi di questo corso hanno la stessa forma. Eccola nel caso più piccolo: il programma calcola la
  somma dei numeri da 1 a 10 con la formula di Gauss, ${m('n(n+1)/2')}, e la stampa.</p>
  <div data-mount="primo"></div>
  ${C.out('La somma dei numeri da 1 a 10 vale 55')}
  <dl>
    <dt><code>#include &lt;iostream&gt;</code></dt>
    <dd>porta nel programma una parte della libreria standard: <code>iostream</code> contiene <code>cout</code> e
    <code>cin</code>. Ogni strumento ha il suo file (<i>header</i>): <code>&lt;vector&gt;</code>, <code>&lt;string&gt;</code>,
    <code>&lt;algorithm&gt;</code> e così via.</dd>
    <dt><code>using namespace std;</code></dt>
    <dd>tutti i nomi della libreria standard hanno il prefisso <code>std::</code> (<code>std::cout</code>,
    <code>std::vector</code>); questa riga permette di ometterlo. Negli esercizi e all'esame va bene. Si evita nei file
    header (<code>.h</code>) e nei progetti grandi, perché porta nel programma migliaia di nomi che possono scontrarsi con
    i tuoi: prova a chiamare <code>count</code> una tua variabile globale, o <code>swap</code> una tua funzione.</dd>
    <dt><code>int main()</code></dt>
    <dd>la funzione da cui parte l'esecuzione. Le istruzioni tra le graffe <code>{ }</code> si eseguono dall'alto in basso,
    una dopo l'altra, e ognuna finisce con il punto e virgola.</dd>
    <dt><code>return 0;</code></dt>
    <dd>termina <code>main</code> e dice al sistema operativo che è andato tutto bene; un valore diverso da 0 segnala un
    errore. Solo in <code>main</code> si può omettere: vale come <code>return 0</code>.</dd>
  </dl>
  <p>Il testo dopo <code>//</code> è un commento fino a fine riga; <code>/* … */</code> è un commento su più righe. Il
  compilatore li ignora.</p>
  ${box('nota', `<p>In rete trovi spesso <code>#include &lt;bits/stdc++.h&gt;</code>, che include tutta la libreria in un colpo.
  Esiste solo con g++ (non con il compilatore di Visual Studio né con clang su macOS) e rallenta la compilazione: negli
  esempi gli header sono inclusi uno per uno, così sai sempre da dove viene ogni cosa.</p>`, 'Un include da evitare')}
</section>

<section id="tipi">
  <h2>Tipi e variabili</h2>
  <p>Una variabile è una casella di memoria con un <strong>nome</strong> e un <strong>tipo</strong>. Il tipo dice quanto
  spazio occupa e che valori può contenere. I tipi che servono all'esame sono pochi:</p>
  ${table({
    caption: 'I tipi di base (dimensioni tipiche dei PC di oggi, Windows e Linux)',
    head: ['Tipo', 'Contiene', 'Byte', 'Intervallo'],
    rows: [
      ['<code>int</code>', 'interi', '4', `da −2 147 483 648 a 2 147 483 647, circa ${m('±2,1 · 10^{9}')}`],
      ['<code>long long</code>', 'interi grandi', '8', `circa ${m('±9,2 · 10^{18}')}`],
      ['<code>double</code>', 'numeri con la virgola', '8', 'circa 15-16 cifre significative'],
      ['<code>char</code>', 'un carattere, che è un piccolo intero (il suo codice)', '1', '<code>\'A\'</code> vale 65, <code>\'a\'</code> vale 97'],
      ['<code>bool</code>', 'vero o falso', '1', '<code>true</code>, <code>false</code> (stampati come 1 e 0)'],
    ],
  })}
  <p>Si dichiara una variabile scrivendo il tipo e poi il nome. Conviene darle subito un valore:</p>
  <div data-mount="variabili"></div>
  <p>Esistono anche le versioni <code>unsigned</code> (solo valori ${m('>= 0')}). Quella che incontrerai più spesso è
  <code>size_t</code>, il tipo restituito da <code>v.size()</code>: è senza segno, e questo crea qualche trappola che
  vedrai nel capitolo ${ASD.link('cpp-stl')}.</p>
  ${box('errore', `<p>Una variabile locale dichiarata senza valore, come <code>int somma;</code>, contiene quello che c'era
  prima in quella zona di memoria: un valore <strong>indeterminato</strong>. Usarla prima di averle assegnato un valore è
  comportamento indefinito. g++ a volte se ne accorge (soprattutto compilando con <code>-O2</code>), ma non contarci:</p>
  ${C.term(`uninit.cpp:3:9: warning: 'somma' is used uninitialized [-Wuninitialized]
    3 |     int somma;
      |         ^~~~~`)}
  <p>Inizializza sempre: <code>int somma = 0;</code></p>`)}
  <h3>Overflow: quando un int non basta</h3>
  <p>Ogni tipo intero ha un intervallo. Se il risultato di un calcolo lo supera si ha un <strong>overflow</strong>
  (traboccamento): per gli interi con segno è comportamento indefinito, in pratica il valore «fa il giro» e diventa un
  numero senza senso, spesso negativo. L'errore più comune è moltiplicare due <code>int</code> e mettere il risultato in
  un <code>long long</code>:</p>
  <div data-mount="overflow"></div>
  <p>Il tipo di <code>a * a</code> dipende dagli operandi, non da dove finisce il risultato: due <code>int</code> danno un
  <code>int</code>, che trabocca prima di essere copiato nel <code>long long</code>. Con g++ in pratica esce 1410065408, cioè
  ${m('10^{10}')} meno due volte ${m('2^{32}')}. Con <code>1LL</code> (un <code>long long</code> che vale 1) il prodotto
  si fa a 64 bit.</p>
  ${box('ricorda', `<p>Se i valori possono superare circa due miliardi usa <code>long long</code>, e converti
  <strong>prima</strong> di moltiplicare. Un fattoriale supera l'<code>int</code> già a 13!, un <code>long long</code> a 21!.</p>`)}
  <p>Il programma qui sotto stampa dimensioni e limiti dei tipi e mostra le conversioni più comuni:</p>
  <div data-mount="tipi"></div>
  ${C.out(`sizeof(int)       = 4 byte
sizeof(long long) = 8 byte
sizeof(double)    = 8 byte
sizeof(char)      = 1 byte
sizeof(bool)      = 1 byte
int va da -2147483648 a 2147483647
long long arriva a 9223372036854775807
100000 * 100000 = 10000000000
A ha codice 65, la lettera dopo è B
7 / 2 = 3,  7 / 2.0 = 3.5
area del cerchio di raggio 2: 12.5664
a è pari? 1 (con boolalpha: true)`)}
</section>

<section id="io">
  <h2>Leggere e scrivere</h2>
  <p><code>cout &lt;&lt;</code> stampa, <code>cin &gt;&gt;</code> legge. Le frecce indicano dove vanno i dati: verso
  lo schermo, o dalla tastiera alla variabile. Si possono mettere in fila:</p>
  <div data-mount="io"></div>
  <ul>
    <li><code>'\\n'</code> va a capo. <code>endl</code> va a capo e in più svuota il buffer di uscita: quando si stampa
    molto è più lento, quindi negli esempi si usa <code>'\\n'</code>.</li>
    <li><code>cin &gt;&gt; x</code> salta spazi e a capo e legge un valore del tipo di <code>x</code>. Con una
    <code>string</code> legge una parola; per una riga intera serve <code>getline(cin, s)</code>.</li>
    <li><code>while (cin &gt;&gt; x)</code> legge finché ci sono dati: la lettura fallita (fine dell'input) vale
    <code>false</code>.</li>
    <li>Per stampare un <code>double</code> con due decimali: <code>cout &lt;&lt; fixed &lt;&lt; setprecision(2) &lt;&lt; x</code>
    (header <code>&lt;iomanip&gt;</code>).</li>
  </ul>
  ${box('nota', `Gli esempi del sito non leggono niente da tastiera: i dati sono scritti nel <code>main</code>, così ogni
  programma gira anche online con un clic su <strong>Esegui online</strong>. Nei tuoi esercizi usa pure <code>cin</code>.`, 'Perché gli esempi non usano cin')}
</section>

<section id="operatori">
  <h2>Operatori</h2>
  <h3>Divisione intera e resto</h3>
  <p>Tra due interi, <code>/</code> fa la <strong>divisione intera</strong>: la parte decimale si butta (si tronca verso
  lo zero). <code>%</code> dà il resto. Vale sempre ${m('a = (a / b) * b + a % b')}, anche con i negativi: per questo il
  resto ha il segno del dividendo.</p>
  ${table({
    head: ['Espressione', 'Valore', 'Perché'],
    rows: [
      ['<code>7 / 2</code>', '<code>3</code>', 'due <code>int</code>: divisione intera'],
      ['<code>7 % 2</code>', '<code>1</code>', 'il resto di 7 diviso 2'],
      ['<code>-7 / 2</code>', '<code>-3</code>', 'si tronca verso lo zero, non verso il basso (non −4)'],
      ['<code>-7 % 2</code>', '<code>-1</code>', 'il resto ha il segno del dividendo: ' + m('-7 = (-3) * 2 + (-1)')],
      ['<code>7 / 2.0</code>', '<code>3.5</code>', 'basta un <code>double</code> perché la divisione sia reale'],
      ['<code>(double)7 / 2</code>', '<code>3.5</code>', 'la conversione avviene prima della divisione'],
      ['<code>(double)(7 / 2)</code>', '<code>3</code>', 'la conversione avviene dopo: la parte decimale è già persa'],
    ],
  })}
  <p>Il resto serve più di quanto sembri: <code>n % 2 == 0</code> controlla se <var>n</var> è pari,
  <code>n % 10</code> è l'ultima cifra di <var>n</var>, <code>n / 10</code> la toglie, <code>(i + 1) % n</code> fa
  «girare» un indice in un array circolare.</p>
  <h3>Incremento e assegnamenti composti</h3>
  <p><code>x++</code> e <code>++x</code> aumentano entrambi <code>x</code> di 1. La differenza c'è solo se usi il valore
  nella stessa espressione: <code>x++</code> restituisce il valore <em>vecchio</em>, <code>++x</code> quello
  <em>nuovo</em>. Lo stesso per <code>x--</code> e <code>--x</code>. <code>s += 5</code> vuol dire <code>s = s + 5</code>,
  e così <code>-=</code>, <code>*=</code>, <code>/=</code>, <code>%=</code>.</p>
  <h3>Confronti e operatori logici</h3>
  <p>I confronti sono <code>==</code>, <code>!=</code>, <code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code>,
  <code>&gt;=</code>; gli operatori logici <code>&amp;&amp;</code> (e), <code>||</code> (o), <code>!</code> (non).
  <code>&amp;&amp;</code> e <code>||</code> usano la <strong>valutazione corto circuito</strong> (<i>short-circuit</i>):
  con <code>&amp;&amp;</code>, se la prima condizione è falsa la seconda non viene nemmeno calcolata; con
  <code>||</code>, se la prima è vera. Non è un dettaglio di efficienza: permette di scrivere condizioni sicure come
  <code>i &lt; n &amp;&amp; a[i] &gt; 0</code>, dove la seconda parte verrebbe letta fuori dall'array se la prima fosse falsa.
  L'ordine delle condizioni quindi conta.</p>
  ${box('errore', `<p><code>=</code> assegna, <code>==</code> confronta. <code>if (x = 0)</code> mette 0 in <code>x</code>, e
  poiché il valore dell'assegnamento è 0 (falso) il ramo <code>if</code> non viene mai eseguito. Il programma compila;
  per fortuna con <code>-Wall</code> g++ avvisa:</p>
  ${C.term(`uguale.cpp:6:11: warning: suggest parentheses around assignment used as truth value [-Wparentheses]
    6 |     if (x = 0) cout << "zero\\n";
      |         ~~^~~`)}`)}
  <p>Tutto insieme in un programma:</p>
  <div data-mount="operatori"></div>
  ${C.out(` 7 / 2 = 3     7 % 2 = 1
-7 / 2 = -3    -7 % 2 = -1
 7 / -2 = -3    7 % -2 = 1
(double)7 / 2 = 3.5
a = 5, b = 7, x = 7
s = 1
v[1] = 8 è maggiore di 5
v[2] = 15 è maggiore di 5`)}
  ${box('nota', `<p><code>&amp;&amp;</code> viene valutato prima di <code>||</code>: <code>a || b &amp;&amp; c</code> vuol dire
  <code>a || (b &amp;&amp; c)</code>. Quando hai un dubbio sulla precedenza degli operatori, metti le parentesi: costano
  niente e rendono il codice leggibile.</p>`, 'Precedenza')}
</section>

<section id="controllo">
  <h2>Istruzioni di controllo</h2>
  <p>Le istruzioni di controllo decidono quali righe eseguire e quante volte. Sono sempre le stesse in tutti gli
  algoritmi del corso:</p>
  ${table({
    head: ['Istruzione', 'Quando si usa'],
    rows: [
      ['<code>if (…) … else …</code>', 'scegliere tra due strade; con <code>else if</code> tra più strade, e vince la prima condizione vera'],
      ['<code>switch (x) { case …: … break; }</code>', 'scegliere in base al valore di un intero o di un carattere'],
      ['<code>for (init; condizione; passo)</code>', 'ripetere un numero di volte noto, di solito con un indice'],
      ['<code>while (condizione)</code>', 'ripetere finché vale una condizione; se è falsa subito, zero volte'],
      ['<code>do { … } while (condizione);</code>', 'come il while, ma il corpo si esegue almeno una volta'],
      ['<code>for (int x : v)</code>', 'visitare tutti gli elementi di un contenitore (<i>range-based for</i>)'],
      ['<code>break</code> / <code>continue</code>', 'uscire subito dal ciclo / passare subito al giro successivo'],
    ],
  })}
  <div data-mount="controllo"></div>
  ${C.out(`buono
fine settimana
1 4 9 16 25
dimezzamenti: 6
k = 10
1 3 5 7
somma = 14, v[2] = 40`)}
  <p>Guarda il ciclo che dimezza <code>n</code>: partendo da 100 gira 6 volte, cioè ${m('⌊log_2 100⌋')}. Un indice che
  si dimezza (o raddoppia) a ogni giro dà sempre un numero logaritmico di giri: è il primo logaritmo del corso, e lo
  ritroverai nella ricerca binaria e nel capitolo ${ASD.link('cx-metodo')}.</p>
  ${box('errore', `<p>In uno <code>switch</code>, senza <code>break</code> l'esecuzione prosegue nel <code>case</code>
  successivo (<i>fall-through</i>). A volte è voluto, come per <code>case 6:</code> e <code>case 7:</code> nel
  programma sopra, che condividono le stesse istruzioni; quasi sempre è una dimenticanza.</p>`)}
  ${box('ricorda', `<p>Nel <code>for</code> su intervallo, <code>for (int x : v)</code> lavora su una <strong>copia</strong>
  di ogni elemento: modificare <code>x</code> non cambia <code>v</code>. Per modificare gli elementi serve
  <code>for (int&amp; x : v)</code>; per leggere oggetti grandi senza copiarli, <code>for (const auto&amp; x : v)</code>.</p>`)}
</section>

<section id="a-mano">
  <h2>Eseguire un programma a mano</h2>
  <p>Allo scritto ti daranno un pezzo di codice e ti chiederanno che cosa stampa. Il metodo è sempre lo stesso: una
  colonna per ogni variabile, e una riga ogni volta che una variabile cambia. Prova sul programma che somma le cifre di
  un numero: prima prevedi a voce che cosa succede alla riga evidenziata, poi premi <kbd>→</kbd>.</p>
  <div data-mount="cifre"></div>
  <p>Sul foglio, per <code>n = 4096</code>, la tabella viene così (una riga per ogni giro del <code>while</code>):</p>
  ${table({
    head: ['Momento', '<code>n</code>', '<code>cifra</code>', '<code>somma</code>'],
    rows: [
      ['prima del ciclo', '4096', '—', '0'],
      ['fine del 1° giro', '409', '6', '6'],
      ['fine del 2° giro', '40', '9', '15'],
      ['fine del 3° giro', '4', '0', '15'],
      ['fine del 4° giro', '0', '4', '19'],
    ],
  })}
  <p>Il ciclo gira una volta per ogni cifra di <var>n</var>: ${m('⌊log_{10} n⌋ + 1')} volte. Con <code>n = 0</code> la
  condizione è falsa subito e il programma stampa 0 senza entrare nel ciclo.</p>
  ${box('ricorda', `<p><code>cifra</code> è dichiarata <em>dentro</em> le graffe del <code>while</code>: nasce all'inizio
  di ogni giro e sparisce alla <code>}</code>. Una variabile esiste solo nel blocco in cui è dichiarata (il suo
  <i>scope</i>). <code>somma</code> invece è dichiarata fuori, prima del ciclo: se fosse dentro, ripartirebbe da 0 a ogni giro.</p>`)}
</section>

<section id="compilare">
  <h2>Compilare e leggere gli errori</h2>
  <p>Dal terminale un programma si compila e si esegue così (i dettagli per ogni sistema sono in ${ASD.link('setup')}):</p>
  <pre class="code-out" tabindex="0"><code>g++ -std=c++17 -Wall -Wextra programma.cpp -o programma
./programma          (su Windows: programma.exe)</code></pre>
  <p><code>-Wall -Wextra</code> accendono gli <strong>avvisi</strong> (<i>warning</i>): il programma compila lo stesso,
  ma il compilatore ti segnala codice sospetto. Tienili sempre accesi. Il programma qui sotto invece non compila, di
  proposito: ha due errori.</p>
  <div data-mount="errore"></div>
  ${C.term(`errore_compilazione.cpp: In function 'int main()':
errore_compilazione.cpp:8:5: error: expected ',' or ';' before 'for'
    8 |     for (int i = 1; i <= 10; i++)
      |     ^~~
errore_compilazione.cpp:8:21: error: 'i' was not declared in this scope
    8 |     for (int i = 1; i <= 10; i++)
      |                     ^
errore_compilazione.cpp:10:27: error: 'totale' was not declared in this scope
   10 |     cout << "somma = " << totale << '\\n';
      |                           ^~~~~~
errore_compilazione.cpp:7:9: warning: unused variable 'somma' [-Wunused-variable]
    7 |     int somma = 0
      |         ^~~~~`, 'Messaggi di g++ per errore_compilazione.cpp')}
  <p>Ogni messaggio comincia con <code>file:riga:colonna:</code> e dice se è un <code>error</code> o un
  <code>warning</code>. Come leggerli:</p>
  <ol>
    <li><strong>Parti dal primo.</strong> Il punto e virgola manca alla fine della riga 7, ma il compilatore se ne
    accorge solo quando trova <code>for</code> alla riga 8. Se un errore sembra assurdo, guarda la riga prima.</li>
    <li><strong>Gli errori si trascinano.</strong> Il secondo (<code>'i' was not declared</code>) è una conseguenza del
    primo: il <code>for</code> non è stato capito. Correggi il primo e ricompila: spesso gli altri spariscono.</li>
    <li><strong>Il terzo è vero</strong>: <code>totale</code> non esiste, la variabile si chiama <code>somma</code>. Il
    warning sulla riga 7 è di nuovo un effetto del primo errore.</li>
  </ol>
  ${table({
    caption: 'I messaggi che vedrai più spesso',
    head: ['Messaggio', 'Di solito vuol dire'],
    rows: [
      ["<code>'x' was not declared in this scope</code>", 'nome scritto male, variabile usata fuori dal suo blocco, o header mancante (per <code>vector</code> g++ suggerisce: <code>did you forget to \'#include &lt;vector&gt;\'?</code>)'],
      ['<code>expected \';\' before …</code>', 'manca un punto e virgola, quasi sempre alla fine della riga precedente'],
      ['<code>no matching function for call to …</code>', 'argomenti in numero o di tipo sbagliato per quella funzione'],
      ['<code>invalid conversion from … to …</code>', 'tipi incompatibili, per esempio un puntatore dove serve un intero'],
      ['<code>comparison of integer expressions of different signedness</code> (warning)', '<code>int</code> confrontato con <code>size_t</code>, tipico di <code>i &lt; v.size()</code>'],
      ['<code>control reaches end of non-void function</code> (warning)', 'una funzione che deve restituire un valore può finire senza <code>return</code>'],
      ['<code>suggest parentheses around assignment</code> (warning)', 'un <code>=</code> dove volevi <code>==</code>'],
    ],
  })}
</section>

<section id="esame">
  <h2>All'esame</h2>
  <p>Sulle basi del linguaggio le domande sono quasi sempre di tre tipi:</p>
  <ol>
    <li><strong>Che cosa stampa?</strong> Divisione intera, resto con i negativi, <code>x++</code> contro
    <code>++x</code>, un ciclo con <code>break</code> o <code>continue</code>. Esegui a mano con la tabella delle
    variabili, come sopra.</li>
    <li><strong>Quante volte gira il ciclo?</strong> È la base del calcolo della complessità: un indice che avanza di 1
    dà <var>n</var> giri, uno che si dimezza ne dà ${m('log_2 n')}.</li>
    <li><strong>Trova l'errore.</strong> <code>=</code> al posto di <code>==</code>, variabile non inizializzata,
    overflow, punto e virgola dopo <code>for (…);</code> che svuota il ciclo.</li>
  </ol>
  ${box('esame', `<p>Allo scritto non c'è il compilatore che ti avvisa: scrivi il codice come se dovesse compilare davvero.
  Punti e virgola, graffe e tipi delle variabili contano anche sulla carta, e chi corregge li guarda.</p>`)}
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <p>Per ogni frammento prevedi l'output prima di guardare le risposte.</p>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        primo: (host) => ASD.code(host, { src: 'cpp/primo_programma' }),
        variabili: (host) =>
          ASD.code(host, {
            file: 'variabili.cpp',
            code: `int n = 10;              // intero, con il suo valore iniziale
double media = 27.5;     // il separatore decimale è il punto
char iniziale = 'A';     // apici singoli per un carattere
bool trovato = false;
string nome = "Ada";     // virgolette doppie per una stringa (#include <string>)
const int MAX = 100;     // const: il valore non può più cambiare
auto k = n * 2;          // auto: il tipo lo deduce il compilatore (qui int)`,
          }),
        overflow: (host) =>
          ASD.code(host, {
            file: 'overflow.cpp',
            code: `int a = 100000;
long long sbagliato = a * a;      // overflow: il prodotto si calcola in int
long long giusto = 1LL * a * a;   // 10000000000: il prodotto si calcola in long long`,
            notes: { 2: 'trabocca!' },
          }),
        tipi: (host) => ASD.code(host, { src: 'cpp/tipi', maxHeight: 340 }),
        io: (host) =>
          ASD.code(host, {
            file: 'leggi.cpp',
            code: `int n;
double x;
cin >> n >> x;                                  // due valori, separati da spazi o a capo
cout << "n = " << n << ", x = " << x << '\\n';   // '\\n' va a capo`,
          }),
        operatori: (host) => ASD.code(host, { src: 'cpp/operatori', maxHeight: 360 }),
        controllo: (host) => ASD.code(host, { src: 'cpp/controllo', maxHeight: 380 }),
        cifre: mountCifre,
        errore: (host) => ASD.code(host, { src: 'cpp/errore_compilazione' }),
        quiz: (host) =>
          C.quiz(host, [
            {
              q: 'Che cosa stampa?',
              code: `int a = 17, b = 5;
cout << a / b << ' ' << a % b << ' ' << a / 2.0;`,
              options: ['<code>3 2 8.5</code>', '<code>3.4 2 8.5</code>', '<code>3 2 8</code>', '<code>3 3 8.5</code>'],
              answer: 0,
              explain: `<code>17 / 5</code> è una divisione tra interi: 3, con resto <code>17 % 5 = 2</code> (infatti
              ${m('3 * 5 + 2 = 17')}). In <code>a / 2.0</code> un operando è <code>double</code>, quindi la divisione è reale: 8.5.`,
            },
            {
              q: 'Che cosa stampa?',
              code: `int x = 5;
int y = x++ * 2;
cout << x << ' ' << y;`,
              options: ['<code>6 10</code>', '<code>6 12</code>', '<code>5 10</code>', '<code>6 11</code>'],
              answer: 0,
              explain: `<code>x++</code> vale il valore vecchio di <code>x</code>, cioè 5, e poi aumenta <code>x</code>:
              <code>y = 5 * 2 = 10</code> e <code>x</code> diventa 6. Con <code>++x</code> sarebbe stato <code>6 12</code>.`,
            },
            {
              q: 'Che cosa stampa?',
              code: `for (int i = 0; i < 10; i++) {
    if (i % 3 == 0) continue;
    if (i == 7) break;
    cout << i;
}`,
              options: ['<code>1245</code>', '<code>12457</code>', '<code>124578</code>', '<code>0124</code>'],
              answer: 0,
              explain: `I multipli di 3 (0, 3, 6) vengono saltati da <code>continue</code>; 1, 2, 4, 5 vengono stampati; con
              <code>i = 7</code> il <code>break</code> esce dal ciclo prima della stampa. Il 9 non viene mai raggiunto.`,
            },
            {
              q: 'Che cosa stampa?',
              code: `int k = 0;
if (k = 0) cout << "zero";
else cout << "diverso da zero";`,
              options: ['<code>zero</code>', '<code>diverso da zero</code>', 'Non compila', 'Dipende dal compilatore'],
              answer: 1,
              explain: `<code>k = 0</code> è un <em>assegnamento</em>, non un confronto: mette 0 in <code>k</code> e vale 0,
              cioè falso. Si esegue il ramo <code>else</code>. Il programma compila; con <code>-Wall</code> g++ avvisa
              <code>suggest parentheses around assignment used as truth value</code>.`,
            },
            {
              q: 'Che cosa stampa?',
              code: `int i = 10;
do {
    cout << i << ' ';
    i++;
} while (i < 5);`,
              options: ['<code>10</code>', 'Niente', '<code>10 11 12 13 14</code>', 'Non termina mai'],
              answer: 0,
              explain: `Il <code>do-while</code> controlla la condizione <em>dopo</em> il corpo: il corpo si esegue una volta e
              stampa 10, poi <code>11 &lt; 5</code> è falso e il ciclo finisce. Un <code>while (i &lt; 5)</code> normale non
              avrebbe stampato niente.`,
            },
            {
              q: `Con <code>int a = 50000;</code>, quale variabile contiene davvero ${m('a^{2} = 2,5 · 10^{9}')}?`,
              code: `long long b1 = a * a;
long long b2 = 1LL * a * a;
long long b3 = (long long)(a * a);
int b4 = a * a;`,
              options: ['<code>b1</code>', '<code>b2</code>', '<code>b3</code>', '<code>b4</code>'],
              answer: 1,
              explain: `${m('2,5 · 10^{9}')} supera il massimo di un <code>int</code> (circa ${m('2,1 · 10^{9}')}). Per
              <code>b1</code> e <code>b3</code> il prodotto <code>a * a</code> si calcola tra due <code>int</code> e trabocca
              <em>prima</em> della conversione; in <code>b4</code> il risultato non ci starebbe comunque. In <code>b2</code>,
              <code>1LL * a</code> è già un <code>long long</code>, e così il prodotto successivo.`,
            },
          ]),
      });
      C.aCapo(el);
    },
  });

  /* Stepper: la somma delle cifre, con le variabili disegnate come caselle. */
  function mountCifre(host) {
    ASD.stepper(host, {
      id: 'cifre',
      title: 'Somma delle cifre, riga per riga',
      code: { src: 'cpp/somma_cifre', region: 'main' },
      input: {
        value: 4096,
        label: 'Numero n',
        parse: (s) => {
          const t = String(s).replace(/[\s.']/g, '');
          if (!/^\d+$/.test(t)) throw new Error('Scrivi un intero non negativo, per esempio 4096.');
          const v = Number(t);
          if (v > 999999999) throw new Error('Al massimo 9 cifre: un int arriva a 2 147 483 647.');
          return v;
        },
        format: (v) => String(v),
        presets: [
          { label: 'Una cifra', value: 7 },
          { label: 'Con gli zeri', value: 100200 },
          { label: 'Casuale', value: () => ASD.randInt(10000, 999999) },
        ],
      },
      view: C.vista({ heap: false, console: true, stackTitle: 'Memoria', stackHint: 'le variabili di main' }),
      trace: traceCifre,
      validate: C.outputUguale((n) => [`somma delle cifre: ${sommaCifre(n)}`]),
    });
  }

  const sommaCifre = (n) =>
    String(n)
      .split('')
      .reduce((s, c) => s + Number(c), 0);

  function traceCifre(N) {
    const t = new ASD.Tracer(['giri']);
    const M = new C.Memoria();
    M.call('main', 'main()');
    M.decl({ id: 'n', type: 'int', name: 'n', value: N });
    t.step(
      'n',
      N === 4096
        ? 'Si crea la variabile <code>n</code>: una casella di memoria che contiene 4096.'
        : `Si crea la variabile <code>n</code>. Nel programma c'è 4096; qui parti da <b>${N}</b>, come se avessi scritto ${N} al suo posto.`,
      {},
      M.snap()
    );
    M.decl({ id: 'somma', type: 'int', name: 'somma', value: 0 });
    t.step('somma', '<code>somma</code> parte da 0: accumulerà le cifre una alla volta.', {}, M.snap());
    let n = N;
    let somma = 0;
    for (;;) {
      M.read('main.n');
      const ok = n > 0;
      t.step('cond', ok ? `Condizione del <code>while</code>: ${n} &gt; 0 è vera, si entra nel corpo.` : `Condizione: ${n} &gt; 0 è falsa, il ciclo finisce.`, {}, M.snap());
      if (!ok) break;
      t.count('giri');
      M.group('corpo', 'corpo del while');
      const cifra = n % 10;
      M.read('main.n');
      M.decl({ id: 'cifra', type: 'int', name: 'cifra', value: cifra }, null, 'corpo');
      t.step('cifra', `Nasce <code>cifra</code> = ${n} % 10 = <b>${cifra}</b>: il resto della divisione per 10 è l'ultima cifra.`, {}, M.snap());
      const prima = somma;
      somma += cifra;
      M.read('main.cifra');
      M.set('main.somma', somma);
      t.step('add', `<code>somma += cifra</code>: ${prima} + ${cifra} = <b>${somma}</b>.`, {}, M.snap());
      const vecchio = n;
      n = Math.floor(n / 10);
      M.set('main.n', n);
      t.step('div', `<code>n /= 10</code>: ${vecchio} / 10 = <b>${n}</b>. È una divisione intera: la cifra ${cifra} se ne va.`, {}, M.snap());
      M.ungroup('corpo');
      t.step('end-body', 'Fine del corpo: <code>cifra</code> esce dal suo blocco e smette di esistere. Si torna alla condizione.', {}, M.snap());
    }
    M.read('main.somma');
    M.print(`somma delle cifre: ${somma}\n`);
    t.step('print', `Si stampa il risultato: <b>${somma}</b>${N > 0 ? ` (${String(N).split('').join(' + ')} = ${somma})` : ''}.`, {}, M.snap());
    M.state('out');
    t.step('ret', '<code>return 0</code>: <code>main</code> finisce e le sue variabili spariscono con lui.', {}, M.snap());
    return t.frames;
  }
})();
