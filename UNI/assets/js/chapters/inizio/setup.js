/* ASD a quadretti — capitolo "Compilare ed eseguire": come far girare gli
   esempi online o sul proprio computer, come leggere gli errori. */
(function () {
  'use strict';

  const { h, box, table } = ASD;

  function mountComando(host) {
    const lab = h('div.lab');
    const ctr = h('div.lab-controls');
    const out = h('div.lab-out');
    lab.append(h('div.lab-head', h('h3', { text: 'Il comando giusto per te' })), ctr, out);
    host.append(lab);
    const base = ASD.uid('cmd');
    const osBox = h('fieldset.cx-mode', { style: { border: 0, padding: 0, margin: 0 } }, h('legend.visually-hidden', { text: 'Sistema operativo' }));
    let os = /Win/.test(navigator.platform || navigator.userAgent) ? 'win' : /Mac/.test(navigator.platform || navigator.userAgent) ? 'mac' : 'linux';
    const oses = [
      ['win', 'Windows'],
      ['mac', 'Mac'],
      ['linux', 'Linux'],
    ];
    for (const [id, label] of oses) {
      const iid = `${base}-${id}`;
      const input = h('input', { type: 'radio', name: base + '-os', id: iid, value: id, checked: id === os });
      input.addEventListener('change', () => {
        os = id;
        draw();
      });
      osBox.append(h('label.chip', { for: iid }, input, label));
    }
    const fileId = `${base}-file`;
    const file = h('input', { type: 'text', id: fileId, value: 'insertion_sort.cpp', spellcheck: 'false', autocomplete: 'off' });
    file.addEventListener('input', draw);
    const flags = [
      ['warn', '-Wall -Wextra', 'avvisi utili', true],
      ['opt', '-O2', 'ottimizza (per misurare i tempi)', false],
      ['dbg', '-g', 'informazioni per il debugger', false],
      ['san', '-fsanitize=address,undefined', 'trova errori di memoria (Mac e Linux)', false],
    ];
    const flagBox = h('div.cx-toggles', { role: 'group', 'aria-label': 'Opzioni del compilatore' });
    const checks = flags.map(([id, flag, label, on]) => {
      const iid = `${base}-${id}`;
      const input = h('input', { type: 'checkbox', id: iid, checked: on });
      input.addEventListener('change', draw);
      flagBox.append(h('label.chip', { for: iid, title: label }, input, h('code', { text: flag })));
      return { input, flag, id };
    });
    ctr.append(h('span.field', 'Sistema', osBox), h('label.field', { for: fileId }, 'File', file), h('span.field', 'Opzioni', flagBox));

    function draw() {
      const name = (file.value.trim() || 'programma.cpp').replace(/[^\w.\-/]/g, '');
      const exe = name.replace(/\.(cpp|cc|cxx)$/i, '') || 'programma';
      const fl = checks.filter((c) => c.input.checked && !(os === 'win' && c.id === 'san')).map((c) => c.flag);
      const cmd = `g++ -std=c++17 ${fl.join(' ')} ${name} -o ${exe}`.replace(/\s+/g, ' ');
      const run = os === 'win' ? `${exe}.exe` : `./${exe}`;
      const note = os === 'win' && checks.find((c) => c.id === 'san').input.checked
        ? '<p class="st-hint">Con MinGW su Windows <code>-fsanitize</code> non è disponibile: l\'opzione è stata tolta.</p>'
        : '';
      out.innerHTML = `<pre class="terminal"><span class="prompt">$ </span>${ASD.esc(cmd)}\n<span class="prompt">$ </span>${ASD.esc(run)}</pre>${note}`;
      const copy = h('button.btn.btn-sm', { type: 'button', html: ASD.icon('copy') + '<span>Copia il comando</span>' });
      copy.addEventListener('click', async () => {
        const label = copy.querySelector('span');
        try {
          await navigator.clipboard.writeText(cmd);
          label.textContent = 'Copiato';
        } catch (_) {
          label.textContent = 'Seleziona il testo e copia con Ctrl+C';
        }
        setTimeout(() => (label.textContent = 'Copia il comando'), 2200);
      });
      out.append(copy);
    }
    draw();
  }

  ASD.chapter({
    id: 'setup',
    title: 'Compilare ed eseguire',
    lead:
      'Ogni esempio del corso è un programma C++ completo. Si può eseguire online con un clic oppure sul vostro computer con g++: qui c\'è come fare, e come leggere gli errori quando qualcosa non va.',
    minutes: 15,
    goals: [
      'eseguire un esempio online con Compiler Explorer',
      'installare g++ su Windows, Mac o Linux',
      'compilare ed eseguire da terminale con le opzioni giuste',
      'leggere un messaggio d\'errore del compilatore partendo dal primo',
    ],

    render(el) {
      el.innerHTML = `
<section id="online">
  <h2>Il modo più veloce: online</h2>
  <p>Sopra ogni programma completo c'è il pulsante <strong>Esegui online</strong>: apre il codice su
  <a href="https://godbolt.org/" target="_blank" rel="noopener">Compiler Explorer</a> (godbolt.org) già pronto, con il
  compilatore g++ e le opzioni <code>-std=c++17 -Wall -O2</code>. L'output del programma compare nel riquadro di
  esecuzione; potete modificare il codice e lo vedrete ricompilato da solo.</p>
  ${box('nota', 'Online è perfetto per provare e modificare gli esempi. Per l\'esame conviene però saper compilare anche sul proprio computer: è lì che si fanno gli esercizi lunghi.', 'Quando usarlo')}
</section>

<section id="installare">
  <h2>Installare g++</h2>
  <h3>Windows</h3>
  <ol class="steps">
    <li>Scaricate e installate <strong>MSYS2</strong> da <a href="https://www.msys2.org/" target="_blank" rel="noopener">msys2.org</a>.</li>
    <li>Aprite il terminale <strong>MSYS2 UCRT64</strong> e installate il compilatore:
      <pre class="terminal"><span class="prompt">$ </span>pacman -S mingw-w64-ucrt-x86_64-gcc</pre></li>
    <li>Aggiungete <code>C:\\msys64\\ucrt64\\bin</code> alla variabile d'ambiente <code>Path</code> di Windows (Impostazioni → Sistema
    → Informazioni → Impostazioni di sistema avanzate → Variabili d'ambiente).</li>
    <li>Aprite un nuovo Prompt dei comandi e controllate:
      <pre class="terminal"><span class="prompt">&gt; </span>g++ --version</pre></li>
  </ol>
  <p>Se usate già MinGW o un ambiente come Code::Blocks o Dev-C++ (spesso installati nei laboratori dell'università), va bene
  lo stesso: sotto c'è sempre g++.</p>
  <h3>Mac</h3>
  <pre class="terminal"><span class="prompt">$ </span>xcode-select --install</pre>
  <p>Installa gli strumenti da riga di comando di Apple. Il comando <code>g++</code> in realtà chiama clang, che per il
  C++ di questo corso si comporta allo stesso modo.</p>
  <h3>Linux</h3>
  <pre class="terminal"><span class="prompt">$ </span>sudo apt install g++</pre>
</section>

<section id="compilare">
  <h2>Compilare ed eseguire</h2>
  <p>Compilare vuol dire tradurre il file <code>.cpp</code> in un programma eseguibile. Poi lo si lancia.</p>
  <div data-mount="comando"></div>
  ${table({
    head: ['Opzione', 'A cosa serve'],
    rows: [
      ['<code>-std=c++17</code>', 'usa lo standard C++17 (tutti gli esempi lo rispettano)'],
      ['<code>-Wall -Wextra</code>', 'attiva gli avvisi: molti errori di logica vengono segnalati prima di eseguire'],
      ['<code>-O2</code>', 'ottimizza il codice: da usare quando si misurano i tempi'],
      ['<code>-g</code>', 'aggiunge le informazioni per il debugger (gdb)'],
      ['<code>-fsanitize=address,undefined</code>', 'controlla a runtime accessi fuori dall\'array, memoria liberata due volte, perdite di memoria'],
      ['<code>-o nome</code>', 'il nome dell\'eseguibile (senza, si chiama <code>a.out</code> o <code>a.exe</code>)'],
    ],
  })}
</section>

<section id="errori">
  <h2>Leggere gli errori</h2>
  <p>Un messaggio del compilatore ha sempre la stessa forma: <code>file:riga:colonna: error: descrizione</code>.</p>
  <pre class="terminal">insertion_sort.cpp:14:9: error: 'key' was not declared in this scope
   14 |         a[j + 1] = key;
      |         ^~~</pre>
  <p>Si legge così: nel file <code>insertion_sort.cpp</code>, riga 14, colonna 9, il nome <code>key</code> non esiste in quel
  punto (per esempio è stato dichiarato dentro un blocco che si è già chiuso).</p>
  ${box('ricorda', `<p><strong>Si corregge sempre il primo errore</strong>, poi si ricompila. Un errore all'inizio (un <code>;</code>
  mancante) ne genera spesso decine di finti più sotto.</p>`)}
  ${table({
    caption: 'Gli errori più comuni',
    head: ['Messaggio (in breve)', 'Causa tipica'],
    rows: [
      ['<code>expected &#39;;&#39; before …</code>', 'manca un punto e virgola alla riga <em>precedente</em>'],
      ['<code>&#39;x&#39; was not declared in this scope</code>', 'variabile scritta male, dichiarata altrove, o manca un <code>#include</code>'],
      ['<code>no matching function for call to …</code>', 'argomenti del tipo sbagliato, o in numero sbagliato'],
      ['<code>comparison of integer expressions of different signedness</code>', 'avviso: confronto tra <code>int</code> e <code>size_t</code> (per esempio <code>i &lt; v.size()</code>); innocuo con indici piccoli'],
      ['<code>Segmentation fault</code> (durante l\'esecuzione)', 'accesso fuori da un array o puntatore non valido: ricompilate con <code>-g -fsanitize=address</code> per sapere dove'],
    ],
  })}
  ${box('nota', `<p>Se nel Prompt dei comandi di Windows le lettere accentate escono come simboli strani, eseguite prima
  <code>chcp 65001</code>: imposta il terminale su UTF-8. Per questo molti esempi scrivono <code>e'</code> invece di <code>è</code>.</p>`, 'Accenti su Windows')}
</section>

<section id="editor">
  <h2>Un editor</h2>
  <p>Qualsiasi editor va bene. Il più usato è <strong>Visual Studio Code</strong> con l'estensione C/C++ di Microsoft: colora
  il codice, segnala gli errori mentre scrivete e ha un terminale integrato dove lanciare i comandi di questa pagina.
  All'esame però spesso si scrive su carta: abituatevi anche a scrivere codice senza l'aiuto dell'editor.</p>
</section>`;
      ASD.mount(el, { comando: mountComando });
    },
  });
})();
