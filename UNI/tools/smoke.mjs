#!/usr/bin/env node
/**
 * smoke.mjs — prova il sito in un browser vero (Chromium headless, Playwright).
 *
 * Per ogni capitolo dell'indice:
 *   - lo apre e raccoglie errori della console e della pagina;
 *   - fa girare ogni visualizzazione passo-passo dal primo all'ultimo fotogramma
 *     (gli errori di disegno e le etichette di codice inesistenti finiscono in console);
 *   - controlla che a 390 px di larghezza la pagina non scorra di lato.
 * Con --shots <cartella> salva gli screenshot (desktop chiaro, desktop scuro, telefono).
 *
 * Uso:  node tools/smoke.mjs                       tutti i capitoli
 *       node tools/smoke.mjs bst heap              solo alcuni
 *       node tools/smoke.mjs --shots /tmp/shots    con screenshot
 *       node tools/smoke.mjs --full                anche le pagine intere negli screenshot
 *
 * Playwright: se non è installato nel progetto viene cercato tra i moduli
 * globali di Node (NODE_PATH). Il proxy HTTPS dell'ambiente, se c'è, viene
 * usato per scaricare i caratteri da Google Fonts.
 */
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdirSync } from 'node:fs';
import { execSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

function loadPlaywright() {
  try {
    return require('playwright');
  } catch (_) {
    const globalRoot = execSync('npm root -g').toString().trim();
    return require(join(globalRoot, 'playwright'));
  }
}

const { chromium } = loadPlaywright();
const args = process.argv.slice(2);
const shotsIdx = args.indexOf('--shots');
const shots = shotsIdx >= 0 ? args[shotsIdx + 1] : null;
const full = args.includes('--full');
const only = args.filter((a, i) => !a.startsWith('--') && !(shotsIdx >= 0 && i === shotsIdx + 1));
if (shots) mkdirSync(shots, { recursive: true });

const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  proxy: proxy ? { server: proxy } : undefined,
});
const url = pathToFileURL(join(ROOT, 'index.html')).href;

async function newPage(opts) {
  // movimento ridotto: niente transizioni tra capitoli, gli screenshot non catturano dissolvenze a metà
  const ctx = await browser.newContext({ reducedMotion: 'reduce', ...opts });
  const page = await ctx.newPage();
  const problems = [];
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') {
      const t = m.text();
      if (/fonts\.(googleapis|gstatic)\.com|ERR_TUNNEL|ERR_PROXY|net::ERR/.test(t)) return;
      problems.push(`[console.${m.type()}] ${t}`);
    }
  });
  page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`));
  return { ctx, page, problems };
}

const main = await newPage({ viewport: { width: 1360, height: 900 } });
await main.page.goto(url + '#home', { waitUntil: 'load' });
await main.page.waitForFunction(() => window.ASD && window.ASD.ready, null, { timeout: 15000 });
const chapters = await main.page.evaluate(() =>
  ASD.flatChapters().map((c) => ({ id: c.id, ready: Boolean(ASD.chapters[c.id]) }))
);

const report = [];
for (const ch of chapters) {
  if (only.length && !only.includes(ch.id)) continue;
  const { page, problems } = main;
  problems.length = 0;
  await page.evaluate((id) => {
    location.hash = '#' + id;
  }, ch.id);
  await page.waitForFunction((id) => document.querySelector(`article[data-chapter="${id}"]`), ch.id, { timeout: 10000 });
  await page.waitForTimeout(150);
  const steppers = await page.evaluate((id) => {
    const art = document.querySelector(`article[data-chapter="${id}"]`);
    const list = ASD.steppers.filter((s) => art.contains(s.root));
    let frames = 0;
    for (const s of list) {
      s.pause();
      for (let i = 0; i < s.frames.length; i++) s.go(i);
      frames += s.frames.length;
      s.go(0);
    }
    return { count: list.length, frames };
  }, ch.id);
  await page.waitForTimeout(100);

  if (shots) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: join(shots, `${ch.id}-desktop.png`), fullPage: full });
  }
  const anchors = await page.evaluate((id) => {
    const art = document.querySelector(`article[data-chapter="${id}"]`);
    return {
      sections: [...art.querySelectorAll('section[id]')].map((s) => s.id),
      links: [...art.querySelectorAll('.ch-head a[href^="#"], .ch-body a[href^="#"]')].map((a) => a.getAttribute('href').slice(1)).filter(Boolean),
    };
  }, ch.id);
  report.push({ id: ch.id, ready: ch.ready, steppers, problems: [...problems], ...anchors });
}

// collegamenti interni: il capitolo deve esistere ed essere scritto, la sezione deve esistere
const known = new Map(report.map((r) => [r.id, r]));
const allIds = new Set(chapters.map((c) => c.id));
for (const r of report) {
  for (const href of new Set(r.links || [])) {
    const [cid, sec] = href.split('--');
    if (cid === 'contenuto') continue;
    if (!allIds.has(cid)) r.problems.push(`[link] #${href}: il capitolo "${cid}" non esiste`);
    else if (known.has(cid) && !known.get(cid).ready) continue; // capitolo non ancora scritto: si controllerà quando ci sarà
    else if (sec && known.has(cid) && !known.get(cid).sections.includes(href)) r.problems.push(`[link] #${href}: la sezione "${sec}" non esiste in "${cid}"`);
  }
}

