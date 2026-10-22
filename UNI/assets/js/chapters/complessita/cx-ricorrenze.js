/* ASD a quadretti — capitolo "Ricorrenze e teorema master": scrivere la
   ricorrenza di una funzione ricorsiva, srotolarla, disegnare l'albero di
   ricorsione livello per livello, e il teorema master con un calcolatore. */
(function () {
  'use strict';

  const { h, m, box, table } = ASD;
  const fmtNum = (v) => (Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : v.toLocaleString('it-IT', { maximumFractionDigits: 3 }));

  /* ------------------------------------------------- srotolare (iterazione) */

  const UNROLL = [
    {
      id: 'lin',
      label: 'T(n−1) + c',
      who: 'somma ricorsiva, fattoriale',
      steps: [
        ['Si parte dalla ricorrenza e si sostituisce ' + m('T(n-1)') + ' con la sua definizione.', 'T(n) = T(n-1) + c'],
        ['Un passo: ' + m('T(n-1) = T(n-2) + c') + '.', '= T(n-2) + 2c'],
        ['Un altro: ' + m('T(n-2) = T(n-3) + c') + '.', '= T(n-3) + 3c'],
        ['Si vede la regola: dopo ' + m('k') + ' passi.', '= T(n-k) + k c'],
        ['Ci si ferma al caso base ' + m('T(1)') + ': serve ' + m('n - k = 1') + ', cioè ' + m('k = n-1') + '.', '= T(1) + (n-1) c'],
        ['Una costante più ' + m('c') + ' volte ' + m('n') + ': lineare.', 'T(n) = Θ(n)'],
      ],
    },
    {
      id: 'quad',
      label: 'T(n−1) + n',
      who: 'selection sort ricorsivo',
      steps: [
        ['La parte non ricorsiva costa ' + m('n') + ': un ciclo su tutto il sottoproblema.', 'T(n) = T(n-1) + n'],
        ['Sostituisco ' + m('T(n-1) = T(n-2) + (n-1)') + '.', '= T(n-2) + (n-1) + n'],
        ['E ancora.', '= T(n-3) + (n-2) + (n-1) + n'],
        ['Dopo ' + m('k') + ' passi.', '= T(n-k) + (n-k+1) + … + (n-1) + n'],
        ['Con ' + m('k = n-1') + ' si arriva a ' + m('T(1)') + ' e resta la somma da 2 a ' + m('n') + '.', '= T(1) + 2 + 3 + … + n = T(1) + n(n+1)/2 - 1'],
        ['Domina ' + m('n^2/2') + '.', 'T(n) = Θ(n^2)'],
      ],
    },
    {
      id: 'log',
      label: 'T(n/2) + c',
      who: 'ricerca binaria',
      steps: [
        ['Ogni chiamata dimezza il problema e fa un lavoro costante.', 'T(n) = T(n/2) + c'],
        ['Sostituisco ' + m('T(n/2) = T(n/4) + c') + '.', '= T(n/4) + 2c'],
        ['E ancora.', '= T(n/8) + 3c'],
        ['Dopo ' + m('k') + ' passi.', '= T(n/2^k) + k c'],
        ['Il caso base arriva quando ' + m('n/2^k = 1') + ', cioè ' + m('k = log_2 n') + '.', '= T(1) + c log_2 n'],
        ['Logaritmica.', 'T(n) = Θ(log n)'],
      ],
    },
    {
      id: 'nlogn',
      label: '2T(n/2) + n',
      who: 'merge sort',
      steps: [
        ['Due sottoproblemi grandi la metà, più un lavoro lineare (la fusione).', 'T(n) = 2T(n/2) + n'],
        ['Sostituisco ' + m('T(n/2) = 2T(n/4) + n/2') + ' e moltiplico per 2.', '= 4T(n/4) + n + n = 4T(n/4) + 2n'],
        ['E ancora: ' + m('4T(n/4) = 8T(n/8) + n') + '.', '= 8T(n/8) + 3n'],
        ['Dopo ' + m('k') + ' passi.', '= 2^k T(n/2^k) + k n'],
        ['Con ' + m('k = log_2 n') + ' si ha ' + m('2^k = n') + '.', '= n T(1) + n log_2 n'],
        ['Domina ' + m('n log_2 n') + '. (Il programma qui sotto lo conferma con i numeri esatti.)', 'T(n) = Θ(n log n)'],
      ],
    },
    {
      id: 'exp',
      label: '2T(n−1) + c',
      who: 'torre di Hanoi',
      steps: [
        ['Due chiamate su un problema più piccolo di uno solo: attenzione, è diverso da ' + m('2T(n/2)') + '.', 'T(n) = 2T(n-1) + c'],
        ['Sostituisco ' + m('T(n-1) = 2T(n-2) + c') + '.', '= 4T(n-2) + 2c + c'],
        ['E ancora.', '= 8T(n-3) + 4c + 2c + c'],
        ['Dopo ' + m('k') + ' passi (serie geometrica).', '= 2^k T(n-k) + (2^k - 1) c'],
        ['Con ' + m('k = n-1') + '.', '= 2^{n-1} T(1) + (2^{n-1} - 1) c'],
        ['Esponenziale: ogni ' + m('n') + ' in più raddoppia il lavoro.', 'T(n) = Θ(2^n)'],
      ],
    },
  ];

  function mountSrotola(host) {
    const lab = h('div');
    const chips = h('div.cx-presets', { role: 'group', 'aria-label': 'Ricorrenze da srotolare' });
    const box2 = h('div');
    lab.append(chips, box2);
    host.append(lab);
    const btns = UNROLL.map((u, k) => {
      const b = h('button.btn.btn-sm', { type: 'button', 'aria-pressed': String(k === 0), html: `${m(u.label.replace('−', '-'))} <span style="color:var(--ink-2)">· ${u.who}</span>` });
      b.addEventListener('click', () => show(k));
      chips.append(b);
      return b;
    });
    function show(k) {
      const u = UNROLL[k];
      btns.forEach((b, j) => b.setAttribute('aria-pressed', String(j === k)));
      box2.replaceChildren();
      ASD.cx.derivation(box2, {
        id: 'srotola-' + u.id,
        title: `Srotolare ${u.label}`,
        boardTitle: 'La lavagna',
        steps: u.steps.map(([text, line]) => ({ text, board: [m(line)] })),
      });
    }
    show(0);
  }

  /* ----------------------------------------------- albero di ricorsione */

  const TREE_PRESETS = [
    { label: '2T(n/2) + n', who: 'merge sort', a: 2, b: 2, d: 1 },
    { label: 'T(n/2) + 1', who: 'ricerca binaria', a: 1, b: 2, d: 0 },
    { label: '2T(n/2) + 1', who: 'visita di un albero', a: 2, b: 2, d: 0 },
    { label: 'T(n/2) + n', who: '', a: 1, b: 2, d: 1 },
    { label: '3T(n/2) + n', who: 'Karatsuba', a: 3, b: 2, d: 1 },
    { label: '4T(n/2) + n', who: '', a: 4, b: 2, d: 1 },
    { label: '2T(n/2) + n²', who: '', a: 2, b: 2, d: 2 },
    { label: '3T(n/3) + n', who: '', a: 3, b: 3, d: 1 },
  ];

  const sizeLabel = (b, i) => (i === 0 ? 'n' : i === 1 ? `n/${b}` : `n/${b}${'⁰¹²³⁴⁵⁶⁷⁸⁹'[i] || '^' + i}`);
  const costLabel = (b, i, d) => {
    if (d === 0) return '1';
    const s = sizeLabel(b, i);
    if (d === 1) return s;
    const sup = d === 2 ? '²' : d === 3 ? '³' : d === 0.5 ? '' : '^' + d;
    if (d === 0.5) return i === 0 ? '√n' : `√(${s})`;
    return i === 0 ? `n${sup}` : `(${s})${sup}`;
  };

  /** Costo totale del livello i: a^i · (n/b^i)^d = n^d · (a/b^d)^i, scritto in modo leggibile. */
  function levelTotal(a, b, d, i) {
    const r = Math.pow(a / Math.pow(b, d), i);
    if (d === 0) return fmtNum(Math.pow(a, i));
    const nd = d === 1 ? 'n' : d === 0.5 ? '√n' : `n^${d}`;
    return Math.abs(r - 1) < 1e-9 ? nd : `${fmtNum(r)} ${nd}`;
  }

  function mountAlbero(host) {
    const lab = h('div.lab');
    const chips = h('div.cx-presets', { role: 'group', 'aria-label': 'Ricorrenze di esempio' });
    const body = h('div.lab-body.quadretti');
    const ctr = h('div.lab-controls');
    const out = h('div.lab-out');
    lab.append(h('div.lab-head', h('h3', { text: 'Albero di ricorsione di T(n) = a·T(n/b) + n^d' })), h('div.lab-controls', chips), body, ctr, out);
    host.append(lab);

    const treeWrap = h('div.cx-tree-wrap');
    const levels = h('ol.cx-levels');
    body.append(treeWrap, h('p.cx-levels-title', { html: `Costo di ogni livello (barre in proporzione, con ${m('n = b^8')})` }), levels);
    const tree = new ASD.viz.TreeView(treeWrap, { layout: 'tidy', shape: 'box', levelH: 62, minBoxW: 46, gap: 10, ariaLabel: 'Albero di ricorsione' });

    const base = ASD.uid('albero');
    const sel = (key, label, values, fmt) => {
      const id = `${base}-${key}`;
      const s = h('select', { id }, values.map((v) => h('option', { value: String(v), text: fmt ? fmt(v) : String(v) })));
      s.addEventListener('change', draw);
      ctr.append(h('label.field', { for: id }, label, s));
      return s;
    };
    const selA = sel('a', 'a (sottoproblemi)', [1, 2, 3, 4, 8]);
    const selB = sel('b', 'b (divisore)', [2, 3, 4]);
    const selD = sel('d', 'f(n) = n^d', [0, 0.5, 1, 2, 3], (d) => (d === 0 ? '1 (d = 0)' : d === 0.5 ? '√n (d = 0,5)' : d === 1 ? 'n (d = 1)' : `n${d === 2 ? '²' : '³'} (d = ${d})`));

    TREE_PRESETS.forEach((p) => {
      const b = h('button.btn.btn-sm', { type: 'button', html: `${m(p.label)}${p.who ? ` <span style="color:var(--ink-2)">· ${p.who}</span>` : ''}` });
      b.addEventListener('click', () => {
        selA.value = String(p.a);
        selB.value = String(p.b);
        selD.value = String(p.d);
        draw();
      });
      chips.append(b);
    });

    function draw() {
      const a = Number(selA.value);
      const b = Number(selB.value);
      const d = Number(selD.value);
      // livelli da disegnare: al massimo ~16 foglie
      const depth = a === 1 ? 4 : Math.max(1, Math.min(4, Math.floor(Math.log(16) / Math.log(a) + 1e-9)));
      const nodes = {};
      let id = 0;
      const build = (lvl) => {
        const me = 'n' + id++;
        const kids = [];
        if (lvl < depth) for (let k = 0; k < a; k++) kids.push(build(lvl + 1));
        const lab = sizeLabel(b, lvl);
        const cost = costLabel(b, lvl, d);
        nodes[me] = { label: lab, sub: cost === lab ? null : 'costo ' + cost, kids, cls: lvl === depth ? 'visited' : null };
        return me;
      };
      const root = build(0);
      tree.reset();
      tree.render({ root, nodes });

      // costi per livello con n = b^8
      const K = 8;
      const n = Math.pow(b, K);
      const costs = [];
      for (let i = 0; i <= K; i++) costs.push(Math.pow(a, i) * Math.pow(n / Math.pow(b, i), d));
      const max = Math.max(...costs);
      const r = a / Math.pow(b, d);
      const shownLv = [0, 1, 2, 3, K];
      levels.replaceChildren(
        ...shownLv.flatMap((i, idx) => {
          const items = [];
          if (idx === shownLv.length - 1) items.push(h('li.more', h('span.lv', { text: '…' })));
          const nodesAt = Math.pow(a, i);
          items.push(
            h(
              'li',
              h('span.lv', { html: i === K ? `foglie` : `livello ${i}` }),
              h('span.bar', { style: { width: Math.max(0.5, (costs[i] / max) * 100) + '%' } }),
              h('span.val', { html: i === K ? `${m('n^{log_b a}')} foglie × ${m('Θ(1)')}` : `${m(fmtNum(nodesAt))} × ${m(costLabel(b, i, d))} = ${m(levelTotal(a, b, d, i))}` })
            )
          );
          return items;
        })
      );

      // verdetto: lo stesso risultato del teorema master
      const res = master(a, b, d, 0).risultato;
      let txt;
      if (Math.abs(r - 1) < 1e-9) {
        txt = `Ogni livello costa uguale: ${m(`a / b^d = ${fmtNum(a)}/${fmtNum(Math.pow(b, d))} = 1`)}. I livelli sono ${m('log_b n + 1')}: il totale è il costo della radice per il numero di livelli, ${m(`T(n) = ${res}`)}.`;
      } else if (r < 1) {
        txt = `I costi <strong>scendono</strong> di un fattore ${m(`a/b^d = ${fmtNum(r)}`)} a ogni livello: serie geometrica decrescente, domina la radice. ${m(`T(n) = ${res}`)}.`;
      } else {
        txt = `I costi <strong>salgono</strong> di un fattore ${m(`a/b^d = ${fmtNum(r)}`)} a ogni livello: dominano le foglie, che sono ${m(`a^{log_b n} = n^{log_b a} = n^{${fmtNum(Math.log(a) / Math.log(b))}}`)}. ${m(`T(n) = ${res}`)}.`;
      }
      out.innerHTML = `<p class="cx-result">${m(`T(n) = ${a === 1 ? '' : a}T(n/${b}) + ${d === 0 ? '1' : d === 0.5 ? '√n' : d === 1 ? 'n' : `n^${d}`}`)}</p><p style="margin:.4em 0 0">${txt}</p>`;
    }
    selA.value = '2';
    selB.value = '2';
    selD.value = '1';
    draw();
  }

  /* ---------------------------------------------------- teorema master */

  const MASTER_PRESETS = [
    { label: 'merge sort', a: 2, b: 2, d: 1, k: 0 },
    { label: 'ricerca binaria', a: 1, b: 2, d: 0, k: 0 },
    { label: 'Karatsuba', a: 3, b: 2, d: 1, k: 0 },
    { label: 'Strassen', a: 7, b: 2, d: 2, k: 0 },
    { label: 'T(n/2) + n', a: 1, b: 2, d: 1, k: 0 },
    { label: '2T(n/2) + n log n', a: 2, b: 2, d: 1, k: 1 },
    { label: '2T(n/4) + √n', a: 2, b: 4, d: 0.5, k: 0 },
  ];

  /** Risolve T(n) = a T(n/b) + Θ(n^d log^k n). Restituisce { caso, risultato, spiegazione } oppure { errore }. */
  function master(a, b, d, k) {
    if (!(a >= 1)) return { errore: `Serve ${m('a >= 1')}: il numero di sottoproblemi non può essere minore di 1.` };
    if (!(b > 1)) return { errore: `Serve ${m('b > 1')}: i sottoproblemi devono essere più piccoli del problema.` };
    if (!(d >= 0)) return { errore: `Serve ${m('d >= 0')}.` };
    if (!(k >= 0) || !Number.isInteger(k)) return { errore: `Qui ${m('k')} deve essere un intero ${m('>= 0')} (versione del teorema per ${m('f(n) = n^d log^k n')}).` };
    const e = Math.log(a) / Math.log(b);
    const E = fmtNum(e);
    const logk = (kk) => (kk === 0 ? '' : kk === 1 ? ' log n' : ` log^{${kk}} n`);
    const pw = (x) => (Math.abs(x) < 1e-12 ? '1' : Math.abs(x - 1) < 1e-12 ? 'n' : `n^{${fmtNum(x)}}`);
    const cmp = `${m(`log_b a = log_{${fmtNum(b)}} ${fmtNum(a)} = ${E}`)}`;
    if (Math.abs(d - e) < 1e-9) {
      const res = (pw(e) === '1' ? '' : pw(e)) + logk(k + 1);
      return {
        caso: 2,
        spiegazione: `${cmp} e ${m(`d = ${fmtNum(d)}`)}: sono <strong>uguali</strong>. Ogni livello dell'albero costa circa lo stesso
        e i livelli sono ${m('log_b n')}: si moltiplica ${m('f(n)')} per un ${m('log n')}.`,
        risultato: `Θ(${res.trim()})`,
      };
    }
    if (d < e) {
      return {
        caso: 1,
        spiegazione: `${cmp} e ${m(`d = ${fmtNum(d)}`)}: ${m('d < log_b a')}. ${m('f(n)')} cresce più lentamente di ${m(`n^{${E}}`)}: dominano le
        foglie dell'albero, che sono ${m(`n^{log_b a}`)}.`,
        risultato: `Θ(${pw(e)})`,
      };
    }
    return {
      caso: 3,
      spiegazione: `${cmp} e ${m(`d = ${fmtNum(d)}`)}: ${m('d > log_b a')}. ${m('f(n)')} cresce più in fretta: domina il lavoro della radice.
      (La condizione di regolarità ${m('a f(n/b) <= c f(n)')} con ${m('c < 1')} vale automaticamente per ${m('f(n) = n^d log^k n')}.)`,
      risultato: `Θ(${(pw(d) + logk(k)).trim()})`,
    };
  }

  function mountMaster(host) {
    const lab = h('div.lab');
    const chips = h('div.cx-presets', { role: 'group', 'aria-label': 'Esempi' });
    const ctr = h('div.lab-controls');
    const out = h('div.lab-out', { 'aria-live': 'polite' });
    lab.append(h('div.lab-head', h('h3', { text: 'Calcolatore del teorema master' })), h('div.lab-controls', chips), ctr, out);
    host.append(lab);
    const base = ASD.uid('master');
    const num = (key, label, value, step) => {
      const id = `${base}-${key}`;
      const input = h('input.cx-num', { type: 'number', id, value: String(value), step: String(step), min: '0' });
      input.addEventListener('input', calc);
      ctr.append(h('label.field', { for: id }, h('span', { html: label }), input));
      return input;
    };
    const eq = h('p.cx-eq');
    ctr.prepend(h('div', { style: { flexBasis: '100%' } }, eq));
    const inA = num('a', `${m('a')} sottoproblemi`, 2, 1);
    const inB = num('b', `${m('b')} divisore`, 2, 1);
    const inD = num('d', `esponente ${m('d')}`, 1, 0.5);
    const inK = num('k', `potenza del log ${m('k')}`, 0, 1);
    MASTER_PRESETS.forEach((p) => {
      const b = h('button.btn.btn-sm', { type: 'button', text: p.label });
      b.addEventListener('click', () => {
        inA.value = String(p.a);
        inB.value = String(p.b);
        inD.value = String(p.d);
        inK.value = String(p.k);
        calc();
      });
      chips.append(b);
    });
    function calc() {
      const a = Number(inA.value);
      const b = Number(inB.value);
      const d = Number(inD.value);
      const k = Number(inK.value);
      const f = d === 0 && k === 0 ? '1' : `${d === 0 ? '' : d === 1 ? 'n' : `n^{${fmtNum(d)}}`}${k === 0 ? '' : k === 1 ? ' log n' : ` log^{${k}} n`}`;
      eq.innerHTML = m(`T(n) = ${a === 1 ? '' : fmtNum(a)}T(n/${fmtNum(b)}) + ${f.trim()}`);
      const r = master(a, b, d, k);
      if (r.errore) {
        out.innerHTML = `<p class="cx-verdict no"><strong class="vd">Non si applica.</strong>${r.errore}</p>`;
        return;
      }
      out.innerHTML = `<p class="cx-result">Caso ${r.caso}: ${m(`T(n) = ${r.risultato}`)}</p><p style="margin:.4em 0 0">${r.spiegazione}</p>`;
    }
    calc();
  }

  /* ------------------------------------------------------------- capitolo */

  ASD.chapter({
    id: 'cx-ricorrenze',
    title: 'Ricorrenze e teorema master',
    lead:
      'Le funzioni ricorsive non si contano "a giri": si scrive una ricorrenza e la si risolve. Tre strumenti: srotolarla, disegnare l\'albero di ricorsione e, per il divide et impera, il teorema master.',
    minutes: 40,
    prereq: ['cx-metodo', 'cpp-ricorsione'],
    goals: [
      'scrivere la ricorrenza di una funzione ricorsiva leggendo il codice',
      'risolvere le ricorrenze più comuni srotolandole fino al caso base',
      'usare l\'albero di ricorsione per capire quale livello domina il costo',
      `applicare il teorema master a ${m('T(n) = aT(n/b) + f(n)')} e riconoscere quando non si applica`,
    ],

    render(el) {
      el.innerHTML = `
<section id="scrivere">
  <h2>Dal codice alla ricorrenza</h2>
  <p>Una <strong>ricorrenza</strong> esprime ${m('T(n)')} in funzione di ${m('T')} su input più piccoli. Si legge dal codice
  rispondendo a tre domande:</p>
  <ol>
    <li>quante chiamate ricorsive fa la funzione? (il coefficiente davanti a ${m('T')});</li>
    <li>quanto è grande il problema in ogni chiamata? (${m('n-1')}, ${m('n/2')}, …);</li>
    <li>quanto lavoro fa <em>fuori</em> dalle chiamate? (il termine aggiunto, ${m('f(n)')}).</li>
  </ol>
  <p>Più il <strong>caso base</strong>: di solito ${m('T(1) = Θ(1)')}.</p>
  ${table({
    head: ['Funzione', 'Chiamate', 'Dimensione', 'Lavoro fuori', 'Ricorrenza'],
    rows: [
      ['fattoriale, somma di un array', '1', m('n-1'), m('Θ(1)'), m('T(n) = T(n-1) + c')],
      ['ricerca binaria', '1', m('n/2'), m('Θ(1)'), m('T(n) = T(n/2) + c')],
      ['merge sort', '2', m('n/2'), m('Θ(n)') + ' (fusione)', m('T(n) = 2T(n/2) + n')],
      ['visita di un albero bilanciato', '2', m('n/2'), m('Θ(1)'), m('T(n) = 2T(n/2) + c')],
      ['Fibonacci ricorsivo', '2', m('n-1') + ', ' + m('n-2'), m('Θ(1)'), m('T(n) = T(n-1) + T(n-2) + c')],
      ['torre di Hanoi', '2', m('n-1'), m('Θ(1)'), m('T(n) = 2T(n-1) + c')],
    ],
  })}
  ${box('errore', `<p>${m('2T(n/2)')} e ${m('2T(n-1)')} sembrano simili e sono lontanissimi: il primo dimezza il problema (si
  arriva al caso base in ${m('log n')} passi), il secondo lo riduce di uno (servono ${m('n')} passi, e le chiamate
  raddoppiano a ogni passo: ${m('2^n')}).</p>`)}
</section>

<section id="srotolare">
  <h2>Srotolare la ricorrenza</h2>
  <p>Il metodo più diretto (detto anche <i>metodo iterativo</i>): si sostituisce la ricorrenza dentro se stessa finché si
  vede la regola, la si scrive dopo ${m('k')} passi, e si sceglie ${m('k')} in modo da arrivare al caso base.</p>
  <div data-mount="srotola"></div>
  <p>I valori esatti, calcolati facendo girare la ricorsione, coincidono con le formule chiuse:</p>
  <div data-mount="prog"></div>
  <pre class="code-out" tabindex="0"><code>      n   tMerge  n*log2(n)+n   tBinaria  log2(n)+1
      1        1            1          1          1
      2        4            4          2          2
      4       12           12          3          3
      8       32           32          4          4
     16       80           80          5          5
     32      192          192          6          6
     64      448          448          7          7
    128     1024         1024          8          8
    256     2304         2304          9          9
    512     5120         5120         10         10
   1024    11264        11264         11         11</code></pre>
</section>

<section id="albero">
  <h2>L'albero di ricorsione</h2>
  <p>Per ${m('T(n) = aT(n/b) + f(n)')} si disegna un albero: la radice è il problema di dimensione ${m('n')} e costa
  ${m('f(n)')}; ha ${m('a')} figli di dimensione ${m('n/b')}, ognuno costa ${m('f(n/b)')}; e così via fino ai casi base.
  Il costo totale è la somma di tutti i nodi, che conviene fare <strong>livello per livello</strong>:</p>
  <p class="formula">livello ${m('i')}: ${m('a^i')} nodi × ${m('f(n/b^i)')} ciascuno &nbsp; con ${m('f(n) = n^d')}: &nbsp;
  ${m('a^i (n/b^i)^d = n^d (a/b^d)^i')}</p>
  <p>Tutto dipende dal rapporto ${m('a/b^d')} tra un livello e il precedente. Scegli una ricorrenza e guarda le barre.</p>
  <div data-mount="albero"></div>
  ${box('ricorda', `<p>Tre comportamenti, tre risultati:</p>
  <ul>
    <li>${m('a/b^d < 1')}: i livelli costano sempre meno, <strong>domina la radice</strong> ⇒ ${m('Θ(f(n))')};</li>
    <li>${m('a/b^d = 1')}: tutti i livelli costano uguale ⇒ ${m('Θ(f(n) log n)')};</li>
    <li>${m('a/b^d > 1')}: i livelli costano sempre di più, <strong>dominano le foglie</strong>, che sono ${m('n^{log_b a}')} ⇒ ${m('Θ(n^{log_b a})')}.</li>
  </ul>`)}
</section>

<section id="master">
  <h2>Il teorema master</h2>
  <p>È la versione "da formulario" dell'albero di ricorsione. Data ${m('T(n) = aT(n/b) + f(n)')} con ${m('a >= 1')},
  ${m('b > 1')}, si confronta ${m('f(n)')} con ${m('n^{log_b a}')} (il numero di foglie):</p>
  ${table({
    head: ['Caso', 'Condizione', 'Risultato'],
    rows: [
      ['1', `${m('f(n) = O(n^{log_b a - ε})')} per qualche ${m('ε > 0')}`, m('T(n) = Θ(n^{log_b a})')],
      ['2', m('f(n) = Θ(n^{log_b a} log^k n)') + `, ${m('k >= 0')}`, m('T(n) = Θ(n^{log_b a} log^{k+1} n)')],
      ['3', `${m('f(n) = Ω(n^{log_b a + ε})')} e ${m('a f(n/b) <= c f(n)')} con ${m('c < 1')}`, m('T(n) = Θ(f(n))')],
    ],
  })}
  <p>Con ${m('f(n) = n^d')} (il caso più comune) diventa un semplice confronto tra ${m('d')} e ${m('log_b a')}:
  ${m('d < log_b a')} ⇒ ${m('Θ(n^{log_b a})')}; ${m('d = log_b a')} ⇒ ${m('Θ(n^d log n)')}; ${m('d > log_b a')} ⇒ ${m('Θ(n^d)')}.</p>
  <div data-mount="master"></div>
  ${box('errore', `<p>Il teorema master <strong>non si applica</strong> a tutte le ricorrenze:</p>
  <ul>
    <li>${m('T(n) = T(n-1) + n')}, ${m('2T(n-1) + 1')}: il problema non si divide per ${m('b')}, si accorcia di uno. Si srotolano.</li>
    <li>${m('T(n) = T(n/3) + T(2n/3) + n')}: sottoproblemi di dimensioni diverse. Serve l'albero di ricorsione (risultato ${m('Θ(n log n)')}).</li>
    <li>${m('T(n) = 2T(n/2) + n / log n')}: ${m('f(n)')} è più piccola di ${m('n')} ma non di un fattore polinomiale ${m('n^ε')}; cade "tra" i casi.</li>
  </ul>`)}
</section>

<section id="catalogo">
  <h2>Le ricorrenze da sapere a memoria</h2>
  ${table({
    head: ['Ricorrenza', 'Soluzione', 'Esempio'],
    rows: [
      [m('T(n) = T(n-1) + Θ(1)'), m('Θ(n)'), 'somma ricorsiva, fattoriale'],
      [m('T(n) = T(n-1) + Θ(n)'), m('Θ(n^2)'), 'selection/insertion sort ricorsivi, quicksort nel caso peggiore'],
      [m('T(n) = T(n/2) + Θ(1)'), m('Θ(log n)'), 'ricerca binaria'],
      [m('T(n) = T(n/2) + Θ(n)'), m('Θ(n)'), 'selezione (mediana) nel caso medio'],
      [m('T(n) = 2T(n/2) + Θ(1)'), m('Θ(n)'), 'visita di un albero bilanciato, massimo divide et impera'],
      [m('T(n) = 2T(n/2) + Θ(n)'), m('Θ(n log n)'), 'merge sort, quicksort nel caso migliore'],
      [m('T(n) = 2T(n-1) + Θ(1)'), m('Θ(2^n)'), 'torre di Hanoi'],
      [m('T(n) = T(n-1) + T(n-2) + Θ(1)'), m('Θ(φ^n)') + ', ' + m('φ ≈ 1,618'), 'Fibonacci ricorsivo'],
    ],
  })}
</section>

<section id="esame">
  <h2>All'esame</h2>
  ${box('esame', `<p>Scrivi sempre la ricorrenza <em>con il caso base</em>, dichiara il metodo che usi ("applico il teorema master
  con ${m('a = 2')}, ${m('b = 2')}, ${m('f(n) = n')}: ${m('log_b a = 1 = d')}, caso 2") e solo dopo il risultato. Se il master
  non si applica, dillo e srotola: anche un conto approssimato ma motivato vale punti.</p>`)}
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        srotola: mountSrotola,
        prog: (host) => ASD.code(host, { src: 'complessita/ricorrenze', region: 'ricorrenze' }),
        albero: mountAlbero,
        master: mountMaster,
        quiz: (host) =>
          ASD.quiz(host, [
            {
              q: `Risolvi ${m('T(n) = 4T(n/2) + n')}.`,
              options: [m('Θ(n)'), m('Θ(n log n)'), m('Θ(n^2)'), m('Θ(n^4)')],
              answer: 2,
              explain: `${m('log_2 4 = 2 > d = 1')}: caso 1, dominano le foglie, ${m('Θ(n^{log_2 4}) = Θ(n^2)')}.`,
            },
            {
              q: `Risolvi ${m('T(n) = 2T(n/2) + n^2')}.`,
              options: [m('Θ(n^2)'), m('Θ(n^2 log n)'), m('Θ(n log n)')],
              answer: 0,
              explain: `${m('log_2 2 = 1 < d = 2')}: caso 3, domina la radice, ${m('Θ(n^2)')}. I livelli costano ${m('n^2, n^2/2, n^2/4, …')}: serie geometrica.`,
            },
            {
              q: `Risolvi ${m('T(n) = T(n/2) + n')}.`,
              options: [m('Θ(log n)'), m('Θ(n)'), m('Θ(n log n)')],
              answer: 1,
              explain: `${m('a = 1')}, ${m('log_2 1 = 0 < d = 1')}: caso 3, ${m('Θ(n)')}. Srotolando: ${m('n + n/2 + n/4 + … < 2n')}.`,
            },
            {
              q: `Risolvi ${m('T(n) = 2T(n/4) + √n')}.`,
              options: [m('Θ(√n)'), m('Θ(√n log n)'), m('Θ(n)')],
              answer: 1,
              explain: `${m('log_4 2 = 1/2 = d')}: caso 2, ${m('Θ(n^{1/2} log n) = Θ(√n log n)')}.`,
            },
            {
              q: `Si può usare il teorema master per ${m('T(n) = T(n-1) + n')}?`,
              options: ['Sì, con a = 1 e b = 1', 'No: il problema si riduce di 1, non si divide per b > 1', 'Sì, ed è il caso 2'],
              answer: 1,
              explain: `Il master vale per ${m('T(n/b)')} con ${m('b > 1')}. Qui si srotola: ${m('n + (n-1) + … + 1 = Θ(n^2)')}.`,
            },
            {
              q: `Una funzione fa due chiamate ricorsive su metà dell'input e poi un ciclo su tutto l'input. Quale ricorrenza?`,
              options: [m('T(n) = 2T(n/2) + n'), m('T(n) = T(n/2) + n'), m('T(n) = 2T(n-1) + n'), m('T(n) = 2T(n/2) + 1')],
              answer: 0,
              explain: `Due chiamate (${m('a = 2')}) su ${m('n/2')} (${m('b = 2')}) più un lavoro lineare (${m('f(n) = n')}): la ricorrenza del merge sort, ${m('Θ(n log n)')}.`,
            },
          ]),
      });
    },
  });

  ASD.cx.master = master;
})();
