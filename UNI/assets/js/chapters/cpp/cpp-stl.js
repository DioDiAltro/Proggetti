/* ASD a quadretti — capitolo "La libreria standard (STL)": vector (e la sua
   crescita, con il costo ammortizzato di push_back), string, pair, stack,
   queue, deque, priority_queue, set, map, unordered_set, unordered_map, gli
   algoritmi di <algorithm>, gli iteratori e le tabelle dei costi.
   Strumenti: un vector fatto a mano che cresce passo per passo (memoria),
   un laboratorio con il costo totale di n push_back, il quiz "Quale contenitore?". */
(function () {
  'use strict';

  const { h, m, box, table } = ASD;
  const C = ASD.cpp;

  ASD.chapter({
    id: 'cpp-stl',
    title: 'La libreria standard (STL)',
    lead:
      'La STL (Standard Template Library) ti dà già pronte le strutture dati del corso: array dinamici, pile, code, code con priorità, insiemi e dizionari, più gli algoritmi per ordinare e cercare. All\'esame devi saperle usare e, soprattutto, conoscere il costo di ogni operazione.',
    minutes: 55,
    prereq: ['cpp-classi'],
    goals: [
      'usare <code>vector</code>, <code>string</code>, <code>pair</code>, <code>stack</code>, <code>queue</code>, <code>deque</code> e <code>priority_queue</code>',
      `scegliere tra <code>set</code>/<code>map</code> (alberi bilanciati, ${m('Θ(log n)')}) e <code>unordered_set</code>/<code>unordered_map</code> (hash, ${m('Θ(1)')} in media)`,
      `spiegare perché <code>push_back</code> costa ${m('Θ(1)')} ammortizzato anche se a volte copia tutto il vettore`,
      'usare <code>sort</code>, <code>binary_search</code>, <code>lower_bound</code> e gli altri algoritmi sugli intervalli di iteratori',
      'ricordare la tabella dei costi di ogni contenitore',
    ],

    render(el) {
      el.innerHTML = `
<section id="vector">
  <h2>vector: l'array che cresce</h2>
  <p><code>vector&lt;T&gt;</code> (header <code>&lt;vector&gt;</code>) è un array di elementi di tipo <code>T</code> che
  si allunga da solo. Tiene gli elementi uno dopo l'altro sullo heap, conosce la sua lunghezza e libera la memoria
  quando sparisce. È il contenitore da usare quando non hai un motivo per sceglierne un altro.</p>
  <div data-mount="vector"></div>
  ${C.out(`size 5, v[0] = 10, v.back() = 50
zeri.size() = 4, w.at(2) = 8
w.at(10): indice fuori dai limiti (con w[10] nessun avviso)
10 20 30 40 50
10 20 30 40 50
10 20 30 40 50
0 10 30 40
righe 3, colonne 4, m[1][2] = 7`)}
  <ul>
    <li><code>v[i]</code> non controlla l'indice (un indice sbagliato è comportamento indefinito); <code>v.at(i)</code>
    lo controlla e lancia un'eccezione.</li>
    <li><code>v.begin()</code> e <code>v.end()</code> sono <strong>iteratori</strong>: <code>begin</code> indica il primo
    elemento, <code>end</code> la posizione <em>dopo</em> l'ultimo, come <code>a + n</code> per un array C. Con
    <code>*it</code> si legge l'elemento, con <code>++it</code> si avanza, e <code>it - v.begin()</code> è l'indice.</li>
    <li><code>insert</code> ed <code>erase</code> in mezzo (o in testa) costano ${m('Θ(n)')}: tutti gli elementi dopo la
    posizione vanno spostati di un posto.</li>
    <li>Una matrice è un vector di vector: <code>vector&lt;vector&lt;int&gt;&gt; m(r, vector&lt;int&gt;(c, 0))</code>.</li>
  </ul>
  ${box('errore', `<p><code>v.size()</code> restituisce un <code>size_t</code>, che è senza segno. Se <code>v</code> è vuoto,
  <code>v.size() - 1</code> non vale −1 ma 18446744073709551615, e il ciclo
  <code>for (int i = 0; i &lt; v.size() - 1; i++)</code> legge fuori dal vettore. Scrivi la condizione senza sottrazioni,
  <code>i + 1 &lt; v.size()</code>, oppure converti prima: <code>(int)v.size() - 1</code>. Il confronto tra
  <code>int</code> e <code>size_t</code> è anche l'avviso <code>-Wsign-compare</code> che vedi spesso.</p>`)}
</section>

<section id="capacita">
  <h2>size, capacity e push_back ammortizzato</h2>
  <p>Un vector ha due numeri: <code>size()</code>, quanti elementi contiene, e <code>capacity()</code>, quanti ne
  possono stare nell'array che ha già allocato. Finché c'è posto, <code>push_back</code> scrive l'elemento e basta.
  Quando l'array è pieno ne alloca uno <strong>più grande di un fattore costante</strong> (g++ lo raddoppia, Visual
  Studio lo moltiplica per 1,5), ci copia gli elementi e libera il vecchio. Per vederlo bene, ecco un vector scritto a
  mano con i puntatori:</p>
  <div data-mount="vettore"></div>
  <h3>Perché in media costa Θ(1)</h3>
  <p>Una singola <code>push_back</code> può costare ${m('Θ(n)')}, quando copia tutto. Ma succede sempre più di rado:
  le copie avvengono quando la capacità è 1, 2, 4, 8, …, cioè dopo un numero di elementi che raddoppia ogni volta. Per
  <var>n</var> push_back, contando una scrittura per ogni inserimento e una per ogni copia:</p>
  <p class="formula">${m('costo totale = n + (1 + 2 + 4 + … + 2^{k}) < n + 2n = 3n')}</p>
  <p>dove ${m('2^{k} < n')} è l'ultima capacità piena, e la somma della serie geometrica è ${m('2^{k+1} - 1 < 2n')}.
  Diviso per le <var>n</var> operazioni fa meno di 3 per <code>push_back</code>: si dice che il costo
  <strong>ammortizzato</strong> è ${m('Θ(1)')}. Prova a cambiare strategia: con una crescita di un fattore costante (×2 o
  ×1,5) il totale resta lineare; con una crescita di un numero fisso di posti (+10) diventa quadratico.</p>
  <p>Nel grafico la curva <strong>totale</strong> è il costo delle prime <var>n</var> push_back messe insieme; la curva
  <strong>singola</strong> è il costo della push_back numero <var>n</var>: quasi sempre 1, con un picco a ogni
  riallocazione.</p>
  <div data-mount="ammortizzato"></div>
  <p>Il programma completo fa 1000 push_back sul vector fatto a mano e conta le copie; poi stampa le capacità del
  <code>std::vector</code> vero di g++:</p>
  <div data-mount="vettoreCodice"></div>
  ${C.out(`push_back n. 1: capacity 0 -> 1, copiati 0
push_back n. 2: capacity 1 -> 2, copiati 1
push_back n. 3: capacity 2 -> 4, copiati 2
push_back n. 5: capacity 4 -> 8, copiati 4
push_back n. 9: capacity 8 -> 16, copiati 8
push_back n. 17: capacity 16 -> 32, copiati 16
push_back n. 33: capacity 32 -> 64, copiati 32
dopo 1000 push_back: capacity 1024, copie 1023, costo totale 2023 <= 3n = 3000
std::vector, capacity: 1 2 4 8 16 32 64 128`)}
  ${box('esame', `<p>Il <strong>costo ammortizzato</strong> è il costo medio di un'operazione su una sequenza di operazioni
  nel caso peggiore: non è una media su input casuali. Per <code>push_back</code>: ${m('Θ(n)')} nel caso peggiore per
  la singola chiamata, ${m('Θ(1)')} ammortizzato. Se sai in anticipo quanti elementi arriveranno, <code>v.reserve(n)</code>
  alloca subito lo spazio e non ci sono riallocazioni.</p>`)}
  ${box('errore', `<p>Una riallocazione sposta tutti gli elementi in un array nuovo: puntatori, riferimenti e iteratori agli
  elementi presi <em>prima</em> della <code>push_back</code> puntano al vecchio array, che è stato liberato. Dopo
  <code>int&amp; r = v[0]; v.push_back(7);</code> usare <code>r</code> è comportamento indefinito.</p>`)}
</section>

<section id="string-pair">
  <h2>string e pair</h2>
  <p><code>string</code> (header <code>&lt;string&gt;</code>) è, in pratica, un <code>vector&lt;char&gt;</code> con
  qualche operazione in più:</p>
  ${table({
    head: ['Operazione', 'Che cosa fa', 'Costo'],
    rows: [
      ['<code>s.size()</code>, <code>s[i]</code>', 'lunghezza, carattere in posizione <var>i</var>', m('Θ(1)')],
      ['<code>s += c</code>, <code>s.push_back(c)</code>', 'aggiunge un carattere in fondo', m('Θ(1)') + ' ammortizzato'],
      ['<code>s + t</code>', 'una stringa nuova con le due unite', m('Θ(|s| + |t|)')],
      ['<code>s.substr(i, k)</code>', 'i <var>k</var> caratteri da <var>i</var> in poi (una copia)', m('Θ(k)')],
      ['<code>s == t</code>, <code>s &lt; t</code>', 'confronto in ordine alfabetico (lessicografico)', 'fino alla prima differenza, al più ' + m('Θ(min(|s|, |t|))')],
      ['<code>s.find(t)</code>', 'posizione della prima occorrenza, o <code>string::npos</code>', 'in pratica lineare; al peggio ' + m('Θ(|s| * |t|)')],
    ],
  })}
  <p><code>pair&lt;A, B&gt;</code> (header <code>&lt;utility&gt;</code>) tiene due valori, <code>first</code> e
  <code>second</code>. Le coppie si confrontano in ordine lessicografico: prima <code>first</code>, a parità
  <code>second</code>. Per questo un <code>vector</code> di coppie si ordina con <code>sort</code> senza scrivere
  niente, e una coppia (distanza, nodo) è il modo standard di mettere dei nodi in una coda con priorità.</p>
  <div data-mount="pair"></div>
  ${C.out(`pair: 3 tre
1z 2a 2b`)}
</section>

<section id="adattatori">
  <h2>Pile, code e code con priorità</h2>
  <p><code>stack</code>, <code>queue</code> e <code>priority_queue</code> sono <strong>adattatori</strong>: usano un
  altro contenitore e ne mostrano solo le operazioni ammesse. Le strutture le studi in ${ASD.link('pile-code')} e
  ${ASD.link('heap')}; qui c'è come si usano.</p>
  ${table({
    head: ['Contenitore', 'Politica', 'Operazioni', 'Header'],
    rows: [
      ['<code>stack&lt;T&gt;</code>', 'LIFO: esce l\'ultimo entrato', '<code>push</code>, <code>pop</code>, <code>top</code>, <code>empty</code>, <code>size</code>', '<code>&lt;stack&gt;</code>'],
      ['<code>queue&lt;T&gt;</code>', 'FIFO: esce il primo entrato', '<code>push</code> (in fondo), <code>pop</code> (in testa), <code>front</code>, <code>back</code>, <code>empty</code>', '<code>&lt;queue&gt;</code>'],
      ['<code>deque&lt;T&gt;</code>', 'coda a due estremità con indice', '<code>push_front</code>, <code>push_back</code>, <code>pop_front</code>, <code>pop_back</code>, <code>d[i]</code>', '<code>&lt;deque&gt;</code>'],
      ['<code>priority_queue&lt;T&gt;</code>', 'esce il più grande (max-heap)', '<code>push</code>, <code>pop</code>, <code>top</code>, <code>empty</code>', '<code>&lt;queue&gt;</code>'],
    ],
  })}
  <div data-mount="pile"></div>
  ${C.out(`stack: 3 2 1
queue: 1 2 3
deque: 1 ... 4, d[1] = 2
priority_queue (max): 8 5 3 1
priority_queue (min): 1 3 5 8`)}
  ${box('ricorda', `<p><code>priority_queue&lt;int&gt;</code> tiene in cima il <strong>massimo</strong>. Per avere in cima il
  minimo si cambia il comparatore: <code>priority_queue&lt;int, vector&lt;int&gt;, greater&lt;int&gt;&gt;</code>. Con le
  coppie, come in Dijkstra, si scrive <code>priority_queue&lt;pair&lt;int, int&gt;, vector&lt;pair&lt;int, int&gt;&gt;,
  greater&lt;pair&lt;int, int&gt;&gt;&gt;</code>, e in cima c'è la coppia con il <code>first</code> più piccolo.</p>`)}
  ${box('errore', `<p><code>pop()</code> toglie l'elemento ma non lo restituisce: <code>int x = s.pop();</code> non compila.
  Prima si legge con <code>top()</code> (o <code>front()</code> per la queue), poi si toglie con <code>pop()</code>. Su un
  contenitore vuoto, <code>top</code>, <code>front</code> e <code>pop</code> sono comportamento indefinito: controlla
  <code>empty()</code>.</p>`)}
</section>

<section id="associativi">
  <h2>Insiemi e dizionari</h2>
  <p>Un <code>set&lt;T&gt;</code> è un insieme: niente doppioni, e gli elementi sempre in ordine crescente. Una
  <code>map&lt;K, V&gt;</code> è un dizionario: associa a ogni chiave di tipo <code>K</code> un valore di tipo
  <code>V</code>, e tiene le chiavi in ordine. Dentro sono <strong>alberi binari di ricerca bilanciati</strong> (in g++,
  alberi rosso-neri): inserire, cancellare e cercare costano ${m('Θ(log n)')} (vedi ${ASD.link('bst')}).</p>
  <p>Le versioni <code>unordered_set</code> e <code>unordered_map</code> fanno le stesse cose con una <strong>tabella
  hash</strong> (vedi ${ASD.link('hash')}): ${m('Θ(1)')} in media, ma ${m('Θ(n)')} nel caso peggiore, e nessun ordine.
  <code>multiset</code> e <code>multimap</code> sono le versioni ordinate che ammettono chiavi ripetute.</p>
  <div data-mount="associativi"></div>
  ${C.out(`set: 1 3 4 5 8
count(8) = 1, count(2) = 0
minimo 1, massimo 8, primo >= 4: 4
cane:1 e:2 gatto:1 il:3 topo:1
lupo non c'è
elementi: 5, conta["lupo"] = 0, elementi: 6
Luca ha 23 anni, elementi: 3
doppioni: 3, distinti: 3`)}
  ${box('errore', `<p>Su una <code>map</code>, <code>m[k]</code> con una chiave che non c'è la <strong>inserisce</strong>, con
  il valore di default (0 per i numeri). È comodo per contare (<code>conta[w]++</code>), ma anche solo leggere
  <code>m[k]</code> aggiunge la chiave, come si vede nell'output. Per sapere se una chiave c'è usa
  <code>m.count(k)</code> o <code>m.find(k) != m.end()</code>.</p>`)}
  ${table({
    head: ['Ti serve…', 'Usa', 'Perché'],
    rows: [
      ['l\'ordine degli elementi, il minimo, il massimo, «il primo ≥ x»', '<code>set</code> / <code>map</code>', 'l\'albero tiene tutto in ordine: <code>begin()</code>, <code>rbegin()</code>, <code>lower_bound</code>'],
      ['solo inserire e cercare, il più velocemente possibile', '<code>unordered_set</code> / <code>unordered_map</code>', m('Θ(1)') + ' in media; l\'ordine di visita non è definito'],
      ['un costo garantito anche nel caso peggiore', '<code>set</code> / <code>map</code>', m('Θ(log n)') + ' sempre; la tabella hash al peggio è ' + m('Θ(n)')],
    ],
  })}
</section>

<section id="algoritmi">
  <h2>Gli algoritmi di &lt;algorithm&gt;</h2>
  <p>Gli algoritmi della STL lavorano su <strong>intervalli di iteratori</strong> <code>[first, last)</code>: il primo
  incluso, l'ultimo escluso. Per un vector intero si passa <code>v.begin(), v.end()</code>; per i primi <var>k</var>
  elementi <code>v.begin(), v.begin() + k</code>. Funzionano su qualunque contenitore, e anche sugli array C (con
  <code>a, a + n</code>).</p>
  <div data-mount="ordina"></div>
  <p><code>sort</code> ordina in ${m('Θ(n log n)')} (in g++ è un introsort: quicksort che passa a heapsort se la
  ricorsione va troppo in profondità). Con <code>greater&lt;int&gt;()</code> o una lambda come terzo argomento si cambia
  l'ordine. Su un intervallo <strong>ordinato</strong> si cerca in ${m('Θ(log n)')} con la ricerca binaria:</p>
  <div data-mount="cerca"></div>
  <ul>
    <li><code>binary_search</code> dice solo se l'elemento c'è.</li>
    <li><code>lower_bound(x)</code> restituisce un iteratore al primo elemento ${m('>= x')}: è la posizione in cui
    inserire <var>x</var> mantenendo l'ordine.</li>
    <li><code>upper_bound(x)</code> restituisce il primo elemento ${m('> x')}. La differenza
    <code>upper_bound - lower_bound</code> è il numero di copie di <var>x</var>.</li>
    <li>Se l'elemento cercato è più grande di tutti, il risultato è <code>v.end()</code>: controllalo prima di
    dereferenziarlo.</li>
  </ul>
  <div data-mount="minmax"></div>
  ${C.out(`2 2 4 7 8 9
9 8 7 4 2 2
2 2 4 7 8 9
binary_search(7) = 1, binary_search(5) = 0
lower_bound(2) in posizione 0, upper_bound(2) in posizione 2: i 2 sono 2
il 5 andrebbe inserito in posizione 3
min 2, max 9, somma 32
accumulate con 0:   -294967296
accumulate con 0LL: 4000000000
1b 1d 2a 2c`)}
  ${box('errore', `<p><code>accumulate</code> fa i conti nel tipo del valore iniziale. Con <code>0</code> (un
  <code>int</code>) la somma di due miliardi più due miliardi trabocca, e con g++ esce −294967296. Con valori grandi parti
  da <code>0LL</code>.</p>`)}
  <p><code>stable_sort</code> ordina come <code>sort</code> ma è <strong>stabile</strong>: gli elementi con la stessa
  chiave restano nell'ordine in cui erano (qui <code>1b</code> resta prima di <code>1d</code>, <code>2a</code> prima di
  <code>2c</code>). È un merge sort, vedi ${ASD.link('merge-sort')}.</p>
</section>

<section id="costi">
  <h2>La tabella dei costi</h2>
  <p>Questa è la parte del capitolo da sapere a memoria. <var>n</var> è il numero di elementi; «amm.» vuol dire
  ammortizzato; «—» vuol dire che l'operazione non esiste.</p>
  ${table({
    caption: 'Contenitori sequenziali e adattatori',
    head: ['Contenitore', 'Struttura', 'Accesso <code>[i]</code>', 'In fondo', 'In testa', 'In mezzo', 'Cercare un valore'],
    rows: [
      ['<code>vector</code>', 'array dinamico', m('Θ(1)'), m('Θ(1)') + ' amm.', m('Θ(n)'), m('Θ(n)'), m('Θ(n)') + '; ' + m('Θ(log n)') + ' se ordinato'],
      ['<code>deque</code>', 'blocchi di array', m('Θ(1)'), m('Θ(1)'), m('Θ(1)'), m('Θ(n)'), m('Θ(n)')],
      ['<code>list</code>', 'lista doppia', '— (' + m('Θ(i)') + ' per arrivarci)', m('Θ(1)'), m('Θ(1)'), m('Θ(1)') + ' con l\'iteratore', m('Θ(n)')],
      ['<code>stack</code>', 'adattatore (deque)', 'solo <code>top</code>: ' + m('Θ(1)'), '<code>push</code>, <code>pop</code>: ' + m('Θ(1)'), '—', '—', '—'],
      ['<code>queue</code>', 'adattatore (deque)', '<code>front</code>, <code>back</code>: ' + m('Θ(1)'), '<code>push</code>: ' + m('Θ(1)'), '<code>pop</code>: ' + m('Θ(1)'), '—', '—'],
      ['<code>priority_queue</code>', 'heap binario su vector', 'solo <code>top</code> (il massimo): ' + m('Θ(1)'), '<code>push</code>: ' + m('Θ(log n)'), '<code>pop</code>: ' + m('Θ(log n)'), '—', '—'],
    ],
  })}
  ${table({
    caption: 'Contenitori associativi',
    head: ['Contenitore', 'Struttura', 'Inserire', 'Cancellare', 'Cercare (<code>find</code>, <code>count</code>)', 'Minimo e massimo', 'Visita in ordine'],
    rows: [
      ['<code>set</code>, <code>map</code>', 'albero rosso-nero', m('Θ(log n)'), m('Θ(log n)'), m('Θ(log n)') + '; anche <code>lower_bound</code>', m('Θ(1)') + ': <code>begin()</code>, <code>rbegin()</code>', m('Θ(n)')],
      ['<code>unordered_set</code>, <code>unordered_map</code>', 'tabella hash', m('Θ(1)') + ' medio, ' + m('Θ(n)') + ' peggiore', m('Θ(1)') + ' medio, ' + m('Θ(n)') + ' peggiore', m('Θ(1)') + ' medio, ' + m('Θ(n)') + ' peggiore', m('Θ(n)'), '— (nessun ordine)'],
    ],
  })}
  ${table({
    caption: 'Algoritmi (su un intervallo di n elementi)',
    head: ['Algoritmo', 'Costo', 'Note'],
    rows: [
      ['<code>sort</code>', m('Θ(n log n)'), 'non stabile'],
      ['<code>stable_sort</code>', m('Θ(n log n)'), 'stabile; usa memoria in più (senza, ' + m('Θ(n log^{2} n)') + ')'],
      ['<code>binary_search</code>, <code>lower_bound</code>, <code>upper_bound</code>', m('Θ(log n)'), 'su un intervallo ordinato ad accesso diretto (vector, deque, array); su una <code>list</code> i passi diventano ' + m('Θ(n)') + ', e per set e map si usa il metodo <code>s.lower_bound(x)</code>'],
      ['<code>find</code>, <code>count</code>, <code>min_element</code>, <code>max_element</code>', m('Θ(n)'), 'una passata'],
      ['<code>reverse</code>, <code>accumulate</code>', m('Θ(n)'), '<code>accumulate</code> è in <code>&lt;numeric&gt;</code>'],
    ],
  })}
  ${box('ricorda', `<p>Le domande d'esame sul C++ e le strutture dati si riducono quasi sempre a questo: quale contenitore
  usare, e quanto costa un ciclo che ci fa sopra <var>n</var> operazioni. <var>n</var> inserimenti in un
  <code>set</code> costano ${m('Θ(n log n)')}; <var>n</var> inserimenti in testa a un <code>vector</code> costano
  ${m('Θ(n^2)')}; <var>n</var> <code>push_back</code> costano ${m('Θ(n)')} in tutto. <code>size()</code> ed
  <code>empty()</code> costano ${m('Θ(1)')} per tutti i contenitori.</p>`)}
</section>

<section id="quale">
  <h2>Quale contenitore?</h2>
  <p>Per ogni situazione scegli il contenitore più adatto. Non basta che funzioni: deve essere quello con il costo
  migliore per le operazioni che servono.</p>
  <div data-mount="quale"></div>
</section>

<section id="esame">
  <h2>All'esame</h2>
  <ol>
    <li><strong>Quanto costa questo frammento?</strong> Un ciclo di <var>n</var> giri che fa <code>insert</code> su un
    <code>set</code> costa ${m('Θ(n log n)')}; uno che fa <code>v.insert(v.begin(), x)</code> costa ${m('Θ(n^2)')}.</li>
    <li><strong>Che cosa stampa?</strong> Con <code>priority_queue</code> (in cima il massimo), <code>set</code>
    (ordinato, senza doppioni), <code>map</code> (le chiavi in ordine).</li>
    <li><strong>Scegli la struttura</strong> e motiva il costo, come nel quiz qui sopra.</li>
  </ol>
  ${box('esame', `<p>Se il testo dice «puoi usare la libreria standard», usala: scrivere a mano una pila o un heap fa perdere
  tempo e aggiunge errori. Ma devi saper dire che cosa c'è dentro (heap binario, albero bilanciato, tabella hash) e
  quanto costa, perché la domanda spesso è proprio quella.</p>`)}
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        vector: (host) => ASD.code(host, { src: 'cpp/stl_vector', maxHeight: 420 }),
        vettore: mountVettore,
        ammortizzato: mountAmmortizzato,
        vettoreCodice: (host) => ASD.code(host, { src: 'cpp/vettore_dinamico', maxHeight: 360 }),
        pair: (host) => ASD.code(host, { src: 'cpp/stl_contenitori', region: 'pair' }),
        pile: (host) => ASD.code(host, { src: 'cpp/stl_contenitori', maxHeight: 420 }),
        associativi: (host) => ASD.code(host, { src: 'cpp/stl_associativi', maxHeight: 420 }),
        ordina: (host) => ASD.code(host, { src: 'cpp/stl_algoritmi', region: 'ordina' }),
        cerca: (host) => ASD.code(host, { src: 'cpp/stl_algoritmi', region: 'cerca' }),
        minmax: (host) => ASD.code(host, { src: 'cpp/stl_algoritmi', region: 'minmax' }),
        quale: (host) =>
          ASD.quiz(
            host,
            [
              {
                q: 'Leggi un flusso di numeri e per ognuno devi dire subito se l\'hai già visto. L\'ordine non interessa.',
                options: ['<code>vector&lt;int&gt;</code>', '<code>set&lt;int&gt;</code>', '<code>unordered_set&lt;int&gt;</code>', '<code>priority_queue&lt;int&gt;</code>'],
                answer: 2,
                explain: `Serve solo «inserisci» e «c'è già?»: la tabella hash le fa in ${m('Θ(1)')} in media. Il <code>set</code>
                funziona ma costa ${m('Θ(log n)')} per operazione, e l'ordine che mantiene non serve. Con il <code>vector</code>
                ogni ricerca è ${m('Θ(n)')}, ${m('Θ(n^2)')} in tutto; la <code>priority_queue</code> non sa cercare.`,
              },
              {
                q: 'Simuli la coda di una stampante: i documenti escono nell\'ordine in cui sono arrivati.',
                options: ['<code>stack</code>', '<code>queue</code>', '<code>priority_queue</code>', '<code>set</code>'],
                answer: 1,
                explain: `Il primo arrivato è il primo servito: è una politica FIFO, cioè una <code>queue</code>
                (<code>push</code> in fondo, <code>pop</code> in testa, entrambe ${m('Θ(1)')}). La stessa struttura serve alla
                visita in ampiezza (BFS) di un grafo.`,
              },
              {
                q: 'Devi controllare se le parentesi di un\'espressione sono bilanciate: <code>( [ ] )</code> va bene, <code>( ]</code> no.',
                options: ['<code>stack&lt;char&gt;</code>', '<code>queue&lt;char&gt;</code>', '<code>map&lt;char, int&gt;</code>', '<code>vector&lt;char&gt;</code> ordinato'],
                answer: 0,
                explain: `Ogni parentesi chiusa deve corrispondere all'<em>ultima</em> aperta e non ancora chiusa: LIFO. Si
                mettono le aperte in una pila, e a ogni chiusa si controlla e si toglie la cima. Contare le parentesi con una
                <code>map</code> non basta: <code>( ] [ )</code> ha i conti giusti ma non è bilanciata.`,
              },
              {
                q: 'Ricevi dei lavori con una priorità e, mentre ne arrivano altri, devi prendere ogni volta quello con la priorità più alta.',
                options: ['<code>vector</code>, ordinato dopo ogni inserimento', '<code>queue</code>', '<code>priority_queue</code>', '<code>unordered_map</code>'],
                answer: 2,
                explain: `La <code>priority_queue</code> è un heap: inserisce ed estrae il massimo in ${m('Θ(log n)')}. Riordinare un
                vector a ogni inserimento costerebbe ${m('Θ(n log n)')} ogni volta (o ${m('Θ(n)')} con un inserimento ordinato).`,
              },
              {
                q: 'Conti quante volte compare ogni parola di un testo e alla fine stampi le parole in ordine alfabetico, con il loro conteggio.',
                options: ['<code>map&lt;string, int&gt;</code>', '<code>unordered_map&lt;string, int&gt;</code>', '<code>vector&lt;string&gt;</code>', '<code>set&lt;string&gt;</code>'],
                answer: 0,
                explain: `Serve associare un numero a ogni parola, e alla fine visitarle in ordine: la <code>map</code> tiene le
                chiavi ordinate, quindi basta un ciclo. Con la <code>unordered_map</code> conteresti più in fretta, ma poi
                dovresti copiare e ordinare. Il <code>set</code> non tiene i conteggi.`,
              },
              {
                q: 'Ti servono l\'accesso per indice e inserimenti e cancellazioni veloci sia in testa sia in fondo.',
                options: ['<code>vector</code>', '<code>deque</code>', '<code>list</code>', '<code>stack</code>'],
                answer: 1,
                explain: `La <code>deque</code> ha <code>d[i]</code> in ${m('Θ(1)')} e inserimenti e cancellazioni in
                ${m('Θ(1)')} a entrambe le estremità. Il <code>vector</code> in testa costa ${m('Θ(n)')}; la <code>list</code> non
                ha l'accesso per indice; la <code>stack</code> lavora solo da un lato.`,
              },
            ],
            { id: 'quale' }
          ),
        quiz: (host) =>
          ASD.quiz(host, [
            {
              q: 'Che cosa stampa?',
              code: `priority_queue<int> pq;
for (int x : {4, 9, 1, 7}) pq.push(x);
pq.pop();
cout << pq.top();`,
              options: ['<code>1</code>', '<code>4</code>', '<code>7</code>', '<code>9</code>'],
              answer: 2,
              explain: `La <code>priority_queue</code> di default tiene in cima il massimo: 9. <code>pop()</code> toglie il 9, e
              il nuovo massimo è 7.`,
            },
            {
              q: 'Che cosa stampa?',
              code: `map<string, int> m;
cout << m["ciao"] << ' ' << m.size();`,
              options: ['<code>0 0</code>', '<code>0 1</code>', 'Un errore in esecuzione', 'Non compila'],
              answer: 1,
              explain: `<code>m["ciao"]</code> con una chiave assente la inserisce con valore 0 e restituisce quello: la
              mappa ora ha un elemento. Dal C++17 i pezzi di una catena di <code>&lt;&lt;</code> si valutano da sinistra a destra,
              quindi <code>size()</code> si legge dopo l'inserimento. Per controllare senza inserire si usa <code>m.count("ciao")</code>.`,
            },
            {
              q: 'Con <code>vector&lt;int&gt; v = {1, 3, 3, 3, 5, 8};</code>, quanto valgono <code>lower_bound(v.begin(), v.end(), 3) - v.begin()</code> e <code>upper_bound(v.begin(), v.end(), 3) - v.begin()</code>?',
              options: ['1 e 3', '1 e 4', '2 e 4', '0 e 3'],
              answer: 1,
              explain: `<code>lower_bound</code> trova il primo elemento ${m('>= 3')}, in posizione 1; <code>upper_bound</code> il
              primo ${m('> 3')}, cioè il 5 in posizione 4. La differenza, 3, è il numero di 3 nel vettore.`,
            },
            {
              q: 'Quanto costa inserire <var>n</var> elementi, uno alla volta, in un <code>set</code> inizialmente vuoto?',
              options: [m('Θ(n)'), m('Θ(n log n)'), m('Θ(n^2)'), m('Θ(log n)')],
              answer: 1,
              explain: `Ogni inserimento in un albero bilanciato con al più <var>n</var> elementi costa ${m('Θ(log n)')}; per
              <var>n</var> inserimenti fa ${m('Θ(n log n)')}. È anche un modo di ordinare: alla fine il <code>set</code> si visita
              in ordine.`,
            },
            {
              q: `<code>push_back</code> a volte copia tutti gli elementi. Perché allora si dice che costa ${m('Θ(1)')} ammortizzato?`,
              options: [
                'Perché le copie avvengono in un\'altra parte della memoria e non si contano',
                'Perché la capacità cresce di un fattore costante: su n operazioni le copie sono in tutto meno di 2n',
                'Perché il compilatore elimina le copie',
                'Perché in media gli input sono casuali',
              ],
              answer: 1,
              explain: `Raddoppiando, le copie sono ${m('1 + 2 + 4 + … < 2n')}: sommate agli <var>n</var> inserimenti fanno
              meno di ${m('3n')}, cioè meno di 3 per operazione. Ammortizzato non vuol dire «in media sugli input»: è una
              garanzia sul totale di qualunque sequenza di operazioni.`,
            },
            {
              q: 'Qual è il costo di <code>find</code> su una <code>unordered_map</code> con <var>n</var> elementi nel caso <strong>peggiore</strong>?',
              options: [m('Θ(1)'), m('Θ(log n)'), m('Θ(n)'), m('Θ(n log n)')],
              answer: 2,
              explain: `Se tutte le chiavi finiscono nello stesso secchio della tabella hash, cercare vuol dire scorrere una lista di
              <var>n</var> elementi. In media, con una buona funzione hash, il costo è ${m('Θ(1)')}; se ti serve una garanzia sul
              caso peggiore, la <code>map</code> dà ${m('Θ(log n)')} sempre.`,
            },
          ]),
      });
      C.capitolo(el);
    },
  });

  /* --------------------------------------- il vector fatto a mano, passo per passo */

  /** Simula n push_back con il raddoppio: capacità finale e copie. */
  function simula(n) {
    let cap = 0;
    let copie = 0;
    let rialloc = 0;
    for (let i = 0; i < n; i++) {
      if (i === cap) {
        copie += i;
        rialloc++;
        cap = cap === 0 ? 1 : 2 * cap;
      }
    }
    return { cap, copie, rialloc };
  }

  function mountVettore(host) {
    ASD.stepper(host, {
      id: 'vettore',
      title: 'push_back passo per passo',
      code: { src: 'cpp/vettore_dinamico', region: 'vettore' },
      input: {
        value: 5,
        label: 'Quante push_back',
        parse: (s) => {
          const v = Number(String(s).trim());
          if (!Number.isInteger(v) || v < 1 || v > 16) throw new Error('Scrivi un intero da 1 a 16.');
          return v;
        },
        format: (v) => String(v),
        presets: [
          { label: '5', value: 5 },
          { label: '9', value: 9 },
          { label: '16', value: 16 },
        ],
      },
      view: C.vista({ legend: ['ptr', 'dangling', 'freed', 'hl', 'read'] }),
      trace: traceVettore,
      counters: [
        { key: 'inserimenti', label: 'inserimenti' },
        { key: 'copie', label: 'copie' },
        { key: 'riallocazioni', label: 'riallocazioni' },
      ],
      validate: (k, frames) => {
        const last = frames[frames.length - 1];
        const want = simula(k);
        const heap = last.state.heap || [];
        if (heap.length !== 1 || heap[0].freed) return 'alla fine deve restare un solo array, non liberato';
        const cells = heap[0].cells;
        if (cells.length !== want.cap) return `capacità ${cells.length} invece di ${want.cap}`;
        for (let i = 0; i < k; i++) if (cells[i] !== 10 * (i + 1)) return `dati[${i}] = ${cells[i]} invece di ${10 * (i + 1)}`;
        if (last.count.copie !== want.copie) return `${last.count.copie} copie invece di ${want.copie}`;
        return null;
      },
    });
  }

  function traceVettore(k) {
    const t = new ASD.Tracer(['inserimenti', 'copie', 'riallocazioni']);
    const M = new C.Memoria();
    const costo = () => ({ 'costo totale': t.c.inserimenti + t.c.copie, '3n': 3 * k });
    M.call('main', 'main()');
    M.decl({
      id: 'v',
      type: 'Vettore',
      name: 'v',
      fields: [
        { id: 'dati', type: 'int*', name: 'dati', ptr: null },
        { id: 'n', type: 'int', name: 'n', value: 0 },
        { id: 'cap', type: 'int', name: 'cap', value: 0 },
      ],
    });
    let n = 0;
    let cap = 0;
    let blocco = null;
    let blocchi = 0;
    const valori = [];
    for (let j = 1; j <= k; j++) {
      const x = 10 * j;
      M.note('aspetta push_back');
      M.call('pb', 'v.push_back(x)');
      M.decl({ id: 'this', type: 'Vettore*', name: 'this', ptr: 'main.v' });
      M.decl({ id: 'x', type: 'int', name: 'x', value: x });
      M.read('main.v.n', 'main.v.cap');
      const pieno = n === cap;
      t.step(
        'pieno',
        `<code>main</code> chiama <code>v.push_back(${x})</code>. <code>n = ${n}</code> e <code>cap = ${cap}</code>: ${pieno ? (cap === 0 ? 'il vettore non ha ancora un array.' : '<strong>l\'array è pieno</strong>, bisogna fare spazio.') : 'c\'è ancora posto, nessuna copia.'}`,
        costo(),
        M.snap()
      );
      let copiati = 0;
      if (pieno) {
        const nuovaCap = cap === 0 ? 1 : 2 * cap;
        M.group('se', 'blocco if');
        M.decl({ id: 'nuovaCap', type: 'int', name: 'nuovaCap', value: nuovaCap }, null, 'se');
        t.step('nuovacap', cap === 0 ? 'Prima allocazione: si parte da 1 posto.' : `Il nuovo array sarà grande il doppio: <code>nuovaCap = ${nuovaCap}</code>.`, costo(), M.snap());
        const id = 'h' + ++blocchi;
        t.count('riallocazioni');
        M.alloc({ id, label: `new int[${nuovaCap}]`, cells: new Array(nuovaCap).fill(null) });
        M.decl({ id: 'nuovi', type: 'int*', name: 'nuovi', ptr: id + '[0]' }, null, 'se');
        t.step('alloca', `<code>new int[${nuovaCap}]</code>: sullo heap un array nuovo di ${nuovaCap} posti, ancora vuoti. <code>nuovi</code> punta al primo.`, costo(), M.snap());
        M.group('ciclo', 'ciclo for', 'pb', 'se');
        for (let i = 0; i <= n; i++) {
          if (i === 0) M.decl({ id: 'i', type: 'int', name: 'i', value: 0 }, null, 'ciclo');
          else M.set('pb.i', i);
          if (i === n) {
            t.step('ciclo', n === 0 ? '<code>n = 0</code>: non c\'è niente da copiare.' : `<code>i = ${i} = n</code>: copiati tutti e ${n} gli elementi.`, costo(), M.snap());
            break;
          }
          t.step('ciclo', `<code>i = ${i} &lt; n = ${n}</code>: c'è un elemento da copiare.`, costo(), M.snap());
          M.read(`${blocco}[${i}]`);
          M.set(`${id}[${i}]`, valori[i]);
          t.count('copie');
          copiati++;
          t.step('copia', `<code>nuovi[${i}] = dati[${i}]</code> = ${valori[i]}.`, costo(), M.snap());
        }
        M.ungroup('ciclo', 'pb');
        if (blocco) {
          M.free(blocco, 'liberato (delete[])');
          t.step('libera', '<code>delete[] dati</code>: il vecchio array torna al sistema. Per un istante <code>dati</code> è un puntatore pendente.', costo(), M.snap());
        } else {
          t.step('libera', '<code>delete[] dati</code> con <code>dati == nullptr</code> non fa niente: è la prima allocazione.', costo(), M.snap());
        }
        const vecchio = blocco;
        blocco = id;
        M.read('pb.nuovi');
        M.set('main.v.dati', { ptr: id + '[0]' });
        if (vecchio) M.discard(vecchio);
        t.step('sposta', '<code>dati = nuovi</code>: ora l\'oggetto usa l\'array nuovo.', costo(), M.snap());
        cap = nuovaCap;
        M.set('main.v.cap', cap);
        t.step('cap', `<code>cap = ${cap}</code>. Alla fine del blocco <code>if</code>, <code>nuovaCap</code> e <code>nuovi</code> spariscono; l'array resta, puntato da <code>dati</code>.`, costo(), M.snap());
        M.ungroup('se');
      }
      valori[n] = x;
      M.read('main.v.n');
      M.set(`${blocco}[${n}]`, x);
      t.count('inserimenti');
      t.step('scrivi', `<code>dati[${n}] = ${x}</code>: l'elemento va nel primo posto libero.`, costo(), M.snap());
      n++;
      M.set('main.v.n', n);
      M.state('out');
      t.step(
        'inc',
        `<code>n++</code>: ora <code>n = ${n}</code>. Questa push_back è costata ${1 + copiati} ${1 + copiati === 1 ? 'scrittura' : `scritture (1 inserimento + ${copiati} ${copiati === 1 ? 'copia' : 'copie'})`}.`,
        costo(),
        M.snap()
      );
      M.ret();
      M.note(null);
    }
    const tot = t.c.inserimenti + t.c.copie;
    t.step(
      null,
      `Fatto: ${k} push_back, ${t.c.copie} copie in ${t.c.riallocazioni} riallocazioni. Costo totale ${k} + ${t.c.copie} = <b>${tot}</b>, meno di ${m('3n')} = ${3 * k}.`,
      costo(),
      M.snap()
    );
    return t.frames;
  }

  /* ------------------------------------------------ laboratorio: costo totale */

  const STRATEGIE = [
    { id: 'x2', label: 'raddoppio (×2, g++)', cresci: (c) => (c === 0 ? 1 : 2 * c) },
    { id: 'x15', label: '×1,5 (Visual Studio)', cresci: (c) => Math.max(c + Math.floor(c / 2), c + 1) },
    { id: 'p10', label: '+10 posti', cresci: (c) => c + 10 },
  ];

  /** Per ogni n da 1 a N: costo della n-esima push_back e costo totale. */
  function costi(strategia, N) {
    const singola = [0];
    const totale = [0];
    let cap = 0;
    let maxCopie = 0;
    for (let n = 1; n <= N; n++) {
      let c = 1;
      if (n - 1 === cap) {
        c += n - 1;
        maxCopie = Math.max(maxCopie, n - 1);
        cap = strategia.cresci(cap);
      }
      singola.push(c);
      totale.push(totale[n - 1] + c);
    }
    return { singola, totale, maxCopie };
  }

  function mountAmmortizzato(host) {
    const lab = h('div.lab');
    const body = h('div.lab-body');
    const controls = h('div.lab-controls');
    const out = h('div.lab-out', { 'aria-live': 'polite' });
    lab.append(h('div.lab-head', h('h3', { text: 'Il costo totale di n push_back' })), body, controls, out);
    host.append(lab);

    const base = ASD.uid('crescita');
    const scelta = h('fieldset.cpp-scelta', h('legend', 'Come cresce la capacità'));
    let strategia = STRATEGIE[0];
    for (const st of STRATEGIE) {
      const id = base + '-' + st.id;
      const input = h('input.visually-hidden', { type: 'radio', name: base, id, value: st.id, checked: st === strategia });
      input.addEventListener('change', () => {
        strategia = st;
        draw();
      });
      scelta.append(h('label.chip', { for: id }, input, st.label));
    }
    const nId = base + '-n';
    const nOut = h('output', { for: nId });
    const nInput = h('input', { type: 'range', id: nId, min: '16', max: '400', step: '8', value: '128', oninput: () => draw() });
    controls.append(scelta, h('label.slider', { for: nId }, h('span', 'numero di push_back n'), nInput, nOut));

    const plot = new ASD.viz.Plot(body, {
      x: { min: 1, max: 128, label: 'n', integer: true },
      y: { min: 0, label: 'operazioni' },
      height: 300,
      ariaLabel: 'Costo totale e costo della singola push_back in funzione di n, confrontati con 3n e n',
    });

    function draw() {
      const N = Number(nInput.value);
      nOut.textContent = String(N);
      const c = costi(strategia, N);
      plot.o.x.max = N;
      // un po' di spazio sopra la curva più alta: il titolo dell'asse non tocca l'ultima tacca
      plot.o.y.max = Math.max(3 * N, c.totale[N]) * 1.15;
      plot.set({
        series: [
          { id: 'tre', label: '3n', slot: 6, fn: (n) => 3 * n, dashed: true },
          { id: 'uno', label: 'n', slot: 7, fn: (n) => n, dashed: true },
          { id: 'tot', label: 'totale', slot: 1, fn: (n) => c.totale[Math.round(n)] },
          { id: 'sing', label: 'singola', slot: 2, fn: (n) => c.singola[Math.round(n)] },
        ],
      });
      const tot = c.totale[N];
      const copie = tot - N;
      const media = ASD.fmt(Math.round((tot / N) * 100) / 100);
      out.innerHTML =
        `<p style="margin:0">Con <var>n</var> = ${N} e <strong>${strategia.label}</strong>: ${N} inserimenti + ${copie} copie = ` +
        `<strong>${tot}</strong> operazioni, cioè <strong>${media}</strong> per push_back` +
        (tot <= 3 * N ? `, sotto ${m('3n')} = ${3 * N}` : `, oltre ${m('3n')} = ${3 * N}`) +
        `. La riallocazione più cara ha copiato ${c.maxCopie} elementi.` +
        (strategia.id === 'p10'
          ? ' Con una crescita fissa le riallocazioni sono circa <var>n</var>/10 e le copie crescono come ' + m('n^2/20') + ': il costo ammortizzato diventa ' + m('Θ(n)') + '.'
          : strategia.id === 'x15'
            ? ' Con il fattore 1,5 le copie restano sotto ' + m('3n') + ' (la serie geometrica di ragione 2/3 somma al più a 3 volte l\'ultima capacità), quindi il totale sta sotto ' + m('4n') + ': sempre lineare, con una costante più alta.'
            : '') +
        `</p>`;
    }
    draw();
  }
})();
