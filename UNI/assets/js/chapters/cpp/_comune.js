/* ASD a quadretti — utilità comuni ai capitoli della parte 1 "C++ essenziale".

   ASD.cpp.Memoria      modello della memoria che le tracce aggiornano riga per
                        riga (frame, variabili, heap, output); snap() produce lo
                        stato per ASD.viz.MemoryView ed evidenzia da solo quello
                        che è cambiato (hl) o è stato letto (read) dall'ultimo passo
   ASD.cpp.ConsoleView  il riquadro "Output" con le righe stampate da cout
   ASD.cpp.vista(o)     (stage) => vista composta: MemoryView (+ Output se o.console)
   ASD.cpp.term(testo)  messaggio del compilatore come appare nel terminale
   ASD.cpp.outputUguale(righe)  validate per lo Stepper: l'output finale è quello atteso */
(function () {
  'use strict';

  const { h } = ASD;
  const cpp = (ASD.cpp = ASD.cpp || {});

  const copy = (v) => JSON.parse(JSON.stringify(v));

  /** Trova un percorso ('main.x', 'main.v.dati', 'main.a[2]', 'h1', 'h1[0]', 'h1.next') in uno stato. */
  function locate(stack, heap, path) {
    const tok = String(path).match(/\[\d+\]|[^.[\]]+/g) || [];
    let obj = stack.find((f) => f.id === tok[0]);
    let inFrame = Boolean(obj);
    if (!obj) obj = heap.find((b) => b.id === tok[0]);
    if (!obj) return null;
    for (let i = 1; i < tok.length; i++) {
      const t = tok[i];
      if (t[0] === '[') return { holder: obj, index: Number(t.slice(1, -1)) };
      const list = inFrame ? flat(obj.vars) : obj.fields || [];
      inFrame = false;
      obj = list.find((v) => v.id === t);
      if (!obj) return null;
    }
    return { obj };
  }

  /** Le variabili di un frame, compresi i gruppi (blocchi interni). */
  function flat(vars) {
    const out = [];
    for (const v of vars || []) {
      if (v.group != null) out.push(...flat(v.vars));
      else out.push(v);
    }
    return out;
  }

  function removeFrom(vars, id) {
    const i = vars.findIndex((v) => v.id === id);
    if (i >= 0) {
      vars.splice(i, 1);
      return true;
    }
    return vars.some((v) => v.group != null && removeFrom(v.vars, id));
  }

  cpp.Memoria = class Memoria {
    constructor() {
      this.stack = [];
      this.heap = [];
      this.lines = [''];
      this.marks = new Set();
      this.reads = new Set();
      this.news = new Set();
      this.fresh = new Set();
    }

    /* ------------------------------------------------------------- frame */

    call(id, name, vars, extra) {
      const f = Object.assign({ id, name, vars: [] }, extra || {});
      this.stack.push(f);
      for (const v of vars || []) this.decl(v);
      return f;
    }

    ret() {
      return this.stack.pop();
    }

    top() {
      return this.stack[this.stack.length - 1];
    }

    frame(id) {
      return id == null ? this.top() : this.stack.find((f) => f.id === id);
    }

    /** Nota scritta a mano nella testata del frame ("ritorna 16"); null la toglie. */
    note(text, id) {
      const f = this.frame(id);
      if (f) f.note = text || undefined;
    }

    /** Stato del frame: 'out' (sta per uscire), null (predefinito). */
    state(cls, id) {
      const f = this.frame(id);
      if (f) f.cls = cls || undefined;
    }

    /* --------------------------------------------------------- variabili */

    /** Dichiara una variabile nel frame indicato (predefinito: la cima), o in un suo gruppo. */
    decl(v, frameId, groupId) {
      const f = this.frame(frameId);
      let list = f.vars;
      if (groupId != null) {
        const g = flatGroups(f.vars).find((x) => x.id === groupId);
        if (!g) throw new Error('Memoria: gruppo inesistente ' + groupId);
        list = g.vars;
      }
      list.push(v);
      this.marks.add(f.id + '.' + v.id);
      return v;
    }

    /** Toglie una variabile (fine del suo blocco). */
    drop(path) {
      const [fid, id] = String(path).split('.');
      const f = this.frame(fid);
      if (f) removeFrom(f.vars, id);
    }

    /** Apre un blocco interno: le variabili dichiarate dentro spariscono con ungroup. */
    group(id, title, frameId) {
      this.frame(frameId).vars.push({ group: title, id, vars: [] });
    }

    ungroup(id, frameId) {
      const f = this.frame(frameId);
      const i = f.vars.findIndex((v) => v.group != null && v.id === id);
      if (i >= 0) f.vars.splice(i, 1);
    }

    find(path) {
      return locate(this.stack, this.heap, path);
    }

    /** Cambia un valore: set('main.x', 5), set('main.p', { ptr: 'h1', value: '0x5a20' }), set('h2[1]', 7). */
    set(path, val) {
      const r = this.find(path);
      if (!r) throw new Error('Memoria: percorso inesistente ' + path);
      if (r.holder) r.holder.cells[r.index] = val;
      else if (val && typeof val === 'object') Object.assign(r.obj, val);
      else r.obj.value = val;
      this.marks.add(path);
    }

    get(path) {
      const r = this.find(path);
      if (!r) throw new Error('Memoria: percorso inesistente ' + path);
      return r.holder ? r.holder.cells[r.index] : r.obj.value;
    }

    /** Segna una casella come appena letta (azzurra nel passo successivo). */
    read(...paths) {
      for (const p of paths) this.reads.add(p);
    }

    /* -------------------------------------------------------------- heap */

    /** Nuovo blocco sullo heap. Con { first: true } è disegnato in cima: lo heap non ha un ordine,
        e una lista costruita inserendo in testa si legge meglio dall'alto in basso. */
    alloc(block, o) {
      if (o && o.first) this.heap.unshift(block);
      else this.heap.push(block);
      this.news.add(block.id);
      return block;
    }

    free(id, label) {
      const b = this.heap.find((x) => x.id === id);
      if (b) {
        b.freed = true;
        if (label) b.freedLabel = label;
      }
    }

    /** Toglie del tutto un blocco dal disegno. */
    discard(id) {
      const i = this.heap.findIndex((x) => x.id === id);
      if (i >= 0) this.heap.splice(i, 1);
    }

    /* ------------------------------------------------------------ output */

    print(str) {
      const parts = String(str).split('\n');
      this.lines[this.lines.length - 1] += parts[0];
      if (parts[0]) this.fresh.add(this.lines.length - 1);
      for (let i = 1; i < parts.length; i++) {
        this.lines.push(parts[i]);
        if (parts[i]) this.fresh.add(this.lines.length - 1);
      }
    }

    output() {
      const lines = this.lines.slice();
      if (lines[lines.length - 1] === '') lines.pop();
      return lines;
    }

    /* -------------------------------------------------------------- stato */

    snap() {
      const st = copy({ stack: this.stack, heap: this.heap });
      const apply = (paths, cls) => {
        for (const p of paths) {
          const r = locate(st.stack, st.heap, p);
          if (!r) continue;
          if (r.holder) {
            r.holder.cellCls = r.holder.cellCls || {};
            r.holder.cellCls[r.index] = cls;
          } else r.obj.cls = [].concat(r.obj.cls || [], cls);
        }
      };
      // letto e scritto nello stesso passo: conta la scrittura
      apply([...this.reads].filter((p) => !this.marks.has(p)), 'read');
      apply([...this.marks].filter((p) => !this.news.has(p)), 'hl');
      apply(this.news, 'new');
      st.out = this.output();
      st.outNew = [...this.fresh].filter((i) => i < st.out.length);
      this.marks.clear();
      this.reads.clear();
      this.news.clear();
      this.fresh.clear();
      return st;
    }
  };

  function flatGroups(vars) {
    const out = [];
    for (const v of vars || []) {
      if (v.group != null) out.push(v, ...flatGroups(v.vars));
    }
    return out;
  }

  /* ----------------------------------------------------------- l'output */

  cpp.ConsoleView = class ConsoleView {
    constructor(host, o = {}) {
      this.root = h('div.cpp-console');
      this.body = h('pre.cpp-console-body', { tabindex: '0', 'aria-label': o.title || 'Output del programma' });
      this.root.append(h('p.cpp-console-head', o.title || 'Output'), this.body);
      host.append(this.root);
    }

    render(lines, fresh) {
      const nuove = new Set(fresh || []);
      if (!lines || !lines.length) {
        this.body.replaceChildren(h('span.cpp-console-empty', 'ancora niente'));
        return;
      }
      this.body.replaceChildren(...lines.map((l, i) => h('span' + (nuove.has(i) ? '.is-new' : ''), l || ' ')));
    }
  };

  /** Vista per lo Stepper: la memoria e, se richiesto, l'output del programma. */
  cpp.vista = (o = {}) => (stage) => {
    const root = h('div.cpp-memwrap');
    stage.append(root);
    const mem = new ASD.viz.MemoryView(root, o);
    const con = o.console ? new cpp.ConsoleView(root, typeof o.console === 'object' ? o.console : {}) : null;
    return {
      mem,
      reset() {},
      render(st, f) {
        mem.render(st, f);
        if (con) con.render(st.out, st.outNew);
      },
    };
  };

  /** validate: l'output dell'ultimo fotogramma deve essere `righe` (spazi in fondo alle righe esclusi,
      come fa tools/check-cpp.mjs con i file .out). */
  cpp.outputUguale = (righe) => (input, frames) => {
    const out = (frames[frames.length - 1].state.out || []).map((l) => l.replace(/\s+$/, ''));
    const want = (typeof righe === 'function' ? righe(input) : righe).map((l) => l.replace(/\s+$/, ''));
    if (out.length !== want.length) return `output di ${out.length} righe invece di ${want.length}`;
    for (let i = 0; i < want.length; i++) if (out[i] !== want[i]) return `riga ${i + 1}: «${out[i]}» invece di «${want[i]}»`;
    return null;
  };

  /** ASD.quiz con una classe in più: il codice nelle risposte può andare a capo sui telefoni. */
  cpp.quiz = (host, questions, o) => {
    host.classList.add('cpp-quiz');
    return ASD.quiz(host, questions, o);
  };

  /** Output di un programma, come nel terminale (copiato dal file .out dell'esempio). */
  cpp.out = (text) => `<pre class="code-out" tabindex="0" aria-label="Output del programma"><code>${ASD.esc(text)}</code></pre>`;

  /** Messaggio del terminale: errori in rosso, avvisi in grassetto, righe di codice citate in grigio. */
  cpp.term = (text, label) =>
    `<pre class="cpp-term" tabindex="0"${label ? ` aria-label="${ASD.esc(label)}"` : ''}><code>${ASD.esc(text)
      .split('\n')
      .map((l) =>
        /(\berror:|ERROR:|Segmentation fault)/.test(l)
          ? `<b>${l}</b>`
          : /\bwarning:/.test(l)
            ? `<strong>${l}</strong>`
            : /^\s+(\d+ \||\|)/.test(l)
              ? `<i>${l}</i>`
              : l
      )
      .join('\n')}</code></pre>`;
})();
