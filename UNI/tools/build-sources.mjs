#!/usr/bin/env node
/**
 * build-sources.mjs — impacchetta gli esempi C++ per il sito.
 *
 * Legge esempi/<parte>/**\/*.cpp e scrive assets/js/sources/<parte>.js con
 *   ASD.addSources({ "<parte>/<nome>": { file: "esempi/<parte>/<nome>.cpp", code: "..." } });
 * I marcatori (//@region, //@etichetta, //@check) restano nel testo: li
 * interpreta il sito (ASD.parseSource) e li ignora il compilatore.
 *
 * Uso:  node tools/build-sources.mjs            tutte le parti
 *       node tools/build-sources.mjs grafi cpp  solo alcune parti
 */
import { readdirSync, readFileSync, writeFileSync, renameSync, statSync, existsSync, mkdirSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ESEMPI = join(ROOT, 'esempi');
const OUT = join(ROOT, 'assets', 'js', 'sources');

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith('.cpp') || name.endsWith('.h') || name.endsWith('.hpp')) out.push(p);
  }
  return out;
}

const wanted = process.argv.slice(2);
const parts = readdirSync(ESEMPI).filter((d) => statSync(join(ESEMPI, d)).isDirectory()).sort();
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

let total = 0;
for (const part of parts) {
  if (wanted.length && !wanted.includes(part)) continue;
  const files = walk(join(ESEMPI, part));
  const map = {};
  for (const f of files) {
    const rel = relative(ESEMPI, f).split('\\').join('/');
    const id = rel.replace(/\.(cpp|h|hpp)$/, '');
    map[id] = { file: 'esempi/' + rel, code: readFileSync(f, 'utf8') };
  }
  const body =
    `/* File generato da tools/build-sources.mjs: non modificarlo a mano.\n` +
    `   Sorgenti: esempi/${part}/ */\n` +
    `ASD.addSources(${JSON.stringify(map, null, 1)});\n`;
  const target = join(OUT, part + '.js');
  const tmp = target + '.tmp-' + process.pid;
  writeFileSync(tmp, body);
  renameSync(tmp, target);
  total += files.length;
  console.log(`${part.padEnd(12)} ${String(files.length).padStart(3)} file  →  assets/js/sources/${part}.js`);
}
console.log(`Totale: ${total} sorgenti.`);
