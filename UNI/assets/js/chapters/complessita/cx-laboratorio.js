/* ASD a quadretti — capitolo "Laboratorio": si sceglie un frammento di codice,
   il sito conta davvero quante volte gira l'istruzione più interna al crescere
   di n, lo disegna, e il lettore prova a indovinare la complessità. */
(function () {
  'use strict';

  const { h, m, box, table } = ASD;
  const cx = ASD.cx;
  const GUESSES = ['1', 'loglog', 'log', 'sqrt', 'n', 'nlogn', 'n2', 'n3', 'exp'];

  function samplesFor(sn, N) {
    if (sn.answer === 'exp') return Array.from({ length: N }, (_, k) => k + 1);
    const pts = new Set();
    const steps = 16;
    for (let k = 1; k <= steps; k++) pts.add(Math.max(1, Math.round((N * k) / steps)));
    return [...pts].sort((a, b) => a - b);
  }

  function mountGioco(host) {
    const lab = h('div.lab');
    const chips = h('div.cx-snips', { role: 'group', 'aria-label': 'Frammenti di codice' });
    const body = h('div.lab-body');
    const ctr = h('div.lab-controls');
    const out = h('div.lab-out', { 'aria-live': 'polite' });
    lab.append(h('div.lab-head', h('h3', { text: 'Indovina la complessità' }), h('span.chip', { text: `${cx.snippets.length} frammenti` })), h('div.lab-controls', chips), body, ctr, out);
    host.append(lab);

    const grid = h('div.cx-lab-grid');
    const codeBox = h('div');
    const plotBox = h('div');
    grid.append(codeBox, plotBox);
    body.append(grid);
    const plot = new ASD.viz.Plot(plotBox, {
      x: { min: 0, max: 100, label: 'n', integer: true },
      y: { min: 0, label: 'volte che viene eseguito op++' },
      height: 280,
      ariaLabel: 'Passi misurati in funzione di n',
    });

    const base = ASD.uid('gioco');
    const nId = base + '-n';
    const range = h('input', { type: 'range', id: nId, min: '1', max: '10', step: '1', value: '10' });
    const outN = h('output', { for: nId });
    const guessBox = h('fieldset.cx-guess', h('legend', { text: 'Secondo te è…' }));
    const guessInputs = GUESSES.map((id) => {
      const f = cx.fn(id);
      const inputId = `${base}-g-${id}`;
      const input = h('input', { type: 'radio', name: base + '-g', id: inputId, value: id });
      guessBox.append(h('label.chip', { for: inputId, html: m(f.theta) }, input));
      const label = guessBox.lastChild;
      label.prepend(input);
      return input;
    });
    const checkBtn = h('button.btn.btn-primary', { type: 'button', text: 'Verifica' });
    const solBtn = h('button.btn', { type: 'button', text: 'Mostra la soluzione' });
    ctr.append(h('label.slider', { for: nId }, h('span', 'n fino a'), range, outN), guessBox, h('div.quiz-actions', checkBtn, solBtn));

    let sn = cx.snippets[0];
    let guess = null;
    let reveal = false;

    const snBtns = cx.snippets.map((s, k) => {
      const b = h('button.btn.btn-sm', { type: 'button', 'aria-pressed': String(k === 0), text: `${k + 1}. ${s.title}` });
      b.addEventListener('click', () => choose(s));
      chips.append(b);
      return b;
    });

    function choose(s) {
      sn = s;
      guess = null;
      reveal = false;
      guessInputs.forEach((i) => (i.checked = false));
      snBtns.forEach((b, k) => b.setAttribute('aria-pressed', String(cx.snippets[k] === s)));
      codeBox.replaceChildren();
      ASD.code(codeBox, { code: s.code, file: 'frammento.cpp', run: false });
      const maxN = s.nMax;
      range.max = String(maxN);
      range.min = String(s.answer === 'exp' ? 5 : Math.max(8, Math.round(maxN / 20)));
      range.step = String(s.answer === 'exp' ? 1 : Math.max(1, Math.round(maxN / 40)));
      range.value = String(maxN);
      draw();
    }

    function draw() {
      const N = Number(range.value);
      outN.textContent = String(N);
      const xs = samplesFor(sn, N);
      const pts = xs.map((n) => [n, sn.count(n)]);
      const series = [{ id: 'mis', label: 'misurati', slot: 1, points: pts, line: true }];
      const shown = reveal ? sn.answer : guess;
      if (shown) {
        const f = cx.fn(shown);
        const fN = f.f(N);
        const k = fN > 0 ? sn.count(N) / fN : 1;
        series.push({ id: 'fit', label: `c · ${f.label}`, slot: reveal || shown === sn.answer ? 6 : 8, fn: (n) => k * f.f(n), dashed: true });
      }
      plot.o.x.max = N;
      plot.o.x.min = 0;
      plot.o.y.max = 'auto';
      plot.set({ series });
      renderOut(N);
    }

    function doublingRows(N) {
      const rows = [];
      if (sn.answer === 'exp') {
        for (const n of [Math.max(2, N - 4), N - 3, N - 2, N - 1].filter((v) => v >= 2)) {
          const a = sn.count(n);
          const b = sn.count(n + 1);
          rows.push([m(`n = ${n}`), ASD.fmt(a), ASD.fmt(b), ASD.fmt(Math.round((b / a) * 100) / 100)]);
        }
        return { head: ['', m('T(n)'), m('T(n+1)'), m('T(n+1)/T(n)')], rows };
      }
      for (const n of [Math.round(N / 16), Math.round(N / 8), Math.round(N / 4), Math.round(N / 2)].filter((v) => v >= 2)) {
        const a = sn.count(n);
        const b = sn.count(2 * n);
        rows.push([m(`n = ${n}`), ASD.fmt(a), ASD.fmt(b), a ? ASD.fmt(Math.round((b / a) * 100) / 100) : '—']);
      }
      return { head: ['', m('T(n)'), m('T(2n)'), m('T(2n)/T(n)')], rows };
    }

    function renderOut(N) {
      const d = doublingRows(N);
      let verdict = '';
      if (guess && !reveal) {
        const ok = guess === sn.answer;
        verdict = ok
          ? `<p class="cx-verdict ok"><strong class="vd">Giusto.</strong>La curva tratteggiata segue i punti misurati. ${sn.why}</p>`
          : `<p class="cx-verdict no"><strong class="vd">Non è questa.</strong>Guarda la curva tratteggiata: ${m(`c · ${cx.fn(guess).label}`)} è stata
             adattata all'ultimo punto e si stacca dagli altri. Prova un'altra classe, oppure usa il test del raddoppio qui sotto.</p>`;
      } else if (reveal) {
        verdict = `<p class="cx-verdict ok"><strong class="vd">Soluzione: ${m(cx.fn(sn.answer).theta)}.</strong>${sn.why}</p>`;
      } else {
        verdict = '<p class="cx-verdict">Scegli una classe di complessità e premi <strong>Verifica</strong>. La curva della tua risposta verrà sovrapposta ai punti misurati.</p>';
      }
      out.innerHTML =
        verdict +
        `<h4 style="margin:14px 0 4px">Test del ${sn.answer === 'exp' ? 'passo in più' : 'raddoppio'}</h4>` +
        table({ head: d.head, rows: d.rows, cls: 'cx-ratio' });
    }

    range.addEventListener('input', draw);
    guessInputs.forEach((inp) =>
      inp.addEventListener('change', () => {
        guess = null;
        reveal = false;
      })
    );
    checkBtn.addEventListener('click', () => {
      const chosen = guessInputs.find((i) => i.checked);
      if (!chosen) {
        out.querySelector('.cx-verdict').innerHTML = '<strong>Scegli prima una risposta.</strong>';
        return;
      }
      guess = chosen.value;
      reveal = false;
      draw();
    });
    solBtn.addEventListener('click', () => {
      reveal = true;
      draw();
    });

    choose(sn);
  }

  ASD.chapter({
    id: 'cx-laboratorio',
    title: 'Laboratorio di complessità',
    lead:
      'Quattordici frammenti di codice. Per ognuno il sito conta davvero quante volte gira l\'istruzione più interna al crescere di n, lo disegna e ti chiede la complessità. Misurare aiuta a indovinare; il ragionamento serve a esserne sicuri.',
    minutes: 30,
    prereq: ['cx-metodo'],
    goals: [
      'riconoscere a colpo d\'occhio le classi di complessità più comuni nel codice',
      'usare il test del raddoppio per stimare la crescita da una tabella di misure',
      'capire i limiti delle misure: perché servono comunque il conto e la dimostrazione',
      'misurare i tempi veri di un programma C++ con <code>&lt;chrono&gt;</code>',
    ],

    render(el) {
      cx.selfCheck();
      el.innerHTML = `
<section id="idea">
  <h2>Misurare per indovinare, ragionare per dimostrare</h2>
  <p>Ogni frammento usa una variabile <code>op</code> che conta quante volte viene eseguita l'istruzione più interna. Il
  sito la fa crescere per tanti valori di ${m('n')} e disegna i punti. La forma della curva suggerisce la classe di
  complessità, ma non la dimostra: per questo, dopo ogni tentativo, c'è la spiegazione con il conto.</p>
  <ol>
    <li>Leggi il codice e scrivi la tua ipotesi <em>prima</em> di guardare il grafico.</li>
    <li>Guarda i punti e il test del raddoppio.</li>
    <li>Scegli la classe e premi <strong>Verifica</strong>: la curva della tua risposta viene sovrapposta ai punti.</li>
  </ol>
</section>

<section id="gioco">
  <h2>Indovina la complessità</h2>
  <div data-mount="gioco"></div>
</section>

<section id="raddoppio">
  <h2>Il test del raddoppio</h2>
  <p>Se non si sa la formula, si può confrontare ${m('T(2n)')} con ${m('T(n)')}: il rapporto dice come cresce il costo.</p>
  ${table({
    head: [m('T(2n)/T(n)') + ' circa…', 'classe', 'perché'],
    rows: [
      ['1', `${m('Θ(1)')} (o ${m('log log n')})`, 'il costo non dipende da ' + m('n')],
      [`poco più di 1, e scende`, m('Θ(log n)'), m('log(2n) = log n + 1') + ': si aggiunge un passo'],
      ['1,41', m('Θ(√n)'), m('√(2n) = √2 · √n')],
      ['2', m('Θ(n)'), 'il doppio dei dati, il doppio del lavoro'],
      ['poco più di 2', m('Θ(n log n)'), m('2n log(2n) = 2 n log n + 2n')],
      ['4', m('Θ(n^2)'), m('(2n)^2 = 4n^2')],
      ['8', m('Θ(n^3)'), m('(2n)^3 = 8n^3')],
      ['enorme, e cresce', 'esponenziale', `qui conviene guardare ${m('T(n+1)/T(n)')}: è costante (per esempio 2, o 1,618)`],
    ],
  })}
  ${box('errore', `<p>Le misure ingannano sui ${m('n')} piccoli e sulle classi vicine: con pochi punti ${m('n log n')} sembra
  ${m('n')}, e ${m('log log n')} sembra una costante. All'esame non basta "ho provato e cresce come ${m('n^2')}": serve il conto
  dei giri come nel capitolo ${ASD.link('cx-metodo', null, 'Il metodo')}.</p>`)}
</section>

<section id="cpp">
  <h2>Lo stesso esperimento in C++</h2>
  <p>Il programma qui sotto contiene tutti i frammenti e stampa quante volte gira <code>op++</code> per
  ${m('n = 10, 100, 1000')}. Il sito usa esattamente gli stessi conteggi (e controlla da solo che coincidano).</p>
  <div data-mount="prog"></div>
  <pre class="code-out" tabindex="0"><code>frammento            n=10      n=100     n=1000
ciclo semplice              10       100      1000
due in sequenza             20       200      2000
annidati                   100     10000   1000000
triangolo                   45      4950    499500
passo tre                    4        34       334
costante                  1000      1000      1000
raddoppio                    4         7        10
n log n                     40       700     10000
dimezza e scorri            18       197      1994
radice                       3        10        31
tre cicli                  120    161700 166167000
armonico                    33       573      8053
quadrato del passo           2         3         4
ricorsione doppia   n=10: 177  n=20: 21891  n=25: 242785</code></pre>
  <h3>Misurare il tempo vero</h3>
  <p>Contare le operazioni è la misura giusta per ragionare; ma a volte vuoi sapere quanto ci mette davvero il tuo
  programma. In C++ si usa <code>&lt;chrono&gt;</code>: si legge l'orologio prima e dopo.</p>
  <div data-mount="crono"></div>
  <p>Un'esecuzione su un portatile (i tuoi numeri saranno diversi, ma i rapporti simili):</p>
  <pre class="code-out" tabindex="0"><code>      n   insertion (ms)   std::sort (ms)
   4000              1.7              0.2
   8000              5.9              0.4
  16000             23.4              1.0
  32000            122.0              2.1
  64000            377.3              4.9</code></pre>
  <p>Quando ${m('n')} raddoppia, l'insertion sort ci mette circa 4 volte tanto (${m('Θ(n^2)')}) e <code>std::sort</code>
  poco più del doppio (${m('Θ(n log n)')}). I rapporti non sono esatti: la cache del processore, gli altri programmi e
  le misure troppo brevi sporcano i numeri. Per questo le misure vanno fatte su ${m('n')} grandi e ripetute.</p>
  ${box('nota', `Compila con <code>-O2</code> quando misuri i tempi: senza ottimizzazioni il compilatore genera codice molto
  più lento e i confronti tra algoritmi diventano poco significativi.`, 'Ottimizzazioni')}
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        gioco: mountGioco,
        prog: (host) => ASD.code(host, { src: 'complessita/laboratorio', maxHeight: 380 }),
        crono: (host) => ASD.code(host, { src: 'complessita/cronometro', region: 'misura' }),
        quiz: (host) =>
          ASD.quiz(host, [
            {
              q: 'Misuri un programma: con n = 1000 fa 2 milioni di passi, con n = 2000 ne fa 8 milioni. Che complessità ti aspetti?',
              options: [m('Θ(n)'), m('Θ(n log n)'), m('Θ(n^2)'), m('Θ(2^n)')],
              answer: 2,
              explain: `${m('T(2n)/T(n) = 8/2 = 4')}: raddoppiando ${m('n')} il lavoro quadruplica, come ${m('n^2')}. (Infatti ${m('2 · 1000^2 = 2')} milioni.)`,
            },
            {
              q: 'Il rapporto T(2n)/T(n) vale circa 2,1 e scende lentamente verso 2 al crescere di n. Quale classe?',
              options: [m('Θ(n)'), m('Θ(n log n)'), m('Θ(n^2)')],
              answer: 1,
              explain: `${m('2n log(2n) / (n log n) = 2 (log n + 1)/log n = 2 + 2/log n')}: poco più di 2, e la differenza si riduce come ${m('1/log n')}.`,
            },
            {
              q: 'Il frammento "Dimezza e scorri" ha due cicli annidati e uno dei due dimezza l\'indice. Perché non è Θ(n log n)?',
              code: 'for (int i = n; i > 0; i /= 2)\n    for (int j = 0; j < i; j++)\n        op++;',
              options: [
                'Perché il ciclo esterno fa solo un giro',
                `Perché il ciclo interno fa ${m('i')} giri e ${m('i')} si dimezza: ${m('n + n/2 + n/4 + … < 2n')}`,
                'Perché il compilatore ottimizza il ciclo interno',
              ],
              answer: 1,
              explain: `I giri esterni sono circa ${m('log n')}, ma i giri interni non sono sempre ${m('n')}: si dimezzano. La somma è una serie
              geometrica, ${m('Θ(n)')}. ${m('n log n')} è solo un tetto, non stretto.`,
            },
            {
              q: 'Per la ricorsione doppia il test del raddoppio dà numeri enormi. Cosa conviene guardare?',
              options: [m('T(n+1)/T(n)'), m('T(n)/n'), m('T(n) - T(n-1)')],
              answer: 0,
              explain: `Per una crescita esponenziale ${m('c^n')} il rapporto tra due termini consecutivi è costante e vale ${m('c')}: qui
              circa 1,618, il rapporto aureo.`,
            },
          ]),
      });
    },
  });
})();
