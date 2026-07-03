import path from 'path';

function collectScanRoots(baseDir: string): string[] {
  const roots = [baseDir];
  const normalized = baseDir.replace(/\\/g, '/');
  if (normalized.endsWith('/dist')) {
    roots.push(path.join(baseDir, '..', 'src'));
  }
  return roots;
}

/**
 * Rutas glob para swagger-jsdoc: dist/*.js en prod y src/*.ts en dev/Docker.
 */
export function buildSwaggerApiGlobs(baseDir: string, relativeDirs: string[] = ['routes']): string[] {
  const globs: string[] = [];

  for (const root of collectScanRoots(baseDir)) {
    globs.push(path.join(root, 'app.js'), path.join(root, 'app.ts'));

    for (const relativeDir of relativeDirs) {
      const dir = path.join(root, relativeDir);
      globs.push(
        path.join(dir, '*.js'),
        path.join(dir, '*.ts'),
        path.join(dir, '**', '*.js'),
        path.join(dir, '**', '*.ts')
      );
    }
  }

  return [...new Set(globs.map((globPath) => globPath.replace(/\\/g, '/')))];
}
