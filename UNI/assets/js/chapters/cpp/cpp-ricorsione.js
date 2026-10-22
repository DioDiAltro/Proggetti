/* ASD a quadretti — capitolo "Ricorsione": caso base e passo ricorsivo, lo
   stack delle chiamate che cresce e si svuota (fattoriale, con la vista della
   memoria), ricorsione e iterazione, ricorsione multipla e l'albero delle
   chiamate di Fibonacci (TreeView), esempi classici (somma, potenza veloce,
   ricerca binaria, Hanoi), stack overflow, e come si scrive la ricorrenza T(n). */
(function () {
  'use strict';

  const { m, box, table } = ASD;
  const C = ASD.cpp;

  const fibonacci = (n) => {
    let a = 0;
    let b = 1;
    for (let i = 0; i < n; i++) [a, b] = [b, a + b];
    return a;
  };
  const fattoriale = (n) => (n <= 1 ? 1 : n * fattoriale(n - 1));

  ASD.chapter({
    id: 'cpp-ricorsione',
    title: 'Ricorsione',
    lead:
      'Una funzione ricorsiva risolve un problema chiamando se stessa su un\'istanza più piccola dello stesso problema. È il modo naturale di scrivere gli algoritmi divide et impera e le visite degli alberi. Qui vedi come lo stack delle chiamate cresce e si svuota, perché Fibonacci ricorsivo è lentissimo e come si scrive la ricorrenza del costo.',
    minutes: 45,
    prereq: ['cpp-funzioni'],
    goals: [
      'scrivere una funzione ricorsiva con un caso base e un passo ricorsivo corretti',
      'disegnare lo stack delle chiamate di una ricorsione e dire quanto diventa profondo',
      'contare le chiamate di una ricorsione multipla con l\'albero delle chiamate',
      `scrivere la ricorrenza ${m('T(n)')} di una funzione ricorsiva`,
    ],

    render(el) {
      el.innerHTML = `
<section id="idea">
  <h2>Caso base e passo ricorsivo</h2>
  <p>Il fattoriale ha una definizione che usa se stessa: ${m('n! = n * (n-1)!')}, e ${m('0! = 1')}. Tradotta in C++
  diventa una funzione che chiama se stessa:</p>
  <div data-mount="fatt"></div>
  <p>Ogni funzione ricorsiva ha due parti:</p>
  <dl>
    <dt>Caso base</dt>
    <dd>un'istanza abbastanza piccola da risolvere direttamente, senza altre chiamate: qui ${m('n = 0')}.</dd>
    <dt>Passo ricorsivo</dt>
    <dd>risolve l'istanza usando la soluzione di un'istanza <strong>più piccola</strong>: qui ${m('n!')} usa
    ${m('(n-1)!')}.</dd>
  </dl>
  <p>Per essere sicuro che la funzione termini, controlla che ogni chiamata ricorsiva si avvicini al caso base e che il
  caso base venga sempre raggiunto. È lo stesso ragionamento di una dimostrazione per induzione: se il caso base è
  giusto, e il passo è giusto supponendo giusta la chiamata più piccola, la funzione è giusta per ogni <var>n</var>.</p>
  ${box('ricorda', `<p>Quando scrivi una funzione ricorsiva non seguire tutte le chiamate con la testa: fidati della chiamata
  più piccola («supponiamo che <code>fattoriale(n - 1)</code> funzioni») e controlla solo due cose: che il caso base sia
  giusto, e che il passo usi bene il risultato della chiamata più piccola.</p>`)}
</section>

<section id="stack">
  <h2>Lo stack delle chiamate</h2>
  <p>Ogni chiamata ricorsiva è una chiamata normale: ha il suo frame, con la <em>sua</em> copia di <code>n</code>
  (vedi ${ASD.link('cpp-funzioni', 'stack', 'lo stack delle chiamate')}). Le chiamate si impilano finché si arriva al
  caso base; poi tornano indietro una alla volta, e ognuna completa la moltiplicazione che aveva lasciato in sospeso.</p>
  <div data-mount="pila"></div>
  <p>Con <code>fattoriale(n)</code> si arriva a ${m('n+1')} frame sopra <code>main</code>, uno per ogni valore da
  <var>n</var> a 0. Il tempo è ${m('Θ(n)')}, e anche la memoria: ${m('Θ(n)')} frame, perché nessuna chiamata finisce
  prima che sia finita quella dopo.</p>
</section>

<section id="iterazione">
  <h2>Ricorsione o iterazione?</h2>
  <p>Il fattoriale si scrive anche con un ciclo:</p>
  <div data-mount="iter"></div>
  ${C.out(`0! = 1   (iterativo: 1)
5! = 120   (iterativo: 120)
10! = 3628800   (iterativo: 3628800)
15! = 1307674368000   (iterativo: 1307674368000)
20! = 2432902008176640000   (iterativo: 2432902008176640000)`)}
  ${table({
    head: ['', 'Ricorsivo', 'Iterativo'],
    rows: [
      ['Tempo', m('Θ(n)'), m('Θ(n)')],
      ['Memoria in più', m('Θ(n)') + ': un frame per chiamata', m('Θ(1)') + ': due variabili'],
      ['Si legge come…', 'la definizione matematica', 'una sequenza di istruzioni'],
    ],
  })}
  <p>Ogni funzione ricorsiva si può riscrivere con un ciclo, al massimo usando una pila esplicita al posto dello stack
  delle chiamate. Quando la chiamata ricorsiva è l'ultima cosa che la funzione fa (<i>ricorsione in coda</i>), la
  trasformazione è immediata; g++ con <code>-O2</code> spesso la fa da solo, ma il C++ non lo garantisce. La ricorsione
  conviene quando il problema è ricorsivo per natura: alberi, divide et impera (${ASD.link('merge-sort')},
  ${ASD.link('quick-sort')}), esplorazione di tutte le possibilità.</p>
  ${box('nota', `<p>20! è il fattoriale più grande che sta in un <code>long long</code>: 21! supera ${m('9,2 * 10^{18}')}. Con
  un <code>int</code> si arriva solo a 12!.</p>`, 'Fino a dove arriva')}
</section>

<section id="fibonacci">
  <h2>Ricorsione multipla: Fibonacci</h2>
  <p>I numeri di Fibonacci sono ${m('F(0) = 0')}, ${m('F(1) = 1')} e ${m('F(n) = F(n-1) + F(n-2)')}. La traduzione
  diretta fa <strong>due</strong> chiamate ricorsive:</p>
  <div data-mount="fibcodice"></div>
  <p>Le chiamate non formano più una catena ma un <strong>albero delle chiamate</strong>: ogni nodo è una chiamata, i
  suoi figli sono le chiamate che fa. Segui come si costruisce: la chiamata in esecuzione è blu, quelle in attesa di un
  risultato sono viola e collegate dal cammino evidenziato (sono i frame sullo stack), quelle finite sono verdi con il
  risultato sotto. In rosso le chiamate che ricalcolano un valore già calcolato in un altro ramo.</p>
  <div data-mount="albero"></div>
  <h3>Quante chiamate?</h3>
  <p>Detto ${m('C(n)')} il numero di chiamate per calcolare <code>fib(n)</code>, vale ${m('C(n) = 1 + C(n-1) + C(n-2)')},
  con ${m('C(0) = C(1) = 1')}; si verifica per induzione che ${m('C(n) = 2F(n+1) - 1')}. Il programma completo le conta
  con un contatore passato per riferimento:</p>
  <div data-mount="fibprogramma"></div>
  ${table({
    caption: 'Chiamate di fib(n) ricorsivo: le righe fino a 30 sono l\'output del programma, le ultime due vengono dalla formula',
    head: ['<var>n</var>', 'fib(<var>n</var>)', 'chiamate'],
    rows: [
      ['5', '5', '15'],
      ['10', '55', '177'],
      ['15', '610', '1 973'],
      ['20', '6 765', '21 891'],
      ['25', '75 025', '242 785'],
      ['30', '832 040', '2 692 537'],
      ['40', '102 334 155', '331 160 281'],
      ['50', '12 586 269 025', '40 730 022 147'],
    ],
  })}
  <p>Ogni volta che <var>n</var> aumenta di 1, le chiamate si moltiplicano per circa ${m('φ = (1 + √5)/2 ≈ 1,618')}. Il
  costo è ${m('T(n) = T(n-1) + T(n-2) + Θ(1)')}, che cresce come ${m('Θ(φ^{n})')}: esponenziale. Per avere un'idea dei
  limiti: ${m('T(n) <= 2T(n-1)')} dà ${m('O(2^{n})')}, e ${m('T(n) >= 2T(n-2)')} dà ${m('Ω(2^{n/2})')}.</p>
  ${box('esame', `<p>Il problema non è la ricorsione: è che gli stessi sottoproblemi vengono risolti tante volte
  (<code>fib(n-2)</code> è calcolato sia da <code>fib(n)</code> sia da <code>fib(n-1)</code>). Se ogni risultato viene
  salvato la prima volta e riusato dopo (<i>memoizzazione</i>), le chiamate distinte sono ${m('n+1')} e il costo diventa
  ${m('Θ(n)')}. È l'idea della ${ASD.link('dp')}.</p>`)}
</section>

<section id="classici">
  <h2>Esempi classici</h2>
  <h3>Somma di un array</h3>
  <p>La somma dei primi <var>n</var> elementi è la somma dei primi ${m('n-1')} più l'ultimo. Caso base: zero elementi,
  somma 0.</p>
  <div data-mount="somma"></div>
  <h3>Potenza veloce</h3>
  <p>Per calcolare ${m('x^{n}')} non servono <var>n</var> moltiplicazioni: ${m('x^{n} = (x^{n/2})^{2}')} se <var>n</var>
  è pari, ${m('x * (x^{(n-1)/2})^{2}')} se è dispari. Ogni chiamata dimezza l'esponente, quindi le chiamate sono
  ${m('Θ(log n)')}.</p>
  <div data-mount="potenza"></div>
  ${box('errore', `<p>Scrivere <code>return potenza(x, n / 2) * potenza(x, n / 2);</code> sembra lo stesso, ma fa
  <strong>due</strong> chiamate uguali invece di una: la ricorrenza diventa ${m('T(n) = 2T(n/2) + Θ(1)')}, cioè
  ${m('Θ(n)')}, e tutto il vantaggio sparisce. Il risultato della chiamata si salva in una variabile e si usa due volte.</p>`)}
  <h3>Ricerca binaria ricorsiva</h3>
  <p>In un vettore ordinato si guarda l'elemento di mezzo: se è quello cercato si è finito, altrimenti si cerca solo
  nella metà giusta. Il vettore passa per riferimento costante, perché copiarlo a ogni chiamata costerebbe
  ${m('Θ(n)')} (vedi ${ASD.link('ricerca')}).</p>
  <div data-mount="ricerca"></div>
  <h3>Torri di Hanoi</h3>
  <p>Per spostare <var>n</var> dischi dal piolo A al piolo C: si spostano gli ${m('n-1')} più piccoli su B, si sposta il
  disco più grande su C, si rimettono gli ${m('n-1')} sopra di lui. Il numero di mosse è
  ${m('T(n) = 2T(n-1) + 1')}, con ${m('T(0) = 0')}; aggiungendo 1 a entrambi i lati,
  ${m('T(n) + 1 = 2(T(n-1) + 1)')}, quindi ${m('T(n) = 2^{n} - 1')}.</p>
  <div data-mount="hanoi"></div>
  ${C.out(`somma = 20
2^10 = 1024, 3^13 = 1594323
ricerca di 9: indice 4, ricerca di 5: -1
disco 1: A -> C
disco 2: A -> B
disco 1: C -> B
disco 3: A -> C
disco 1: B -> A
disco 2: B -> C
disco 1: A -> C`)}
</section>

<section id="overflow">
  <h2>Stack overflow</h2>
  <p>Se il caso base manca, o non viene mai raggiunto, le chiamate non finiscono: lo stack si riempie e il programma si
  chiude (su Linux con <code>Segmentation fault</code>, su Windows di solito senza nessun messaggio). Per fortuna g++
  riconosce i casi più evidenti:</p>
  <div data-mount="infinita"></div>
  ${C.term(`so.cpp: In function 'long long int fattoriale(int)':
so.cpp:1:11: warning: infinite recursion detected [-Winfinite-recursion]
    1 | long long fattoriale(int n) {
      |           ^~~~~~~~~~
Segmentation fault`)}
  ${box('errore', `<p>Il caso base deve coprire <em>tutti</em> gli input possibili. Con <code>if (n == 0) return 1;</code>,
  <code>fattoriale(-1)</code> chiama <code>fattoriale(-2)</code>, poi <code>-3</code>, e non si ferma più. O si scrive
  <code>n &lt;= 0</code>, o si dichiara la precondizione (${m('n >= 0')}) e la si rispetta.</p>`)}
  <p>Anche una ricorsione corretta può essere troppo profonda: lo stack è di pochi megabyte (8 MB di solito su Linux,
  1 MB su Windows), e una ricorsione lineare su un milione di elementi, come la somma qui sopra, rischia di non starci.
  In quei casi si scrive la versione iterativa.</p>
</section>

<section id="ricorrenza">
  <h2>Scrivere la ricorrenza T(n)</h2>
  <p>Il costo di una funzione ricorsiva si scrive come una <strong>ricorrenza</strong>: un'equazione che esprime
  ${m('T(n)')} in funzione del costo delle chiamate più piccole. Il metodo:</p>
  <ol>
    <li>scegli che cos'è <var>n</var>, la dimensione dell'input: il numero di elementi, il valore del parametro,
    ${m('hi - lo + 1')};</li>
    <li>conta il costo di <em>una</em> chiamata senza le chiamate ricorsive: confronti, somme, un ciclo, ${m('f(n)')};</li>
    <li>aggiungi un termine ${m('T(…)')} per ogni chiamata ricorsiva, con la dimensione del suo input;</li>
    <li>scrivi il caso base: ${m('T(1) = Θ(1)')} (o ${m('T(0)')}).</li>
  </ol>
  ${table({
    caption: 'Le ricorrenze delle funzioni di questo capitolo',
    head: ['Funzione', 'Ricorrenza', 'Soluzione'],
    rows: [
      ['fattoriale, somma di un array', m('T(n) = T(n-1) + Θ(1)'), m('Θ(n)')],
      ['potenza veloce, ricerca binaria', m('T(n) = T(n/2) + Θ(1)'), m('Θ(log n)')],
      ['potenza con due chiamate (sbagliata)', m('T(n) = 2T(n/2) + Θ(1)'), m('Θ(n)')],
      ['torri di Hanoi', m('T(n) = 2T(n-1) + Θ(1)'), m('Θ(2^{n})')],
      ['Fibonacci ricorsivo', m('T(n) = T(n-1) + T(n-2) + Θ(1)'), m('Θ(φ^{n})') + ', con ' + m('φ ≈ 1,618')],
      ['merge sort', m('T(n) = 2T(n/2) + Θ(n)'), m('Θ(n log n)')],
    ],
  })}
  <p>Come si risolvono (albero di ricorsione, sostituzione, teorema master) è spiegato in ${ASD.link('cx-ricorrenze')}.
  Il numero di chiamate «in fila» decide la memoria: la profondità massima dello stack è ${m('Θ(n)')} per le ricorsioni
  lineari e ${m('Θ(log n)')} per quelle che dimezzano.</p>
</section>

<section id="esame">
  <h2>All'esame</h2>
  <ol>
    <li><strong>Esegui a mano</strong> una funzione ricorsiva: disegna lo stack o l'albero delle chiamate, e scrivi il
    valore restituito da ogni chiamata.</li>
    <li><strong>Scrivi la ricorrenza</strong> del tempo (e risolvila): una chiamata con ${m('n-1')} dà una catena, una
    con ${m('n/2')} un logaritmo, due chiamate raddoppiano il lavoro a ogni livello.</li>
    <li><strong>Scrivi la funzione</strong>: prima il caso base, poi il passo ricorsivo. Controlla che il caso base copra
    tutti gli input.</li>
  </ol>
  ${box('esame', `<p>Se l'output di una funzione ricorsiva dipende da dove sta la stampa, guarda se viene prima o dopo la
  chiamata ricorsiva: prima della chiamata le stampe escono nell'ordine delle chiamate (andando giù), dopo escono al
  contrario (tornando su).</p>`)}
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        fatt: (host) => ASD.code(host, { src: 'cpp/fattoriale', region: 'fatt' }),
        pila: mountPila,
        iter: (host) => ASD.code(host, { src: 'cpp/fattoriale', region: 'iter' }),
        fibcodice: (host) => ASD.code(host, { src: 'cpp/fibonacci', region: 'fib' }),
        albero: mountAlbero,
        fibprogramma: (host) => ASD.code(host, { src: 'cpp/fibonacci', maxHeight: 360 }),
        somma: (host) => ASD.code(host, { src: 'cpp/ricorsione_classici', region: 'somma' }),
        potenza: (host) => ASD.code(host, { src: 'cpp/ricorsione_classici', region: 'potenza' }),
        ricerca: (host) => ASD.code(host, { src: 'cpp/ricorsione_classici', region: 'ricerca' }),
        hanoi: (host) => ASD.code(host, { src: 'cpp/ricorsione_classici', region: 'hanoi' }),
        infinita: (host) =>
          ASD.code(host, {
            file: 'so.cpp',
            code: `long long fattoriale(int n) {
    return n * fattoriale(n - 1);   // manca il caso base
}`,
            notes: { 2: 'non si ferma mai' },
          }),
        quiz: (host) =>
          ASD.quiz(host, [
            {
              q: 'Quanto costa questa funzione?',
              code: `int f(int n) {
    if (n <= 1) return 1;
    return f(n - 1) + f(n - 1);
}`,
              options: [m('Θ(n)'), m('Θ(n log n)'), m('Θ(n^2)'), m('Θ(2^{n})')],
              answer: 3,
              explain: `Due chiamate su ${m('n-1')} più un lavoro costante: ${m('T(n) = 2T(n-1) + Θ(1)')}. A ogni livello
              dell'albero delle chiamate il numero di chiamate raddoppia: ${m('1 + 2 + 4 + … + 2^{n-1} = 2^{n} - 1')}.
              Salvando <code>f(n - 1)</code> in una variabile e raddoppiandola si scende a ${m('Θ(n)')}.`,
            },
            {
              q: 'Che cosa stampa <code>stampa(3)</code>?',
              code: `void stampa(int n) {
    if (n == 0) return;
    stampa(n - 1);
    cout << n << ' ';
}`,
              options: ['<code>3 2 1</code>', '<code>1 2 3</code>', '<code>0 1 2 3</code>', '<code>3 2 1 0</code>'],
              answer: 1,
              explain: `La stampa viene <em>dopo</em> la chiamata ricorsiva: <code>stampa(3)</code> prima fa stampare
              tutto a <code>stampa(2)</code>, che prima fa stampare <code>stampa(1)</code>, e così via. La prima a stampare è
              <code>stampa(1)</code>, mentre si torna su. Con la stampa prima della chiamata uscirebbe <code>3 2 1</code>.`,
            },
            {
              q: 'Durante <code>fattoriale(5)</code> (caso base <code>n == 0</code>), quanti frame di <code>fattoriale</code> ci sono al massimo sullo stack nello stesso momento?',
              options: ['1', '5', '6', '120'],
              answer: 2,
              explain: `Le chiamate <code>fattoriale(5)</code>, <code>(4)</code>, <code>(3)</code>, <code>(2)</code>,
              <code>(1)</code> e <code>(0)</code> sono tutte aperte quando si arriva al caso base: 6 frame, cioè ${m('n+1')}.
              Per questo la memoria è ${m('Θ(n)')}.`,
            },
            {
              q: 'Quante chiamate in tutto fa <code>fib(5)</code> ricorsivo, compresa la prima?',
              options: ['5', '8', '15', '32'],
              answer: 2,
              explain: `${m('C(n) = 2F(n+1) - 1')}: con ${m('F(6) = 8')} fa ${m('2 * 8 - 1 = 15')}. Lo puoi verificare
              nell'albero delle chiamate qui sopra: 15 nodi, di cui 8 foglie (i casi base).`,
            },
            {
              q: 'Che cosa succede chiamando <code>fattoriale(-1)</code> con il caso base <code>if (n == 0) return 1;</code>?',
              options: [
                'Restituisce 1',
                'Restituisce 0',
                'Le chiamate scendono a −2, −3, … senza fermarsi: lo stack si riempie e il programma si chiude',
                'Non compila',
              ],
              answer: 2,
              explain: `<var>n</var> non arriva mai a 0: ogni chiamata ne fa un'altra più «lontana» dal caso base. Dopo
              qualche centinaio di migliaia di chiamate lo stack è pieno: stack overflow. Il caso base deve coprire tutti gli
              input, per esempio con <code>n &lt;= 0</code>.`,
            },
          ]),
      });
      C.capitolo(el);
    },
  });

  /* ------------------------------------------------- lo stack del fattoriale */

  function mountPila(host) {
    ASD.stepper(host, {
      id: 'fattoriale',
      title: 'Lo stack di fattoriale(n)',
      code: { src: 'cpp/fattoriale', region: 'fatt' },
      input: {
        value: 4,
        label: 'n',
        parse: (s) => {
          const v = Number(String(s).trim());
          if (!Number.isInteger(v) || v < 0 || v > 8) throw new Error('Scrivi un intero da 0 a 8.');
          return v;
        },
        format: (v) => String(v),
        presets: [
          { label: '0', value: 0 },
          { label: '3', value: 3 },
          { label: '6', value: 6 },
        ],
      },
      view: C.vista({ heap: false, legend: ['hl', 'read'] }),
      trace: traceFatt,
      counters: [{ key: 'chiamate', label: 'chiamate' }],
      validate: (n, frames) => {
        const last = frames[frames.length - 1];
        if (last.vars.risultato !== fattoriale(n)) return `risultato ${last.vars.risultato} invece di ${fattoriale(n)}`;
        if (last.count.chiamate !== n + 1) return `${last.count.chiamate} chiamate invece di ${n + 1}`;
        return null;
      },
    });
  }

  function traceFatt(N) {
    const t = new ASD.Tracer(['chiamate']);
    const M = new C.Memoria();
    M.call('main', 'main()', [], { folded: true });
    M.note(`aspetta fattoriale(${N})`);
    const prof = () => ({ 'frame di fattoriale': M.stack.length - 1 });

    function chiama(n) {
      t.count('chiamate');
      M.call('f' + n, `fattoriale(${n})`);
      M.decl({ id: 'n', type: 'int', name: 'n', value: n });
      M.read(`f${n}.n`);
      if (n === 0) {
        M.note('ritorna 1');
        M.state('out');
        t.step(
          'base',
          `<code>fattoriale(0)</code>: <code>n == 0</code> è vero, è il <strong>caso base</strong>. Restituisce 1 senza altre chiamate: lo stack ha raggiunto la massima profondità.`,
          prof(),
          M.snap()
        );
        M.ret();
        return 1;
      }
      t.step('base', `<code>fattoriale(${n})</code>: nuovo frame con la sua <code>n = ${n}</code>. <code>n == 0</code> è falso: non è il caso base.`, prof(), M.snap());
      M.note(`aspetta fattoriale(${n - 1})`);
      t.step('rec', `Per calcolare <code>${n} * fattoriale(${n - 1})</code> serve prima <code>fattoriale(${n - 1})</code>: questa chiamata resta in sospeso e ne parte un'altra.`, prof(), M.snap());
      const r = chiama(n - 1);
      const v = n * r;
      M.note(`ritorna ${v}`);
      M.state('out');
      M.read(`f${n}.n`);
      t.step('rec', `<code>fattoriale(${n - 1})</code> ha restituito ${r}. Si completa la moltiplicazione rimasta in sospeso: ${n} * ${r} = <b>${v}</b>, e si restituisce.`, prof(), M.snap());
      M.ret();
      return v;
    }

    const ris = chiama(N);
    M.note(`riceve ${ris}`);
    t.step(
      null,
      `<code>fattoriale(${N}) = ${ris}</code> torna a <code>main</code>. In tutto ${N + 1} ${N === 0 ? 'chiamata' : 'chiamate'}, e lo stack è arrivato a ${N + 1} frame sopra main: tempo e memoria ${m('Θ(n)')}.`,
      { risultato: ris },
      M.snap()
    );
    return t.frames;
  }

  /* ------------------------------------------- l'albero delle chiamate di fib */

  function mountAlbero(host) {
    host.classList.add('cpp-albero');
    ASD.stepper(host, {
      id: 'fib',
      title: 'L\'albero delle chiamate di fib(n)',
      code: { src: 'cpp/fibonacci', region: 'fib' },
      input: {
        value: 5,
        label: 'n',
        parse: (s) => {
          const v = Number(String(s).trim());
          if (!Number.isInteger(v) || v < 1 || v > 7) throw new Error('Scrivi un intero da 1 a 7: con 8 l\'albero ha già 67 nodi.');
          return v;
        },
        format: (v) => String(v),
        presets: [
          { label: '3', value: 3 },
          { label: '5', value: 5 },
          { label: '7', value: 7 },
        ],
      },
      view: (stage) => {
        const tv = new ASD.viz.TreeView(stage, { layout: 'tidy', shape: 'box', gap: 10, levelH: 62, ariaLabel: 'Albero delle chiamate di fib' });
        return {
          reset: () => tv.reset(),
          render(st, f) {
            tv.render(st, f);
            // su uno schermo stretto l'albero scorre di lato: la chiamata in esecuzione resta in vista
            const box = tv.root;
            const att = box.querySelector('.tv-node.is-active');
            if (att && box.scrollWidth > box.clientWidth + 1) {
              const r = att.getBoundingClientRect();
              const b = box.getBoundingClientRect();
              const left = box.scrollLeft + r.left + r.width / 2 - (b.left + b.width / 2);
              box.scrollTo({ left: Math.max(0, left), behavior: ASD.motionOK() ? 'smooth' : 'auto' });
            }
          },
        };
      },
      trace: traceFib,
      counters: [{ key: 'chiamate', label: 'chiamate' }],
      legend: [
        { k: 'active', label: 'in esecuzione' },
        { k: 'key', label: 'in attesa (sullo stack)' },
        { k: 'done', label: 'finita' },
        { k: 'swap', label: 'calcolo ripetuto' },
      ],
      validate: (n, frames) => {
        const last = frames[frames.length - 1];
        const root = last.state.nodes[last.state.root];
        if (root.sub !== '= ' + fibonacci(n)) return `la radice dice ${root.sub} invece di = ${fibonacci(n)}`;
        const attese = 2 * fibonacci(n + 1) - 1;
        if (last.count.chiamate !== attese) return `${last.count.chiamate} chiamate invece di ${attese}`;
        return null;
      },
    });
  }

  function traceFib(N) {
    const t = new ASD.Tracer(['chiamate']);
    const nodes = {};
    const stack = [];
    const finiti = new Set();
    let prossimo = 0;
    const snap = () => {
      const st = { root: 'c0', nodes: JSON.parse(JSON.stringify(nodes)), edges: {} };
      for (let i = 1; i < stack.length; i++) st.edges[stack[i - 1] + '>' + stack[i]] = 'path';
      return st;
    };
    const vars = (n) => ({ n, 'chiamate aperte': stack.length });

    function chiama(n, padre) {
      const id = 'c' + prossimo++;
      nodes[id] = { label: `fib(${n})`, kids: [], cls: 'active' };
      if (padre) {
        nodes[padre].kids.push(id);
        nodes[padre].cls = 'key';
      }
      stack.push(id);
      t.count('chiamate');
      const ripetuta = n >= 2 && finiti.has(n);
      let r;
      if (n <= 1) {
        r = n;
        t.step('base', `<code>fib(${n})</code>: <code>n &lt;= 1</code>, caso base. Restituisce ${n}.`, vars(n), snap());
      } else {
        t.step(
          'base',
          `<code>fib(${n})</code>: <code>n = ${n} &gt; 1</code>, non è un caso base.` +
            (ripetuta ? ` Attenzione: <b>fib(${n}) è già stata calcolata</b> in un altro ramo, e tutto il suo sottoalbero verrà rifatto.` : ''),
          vars(n),
          snap()
        );
        t.step('rec', `<code>fib(${n})</code> chiama prima <code>fib(${n - 1})</code>…`, vars(n), snap());
        const a = chiama(n - 1, id);
        nodes[id].cls = 'active';
        t.step('rec', `…<code>fib(${n - 1})</code> ha restituito ${a}. Ora <code>fib(${n})</code> chiama <code>fib(${n - 2})</code>.`, vars(n), snap());
        const b = chiama(n - 2, id);
        nodes[id].cls = 'active';
        r = a + b;
        t.step('rec', `<code>fib(${n - 2})</code> ha restituito ${b}: <code>fib(${n})</code> restituisce ${a} + ${b} = <b>${r}</b>.`, vars(n), snap());
      }
      nodes[id].cls = ripetuta ? 'swap' : 'done';
      nodes[id].sub = '= ' + r;
      stack.pop();
      finiti.add(n);
      return r;
    }

    const r = chiama(N, null);
    const rossi = Object.values(nodes).filter((x) => x.cls === 'swap').length;
    t.step(
      null,
      `Finito: <code>fib(${N}) = ${r}</code> con <b>${t.c.chiamate}</b> ${t.c.chiamate === 1 ? 'chiamata' : 'chiamate'}, cioè ${m('2F(n+1) - 1')}. Gli argomenti diversi però sono al più ${N + 1} (da 0 a ${N})` +
        (rossi ? `: ${rossi} ${rossi === 1 ? 'chiamata rossa ricalcola' : 'chiamate rosse ricalcolano'} un intero sottoalbero già visto.` : '.'),
      { n: N, 'chiamate aperte': 0 },
      snap()
    );
    return t.frames;
  }
})();
