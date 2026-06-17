import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Rutas glob para swagger-jsdoc compatibles con dev (src/*.ts) y prod (dist/*.js).
 */
export function buildSwaggerApiGlobs(baseDir: string, relativeDirs: string[] = ['routes']): string[] {
  const globs: string[] = [
    path.join(baseDir, 'app.js'),
    path.join(baseDir, 'app.ts'),
  ];

  for (const relativeDir of relativeDirs) {
    const dir = path.join(baseDir, relativeDir);
    globs.push(path.join(dir, '*.js'));
    globs.push(path.join(dir, '*.ts'));
    globs.push(path.join(dir, '**', '*.js'));
    globs.push(path.join(dir, '**', '*.ts'));
  }

  return globs;
}

export const __dirnameFromMeta = (metaUrl: string) =>
  path.dirname(fileURLToPath(metaUrl));
