#!/usr/bin/env node
/**
 * Elimina `// @ts-nocheck` y la línea `export {};` huérfana que lo acompaña.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '..');

const skipDirs = new Set(['node_modules', 'dist', 'coverage', 'tests']);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith('.ts')) files.push(full);
  }
  return files;
}

function clean(content) {
  const lines = content.split(/\r?\n/);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '// @ts-nocheck') {
      if (i + 1 < lines.length && lines[i + 1].trim() === 'export {};') {
        i += 1;
      }
      continue;
    }
    out.push(line);
  }
  let result = out.join('\n');
  if (content.endsWith('\n') && !result.endsWith('\n')) result += '\n';
  return result;
}

let changed = 0;
for (const file of walk(backendRoot)) {
  const before = fs.readFileSync(file, 'utf8');
  if (!before.includes('@ts-nocheck')) continue;
  const after = clean(before);
  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8');
    changed += 1;
    console.log('cleaned:', path.relative(backendRoot, file));
  }
}

console.log(`Done. Updated ${changed} files.`);
