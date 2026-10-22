/* ASD a quadretti — capitolo "Notazioni O, Ω, Θ": definizioni con c e n₀
   (verificabili sul grafico), regole pratiche, scala delle funzioni, tempi reali. */
(function () {
  'use strict';

  const { h, m, box, table } = ASD;
  const lg = (n) => Math.log2(Math.max(1, n));

  /* Coppie f, g per il laboratorio. ok: dove la definizione si può soddisfare. */
  const PRESETS = [
    {
      id: 'poli',
      label: '3n² + 5n + 10 e n²',
      f: (n) => 3 * n * n + 5 * n + 10,
      g: (n) => n * n,
      fs: '3n^2 + 5n + 10',
      gs: 'n^2',
      xMax: 20,
      cMax: 10,
      start: { mode: 'O', c: 3, c1: 1, n0: 1 },
      ok: { O: true, Ω: true, Θ: true },
      hint: `Con ${m('c = 4')} serve ${m('5n + 10 <= n^2')}, vero da ${m('n = 7')} in poi. Per Ω basta ${m('c = 3')} con ${m('n_0 = 1')}.`,
    },
    {
      id: 'lin-quad',
      label: '100n e n²',
      f: (n) => 100 * n,
      g: (n) => n * n,
      fs: '100n',
      gs: 'n^2',
      xMax: 300,
      cMax: 5,
      start: { mode: 'O', c: 1, c1: 1, n0: 20 },
      ok: { O: true, Ω: false, Θ: false },
      hint: `${m('100n <= c · n^2')} vale per ${m('n >= 100/c')}: con ${m('c = 1')} basta ${m('n_0 = 100')}. Per Ω invece ${m('f/g = 100/n')} va a zero: nessuna costante funziona.`,
    },
    {
      id: 'quad-lin',
      label: 'n² e 100n',
      f: (n) => n * n,
      g: (n) => 100 * n,
      fs: 'n^2',
      gs: '100n',
      xMax: 600,
      cMax: 5,
      start: { mode: 'O', c: 2, c1: 1, n0: 0 },
      ok: { O: false, Ω: true, Θ: false },
      hint: `${m('f(n)/g(n) = n/100')} cresce senza limite: qualunque ${m('c')} scegli, per ${m('n > 100c')} la disuguaglianza si rompe. Quindi ${m('n^2')} <strong>non</strong> è ${m('O(100n)')}, ma è ${m('Ω(n)')}.`,
    },
    {
      id: 'nlogn',
      label: 'n log₂ n e n²',
      f: (n) => n * lg(n),
      g: (n) => n * n,
      fs: 'n log_2 n',
      gs: 'n^2',
      xMax: 40,
      cMax: 5,
      start: { mode: 'O', c: 0.5, c1: 1, n0: 0 },
      ok: { O: true, Ω: false, Θ: false },
      hint: `${m('log_2 n <= n')} per ogni ${m('n >= 1')}, quindi ${m('n log_2 n <= n^2')}: ${m('c = 1')}, ${m('n_0 = 1')}.`,
    },
    {
      id: 'lin',
      label: '2n + 3 e n',
      f: (n) => 2 * n + 3,
      g: (n) => n,
      fs: '2n + 3',
      gs: 'n',
      xMax: 20,
      cMax: 6,
      start: { mode: 'Θ', c: 2.5, c1: 1, n0: 1 },
      ok: { O: true, Ω: true, Θ: true },
      hint: `${m('2n <= 2n + 3 <= 3n')} per ${m('n >= 3')}: ${m('c_1 = 2')}, ${m('c_2 = 3')}, ${m('n_0 = 3')}.`,
    },
    {
      id: 'exp',
      label: '2ⁿ⁺¹ e 2ⁿ',
      f: (n) => Math.pow(2, n + 1),
      g: (n) => Math.pow(2, n),
      fs: '2^{n+1}',
      gs: '2^n',
      xMax: 12,
      cMax: 4,
      start: { mode: 'O', c: 1.5, c1: 1, n0: 0 },
      ok: { O: true, Ω: true, Θ: true },
      hint: `${m('2^{n+1} = 2 · 2^n')}: con ${m('c = 2')} vale per ogni ${m('n')}. Attenzione però: ${m('2^{2n} = 4^n')} <strong>non</strong> è ${m('O(2^n)')}.`,
    },
    {
      id: 'log',
      label: 'n e log₂ n',
      f: (n) => n,
      g: (n) => lg(n),
      fs: 'n',
      gs: 'log_2 n',
      xMax: 80,
      cMax: 10,
      start: { mode: 'O', c: 5, c1: 1, n0: 2 },
      ok: { O: false, Ω: true, Θ: false },
      hint: `${m('n / log_2 n')} cresce senza limite: ${m('n')} non è ${m('O(log n)')}. Al contrario ${m('n >= log_2 n')} sempre: ${m('n = Ω(log n)')}.`,
    },
  ];

  const CHECK_MAX = 100000;

  /** Primo n intero ≥ n0 (fino a CHECK_MAX) in cui la definizione non vale, oppure null. */
  function firstViolation(p, mode, c, c1, n0) {
    const start = Math.max(1, Math.ceil(n0));
    const limit = p.id === 'exp' ? 1000 : CHECK_MAX;
    for (let n = start; n <= limit; n++) {
      const f = p.f(n);
      const g = p.g(n);
      if (!Number.isFinite(f) || !Number.isFinite(g)) break;
      const eps = 1e-9 * Math.max(1, Math.abs(f));
      if ((mode === 'O' || mode === 'Θ') && f > c * g + eps) return { n, f, bound: c * g, side: 'sopra' };
      if (mode === 'Ω' && f < c * g - eps) return { n, f, bound: c * g, side: 'sotto' };
      if (mode === 'Θ' && f < c1 * g - eps) return { n, f, bound: c1 * g, side: 'sotto' };
    }
    return null;
  }

  function mountLab(host) {
    const lab = h('div.lab');
    const body = h('div.lab-body');
    const ctr = h('div.lab-controls');
    const out = h('div.lab-out');
    lab.append(h('div.lab-head', h('h3', { text: 'Trova c e n₀' })), body, ctr, out);
    host.append(lab);

    let p = PRESETS[0];
    let mode = p.start.mode;

    const presetBox = h('div.cx-presets', { role: 'group', 'aria-label': 'Coppie di funzioni' });
    const presetBtns = PRESETS.map((pr) => {
      const b = h('button.btn.btn-sm', { type: 'button', 'aria-pressed': String(pr === p), html: pr.label });
      b.addEventListener('click', () => choose(pr));
      presetBox.append(b);
      return b;
    });
    const fx = h('p.cx-fx');
    body.append(h('p', { class: 'eyebrow', text: 'Scegli le funzioni' }), presetBox, fx);
    const plot = new ASD.viz.Plot(body, {
      x: { min: 0, max: 20, label: 'n', integer: true },
      y: { min: 0, label: '' },
      height: 290,
      ariaLabel: 'Grafico di f(n) e c·g(n)',
    });

    const base = ASD.uid('cn0');
    const modeBox = h('fieldset.cx-mode', h('legend.visually-hidden', { text: 'Notazione' }));
    const modeInputs = ['O', 'Ω', 'Θ'].map((k) => {
      const id = `${base}-m-${k === 'Ω' ? 'omega' : k === 'Θ' ? 'theta' : 'o'}`;
      const input = h('input', { type: 'radio', name: base + '-mode', id, value: k });
      input.addEventListener('change', () => {
        mode = k;
        draw();
      });
      modeBox.append(h('label.chip', { for: id }, input, k === 'O' ? 'O grande' : k));
      return input;
    });
    const slider = (key, label) => {
      const id = `${base}-${key}`;
      const input = h('input', { type: 'range', id, min: '0', max: '10', step: '0.1', value: '1' });
      const output = h('output', { for: id });
      const wrap = h('label.slider', { for: id }, h('span', { html: label }), input, output);
      input.addEventListener('input', draw);
      return { input, output, wrap };
    };
    const sC1 = slider('c1', `${m('c_1')} (sotto)`);
    const sC = slider('c', m('c'));
    const sN0 = slider('n0', m('n_0'));
    ctr.append(h('span.field', 'Notazione', modeBox), sC1.wrap, sC.wrap, sN0.wrap);

    function choose(pr) {
      p = pr;
      mode = pr.start.mode;
      presetBtns.forEach((b, k) => b.setAttribute('aria-pressed', String(PRESETS[k] === pr)));
      sC.input.max = String(pr.cMax);
      sC.input.step = pr.cMax > 6 ? '0.5' : '0.1';
      sC1.input.max = String(pr.cMax);
      sC1.input.step = sC.input.step;
      sN0.input.max = String(pr.xMax);
      sN0.input.step = '1';
      sC.input.value = String(pr.start.c);
      sC1.input.value = String(pr.start.c1);
      sN0.input.value = String(pr.start.n0);
      plot.o.x.max = pr.xMax;
      draw();
    }

    function draw() {
      modeInputs.forEach((inp) => (inp.checked = inp.value === mode));
      const c = Number(sC.input.value);
      const c1 = Number(sC1.input.value);
      const n0 = Number(sN0.input.value);
      sC.output.textContent = ASD.fmt(c);
      sC1.output.textContent = ASD.fmt(c1);
      sN0.output.textContent = ASD.fmt(n0);
      sC1.wrap.hidden = mode !== 'Θ';
      const cName = mode === 'Θ' ? 'c_2' : 'c';
      sC.wrap.querySelector('span').innerHTML = mode === 'Θ' ? `${m('c_2')} (sopra)` : m('c');

      const rel = mode === 'O' ? 'f(n) <= c · g(n)' : mode === 'Ω' ? 'f(n) >= c · g(n)' : 'c_1 · g(n) <= f(n) <= c_2 · g(n)';
      fx.innerHTML = `${m(`f(n) = ${p.fs}`)}, &nbsp; ${m(`g(n) = ${p.gs}`)} &nbsp;—&nbsp; si cerca ${m(rel)} per ogni ${m('n >= n_0')}`;

      const bad = [];
      for (let n = Math.max(1, Math.ceil(n0)); n <= p.xMax; n++) {
        const f = p.f(n);
        const g = p.g(n);
        if (((mode === 'O' || mode === 'Θ') && f > c * g + 1e-9) || (mode === 'Ω' && f < c * g - 1e-9) || (mode === 'Θ' && f < c1 * g - 1e-9)) bad.push([n, f]);
      }
      let yMax = 0;
      for (let n = 0; n <= p.xMax; n += Math.max(1, p.xMax / 200)) yMax = Math.max(yMax, p.f(n), c * p.g(n), mode === 'Θ' ? c1 * p.g(n) : 0);
      plot.o.y.max = yMax * 1.08 || 1;
      const series = [{ id: 'f', label: 'f(n)', slot: 1, fn: p.f }];
      series.push({ id: 'cg', label: mode === 'Θ' ? 'c₂·g(n)' : 'c·g(n)', slot: 2, fn: (n) => c * p.g(n), dashed: true });
      if (mode === 'Θ') series.push({ id: 'c1g', label: 'c₁·g(n)', slot: 7, fn: (n) => c1 * p.g(n), dashed: true });
      plot.set({ series, bands: [{ from: n0, to: p.xMax }], vlines: [{ x: n0, label: 'n₀' }], bad });

      const v = firstViolation(p, mode, c, c1, n0);
      const notation = mode === 'O' ? `O(${p.gs})` : mode === 'Ω' ? `Ω(${p.gs})` : `Θ(${p.gs})`;
      let html;
      if (!v) {
        const consts = mode === 'Θ' ? `${m(`c_1 = ${ASD.fmt(c1)}`)}, ${m(`c_2 = ${ASD.fmt(c)}`)}` : m(`c = ${ASD.fmt(c)}`);
        html = `<p class="cx-verdict ok"><strong class="vd">Definizione soddisfatta.</strong>Con ${consts} e ${m(`n_0 = ${ASD.fmt(n0)}`)} la disuguaglianza vale per ogni ${m('n >= n_0')}: ${m(`f(n) = ${notation}`)}.</p>`;
      } else {
        const outside = v.n > p.xMax ? ' (fuori dal grafico: la verifica guarda molto più lontano di quanto si vede)' : '';
        const which = v.side === 'sopra' ? `${m('f(n)')} supera ${m(mode === 'Θ' ? 'c_2 · g(n)' : 'c · g(n)')}` : `${m('f(n)')} scende sotto ${m(mode === 'Θ' ? 'c_1 · g(n)' : 'c · g(n)')}`;
        const fixable = p.ok[mode];
        html =
          `<p class="cx-verdict no"><strong class="vd">Non ancora.</strong>Per ${m(`n = ${v.n}`)}${outside}, ${which}: ${m(`f(${v.n}) = ${ASD.fmtCompact(v.f)}`)} contro ${ASD.fmtCompact(v.bound)}. ` +
          (fixable ? `Cambia le costanti: ${mode === 'Ω' ? `prova un ${m('c')} più piccolo` : `prova un ${m(cName)} più grande`} o un ${m('n_0')} più grande.` : `Qui <strong>nessuna</strong> scelta di costanti può funzionare: ${m(`f(n) ≠ ${notation}`)}.`) +
          '</p>';
      }
      out.innerHTML = html + `<p style="margin:.6em 0 0">${p.hint}</p>`;
    }

    choose(p);
  }

  /* Scala delle funzioni: grafico con funzioni da accendere e spegnere. */
  function mountScala(host) {
    const ids = ['1', 'log', 'sqrt', 'n', 'nlogn', 'n2', 'n3', 'exp'];
    const fns = ids.map((id) => ASD.cx.fn(id));
    const on = new Set(['log', 'n', 'nlogn', 'n2', 'exp']);
    const lab = h('div.lab');
    const body = h('div.lab-body');
    const ctr = h('div.lab-controls');
    lab.append(h('div.lab-head', h('h3', { text: 'La scala delle funzioni' })), body, ctr);
    host.append(lab);
    const plot = new ASD.viz.Plot(body, { x: { min: 1, max: 20, label: 'n', integer: false }, y: { min: 0, label: '' }, height: 320, ariaLabel: 'Crescita delle funzioni più comuni' });
    const base = ASD.uid('scala');
    const toggles = h('div.cx-toggles', { role: 'group', 'aria-label': 'Funzioni da mostrare' });
    fns.forEach((f, k) => {
      const id = `${base}-${f.id}`;
      const input = h('input', { type: 'checkbox', id, checked: on.has(f.id) });
      input.addEventListener('change', () => {
        if (input.checked) on.add(f.id);
        else on.delete(f.id);
        draw();
      });
      toggles.append(h('label.chip', { for: id }, input, h('span', { style: { color: `var(--series-${k + 1})` }, 'aria-hidden': 'true', text: '━' }), f.label));
    });
    const nId = `${base}-n`;
    const range = h('input', { type: 'range', id: nId, min: '10', max: '100', step: '10', value: '20' });
    const outN = h('output', { for: nId });
    const logId = `${base}-log`;
    const logBox = h('input', { type: 'checkbox', id: logId });
    ctr.append(toggles, h('label.slider', { for: nId }, h('span', 'Fino a n ='), range, outN), h('label.chip', { for: logId }, logBox, 'scala logaritmica'));
    range.addEventListener('input', draw);
    logBox.addEventListener('change', draw);

    function draw() {
      const N = Number(range.value);
      outN.textContent = String(N);
      plot.o.x.max = N;
      plot.o.y.log = logBox.checked;
      const shown = fns.map((f, k) => ({ f, k })).filter(({ f }) => on.has(f.id));
      let yMax = 0;
      for (const { f } of shown) if (f.id !== 'exp') yMax = Math.max(yMax, f.f(N));
      yMax = Math.max(yMax, 10);
      plot.o.y.max = logBox.checked ? Math.max(10, ...shown.map(({ f }) => f.f(N))) * 1.5 : yMax * 1.1;
      plot.o.y.min = logBox.checked ? 1 : 0;
      plot.set({ series: shown.map(({ f, k }) => ({ id: f.id, label: f.label, slot: k + 1, fn: f.f })) });
    }
    draw();
  }

  function mountTempi(host) {
    const ids = ['log', 'n', 'nlogn', 'n2', 'n3', 'exp', 'fact'];
    const ns = [10, 100, 1000, 1e6, 1e9];
    const rows = ids.map((id) => {
      const f = ASD.cx.fn(id);
      return [m(f.label)].concat(
        ns.map((n) => {
          const log10s = f.log10(n) - 9;
          const txt = ASD.cx.timeText(log10s);
          return log10s > Math.log10(3600) ? `<span class="slow">${txt}</span>` : txt;
        })
      );
    });
    const html = table({
      caption: 'Tempo per eseguire f(n) operazioni a un miliardo di operazioni al secondo',
      head: ['f(n)', m('n = 10'), m('n = 100'), m('n = 1000'), m('n = 10^6'), m('n = 10^9')],
      rows,
      cls: 'cx-times',
    });
    host.innerHTML = html.replace(/<td><span class="slow">/g, '<td class="slow"><span>');
  }

  ASD.chapter({
    id: 'cx-notazioni',
    title: 'Notazioni O, Ω, Θ',
    lead:
      'Le tre notazioni dicono come cresce una funzione ignorando costanti e termini piccoli. Qui non le impari a memoria: scegli tu le costanti c e n₀ e vedi sul grafico se la definizione è soddisfatta.',
    minutes: 35,
    prereq: ['cx-costo'],
    goals: [
      `scrivere e spiegare le definizioni di ${m('O')}, ${m('Ω')} e ${m('Θ')} con le costanti ${m('c')} e ${m('n_0')}`,
      `dimostrare che ${m('f = O(g)')} trovando ${m('c')} e ${m('n_0')}, e riconoscere quando è impossibile`,
      'usare le regole pratiche: costanti, somme, polinomi, logaritmi, limiti',
      'ordinare le funzioni più comuni per velocità di crescita e stimare i tempi reali',
    ],

    render(el) {
      el.innerHTML = `
<section id="o-grande">
  <h2>O grande: un tetto</h2>
  <p>${m('f(n) = O(g(n))')} vuol dire che, da un certo punto in poi, ${m('f')} sta sotto un multiplo di ${m('g')}.
  In formule:</p>
  <p class="formula">${m('f(n) = O(g(n))')} &nbsp;se esistono ${m('c > 0')} e ${m('n_0 >= 0')} tali che
  ${m('f(n) <= c · g(n)')} per ogni ${m('n >= n_0')}</p>
  <p>Le due costanti servono a ignorare i dettagli: ${m('c')} assorbe i fattori costanti (il computer più lento, il
  compilatore peggiore), ${m('n_0')} permette di non guardare gli ${m('n')} piccoli, dove può succedere di tutto.</p>
  <p>Prova: sposta ${m('c')} e ${m('n_0')} finché i punti rossi (gli ${m('n')} dove la disuguaglianza non vale)
  spariscono dalla zona colorata. La verifica controlla gli interi fino a centomila, non solo quelli disegnati.</p>
  <div data-mount="lab"></div>
</section>

<section id="omega">
  <h2>Ω: un pavimento</h2>
  <p>${m('Ω')} è il contrario: ${m('f')} sta <em>sopra</em> un multiplo di ${m('g')}.</p>
  <p class="formula">${m('f(n) = Ω(g(n))')} &nbsp;se esistono ${m('c > 0')} e ${m('n_0')} tali che
  ${m('f(n) >= c · g(n)')} per ogni ${m('n >= n_0')}</p>
  <p>Si usa per dire che un algoritmo (o un problema) richiede <em>almeno</em> un certo lavoro: per esempio ogni
  ordinamento per confronto fa ${m('Ω(n log n)')} confronti nel caso peggiore (${ASD.link('sort-lineari')}).
  Nel laboratorio sopra scegli "Ω" e prova la coppia ${m('n^2')} e ${m('100n')}.</p>
</section>

<section id="theta">
  <h2>Θ: la crescita esatta</h2>
  <p>${m('f = Θ(g)')} se ${m('f')} è sia ${m('O(g)')} sia ${m('Ω(g)')}: è stretta tra due multipli di ${m('g')}.</p>
  <p class="formula">${m('c_1 · g(n) <= f(n) <= c_2 · g(n)')} &nbsp;per ogni ${m('n >= n_0')}</p>
  <p>Esempio svolto: ${m('f(n) = 3n^2 + 5n + 10 = Θ(n^2)')}.</p>
  <ul>
    <li>Sotto: ${m('3n^2 <= 3n^2 + 5n + 10')} per ogni ${m('n')}, quindi ${m('c_1 = 3')}.</li>
    <li>Sopra: voglio ${m('3n^2 + 5n + 10 <= 4n^2')}, cioè ${m('n^2 - 5n - 10 >= 0')}. Le radici sono
    ${m('(5 ± √65)/2')}, la positiva vale circa 6,53: basta ${m('n >= 7')}. Quindi ${m('c_2 = 4')}, ${m('n_0 = 7')}.</li>
  </ul>
  ${box('errore', `<p>${m('O')} è solo un tetto, e un tetto può essere altissimo: "l'insertion sort è ${m('O(n^3)')}" è vero
  ma non dice niente di utile. All'esame dai sempre il limite più stretto, con ${m('Θ')} quando puoi.</p>
  <p>E non confondere le notazioni con i casi: ${m('O')}/${m('Θ')} dicono come cresce una funzione, caso migliore e
  peggiore dicono <em>quale</em> funzione stai guardando. L'insertion sort è ${m('Θ(n^2)')} nel caso peggiore e
  ${m('Θ(n)')} nel caso migliore: due affermazioni, entrambe con ${m('Θ')}.</p>`)}
</section>

<section id="regole">
  <h2>Le regole pratiche</h2>
  <p>Nessuno all'esame cerca ${m('c')} e ${m('n_0')} per ogni algoritmo: si usano queste regole, che seguono dalle
  definizioni.</p>
  ${table({
    head: ['Regola', 'Esempio'],
    rows: [
      ['Le costanti moltiplicative si eliminano', m('5n^2 = Θ(n^2)') + ', ' + m('n/2 = Θ(n)')],
      ['In una somma vince il termine che cresce di più', m('n^2 + 100 n log n + 7 = Θ(n^2)')],
      ['Un polinomio di grado k è Θ(n^k)', m('4n^3 - n^2 + 2 = Θ(n^3)')],
      ['I prodotti si moltiplicano', m('O(n) · O(log n) = O(n log n)')],
      ['La base del logaritmo non conta', m('log_2 n = log_{10} n / log_{10} 2 = Θ(log n)')],
      ['…ma la base dell\'esponenziale sì', m('4^n = (2^n)^2') + ' non è ' + m('O(2^n)')],
      ['Una costante in più all\'esponente no', m('2^{n+1} = 2 · 2^n = Θ(2^n)')],
      ['Transitività', m('f = O(g)') + ' e ' + m('g = O(h)') + ' ⇒ ' + m('f = O(h)')],
      ['Logaritmo del fattoriale', m('log(n!) = Θ(n log n)')],
    ],
  })}
  <h3>Con i limiti</h3>
  <p>Il modo più veloce per confrontare due funzioni è il limite del rapporto ${m('L = lim_{n -> ∞} f(n)/g(n)')}:</p>
  ${table({
    head: ['Se il limite è…', 'allora', 'esempio'],
    rows: [
      [m('L = 0'), `${m('f = O(g)')} ma non ${m('Ω(g)')}`, m('n log n / n^2 = log n / n -> 0')],
      [m('0 < L < ∞'), m('f = Θ(g)'), m('(3n^2 + 5n)/n^2 -> 3')],
      [m('L = ∞'), `${m('f = Ω(g)')} ma non ${m('O(g)')}`, m('2^n / n^3 -> ∞')],
    ],
  })}
  ${box('ricorda', `<p>Ogni potenza di ${m('n')}, anche piccola, batte qualunque potenza del logaritmo
  (${m('(log n)^{100} = O(n^{0,01})')}), e ogni esponenziale batte qualunque polinomio (${m('n^{100} = O(1,01^n)')}).</p>`)}
</section>

<section id="scala">
  <h2>La scala delle funzioni</h2>
  <p class="formula">${m('1 ≺ log log n ≺ log n ≺ √n ≺ n ≺ n log n ≺ n^2 ≺ n^3 ≺ 2^n ≺ n!')}</p>
  <p>Ogni funzione della scala cresce più in fretta di quelle alla sua sinistra. Accendi e spegni le curve, allarga
  ${m('n')}, e prova la scala logaritmica: le differenze tra le prime si vedono solo lì.</p>
  <div data-mount="scala"></div>
  <h3>Quanto tempo ci vuole davvero</h3>
  <p>Un computer normale esegue circa un miliardo di operazioni semplici al secondo. Ecco quanto tempo servirebbe per
  ${m('f(n)')} operazioni. In rosso i tempi oltre un'ora.</p>
  <div data-mount="tempi"></div>
  <p>La tabella spiega perché la complessità conta più dell'hardware: un computer mille volte più veloce sposta di poco
  la colonna in cui un algoritmo ${m('2^n')} diventa inutilizzabile, mentre passare da ${m('n^2')} a ${m('n log n')}
  trasforma giorni in secondi.</p>
</section>

<section id="esame">
  <h2>All'esame</h2>
  <p>Tre domande classiche:</p>
  <ol>
    <li><strong>Vero o falso</strong>: "${m('n^2 = O(n^3)')}" (vero), "${m('2^{2n} = O(2^n)')}" (falso),
    "${m('log(n^2) = Θ(log n)')}" (vero: ${m('log(n^2) = 2 log n')}).</li>
    <li><strong>Ordina per crescita</strong> un elenco di funzioni: confrontale a coppie con il limite del rapporto.</li>
    <li><strong>Dimostra</strong> che ${m('f = Θ(g)')}: trova esplicitamente ${m('c_1')}, ${m('c_2')} e ${m('n_0')}, come
    nell'esempio svolto.</li>
  </ol>
  ${box('esame', `<p>Nelle dimostrazioni scrivi sempre i valori delle costanti e da quale ${m('n_0')} vale la
  disuguaglianza. "Per ${m('n')} abbastanza grande" senza numeri non è una dimostrazione.</p>`)}
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        lab: mountLab,
        scala: mountScala,
        tempi: mountTempi,
        quiz: (host) =>
          ASD.quiz(host, [
            {
              q: `Quale di queste affermazioni è <strong>falsa</strong>?`,
              options: [m('n^2 = O(n^3)'), m('3n + 7 = Θ(n)'), m('2^{2n} = O(2^n)'), m('n log n = O(n^2)')],
              answer: 2,
              explain: `${m('2^{2n} = 4^n')} e ${m('4^n / 2^n = 2^n -> ∞')}: nessuna costante ${m('c')} può bastare. Le altre sono vere
              (la prima è un tetto largo ma corretto).`,
            },
            {
              q: `Per dimostrare che ${m('5n + 20 = O(n)')}, quale coppia di costanti funziona?`,
              options: [`${m('c = 5')}, ${m('n_0 = 0')}`, `${m('c = 6')}, ${m('n_0 = 20')}`, `${m('c = 1')}, ${m('n_0 = 100')}`],
              answer: 1,
              explain: `Serve ${m('5n + 20 <= 6n')}, cioè ${m('n >= 20')}. Con ${m('c = 5')} non basta mai (avanza sempre 20); con ${m('c = 1')}
              la disuguaglianza ${m('5n + 20 <= n')} è falsa per ogni ${m('n')} positivo.`,
            },
            {
              q: `Se ${m('lim_{n -> ∞} f(n)/g(n) = 0')}, cosa si può dire?`,
              options: [`${m('f = Θ(g)')}`, `${m('f = O(g)')} ma non ${m('f = Ω(g)')}`, `${m('f = Ω(g)')}`],
              answer: 1,
              explain: `Il rapporto va a zero: ${m('f')} diventa trascurabile rispetto a ${m('g')}. È sotto ogni multiplo di ${m('g')} (quindi
              ${m('O')}), ma non sopra nessuno (quindi non ${m('Ω')}).`,
            },
            {
              q: `${m('log_2 n')} e ${m('log_{10} n')}: che relazione c'è?`,
              options: ['Sono la stessa funzione', `Sono ${m('Θ')} l'una dell'altra: differiscono per una costante`, `${m('log_2 n')} cresce molto più in fretta`],
              answer: 1,
              explain: `${m('log_2 n = log_{10} n / log_{10} 2 ≈ 3,32 · log_{10} n')}: è un fattore costante, che la notazione ignora. Per
              questo si scrive solo ${m('log n')}.`,
            },
            {
              q: 'Metti in ordine di crescita: n log n, n², √n, 2ⁿ, log n.',
              options: ['log n, √n, n log n, n², 2ⁿ', '√n, log n, n log n, 2ⁿ, n²', 'log n, n log n, √n, n², 2ⁿ'],
              answer: 0,
              explain: `${m('log n ≺ √n')} (ogni potenza batte il logaritmo), poi ${m('n log n ≺ n^2')} e infine l'esponenziale, che
              batte ogni polinomio.`,
            },
            {
              q: 'Un algoritmo Θ(n²) impiega 1 secondo con n = 10 000. Quanto impiega, circa, con n = 100 000?',
              options: ['10 secondi', '100 secondi', '1000 secondi'],
              answer: 1,
              explain: `${m('n')} è diventato 10 volte più grande e il tempo cresce come ${m('n^2')}: ${m('10^2 = 100')} volte di più.`,
            },
          ]),
      });
    },
  });
})();
