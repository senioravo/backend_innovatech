/**
 * Corrige imports duplicados post-migración ESM en scripts de utilidad.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function fixDuplicatePathImport(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const count = (content.match(/^import path from 'path';$/gm) || []).length;
  if (count <= 1) return false;
  content = content.replace(/\nimport path from 'path';\n(?=import crypto|import fs|const keysDir)/, '\n');
  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

const files = [
  path.join(repoRoot, 'backend/ms-auth/scripts/generate-keys.js')
];

for (const file of files) {
  if (fixDuplicatePathImport(file)) console.log('Fixed', file);
}
