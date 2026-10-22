/* ASD a quadretti — utilità comuni ai capitoli liste, pile e code, hash: ASD.lin.

   ASD.lin.parseValues(testo, { min, max, minLen, maxLen })  → [8, 15, 23]
   ASD.lin.parseOps(testo, spec)          → [{ op: 'push', x: 3 }, { op: 'pop' }]
   ASD.lin.fmtOps(ops)                    → 'push 3, pop'
   ASD.lin.Model                          → lista concatenata per le tracce: nodi con
                                            id stabili, snap() produce lo stato per ListView
   ASD.lin.follow(stato, start)           → valori seguendo i next da start (per i validate)
   ASD.lin.HashSim                        → tabella hash simulata: liste di trabocco,
                                            scansione lineare, quadratica, doppio hashing
   ASD.lin.legend.*                       → legende pronte per gli stepper
   Tutti gli errori di input sono messaggi in italiano (li mostra lo Stepper). */
(function () {
  'use strict';

  const lin = (ASD.lin = ASD.lin || {});

  /* -------------------------------------------------------------- input */

  lin.parseValues = function (text, o = {}) {
    const { min = 0, max = 99, minLen = 0, maxLen = 8 } = o;
    const str = String(text).trim();
    if (!str) {
      if (minLen > 0) throw new Error(`Servono almeno ${minLen} valori.`);
      return [];
    }
    return ASD.parseNumbers(str, { min, max, minLen, maxLen });
  };

  /**
   * Sequenza di operazioni separate da virgole: "push 3, pop, push 5".
   * spec = { push: { words: ['push', '+'], arg: true }, pop: { words: ['pop', '-'] } }
   */
  lin.parseOps = function (text, spec, o = {}) {
    const { min = 0, max = 99, maxOps = 14 } = o;
    const parts = String(text)
      .split(/[,;\n]+/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (!parts.length) throw new Error('Scrivi almeno un\'operazione.');
    if (parts.length > maxOps) throw new Error(`Al massimo ${maxOps} operazioni, così si segue bene.`);
    return parts.map((p) => {
      const m = /^([a-zàèéìòù]+|[+\-?])\s*(-?\d+)?$/i.exec(p.replace(/\s+/g, ' '));
      if (!m) throw new Error(`"${p}" non è un'operazione valida.`);
      const word = m[1].toLowerCase();
      const op = Object.keys(spec).find((k) => spec[k].words.includes(word));
      if (!op) throw new Error(`"${m[1]}" non è un'operazione: usa ${Object.values(spec).map((v) => v.words[0]).join(', ')}.`);
      if (spec[op].arg) {
        if (m[2] == null) throw new Error(`"${p}": manca il numero.`);
        const x = Number(m[2]);
        if (x < min || x > max) throw new Error(`"${p}": i valori devono stare tra ${min} e ${max}.`);
        return { op, x };
      }
      if (m[2] != null) throw new Error(`"${p}": ${op} non vuole un numero.`);
      return { op };
    });
  };

  lin.fmtOps = (ops) => ops.map((o) => (o.x != null ? `${o.op} ${o.x}` : o.op)).join(', ');

  /* ------------------------------------------------- lista per le tracce */

  lin.Model = class Model {
    constructor(values = [], prefix = 'n') {
      this.nodes = {};
      this.k = 0;
      this.prefix = prefix;
      this.head = null;
      let prev = null;
      for (const v of values) {
        const id = this.add(v);
        if (prev) this.nodes[prev].next = id;
        else this.head = id;
        prev = id;
      }
    }

    add(val, next = null) {
      const id = this.prefix + this.k++;
      this.nodes[id] = { val, next };
      return id;
    }

    remove(id) {
      delete this.nodes[id];
    }

    order(start = this.head) {
      const out = [];
      const seen = new Set();
      let id = start;
      while (id != null && this.nodes[id] && !seen.has(id)) {
        seen.add(id);
        out.push(id);
        id = this.nodes[id].next;
      }
      return out;
    }

    values(start = this.head) {
      return this.order(start).map((id) => this.nodes[id].val);
    }

    /** Stato per ListView. o: { row, float, drop, ptrs, cls: { id: classe }, hot, nullAt, meta } */
    snap(o = {}) {
      const nodes = {};
      for (const [id, n] of Object.entries(this.nodes)) {
        const node = { val: n.val, next: n.next };
        if (n.prev !== undefined) node.prev = n.prev;
        if (o.cls && o.cls[id]) node.cls = o.cls[id];
        nodes[id] = node;
      }
      const st = { nodes, row: (o.row || this.order()).filter((id) => this.nodes[id]), ptrs: o.ptrs || {} };
      for (const k of ['float', 'drop', 'hot', 'nullAt', 'meta']) if (o[k] != null) st[k] = o[k];
      return st;
    }
  };

  /** Valori della lista nello stato di una vista, seguendo i next da start. */
  lin.follow = function (st, start) {
    const out = [];
    const seen = new Set();
    let id = start;
    while (id != null) {
      if (!st.nodes[id]) return { values: out, error: `puntatore a un nodo che non esiste (${id})` };
      if (seen.has(id)) return { values: out, error: 'la lista contiene un ciclo' };
      seen.add(id);
      out.push(st.nodes[id].val);
      id = st.nodes[id].next;
    }
    return { values: out, error: null };
  };

  lin.same = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

  /** Controllo finale di una traccia su lista: struttura da head = valori attesi. */
  lin.checkList = function (frames, expected, headName = 'head') {
    const st = frames[frames.length - 1].state;
    const r = lin.follow(st, st.ptrs[headName]);
    if (r.error) return r.error;
    if (!lin.same(r.values, expected)) return `lista finale ${r.values.join(',')} invece di ${expected.join(',')}`;
    const shown = (st.row || []).map((id) => st.nodes[id].val);
    if (!lin.same(shown, expected)) return `la riga disegnata (${shown.join(',')}) non segue i puntatori`;
    return null;
  };

  /* ------------------------------------------------------------ legende */

  lin.legend = {
    list: [
      { k: 'compare', label: 'nodo esaminato' },
      { k: 'key', label: 'nodo nuovo' },
      { k: 'swap', label: 'da togliere' },
      { k: 'done', label: 'trovato / fatto' },
    ],
    hash: [
      { k: 'compare', label: 'ispezione in corso' },
      { k: 'active', label: 'casella già ispezionata (col numero)' },
      { k: 'done', label: 'trovata' },
      { k: 'key', label: 'appena inserita' },
    ],
  };

  /* --------------------------------------------------- tabella hash simulata */

  const METHODS = {
    chain: 'liste di trabocco',
    linear: 'scansione lineare',
    quadratic: 'scansione quadratica',
    double: 'doppio hashing',
  };
  lin.hashMethods = METHODS;
  const DEL = 'DEL';

  /**
   * Tabella hash con chiavi intere >= 0, h(k) = k mod m.
   *   chain:     t[i] = array di chiavi, la testa per prima (inserimento in testa)
   *   linear:    h(k, i) = (h(k) + i) mod m
   *   quadratic: h(k, i) = (h(k) + i + 3i²) mod m       (c1 = 1, c2 = 3, come in Cormen 11.4-1)
   *   double:    h(k, i) = (h(k) + i·h2(k)) mod m, h2(k) = 1 + (k mod (m − 1))
   */
  lin.HashSim = class HashSim {
    constructor(method = 'chain', m = 7) {
      this.method = method;
      this.m = m;
      this.clear();
    }

    clear() {
      this.t = this.method === 'chain' ? Array.from({ length: this.m }, () => []) : new Array(this.m).fill(null);
      this.n = 0;
      this.keys = [];
    }

    h(k) {
      return k % this.m;
    }

    h2(k) {
      return 1 + (k % (this.m - 1));
    }

    probe(k, i) {
      const m = this.m;
      if (this.method === 'quadratic') return (this.h(k) + i + 3 * i * i) % m;
      if (this.method === 'double') return (this.h(k) + i * this.h2(k)) % m;
      return (this.h(k) + i) % m;
    }

    /** Formula della sequenza di ispezione, in testo. */
    formula(k) {
      const m = this.m;
      const hk = this.h(k);
      if (this.method === 'chain') return `h(${k}) = ${k} mod ${m} = ${hk}`;
      if (this.method === 'linear') return `h(${k}, i) = (${hk} + i) mod ${m}`;
      if (this.method === 'quadratic') return `h(${k}, i) = (${hk} + i + 3i²) mod ${m}`;
      return `h(${k}, i) = (${hk} + i·${this.h2(k)}) mod ${m}, con h₂(${k}) = 1 + ${k} mod ${m - 1} = ${this.h2(k)}`;
    }

    search(k) {
      if (this.method === 'chain') {
        const i = this.h(k);
        const chain = this.t[i];
        for (let p = 0; p < chain.length; p++) if (chain[p] === k) return { found: true, at: i, pos: p, cost: p + 1, probes: [i] };
        return { found: false, at: i, pos: null, cost: chain.length, probes: [i] };
      }
      const probes = [];
      for (let j = 0; j < this.m; j++) {
        const i = this.probe(k, j);
        probes.push(i);
        if (this.t[i] == null) return { found: false, at: null, cost: probes.length, probes, stop: 'empty' };
        if (this.t[i] === k) return { found: true, at: i, cost: probes.length, probes };
      }
      return { found: false, at: null, cost: probes.length, probes, stop: 'all' };
    }

    insert(k) {
      const s = this.search(k);
      if (s.found) return { ok: false, reason: 'dup', search: s, probes: s.probes, at: s.at, pos: s.pos };
      if (this.method === 'chain') {
        const i = this.h(k);
        this.t[i].unshift(k);
        this.n++;
        this.keys.push(k);
        return { ok: true, at: i, pos: 0, search: s, probes: [i], cost: s.cost };
      }
      const probes = [];
      for (let j = 0; j < this.m; j++) {
        const i = this.probe(k, j);
        probes.push(i);
        if (this.t[i] == null || this.t[i] === DEL) {
          this.t[i] = k;
          this.n++;
          this.keys.push(k);
          return { ok: true, at: i, search: s, probes, cost: probes.length };
        }
      }
      return { ok: false, reason: 'full', search: s, probes, cost: probes.length };
    }

    remove(k) {
      const s = this.search(k);
      if (!s.found) return { ok: false, search: s, probes: s.probes, cost: s.cost };
      if (this.method === 'chain') this.t[s.at].splice(s.pos, 1);
      else this.t[s.at] = DEL;
      this.n--;
      this.keys.splice(this.keys.indexOf(k), 1);
      return { ok: true, at: s.at, pos: s.pos, search: s, probes: s.probes, cost: s.cost };
    }

    alpha() {
      return this.n / this.m;
    }

    tombstones() {
      return this.method === 'chain' ? 0 : this.t.filter((v) => v === DEL).length;
    }

    /** Costo medio di una ricerca con successo sulle chiavi presenti. */
    avgHit() {
      if (!this.n) return 0;
      let tot = 0;
      for (const k of this.keys) tot += this.search(k).cost;
      return tot / this.n;
    }

    /** Lista più lunga (trabocco) o gruppo più lungo di caselle occupate consecutive (aperto). */
    longest() {
      if (this.method === 'chain') return Math.max(0, ...this.t.map((c) => c.length));
      let best = 0;
      for (let s = 0; s < this.m; s++) {
        if (this.t[s] == null) continue;
        let len = 0;
        while (len < this.m && this.t[(s + len) % this.m] != null) len++;
        best = Math.max(best, len);
      }
      return best;
    }

    snapshot() {
      return this.method === 'chain' ? this.t.map((c) => c.slice()) : this.t.slice();
    }
  };

  /** Il primo primo >= x (per il rehashing). */
  lin.nextPrime = function (x) {
    const isPrime = (v) => {
      if (v < 2) return false;
      for (let d = 2; d * d <= v; d++) if (v % d === 0) return false;
      return true;
    };
    let v = Math.max(2, Math.ceil(x));
    while (!isPrime(v)) v++;
    return v;
  };
})();
