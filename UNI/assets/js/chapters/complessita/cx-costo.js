/* ASD a quadretti — capitolo "Contare i passi": modello di costo, operazione
   dominante, caso migliore / peggiore / medio, crescita. */
(function () {
  'use strict';

  const { m, box, table } = ASD;

  /* ------------------------------------------------------------ tracce */

  function traceMassimo(input) {
    const t = new ASD.Tracer(['confronti']);
    const a = input.slice();
    const n = a.length;
    let mi = 0;
    const st = (o = {}) => ({ a: a.slice(), marks: Object.assign({ [mi]: 'key' }, o.marks || {}), ptrs: o.ptrs || {} });
    t.step('init', `<code>m = a[0] = ${a[0]}</code>: il primo elemento è il massimo provvisorio.`, { m: a[0] }, st());
    let mv = a[0];
    for (let i = 1; i < n; i++) {
      t.step('loop', `<code>i = ${i}</code>.`, { i, m: mv }, st({ ptrs: { i } }));
      t.count('confronti');
      const bigger = a[i] > mv;
      t.step('cmp', `Confronto a[${i}] = ${a[i]} con m = ${mv}: ${bigger ? '<b>è più grande</b>.' : 'non è più grande.'}`, { i, m: mv }, st({ ptrs: { i }, marks: { [i]: 'compare' } }));
      if (bigger) {
        mv = a[i];
        mi = i;
        t.step('update', `Nuovo massimo provvisorio: <code>m = ${mv}</code>.`, { i, m: mv }, st({ ptrs: { i } }));
      }
    }
    t.step('ret', `Fine del ciclo: il massimo è ${mv}. Confronti: ${n - 1} = n − 1, qualunque sia l'ordine degli elementi.`, { m: mv }, st({ marks: { [mi]: 'done' } }));
    return t.frames;
  }

  function traceDuplicati(input) {
    const t = new ASD.Tracer(['confronti']);
    const a = input.slice();
    const n = a.length;
    const st = (o = {}) => ({ a: a.slice(), marks: o.marks || {}, ptrs: o.ptrs || {} });
    for (let i = 0; i < n; i++) {
      t.step('outer', `<code>i = ${i}</code>: confronto a[${i}] = ${a[i]} con tutti gli elementi alla sua destra.`, { i }, st({ ptrs: { i }, marks: { [i]: 'key' } }));
      for (let j = i + 1; j < n; j++) {
        t.count('confronti');
        const eq = a[i] === a[j];
        t.step(
          'cmp',
          `a[${i}] = ${a[i]} e a[${j}] = ${a[j]}: ${eq ? '<b>sono uguali</b>.' : 'diversi.'}`,
          { i, j },
          st({ ptrs: { i, j }, marks: { [i]: 'key', [j]: 'compare' } })
        );
        if (eq) {
          t.step('found', `Trovato un duplicato: la funzione restituisce <code>true</code> dopo ${t.c.confronti} ${t.c.confronti === 1 ? 'confronto' : 'confronti'}, senza guardare il resto.`, { i, j }, st({ ptrs: { i, j }, marks: { [i]: 'done', [j]: 'done' } }));
          return t.frames;
        }
      }
    }
    const tot = (n * (n - 1)) / 2;
    t.step('none', `Nessuna coppia uguale: sono stati necessari tutti i confronti, ${m(`n(n-1)/2 = ${tot}`)}.`, {}, st());
    return t.frames;
  }

  /* ------------------------------------------------------------ capitolo */

  ASD.chapter({
    id: 'cx-costo',
    title: 'Contare i passi',
    lead:
      'Prima delle notazioni c\'è una domanda concreta: quante operazioni fa il mio codice quando l\'input diventa grande? Qui impari a contarle e a capire perché si guarda soprattutto il caso peggiore.',
    minutes: 25,
    prereq: ['cpp-basi'],
    goals: [
      'spiegare perché la complessità si misura in passi e non in secondi',
      `trovare l'operazione dominante di un algoritmo e contarla in funzione di ${m('n')}`,
      'distinguere caso migliore, peggiore e medio con esempi concreti',
      'capire perché alla fine conta solo il termine che cresce di più',
    ],

    render(el) {
      el.innerHTML = `
<section id="secondi">
  <h2>Perché non i secondi</h2>
  <p>Lo stesso programma ci mette tempi diversi su un portatile vecchio e su un computer nuovo, con un compilatore o con un
  altro, con <code>-O2</code> o senza. Il tempo in secondi misura il computer, non l'algoritmo.</p>
  <p>Per confrontare algoritmi si conta invece il <strong>numero di operazioni elementari</strong> che eseguono: un
  assegnamento, un'operazione aritmetica, un confronto, l'accesso a <code>a[i]</code>. Ognuna costa una unità di tempo
  (è il <i>modello RAM</i> dei libri). Il risultato è una funzione:</p>
  <p class="formula">${m('T(n) =')} numero di operazioni eseguite con un input di dimensione ${m('n')}</p>
  <p>Cos'è ${m('n')} dipende dal problema: il numero di elementi dell'array da ordinare, i nodi di un albero, i vertici e
  gli archi di un grafo, le cifre di un numero. Va sempre detto esplicitamente.</p>
</section>

<section id="dominante">
  <h2>L'operazione dominante</h2>
  <p>Contare ogni singola operazione è noioso e non serve: conta l'operazione che viene eseguita <strong>più volte</strong>,
  di solito il confronto nel ciclo più interno. Il totale vero è al massimo un numero costante di volte quel conteggio.</p>
  <p>Esempio: il massimo di un array. L'operazione dominante è il confronto <code>a[i] &gt; m</code>, dentro il ciclo.</p>
  <div data-mount="massimo"></div>
  <p>Il ciclo parte da <code>i = 1</code> e arriva a <code>n-1</code>: i confronti sono sempre ${m('n-1')}. Gli
  assegnamenti <code>m = a[i]</code> invece dipendono dai dati (da 0 se il massimo è il primo elemento, a ${m('n-1')} se
  l'array è crescente), ma non sono mai più dei confronti: per questo si contano i confronti.</p>
  ${table({
    caption: 'Cosa si conta di solito',
    head: ['Tipo di algoritmo', 'Operazione dominante'],
    rows: [
      ['Ordinamento per confronto', 'confronti tra elementi (e a volte scambi)'],
      ['Ricerca in un array o in un albero', 'confronti con la chiave cercata'],
      ['Visita di un grafo', 'vertici visitati e archi esaminati'],
      ['Programmazione dinamica', 'caselle della tabella riempite'],
      ['Funzione ricorsiva', 'numero di chiamate (e lavoro fatto in ognuna)'],
    ],
  })}
</section>

<section id="casi">
  <h2>Caso migliore, peggiore e medio</h2>
  <p>Per molti algoritmi il numero di passi non dipende solo da ${m('n')} ma da <em>come</em> sono fatti i dati. Questa
  funzione cerca due elementi uguali confrontando tutte le coppie, e si ferma appena ne trova una:</p>
  <div data-mount="duplicati"></div>
  <p>Prova i tre input predefiniti. Con ${m('n = 6')}:</p>
  ${table({
    head: ['Caso', 'Input', 'Confronti', 'In generale'],
    rows: [
      ['Migliore', 'i primi due elementi sono uguali', '1', m('1 = Θ(1)')],
      ['Peggiore', 'tutti diversi (o l\'unica coppia uguale è l\'ultima)', '15', m('n(n-1)/2 = Θ(n^2)')],
    ],
  })}
  <dl>
    <dt>Caso peggiore</dt>
    <dd>il massimo numero di passi tra tutti gli input di dimensione ${m('n')}. È una <strong>garanzia</strong>: l'algoritmo
    non farà mai peggio. Quando non si specifica, "la complessità" è quella del caso peggiore.</dd>
    <dt>Caso migliore</dt>
    <dd>il minimo. Dice poco: quasi ogni algoritmo ha un input fortunato.</dd>
    <dt>Caso medio</dt>
    <dd>la media sugli input, pesata con la loro probabilità. Richiede un'ipotesi su come sono distribuiti i dati (per
    esempio: tutte le permutazioni ugualmente probabili). Spesso coincide con il peggiore a meno di costanti, ma non sempre:
    il ${ASD.link('quick-sort', null, 'quicksort')} è ${m('Θ(n log n)')} in media e ${m('Θ(n^2)')} nel caso peggiore.</dd>
  </dl>
  ${box('errore', `<p>"Il caso migliore è quando ${m('n')} è piccolo": <strong>no</strong>. Migliore e peggiore si confrontano
  a parità di ${m('n')}: tra tutti gli array di un milione di elementi, quale costa meno? Dire "il caso migliore è
  l'array con un elemento solo" all'esame è un errore classico.</p>`)}
</section>

<section id="crescita">
  <h2>Conta come cresce, non il numero esatto</h2>
  <p>Due algoritmi per lo stesso problema: il primo fa ${m('T_A(n) = 100n + 50')} passi, il secondo
  ${m('T_B(n) = n^2/2')}. Chi è più veloce?</p>
  <div data-mount="sfida"></div>
  <p>Per ${m('n')} piccolo vince B, ma da ${m('n = 201')} in poi vince A, e il distacco aumenta senza limite: a
  ${m('n = 10^6')} A fa circa ${m('10^8')} passi, B circa ${m('5 · 10^{11}')}, cinquemila volte di più. La costante 100
  davanti a ${m('n')} pesa meno del fatto che ${m('n^2')} cresce più in fretta di ${m('n')}.</p>
  <p>È questa l'idea della complessità asintotica: per ${m('n')} grande conta solo il <strong>termine che cresce di
  più</strong>, senza la sua costante. Lo strumento per dirlo in modo preciso sono le notazioni del prossimo capitolo,
  ${ASD.link('cx-notazioni', null, 'O, Ω e Θ')}.</p>
  ${box('ricorda', `<p>Un test veloce: cosa succede se <strong>raddoppio</strong> ${m('n')}?</p>
  <ul>
    <li>${m('Θ(1)')}: il tempo non cambia;</li>
    <li>${m('Θ(log n)')}: aumenta di un passo (una costante);</li>
    <li>${m('Θ(n)')}: raddoppia;</li>
    <li>${m('Θ(n^2)')}: diventa quattro volte tanto; ${m('Θ(n^3)')}: otto volte;</li>
    <li>${m('Θ(2^n)')}: si eleva al quadrato.</li>
  </ul>`)}
</section>

<section id="esame">
  <h2>All'esame</h2>
  <p>La domanda tipica è "quante volte viene eseguita l'istruzione <code>X</code>?" oppure "qual è la complessità nel caso
  peggiore?". Rispondi in due righe: prima il conteggio (anche approssimato, ma motivato), poi la classe di crescita.</p>
  ${box('esame', `<p>Esempio di risposta completa per <code>haDuplicati</code>: "L'operazione dominante è il confronto
  <code>a[i] == a[j]</code>. Nel caso peggiore (nessun duplicato) si confrontano tutte le coppie ${m('i < j')}, che sono
  ${m('(n-1) + (n-2) + … + 1 = n(n-1)/2')}. Quindi ${m('T(n) = Θ(n^2)')}. Nel caso migliore (${m('a[0] = a[1]')}) basta un
  confronto: ${m('Θ(1)')}."</p>`)}
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        massimo: (host) =>
          ASD.stepper(host, {
            id: 'massimo',
            title: 'Massimo di un array, contando i confronti',
            code: { src: 'complessita/massimo', region: 'max' },
            input: {
              kind: 'array',
              value: [3, 8, 2, 9, 4],
              presets: [
                { label: 'Casuale', value: () => ASD.randomDistinct(7, 1, 60) },
                { label: 'Crescente', value: () => ASD.randomDistinct(7, 1, 60).sort((x, y) => x - y) },
                { label: 'Decrescente', value: () => ASD.randomDistinct(7, 1, 60).sort((x, y) => y - x) },
              ],
            },
            view: (stage) => new ASD.viz.ArrayView(stage, { mode: 'cells' }),
            trace: traceMassimo,
            counters: [{ key: 'confronti', label: 'confronti' }],
            legend: [
              { k: 'key', label: 'massimo provvisorio' },
              { k: 'compare', label: 'confronto' },
              { k: 'done', label: 'risultato' },
            ],
            validate: (input, frames) =>
              frames[frames.length - 1].count.confronti === input.length - 1 ? null : 'i confronti non sono n − 1',
          }),
        duplicati: (host) =>
          ASD.stepper(host, {
            id: 'duplicati',
            title: 'Ci sono duplicati? Caso migliore e peggiore',
            code: { src: 'complessita/ha_duplicati', region: 'dup' },
            input: {
              kind: 'array',
              value: [4, 1, 7, 2, 9, 6],
              presets: [
                { label: 'Caso migliore', value: [4, 4, 1, 7, 2, 9] },
                { label: 'Caso peggiore', value: [4, 1, 7, 2, 9, 6] },
                { label: 'Uguali in fondo', value: [4, 1, 7, 2, 9, 9] },
              ],
            },
            view: (stage) => new ASD.viz.ArrayView(stage, { mode: 'cells' }),
            trace: traceDuplicati,
            counters: [{ key: 'confronti', label: 'confronti' }],
            legend: [
              { k: 'key', label: 'a[i]' },
              { k: 'compare', label: 'a[j] confrontato' },
              { k: 'done', label: 'duplicato trovato' },
            ],
          }),
        sfida: mountSfida,
        quiz: (host) =>
          ASD.quiz(host, [
            {
              q: 'Perché la complessità si misura contando le operazioni e non in secondi?',
              options: [
                'Perché i secondi sono troppo difficili da misurare',
                'Perché il tempo in secondi dipende dal computer e dal compilatore, il numero di operazioni solo dall\'algoritmo e dall\'input',
                'Perché le operazioni sono sempre più veloci dei secondi',
              ],
              answer: 1,
              explain: 'Contare le operazioni elementari dà una misura che non cambia da un computer all\'altro: è una proprietà dell\'algoritmo.',
            },
            {
              q: 'Quanti confronti fa la funzione <code>massimo</code> su un array di <var>n</var> elementi già ordinato in modo crescente?',
              options: [m('1'), m('n-1'), m('n'), m('n(n-1)/2')],
              answer: 1,
              explain: `I confronti sono sempre ${m('n-1')}, uno per ogni <code>i</code> da 1 a ${m('n-1')}. Con l'array crescente cambia
              solo il numero di aggiornamenti di <code>m</code> (anche loro ${m('n-1')}), non il numero di confronti.`,
            },
            {
              q: 'Qual è il caso migliore di <code>haDuplicati</code>?',
              options: [
                'Un array con un solo elemento',
                'Un array in cui <code>a[0]</code> e <code>a[1]</code> sono uguali',
                'Un array senza duplicati',
              ],
              answer: 1,
              explain: `Il caso migliore si cerca <em>a parità di ${m('n')}</em>: tra gli array di ${m('n')} elementi, il più fortunato è
              quello in cui il primo confronto trova subito la coppia uguale. "Un solo elemento" cambia ${m('n')}, non è un caso migliore.`,
            },
            {
              q: `Un algoritmo fa ${m('T(n) = 5n^2 + 1000n')} operazioni. Cosa succede, più o meno, al tempo se ${m('n')} passa da un milione a due milioni?`,
              options: ['Raddoppia', 'Diventa circa quattro volte', 'Aumenta di 1000 operazioni', 'Non cambia'],
              answer: 1,
              explain: `Per ${m('n')} grande domina ${m('5n^2')}: raddoppiando ${m('n')} il quadrato diventa quattro volte tanto. Il termine
              ${m('1000n')} è trascurabile: con ${m('n = 10^6')} vale ${m('10^9')} contro ${m('5 · 10^{12}')}.`,
            },
            {
              q: 'Quando non viene specificato, "la complessità di un algoritmo" si riferisce di solito a…',
              options: ['il caso migliore', 'il caso medio', 'il caso peggiore'],
              answer: 2,
              explain: 'Il caso peggiore è una garanzia valida per ogni input. Il caso medio richiede ipotesi sulla distribuzione dei dati, e va dichiarato esplicitamente.',
            },
          ]),
      });
    },
  });

  /* Grafico: 100n + 50 contro n²/2 */
  function mountSfida(host) {
    const { h } = ASD;
    const lab = h('div.lab');
    const body = h('div.lab-body');
    const out = h('div.lab-out');
    const ctr = h('div.lab-controls');
    lab.append(h('div.lab-head', h('h3', { text: 'Chi vince quando n cresce?' })), body, ctr, out);
    host.append(lab);
    const id = ASD.uid('sfida-n');
    const range = h('input', { type: 'range', id, min: '50', max: '1000', step: '50', value: '400' });
    const outN = h('output', { for: id });
    ctr.append(h('label.slider', { for: id }, h('span', 'Fino a n ='), range, outN));
    const plot = new ASD.viz.Plot(body, {
      x: { min: 0, max: 400, label: 'n', integer: true },
      y: { min: 0, label: 'passi' },
      height: 280,
      ariaLabel: 'Confronto tra 100n + 50 e n²/2',
    });
    const draw = () => {
      const N = Number(range.value);
      outN.textContent = String(N);
      plot.o.x.max = N;
      plot.set({
        series: [
          { id: 'a', label: 'A: 100n + 50', slot: 1, fn: (n) => 100 * n + 50 },
          { id: 'b', label: 'B: n²/2', slot: 2, fn: (n) => (n * n) / 2 },
        ],
        vlines: N > 220 ? [{ x: 201, label: 'n = 201' }] : [],
      });
      const rows = [10, 100, 1000, 1e6].map((n) => [
        ASD.fmt(n),
        ASD.fmtCompact(100 * n + 50),
        ASD.fmtCompact((n * n) / 2),
        100 * n + 50 < (n * n) / 2 ? 'A' : 'B',
      ]);
      out.innerHTML = table({ head: [m('n'), 'A: 100n + 50', 'B: n²/2', 'Più veloce'], rows });
    };
    range.addEventListener('input', draw);
    draw();
  }
})();
