/* ASD a quadretti — utilità comuni alla parte "Complessità": ASD.cx.

   ASD.cx.derivation(host, { title, code, steps })   conto guidato riga per riga
   ASD.cx.fns                                        funzioni di crescita (1, log n, …, n!)
   ASD.cx.timeFor(fnId, n, opsPerSec)                quanto ci mette f(n) operazioni
   ASD.cx.snippets                                   frammenti del laboratorio con il loro conteggio esatto */
(function () {
  'use strict';

  const { h, m } = ASD;
  const cx = (ASD.cx = ASD.cx || {});

  /* -------------------------------------------------- funzioni di crescita */

  const LOG10_2 = Math.log10(2);

  /** log10 di n! (Stirling per n grandi, esatto per n piccoli). */
  function log10Fact(n) {
    if (n < 2) return 0;
    if (n < 171) {
      let s = 0;
      for (let k = 2; k <= n; k++) s += Math.log10(k);
      return s;
    }
    return (n * Math.log(n) - n + 0.5 * Math.log(2 * Math.PI * n)) / Math.LN10;
  }

  const lg = (n) => Math.log2(Math.max(1, n));

  cx.fns = [
    { id: '1', label: '1', theta: 'Θ(1)', name: 'costante', f: () => 1, log10: () => 0 },
    { id: 'loglog', label: 'log log n', theta: 'Θ(log log n)', name: 'doppio logaritmo', f: (n) => lg(Math.max(2, lg(n))), log10: (n) => Math.log10(lg(Math.max(2, lg(n)))) },
    { id: 'log', label: 'log n', theta: 'Θ(log n)', name: 'logaritmica', f: (n) => lg(n), log10: (n) => Math.log10(Math.max(1e-9, lg(n))) },
    { id: 'sqrt', label: '√n', theta: 'Θ(√n)', name: 'radice', f: (n) => Math.sqrt(n), log10: (n) => 0.5 * Math.log10(n) },
    { id: 'n', label: 'n', theta: 'Θ(n)', name: 'lineare', f: (n) => n, log10: (n) => Math.log10(n) },
    { id: 'nlogn', label: 'n log n', theta: 'Θ(n log n)', name: 'quasi lineare', f: (n) => n * lg(n), log10: (n) => Math.log10(n) + Math.log10(Math.max(1e-9, lg(n))) },
    { id: 'n2', label: 'n²', theta: 'Θ(n^2)', name: 'quadratica', f: (n) => n * n, log10: (n) => 2 * Math.log10(n) },
    { id: 'n3', label: 'n³', theta: 'Θ(n^3)', name: 'cubica', f: (n) => n * n * n, log10: (n) => 3 * Math.log10(n) },
    { id: 'exp', label: '2ⁿ', theta: 'Θ(2^n)', name: 'esponenziale', f: (n) => Math.pow(2, n), log10: (n) => n * LOG10_2 },
    { id: 'fact', label: 'n!', theta: 'Θ(n!)', name: 'fattoriale', f: (n) => Math.pow(10, log10Fact(n)), log10: log10Fact },
  ];

  cx.fn = (id) => cx.fns.find((f) => f.id === id);

  /* ----------------------------------------------------------- tempi reali */

  const YEAR = 365.25 * 24 * 3600;
  const UNIVERSE = 13.8e9 * YEAR;

  /** Testo leggibile per un tempo espresso come log10 dei secondi. */
  cx.timeText = function (log10s) {
    if (!Number.isFinite(log10s)) return '—';
    const s = Math.pow(10, log10s);
    const f1 = (v) => v.toLocaleString('it-IT', { maximumFractionDigits: v < 10 ? 1 : 0 });
    if (log10s < -9) return 'meno di 1 ns';
    if (s < 1e-6) return f1(s * 1e9) + ' ns';
    if (s < 1e-3) return f1(s * 1e6) + ' µs';
    if (s < 1) return f1(s * 1e3) + ' ms';
    if (s < 60) return f1(s) + ' s';
    if (s < 3600) return f1(s / 60) + ' min';
    if (s < 86400) return f1(s / 3600) + ' ore';
    if (s < YEAR) return f1(s / 86400) + ' giorni';
    if (s < 1000 * YEAR) return f1(s / YEAR) + ' anni';
    if (log10s > Math.log10(UNIVERSE)) return 'più dell\'età dell\'universo';
    const e = Math.floor(log10s - Math.log10(YEAR));
    return `circa 10<sup>${e}</sup> anni`;
  };

  /** Tempo per eseguire f(n) operazioni a opsPerSec operazioni al secondo (testo HTML). */
  cx.timeFor = function (fnId, n, opsPerSec = 1e9) {
    const fn = cx.fn(fnId);
    return cx.timeText(fn.log10(n) - Math.log10(opsPerSec));
  };

  /* ----------------------------------------------------- conto guidato */

  /**
   * Un conto svolto un passo alla volta: a ogni passo si evidenzia una riga del
   * codice, si scrive a margine il suo costo (penna rossa) e sulla lavagna si
   * aggiunge una riga del ragionamento.
   *
   * steps: [{ line, text, notes: { etichetta | numeroRiga: 'html' }, total: 'html', board: 'html' | ['html'], clear }]
   *   notes si accumulano da un passo all'altro (null cancella una nota);
   *   board aggiunge righe alla lavagna (clear: true la pulisce prima);
   *   total resta finché un passo non lo cambia.
   */
  cx.derivation = function (host, o) {
    const frames = [];
    let notes = {};
    let board = [];
    let total = '';
    for (const st of o.steps) {
      if (st.notes) {
        notes = { ...notes };
        for (const [k, v] of Object.entries(st.notes)) {
          if (v == null) delete notes[k];
          else notes[k] = v;
        }
      }
      if (st.clear) board = [];
      if (st.board) board = board.concat(st.board);
      if (st.total !== undefined) total = st.total;
      frames.push({ line: st.line == null ? null : st.line, note: st.text || '', vars: st.vars || {}, count: {}, state: { notes, board, total } });
    }
    return ASD.stepper(host, {
      id: o.id || 'conto',
      title: o.title || 'Conto guidato',
      code: o.code ? Object.assign({ maxHeight: 420 }, o.code) : null,
      view: (stage) => new BoardView(stage, o),
      trace: () => frames,
    });
  };

  class BoardView {
    constructor(stage, o) {
      this.el = h('div.cx-board', { 'aria-live': 'off' });
      if (o.boardTitle) stage.append(h('p.cx-board-title', { text: o.boardTitle }));
      stage.append(this.el);
    }

    render(st, frame, stepper) {
      if (stepper && stepper.code) stepper.code.setNotes(st.notes || {}, st.total || '');
      const lines = st.board || [];
      this.el.replaceChildren(
        ...lines.map((html, k) => h('p.cx-board-line' + (k === lines.length - 1 ? '.is-new' : ''), { html }))
      );
      if (!lines.length) this.el.append(h('p.cx-board-empty', { text: 'Qui compare il conto, una riga alla volta.' }));
    }
  }

  /* ------------------------------------------------ frammenti del laboratorio */

  const L = (n) => {
    let c = 0;
    for (let i = 1; i < n; i *= 2) c++;
    return c;
  };

  /* Ogni frammento: codice C++, conteggio esatto di op++ (uguale a esempi/complessita/laboratorio.cpp),
     risposta giusta (id di cx.fns), intervallo di n sensato e spiegazione. */
  cx.snippets = [
    {
      id: 'semplice',
      title: 'Ciclo semplice',
      code: 'for (int i = 0; i < n; i++)\n    op++;',
      count: (n) => n,
      answer: 'n',
      nMax: 1000,
      why: `Il corpo viene eseguito una volta per ogni <code>i</code> da 0 a ${m('n-1')}: ${m('n')} volte. ${m('T(n) = n = Θ(n)')}.`,
    },
    {
      id: 'sequenza',
      title: 'Due cicli in sequenza',
      code: 'for (int i = 0; i < n; i++)\n    op++;\nfor (int j = 0; j < n; j++)\n    op++;',
      count: (n) => 2 * n,
      answer: 'n',
      nMax: 1000,
      why: `Due cicli <em>uno dopo l'altro</em> si <strong>sommano</strong>: ${m('n + n = 2n = Θ(n)')}. Si moltiplicano solo se sono uno dentro l'altro.`,
    },
    {
      id: 'annidati',
      title: 'Cicli annidati',
      code: 'for (int i = 0; i < n; i++)\n    for (int j = 0; j < n; j++)\n        op++;',
      count: (n) => n * n,
      answer: 'n2',
      nMax: 300,
      why: `Per ognuno degli ${m('n')} valori di <code>i</code> il ciclo interno fa ${m('n')} giri: ${m('n · n = n^2')}. ${m('Θ(n^2)')}.`,
    },
    {
      id: 'triangolo',
      title: 'Triangolo',
      code: 'for (int i = 0; i < n; i++)\n    for (int j = 0; j < i; j++)\n        op++;',
      count: (n) => (n * (n - 1)) / 2,
      answer: 'n2',
      nMax: 300,
      why: `Il ciclo interno fa ${m('i')} giri: ${m('0 + 1 + … + (n-1) = n(n-1)/2')}. Metà del quadrato, ma la metà è una costante: ${m('Θ(n^2)')}.`,
    },
    {
      id: 'passo3',
      title: 'Passo di tre',
      code: 'for (int i = 0; i < n; i += 3)\n    op++;',
      count: (n) => Math.ceil(n / 3),
      answer: 'n',
      nMax: 1000,
      why: `<code>i</code> avanza di 3 alla volta: ${m('⌈n/3⌉')} giri. Dividere per una costante non cambia la crescita: ${m('Θ(n)')}.`,
    },
    {
      id: 'costante',
      title: 'Limite fisso',
      code: 'for (int i = 0; i < 1000; i++)\n    op++;',
      count: () => 1000,
      answer: '1',
      nMax: 1000,
      why: `Il ciclo non dipende da ${m('n')}: fa sempre 1000 giri. Mille è tanto, ma è una costante: ${m('Θ(1)')}.`,
    },
    {
      id: 'raddoppio',
      title: 'Indice che raddoppia',
      code: 'for (int i = 1; i < n; i *= 2)\n    op++;',
      count: L,
      answer: 'log',
      nMax: 4096,
      why: `<code>i</code> vale 1, 2, 4, 8, …: dopo ${m('k')} giri vale ${m('2^k')}. Ci si ferma quando ${m('2^k >= n')}, cioè dopo ${m('⌈log_2 n⌉')} giri: ${m('Θ(log n)')}.`,
    },
    {
      id: 'nlogn',
      title: 'Lineare per logaritmico',
      code: 'for (int i = 0; i < n; i++)\n    for (int j = 1; j < n; j *= 2)\n        op++;',
      count: (n) => n * L(n),
      answer: 'nlogn',
      nMax: 1000,
      why: `Il ciclo esterno fa ${m('n')} giri, quello interno raddoppia e ne fa ${m('⌈log_2 n⌉')}: il prodotto è ${m('Θ(n log n)')}.`,
    },
    {
      id: 'dimezza',
      title: 'Dimezza e scorri',
      code: 'for (int i = n; i > 0; i /= 2)\n    for (int j = 0; j < i; j++)\n        op++;',
      count: (n) => {
        let c = 0;
        for (let i = n; i > 0; i = Math.floor(i / 2)) c += i;
        return c;
      },
      answer: 'n',
      nMax: 1000,
      why: `Sembra ${m('n log n')} (due cicli, uno dimezza) ma non lo è: il ciclo interno fa ${m('i')} giri e ${m('i')} si dimezza, quindi ${m('n + n/2 + n/4 + … <= 2n')}. Serie geometrica: ${m('Θ(n)')}.`,
    },
    {
      id: 'radice',
      title: 'Fino alla radice',
      code: 'for (int i = 1; i * i <= n; i++)\n    op++;',
      count: (n) => Math.floor(Math.sqrt(n + 0.5)),
      answer: 'sqrt',
      nMax: 4000,
      why: `Il ciclo continua finché ${m('i^2 <= n')}, cioè per ${m('i')} fino a ${m('⌊√n⌋')}: ${m('Θ(√n)')}. È il ciclo tipico del test di primalità.`,
    },
    {
      id: 'tre',
      title: 'Tre cicli dipendenti',
      code: 'for (int i = 0; i < n; i++)\n    for (int j = 0; j < i; j++)\n        for (int k = 0; k < j; k++)\n            op++;',
      count: (n) => (n * (n - 1) * (n - 2)) / 6,
      answer: 'n3',
      nMax: 120,
      why: `Si contano le terne ${m('k < j < i < n')}: sono ${m('n(n-1)(n-2)/6')}, un sesto del cubo. ${m('Θ(n^3)')}.`,
    },
    {
      id: 'armonico',
      title: 'Passo che cresce',
      code: 'for (int i = 1; i <= n; i++)\n    for (int j = 0; j < n; j += i)\n        op++;',
      count: (n) => {
        let c = 0;
        for (let i = 1; i <= n; i++) c += Math.ceil(n / i);
        return c;
      },
      answer: 'nlogn',
      nMax: 1000,
      why: `Per ogni ${m('i')} il ciclo interno fa circa ${m('n/i')} giri: ${m('n(1 + 1/2 + 1/3 + … + 1/n) = n · H_n')}. La serie armonica ${m('H_n')} cresce come ${m('ln n')}: ${m('Θ(n log n)')}.`,
    },
    {
      id: 'quadrato',
      title: 'Indice al quadrato',
      code: 'for (long long i = 2; i < n; i = i * i)\n    op++;',
      count: (n) => {
        let c = 0;
        for (let i = 2; i < n; i = i * i) c++;
        return c;
      },
      answer: 'loglog',
      nMax: 100000,
      why: `<code>i</code> vale ${m('2, 4, 16, 256, 65536, …')}: l'esponente raddoppia a ogni giro (${m('i = 2^{2^k}')}). Ci si ferma quando ${m('2^k >= log_2 n')}: ${m('Θ(log log n)')}. Cresce così piano che sembra costante.`,
    },
    {
      id: 'ricorsione',
      title: 'Ricorsione doppia',
      code: 'int f(int n) {\n    op++;\n    if (n <= 1) return 1;\n    return f(n - 1) + f(n - 2);\n}',
      count: (n) => {
        const c = [1, 1];
        for (let k = 2; k <= n; k++) c[k] = c[k - 1] + c[k - 2] + 1;
        return c[n];
      },
      answer: 'exp',
      nMax: 25,
      why: `Le chiamate sono ${m('C(n) = C(n-1) + C(n-2) + 1')}: crescono come i numeri di Fibonacci, cioè come ${m('φ^n')} con ${m('φ ≈ 1,618')}. È esponenziale: ogni volta che ${m('n')} aumenta di 1, il lavoro si moltiplica per circa 1,6.`,
    },
  ];

  /* Valori stampati da esempi/complessita/laboratorio.cpp: il sito deve contare esattamente come il C++. */
  cx.snippetCheck = {
    semplice: [10, 100, 1000],
    sequenza: [20, 200, 2000],
    annidati: [100, 10000, 1000000],
    triangolo: [45, 4950, 499500],
    passo3: [4, 34, 334],
    costante: [1000, 1000, 1000],
    raddoppio: [4, 7, 10],
    nlogn: [40, 700, 10000],
    dimezza: [18, 197, 1994],
    radice: [3, 10, 31],
    tre: [120, 161700, 166167000],
    armonico: [33, 573, 8053],
    quadrato: [2, 3, 4],
  };

  cx.selfCheck = function () {
    for (const sn of cx.snippets) {
      const want = cx.snippetCheck[sn.id];
      if (!want) continue;
      [10, 100, 1000].forEach((n, k) => {
        if (sn.count(n) !== want[k]) console.error(`[laboratorio] il conteggio di "${sn.id}" per n=${n} è ${sn.count(n)}, il C++ dice ${want[k]}`);
      });
    }
    const rec = cx.snippets.find((s) => s.id === 'ricorsione');
    if (rec.count(10) !== 177 || rec.count(20) !== 21891 || rec.count(25) !== 242785) console.error('[laboratorio] conteggio della ricorsione doppia diverso dal C++');
  };
})();
