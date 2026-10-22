/* ASD a quadretti — capitolo "Tabelle hash".
   Il problema del dizionario, funzioni hash (divisione, moltiplicazione,
   stringhe), collisioni, liste di trabocco, indirizzamento aperto con
   cancellazione a tombstone, fattore di carico e costi, rehashing,
   unordered_map / unordered_set. Le tracce seguono riga per riga
   esempi/strutture/hash_concatenamento.cpp e hash_lineare.cpp; il laboratorio
   usa ASD.lin.HashSim (stesse regole del C++). */
(function () {
  'use strict';

  const { m, box, table, h } = ASD;
  const lin = ASD.lin;
  const DEL = ASD.viz.HashView.DEL;
  const dec = (v, d = 2) => (Number.isFinite(v) ? v.toLocaleString('it-IT', { maximumFractionDigits: d, useGrouping: false }) : '∞');

  /* ------------------------------------------------------------ input */

  const HASH_OPS = {
    ins: { words: ['ins', 'inserisci', '+'], arg: true },
    cerca: { words: ['cerca', '?'], arg: true },
    canc: { words: ['canc', 'cancella', '-'], arg: true },
  };

  function parseHashInput(text, defM) {
    const mm = /^\s*m\s*=?\s*(\d+)\s*:\s*([\s\S]*)$/i.exec(String(text));
    let M = defM;
    let rest = String(text);
    if (mm) {
      M = Number(mm[1]);
      if (M < 3 || M > 13) throw new Error('m deve stare tra 3 e 13, così la tabella si legge bene.');
      rest = mm[2];
    }
    const ops = lin.parseOps(rest, HASH_OPS, { min: 0, max: 99, maxOps: 9 });
    return { M, ops };
  }

  const fmtHash = (v) => `m = ${v.M}: ` + v.ops.map((o) => `${o.op} ${o.x}`).join(', ');
  const opName = { ins: 'inserisci', cerca: 'cerca', canc: 'cancella' };

  /** Stesso risultato con il simulatore: per i controlli finali. */
  function simulate(method, M, ops) {
    const sim = new lin.HashSim(method, M);
    for (const o of ops) {
      if (o.op === 'ins') sim.insert(o.x);
      else if (o.op === 'canc') sim.remove(o.x);
    }
    return sim.snapshot();
  }

  const sameTable = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  /* -------------------------------------- liste di trabocco (stepper) */

  function traceChain({ M, ops }) {
    const t = new ASD.Tracer(['confronti']);
    const T = Array.from({ length: M }, () => []);
    let n = 0;
    const S = (o = {}) => ({
      mode: 'chain',
      t: T.map((c) => c.slice()),
      marks: o.marks || {},
      nodeMarks: o.nm || {},
      probes: o.probes || [],
      key: o.key ? { html: o.key } : null,
    });
    const keyLine = (op, k) => `<code>${op}(${k})</code> · ${m(`h(${k}) = ${k} mod ${M} = ${k % M}`)}`;
    t.step(null, `Tabella vuota con ${M} liste: ogni <code>t[i]</code> vale <code>nullptr</code>.`, { n }, S());

    function search(k, key, intro = '') {
      const i = k % M;
      const at = (pos, cls) => ({ [`${i}:${pos}`]: cls });
      t.step('s-h', `${intro}<code>i = h(${k})</code> = ${k} mod ${M} = ${i}: la chiave, se c'è, sta nella lista ${i}.`, { k, i }, S({ key, probes: [i], marks: { [i]: 'compare' } }));
      const chain = T[i];
      t.step(
        's-loop',
        chain.length ? `<code>p = t[${i}]</code>: la lista ${i} comincia dal nodo ${chain[0]}.` : `<code>p = t[${i}]</code> vale <code>nullptr</code>: la lista ${i} è vuota.`,
        { k, i },
        S({ key, probes: [i], nm: chain.length ? at(0, 'compare') : {} })
      );
      for (let pos = 0; pos < chain.length; pos++) {
        t.count('confronti');
        if (chain[pos] === k) {
          t.step('s-cmp', `<code>p-&gt;chiave</code> = ${k}: trovata, <code>return true</code>.`, { k, i }, S({ key, probes: [i], nm: at(pos, 'found') }));
          return true;
        }
        t.step('s-cmp', `<code>p-&gt;chiave</code> = ${chain[pos]} ≠ ${k}: stesso indice, chiave diversa.`, { k, i }, S({ key, probes: [i], nm: at(pos, 'compare') }));
        const more = pos + 1 < chain.length;
        t.step(
          's-loop',
          more ? `<code>p = p-&gt;next</code>: si passa a ${chain[pos + 1]}.` : '<code>p = p-&gt;next</code> vale <code>nullptr</code>: la lista è finita.',
          { k, i },
          S({ key, probes: [i], nm: more ? at(pos + 1, 'compare') : {} })
        );
      }
      t.step('s-miss', `${k} non è nella lista ${i}: <code>return false</code>.`, { k, i }, S({ key, probes: [i] }));
      return false;
    }

    for (const o of ops) {
      const k = o.x;
      const key = keyLine(opName[o.op], k);
      if (o.op === 'cerca') {
        search(k, key, `<code>cerca(${k})</code>: `);
        continue;
      }
      if (o.op === 'ins') {
        t.step('i-check', `<code>inserisci(${k})</code>: prima si controlla che ${k} non ci sia già, con <code>cerca(${k})</code>.`, { k }, S({ key }));
        if (search(k, key)) {
          t.step('i-check', `${k} c'è già: <code>return false</code>, la tabella non tiene doppioni.`, { k }, S({ key }));
          continue;
        }
        const i = k % M;
        t.step('i-h', `<code>cerca</code> ha restituito <code>false</code>. <code>i = h(${k})</code> = ${i}.`, { k, i }, S({ key, probes: [i], marks: { [i]: 'compare' } }));
        T[i].unshift(k);
        n++;
        t.step(
          'i-new',
          `<code>t[${i}] = new Nodo{${k}, t[${i}]}</code>: il nodo va in testa alla lista ${i}, in ${m('Θ(1)')}. Ora ${m(`α = n/m = ${n}/${M}`)} = ${dec(n / M)}.`,
          { k, i, n },
          S({ key, probes: [i], nm: { [`${i}:0`]: 'new' } })
        );
        continue;
      }
      // cancella
      const i = k % M;
      t.step('d-h', `<code>cancella(${k})</code>: <code>i = h(${k})</code> = ${i}.`, { k, i }, S({ key, probes: [i], marks: { [i]: 'compare' } }));
      const chain = T[i];
      const at = (pos, cls, extra = {}) => Object.assign({ [`${i}:${pos}`]: cls }, extra);
      t.step(
        'd-init',
        chain.length ? `<code>prev = nullptr</code>, <code>p = t[${i}]</code>: si parte dal primo nodo, ${chain[0]}.` : `<code>p = t[${i}]</code> vale <code>nullptr</code>: la lista ${i} è vuota.`,
        { k, i },
        S({ key, probes: [i], nm: chain.length ? at(0, 'compare') : {} })
      );
      let pos = 0;
      for (;;) {
        const prevMark = pos > 0 ? { [`${i}:${pos - 1}`]: 'visited' } : {};
        if (pos >= chain.length) {
          t.step('d-loop', '<code>p == nullptr</code>: la lista è finita.', { k, i }, S({ key, probes: [i], nm: prevMark }));
          break;
        }
        t.count('confronti');
        if (chain[pos] === k) {
          t.step('d-loop', `<code>p-&gt;chiave</code> = ${k}: trovata, il ciclo si ferma.`, { k, i }, S({ key, probes: [i], nm: at(pos, 'swap', prevMark) }));
          break;
        }
        t.step('d-loop', `<code>p-&gt;chiave</code> = ${chain[pos]} ≠ ${k}: avanti.`, { k, i }, S({ key, probes: [i], nm: at(pos, 'compare', prevMark) }));
        pos++;
        t.step(
          'd-adv',
          pos < chain.length ? `<code>prev = p; p = p-&gt;next</code>: <code>prev</code> su ${chain[pos - 1]}, <code>p</code> su ${chain[pos]}.` : '<code>prev = p; p = p-&gt;next</code>: ora <code>p</code> vale <code>nullptr</code>.',
          { k, i },
          S({ key, probes: [i], nm: pos < chain.length ? at(pos, 'compare', { [`${i}:${pos - 1}`]: 'visited' }) : { [`${i}:${pos - 1}`]: 'visited' } })
        );
      }
      if (pos >= chain.length) {
        t.step('d-miss', `${k} non c'è: <code>return false</code>.`, { k, i }, S({ key, probes: [i] }));
        continue;
      }
      t.step('d-miss', '<code>p</code> non è <code>nullptr</code>: si stacca il nodo.', { k, i }, S({ key, probes: [i], nm: at(pos, 'swap') }));
      if (pos === 0) {
        t.step('d-head', `<code>prev == nullptr</code>: ${k} è il primo della lista, quindi <code>t[${i}] = p-&gt;next</code>.`, { k, i }, S({ key, probes: [i], nm: at(pos, 'swap') }));
      } else {
        t.step('d-link', `<code>prev-&gt;next = p-&gt;next</code>: il nodo ${chain[pos - 1]} scavalca ${k}.`, { k, i }, S({ key, probes: [i], nm: at(pos, 'swap', { [`${i}:${pos - 1}`]: 'visited' }) }));
      }
      chain.splice(pos, 1);
      n--;
      t.step('d-del', `<code>delete p</code>: ${k} è uscita dalla tabella. ${m(`α = ${n}/${M}`)} = ${dec(n / M)}.`, { k, i, n }, S({ key, probes: [i] }));
    }
    t.step(null, `Fine. ${n} chiavi in ${M} liste: ${m(`α = ${dec(n / M)}`)}. Confronti fatti in tutto: ${t.c.confronti}.`, { n }, S());
    return t.frames;
  }

  /* -------------------------------------- scansione lineare (stepper) */

  function traceLinear({ M, ops }) {
    const t = new ASD.Tracer(['ispezioni']);
    const T = new Array(M).fill(null);
    let n = 0;
    const S = (o = {}) => ({ mode: 'open', t: T.slice(), marks: o.marks || {}, probes: o.probes || [], key: o.key ? { html: o.key } : null });
    const show = (v) => (v == null ? '<code>VUOTO</code>' : v === DEL ? '<code>CANCELLATO</code>' : String(v));
    const keyLine = (op, k) => `<code>${op}(${k})</code> · ${m(`h(${k}) = ${k} mod ${M} = ${k % M}`)}, poi le caselle seguenti`;
    t.step(null, `Tabella vuota: ${M} caselle, tutte <code>VUOTO</code>.`, { n }, S());

    /** cerca(k): restituisce l'indice o -1, registrando le ispezioni. */
    function search(k, key, intro = '') {
      const probes = [];
      for (let j = 0; j < M; j++) {
        const i = (k % M + j) % M;
        probes.push(i);
        t.count('ispezioni');
        const P = { key, probes: probes.slice(), marks: { [i]: 'compare' } };
        t.step('s-i', `${j === 0 ? intro : ''}<code>j = ${j}</code>: <code>i = (h(${k}) + ${j}) % ${M}</code> = ${i}. Nella casella c'è ${show(T[i])}.`, { k, j, i }, S(P));
        if (T[i] == null) {
          t.step('s-empty', `<code>t[${i}]</code> è <code>VUOTO</code>: se ${k} ci fosse, sarebbe stata messa qui o prima. <code>return -1</code>.`, { k, j, i }, S(P));
          return -1;
        }
        t.step('s-empty', `<code>t[${i}]</code> non è <code>VUOTO</code>: la ricerca non può fermarsi qui.`, { k, j, i }, S(P));
        if (T[i] === k) {
          t.step('s-found', `<code>t[${i}]</code> = ${k}: trovata, <code>return ${i}</code>.`, { k, j, i }, S(Object.assign({}, P, { marks: { [i]: 'found' } })));
          return i;
        }
        t.step(
          's-found',
          T[i] === DEL ? `<code>t[${i}]</code> è <code>CANCELLATO</code>: qui c'era una chiave, quindi ${k} potrebbe stare più avanti. Si prosegue.` : `<code>t[${i}]</code> = ${T[i]} ≠ ${k}: si prosegue con la casella dopo.`,
          { k, j, i },
          S(P)
        );
      }
      t.step('s-full', `Ispezionate tutte le ${M} caselle senza trovare ${k}: <code>return -1</code>.`, { k }, S({ key, probes }));
      return -1;
    }

    for (const o of ops) {
      const k = o.x;
      const key = keyLine(opName[o.op], k);
      if (o.op === 'cerca') {
        search(k, key, `<code>cerca(${k})</code>: `);
        continue;
      }
      if (o.op === 'canc') {
        t.step('d-find', `<code>cancella(${k})</code>: <code>i = cerca(${k})</code>.`, { k }, S({ key }));
        const i = search(k, key);
        if (i === -1) {
          t.step('d-miss', `<code>i == -1</code>: ${k} non c'è, <code>return false</code>.`, { k, i }, S({ key }));
          continue;
        }
        t.step('d-miss', `<code>i</code> = ${i}: la chiave c'è.`, { k, i }, S({ key, marks: { [i]: 'swap' } }));
        T[i] = DEL;
        n--;
        t.step(
          'd-mark',
          `<code>t[${i}] = CANCELLATO</code>, non <code>VUOTO</code>: una ricerca che passa di qui deve proseguire, perché dopo potrebbero esserci chiavi che si erano scontrate con ${k}.`,
          { k, i, n },
          S({ key, marks: { [i]: 'swap' } })
        );
        continue;
      }
      // inserisci
      t.step('i-check', `<code>inserisci(${k})</code>: prima si controlla che ${k} non ci sia già.`, { k }, S({ key }));
      if (search(k, key) !== -1) {
        t.step('i-check', `${k} c'è già: <code>return false</code>, niente doppioni.`, { k }, S({ key }));
        continue;
      }
      t.step('i-check', `<code>cerca</code> ha restituito <code>-1</code>: ${k} non c'è. Ora si cerca la prima casella libera, ripartendo da ${m(`h(${k})`)}.`, { k }, S({ key }));
      const probes = [];
      let placed = false;
      for (let j = 0; j < M; j++) {
        const i = (k % M + j) % M;
        probes.push(i);
        t.count('ispezioni');
        const P = { key, probes: probes.slice(), marks: { [i]: 'compare' } };
        t.step('i-i', `<code>j = ${j}</code>: <code>i</code> = ${i}, dove c'è ${show(T[i])}.`, { k, j, i }, S(P));
        const free = T[i] == null || T[i] === DEL;
        t.step(
          'i-free',
          free ? `<code>t[${i}]</code> è ${T[i] == null ? '<code>VUOTO</code>' : '<code>CANCELLATO</code>: la casella si può riusare'}.` : `<code>t[${i}]</code> è occupata da ${T[i]}: collisione, si prova la casella dopo.`,
          { k, j, i },
          S(P)
        );
        if (free) {
          T[i] = k;
          n++;
          t.step('i-put', `<code>t[${i}] = ${k}</code>. ${m(`α = n/m = ${n}/${M}`)} = ${dec(n / M)}.`, { k, i, n }, S({ key, probes: probes.slice(), marks: { [i]: 'new' } }));
          placed = true;
          break;
        }
      }
      if (!placed) t.step('i-full', `Nessuna casella libera: la tabella è piena, <code>return false</code>.`, { k }, S({ key, probes }));
    }
    const del = T.filter((v) => v === DEL).length;
    t.step(
      null,
      `Fine. ${n} chiavi in ${M} caselle (${m(`α = ${dec(n / M)}`)})${del ? `, più ${del} ${del === 1 ? 'casella cancellata' : 'caselle cancellate'}` : ''}. Ispezioni in tutto: ${t.c.ispezioni}.`,
      { n },
      S()
    );
    return t.frames;
  }

  /* ------------------------------------------------ calcolatrice hash */

  function mountCalc(host) {
    const id = ASD.uid('hcalc');
    const kIn = h('input', { type: 'number', id: id + '-k', min: '0', max: '9999999', step: '1', value: '123456', inputmode: 'numeric' });
    const mIn = h('input', { type: 'number', id: id + '-m', min: '2', max: '1000000', step: '1', value: '701', inputmode: 'numeric' });
    const sIn = h('input', { type: 'text', id: id + '-s', value: 'pila', maxlength: '12', spellcheck: 'false', autocomplete: 'off' });
    const out = h('div.lab-out', { 'aria-live': 'polite' });
    const lab = h(
      'div.lab',
      h('div.lab-head', h('h3', { text: 'Calcolatrice: dalla chiave all\'indice' })),
      h(
        'div.lab-controls',
        h('label.str-field', { for: kIn.id }, 'Chiave k (intero ≥ 0)', kIn),
        h('label.str-field', { for: mIn.id }, 'm (caselle)', mIn),
        h('label.str-field', { for: sIn.id }, 'Stringa (ASCII)', sIn)
      ),
      out
    );
    host.append(lab);
    const A = 0.6180339887;

    function draw() {
      const k = Number(kIn.value);
      const M = Number(mIn.value);
      const s = sIn.value;
      const parts = [];
      if (!Number.isInteger(k) || k < 0 || k > 9999999) parts.push('<p class="str-msg is-bad">k deve essere un intero tra 0 e 9 999 999.</p>');
      else if (!Number.isInteger(M) || M < 2 || M > 1000000) parts.push('<p class="str-msg is-bad">m deve essere un intero tra 2 e 1 000 000.</p>');
      else {
        const pow2 = (M & (M - 1)) === 0;
        const pow10 = /^10*$/.test(String(M));
        let warn = '';
        if (pow2) warn = ` <em>Attenzione: ${M} è una potenza di 2, quindi conta solo la parte bassa dei bit di k.</em>`;
        else if (pow10) warn = ` <em>Attenzione: ${M} è una potenza di 10, quindi contano solo le ultime cifre di k.</em>`;
        parts.push(`<p><strong>Divisione</strong>: ${m(`h(k) = k mod m = ${k} mod ${M} = ${k % M}`)}.${warn}</p>`);
        const prod = k * A;
        const frac = prod - Math.floor(prod);
        const val = Math.floor(M * frac);
        parts.push(
          `<p><strong>Moltiplicazione</strong> con ${m('A ≈ 0,6180339887')}: ${m(`k·A = ${dec(prod, 6)}`)}, parte frazionaria ${m(dec(frac, 6))}; ${m(`m · ${dec(frac, 6)} = ${dec(M * frac, 4)}`)}, quindi ${m(`h(k) = ${val}`)}.</p>`
        );
        if (!/^[\x21-\x7e]{1,12}$/.test(s)) parts.push('<p class="str-msg is-bad">Per la stringa usa da 1 a 12 caratteri ASCII, senza spazi né lettere accentate.</p>');
        else {
          let hv = 0;
          const rows = [];
          for (const c of s) {
            const code = c.charCodeAt(0);
            const nv = (hv * 31 + code) % M;
            rows.push([`<code>'${ASD.esc(c)}'</code>`, String(code), m(`(${hv}·31 + ${code}) mod ${M}`), `<strong>${nv}</strong>`]);
            hv = nv;
          }
          parts.push(`<p><strong>Stringa</strong> "${ASD.esc(s)}" con il metodo di Horner (${m('B = 31')}): ${m(`h = ${hv}`)}.</p>`);
          parts.push(
            `<div class="str-horner">${table({ head: ['Carattere', 'Codice', 'Calcolo', 'h'], rows })}</div>`
          );
        }
      }
      out.innerHTML = parts.join('');
    }
    for (const el of [kIn, mIn, sIn]) el.addEventListener('input', draw);
    draw();
  }

  /* -------------------------------------------- laboratorio della tabella */

  const EXAM = {
    chain: { M: 9, keys: [5, 28, 19, 15, 20, 33, 12, 17, 10], ref: 'Cormen, esercizio 11.2-2' },
    open: { M: 11, keys: [10, 22, 31, 4, 15, 28, 17, 88, 59], ref: 'Cormen, esercizio 11.4-1' },
  };

  function mountLab(host) {
    const id = ASD.uid('hlab');
    const body = h('div.lab-body.quadretti');
    const msg = h('p.str-msg', { 'aria-live': 'polite' });
    const stats = h('ul.str-stats', { 'aria-label': 'Statistiche della tabella' });

    const methodSel = h(
      'select',
      { id: id + '-met' },
      Object.entries(lin.hashMethods).map(([k, label]) => h('option', { value: k }, label))
    );
    const mIn = h('input', { type: 'range', id: id + '-m', min: '5', max: '17', step: '1', value: '7' });
    const mOut = h('output', { for: mIn.id, text: '7' });
    const kIn = h('input', { type: 'number', id: id + '-k', min: '0', max: '999', step: '1', value: '17', inputmode: 'numeric' });
    const btn = (text, fn, ghost) => h('button.btn.btn-sm' + (ghost ? '.btn-ghost' : ''), { type: 'button', onclick: fn }, text);
    const form = h(
      'form.str-actions',
      {
        novalidate: true,
        onsubmit: (e) => {
          e.preventDefault();
          act('ins');
        },
      },
      h('label.str-field', { for: kIn.id }, 'Chiave k', kIn),
      h('button.btn.btn-sm.btn-primary', { type: 'submit' }, 'Inserisci'),
      btn('Cerca', () => act('cerca')),
      btn('Cancella', () => act('canc'))
    );
    const more = h(
      'div.str-actions',
      btn('Chiavi d\'esame', loadExam, true),
      btn('5 chiavi casuali', randomKeys, true),
      btn('Rehash (m circa doppio)', rehash, true),
      btn('Svuota', () => {
        sim.clear();
        last = null;
        msg.textContent = 'Tabella svuotata.';
        draw();
      }, true)
    );
    const lab = h(
      'div.lab',
      h('div.lab-head', h('h3', { text: 'Laboratorio: una tabella hash da riempire' })),
      body,
      h(
        'div.lab-controls',
        h('label.str-field', { for: methodSel.id }, 'Gestione delle collisioni', methodSel),
        h('label.slider', { for: mIn.id }, h('span', 'm (caselle)'), mIn, mOut),
        form,
        more
      ),
      h('div.lab-out', msg, stats)
    );
    host.append(lab);
    const view = new ASD.viz.HashView(body, { mode: 'chain', ariaLabel: 'Tabella hash del laboratorio' });

    let sim = new lin.HashSim('chain', 7);
    let last = null; // { probes, at, pos, cls }

    function rebuild(method, M, keys) {
      sim = new lin.HashSim(method, M);
      const lost = [];
      for (const k of keys) if (!sim.insert(k).ok) lost.push(k);
      return lost;
    }

    function act(op) {
      const k = Number(kIn.value);
      if (!Number.isInteger(k) || k < 0 || k > 999) {
        msg.className = 'str-msg is-bad';
        msg.textContent = 'La chiave deve essere un intero tra 0 e 999.';
        return;
      }
      msg.className = 'str-msg';
      const chain = sim.method === 'chain';
      const seq = (probes) => probes.join(' → ');
      const cost = (r) => (chain ? `${r.cost} ${r.cost === 1 ? 'confronto' : 'confronti'}` : `${r.probes.length} ${r.probes.length === 1 ? 'ispezione' : 'ispezioni'}`);
      if (op === 'ins') {
        const r = sim.insert(k);
        if (r.ok) {
          last = { probes: r.probes, at: r.at, pos: r.pos, cls: 'new', op: r };
          msg.innerHTML = chain
            ? `Inserita ${k} in testa alla lista ${r.at}. Per escludere i doppioni ${r.search.cost === 1 ? 'è stato confrontato 1 nodo' : `sono stati confrontati ${r.search.cost} nodi`}.`
            : `Inserita ${k} nella casella ${r.at}. Caselle provate: ${seq(r.probes)} (${cost(r)}, più le ${r.search.probes.length} della ricerca dei doppioni).`;
        } else if (r.reason === 'dup') {
          last = { probes: r.probes, at: r.at, pos: r.pos, cls: 'found' };
          msg.innerHTML = `${k} c'è già (casella ${r.at}): la tabella non tiene doppioni.`;
        } else {
          last = { probes: r.probes, at: null, cls: null };
          msg.className = 'str-msg is-bad';
          msg.innerHTML =
            sim.n === sim.m
              ? `Tabella piena: ${k} non entra. Serve un rehash.`
              : `Nessuna casella libera nella sequenza di ispezione di ${k} (${seq(r.probes)}), anche se la tabella non è piena: ${
                  sim.method === 'double' ? `${m(`h_2(${k}) = ${sim.h2(k)}`)} e ${m(`m = ${sim.m}`)} hanno un divisore comune` : 'la scansione quadratica non visita tutte le caselle'
                }.`;
        }
      } else if (op === 'cerca') {
        const r = sim.search(k);
        last = { probes: r.probes, at: r.found ? r.at : null, pos: r.pos, cls: 'found' };
        msg.innerHTML = r.found
          ? `${k} trovata nella casella ${r.at}${chain ? `, posizione ${r.pos} della lista` : ''}: ${cost(r)}.`
          : chain
            ? `${k} non c'è: la lista ${r.at} è stata scorsa tutta (${cost(r)}).`
            : `${k} non c'è: ${r.stop === 'empty' ? 'la ricerca si è fermata alla prima casella vuota' : 'ispezionate tutte le caselle'} (${seq(r.probes)}, ${cost(r)}).`;
      } else {
        const r = sim.remove(k);
        last = { probes: r.probes, at: r.ok ? r.at : null, pos: null, cls: 'swap' };
        msg.innerHTML = r.ok
          ? chain
            ? `${k} tolta dalla lista ${r.at}.`
            : `${k} tolta: la casella ${r.at} ora è <em>cancellata</em> (tombstone), non vuota.`
          : `${k} non c'è: niente da cancellare.`;
      }
      draw();
    }

    function loadExam() {
      const chain = methodSel.value === 'chain';
      const ex = chain ? EXAM.chain : EXAM.open;
      mIn.value = String(ex.M);
      const lost = rebuild(methodSel.value, ex.M, ex.keys);
      last = null;
      msg.className = 'str-msg';
      msg.innerHTML = `${ex.ref}: le chiavi ${ex.keys.join(', ')} inserite in ordine con ${m(`m = ${ex.M}`)}${chain ? ` e ${m('h(k) = k mod 9')}` : ` e ${lin.hashMethods[methodSel.value]}`}.${
        lost.length ? ` Non sono entrate: ${lost.join(', ')}.` : ''
      } Prova a rifarlo a mano e confronta.`;
      draw();
    }

    function randomKeys() {
      let added = 0;
      let guard = 0;
      while (added < 5 && guard++ < 200 && sim.n < sim.m) {
        const k = ASD.randInt(0, 99);
        if (sim.insert(k).ok) added++;
      }
      last = null;
      msg.className = 'str-msg';
      msg.textContent = added ? `Aggiunte ${added} chiavi casuali tra 0 e 99.` : 'Non c\'è più posto per nuove chiavi.';
      draw();
    }

    function rehash() {
      const target = lin.nextPrime(2 * sim.m);
      if (target > 17) {
        msg.className = 'str-msg';
        msg.innerHTML = `Con ${m(`m = ${sim.m}`)} il rehash porterebbe a ${target} caselle, troppe per questo disegno. Il principio però è lo stesso: nuova tabella, ogni chiave reinserita con il nuovo ${m('h(k) = k mod m')}.`;
        return;
      }
      const old = sim.m;
      const keys = sim.keys.slice();
      const del = sim.tombstones();
      mIn.value = String(target);
      rebuild(sim.method, target, keys);
      last = null;
      msg.className = 'str-msg';
      msg.innerHTML = `Rehash: da ${old} a ${target} caselle (il primo numero primo ≥ ${2 * old}). Le ${keys.length} chiavi sono state reinserite una per una: con m diverso cambia ${m('h(k)')}, quindi cambiano anche le posizioni.${
        del ? ` Le ${del} caselle cancellate sono sparite.` : ''
      }`;
      draw();
    }

    function draw() {
      mOut.textContent = String(sim.m);
      const chain = sim.method === 'chain';
      const st = { mode: chain ? 'chain' : 'open', t: sim.snapshot(), marks: {}, nodeMarks: {}, probes: last ? last.probes : [] };
      if (last && last.at != null && last.cls) {
        if (chain && last.pos != null) st.nodeMarks[`${last.at}:${last.pos}`] = last.cls;
        else if (!chain) st.marks[last.at] = last.cls;
      }
      const k = Number(kIn.value);
      st.key = Number.isInteger(k) && k >= 0 ? { html: `${m(`k = ${k}`)} · ${m(sim.formula(k).replace(/·/g, '*'))}` } : null;
      view.render(st);
      const alpha = sim.alpha();
      const chips = [
        ['n', String(sim.n)],
        ['m', String(sim.m)],
        ['α = n/m', dec(alpha)],
        ['ricerca con successo, in media', sim.n ? `${dec(sim.avgHit())} ${chain ? 'confronti' : 'ispezioni'}` : '—'],
        [chain ? 'lista più lunga' : 'gruppo occupato più lungo', String(sim.longest())],
      ];
      if (!chain) chips.push(['caselle cancellate', String(sim.tombstones())]);
      stats.replaceChildren(...chips.map(([l, v]) => h('li.chip', l + ' ', h('strong', { text: v }))));
    }

    methodSel.addEventListener('change', () => {
      const keys = sim.keys.slice();
      const lost = rebuild(methodSel.value, sim.m, keys);
      last = null;
      msg.className = 'str-msg';
      msg.innerHTML = `Ora: ${lin.hashMethods[methodSel.value]}. Le chiavi sono state reinserite nello stesso ordine.${lost.length ? ` Non sono entrate: ${lost.join(', ')}.` : ''}`;
      draw();
    });
    mIn.addEventListener('input', () => {
      const keys = sim.keys.slice();
      const lost = rebuild(sim.method, Number(mIn.value), keys);
      last = null;
      msg.className = 'str-msg';
      msg.innerHTML = `Tabella ricostruita con ${m(`m = ${mIn.value}`)}: chiavi reinserite nello stesso ordine.${lost.length ? ` Non sono entrate: ${lost.join(', ')}.` : ''}`;
      draw();
    });
    kIn.addEventListener('input', draw);

    for (const k of [10, 17, 24, 5]) sim.insert(k);
    msg.textContent = 'Quattro chiavi già inserite: 10, 17, 24 e 5. Scegli un metodo e prova a inserire, cercare e cancellare.';
    draw();
  }

  /* --------------------------------------------- grafico dei costi attesi */

  function mountCosti(host) {
    const id = ASD.uid('hcost');
    const body = h('div.lab-body');
    const aIn = h('input', { type: 'range', id: id + '-a', min: '0.05', max: '0.95', step: '0.05', value: '0.5' });
    const aOut = h('output', { for: aIn.id });
    const out = h('div.lab-out', { 'aria-live': 'polite' });
    const lab = h(
      'div.lab',
      h('div.lab-head', h('h3', { text: 'Ispezioni attese al crescere di α' })),
      body,
      h('div.lab-controls', h('label.slider', { for: aIn.id }, h('span', 'α = n/m'), aIn, aOut)),
      out
    );
    host.append(lab);
    const plot = new ASD.viz.Plot(body, {
      x: { min: 0, max: 0.95, label: 'α' },
      y: { min: 0, max: 16, label: 'ispezioni' },
      height: 290,
      endLabels: false,
      ariaLabel: 'Numero atteso di ispezioni in funzione del fattore di carico',
    });
    const F = {
      chain: (a) => 1 + a,
      openMiss: (a) => 1 / (1 - a),
      openHit: (a) => (a < 1e-9 ? 1 : (1 / a) * Math.log(1 / (1 - a))),
      linMiss: (a) => 0.5 * (1 + 1 / ((1 - a) * (1 - a))),
    };
    function draw() {
      const a = Number(aIn.value);
      aOut.textContent = dec(a);
      plot.set({
        series: [
          { id: 'c', label: 'trabocco: 1 + α', slot: 1, fn: F.chain },
          { id: 'om', label: 'aperto, senza successo: 1/(1−α)', slot: 2, fn: F.openMiss },
          { id: 'oh', label: 'aperto, con successo', slot: 3, fn: F.openHit },
          { id: 'lm', label: 'lineare, senza successo', slot: 7, fn: F.linMiss, dashed: true },
        ],
        vlines: [{ x: a, label: `α = ${dec(a)}` }],
      });
      out.innerHTML = `<p style="margin:0">Con ${m(`α = ${dec(a)}`)}: liste di trabocco circa <strong>${dec(F.chain(a))}</strong> nodi esaminati per una ricerca senza successo;
      indirizzamento aperto (hashing uniforme) al più <strong>${dec(F.openMiss(a))}</strong> ispezioni senza successo e
      <strong>${dec(F.openHit(a))}</strong> con successo; con la scansione lineare circa <strong>${dec(F.linMiss(a))}</strong> senza successo.</p>`;
    }
    aIn.addEventListener('input', draw);
    draw();
  }

  /* ========================================================= capitolo */

  ASD.chapter({
    id: 'hash',
    title: 'Tabelle hash',
    lead: `Una tabella hash trasforma la chiave in un indice di array con una funzione hash: inserire, cercare e cancellare costano ${m('O(1)')} in media. Il prezzo sono le collisioni, chiavi diverse con lo stesso indice, che si gestiscono con le liste di trabocco o con l'indirizzamento aperto.`,
    minutes: 55,
    prereq: ['liste', 'cx-notazioni'],
    goals: [
      `calcolare ${m('h(k)')} con il metodo della divisione e scegliere bene <var>m</var>`,
      'simulare a mano inserimenti, ricerche e cancellazioni con le liste di trabocco e con la scansione lineare (tombstone comprese)',
      `stimare i costi con il fattore di carico ${m('α = n/m')}: ${m('Θ(1 + α)')} con le liste, circa ${m('1/(1-α)')} ispezioni con l'indirizzamento aperto`,
      'sapere quando serve il rehashing e usare <code>unordered_map</code> e <code>unordered_set</code>',
    ],

    render(el) {
      el.innerHTML = `
<section id="dizionario">
  <h2>Il problema del dizionario</h2>
  <p>Molti programmi gestiscono un insieme di chiavi (numeri di matricola, parole, codici) con tre operazioni:
  <strong>inserire</strong> una chiave, <strong>cercarla</strong>, <strong>cancellarla</strong>. È il problema del
  <strong>dizionario</strong>. Spesso a ogni chiave è associato un valore (matricola → studente), ma per i costi
  contano solo le chiavi.</p>
  ${table({
    caption: 'Il dizionario con le strutture che conosci (n chiavi)',
    head: ['Struttura', 'Inserire', 'Cercare', 'Cancellare'],
    rows: [
      ['Array o lista non ordinati', `${m('Θ(1)')}, se i doppioni non si controllano`, m('Θ(n)'), m('Θ(n)')],
      ['Array ordinato', m('Θ(n)'), `${m('Θ(log n)')} (ricerca binaria)`, m('Θ(n)')],
      [`Albero di ricerca bilanciato (${ASD.link('bst')})`, m('Θ(log n)'), m('Θ(log n)'), m('Θ(log n)')],
      ['Tabella ad accesso diretto', m('Θ(1)'), m('Θ(1)'), `${m('Θ(1)')}, ma memoria ${m('Θ(|U|)')}`],
      ['<strong>Tabella hash</strong>', `${m('O(1)')} in media`, `${m('O(1)')} in media`, `${m('O(1)')} in media; ${m('Θ(n)')} nel caso peggiore`],
    ],
  })}
  <p>Se le chiavi sono interi piccoli, da 0 a ${m('|U| - 1')}, la soluzione è immediata: un array grande quanto
  l'<strong>universo</strong> <var>U</var> delle chiavi possibili, con la chiave <var>k</var> nella casella <var>k</var>
  (tabella ad <strong>accesso diretto</strong>). Ma se le chiavi sono numeri di telefono o parole, <var>U</var> è
  enorme e quasi tutto l'array resterebbe vuoto.</p>
  <p>La <strong>tabella hash</strong> usa invece un array di <var>m</var> caselle, con <var>m</var> proporzionale al
  numero di chiavi da memorizzare, e una <strong>funzione hash</strong> <var>h</var> che trasforma ogni chiave in un
  indice tra 0 e ${m('m - 1')}: la chiave <var>k</var> va nella casella ${m('h(k)')}.</p>
</section>

<section id="funzioni">
  <h2>Funzioni hash</h2>
  <p>Una buona funzione hash si calcola in tempo costante e sparge le chiavi in modo uniforme tra le <var>m</var>
  caselle. L'ipotesi su cui si basano tutti i conti dei costi si chiama <strong>hashing uniforme semplice</strong>:
  ogni chiave finisce in una qualsiasi delle <var>m</var> caselle con la stessa probabilità, indipendentemente dalle
  altre.</p>
  <h3>Metodo della divisione</h3>
  <p class="formula">${m('h(k) = k mod m')}</p>
  <div data-mount="codeDiv"></div>
  <p>È il più usato all'esame, e la scelta di <var>m</var> conta. Con ${m('m = 2^p')} il resto è fatto solo dagli
  ultimi <var>p</var> bit di <var>k</var>; con ${m('m = 10^p')} dalle ultime <var>p</var> cifre decimali. Se le chiavi
  hanno regolarità proprio lì (tutte pari, tutte che finiscono per 0), si ammucchiano in poche caselle. Una buona scelta
  è un <strong>numero primo</strong> non troppo vicino a una potenza di 2: per circa 2000 chiavi, con liste lunghe in
  media 3, il Cormen suggerisce ${m('m = 701')}.</p>
  ${box('errore', `<p>In C++ il resto di un numero negativo è negativo: <code>-7 % 5</code> vale <code>-2</code>, non 3, e
  <code>t[-2]</code> è fuori dall'array. Se le chiavi possono essere negative si scrive <code>((k % m) + m) % m</code>,
  che dà sempre un indice tra 0 e ${m('m - 1')}.</p>`)}
  <div data-mount="codeNeg"></div>
  <h3>Metodo della moltiplicazione</h3>
  <p class="formula">${m('h(k) = ⌊m · (k·A mod 1)⌋')}, con ${m('0 < A < 1')}</p>
  <p>Si moltiplica la chiave per una costante <var>A</var>, si tiene la parte frazionaria (un numero tra 0 e 1) e la si
  scala su <var>m</var> caselle. Qui <var>m</var> non è critico: va bene anche una potenza di 2, che rende il calcolo
  velocissimo. Knuth suggerisce ${m('A ≈ (√5 - 1)/2 ≈ 0,618')}.</p>
  <div data-mount="codeMol"></div>
  <h3>Chiavi che sono stringhe</h3>
  <p>Una stringa si trasforma in un numero trattando i caratteri come cifre in base <var>B</var> (spesso 31):
  ${m('s_0·B^{L-1} + s_1·B^{L-2} + … + s_{L-1}')}. Si calcola con il <strong>metodo di Horner</strong>
  (${m('h = h·B + s_i')}, un carattere alla volta) e si prende il modulo a ogni passo: il risultato è lo stesso e il
  numero non diventa mai troppo grande. Sommare semplicemente i codici dei caratteri sarebbe una cattiva idea:
  "pila" e "lipa" avrebbero lo stesso indice.</p>
  <div data-mount="codeStr"></div>
  <p>Prova i tre metodi con la calcolatrice. Con ${m('k = 123456')} e ${m('m = 16384 = 2^{14}')} il metodo della
  moltiplicazione dà 67, lo stesso valore dell'esempio del Cormen.</p>
  <div data-mount="calc"></div>
  ${box('ricorda', `<p>Una funzione hash deve essere <strong>deterministica</strong> (la stessa chiave dà sempre lo stesso
  indice, altrimenti la ricerca non la ritroverebbe), <strong>veloce</strong> e <strong>uniforme</strong>. Due chiavi con lo stesso
  indice non sono uguali: per sapere se una chiave c'è bisogna sempre confrontarla con <code>==</code>.</p>`)}
</section>

<section id="collisioni">
  <h2>Collisioni</h2>
  <p>Una <strong>collisione</strong> è una coppia di chiavi diverse con lo stesso indice, ${m('h(k_1) = h(k_2)')}. Se
  l'universo delle chiavi ha più di <var>m</var> elementi, le collisioni sono inevitabili (principio dei cassetti). E
  arrivano presto: con ${m('m = 365')} caselle, bastano 23 chiavi messe a caso perché la probabilità di almeno una
  collisione superi il 50%. È il <strong>paradosso del compleanno</strong>.</p>
  <p>Le soluzioni sono due famiglie:</p>
  <ul>
    <li><strong>liste di trabocco</strong> (<i>chaining</i>, concatenamento): ogni casella contiene una lista con tutte le
    chiavi che hanno quell'indice;</li>
    <li><strong>indirizzamento aperto</strong> (<i>open addressing</i>): tutte le chiavi stanno nell'array; se la casella è
    occupata, se ne prova un'altra secondo una regola fissa.</li>
  </ul>
</section>

<section id="trabocco">
  <h2>Liste di trabocco</h2>
  <p>La tabella è un array di <var>m</var> puntatori: <code>t[i]</code> è la testa della lista con le chiavi <var>k</var>
  tali che ${m('h(k) = i')}. Inserire vuol dire aggiungere in testa alla lista giusta (dopo aver controllato che la chiave
  non ci sia già); cercare e cancellare vogliono dire scorrere quella lista, con le stesse operazioni di
  ${ASD.link('liste')}.</p>
  <p>L'input parte da <var>m</var> e poi elenca le operazioni: <code>ins k</code>, <code>cerca k</code>,
  <code>canc k</code>. L'esempio usa le stesse chiavi della scansione lineare più sotto, così puoi confrontare.</p>
  <div data-mount="stChain"></div>
  <h3>Quanto costa</h3>
  <p>Il <strong>fattore di carico</strong> ${m('α = n/m')} è la lunghezza media delle liste. Nell'ipotesi di hashing uniforme
  semplice, una ricerca senza successo calcola ${m('h(k)')} e scorre tutta una lista, in media lunga ${m('α')}: ${m('Θ(1 + α)')}.
  Anche una ricerca con successo costa ${m('Θ(1 + α)')} (in media circa ${m('1 + α/2')} nodi esaminati). Se <var>m</var>
  cresce insieme a <var>n</var>, cioè ${m('m = Θ(n)')}, allora ${m('α = O(1)')} e tutte le operazioni costano ${m('O(1)')}
  in media. Con le liste ${m('α')} può anche superare 1.</p>
  <p>Il caso peggiore resta ${m('Θ(n)')}: se tutte le chiavi hanno lo stesso indice, la tabella è una lista sola.</p>
</section>

<section id="aperto">
  <h2>Indirizzamento aperto</h2>
  <p>Qui non ci sono liste: ogni casella contiene una chiave oppure è libera, quindi ${m('n <= m')} e ${m('α <= 1')}. Per
  ogni chiave c'è una <strong>sequenza di ispezione</strong> ${m('h(k, 0), h(k, 1), …, h(k, m - 1)')}: per inserire si
  provano le caselle in quell'ordine fino alla prima libera; per cercare si segue la stessa sequenza fino a trovare la
  chiave o una casella vuota.</p>
  <h3>Scansione lineare</h3>
  <p class="formula">${m('h(k, i) = (h(k) + i) mod m')}</p>
  <p>Se la casella è occupata si prova quella dopo, e dopo l'ultima si torna alla 0. È semplice, ma le chiavi si
  ammucchiano in <strong>gruppi</strong> di caselle consecutive occupate (<i>primary clustering</i>): un gruppo lungo attira
  altre chiavi, che lo allungano ancora.</p>
  <div data-mount="stLinear"></div>
  <h3>Cancellare: le tombstone</h3>
  <p>Una casella svuotata non si può rimettere a <code>VUOTO</code>. Nell'esempio, 17 e 24 sono finite nelle caselle 4 e 5
  perché la 3 era occupata da 10: se cancellando 17 la casella 4 tornasse vuota, <code>cerca(24)</code> si fermerebbe lì e
  risponderebbe che 24 non c'è. Si scrive invece un segnaposto, <code>CANCELLATO</code> (in inglese <i>tombstone</i>,
  "lapide"): la ricerca lo salta e prosegue, l'inserimento può riusarlo. Il costo: le caselle cancellate allungano le
  ricerche finché non si ricostruisce la tabella. Se le cancellazioni sono frequenti, le liste di trabocco sono una scelta
  migliore.</p>
  ${box('errore', `<p>Fermare la ricerca alla prima casella <code>CANCELLATO</code>, come se fosse vuota. È lo stesso errore
  visto da un altro lato: la ricerca deve fermarsi solo su <code>VUOTO</code> (o dopo <var>m</var> ispezioni).</p>`)}
  <h3>Scansione quadratica e doppio hashing</h3>
  <p>Per evitare i gruppi si salta più lontano.</p>
  <ul>
    <li><strong>Scansione quadratica</strong>: ${m('h(k, i) = (h(k) + c_1·i + c_2·i^2) mod m')}. I salti crescono e i gruppi
    primari spariscono, ma due chiavi con lo stesso ${m('h(k)')} seguono ancora la stessa sequenza (<i>secondary
    clustering</i>). Inoltre ${m('c_1')}, ${m('c_2')} e <var>m</var> vanno scelti perché la sequenza visiti abbastanza caselle.</li>
    <li><strong>Doppio hashing</strong>: ${m('h(k, i) = (h_1(k) + i·h_2(k)) mod m')}. Il passo dipende dalla chiave, quindi
    chiavi con lo stesso ${m('h_1')} prendono strade diverse. ${m('h_2(k)')} non deve mai valere 0 e deve essere primo con
    <var>m</var>, altrimenti la sequenza non tocca tutte le caselle. La scelta classica: <var>m</var> primo e
    ${m('h_2(k) = 1 + (k mod (m - 1))')}.</li>
  </ul>
  ${box('esame', `<p>L'esercizio classico (Cormen 11.4-1): inserire 10, 22, 31, 4, 15, 28, 17, 88, 59 in una tabella con
  ${m('m = 11')} e ${m('h(k) = k mod 11')}, con la scansione lineare, quella quadratica con ${m('c_1 = 1')} e ${m('c_2 = 3')}, e
  il doppio hashing con ${m('h_2(k) = 1 + (k mod 10)')}. Per ogni chiave scrivi la sequenza delle caselle provate, non solo
  il risultato: è lì che si prendono i punti. Nel laboratorio qui sotto il bottone <em>Chiavi d'esame</em> carica proprio
  queste chiavi, con il metodo che scegli.</p>`)}
</section>

<section id="laboratorio">
  <h2>Laboratorio</h2>
  <p>Scegli il metodo e <var>m</var>, poi inserisci, cerca e cancella chiavi. I numeri blu a sinistra delle caselle sono
  l'ordine delle ispezioni dell'ultima operazione. Prova a riempire la tabella con la scansione lineare e guarda crescere
  il gruppo più lungo; poi passa al doppio hashing con le stesse chiavi. Cambiando metodo o <var>m</var> le chiavi vengono
  reinserite nello stesso ordine.</p>
  <div data-mount="lab"></div>
</section>

<section id="costi">
  <h2>Fattore di carico e costi</h2>
  ${table({
    caption: `Costo medio delle operazioni con ${m('α = n/m')} (ipotesi di hashing uniforme)`,
    head: ['Metodo', 'Ricerca senza successo', 'Ricerca con successo', 'Note'],
    rows: [
      ['Liste di trabocco', m('Θ(1 + α)'), `${m('Θ(1 + α)')}, circa ${m('1 + α/2')}`, `${m('α')} può superare 1; inserimento in testa ${m('O(1)')}`],
      ['Indirizzamento aperto', `al più ${m('1/(1 - α)')} ispezioni`, `al più ${m('(1/α) ln(1/(1 - α))')}`, `serve ${m('α < 1')}; con ${m('α = 1/2')}: 2 e 1,39; con ${m('α = 0,9')}: 10 e 2,56`],
      ['Qualsiasi metodo, caso peggiore', m('Θ(n)'), m('Θ(n)'), 'tutte le chiavi con lo stesso indice'],
    ],
  })}
  <p>Il limite ${m('1/(1 - α)')} ha una spiegazione semplice: ogni ispezione trova una casella occupata con probabilità
  circa ${m('α')}, quindi servono in media ${m('1 + α + α^2 + … = 1/(1 - α)')} ispezioni prima di trovarne una vuota.
  Con la scansione lineare i gruppi peggiorano le cose: una ricerca senza successo costa circa
  ${m('(1 + 1/(1 - α)^2)/2')} ispezioni (Knuth). Muovi α e guarda come esplodono le curve vicino a 1.</p>
  <div data-mount="costi"></div>
  ${box('ricorda', `<p>Tutti i costi ${m('O(1)')} valgono "in media" e solo se ${m('α')} resta limitato. Con le liste di trabocco va
  bene ${m('α')} intorno a 1; con l'indirizzamento aperto conviene restare sotto 0,5 – 0,75. Quando ${m('α')} supera la soglia
  si fa il rehashing.</p>`)}
</section>

<section id="rehash">
  <h2>Rehashing</h2>
  <p>Quando il fattore di carico supera la soglia, si alloca una tabella circa grande il doppio (con <var>m</var> di nuovo
  primo) e si reinseriscono tutte le chiavi. Non si può copiare l'array così com'è: ${m('h(k) = k mod m')} dipende da
  <var>m</var>, quindi con il nuovo <var>m</var> ogni chiave ha una nuova casella. Un rehash costa ${m('Θ(n + m)')}, ma
  capita di rado: come per il <code>vector</code> che raddoppia (${ASD.link('pile-code', 'pila', 'Pile e code')}), il costo
  ammortizzato di ogni inserimento resta ${m('O(1)')}. Con l'indirizzamento aperto il rehash elimina anche le caselle
  cancellate.</p>
  <p>Nel laboratorio, il bottone <em>Rehash</em> fa esattamente questo: guarda come le chiavi cambiano posto.</p>
  ${box('errore', `<p>Copiare la vecchia tabella nelle prime caselle di quella nuova, come si fa con un array che cresce. Le
  chiavi restano dove le aveva messe il vecchio ${m('h')}: la ricerca, che usa il nuovo ${m('h')}, non le trova più.</p>`)}
</section>

<section id="stl">
  <h2>unordered_map e unordered_set</h2>
  <p>La libreria standard ha due tabelle hash pronte: <code>unordered_set&lt;K&gt;</code> (un insieme di chiavi) e
  <code>unordered_map&lt;K, V&gt;</code> (chiave → valore). Le implementazioni comuni usano le liste di trabocco e fanno
  il rehash da sole quando ${m('α')} supera <code>max_load_factor()</code>, che vale 1 per default.</p>
  <div data-mount="codeStl"></div>
  <p>Output del programma:</p>
  <pre class="code-out" tabindex="0"><code>chiavi distinte: 6
contiene 16: true
dopo erase, contiene 16: false
coda: 2
lista: 1
pila: 3
albero trovato: false
quadrati[12] = 144
load_factor &lt;= max_load_factor: true
max_load_factor predefinito: 1</code></pre>
  ${table({
    caption: 'Tabelle hash o alberi? (con n elementi)',
    head: ['', '<code>unordered_set</code> / <code>unordered_map</code>', '<code>set</code> / <code>map</code>'],
    rows: [
      ['Struttura', 'tabella hash', 'albero di ricerca bilanciato (rosso-nero)'],
      ['<code>insert</code>, <code>find</code>, <code>erase</code>', `${m('O(1)')} in media, ${m('O(n)')} nel caso peggiore`, `${m('O(log n)')} sempre`],
      ['Ordine delle chiavi', 'nessuno: l\'ordine di visita non è definito', 'crescente'],
      ['Minimo, successore, intervalli', `${m('Θ(n)')}`, `${m('O(log n)')}`],
      ['Cosa serve alla chiave', '<code>std::hash</code> e <code>==</code>', 'l\'operatore <code>&lt;</code>'],
    ],
  })}
  ${box('errore', `<p><code>conta[w]</code> su una <code>unordered_map</code> (o su una <code>map</code>) <strong>crea</strong> la voce se
  non c'è, con valore 0. Per sapere se una chiave c'è senza aggiungerla si usa <code>count</code> o <code>find</code>.
  Se la chiave è un tipo tuo (una <code>struct</code>), devi fornire anche la funzione hash e <code>==</code>.</p>`)}
  ${box('nota', `Se sai già quante chiavi arriveranno, <code>reserve(n)</code> prepara abbastanza caselle ed evita i rehash
  durante gli inserimenti.`, 'Un consiglio pratico')}
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        codeDiv: (host) => ASD.code(host, { src: 'strutture/hash_funzioni', region: 'divisione' }),
        codeNeg: (host) => ASD.code(host, { src: 'strutture/hash_funzioni', region: 'negativi' }),
        codeMol: (host) => ASD.code(host, { src: 'strutture/hash_funzioni', region: 'moltiplicazione' }),
        codeStr: (host) => ASD.code(host, { src: 'strutture/hash_funzioni', region: 'stringhe' }),
        calc: mountCalc,
        stChain: (host) =>
          ASD.stepper(host, {
            id: 'hash-trabocco',
            title: 'Liste di trabocco passo per passo',
            code: { src: 'strutture/hash_concatenamento', region: 'tabella' },
            input: {
              label: 'Operazioni',
              value: { M: 7, ops: [{ op: 'ins', x: 10 }, { op: 'ins', x: 17 }, { op: 'ins', x: 24 }, { op: 'ins', x: 5 }, { op: 'cerca', x: 31 }, { op: 'canc', x: 17 }, { op: 'ins', x: 31 }] },
              parse: (text) => parseHashInput(text, 7),
              format: fmtHash,
              presets: [
                { label: 'Chiavi casuali', value: () => ({ M: 7, ops: ASD.randomDistinct(5, 0, 60).map((x) => ({ op: 'ins', x })).concat([{ op: 'cerca', x: ASD.randInt(0, 60) }]) }) },
                { label: 'Tutte nella stessa lista', value: () => ({ M: 5, ops: [3, 8, 13, 18].map((x) => ({ op: 'ins', x })).concat([{ op: 'cerca', x: 23 }, { op: 'canc', x: 8 }]) }) },
              ],
            },
            view: (stage) => new ASD.viz.HashView(stage, { mode: 'chain', ariaLabel: 'Tabella con liste di trabocco' }),
            trace: traceChain,
            counters: [{ key: 'confronti', label: 'confronti tra chiavi' }],
            legend: [
              { k: 'compare', label: 'in esame' },
              { k: 'done', label: 'trovata' },
              { k: 'key', label: 'appena inserita' },
              { k: 'swap', label: 'da togliere' },
            ],
            validate: (inp, frames) => {
              const st = frames[frames.length - 1].state;
              return sameTable(st.t, simulate('chain', inp.M, inp.ops)) ? null : 'tabella finale diversa dal simulatore';
            },
          }),
        stLinear: (host) =>
          ASD.stepper(host, {
            id: 'hash-lineare',
            title: 'Scansione lineare, con cancellazione',
            code: { src: 'strutture/hash_lineare', region: 'tabella' },
            input: {
              label: 'Operazioni',
              value: { M: 7, ops: [{ op: 'ins', x: 10 }, { op: 'ins', x: 17 }, { op: 'ins', x: 24 }, { op: 'ins', x: 5 }, { op: 'canc', x: 17 }, { op: 'cerca', x: 24 }, { op: 'ins', x: 31 }] },
              parse: (text) => parseHashInput(text, 7),
              format: fmtHash,
              presets: [
                { label: 'Gruppo che cresce', value: () => ({ M: 7, ops: [14, 15, 21, 28, 16].map((x) => ({ op: 'ins', x })).concat([{ op: 'cerca', x: 35 }]) }) },
                { label: 'Chiavi casuali', value: () => ({ M: 7, ops: ASD.randomDistinct(5, 0, 60).map((x) => ({ op: 'ins', x })) }) },
              ],
            },
            view: (stage) => new ASD.viz.HashView(stage, { mode: 'open', ariaLabel: 'Tabella a indirizzamento aperto' }),
            trace: traceLinear,
            counters: [{ key: 'ispezioni', label: 'ispezioni' }],
            legend: [
              { k: 'compare', label: 'ispezione in corso' },
              { k: 'probed', label: 'già ispezionata (col numero)' },
              { k: 'done', label: 'trovata' },
              { k: 'key', label: 'appena inserita' },
              { k: 'hs-tomb', label: 'cancellata (tombstone)' },
            ],
            validate: (inp, frames) => {
              const st = frames[frames.length - 1].state;
              return sameTable(st.t, simulate('linear', inp.M, inp.ops)) ? null : 'tabella finale diversa dal simulatore';
            },
          }),
        lab: mountLab,
        costi: mountCosti,
        codeStl: (host) => ASD.code(host, { src: 'strutture/hash_stl', maxHeight: 420 }),
        quiz: (host) =>
          ASD.quiz(host, [
            {
              q: `Tabella con ${m('m = 11')}, ${m('h(k) = k mod 11')} e scansione lineare. Inserisci in ordine 10, 22, 31, 4, 15. In quale casella finisce 15?`,
              options: ['5', '4', '6', '3'],
              answer: 0,
              explain: `10 → casella 10, 22 → 0, 31 → 9, 4 → 4. Poi ${m('h(15) = 4')}, ma la 4 è occupata: si prova la 5, che è libera.
              È l'inizio dell'esercizio 11.4-1 del Cormen: puoi rifarlo tutto nel laboratorio con <em>Chiavi d'esame</em>.`,
            },
            {
              q: 'Con l\'indirizzamento aperto, perché una casella cancellata non si rimette a <code>VUOTO</code>?',
              options: [
                'Perché una ricerca si ferma alla prima casella vuota e non troverebbe le chiavi messe più avanti dopo una collisione',
                'Perché <code>VUOTO</code> occupa più memoria di <code>CANCELLATO</code>',
                'Perché così l\'inserimento è più veloce',
                'Non c\'è differenza: è solo una convenzione',
              ],
              answer: 0,
              explain: `Se 24 è finita nella casella 5 perché la 3 e la 4 erano occupate, la ricerca di 24 passa per la 3 e la 4. Se la 4
              diventasse vuota, la ricerca si fermerebbe lì. <code>CANCELLATO</code> dice "qui c'era qualcosa, continua".`,
            },
            {
              q: `Liste di trabocco con ${m('n = 2000')} chiavi e ${m('m = 701')} liste. Quanti nodi esamina in media una ricerca <strong>senza successo</strong>?`,
              options: ['circa 3', 'circa 2000', 'circa 11', 'esattamente 1'],
              answer: 0,
              explain: `Scorre tutta una lista, lunga in media ${m('α = n/m = 2000/701 ≈ 2,85')}: circa 3 nodi, più il calcolo di
              ${m('h(k)')}. È il costo ${m('Θ(1 + α)')}. Con una lista unica sarebbero 2000.`,
            },
            {
              q: `Indirizzamento aperto con ${m('α = 0,9')}, nell'ipotesi di hashing uniforme. Quante ispezioni costa al più, in media, una ricerca senza successo?`,
              options: ['10', '1,9', '2', '90'],
              answer: 0,
              explain: `Il limite è ${m('1/(1 - α) = 1/0,1 = 10')}. Con ${m('α = 0,5')} sarebbero 2: ecco perché con l'indirizzamento aperto si fa
              il rehash ben prima che la tabella sia piena.`,
            },
            {
              q: 'Metodo della divisione con chiavi decimali qualsiasi: quali valori di <var>m</var> sono <strong>cattive</strong> scelte?',
              options: [m('m = 1024'), m('m = 1000'), m('m = 701'), m('m = 389')],
              answer: [0, 1],
              explain: `Con ${m('m = 1024 = 2^{10}')} l'indice dipende solo dagli ultimi 10 bit della chiave; con ${m('m = 1000')} solo dalle
              ultime 3 cifre. 701 e 389 sono primi e lontani dalle potenze di 2: il resto dipende da tutta la chiave.`,
            },
            {
              q: 'Quali affermazioni su <code>unordered_map</code> e <code>map</code> sono vere?',
              options: [
                '<code>unordered_map::find</code> costa ' + m('O(1)') + ' in media',
                '<code>map</code> tiene le chiavi in ordine crescente',
                '<code>unordered_map</code> visita le chiavi in ordine crescente',
                '<code>map::find</code> costa ' + m('O(1)') + ' in media',
              ],
              answer: [0, 1],
              explain: `<code>unordered_map</code> è una tabella hash: ${m('O(1)')} in media, ${m('O(n)')} nel caso peggiore, nessun ordine.
              <code>map</code> è un albero bilanciato: ${m('O(log n)')} per ogni operazione e chiavi in ordine.`,
            },
          ]),
      });
    },
  });
})();
