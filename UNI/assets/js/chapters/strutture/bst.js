/* ASD a quadretti — capitolo "Alberi binari di ricerca".
   Proprietà di ricerca, ricerca (stepper con il cammino), minimo e massimo,
   inserimento (stepper), cancellazione con i tre casi (stepper), successore,
   costo O(h) con laboratorio (alberi degeneri e bilanciati) e altezza media dei
   BST casuali, rotazioni (stepper), AVL, rosso-neri, std::set e std::map. */
(function () {
  'use strict';

  const { m, box, table, h } = ASD;
  const T = ASD.trees;
  const B = (T.bst = T.bst || {});

  const CHIAVI = [50, 30, 70, 20, 40, 60, 80, 35, 45, 65];
  const BILANCIATE = [40, 20, 60, 10, 30, 50, 70, 5, 15, 25, 35, 45, 55, 65, 75];
  const CRESCENTI = [10, 20, 30, 40, 50, 60, 70, 80];

  const k = (n) => n.key;
  const sorted = (a) => a.slice().sort((x, y) => x - y);

  /* --------------------------------------------- operazioni senza fotogrammi */

  /** Cammino della ricerca di key: i nodi esaminati, l'ultimo è quello trovato (se c'è). */
  B.path = function (root, key) {
    const path = [];
    let t = root;
    while (t) {
      path.push(t);
      if (key === t.key) return { path, node: t };
      t = key < t.key ? t.left : t.right;
    }
    return { path, node: null };
  };

  B.insert = function (root, key) {
    const { path, node } = B.path(root, key);
    if (node) return { root, path, node, existed: true };
    const nd = T.node(key);
    if (!root) return { root: nd, path, node: nd, existed: false };
    const last = path[path.length - 1];
    if (key < last.key) last.left = nd;
    else last.right = nd;
    return { root, path, node: nd, existed: false, parent: last };
  };

  /** Come la cancella() del C++: con due figli copia la chiave del successore. */
  B.remove = function (root, key) {
    const { path, node } = B.path(root, key);
    if (!node) return { root, path, caso: 'assente' };
    const parents = T.parents(root);
    const replace = (old, nw) => {
      const p = parents[old.id];
      if (!p) return nw;
      if (p.left === old) p.left = nw;
      else p.right = nw;
      return root;
    };
    if (!node.left || !node.right) {
      const child = node.left || node.right;
      const caso = child ? 'un figlio' : 'foglia';
      return { root: replace(node, child), path, caso, child };
    }
    let s = node.right;
    while (s.left) s = s.left;
    const sKey = s.key;
    const sp = parents[s.id];
    if (sp.left === s) sp.left = s.right;
    else sp.right = s.right;
    node.key = sKey;
    return { root, path, caso: 'due figli', succ: sKey, node };
  };

  /** Rotazione sul nodo con chiave key ('sx' o 'dx'). */
  B.rotate = function (root, key, dir) {
    const { node: x } = B.path(root, key);
    if (!x) return { root, ok: false, msg: `${key} non è nell'albero.` };
    const y = dir === 'sx' ? x.right : x.left;
    if (!y) return { root, ok: false, msg: `${key} non ha figlio ${dir === 'sx' ? 'destro' : 'sinistro'}: la rotazione ${dir === 'sx' ? 'a sinistra' : 'a destra'} non si può fare.` };
    const p = T.parents(root)[x.id];
    if (dir === 'sx') {
      x.right = y.left;
      y.left = x;
    } else {
      x.left = y.right;
      y.right = x;
    }
    if (!p) return { root: y, ok: true, up: y };
    if (p.left === x) p.left = y;
    else p.right = y;
    return { root, ok: true, up: y };
  };

  /* ------------------------------------------------------------ ricerca */

  T.trace.cerca = function (input) {
    const root = T.fromKeys(input.keys);
    const key = input.k;
    const t = new ASD.Tracer(['nodi esaminati']);
    const path = [];
    let cur = root;
    let ghost = null;

    const snap = (o = {}) => {
      const cls = {};
      for (const p of path) cls[p.id] = 'visited';
      if (cur) cls[cur.id] = o.found ? 'found' : o.cmp ? 'compare' : 'active';
      const edges = T.pathEdges(path.concat(cur && cur !== path[path.length - 1] ? [cur] : []));
      let extra = null;
      if (ghost) {
        cls[ghost.node.id] = 'ghost';
        edges[ghost.parent.id + '>' + ghost.node.id] = 'out';
        extra = ghost;
      }
      return { tree: T.state(root, { cls, edges }), caption: o.caption, result: o.result, extraGhost: Boolean(extra) };
    };
    const vars = () => ({ k: key, t: cur ? cur.key : 'nullptr' });

    for (;;) {
      if (cur && path[path.length - 1] !== cur) {
        path.push(cur);
        t.count('nodi esaminati');
      }
      if (!cur) {
        t.step('s-loop', `t è nullptr: il cammino è finito fuori dall'albero, quindi ${key} non c'è. Il ciclo finisce.`, vars(), snap());
        break;
      }
      if (cur.key === key) {
        t.step('s-loop', `t = ${cur.key} e k = ${key}: trovata, il ciclo finisce.`, vars(), snap({ found: true }));
        break;
      }
      t.step('s-loop', `t = ${cur.key} non è nullptr e ${key} ≠ ${cur.key}: si continua.`, vars(), snap({ cmp: true }));
      const less = key < cur.key;
      t.step(
        's-cmp',
        less
          ? `${key} &lt; ${cur.key}: se c'è, ${key} sta nel sottoalbero <b>sinistro</b> (lì tutte le chiavi sono minori di ${cur.key}).`
          : `${key} &gt; ${cur.key}: se c'è, ${key} sta nel sottoalbero <b>destro</b>.`,
        vars(),
        snap({ cmp: true })
      );
      const next = less ? cur.left : cur.right;
      const from = cur;
      cur = next;
      t.step(
        less ? 's-left' : 's-right',
        next
          ? `t = t-&gt;${less ? 'left' : 'right'} = ${next.key}. Il sottoalbero dall'altra parte è scartato senza guardarlo.`
          : `t = t-&gt;${less ? 'left' : 'right'} = nullptr: ${from.key} non ha figlio ${less ? 'sinistro' : 'destro'}.`,
        vars(),
        snap()
      );
    }
    const found = Boolean(cur);
    if (!found) {
      const last = path[path.length - 1];
      if (last) {
        const g = { id: 'ghost', key: key + '?', left: null, right: null };
        ghost = { node: g, parent: last };
        if (key < last.key) last.left = g;
        else last.right = g;
      }
    }
    t.step(
      's-ret',
      found ? `return t: il nodo con chiave ${key}, a profondità ${path.length - 1}.` : `return nullptr: ${key} non è nell'albero.`,
      vars(),
      snap({ found, caption: found ? '' : `Il cerchio tratteggiato è il posto in cui un inserimento metterebbe ${key}.` })
    );
    t.step(
      null,
      `Esaminati ${path.length} ${path.length === 1 ? 'nodo' : 'nodi'}, uno per livello lungo un solo cammino dalla radice in giù: al massimo h + 1, quindi la ricerca costa O(h).`,
      {},
      snap({ found, result: found, caption: found ? '' : `Il cerchio tratteggiato è il posto in cui un inserimento metterebbe ${key}.` })
    );
    return t.frames;
  };

  /* -------------------------------------------------------- inserimento */

  T.trace.inserisci = function (input) {
    let root = T.fromKeys(input.keys);
    const key = input.k;
    const t = new ASD.Tracer(['nodi esaminati']);
    const stack = [];
    let created = null;
    let createdParent = null;
    let linked = false;

    const snap = (o = {}) => {
      const cls = {};
      const path = stack.map((f) => f.n).filter(Boolean);
      for (const p of path) cls[p.id] = 'visited';
      const top = stack[stack.length - 1];
      if (top && top.n) cls[top.n.id] = o.cmp ? 'compare' : 'active';
      else if (top && path.length) cls[path[path.length - 1].id] = 'compare';
      if (created) cls[created.id] = 'new';
      const edges = T.pathEdges(path);
      if (created && createdParent) edges[createdParent.id + '>' + created.id] = linked ? 'path' : 'out';
      return {
        tree: T.state(root, { cls, edges }),
        panels: [
          {
            kind: 'stack',
            title: 'Pila delle chiamate',
            items: stack.map((f) => `inserisci(${f.n ? f.n.key : 'nullptr'}, ${key})`),
            empty: 'vuota',
          },
        ],
        result: o.result,
      };
    };
    const vars = () => {
      const top = stack[stack.length - 1];
      return { t: top ? (top.n ? top.n.key : 'nullptr') : '—', k: key };
    };

    function ins(n, from) {
      stack.push({ n });
      if (!n) {
        created = T.node(key);
        if (from) {
          from.parent[from.side] = created;
          createdParent = from.parent;
        } else root = created;
        t.step(
          'i-null',
          `t è nullptr: qui c'è il posto libero per ${key}. <code>return new Nodo(${key})</code>: il nodo nuovo esiste, ma ${
            from ? 'nessuno punta ancora a lui (arco tratteggiato)' : 'diventa la radice'
          }.`,
          vars(),
          snap()
        );
        stack.pop();
        return created;
      }
      t.count('nodi esaminati');
      t.step('i-null', `Chiamata <code>inserisci(t = ${n.key}, k = ${key})</code>: t non è nullptr.`, vars(), snap());
      const less = key < n.key;
      t.step('i-cmp-l', less ? `${key} &lt; ${n.key}: si scende a sinistra.` : `${key} &lt; ${n.key}? No.`, vars(), snap({ cmp: true }));
      if (less) {
        t.step(
          'i-left',
          `Chiamo inserisci sul sottoalbero sinistro di ${n.key} (${n.left ? 'radice ' + n.left.key : 'vuoto'}). Quello che restituisce finirà in t-&gt;left.`,
          vars(),
          snap()
        );
        const r = ins(n.left, { parent: n, side: 'left' });
        const fresh = r === created && !linked;
        if (fresh) linked = true;
        t.step(
          'i-left',
          fresh
            ? `Tornati in inserisci(${n.key}): <code>t-&gt;left</code> = il nodo nuovo ${key}. Adesso è collegato all'albero.`
            : `Tornati in inserisci(${n.key}): t-&gt;left = ${r.key}, lo stesso puntatore di prima. Riscriverlo non cambia nulla.`,
          vars(),
          snap()
        );
      } else {
        const more = key > n.key;
        t.step(
          'i-cmp-r',
          more ? `${key} &gt; ${n.key}: si scende a destra.` : `${key} = ${n.key}: la chiave c'è già, non si inserisce niente.`,
          vars(),
          snap({ cmp: true })
        );
        if (more) {
          t.step(
            'i-right',
            `Chiamo inserisci sul sottoalbero destro di ${n.key} (${n.right ? 'radice ' + n.right.key : 'vuoto'}). Il risultato finirà in t-&gt;right.`,
            vars(),
            snap()
          );
          const r = ins(n.right, { parent: n, side: 'right' });
          const fresh = r === created && !linked;
          if (fresh) linked = true;
          t.step(
            'i-right',
            fresh
              ? `Tornati in inserisci(${n.key}): <code>t-&gt;right</code> = il nodo nuovo ${key}. Adesso è collegato all'albero.`
              : `Tornati in inserisci(${n.key}): t-&gt;right = ${r.key}, lo stesso puntatore di prima.`,
            vars(),
            snap()
          );
        }
      }
      const caller = stack.length > 1 ? stack[stack.length - 2].n : null;
      t.step('i-ret', `<code>return t</code>: la radice di questo sottoalbero resta ${n.key}${caller ? `; si torna in inserisci(${caller.key})` : '; si torna al main'}.`, vars(), snap());
      stack.pop();
      return n;
    }

    root = ins(root, null);
    linked = true;
    const msg = created
      ? `Inserito ${key} come figlio ${createdParent ? (createdParent.left === created ? 'sinistro' : 'destro') + ' di ' + createdParent.key : '(è la radice)'}, a profondità ${
          t.c['nodi esaminati']
        }. Si è percorso un solo cammino: O(h). Il nodo nuovo è sempre una foglia.`
      : `${key} c'era già: l'albero non cambia (come in std::set).`;
    t.step(null, msg, {}, snap({ result: T.keys(T.ino(root)) }));
    return t.frames;
  };

  /* ------------------------------------------------------ cancellazione */

  T.trace.cancella = function (input) {
    let root = T.fromKeys(input.keys);
    const key0 = input.k;
    const t = new ASD.Tracer(['nodi esaminati']);
    const stack = [];
    const gone = new Set();
    const fresh = new Set();
    let succPath = [];

    const snap = (o = {}) => {
      const cls = {};
      const path = stack.map((f) => f.n).filter(Boolean);
      for (const p of path) cls[p.id] = 'visited';
      for (const p of succPath) cls[p.id] = 'key';
      for (const id of fresh) cls[id] = 'new';
      const top = stack[stack.length - 1];
      if (top && top.n) cls[top.n.id] = o.cmp ? 'compare' : 'active';
      else if (top && path.length) cls[path[path.length - 1].id] = 'compare';
      for (const id of gone) cls[id] = 'gone';
      const edges = T.pathEdges(path);
      for (let i = 1; i < succPath.length; i++) edges[succPath[i - 1].id + '>' + succPath[i].id] = 'path';
      return {
        tree: T.state(root, { cls, edges }),
        panels: [
          {
            kind: 'stack',
            title: 'Pila delle chiamate',
            items: stack.map((f) => `cancella(${f.n ? f.n.key : 'nullptr'}, ${f.k})`),
            empty: 'vuota',
          },
        ],
        result: o.result,
      };
    };
    const vars = () => {
      const top = stack[stack.length - 1];
      return { t: top ? (top.n ? top.n.key : 'nullptr') : '—', k: top ? top.k : key0 };
    };
    const name = (x) => (x ? String(x.key) : 'nullptr');

    function del(n, key) {
      stack.push({ n, k: key });
      if (!n) {
        t.step('d-null', `t è nullptr: ${key} non è nell'albero. <code>return nullptr</code>: non cambia niente.`, vars(), snap());
        stack.pop();
        return null;
      }
      t.count('nodi esaminati');
      t.step('d-null', `Chiamata <code>cancella(t = ${n.key}, k = ${key})</code>.`, vars(), snap());
      const less = key < n.key;
      t.step('d-cmp-l', less ? `${key} &lt; ${n.key}: la chiave da togliere sta a sinistra.` : `${key} &lt; ${n.key}? No.`, vars(), snap({ cmp: true }));
      if (less) {
        t.step('d-left', `Chiamo cancella sul sottoalbero sinistro: restituirà la sua nuova radice, da scrivere in t-&gt;left.`, vars(), snap());
        const before = n.left;
        const r = del(n.left, key);
        n.left = r;
        for (const id of gone) gone.delete(id);
        t.step(
          'd-left',
          r === before
            ? `Tornati in cancella(${n.key}): t-&gt;left = ${name(r)}, come prima.`
            : `Tornati in cancella(${n.key}): <code>t-&gt;left = ${name(r)}</code>. Il nodo tolto non è più raggiungibile.`,
          vars(),
          snap()
        );
      } else {
        const more = key > n.key;
        t.step(
          'd-cmp-r',
          more ? `${key} &gt; ${n.key}: la chiave da togliere sta a destra.` : `${key} = ${n.key}: trovato il nodo da togliere. Quanti figli ha?`,
          vars(),
          snap({ cmp: true })
        );
        if (more) {
          t.step('d-right', `Chiamo cancella sul sottoalbero destro; il risultato andrà in t-&gt;right.`, vars(), snap());
          const before = n.right;
          const r = del(n.right, key);
          n.right = r;
          for (const id of gone) gone.delete(id);
          t.step(
            'd-right',
            r === before
              ? `Tornati in cancella(${n.key}): t-&gt;right = ${name(r)}, come prima.`
              : `Tornati in cancella(${n.key}): <code>t-&gt;right = ${name(r)}</code>. Il nodo tolto non è più raggiungibile.`,
            vars(),
            snap()
          );
        } else if (!n.left) {
          t.step(
            'd-noleft',
            n.right ? `t-&gt;left è nullptr: ${n.key} ha <b>solo il figlio destro</b> (caso 2).` : `t-&gt;left è nullptr e anche t-&gt;right: ${n.key} è una <b>foglia</b> (caso 1).`,
            vars(),
            snap()
          );
          const r = n.right;
          t.step('d-r', r ? `r = t-&gt;right = ${r.key}: sarà ${r.key}, con tutto il suo sottoalbero, a prendere il posto di ${n.key}.` : `r = t-&gt;right = nullptr: al posto di ${n.key} non resterà niente.`, vars(), snap());
          gone.add(n.id);
          t.step('d-del-r', `<code>delete t</code>: la memoria del nodo ${n.key} è liberata. Il padre però punta ancora lì: lo sistema al ritorno.`, vars(), snap());
          if (r) fresh.add(r.id);
          t.step('d-ret-r', `<code>return ${name(r)}</code>: il chiamante lo scriverà al posto del puntatore a ${n.key}.`, vars(), snap());
          stack.pop();
          return r;
        } else {
          t.step('d-noleft', `t-&gt;left non è nullptr.`, vars(), snap());
          if (!n.right) {
            t.step('d-noright', `t-&gt;right è nullptr: ${n.key} ha <b>solo il figlio sinistro</b> (caso 2).`, vars(), snap());
            const l = n.left;
            t.step('d-l', `l = t-&gt;left = ${l.key}: sarà ${l.key} a prendere il posto di ${n.key}.`, vars(), snap());
            gone.add(n.id);
            t.step('d-del-l', `<code>delete t</code>: la memoria del nodo ${n.key} è liberata.`, vars(), snap());
            fresh.add(l.id);
            t.step('d-ret-l', `<code>return ${l.key}</code>: il chiamante lo aggancia al posto di ${n.key}.`, vars(), snap());
            stack.pop();
            return l;
          }
          t.step('d-noright', `Anche t-&gt;right non è nullptr: ${n.key} ha <b>due figli</b> (caso 3). Non si può staccare: si sostituisce la sua chiave.`, vars(), snap());
          let s = n.right;
          succPath = [s];
          t.step('d-succ', `Il successore di ${n.key} è il minimo del sottoalbero destro: parto da ${s.key}${s.left ? ' e scendo sempre a sinistra' : ''}.`, vars(), snap());
          while (s.left) {
            s = s.left;
            succPath.push(s);
            t.step('d-succ', s.left ? `Scendo a sinistra: ${s.key}.` : `Scendo a sinistra: ${s.key} non ha figlio sinistro, è il minimo. s = ${s.key}.`, vars(), snap());
          }
          if (succPath.length === 1) t.step('d-succ', `${s.key} non ha figlio sinistro: è già il minimo. s = ${s.key}.`, vars(), snap());
          const old = n.key;
          n.key = s.key;
          fresh.add(n.id);
          t.step(
            'd-copy',
            `<code>t-&gt;key = s-&gt;key</code>: al posto di ${old} ora c'è ${s.key}. L'ordine regge: ${s.key} è più grande di tutto il sottoalbero sinistro e più piccolo del resto del destro. Ma ${s.key} adesso compare due volte.`,
            vars(),
            snap()
          );
          succPath = [];
          t.step('d-rec', `Tolgo il vecchio ${s.key} dal sottoalbero destro: <code>cancella(t-&gt;right, ${s.key})</code>. Non ha figlio sinistro, quindi sarà il caso 1 o 2.`, vars(), snap());
          const before = n.right;
          const r = del(n.right, s.key);
          n.right = r;
          for (const id of gone) gone.delete(id);
          t.step('d-rec', `Tornati in cancella(${n.key}): t-&gt;right = ${name(r)}${r === before ? ', come prima' : ''}.`, vars(), snap());
        }
      }
      const caller = stack.length > 1 ? stack[stack.length - 2].n : null;
      t.step('d-ret', `<code>return t</code> (${n.key}): ${caller ? `si torna in cancella(${caller.key})` : 'si torna al main'}.`, vars(), snap());
      stack.pop();
      return n;
    }

    const before = root;
    root = del(root, key0);
    gone.clear();
    t.step(
      null,
      root !== before
        ? `Nel main: <code>radice = cancella(radice, ${key0})</code>, la radice ora è ${name(root)}. Simmetrica: ${T.keys(T.ino(root)).join(' ')}.`
        : `Fatto. Simmetrica: ${T.keys(T.ino(root)).join(' ') || '(albero vuoto)'}: ancora ordinata. Si è sceso lungo un cammino (più quello del successore): O(h).`,
      {},
      snap({ result: T.keys(T.ino(root)) })
    );
    return t.frames;
  };

  /* ------------------------------------------------------------ rotazioni */

  T.trace.ruota = function (input) {
    const dir = input.dir;
    const root = T.fromKeys(input.keys);
    const t = new ASD.Tracer([]);
    const sx = dir === 'sx';
    if (!root || !(sx ? root.right : root.left)) {
      t.step(
        null,
        `La radice non ha figlio ${sx ? 'destro' : 'sinistro'}: ${sx ? 'ruotaSinistra' : 'ruotaDestra'} leggerebbe un puntatore nullo. Scegli un altro albero o l'altra rotazione.`,
        {},
        { tree: T.state(root), result: { impossible: true } }
      );
      return t.frames;
    }
    // sx: x = radice, y = x->right; dx: y = radice, x = y->left
    const x = sx ? root : root.left;
    const y = sx ? root.right : root;
    const A = x.left;
    const Bt = sx ? y.left : x.right;
    const C = y.right;
    const sub = { [x.id]: 'x', [y.id]: 'y' };
    if (A) sub[A.id] = 'α';
    if (Bt) sub[Bt.id] = 'β';
    if (C) sub[C.id] = 'γ';
    const subtreeCls = (r, c, cls) => {
      for (const n of T.pre(r)) cls[n.id] = c;
    };
    const ord = T.keys(T.ino(root)).join(' ');
    const h0 = T.height(root);
    const nd = (n, l, r) => ({ id: n.id, key: n.key, left: l, right: r });
    const clsBase = (o = {}) => {
      const cls = {};
      if (Bt) subtreeCls(Bt, 'compare', cls);
      cls[x.id] = 'active';
      cls[y.id] = 'key';
      return Object.assign(cls, o);
    };
    const st = (r, extra, caption) => ({ tree: T.state(r, { cls: clsBase(), sub, extra }), caption });
    const L = sx ? { a: 'rl-y', b: 'rl-beta', c: 'rl-x', r: 'rl-ret' } : { a: 'rr-x', b: 'rr-beta', c: 'rr-y', r: 'rr-ret' };
    const fn = sx ? 'ruotaSinistra' : 'ruotaDestra';
    const empty = (s, nome) => (s ? `${nome} (radice ${s.key})` : `${nome} (vuoto)`);

    // prima
    const before = sx ? nd(x, A, nd(y, Bt, C)) : nd(y, nd(x, A, Bt), C);
    t.step(
      null,
      `Chiamo <code>radice = ${fn}(radice)</code>. Prima: in ordine ${ord}, altezza ${h0}. I sottoalberi α, β, γ non cambiano al loro interno; solo β cambierà padre.`,
      {},
      st(before)
    );
    // 1
    t.step(
      L.a,
      sx ? `<code>y = x-&gt;right</code> = ${y.key}: y salirà al posto di x = ${x.key}.` : `<code>x = y-&gt;left</code> = ${x.key}: x salirà al posto di y = ${y.key}.`,
      sx ? { x: x.key, y: y.key } : { y: y.key, x: x.key },
      st(before)
    );
    // 2: β cambia padre (il puntatore vecchio a β non si disegna)
    const mid = sx ? [nd(x, A, Bt), nd(y, null, C)] : [nd(y, Bt, C), nd(x, A, null)];
    t.step(
      L.b,
      sx
        ? `<code>x-&gt;right = y-&gt;left</code>: ${empty(Bt, 'β')} passa da y a x. È l'unico pezzo che cambia padre, e può farlo: le sue chiavi stanno tra ${x.key} e ${y.key}. (y-&gt;left punta ancora a β, ma la riga dopo lo sovrascrive.)`
        : `<code>y-&gt;left = x-&gt;right</code>: ${empty(Bt, 'β')} passa da x a y: le sue chiavi stanno tra ${x.key} e ${y.key}. (x-&gt;right punta ancora a β, ma la riga dopo lo sovrascrive.)`,
      sx ? { x: x.key, y: y.key } : { y: y.key, x: x.key },
      st(sx ? mid[0] : mid[1], [sx ? mid[1] : mid[0]])
    );
    // 3
    const after = sx ? nd(y, nd(x, A, Bt), C) : nd(x, A, nd(y, Bt, C));
    t.step(
      L.c,
      sx ? `<code>y-&gt;left = x</code>: x scende e diventa il figlio sinistro di y.` : `<code>x-&gt;right = y</code>: y scende e diventa il figlio destro di x.`,
      sx ? { x: x.key, y: y.key } : { y: y.key, x: x.key },
      st(after)
    );
    // 4
    const top = sx ? y : x;
    t.step(
      L.r,
      `<code>return ${sx ? 'y' : 'x'}</code>: ${top.key} è la nuova radice di questo sottoalbero. Sono cambiati solo tre puntatori: O(1).`,
      sx ? { x: x.key, y: y.key } : { y: y.key, x: x.key },
      st(after)
    );
    const h1 = T.height(after);
    t.step(
      null,
      `Il main scrive il risultato in radice: ora è ${top.key}. In ordine: ${T.keys(T.ino(after)).join(' ')}, identico a prima (guarda le colonne: nessun nodo si è spostato di lato). Altezza: ${h0} → ${h1}.`,
      {},
      Object.assign(st(after), { result: { ino: T.keys(T.ino(after)), root: top.key } })
    );
    return t.frames;
  };

  /* ---------------------------------------------------------------- capitolo */

  ASD.chapter({
    id: 'bst',
    title: 'Alberi binari di ricerca',
    lead:
      'Un albero binario di ricerca tiene le chiavi in ordine: a sinistra le più piccole, a destra le più grandi. Così ricerca, inserimento e cancellazione scendono lungo un solo cammino e costano quanto l\'altezza dell\'albero. Il problema è che l\'altezza può essere enorme.',
    minutes: 55,
    prereq: ['alberi', 'ricerca'],
    goals: [
      'riconoscere un albero binario di ricerca e controllare la proprietà su tutto il sottoalbero, non solo tra padre e figlio',
      'eseguire a mano ricerca, inserimento e cancellazione (con i tre casi) e disegnare l\'albero dopo ogni operazione',
      `trovare minimo, massimo, successore e predecessore, e spiegare perché tutto costa ${m('O(h)')}`,
      `sapere che ${m('⌊log_2 n⌋ <= h <= n - 1')}, quando l'albero degenera e come le rotazioni lo ribilanciano`,
      'usare std::set e std::map sapendo che sono alberi bilanciati',
    ],

    render(el) {
      el.innerHTML = `
<section id="proprieta">
  <h2>La proprietà di ricerca</h2>
  <p>Un <strong>albero binario di ricerca</strong> (<i>binary search tree</i>, BST) è un albero binario in cui, per
  <strong>ogni</strong> nodo <var>x</var>:</p>
  <ul>
    <li>tutte le chiavi del sottoalbero <strong>sinistro</strong> di <var>x</var> sono minori di <code>x-&gt;key</code>;</li>
    <li>tutte le chiavi del sottoalbero <strong>destro</strong> sono maggiori.</li>
  </ul>
  <p>Qui le chiavi sono tutte diverse, come in <code>std::set</code>. (Se servono chiavi ripetute, si decide una volta per
  tutte da che parte metterle, per esempio a destra con ${m('>=')}.)</p>
  <div data-mount="figure"></div>
  ${box('errore', `<p>Controllare solo padre e figlio non basta. Nel secondo albero ogni figlio sinistro è minore del padre e
  ogni figlio destro è maggiore, eppure 12 sta nel sottoalbero <em>sinistro</em> di 10 pur essendo maggiore di 10: non è
  un BST, e una ricerca di 12 partirebbe verso destra senza trovarlo. Il controllo giusto passa a ogni nodo l'intervallo
  in cui devono stare le sue chiavi:</p>`)}
  <div data-mount="codice-ebst"></div>
  <h3>La visita simmetrica è ordinata</h3>
  <p>La ${ASD.link('alberi', 'visite', 'visita simmetrica')} stampa il sottoalbero sinistro, poi il nodo, poi il destro:
  in un BST significa prima le chiavi minori, poi il nodo, poi le maggiori. Per induzione, la simmetrica di un BST
  elenca le chiavi in <strong>ordine crescente</strong>, in tempo ${m('Θ(n)')}. Il contrario vale anche: un albero binario
  è un BST se e solo se la sua simmetrica è crescente.</p>
  ${box('ricorda', `<p>Proprietà da ricordare: minimo = nodo più a sinistra, massimo = nodo più a destra, simmetrica =
  chiavi ordinate. Inserire <var>n</var> chiavi in un BST e poi fare la simmetrica è un ordinamento (<i>tree sort</i>).</p>`)}
</section>

<section id="ricerca">
  <h2>Ricerca</h2>
  <p>La ricerca di <var>k</var> è una ${ASD.link('ricerca', null, 'ricerca binaria')} sull'albero: si confronta <var>k</var>
  con la radice; se è più piccola si scende a sinistra, se è più grande a destra. Ogni confronto scarta un sottoalbero
  intero. Si finisce quando si trova la chiave oppure quando si cade su <code>nullptr</code>.</p>
  <div data-mount="cerca"></div>
  <p>Il cammino tocca al più un nodo per livello: la ricerca costa ${m('O(h)')}, dove <var>h</var> è l'altezza.</p>
  <h3>Minimo e massimo</h3>
  <p>Il minimo è il nodo più a sinistra: si scende a sinistra finché si può, senza nessun confronto tra chiavi. Il massimo,
  simmetricamente, è il nodo più a destra. Costo ${m('O(h)')}.</p>
  <div data-mount="codice-minmax"></div>
</section>

<section id="inserimento">
  <h2>Inserimento</h2>
  <p>Si cerca la chiave come nella ricerca. Se c'è già, non si fa niente; altrimenti la ricerca finisce su un
  <code>nullptr</code>, ed è proprio lì che va il nodo nuovo: <strong>un inserimento crea sempre una foglia</strong>.</p>
  <p>La versione ricorsiva restituisce la radice del sottoalbero dopo l'inserimento, e il chiamante la riscrive nel
  puntatore da cui era sceso: <code>t-&gt;left = inserisci(t-&gt;left, k)</code>. Quasi sempre riscrive lo stesso valore;
  solo in fondo il <code>nullptr</code> diventa il nodo nuovo.</p>
  <div data-mount="inserisci"></div>
  ${box('errore', `<p>Scrivere <code>inserisci(t-&gt;left, k);</code> senza assegnare il risultato. Il nodo nuovo viene
  creato, ma nessun puntatore dell'albero lo raggiunge: l'inserimento si perde e la memoria non viene più liberata. Lo
  stesso vale per la cancellazione. (Un'alternativa è passare il puntatore per riferimento, <code>Nodo*&amp; t</code>:
  allora <code>t = new Nodo(k)</code> modifica direttamente il puntatore del padre.)</p>`)}
</section>

<section id="cancellazione">
  <h2>Cancellazione</h2>
  <p>Trovato il nodo <var>t</var> da togliere, ci sono tre casi.</p>
  <ol>
    <li><strong>Foglia</strong>: si toglie e basta; il padre riceve <code>nullptr</code>.</li>
    <li><strong>Un solo figlio</strong>: il figlio, con tutto il suo sottoalbero, prende il posto di <var>t</var>. L'ordine
    regge: quel sottoalbero stava già tutto dalla stessa parte del padre di <var>t</var>.</li>
    <li><strong>Due figli</strong>: non si può staccare <var>t</var> senza perdere uno dei due sottoalberi. Si prende il suo
    <strong>successore</strong> <var>s</var>, il minimo del sottoalbero destro; si copia la chiave di <var>s</var> in
    <var>t</var> e si cancella <var>s</var> dal sottoalbero destro. Siccome <var>s</var> è un minimo, non ha figlio sinistro:
    la sua cancellazione è il caso 1 o 2.</li>
  </ol>
  <p>Nel codice i casi 1 e 2 sono uniti: se manca il figlio sinistro si restituisce il destro, che per una foglia è
  <code>nullptr</code>. Prova i tre casi con i bottoni sopra lo stepper.</p>
  <div data-mount="cancella"></div>
  ${box('esame', `<p>Allo scritto disegna l'albero <em>dopo</em> ogni cancellazione e scrivi quale caso hai applicato. Nel caso
  3 si può usare anche il <strong>predecessore</strong> (il massimo del sottoalbero sinistro): è corretto lo stesso, ma
  l'albero che viene fuori è diverso. Usa quello che chiede il testo; se non dice niente, il successore è la scelta del
  Cormen.</p>`)}
  ${box('nota', `<p>Copiare la chiave è il modo più semplice. Il Cormen invece sposta il nodo successore al posto di
  <var>t</var> (con la procedura <code>TRANSPLANT</code>), così chi aveva un puntatore a un nodo non se lo vede cambiare
  sotto il naso. Il risultato, come forma e come chiavi, è lo stesso.</p>`, 'Copiare o spostare')}
</section>

<section id="successore">
  <h2>Successore e predecessore</h2>
  <p>Il <strong>successore</strong> di una chiave <var>k</var> è la più piccola chiave maggiore di <var>k</var>: quella che
  viene subito dopo nella simmetrica. Due casi, se <var>k</var> è nell'albero:</p>
  <ul>
    <li>se il nodo di <var>k</var> ha un figlio destro, il successore è il <strong>minimo del sottoalbero destro</strong>
    (lo usa la cancellazione);</li>
    <li>altrimenti è il <strong>primo antenato di cui il nodo sta nel sottoalbero sinistro</strong>: si risale finché si
    arriva da sinistra. Con il nodo 45 dell'esempio: 45 non ha figlio destro, è figlio destro di 40, che è figlio destro di
    30, che è figlio sinistro di 50: il successore è 50.</li>
  </ul>
  <p>Senza puntatore al padre si fa scendendo dalla radice: ogni volta che si va a sinistra il nodo appena lasciato è un
  candidato, perché è più grande di <var>k</var>; l'ultimo candidato è il successore.</p>
  <div data-mount="codice-succ"></div>
  <p>Il <strong>predecessore</strong> è il simmetrico: il massimo del sottoalbero sinistro, oppure il primo antenato da cui
  si arriva da destra. Tutti e due costano ${m('O(h)')}.</p>
</section>

<section id="altezza">
  <h2>Tutto costa O(h): e h quanto vale?</h2>
  <p>Ricerca, inserimento, cancellazione, minimo, massimo, successore: ognuna percorre un cammino (al più due) dalla radice
  verso il basso, quindi costa ${m('O(h)')}. Per un albero con <var>n</var> nodi
  (${ASD.link('alberi', 'forme', 'vedi le forme degli alberi')}):</p>
  <p class="formula">${m('⌊log_2 n⌋ <= h <= n - 1')}</p>
  <p>La forma dipende dall'<strong>ordine degli inserimenti</strong>. Se le chiavi arrivano in ordine crescente, ognuna
  diventa figlio destro della precedente: l'albero è una catena, ${m('h = n - 1')}, e ogni operazione costa ${m('Θ(n)')}
  come in una lista. Se arrivano in ordine casuale, l'altezza attesa è ${m('O(log n)')}.</p>
  <p>Prova tu: costruisci l'albero con chiavi crescenti, poi con chiavi bilanciate, e confronta l'altezza con i due
  estremi. Puoi anche inserire, cercare, cancellare e ruotare un nodo alla volta.</p>
  <div data-mount="lab"></div>
  <p>E con le chiavi in ordine casuale? Il grafico misura l'altezza media di BST costruiti inserendo 1, 2, …, <var>n</var>
  in ordine casuale (30 prove per ogni <var>n</var>), e la confronta con il minimo possibile ${m('⌊log_2 n⌋')}.</p>
  <div data-mount="casuali"></div>
  ${box('ricorda', `<p>Un BST "semplice" costa ${m('O(log n)')} in media ma ${m('Θ(n)')} nel caso peggiore, e il caso
  peggiore è banale da ottenere: basta inserire dati già ordinati. Per avere ${m('O(log n)')} garantito servono gli alberi
  bilanciati.</p>`)}
</section>

<section id="bilanciati">
  <h2>Alberi bilanciati e rotazioni</h2>
  <p>Un albero bilanciato mantiene ${m('h = O(log n)')} sistemando la forma dopo ogni inserimento e cancellazione. Lo
  strumento è la <strong>rotazione</strong>: un nodo sale, suo padre scende dall'altra parte, e un sottoalbero cambia
  padre. Le chiavi restano in ordine, perché la simmetrica non cambia; l'altezza invece sì.</p>
  <div data-mount="ruota"></div>
  <div data-mount="codice-rot"></div>
  <p>Una rotazione su un nodo interno è identica: il padre riaggancia la nuova radice del sottoalbero, come in
  <code>p-&gt;right = ruotaSinistra(p-&gt;right)</code>. Nel laboratorio qui sopra puoi ruotare qualsiasi nodo: prova a
  rimettere in piedi la catena delle chiavi crescenti.</p>
  <h3>AVL e rosso-neri, in breve</h3>
  <dl>
    <dt>Alberi AVL</dt>
    <dd>in ogni nodo le altezze dei due sottoalberi differiscono al più di 1 (fattore di bilanciamento −1, 0 o +1).
    Dopo un inserimento si risale verso la radice e, al primo nodo sbilanciato, si fa una rotazione semplice o doppia
    (casi LL, RR, LR, RL). L'altezza resta sotto circa ${m('1,44 log_2 n')}.</dd>
    <dt>Alberi rosso-neri</dt>
    <dd>ogni nodo è rosso o nero; la radice è nera; un nodo rosso non ha figli rossi; ogni cammino dalla radice a un
    <code>nullptr</code> attraversa lo stesso numero di nodi neri. Ne segue ${m('h <= 2 log_2(n + 1)')}. Le correzioni
    usano ricolorazioni e al più 2 rotazioni per inserimento, 3 per cancellazione.</dd>
  </dl>
  ${box('esame', `<p>All'esame di solito non si chiede di implementare un AVL o un rosso-nero, ma di sapere che esistono, che
  garantiscono ${m('O(log n)')} per ricerca, inserimento e cancellazione, e di eseguire una rotazione a mano.</p>`)}
  <h3>std::set e std::map</h3>
  <p>Nella libreria standard il lavoro è già fatto: <code>std::set</code> (insieme di chiavi) e <code>std::map</code> (chiave
  → valore) sono alberi binari di ricerca bilanciati, di solito rosso-neri. Lo standard garantisce costo
  ${m('O(log n)')} per <code>insert</code>, <code>find</code>, <code>erase</code>, <code>count</code>,
  <code>lower_bound</code> e <code>upper_bound</code>; scorrerli con un <code>for</code> dà le chiavi in ordine crescente
  (è la visita simmetrica).</p>
  <div data-mount="codice-set"></div>
  <p>Output del programma:</p>
  <pre class="code-out" tabindex="0"><code>set: 30 40 50 60 70
40 c'è? sì
minimo 30, massimo 70
successore di 45: 50
Bianchi: 30
Rossi: 29
Verdi: 25
Neri non c'è</code></pre>
  ${box('errore', `<p>Con <code>std::map</code>, scrivere <code>voti["Neri"]</code> per <em>controllare</em> se una chiave c'è:
  l'operatore <code>[]</code> la inserisce (con valore 0) se manca. Per controllare si usa <code>find</code> o
  <code>count</code>.</p>`)}
</section>

<section id="costi">
  <h2>Quanto costa</h2>
  ${table({
    caption: 'BST con n nodi e altezza h',
    head: ['Operazione', 'BST qualsiasi', 'Caso peggiore', 'Bilanciato (AVL, rosso-nero, std::set)'],
    rows: [
      ['Ricerca', m('O(h)'), m('Θ(n)'), m('O(log n)')],
      ['Inserimento', m('O(h)'), m('Θ(n)'), m('O(log n)')],
      ['Cancellazione', m('O(h)'), m('Θ(n)'), m('O(log n)')],
      ['Minimo, massimo', m('O(h)'), m('Θ(n)'), m('O(log n)')],
      ['Successore, predecessore', m('O(h)'), m('Θ(n)'), m('O(log n)')],
      ['Visita simmetrica (chiavi in ordine)', m('Θ(n)'), m('Θ(n)'), m('Θ(n)')],
      ['Costruire con n inserimenti', `${m('O(n log n)')} in media`, `${m('Θ(n^2)')} (chiavi ordinate)`, m('O(n log n)')],
    ],
  })}
  <p>Il caso peggiore è ${m('h = n - 1')}; con chiavi inserite in ordine casuale l'altezza attesa è ${m('O(log n)')}.
  Una rotazione costa ${m('O(1)')}.</p>
</section>

<section id="esame">
  <h2>All'esame</h2>
  <ol>
    <li><strong>Costruzione</strong>: "inserisci in un BST vuoto 50, 30, 70, 20, 40, 60, 80, 35 e disegna l'albero". Ogni
    chiave scende dalla radice e diventa una foglia.</li>
    <li><strong>Cancellazione</strong>: "cancella 30 e disegna l'albero risultante". Dichiara il caso e se usi successore o
    predecessore.</li>
    <li><strong>Verifica</strong>: "questo albero è un BST?". Controlla gli intervalli, non le coppie padre-figlio; oppure
    scrivi la simmetrica e guarda se è crescente.</li>
    <li><strong>Cammini di ricerca</strong>: "quale di queste sequenze non può essere la sequenza dei nodi esaminati cercando
    55?". Ogni nodo del cammino restringe l'intervallo in cui devono stare i successivi.</li>
    <li><strong>Costi</strong>: "quanto costa inserire <var>n</var> chiavi già ordinate?" La <var>i</var>-esima scende lungo una catena di ${m('i - 1')} nodi: ${m('0 + 1 + … + (n - 1) = Θ(n^2)')}.</li>
  </ol>
  ${box('esame', `<p>Quando dai il costo di un'operazione su un BST scrivi ${m('O(h)')} e poi specifica: ${m('O(log n)')} se
  l'albero è bilanciato, ${m('Θ(n)')} nel caso peggiore. Scrivere solo "${m('O(log n)')}" per un BST qualsiasi è
  sbagliato.</p>`)}
</section>

<section id="verifica">
  <h2>Verifica rapida</h2>
  <div data-mount="quiz"></div>
</section>`;

      ASD.mount(el, {
        figure: mountFigure,
        'codice-ebst': (host) => ASD.code(host, { src: 'strutture/bst_operazioni', region: 'ebst' }),
        cerca: mountCerca,
        'codice-minmax': (host) => ASD.code(host, { src: 'strutture/bst_operazioni', region: 'minmax' }),
        inserisci: mountInserisci,
        cancella: mountCancella,
        'codice-succ': (host) => ASD.code(host, { src: 'strutture/bst_operazioni', region: 'successore' }),
        lab: mountLab,
        casuali: mountCasuali,
        ruota: mountRuota,
        'codice-rot': (host) => ASD.code(host, { src: 'strutture/bst_rotazioni', region: 'rotazioni' }),
        'codice-set': (host) => ASD.code(host, { src: 'strutture/bst_set_map', maxHeight: 420 }),
        quiz: mountQuiz,
      });
    },
  });

  /* ------------------------------------------------------------ stepper */

  /** Input "chiavi + una chiave k": il campo k si aggiunge al modulo dello stepper. */
  function keysInput(o) {
    const ui = {};
    const input = {
      label: 'Chiavi',
      value: { keys: o.keys.slice(), k: o.k },
      parse: (s) => ({ keys: T.parse.keys(s, { maxLen: 15 }), k: T.parse.int(ui.k, 'k') }),
      format: (v) => {
        if (ui.k) ui.k.value = String(v.k);
        return v.keys.join(' ');
      },
      presets: o.presets,
    };
    return { input, ui };
  }

  const legendBST = [
    { k: 'active', label: 'nodo corrente' },
    { k: 'compare', label: 'confronto' },
    { k: 'out', label: 'cammino già fatto' },
  ];

  function mountCerca(host) {
    const { input, ui } = keysInput({
      keys: CHIAVI,
      k: 45,
      presets: [
        { label: 'Trovata (45)', value: () => ({ keys: CHIAVI.slice(), k: 45 }) },
        { label: 'Assente (55)', value: () => ({ keys: CHIAVI.slice(), k: 55 }) },
        { label: 'Catena', value: () => ({ keys: CRESCENTI.slice(), k: 75 }) },
        { label: 'Casuale', value: () => { const a = ASD.randomDistinct(10, 1, 99); return { keys: a, k: Math.random() < 0.6 ? a[ASD.randInt(0, 9)] : ASD.randInt(1, 99) }; } },
      ],
    });
    const st = ASD.stepper(host, {
      id: 'bst-cerca',
      title: 'Ricerca in un BST',
      code: { src: 'strutture/bst_operazioni', region: 'cerca' },
      input,
      view: (stage) => new T.Stage(stage),
      trace: T.trace.cerca,
      counters: [{ key: 'nodi esaminati', label: 'nodi esaminati' }],
      legend: [
        { k: 'active', label: 'nodo corrente' },
        { k: 'compare', label: 'confronto con k' },
        { k: 'done', label: 'trovato' },
      ],
      validate: (inp, frames) => {
        const got = frames[frames.length - 1].state.result;
        const want = inp.keys.includes(inp.k);
        return got === want ? null : `risultato ${got}, atteso ${want}`;
      },
    });
    ui.k = T.field(st, { name: 'k', label: 'Cerca', type: 'number', value: st.value.k, min: 1, max: 99 });
  }

  function mountInserisci(host) {
    const { input, ui } = keysInput({
      keys: CHIAVI,
      k: 55,
      presets: [
        { label: 'Esempio (55)', value: () => ({ keys: CHIAVI.slice(), k: 55 }) },
        { label: 'Già presente (40)', value: () => ({ keys: CHIAVI.slice(), k: 40 }) },
        { label: 'Catena', value: () => ({ keys: CRESCENTI.slice(0, 6), k: 70 }) },
        {
          label: 'Casuale',
          value: () => {
            const a = ASD.randomDistinct(11, 1, 99);
            return { keys: a.slice(0, 10), k: a[10] };
          },
        },
      ],
    });
    const st = ASD.stepper(host, {
      id: 'bst-inserisci',
      title: 'Inserimento in un BST',
      code: { src: 'strutture/bst_operazioni', region: 'inserisci' },
      input,
      view: (stage) => new T.Stage(stage),
      trace: T.trace.inserisci,
      counters: [{ key: 'nodi esaminati', label: 'nodi esaminati' }],
      legend: [
        { k: 'active', label: 'chiamata in corso' },
        { k: 'compare', label: 'confronto' },
        { k: 'key', label: 'nodo nuovo' },
      ],
      validate: (inp, frames) => {
        const got = (frames[frames.length - 1].state.result || []).join(' ');
        const want = sorted([...new Set(inp.keys.concat(inp.k))]).join(' ');
        return got === want ? null : `simmetrica ${got}, attesa ${want}`;
      },
    });
    ui.k = T.field(st, { name: 'k', label: 'Inserisci', type: 'number', value: st.value.k, min: 1, max: 99 });
  }

  function mountCancella(host) {
    const { input, ui } = keysInput({
      keys: CHIAVI,
      k: 30,
      presets: [
        { label: 'Foglia (20)', value: () => ({ keys: CHIAVI.slice(), k: 20 }) },
        { label: 'Un figlio (60)', value: () => ({ keys: CHIAVI.slice(), k: 60 }) },
        { label: 'Due figli (30)', value: () => ({ keys: CHIAVI.slice(), k: 30 }) },
        { label: 'Radice (50)', value: () => ({ keys: CHIAVI.slice(), k: 50 }) },
        {
          label: 'Casuale',
          value: () => {
            const a = ASD.randomDistinct(10, 1, 99);
            return { keys: a, k: a[ASD.randInt(0, 9)] };
          },
        },
      ],
    });
    const st = ASD.stepper(host, {
      id: 'bst-cancella',
      title: 'Cancellazione da un BST',
      code: { src: 'strutture/bst_operazioni', region: 'cancella' },
      input,
      view: (stage) => new T.Stage(stage),
      trace: T.trace.cancella,
      counters: [{ key: 'nodi esaminati', label: 'nodi esaminati' }],
      legend: [
        { k: 'active', label: 'chiamata in corso' },
        { k: 'compare', label: 'confronto' },
        { k: 'key', label: 'successore / chi prende il posto' },
        { k: 'swap', label: 'nodo cancellato' },
      ],
      validate: (inp, frames) => {
        const got = (frames[frames.length - 1].state.result || []).join(' ');
        const want = sorted(inp.keys.filter((x) => x !== inp.k)).join(' ');
        return got === want ? null : `simmetrica ${got}, attesa ${want}`;
      },
    });
    ui.k = T.field(st, { name: 'k', label: 'Cancella', type: 'number', value: st.value.k, min: 1, max: 99 });
  }

  function mountRuota(host) {
    let dir = 'sx';
    const ESEMPIO = [10, 5, 20, 15, 25, 30];
    const check = (keys, d) => {
      const r = T.fromKeys(keys);
      if (d === 'sx' && !r.right) throw new Error(`Per ruotare a sinistra la radice (${r.key}) deve avere un figlio destro.`);
      if (d === 'dx' && !r.left) throw new Error(`Per ruotare a destra la radice (${r.key}) deve avere un figlio sinistro.`);
    };
    const valid = (keys, d) => {
      try {
        check(keys, d);
        return true;
      } catch (_) {
        return false;
      }
    };
    const randomFor = (d) => {
      for (;;) {
        const a = ASD.randomDistinct(ASD.randInt(5, 8), 1, 99);
        if (valid(a, d)) return a;
      }
    };
    const st = ASD.stepper(host, {
      id: 'bst-ruota',
      title: 'Rotazione sulla radice',
      code: { src: 'strutture/bst_rotazioni', region: 'rotazioni' },
      input: {
        label: 'Chiavi',
        value: { keys: ESEMPIO.slice(), dir },
        parse: (s) => {
          const keys = T.parse.keys(s, { minLen: 2, maxLen: 12 });
          check(keys, dir);
          return { keys, dir };
        },
        format: (v) => v.keys.join(' '),
        presets: [
          { label: 'Esempio', value: () => ({ keys: dir === 'sx' ? ESEMPIO.slice() : [30, 20, 35, 10, 25, 5], dir }) },
          { label: 'Catena', value: () => ({ keys: dir === 'sx' ? [10, 20, 30] : [30, 20, 10], dir }) },
          { label: 'Casuale', value: () => ({ keys: randomFor(dir), dir }) },
        ],
      },
      view: (stage) => new T.Stage(stage),
      trace: T.trace.ruota,
      legend: [
        { k: 'active', label: 'x' },
        { k: 'key', label: 'y' },
        { k: 'compare', label: 'β, che cambia padre' },
      ],
      validate: (inp, frames) => {
        const r = frames[frames.length - 1].state.result;
        if (!r) return 'manca il risultato';
        const root = T.fromKeys(inp.keys);
        if (r.impossible) return valid(inp.keys, inp.dir) ? 'rotazione possibile ma segnata come impossibile' : null;
        if (r.ino.join(' ') !== sorted(inp.keys).join(' ')) return 'la simmetrica è cambiata';
        const want = inp.dir === 'sx' ? root.right.key : root.left.key;
        return r.root === want ? null : `nuova radice ${r.root}, attesa ${want}`;
      },
    });
    st.o.extraInputs = () => [{ keys: [10, 20, 30], dir: 'sx' }, { keys: [30, 20, 10], dir: 'dx' }, { keys: [30, 20, 35, 10, 25, 5], dir: 'dx' }];
    T.headChoice(st, {
      legend: 'Rotazione',
      value: dir,
      options: [
        { v: 'sx', label: 'a sinistra' },
        { v: 'dx', label: 'a destra' },
      ],
      onChange: (v) => {
        dir = v;
        let keys = st.value.keys;
        if (!valid(keys, dir)) keys = dir === 'sx' ? ESEMPIO.slice() : [30, 20, 35, 10, 25, 5];
        st.inputEl.value = keys.join(' ');
        st.setInput({ keys, dir });
      },
    });
  }

  /* ------------------------------------------------------------ figure */

  function mountFigure(host) {
    const gal = h('div.tr-gallery');
    host.append(gal);
    const add = (root, title, text, o) => {
      const fig = h('figure.tr-fig.quadretti');
      const box = h('div');
      fig.append(box, h('figcaption', { html: `<strong>${title}</strong>${text}` }));
      gal.append(fig);
      const tv = new ASD.viz.TreeView(box, { r: 15, gap: 8, levelH: 50, pad: 12, ariaLabel: title });
      tv.render(T.state(root, o));
      T.fit(tv, 0.75);
    };
    add(T.fromKeys(CHIAVI), 'È un BST', 'per ogni nodo: a sinistra chiavi minori, a destra maggiori');
    const bad = T.fromLevel([10, 5, 15, 2, 12]);
    const ids = T.pre(bad);
    add(bad, 'Non è un BST', '12 &gt; 5 va bene per suo padre, ma 12 &gt; 10 e sta a sinistra di 10', {
      cls: { [ids[0].id]: 'compare', [ids[3].id]: 'swap' },
    });
  }

  /* ------------------------------------------------------------ laboratorio */

  function mountLab(host) {
    let root = T.fromKeys(CHIAVI);
    let last = { cls: {}, edges: {}, msg: 'Albero di partenza: le chiavi dell\'esempio inserite in ordine.' };

    const lab = h('div.lab.tr-lab');
    const body = h('div.lab-body.quadretti');
    const controls = h('div.lab-controls');
    const out = h('div.lab-out.tr-lab-out', { 'aria-live': 'polite' });
    lab.append(h('div.lab-head', h('h3', { text: 'Laboratorio: un BST da costruire e modificare' })), body, controls, out);
    host.append(lab);
    const empty = h('p.tr-empty', { text: 'Albero vuoto.', hidden: true });
    const treeBox = h('div');
    body.append(treeBox, empty);
    const tv = new ASD.viz.TreeView(treeBox, { r: 17, gap: 10, levelH: 58, pad: 18, ariaLabel: 'Albero binario di ricerca del laboratorio' });

    const idK = ASD.uid('tr-lab-k');
    const idS = ASD.uid('tr-lab-seq');
    const seq = h('input', { type: 'text', id: idS, value: CHIAVI.join(' '), class: 'tr-wide', spellcheck: 'false', autocomplete: 'off' });
    const kIn = h('input', { type: 'number', id: idK, value: '55', min: '1', max: '99', inputmode: 'numeric' });
    const btn = (text, fn, cls = '') => h('button.btn.btn-sm' + cls, { type: 'button', text, onclick: fn });
    const err = h('p.st-err', { role: 'alert', hidden: true });

    const row1 = h(
      'div.tr-ops',
      h('label.field', { for: idS }, 'Chiavi, nell\'ordine di inserimento', seq),
      btn('Costruisci', () => build()),
      h(
        'span.tr-ops-group',
        btn('Casuali', () => setKeys(ASD.randomDistinct(15, 1, 99)), '.btn-ghost'),
        btn('Crescenti', () => setKeys(CRESCENTI.slice()), '.btn-ghost'),
        btn('Bilanciate', () => setKeys(BILANCIATE.slice()), '.btn-ghost')
      )
    );
    const row2 = h(
      'div.tr-ops',
      h('label.field', { for: idK }, 'Chiave k', kIn),
      h(
        'span.tr-ops-group',
        btn('Inserisci', () => op('ins')),
        btn('Cerca', () => op('find')),
        btn('Cancella', () => op('del')),
        btn('Ruota a sinistra su k', () => op('rotl')),
        btn('Ruota a destra su k', () => op('rotr'))
      )
    );
    controls.append(h('div', { style: { display: 'grid', gap: '10px', minWidth: '0' } }, row1, row2, err));

    function setKeys(a) {
      seq.value = a.join(' ');
      build();
    }

    function build() {
      try {
        const keys = T.parse.keys(seq.value, { minLen: 1, maxLen: 20 });
        err.hidden = true;
        root = T.fromKeys(keys);
        tv.reset();
        last = { cls: {}, edges: {}, msg: `Costruito inserendo ${keys.length} chiavi nell'ordine scritto.` };
        draw();
      } catch (e) {
        err.textContent = e.message;
        err.hidden = false;
      }
    }

    function op(kind) {
      let key;
      try {
        key = T.parse.int(kIn, 'Chiave k');
        err.hidden = true;
      } catch (e) {
        err.textContent = e.message;
        err.hidden = false;
        return;
      }
      const cls = {};
      let edges = {};
      let msg = '';
      if (kind === 'find') {
        const r = B.path(root, key);
        for (const p of r.path) cls[p.id] = 'visited';
        edges = T.pathEdges(r.path);
        if (r.node) {
          cls[r.node.id] = 'found';
          msg = `Trovato ${key} a profondità ${r.path.length - 1}: esaminati ${r.path.length} nodi.`;
        } else msg = `${key} non c'è: la ricerca ha esaminato ${r.path.length} nodi ed è finita su nullptr.`;
      } else if (kind === 'ins') {
        if (T.size(root) >= 31) {
          msg = 'Al massimo 31 nodi in questo laboratorio.';
        } else {
          const r = B.insert(root, key);
          root = r.root;
          for (const p of r.path) cls[p.id] = 'visited';
          edges = T.pathEdges(r.path.concat(r.existed ? [] : [r.node]));
          cls[r.node.id] = r.existed ? 'found' : 'new';
          msg = r.existed
            ? `${key} c'era già: niente da fare (esaminati ${r.path.length} nodi).`
            : r.parent
            ? `Inserito ${key} come figlio ${r.parent.left === r.node ? 'sinistro' : 'destro'} di ${r.parent.key}, a profondità ${r.path.length}: è una foglia.`
            : `Inserito ${key}: è la radice.`;
        }
      } else if (kind === 'del') {
        const pathKeys = B.path(root, key).path.map(k);
        const r = B.remove(root, key);
        root = r.root;
        const byKey = {};
        for (const n of T.pre(root)) byKey[n.key] = n;
        for (const pk of pathKeys) if (byKey[pk]) cls[byKey[pk].id] = 'visited';
        if (r.caso === 'assente') msg = `${key} non c'è: l'albero non cambia.`;
        else if (r.caso === 'foglia') msg = `${key} era una foglia: tolto (caso 1).`;
        else if (r.caso === 'un figlio') {
          cls[r.child.id] = 'key';
          msg = `${key} aveva un solo figlio: ${r.child.key} ha preso il suo posto (caso 2).`;
        } else {
          cls[r.node.id] = 'new';
          msg = `${key} aveva due figli: al suo posto c'è il successore ${r.succ}, il minimo del sottoalbero destro (caso 3).`;
        }
      } else {
        const d = kind === 'rotl' ? 'sx' : 'dx';
        const h0 = T.height(root);
        const r = B.rotate(root, key, d);
        if (!r.ok) msg = r.msg;
        else {
          root = r.root;
          cls[r.up.id] = 'key';
          const x = B.path(root, key).node;
          if (x) cls[x.id] = 'active';
          msg = `Rotazione ${d === 'sx' ? 'a sinistra' : 'a destra'} su ${key}: ${r.up.key} è salito al suo posto. Altezza dell'albero: ${h0} → ${T.height(root)}. La simmetrica non cambia.`;
        }
      }
      last = { cls, edges, msg };
      draw();
    }

    function draw() {
      const n = T.size(root);
      const hh = T.height(root);
      treeBox.hidden = !root;
      empty.hidden = Boolean(root);
      if (root) {
        tv.render(T.state(root, { cls: last.cls, edges: last.edges }));
        T.fit(tv, 0.7);
      }
      const lo = n ? Math.floor(Math.log2(n)) : 0;
      out.innerHTML =
        `<p>${last.msg}</p>` +
        `<p><strong>n = ${n}</strong>, altezza <strong>h = ${hh}</strong>. Con ${n} nodi l'altezza sta tra ${m(`⌊log_2 ${n}⌋ = ${lo}`)} e ${m(`n - 1 = ${Math.max(0, n - 1)}`)}${
          n > 2 && hh === n - 1 ? ': è una catena, il caso peggiore.' : n > 2 && hh === lo ? ': è il minimo possibile.' : '.'
        }</p>` +
        `<p class="tr-lab-sum">Visita simmetrica: ${T.keys(T.ino(root)).join(' ') || '(vuota)'}</p>`;
    }
    draw();
  }

  /** Altezza media di BST costruiti con permutazioni casuali, contro ⌊log₂ n⌋. */
  function mountCasuali(host) {
    const lab = h('div.lab');
    const body = h('div.lab-body');
    const controls = h('div.lab-controls');
    const out = h('div.lab-out', { 'aria-live': 'polite' });
    lab.append(h('div.lab-head', h('h3', { text: 'Quanto sono alti i BST costruiti a caso?' })), body, controls, out);
    host.append(lab);
    const id = ASD.uid('tr-casuali-n');
    const nIn = h('input', { type: 'range', id, min: '100', max: '1000', step: '100', value: '500', oninput: () => draw() });
    const nOut = h('output', { for: id });
    const again = h('button.btn.btn-sm', { type: 'button', text: 'Rifai le prove', onclick: () => draw() });
    controls.append(h('label.slider', { for: id }, h('span', 'n massimo'), nIn, nOut), again);
    const plot = new ASD.viz.Plot(body, {
      x: { min: 0, max: 500, label: 'n', integer: true },
      y: { min: 0, label: 'altezza' },
      height: 280,
      ariaLabel: 'Altezza media di un BST costruito con chiavi in ordine casuale, confrontata con log2 n',
    });

    const heightOfRandom = (n) => {
      const a = ASD.shuffle(Array.from({ length: n }, (_, i) => i + 1));
      // inserimento iterativo con profondità, senza nodi: basta tenere i figli in due mappe
      const L = new Int32Array(n + 2);
      const R = new Int32Array(n + 2);
      let hmax = 0;
      const r = a[0];
      for (let i = 1; i < n; i++) {
        const key = a[i];
        let t = r;
        let d = 0;
        for (;;) {
          d++;
          if (key < t) {
            if (!L[t]) {
              L[t] = key;
              break;
            }
            t = L[t];
          } else {
            if (!R[t]) {
              R[t] = key;
              break;
            }
            t = R[t];
          }
        }
        if (d > hmax) hmax = d;
      }
      return hmax;
    };

    function draw() {
      const N = Number(nIn.value);
      nOut.textContent = String(N);
      const pts = [];
      const step = Math.max(10, Math.round(N / 20));
      for (let n = step; n <= N; n += step) {
        let sum = 0;
        for (let k2 = 0; k2 < 30; k2++) sum += heightOfRandom(n);
        pts.push([n, sum / 30]);
      }
      plot.o.x.max = N;
      plot.set({
        series: [
          { id: 'min', label: '⌊log₂ n⌋', slot: 6, fn: (n) => (n >= 1 ? Math.floor(Math.log2(n)) : 0), dashed: true },
          { id: 'mis', label: 'media', slot: 1, points: pts, line: true },
        ],
      });
      const lastP = pts[pts.length - 1];
      const ratio = lastP[1] / Math.log2(lastP[0]);
      out.innerHTML = `<p style="margin:0">I punti sono le altezze medie misurate, il tratteggio è il minimo possibile ${m('⌊log_2 n⌋')}. Con <var>n</var> = ${lastP[0]} l'altezza media è <strong>${ASD.fmt(
        Math.round(lastP[1] * 10) / 10
      )}</strong>, circa ${ASD.fmt(Math.round(ratio * 10) / 10)} volte ${m(`log_2 n ≈ ${ASD.fmt(Math.round(Math.log2(lastP[0]) * 10) / 10)}`)}. La catena avrebbe altezza ${m(
        `n - 1 = ${lastP[0] - 1}`
      )}: fuori dal grafico di parecchio.</p>`;
    }
    draw();
  }

  /* ---------------------------------------------------------------- quiz */

  function mountQuiz(host) {
    ASD.quiz(host, [
      {
        q: 'Inserisci in un BST vuoto, in quest\'ordine, <code>50 30 70 20 40 60 80</code>, poi cancella 50 usando il successore. Quale chiave c\'è nella radice?',
        options: ['40', '60', '70', '30'],
        answer: 1,
        explain: `50 ha due figli: si copia nella radice il successore, il minimo del sottoalbero destro (70 → 60, che non ha
        figlio sinistro), e si cancella 60 dal sottoalbero destro, dove è una foglia. Con il predecessore sarebbe 40.`,
      },
      {
        q: 'In un BST con chiavi da 1 a 100 si cerca 55. Quale sequenza di nodi esaminati è <strong>impossibile</strong>?',
        options: [
          '<code>20, 80, 30, 70, 50, 60, 55</code>',
          '<code>90, 10, 85, 20, 70, 95, 55</code>',
          '<code>50, 75, 60, 52, 58, 55</code>',
          '<code>10, 30, 60, 40, 50, 56, 55</code>',
        ],
        answer: 1,
        explain: `Dopo 70 la ricerca di 55 va a sinistra: da lì in poi tutte le chiavi devono essere minori di 70, invece arriva
        95. Nelle altre sequenze ogni nodo rispetta l'intervallo lasciato dai precedenti (per esempio nella prima: dopo 20
        sopra 20, dopo 80 sotto 80, e così via).`,
      },
      {
        q: 'Un BST contiene 1000 chiavi. Fra quali valori è compresa la sua altezza?',
        options: ['tra 9 e 999', 'tra 10 e 1000', 'tra 9 e 500', 'è sempre 9 o 10'],
        answer: 0,
        explain: `${m('⌊log_2 1000⌋ = 9')} (un albero di altezza 9 contiene fino a 1023 nodi) e ${m('n - 1 = 999')} per una
        catena. Un BST non bilanciato non dà garanzie: dipende dall'ordine degli inserimenti.`,
      },
      {
        q: 'Si inseriscono in un BST vuoto le chiavi <code>1, 2, 3, …, n</code> in questo ordine. Quanto costa in tutto?',
        options: [m('Θ(n)'), m('Θ(n log n)'), m('Θ(n^2)'), m('Θ(log n)')],
        answer: 2,
        explain: `Ogni chiave diventa figlio destro della precedente: la <var>i</var>-esima scende lungo una catena di
        ${m('i - 1')} nodi. Totale ${m('0 + 1 + … + (n - 1) = n(n-1)/2 = Θ(n^2)')}.`,
      },
      {
        q: 'Il nodo con chiave 45 non ha figlio destro. Dove si trova il suo successore?',
        options: [
          'nel minimo del sottoalbero sinistro',
          'nel primo antenato di cui 45 sta nel sottoalbero sinistro',
          'nel padre di 45, sempre',
          'non esiste',
        ],
        answer: 1,
        explain: `Senza figlio destro, nessuna chiave sotto 45 è più grande. Si risale: finché si arriva da destra, i nodi
        incontrati sono più piccoli; il primo nodo a cui si arriva da sinistra è più grande di 45 e minore di tutto il resto.
        Il padre va bene solo se 45 ne è il figlio sinistro. Se un antenato così non c'è, 45 è il massimo e il successore non
        esiste.`,
      },
      {
        q: 'Quali affermazioni su <code>std::set&lt;int&gt;</code> sono vere?',
        options: [
          '<code>insert</code>, <code>find</code> ed <code>erase</code> costano O(log n) anche nel caso peggiore',
          'scorrendolo con un <code>for</code> le chiavi escono in ordine crescente',
          'può contenere due volte la stessa chiave',
          'una rotazione dopo un inserimento costa O(n)',
        ],
        answer: [0, 1],
        explain: `<code>std::set</code> è un BST bilanciato (di solito rosso-nero): altezza ${m('O(log n)')} garantita, e la
        scansione è una visita simmetrica. Le chiavi ripetute si ignorano (per quelle c'è <code>std::multiset</code>). Una
        rotazione cambia tre puntatori: ${m('O(1)')}.`,
      },
    ]);
  }
})();
