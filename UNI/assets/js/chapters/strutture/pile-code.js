/* ASD a quadretti — capitolo "Pile e code".
   Pila (LIFO) su array che raddoppia e su lista, coda (FIFO) su array circolare
   e su lista, gli adattatori della STL, e due applicazioni classiche con la
   pila: parentesi bilanciate ed espressioni postfisse. Le tracce seguono riga
   per riga esempi/strutture/pila_*.cpp e coda_*.cpp. */
(function () {
  'use strict';

  const { m, box, table, h } = ASD;
  const lin = ASD.lin;
  const plural = (n, one, many) => (n === 1 ? one : many);
  /** "push 1, pop" → <code>push 1</code>, <code>pop</code> (pezzi corti: il codice in linea non va a capo). */
  const codes = (s) => s.split(', ').map((x) => `<code>${x}</code>`).join(', ');
  const fmtNum = (v) => ASD.fmt(Math.round(v * 100) / 100);

  /* ------------------------------------------------------------ input */

  const STACK_OPS = {
    push: { words: ['push', '+'], arg: true },
    pop: { words: ['pop', '-'] },
    top: { words: ['top', '?'] },
  };
  const QUEUE_OPS = {
    enqueue: { words: ['enqueue', 'enq', '+'], arg: true },
    dequeue: { words: ['dequeue', 'deq', '-'] },
  };

  /** "cap 3: push 1, pop" → { cap: 3, rest: 'push 1, pop' } (la capacità è facoltativa). */
  function parseCap(text, def, lo, hi) {
    const mm = /^\s*cap\s*=?\s*(\d+)\s*:\s*([\s\S]*)$/i.exec(String(text));
    if (!mm) return { cap: def, rest: String(text) };
    const cap = Number(mm[1]);
    if (cap < lo || cap > hi) throw new Error(`La capacità deve stare tra ${lo} e ${hi}.`);
    return { cap, rest: mm[2] };
  }

  const fmtOps = (ops) => ops.map((o) => (o.op === 'enqueue' ? `enq ${o.x}` : o.op === 'dequeue' ? 'deq' : o.x != null ? `${o.op} ${o.x}` : o.op)).join(', ');

  /* ---------------------------------------------- pila su array (stepper) */

  function tracePila({ cap: cap0, ops }) {
    const t = new ASD.Tracer(['push', 'copie']);
    let cap = cap0;
    let a = new Array(cap).fill(null);
    let n = 0;
    const col = (o = {}) => ({
      label: 'a',
      a: a.slice(),
      n,
      ptrs: { cima: n > 0 ? n - 1 : null, n },
      marks: o.marks || {},
      note: `cap = ${cap}`,
      cls: o.cls,
    });
    const S = (...cols) => ({ cols });
    const V = (x) => (x == null ? { n, cap } : { x, n, cap });
    t.step(null, `Pila vuota: l'array ha ${cap} ${plural(cap, 'casella', 'caselle')} e <code>n = 0</code>.`, V(), S(col()));
    for (const o of ops) {
      if (o.op === 'push') {
        t.count('push');
        const full = n === cap;
        t.step(
          'push-full',
          full
            ? `<code>push(${o.x})</code>: <code>n == cap</code> (${n} = ${cap}), l'array è pieno. Si chiama <code>cresci()</code>.`
            : `<code>push(${o.x})</code>: <code>n</code> = ${n} &lt; <code>cap</code> = ${cap}, c'è posto.`,
          V(o.x),
          S(col())
        );
        if (full) {
          const b = new Array(2 * cap).fill(null);
          const bcol = (k, marks) => ({ label: 'b', a: b.slice(), n: k, ptrs: {}, marks: marks || {}, note: `${2 * cap} caselle` });
          t.step('g-new', `<code>b = new int[${2 * cap}]</code>: un array nuovo, grande il doppio.`, V(o.x), S(col(), bcol(0)));
          t.step('g-for', `Si copiano gli ${n} elementi di <code>a</code> in <code>b</code>, da <code>i = 0</code> a <code>i = ${n - 1}</code>.`, V(o.x), S(col(), bcol(0)));
          for (let i = 0; i < n; i++) {
            b[i] = a[i];
            t.count('copie');
            t.step('g-copy', `<code>b[${i}] = a[${i}]</code> = ${a[i]}.`, Object.assign(V(o.x), { i }), S(col({ marks: { [i]: 'compare' } }), bcol(i + 1, { [i]: 'new' })));
          }
          t.step('g-del', '<code>delete[] a</code>: il vecchio array torna al sistema.', V(o.x), S(col({ cls: 'freed' }), bcol(n)));
          a = b.slice();
          const capOld = cap;
          t.step(
            'g-swap',
            '<code>a = b</code>: ora <code>a</code> punta all\'array nuovo (<code>b</code> sparisce alla fine di <code>cresci</code>).',
            V(o.x),
            S(Object.assign(col(), { note: `cap = ${capOld}, da aggiornare` }))
          );
          cap = 2 * cap;
          t.step(
            'g-cap',
            `<code>cap = ${cap}</code>. Questa crescita ha copiato ${n} elementi, ${m('Θ(n)')}; la prossima arriverà solo dopo altre ${cap - n} push.`,
            V(o.x),
            S(col())
          );
        }
        a[n] = o.x;
        t.step('push-write', `<code>a[${n}] = ${o.x}</code>: il nuovo elemento va nella prima casella libera.`, V(o.x), S(col({ marks: { [n]: 'new' } })));
        n++;
        t.step('push-inc', `<code>n++</code>: ora <code>n = ${n}</code> e la cima è <code>a[${n - 1}]</code> = ${o.x}.`, V(o.x), S(col({ marks: { [n - 1]: 'new' } })));
      } else if (o.op === 'pop') {
        n--;
        t.step(
          'pop',
          `<code>pop()</code>: basta <code>n--</code>, ${m('Θ(1)')}. Il ${a[n]} resta scritto in <code>a[${n}]</code> ma non fa più parte della pila: la prossima push lo sovrascrive.`,
          V(),
          S(col())
        );
      } else {
        t.step('top', `<code>top()</code> restituisce <code>a[n - 1]</code> = <code>a[${n - 1}]</code> = ${a[n - 1]}, senza toglierlo.`, V(), S(col({ marks: { [n - 1]: 'compare' } })));
      }
    }
    const per = t.c.push ? t.c.copie / t.c.push : 0;
    t.step(
      null,
      `Fine: ${t.c.push} push e ${t.c.copie} copie per le crescite, in media ${fmtNum(per)} copie per push. Raddoppiando, le copie non superano mai il numero di push: ogni push costa ${m('O(1)')} ammortizzato.`,
      V(),
      Object.assign(S(col()), { meta: { values: a.slice(0, n) } })
    );
    return t.frames;
  }

  function simulateStack(ops) {
    const s = [];
    for (const o of ops) {
      if (o.op === 'push') s.push(o.x);
      else if (o.op === 'pop') s.pop();
    }
    return s;
  }

  const pilaInput = {
    label: 'Operazioni',
    value: {
      cap: 2,
      ops: [
        { op: 'push', x: 10 },
        { op: 'push', x: 20 },
        { op: 'push', x: 30 },
        { op: 'pop' },
        { op: 'push', x: 40 },
        { op: 'push', x: 50 },
        { op: 'push', x: 60 },
        { op: 'top' },
      ],
    },
    parse(text) {
      const { cap, rest } = parseCap(text, 2, 1, 8);
      const ops = lin.parseOps(rest, STACK_OPS, { maxOps: 12 });
      let n = 0;
      ops.forEach((o, i) => {
        if (o.op === 'push') {
          n++;
          if (n > 8) throw new Error('Al massimo 8 elementi nella pila, così il disegno resta leggibile.');
        } else if (n === 0) {
          throw new Error(`Operazione ${i + 1} (${o.op}): la pila è vuota. In C++ sarebbe un errore: prima si controlla empty().`);
        } else if (o.op === 'pop') n--;
      });
      return { cap, ops };
    },
    format: (v) => `cap ${v.cap}: ${fmtOps(v.ops)}`,
    presets: [
      {
        label: 'Con una crescita',
        value: () => ({ cap: 2, ops: ASD.randomDistinct(3, 1, 9).map((x) => ({ op: 'push', x: x * 10 })).concat([{ op: 'top' }, { op: 'pop' }]) }),
      },
      {
        label: 'Solo pop e top',
        value: () => ({ cap: 4, ops: [{ op: 'push', x: 1 }, { op: 'push', x: 2 }, { op: 'top' }, { op: 'pop' }, { op: 'top' }, { op: 'pop' }] }),
      },
    ],
  };

  /* ------------------------------------------- coda circolare (stepper) */

  function traceCoda({ cap, ops }) {
    const t = new ASD.Tracer([]);
    const a = new Array(cap).fill(null);
    let head = 0;
    let tail = 0;
    let n = 0;
    const S = (o = {}) => ({ a: a.slice(), head, n, ptrs: { head, tail }, marks: o.marks || {}, wrap: Boolean(o.wrap) });
    const V = (x) => (x == null ? { head, tail, n } : { x, head, tail, n });
    t.step(null, `Coda vuota, capacità ${cap}: <code>head = tail = n = 0</code>.`, V(), S());
    for (const o of ops) {
      if (o.op === 'enqueue') {
        const x = o.x;
        if (n === cap) {
          t.step('enq-full', `<code>enqueue(${x})</code>: <code>n == cap</code> (${n}), la coda è piena. La funzione restituisce <code>false</code> e ${x} non entra.`, V(x), S());
          continue;
        }
        t.step('enq-full', `<code>enqueue(${x})</code>: <code>n</code> = ${n} &lt; ${cap}, c'è posto.`, V(x), S());
        a[tail] = x;
        t.step('enq-write', `<code>a[tail]</code> = <code>a[${tail}]</code> = ${x}: il nuovo elemento entra in fondo alla coda.`, V(x), S({ marks: { [tail]: 'new' } }));
        const old = tail;
        tail = (tail + 1) % cap;
        const w = old === cap - 1;
        t.step(
          'enq-tail',
          w
            ? `<code>tail = (${old} + 1) % ${cap} = 0</code>: <code>tail</code> ha fatto il giro ed è tornato alla casella 0.`
            : `<code>tail = (${old} + 1) % ${cap} = ${tail}</code>: la prossima casella libera.`,
          V(x),
          S({ marks: { [old]: 'new' }, wrap: w })
        );
        n++;
        t.step('enq-n', `<code>n++</code>: ora la coda ha ${n} ${plural(n, 'elemento', 'elementi')}${n === cap ? ' ed è piena' : ''}.`, V(x), S({ marks: { [old]: 'new' } }));
      } else {
        const x = a[head];
        t.step('deq-read', `<code>dequeue()</code>: <code>x = a[head]</code> = <code>a[${head}]</code> = ${x}, il primo arrivato.`, V(x), S({ marks: { [head]: 'compare' } }));
        const old = head;
        head = (head + 1) % cap;
        const w = old === cap - 1;
        t.step(
          'deq-head',
          w
            ? `<code>head = (${old} + 1) % ${cap} = 0</code>: anche <code>head</code> fa il giro e torna alla casella 0.`
            : `<code>head = (${old} + 1) % ${cap} = ${head}</code>: il primo della coda ora è in <code>a[${head}]</code>.`,
          V(x),
          S({ marks: { [old]: 'compare' }, wrap: w })
        );
        n--;
        t.step(
          'deq-n',
          `<code>n--</code>. Il ${x} resta scritto in <code>a[${old}]</code>, ma è fuori dalla coda (casella tratteggiata): un prossimo enqueue lo sovrascriverà.`,
          V(x),
          S()
        );
        t.step('deq-ret', `<code>return x</code>: esce ${x}.`, V(x), S());
      }
    }
    const q = [];
    for (let k = 0; k < n; k++) q.push(a[(head + k) % cap]);
    t.step(
      null,
      `Fine. In coda, dal primo all'ultimo: ${q.length ? q.join(', ') : 'nessun elemento'}. Ogni operazione ha fatto un numero fisso di passi: ${m('Θ(1)')}.`,
      V(),
      Object.assign(S(), { meta: { values: q } })
    );
    return t.frames;
  }

  function simulateQueue(cap, ops) {
    const q = [];
    for (const o of ops) {
      if (o.op === 'enqueue') {
        if (q.length < cap) q.push(o.x);
      } else q.shift();
    }
    return q;
  }

  function parseQueueOps(rest, maxOps, cap) {
    const ops = lin.parseOps(rest, QUEUE_OPS, { maxOps });
    let n = 0;
    ops.forEach((o, i) => {
      if (o.op === 'enqueue') n = Math.min(cap, n + 1);
      else if (n === 0) throw new Error(`Operazione ${i + 1} (dequeue): la coda è vuota. In C++ sarebbe un errore: prima si controlla empty().`);
      else n--;
    });
    return ops;
  }

  const enq = (x) => ({ op: 'enqueue', x });
  const deq = { op: 'dequeue' };

  const codaInput = {
    label: 'Operazioni',
    value: { cap: 5, ops: [enq(1), enq(2), enq(3), enq(4), deq, deq, enq(5), enq(6), enq(7), enq(8), deq] },
    parse(text) {
      const { cap, rest } = parseCap(text, 5, 2, 8);
      return { cap, ops: parseQueueOps(rest, 14, cap) };
    },
    format: (v) => `cap ${v.cap}: ${fmtOps(v.ops)}`,
    presets: [
      { label: 'tail fa il giro', value: () => ({ cap: 4, ops: [enq(1), enq(2), enq(3), deq, deq, enq(4), enq(5), enq(6)] }) },
      { label: 'Riempi e svuota', value: () => ({ cap: 3, ops: [enq(7), enq(8), enq(9), enq(10), deq, deq, deq] }) },
    ],
  };

  /* ------------------------------------------------ coda su lista (stepper) */

  function traceCodaLista(ops) {
    const t = new ASD.Tracer([]);
    const L = new lin.Model([], 'q');
    let tail = null;
    const S = (o = {}) => {
      const st = L.snap(Object.assign({}, o, { row: o.row || L.order() }));
      st.ptrs = Object.assign({ head: L.head, tail }, o.ptrs || {});
      return st;
    };
    const val = (id) => L.nodes[id].val;
    t.step(null, 'Coda vuota: <code>head</code> e <code>tail</code> valgono <code>nullptr</code>.', {}, S());
    for (const o of ops) {
      if (o.op === 'enqueue') {
        const row = L.order();
        const N = L.add(o.x);
        const fl = { [N]: row.length ? row.length - 0.5 : 0 };
        const cls = { [N]: 'new' };
        const X = { x: o.x };
        t.step('enq-new', `<code>enqueue(${o.x})</code>: <code>new</code> crea il nodo, con <code>next = nullptr</code>.`, X, S({ row, float: fl, ptrs: { nuovo: N }, cls, hot: ['nuovo'] }));
        const empty = L.head == null;
        t.step(
          'enq-test',
          empty ? '<code>empty()</code> è vero: la coda è vuota.' : `<code>empty()</code> è falso: c'è già un ultimo nodo, quello puntato da <code>tail</code> (${val(tail)}).`,
          X,
          S({ row, float: fl, ptrs: { nuovo: N }, cls })
        );
        if (empty) {
          L.head = N;
          t.step('enq-head', '<code>head = nuovo</code>: il nuovo nodo è anche il primo.', X, S({ row, float: fl, ptrs: { nuovo: N }, cls, hot: ['head'] }));
        } else {
          L.nodes[tail].next = N;
          t.step(
            'enq-link',
            `<code>tail-&gt;next = nuovo</code>: il vecchio ultimo (${val(tail)}) punta al nuovo. Nessun ciclo per cercare la fine: ${m('Θ(1)')}.`,
            X,
            S({ row, float: fl, ptrs: { nuovo: N }, cls, hot: [tail] })
          );
        }
        tail = N;
        t.step('enq-tail', '<code>tail = nuovo</code>: il nuovo nodo è l\'ultimo della coda.', X, S({ row, float: fl, ptrs: { nuovo: N }, cls, hot: ['tail'] }));
      } else {
        const row = L.order();
        const tmp = L.head;
        const x = val(tmp);
        t.step('deq-tmp', '<code>dequeue()</code>: <code>tmp = head</code>, il primo nodo.', {}, S({ row, ptrs: { tmp }, cls: { [tmp]: 'swap' }, hot: ['tmp'] }));
        t.step('deq-read', `<code>x = tmp-&gt;val</code> = ${x}: il valore da restituire.`, { x }, S({ row, ptrs: { tmp }, cls: { [tmp]: 'swap' } }));
        L.head = L.nodes[tmp].next;
        const drop = [tmp];
        const out = { [tmp]: ['swap', 'out'] };
        t.step(
          'deq-head',
          L.head == null
            ? '<code>head = head-&gt;next</code>: era l\'unico nodo, ora <code>head</code> vale <code>nullptr</code>.'
            : `<code>head = head-&gt;next</code>: il primo della coda ora è ${val(L.head)}.`,
          { x },
          S({ row, ptrs: { tmp }, cls: out, drop, hot: ['head'] })
        );
        const nowEmpty = L.head == null;
        t.step(
          'deq-test',
          nowEmpty
            ? '<code>head == nullptr</code>: la coda si è svuotata, quindi anche <code>tail</code> va azzerato.'
            : '<code>head</code> non è <code>nullptr</code>: <code>tail</code> resta dov\'è.',
          { x },
          S({ row, ptrs: { tmp }, cls: out, drop })
        );
        if (nowEmpty) {
          tail = null;
          t.step(
            'deq-tail',
            '<code>tail = nullptr</code>. Senza questa riga <code>tail</code> resterebbe sul nodo che sta per essere cancellato.',
            { x },
            S({ row, ptrs: { tmp }, cls: out, drop, hot: ['tail'] })
          );
        }
        t.step('deq-del', '<code>delete tmp</code>: il nodo non serve più.', { x }, S({ row, ptrs: { tmp }, cls: { [tmp]: 'freed' }, drop }));
        L.remove(tmp);
        t.step('deq-ret', `<code>return x</code>: esce ${x}.`, { x }, S());
      }
    }
    const values = L.values();
    t.step(
      null,
      `Fine. In coda: ${values.length ? values.join(', ') : 'nessun elemento'}. Ogni enqueue e ogni dequeue cambia un numero fisso di puntatori: ${m('Θ(1)')}.`,
      {},
      Object.assign(S(), { meta: { values } })
    );
    return t.frames;
  }

  const codaListaInput = {
    label: 'Operazioni',
    value: [enq(8), enq(15), deq, deq, enq(23)],
    parse: (text) => parseQueueOps(text, 10, Infinity),
    format: (v) => fmtOps(v),
    presets: [
      { label: 'Si svuota e riparte', value: () => [enq(ASD.randInt(2, 30)), deq, enq(ASD.randInt(31, 60)), enq(ASD.randInt(61, 99))] },
      { label: 'Tre in fila', value: () => ASD.randomDistinct(3, 2, 60).map(enq).concat([deq]) },
    ],
  };

  /* ------------------------------- vista composta: sequenza letta + pila */

  class ScanView {
    constructor(host, o) {
      const left = h('div', h('p.str-scan-label', { text: o.seqLabel }));
      const right = h('div', h('p.str-scan-label', { text: o.stackLabel }));
      this.root = h('div.str-scan', left, right);
      this.result = h('p.str-result');
      host.append(this.root, this.result);
      this.seq = new ASD.viz.ArrayView(left, { mode: 'cells', label: null });
      this.stack = new ASD.viz.StackView(right, { ariaLabel: o.stackLabel });
    }

    reset() {
      this.seq.reset();
    }

    render(st, frame, stepper) {
      this.seq.render(st.seq);
      const frames = stepper && stepper.frames ? { frames: stepper.frames.map((f) => ({ state: f.state.stack })) } : null;
      this.stack.render(st.stack, frame, frames);
      this.result.innerHTML = st.result || '&nbsp;';
    }
  }

  /* ---------------------------------------------- parentesi (stepper) */

  const OPEN = '([{';
  const CLOSE = ')]}';
  const pairOf = (a, c) => OPEN.indexOf(a) >= 0 && OPEN.indexOf(a) === CLOSE.indexOf(c);

  function traceParentesi(s) {
    const t = new ASD.Tracer(['push', 'pop']);
    const chars = [...s];
    const stack = [];
    const S = (i, o = {}) => ({
      seq: {
        a: chars.slice(),
        marks: o.marks || {},
        ptrs: i == null ? {} : { c: i },
        range: i == null ? (o.end ? [chars.length, chars.length] : null) : [i, chars.length - 1],
      },
      stack: { cols: [{ items: stack.slice(), marks: o.smarks || {} }] },
      result: o.result || '',
      meta: o.meta,
    });
    const q = (c) => `'${ASD.esc(c)}'`;
    const V = (c) => (c == null ? {} : { c: `'${c}'` });
    const no = (why) => `<span class="mano">non bilanciata</span>: ${why}`;
    t.step('init', '<code>stack&lt;char&gt; pila;</code> la pila parte vuota.', {}, S(null));
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      const cur = { marks: { [i]: 'compare' } };
      t.step('for', `<code>c = ${q(c)}</code>: il carattere in posizione ${i}.`, V(c), S(i, cur));
      if (OPEN.includes(c)) {
        t.step('aperta', `${q(c)} è una parentesi aperta.`, V(c), S(i, cur));
        stack.push(c);
        t.count('push');
        t.step('push', `<code>pila.push(${q(c)})</code>: resta in attesa della sua chiusa.`, V(c), S(i, { marks: cur.marks, smarks: { [stack.length - 1]: 'new' } }));
        continue;
      }
      t.step('aperta', `${q(c)} non è una parentesi aperta.`, V(c), S(i, cur));
      if (!CLOSE.includes(c)) {
        t.step('chiusa', `${q(c)} non è nemmeno una parentesi chiusa: si salta.`, V(c), S(i, cur));
        continue;
      }
      t.step('chiusa', `${q(c)} è una parentesi chiusa: deve chiudere l'ultima aperta, che è in cima alla pila.`, V(c), S(i, cur));
      if (!stack.length) {
        t.step('vuota', `La pila è vuota: ${q(c)} non ha nessuna aperta da chiudere. <code>return false</code>.`, V(c), S(i, { marks: { [i]: 'swap' }, result: no('una chiusa senza aperta'), meta: { ok: false } }));
        return t.frames;
      }
      t.step('vuota', 'La pila non è vuota.', V(c), S(i, cur));
      const top = stack[stack.length - 1];
      if (!pairOf(top, c)) {
        t.step(
          'diverse',
          `In cima c'è ${q(top)}, ma è arrivata ${q(c)}: non corrispondono. <code>return false</code>.`,
          V(c),
          S(i, { marks: { [i]: 'swap' }, smarks: { [stack.length - 1]: 'swap' }, result: no(`${q(top)} chiusa da ${q(c)}`), meta: { ok: false } })
        );
        return t.frames;
      }
      t.step('diverse', `In cima c'è ${q(top)}: corrisponde a ${q(c)}.`, V(c), S(i, { marks: cur.marks, smarks: { [stack.length - 1]: 'done' } }));
      stack.pop();
      t.count('pop');
      t.step('pop', `<code>pila.pop()</code>: la coppia ${q(top + c)} è chiusa.`, V(c), S(i, { marks: { [i]: 'done' } }));
    }
    const ok = stack.length === 0;
    t.step(
      'fine',
      ok
        ? 'La stringa è finita e la pila è vuota: ogni aperta ha trovato la sua chiusa, nell\'ordine giusto. <code>return true</code>.'
        : `La stringa è finita, ma sulla pila ${plural(stack.length, 'resta un\'aperta', 'restano ' + stack.length + ' aperte')} senza chiusa. <code>return false</code>.`,
      {},
      S(null, {
        end: true,
        smarks: ok ? {} : Object.fromEntries(stack.map((_, k) => [k, 'swap'])),
        result: ok ? 'bilanciata' : no('aperte rimaste sulla pila'),
        meta: { ok },
      })
    );
    return t.frames;
  }

  function balanced(s) {
    const st = [];
    for (const c of s) {
      if (OPEN.includes(c)) st.push(c);
      else if (CLOSE.includes(c)) {
        if (!st.length || !pairOf(st.pop(), c)) return false;
      }
    }
    return st.length === 0;
  }

  const parentesiInput = {
    label: 'Stringa',
    value: '{[()()]}',
    parse(text) {
      const s = String(text).replace(/\s+/g, '');
      if (!s) throw new Error('Scrivi almeno un carattere, per esempio {[()]}.');
      if (s.length > 14) throw new Error('Al massimo 14 caratteri, così si segue bene.');
      if (!/^[()[\]{}a-z0-9+\-*/]+$/i.test(s)) throw new Error('Usa parentesi ( ) [ ] { }, lettere, cifre e + - * /.');
      return s;
    },
    format: (v) => v,
    presets: [
      { label: 'Bilanciata', value: '{[()()]}' },
      { label: 'Incrociate', value: '([)]' },
      { label: 'Manca una chiusa', value: '((a+b)' },
      { label: 'Chiusa di troppo', value: '(a))' },
    ],
  };

  /* --------------------------------------------------- postfissa (stepper) */

  const OPS = { '+': (a, b) => a + b, '-': (a, b) => a - b, '*': (a, b) => a * b, '/': (a, b) => Math.trunc(a / b) };
  const OP_LABEL = { '+': 'op-add', '-': 'op-sub', '*': 'op-mul', '/': 'op-div' };

  function evalPostfix(tokens) {
    const st = [];
    tokens.forEach((tok, i) => {
      if (/^\d+$/.test(tok)) st.push(Number(tok));
      else {
        if (st.length < 2) throw new Error(`L'operatore ${tok} (simbolo ${i + 1}) non ha due numeri sotto di sé: l'espressione non è valida.`);
        const b = st.pop();
        const a = st.pop();
        if (tok === '/' && b === 0) throw new Error(`Divisione per zero al simbolo ${i + 1}.`);
        const r = OPS[tok](a, b);
        if (Math.abs(r) > 99999) throw new Error('I numeri diventano troppo grandi: scegli valori più piccoli.');
        st.push(r);
      }
    });
    if (st.length !== 1) throw new Error(`Alla fine sulla pila ${st.length ? 'restano ' + st.length + ' numeri' : 'non resta niente'}: ne deve restare esattamente uno.`);
    return st[0];
  }

  function tracePostfissa(tokens) {
    const t = new ASD.Tracer(['push', 'pop']);
    const stack = [];
    const S = (i, o = {}) => ({
      seq: { a: tokens.slice(), marks: o.marks || {}, ptrs: i == null ? {} : { tok: i }, range: i == null ? (o.end ? [tokens.length, tokens.length] : null) : [i, tokens.length - 1] },
      stack: { cols: [{ items: stack.slice(), marks: o.smarks || {} }] },
      result: o.result || '',
      meta: o.meta,
    });
    t.step('init', '<code>stack&lt;int&gt; pila;</code> la pila parte vuota. Si leggono i simboli da sinistra a destra.', {}, S(null));
    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      const cur = { marks: { [i]: 'compare' } };
      t.step('tok', `<code>in &gt;&gt; tok</code> legge il simbolo <code>${ASD.esc(tok)}</code>.`, { tok }, S(i, cur));
      if (/^\d+$/.test(tok)) {
        t.step('num', `<code>${tok}</code> comincia con una cifra: è un numero.`, { tok }, S(i, cur));
        stack.push(Number(tok));
        t.count('push');
        t.step('push', `<code>pila.push(${tok})</code>: aspetta un operatore.`, { tok }, S(i, { marks: cur.marks, smarks: { [stack.length - 1]: 'new' } }));
        continue;
      }
      t.step('num', `<code>${ASD.esc(tok)}</code> non è un numero: è un operatore, e vuole i due numeri in cima alla pila.`, { tok }, S(i, cur));
      const b = stack[stack.length - 1];
      t.step('pop-b', `<code>b = pila.top(); pila.pop();</code> il numero in cima, ${b}, è il secondo operando.`, { tok, b }, S(i, { marks: cur.marks, smarks: { [stack.length - 1]: 'key' } }));
      stack.pop();
      t.count('pop');
      const a = stack[stack.length - 1];
      t.step('pop-a', `<code>a = pila.top(); pila.pop();</code> quello sotto, ${a}, è il primo operando.`, { tok, a, b }, S(i, { marks: cur.marks, smarks: { [stack.length - 1]: 'key' } }));
      stack.pop();
      t.count('pop');
      const r = OPS[tok](a, b);
      const extra = tok === '/' && a % b !== 0 ? ' (divisione tra interi: la parte decimale si scarta)' : '';
      t.step(OP_LABEL[tok], `<code>r = a ${ASD.esc(tok)} b</code> = ${a} ${ASD.esc(tok)} ${b} = ${r}${extra}.`, { tok, a, b, r }, S(i, cur));
      stack.push(r);
      t.count('push');
      t.step('push-r', `<code>pila.push(${r})</code>: il risultato torna sulla pila e può diventare l'operando di un altro operatore.`, { tok, a, b, r }, S(i, { marks: { [i]: 'done' }, smarks: { [stack.length - 1]: 'new' } }));
    }
    t.step('tok', 'Non ci sono altri simboli: <code>in &gt;&gt; tok</code> fallisce e il ciclo finisce.', {}, S(null, { end: true }));
    const res = stack[stack.length - 1];
    t.step('ret', `<code>return pila.top()</code>: il risultato è ${res}, l'unico numero rimasto sulla pila.`, { risultato: res }, S(null, { end: true, smarks: { 0: 'done' }, result: `risultato: ${res}`, meta: { value: res } }));
    return t.frames;
  }

  const postfissaInput = {
    label: 'Espressione',
    value: ['3', '4', '+', '2', '*'],
    parse(text) {
      const tokens = String(text).trim().split(/\s+/).filter(Boolean);
      if (!tokens.length) throw new Error('Scrivi un\'espressione, con i simboli separati da spazi: 3 4 + 2 *');
      if (tokens.length > 11) throw new Error('Al massimo 11 simboli, così si segue bene.');
      for (const tok of tokens) {
        if (!/^(\d{1,2}|[+\-*/])$/.test(tok)) throw new Error(`"${tok}" non va bene: usa numeri da 0 a 99 e gli operatori + - * /, separati da spazi.`);
      }
      evalPostfix(tokens);
      return tokens;
    },
    format: (v) => v.join(' '),
    presets: [
      { label: '(3 + 4) · 2', value: ['3', '4', '+', '2', '*'] },
      { label: '5 + (1 + 2) · 4 − 3', value: ['5', '1', '2', '+', '4', '*', '+', '3', '-'] },
      { label: '8 / 2 − 3', value: ['8', '2', '/', '3', '-'] },
    ],
  };

  /* ========================================================= capitolo */

  ASD.chapter({
    id: 'pile-code',
    title: 'Pile e code',
    lead:
      'Pila e coda sono sequenze in cui si inserisce e si toglie solo agli estremi. Nella pila si entra e si esce dalla stessa parte: l\'ultimo arrivato esce per primo. Nella coda si entra da una parte e si esce dall\'altra: esce per primo chi è arrivato per primo. Con queste regole ogni operazione costa O(1).',
    minutes: 45,
    prereq: ['liste', 'cpp-classi'],
    goals: [
      'distinguere LIFO e FIFO e simulare a mano una sequenza di push/pop ed enqueue/dequeue',
      `implementare pila e coda con un array (anche circolare) e con una lista, con ogni operazione in ${m('O(1)')}`,
      'usare <code>std::stack</code>, <code>std::queue</code> e <code>std::deque</code>',
      'risolvere con una pila il controllo delle parentesi e il calcolo di un\'espressione postfissa',
    ],

    render(el) {
      el.innerHTML = `
<section id="pila">
  <h2>La pila (stack)</h2>
  <p>Una <strong>pila</strong> (<i>stack</i>) è una sequenza in cui si aggiunge e si toglie sempre dalla stessa
  parte, la <strong>cima</strong>: l'ultimo elemento entrato è il primo a uscire (<abbr title="Last In, First Out">LIFO</abbr>,
  <i>last in, first out</i>). È la pila di piatti: si appoggia sopra e si prende da sopra. Le operazioni sono quattro:</p>
  <dl>
    <dt><code>push(x)</code></dt><dd>mette <var>x</var> in cima;</dd>
    <dt><code>pop()</code></dt><dd>toglie l'elemento in cima;</dd>
    <dt><code>top()</code></dt><dd>legge l'elemento in cima senza toglierlo;</dd>
    <dt><code>empty()</code></dt><dd>dice se la pila è vuota.</dd>
  </dl>
  <p>Le pile sono ovunque: lo stack delle chiamate di funzione (${ASD.link('cpp-ricorsione')}), il tasto "annulla" di un
  editor, la visita in profondità di un grafo, il controllo delle parentesi che vedrai più sotto.</p>

  <h3>Pila su array</h3>
  <p>Gli elementi stanno in <code>a[0..n-1]</code>, dal fondo alla cima: la cima è <code>a[n-1]</code> e <code>n</code> è
  anche l'indice della prima casella libera. <code>push</code> scrive in <code>a[n]</code> e incrementa <code>n</code>;
  <code>pop</code> decrementa <code>n</code> e basta. Quando l'array è pieno, <code>cresci()</code> ne alloca uno grande il
  doppio e ci copia gli elementi.</p>
  <p>L'input parte con la capacità (<code>cap 2:</code>) e poi elenca le operazioni: <code>push x</code>, <code>pop</code>,
  <code>top</code>.</p>
  <div data-mount="stPila"></div>
  <h3>Quanto costa una push: l'analisi ammortizzata</h3>
  <p>Una push che fa crescere l'array costa ${m('Θ(n)')}, perché copia tutti gli elementi. Ma capita di rado: partendo da
  capacità 1 e raddoppiando, per arrivare a <var>n</var> elementi le crescite copiano ${m('1 + 2 + 4 + … + n/2 < n')}
  elementi in tutto. Le <var>n</var> push costano quindi meno di ${m('n + n = 2n')} operazioni: in media
  ${m('O(1)')} ciascuna. Si dice che la push costa ${m('O(1)')} <strong>ammortizzato</strong>: una singola push può costare
  tanto, una sequenza di <var>n</var> push costa ${m('O(n)')}. È esattamente quello che fa <code>vector::push_back</code>.</p>
  ${box('esame', `<p>Domanda classica: "e se invece di raddoppiare l'array lo allungassi di 10 caselle alla volta?". Allora le
  crescite sono una ogni 10 push e copiano ${m('10 + 20 + 30 + … ≈ n^2/20')} elementi: ${m('Θ(n^2)')} in tutto, cioè
  ${m('Θ(n)')} ammortizzato per push. Per avere ${m('O(1)')} ammortizzato la capacità deve crescere di un
  <strong>fattore</strong> (×2, ×1,5), non di una costante.</p>`)}

  <h3>Pila su lista</h3>
  <p>Con una lista concatenata la cima è il primo nodo: <code>push</code> è l'inserimento in testa e <code>pop</code> la
  cancellazione in testa, che hai visto in ${ASD.link('liste')}. Nessun limite di capacità e ${m('Θ(1)')} nel caso
  peggiore, non solo ammortizzato; in cambio ogni elemento costa un puntatore in più, e ogni operazione un
  <code>new</code> o un <code>delete</code>.</p>
  <div data-mount="codePilaLista"></div>
  ${box('errore', `<p><code>top()</code> e <code>pop()</code> su una pila vuota non hanno senso: nella versione su array si legge
  <code>a[-1]</code>, in quella su lista si dereferenzia <code>nullptr</code>. Né queste classi né <code>std::stack</code>
  controllano: il comportamento è indefinito. Prima di togliere, si controlla <code>empty()</code>.</p>`)}
</section>

<section id="coda">
  <h2>La coda (queue)</h2>
  <p>Una <strong>coda</strong> (<i>queue</i>) si riempie da una parte e si svuota dall'altra, come la fila alla cassa: esce
  per primo chi è arrivato per primo (<abbr title="First In, First Out">FIFO</abbr>, <i>first in, first out</i>).
  Le operazioni sono <code>enqueue(x)</code> (accoda in fondo), <code>dequeue()</code> (toglie il primo),
  <code>front()</code> (legge il primo) ed <code>empty()</code>.</p>

  <h3>Coda su array circolare</h3>
  <p>Con un array normale c'è un problema: se si toglie il primo spostando tutti gli altri a sinistra, ogni
  <code>dequeue</code> costa ${m('Θ(n)')}; se invece si avanza solo un indice, le caselle all'inizio restano inutilizzate e
  l'array "finisce" anche se è quasi vuoto. La soluzione è vedere l'array come un <strong>anello</strong>: due indici,
  <code>head</code> (il primo elemento) e <code>tail</code> (la prima casella libera), avanzano con
  <code>(i + 1) % cap</code>, e dopo l'ultima casella si torna alla 0.</p>
  <p>Nel disegno i numeri piccoli sopra le caselle danno l'ordine nella coda (1° = il prossimo a uscire); le caselle
  tratteggiate sono fuori dalla coda. L'arco sotto l'array si colora quando un indice fa il giro.</p>
  <div data-mount="stCoda"></div>
  ${box('errore', `<p>Con soli <code>head</code> e <code>tail</code>, la coda vuota e la coda piena hanno lo stesso aspetto:
  <code>head == tail</code> in tutti e due i casi. Per distinguerle si tiene il numero di elementi <code>n</code>, come qui,
  oppure si lascia sempre una casella vuota (piena quando <code>(tail + 1) % cap == head</code>, con una casella sprecata).
  Chi non fa né l'una né l'altra cosa scrive una coda che dopo un giro sembra vuota quando è piena.</p>`)}

  <h3>Coda su lista</h3>
  <p>Con una lista servono due puntatori: si esce da <code>head</code> (cancellazione in testa) e si entra da
  <code>tail</code> (inserimento in coda con il puntatore all'ultimo nodo, visto in ${ASD.link('liste', 'tail', 'Liste concatenate')}).
  Ogni operazione cambia un numero fisso di puntatori: ${m('Θ(1)')}.</p>
  <div data-mount="stCodaLista"></div>
  ${box('ricorda', `<p>Nella coda su lista i casi delicati sono due e sono simmetrici: <code>enqueue</code> su coda vuota deve
  impostare anche <code>head</code>, e <code>dequeue</code> dell'ultimo elemento deve azzerare anche <code>tail</code>.
  L'esempio di partenza li mostra tutti e due.</p>`)}
</section>

<section id="stl">
  <h2>Pile e code della STL</h2>
  <p>Nella libreria standard ci sono già: <code>stack&lt;T&gt;</code> (in <code>&lt;stack&gt;</code>) e
  <code>queue&lt;T&gt;</code> (in <code>&lt;queue&gt;</code>). Sono <strong>adattatori</strong>: usano dentro un altro
  contenitore, per default una <code>deque&lt;T&gt;</code>, e mostrano solo le operazioni ammesse. La
  <code>deque</code> (<i>double-ended queue</i>, in <code>&lt;deque&gt;</code>) permette di inserire e togliere da tutti e
  due i capi e anche l'accesso per indice, sempre in ${m('O(1)')}.</p>
  <div data-mount="codeStl"></div>
  <p>Output del programma:</p>
  <pre class="code-out" tabindex="0"><code>stack: top = 3, size = 3
dopo pop: top = 2
queue: front = 1, back = 3
dopo pop: front = 2
deque: 1 2 3 4   d[2] = 3
dopo pop_front e pop_back: 2 3
tolgo 2
tolgo 1</code></pre>
  ${table({
    caption: 'Le operazioni e i loro costi',
    head: ['Struttura', 'Inserire', 'Togliere', 'Leggere', 'Costo'],
    rows: [
      ['<code>stack&lt;T&gt;</code>', '<code>push(x)</code>', '<code>pop()</code>', '<code>top()</code>', `${m('O(1)')} (push ammortizzato)`],
      ['<code>queue&lt;T&gt;</code>', '<code>push(x)</code> in fondo', '<code>pop()</code> davanti', '<code>front()</code>, <code>back()</code>', `${m('O(1)')} (push ammortizzato)`],
      ['<code>deque&lt;T&gt;</code>', '<code>push_front</code>, <code>push_back</code>', '<code>pop_front</code>, <code>pop_back</code>', '<code>front()</code>, <code>back()</code>, <code>d[i]</code>', `${m('O(1)')} (inserimenti ammortizzati)`],
    ],
  })}
  ${box('errore', `<p>In <code>std::stack</code> e <code>std::queue</code> la <code>pop()</code> non restituisce niente
  (<code>void</code>): <code>int x = s.pop();</code> non compila. Si legge prima con <code>top()</code> (o
  <code>front()</code>) e poi si toglie con <code>pop()</code>. Nota anche che in <code>std::queue</code> enqueue e dequeue
  si chiamano <code>push</code> e <code>pop</code>.</p>`)}
</section>

<section id="costi">
  <h2>Quanto costano</h2>
  ${table({
    caption: 'Pile e code: tutte le operazioni a costo costante',
    head: ['Implementazione', 'Inserire', 'Togliere', 'Leggere', 'Memoria'],
    rows: [
      ['Pila su array che raddoppia', `${m('O(1)')} ammortizzato, ${m('Θ(n)')} quando cresce`, m('Θ(1)'), m('Θ(1)'), 'fino a 2 caselle per elemento'],
      ['Pila su lista', m('Θ(1)'), m('Θ(1)'), m('Θ(1)'), 'un puntatore in più per elemento'],
      ['Coda su array circolare', `${m('Θ(1)')} (capacità fissa)`, m('Θ(1)'), m('Θ(1)'), '<code>cap</code> caselle sempre'],
      ['Coda su lista con <code>tail</code>', m('Θ(1)'), m('Θ(1)'), m('Θ(1)'), 'un puntatore in più per elemento'],
    ],
  })}
  <p>La coda circolare qui ha capacità fissa e rifiuta l'inserimento quando è piena; si può farla crescere come la pila,
  ricopiando gli elementi in ordine da <code>head</code> in un array grande il doppio: anche lì l'inserimento diventa
  ${m('O(1)')} ammortizzato.</p>
  ${box('esame', `<p>Esercizio tipico: "data la sequenza ${codes('enqueue 1, enqueue 2, dequeue, enqueue 3')}, … su una coda circolare
  di capacità 4, scrivi il contenuto dell'array e i valori di <code>head</code> e <code>tail</code> alla fine". Scrivi l'array
  come una riga di caselle, sposta gli indici a ogni operazione e ricorda che <code>dequeue</code> non cancella il valore:
  la casella resta scritta finché un <code>enqueue</code> non la riusa. Puoi controllarti con la visualizzazione della coda
  circolare, scrivendo la stessa sequenza.</p>`)}
</section>

<section id="parentesi">
  <h2>Applicazione: parentesi bilanciate</h2>
  <p>Una stringa è <strong>bilanciata</strong> se ogni parentesi aperta è chiusa dalla parentesi dello stesso tipo, e
  nell'ordine giusto: <code>{[()()]}</code> sì, <code>([)]</code> no. La pila è lo strumento naturale, perché la prima
  parentesi da chiudere è sempre l'<em>ultima</em> aperta. Si legge la stringa da sinistra a destra:</p>
  <ol>
    <li>una parentesi aperta va sulla pila;</li>
    <li>una chiusa deve corrispondere a quella in cima: se la pila è vuota o il tipo è diverso, la stringa non è bilanciata;
    altrimenti si toglie la cima;</li>
    <li>alla fine la pila deve essere vuota (altrimenti restano aperte senza chiusa).</li>
  </ol>
  <div data-mount="stParentesi"></div>
  <p>Ogni carattere costa ${m('O(1)')} (al più una push o una pop), quindi il controllo è ${m('Θ(n)')} per una stringa di
  <var>n</var> caratteri, con ${m('O(n)')} memoria per la pila nel caso peggiore (tutte aperte).</p>
  ${box('esame', `<p>I modi di sbagliare sono tre, e un buon esercizio li prova tutti: una chiusa con la pila vuota
  (<code>())</code>), una chiusa del tipo sbagliato (<code>([)]</code>), aperte rimaste alla fine (<code>(()</code>).
  Contare soltanto le aperte e le chiuse non basta: <code>([)]</code> ha i conti giusti ma non è bilanciata.</p>`)}
</section>

<section id="postfissa">
  <h2>Applicazione: espressioni postfisse</h2>
  <p>Nella notazione <strong>postfissa</strong> (o polacca inversa) l'operatore si scrive <em>dopo</em> i suoi due
  operandi: <code>3 4 +</code> invece di <code>3 + 4</code>, e <code>3 4 + 2 *</code> per ${m('(3 + 4) * 2')}. Non servono
  parentesi né regole di precedenza, e il calcolo con una pila è immediato: i numeri si mettono sulla pila; un operatore
  toglie i due numeri in cima, li combina e rimette il risultato. Alla fine sulla pila resta un solo numero, il
  risultato.</p>
  <div data-mount="stPostfissa"></div>
  ${box('errore', `<p>L'ordine degli operandi conta per <code>-</code> e <code>/</code>. Il primo numero tolto dalla pila è il
  <strong>secondo</strong> operando: in <code>8 2 /</code> si toglie prima il 2 (<code>b</code>), poi l'8 (<code>a</code>), e il
  risultato è ${m('a / b = 4')}. Scambiandoli si calcola ${m('2 / 8')}, che tra interi fa 0.</p>`)}
  ${box('nota', `Anche la conversione da notazione infissa (quella con le parentesi) a postfissa si fa con una pila, che tiene gli
  operatori in attesa secondo la loro precedenza: è l'algoritmo <i>shunting-yard</i> di Dijkstra. I compilatori e le
  calcolatrici fanno proprio così.`, 'Da infissa a postfissa')}
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        stPila: (host) =>
          ASD.stepper(host, {
            id: 'pila-array',
            title: 'Pila su array che raddoppia',
            code: { src: 'strutture/pila_array', region: 'pila' },
            input: pilaInput,
            view: (stage) => new ASD.viz.StackView(stage, { ariaLabel: 'Pila su array' }),
            trace: tracePila,
            counters: [
              { key: 'push', label: 'push' },
              { key: 'copie', label: 'copie' },
            ],
            legend: [
              { k: 'key', label: 'appena scritto' },
              { k: 'compare', label: 'letto / copiato' },
              { k: 'hole', label: 'casella libera' },
            ],
            validate: (inp, frames) => {
              const st = frames[frames.length - 1].state;
              const c = st.cols[0];
              const got = c.a.slice(0, c.n);
              const want = simulateStack(inp.ops);
              return lin.same(got, want) ? null : `pila finale ${got.join(',')} invece di ${want.join(',')}`;
            },
          }),
        codePilaLista: (host) => ASD.code(host, { src: 'strutture/pila_lista', region: 'pila' }),
        stCoda: (host) =>
          ASD.stepper(host, {
            id: 'coda-circolare',
            title: 'Coda su array circolare',
            code: { src: 'strutture/coda_circolare', region: 'coda' },
            input: codaInput,
            view: (stage) => new ASD.viz.CircularView(stage),
            trace: traceCoda,
            legend: [
              { k: 'key', label: 'appena scritto' },
              { k: 'compare', label: 'letto da dequeue' },
              { k: 'hole', label: 'fuori dalla coda' },
            ],
            validate: (inp, frames) => {
              const st = frames[frames.length - 1].state;
              const got = [];
              for (let k = 0; k < st.n; k++) got.push(st.a[(st.head + k) % st.a.length]);
              const want = simulateQueue(inp.cap, inp.ops);
              if (!lin.same(got, want)) return `coda finale ${got.join(',')} invece di ${want.join(',')}`;
              if (st.ptrs.tail !== (st.head + st.n) % st.a.length) return 'tail non è (head + n) % cap';
              return null;
            },
          }),
        stCodaLista: (host) =>
          ASD.stepper(host, {
            id: 'coda-lista',
            title: 'Coda su lista: head e tail',
            code: { src: 'strutture/coda_lista', region: 'coda' },
            input: codaListaInput,
            view: (stage) => new ASD.viz.ListView(stage, { ariaLabel: 'Coda su lista' }),
            trace: traceCodaLista,
            legend: [
              { k: 'key', label: 'nodo nuovo' },
              { k: 'swap', label: 'nodo che esce' },
            ],
            validate: (inp, frames) => {
              const st = frames[frames.length - 1].state;
              const want = simulateQueue(Infinity, inp);
              const r = lin.follow(st, st.ptrs.head);
              if (r.error) return r.error;
              if (!lin.same(r.values, want)) return `coda finale ${r.values.join(',')} invece di ${want.join(',')}`;
              const last = st.row[st.row.length - 1];
              if ((st.ptrs.tail || null) !== (last || null)) return 'tail non punta all\'ultimo nodo';
              return null;
            },
          }),
        codeStl: (host) => ASD.code(host, { src: 'strutture/pila_coda_stl', maxHeight: 380 }),
        stParentesi: (host) =>
          ASD.stepper(host, {
            id: 'parentesi',
            title: 'Parentesi bilanciate con una pila',
            code: { src: 'strutture/pila_parentesi', region: 'parentesi' },
            input: parentesiInput,
            view: (stage) => new ScanView(stage, { seqLabel: 'Stringa', stackLabel: 'Pila' }),
            trace: traceParentesi,
            counters: [
              { key: 'push', label: 'push' },
              { key: 'pop', label: 'pop' },
            ],
            legend: [
              { k: 'compare', label: 'carattere letto' },
              { k: 'key', label: 'appena messa sulla pila' },
              { k: 'done', label: 'coppia chiusa' },
              { k: 'swap', label: 'errore' },
            ],
            validate: (inp, frames) => {
              const meta = frames[frames.length - 1].state.meta;
              if (!meta) return 'manca l\'esito finale';
              return meta.ok === balanced(inp) ? null : 'esito sbagliato';
            },
          }),
        stPostfissa: (host) =>
          ASD.stepper(host, {
            id: 'postfissa',
            title: 'Valutare un\'espressione postfissa',
            code: { src: 'strutture/pila_postfissa', region: 'postfissa' },
            input: postfissaInput,
            view: (stage) => new ScanView(stage, { seqLabel: 'Simboli', stackLabel: 'Pila' }),
            trace: tracePostfissa,
            counters: [
              { key: 'push', label: 'push' },
              { key: 'pop', label: 'pop' },
            ],
            legend: [
              { k: 'compare', label: 'simbolo letto' },
              { k: 'key', label: 'operandi / nuovo valore' },
              { k: 'done', label: 'risultato' },
            ],
            validate: (inp, frames) => {
              const meta = frames[frames.length - 1].state.meta;
              if (!meta) return 'manca il risultato';
              return meta.value === evalPostfix(inp) ? null : `risultato ${meta.value} invece di ${evalPostfix(inp)}`;
            },
          }),
        quiz: (host) =>
          ASD.quiz(host, [
            {
              q: `Su una pila vuota esegui ${codes('push 1, push 2, pop, push 3, push 4, pop, pop')}. Quali valori escono, nell'ordine?`,
              options: ['2, 4, 3', '1, 2, 3', '2, 3, 4', '4, 3, 2'],
              answer: 0,
              explain: `Dopo <code>push 1, push 2</code> la cima è 2: la prima <code>pop</code> toglie il 2. Poi la pila è
              <code>[1, 3, 4]</code> (dal fondo): le due <code>pop</code> tolgono 4 e poi 3. Resta l'1. LIFO: esce sempre l'ultimo entrato.`,
            },
            {
              q: 'Coda circolare con <code>cap = 5</code>, <code>head = 3</code> e <code>n = 4</code>. In quale casella scrive il prossimo <code>enqueue</code>?',
              options: ['2', '7', '4', '0'],
              answer: 0,
              explain: `Gli elementi occupano le caselle 3, 4, 0, 1 (quattro, a partire da <code>head</code>, facendo il giro).
              La prima libera è ${m('tail = (head + n) mod cap = (3 + 4) mod 5 = 2')}. Il 7 sarebbe fuori dall'array: senza il modulo
              l'indice non torna indietro.`,
            },
            {
              q: 'Perché la coda circolare tiene anche il contatore <code>n</code>, oltre a <code>head</code> e <code>tail</code>?',
              options: [
                'Perché con la coda vuota e con la coda piena vale in tutti e due i casi <code>head == tail</code>',
                'Perché il modulo <code>%</code> è lento',
                'Per sapere dove scrivere il prossimo elemento',
                'Non serve: basta confrontare <code>head</code> e <code>tail</code>',
              ],
              answer: 0,
              explain: `Partendo da vuota (<code>head == tail</code>) e riempiendo tutte le <code>cap</code> caselle, <code>tail</code> fa il
              giro e torna su <code>head</code>: lo stesso aspetto della coda vuota. Con <code>n</code> (oppure lasciando sempre una casella
              libera) i due casi si distinguono. Dove scrivere lo dice già <code>tail</code>.`,
            },
            {
              q: 'Quanto vale l\'espressione postfissa <code>5 1 2 + 4 * + 3 -</code>?',
              options: ['14', '16', '12', '17'],
              answer: 0,
              explain: `<code>1 2 +</code> = 3; <code>3 4 *</code> = 12; <code>5 12 +</code> = 17; <code>17 3 -</code> = 14. In notazione
              infissa è ${m('5 + (1 + 2) * 4 - 3')}. Puoi verificarlo con il secondo esempio della visualizzazione.`,
            },
            {
              q: 'Una pila su array <strong>raddoppia</strong> la capacità quando è piena. Quanto costano in tutto <var>n</var> push, partendo dalla pila vuota?',
              options: [m('Θ(n)'), m('Θ(n log n)'), m('Θ(n^2)'), m('Θ(1)')],
              answer: 0,
              explain: `Le crescite copiano ${m('1 + 2 + 4 + … < n')} elementi in tutto, e le scritture sono <var>n</var>: meno di
              ${m('2n')} operazioni, cioè ${m('Θ(n)')} in tutto e ${m('O(1)')} ammortizzato per push. Se la capacità crescesse di una
              costante invece che di un fattore, il totale sarebbe ${m('Θ(n^2)')}.`,
            },
            {
              q: 'Cosa restituisce <code>pop()</code> di <code>std::stack&lt;int&gt;</code>?',
              options: ['Niente: è <code>void</code>', 'L\'elemento tolto', 'Un <code>bool</code> che dice se ha tolto qualcosa', 'La nuova cima'],
              answer: 0,
              explain: `<code>pop()</code> toglie la cima e basta. Per avere il valore lo si legge prima con <code>top()</code>:
              <code>int x = s.top(); s.pop();</code>. Su una pila vuota tutte e due sono comportamento indefinito.`,
            },
          ]),
      });
    },
  });
})();
