/* ASD a quadretti — capitolo "Algoritmi greedy".
   Scelta greedy e sottostruttura ottima, selezione di attività (con la linea
   del tempo passo per passo), resto con le monete (dove il greedy funziona e
   dove no), zaino frazionario contro zaino 0/1, codici di Huffman. */
(function () {
  'use strict';

  const { h, s, m, box, table } = ASD;
  const T = ASD.tecniche;
  const LETTERE = 'ABCDEFGHIJKL';

  ASD.chapter({
    id: 'greedy',
    title: 'Algoritmi greedy',
    lead:
      'Un algoritmo greedy (goloso) costruisce la soluzione un pezzo alla volta: a ogni passo fa la scelta che adesso sembra la migliore e non torna mai indietro. Quando funziona è semplice e veloce; quando non funziona sbaglia senza avvisare. Qui impari a capire in quale dei due casi sei.',
    minutes: 45,
    prereq: ['cpp-stl', 'heap'],
    goals: [
      'riconoscere le due proprietà che rendono corretto un greedy e dimostrarlo con un argomento di scambio',
      `eseguire a mano la selezione di attività e scriverla in C++ con <code>sort</code> e un ciclo, in ${m('O(n log n)')}`,
      'trovare un controesempio quando il greedy sbaglia: il resto con le monete {1, 3, 4} e lo zaino 0/1',
      'costruire l\'albero di Huffman con una coda con priorità e calcolare quanti bit fa risparmiare',
    ],

    render(el) {
      el.innerHTML = `
<section id="idea">
  <h2>L'idea: la scelta migliore adesso</h2>
  <p>Molti problemi chiedono la soluzione <strong>migliore</strong> tra moltissime possibili: il massimo numero di
  attività in un'aula, il minimo numero di monete per dare un resto, il massimo valore che entra in uno zaino. Provarle
  tutte costa troppo (spesso ${m('2^n')} tentativi). Un algoritmo <strong>greedy</strong> (goloso, ingordo) segue invece
  sempre lo stesso schema:</p>
  <ol>
    <li>mette in ordine i candidati secondo un criterio (il più piccolo, quello che finisce prima, quello che rende di più);</li>
    <li>li esamina uno alla volta e prende ogni candidato compatibile con le scelte già fatte;</li>
    <li>non cambia mai idea: una scelta fatta resta.</li>
  </ol>
  <p>Il costo di solito è quello dell'ordinamento, ${m('O(n log n)')}, più una scansione lineare. Il rischio è un altro:
  <strong>la scelta che adesso sembra migliore può impedire più avanti la soluzione ottima</strong>.</p>

  <h3>Quando il greedy è corretto</h3>
  <p>Servono due proprietà (sono quelle del Cormen):</p>
  <dl>
    <dt>Proprietà della scelta greedy (<i>greedy-choice property</i>)</dt>
    <dd>esiste una soluzione ottima che contiene la prima scelta greedy. Fare quella scelta, quindi, non fa perdere l'ottimo.</dd>
    <dt>Sottostruttura ottima (<i>optimal substructure</i>)</dt>
    <dd>dopo la scelta resta un sottoproblema dello stesso tipo, più piccolo, e una soluzione ottima del sottoproblema
    unita alla scelta è una soluzione ottima del problema intero.</dd>
  </dl>
  <p>Con tutte e due, per induzione sul numero di scelte, l'algoritmo arriva all'ottimo. La sottostruttura ottima serve
  anche alla ${ASD.link('dp', null, 'programmazione dinamica')}; la scelta greedy è la scommessa in più: si decide
  <em>prima</em> di aver risolto i sottoproblemi, guardando solo la situazione di adesso.</p>

  <h3>Dimostrare o smentire</h3>
  <p>"Sembra giusto" non è una prova. Davanti a un algoritmo greedy hai due strade.</p>
  <ul>
    <li><strong>Dimostrazione con un argomento di scambio</strong> (<i>exchange argument</i>): prendi una soluzione ottima
    qualsiasi; se non contiene la scelta greedy, sostituisci un suo elemento con la scelta greedy e mostra che la
    soluzione resta valida e non peggiora. Allora esiste un ottimo che contiene la scelta greedy.</li>
    <li><strong>Controesempio</strong>: un input, il più piccolo possibile, su cui il greedy dà un risultato peggiore di
    un'altra soluzione. Ne basta uno per scartare l'algoritmo.</li>
  </ul>
  ${box('ricorda', `<p>Un greedy è corretto solo se lo dimostri, di solito con un argomento di scambio. Per dire che è
  sbagliato basta un controesempio. Prima di cercare la dimostrazione, prova il greedy su tre o quattro input piccoli e
  strani: spesso il controesempio salta fuori subito.</p>`)}
</section>

<section id="attivita">
  <h2>Selezione di attività</h2>
  <p>Ci sono <var>n</var> attività (lezioni, esami, riunioni) che chiedono la stessa aula. L'attività <var>i</var> la
  occupa nell'intervallo ${m('[s_i, f_i)')}: dall'inizio ${m('s_i')} compreso alla fine ${m('f_i')} esclusa. Due attività
  sono <strong>compatibili</strong> se non si sovrappongono, cioè se una inizia quando l'altra è già finita
  (${m('s_j >= f_i')}). Vogliamo il <strong>numero massimo</strong> di attività compatibili.</p>
  <p>Vengono in mente vari criteri: prima quella che inizia prima, prima la più corta, prima quella che si sovrappone a
  meno altre, prima quella che finisce prima. Funziona sempre solo l'ultimo: l'attività che finisce per prima libera
  l'aula il prima possibile, quindi lascia più spazio a tutte le altre.</p>
  <ol>
    <li>ordina le attività per tempo di fine crescente;</li>
    <li>prendi la prima;</li>
    <li>scorri le altre e prendi un'attività se inizia quando l'ultima scelta è già finita.</li>
  </ol>
  <div data-mount="attivita"></div>
  <p>La linea rossa tratteggiata segna la fine dell'ultima attività scelta, <code>a[k].fine</code>: un'attività si può
  prendere solo se la sua barra comincia dalla linea in poi. Puoi scrivere le tue attività come coppie
  <code>inizio-fine</code>; i nomi A, B, C… seguono l'ordine in cui le scrivi.</p>

  <h3>Perché è corretto</h3>
  <p>Sia <var>a</var> l'attività che finisce per prima e sia <var>O</var> una soluzione ottima qualsiasi. Chiama
  <var>x</var> l'attività di <var>O</var> che finisce per prima.</p>
  <ul>
    <li>Se ${m('x = a')}, la scelta greedy è già in <var>O</var>.</li>
    <li>Altrimenti togli <var>x</var> da <var>O</var> e metti <var>a</var>. Le altre attività di <var>O</var> sono
    compatibili con <var>x</var> e finiscono dopo di lei, quindi iniziano da ${m('f_x')} in poi; siccome
    ${m('f_a <= f_x')}, iniziano anche dopo la fine di <var>a</var>. La nuova soluzione è valida e ha lo stesso numero di
    attività: è ottima e contiene <var>a</var>.</li>
  </ul>
  <p>Scelta <var>a</var>, restano le attività che iniziano da ${m('f_a')} in poi: è lo stesso problema, più piccolo
  (sottostruttura ottima). Ripetendo il ragionamento a ogni passo, tutte le scelte greedy stanno in una soluzione ottima.</p>

  <h3>Quanto costa</h3>
  <p>L'ordinamento costa ${m('O(n log n)')} (<code>sort</code> della STL); la scansione fa un confronto per attività,
  ${m('Θ(n)')}. In tutto ${m('O(n log n)')}; se le attività arrivano già ordinate per fine, basta ${m('Θ(n)')}. Il
  programma completo, con le 11 attività dell'esempio del Cormen in ordine sparso, stampa:</p>
  <pre class="code-out" tabindex="0"><code>Attività scelte: 4
B  [1, 4)
H  [5, 7)
J  [8, 11)
F  [12, 16)</code></pre>
  ${box('errore', `<p>Un'attività va confrontata con l'<strong>ultima scelta</strong>, <code>a[k]</code>, non con quella
  che la precede nell'array, <code>a[m - 1]</code>. Nell'esempio, dopo l'ordinamento H viene subito dopo D, che è stata
  scartata: confrontata con D (fine 6) verrebbe scartata anche H, mentre confrontata con B (fine 4) va presa.</p>`)}

  <h3>Quale criterio?</h3>
  <p>Prova anche gli altri criteri. Ognuno ordina le attività a modo suo e prende quelle compatibili con le scelte già
  fatte. Per ogni criterio sbagliato c'è un input piccolo che lo smentisce.</p>
  <div data-mount="criteri"></div>
</section>

<section id="resto">
  <h2>Il resto con meno monete</h2>
  <p>Devi dare un resto di <var>R</var> centesimi con il minor numero di monete; di ogni taglio ne hai quante ne vuoi.
  La strategia del cassiere è greedy: <strong>dai la moneta più grande che non supera quello che manca</strong>, e
  ripeti finché non manca più niente.</p>
  <div data-mount="codice-resto"></div>
  <p>Con le monete dell'euro funziona sempre: per 2,89 € dà 2 € + 50 + 20 + 10 + 5 + 2 + 2 centesimi, 7 monete, e con
  meno non si può. I sistemi di monete per cui il greedy dà sempre il minimo si chiamano <strong>canonici</strong>;
  quello dell'euro lo è (il programma del ${ASD.link('dp', 'monete', 'prossimo capitolo')} lo controlla per tutti gli
  importi fino a 5 €).</p>
  <p>Con le monete {1, 3, 4}, invece, per 6 il greedy prende 4, poi 1 e 1: <strong>3 monete</strong>. Ma
  ${m('3 + 3 = 6')} usa <strong>2 monete</strong>. Prendere il 4 sembrava la scelta migliore e invece esclude l'ottimo:
  qui manca la proprietà della scelta greedy.</p>
  <pre class="code-out" tabindex="0"><code>Monete dell'euro (centesimi):
289 = 200 + 50 + 20 + 10 + 5 + 2 + 2  (7 monete)
48 = 20 + 20 + 5 + 2 + 1  (5 monete)
Monete {4, 3, 1}:
6 = 4 + 1 + 1  (3 monete)
ma 6 = 3 + 3 usa solo 2 monete: qui il greedy non è ottimo.</code></pre>
  <p>Prova tu: scegli un sistema di monete e un importo. La striscia in basso colora di rosso gli importi per cui il
  greedy usa più monete del necessario.</p>
  <div data-mount="resto"></div>
  ${box('nota', `<p>Il resto con monete qualsiasi si risolve sempre con la programmazione dinamica, in tempo
  ${m('Θ(kR)')} con <var>k</var> tagli di monete: è il secondo esempio del capitolo
  ${ASD.link('dp', 'monete', 'Programmazione dinamica')}.</p>`, 'Come si rimedia')}
</section>

<section id="zaino">
  <h2>Zaino frazionario e zaino 0/1</h2>
  <p>Hai uno zaino che regge al massimo <var>W</var> chili e <var>n</var> oggetti: l'oggetto <var>i</var> pesa
  ${m('p_i')} e vale ${m('v_i')}. Vuoi il massimo valore senza superare <var>W</var>. Il problema ha due versioni.</p>
  <dl>
    <dt>Zaino frazionario</dt>
    <dd>gli oggetti si possono spezzare (polvere d'oro, farina): di un oggetto puoi prendere una parte e ne ottieni il
    valore in proporzione.</dd>
    <dt>Zaino 0/1</dt>
    <dd>ogni oggetto si prende intero o non si prende (un televisore, un libro).</dd>
  </dl>
  <p>Il criterio greedy naturale è il <strong>valore per chilo</strong> ${m('v_i / p_i')}: prima gli oggetti che rendono
  di più per ogni unità di peso.</p>
  <div data-mount="codice-frazionario"></div>
  <p>Per lo zaino <strong>frazionario</strong> il greedy è ottimo. Argomento di scambio: se una soluzione tiene nello
  zaino un chilo di un oggetto che rende meno mentre resta fuori un chilo di un oggetto che rende di più, scambiare i due
  chili aumenta il valore. Quindi in una soluzione ottima lo spazio va prima agli oggetti con il rapporto più alto: è
  proprio quello che fa il greedy.</p>
  <p>Per lo zaino <strong>0/1</strong> lo stesso greedy sbaglia. L'esempio del Cormen ha ${m('W = 50')} e tre oggetti:</p>
  ${table({
    head: ['Oggetto', 'Peso', 'Valore', 'Valore/peso'],
    rows: [
      ['1', '10', '60', '6'],
      ['2', '20', '100', '5'],
      ['3', '30', '120', '4'],
    ],
  })}
  <p>Il greedy prende 1 e 2 (peso 30, valore 160); l'oggetto 3 pesa 30 e nei 20 chili rimasti non ci sta. Ma 2 e 3
  insieme pesano esattamente 50 e valgono <strong>220</strong>. Nella versione frazionaria invece il greedy prende 1, 2 e
  i due terzi di 3: ${m('60 + 100 + 80 = 240')}. Lo scambio "chilo per chilo" della dimostrazione nello zaino 0/1 non si
  può fare: gli oggetti non si spezzano, e lo spazio che avanza resta vuoto.</p>
  <pre class="code-out" tabindex="0"><code>Zaino frazionario, greedy:  240
Zaino 0/1, greedy:          160
Zaino 0/1, ottimo:          220</code></pre>
  <p>Cambia la capacità e confronta i tre zaini.</p>
  <div data-mount="zaini"></div>
  ${box('errore', `<p>"Ordino per valore/peso e prendo finché ci sta" <strong>non</strong> risolve lo zaino 0/1. Lo zaino
  0/1 si risolve con la programmazione dinamica, in ${m('Θ(nW)')}: è il primo problema del capitolo
  ${ASD.link('dp-problemi', 'zaino', 'Problemi classici di PD')}.</p>`)}
</section>

<section id="huffman">
  <h2>Codici di Huffman</h2>
  <p>Vuoi comprimere un testo. Con un codice a lunghezza fissa ogni carattere costa lo stesso numero di bit: con 6
  caratteri diversi servono 3 bit ciascuno. Se però alcuni caratteri sono molto più frequenti di altri, conviene dare a
  loro codici <strong>corti</strong> e ai caratteri rari codici lunghi.</p>
  <p>Per decodificare senza separatori il codice deve essere <strong>prefisso</strong> (<i>prefix-free</i>): nessun
  codice è l'inizio di un altro. Un codice prefisso si disegna come un albero binario: i caratteri stanno nelle foglie e
  il codice di un carattere è il cammino dalla radice alla sua foglia (0 = a sinistra, 1 = a destra). Il numero di bit
  del testo codificato è</p>
  <p class="formula">${m('B = Σ_c f(c) * d(c)')}</p>
  <p>dove ${m('f(c)')} è la frequenza del carattere <var>c</var> e ${m('d(c)')} la profondità della sua foglia, cioè la
  lunghezza del suo codice.</p>
  <p>L'algoritmo di Huffman è greedy: parte da una foresta di foglie, una per carattere, e <strong>fonde sempre i due
  alberi con la frequenza più bassa</strong> sotto un nodo nuovo, che ha come frequenza la somma. Dopo ${m('n - 1')}
  fusioni resta un albero solo. Per trovare ogni volta i due minimi si usa una
  ${ASD.link('heap', null, 'coda con priorità')}: in C++ <code>priority_queue</code>, che però tiene in cima il
  <em>massimo</em> e va quindi costruita con un confronto rovesciato.</p>
  <div data-mount="huffman"></div>
  <p>Con le frequenze dell'esempio del Cormen (in migliaia di caratteri: a 45, b 13, c 12, d 16, e 9, f 5) il codice
  fisso a 3 bit costa 300 mila bit, quello di Huffman 224 mila: un quarto in meno. Il programma stampa:</p>
  <pre class="code-out" tabindex="0"><code>a  freq 45  codice 0
c  freq 12  codice 100
b  freq 13  codice 101
f  freq 5  codice 1100
e  freq 9  codice 1101
d  freq 16  codice 111
Bit totali: 224 (con 3 bit fissi per carattere: 300)</code></pre>
  <h3>Perché è corretto e quanto costa</h3>
  <p><strong>Scelta greedy</strong>: esiste un albero ottimo in cui i due caratteri meno frequenti sono fratelli al
  livello più profondo. Se un carattere più frequente stesse più in basso di uno meno frequente, scambiarli non
  aumenterebbe il costo (argomento di scambio). <strong>Sottostruttura ottima</strong>: fusi i due caratteri in un
  carattere nuovo con la somma delle frequenze, resta lo stesso problema con un carattere in meno.</p>
  <p><strong>Costo</strong>: ${m('n')} inserimenti iniziali e ${m('n - 1')} fusioni, ognuna con due estrazioni e un
  inserimento da ${m('O(log n)')}: in tutto ${m('O(n log n)')}.</p>
  ${box('errore', `<p><code>priority_queue&lt;int&gt;</code> estrae il <strong>massimo</strong>. Per Huffman serve il
  minimo: con i numeri basta passare <code>greater&lt;int&gt;</code> come terzo parametro del template (il secondo è il
  contenitore, <code>vector&lt;int&gt;</code>); con i puntatori a nodo serve un confronto scritto da te, qui
  <code>PiuPiccolo</code>, che dichiara "più grande" il nodo con frequenza <em>minore</em>.</p>`)}
</section>

<section id="esame">
  <h2>All'esame</h2>
  ${table({
    caption: 'Gli algoritmi greedy del capitolo',
    head: ['Problema', 'Scelta greedy', 'Costo', 'Sempre ottimo?'],
    rows: [
      ['Selezione di attività', 'finisce prima', m('O(n log n)'), 'sì'],
      ['Resto, monete dell\'euro', 'moneta più grande', `${m('Θ(k)')} tagli + una passata per moneta data`, 'sì (sistema canonico)'],
      ['Resto, monete {1, 3, 4}', 'moneta più grande', 'come sopra', '<strong>no</strong>: 6 = 4 + 1 + 1'],
      ['Zaino frazionario', 'valore/peso più alto', m('O(n log n)'), 'sì'],
      ['Zaino 0/1', 'valore/peso più alto', m('O(n log n)'), '<strong>no</strong>: serve la PD'],
      ['Codici di Huffman', 'le due frequenze minime', m('O(n log n)'), 'sì'],
    ],
  })}
  <p>Sono greedy anche ${ASD.link('cammini-minimi', null, 'Dijkstra')} e gli algoritmi di Prim e Kruskal per gli
  ${ASD.link('mst', null, 'alberi di copertura minimi')}, ognuno con la sua dimostrazione. Le domande tipiche sono di tre
  tipi.</p>
  <ol>
    <li><strong>Simulazione</strong>: "date queste attività, quali sceglie l'algoritmo?". Ordina per fine e scorri:
    per ogni attività scrivi "presa" oppure "scartata, inizia prima della fine di …".</li>
    <li><strong>Correttezza</strong>: "questo greedy è corretto? Dimostralo o dai un controesempio". Prima cerca un
    controesempio con due o tre elementi; se non lo trovi, prova l'argomento di scambio.</li>
    <li><strong>Huffman</strong>: "costruisci l'albero e i codici per queste frequenze e calcola i bit totali". Riscrivi
    la coda dopo ogni fusione: è il modo più sicuro per non sbagliare l'ordine.</li>
  </ol>
  ${box('esame', `<p>Un controesempio si scrive in tre parti: l'input, cosa sceglie il greedy (con il suo valore) e una
  soluzione migliore (con il suo valore). Per il resto con {1, 3, 4}: "importo 6; il greedy dà 4 + 1 + 1, cioè 3 monete;
  invece 3 + 3 ne usa 2". Senza la soluzione migliore il controesempio non dimostra niente.</p>`)}
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        attivita: (host) =>
          ASD.stepper(host, {
            id: 'attivita',
            title: 'Selezione di attività passo per passo',
            code: { src: 'tecniche/selezione_attivita', region: 'greedy' },
            input: {
              label: 'Attività (inizio-fine)',
              value: parseAtt(CORMEN),
              parse: parseAtt,
              format: formatAtt,
              presets: [
                { label: 'Cormen', value: () => parseAtt(CORMEN) },
                { label: 'Casuale', value: randomAtt },
                { label: 'Tutte sovrapposte', value: () => parseAtt('0-9, 1-8, 2-7, 3-6, 4-5') },
              ],
            },
            view: (stage) => new TimelineView(stage),
            trace: traceAtt,
            counters: [
              { key: 'confronti', label: 'confronti' },
              { key: 'scelte', label: 'scelte' },
            ],
            legend: [
              { k: 'compare', label: 'in esame' },
              { k: 'done', label: 'scelta' },
              { k: 'out', label: 'scartata' },
            ],
            validate: validateAtt,
          }),
        criteri: mountCriteri,
        'codice-resto': (host) => ASD.code(host, { src: 'tecniche/resto_greedy', region: 'greedy' }),
        resto: mountResto,
        'codice-frazionario': (host) => ASD.code(host, { src: 'tecniche/zaino_frazionario', region: 'frazionario' }),
        zaini: mountZaini,
        huffman: (host) =>
          ASD.stepper(host, {
            id: 'huffman',
            title: 'Huffman passo per passo',
            code: { src: 'tecniche/huffman', region: 'huffman' },
            input: {
              label: 'Frequenze (carattere:frequenza)',
              value: parseFreq('a:45 b:13 c:12 d:16 e:9 f:5'),
              parse: parseFreq,
              format: (v) => v.map(([c, f]) => `${c}:${f}`).join(' '),
              presets: [
                { label: 'Cormen', value: () => parseFreq('a:45 b:13 c:12 d:16 e:9 f:5') },
                { label: 'Tutte uguali', value: () => parseFreq('a:5 b:5 c:5 d:5') },
                { label: 'Fibonacci', value: () => parseFreq('a:1 b:1 c:2 d:3 e:5 f:8') },
                { label: 'Casuale', value: randomFreq },
              ],
            },
            view: (stage) => new HuffmanView(stage),
            trace: traceHuffman,
            counters: [{ key: 'fusioni', label: 'fusioni' }],
            legend: [
              { k: 'compare', label: 'estratto dalla coda' },
              { k: 'key', label: 'nodo nuovo' },
              { k: 'done', label: 'foglia con il suo codice' },
            ],
            validate: validateHuffman,
          }),
        quiz: (host) =>
          ASD.quiz(host, [
            {
              q: 'Nella selezione di attività, quale criterio greedy dà <strong>sempre</strong> il massimo numero di attività compatibili?',
              options: ['Prima quella che inizia prima', 'Prima la più corta', 'Prima quella che si sovrappone a meno altre', 'Prima quella che finisce prima'],
              answer: 3,
              explain: `L'attività che finisce prima lascia libera l'aula il prima possibile; l'argomento di scambio mostra che
              c'è sempre una soluzione ottima che la contiene. Gli altri tre criteri hanno un controesempio: li trovi nello
              strumento "Quale criterio?".`,
            },
            {
              q: 'Monete {1, 3, 4}, importo 6. Quante monete dà il greedy, e quante ne servono al minimo?',
              options: ['Greedy 2, minimo 2', 'Greedy 3, minimo 2', 'Greedy 3, minimo 3', 'Greedy 4, minimo 2'],
              answer: 1,
              explain: `Il greedy prende 4 (la moneta più grande che ci sta), poi resta 2 e servono 1 + 1: tre monete. Ma
              ${m('3 + 3 = 6')} ne usa due. Il sistema {1, 3, 4} non è canonico.`,
            },
            {
              q: 'Zaino di capacità 50 con gli oggetti (peso 10, valore 60), (20, 100), (30, 120). Qual è il valore massimo nella versione <strong>frazionaria</strong>?',
              options: ['160', '220', '240', '280'],
              answer: 2,
              explain: `Ordinati per valore/peso (6, 5, 4), il greedy prende interi i primi due (peso 30, valore 160) e i
              20/30 del terzo: ${m('160 + 120 * 2/3 = 240')}. 220 è l'ottimo della versione 0/1, 160 quello che darebbe il
              greedy nella versione 0/1.`,
            },
            {
              q: 'Frequenze a 10, b 6, c 3, d 2. Quanti bit costa in tutto il testo codificato con Huffman?',
              options: ['37', '42', '40', '21'],
              answer: 0,
              explain: `Fusioni: d + c = 5, poi 5 + b = 11, poi a + 11 = 21. Profondità: a 1, b 2, c e d 3. Bit:
              ${m('10*1 + 6*2 + 3*3 + 2*3 = 37')}. Con un codice fisso servono 2 bit per carattere: ${m('2 * 21 = 42')}.`,
            },
            {
              q: 'Per dimostrare che un algoritmo greedy <strong>non</strong> è corretto basta…',
              options: [
                'mostrare che su qualche input è lento',
                'un controesempio: un input su cui un\'altra soluzione è migliore di quella greedy',
                'mostrare che la sottostruttura ottima non vale per l\'ordinamento usato',
                'provarlo su cento input casuali senza trovare errori',
              ],
              answer: 1,
              explain: `Un solo controesempio basta a smentire l'algoritmo; cento prove riuscite invece non dimostrano niente,
              perché il caso sbagliato può essere raro. Nel controesempio scrivi l'input, la soluzione greedy e una migliore.`,
            },
            {
              q: 'Qual è il costo della selezione di attività su <var>n</var> attività non ordinate?',
              options: [m('Θ(n)'), m('O(n log n)'), m('Θ(n^2)'), m('Θ(2^n)')],
              answer: 1,
              explain: `Domina l'ordinamento per tempo di fine, ${m('O(n log n)')}. La scansione che segue fa un confronto per
              attività: ${m('Θ(n)')}. Se le attività sono già ordinate per fine resta solo la scansione.`,
            },
          ]),
      });
    },
  });

  /* ======================================================================
     Selezione di attività
     ====================================================================== */

  const CORMEN = '5-9, 1-4, 8-12, 0-6, 3-5, 12-16, 6-10, 5-7, 2-14, 8-11, 3-9';

  function parseAtt(text) {
    const parts = String(text).split(/[\s,;]+/).filter(Boolean);
    if (parts.length < 2) throw new Error('Servono almeno 2 attività, scritte come inizio-fine (es. 1-4).');
    if (parts.length > 12) throw new Error('Al massimo 12 attività, così si vede bene.');
    return parts.map((p, k) => {
      const mm = /^(\d+)\s*[-–]\s*(\d+)$/.exec(p);
      if (!mm) throw new Error(`"${p}" non va bene: scrivi inizio-fine, per esempio 1-4.`);
      const si = Number(mm[1]);
      const fi = Number(mm[2]);
      if (fi <= si) throw new Error(`In "${p}" la fine deve venire dopo l'inizio.`);
      if (fi > 24) throw new Error('I tempi devono stare tra 0 e 24.');
      return { id: k, nome: LETTERE[k], s: si, f: fi };
    });
  }

  const formatAtt = (v) => v.map((a) => `${a.s}-${a.f}`).join(', ');

  function randomAtt() {
    const n = 8;
    const out = [];
    for (let k = 0; k < n; k++) {
      const si = ASD.randInt(0, 13);
      out.push({ id: k, nome: LETTERE[k], s: si, f: si + ASD.randInt(1, 5) });
    }
    return out;
  }

  const iv = (a) => `[${a.s}, ${a.f})`;

  /** La traccia segue selezionaAttivita() riga per riga. */
  function traceAtt(input) {
    const t = new ASD.Tracer(['confronti', 'scelte']);
    const n = input.length;
    const Tmax = Math.max(...input.map((a) => a.f));
    const snap = (arr, marks, last) => ({
      acts: arr.map(({ id, nome, s: si, f }) => ({ id, nome, s: si, f })),
      T: Tmax,
      marks: Object.assign({}, marks),
      line: last ? { t: last.f, label: `fine di ${last.nome}: ${last.f}` } : null,
    });

    t.step(null, `Le ${n} attività come arrivano, in ordine sparso. Ognuna occupa l'aula in un intervallo [inizio, fine).`, {}, snap(input, {}));
    const a = input.slice().sort((x, y) => x.f - y.f); // stabile: a parità di fine resta l'ordine di partenza
    t.step(
      'sort',
      `<code>sort</code> le mette in ordine di fine crescente: costa ${m('O(n log n)')}. Ora a[0] = ${a[0].nome} ${iv(a[0])} è quella che finisce per prima.`,
      {},
      snap(a, {})
    );
    const marks = { [a[0].id]: 'done' };
    t.count('scelte');
    t.step(
      'first',
      `Prendo a[0] = ${a[0].nome}: finisce prima di tutte, al tempo ${a[0].f}, e lascia l'aula libera il prima possibile.`,
      { k: 0 },
      snap(a, marks, a[0])
    );
    let k = 0;
    for (let mi = 1; mi < n; mi++) {
      const cur = a[mi];
      t.step('loop', `m = ${mi}: esamino a[${mi}] = ${cur.nome} ${iv(cur)}.`, { m: mi, k }, snap(a, Object.assign({}, marks, { [cur.id]: 'compare' }), a[k]));
      t.count('confronti');
      const ok = cur.s >= a[k].f;
      t.step(
        'check',
        ok
          ? `${cur.nome} inizia a ${cur.s} ≥ ${a[k].f}, la fine di ${a[k].nome} (l'ultima scelta): <b>è compatibile</b>.`
          : `${cur.nome} inizia a ${cur.s} &lt; ${a[k].f}, la fine di ${a[k].nome}: si sovrappone, <b>la scarto</b>.`,
        { m: mi, k },
        snap(a, Object.assign({}, marks, { [cur.id]: ok ? 'compare' : 'out' }), a[k])
      );
      if (ok) {
        marks[cur.id] = 'done';
        t.count('scelte');
        t.step('take', `Prendo ${cur.nome} ${iv(cur)}.`, { m: mi, k }, snap(a, marks, a[k]));
        k = mi;
        t.step('last', `<code>k = ${mi}</code>: ora l'ultima scelta è ${cur.nome}, che libera l'aula al tempo ${cur.f}.`, { m: mi, k }, snap(a, marks, a[k]));
      } else {
        marks[cur.id] = 'out';
      }
    }
    const chosen = a.filter((x) => marks[x.id] === 'done');
    t.step(
      null,
      `Finito: ${chosen.length} attività compatibili (${chosen.map((x) => x.nome).join(', ')}) con ${t.c.confronti} confronti. Nessun'altra scelta ne contiene di più.`,
      {},
      snap(a, marks, a[k])
    );
    return t.frames;
  }

  const overlap = (x, y) => x.s < y.f && y.s < x.f;

  function bestCount(acts) {
    const n = acts.length;
    let best = 0;
    for (let mask = 1; mask < 1 << n; mask++) {
      const pick = acts.filter((_, i) => mask & (1 << i));
      if (pick.length <= best) continue;
      let ok = true;
      for (let i = 0; i < pick.length && ok; i++) for (let j = i + 1; j < pick.length && ok; j++) if (overlap(pick[i], pick[j])) ok = false;
      if (ok) best = pick.length;
    }
    return best;
  }

  function validateAtt(input, frames) {
    const st = frames[frames.length - 1].state;
    const chosen = st.acts.filter((x) => st.marks[x.id] === 'done');
    for (let i = 0; i < chosen.length; i++) {
      for (let j = i + 1; j < chosen.length; j++) {
        if (overlap(chosen[i], chosen[j])) return `${chosen[i].nome} e ${chosen[j].nome} si sovrappongono`;
      }
    }
    const best = bestCount(input);
    if (chosen.length !== best) return `scelte ${chosen.length} attività, il massimo è ${best}`;
    return null;
  }

  /* Linea del tempo: una riga per attività, nell'ordine dell'array. */
  class TimelineView {
    constructor(host) {
      this.root = h('div.tc-tl');
      this.rows = h('div.tc-tl-rows');
      this.markLabel = h('span');
      this.mark = h('div.tc-tl-mark', { hidden: true, 'aria-hidden': 'true' }, this.markLabel);
      this.axis = h('div.tc-tl-axis', { 'aria-hidden': 'true' });
      this.rows.append(this.mark);
      this.root.append(this.rows, this.axis);
      host.append(this.root);
      this.items = new Map();
      this.axisKey = '';
    }

    reset() {
      for (const it of this.items.values()) it.el.remove();
      this.items.clear();
    }

    render(st) {
      const acts = st.acts || [];
      const Tm = Math.max(1, st.T || 1);
      this.root.style.setProperty('--T', String(Tm));
      this.rows.style.height = `calc(var(--tl-row) * ${acts.length})`;
      const seen = new Set();
      acts.forEach((a, idx) => {
        let it = this.items.get(a.id);
        if (!it) {
          const name = h('span.tc-tl-name');
          const bar = h('span.tc-tl-bar');
          const el = h('div.tc-tl-row', name, h('span.tc-tl-track', bar));
          el.style.transition = 'none';
          this.rows.append(el);
          it = { el, name, bar, fresh: true };
          this.items.set(a.id, it);
        }
        seen.add(a.id);
        it.el.style.setProperty('--y', `calc(var(--tl-row) * ${idx})`);
        it.bar.style.setProperty('--s', String(a.s / Tm));
        it.bar.style.setProperty('--d', String((a.f - a.s) / Tm));
        it.name.replaceChildren(a.nome, h('small', { text: iv(a) }));
        const mk = st.marks && st.marks[a.id];
        it.el.className = 'tc-tl-row' + [].concat(mk || []).map((x) => ' is-' + x).join('');
        if (it.fresh) {
          void it.el.offsetWidth;
          it.el.style.transition = '';
          it.fresh = false;
        }
      });
      for (const [id, it] of this.items) {
        if (!seen.has(id)) {
          it.el.remove();
          this.items.delete(id);
        }
      }
      if (st.line) {
        this.mark.hidden = false;
        const frac = st.line.t / Tm;
        this.mark.style.setProperty('--t', String(frac));
        this.mark.classList.toggle('at-end', frac > 0.62);
        this.markLabel.textContent = st.line.label;
      } else this.mark.hidden = true;

      if (this.axisKey !== String(Tm)) {
        this.axisKey = String(Tm);
        const step = Tm <= 12 ? 1 : Tm <= 24 ? 2 : 5;
        const ticks = [];
        for (let v = 0; v <= Tm; v += step) ticks.push(T.vars(h('span.tc-tl-tick', { text: String(v) }), { '--t': v / Tm }));
        this.axis.replaceChildren(...ticks);
      }
    }
  }

  /* Strumento "Quale criterio?": quattro criteri, quattro input. */
  function mountCriteri(host) {
    const SETS = [
      { id: 'cormen', label: 'Cormen', text: CORMEN },
      { id: 'c1', label: 'Input 1', text: '0-10, 1-3, 4-6, 7-9' },
      { id: 'c2', label: 'Input 2', text: '0-6, 5-8, 7-13' },
      { id: 'c3', label: 'Input 3', text: '0-3, 4-7, 8-11, 12-15, 2-5, 2-5, 2-5, 6-9, 10-13, 10-13, 10-13' },
    ];
    const CRIT = [
      { id: 'inizio', label: 'inizia prima', key: (a) => a.s, name: '«inizia prima»' },
      { id: 'durata', label: 'dura meno', key: (a) => a.f - a.s, name: '«dura meno»' },
      { id: 'conflitti', label: 'meno sovrapposizioni', key: (a, all) => all.filter((b) => b !== a && overlap(a, b)).length, name: '«meno sovrapposizioni»' },
      { id: 'fine', label: 'finisce prima', key: (a) => a.f, name: '«finisce prima»' },
    ];
    const lab = h('div.lab');
    const head = h('div.lab-head', h('h3', { text: 'Quale criterio? Prova e confronta' }));
    const body = h('div.lab-body.quadretti');
    const controls = h('div.lab-controls');
    const out = h('div.lab-out', { 'aria-live': 'polite' });
    lab.append(head, body, controls, out);
    host.append(lab);
    const view = new TimelineView(body);
    const setPick = T.radios('Input', SETS, () => draw(), 'c1');
    const critPick = T.radios('Criterio greedy', CRIT, () => draw(), 'inizio');
    controls.append(setPick.el, critPick.el);

    function draw() {
      const acts = parseAtt(setPick.value().text);
      const crit = critPick.value();
      const keyed = acts.map((a) => ({ a, k: crit.key(a, acts) }));
      keyed.sort((x, y) => x.k - y.k);
      const order = keyed.map((x) => x.a);
      const chosen = [];
      for (const a of order) if (chosen.every((b) => !overlap(a, b))) chosen.push(a);
      const marks = {};
      for (const a of acts) marks[a.id] = chosen.includes(a) ? 'done' : 'out';
      view.render({ acts: order, T: Math.max(...acts.map((a) => a.f)), marks, line: null });
      const best = bestCount(acts);
      const names = (list) => list.map((a) => a.nome).join(', ');
      const ok = chosen.length === best;
      const keyText =
        crit.id === 'conflitti' ? ' (in ordine di quante altre attività tocca)' : crit.id === 'durata' ? ' (in ordine di durata)' : crit.id === 'inizio' ? ' (in ordine di inizio)' : ' (in ordine di fine)';
      out.innerHTML =
        `<p class="tc-out-line">Le righe sono ordinate secondo il criterio${keyText}. Il criterio ${crit.name} sceglie ` +
        `<strong>${chosen.length}</strong> attività: ${names(chosen)}.</p>` +
        `<p class="tc-out-line">Il massimo possibile è <strong>${best}</strong>. ` +
        (ok
          ? `<span class="tc-verdict-ok">Su questo input il criterio va bene.</span>${crit.id === 'fine' ? ' Ed è l\'unico dei quattro che va bene sempre.' : ' Prova gli altri input: ce n\'è uno che lo smentisce.'}`
          : `<span class="tc-verdict-no">Qui il criterio sbaglia: è un controesempio.</span>`) +
        `</p>`;
    }
    draw();
  }

  /* ======================================================================
     Resto con le monete
     ====================================================================== */

  function mountResto(host) {
    const SYS = [
      { id: 'euro', label: 'euro (centesimi)', coins: [1, 2, 5, 10, 20, 50, 100, 200] },
      { id: 'c134', label: '{1, 3, 4}', coins: [1, 3, 4] },
      { id: 'c151012', label: '{1, 5, 10, 12}', coins: [1, 5, 10, 12] },
      { id: 'c1710', label: '{1, 7, 10}', coins: [1, 7, 10] },
    ];
    const MAX = 60;
    const lab = h('div.lab');
    const head = h('div.lab-head', h('h3', { text: 'Greedy contro ottimo' }));
    const body = h('div.lab-body');
    const controls = h('div.lab-controls');
    const out = h('div.lab-out', { 'aria-live': 'polite' });
    lab.append(head, body, controls, out);
    host.append(lab);

    const greedyRow = h('div.tc-coins');
    const bestRow = h('div.tc-coins');
    const gText = h('p');
    const bText = h('p');
    body.append(h('div.tc-coin-row', gText, greedyRow), h('div.tc-coin-row', bText, bestRow));
    const strip = h('div.tc-strip', { 'aria-hidden': 'true' });
    const stripTitle = h('p.tc-strip-title');
    body.append(h('div.tc-strip-wrap', stripTitle, strip));

    const sys = T.radios('Monete', SYS, () => draw(), 'c134');
    const amount = T.slider('Importo', { min: 1, max: MAX, value: 6 }, () => draw());
    controls.append(sys.el, amount.el);

    const coinsEl = (list) => list.map((c) => h('span.tc-coin', { text: String(c) }));

    function draw() {
      const coins = sys.value().coins;
      const R = amount.value();
      const g = T.coins.greedy(coins, R);
      const b = T.coins.best(coins, R);
      const bad = g && g.length > b.k;
      greedyRow.className = 'tc-coins' + (bad ? ' is-bad' : '');
      bestRow.className = 'tc-coins is-good';
      greedyRow.replaceChildren(...coinsEl(g || []));
      bestRow.replaceChildren(...coinsEl(b.usate || []));
      gText.innerHTML = `<strong>Greedy</strong>${g ? `${g.length} monete` : 'non arriva all\'importo'}`;
      bText.innerHTML = `<strong>Ottimo</strong>${b.k} monete`;
      const fails = [];
      const cells = [];
      for (let x = 1; x <= MAX; x++) {
        const gx = T.coins.greedy(coins, x);
        const bx = T.coins.best(coins, x).k;
        const wrong = gx && gx.length > bx;
        if (wrong) fails.push(x);
        cells.push(h('span' + (wrong ? '.is-swap' : '') + (x === R ? '.is-active' : ''), { text: String(x) }));
      }
      strip.replaceChildren(...cells);
      stripTitle.textContent = `Importi da 1 a ${MAX}: in rosso quelli dove il greedy usa più monete del minimo.`;
      out.innerHTML =
        `<p class="tc-out-line">${bad
          ? `<span class="tc-verdict-no">Per ${R} il greedy usa ${g.length} monete, ma ne bastano ${b.k}.</span>`
          : `<span class="tc-verdict-ok">Per ${R} il greedy dà il minimo: ${b.k} ${b.k === 1 ? 'moneta' : 'monete'}.</span>`}</p>` +
        `<p class="tc-out-line">${fails.length
          ? `Con queste monete il greedy sbaglia per ${fails.length} importi su ${MAX}: ${fails.slice(0, 12).join(', ')}${fails.length > 12 ? '…' : ''}.`
          : `Con queste monete il greedy non sbaglia mai fino a ${MAX}.`}</p>`;
    }
    draw();
  }

  /* ======================================================================
     Zaino frazionario contro zaino 0/1
     ====================================================================== */

  function mountZaini(host) {
    const OGG = [
      { n: 1, p: 10, v: 60 },
      { n: 2, p: 20, v: 100 },
      { n: 3, p: 30, v: 120 },
    ];
    const SCALA = 60;
    const lab = h('div.lab');
    const head = h('div.lab-head', h('h3', { text: 'Tre zaini, stessi oggetti' }));
    const body = h('div.lab-body.quadretti');
    const controls = h('div.lab-controls');
    const out = h('div.lab-out', { 'aria-live': 'polite' });
    lab.append(head, body, controls, out);
    host.append(lab);
    const W = T.slider('Capacità W', { min: 10, max: 60, value: 50 }, () => draw());
    controls.append(W.el);
    const sacks = h('div.tc-sacks');
    body.append(sacks);

    const byRatio = OGG.slice().sort((a, b) => b.v * a.p - a.v * b.p);

    function frazionario(cap) {
      const segs = [];
      let spazio = cap;
      let tot = 0;
      for (const o of byRatio) {
        if (spazio === 0) break;
        if (o.p <= spazio) {
          segs.push({ o, w: o.p, part: false });
          tot += o.v;
          spazio -= o.p;
        } else {
          segs.push({ o, w: spazio, part: true });
          tot += (o.v * spazio) / o.p;
          spazio = 0;
        }
      }
      return { segs, tot };
    }
    function greedy01(cap) {
      const segs = [];
      let spazio = cap;
      let tot = 0;
      for (const o of byRatio) {
        if (o.p <= spazio) {
          segs.push({ o, w: o.p });
          tot += o.v;
          spazio -= o.p;
        }
      }
      return { segs, tot };
    }
    function ottimo01(cap) {
      let best = { segs: [], tot: 0, p: 0 };
      for (let mask = 0; mask < 8; mask++) {
        const pick = OGG.filter((_, i) => mask & (1 << i));
        const p = pick.reduce((acc, o) => acc + o.p, 0);
        const v = pick.reduce((acc, o) => acc + o.v, 0);
        if (p <= cap && (v > best.tot || (v === best.tot && p < best.p))) best = { segs: pick.map((o) => ({ o, w: o.p })), tot: v, p };
      }
      return best;
    }

    const fmtV = (v) => (Number.isInteger(v) ? String(v) : ASD.fmt(v));

    function sack(title, sub, res, cap) {
      const inner = T.vars(h('div.tc-sack'), { '--cap': cap / SCALA });
      for (const sg of res.segs) {
        const label = sg.part ? `${sg.o.n} (${sg.w}/${sg.o.p})` : String(sg.o.n);
        inner.append(
          T.vars(
            h('span.tc-sack-seg.o' + sg.o.n + (sg.part ? '.part' : ''), {
              title: `oggetto ${sg.o.n}: ${sg.w} kg su ${sg.o.p}`,
              text: label,
            }),
            { '--w': sg.w / cap }
          )
        );
      }
      const capEl = T.vars(h('span.tc-sack-cap' + (cap / SCALA > 0.8 ? '.at-end' : ''), { text: `W = ${cap}` }), { '--cap': cap / SCALA });
      const used = res.segs.reduce((acc, sg) => acc + sg.w, 0);
      return h(
        'div.tc-sack-box',
        h('p.tc-sack-title', title, ' ', h('span', { text: sub })),
        h('div.tc-sack-scale', inner, capEl),
        h('p.tc-sack-val', { html: `valore <strong>${fmtV(res.tot)}</strong> · peso ${used} su ${cap}` })
      );
    }

    function draw() {
      const cap = W.value();
      const fr = frazionario(cap);
      const g = greedy01(cap);
      const o = ottimo01(cap);
      sacks.replaceChildren(
        sack('Frazionario', '(greedy per valore/peso: ottimo)', fr, cap),
        sack('0/1 con il greedy', '(per valore/peso)', g, cap),
        sack('0/1 ottimo', '(provando tutti i sottoinsiemi)', o, cap)
      );
      const diff = o.tot - g.tot;
      out.innerHTML = diff > 0
        ? `<p class="tc-out-line"><span class="tc-verdict-no">Con W = ${cap} il greedy 0/1 perde ${diff}</span>: vale ${g.tot}, l'ottimo ${o.tot}.</p>`
        : `<p class="tc-out-line"><span class="tc-verdict-ok">Con W = ${cap} il greedy 0/1 trova l'ottimo (${o.tot})</span>, ma non è garantito: prova W = 50.</p>`;
    }
    draw();
  }

  /* ======================================================================
     Huffman
     ====================================================================== */

  function parseFreq(text) {
    const parts = String(text).split(/[\s,;]+/).filter(Boolean);
    if (parts.length < 2) throw new Error('Servono almeno 2 caratteri, scritti come c:frequenza (es. a:45).');
    if (parts.length > 8) throw new Error('Al massimo 8 caratteri, così l\'albero si vede bene.');
    const seen = new Set();
    return parts.map((p) => {
      const mm = /^([A-Za-z0-9]):(\d{1,3})$/.exec(p);
      if (!mm) throw new Error(`"${p}" non va bene: scrivi carattere:frequenza, per esempio a:45.`);
      if (seen.has(mm[1])) throw new Error(`Il carattere "${mm[1]}" compare due volte.`);
      seen.add(mm[1]);
      const f = Number(mm[2]);
      if (f < 1) throw new Error('Le frequenze devono essere almeno 1.');
      return [mm[1], f];
    });
  }

  function randomFreq() {
    const n = ASD.randInt(4, 6);
    return 'abcdef'
      .slice(0, n)
      .split('')
      .map((c) => [c, ASD.randInt(1, 40)]);
  }

  /** La traccia segue huffman(): stessa coda, stesso ordine a parità di frequenza. */
  function traceHuffman(input) {
    const t = new ASD.Tracer(['fusioni']);
    const nodes = {};
    let id = 0;
    const make = (freq, c, kids) => {
      const nid = 'n' + id;
      nodes[nid] = { freq, c, id: id++, kids };
      return nid;
    };
    const less = (a, b) => nodes[a].freq - nodes[b].freq || nodes[a].id - nodes[b].id;
    const pq = [];
    const push = (x) => {
      pq.push(x);
      pq.sort(less);
    };
    const desc = (x) => (nodes[x].c != null ? `${nodes[x].c}:${nodes[x].freq}` : String(nodes[x].freq));

    const snap = (o = {}) => {
      const roots = (o.loose || []).concat(pq);
      const vn = {};
      const walk = (x) => {
        const nd = nodes[x];
        const cls = (o.cls && o.cls[x]) || (o.codes && nd.c != null ? 'done' : null);
        vn[x] = {
          label: nd.c != null ? nd.c : String(nd.freq),
          sub: nd.c != null ? String(nd.freq) : null,
          kids: nd.kids ? nd.kids.slice() : [],
          cls,
        };
        if (nd.kids) nd.kids.forEach(walk);
      };
      roots.forEach(walk);
      return {
        roots,
        nodes: vn,
        pq: pq.map((x) => ({ text: desc(x), cls: o.pqCls ? o.pqCls[x] : null })),
        codes: o.codes || null,
      };
    };

    for (const [c, f] of input) push(make(f, c, null));
    t.step(
      'init',
      `Creo una foglia per ogni carattere e la inserisco nella coda con priorità: ${input.length} inserimenti da ${m('O(log n)')}. In cima c'è sempre la frequenza minima.`,
      { 'q.size()': pq.length },
      snap()
    );
    while (pq.length > 1) {
      t.step('loop', `<code>q.size()</code> = ${pq.length} &gt; 1: ci sono ancora alberi da fondere.`, { 'q.size()': pq.length }, snap());
      const x = pq.shift();
      t.step('pop1', `<code>x</code> = ${desc(x)}: è il minimo della coda, <code>pop()</code> lo toglie.`, { x: desc(x), 'q.size()': pq.length }, snap({ loose: [x], cls: { [x]: 'compare' } }));
      const y = pq.shift();
      t.step(
        'pop2',
        `<code>y</code> = ${desc(y)}: è il nuovo minimo, tolgo anche lui.`,
        { x: desc(x), y: desc(y), 'q.size()': pq.length },
        snap({ loose: [x, y], cls: { [x]: 'compare', [y]: 'compare' } })
      );
      const z = make(nodes[x].freq + nodes[y].freq, null, [x, y]);
      push(z);
      t.count('fusioni');
      t.step(
        'merge',
        `Nodo nuovo con frequenza ${nodes[x].freq} + ${nodes[y].freq} = ${nodes[z].freq}: x a sinistra (bit 0), y a destra (bit 1). Lo rimetto nella coda.`,
        { x: desc(x), y: desc(y), 'q.size()': pq.length },
        snap({ cls: { [z]: 'key' }, pqCls: { [z]: 'new' } })
      );
    }
    t.step('loop', `<code>q.size()</code> = 1: resta un albero solo, il ciclo finisce.`, { 'q.size()': pq.length }, snap());
    const root = pq[0];
    t.step('root', `Restituisco <code>q.top()</code>, la radice: la sua frequenza, ${nodes[root].freq}, è la somma di tutte.`, { 'q.size()': 1 }, snap({ cls: { [root]: 'active' } }));

    const codes = [];
    const visit = (x, pref) => {
      const nd = nodes[x];
      if (!nd.kids) {
        codes.push({ c: nd.c, f: nd.freq, code: pref || '0' });
        return;
      }
      visit(nd.kids[0], pref + '0');
      visit(nd.kids[1], pref + '1');
    };
    visit(root, '');
    const bits = codes.reduce((acc, x) => acc + x.f * x.code.length, 0);
    const fixed = Math.max(1, Math.ceil(Math.log2(codes.length)));
    const total = nodes[root].freq;
    t.step(
      null,
      `Codici: ${codes.map((x) => `${x.c} = ${x.code}`).join(', ')}. Bit totali ${codes.map((x) => `${x.f}·${x.code.length}`).join(' + ')} = <b>${bits}</b>; con ${fixed} bit fissi per carattere sarebbero ${fixed * total}.`,
      {},
      Object.assign(snap({ codes }), { codes, bits, fixedBits: fixed * total })
    );
    return t.frames;
  }

  function validateHuffman(input, frames) {
    const st = frames[frames.length - 1].state;
    if (!st.codes) return 'mancano i codici nell\'ultimo passo';
    // costo con un metodo indipendente: somma delle fusioni, scegliendo i minimi da un array
    const a = input.map(([, f]) => f);
    let cost = 0;
    while (a.length > 1) {
      a.sort((x, y) => x - y);
      const z = a.shift() + a.shift();
      cost += z;
      a.push(z);
    }
    const bits = st.codes.reduce((acc, x) => acc + x.f * x.code.length, 0);
    if (bits !== cost) return `bit totali ${bits}, attesi ${cost}`;
    for (const x of st.codes) for (const y of st.codes) if (x !== y && y.code.startsWith(x.code)) return `il codice ${x.code} è prefisso di ${y.code}`;
    return null;
  }

  /* Vista di Huffman: la coda con priorità sopra, la foresta sotto (TreeView 'tidy'),
     i bit 0/1 scritti sugli archi e, alla fine, la tabella dei codici. */
  class HuffmanView {
    constructor(host) {
      this.root = h('div.tc-hf');
      this.q = h('div.tc-hf-q');
      this.treeHost = h('div.tc-hf-tree');
      this.codes = h('div.tc-hf-codes', { hidden: true });
      this.root.append(this.q, this.treeHost, this.codes);
      host.append(this.root);
      this.tree = new ASD.viz.TreeView(this.treeHost, { layout: 'tidy', shape: 'circle', r: 17, gap: 12, pad: 14, levelH: 58, ariaLabel: 'Foresta di Huffman' });
      this.bits = s('g', { class: 'tc-hf-bits', 'aria-hidden': 'true' });
      this.tree.svg.append(this.bits);
    }

    reset() {
      this.tree.reset();
      this.bits.replaceChildren();
    }

    render(st) {
      this.tree.render({ roots: st.roots, nodes: st.nodes });
      this.bits.replaceChildren();
      for (const [k, ln] of this.tree.edgeEls) {
        const [p, c] = k.split('>');
        const nd = st.nodes[p];
        if (!nd) continue;
        const left = nd.kids[0] === c;
        const x1 = Number(ln.getAttribute('x1'));
        const y1 = Number(ln.getAttribute('y1'));
        const x2 = Number(ln.getAttribute('x2'));
        const y2 = Number(ln.getAttribute('y2'));
        const mx = (x1 + x2) / 2 + (left ? -9 : 9);
        const my = (y1 + y2) / 2 - 4;
        this.bits.append(s('text', { class: 'tc-hf-bit', x: mx.toFixed(1), y: my.toFixed(1) }, left ? '0' : '1'));
      }
      const items = (st.pq || []).map((x) => h('span.tc-hf-item' + (x.cls ? '.is-' + x.cls : ''), { text: x.text }));
      this.q.replaceChildren(h('span.tc-hf-q-title', { text: 'Coda con priorità:' }), ...(items.length ? items : [h('span.tc-hf-empty', { text: 'vuota' })]));
      if (st.codes) {
        this.codes.hidden = false;
        this.codes.innerHTML = table({
          head: ['Carattere', 'Frequenza', 'Codice', 'Bit'],
          rows: st.codes.map((x) => [x.c, String(x.f), `<code>${x.code}</code>`, `${x.f}·${x.code.length} = ${x.f * x.code.length}`]).concat([
            ['Totale', '', '', `<strong>${st.bits}</strong> (fissi: ${st.fixedBits})`],
          ]),
        });
      } else {
        this.codes.hidden = true;
        this.codes.replaceChildren();
      }
    }
  }
})();