// telefono: niente scorrimento laterale, screenshot chiaro e scuro
for (const scheme of ['light', 'dark']) {
  const phone = await newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: scheme, isMobile: true, hasTouch: true });
  await phone.page.goto(url + '#home', { waitUntil: 'load' });
  await phone.page.waitForFunction(() => window.ASD && window.ASD.ready, null, { timeout: 15000 });
  for (const ch of chapters) {
    if (only.length && !only.includes(ch.id)) continue;
    await phone.page.evaluate((id) => (location.hash = '#' + id), ch.id);
    await phone.page.waitForFunction((id) => document.querySelector(`article[data-chapter="${id}"]`), ch.id);
    await phone.page.waitForTimeout(120);
    const overflow = await phone.page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const r = report.find((x) => x.id === ch.id);
    if (scheme === 'light' && overflow > 1) r.problems.push(`[mobile] la pagina scorre di lato di ${overflow}px a 390px`);
    if (shots && (scheme === 'light' || ch.ready)) {
      await phone.page.evaluate(() => window.scrollTo(0, 0));
      await phone.page.screenshot({ path: join(shots, `${ch.id}-phone-${scheme}.png`), fullPage: full });
    }
  }
  for (const p of phone.problems) report[0] && report[0].problems.push(`[mobile ${scheme}] ${p}`);
  await phone.ctx.close();
}

if (shots) {
  const dark = await newPage({ viewport: { width: 1360, height: 900 }, colorScheme: 'dark' });
  await dark.page.goto(url + '#home', { waitUntil: 'load' });
  await dark.page.waitForFunction(() => window.ASD && window.ASD.ready);
  for (const ch of chapters) {
    if (!ch.ready || (only.length && !only.includes(ch.id))) continue;
    await dark.page.evaluate((id) => (location.hash = '#' + id), ch.id);
    await dark.page.waitForFunction((id) => document.querySelector(`article[data-chapter="${id}"]`), ch.id);
    await dark.page.waitForTimeout(120);
    await dark.page.evaluate(() => window.scrollTo(0, 0));
    await dark.page.screenshot({ path: join(shots, `${ch.id}-desktop-dark.png`), fullPage: full });
  }
  await dark.ctx.close();
}

await browser.close();

let bad = 0;
for (const r of report) {
  const status = !r.ready ? '·' : r.problems.length ? '✗' : '✓';
  if (r.problems.length) bad++;
  const st = r.steppers.count ? ` (${r.steppers.count} visualizzazioni, ${r.steppers.frames} passi)` : '';
  console.log(`${status} ${r.id}${r.ready ? '' : ' (in preparazione)'}${st}`);
  for (const p of r.problems) console.log('    ' + p);
}
console.log(`\n${report.length} capitoli controllati, ${bad} con problemi.`);
process.exit(bad ? 1 : 0);
