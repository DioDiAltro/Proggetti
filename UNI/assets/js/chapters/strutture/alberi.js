/* ASD a quadretti — capitolo "Alberi binari e visite".
   Terminologia (con un esploratore dei nodi), forme degli alberi binari, il
   nodo in C++, funzioni ricorsive (stepper di altezza), visite in profondità
   (stepper con scelta della visita), visita per livelli (stepper con la coda),
   ricostruzione da preordine e simmetrica (stepper), rappresentazione in un
   array (laboratorio). */
(function () {
  'use strict';

  const { m, box, table, h } = ASD;
  const T = ASD.trees;

  /* L'albero dell'esempio, in rappresentazione posizionale (figli di i in 2i+1, 2i+2):
            10
          /    \
         4      7
        / \      \
       2   9      5
          / \
         1   8                                                         */
  const ESEMPIO = [10, 4, 7, 2, 9, null, 5, null, null, 1, 8];
  const COMPLETO = [6, 2, 9, 4, 7, 1, 3];
  const CATENA = [5, 3, null, 8, null, null, null, 1];

  const k = (n) => n.key;
  const keysOf = (list) => list.map(k).join(' ');

  /** Preset comuni agli stepper che prendono un albero qualsiasi. */
  const treePresets = (wrap) => [
    { label: 'Esempio', value: () => wrap(ESEMPIO.slice()) },
    { label: 'Perfetto', value: () => wrap(COMPLETO.slice()) },
    { label: 'Catena', value: () => wrap(CATENA.slice()) },
    { label: 'Casuale', value: () => wrap(T.randomLevel(ASD.randInt(6, 9), 3)) },
  ];

  const LEVEL_INPUT = {
    label: 'Albero',
    parse: (s) => T.parse.level(s),
    format: (v) => T.format.level(v),
  };

  /* ------------------------------------------------- visite in profondità */

  const NOMI = { pre: 'preorder', in: 'inorder', post: 'postorder' };

  /** Visita ricorsiva (preordine, simmetrica o postordine) con pila delle chiamate e output. */
  T.trace.dfs = function (input) {
    const kind = input.kind || 'pre';
    const fn = NOMI[kind];
    const root = T.fromLevel(input.tree);
    const n = T.size(root);
    const t = new ASD.Tracer(['chiamate']);
    const printed = [];
    const stack = [];
    const L = (s) => kind + '-' + s;

    const snap = (o = {}) => {
      const cls = {};
      const sub = {};
      printed.forEach((p, i) => {
        cls[p.id] = 'done';
        sub[p.id] = T.ord(i + 1);
      });
      const top = stack[stack.length - 1];
      if (top && top.n) cls[top.n.id] = 'active';
      else if (top && stack.length > 1) cls[stack[stack.length - 2].n.id] = 'compare';
      const path = stack.map((f) => f.n).filter(Boolean);
      return {
        tree: T.state(root, { cls, sub, edges: T.pathEdges(path) }),
        panels: [
          { kind: 'stack', title: 'Pila delle chiamate', items: stack.map((f) => `${fn}(${f.n ? f.n.key : 'nullptr'})`) },
          { kind: 'seq', id: 'out', title: 'Output', items: printed.map(k), hi: o.printed ? printed.length - 1 : null, empty: 'ancora niente' },
        ],
        result: o.result,
      };
    };
    const vars = () => {
      const top = stack[stack.length - 1];
      return { t: top ? (top.n ? top.n.key : 'nullptr') : '—', 'chiamate aperte': stack.length };
    };

    const VISIT = {
      pre: (x) => `Preordine: il nodo si stampa <b>prima</b> dei suoi sottoalberi. Stampo ${x.key}.`,
      in: (x) => `Il sottoalbero sinistro di ${x.key} è finito: ora stampo ${x.key}, <b>prima</b> di scendere a destra.`,
      post: (x) => `Entrambi i sottoalberi di ${x.key} sono finiti: <b>solo ora</b> stampo ${x.key}.`,
    };

    function call(node, from) {
      stack.push({ n: node });
      t.count('chiamate');
      if (!node) {
        t.step(
          L('null'),
          `<code>${fn}(nullptr)</code>: ${from.parent.key} non ha figlio ${from.side}. La chiamata finisce subito con <code>return</code>.`,
          vars(),
          snap()
        );
        stack.pop();
        return;
      }
      t.step(L('null'), `Chiamata <code>${fn}(${node.key})</code>: t non è nullptr, si va avanti.`, vars(), snap());
      const visit = () => {
        printed.push(node);
        t.step(L('visit'), VISIT[kind](node), vars(), snap({ printed: true }));
      };
      if (kind === 'pre') visit();
      t.step(
        L('left'),
        node.left
          ? `Chiamo <code>${fn}</code> sul figlio sinistro, ${node.left.key}: la chiamata su ${node.key} resta in sospeso nella pila.`
          : `Chiamo <code>${fn}</code> sul figlio sinistro, ma t-&gt;left è nullptr.`,
        vars(),
        snap()
      );
      call(node.left, { parent: node, side: 'sinistro' });
      if (kind === 'in') visit();
      t.step(
        L('right'),
        node.right
          ? `Si riprende ${fn}(${node.key}) dalla riga dopo: chiamo <code>${fn}</code> sul figlio destro, ${node.right.key}.`
          : `Si riprende ${fn}(${node.key}): chiamo <code>${fn}</code> sul figlio destro, ma t-&gt;right è nullptr.`,
        vars(),
        snap()
      );
      call(node.right, { parent: node, side: 'destro' });
      if (kind === 'post') visit();
      const caller = stack.length > 1 ? stack[stack.length - 2].n : null;
      t.step(
        L('end'),
        `Fine di <code>${fn}(${node.key})</code>: il sottoalbero di ${node.key} è visitato tutto. ${
          caller ? `Si torna in ${fn}(${caller.key}).` : 'Si torna al main.'
        }`,
        vars(),
        snap()
      );
      stack.pop();
    }

    call(root, null);
    t.step(
      null,
      `Visita finita: <b>${keysOf(printed)}</b>. Le chiamate sono ${t.c.chiamate} = 2·${n} + 1: una per ogni nodo e una per ognuno dei ${
        n + 1
      } puntatori nulli. Ognuna costa O(1), quindi la visita costa Θ(n).`,
      {},
      snap({ result: printed.map(k) })
    );
    return t.frames;
  };

  /* ------------------------------------------------------ visita per livelli */

  T.trace.livelli = function (input) {
    const root = T.fromLevel(input.tree);
    const D = T.height(root);
    const t = new ASD.Tracer(['in coda (max)']);
    const q = [];
    const out = [];
    let cur = null;
    let maxQ = 0;

    const snap = (o = {}) => {
      const cls = {};
      const sub = {};
      out.forEach((p, i) => {
        cls[p.id] = 'done';
        sub[p.id] = T.ord(i + 1);
      });
      q.forEach((p) => (cls[p.id] = 'key'));
      if (cur) cls[cur.id] = 'active';
      return {
        tree: T.state(root, { cls, sub }),
        levels: D,
        panels: [
          {
            kind: 'queue',
            title: 'Coda q (il fronte è a sinistra)',
            items: q.map((p, i) => ({ text: p.key, cls: o.pushed && i === q.length - 1 ? 'new' : null })),
            hi: o.front ? 0 : null,
          },
          { kind: 'seq', id: 'out', title: 'Output', items: out.map(k), hi: o.printed ? out.length - 1 : null, empty: 'ancora niente' },
        ],
        result: o.result,
      };
    };
    const vars = () => ({ t: cur ? cur.key : '—', 'q.size()': q.length });
    const push = (x) => {
      q.push(x);
      maxQ = Math.max(maxQ, q.length);
      t.c['in coda (max)'] = maxQ;
    };

    push(root);
    t.step('bfs-root', `Metto la radice ${root.key} nella coda: è l'unico nodo del livello 0.`, vars(), snap({ pushed: true }));
    for (;;) {
      t.step(
        'bfs-loop',
        q.length ? `La coda non è vuota (${q.length} ${q.length === 1 ? 'nodo' : 'nodi'}): si continua.` : 'La coda è vuota: la visita è finita.',
        vars(),
        snap()
      );
      if (!q.length) break;
      cur = q[0];
      t.step('bfs-front', `<code>q.front()</code> legge il primo della coda: t = ${cur.key}.`, vars(), snap({ front: true }));
      q.shift();
      t.step('bfs-pop', `<code>q.pop()</code> lo toglie dalla coda. (front legge, pop toglie: servono tutti e due.)`, vars(), snap());
      out.push(cur);
      t.step('bfs-visit', `Stampo ${cur.key}.`, vars(), snap({ printed: true }));
      if (cur.left) push(cur.left);
      t.step(
        'bfs-left',
        cur.left ? `Il figlio sinistro ${cur.left.key} entra in fondo alla coda: verrà visitato dopo tutti quelli già in coda.` : `${cur.key} non ha figlio sinistro.`,
        vars(),
        snap({ pushed: Boolean(cur.left) })
      );
      if (cur.right) push(cur.right);
      t.step(
        'bfs-right',
        cur.right ? `Il figlio destro ${cur.right.key} entra in fondo alla coda.` : `${cur.key} non ha figlio destro.`,
        vars(),
        snap({ pushed: Boolean(cur.right) })
      );
    }
    cur = null;
    t.step(
      null,
      `Visita per livelli: <b>${keysOf(out)}</b>. Ogni nodo entra ed esce dalla coda una volta sola: Θ(n). La coda è arrivata a ${maxQ} ${
        maxQ === 1 ? 'nodo' : 'nodi'
      } insieme.`,
      {},
      snap({ result: out.map(k) })
    );
    return t.frames;
  };

  /* ------------------------------------------------------------- altezza */

  T.trace.altezza = function (input) {
    const root = T.fromLevel(input.tree);
    const n = T.size(root);
    const t = new ASD.Tracer(['chiamate']);
    const hv = {};
    const stack = [];

    const snap = (o = {}) => {
      const cls = {};
      const sub = {};
      for (const id of Object.keys(hv)) {
        cls[id] = 'done';
        sub[id] = 'h = ' + hv[id];
      }
      const top = stack[stack.length - 1];
      if (top && top.n) cls[top.n.id] = 'active';
      else if (top && stack.length > 1) cls[stack[stack.length - 2].n.id] = 'compare';
      const path = stack.map((f) => f.n).filter(Boolean);
      const val = (v) => (v == null ? '?' : v);
      return {
        tree: T.state(root, { cls, sub, edges: T.pathEdges(path) }),
        panels: [
          {
            kind: 'stack',
            title: 'Pila delle chiamate',
            items: stack.map((f) => ({
              text: `altezza(${f.n ? f.n.key : 'nullptr'})`,
              note: f.n ? `hs=${val(f.hs)} hd=${val(f.hd)}` : '',
            })),
          },
        ],
        result: o.result,
      };
    };
    const vars = (f) => {
      if (!f) return {};
      if (!f.n) return { t: 'nullptr' };
      return { t: f.n.key, hs: f.hs == null ? '?' : f.hs, hd: f.hd == null ? '?' : f.hd };
    };

    function call(node, from) {
      const f = { n: node, hs: null, hd: null };
      stack.push(f);
      t.count('chiamate');
      if (!node) {
        t.step(
          'h-base',
          `<code>altezza(nullptr)</code>: ${from.parent.key} non ha figlio ${from.side}. L'albero vuoto ha altezza −1 per convenzione: return −1.`,
          vars(f),
          snap()
        );
        stack.pop();
        return -1;
      }
      t.step('h-base', `Chiamata <code>altezza(${node.key})</code>: t non è nullptr.`, vars(f), snap());
      t.step(
        'h-left',
        `Prima serve l'altezza del sottoalbero sinistro: <code>altezza(${node.left ? node.left.key : 'nullptr'})</code>.`,
        vars(f),
        snap()
      );
      f.hs = call(node.left, { parent: node, side: 'sinistro' });
      t.step(
        'h-right',
        `Tornati in altezza(${node.key}): hs = ${f.hs}. Ora il destro: <code>altezza(${node.right ? node.right.key : 'nullptr'})</code>.`,
        vars(f),
        snap()
      );
      f.hd = call(node.right, { parent: node, side: 'destro' });
      const r = 1 + Math.max(f.hs, f.hd);
      hv[node.id] = r;
      t.step(
        'h-ret',
        `hd = ${f.hd}. <code>return 1 + max(${f.hs}, ${f.hd})</code> = ${r}: ${
          r === 0 ? `${node.key} è una foglia` : `il cammino più lungo da ${node.key} verso una foglia ha ${r} ${r === 1 ? 'arco' : 'archi'}`
        }.`,
        vars(f),
        snap()
      );
      stack.pop();
      return r;
    }

    const res = call(root, null);
    t.step(
      null,
      `L'altezza dell'albero è <b>${res}</b>. Chiamate: ${t.c.chiamate} = 2·${n} + 1. Ognuna fa un lavoro costante, quindi Θ(n): per sapere quanto è alto l'albero bisogna guardarlo tutto.`,
      {},
      snap({ result: res })
    );
    return t.frames;
  };

  /* -------------------------------------------- ricostruzione da due visite */

  /** Costruisce l'albero da preordine e simmetrica (senza fotogrammi); lancia un errore se non è possibile. */
  T.fromPreIn = function (pre, ino) {
    let p = 0;
    const go = (lo, hi) => {
      if (lo > hi) return null;
      const nd = T.node(pre[p++]);
      let kk = lo;
      while (kk <= hi && ino[kk] !== nd.key) kk++;
      if (kk > hi) {
        throw new Error(
          `Le due visite non sono compatibili: ${nd.key} dovrebbe stare tra le chiavi ${ino.slice(lo, hi + 1).join(' ')} della simmetrica, ma non c'è.`
        );
      }
      nd.left = go(lo, kk - 1);
      nd.right = go(kk + 1, hi);
      return nd;
    };
    return go(0, ino.length - 1);
  };

  T.trace.ricostruisci = function (input) {
    const pre = input.pre;
    const ino = input.ino;
    const n = pre.length;
    const t = new ASD.Tracer(['nodi creati', 'confronti']);
    let root = null;
    let p = 0;
    const created = [];
    const linked = new Set();
    const finished = new Set();
    const stack = [];

    const snap = (o = {}) => {
      const top = stack[stack.length - 1];
      const cls = {};
      const edges = {};
      for (const nd of created) {
        if (finished.has(nd.id)) cls[nd.id] = 'done';
        for (const c of [nd.left, nd.right]) if (c && !linked.has(c.id)) edges[nd.id + '>' + c.id] = 'out';
      }
      if (top && top.node) cls[top.node.id] = o.newNode ? ['active'] : 'active';
      const preMarks = {};
      for (let i = 0; i < p; i++) preMarks[i] = 'done';
      if (o.preCell != null) preMarks[o.preCell] = 'key';
      const inMarks = {};
      for (const nd of created) inMarks[ino.indexOf(nd.key)] = 'done';
      if (top && top.k != null && top.node) inMarks[top.k] = o.found ? 'key' : 'compare';
      const range = top ? [top.lo, top.hi] : null;
      const ptrs = top && top.k != null && top.node ? { k: top.k } : {};
      return {
        tree: T.state(root, { cls, edges }),
        emptyText: 'L\'albero è ancora vuoto.',
        panels: [
          { kind: 'array', id: 'pre', top: true, title: 'Preordine <code>pre</code>', a: pre, marks: preMarks, ptrs: p < n ? { p } : {} },
          {
            kind: 'array',
            id: 'in',
            top: true,
            title: top ? `Simmetrica <code>in</code>: la chiamata guarda in[${top.lo}..${top.hi}]` : 'Simmetrica <code>in</code>',
            a: ino,
            marks: inMarks,
            ptrs,
            range: range && range[0] <= range[1] ? range : null,
            brackets: range && range[0] <= range[1] ? [{ from: range[0], to: range[1] }] : [],
          },
          {
            kind: 'stack',
            title: 'Pila delle chiamate',
            items: stack.map((f) => ({ text: `costruisci(${f.lo}, ${f.hi})`, note: f.node ? 'radice ' + f.node.key : '' })),
          },
        ],
        result: o.result,
      };
    };
    const vars = () => {
      const top = stack[stack.length - 1];
      const v = { p };
      if (top) {
        v.lo = top.lo;
        v.hi = top.hi;
        if (top.k != null) v.k = top.k;
      }
      return v;
    };

    function build(lo, hi, parent, side) {
      const f = { lo, hi, node: null, k: null };
      stack.push(f);
      if (lo > hi) {
        t.step(
          'rc-base',
          `lo = ${lo} &gt; hi = ${hi}: l'intervallo è vuoto, quindi ${parent.key} non ha figlio ${side}. return nullptr.`,
          vars(),
          snap()
        );
        stack.pop();
        return null;
      }
      t.step(
        'rc-base',
        `Chiamata su in[${lo}..${hi}] = ${ino.slice(lo, hi + 1).join(' ')}: ${hi - lo + 1} ${hi === lo ? 'chiave' : 'chiavi'}, non è vuoto.`,
        vars(),
        snap()
      );
      const nd = T.node(pre[p]);
      f.node = nd;
      created.push(nd);
      t.count('nodi creati');
      if (parent) parent[side === 'sinistro' ? 'left' : 'right'] = nd;
      else root = nd;
      t.step(
        'rc-root',
        `In preordine la radice viene prima di tutto il suo sottoalbero: pre[${p}] = ${nd.key} è la radice di questo pezzo. Creo il nodo.`,
        vars(),
        snap({ preCell: p, newNode: true })
      );
      p++;
      t.step('rc-next', p < n ? `p = ${p}: la prossima radice sarà pre[${p}] = ${pre[p]}.` : `p = ${p}: la preordine è finita.`, vars(), snap());
      f.k = lo;
      t.step('rc-k', `Cerco ${nd.key} nella simmetrica, a partire da k = lo = ${lo}.`, vars(), snap());
      for (;;) {
        t.count('confronti');
        const eq = ino[f.k] === nd.key;
        t.step(
          'rc-find',
          eq
            ? `in[${f.k}] = ${nd.key}: trovato. A sinistra ci sono in[${lo}..${f.k - 1}] (${f.k - lo} ${f.k - lo === 1 ? 'nodo' : 'nodi'}): il sottoalbero sinistro. A destra in[${
                f.k + 1
              }..${hi}] (${hi - f.k} ${hi - f.k === 1 ? 'nodo' : 'nodi'}): il destro.`
            : `in[${f.k}] = ${ino[f.k]} ≠ ${nd.key}: k++.`,
          vars(),
          snap({ found: eq })
        );
        if (eq) break;
        f.k++;
      }
      const kk = f.k;
      t.step('rc-left', `Costruisco il sottoalbero sinistro di ${nd.key}, quello delle chiavi in[${lo}..${kk - 1}].`, vars(), snap({ found: true }));
      const l = build(lo, kk - 1, nd, 'sinistro');
      if (l) {
        linked.add(l.id);
        t.step('rc-left', `Tornati alla chiamata di ${nd.key}: il sottoalbero sinistro è pronto, t-&gt;left = ${l.key}.`, vars(), snap({ found: true }));
      }
      t.step('rc-right', `Costruisco il sottoalbero destro di ${nd.key}, quello delle chiavi in[${kk + 1}..${hi}].`, vars(), snap({ found: true }));
      const r = build(kk + 1, hi, nd, 'destro');
      if (r) {
        linked.add(r.id);
        t.step('rc-right', `Tornati alla chiamata di ${nd.key}: t-&gt;right = ${r.key}.`, vars(), snap({ found: true }));
      }
      finished.add(nd.id);
      t.step('rc-ret', `Il sottoalbero di radice ${nd.key} è completo: return.`, vars(), snap({ found: true }));
      stack.pop();
      return nd;
    }

    build(0, n - 1, null, null);
    if (root) linked.add(root.id);
    t.step(
      null,
      `Albero ricostruito. Per controllarlo, la sua postordine è <b>${keysOf(T.post(root))}</b>. Con la ricerca lineare di k il costo è O(n²) nel caso peggiore; con una tabella delle posizioni della simmetrica diventa O(n).`,
      {},
      snap({ result: { pre: T.keys(T.pre(root)), ino: T.keys(T.ino(root)) } })
    );
    return t.frames;
  };

  /* ---------------------------------------------------------------- capitolo */

  ASD.chapter({
    id: 'alberi',
    title: 'Alberi binari e visite',
    lead:
      'Un albero binario è fatto di nodi che puntano al più a due figli. È la forma di molte strutture del corso (alberi di ricerca, heap) e il terreno ideale per la ricorsione: quasi ogni funzione su un albero è un caso base più una chiamata per figlio.',
    minutes: 50,
    prereq: ['cpp-puntatori', 'cpp-ricorsione', 'pile-code'],
    goals: [
      'usare con precisione radice, foglia, profondità, livello, altezza e sottoalbero, e i legami tra altezza e numero di nodi',
      `scrivere funzioni ricorsive sugli alberi (conta, altezza, somma) e mostrare che costano ${m('Θ(n)')}`,
      'eseguire a mano le visite in preordine, simmetrica, postordine e per livelli',
      'ricostruire un albero dalla preordine e dalla simmetrica, come si chiede allo scritto',
      `salvare un albero in un array con i figli di <var>i</var> in ${m('2i+1')} e ${m('2i+2')}`,
    ],

    render(el) {
      el.innerHTML = `
<section id="termini">
  <h2>Le parole degli alberi</h2>
  <p>Un <strong>albero radicato</strong> è un insieme di nodi collegati da archi, con un nodo speciale, la
  <strong>radice</strong> (<i>root</i>). Ogni nodo tranne la radice ha esattamente un <strong>padre</strong>
  (<i>parent</i>); i nodi che hanno lo stesso padre sono <strong>fratelli</strong> (<i>siblings</i>). In un albero
  <strong>binario</strong> ogni nodo ha al più due <strong>figli</strong> (<i>children</i>), e si distingue il figlio
  <strong>sinistro</strong> dal <strong>destro</strong>: un nodo con il solo figlio sinistro è diverso da uno con il solo
  figlio destro.</p>
  <dl>
    <dt>Foglia (<i>leaf</i>) e nodo interno</dt>
    <dd>una foglia non ha figli; un nodo interno ne ha almeno uno.</dd>
    <dt>Antenati e discendenti</dt>
    <dd>gli antenati di <var>v</var> sono i nodi sul cammino da <var>v</var> alla radice; i discendenti sono i nodi sotto
    <var>v</var>. Il <strong>sottoalbero</strong> di <var>v</var> è <var>v</var> con tutti i suoi discendenti.</dd>
    <dt>Profondità (<i>depth</i>) e livello</dt>
    <dd>la profondità di <var>v</var> è il numero di archi dalla radice a <var>v</var>: la radice ha profondità 0. Il
    <strong>livello</strong> <var>k</var> è l'insieme dei nodi a profondità <var>k</var>.</dd>
    <dt>Altezza (<i>height</i>)</dt>
    <dd>l'altezza di un nodo è il numero di archi del cammino più lungo da lui verso una foglia (una foglia ha altezza 0).
    L'altezza dell'albero è quella della radice, cioè la profondità massima. Per convenzione l'albero vuoto ha altezza −1.</dd>
  </dl>
  <p>Prova tu: scegli un nodo e guarda le sue misure. Le righe tratteggiate sono i livelli.</p>
  <div data-mount="esplora"></div>
  ${box('errore', `<p>Alcuni libri misurano l'altezza in <em>nodi</em> invece che in archi: per loro un solo nodo ha altezza 1 e
  tutte le formule si spostano di uno. Qui, come nel Cormen, si contano gli archi. Allo scritto usa la definizione del tuo
  corso e dichiarala.</p>`)}
</section>

<section id="forme">
  <h2>Pieno, completo, perfetto</h2>
  <p>Tre forme di albero binario hanno un nome, perché danno garanzie sull'altezza.</p>
  <div data-mount="forme"></div>
  <dl>
    <dt>Pieno (<i>full</i>)</dt>
    <dd>ogni nodo ha 0 oppure 2 figli, mai uno solo.</dd>
    <dt>Completo (<i>complete</i>)</dt>
    <dd>tutti i livelli sono pieni tranne al più l'ultimo, che è riempito da sinistra senza buchi. È la forma degli heap.</dd>
    <dt>Perfetto (<i>perfect</i>)</dt>
    <dd>tutti i livelli sono pieni: tutte le foglie stanno all'ultimo livello e ogni nodo interno ha due figli.</dd>
  </dl>
  ${box('nota', `I nomi non sono uguali in tutti i libri. Il Cormen chiama <em>completo</em> l'albero che qui è perfetto e
  <em>quasi completo</em> (<i>nearly complete</i>) quello che qui è completo. Conta la definizione: controlla quella del tuo corso.`, 'Attenzione ai nomi')}
  <h3>Altezza e numero di nodi</h3>
  <p>Il livello <var>k</var> contiene al più ${m('2^k')} nodi: ognuno dei nodi del livello sopra ha al più due figli.
  Un albero di altezza <var>h</var> ha quindi al più</p>
  <p class="formula">${m('1 + 2 + 4 + … + 2^h = 2^{h+1} - 1')} nodi</p>
  <p>(tanti quanti un albero perfetto) e almeno ${m('h + 1')} (una catena, un nodo per livello). Rigirando le due
  disuguaglianze si ottiene quanto può essere alto un albero con <var>n</var> nodi:</p>
  <p class="formula">${m('⌊log_2 n⌋ <= h <= n - 1')}</p>
  ${table({
    caption: 'Relazioni da sapere (altezza contata in archi)',
    head: ['Albero binario', 'Fatto', 'Perché'],
    rows: [
      ['di altezza <var>h</var>', `al più ${m('2^{h+1} - 1')} nodi`, 'livelli pieni: somma geometrica'],
      ['perfetto di altezza <var>h</var>', `${m('2^h')} foglie e ${m('2^h - 1')} nodi interni`, 'l\'ultimo livello ha più nodi di tutti gli altri insieme'],
      ['completo con <var>n</var> nodi', `altezza ${m('⌊log_2 n⌋')}`, 'tutti i livelli pieni tranne l\'ultimo'],
      ['con <var>n</var> nodi', `${m('⌊log_2 n⌋ <= h <= n - 1')}`, 'il minimo per i completi, il massimo per le catene'],
      ['pieno', 'foglie = nodi interni + 1', `archi: ${m('2I = n - 1 = I + F - 1')}`],
      ['qualsiasi, con <var>n</var> nodi', `${m('n + 1')} puntatori nulli`, `${m('2n')} puntatori in tutto, ${m('n - 1')} sono archi`],
    ],
  })}
  ${box('ricorda', `<p>Un albero "bilanciato" ha altezza ${m('Θ(log n)')}; uno degenere (una catena) ha altezza
  ${m('n - 1')}. Tutte le operazioni che scendono dalla radice a una foglia costano quanto l'altezza: per questo nei
  capitoli sugli alberi di ricerca e sugli heap si guarda sempre <var>h</var>.</p>`)}
</section>

<section id="nodo">
  <h2>Il nodo in C++</h2>
  <p>Un nodo contiene la chiave e due puntatori, uno per figlio. Un figlio che non c'è vale <code>nullptr</code>; l'albero
  vuoto è un puntatore alla radice che vale <code>nullptr</code>.</p>
  <div data-mount="codice-nodo"></div>
  <p>Ogni nodo si crea con <code>new</code>, quindi va liberato con <code>delete</code>. L'ordine conta: prima i figli,
  poi il nodo, cioè in postordine. Dopo <code>delete t</code> non si può più leggere <code>t-&gt;left</code>.</p>
  <div data-mount="codice-distruggi"></div>
</section>

<section id="ricorsione">
  <h2>Funzioni ricorsive sugli alberi</h2>
  <p>Un albero binario è vuoto, oppure è una radice con due sottoalberi che sono ancora alberi binari. La definizione è
  ricorsiva, e le funzioni la ricalcano: <strong>caso base</strong> sull'albero vuoto, una <strong>chiamata per ogni
  figlio</strong>, poi si <strong>combinano</strong> i risultati.</p>
  <div data-mount="codice-ricorsive"></div>
  <p>Guarda <code>altezza</code> al lavoro: sotto ogni nodo compare il valore che la sua chiamata restituisce, e nella pila
  si vedono le chiamate aperte con i loro <code>hs</code> e <code>hd</code>.</p>
  <div data-mount="altezza"></div>
  <h3>Quanto costano: la ricorrenza</h3>
  <p>Se il sottoalbero sinistro ha <var>k</var> nodi, il destro ne ha ${m('n - 1 - k')}. Ogni chiamata, oltre alle due
  chiamate ricorsive, fa un lavoro costante <var>c</var>:</p>
  <p class="formula">${m('T(0) = c,    T(n) = T(k) + T(n - 1 - k) + c')}</p>
  <p>Qualunque sia la forma dell'albero (qualunque <var>k</var>), la soluzione è ${m('T(n) = (2n + 1)c')}. Si verifica per
  induzione: ${m('(2k + 1)c + (2(n - 1 - k) + 1)c + c = (2n + 1)c')}. Il conto si legge anche così: le chiamate sono una
  per nodo più una per ognuno degli ${m('n + 1')} puntatori nulli, e ognuna costa una costante. Quindi ${m('Θ(n)')}.</p>
  ${box('errore', `<p>Dimenticare il caso base <code>if (t == nullptr)</code>: alla prima foglia la funzione legge
  <code>t-&gt;left</code> con <code>t</code> nullo e il programma si ferma (<i>segmentation fault</i>). E se il caso base
  dell'altezza restituisce 0 invece di −1, la funzione conta i nodi del cammino e non gli archi.</p>`)}
  <p>Prova a scriverne una da solo: quante foglie ha un albero?</p>
  <details class="tr-sol">
    <summary>Soluzione</summary>
    <div data-mount="codice-foglie"></div>
    <p>Stesso schema, stesso costo ${m('Θ(n)')}. Il secondo <code>if</code> riconosce la foglia, che non ha figli.</p>
  </details>
</section>

<section id="visite">
  <h2>Visite in profondità</h2>
  <p>Una <strong>visita</strong> esamina ogni nodo una volta. Le tre visite in profondità scendono nei sottoalberi
  ricorsivamente e differiscono solo per <em>quando</em> si esamina (qui: si stampa) il nodo:</p>
  ${table({
    head: ['Visita', 'Ordine', 'Altri nomi'],
    rows: [
      ['Preordine (<i>preorder</i>)', 'nodo, sinistro, destro', 'anticipata, prefissa'],
      ['Simmetrica (<i>inorder</i>)', 'sinistro, nodo, destro', 'in ordine, infissa'],
      ['Postordine (<i>postorder</i>)', 'sinistro, destro, nodo', 'posticipata, postfissa'],
    ],
  })}
  <p>Nel codice cambia solo la posizione della riga <code>cout</code>. Scegli la visita qui sotto: l'albero è lo stesso,
  l'ordine delle chiamate è lo stesso, cambia solo il momento della stampa. Sotto ogni nodo compare la sua posizione
  nell'output.</p>
  <div data-mount="visite"></div>
  ${box('esame', `<p><strong>Il trucco del giro intorno.</strong> Disegna una linea che parte a sinistra della radice e gira
  attorno a tutto l'albero, rasentando i nodi, in senso antiorario. Ogni nodo viene sfiorato tre volte: a sinistra
  (all'arrivo), sotto (tra i due figli) e a destra (alla partenza). La preordine elenca i nodi nell'ordine dei passaggi a
  sinistra, la simmetrica dei passaggi sotto, la postordine dei passaggi a destra. Una foglia viene sfiorata tre volte di
  fila.</p>`)}
  <h3>A cosa servono</h3>
  <ul>
    <li><strong>Postordine</strong> quando il nodo ha bisogno dei risultati dei figli: liberare la memoria
    (<code>distruggi</code>), calcolare altezza e numero di nodi, valutare un'espressione.</li>
    <li><strong>Preordine</strong> quando il nodo va trattato prima dei figli: copiare un albero, stamparne la struttura.</li>
    <li><strong>Simmetrica</strong> in un ${ASD.link('bst', null, 'albero binario di ricerca')}: dà le chiavi in ordine crescente.</li>
  </ul>
  ${box('nota', `<p>In un albero che rappresenta un'espressione, come <code>(3 + 4) * 2</code> con <code>*</code> nella
  radice, la preordine dà la notazione polacca <code>* + 3 4 2</code>, la postordine la polacca inversa <code>3 4 + 2 *</code>
  e la simmetrica <code>3 + 4 * 2</code>, che senza parentesi è ambigua.</p>`, 'Alberi delle espressioni')}
</section>

<section id="livelli">
  <h2>Visita per livelli</h2>
  <p>La visita per livelli (<i>level order</i>, o in ampiezza) esamina la radice, poi tutti i nodi del livello 1 da
  sinistra a destra, poi quelli del livello 2, e così via. Non è ricorsiva: usa una
  ${ASD.link('pile-code', null, 'coda')} (FIFO). Si mette la radice in coda; poi, finché la coda non è vuota, si estrae il
  primo nodo, lo si visita e si mettono in coda i suoi figli. Siccome i figli entrano in fondo, i nodi escono un livello
  dopo l'altro.</p>
  <div data-mount="livelli"></div>
  <p>È la stessa idea della ${ASD.link('visite', null, 'visita in ampiezza (BFS) dei grafi')}. Costa ${m('Θ(n)')} come le
  altre, ma la memoria in più è la coda e non la pila delle chiamate: in un albero perfetto l'ultimo livello ha
  ${m('(n + 1)/2')} nodi, e a un certo punto sono tutti in coda insieme.</p>
  ${box('errore', `<p>Usare una pila (<code>stack</code>) al posto della coda: i nodi escono nell'ordine sbagliato e la
  visita diventa una visita in profondità (una preordine con i figli scambiati).</p>`)}
</section>

<section id="ricostruzione">
  <h2>Ricostruire un albero dalle visite</h2>
  <p>Esercizio classico: date la preordine e la simmetrica di un albero con chiavi tutte diverse, disegnare l'albero. Si
  ragiona così, con l'albero dell'esempio:</p>
  <ol>
    <li>La preordine <code>10 4 2 9 1 8 7 5</code> comincia con la radice: <strong>10</strong>.</li>
    <li>Nella simmetrica <code>2 4 1 9 8 <b>10</b> 7 5</code> il 10 separa le chiavi del sottoalbero sinistro
    (<code>2 4 1 9 8</code>, cinque nodi) da quelle del destro (<code>7 5</code>).</li>
    <li>Nella preordine, dopo la radice vengono i cinque nodi del sottoalbero sinistro (<code>4 2 9 1 8</code>) e poi i due
    del destro (<code>7 5</code>). Ogni pezzo ha la sua preordine e la sua simmetrica: si ripete su ciascuno.</li>
  </ol>
  <p>Il programma fa la stessa cosa senza tagliare la preordine: la scorre con un indice <code>p</code> che avanza a ogni
  nodo creato, perché le radici dei sottoalberi compaiono proprio nell'ordine in cui la ricorsione le crea.</p>
  <div data-mount="ricostruisci"></div>
  ${box('esame', `<p>Preordine + simmetrica e postordine + simmetrica individuano un unico albero (con chiavi distinte): con la
  postordine la radice è l'<em>ultima</em>. Preordine + postordine invece <strong>no</strong>: un nodo A con il solo figlio
  B ha preordine <code>A B</code> e postordine <code>B A</code>, sia che B stia a sinistra sia a destra. La simmetrica è
  quella che separa sinistra e destra.</p>`)}
</section>

<section id="array">
  <h2>Un albero in un array</h2>
  <p>Un albero binario si può salvare anche senza puntatori, in un array, numerando i nodi livello per livello: la radice
  in <code>a[0]</code>, i suoi figli in <code>a[1]</code> e <code>a[2]</code>, i nipoti da <code>a[3]</code> a
  <code>a[6]</code>, e così via. Con gli indici da 0 del C++:</p>
  <p class="formula">${m('figli di i: 2i + 1  e  2i + 2,      padre di i: ⌊(i - 1)/2⌋')}</p>
  <p>Nessun puntatore da salvare: la posizione basta a trovare padre e figli. Sposta l'indice e guarda dove finiscono.</p>
  <div data-mount="array"></div>
  ${box('ricorda', `<p>Per un albero <strong>completo</strong> l'array non ha buchi: <var>n</var> nodi occupano esattamente
  <code>a[0..n-1]</code>. Per questo gli ${ASD.link('heap', null, 'heap')} si salvano così. Per un albero qualsiasi invece i
  buchi possono essere tanti: una catena di altezza <var>h</var> occupa un array di ${m('2^{h+1} - 1')} caselle per soli
  ${m('h + 1')} nodi.</p>`)}
  ${box('errore', `<p>I libri con gli array da 1 scrivono figli ${m('2i')} e ${m('2i + 1')}, padre ${m('⌊i/2⌋')}. In C++
  (da 0) sono ${m('2i + 1')}, ${m('2i + 2')} e ${m('⌊(i - 1)/2⌋')}. Mescolare le due versioni è l'errore più comune.</p>`)}
</section>

<section id="costi">
  <h2>Quanto costa</h2>
  ${table({
    caption: 'Alberi binari con n nodi e altezza h',
    head: ['Operazione', 'Tempo', 'Memoria in più', 'Nota'],
    rows: [
      ['Visita in preordine, simmetrica, postordine', m('Θ(n)'), m('O(h)'), 'la pila delle chiamate scende fino a una foglia'],
      ['Visita per livelli', m('Θ(n)'), m('O(n)'), 'la coda può contenere un livello intero'],
      ['contaNodi, altezza, somma', m('Θ(n)'), m('O(h)'), `ricorrenza ${m('T(n) = T(k) + T(n-1-k) + c')}`],
      ['Cercare una chiave (albero qualsiasi)', m('O(n)'), m('O(h)'), 'senza ordine tra le chiavi si guarda tutto'],
      ['Ricostruire da preordine e simmetrica', m('O(n^2)'), m('O(h)'), `${m('O(n)')} con una tabella delle posizioni`],
      ['Padre o figlio nella rappresentazione con array', m('O(1)'), '—', `l'array è lungo fino a ${m('2^{h+1} - 1')}`],
    ],
  })}
</section>

<section id="esame">
  <h2>All'esame</h2>
  <ol>
    <li><strong>Visite</strong>: "scrivi la preordine, la simmetrica e la postordine dell'albero in figura". Usa il giro
    intorno, poi controlla che ogni sequenza abbia tutti i nodi una volta sola.</li>
    <li><strong>Ricostruzione</strong>: "disegna l'albero con preordine … e simmetrica …". Radice dalla preordine, taglio
    nella simmetrica, ripeti. Alla fine verifica rifacendo le due visite.</li>
    <li><strong>Funzione ricorsiva</strong>: "scrivi una funzione che conta i nodi con un solo figlio, e dai la sua
    complessità". Caso base, chiamate sui figli, combinazione; costo ${m('Θ(n)')} con la ricorrenza qui sopra.</li>
    <li><strong>Conti</strong>: "quanti nodi può avere al massimo un albero binario di altezza 5?", "quanto è alto al minimo
    con 1000 nodi?".</li>
  </ol>
  ${box('esame', `<p>Quando scrivi una funzione su un albero, scrivi prima il caso base e chiediti: "funziona sull'albero
  vuoto? funziona su una foglia?". Sono i due casi che gli esaminatori provano per primi.</p>`)}
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        esplora: mountEsplora,
        forme: mountForme,
        'codice-nodo': (host) => ASD.code(host, { src: 'strutture/albero_visite', region: 'nodo' }),
        'codice-distruggi': (host) => ASD.code(host, { src: 'strutture/albero_visite', region: 'distruggi' }),
        'codice-ricorsive': (host) =>
          ASD.code(host, {
            src: 'strutture/albero_visite',
            region: 'ricorsive',
            notes: { 'h-base': 'O(1)', 'h-left': 'T(k)', 'h-right': 'T(n−1−k)', 'h-ret': 'O(1)' },
          }),
        'codice-foglie': (host) =>
          ASD.code(host, {
            file: 'conta_foglie.cpp',
            code: `int contaFoglie(Nodo* t) {
    if (t == nullptr) return 0;
    if (t->left == nullptr && t->right == nullptr)
        return 1;
    return contaFoglie(t->left) + contaFoglie(t->right);
}`,
          }),
        altezza: mountAltezza,
        visite: mountVisite,
        livelli: mountLivelli,
        ricostruisci: mountRicostruisci,
        array: mountArray,
        quiz: mountQuiz,
      });
    },
  });

  /* ------------------------------------------------------------ stepper */

  function mountAltezza(host) {
    ASD.stepper(host, {
      id: 'altezza',
      title: 'altezza(t) passo per passo',
      code: { src: 'strutture/albero_visite', region: 'altezza' },
      input: Object.assign({}, LEVEL_INPUT, { value: { tree: ESEMPIO.slice() }, parse: (s) => ({ tree: T.parse.level(s) }), format: (v) => T.format.level(v.tree), presets: treePresets((tree) => ({ tree })) }),
      view: (stage) => new T.Stage(stage),
      trace: T.trace.altezza,
      counters: [{ key: 'chiamate', label: 'chiamate' }],
      legend: [
        { k: 'active', label: 'chiamata in corso' },
        { k: 'compare', label: 'aspetta una chiamata su nullptr' },
        { k: 'done', label: 'altezza già calcolata' },
      ],
      validate: (input, frames) => {
        const res = frames[frames.length - 1].state.result;
        const want = T.height(T.fromLevel(input.tree));
        return res === want ? null : `altezza ${res}, attesa ${want}`;
      },
    });
  }

  function mountVisite(host) {
    let kind = 'pre';
    const st = ASD.stepper(host, {
      id: 'visite',
      title: 'Visite in profondità passo per passo',
      code: { src: 'strutture/albero_visite', region: 'visite' },
      input: Object.assign({}, LEVEL_INPUT, {
        value: { tree: ESEMPIO.slice(), kind },
        parse: (s) => ({ tree: T.parse.level(s), kind }),
        format: (v) => T.format.level(v.tree),
        presets: treePresets((tree) => ({ tree, kind })),
      }),
      view: (stage) => new T.Stage(stage),
      trace: T.trace.dfs,
      counters: [{ key: 'chiamate', label: 'chiamate' }],
      legend: [
        { k: 'active', label: 'chiamata in corso' },
        { k: 'compare', label: 'aspetta una chiamata su nullptr' },
        { k: 'done', label: 'già stampato' },
      ],
      validate: (input, frames) => {
        const got = (frames[frames.length - 1].state.result || []).join(' ');
        const root = T.fromLevel(input.tree);
        const want = keysOf({ pre: T.pre, in: T.ino, post: T.post }[input.kind](root));
        return got === want ? null : `visita ${got}, attesa ${want}`;
      },
    });
    T.headChoice(st, {
      legend: 'Visita',
      value: kind,
      options: [
        { v: 'pre', label: 'preordine' },
        { v: 'in', label: 'simmetrica' },
        { v: 'post', label: 'postordine' },
      ],
      onChange: (v) => {
        kind = v;
        st.setInput(Object.assign({}, st.value, { kind }));
      },
    });
  }

  function mountLivelli(host) {
    ASD.stepper(host, {
      id: 'livelli',
      title: 'Visita per livelli con una coda',
      code: { src: 'strutture/albero_visite', region: 'livelli' },
      input: Object.assign({}, LEVEL_INPUT, {
        value: { tree: ESEMPIO.slice() },
        parse: (s) => ({ tree: T.parse.level(s) }),
        format: (v) => T.format.level(v.tree),
        presets: treePresets((tree) => ({ tree })),
      }),
      view: (stage) => new T.Stage(stage),
      trace: T.trace.livelli,
      counters: [{ key: 'in coda (max)', label: 'massimo in coda' }],
      legend: [
        { k: 'active', label: 't, il nodo appena estratto' },
        { k: 'key', label: 'in coda' },
        { k: 'done', label: 'già stampato' },
      ],
      validate: (input, frames) => {
        const got = (frames[frames.length - 1].state.result || []).join(' ');
        const want = keysOf(T.levelOrder(T.fromLevel(input.tree)));
        return got === want ? null : `visita ${got}, attesa ${want}`;
      },
    });
  }

  function mountRicostruisci(host) {
    const ui = {};
    const fromTree = (arr) => {
      const r = T.fromLevel(arr);
      return { pre: T.keys(T.pre(r)), ino: T.keys(T.ino(r)) };
    };
    const st = ASD.stepper(host, {
      id: 'ricostruisci',
      title: 'Dalla preordine e dalla simmetrica all\'albero',
      code: { src: 'strutture/albero_ricostruisci', region: 'costruisci' },
      input: {
        label: 'Preordine',
        value: fromTree(ESEMPIO),
        parse: (s) => {
          const pre = T.parse.keys(s, { min: 0, max: 99, maxLen: 10 });
          const ino = T.parse.keys(ui.ino ? ui.ino.value : '', { min: 0, max: 99, maxLen: 10 });
          if (pre.length !== ino.length) throw new Error(`Le due visite devono avere lo stesso numero di chiavi (${pre.length} e ${ino.length}).`);
          const a = pre.slice().sort((x, y) => x - y).join(',');
          const b = ino.slice().sort((x, y) => x - y).join(',');
          if (a !== b) throw new Error('Le due visite devono contenere le stesse chiavi.');
          T.fromPreIn(pre, ino);
          return { pre, ino };
        },
        format: (v) => {
          if (ui.ino) ui.ino.value = v.ino.join(' ');
          return v.pre.join(' ');
        },
        presets: [
          { label: 'Esempio', value: () => fromTree(ESEMPIO) },
          { label: 'Casuale', value: () => fromTree(T.randomLevel(ASD.randInt(5, 8), 3)) },
          { label: 'Catena', value: () => fromTree(CATENA) },
        ],
      },
      view: (stage) => new T.Stage(stage, { minScale: 0.75 }),
      trace: T.trace.ricostruisci,
      counters: [
        { key: 'nodi creati', label: 'nodi creati' },
        { key: 'confronti', label: 'confronti' },
      ],
      legend: [
        { k: 'active', label: 'radice della chiamata in corso' },
        { k: 'compare', label: 'confronto in[k]' },
        { k: 'key', label: 'radice trovata' },
        { k: 'done', label: 'già sistemato' },
      ],
      validate: (input, frames) => {
        const r = frames[frames.length - 1].state.result;
        if (!r) return 'manca il risultato';
        if (r.pre.join(' ') !== input.pre.join(' ')) return 'la preordine dell\'albero costruito è diversa';
        if (r.ino.join(' ') !== input.ino.join(' ')) return 'la simmetrica dell\'albero costruito è diversa';
        return null;
      },
    });
    ui.ino = T.field(st, { name: 'in', label: 'Simmetrica', value: st.value.ino.join(' ') });
  }

  /* ------------------------------------------------------------ laboratori */

  /** Esploratore della terminologia: si sceglie un nodo e se ne leggono le misure. */
  function mountEsplora(host) {
    const root = T.fromLevel(ESEMPIO);
    const order = T.levelOrder(root);
    const parents = T.parents(root);
    const depth = T.depths(root);
    const H = T.height(root);
    const leaves = T.ino(root).filter((x) => !x.left && !x.right);

    const lab = h('div.lab.tr-lab');
    const body = h('div.lab-body.quadretti');
    const controls = h('div.lab-controls');
    const out = h('div.lab-out.tr-lab-out', { 'aria-live': 'polite' });
    lab.append(h('div.lab-head', h('h3', { text: 'Esplora l\'albero dell\'esempio' })), body, controls, out);
    host.append(lab);

    const tv = new ASD.viz.TreeView(body, { r: 17, gap: 12, levelH: 62, pad: 20, ariaLabel: 'Albero dell\'esempio con il nodo scelto evidenziato' });
    const fs = h('fieldset.tr-nodes', h('legend', { text: 'Scegli un nodo' }));
    const btns = new Map();
    for (const x of order) {
      const b = h('button.btn.btn-sm', { type: 'button', 'aria-pressed': 'false', text: String(x.key), onclick: () => select(x) });
      btns.set(x.id, b);
      fs.append(b);
    }
    controls.append(fs);

    const deepest = (x) => {
      const path = [x];
      while (x.left || x.right) {
        x = T.height(x.left) >= T.height(x.right) ? x.left : x.right;
        path.push(x);
      }
      return path;
    };

    function select(x) {
      for (const [id, b] of btns) b.setAttribute('aria-pressed', String(id === x.id));
      const desc = T.pre(x).slice(1);
      const anc = [];
      for (let p = parents[x.id]; p; p = parents[p.id]) anc.unshift(p);
      const cls = {};
      for (const d of desc) cls[d.id] = 'key';
      for (const a of anc) cls[a.id] = 'visited';
      cls[x.id] = 'active';
      tv.render(T.state(root, { cls, edges: T.pathEdges(anc.concat(x)) }));
      T.levelGuides(tv, H);
      T.fit(tv, 0.7);

      const par = parents[x.id];
      const sib = par ? (par.left === x ? par.right : par.left) : null;
      const kids = [x.left && `${x.left.key} (sinistro)`, x.right && `${x.right.key} (destro)`].filter(Boolean);
      const tipo = !par ? 'la radice' : x.left || x.right ? 'un nodo interno' : 'una foglia';
      const hx = T.height(x);
      const down = deepest(x);
      out.innerHTML = `
<dl class="tr-facts">
  <dt>Che cos'è</dt><dd>${x.key} è ${tipo}${!par && (x.left || x.right) ? ' (e anche un nodo interno)' : ''}.</dd>
  <dt>Profondità</dt><dd>${depth[x.id]}: ${depth[x.id] ? `gli archi del cammino ${anc.concat(x).map(k).join(' → ')}` : 'la radice ha profondità 0'}. Sta nel livello ${depth[x.id]}.</dd>
  <dt>Altezza</dt><dd>${hx}: ${hx ? `il cammino più lungo verso una foglia è ${down.map(k).join(' → ')}` : 'una foglia ha altezza 0'}.</dd>
  <dt>Padre</dt><dd>${par ? par.key : 'nessuno'}</dd>
  <dt>Figli</dt><dd>${kids.length ? kids.join(', ') : 'nessuno'}</dd>
  <dt>Fratello</dt><dd>${sib ? sib.key : 'nessuno'}</dd>
  <dt>Antenati</dt><dd>${anc.length ? anc.map(k).join(', ') : 'nessuno'}</dd>
  <dt>Sottoalbero</dt><dd>${desc.length + 1} ${desc.length ? 'nodi' : 'nodo'}: ${[x].concat(desc).map(k).join(', ')} (in viola i discendenti)</dd>
</dl>
<p style="margin-top:10px">Tutto l'albero: ${order.length} nodi, altezza ${H}, foglie ${leaves.map(k).join(', ')}.</p>`;
    }
    select(order[4]);
  }

  /** Tre piccoli alberi: pieno, completo, perfetto. */
  function mountForme(host) {
    const shapes = [
      { pos: [0, 1, 2, 5, 6], title: 'Pieno', text: 'ogni nodo ha 0 o 2 figli; non è completo (buco a sinistra nell\'ultimo livello)' },
      { pos: [0, 1, 2, 3, 4, 5], title: 'Completo', text: 'l\'ultimo livello è riempito da sinistra; non è pieno' },
      { pos: [0, 1, 2, 3, 4, 5, 6], title: 'Perfetto', text: 'tutti i livelli pieni: è anche pieno e completo' },
    ];
    const gal = h('div.tr-gallery');
    host.append(gal);
    for (const sh of shapes) {
      const arr = [];
      const max = Math.max(...sh.pos);
      for (let i = 0; i <= max; i++) arr.push(sh.pos.includes(i) ? i : null);
      const fig = h('figure.tr-fig.quadretti');
      const box = h('div');
      fig.append(box, h('figcaption', { html: `<strong>${sh.title}</strong>${sh.text}` }));
      gal.append(fig);
      const tv = new ASD.viz.TreeView(box, { r: 11, gap: 10, levelH: 42, pad: 12, ariaLabel: 'Albero ' + sh.title.toLowerCase() });
      tv.render(T.state(T.fromLevel(arr), { label: () => '' }));
      T.fit(tv, 0.8);
    }
  }

  /** Rappresentazione con array: indice, figli e padre evidenziati insieme nell'albero e nell'array. */
  function mountArray(host) {
    const LETTERE = 'ABCDEFGHIJ'.split('');
    const sets = {
      completo: { arr: LETTERE, label: 'completo (10 nodi)' },
      esempio: { arr: ESEMPIO, label: 'l\'esempio (con buchi)' },
    };
    let cur = 'completo';

    const lab = h('div.lab.tr-lab');
    const body = h('div.lab-body.quadretti');
    const controls = h('div.lab-controls');
    const out = h('div.lab-out.tr-lab-out', { 'aria-live': 'polite' });
    lab.append(h('div.lab-head', h('h3', { text: 'Padre e figli nell\'array' })), body, controls, out);
    host.append(lab);

    const treeBox = h('div');
    const arrBox = h('div', { style: { marginTop: '14px', overflowX: 'auto' } });
    body.append(treeBox, arrBox);
    const tv = new ASD.viz.TreeView(treeBox, { r: 17, gap: 10, levelH: 58, pad: 18, ariaLabel: 'Albero con gli indici dell\'array' });
    const av = new ASD.viz.ArrayView(arrBox, { mode: 'cells', maxSlot: 46, minSlot: 26 });

    const sid = ASD.uid('tr-indice');
    const slider = h('input', { type: 'range', id: sid, min: '0', max: '9', value: '1', oninput: () => draw() });
    const outEl = h('output', { for: sid });
    T.choice(controls, {
      legend: 'Albero',
      value: cur,
      options: Object.entries(sets).map(([v, s]) => ({ v, label: s.label })),
      onChange: (v) => {
        cur = v;
        slider.max = String(sets[v].arr.length - 1);
        slider.value = String(Math.min(Number(slider.value), sets[v].arr.length - 1));
        tv.reset();
        av.reset();
        draw();
      },
    });
    controls.append(h('label.slider', { for: sid }, h('span', 'Indice i'), slider, outEl));

    function draw() {
      const arr = sets[cur].arr;
      const i = Number(slider.value);
      outEl.textContent = String(i);
      const n = arr.length;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      const p = Math.floor((i - 1) / 2);
      const has = (j) => j >= 0 && j < n && arr[j] != null;
      // nodi con id = indice, così il disegno resta fermo
      const nodes = {};
      arr.forEach((v, j) => {
        if (v == null) return;
        const cls = j === i ? 'active' : j === l || j === r ? 'compare' : i > 0 && j === p ? 'key' : null;
        nodes['p' + j] = { label: String(v), kids: [has(2 * j + 1) ? 'p' + (2 * j + 1) : null, has(2 * j + 2) ? 'p' + (2 * j + 2) : null], cls, sub: '[' + j + ']' };
      });
      tv.render({ root: 'p0', nodes });
      T.fit(tv, 0.7);
      const marks = { [i]: 'active' };
      if (l < n) marks[l] = 'compare';
      if (r < n) marks[r] = 'compare';
      if (i > 0) marks[p] = 'key';
      const ptrs = { i };
      if (l < n) ptrs['2i+1'] = l;
      if (r < n) ptrs['2i+2'] = r;
      if (i > 0) ptrs.padre = p;
      av.render({ a: arr, marks, ptrs });

      const name = (j) => (j >= n ? `a[${j}] è fuori dall'array` : arr[j] == null ? `a[${j}] è vuota` : `a[${j}] = ${arr[j]}`);
      const self = arr[i] == null ? `<p>a[${i}] è <strong>vuota</strong>: in questa posizione non c'è un nodo, ma la casella occupa spazio lo stesso.</p>` : `<p>a[${i}] = <strong>${arr[i]}</strong>.</p>`;
      out.innerHTML =
        self +
        `<p>Figlio sinistro: ${m(`2·${i} + 1 = ${l}`)}, ${name(l)}. Figlio destro: ${m(`2·${i} + 2 = ${r}`)}, ${name(r)}.</p>` +
        (i > 0
          ? `<p>Padre: ${m(`⌊(${i} - 1)/2⌋ = ${p}`)}, ${name(p)}.</p>`
          : `<p>La radice non ha padre. In C++ <code>(0 - 1) / 2</code> vale 0, non −1 (la divisione tra interi tronca verso lo zero): per questo il codice degli heap controlla <code>i &gt; 0</code> prima di salire.</p>`);
    }
    draw();
  }

  /* ---------------------------------------------------------------- quiz */

  function mountQuiz(host) {
    const albero = `<span class="tr-ascii" aria-label="Albero: A ha figli B e C; B ha figli D ed E; C ha solo il figlio destro F">      A
     / \\
    B   C
   / \\   \\
  D   E   F</span>`;
    ASD.quiz(host, [
      {
        q: `Qual è la visita in <strong>postordine</strong> di questo albero?${albero}`,
        options: ['<code>D E B F C A</code>', '<code>D B E A C F</code>', '<code>A B D E C F</code>', '<code>D E F B C A</code>'],
        answer: 0,
        explain: `Postordine: sinistro, destro, nodo. Il sottoalbero di B dà <code>D E B</code>, quello di C dà <code>F C</code>,
        la radice viene per ultima: <code>D E B F C A</code>. <code>D B E A C F</code> è la simmetrica, <code>A B D E C F</code>
        la preordine; l'ultima opzione è una postordine sbagliata (C prima di B).`,
      },
      {
        q: 'Quanti nodi ha <strong>al massimo</strong> un albero binario di altezza 4 (altezza contata in archi)?',
        options: ['15', '16', '31', '32'],
        answer: 2,
        explain: `I livelli sono 5 (da 0 a 4) e il livello <var>k</var> ha al più ${m('2^k')} nodi:
        ${m('1 + 2 + 4 + 8 + 16 = 31 = 2^5 - 1')}.`,
      },
      {
        q: 'Un albero binario ha 100 nodi. Qual è la sua altezza <strong>minima</strong>?',
        options: ['6', '7', '10', '99'],
        answer: 0,
        explain: `${m('⌊log_2 100⌋ = 6')}: un albero di altezza 6 contiene fino a 127 nodi, uno di altezza 5 solo fino a 63.
        L'altezza massima, per una catena, è 99.`,
      },
      {
        q: 'Quali coppie di visite individuano un <strong>unico</strong> albero binario (chiavi tutte diverse)?',
        options: ['preordine e simmetrica', 'postordine e simmetrica', 'preordine e postordine'],
        answer: [0, 1],
        explain: `Serve la simmetrica, che separa il sottoalbero sinistro dal destro; la radice si legge in testa alla
        preordine o in coda alla postordine. Con preordine <code>A B</code> e postordine <code>B A</code> non si sa se B sia
        figlio sinistro o destro di A.`,
      },
      {
        q: 'Un albero è salvato in un array con la radice in <code>a[0]</code>. Dove sono i figli di <code>a[4]</code> e il suo padre?',
        options: [
          'figli in <code>a[9]</code> e <code>a[10]</code>, padre in <code>a[1]</code>',
          'figli in <code>a[8]</code> e <code>a[9]</code>, padre in <code>a[2]</code>',
          'figli in <code>a[9]</code> e <code>a[10]</code>, padre in <code>a[2]</code>',
          'figli in <code>a[5]</code> e <code>a[6]</code>, padre in <code>a[3]</code>',
        ],
        answer: 0,
        explain: `Con gli indici da 0: ${m('2·4 + 1 = 9')}, ${m('2·4 + 2 = 10')}, padre ${m('⌊(4 - 1)/2⌋ = 1')}. La seconda
        risposta usa le formule dei libri con gli indici da 1 (${m('2i')}, ${m('2i + 1')}, ${m('⌊i/2⌋')}) su un array da 0.`,
      },
      {
        q: 'Quanto costa <code>altezza(t)</code> su un albero con <var>n</var> nodi e altezza <var>h</var>?',
        options: [m('Θ(h)'), m('Θ(log n)'), m('Θ(n)'), m('Θ(n^2)')],
        answer: 2,
        explain: `La funzione chiama se stessa su ogni nodo e su ogni puntatore nullo (${m('2n + 1')} chiamate), ognuna con
        lavoro costante: ${m('Θ(n)')}. Il risultato vale <var>h</var>, ma per scoprirlo bisogna guardare tutti i nodi: il
        cammino più lungo potrebbe essere ovunque.`,
      },
    ]);
  }
})();
