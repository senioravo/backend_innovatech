/**
 * Cliente HTTP genérico hacia microservicios upstream del BFF.
 * Propaga X-Request-Id y lanza UpstreamError en respuestas no 2xx.
 */
import { UpstreamError } from '../../utils/errorHandler.js';
import { getOutgoingRequestIdHeaders } from '../../observability/requestIdContext.js';

type UpstreamOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
};

/**
 * Une base URL y path evitando dobles slashes.
 * @param {string} base - URL base del microservicio
 * @param {string} pathWithQuery - Ruta y query string
 * @returns {string}
 */
function joinUrl(base: string, pathWithQuery: string) {
  const b = String(base).replace(/\/$/, '');
  const p = String(pathWithQuery).startsWith('/') ? pathWithQuery : `/${pathWithQuery}`;
  return `${b}${p}`;
}

/**
 * Parsea body de fetch según content-type (JSON, texto o vacío).
 * @param {Response} res - Respuesta fetch
 * @returns {Promise<unknown>}
 */
async function parseResponseBody(res: Response) {
  if (res.status === 204) return undefined;
  const text = await res.text();
  if (!text) return undefined;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  }
  return text;
}

/**
 * Petición HTTP JSON hacia un microservicio. Lanza UpstreamError si status no es 2xx.
 * @param {string} url - URL completa
 * @param {UpstreamOptions} [options] - method, headers, body
 * @returns {Promise<{ status: number; data: unknown }>}
 */
async function upstreamJson(url: string, { method = 'GET', headers = {}, body }: UpstreamOptions = {}) {
  const h = { ...getOutgoingRequestIdHeaders(), ...headers };
  const opts: RequestInit = { method, headers: h, redirect: 'manual' };
  if (body !== undefined && body !== null && method !== 'GET' && method !== 'HEAD') {
    opts.body = typeof body === 'string' ? body : JSON.stringify(body);
    if (!h['Content-Type'] && !h['content-type']) {
      h['Content-Type'] = 'application/json';
    }
  }
  const res = await fetch(url, opts);
  const data = await parseResponseBody(res);
  if (!res.ok) {
    throw new UpstreamError(res.status, data);
  }
  return { status: res.status, data };
}

export { joinUrl, upstreamJson };