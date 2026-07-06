/**
 * Helpers ESM para obtener __filename y __dirname en módulos ES.
 */
import path from 'path';
import { fileURLToPath } from 'url';

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);
