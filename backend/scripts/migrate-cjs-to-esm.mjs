/**
 * Migra archivos TypeScript de CommonJS (require/module.exports) a ES Modules.
 * Uso: node scripts/migrate-cjs-to-esm.mjs backend/ms-auth
 */
import fs from 'fs';
import path from 'path';

const serviceDir = process.argv[2];
if (!serviceDir) {
  console.error('Uso: node scripts/migrate-cjs-to-esm.mjs <ruta-servicio>');
  process.exit(1);
}

const srcDir = path.join(serviceDir, 'src');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) files.push(full);
  }
  return files;
}

function toJsImportPath(importPath) {
  if (!importPath.startsWith('.')) return importPath;
  if (importPath.endsWith('.js')) return importPath;
  return `${importPath}.js`;
}

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('require(') && !content.includes('module.exports')) return false;

  content = content.replace(/^\/\/ @ts-nocheck\s*\n/m, '');
  content = content.replace(/^export \{\};\s*\n/m, '');

  const needsDirname = content.includes('__dirname') || content.includes('__filename');
  const hasPathImport = /^import .* from ['"]path['"]/m.test(content);
  const hasUrlImport = /from ['"]url['"]/.test(content);

  // require('dotenv').config()
  if (/require\(['"]dotenv['"]\)\.config\(\)/.test(content)) {
    if (!/import dotenv from ['"]dotenv['"]/.test(content)) {
      content = `import dotenv from 'dotenv';\n${content}`;
    }
    content = content.replace(/require\(['"]dotenv['"]\)\.config\(\);?\s*\n?/g, 'dotenv.config();\n');
  }

  // const { a, b } = require('...')
  content = content.replace(
    /const\s+\{([^}]+)\}\s*=\s*require\(['"]([^'"]+)['"]\);?/g,
    (_, names, mod) => `import { ${names.trim()} } from '${toJsImportPath(mod)}';`
  );

  // const x = require('...')
  content = content.replace(
    /const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\);?/g,
    (_, name, mod) => `import ${name} from '${toJsImportPath(mod)}';`
  );

  // module.exports = { a, b, c }
  const exportObjMatch = content.match(/module\.exports\s*=\s*\{([^}]+)\};?\s*$/m);
  if (exportObjMatch) {
    const names = exportObjMatch[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    content = content.replace(/module\.exports\s*=\s*\{[^}]+\};?\s*$/m, `export { ${names.join(', ')} };`);
  } else {
    // module.exports = something
    content = content.replace(/module\.exports\s*=\s*(.+);?\s*$/m, 'export default $1;');
  }

  if (needsDirname && !content.includes('fileURLToPath')) {
    const inserts = [];
    if (!hasPathImport) inserts.push("import path from 'path';");
    if (!hasUrlImport) inserts.push("import { fileURLToPath } from 'url';");
    inserts.push('const __filename = fileURLToPath(import.meta.url);');
    inserts.push('const __dirname = path.dirname(__filename);');
    content = `${inserts.join('\n')}\n${content}`;
  }

  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

function updatePackageJson(servicePath) {
  const pkgPath = path.join(servicePath, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.type = 'module';
  if (pkg.scripts?.dev?.includes('ts-node-dev')) {
    pkg.scripts.dev = 'tsx watch src/app.ts';
  }
  if (!pkg.devDependencies?.tsx) {
    pkg.devDependencies = pkg.devDependencies || {};
    pkg.devDependencies.tsx = '^4.19.4';
  }
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}

function updateTsConfig(servicePath) {
  const tsPath = path.join(servicePath, 'tsconfig.json');
  const ts = JSON.parse(fs.readFileSync(tsPath, 'utf8'));
  ts.compilerOptions.target = 'ES2022';
  ts.compilerOptions.module = 'NodeNext';
  ts.compilerOptions.moduleResolution = 'NodeNext';
  fs.writeFileSync(tsPath, JSON.stringify(ts, null, 2) + '\n', 'utf8');
}

let count = 0;
for (const file of walk(srcDir)) {
  if (migrateFile(file)) {
    count++;
    console.log('Migrated:', path.relative(serviceDir, file));
  }
}

updatePackageJson(serviceDir);
updateTsConfig(serviceDir);
console.log(`\nDone: ${count} files migrated in ${serviceDir}`);
