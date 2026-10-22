/* ASD a quadretti — utilità comuni ai capitoli della parte "Tecniche di progetto"
   (algoritmi greedy, programmazione dinamica, problemi classici di PD).

   ASD.tecniche.key(i, j)                  → 'i,j': la chiave di una cella per TableView
   ASD.tecniche.INF                        → '∞': il valore "infinito" scritto in tabella
   ASD.tecniche.legend.table               → legenda dei colori delle tabelle di PD
   ASD.tecniche.coins.greedy(monete, R)    → monete date dal greedy, o null se non arriva a R
   ASD.tecniche.coins.best(monete, R)      → { k, usate } con la PD (k = Infinity se impossibile)
   ASD.tecniche.brute.knapsack(items, W)   → valore ottimo dello zaino 0/1 provando i 2^n sottoinsiemi
   ASD.tecniche.brute.lcs(X, Y)            → lunghezza della LCS provando le sottosequenze di X
   ASD.tecniche.brute.edit(X, Y)           → distanza di edit con una ricorsione memoizzata
   ASD.tecniche.brute.coins(monete, R)     → minimo numero di monete con una visita in ampiezza
   ASD.tecniche.isSubsequence(s, t)        → true se s si ottiene da t cancellando caratteri
   ASD.tecniche.radios(legend, items, fn)  → gruppo di chip a scelta singola (fieldset accessibile)
   ASD.tecniche.slider(label, o, fn)       → cursore con <label for> e <output>
   ASD.tecniche.vars(el, { '--x': 1 })     → imposta proprietà CSS personalizzate (h() non lo fa)

   I controlli "brute" sono volutamente diversi dagli algoritmi dei capitoli:
   servono ai validate() degli stepper per confrontare il risultato della
   tabella con un metodo indipendente. */
(function () {
  'use strict';

  const { h } = ASD;
  const T = (ASD.tecniche = ASD.tecniche || {});

  T.key = (i, j) => i + ',' + j;

  /** Proprietà CSS personalizzate: style.setProperty, perché Object.assign(el.style) le ignora. */
  T.vars = (el, map) => {
    for (const [k, v] of Object.entries(map)) el.style.setProperty(k, String(v));
    return el;
  };
  T.INF = '∞';

  T.legend = {
    table: [
      { k: 'active', label: 'cella in calcolo' },
      { k: 'compare', label: 'celle che legge' },
      { k: 'done', label: 'ricostruzione' },
      { k: 'hole', label: 'da calcolare' },
    ],
  };

  /* ------------------------------------------------------------- monete */

  T.coins = {
    /** Greedy: la moneta più grande che ci sta, finché si può. */
    greedy(monete, R) {
      const desc = monete.slice().sort((a, b) => b - a);
      const usate = [];
      let x = R;
      for (const c of desc) {
        while (x >= c) {
          usate.push(c);
          x -= c;
        }
      }
      return x === 0 ? usate : null;
    },
    /** PD: dp[x] = 1 + min dp[x - c]. Le monete si provano nell'ordine dato. */
    best(monete, R) {
      const dp = new Array(R + 1).fill(Infinity);
      const scelta = new Array(R + 1).fill(0);
      dp[0] = 0;
      for (let x = 1; x <= R; x++) {
        for (const c of monete) {
          if (c <= x && dp[x - c] + 1 < dp[x]) {
            dp[x] = dp[x - c] + 1;
            scelta[x] = c;
          }
        }
      }
      if (!Number.isFinite(dp[R])) return { k: Infinity, usate: null };
      const usate = [];
      for (let x = R; x > 0; x -= scelta[x]) usate.push(scelta[x]);
      return { k: dp[R], usate };
    },
  };

  /* -------------------------------------------- controlli indipendenti */

  T.isSubsequence = (s, t) => {
    let k = 0;
    for (const ch of t) if (k < s.length && s[k] === ch) k++;
    return k === s.length;
  };

  T.brute = {
    knapsack(items, W) {
      const n = items.length;
      let best = 0;
      for (let s = 0; s < 1 << n; s++) {
        let p = 0;
        let v = 0;
        for (let i = 0; i < n; i++) {
          if (s & (1 << i)) {
            p += items[i].p;
            v += items[i].v;
          }
        }
        if (p <= W) best = Math.max(best, v);
      }
      return best;
    },
    lcs(X, Y) {
      const m = X.length;
      let best = 0;
      for (let s = 0; s < 1 << m; s++) {
        let sub = '';
        for (let i = 0; i < m; i++) if (s & (1 << i)) sub += X[i];
        if (sub.length > best && T.isSubsequence(sub, Y)) best = sub.length;
      }
      return best;
    },
    edit(X, Y) {
      const memo = new Map();
      const d = (i, j) => {
        // distanza tra i suffissi X[i..] e Y[j..]: un'altra formulazione, dall'alto
        if (i === X.length) return Y.length - j;
        if (j === Y.length) return X.length - i;
        const k = i + ',' + j;
        if (memo.has(k)) return memo.get(k);
        const v = X[i] === Y[j] ? d(i + 1, j + 1) : 1 + Math.min(d(i + 1, j), d(i, j + 1), d(i + 1, j + 1));
        memo.set(k, v);
        return v;
      };
      return d(0, 0);
    },
    coins(monete, R) {
      // visita in ampiezza sugli importi: il livello in cui si raggiunge R
      const dist = new Map([[0, 0]]);
      let frontier = [0];
      while (frontier.length) {
        const next = [];
        for (const x of frontier) {
          if (x === R) return dist.get(x);
          for (const c of monete) {
            const y = x + c;
            if (y <= R && !dist.has(y)) {
              dist.set(y, dist.get(x) + 1);
              next.push(y);
            }
          }
        }
        frontier = next;
      }
      return Infinity;
    },
  };

  /* ------------------------------------------------------------ controlli */

  /**
   * Gruppo di chip a scelta singola: T.radios('Sistema di monete', [{ id, label }], (item) => …, 'id iniziale').
   * Restituisce { el, value() }.
   */
  T.radios = function (legend, items, onChange, initial) {
    const base = ASD.uid('tc-r');
    const fs = h('fieldset.tc-radios', h('legend', { text: legend }));
    let current = items.find((x) => x.id === initial) || items[0];
    const box = h('div.tc-radios-list');
    for (const it of items) {
      const id = base + '-' + it.id;
      const input = h('input', { type: 'radio', name: base, id, value: it.id, checked: it === current });
      input.addEventListener('change', () => {
        current = it;
        onChange(it);
      });
      box.append(h('label.chip', { for: id }, input, h('span', { html: it.label })));
    }
    fs.append(box);
    return { el: fs, value: () => current };
  };

  /** Cursore con etichetta collegata: T.slider('Importo', { min, max, value }, fn). */
  T.slider = function (label, o, onInput) {
    const id = ASD.uid('tc-s');
    const out = h('output', { for: id });
    const input = h('input', { type: 'range', id, min: String(o.min), max: String(o.max), step: String(o.step || 1), value: String(o.value) });
    const sync = () => {
      out.textContent = o.format ? o.format(Number(input.value)) : input.value;
    };
    input.addEventListener('input', () => {
      sync();
      onInput(Number(input.value));
    });
    sync();
    const el = h('label.slider', { for: id }, h('span', { text: label }), input, out);
    return { el, input, value: () => Number(input.value) };
  };
})();
