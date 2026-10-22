#!/usr/bin/env node
/**
 * check-cpp.mjs — compila ed esegue tutti gli esempi C++ del corso.
 *
 * Per ogni esempi/<parte>/<nome>.cpp:
 *   1. g++ -std=c++17 -Wall -Wextra -pedantic -Werror -O1 -g
 *          -fsanitize=address,undefined   (trova errori di memoria e perdite)
 *   2. esegue il programma (stdin = <nome>.in se esiste, al massimo 10 s)
 *   3. confronta l'output con <nome>.out se esiste
 *
 * Direttive in testa al sorgente:
 *   //@check compile           solo compilazione
 *   //@check skip              non controllare (codice volutamente sbagliato)
 *   //@check flags: -O2 ...    flag aggiuntivi
 *   //@check nosan             senza sanitizer (es. programmi molto lenti)
 *
 * Uso:  node tools/check-cpp.mjs              tutti gli esempi
 *       node tools/check-cpp.mjs ordinamento  solo la parte esempi/ordinamento
 *       node tools/check-cpp.mjs heap         i file il cui percorso contiene "heap" (se non è una parte)
 *       node tools/check-cpp.mjs --update     riscrive i .out con l'output attuale (usare con giudizio)
 */
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { tmpdir, cpus } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ESEMPI = join(ROOT, 'esempi');
const args = process.argv.slice(2);
const update = args.includes('--update');
const filter = args.find((a) => !a.startsWith('--'));
const CXX = process.env.CXX || 'g++';

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith('.cpp')) out.push(p);
  }
  return out;
}

function run(cmd, argv, { input = '', timeout = 60000 } = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, argv, { stdio: ['pipe', 'pipe', 'pipe'], env: { ...process.env, ASAN_OPTIONS: 'detect_leaks=1' } });
    let stdout = '';
    let stderr = '';
    let killed = false;
    const timer = setTimeout(() => {
      killed = true;
      child.kill('SIGKILL');
    }, timeout);
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr, killed });
    });
    child.stdin.on('error', () => {});
    child.stdin.end(input);
  });
}

const norm = (s) =>
  s
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((l) => l.replace(/\s+$/, ''))
    .join('\n')
    .replace(/\n+$/, '');

// il filtro è il nome di una parte (cartella di esempi/), oppure un pezzo di percorso:
// "cpp" deve dare la parte cpp, non tutti i file .cpp
const parti = readdirSync(ESEMPI).filter((d) => statSync(join(ESEMPI, d)).isDirectory());
const scelto = (f) => {
  const rel = relative(ESEMPI, f);
  return parti.includes(filter) ? rel.split(/[\\/]/)[0] === filter : rel.includes(filter);
};
const files = walk(ESEMPI).filter((f) => !filter || scelto(f));
const tmp = mkdtempSync(join(tmpdir(), 'asd-check-'));
const results = [];

async function check(file, k) {
  const rel = relative(ROOT, file);
  const src = readFileSync(file, 'utf8');
  const head = src.split('\n').slice(0, 5).join('\n');
  if (/\/\/@check\s+skip/.test(head)) return { rel, status: 'saltato' };
  const compileOnly = /\/\/@check\s+compile/.test(head);
  const nosan = /\/\/@check\s+nosan/.test(head);
  const extra = (/\/\/@check\s+flags:\s*(.*)/.exec(head) || [])[1];
  const exe = join(tmp, 'p' + k);
  const flags = ['-std=c++17', '-Wall', '-Wextra', '-pedantic', '-Werror', '-O1', '-g'];
  if (!nosan) flags.push('-fsanitize=address,undefined', '-fno-omit-frame-pointer', '-fno-sanitize-recover=all');
  if (extra) flags.push(...extra.trim().split(/\s+/));
  const c = await run(CXX, [...flags, file, '-o', exe]);
  if (c.code !== 0) return { rel, status: 'NON COMPILA', detail: c.stderr.trim() };
  if (compileOnly) return { rel, status: 'compila' };
  const base = file.replace(/\.cpp$/, '');
  const input = existsSync(base + '.in') ? readFileSync(base + '.in', 'utf8') : '';
  const r = await run(exe, [], { input, timeout: 10000 });
  if (r.killed) return { rel, status: 'TROPPO LENTO', detail: 'più di 10 secondi' };
  if (r.code !== 0) return { rel, status: 'ERRORE IN ESECUZIONE', detail: (r.stderr || '').trim().slice(0, 3000) || 'codice di uscita ' + r.code };
  if (existsSync(base + '.out')) {
    const want = norm(readFileSync(base + '.out', 'utf8'));
    const got = norm(r.stdout);
    if (want !== got) {
      if (update) {
        writeFileSync(base + '.out', r.stdout);
        return { rel, status: 'aggiornato' };
      }
      return { rel, status: 'OUTPUT DIVERSO', detail: diff(want, got) };
    }
    return { rel, status: 'ok' };
  }
  if (update) writeFileSync(base + '.out', r.stdout);
  return { rel, status: update ? 'creato .out' : 'ok (senza .out)' };
}

function diff(want, got) {
  const a = want.split('\n');
  const b = got.split('\n');
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] !== b[i]) return `prima differenza alla riga ${i + 1}:\n  atteso:  ${a[i] ?? '(niente)'}\n  ottenuto: ${b[i] ?? '(niente)'}`;
  }
  return '';
}

const pool = Math.max(1, Math.min(cpus().length, 8));
let next = 0;
await Promise.all(
  Array.from({ length: pool }, async () => {
    while (next < files.length) {
      const k = next++;
      results[k] = await check(files[k], k);
      const r = results[k];
      const bad = /^[A-Z]/.test(r.status);
      console.log(`${bad ? '✗' : '✓'} ${r.status.padEnd(22)} ${r.rel}`);
      if (bad && r.detail) console.log('    ' + r.detail.split('\n').slice(0, 25).join('\n    '));
    }
  })
);
rmSync(tmp, { recursive: true, force: true });
const failed = results.filter((r) => /^[A-Z]/.test(r.status));
console.log(`\n${results.length} esempi, ${failed.length} con problemi.`);
process.exit(failed.length ? 1 : 0);
