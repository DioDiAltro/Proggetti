/* ASD a quadretti — evidenziatore di sintassi per il C++.
   Piccolo e senza dipendenze: riconosce commenti, direttive del preprocessore,
   stringhe, numeri, parole chiave, tipi e chiamate di funzione. Restituisce
   una stringa HTML per ogni riga, così il pannello del codice può numerarle
   ed evidenziarle una per una. */
(function () {
  'use strict';

  const KW = new Set(
    ('alignas alignof asm break case catch class const consteval constexpr constinit const_cast continue ' +
      'decltype default delete do dynamic_cast else enum explicit export extern false final for friend goto if ' +
      'inline mutable namespace new noexcept nullptr operator override private protected public register ' +
      'reinterpret_cast return sizeof static static_assert static_cast struct switch template this throw true try ' +
      'typedef typeid typename union using virtual volatile while').split(' ')
  );

  const TYPES = new Set(
    ('auto bool char char16_t char32_t double float int long short signed unsigned void wchar_t size_t ' +
      'ptrdiff_t int8_t int16_t int32_t int64_t uint8_t uint16_t uint32_t uint64_t std string vector array list ' +
      'forward_list deque stack queue priority_queue set multiset map multimap unordered_set unordered_map ' +
      'unordered_multiset unordered_multimap pair tuple bitset optional function iterator const_iterator ' +
      'istream ostream ifstream ofstream stringstream istringstream ostringstream greater less numeric_limits').split(' ')
  );

  const BUILTIN = new Set(['cout', 'cin', 'cerr', 'endl']);

  const RE = {
    space: /[ \t]+/y,
    lineCom: /\/\/[^\n]*/y,
    blockCom: /\/\*[\s\S]*?(?:\*\/|$)/y,
    str: /"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?/y,
    num: /(?:0[xX][0-9a-fA-F']+|0[bB][01']+|(?:\d[\d']*\.?[\d']*|\.\d[\d']*)(?:[eE][+-]?\d+)?)[uUlLfF]*/y,
    ident: /[A-Za-z_]\w*/y,
    pre: /#[ \t]*\w*/y,
    header: /[ \t]*<[^>\n]*>/y,
    op: /::|->|\+\+|--|<<|>>|<=|>=|==|!=|&&|\|\||[-+*/%=<>!&|^~?:;,.()[\]{}]/y,
  };

  function at(re, src, i) {
    re.lastIndex = i;
    const m = re.exec(src);
    return m ? m[0] : null;
  }

  /** Divide il sorgente in token [tipo, testo]. Il tipo '' è testo neutro. */
  function tokenize(src) {
    const out = [];
    const n = src.length;
    let i = 0;
    let lineStart = true;
    while (i < n) {
      const c = src[i];
      let t;
      if (c === '\n') {
        out.push(['', '\n']);
        i++;
        lineStart = true;
        continue;
      }
      if ((t = at(RE.space, src, i))) {
        out.push(['', t]);
        i += t.length;
        continue;
      }
      if (lineStart && c === '#') {
        t = at(RE.pre, src, i);
        out.push(['pre', t]);
        i += t.length;
        lineStart = false;
        if (/include/.test(t)) {
          const hdr = at(RE.header, src, i);
          if (hdr) {
            out.push(['str', hdr]);
            i += hdr.length;
          }
        }
        continue;
      }
      lineStart = false;
      if ((t = at(RE.lineCom, src, i)) || (t = at(RE.blockCom, src, i))) {
        out.push(['com', t]);
        i += t.length;
        continue;
      }
      if ((c === '"' || c === "'") && (t = at(RE.str, src, i))) {
        out.push(['str', t]);
        i += t.length;
        continue;
      }
      if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
        t = at(RE.num, src, i);
        out.push(['num', t]);
        i += t.length;
        continue;
      }
      if ((t = at(RE.ident, src, i))) {
        let type = KW.has(t) ? 'kw' : TYPES.has(t) ? 'type' : BUILTIN.has(t) ? 'fn' : '';
        if (!type) {
          let k = i + t.length;
          while (src[k] === ' ') k++;
          if (src[k] === '(') type = 'fn';
          else if (/^[A-Z][a-z]/.test(t)) type = 'type';
        }
        out.push([type, t]);
        i += t.length;
        continue;
      }
      if ((t = at(RE.op, src, i))) {
        out.push(['op', t]);
        i += t.length;
        continue;
      }
      out.push(['', c]);
      i++;
    }
    return out;
  }

  /** Restituisce un array con l'HTML di ogni riga. */
  ASD.highlight = function (src) {
    const lines = [''];
    for (const [type, text] of tokenize(String(src))) {
      const parts = text.split('\n');
      parts.forEach((part, k) => {
        if (k > 0) lines.push('');
        if (!part) return;
        const safe = ASD.esc(part);
        lines[lines.length - 1] += type ? `<span class="tok-${type}">${safe}</span>` : safe;
      });
    }
    return lines;
  };

  ASD.tokenizeCpp = tokenize;
})();
