/* ASD a quadretti — verifica rapida a fine capitolo.

   ASD.quiz(el, [
     { q: 'Domanda (HTML)', code: 'frammento C++ facoltativo',
       options: ['A', 'B', 'C'], answer: 1, explain: 'Perché… (HTML)' },
     { q: 'Più risposte giuste', options: [...], answer: [0, 2], explain: '…' },
   ]);

   Ogni domanda si verifica da sola e mostra la spiegazione, giusta o
   sbagliata che sia la risposta: allo scritto conta il ragionamento. */
(function () {
  'use strict';

  const { h } = ASD;

  ASD.quiz = function quiz(host, questions, o = {}) {
    const list = h('ol.quiz');
    const score = h('p.quiz-score', { 'aria-live': 'polite' });
    const results = new Array(questions.length).fill(null);
    const base = ASD.uid(o.id || 'quiz');

    const updateScore = () => {
      const done = results.filter((r) => r !== null).length;
      const ok = results.filter((r) => r === true).length;
      score.textContent = done ? `Risposte giuste: ${ok} su ${questions.length}${done < questions.length ? ` (ne mancano ${questions.length - done})` : ''}.` : '';
    };

    questions.forEach((item, qi) => {
      const multi = Array.isArray(item.answer);
      const right = new Set(multi ? item.answer : [item.answer]);
      const name = `${base}-${qi}`;
      const fs = h('fieldset.quiz-q');
      const legend = h('legend');
      legend.innerHTML = `<span class="quiz-n">Domanda ${qi + 1} di ${questions.length}${multi ? ' · più risposte' : ''}</span>${item.q}`;
      fs.append(legend);
      if (item.code) {
        const box = h('div');
        fs.append(box);
        ASD.code(box, { code: item.code, file: item.file || 'frammento.cpp', run: false });
      }
      const opts = h('div.quiz-opts');
      const labels = item.options.map((opt, oi) => {
        const id = `${name}-${oi}`;
        const input = h('input', { type: multi ? 'checkbox' : 'radio', name, id, value: String(oi) });
        const text = h('span');
        text.innerHTML = opt;
        const tag = h('span.tag');
        const label = h('label.quiz-opt', { for: id }, input, text, tag);
        opts.append(label);
        return { label, input, tag, oi };
      });
      fs.append(opts);

      const fb = h('div.quiz-fb', { hidden: true, 'aria-live': 'polite' });
      const check = h('button.btn.btn-sm', { type: 'button', text: 'Verifica' });
      const reset = h('button.btn.btn-sm.btn-ghost', { type: 'button', text: 'Riprova', hidden: true });

      check.addEventListener('click', () => {
        const chosen = labels.filter((l) => l.input.checked).map((l) => l.oi);
        if (!chosen.length) {
          fb.className = 'quiz-fb';
          fb.innerHTML = '<p>Scegli almeno una risposta.</p>';
          fb.hidden = false;
          return;
        }
        const ok = chosen.length === right.size && chosen.every((c) => right.has(c));
        results[qi] = ok;
        for (const l of labels) {
          l.label.classList.remove('is-right', 'is-wrong');
          l.tag.textContent = '';
          if (right.has(l.oi)) {
            l.label.classList.add('is-right');
            l.tag.textContent = 'giusta';
          } else if (l.input.checked) {
            l.label.classList.add('is-wrong');
            l.tag.textContent = 'sbagliata';
          }
        }
        fb.className = 'quiz-fb ' + (ok ? 'ok' : 'no');
        fb.innerHTML = `<p><span class="verdict">${ok ? 'Giusto.' : 'Non proprio.'}</span>${item.explain || ''}</p>`;
        fb.hidden = false;
        reset.hidden = false;
        updateScore();
      });

      reset.addEventListener('click', () => {
        for (const l of labels) {
          l.input.checked = false;
          l.label.classList.remove('is-right', 'is-wrong');
          l.tag.textContent = '';
        }
        fb.hidden = true;
        reset.hidden = true;
        results[qi] = null;
        updateScore();
        labels[0].input.focus();
      });

      fs.append(h('div.quiz-actions', check, reset), fb);
      list.append(h('li', fs));
    });

    host.append(list, score);
    return { results };
  };
})();
