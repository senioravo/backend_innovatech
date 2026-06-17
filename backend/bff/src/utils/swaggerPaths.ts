import path from 'path';

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

  return globs.map((globPath) => globPath.replace(/\\/g, '/'));
}
