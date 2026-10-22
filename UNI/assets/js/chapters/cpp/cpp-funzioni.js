/* ASD a quadretti — capitolo "Funzioni e riferimenti": dichiarazione e
   definizione, passaggio per valore, per riferimento e per riferimento
   costante, valori di ritorno, overloading, argomenti di default, scope e
   durata, lo stack delle chiamate. Due visualizzazioni sulla memoria: lo
   scambio per valore contro quello per riferimento, e la catena main → f → g. */
(function () {
  'use strict';

  const { m, box, table } = ASD;
  const C = ASD.cpp;

  ASD.chapter({
    id: 'cpp-funzioni',
    title: 'Funzioni e riferimenti',
    lead:
      'Una funzione è un pezzo di programma con un nome, dei parametri e un valore di ritorno. Qui vedi come si passano i parametri (per valore, per riferimento, per riferimento costante), che cosa succede in memoria a ogni chiamata e perché lo stack delle chiamate è la chiave per capire la ricorsione.',
    minutes: 40,
    prereq: ['cpp-basi'],
    goals: [
      'dichiarare e definire una funzione, e capire quando al compilatore serve il prototipo',
      'scegliere tra passaggio per valore, per riferimento e per riferimento costante, sapendo quanto costa ciascuno',
      'disegnare lo stack delle chiamate: un frame per ogni chiamata in corso, con parametri e variabili locali',
      'usare overloading e argomenti di default senza ambiguità',
    ],

    render(el) {
      el.innerHTML = `
<section id="anatomia">
  <h2>Com'è fatta una funzione</h2>
  <p>Una funzione ha un <strong>tipo di ritorno</strong>, un <strong>nome</strong>, una lista di
  <strong>parametri</strong> e un <strong>corpo</strong>. <code>return</code> restituisce il valore e termina la funzione;
  una funzione <code>void</code> non restituisce niente.</p>
  <div data-mount="anatomia"></div>
  <p>I nomi tra parentesi nella definizione sono i <strong>parametri</strong> (<code>x</code>, <code>nome</code>); i
  valori passati nella chiamata sono gli <strong>argomenti</strong> (<code>7</code>). All'inizio della chiamata ogni
  parametro viene inizializzato con il suo argomento.</p>
  <h3>Dichiarazione e definizione</h3>
  <p>Il compilatore legge il file dall'alto in basso: una funzione si può chiamare solo se è già stata
  <strong>dichiarata</strong> più su. La dichiarazione (il <i>prototipo</i>) è la prima riga della funzione seguita da
  <code>;</code>: dice nome, parametri e tipo di ritorno. La <strong>definizione</strong> contiene anche il corpo e può
  stare più giù, anche dopo il <code>main</code>. Nel programma qui sotto <code>media</code> e <code>minMax</code> sono
  dichiarate in alto e definite in fondo.</p>
  <div data-mount="parametri"></div>
  ${C.out(`media: 27.25
minimo 24, massimo 30
9 2.5 7
28, 30, 24, 27
28 | 30 | 24 | 27`)}
  ${box('nota', `<p>Nei progetti veri le dichiarazioni stanno in un file header (<code>.h</code>) e le definizioni in un
  file <code>.cpp</code>: chi usa le funzioni include solo l'header. È la stessa cosa che fai tu con
  <code>#include &lt;vector&gt;</code>.</p>`, 'Header')}
</section>

<section id="passaggio">
  <h2>Per valore o per riferimento</h2>
  <p>Quando passi un argomento <strong>per valore</strong> (<code>int x</code>) il parametro è una variabile nuova che
  riceve una <em>copia</em>: quello che la funzione fa a <code>x</code> non tocca l'originale. Quando lo passi
  <strong>per riferimento</strong> (<code>int&amp; x</code>) il parametro non è una casella nuova: è un altro nome
  (<i>alias</i>) della variabile del chiamante, e ogni modifica arriva a lei.</p>
  <p>Le due funzioni qui sotto sono identiche tranne che per i due <code>&amp;</code>. Segui la memoria: nella prima i
  parametri sono caselle a sé; nella seconda sono frecce tratteggiate verso <code>a</code> e <code>b</code>.</p>
  <div data-mount="scambio"></div>
  ${box('errore', `<p><code>scambiaValore</code> scambia le copie, che spariscono alla fine della funzione: per il chiamante
  non è successo niente. Se una funzione deve modificare i suoi argomenti (scambiare, ordinare, riempire), i parametri
  vanno passati per riferimento.</p>`)}
  <h3>Riferimento costante: niente copia, niente modifiche</h3>
  <p>Copiare un <code>int</code> costa niente; copiare un <code>vector</code> di un milione di elementi costa un milione
  di copie. Per gli oggetti grandi che la funzione deve solo leggere si usa il <strong>riferimento costante</strong>,
  <code>const vector&lt;int&gt;&amp; v</code>: nessuna copia, e il compilatore rifiuta ogni tentativo di modificare
  <code>v</code>.</p>
  ${table({
    caption: 'Come passare un parametro, e quanto costa',
    head: ['Modo', 'Esempio', 'Copia?', 'Modifica l\'originale?', 'Costo con un vector di <var>n</var> elementi', 'Quando'],
    rows: [
      ['per valore', '<code>int f(int x)</code>', 'sì', 'no', '—', 'tipi piccoli: <code>int</code>, <code>double</code>, <code>char</code>, <code>bool</code>'],
      ['per valore', '<code>int f(vector&lt;int&gt; v)</code>', 'sì', 'no', m('Θ(n)') + ' a ogni chiamata', 'quasi mai: solo se ti serve una copia da modificare'],
      ['per riferimento', '<code>void f(vector&lt;int&gt;&amp; v)</code>', 'no', 'sì', m('Θ(1)'), 'la funzione deve cambiare l\'argomento (ordinamenti, scambi)'],
      ['per riferimento costante', '<code>int f(const vector&lt;int&gt;&amp; v)</code>', 'no', 'no (non compila)', m('Θ(1)'), 'oggetti grandi da leggere soltanto'],
    ],
  })}
  ${box('esame', `<p>Il costo del passaggio entra nella complessità. Una ricerca binaria ricorsiva che riceve il
  <code>vector</code> <strong>per valore</strong> copia tutto l'array a ogni chiamata: ${m('Θ(n)')} per ognuna delle
  ${m('Θ(log n)')} chiamate, cioè ${m('Θ(n log n)')} invece di ${m('Θ(log n)')}. Con <code>const vector&lt;int&gt;&amp;</code>
  torna ${m('Θ(log n)')}.</p>`)}
  ${box('errore', `<p>Un riferimento non costante si lega solo a una variabile: <code>scambiaRiferimento(a, 5)</code> non
  compila, perché 5 non è una casella che si possa modificare. Un riferimento costante accetta anche i valori temporanei:
  <code>media({28, 30})</code> funziona.</p>`)}
  <h3>Restituire un risultato</h3>
  <p><code>return</code> restituisce un valore solo. Per restituirne due ci sono tre strade: parametri per riferimento
  che la funzione riempie (come <code>minMax</code> sopra), una <code>pair</code>, oppure una <code>struct</code>:</p>
  <div data-mount="ritorno"></div>
  <p>Restituire un <code>vector</code> per valore non copia gli elementi: il compilatore lo <em>sposta</em> al chiamante,
  a costo costante. Il problema è il contrario: restituire un riferimento a una variabile locale.</p>
  ${box('errore', `<p>Le variabili locali spariscono quando la funzione finisce. Un riferimento (o un puntatore) a una di
  loro, restituito al chiamante, indica memoria che non esiste più. g++ avvisa, ma il programma compila:</p>
  ${C.term(`rifloc.cpp: In function 'int& doppio(int)':
rifloc.cpp:3:12: warning: reference to local variable 'r' returned [-Wreturn-local-addr]
    3 |     return r;
      |            ^`)}
  <p>Restituisci per valore: <code>int doppio(int x)</code>.</p>`)}
</section>

<section id="stack">
  <h2>Lo stack delle chiamate</h2>
  <p>A ogni chiamata il programma prepara un <strong>record di attivazione</strong> (<i>frame</i>): uno spazio con i
  parametri, le variabili locali e il punto in cui tornare alla fine. I frame stanno in una zona di memoria organizzata
  come una pila, lo <strong>stack delle chiamate</strong>: la chiamata nuova va in cima, e quando finisce il suo frame
  viene tolto. L'ultima funzione chiamata è la prima a finire (<i>LIFO</i>, <i>last in, first out</i>).</p>
  <div data-mount="chiamate"></div>
  ${box('ricorda', `<p>Ogni chiamata ha le <strong>sue</strong> copie dei parametri e delle variabili locali, anche quando
  la funzione è la stessa: due chiamate di <code>g</code> non condividono niente. Quando una funzione chiama se stessa
  succede esattamente questo, con un frame per ogni chiamata ancora aperta: è la ${ASD.link('cpp-ricorsione', null, 'ricorsione')}.</p>`)}
  <h3>Scope e durata</h3>
  <p>Due domande diverse per ogni variabile. Lo <strong>scope</strong> (visibilità) è la parte del codice in cui il suo
  nome si può usare: dalla dichiarazione alla <code>}</code> del blocco. La <strong>durata</strong> (<i>lifetime</i>) è
  il tempo in cui la casella esiste:</p>
  ${table({
    head: ['Variabile', 'Dove si dichiara', 'Quanto vive'],
    rows: [
      ['locale (automatica)', 'dentro una funzione o un blocco', 'dalla dichiarazione alla fine del blocco: sta nel frame'],
      ['parametro', 'tra le parentesi della funzione', 'per tutta la chiamata'],
      ['<code>static</code> locale', 'dentro una funzione, con <code>static</code>', 'tutto il programma: è inizializzata una volta sola e conserva il valore tra una chiamata e l\'altra'],
      ['globale', 'fuori da tutte le funzioni', 'tutto il programma, visibile ovunque: da usare poco'],
      ['dinamica', 'creata con <code>new</code>', 'finché non la liberi con <code>delete</code> (capitolo ' + ASD.link('cpp-puntatori') + ')'],
    ],
  })}
  <div data-mount="statica"></div>
  ${box('nota', `<p>Lo stack è piccolo: di solito 8 MB su Linux e 1 MB su Windows. Un array locale enorme come
  <code>int a[10000000];</code> (40 MB) non ci sta e il programma si chiude subito con un errore. Per i dati grandi
  usa <code>vector</code>, che tiene gli elementi nello heap.</p>`, 'Quanto è grande lo stack')}
</section>

<section id="overloading">
  <h2>Overloading e argomenti di default</h2>
  <p>Due funzioni possono avere lo stesso nome se hanno parametri diversi (<i>overloading</i>): il compilatore sceglie
  quella che corrisponde meglio ai tipi degli argomenti. Il solo tipo di ritorno non basta a distinguerle.</p>
  <div data-mount="overload"></div>
  ${box('errore', `<p>Se nessuna versione è migliore delle altre per tutti gli argomenti, la chiamata è
  <strong>ambigua</strong> e non compila. Con <code>massimo(3, 4.5)</code> la versione <code>int</code> va bene per il
  primo argomento e quella <code>double</code> per il secondo:</p>
  ${C.term(`ambiguo.cpp:3:28: error: call of overloaded 'massimo(int, double)' is ambiguous
    3 | int main() { return massimo(3, 4.5) > 0 ? 0 : 1; }
      |                     ~~~~~~~^~~~~~~~
ambiguo.cpp:1:5: note: candidate: 'int massimo(int, int)'
ambiguo.cpp:2:8: note: candidate: 'double massimo(double, double)'`)}
  <p>Si risolve scrivendo <code>massimo(3.0, 4.5)</code>.</p>`)}
  <p>Un parametro può avere un <strong>valore di default</strong>, usato quando l'argomento manca. I parametri con il
  default devono essere gli ultimi, e il default si scrive una volta sola (nella dichiarazione, se c'è).</p>
  <div data-mount="default"></div>
</section>

<section id="esame">
  <h2>All'esame</h2>
  <ol>
    <li><strong>Che cosa stampa?</strong> Un programma con una funzione per valore e una per riferimento: disegna i frame
    come nella visualizzazione e segui le frecce.</li>
    <li><strong>Scrivi la firma.</strong> Una funzione che ordina un array prende <code>vector&lt;int&gt;&amp;</code>; una
    che lo legge soltanto prende <code>const vector&lt;int&gt;&amp;</code>; una che restituisce un numero ha tipo di
    ritorno <code>int</code>, non <code>void</code>.</li>
    <li><strong>Quanto costa?</strong> Ricordati di contare le copie dei parametri passati per valore.</li>
  </ol>
  ${box('esame', `<p>Quando disegni lo stack a mano, scrivi un rettangolo per frame con il nome della funzione e le sue
  variabili, il frame più recente in alto. Per i riferimenti disegna una freccia verso la variabile del chiamante invece
  di una casella con un valore: è il modo più veloce per non sbagliare i "cosa stampa".</p>`)}
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        anatomia: (host) =>
          ASD.code(host, {
            file: 'funzioni.cpp',
            code: `int quadrato(int x) {          // tipo di ritorno, nome, parametri
    return x * x;              // restituisce il valore e termina
}

void saluta(string nome) {     // void: non restituisce niente
    cout << "Ciao " << nome << '\\n';
}

int q = quadrato(7);           // chiamata: l'argomento 7 va in x, q vale 49
saluta("Ada");                 // stampa: Ciao Ada`,
          }),
        parametri: (host) => ASD.code(host, { src: 'cpp/parametri', maxHeight: 420 }),
        scambio: mountScambio,
        ritorno: (host) =>
          ASD.code(host, {
            file: 'ritorno.cpp',
            code: `pair<int, int> minMax(const vector<int>& v) {
    int mn = v[0], mx = v[0];
    for (int x : v) {
        if (x < mn) mn = x;
        if (x > mx) mx = x;
    }
    return {mn, mx};                 // una coppia di valori
}

auto [lo, hi] = minMax(voti);        // C++17: spacchetta la coppia in due variabili`,
          }),
        chiamate: mountChiamate,
        statica: (host) =>
          ASD.code(host, {
            file: 'statica.cpp',
            code: `int contaChiamate() {
    static int volte = 0;      // creata una volta sola, vive per tutto il programma
    volte++;
    return volte;
}
// contaChiamate() restituisce 1, poi 2, poi 3, ...`,
          }),
        overload: (host) => ASD.code(host, { src: 'cpp/parametri', region: 'overloading' }),
        default: (host) => ASD.code(host, { src: 'cpp/parametri', region: 'default' }),
        quiz: (host) =>
          ASD.quiz(host, [
            {
              q: 'Che cosa stampa?',
              code: `void f(int x)  { x = x * 2; }
void g(int& x) { x = x * 2; }

int main() {
    int a = 5, b = 5;
    f(a);
    g(b);
    cout << a << ' ' << b;
}`,
              options: ['<code>5 10</code>', '<code>10 10</code>', '<code>5 5</code>', '<code>10 5</code>'],
              answer: 0,
              explain: `<code>f</code> riceve una copia di <code>a</code>: raddoppia la copia, che sparisce con il suo frame.
              <code>g</code> riceve un riferimento: <code>x</code> è un altro nome di <code>b</code>, quindi <code>b</code>
              diventa 10.`,
            },
            {
              q: 'Qual è la firma giusta per una funzione che calcola la somma di un <code>vector&lt;int&gt;</code> senza modificarlo?',
              options: [
                '<code>int somma(vector&lt;int&gt; v)</code>',
                '<code>int somma(vector&lt;int&gt;&amp; v)</code>',
                '<code>int somma(const vector&lt;int&gt;&amp; v)</code>',
                '<code>void somma(const vector&lt;int&gt;&amp; v)</code>',
              ],
              answer: 2,
              explain: `Il riferimento costante evita la copia (${m('Θ(1)')} invece di ${m('Θ(n)')}) e garantisce che la
              funzione non tocchi il vettore. La prima funziona ma copia tutto; la seconda permetterebbe di modificarlo;
              l'ultima non può restituire la somma, perché è <code>void</code>.`,
            },
            {
              q: 'Una ricerca binaria ricorsiva su <var>n</var> elementi riceve il vettore <strong>per valore</strong> a ogni chiamata. Quanto costa in tutto?',
              options: [m('Θ(log n)'), m('Θ(n)'), m('Θ(n log n)'), m('Θ(n^2)')],
              answer: 2,
              explain: `Le chiamate sono ${m('Θ(log n)')}, ma ognuna copia l'intero vettore di <var>n</var> elementi:
              ${m('Θ(n)')} per chiamata, ${m('Θ(n log n)')} in tutto. Passandolo per riferimento costante ogni chiamata
              costa ${m('Θ(1)')} e il totale torna ${m('Θ(log n)')}.`,
            },
            {
              q: '<code>main</code> chiama <code>f</code>, <code>f</code> chiama <code>g</code>, <code>g</code> chiama <code>h</code>. Mentre <code>h</code> è in esecuzione, quanti frame ci sono sullo stack e quale è in cima?',
              options: [
                '1 frame, quello di <code>h</code>',
                '4 frame, in cima <code>h</code>',
                '4 frame, in cima <code>main</code>',
                '3 frame: <code>main</code> non ha un frame',
              ],
              answer: 1,
              explain: `Ogni chiamata ancora aperta ha il suo frame: <code>main</code>, <code>f</code>, <code>g</code> e
              <code>h</code>. In cima c'è la chiamata più recente, <code>h</code>, che sarà anche la prima a finire.`,
            },
            {
              q: 'Con <code>int massimo(int, int)</code> e <code>double massimo(double, double)</code>, quale chiamata <strong>non</strong> compila?',
              options: ['<code>massimo(3, 4)</code>', '<code>massimo(3.0, 4.5)</code>', '<code>massimo(3, 4.5)</code>', '<code>massimo(\'a\', \'b\')</code>'],
              answer: 2,
              explain: `Con <code>(3, 4.5)</code> la versione <code>int</code> è perfetta per il primo argomento e quella
              <code>double</code> per il secondo: nessuna vince su entrambi, la chiamata è ambigua. Con due <code>char</code>
              vince la versione <code>int</code>, perché da <code>char</code> a <code>int</code> c'è una promozione.`,
            },
            {
              q: 'Che cosa stampa?',
              code: `int conta() {
    static int c = 0;
    c++;
    return c;
}

int main() {
    conta();
    conta();
    cout << conta();
}`,
              options: ['<code>1</code>', '<code>3</code>', '<code>0</code>', 'Non compila'],
              answer: 1,
              explain: `Una variabile <code>static</code> locale viene inizializzata una volta sola e vive per tutto il programma:
              non sta nel frame. Le tre chiamate la portano a 1, 2 e 3, e l'ultima restituisce 3. Senza <code>static</code>
              ogni chiamata ripartirebbe da 0 e stamperebbe 1.`,
            },
          ]),
      });
      C.capitolo(el);
    },
  });

  /* --------------------------------------- scambio per valore e per riferimento */

  const OUT_SCAMBIO = ['a = 3, b = 5', 'a = 5, b = 3'];

  function mountScambio(host) {
    ASD.stepper(host, {
      id: 'scambio',
      title: 'Scambio per valore e per riferimento',
      code: { src: 'cpp/scambio', region: 'tutto' },
      view: C.vista({ heap: false, console: true, legend: ['ref', 'hl', 'read'] }),
      trace: traceScambio,
      validate: (input, frames) => {
        const last = frames[frames.length - 1].state;
        const main = last.stack[0];
        const a = main.vars.find((v) => v.id === 'a');
        const b = main.vars.find((v) => v.id === 'b');
        if (!a || !b || a.value !== 5 || b.value !== 3) return 'alla fine a e b dovrebbero valere 5 e 3';
        return C.outputUguale(OUT_SCAMBIO)(input, frames);
      },
    });
  }

  function traceScambio() {
    const t = new ASD.Tracer();
    const M = new C.Memoria();
    M.call('main', 'main()');
    M.decl({ id: 'a', type: 'int', name: 'a', value: 3 });
    M.decl({ id: 'b', type: 'int', name: 'b', value: 5 });
    t.step('m-init', 'In <code>main</code> nascono <code>a = 3</code> e <code>b = 5</code>: due caselle nel frame di main.', {}, M.snap());

    // ---- per valore
    M.read('main.a', 'main.b');
    M.call('sv', 'scambiaValore(x, y)');
    M.decl({ id: 'x', type: 'int', name: 'x', value: 3 });
    M.decl({ id: 'y', type: 'int', name: 'y', value: 5 });
    t.step(
      'm-val',
      '<code>main</code> chiama <code>scambiaValore(a, b)</code>. In cima allo stack nasce un frame nuovo: <code>x</code> e <code>y</code> sono caselle nuove, con una <strong>copia</strong> di 3 e 5.',
      {},
      M.snap()
    );
    M.read('sv.x');
    M.decl({ id: 'tmp', type: 'int', name: 'tmp', value: 3 });
    t.step('v-tmp', '<code>tmp = x</code>: tmp vale 3.', {}, M.snap());
    M.read('sv.y');
    M.set('sv.x', 5);
    t.step('v-x', '<code>x = y</code>: x diventa 5. Guarda <code>a</code> nel frame di main: è rimasta 3, perché x è un\'altra casella.', {}, M.snap());
    M.read('sv.tmp');
    M.set('sv.y', 3);
    t.step('v-y', '<code>y = tmp</code>: y diventa 3. Le copie sono scambiate…', {}, M.snap());
    M.state('out');
    M.note('sparisce');
    t.step('v-end', '…ma la funzione finisce: il suo frame viene distrutto, e con lui x, y e tmp. Lo scambio è avvenuto solo tra le copie.', {}, M.snap());
    M.ret();
    M.read('main.a', 'main.b');
    M.print(OUT_SCAMBIO[0] + '\n');
    t.step('m-print1', 'Di nuovo in <code>main</code>: <code>a</code> e <code>b</code> valgono ancora 3 e 5.', {}, M.snap());

    // ---- per riferimento
    M.call('sr', 'scambiaRiferimento(x, y)');
    M.decl({ id: 'x', type: 'int&', name: 'x', ref: 'main.a', value: 'alias di a' });
    M.decl({ id: 'y', type: 'int&', name: 'y', ref: 'main.b', value: 'alias di b' });
    t.step(
      'm-rif',
      '<code>main</code> chiama <code>scambiaRiferimento(a, b)</code>. Nel frame nuovo <code>x</code> e <code>y</code> non hanno un valore loro: sono <strong>altri nomi</strong> di <code>a</code> e <code>b</code> (le frecce tratteggiate).',
      {},
      M.snap()
    );
    M.read('main.a');
    M.decl({ id: 'tmp', type: 'int', name: 'tmp', value: 3 });
    t.step('r-tmp', '<code>tmp = x</code>: leggere x vuol dire leggere <code>a</code>, quindi tmp vale 3.', {}, M.snap());
    M.read('main.b');
    M.set('main.a', 5);
    t.step('r-x', '<code>x = y</code>: scrivere in x vuol dire scrivere in <code>a</code>. Ora <code>a</code> vale 5, nel frame di main.', {}, M.snap());
    M.read('sr.tmp');
    M.set('main.b', 3);
    t.step('r-y', '<code>y = tmp</code>: <code>b</code> diventa 3.', {}, M.snap());
    M.state('out');
    M.note('sparisce');
    t.step('r-end', 'Il frame sparisce anche questa volta, ma le modifiche sono già state fatte su <code>a</code> e <code>b</code>.', {}, M.snap());
    M.ret();
    M.read('main.a', 'main.b');
    M.print(OUT_SCAMBIO[1] + '\n');
    t.step('m-print2', 'Ora <code>a = 5</code> e <code>b = 3</code>: lo scambio è riuscito.', {}, M.snap());
    M.state('out');
    t.step('m-ret', '<code>return 0</code>: finisce anche <code>main</code>.', {}, M.snap());
    return t.frames;
  }

  /* ------------------------------------------------- la catena main → f → g */

  function mountChiamate(host) {
    ASD.stepper(host, {
      id: 'chiamate',
      title: 'main chiama f, f chiama g',
      code: { src: 'cpp/chiamate', region: 'tutto' },
      view: C.vista({ heap: false, console: true, legend: ['hl', 'read'] }),
      trace: traceChiamate,
      validate: C.outputUguale(['r = 13']),
    });
  }

  function traceChiamate() {
    const t = new ASD.Tracer();
    const M = new C.Memoria();
    const depth = () => ({ 'frame sullo stack': M.stack.length });
    M.call('main', 'main()');
    M.decl({ id: 'r', type: 'int', name: 'r', uninit: true });
    t.step('m-call', 'In <code>main</code>, per dare un valore a <code>r</code> serve <code>f(3)</code>: main si ferma su questa riga e chiama f.', depth(), M.snap());
    M.note('aspetta f');
    M.call('f', 'f(a)');
    M.decl({ id: 'a', type: 'int', name: 'a', value: 3 });
    M.decl({ id: 'b', type: 'int', name: 'b', uninit: true });
    t.step('f-call', 'Nuovo frame in cima, con il parametro <code>a = 3</code>. Per calcolare <code>b</code> serve <code>g(a + 1)</code>, cioè <code>g(4)</code>: anche f si ferma e chiama g.', depth(), M.snap());
    M.note('aspetta g');
    M.call('g', 'g(x)');
    M.decl({ id: 'x', type: 'int', name: 'x', value: 4 });
    M.decl({ id: 'y', type: 'int', name: 'y', value: 16 });
    M.read('g.x');
    t.step('g-y', 'Terzo frame: <code>x = 4</code>. <code>y = x * x</code> = 16.', depth(), M.snap());
    M.read('g.y');
    M.note('ritorna 16');
    M.state('out');
    t.step('g-ret', '<code>return y</code>: g restituisce 16 a chi l\'ha chiamata. Il suo frame sta per essere tolto.', depth(), M.snap());
    M.ret();
    M.note(null);
    M.set('f.b', 16);
    t.step('f-call', 'Si torna in f, esattamente dove si era fermata: <code>b</code> riceve 16. Le variabili di g (x e y) non esistono più.', depth(), M.snap());
    M.read('f.b', 'f.a');
    M.note('ritorna 13');
    M.state('out');
    t.step('f-ret', '<code>return b - a</code>: f restituisce 16 − 3 = 13.', depth(), M.snap());
    M.ret();
    M.note(null);
    M.set('main.r', 13);
    t.step('m-call', 'Di nuovo in <code>main</code>: <code>r</code> riceve 13. È rimasto solo il frame di main.', depth(), M.snap());
    M.read('main.r');
    M.print('r = 13\n');
    t.step('m-print', 'Stampa <code>r = 13</code>.', depth(), M.snap());
    M.state('out');
    t.step('m-ret', '<code>return 0</code>: finisce <code>main</code> e lo stack si svuota.', depth(), M.snap());
    return t.frames;
  }
})();
