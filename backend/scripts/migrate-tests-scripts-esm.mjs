/**
 * Migra tests y scripts utilitarios de CommonJS a ES Modules.
 * Uso: node scripts/migrate-tests-scripts-esm.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const services = ['ms-auth', 'ms-users', 'ms-project-manager', 'bff'];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist') {
      files.push(...walk(full));
    } else if (entry.isFile() && entry.name.endsWith('.js') && !entry.name.endsWith('.config.js')) {
      files.push(full);
    }
  }
  return files;
}

function toJsImportPath(importPath) {
  if (!importPath.startsWith('.')) return importPath;
  if (importPath.endsWith('.js')) return importPath;
  return `${importPath}.js`;
}

function migrateJsFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('require(') && !content.includes('module.exports')) return false;

  // jest.mock paths → .js
  content = content.replace(
    /jest\.mock\(['"](\.\.[^'"]+)['"]/g,
    (_, p) => `jest.mock('${toJsImportPath(p)}'`
  );

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

  // app = require('../src/app')
  content = content.replace(
    /(\w+)\s*=\s*require\(['"](\.\.[^'"]+)['"]\);?/g,
    (_, name, mod) => `${name} = (await import('${toJsImportPath(mod)}')).default;`
  );

  // module.exports
  content = content.replace(/module\.exports\s*=\s*(.+);?\s*$/m, 'export default $1;');

  // __dirname in scripts
  if (content.includes('__dirname') && !content.includes('fileURLToPath')) {
    const prefix = `import path from 'path';\nimport { fileURLToPath } from 'url';\nconst __filename = fileURLToPath(import.meta.url);\nconst __dirname = path.dirname(__filename);\n`;
    content = prefix + content;
  }

  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

function createJestConfigMjs(servicePath, oldConfigPath) {
  const old = fs.readFileSync(oldConfigPath, 'utf8');
  const body = old.replace(/^module\.exports\s*=\s*/, '').replace(/;\s*$/, '');
  const updated = body
    .replace(
      /preset:\s*['"]ts-jest['"]/,
      "preset: 'ts-jest/presets/default-esm'"
    )
    .replace(
      /setupFiles:\s*\[['"]<rootDir>\/tests\/setup\.js['"]\]/,
      "setupFiles: ['<rootDir>/tests/setup.js'],\n  extensionsToTreatAsEsm: ['.ts'],\n  moduleNameMapper: {\n    '^(\\\\.{1,2}/.*)\\\\.js$': '$1'\n  },\n  transform: {\n    '^.+\\\\.tsx?$': ['ts-jest', { useESM: true }]\n  }"
    );

  const mjsPath = path.join(servicePath, 'jest.config.mjs');
  fs.writeFileSync(
    mjsPath,
    `/** @type {import('jest').Config} */\nexport default ${updated};\n`,
    'utf8'
  );
  if (fs.existsSync(oldConfigPath)) fs.unlinkSync(oldConfigPath);
}

function updatePackageTestScript(servicePath) {
  const pkgPath = path.join(servicePath, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const jestBin = 'node --experimental-vm-modules ./node_modules/jest/bin/jest.js';
  if (pkg.scripts?.test) {
    pkg.scripts.test = `${jestBin} --verbose --coverage`;
  }
  if (pkg.scripts?.['test:watch']) {
    pkg.scripts['test:watch'] = `${jestBin} --watch`;
  }
  if (pkg.scripts?.['test:coverage']) {
    pkg.scripts['test:coverage'] = `${jestBin} --coverage --coverageReporters=text-lcov --coverageReporters=html`;
  }
  if (pkg.scripts?.['test:ci']) {
    pkg.scripts['test:ci'] = `${jestBin} --ci --coverage --maxWorkers=2`;
  }
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}

let total = 0;

for (const svc of services) {
  const servicePath = path.join(repoRoot, 'backend', svc);
  const testDir = path.join(servicePath, 'tests');
  const scriptsDirs = [
    path.join(servicePath, 'scripts'),
    servicePath
  ];

  for (const file of walk(testDir)) {
    if (migrateJsFile(file)) {
      console.log('Test:', path.relative(repoRoot, file));
      total++;
    }
  }

  for (const dir of scriptsDirs) {
    for (const file of walk(dir)) {
      if (file.includes(`${path.sep}tests${path.sep}`)) continue;
      if (file.endsWith('jest.config.js')) continue;
      const base = path.basename(file);
      if (!['init-db.js', 'create-test-user.js', 'generate-keys.js', 'apply-migration.js'].includes(base) &&
          !file.includes(`${path.sep}scripts${path.sep}`)) continue;
      if (migrateJsFile(file)) {
        console.log('Script:', path.relative(repoRoot, file));
        total++;
      }
    }
  }

  const jestOld = path.join(servicePath, 'jest.config.js');
  if (fs.existsSync(jestOld)) {
    createJestConfigMjs(servicePath, jestOld);
    console.log('Jest config:', svc);
  }
  updatePackageTestScript(servicePath);
}

// backend/init-database.js
const initDb = path.join(repoRoot, 'backend', 'init-database.js');
if (fs.existsSync(initDb) && migrateJsFile(initDb)) {
  console.log('Script: backend/init-database.js');
  total++;
}

// Root package.json type module (optional - only scripts folder)
const rootPkg = path.join(repoRoot, 'package.json');
const root = JSON.parse(fs.readFileSync(rootPkg, 'utf8'));
root.type = 'module';
fs.writeFileSync(rootPkg, JSON.stringify(root, null, 2) + '\n', 'utf8');

console.log(`\nDone: ${total} files migrated`);
