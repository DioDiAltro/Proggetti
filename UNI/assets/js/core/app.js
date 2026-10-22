/* ASD a quadretti — l'applicazione: indice, navigazione tra capitoli, progressi.
   Va caricato per ultimo, dopo che tutti i capitoli si sono registrati.

   Indirizzi: #id-capitolo oppure #id-capitolo--id-sezione (solo lettere, cifre
   e trattini: è il formato che funziona anche dentro un Artifact). */
(function () {
  'use strict';

  const { h } = ASD;
  const main = document.getElementById('contenuto');
  const sidebarNav = document.getElementById('nav');
  const dialog = document.getElementById('nav-dialog');
  const dialogNav = document.getElementById('nav-dialog-list');
  const crumb = document.getElementById('crumb');
  const progressEl = document.getElementById('progress');
  const cache = new Map();
  let currentId = null;
  let firstRender = true;

  document.documentElement.lang = 'it';

  /* ------------------------------------------------------------ progressi */

  const getProgress = () => ASD.store.get('progress', {});

  function setProgress(id, state) {
    const p = getProgress();
    if (state) p[id] = state;
    else delete p[id];
    ASD.store.set('progress', p);
    refreshNav();
  }

  ASD.progress = { get: getProgress, set: setProgress };

  /* --------------------------------------------------------------- indice */

  function buildNav(container) {
    const frag = document.createDocumentFragment();
    for (const part of ASD.parts) {
      const list = h('ol');
      for (const ch of part.chapters) {
        const ready = Boolean(ASD.chapters[ch.id]);
        const a = h(
          'a.nav-link' + (ready ? '' : '.is-todo'),
          { href: '#' + ch.id, dataset: { id: ch.id, title: normalize(ch.title) } },
          h('span.sq', { 'aria-hidden': 'true' }),
          h('span', { text: ch.title }),
          ready ? null : h('span.visually-hidden', { text: ' (in preparazione)' })
        );
        list.append(h('li', a));
      }
      const title = h('h2.nav-part-title');
      if (part.n) title.append(h('span.n', { text: 'Parte ' + part.n }));
      title.append(document.createTextNode(part.title));
      frag.append(
        h('div.nav-part', { dataset: { part: part.id } }, h('div.nav-part-head', title, h('span.nav-part-count', { 'aria-hidden': 'true' })), list)
      );
    }
    container.replaceChildren(frag);
  }

  function normalize(s) {
    return String(s)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }

  function refreshNav() {
    const p = getProgress();
    for (const a of document.querySelectorAll('.nav-link')) {
      const id = a.dataset.id;
      if (id === currentId) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
      const sq = a.querySelector('.sq');
      sq.className = 'sq' + (p[id] ? ' ' + p[id] : '');
    }
    for (const box of document.querySelectorAll('.nav-part')) {
      const part = ASD.parts.find((x) => x.id === box.dataset.part);
      const done = part.chapters.filter((c) => p[c.id] === 'fatto').length;
      box.querySelector('.nav-part-count').textContent = `${done}/${part.chapters.length}`;
    }
    const all = ASD.flatChapters();
    const done = all.filter((c) => p[c.id] === 'fatto').length;
    if (progressEl) {
      const squares = h('span.progress-squares', { 'aria-hidden': 'true' });
      for (const part of ASD.parts) {
        if (!part.n) continue;
        const pd = part.chapters.filter((c) => p[c.id] === 'fatto').length;
        squares.append(h('i' + (pd === part.chapters.length ? '.on' : '')));
      }
      progressEl.replaceChildren(squares, h('span', { text: `${done} di ${all.length} capitoli fatti` }));
    }
  }

  function bindFilter(input, container) {
    input.addEventListener('input', () => {
      const q = normalize(input.value.trim());
      for (const box of container.querySelectorAll('.nav-part')) {
        let any = false;
        for (const a of box.querySelectorAll('.nav-link')) {
          const hit = !q || a.dataset.title.includes(q);
          a.parentElement.hidden = !hit;
          any = any || hit;
        }
        box.hidden = !any;
      }
    });
  }

  /* ------------------------------------------------------------- capitoli */

  function slug(s) {
    return normalize(s)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);
  }

  function buildChapter(meta) {
    const def = ASD.chapters[meta.id];
    const part = meta.part;
    const art = h('article.chapter', { dataset: { chapter: meta.id } });
    const head = h('header.ch-head');
    head.append(h('p.eyebrow', { text: part.n ? `Parte ${part.n} · ${part.title}` : part.title }));
    const h1 = h('h1', { tabindex: '-1', text: (def && def.title) || meta.title });
    head.append(h1);

    if (!def) {
      art.append(head);
      art.append(
        h(
          'div.todo-note',
          h('p', h('strong', 'Capitolo in preparazione.')),
          h('p', { text: meta.todo || '' })
        )
      );
      art.append(buildFoot(meta, false));
      return art;
    }

    if (def.lead) head.append(h('p.lead', { html: def.lead }));
    const metaList = h('ul.ch-meta');
    if (def.minutes) metaList.append(h('li', { html: ASD.icon('clock') + `<span>${def.minutes} minuti</span>` }));
    if (def.prereq && def.prereq.length) {
      metaList.append(h('li', { html: 'Prima leggi: ' + def.prereq.map((id) => ASD.link(id)).join(', ') }));
    }
    if (metaList.children.length) head.append(metaList);
    if (def.goals && def.goals.length) {
      const goals = h('div.goals', h('h2', { text: 'Cosa impari' }));
      const ul = h('ul');
      for (const g of def.goals) ul.append(h('li', { html: g }));
      goals.append(ul);
      head.append(goals);
    }
    art.append(head);

    const body = h('div.prose.ch-body');
    const layout = h('div.ch-layout', body);
    art.append(layout);
    try {
      def.render(body, { id: meta.id, part, article: art });
    } catch (err) {
      console.error(`[ASD] errore nel capitolo "${meta.id}"`, err);
      body.append(h('p.box.box-errore', { text: 'Errore nel caricare il capitolo: ' + err.message }));
    }

    // sezioni: id stabili e indice "In questo capitolo"
    const sections = [...body.querySelectorAll(':scope > section')];
    const toc = h('nav.ch-toc', { 'aria-label': 'In questo capitolo' }, h('h2', { text: 'In questo capitolo' }));
    const tocList = h('ol');
    for (const sec of sections) {
      const h2 = sec.querySelector('h2');
      if (!h2) continue;
      const local = sec.id ? sec.id.replace(meta.id + '--', '') : slug(h2.textContent);
      sec.id = meta.id + '--' + local;
      tocList.append(h('li', h('a', { href: '#' + sec.id, text: h2.textContent })));
    }
    if (tocList.children.length > 2 && def.toc !== false) {
      toc.append(tocList);
      layout.append(toc);
      watchToc(body, toc);
    }

    art.append(buildFoot(meta, true));
    return art;
  }

  function watchToc(body, toc) {
    if (!('IntersectionObserver' in window)) return;
    const links = new Map([...toc.querySelectorAll('a')].map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          for (const [id, a] of links) {
            const on = id === e.target.id;
            a.classList.toggle('is-current', on);
            if (on) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
          }
        }
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    for (const sec of body.querySelectorAll(':scope > section[id]')) io.observe(sec);
  }

  function buildFoot(meta, ready) {
    const list = ASD.flatChapters();
    const idx = list.findIndex((c) => c.id === meta.id);
    const prev = list[idx - 1];
    const next = list[idx + 1];
    const foot = h('footer.ch-foot');
    if (ready && meta.id !== 'home') {
      const btn = h('button.btn', { type: 'button' });
      const sync = () => {
        const done = getProgress()[meta.id] === 'fatto';
        btn.setAttribute('aria-pressed', String(done));
        btn.innerHTML = done ? ASD.icon('check') + '<span>Capitolo fatto</span>' : '<span>Segna come fatto</span>';
      };
      btn.addEventListener('click', () => {
        const done = getProgress()[meta.id] === 'fatto';
        setProgress(meta.id, done ? 'visto' : 'fatto');
        sync();
      });
      sync();
      foot.append(h('div.done-row', btn, h('span', { text: 'Il quadretto nell\'indice si riempie: così sapete dove eravate rimasti.' })));
    }
    const pager = h('nav.pager', { 'aria-label': 'Capitolo precedente e successivo' });
    if (prev) pager.append(h('a.prev', { href: '#' + prev.id }, h('span', { text: 'Precedente' }), h('strong', { text: prev.title })));
    else pager.append(h('span'));
    if (next) pager.append(h('a.next', { href: '#' + next.id }, h('span', { text: 'Successivo' }), h('strong', { text: next.title })));
    foot.append(pager);
    return foot;
  }

  /* ------------------------------------------------------------ navigazione */

  function parseHash() {
    let raw = '';
    try {
      raw = decodeURIComponent(location.hash.slice(1));
    } catch (_) {
      raw = location.hash.slice(1);
    }
    const [id, sec] = raw.split('--');
    return ASD.findChapter(id) ? { id, sec: sec || null } : { id: 'home', sec: null };
  }

  function show(id, sec) {
    const meta = ASD.findChapter(id) || ASD.findChapter('home');
    const changed = meta.id !== currentId;

    const swap = () => {
      if (changed) {
        if (currentId) {
          ASD.emit('leave', { id: currentId });
          const prevDef = ASD.chapters[currentId];
          if (prevDef && prevDef.onHide) prevDef.onHide(cache.get(currentId));
        }
        let node = cache.get(meta.id);
        if (!node) {
          node = buildChapter(meta);
          cache.set(meta.id, node);
        }
        main.replaceChildren(node, siteFoot());
        currentId = meta.id;
        const def = ASD.chapters[meta.id];
        if (def && def.onShow) def.onShow(node);
        const p = getProgress();
        if (!p[meta.id]) setProgress(meta.id, 'visto');
        else refreshNav();
        document.title = meta.id === 'home' ? 'ASD a quadretti' : `${(def && def.title) || meta.title} · ASD a quadretti`;
        if (crumb) crumb.textContent = meta.part.n ? `Parte ${meta.part.n} · ${meta.part.title}` : meta.part.title;
      }
    };

    const after = () => {
      const target = sec ? document.getElementById(meta.id + '--' + sec) : null;
      if (target) {
        target.scrollIntoView({ block: 'start' });
      } else if (changed) {
        window.scrollTo(0, 0);
      }
      if (changed && !firstRender) {
        const h1 = main.querySelector('h1');
        if (h1) h1.focus({ preventScroll: true });
      }
      firstRender = false;
    };

    if (changed && !firstRender && document.startViewTransition && ASD.motionOK()) {
      const t = document.startViewTransition(swap);
      t.updateCallbackDone.then(after, after);
    } else {
      swap();
      after();
    }
  }

  function siteFoot() {
    return h(
      'footer.site-foot',
      { html: 'ASD a quadretti · corso accelerato di algoritmi e strutture dati in C++. Gli esempi stanno nella cartella <code>esempi/</code> e si compilano con <code>g++ -std=c++17</code>.' }
    );
  }

  ASD.go = function (id, sec) {
    const hash = '#' + id + (sec ? '--' + sec : '');
    if (location.hash !== hash) {
      try {
        location.hash = hash;
        return;
      } catch (_) {
        /* in alcuni contesti l'hash non si può cambiare: si mostra comunque */
      }
    }
    show(id, sec);
  };

  /* ---------------------------------------------------------------- avvio */

  function boot() {
    const brand = document.getElementById('brand-mark');
    if (brand) brand.outerHTML = ASD.brandMark();
    buildNav(sidebarNav);
    if (dialogNav) buildNav(dialogNav);
    const filter = document.getElementById('nav-filter');
    if (filter) bindFilter(filter, sidebarNav);
    const filter2 = document.getElementById('nav-filter-2');
    if (filter2) bindFilter(filter2, dialogNav);

    const menuBtn = document.getElementById('menu-btn');
    if (menuBtn && dialog) {
      menuBtn.innerHTML = ASD.icon('menu');
      menuBtn.addEventListener('click', () => dialog.showModal());
      const closeBtn = document.getElementById('nav-close');
      closeBtn.innerHTML = ASD.icon('close');
      closeBtn.addEventListener('click', () => dialog.close());
      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.close();
        if (e.target.closest('a.nav-link')) dialog.close();
      });
    }

    window.addEventListener('hashchange', () => {
      const raw = location.hash.slice(1).split('--')[0];
      // un'ancora che non è un capitolo (per esempio #contenuto) non cambia pagina
      if (raw && !ASD.findChapter(raw)) return;
      const { id, sec } = parseHash();
      show(id, sec);
    });

    // il link "Vai al contenuto" sposta solo il fuoco, senza toccare l'indirizzo
    const skip = document.querySelector('.skip-link');
    if (skip) {
      skip.addEventListener('click', (e) => {
        e.preventDefault();
        main.focus();
      });
    }

    const { id, sec } = parseHash();
    show(id, sec);
    ASD.ready = true;
    ASD.emit('ready');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
