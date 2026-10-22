/* ASD a quadretti — pagina iniziale. In alto un insertion sort che gira da
   solo sul foglio a quadretti, con la riga di codice evidenziata e i passi
   contati: in piccolo, è quello che il sito fa in ogni capitolo. */
(function () {
  'use strict';

  const { h } = ASD;

  let hero = null;

  ASD.chapter({
    id: 'home',
    title: 'ASD a quadretti',
    toc: false,
    render(el, ctx) {
      // la pagina iniziale non usa l'intestazione standard del capitolo
      const head = ctx.article.querySelector('.ch-head');
      if (head) head.remove();

      el.innerHTML = `
<div class="hero">
  <div class="hero-text">
    <p class="eyebrow">Algoritmi e strutture dati · in C++</p>
    <h1 class="hero-title" tabindex="-1">ASD <em>a quadretti</em></h1>
    <p class="hero-lead">Il corso accelerato per l'esame: il C++ che serve, gli algoritmi che si muovono riga per riga
    e un metodo per calcolare la complessità senza tirare a indovinare.</p>
    <div class="hero-cta">
      <a class="btn btn-primary" href="#cpp-basi">${ASD.icon('book')}<span>Comincia dal C++</span></a>
      <a class="btn" href="#cx-metodo">Calcolare la complessità</a>
    </div>
  </div>
  <div class="hero-sheet quadretti" aria-label="Esempio animato: insertion sort">
    <div data-mount="demo"></div>
    <p class="hero-note mano" aria-hidden="true">caso peggiore: ${ASD.mathHTML('n(n-1)/2')} confronti</p>
  </div>
</div>

<section id="come">
  <h2>Come usarlo in due</h2>
  <div class="cols tips">
    <div>
      <h3>Uno guida, l'altro prevede</h3>
      <p>Chi tiene il mouse fa avanzare la visualizzazione con <kbd>→</kbd>; l'altro, prima di ogni passo, dice ad alta voce
      cosa succederà. Se la previsione è sbagliata, tornate indietro con <kbd>←</kbd> e capite perché.</p>
    </div>
    <div>
      <h3>Prima a mano, poi al computer</h3>
      <p>Allo scritto non c'è il computer. Prendete un foglio a quadretti, eseguite l'algoritmo a mano su un array piccolo
      e solo dopo controllate con la visualizzazione: potete scrivere il vostro input.</p>
    </div>
    <div>
      <h3>Ogni capitolo finisce con una verifica</h3>
      <p>Poche domande, con la spiegazione anche quando la risposta è giusta. Quando un capitolo vi torna, segnatelo come
      fatto: il quadretto nell'indice si riempie.</p>
    </div>
  </div>
</section>

<section id="percorso">
  <h2>Il percorso</h2>
  <p>Le parti sono in ordine: ognuna usa quello che c'è prima. Se il C++ lo sapete già, saltate la parte 1 e tornateci
  quando serve; la parte 2, sulla complessità, non saltatela.</p>
  <div data-mount="percorso"></div>
</section>

<section id="prima">
  <h2>Prima di iniziare</h2>
  <p>Ogni esempio di codice è un programma C++ completo che si compila così com'è. Potete eseguirlo online con il pulsante
  <strong>Esegui online</strong> sopra il codice, oppure sul vostro computer: le istruzioni sono in
  ${ASD.link('setup')}. Tutti i programmi stanno anche nella cartella <code>UNI/esempi/</code> della repository.</p>
  ${ASD.box('nota', `Il sito funziona anche offline: basta aprire <code>UNI/index.html</code> con il browser. I progressi
  (i quadretti pieni) restano salvati nel browser che usate.`, 'Offline')}
</section>`;

      ASD.mount(el, {
        demo: (host) => {
          hero = ASD.stepper(host, {
            id: 'hero',
            title: 'Insertion sort',
            compact: true,
            code: { src: 'ordinamento/insertion_sort', region: 'sort', copy: false, run: false },
            view: (stage) => new ASD.viz.ArrayView(stage, { float: true, height: 130, maxSlot: 44 }),
            trace: (a) => ASD.sorting.trace.insertion(a),
            counters: [
              { key: 'confronti', label: 'confronti' },
              { key: 'spostamenti', label: 'spostamenti' },
            ],
            input: { value: ASD.randomDistinct(7, 5, 60) },
            loop: () => ASD.randomDistinct(7, 5, 60),
          });
        },
        percorso: mountPath,
      });
    },
    onShow() {
      if (hero && ASD.motionOK()) setTimeout(() => hero && !hero.playing && hero.play(), 600);
    },
    onHide() {
      if (hero) hero.pause();
    },
  });

  function mountPath(host) {
    const progress = ASD.progress ? ASD.progress.get() : {};
    const list = h('ol.path');
    for (const part of ASD.parts) {
      if (!part.n) continue;
      const chapters = h('ul.path-ch');
      for (const ch of part.chapters) {
        const ready = Boolean(ASD.chapters[ch.id]);
        const state = progress[ch.id];
        chapters.append(
          h(
            'li',
            h('span.sq' + (state ? '.' + state : ''), { 'aria-hidden': 'true' }),
            h('a', { href: '#' + ch.id, text: ch.title }),
            ready ? null : h('span.path-todo', { text: 'in preparazione' })
          )
        );
      }
      list.append(h('li.path-part', h('p.path-n', { text: 'Parte ' + part.n }), h('h3', { text: part.title }), chapters));
    }
    host.append(list);
  }
})();
