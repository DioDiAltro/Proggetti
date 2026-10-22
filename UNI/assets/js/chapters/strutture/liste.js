/* ASD a quadretti — capitolo "Liste concatenate".
   Il nodo e il puntatore, scorrere e cercare, inserire (in testa, in coda, dopo
   un nodo), cancellare per valore, liste contro array, puntatore tail, liste
   doppie con sentinella, inversione sul posto. Le tracce seguono riga per riga
   i programmi in esempi/strutture/lista_*.cpp. */
(function () {
  'use strict';

  const { m, box, table, h } = ASD;
  const lin = ASD.lin;

  /** Come si legge un puntatore nelle variabili dello stepper. */
  const ref = (L, id) => (id == null ? 'nullptr' : `nodo ${L.nodes[id].val}`);
  const val = (L, id) => L.nodes[id].val;

  /* ------------------------------------------------------------ input */

  function splitBar(text, example) {
    const parts = String(text).split('|');
    if (parts.length !== 2) throw new Error(`Scrivi la lista, poi una barra | e il resto. Esempio: ${example}`);
    return parts;
  }

  function oneNumber(s, what) {
    const t = String(s).trim();
    if (!/^\d{1,2}$/.test(t)) throw new Error(`${what} deve essere un intero tra 0 e 99.`);
    return Number(t);
  }

  const listOf = (s, maxLen = 6) => lin.parseValues(s, { min: 0, max: 99, maxLen });
  const randList = (n) => ASD.randomDistinct(n, 2, 60);

  /* ------------------------------------------------------- ricerca */

  function traceCerca({ list, x }) {
    const t = new ASD.Tracer(['confronti']);
    const L = new lin.Model(list);
    const S = (p, cls, hot, meta) => L.snap({ ptrs: { head: L.head, p }, cls, hot, meta });
    let p = L.head;
    t.step(
      'c-init',
      p == null
        ? '<code>p = head</code>: la lista è vuota, quindi <code>p</code> vale <code>nullptr</code>.'
        : `<code>p = head</code>: <code>p</code> punta al primo nodo, che contiene ${val(L, p)}.`,
      { x, p: ref(L, p) },
      S(p, {}, ['p'])
    );
    for (;;) {
      if (p == null) {
        t.step(
          'c-test',
          '<code>p == nullptr</code>: la lista è finita. La prima condizione è falsa, quindi <code>p-&gt;val</code> non viene letto (corto circuito di <code>&amp;&amp;</code>).',
          { x, p: 'nullptr' },
          S(null, {})
        );
        break;
      }
      const v = val(L, p);
      t.count('confronti');
      if (v === x) {
        t.step('c-test', `<code>p-&gt;val</code> = ${v} è il valore cercato: la condizione del <code>while</code> è falsa e il ciclo si ferma.`, { x, p: ref(L, p) }, S(p, { [p]: 'found' }));
        break;
      }
      t.step('c-test', `<code>p-&gt;val</code> = ${v} ≠ ${x}: si continua.`, { x, p: ref(L, p) }, S(p, { [p]: 'compare' }));
      p = L.nodes[p].next;
      t.step(
        'c-next',
        p == null
          ? '<code>p = p-&gt;next</code>: quello era l\'ultimo nodo, ora <code>p</code> vale <code>nullptr</code>.'
          : `<code>p = p-&gt;next</code>: <code>p</code> passa al nodo con ${val(L, p)}.`,
        { x, p: ref(L, p) },
        S(p, {}, ['p'])
      );
    }
    const found = p != null;
    t.step(
      'c-ret',
      found
        ? `<code>return p</code>: l'indirizzo del nodo con ${x}. Confronti fatti: ${t.c.confronti}.`
        : `<code>return p</code>, cioè <code>nullptr</code>: ${x} non c'è. Confronti fatti: ${t.c.confronti}, uno per nodo.`,
      { x, p: ref(L, p) },
      S(p, found ? { [p]: 'found' } : {}, null, { found })
    );
    return t.frames;
  }

  function validateCerca(inp, frames) {
    const st = frames[frames.length - 1].state;
    const p = st.ptrs.p;
    if (inp.list.includes(inp.x) !== (p != null)) return 'esito della ricerca sbagliato';
    if (p != null && st.row.indexOf(p) !== inp.list.indexOf(inp.x)) return 'p non punta alla prima occorrenza';
    return lin.checkList(frames, inp.list);
  }

  /* --------------------------------------------------- inserimento */

  function traceInserisci(inp) {
    const { list, op, x, k } = inp;
    const t = new ASD.Tracer(['scorsi']);
    const L = new lin.Model(list);
    const row = L.order();
    const N = L.add(x);
    const NEW = { [N]: 'new' };
    const S = (o) => L.snap(Object.assign({ row }, o, { cls: Object.assign({}, NEW, o.cls || {}) }));
    const fine = (note) => t.step(null, note, {}, L.snap({ ptrs: { head: L.head }, cls: NEW }));

    if (op === 'testa') {
      const fl = { [N]: -0.5 };
      t.step(
        't-new',
        `<code>new</code> crea nello heap un nodo con <code>val = ${x}</code> e <code>next = nullptr</code>. Per ora solo la variabile <code>nuovo</code> sa dov'è.`,
        { x, nuovo: ref(L, N) },
        S({ float: fl, ptrs: { head: L.head, nuovo: N }, hot: ['nuovo'] })
      );
      const old = L.head;
      L.nodes[N].next = old;
      t.step(
        't-link',
        old == null
          ? '<code>nuovo-&gt;next = head</code>: la lista è vuota, <code>head</code> vale <code>nullptr</code> e ora lo vale anche <code>nuovo-&gt;next</code>.'
          : `<code>nuovo-&gt;next = head</code>: il nuovo nodo punta al vecchio primo (${val(L, old)}). La lista non è ancora cambiata: <code>head</code> punta sempre lì.`,
        { x, nuovo: ref(L, N) },
        S({ float: fl, ptrs: { head: old, nuovo: N }, hot: [N] })
      );
      L.head = N;
      t.step('t-head', '<code>head = nuovo</code>: ora la lista comincia dal nuovo nodo.', { x, nuovo: ref(L, N) }, S({ float: fl, ptrs: { head: N, nuovo: N }, hot: ['head'] }));
      fine('Fatto in Θ(1): un <code>new</code> e due assegnazioni, qualunque sia la lunghezza della lista. Qui la lista è ridisegnata a partire da <code>head</code>.');
      return t.frames;
    }

    if (op === 'coda') {
      const n = row.length;
      const fl = { [N]: n ? n - 0.5 : 0 };
      t.step(
        'c-new',
        `<code>new</code> crea il nodo con ${x}. Il suo <code>next</code> è già <code>nullptr</code>: giusto, perché sarà l'ultimo.`,
        { x, nuovo: ref(L, N) },
        S({ float: fl, ptrs: { head: L.head, nuovo: N }, hot: ['nuovo'] })
      );
      if (L.head == null) {
        t.step('c-empty', '<code>head == nullptr</code>: la lista è vuota, il nuovo nodo sarà il primo e l\'ultimo.', { x, nuovo: ref(L, N) }, S({ float: fl, ptrs: { head: null, nuovo: N } }));
        L.head = N;
        t.step('c-head', '<code>head = nuovo</code>, poi <code>return</code>: la lista ha un solo nodo.', { x, nuovo: ref(L, N) }, S({ float: fl, ptrs: { head: N, nuovo: N }, hot: ['head'] }));
        fine('Fatto: con la lista vuota non c\'era niente da scorrere. È il caso speciale che chi scrive l\'inserimento in coda dimentica più spesso.');
        return t.frames;
      }
      t.step('c-empty', '<code>head</code> non è <code>nullptr</code>: bisogna arrivare all\'ultimo nodo.', { x, nuovo: ref(L, N) }, S({ float: fl, ptrs: { head: L.head, nuovo: N } }));
      let p = L.head;
      const P = () => ({ head: L.head, p, nuovo: N });
      t.step('c-init', `<code>p = head</code>: si parte dal primo nodo (${val(L, p)}).`, { x, p: ref(L, p) }, S({ float: fl, ptrs: P(), hot: ['p'] }));
      for (;;) {
        const last = L.nodes[p].next == null;
        t.step(
          'c-test',
          last
            ? '<code>p-&gt;next == nullptr</code>: <code>p</code> è l\'ultimo nodo, il ciclo finisce.'
            : `<code>p-&gt;next</code> non è <code>nullptr</code>: il nodo ${val(L, p)} non è l'ultimo, si va avanti.`,
          { x, p: ref(L, p) },
          S({ float: fl, ptrs: P(), cls: { [p]: 'compare' } })
        );
        if (last) break;
        p = L.nodes[p].next;
        t.count('scorsi');
        t.step('c-adv', `<code>p = p-&gt;next</code>: <code>p</code> passa al nodo con ${val(L, p)}.`, { x, p: ref(L, p) }, S({ float: fl, ptrs: P(), hot: ['p'] }));
      }
      L.nodes[p].next = N;
      t.step('c-link', '<code>p-&gt;next = nuovo</code>: l\'ultimo nodo ora punta al nuovo, che diventa l\'ultimo.', { x, p: ref(L, p) }, S({ float: fl, ptrs: P(), hot: [p] }));
      fine(
        `Fatto. Per arrivare in fondo il ciclo ha fatto ${t.c.scorsi} passi: con <var>n</var> nodi sono ${m('n-1')}, quindi l'inserimento in coda costa ${m('Θ(n)')}. Con un puntatore all'ultimo nodo (<code>tail</code>) basterebbe ${m('Θ(1)')}.`
      );
      return t.frames;
    }

    // dopo il nodo che contiene k
    const p = row.find((id) => L.nodes[id].val === k);
    const fl = { [N]: row.indexOf(p) + 0.5 };
    const P = { head: L.head, p, nuovo: N };
    t.step(
      'd-new',
      `<code>p</code> punta al nodo con ${k} (trovato prima, per esempio con <code>cerca</code>). <code>new</code> crea il nodo con ${x}.`,
      { x, p: ref(L, p), nuovo: ref(L, N) },
      S({ float: fl, ptrs: P, cls: { [p]: 'compare' }, hot: ['nuovo'] })
    );
    const succ = L.nodes[p].next;
    L.nodes[N].next = succ;
    t.step(
      'd-link',
      succ == null
        ? '<code>nuovo-&gt;next = p-&gt;next</code>: <code>p</code> è l\'ultimo nodo, quindi il nuovo punta a <code>nullptr</code>.'
        : `<code>nuovo-&gt;next = p-&gt;next</code>: il nuovo nodo punta al successore di <code>p</code> (${val(L, succ)}). Nessun collegamento è stato ancora rotto.`,
      { x, p: ref(L, p), nuovo: ref(L, N) },
      S({ float: fl, ptrs: P, cls: { [p]: 'compare' }, hot: [N] })
    );
    L.nodes[p].next = N;
    t.step(
      'd-p',
      '<code>p-&gt;next = nuovo</code>: <code>p</code> ora punta al nuovo nodo e la catena è di nuovo completa.',
      { x, p: ref(L, p), nuovo: ref(L, N) },
      S({ float: fl, ptrs: P, cls: { [p]: 'compare' }, hot: [p] })
    );
    fine(`Fatto in ${m('Θ(1)')}: due assegnazioni, perché <code>p</code> era già noto. Se la posizione va prima cercata, la ricerca costa ${m('Θ(n)')}.`);
    return t.frames;
  }

  function expectedInsert(inp) {
    const a = inp.list.slice();
    if (inp.op === 'testa') a.unshift(inp.x);
    else if (inp.op === 'coda') a.push(inp.x);
    else a.splice(a.indexOf(inp.k) + 1, 0, inp.x);
    return a;
  }

  const insInput = {
    label: 'Lista | operazione',
    value: { list: [8, 15, 23], op: 'dopo', k: 15, x: 16 },
    parse(text) {
      const [a, b] = splitBar(text, '8, 15, 23 | testa 4');
      const list = listOf(a);
      const mm = /^\s*(testa|coda|dopo)\s+(\d{1,2})(?:\s+(\d{1,2}))?\s*$/i.exec(b);
      if (!mm) throw new Error('Dopo la | scrivi "testa x", "coda x" oppure "dopo k x" (x dopo il nodo che contiene k).');
      const op = mm[1].toLowerCase();
      if (op === 'dopo') {
        if (mm[3] == null) throw new Error('Con "dopo" servono due numeri: il valore del nodo p e il valore da inserire.');
        const k = Number(mm[2]);
        if (!list.includes(k)) throw new Error(`Nella lista non c'è un nodo con ${k}.`);
        return { list, op, k, x: Number(mm[3]) };
      }
      if (mm[3] != null) throw new Error(`Con "${op}" serve un solo numero.`);
      return { list, op, x: Number(mm[2]) };
    },
    format: (v) => `${v.list.join(', ')} | ${v.op}${v.op === 'dopo' ? ' ' + v.k : ''} ${v.x}`,
    presets: [
      { label: 'In testa', value: () => ({ list: randList(3), op: 'testa', x: ASD.randInt(61, 99) }) },
      { label: 'In coda', value: () => ({ list: randList(4), op: 'coda', x: ASD.randInt(61, 99) }) },
      {
        label: 'Dopo un nodo',
        value: () => {
          const list = randList(4);
          return { list, op: 'dopo', k: list[ASD.randInt(0, 3)], x: ASD.randInt(61, 99) };
        },
      },
      { label: 'In coda a lista vuota', value: () => ({ list: [], op: 'coda', x: ASD.randInt(2, 60) }) },
    ],
  };

  /* ---------------------------------------------------- cancellazione */

  function traceCancella({ list, x }) {
    const t = new ASD.Tracer(['confronti']);
    const L = new lin.Model(list);
    const row = L.order();
    const S = (o) => L.snap(Object.assign({ row }, o));
    const P = (o) => Object.assign({ head: L.head }, o);
    if (L.head == null) {
      t.step('vuota', '<code>head == nullptr</code>: la lista è vuota, non c\'è niente da togliere: <code>return false</code>.', { x }, S({ ptrs: P({}) }));
      t.step(null, 'La lista resta vuota.', {}, S({ ptrs: P({}), meta: { ok: false } }));
      return t.frames;
    }
    t.step('vuota', '<code>head</code> non è <code>nullptr</code>: la lista ha almeno un nodo.', { x }, S({ ptrs: P({}) }));
    const h0 = L.head;
    t.count('confronti');
    if (val(L, h0) === x) {
      t.step(
        'test-testa',
        `<code>head-&gt;val</code> = ${x}: il nodo da togliere è proprio il primo. È il caso speciale: il primo nodo non ha un precedente, quindi va cambiato <code>head</code>.`,
        { x },
        S({ ptrs: P({}), cls: { [h0]: 'compare' } })
      );
      t.step('salva-testa', '<code>tmp = head</code>: ci si segna il nodo, per poterlo cancellare dopo.', { x, tmp: ref(L, h0) }, S({ ptrs: P({ tmp: h0 }), cls: { [h0]: 'swap' }, hot: ['tmp'] }));
      L.head = L.nodes[h0].next;
      t.step(
        'sposta-testa',
        L.head == null
          ? '<code>head = head-&gt;next</code>: era l\'unico nodo, ora <code>head</code> vale <code>nullptr</code>. Il nodo è staccato ma esiste ancora: lo raggiunge solo <code>tmp</code>.'
          : `<code>head = head-&gt;next</code>: la lista ora comincia dal nodo con ${val(L, L.head)}. Il vecchio primo è staccato e lo raggiunge solo <code>tmp</code>.`,
        { x, tmp: ref(L, h0) },
        S({ ptrs: P({ tmp: h0 }), cls: { [h0]: ['swap', 'out'] }, drop: [h0], hot: ['head'] })
      );
      t.step(
        'del-testa',
        '<code>delete tmp</code>: la memoria del nodo torna al sistema. <code>tmp</code> contiene ancora il vecchio indirizzo, ma ora è un puntatore pendente (<i>dangling</i>): non va più usato.',
        { x, tmp: 'pendente' },
        S({ ptrs: P({ tmp: h0 }), cls: { [h0]: 'freed' }, drop: [h0] })
      );
      L.remove(h0);
      t.step('ok-testa', `<code>return true</code>: tolto con un solo confronto, in ${m('Θ(1)')}.`, { x }, L.snap({ ptrs: P({}), meta: { ok: true } }));
      return t.frames;
    }
    t.step(
      'test-testa',
      `<code>head-&gt;val</code> = ${val(L, h0)} ≠ ${x}: il primo nodo resta. Ora serve il nodo che sta <em>prima</em> di quello da togliere.`,
      { x },
      S({ ptrs: P({}), cls: { [h0]: 'compare' } })
    );
    let prev = h0;
    t.step(
      'prev-init',
      '<code>prev = head</code>: <code>prev</code> resterà sempre un passo indietro, sul nodo che precede quello esaminato.',
      { x, prev: ref(L, prev) },
      S({ ptrs: P({ prev }), hot: ['prev'] })
    );
    for (;;) {
      const nx = L.nodes[prev].next;
      if (nx == null) {
        t.step('cerca', `<code>prev-&gt;next == nullptr</code>: <code>prev</code> è l'ultimo nodo e ${x} non è comparso. Il ciclo finisce.`, { x, prev: ref(L, prev) }, S({ ptrs: P({ prev }) }));
        break;
      }
      t.count('confronti');
      if (val(L, nx) === x) {
        t.step('cerca', `<code>prev-&gt;next-&gt;val</code> = ${x}: trovato. Il nodo da togliere è il successore di <code>prev</code>.`, { x, prev: ref(L, prev) }, S({ ptrs: P({ prev }), cls: { [nx]: 'compare' } }));
        break;
      }
      t.step('cerca', `<code>prev-&gt;next-&gt;val</code> = ${val(L, nx)} ≠ ${x}: avanti.`, { x, prev: ref(L, prev) }, S({ ptrs: P({ prev }), cls: { [nx]: 'compare' } }));
      prev = nx;
      t.step('avanza', `<code>prev = prev-&gt;next</code>: <code>prev</code> passa al nodo con ${val(L, prev)}.`, { x, prev: ref(L, prev) }, S({ ptrs: P({ prev }), hot: ['prev'] }));
    }
    const target = L.nodes[prev].next;
    if (target == null) {
      t.step('non-trovato', `<code>prev-&gt;next == nullptr</code>: <code>return false</code>, la lista non cambia. Confronti fatti: ${t.c.confronti}.`, { x, prev: ref(L, prev) }, S({ ptrs: P({ prev }), meta: { ok: false } }));
      return t.frames;
    }
    t.step('non-trovato', '<code>prev-&gt;next</code> non è <code>nullptr</code>: il valore c\'è, si procede.', { x, prev: ref(L, prev) }, S({ ptrs: P({ prev }), cls: { [target]: 'compare' } }));
    t.step('salva', `<code>tmp = prev-&gt;next</code>: <code>tmp</code> punta al nodo con ${x}.`, { x, prev: ref(L, prev), tmp: ref(L, target) }, S({ ptrs: P({ prev, tmp: target }), cls: { [target]: 'swap' }, hot: ['tmp'] }));
    const succ = L.nodes[target].next;
    L.nodes[prev].next = succ;
    t.step(
      'scavalca',
      `<code>prev-&gt;next = tmp-&gt;next</code>: il nodo ${val(L, prev)} ora punta ${succ == null ? 'a <code>nullptr</code>' : 'al nodo ' + val(L, succ)} e scavalca quello con ${x}. Il nodo è fuori dalla lista, ma esiste ancora.`,
      { x, prev: ref(L, prev), tmp: ref(L, target) },
      S({ ptrs: P({ prev, tmp: target }), cls: { [target]: ['swap', 'out'] }, drop: [target], hot: [prev] })
    );
    t.step(
      'delete',
      '<code>delete tmp</code>: la memoria torna al sistema. Da qui <code>tmp</code> è un puntatore pendente: il nodo non c\'è più.',
      { x, prev: ref(L, prev), tmp: 'pendente' },
      S({ ptrs: P({ prev, tmp: target }), cls: { [target]: 'freed' }, drop: [target] })
    );
    L.remove(target);
    t.step('ok', `<code>return true</code>. Confronti fatti: ${t.c.confronti}; la lista è ridisegnata senza il nodo.`, { x }, L.snap({ ptrs: P({}), meta: { ok: true } }));
    return t.frames;
  }

  function expectedDelete({ list, x }) {
    const a = list.slice();
    const i = a.indexOf(x);
    if (i >= 0) a.splice(i, 1);
    return a;
  }

  /* -------------------------------------------------------- inversione */

  function traceInverti(list) {
    const t = new ASD.Tracer(['frecce girate']);
    const L = new lin.Model(list);
    const row = L.order();
    const head0 = L.head;
    const done = new Set();
    const S = (o) => {
      const cls = {};
      for (const id of done) cls[id] = 'done';
      if (o.curr) cls[o.curr] = 'compare';
      return L.snap({ row, ptrs: Object.assign({ head: head0 }, o.ptrs), cls, hot: o.hot, nullAt: { prev: 'left' } });
    };
    const V = (prev, curr, next) => {
      const v = { prev: ref(L, prev), curr: ref(L, curr) };
      if (next !== undefined) v.next = ref(L, next);
      return v;
    };
    let prev = null;
    t.step('init-prev', '<code>prev = nullptr</code>: la parte già invertita per ora è vuota.', { prev: 'nullptr' }, S({ ptrs: { prev }, hot: ['prev'] }));
    let curr = L.head;
    t.step(
      'init-curr',
      curr == null ? '<code>curr = head</code>: la lista è vuota, <code>curr</code> vale <code>nullptr</code>.' : `<code>curr = head</code>: si parte dal primo nodo (${val(L, curr)}).`,
      V(prev, curr),
      S({ ptrs: { prev, curr }, curr, hot: ['curr'] })
    );
    // next è dichiarato dentro il corpo del while: alla condizione del ciclo e al return non esiste
    for (;;) {
      if (curr == null) {
        t.step('loop', '<code>curr == nullptr</code>: non resta niente da girare, il ciclo finisce.', V(prev, curr), S({ ptrs: { prev, curr } }));
        break;
      }
      t.step('loop', `<code>curr</code> punta al nodo ${val(L, curr)}: c'è ancora un nodo da girare.`, V(prev, curr), S({ ptrs: { prev, curr }, curr }));
      const next = L.nodes[curr].next;
      t.step(
        'salva-next',
        next == null
          ? '<code>next = curr-&gt;next</code>: <code>curr</code> è l\'ultimo nodo, <code>next</code> vale <code>nullptr</code>.'
          : `<code>next = curr-&gt;next</code>: ci si segna il nodo ${val(L, next)}. Senza questa copia, girando la freccia di <code>curr</code> il resto della lista andrebbe perso.`,
        V(prev, curr, next),
        S({ ptrs: { prev, curr, next }, curr, hot: ['next'] })
      );
      L.nodes[curr].next = prev;
      t.count('frecce girate');
      t.step(
        'gira',
        prev == null
          ? `<code>curr-&gt;next = prev</code>: il nodo ${val(L, curr)} ora punta a <code>nullptr</code>. Sarà l'ultimo della lista invertita.`
          : `<code>curr-&gt;next = prev</code>: la freccia del nodo ${val(L, curr)} ora punta all'indietro, verso ${val(L, prev)}.`,
        V(prev, curr, next),
        S({ ptrs: { prev, curr, next }, curr, hot: [curr] })
      );
      done.add(curr);
      prev = curr;
      t.step('avanza-prev', `<code>prev = curr</code>: la parte invertita ora comincia dal nodo ${val(L, prev)}.`, V(prev, curr, next), S({ ptrs: { prev, curr, next }, hot: ['prev'] }));
      curr = next;
      t.step(
        'avanza-curr',
        curr == null ? '<code>curr = next</code>: ora <code>curr</code> vale <code>nullptr</code>.' : `<code>curr = next</code>: si passa al nodo ${val(L, curr)}.`,
        V(prev, curr, next),
        S({ ptrs: { prev, curr, next }, curr, hot: ['curr'] })
      );
    }
    let retNote;
    if (prev == null) retNote = '<code>return prev</code>: restituisce <code>nullptr</code>, la lista era vuota.';
    else if (prev === head0) retNote = `<code>return prev</code>: con un solo nodo la lista invertita è uguale a quella di partenza, e <code>prev</code> punta proprio a ${val(L, prev)}.`;
    else
      retNote = `<code>return prev</code>: <code>prev</code> punta al nodo ${val(L, prev)}, il vecchio ultimo, che è la nuova testa. Attenzione: <code>head</code> punta ancora al vecchio primo nodo, che ora è l'ultimo.`;
    t.step('ret', retNote, V(prev, curr), S({ ptrs: { prev } }));
    L.head = prev;
    const cls = {};
    for (const id of row) cls[id] = 'done';
    const k = t.c['frecce girate'];
    t.step(
      null,
      k === 0
        ? 'La lista vuota resta vuota: il ciclo non è mai partito.'
        : `Chi ha chiamato la funzione scrive <code>head = inverti(head)</code> e la lista è girata: ${k} ${k === 1 ? 'freccia girata' : 'frecce girate'}, ${m('Θ(n)')} tempo e ${m('Θ(1)')} memoria in più. Qui è ridisegnata a partire da <code>head</code>.`,
      {},
      L.snap({ ptrs: { head: L.head }, cls })
    );
    return t.frames;
  }

  /* ---------------------------------------------- figure statiche */

  function figure(host, state, caption, o = {}) {
    const inner = h('div.quadretti');
    const fig = h('figure.ll-figure', inner);
    if (caption) fig.append(h('figcaption', { html: caption }));
    host.append(fig);
    const v = new ASD.viz.ListView(inner, o);
    v.render(state);
    return v;
  }

  function figuraBase(host) {
    const L = new lin.Model([8, 15, 23, 42]);
    figure(host, L.snap({ ptrs: { head: L.head } }), 'La lista 8 → 15 → 23 → 42. <code>head</code> contiene l\'indirizzo del primo nodo; l\'ultimo ha <code>next = nullptr</code>.', {
      ariaLabel: 'Lista di esempio',
    });
  }

  function figuraTail(host) {
    const L = new lin.Model([8, 15, 23]);
    const ids = L.order();
    figure(host, L.snap({ ptrs: { head: ids[0], tail: ids[ids.length - 1] } }), 'Con <code>tail</code> l\'ultimo nodo si raggiunge subito: niente ciclo per trovarlo.', {
      ariaLabel: 'Lista con head e tail',
    });
  }

  function figuraDoppia(host) {
    const nodes = {
      s: { sentinel: true, prev: 'c', next: 'a' },
      a: { val: 8, prev: 's', next: 'b' },
      b: { val: 15, prev: 'a', next: 'c' },
      c: { val: 23, prev: 'b', next: 's' },
    };
    figure(
      host,
      { nodes, row: ['s', 'a', 'b', 'c'], ptrs: {} },
      'Lista doppia circolare con sentinella (a sinistra, tratteggiata). In alto le frecce <code>next</code>, in basso le <code>prev</code>: l\'ultimo nodo torna alla sentinella e la sentinella punta all\'indietro all\'ultimo.',
      { doubly: true, ariaLabel: 'Lista doppia con sentinella' }
    );
  }

  /* ========================================================= capitolo */

  ASD.chapter({
    id: 'liste',
    title: 'Liste concatenate',
    lead:
      'Una lista concatenata tiene gli elementi in nodi sparsi nella memoria, ognuno con l\'indirizzo del successivo. Inserire e togliere costa poco se sai dove farlo; arrivare all\'elemento in posizione <var>i</var> costa caro. Qui impari a disegnarla, scorrerla e modificarla senza perdere pezzi.',
    minutes: 50,
    prereq: ['cpp-puntatori', 'cpp-classi'],
    goals: [
      'disegnare una lista con nodi e frecce e simulare a mano inserimento, cancellazione e inversione',
      'scrivere in C++ le operazioni di base senza perdere nodi e senza dereferenziare <code>nullptr</code>',
      `confrontare liste e array operazione per operazione (${m('Θ(1)')} contro ${m('Θ(n)')})`,
      'sapere a cosa servono il puntatore <code>tail</code>, la lista doppia e il nodo sentinella',
    ],

    render(el) {
      el.innerHTML = `
<section id="nodo">
  <h2>Il nodo e la lista</h2>
  <p>In un array gli elementi stanno uno dopo l'altro nella memoria: per trovare <code>a[i]</code> basta un calcolo.
  In una <strong>lista concatenata</strong> (<i>linked list</i>) ogni elemento sta in un <strong>nodo</strong> allocato
  per conto suo nello heap, e ogni nodo contiene l'indirizzo del successivo.</p>
  <div data-mount="codeNodo"></div>
  <p>La lista intera è raggiungibile da un solo puntatore, <code>head</code>, che contiene l'indirizzo del primo nodo.
  L'ultimo nodo ha <code>next == nullptr</code>: è così che si riconosce la fine. La lista vuota è
  <code>head == nullptr</code>.</p>
  <div data-mount="figBase"></div>
  <p>Come leggere il disegno: ogni nodo è una scatola con due campi, a sinistra il dato <code>val</code>, a destra il
  puntatore <code>next</code>. Il pallino è un indirizzo e la freccia dice a quale nodo punta; il simbolo di terra è
  <code>nullptr</code>. Le etichette blu sono le variabili puntatore del programma.</p>
  <h3>Creare un nodo e leggere i campi</h3>
  <p>Un nodo nasce con <code>new</code> e va restituito con <code>delete</code>. <code>new Nodo{x, nullptr}</code>
  alloca il nodo e inizializza i campi nell'ordine in cui sono dichiarati. Con un puntatore <code>p</code> a un nodo si
  scrive <code>p-&gt;val</code> e <code>p-&gt;next</code>, la forma corta di <code>(*p).val</code> e
  <code>(*p).next</code>.</p>
  <div data-mount="codeCrea"></div>
  ${box('ricorda', `<p>Una lista non ha indici. Per arrivare al nodo in posizione <var>i</var> si parte da <code>head</code>
  e si seguono <var>i</var> frecce: ${m('Θ(i)')} passi. È il prezzo da pagare per poter inserire e togliere nodi senza
  spostare gli altri.</p>`)}
  ${box('nota', `Nel Cormen la lista è un oggetto <code>L</code> con l'attributo <code>L.head</code>, e i nodi hanno i campi
  <code>key</code> e <code>next</code>. Qui <code>head</code> è una variabile di tipo <code>Nodo*</code> e i campi si chiamano
  <code>val</code> e <code>next</code>. Quando servono le posizioni, si contano da 0 come negli array del C++.`, 'Nomi e indici')}
</section>

<section id="scorrere">
  <h2>Scorrere e cercare</h2>
  <p>Quasi ogni funzione su una lista contiene lo stesso ciclo: un puntatore <code>p</code> parte da <code>head</code> e
  avanza con <code>p = p-&gt;next</code> finché non diventa <code>nullptr</code>.</p>
  <div data-mount="codeScorri"></div>
  <p>La ricerca è lo stesso ciclo con una condizione in più: ci si ferma anche quando <code>p-&gt;val</code> è il
  valore cercato. La funzione restituisce il puntatore al nodo, oppure <code>nullptr</code> se il valore non c'è.
  Prova con un valore presente, uno assente e la lista vuota.</p>
  <div data-mount="stCerca"></div>
  <p>Nel caso peggiore (valore assente, oppure nell'ultimo nodo) la ricerca guarda tutti gli <var>n</var> nodi:
  ${m('Θ(n)')}. Anche se la lista è ordinata non puoi usare la ricerca binaria: per arrivare al nodo di mezzo dovresti
  comunque scorrere metà lista.</p>
  ${box('errore', `<p>Nel <code>while</code> l'ordine delle condizioni conta: <code>p != nullptr &amp;&amp; p-&gt;val != x</code>.
  Se <code>p</code> è <code>nullptr</code>, il corto circuito di <code>&amp;&amp;</code> evita di leggere <code>p-&gt;val</code>.
  Scritto al contrario, a fine lista il programma dereferenzia <code>nullptr</code>: comportamento indefinito, di solito
  un crash (<i>segmentation fault</i>).</p>`)}
</section>

<section id="inserire">
  <h2>Inserire un nodo</h2>
  <p>Inserire significa creare un nodo con <code>new</code> e cambiare due puntatori: quello del nuovo nodo e quello
  di chi lo precede (oppure <code>head</code>, se il nuovo diventa il primo). I casi sono tre.</p>
  <ul>
    <li><strong>In testa</strong>: il nuovo nodo punta al vecchio primo, poi <code>head</code> punta al nuovo. ${m('Θ(1)')}.</li>
    <li><strong>Dopo un nodo <code>p</code></strong>: il nuovo punta al successore di <code>p</code>, poi <code>p</code>
    punta al nuovo. ${m('Θ(1)')}, se <code>p</code> lo hai già.</li>
    <li><strong>In coda</strong>: prima bisogna arrivare all'ultimo nodo scorrendo la lista, quindi ${m('Θ(n)')}. Caso
    speciale: con la lista vuota il nuovo nodo diventa la testa.</li>
  </ul>
  <p>Scegli il caso con i bottoni, oppure scrivi tu l'input: <code>lista | testa x</code>, <code>lista | coda x</code>,
  <code>lista | dopo k x</code> (inserisce <var>x</var> dopo il nodo che contiene <var>k</var>). Il nodo appena creato
  compare sopra la riga finché non è collegato; la freccia blu è quella che la riga corrente ha appena cambiato.</p>
  <div data-mount="stInserisci"></div>
  ${box('errore', `<p>L'ordine delle due assegnazioni non si può scambiare. In <code>inserisciDopo</code>, se scrivi prima
  <code>p-&gt;next = nuovo</code>, il vecchio valore di <code>p-&gt;next</code> è perso: nessuno ricorda più dov'era il
  resto della lista. Quei nodi restano nello heap, irraggiungibili (<i>memory leak</i>), e la lista finisce con il nuovo
  nodo. Regola: <strong>prima collega il nuovo nodo, poi cambia il vecchio collegamento</strong>.</p>`)}
  ${box('errore', `<p>Se <code>inserisciInTesta</code> prende il parametro come <code>Nodo* head</code>, senza
  <code>&amp;</code>, riceve una copia di <code>head</code>: la cambia, ma la variabile di chi la chiama resta com'era e
  il nuovo nodo va perso. Ogni funzione che può cambiare il primo nodo prende <code>Nodo*&amp; head</code> (riferimento a puntatore),
  oppure restituisce la nuova testa e si chiama con <code>head = inserisci(head, x)</code>.</p>`, 'Errore tipico: head passato per valore')}
</section>

<section id="cancellare">
  <h2>Cancellare un nodo</h2>
  <p>Per togliere un nodo da una lista semplice serve il nodo <strong>precedente</strong>: è lui che deve scavalcare il
  nodo da togliere, con <code>prev-&gt;next = tmp-&gt;next</code>. Solo dopo si fa <code>delete</code>. Il primo nodo
  un precedente non ce l'ha: per lui si cambia <code>head</code>. Per questo la cancellazione per valore ha due rami.</p>
  <div data-mount="stCancella"></div>
  <p>Staccare il nodo costa ${m('Θ(1)')}, ma prima bisogna trovarlo, e nel caso peggiore la ricerca scorre tutta la
  lista: ${m('Θ(n)')} in tutto.</p>
  ${box('errore', `<p>Dopo <code>delete tmp</code> la variabile <code>tmp</code> contiene ancora il vecchio indirizzo, ma
  quella memoria non è più tua: è un puntatore pendente (<i>dangling pointer</i>). Leggere <code>tmp-&gt;next</code> dopo
  il <code>delete</code> è comportamento indefinito. Per questo l'ordine è sempre: scavalca il nodo, salva quello che
  serve, poi cancella.</p>`)}
  <h3>Liberare tutta la lista</h3>
  <p>Ogni nodo creato con <code>new</code> va restituito con <code>delete</code>. Per liberare una lista intera si
  scorre salvando il successivo <em>prima</em> di cancellare il nodo corrente:</p>
  <div data-mount="codeLibera"></div>
  <p>Tutti i programmi di questo capitolo finiscono così. Prova a togliere la chiamata a <code>libera</code> e a compilare
  con <code>g++ -fsanitize=address</code>: all'uscita il programma elenca i nodi persi (<i>memory leak</i>).</p>
</section>

<section id="costi">
  <h2>Lista o array?</h2>
  <p>Le due strutture sono complementari: l'array vince quando serve l'accesso per posizione, la lista quando si
  inserisce e si toglie in punti già raggiunti.</p>
  ${table({
    caption: 'Costo delle operazioni, con n elementi',
    head: ['Operazione', 'Array (<code>vector</code>)', 'Lista semplice'],
    rows: [
      ['Accesso all\'elemento in posizione <var>i</var>', `${m('Θ(1)')}: <code>a[i]</code>`, `${m('Θ(i)')}: si seguono <var>i</var> frecce`],
      ['Inserimento in testa', `${m('Θ(n)')}: tutti si spostano a destra`, m('Θ(1)')],
      ['Inserimento in coda', `${m('Θ(1)')} ammortizzato (<code>push_back</code>)`, `${m('Θ(n)')}; ${m('Θ(1)')} con il puntatore <code>tail</code>`],
      ['Inserimento dopo una posizione già raggiunta', `${m('Θ(n)')}: si spostano quelli dopo`, `${m('Θ(1)')}, dato il puntatore al nodo`],
      ['Cancellazione del primo elemento', m('Θ(n)'), m('Θ(1)')],
      ['Ricerca di un valore', `${m('Θ(n)')}; ${m('Θ(log n)')} se ordinato (ricerca binaria)`, `${m('Θ(n)')}, anche se ordinata`],
      ['Memoria in più', 'nessuna (a parte la capacità di riserva)', 'un puntatore per nodo'],
    ],
  })}
  <p>Nella pratica l'array è spesso più veloce anche a parità di complessità: gli elementi sono vicini nella memoria e
  il processore li legge a blocchi (la <i>cache</i>), mentre i nodi di una lista possono stare ovunque.</p>
  ${box('esame', `<p>Quando ti chiedono il costo di "inserire in mezzo" a una lista, distingui i due casi:
  ${m('Θ(1)')} se hai già il puntatore al nodo dopo cui inserire, ${m('Θ(n)')} se la posizione va prima cercata. Scrivere
  solo "${m('O(1)')}", senza dire cosa si suppone già noto, è una risposta incompleta.</p>`)}
</section>

<section id="tail">
  <h2>Il puntatore all'ultimo nodo</h2>
  <p>L'inserimento in coda costa ${m('Θ(n)')} solo perché bisogna cercare l'ultimo nodo. Se lo si tiene sempre a
  portata di mano in un secondo puntatore, <code>tail</code>, basta ${m('Θ(1)')}: l'ultimo nodo punta al nuovo, e il
  nuovo diventa l'ultimo.</p>
  <div data-mount="figTail"></div>
  <div data-mount="codeTail"></div>
  <p>Il prezzo è tenere <code>tail</code> giusto in tutti i casi limite: con la lista vuota il nuovo nodo è insieme primo
  e ultimo; quando si toglie l'unico nodo rimasto, anche <code>tail</code> deve tornare <code>nullptr</code>. Con
  inserimento in coda e cancellazione in testa questa è esattamente una coda (<i>queue</i>), che rivedrai in
  ${ASD.link('pile-code', 'coda', 'Pile e code')}.</p>
  <p>Togliere l'<em>ultimo</em> nodo invece resta ${m('Θ(n)')} anche con <code>tail</code>: bisogna aggiornare il
  penultimo, e in una lista semplice nessuna freccia punta all'indietro.</p>
  ${box('errore', `<p>Dimenticare <code>tail = nullptr</code> quando la lista si svuota. Il programma sembra funzionare,
  ma <code>tail</code> punta a un nodo cancellato: il successivo <code>aggiungiInCoda</code> scrive in memoria non più
  valida (<code>tail-&gt;next = nuovo</code>) e la lista perde il nuovo nodo.</p>`)}
</section>

<section id="doppie">
  <h2>Liste doppie e nodo sentinella</h2>
  <p>In una lista <strong>doppiamente concatenata</strong> ogni nodo ha anche <code>prev</code>, l'indirizzo del
  precedente. Costa un puntatore in più per nodo, ma da un nodo si va avanti e indietro: si toglie un nodo dato il suo
  indirizzo in ${m('Θ(1)')}, senza cercare il precedente, e anche togliere l'ultimo diventa ${m('Θ(1)')}.</p>
  <p>Le liste doppie si scrivono quasi sempre con un <strong>nodo sentinella</strong> (<i>sentinel</i>, a volte
  <i>dummy</i>): un nodo senza dato che sta sempre nella lista. La lista è circolare: <code>sent-&gt;next</code> è il
  primo nodo, <code>sent-&gt;prev</code> l'ultimo, e la lista vuota è la sentinella che punta a se stessa. Così ogni
  nodo vero ha sempre un precedente e un successivo, e spariscono i casi speciali (testa, coda, lista vuota).</p>
  <div data-mount="figDoppia"></div>
  <div data-mount="codeDoppia"></div>
  <p>Segui <code>rimuovi(p)</code> sul disegno: <code>p-&gt;prev-&gt;next = p-&gt;next</code> fa saltare il nodo nella
  direzione in avanti, <code>p-&gt;next-&gt;prev = p-&gt;prev</code> in quella all'indietro. Se <code>p</code> è il primo
  nodo, <code>p-&gt;prev</code> è la sentinella: non serve nessun <code>if</code>.</p>
  ${box('nota', `<code>std::list</code> è una lista doppia e <code>std::forward_list</code> una lista semplice
  (${ASD.link('cpp-stl')}). All'esame però si chiede quasi sempre di scrivere i nodi a mano, come qui.`, 'Nella libreria standard')}
</section>

<section id="inversione">
  <h2>Esercizio classico: invertire una lista</h2>
  <p>"Scrivi una funzione che inverte una lista concatenata semplice senza creare nodi nuovi." L'idea: scorri la lista e
  giri ogni freccia all'indietro. Servono tre puntatori:</p>
  <ul>
    <li><code>prev</code>: la testa della parte già invertita (all'inizio è vuota, quindi <code>nullptr</code>);</li>
    <li><code>curr</code>: il nodo da girare adesso;</li>
    <li><code>next</code>: il resto della lista, da salvare <em>prima</em> di girare la freccia di <code>curr</code>.</li>
  </ul>
  <div data-mount="stInverti"></div>
  <p>Ogni nodo si visita una volta, con quattro assegnazioni: ${m('Θ(n)')} tempo e ${m('Θ(1)')} memoria in più. A fine
  ciclo <code>prev</code> punta al vecchio ultimo nodo, che è la nuova testa: per questo la funzione restituisce
  <code>prev</code> e chi la chiama scrive <code>head = inverti(head)</code>.</p>
  ${box('esame', `<p>Se ti chiedono di "giustificare la correttezza", scrivi l'<strong>invariante</strong> del ciclo: all'inizio
  di ogni iterazione <code>prev</code> è la testa della parte già invertita e <code>curr</code> la testa della parte ancora da
  invertire, e le due parti insieme contengono tutti i nodi. All'inizio è vero (parte invertita vuota), ogni iterazione
  sposta un nodo da una parte all'altra, alla fine <code>curr == nullptr</code> e <code>prev</code> è tutta la lista
  invertita.</p>`)}
  <h3>La versione ricorsiva</h3>
  <p>Si inverte il resto della lista, poi si attacca il primo nodo in fondo. Elegante, ma usa una chiamata sullo stack
  per ogni nodo: ${m('Θ(n)')} memoria in più invece di ${m('Θ(1)')}, e su liste molto lunghe può esaurire lo stack.</p>
  <div data-mount="codeRic"></div>
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        codeNodo: (host) => ASD.code(host, { src: 'strutture/lista_base', region: 'nodo' }),
        figBase: figuraBase,
        codeCrea: (host) =>
          ASD.code(host, {
            file: 'frammento.cpp',
            code: [
              'Nodo* p = new Nodo{8, nullptr};    // nodo nello heap: val = 8, next = nullptr',
              'p->next = new Nodo{15, nullptr};   // un secondo nodo, attaccato al primo',
              'cout << p->next->val;              // stampa 15',
              'delete p->next;                    // ogni new ha il suo delete',
              'delete p;',
            ].join('\n'),
          }),
        codeScorri: (host) => ASD.code(host, { src: 'strutture/lista_base', region: 'scorri' }),
        stCerca: (host) =>
          ASD.stepper(host, {
            id: 'lista-cerca',
            title: 'Ricerca in una lista',
            code: { src: 'strutture/lista_base', region: 'cerca' },
            input: {
              label: 'Lista | x',
              value: { list: [8, 15, 23, 42], x: 23 },
              parse(text) {
                const [a, b] = splitBar(text, '8, 15, 23 | 15');
                return { list: listOf(a, 7), x: oneNumber(b, 'Il valore cercato') };
              },
              format: (v) => `${v.list.join(', ')} | ${v.x}`,
              presets: [
                {
                  label: 'Valore presente',
                  value: () => {
                    const list = randList(5);
                    return { list, x: list[ASD.randInt(1, 4)] };
                  },
                },
                { label: 'Valore assente', value: () => ({ list: randList(4), x: ASD.randInt(61, 99) }) },
                { label: 'Lista vuota', value: () => ({ list: [], x: 7 }) },
              ],
            },
            view: (stage) => new ASD.viz.ListView(stage, { ariaLabel: 'Lista' }),
            trace: traceCerca,
            counters: [{ key: 'confronti', label: 'confronti' }],
            legend: [
              { k: 'compare', label: 'nodo esaminato' },
              { k: 'done', label: 'trovato' },
            ],
            validate: validateCerca,
          }),
        stInserisci: (host) =>
          ASD.stepper(host, {
            id: 'lista-ins',
            title: 'Inserire un nodo passo per passo',
            code: { src: 'strutture/lista_inserimento', region: 'inserimenti' },
            input: insInput,
            view: (stage) => new ASD.viz.ListView(stage, { ariaLabel: 'Lista' }),
            trace: traceInserisci,
            counters: [{ key: 'scorsi', label: 'nodi scorsi' }],
            legend: [
              { k: 'key', label: 'nodo nuovo' },
              { k: 'compare', label: 'nodo p' },
            ],
            validate: (inp, frames) => lin.checkList(frames, expectedInsert(inp)),
          }),
        stCancella: (host) =>
          ASD.stepper(host, {
            id: 'lista-canc',
            title: 'Cancellare per valore',
            code: { src: 'strutture/lista_cancellazione', region: 'cancella' },
            input: {
              label: 'Lista | x',
              value: { list: [8, 15, 23, 42], x: 23 },
              parse(text) {
                const [a, b] = splitBar(text, '8, 15, 23 | 15');
                return { list: listOf(a, 7), x: oneNumber(b, 'Il valore da togliere') };
              },
              format: (v) => `${v.list.join(', ')} | ${v.x}`,
              presets: [
                {
                  label: 'In mezzo',
                  value: () => {
                    const list = randList(5);
                    return { list, x: list[ASD.randInt(1, 3)] };
                  },
                },
                {
                  label: 'La testa',
                  value: () => {
                    const list = randList(4);
                    return { list, x: list[0] };
                  },
                },
                {
                  label: 'L\'ultimo',
                  value: () => {
                    const list = randList(4);
                    return { list, x: list[3] };
                  },
                },
                { label: 'Assente', value: () => ({ list: randList(4), x: ASD.randInt(61, 99) }) },
              ],
            },
            view: (stage) => new ASD.viz.ListView(stage, { ariaLabel: 'Lista' }),
            trace: traceCancella,
            counters: [{ key: 'confronti', label: 'confronti' }],
            legend: [
              { k: 'compare', label: 'nodo esaminato' },
              { k: 'swap', label: 'nodo da togliere' },
            ],
            validate: (inp, frames) => lin.checkList(frames, expectedDelete(inp)),
          }),
        codeLibera: (host) => ASD.code(host, { src: 'strutture/lista_cancellazione', region: 'libera' }),
        figTail: figuraTail,
        codeTail: (host) => ASD.code(host, { src: 'strutture/lista_tail', region: 'lista' }),
        figDoppia: figuraDoppia,
        codeDoppia: (host) => ASD.code(host, { src: 'strutture/lista_doppia', region: 'doppia' }),
        stInverti: (host) =>
          ASD.stepper(host, {
            id: 'lista-inverti',
            title: 'Inversione sul posto con prev, curr e next',
            code: { src: 'strutture/lista_inversione', region: 'inverti' },
            input: {
              label: 'Lista',
              value: [1, 2, 3, 4],
              parse: (text) => lin.parseValues(text, { min: 0, max: 99, maxLen: 6 }),
              format: (v) => v.join(', '),
              presets: [
                { label: 'Quattro nodi', value: () => randList(4) },
                { label: 'Un nodo', value: () => randList(1) },
                { label: 'Lista vuota', value: () => [] },
              ],
            },
            view: (stage) => new ASD.viz.ListView(stage, { ariaLabel: 'Lista' }),
            trace: traceInverti,
            counters: [{ key: 'frecce girate', label: 'frecce girate' }],
            legend: [
              { k: 'compare', label: 'curr' },
              { k: 'done', label: 'parte già invertita' },
            ],
            validate: (inp, frames) => lin.checkList(frames, inp.slice().reverse()),
          }),
        codeRic: (host) => ASD.code(host, { src: 'strutture/lista_inversione', region: 'ricorsiva' }),
        quiz: (host) =>
          ASD.quiz(host, [
            {
              q: 'Quanto costa inserire un elemento <strong>in testa</strong> a una lista concatenata di <var>n</var> nodi?',
              options: [m('Θ(1)'), m('Θ(log n)'), m('Θ(n)'), m('Θ(n^2)')],
              answer: 0,
              explain: `Un <code>new</code> e due assegnazioni (<code>nuovo-&gt;next = head; head = nuovo;</code>), qualunque sia
              <var>n</var>: ${m('Θ(1)')}. Nell'array invece inserire in testa costa ${m('Θ(n)')}, perché tutti gli elementi si spostano.`,
            },
            {
              q: 'Cosa succede con questa versione di <code>inserisciDopo</code>?',
              code: [
                'void inserisciDopo(Nodo* p, int x) {',
                '    Nodo* nuovo = new Nodo{x, nullptr};',
                '    p->next = nuovo;',
                '    nuovo->next = p->next;',
                '}',
              ].join('\n'),
              options: [
                'Funziona: le due assegnazioni sono le stesse, l\'ordine non conta',
                'Il nuovo nodo punta a se stesso e il resto della lista dopo <code>p</code> è perso',
                'Il programma si blocca subito perché <code>nuovo</code> vale <code>nullptr</code>',
                'Inserisce il nuovo nodo in testa invece che dopo <code>p</code>',
              ],
              answer: 1,
              explain: `Dopo <code>p-&gt;next = nuovo</code>, <code>p-&gt;next</code> vale già <code>nuovo</code>: la riga dopo scrive
              <code>nuovo-&gt;next = nuovo</code>, un ciclo di un solo nodo. Il vecchio successore di <code>p</code> non è più
              raggiungibile: quei nodi sono persi (<i>memory leak</i>) e chi scorre la lista gira per sempre sul nuovo nodo.`,
            },
            {
              q: 'Una lista semplice ha solo il puntatore <code>head</code>. Quali operazioni costano ' + m('Θ(1)') + '?',
              options: ['inserire in testa', 'togliere il primo nodo', 'inserire in coda', 'togliere l\'ultimo nodo', 'leggere il valore in posizione <var>k</var>'],
              answer: [0, 1],
              explain: `In testa si lavora direttamente su <code>head</code>. Per inserire in coda bisogna trovare l'ultimo nodo
              (${m('Θ(n)')}, a meno di avere <code>tail</code>); per togliere l'ultimo serve il penultimo (${m('Θ(n)')} anche con
              <code>tail</code>); per la posizione <var>k</var> si seguono <var>k</var> frecce.`,
            },
            {
              q: 'Inverti la lista <code>1 → 2 → 3</code> con la funzione <code>inverti</code>. Dopo la <strong>prima</strong> iterazione del <code>while</code>, dove puntano <code>prev</code> e <code>curr</code>?',
              options: [
                '<code>prev</code> al nodo 1 (che ora punta a <code>nullptr</code>), <code>curr</code> al nodo 2',
                '<code>prev</code> a <code>nullptr</code>, <code>curr</code> al nodo 1',
                '<code>prev</code> al nodo 2, <code>curr</code> al nodo 3',
                '<code>prev</code> al nodo 1 (che punta ancora al 2), <code>curr</code> al nodo 2',
              ],
              answer: 0,
              explain: `Nella prima iterazione <code>curr</code> è il nodo 1: si salva <code>next</code> = nodo 2, si gira la freccia
              (<code>1-&gt;next = prev = nullptr</code>), poi <code>prev</code> = nodo 1 e <code>curr</code> = nodo 2. Il nodo 1 è già la
              coda della lista invertita. Controllalo nella visualizzazione con l'input <code>1, 2, 3</code>.`,
            },
            {
              q: 'Perché la funzione <code>cancella</code> tratta a parte il caso in cui il valore è nel <strong>primo</strong> nodo?',
              options: [
                'Perché il primo nodo non ha un precedente: invece di <code>prev-&gt;next</code> bisogna cambiare <code>head</code>',
                'Perché <code>delete</code> non funziona sul primo nodo',
                'Perché il primo nodo è sempre la sentinella',
                'Non serve: è solo un\'ottimizzazione',
              ],
              answer: 0,
              explain: `Per staccare un nodo si cambia il puntatore che lo raggiunge. Per tutti i nodi è il <code>next</code> del
              precedente; per il primo è <code>head</code>, che infatti la funzione riceve per riferimento (<code>Nodo*&amp;</code>).
              Con una lista doppia con sentinella il caso speciale sparisce: anche il primo nodo ha un precedente.`,
            },
          ]),
      });
    },
  });
})();
