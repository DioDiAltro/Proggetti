/* ASD a quadretti — capitolo "Problemi classici di PD".
   Zaino 0/1 (tabella n × W, dipendenze, ricostruzione, pseudo-polinomialità),
   sottosequenza comune più lunga (tabella con le frecce ↖ ↑ ←), distanza di
   edit, come riconoscere un problema di PD e come scriverne la soluzione. */
(function () {
  'use strict';

  const { m, box, table } = ASD;
  const T = ASD.tecniche;

  ASD.chapter({
    id: 'dp-problemi',
    title: 'Problemi classici di PD',
    lead:
      'Zaino 0/1, sottosequenza comune più lunga e distanza di edit: i problemi di programmazione dinamica che tornano più spesso negli appelli. Per ognuno trovi il sottoproblema, la ricorrenza, la tabella riempita passo per passo sul codice C++ e la ricostruzione della soluzione.',
    minutes: 55,
    prereq: ['dp'],
    goals: [
      'riempire a mano la tabella dello zaino 0/1 e ricostruire gli oggetti scelti',
      `spiegare perché ${m('Θ(n\u2009W)')} è un costo pseudo-polinomiale`,
      'calcolare la sottosequenza comune più lunga (LCS) con la tabella e le frecce ↖ ↑ ←',
      'calcolare la distanza di edit tra due parole e leggerne le operazioni',
      'riconoscere un problema di PD all\'esame e scriverne la soluzione: prima la ricorrenza, poi la tabella',
    ],

    render(el) {
      el.innerHTML = `
<section id="zaino">
  <h2>Zaino 0/1</h2>
  <p>Hai <var>n</var> oggetti: l'oggetto <var>i</var> pesa ${m('p_i')} e vale ${m('v_i')}, con pesi interi. Lo zaino
  regge al massimo <var>W</var>. Devi scegliere gli oggetti in modo che il peso totale non superi <var>W</var> e il valore
  totale sia il massimo possibile; ogni oggetto si prende intero, al massimo una volta. Il
  ${ASD.link('greedy', 'zaino', 'greedy per valore/peso')} qui sbaglia, e provare tutti i ${m('2^n')} sottoinsiemi è
  esponenziale.</p>

  <h3>Sottoproblema e ricorrenza</h3>
  <p><strong>Sottoproblema</strong>: ${m('K[i][w]')} = il valore massimo che si ottiene usando solo i primi <var>i</var>
  oggetti con uno zaino di capacità <var>w</var>, per ${m('0 <= i <= n')} e ${m('0 <= w <= W')}. La risposta è
  ${m('K[n][W]')}.</p>
  <p><strong>Ricorrenza</strong>: guarda l'ultimo oggetto, l'<var>i</var>-esimo. O non lo prendi, e il meglio è quello
  che fanno i primi ${m('i - 1')} oggetti con la stessa capacità; oppure lo prendi, se ci sta, e lo spazio che resta,
  ${m('w - p_i')}, lo riempiono al meglio i primi ${m('i - 1')} oggetti.</p>
  <p class="formula">${m('K[0][w] = 0')}</p>
  <p class="formula">${m('K[i][w] = K[i-1][w]')} &nbsp; se ${m('p_i > w')}</p>
  <p class="formula">${m('K[i][w] = max(K[i-1][w], K[i-1][w - p_i] + v_i)')} &nbsp; altrimenti</p>
  <p><strong>Ordine</strong>: riga per riga, perché la riga <var>i</var> legge solo la riga ${m('i - 1')}: la casella
  sopra (non prendo l'oggetto) e quella sopra spostata a sinistra di ${m('p_i')} (lo prendo). Nella visualizzazione sono
  le due caselle gialle.</p>
  <div data-mount="zaino"></div>
  <p>Puoi scrivere i tuoi oggetti come <code>peso:valore</code>, poi un punto e virgola e la capacità.</p>

  <h3>Ricostruire gli oggetti scelti</h3>
  <p>La tabella dice quanto vale lo zaino migliore, non cosa contiene. Si parte da ${m('K[n][W]')} e si sale una riga
  alla volta: se ${m('K[i][w] != K[i-1][w]')}, il valore è cambiato aggiungendo l'oggetto <var>i</var>, che quindi è
  nello zaino, e si continua dalla colonna ${m('w - p_i')}; se invece sono uguali, l'oggetto <var>i</var> non serve e
  <var>w</var> resta com'è. Nell'esempio: ${m('K[4][7] = K[3][7] = 9')}, il 4 non serve; ${m('K[3][7] = 9 != K[2][7] = 5')},
  il 3 c'è e resta ${m('w = 3')}; ${m('K[2][3] = 4 != K[1][3] = 1')}, il 2 c'è e resta ${m('w = 0')};
  ${m('K[1][0] = K[0][0]')}, l'1 no. Oggetti 2 e 3: peso 7, valore 9.</p>
  <pre class="code-out" tabindex="0"><code>Tabella K[i][w]:
  0  0  0  0  0  0  0  0
  0  1  1  1  1  1  1  1
  0  1  1  4  5  5  5  5
  0  1  1  4  5  6  6  9
  0  1  1  4  5  7  8  9
Valore massimo: 9
Oggetti scelti:  3 (peso 4, valore 5)  2 (peso 3, valore 4)</code></pre>
  ${box('errore', `<p>La riga <var>i</var> della tabella parla dell'oggetto <var>i</var> contando da 1, che nei
  <code>vector</code> sta in posizione <code>i - 1</code>: per questo il codice legge <code>peso[i - 1]</code>. La riga 0
  in più è il caso base, "nessun oggetto". Mescolare le due numerazioni è l'errore più frequente, sia nel codice sia
  nella tabella scritta a mano.</p>`)}

  <h3>Quanto costa, e perché si dice pseudo-polinomiale</h3>
  <p>La tabella ha ${m('(n+1)(W+1)')} caselle e ognuna costa ${m('O(1)')}: tempo e spazio ${m('Θ(n\u2009W)')}; la ricostruzione
  aggiunge ${m('Θ(n)')}.</p>
  <p>${m('Θ(n\u2009W)')} sembra polinomiale, ma non lo è rispetto alla dimensione dell'input. L'input contiene <var>n</var>
  coppie di numeri e il numero <var>W</var>, che scritto in binario occupa circa ${m('log_2 W')} bit. Il tempo invece
  cresce con il <em>valore</em> di <var>W</var>: una cifra binaria in più in <var>W</var> raddoppia le colonne della
  tabella, e con ${m('W = 10^9')} servirebbe un miliardo di colonne. Un costo polinomiale nel valore dei numeri ma
  esponenziale nella loro lunghezza si chiama <strong>pseudo-polinomiale</strong>. Non è un difetto di questo
  algoritmo: lo zaino 0/1 è NP-difficile, e per nessun problema NP-difficile si conosce un algoritmo polinomiale.</p>

  <h3>Una riga sola</h3>
  <p>Se serve solo il valore, basta un array di ${m('W + 1')} caselle: la riga <var>i</var> sovrascrive la riga
  ${m('i - 1')}. Però <var>w</var> deve scendere <strong>da destra a sinistra</strong>, così ${m('K[w - p_i]')} contiene
  ancora il valore della riga precedente.</p>
  <div data-mount="riga"></div>
  <p>Lo spazio scende a ${m('Θ(W)')}, il tempo resta ${m('Θ(n\u2009W)')}. Andando da sinistra a destra, ${m('K[w - p_i]')}
  sarebbe già aggiornato con l'oggetto <var>i</var> e lo stesso oggetto potrebbe entrare più volte: si risolverebbe un
  altro problema, lo zaino con ripetizioni. Senza la tabella intera, inoltre, gli oggetti scelti non si ricostruiscono più.</p>
</section>

<section id="lcs">
  <h2>Sottosequenza comune più lunga</h2>
  <p>Una <strong>sottosequenza</strong> di una stringa si ottiene cancellando alcuni caratteri, anche non vicini, senza
  cambiare l'ordine degli altri: ACD è una sottosequenza di ABCD. Date due stringhe X e Y, una <strong>sottosequenza
  comune più lunga</strong> (<i>longest common subsequence</i>, LCS) è una sottosequenza di entrambe con la lunghezza
  massima. Con X = ABCBDAB e Y = BDCABA la lunghezza è 4: BCBA, ma anche BDAB e BCAB. È l'idea dietro il comando
  <code>diff</code>, che confronta due file, e dietro il confronto di sequenze di DNA.</p>
  <p>Provare tutte le ${m('2^m')} sottosequenze di X è esponenziale. Con la PD, chiamando <var>m</var> e <var>n</var> le
  lunghezze di X e Y:</p>
  <ul>
    <li><strong>Sottoproblema</strong>: ${m('c[i][j]')} = lunghezza della LCS tra i primi <var>i</var> caratteri di X e i
    primi <var>j</var> di Y (in C++ ${m('X[0..i-1]')} e ${m('Y[0..j-1]')}). La risposta è ${m('c[m][n]')}.</li>
    <li><strong>Ricorrenza</strong>: guarda gli ultimi caratteri dei due prefissi, ${m('X[i-1]')} e ${m('Y[j-1]')}. Se
    sono uguali, quel carattere chiude una LCS e ${m('c[i][j] = c[i-1][j-1] + 1')}. Se sono diversi, almeno uno dei due
    non sta nella LCS: si prova a toglierli uno alla volta e si tiene il risultato migliore,
    ${m('c[i][j] = max(c[i-1][j], c[i][j-1])')}.</li>
    <li><strong>Casi base</strong>: ${m('c[i][0] = c[0][j] = 0')}, perché con un prefisso vuoto la LCS è vuota.</li>
    <li><strong>Ordine</strong>: riga per riga, da sinistra a destra. Ogni casella legge al più tre caselle già calcolate:
    in diagonale, sopra e a sinistra.</li>
  </ul>
  <p>Ogni casella ha anche una freccia che dice da dove viene il suo valore: ↖ se i caratteri sono uguali, ↑ se viene da
  sopra, ← se viene da sinistra. A pari merito si sceglie ↑, come nel Cormen.</p>
  <div data-mount="lcs"></div>

  <h3>Ricostruzione</h3>
  <p>Si parte da ${m('c[m][n]')} e si seguono le frecce: su una ↖ il carattere fa parte della LCS, su ↑ e ← si passa oltre.
  I caratteri escono dall'ultimo al primo, quindi alla fine la stringa va rovesciata. Il codice non salva le frecce: le
  ricava ogni volta dai caratteri e dalle due caselle vicine, con la stessa regola. Il cammino fa al più ${m('m + n')}
  passi: la ricostruzione costa ${m('O(m + n)')}, la tabella ${m('Θ(m\u2009n)')} in tempo e in spazio.</p>
  <pre class="code-out" tabindex="0"><code>X = ABCBDAB, Y = BDCABA
Lunghezza della LCS: 4
Una LCS: BCBA</code></pre>
  ${box('ricorda', `<p>Sottostringa e sottosequenza non sono la stessa cosa. Una sottostringa è fatta di caratteri
  consecutivi (BCB in ABCBDAB); una sottosequenza mantiene l'ordine ma può saltare caratteri (BBA in ABCBDAB). La LCS
  parla di sottosequenze, e di LCS ce ne possono essere più di una: la tabella dà la lunghezza, la ricostruzione ne trova
  una.</p>`)}
</section>

<section id="edit">
  <h2>Distanza di edit</h2>
  <p>Quante modifiche servono per trasformare una parola in un'altra? Le modifiche ammesse sono tre e ognuna costa 1:
  <strong>inserire</strong> un carattere, <strong>cancellare</strong> un carattere, <strong>sostituire</strong> un
  carattere con un altro. Il minimo numero di modifiche è la <strong>distanza di edit</strong> (o di Levenshtein): la
  usano i correttori ortografici per proporre la parola giusta. Tra PIANO e PANCA la distanza è 3.</p>
  <ul>
    <li><strong>Sottoproblema</strong>: ${m('d[i][j]')} = distanza tra i primi <var>i</var> caratteri di X e i primi
    <var>j</var> di Y.</li>
    <li><strong>Casi base</strong>: ${m('d[i][0] = i')} (si cancella tutto) e ${m('d[0][j] = j')} (si inserisce tutto).</li>
    <li><strong>Ricorrenza</strong>: l'ultima modifica è una di tre, e si prende la più conveniente.
    <p class="formula">${m('d[i][j] = min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + s)')}</p>
    Il primo termine cancella ${m('X[i-1]')}, il secondo inserisce ${m('Y[j-1]')}, il terzo fa diventare
    ${m('X[i-1]')} uguale a ${m('Y[j-1]')}: gratis se lo è già (${m('s = 0')}, si copia), con una sostituzione se sono
    diversi (${m('s = 1')}).</li>
    <li><strong>Ordine e costo</strong>: come per la LCS, riga per riga, in ${m('Θ(m\u2009n)')}.</li>
  </ul>
  <div data-mount="edit"></div>
  <p>La ricostruzione parte da ${m('d[m][n]')} e a ogni passo cerca da quale delle tre caselle viene il valore,
  preferendo la diagonale, poi la cancellazione. Il programma completo stampa le operazioni nell'ordine giusto:</p>
  <pre class="code-out" tabindex="0"><code>Distanza tra PIANO e PANCA: 3
  copio P
  cancello I
  copio A
  copio N
  inserisco C
  sostituisco O con A</code></pre>
  ${box('nota', `<p>LCS e distanza di edit sono parenti. Se si ammettono solo inserimenti e cancellazioni, senza
  sostituzioni, conviene tenere una LCS e cancellare o inserire tutto il resto: la distanza diventa
  ${m('m + n - 2L')}, con <var>L</var> la lunghezza della LCS.</p>`, 'Un legame utile')}
</section>

<section id="riconoscere">
  <h2>Riconoscere un problema di PD</h2>
  <p>All'esame il testo non dice "usa la programmazione dinamica". Questi indizi sì:</p>
  <ul>
    <li>si chiede un <strong>ottimo</strong> (massimo, minimo) o un <strong>conteggio</strong> ("in quanti modi") tra
    moltissime soluzioni possibili;</li>
    <li>la soluzione è una sequenza di <strong>scelte</strong> (prendo o lascio, quale moneta, quale carattere) e dopo ogni
    scelta resta lo stesso problema su un input più piccolo: un prefisso, una capacità minore, un importo minore;</li>
    <li>la ricorsione diretta ritrova gli stessi sottoproblemi per strade diverse;</li>
    <li>il greedy che viene in mente ha un controesempio.</li>
  </ul>
  <p>I sottoproblemi hanno quasi sempre uno di questi parametri:</p>
  ${table({
    head: ['Input', 'Sottoproblema tipico', 'Esempi'],
    rows: [
      ['una sequenza', `i primi <var>i</var> elementi: ${m('dp[i]')}`, 'Fibonacci, scale, sottosequenza crescente più lunga'],
      ['due sequenze', `una coppia di prefissi: ${m('dp[i][j]')}`, 'LCS, distanza di edit'],
      ['oggetti e una capacità', `primi <var>i</var> oggetti, capacità <var>w</var>: ${m('dp[i][w]')}`, 'zaino 0/1'],
      ['un importo', `un importo più piccolo: ${m('dp[x]')}`, 'resto minimo, modi di dare il resto'],
    ],
  })}
  <div class="tc-scheda quadretti">
    <h3>Esempio di soluzione scritta</h3>
    <p><em>Dato un array di interi positivi ${m('a[0..n-1]')}, trova la somma massima di elementi a due a due non
    adiacenti.</em></p>
    <ol>
      <li><strong>Sottoproblema.</strong> ${m('dp[i]')} = somma massima di elementi non adiacenti scelti tra i primi
      <var>i</var>, cioè in ${m('a[0..i-1]')}, per ${m('0 <= i <= n')}. La risposta è ${m('dp[n]')}.</li>
      <li><strong>Ricorrenza.</strong> ${m('dp[0] = 0')}, ${m('dp[1] = a[0]')} e, per ${m('i >= 2')},
      ${m('dp[i] = max(dp[i-1], dp[i-2] + a[i-1])')}: l'ultimo elemento o non si prende, oppure si prende e allora il
      penultimo no.</li>
      <li><strong>Ordine.</strong> <var>i</var> crescente: ${m('dp[i]')} legge solo ${m('dp[i-1]')} e ${m('dp[i-2]')}.</li>
      <li><strong>Tabella</strong> per ${m('a = [3, 2, 7, 10]')}: ${m('dp = 0, 3, 3, 10, 13')}. Risposta ${m('dp[4] = 13')}.</li>
      <li><strong>Ricostruzione.</strong> ${m('dp[4] = 13 != dp[3] = 10')}: preso ${m('a[3] = 10')}, si salta a
      ${m('i = 2')}; ${m('dp[2] = dp[1] = 3')}: ${m('a[1]')} no; ${m('dp[1] = 3 != dp[0]')}: preso ${m('a[0] = 3')}.
      Soluzione {3, 10}.</li>
      <li><strong>Costo.</strong> ${m('n + 1')} sottoproblemi da ${m('O(1)')}: tempo ${m('Θ(n)')}, spazio ${m('Θ(n)')}
      (${m('Θ(1)')} con due variabili, se serve solo il valore).</li>
    </ol>
  </div>
  ${box('esame', `<p>Ricorrenza prima, tabella dopo. Il sottoproblema va scritto a parole con gli intervalli degli indici,
  ogni caso della ricorrenza con una riga di giustificazione ("l'ultimo oggetto o lo prendo o no"), i casi base a parte.
  Poi la tabella con l'ordine di riempimento, la cella della risposta, la ricostruzione e il costo come numero di caselle
  per il lavoro di ognuna.</p>`)}
</section>

<section id="costi">
  <h2>Riepilogo dei costi</h2>
  ${table({
    caption: 'I problemi di programmazione dinamica di questa parte',
    head: ['Problema', 'Tabella', 'Tempo', 'Spazio'],
    rows: [
      ['Zaino 0/1 (n oggetti, capacità W)', m('K[i][w]'), `${m('Θ(n\u2009W)')}, pseudo-polinomiale`, `${m('Θ(n\u2009W)')}; ${m('Θ(W)')} con una riga`],
      ['LCS (lunghezze m e n)', m('c[i][j]'), m('Θ(m\u2009n)'), `${m('Θ(m\u2009n)')}; ${m('Θ(n)')} con due righe se basta la lunghezza`],
      ['Distanza di edit', m('d[i][j]'), m('Θ(m\u2009n)'), m('Θ(m\u2009n)')],
      ['Resto minimo (k tagli, importo R)', m('dp[x]'), `${m('Θ(k\u2009R)')}, pseudo-polinomiale`, m('Θ(R)')],
      ['Fibonacci', m('f[i]'), m('Θ(n)'), `${m('Θ(1)')} con due variabili`],
    ],
  })}
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        zaino: (host) =>
          ASD.stepper(host, {
            id: 'zaino',
            title: 'Zaino 0/1: la tabella passo per passo',
            code: { src: 'tecniche/zaino', region: 'pd' },
            input: {
              label: 'Oggetti (peso:valore) ; capacità',
              value: parseZaino('1:1, 3:4, 4:5, 5:7 ; 7'),
              parse: parseZaino,
              format: (v) => `${v.items.map((o) => `${o.p}:${o.v}`).join(', ')} ; ${v.W}`,
              presets: [
                { label: 'Esempio', value: () => parseZaino('1:1, 3:4, 4:5, 5:7 ; 7') },
                { label: 'Il greedy sbaglia', value: () => parseZaino('1:6, 2:10, 3:12 ; 5') },
                { label: 'Casuale', value: randomZaino },
              ],
            },
            view: (stage) => new ASD.viz.TableView(stage, { ariaLabel: 'Tabella K dello zaino 0/1' }),
            trace: traceZaino,
            counters: [{ key: 'celle', label: 'caselle calcolate' }],
            legend: [
              { k: 'active', label: 'K[i][w] in calcolo' },
              { k: 'compare', label: 'caselle che legge' },
              { k: 'key', label: 'oggetto in esame' },
              { k: 'done', label: 'ricostruzione' },
              { k: 'hole', label: 'da calcolare' },
            ],
            validate: validateZaino,
          }),
        riga: (host) =>
          ASD.code(host, {
            file: 'zaino_una_riga.cpp',
            code: `vector<int> K(W + 1, 0);                     // una riga sola: K[w]
for (int i = 0; i < n; i++)
    for (int w = W; w >= peso[i]; w--)       // da destra a sinistra
        K[w] = max(K[w], K[w - peso[i]] + valore[i]);`,
          }),
        lcs: (host) =>
          ASD.stepper(host, {
            id: 'lcs',
            title: 'LCS: la tabella e le frecce',
            code: { src: 'tecniche/lcs', region: 'pd' },
            input: {
              label: 'Le due stringhe X e Y',
              value: parseDue('ABCBDAB BDCABA'),
              parse: parseDue,
              format: (v) => `${v.X} ${v.Y}`,
              presets: [
                { label: 'Cormen', value: () => parseDue('ABCBDAB BDCABA') },
                { label: 'Casuale', value: () => randomDue('ABCD', 5, 7) },
                { label: 'Niente in comune', value: () => parseDue('ABC XYZ') },
              ],
            },
            view: (stage) => new ASD.viz.TableView(stage, { ariaLabel: 'Tabella c della LCS' }),
            trace: traceLCS,
            counters: [{ key: 'confronti', label: 'confronti tra caratteri' }],
            legend: [
              { k: 'active', label: 'casella in calcolo' },
              { k: 'compare', label: 'caselle che legge' },
              { k: 'done', label: 'ricostruzione' },
              { k: 'hole', label: 'da calcolare' },
            ],
            validate: validateLCS,
          }),
        edit: (host) =>
          ASD.stepper(host, {
            id: 'edit',
            title: 'Distanza di edit passo per passo',
            code: { src: 'tecniche/edit_distance', region: 'pd' },
            input: {
              label: 'Da X a Y',
              value: parseDue('PIANO PANCA'),
              parse: parseDue,
              format: (v) => `${v.X} ${v.Y}`,
              presets: [
                { label: 'PIANO → PANCA', value: () => parseDue('PIANO PANCA') },
                { label: 'KITTEN → SITTING', value: () => parseDue('KITTEN SITTING') },
                { label: 'Casuale', value: () => randomDue('ABCDE', 4, 6) },
              ],
            },
            view: (stage) => new ASD.viz.TableView(stage, { ariaLabel: 'Tabella d della distanza di edit' }),
            trace: traceEdit,
            counters: [{ key: 'celle', label: 'caselle calcolate' }],
            legend: [
              { k: 'active', label: 'casella in calcolo' },
              { k: 'compare', label: 'le tre caselle che legge' },
              { k: 'done', label: 'ricostruzione' },
              { k: 'hole', label: 'da calcolare' },
            ],
            validate: validateEdit,
          }),
        quiz: (host) =>
          ASD.quiz(host, [
            {
              q: `Nello zaino 0/1, se l'oggetto <var>i</var> ci sta (${m('p_i <= w')}), da quali caselle dipende ${m('K[i][w]')}?`,
              options: [
                `${m('K[i-1][w]')} e ${m('K[i-1][w - p_i]')}`,
                `${m('K[i][w-1]')} e ${m('K[i-1][w]')}`,
                `${m('K[i-1][w-1]')} soltanto`,
                `tutte le caselle della riga ${m('i - 1')}`,
              ],
              answer: 0,
              explain: `Non prendere l'oggetto dà ${m('K[i-1][w]')}; prenderlo dà ${m('K[i-1][w - p_i] + v_i')}. Sono due
              caselle della riga sopra: per questo basta riempire la tabella riga per riga, e ogni casella costa ${m('O(1)')}.`,
            },
            {
              q: `Perché il costo ${m('Θ(n\u2009W)')} dello zaino 0/1 si dice <strong>pseudo-polinomiale</strong>?`,
              options: [
                'Perché nel caso medio è più veloce',
                `Perché <var>W</var> è un valore: scritto in binario occupa circa ${m('log_2 W')} bit, e il tempo è esponenziale in quella lunghezza`,
                'Perché la tabella si può ridurre a una riga sola',
                'Perché la ricostruzione costa in più',
              ],
              answer: 1,
              explain: `La dimensione dell'input conta i bit: <var>W</var> ne occupa circa ${m('log_2 W')}, ma le colonne della
              tabella sono ${m('W + 1')}, cioè ${m('2^{log_2 W}')}. Polinomiale nel valore, esponenziale nella lunghezza.`,
            },
            {
              q: 'Quanto è lunga la LCS di X = ABCD e Y = ACBD?',
              options: ['2', '3', '4', '1'],
              answer: 1,
              explain: `ABD e ACD sono sottosequenze di entrambe, lunghe 3. Lunga 4 dovrebbe essere ABCD o ACBD intere, e
              nessuna delle due è sottosequenza dell'altra (B e C sono in ordine opposto).`,
            },
            {
              q: 'Qual è la distanza di edit tra CASA e CARTA?',
              options: ['1', '2', '3', '4'],
              answer: 1,
              explain: `Si copia C, si copia A, si inserisce R, si sostituisce S con T, si copia A: due modifiche. Con una sola
              non basta: le lunghezze differiscono di 1, quindi servirebbe un solo inserimento, ma inserendo un carattere in
              CASA non si ottiene CARTA.`,
            },
            {
              q: `Nella LCS, se ${m('X[i-1] != Y[j-1]')}, quanto vale ${m('c[i][j]')}?`,
              options: [m('c[i-1][j-1]'), m('c[i-1][j-1] + 1'), m('max(c[i-1][j], c[i][j-1])'), m('min(c[i-1][j], c[i][j-1])')],
              answer: 2,
              explain: `Se gli ultimi caratteri sono diversi, almeno uno dei due non sta nella LCS: si toglie l'ultimo di X
              (${m('c[i-1][j]')}) o l'ultimo di Y (${m('c[i][j-1]')}) e si tiene il migliore. Il caso ${m('c[i-1][j-1] + 1')} vale
              solo per caratteri uguali.`,
            },
            {
              q: 'Nello zaino con una riga sola si aggiorna <code>K[w]</code> leggendo <code>K[w - peso[i]]</code>. In che ordine deve andare <var>w</var>?',
              options: ['Da 0 a W', 'Da W a peso[i], all\'indietro', 'È indifferente', 'Solo sui valori pari'],
              answer: 1,
              explain: `All'indietro ${m('K[w - p_i]')} non è ancora stato aggiornato nel giro dell'oggetto <var>i</var>: contiene
              il valore della riga ${m('i - 1')}, come vuole la ricorrenza. In avanti lo stesso oggetto potrebbe essere usato più
              volte.`,
            },
          ]),
      });
    },
  });

  /* ======================================================================
     Lettura degli input
     ====================================================================== */

  function parseZaino(text) {
    const parts = String(text).split(';');
    if (parts.length !== 2) throw new Error('Scrivi gli oggetti come peso:valore, poi un punto e virgola e la capacità (es. 1:1, 3:4 ; 7).');
    const toks = parts[0].split(/[\s,]+/).filter(Boolean);
    if (toks.length < 1) throw new Error('Serve almeno un oggetto.');
    if (toks.length > 5) throw new Error('Al massimo 5 oggetti, così la tabella si legge bene.');
    const items = toks.map((tk) => {
      const mm = /^(\d+)[:/](\d+)$/.exec(tk);
      if (!mm) throw new Error(`"${tk}" non va bene: scrivi peso:valore, per esempio 3:4.`);
      const p = Number(mm[1]);
      const v = Number(mm[2]);
      if (p < 1 || p > 10) throw new Error('I pesi devono stare tra 1 e 10.');
      if (v < 1 || v > 99) throw new Error('I valori devono stare tra 1 e 99.');
      return { p, v };
    });
    const W = ASD.parseNumbers(parts[1], { min: 1, max: 10, minLen: 1, maxLen: 1 })[0];
    return { items, W };
  }

  function randomZaino() {
    const items = Array.from({ length: 4 }, () => ({ p: ASD.randInt(1, 5), v: ASD.randInt(1, 12) }));
    return { items, W: ASD.randInt(6, 8) };
  }

  function parseDue(text) {
    const toks = String(text).split(/[\s,;]+/).filter(Boolean);
    if (toks.length !== 2) throw new Error('Scrivi due parole separate da uno spazio, per esempio ABCBDAB BDCABA.');
    for (const tk of toks) {
      if (!/^[A-Za-z0-9]+$/.test(tk)) throw new Error(`"${tk}" deve contenere solo lettere e cifre.`);
      if (tk.length > 8) throw new Error('Al massimo 8 caratteri per parola, così la tabella si legge bene.');
    }
    return { X: toks[0].toUpperCase(), Y: toks[1].toUpperCase() };
  }

  function randomDue(alfabeto, lo, hi) {
    const word = () => Array.from({ length: ASD.randInt(lo, hi) }, () => alfabeto[ASD.randInt(0, alfabeto.length - 1)]).join('');
    return { X: word(), Y: word() };
  }

  const range = (n) => Array.from({ length: n }, (_, k) => k);

  /* ======================================================================
     Zaino 0/1: traccia di zaino() e oggettiScelti()
     ====================================================================== */

  function traceZaino({ items, W }) {
    const t = new ASD.Tracer(['celle']);
    const n = items.length;
    const K = range(n + 1).map((i) => range(W + 1).map(() => (i === 0 ? 0 : null)));
    const rows = [{ label: '0', sub: 'nessuno' }].concat(items.map((o, i) => ({ label: String(i + 1), sub: `p${o.p} v${o.v}` })));
    const cols = range(W + 1).map((w) => String(w));
    const label = `${m('K[i][w]')} = valore massimo con i primi <var>i</var> oggetti e capacità <var>w</var> · righe: oggetto <var>i</var> con peso <var>p</var> e valore <var>v</var>`;
    const snap = (o = {}) => ({
      rows,
      cols,
      corner: 'i \\ w',
      label,
      cells: K.map((r) => r.slice()),
      cur: o.cur || null,
      deps: o.deps || [],
      path: o.path || [],
      rowMarks: o.rowMarks || {},
      result: o.result || null,
    });

    t.step('init', `K ha ${n + 1} × ${W + 1} caselle, tutte a 0. La riga 0 è il caso base: senza oggetti il valore è 0 per ogni capacità. Le altre righe le riempio adesso.`, {}, snap());
    for (let i = 1; i <= n; i++) {
      const { p, v } = items[i - 1];
      const rm = { [i]: 'key' };
      t.step('outer', `<b>Riga i = ${i}</b>: oggetto ${i}, cioè <code>peso[${i - 1}] = ${p}</code> e <code>valore[${i - 1}] = ${v}</code>. La riga legge solo la riga ${i - 1}.`, { i }, snap({ rowMarks: rm }));
      for (let w = 0; w <= W; w++) {
        const fits = p <= w;
        t.step('fits', `w = ${w}: l'oggetto ${i} pesa ${p} ${fits ? '≤' : '&gt;'} ${w}, ${fits ? 'ci sta: posso scegliere se prenderlo.' : 'non ci sta.'}`, { i, w }, snap({ cur: [i, w], rowMarks: rm }));
        t.count('celle');
        if (!fits) {
          K[i][w] = K[i - 1][w];
          t.step('skip', `K[${i}][${w}] = K[${i - 1}][${w}] = ${K[i][w]}: senza l'oggetto ${i} resta il meglio della riga sopra.`, { i, w }, snap({ cur: [i, w], deps: [[i - 1, w]], rowMarks: rm }));
        } else {
          const a = K[i - 1][w];
          const b = K[i - 1][w - p] + v;
          K[i][w] = Math.max(a, b);
          const why = b > a ? `conviene prenderlo` : b === a ? 'pari: il valore non cambia' : 'conviene lasciarlo';
          t.step(
            'take',
            `K[${i}][${w}] = max(K[${i - 1}][${w}], K[${i - 1}][${w - p}] + ${v}) = max(${a}, ${K[i - 1][w - p]} + ${v}) = <b>${K[i][w]}</b>: ${why}.`,
            { i, w },
            snap({ cur: [i, w], deps: [[i - 1, w], [i - 1, w - p]], rowMarks: rm })
          );
        }
      }
    }
    t.step('ret', `K[${n}][${W}] = ${K[n][W]} è il valore massimo. Ora ricostruisco quali oggetti lo danno.`, {}, snap({ cur: [n, W] }));
    const scelti = [];
    const path = [];
    let w = W;
    const chosenMarks = () => Object.fromEntries(scelti.map((i) => [i, 'done']));
    for (let i = n; i >= 1; i--) {
      path.push([i, w]);
      const diff = K[i][w] !== K[i - 1][w];
      t.step(
        'rec-cmp',
        diff
          ? `K[${i}][${w}] = ${K[i][w]} ≠ K[${i - 1}][${w}] = ${K[i - 1][w]}: il valore è cambiato con l'oggetto ${i}, quindi <b>l'oggetto ${i} è nello zaino</b>.`
          : `K[${i}][${w}] = K[${i - 1}][${w}] = ${K[i][w]}: l'oggetto ${i} non serve.`,
        { i, w },
        snap({ path: path.slice(), cur: [i, w], deps: [[i - 1, w]], rowMarks: chosenMarks() })
      );
      if (diff) {
        scelti.push(i);
        const p = items[i - 1].p;
        t.step('rec-take', `Lo aggiungo agli scelti e tolgo il suo peso: w = ${w} − ${p} = ${w - p}.`, { i, w: w - p }, snap({ path: path.slice(), rowMarks: chosenMarks() }));
        w -= p;
      }
    }
    path.push([0, w]);
    const peso = scelti.reduce((acc, i) => acc + items[i - 1].p, 0);
    const valore = scelti.reduce((acc, i) => acc + items[i - 1].v, 0);
    t.step(
      null,
      scelti.length
        ? `Oggetti scelti: ${scelti.slice().reverse().join(', ')}. Peso ${peso} ≤ ${W}, valore ${valore} = K[${n}][${W}]. Caselle calcolate: ${n} × ${W + 1} = ${n * (W + 1)}.`
        : `Nessun oggetto ci sta: il valore massimo è 0.`,
      {},
      snap({ path: path.slice(), rowMarks: chosenMarks(), result: { value: K[n][W], scelti } })
    );
    return t.frames;
  }

  function validateZaino(input, frames) {
    const st = frames[frames.length - 1].state;
    if (!st.result) return 'manca il risultato';
    const best = T.brute.knapsack(input.items, input.W);
    if (st.result.value !== best) return `K[n][W] = ${st.result.value}, provando tutti i sottoinsiemi il massimo è ${best}`;
    const p = st.result.scelti.reduce((acc, i) => acc + input.items[i - 1].p, 0);
    const v = st.result.scelti.reduce((acc, i) => acc + input.items[i - 1].v, 0);
    if (p > input.W) return `gli oggetti ricostruiti pesano ${p} > ${input.W}`;
    if (v !== best) return `gli oggetti ricostruiti valgono ${v}, non ${best}`;
    return null;
  }

  /* ======================================================================
     LCS: traccia di lcs() e ricostruisci()
     ====================================================================== */

  function traceLCS({ X, Y }) {
    const t = new ASD.Tracer(['confronti']);
    const M = X.length;
    const N = Y.length;
    const c = range(M + 1).map((i) => range(N + 1).map((j) => (i === 0 || j === 0 ? 0 : null)));
    const arrows = {};
    const rows = [{ label: '', sub: '0' }].concat([...X].map((ch, i) => ({ label: ch, sub: String(i + 1) })));
    const cols = [{ label: '', sub: '0' }].concat([...Y].map((ch, j) => ({ label: ch, sub: String(j + 1) })));
    const label = `${m('c[i][j]')} = lunghezza della LCS tra i primi <var>i</var> caratteri di X = ${X} (righe) e i primi <var>j</var> di Y = ${Y} (colonne)`;
    const snap = (o = {}) => ({
      rows,
      cols,
      corner: 'X \\ Y',
      label,
      cells: c.map((r) => r.slice()),
      arrows: Object.assign({}, arrows),
      cur: o.cur || null,
      deps: o.deps || [],
      path: o.path || [],
      rowMarks: o.rowMarks || {},
      colMarks: o.colMarks || {},
      result: o.result || null,
    });

    t.step('init', `c ha ${M + 1} × ${N + 1} caselle. Riga 0 e colonna 0 valgono 0: se uno dei due prefissi è vuoto, la LCS è vuota.`, {}, snap());
    for (let i = 1; i <= M; i++) {
      for (let j = 1; j <= N; j++) {
        const eq = X[i - 1] === Y[j - 1];
        const hm = eq ? 'done' : 'compare';
        t.count('confronti');
        t.step(
          'cmp',
          `(i, j) = (${i}, ${j}): X[${i - 1}] = ${X[i - 1]} e Y[${j - 1}] = ${Y[j - 1]} sono ${eq ? '<b>uguali</b>' : 'diversi'}.`,
          { i, j },
          snap({ cur: [i, j], rowMarks: { [i]: hm }, colMarks: { [j]: hm } })
        );
        if (eq) {
          c[i][j] = c[i - 1][j - 1] + 1;
          arrows[T.key(i, j)] = '↖';
          t.step(
            'diag',
            `c[${i}][${j}] = c[${i - 1}][${j - 1}] + 1 = ${c[i][j]}: la ${X[i - 1]} allunga di uno la LCS dei due prefissi più corti. Freccia ↖.`,
            { i, j },
            snap({ cur: [i, j], deps: [[i - 1, j - 1]], rowMarks: { [i]: hm }, colMarks: { [j]: hm } })
          );
        } else {
          const up = c[i - 1][j];
          const left = c[i][j - 1];
          c[i][j] = Math.max(up, left);
          arrows[T.key(i, j)] = up >= left ? '↑' : '←';
          const why = up > left ? 'vince quella sopra, freccia ↑' : up === left ? 'pari: per regola scelgo quella sopra, freccia ↑' : 'vince quella a sinistra, freccia ←';
          t.step(
            'max',
            `c[${i}][${j}] = max(c[${i - 1}][${j}], c[${i}][${j - 1}]) = max(${up}, ${left}) = ${c[i][j]}: ${why}.`,
            { i, j },
            snap({ cur: [i, j], deps: [[i - 1, j], [i, j - 1]], rowMarks: { [i]: hm }, colMarks: { [j]: hm } })
          );
        }
      }
    }
    t.step('ret', `c[${M}][${N}] = ${c[M][N]}: la LCS è lunga ${c[M][N]}. Ora la ricostruisco partendo da questa casella.`, {}, snap({ cur: [M, N] }));

    let i = M;
    let j = N;
    let s = '';
    const path = [];
    const rowsUsed = {};
    const colsUsed = {};
    while (i > 0 && j > 0) {
      path.push([i, j]);
      const eq = X[i - 1] === Y[j - 1];
      t.step(
        'rec-cmp',
        `Sono in (${i}, ${j}): X[${i - 1}] = ${X[i - 1]} e Y[${j - 1}] = ${Y[j - 1]} sono ${eq ? 'uguali' : 'diversi'}.`,
        { i, j, s: s || '""' },
        snap({ path: path.slice(), cur: [i, j], rowMarks: Object.assign({}, rowsUsed), colMarks: Object.assign({}, colsUsed) })
      );
      if (eq) {
        s += X[i - 1];
        rowsUsed[i] = 'done';
        colsUsed[j] = 'done';
        t.step('rec-diag', `${X[i - 1]} fa parte della LCS: la aggiungo (s = ${s}) e vado in diagonale, a (${i - 1}, ${j - 1}).`, { i, j, s }, snap({ path: path.slice(), rowMarks: Object.assign({}, rowsUsed), colMarks: Object.assign({}, colsUsed) }));
        i--;
        j--;
      } else if (c[i - 1][j] >= c[i][j - 1]) {
        t.step(
          'rec-up',
          `c[${i - 1}][${j}] = ${c[i - 1][j]} ≥ c[${i}][${j - 1}] = ${c[i][j - 1]}: il valore viene da sopra, salgo a (${i - 1}, ${j}).`,
          { i, j, s: s || '""' },
          snap({ path: path.slice(), deps: [[i - 1, j]], rowMarks: Object.assign({}, rowsUsed), colMarks: Object.assign({}, colsUsed) })
        );
        i--;
      } else {
        t.step(
          'rec-left',
          `c[${i - 1}][${j}] = ${c[i - 1][j]} &lt; c[${i}][${j - 1}] = ${c[i][j - 1]}: il valore viene da sinistra, vado a (${i}, ${j - 1}).`,
          { i, j, s: s || '""' },
          snap({ path: path.slice(), deps: [[i, j - 1]], rowMarks: Object.assign({}, rowsUsed), colMarks: Object.assign({}, colsUsed) })
        );
        j--;
      }
    }
    path.push([i, j]);
    t.step('rec-loop', `Sono in (${i}, ${j}): ${i === 0 ? 'i' : 'j'} è 0, uno dei due prefissi è vuoto e il ciclo finisce.`, { i, j, s: s || '""' }, snap({ path: path.slice(), rowMarks: Object.assign({}, rowsUsed), colMarks: Object.assign({}, colsUsed) }));
    const lcs = s.split('').reverse().join('');
    t.step(
      'rec-rev',
      s ? `Le lettere sono uscite dall'ultima alla prima (${s}): le rovescio e ottengo <b>${lcs}</b>.` : 'Nessuna lettera in comune: la LCS è la stringa vuota.',
      { s: lcs || '""' },
      snap({ path: path.slice(), rowMarks: Object.assign({}, rowsUsed), colMarks: Object.assign({}, colsUsed) })
    );
    t.step(
      null,
      lcs
        ? `LCS = ${lcs}, lunghezza ${lcs.length} = c[${M}][${N}]. Le lettere evidenziate in verde nelle intestazioni sono quelle usate. Caselle calcolate: ${M} × ${N} = ${M * N}.`
        : `La LCS è vuota: c[${M}][${N}] = 0.`,
      {},
      snap({ path: path.slice(), rowMarks: Object.assign({}, rowsUsed), colMarks: Object.assign({}, colsUsed), result: { len: c[M][N], lcs } })
    );
    return t.frames;
  }

  function validateLCS(input, frames) {
    const st = frames[frames.length - 1].state;
    if (!st.result) return 'manca il risultato';
    const best = T.brute.lcs(input.X, input.Y);
    if (st.result.len !== best) return `c[m][n] = ${st.result.len}, provando tutte le sottosequenze il massimo è ${best}`;
    if (st.result.lcs.length !== best) return `la LCS ricostruita (${st.result.lcs}) non è lunga ${best}`;
    if (!T.isSubsequence(st.result.lcs, input.X) || !T.isSubsequence(st.result.lcs, input.Y)) return `${st.result.lcs} non è sottosequenza di entrambe`;
    return null;
  }

  /* ======================================================================
     Distanza di edit: traccia di distanzaEdit() e operazioni()
     ====================================================================== */

  function traceEdit({ X, Y }) {
    const t = new ASD.Tracer(['celle']);
    const M = X.length;
    const N = Y.length;
    const d = range(M + 1).map(() => range(N + 1).map(() => null));
    const rows = [{ label: '', sub: '0' }].concat([...X].map((ch, i) => ({ label: ch, sub: String(i + 1) })));
    const cols = [{ label: '', sub: '0' }].concat([...Y].map((ch, j) => ({ label: ch, sub: String(j + 1) })));
    const label = `${m('d[i][j]')} = modifiche minime per trasformare i primi <var>i</var> caratteri di X = ${X} (righe) nei primi <var>j</var> di Y = ${Y} (colonne)`;
    const snap = (o = {}) => ({
      rows,
      cols,
      corner: 'X \\ Y',
      label,
      cells: d.map((r) => r.slice()),
      cur: o.cur || null,
      deps: o.deps || [],
      path: o.path || [],
      rowMarks: o.rowMarks || {},
      colMarks: o.colMarks || {},
      result: o.result || null,
    });

    for (let i = 0; i <= M; i++) d[i][0] = i;
    t.step('base-col', `Colonna 0: <code>d[i][0] = i</code>. Per trasformare i primi i caratteri di X nella parola vuota li cancello tutti.`, {}, snap());
    for (let j = 0; j <= N; j++) d[0][j] = j;
    t.step('base-row', `Riga 0: <code>d[0][j] = j</code>. Dalla parola vuota ai primi j caratteri di Y servono j inserimenti.`, {}, snap());
    for (let i = 1; i <= M; i++) {
      for (let j = 1; j <= N; j++) {
        const eq = X[i - 1] === Y[j - 1];
        const sost = eq ? 0 : 1;
        const hm = eq ? 'done' : 'compare';
        t.step('cmp', `(i, j) = (${i}, ${j}): X[${i - 1}] = ${X[i - 1]} e Y[${j - 1}] = ${Y[j - 1]} sono ${eq ? 'uguali: <code>sost = 0</code>' : 'diversi: <code>sost = 1</code>'}.`, { i, j, sost }, snap({ cur: [i, j], rowMarks: { [i]: hm }, colMarks: { [j]: hm } }));
        const del = d[i - 1][j] + 1;
        const ins = d[i][j - 1] + 1;
        const dia = d[i - 1][j - 1] + sost;
        d[i][j] = Math.min(del, ins, dia);
        t.count('celle');
        const best = dia === d[i][j] ? (eq ? `copio ${X[i - 1]}` : `sostituisco ${X[i - 1]} con ${Y[j - 1]}`) : del === d[i][j] ? `cancello ${X[i - 1]}` : `inserisco ${Y[j - 1]}`;
        t.step(
          'min',
          `d[${i}][${j}] = min(${d[i - 1][j]} + 1, ${d[i][j - 1]} + 1, ${d[i - 1][j - 1]} + ${sost}) = min(${del}, ${ins}, ${dia}) = <b>${d[i][j]}</b>: l'ultima mossa migliore è "${best}".`,
          { i, j, sost },
          snap({ cur: [i, j], deps: [[i - 1, j], [i, j - 1], [i - 1, j - 1]], rowMarks: { [i]: hm }, colMarks: { [j]: hm } })
        );
      }
    }
    t.step('ret', `d[${M}][${N}] = ${d[M][N]}: servono ${d[M][N]} modifiche. Ora ricostruisco quali, partendo da qui.`, {}, snap({ cur: [M, N] }));

    const ops = [];
    const path = [[M, N]];
    let i = M;
    let j = N;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (X[i - 1] !== Y[j - 1] ? 1 : 0)) {
        const eq = X[i - 1] === Y[j - 1];
        ops.push(eq ? { t: 'copy', a: X[i - 1] } : { t: 'sub', a: X[i - 1], b: Y[j - 1] });
        path.push([i - 1, j - 1]);
        t.step(
          'rec-diag',
          `d[${i}][${j}] = ${d[i][j]} = d[${i - 1}][${j - 1}] + ${eq ? 0 : 1}: ${eq ? `copio ${X[i - 1]}, gratis` : `sostituisco ${X[i - 1]} con ${Y[j - 1]}`}. Vado in diagonale, a (${i - 1}, ${j - 1}).`,
          { i, j },
          snap({ path: path.slice(), cur: [i - 1, j - 1] })
        );
        i--;
        j--;
      } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) {
        ops.push({ t: 'del', a: X[i - 1] });
        path.push([i - 1, j]);
        t.step('rec-up', `d[${i}][${j}] = ${d[i][j]} = d[${i - 1}][${j}] + 1: cancello ${X[i - 1]}. Salgo a (${i - 1}, ${j}).`, { i, j }, snap({ path: path.slice(), cur: [i - 1, j] }));
        i--;
      } else {
        ops.push({ t: 'ins', b: Y[j - 1] });
        path.push([i, j - 1]);
        t.step('rec-left', `d[${i}][${j}] = ${d[i][j]} = d[${i}][${j - 1}] + 1: inserisco ${Y[j - 1]}. Vado a sinistra, a (${i}, ${j - 1}).`, { i, j }, snap({ path: path.slice(), cur: [i, j - 1] }));
        j--;
      }
    }
    ops.reverse();
    const words = { copy: (o) => `copio ${o.a}`, sub: (o) => `sostituisco ${o.a} con ${o.b}`, del: (o) => `cancello ${o.a}`, ins: (o) => `inserisco ${o.b}` };
    t.step(
      null,
      `Operazioni, dalla prima all'ultima: ${ops.map((o) => words[o.t](o)).join(', ')}. Le modifiche vere (non le copie) sono ${ops.filter((o) => o.t !== 'copy').length} = d[${M}][${N}].`,
      {},
      snap({ path: path.slice(), result: { dist: d[M][N], ops } })
    );
    return t.frames;
  }

  function validateEdit(input, frames) {
    const st = frames[frames.length - 1].state;
    if (!st.result) return 'manca il risultato';
    const expected = T.brute.edit(input.X, input.Y);
    if (st.result.dist !== expected) return `d[m][n] = ${st.result.dist}, la ricorsione sui suffissi dice ${expected}`;
    const changes = st.result.ops.filter((o) => o.t !== 'copy').length;
    if (changes !== expected) return `le operazioni ricostruite sono ${changes}, non ${expected}`;
    // applico le operazioni a X e devo ottenere Y
    let k = 0;
    let outStr = '';
    for (const o of st.result.ops) {
      if (o.t === 'ins') outStr += o.b;
      else {
        if (input.X[k] !== o.a) return 'le operazioni non seguono X';
        k++;
        if (o.t === 'copy') outStr += o.a;
        if (o.t === 'sub') outStr += o.b;
      }
    }
    if (k !== input.X.length || outStr !== input.Y) return `le operazioni trasformano X in ${outStr}, non in ${input.Y}`;
    return null;
  }
})();
