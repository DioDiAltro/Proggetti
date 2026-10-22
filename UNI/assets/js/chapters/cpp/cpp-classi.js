/* ASD a quadretti — capitolo "Struct, classi e template": struct e class,
   membri e metodi, public e private, costruttori con lista di
   inizializzazione, distruttore e RAII, metodi const, operatori ridefiniti
   (< per ordinare, << per stampare), template di funzione e di classe.
   Visualizzazione: il ciclo di vita degli oggetti (costruttori e distruttori)
   attraverso blocchi e chiamate, con l'output del programma. */
(function () {
  'use strict';

  const { m, box, table } = ASD;
  const C = ASD.cpp;

  const OUT_VITA = [
    'costruisco A',
    'costruisco B',
    'costruisco C',
    'dentro f',
    'distruggo C',
    'distruggo B',
    'costruisco D',
    'fine del main',
    'distruggo D',
    'distruggo A',
  ];

  ASD.chapter({
    id: 'cpp-classi',
    title: 'Struct, classi e template',
    lead:
      'Le strutture dati dell\'esame si scrivono come classi: una pila, una coda, un albero sono oggetti con dati privati e operazioni pubbliche. Qui vedi struct e class, costruttori e distruttori, gli operatori ridefiniti per ordinare e stampare, e i template, che permettono di scrivere una struttura dati una volta sola per tutti i tipi di elemento.',
    minutes: 45,
    prereq: ['cpp-puntatori'],
    goals: [
      'definire una struct o una class con campi, metodi, parte pubblica e parte privata',
      'scrivere un costruttore con la lista di inizializzazione e prevedere l\'ordine di costruttori e distruttori',
      'ridefinire <code>operator&lt;</code> per ordinare con <code>sort</code> e <code>operator&lt;&lt;</code> per stampare',
      'scrivere una funzione template e una classe template come <code>Pila&lt;T&gt;</code>',
    ],

    render(el) {
      el.innerHTML = `
<section id="struct-class">
  <h2>struct e class</h2>
  <p>Una <code>struct</code> raggruppa più valori in un tipo nuovo. I valori sono i <strong>campi</strong> (o membri
  dato); le funzioni dichiarate dentro sono i <strong>metodi</strong> e lavorano sull'oggetto su cui vengono chiamate.
  Ai membri si accede con il punto, o con <code>-&gt;</code> se hai un puntatore all'oggetto.</p>
  <div data-mount="punto"></div>
  <p><code>class</code> è la stessa cosa, con una sola differenza: i membri di una <code>struct</code> sono pubblici se
  non dici niente, quelli di una <code>class</code> sono privati. Con <code>public:</code> e <code>private:</code>
  decidi tu:</p>
  <ul>
    <li>la parte <strong>pubblica</strong> è l'interfaccia: le operazioni che chi usa l'oggetto può chiamare;</li>
    <li>la parte <strong>privata</strong> è la rappresentazione: i dati, che si toccano solo dai metodi della classe.</li>
  </ul>
  <p>Perché nascondere i dati? Perché un oggetto di solito deve rispettare delle regole (<i>invarianti</i>): una pila
  si modifica solo con <code>push</code> e <code>pop</code>, una frazione ha il denominatore positivo. Se i dati sono
  privati, solo i metodi possono cambiarli, e basta controllare quelli.</p>
  ${box('ricorda', `<p>Convenzione diffusa: <code>struct</code> per i dati semplici con i campi pubblici (un nodo, un punto,
  un record con nome e voto), <code>class</code> per i tipi con invarianti e dati privati (una pila, una frazione). Dentro
  i metodi, <code>this</code> è il puntatore all'oggetto su cui il metodo è stato chiamato.</p>`)}
</section>

<section id="costruttori">
  <h2>Costruttori e lista di inizializzazione</h2>
  <p>Il <strong>costruttore</strong> è un metodo con lo stesso nome della classe e senza tipo di ritorno. Viene chiamato
  da solo ogni volta che nasce un oggetto, e il suo compito è metterlo in uno stato valido. Ecco una classe completa:</p>
  <div data-mount="frazione"></div>
  ${C.out(`-3/4  1/2  2/3  3/4  5/1
true
0.333333`)}
  <ul>
    <li><strong>Lista di inizializzazione</strong>: <code>: num(n), den(d)</code>, tra la parentesi e la graffa,
    inizializza i membri <em>prima</em> che parta il corpo. È obbligatoria per i membri <code>const</code> e per i
    riferimenti, ed è il modo normale di inizializzare.</li>
    <li><strong>Argomenti di default</strong>: con <code>int n = 0, int d = 1</code> lo stesso costruttore vale come
    <code>Frazione()</code> (0/1), <code>Frazione(5)</code> (5/1) e <code>Frazione(3, 4)</code>.</li>
    <li><strong>Metodi <code>const</code></strong>: <code>int numeratore() const</code> promette di non modificare
    l'oggetto, e si può chiamare anche su un oggetto costante, per esempio un parametro
    <code>const Frazione&amp;</code>.</li>
  </ul>
  ${box('errore', `<p>I membri vengono inizializzati nell'ordine in cui sono <strong>dichiarati nella classe</strong>, non in
  quello in cui li scrivi nella lista. Qui <code>fine</code> è dichiarato prima, quindi viene calcolato quando
  <code>inizio</code> non ha ancora un valore. g++ con <code>-Wall</code> se ne accorge:</p>
  <div data-mount="ordine"></div>
  ${C.term(`reorder.cpp:2:15: warning: 'Intervallo::inizio' will be initialized after [-Wreorder]
reorder.cpp:4:56: warning: member 'Intervallo::inizio' is used uninitialized [-Wuninitialized]
    4 |     Intervallo(int a, int lunghezza) : inizio(a), fine(inizio + lunghezza) {}
      |                                                        ^~~~~~`)}
  <p>Scrivi la lista nello stesso ordine della dichiarazione, e non far dipendere un membro da quelli dichiarati dopo.</p>`)}
  ${box('errore', `<p>Un metodo che non modifica l'oggetto va dichiarato <code>const</code>. Se te ne dimentichi, non puoi
  chiamarlo su un riferimento costante, cioè proprio nelle funzioni che ricevono <code>const Frazione&amp; f</code>:</p>
  ${C.term(`constm.cpp:7:55: error: passing 'const Frazione' as 'this' argument discards qualifiers [-fpermissive]
    7 | double doppio(const Frazione& f) { return 2 * f.valore(); }
      |                                               ~~~~~~~~^~`)}
  <p>Il messaggio vuol dire: stai chiamando su un oggetto <code>const</code> un metodo che potrebbe modificarlo.</p>`)}
</section>

<section id="ciclo-vita">
  <h2>Distruttore e ciclo di vita</h2>
  <p>Il <strong>distruttore</strong>, <code>~NomeClasse()</code>, è il contrario del costruttore: viene chiamato da solo
  quando l'oggetto muore. Un oggetto locale muore alla <code>}</code> del suo blocco, uno creato con <code>new</code>
  alla sua <code>delete</code>. In ogni blocco gli oggetti vengono distrutti in ordine <strong>inverso</strong> rispetto a
  quello di costruzione: l'ultimo nato è il primo a morire, come i frame sullo stack. Prima di avviare, prova a scrivere
  l'output del programma su un foglio.</p>
  <div data-mount="vita"></div>
  ${box('esame', `<p>«Che cosa stampa questo programma?» con costruttori e distruttori che scrivono qualcosa è una domanda
  classica. Segna per ogni blocco l'ordine di costruzione; alla <code>}</code> lo ripercorri al contrario. Ricorda anche i
  frame: gli oggetti di una funzione muoiono quando la funzione finisce, prima che il chiamante vada avanti.</p>`)}
  <h3>RAII: la risorsa vive quanto l'oggetto</h3>
  <p>Se il costruttore acquisisce una risorsa (memoria, un file aperto) e il distruttore la rilascia, la risorsa non può
  restare «appesa»: il distruttore viene chiamato sempre, a ogni uscita dal blocco. È l'idea chiamata
  <strong>RAII</strong> (<i>Resource Acquisition Is Initialization</i>), ed è il motivo per cui <code>vector</code> e
  <code>string</code> non perdono mai memoria.</p>
  <div data-mount="buffer"></div>
  ${box('errore', `<p>Se una classe possiede memoria tramite un puntatore, la copia automatica copia il
  <em>puntatore</em>, non l'array: due oggetti puntano allo stesso blocco e alla fine lo liberano entrambi.</p>
  ${C.term(`==8884==ERROR: AddressSanitizer: attempting double-free on 0x504000000010 in thread T0:`)}
  <p>Per gestire una risorsa così bisogna scrivere anche il costruttore di copia e l'operatore di assegnamento (la
  «regola del tre»), oppure vietare la copia. La soluzione più semplice è non possedere memoria a mano: con
  <code>vector&lt;int&gt; dati;</code> come membro, copia e distruzione funzionano da sole («regola dello zero»).</p>`)}
</section>

<section id="operatori">
  <h2>Ridefinire gli operatori</h2>
  <p>Per i tipi che definisci tu, gli operatori come <code>&lt;</code>, <code>==</code> e <code>&lt;&lt;</code> non
  esistono finché non li scrivi. Sono funzioni con un nome speciale, <code>operator&lt;</code>,
  <code>operator==</code>, <code>operator&lt;&lt;</code>. I due che servono di più:</p>
  <ul>
    <li><code>operator&lt;</code> fa funzionare <code>sort</code>, <code>set</code>, <code>map</code> e
    <code>priority_queue</code> sul tuo tipo, che lo usano per confrontare;</li>
    <li><code>operator&lt;&lt;</code> permette di scrivere <code>cout &lt;&lt; s</code>. Si definisce fuori dalla classe,
    riceve lo stream e l'oggetto e restituisce lo stream, così le stampe si possono mettere in fila.</li>
  </ul>
  <div data-mount="studenti"></div>
  ${C.out(`Anna (30)
Luca (27)
Marco (27)
Bea (24)
per nome: Anna Bea Luca Marco`)}
  <p>Per ordinare in un altro modo senza toccare la classe si passa a <code>sort</code> un terzo argomento, un
  <strong>comparatore</strong>: una funzione che riceve due elementi e restituisce <code>true</code> se il primo va
  prima del secondo. Il modo più comodo è una <i>lambda</i>, una funzione senza nome scritta sul posto:</p>
  <div data-mount="lambda"></div>
  ${box('errore', `<p><code>operator&lt;</code> e i comparatori devono essere <strong>stretti</strong>: per due elementi
  uguali devono restituire <code>false</code>. Con <code>&lt;=</code> al posto di <code>&lt;</code>, <code>sort</code> può
  uscire dall'array. Con 40 elementi uguali e il comparatore <code>a &lt;= b</code>, AddressSanitizer trova:</p>
  ${C.term(`==8892==ERROR: AddressSanitizer: heap-buffer-overflow on address 0x50e0000000e0
READ of size 4 at 0x50e0000000e0 thread T0`)}`)}
</section>

<section id="template">
  <h2>Template</h2>
  <p>Una funzione che trova il massimo tra due <code>int</code> è identica a quella per due <code>double</code> o due
  <code>string</code>. Un <strong>template</strong> la scrive una volta sola, con un tipo come parametro: quando la usi,
  il compilatore ne genera una versione per ogni tipo che serve (si dice che la <i>istanzia</i>).</p>
  <div data-mount="tfunzione"></div>
  <p>A <code>T</code> si chiede solo quello che il corpo usa: qui l'operatore <code>&lt;</code>. Con un tipo che non lo
  ha, l'errore arriva in compilazione. E il tipo deve essere uno solo:</p>
  ${C.term(`dedu.cpp:3:28: error: no matching function for call to 'massimo(int, double)'
dedu.cpp:3:28: note:   deduced conflicting types for parameter 'const T' ('int' and 'double')`)}
  <p><code>massimo(3, 2.5)</code> non compila perché <code>T</code> dovrebbe essere sia <code>int</code> sia
  <code>double</code>. Si risolve indicando il tipo: <code>massimo&lt;double&gt;(3, 2.5)</code>.</p>
  <h3>Una classe template: Pila&lt;T&gt;</h3>
  <p>Lo stesso vale per le classi. Una pila di interi e una pila di stringhe differiscono solo per il tipo degli
  elementi: con un template la scrivi una volta e la usi come <code>Pila&lt;int&gt;</code>,
  <code>Pila&lt;string&gt;</code>, <code>Pila&lt;Nodo*&gt;</code>. Dentro c'è un <code>vector&lt;T&gt;</code>, che fa
  il lavoro e gestisce la memoria.</p>
  <div data-mount="pila"></div>
  ${C.out(`7 2.5 mondo
in cima: 16, elementi: 4
16 9 4 1
in cima: secondo`)}
  ${table({
    caption: 'Costo delle operazioni di Pila&lt;T&gt; (con n elementi)',
    head: ['Operazione', 'Costo', 'Perché'],
    rows: [
      ['<code>push(x)</code>', m('Θ(1)') + ' ammortizzato', '<code>push_back</code> del vector: di solito costante, a volte rialloca (' + ASD.link('cpp-stl', 'capacita', 'vedi la STL') + ')'],
      ['<code>pop()</code>', m('Θ(1)'), '<code>pop_back</code> toglie l\'ultimo elemento'],
      ['<code>top()</code>', m('Θ(1)'), '<code>back</code> legge l\'ultimo elemento'],
      ['<code>vuota()</code>, <code>dimensione()</code>', m('Θ(1)'), 'il vector conosce la sua lunghezza'],
    ],
  })}
  ${box('nota', `<p>È proprio così che è fatta la STL: <code>vector&lt;T&gt;</code>, <code>stack&lt;T&gt;</code>,
  <code>map&lt;K, V&gt;</code> sono classi template. Le strutture dati si studiano una volta, indipendentemente dal tipo
  degli elementi, e i template permettono di scriverle allo stesso modo. Una nota pratica: il codice di un template deve
  essere visibile dove lo usi, per questo si scrive tutto nell'header.</p>`, 'Perché i template contano per le strutture dati')}
  ${box('errore', `<p><code>pop()</code> su una pila vuota chiama <code>pop_back()</code> su un vector vuoto:
  comportamento indefinito. È una <i>precondizione</i>: chi chiama deve controllare prima con <code>vuota()</code>.
  All'esame scrivilo nel commento della funzione, o gestisci il caso.</p>`)}
</section>

<section id="esame">
  <h2>All'esame</h2>
  <ol>
    <li><strong>Scrivi la classe</strong> per una struttura dati (pila, coda, lista): dati privati, metodi pubblici,
    costruttore, e il distruttore se usi <code>new</code>.</li>
    <li><strong>Che cosa stampa?</strong> Con costruttori e distruttori che stampano: ordine di costruzione, poi
    distruzione al contrario a ogni <code>}</code>.</li>
    <li><strong>Ordina dei record</strong>: scrivi <code>operator&lt;</code> o il comparatore, con il criterio di parità.</li>
  </ol>
  ${box('esame', `<p>Se il testo dice «implementa una pila generica», si aspetta un template: <code>template &lt;typename
  T&gt; class Pila</code>. E se la tua classe usa <code>new</code>, chi corregge cerca il distruttore con la
  <code>delete</code> corrispondente.</p>`)}
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        punto: (host) =>
          ASD.code(host, {
            file: 'punto.cpp',
            code: `struct Punto {
    double x, y;                              // campi
    double distanza() const {                 // metodo: usa i campi dell'oggetto
        return sqrt(x * x + y * y);           // (sqrt è in <cmath>)
    }
};

Punto p{3, 4};                    // x = 3, y = 4
p.x = 6;                          // accesso con il punto
cout << p.distanza() << '\\n';     // 7.2111
Punto* q = &p;
cout << q->y << '\\n';             // con un puntatore: q->y vuol dire (*q).y`,
          }),
        frazione: (host) => ASD.code(host, { src: 'cpp/frazione', region: 'classe' }),
        ordine: (host) =>
          ASD.code(host, {
            file: 'reorder.cpp',
            code: `class Intervallo {
    int fine, inizio;     // fine è dichiarato per primo...
public:
    Intervallo(int a, int lunghezza) : inizio(a), fine(inizio + lunghezza) {}
};                        // ...quindi viene inizializzato per primo`,
          }),
        vita: mountVita,
        buffer: (host) =>
          ASD.code(host, {
            file: 'buffer.cpp',
            code: `class Buffer {
    int* dati;
    int n;
public:
    Buffer(int n) : dati(new int[n]), n(n) {}   // acquisisce la memoria
    ~Buffer() { delete[] dati; }                // la rilascia, sempre
    int& operator[](int i) { return dati[i]; }
};

void f() {
    Buffer b(1000);
    b[0] = 42;
}   // qui il distruttore di b libera l'array: nessuna perdita`,
          }),
        studenti: (host) => ASD.code(host, { src: 'cpp/studenti', region: 'studente' }),
        lambda: (host) => ASD.code(host, { src: 'cpp/studenti', region: 'lambda' }),
        tfunzione: (host) => ASD.code(host, { src: 'cpp/pila_template', region: 'funzione' }),
        pila: (host) => ASD.code(host, { src: 'cpp/pila_template', region: 'pila' }),
        quiz: (host) =>
          ASD.quiz(host, [
            {
              q: 'Che cosa stampa? (<code>T</code> stampa <code>+</code> e il nome quando nasce, <code>-</code> e il nome quando muore)',
              code: `int main() {
    T a("a");
    {
        T b("b");
        T c("c");
    }
    T d("d");
}`,
              options: ['<code>+a +b +c -c -b +d -d -a</code>', '<code>+a +b +c -b -c +d -a -d</code>', '<code>+a +b +c +d -a -b -c -d</code>', '<code>+a +b +c -c -b +d -a -d</code>'],
              answer: 0,
              explain: `Alla <code>}</code> del blocco interno muoiono <code>b</code> e <code>c</code>, al contrario di come sono nati:
              prima <code>c</code>, poi <code>b</code>. Poi nasce <code>d</code>. Alla fine del <code>main</code> muoiono
              <code>d</code> e <code>a</code>, di nuovo al contrario: <code>d</code> per primo.`,
            },
            {
              q: 'Qual è la differenza tra <code>struct</code> e <code>class</code> in C++?',
              options: [
                'Solo le classi possono avere metodi',
                'Solo le classi possono avere costruttori',
                'Nelle struct i membri sono pubblici per default, nelle class privati',
                'Le struct stanno sullo stack, le class sullo heap',
              ],
              answer: 2,
              explain: `È l'unica differenza: per il resto sono identiche, e entrambe possono avere metodi, costruttori,
              parti pubbliche e private. Dove sta un oggetto (stack o heap) dipende da come lo crei, non dalla parola chiave.`,
            },
            {
              q: 'Quale <code>operator&lt;</code> ordina gli studenti per voto <strong>decrescente</strong> e, a parità di voto, per nome crescente?',
              options: [
                '<code>return voto &gt; b.voto || nome &lt; b.nome;</code>',
                '<code>if (voto != b.voto) return voto &gt; b.voto; return nome &lt; b.nome;</code>',
                '<code>if (voto != b.voto) return voto &lt; b.voto; return nome &lt; b.nome;</code>',
                '<code>return voto &gt;= b.voto;</code>',
              ],
              answer: 1,
              explain: `Il nome conta solo a parità di voto, quindi va guardato dopo aver escluso voti diversi. La prima
              risposta mette Bea (24) prima di Luca (27) solo perché il nome viene prima; la terza ordina per voto crescente;
              l'ultima non è stretta (con due voti uguali restituisce <code>true</code>) e può far uscire <code>sort</code>
              dall'array.`,
            },
            {
              q: 'Perché questo codice non compila?',
              code: `template <typename T>
T massimo(const T& a, const T& b) { return (a < b) ? b : a; }

double m = massimo(3, 2.5);`,
              options: [
                'I template non accettano numeri con la virgola',
                '<code>T</code> dovrebbe essere sia <code>int</code> sia <code>double</code>: la deduzione fallisce',
                'Manca <code>operator&lt;</code> per <code>double</code>',
                'Il risultato andrebbe messo in un <code>int</code>',
              ],
              answer: 1,
              explain: `Dal primo argomento il compilatore deduce <code>T = int</code>, dal secondo <code>T = double</code>:
              un template non converte gli argomenti per farli combaciare. Si scrive <code>massimo&lt;double&gt;(3, 2.5)</code>
              oppure <code>massimo(3.0, 2.5)</code>.`,
            },
            {
              q: 'Una classe ha un membro <code>int* dati</code> creato con <code>new int[n]</code> nel costruttore e liberato nel distruttore. Che cosa succede con <code>Buffer b = a;</code>?',
              options: [
                'Viene copiato l\'array: <code>a</code> e <code>b</code> sono indipendenti',
                'Viene copiato il puntatore: alla fine lo stesso array viene liberato due volte',
                'Non compila: le classi con puntatori non si copiano',
                'Viene creato un array vuoto',
              ],
              answer: 1,
              explain: `La copia automatica copia membro per membro, quindi copia l'indirizzo. <code>a</code> e <code>b</code>
              puntano allo stesso blocco e i due distruttori lo liberano due volte. Per evitarlo servono costruttore di copia e
              assegnamento scritti a mano, oppure un <code>vector&lt;int&gt;</code> al posto del puntatore.`,
            },
          ]),
      });
      C.capitolo(el);
    },
  });

  /* ---------------------------------------- costruttori e distruttori in azione */

  function mountVita(host) {
    ASD.stepper(host, {
      id: 'vita',
      title: 'Chi nasce per ultimo muore per primo',
      code: { src: 'cpp/ciclo_vita', region: 'tutto' },
      view: C.vista({ heap: false, console: true, stackTitle: 'Stack', legend: ['hl'] }),
      trace: traceVita,
      validate: C.outputUguale(OUT_VITA),
    });
  }

  function traceVita() {
    const t = new ASD.Tracer(['costruttori', 'distruttori']);
    const M = new C.Memoria();
    const obj = (nome) => ({ id: nome.toLowerCase(), type: 'Traccia', name: nome.toLowerCase(), fields: [{ id: 'nome', type: 'string', name: 'nome', value: `"${nome}"` }] });
    const nasce = (path, nome, line, frame, group) => {
      M.decl(obj(nome), frame, group);
      t.step(line, `<code>Traccia ${nome.toLowerCase()}("${nome}")</code>: nasce l'oggetto. La lista di inizializzazione mette "${nome}" in <code>nome</code>, poi parte il corpo del costruttore.`, {}, M.snap());
      t.count('costruttori');
      M.read(path + '.nome');
      M.print(`costruisco ${nome}\n`);
      t.step('ctor', `Il costruttore stampa «costruisco ${nome}».`, {}, M.snap());
    };
    const muore = (path, nome, testo) => {
      t.count('distruttori');
      const r = M.find(path);
      if (r && r.obj) r.obj.cls = 'out';
      M.print(`distruggo ${nome}\n`);
      t.step('dtor', testo || `Il distruttore di <code>${nome.toLowerCase()}</code> stampa «distruggo ${nome}».`, {}, M.snap());
      M.drop(path);
    };

    M.call('main', 'main()');
    nasce('main.a', 'A', 'm-a');
    M.group('blocco', 'blocco { }');
    t.step('m-open', 'Si apre un blocco: gli oggetti dichiarati qui dentro muoiono alla <code>}</code> corrispondente.', {}, M.snap());
    nasce('main.b', 'B', 'm-b', null, 'blocco');
    M.note('aspetta f');
    M.call('f', 'f()');
    t.step('m-f', '<code>main</code> chiama <code>f()</code>: nuovo frame in cima allo stack.', {}, M.snap());
    nasce('f.c', 'C', 'f-c');
    M.print('dentro f\n');
    t.step('f-print', 'Stampa «dentro f».', {}, M.snap());
    M.state('out');
    t.step('f-end', 'Fine di <code>f</code>: prima di togliere il frame si distruggono i suoi oggetti. Qui c\'è solo <code>c</code>.', {}, M.snap());
    muore('f.c', 'C');
    M.ret();
    M.note(null);
    t.step('m-close', 'Di nuovo in <code>main</code>, che arriva alla <code>}</code> del blocco: muore <code>b</code>.', {}, M.snap());
    muore('main.b', 'B');
    M.ungroup('blocco');
    nasce('main.d', 'D', 'm-d');
    M.print('fine del main\n');
    t.step('m-print', 'Stampa «fine del main».', {}, M.snap());
    t.step('m-ret', '<code>return 0</code>: main sta per finire. Restano <code>a</code> e <code>d</code>, e moriranno al contrario di come sono nati.', {}, M.snap());
    M.state('out');
    t.step('m-end', 'Alla <code>}</code> finale si distruggono gli oggetti di main: prima <code>d</code>, l\'ultimo nato…', {}, M.snap());
    muore('main.d', 'D', 'Il distruttore di <code>d</code> stampa «distruggo D»…');
    muore('main.a', 'A', '…e per ultimo quello di <code>a</code>, il primo nato: «distruggo A».');
    t.step(
      null,
      'Fine. Gli oggetti sono nati nell\'ordine A, B, C, D e ognuno è morto alla fine del suo blocco: C alla fine di <code>f</code>, B alla <code>}</code> del blocco, D e A alla fine di <code>main</code>, al contrario di come erano nati.',
      {},
      M.snap()
    );
    return t.frames;
  }
})();
