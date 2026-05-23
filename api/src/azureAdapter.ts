import type { Express } from 'express';
import type { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';

type RequestWithPreParsed = IncomingMessage & {
  _preParsedBody?: unknown;
  _bodyParsed?: boolean;
};

/**
 * SWA Managed Functions + host.json routePrefix "api" can forward either:
 *   /api/auth/google  (full public path) or
 *   /auth/google      (prefix already stripped by the platform)
 * Express mounts handlers at /api/* — normalize so both shapes match.
 */
export function normalizeExpressPath(pathname: string): string {
  let path = pathname || '/';

  if (path.startsWith('/api/api/')) {
    path = path.slice(4);
  } else if (path === '/api/api') {
    path = '/api';
  }

  if (path === '/health') {
    return path;
  }

  if (path.startsWith('/api/') || path === '/api') {
    return path;
  }

  return `/api${path.startsWith('/') ? '' : '/'}${path}`;
}

function resolvePathname(azureReq: HttpRequest): string {
  const url = new URL(azureReq.url);
  let pathname = url.pathname;

  const original = azureReq.headers.get('x-ms-original-url');
  if (original) {
    try {
      const fromOriginal = new URL(original, url.origin).pathname;
      if (fromOriginal.startsWith('/api') && !pathname.startsWith('/api')) {
        pathname = fromOriginal;
      }
    } catch {
      /* ignore malformed header */
    }
  }

  return normalizeExpressPath(pathname);
}

/** Bridge Azure Functions v4 HTTP requests to an Express application. */
export async function runExpress(
  expressApp: Express,
  azureReq: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const url = new URL(azureReq.url);
  const body = await readRequestBody(azureReq);
  const expressPath = resolvePathname(azureReq);

  return new Promise((resolve, reject) => {
    const socket = new Socket();
    const req = new IncomingMessage(socket) as RequestWithPreParsed;
    req.method = azureReq.method ?? 'GET';
    req.url = expressPath + url.search;

    azureReq.headers.forEach((value, key) => {
      req.headers[key.toLowerCase()] = value;
    });

    const auth = azureReq.headers.get('authorization');
    if (auth) req.headers.authorization = auth;
    const xAccess = azureReq.headers.get('x-access-token');
    if (xAccess) req.headers['x-access-token'] = xAccess;
    const cookie = azureReq.headers.get('cookie');
    if (cookie) req.headers.cookie = cookie;

    if (body.length > 0) {
      const contentType = String(req.headers['content-type'] ?? '');
      if (contentType.includes('application/json')) {
        try {
          req._preParsedBody = JSON.parse(body.toString('utf8'));
          req._bodyParsed = true;
        } catch {
          req._preParsedBody = {};
          req._bodyParsed = true;
        }
      }
      req.push(body);
    }
    req.push(null);

    const res = new ServerResponse(req);
    const bodyChunks: Buffer[] = [];

    res.write = ((chunk: unknown) => {
      if (chunk) {
        bodyChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
      }
      return true;
    }) as typeof res.write;

    res.end = ((chunk?: unknown) => {
      if (chunk) {
        bodyChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
      }
      res.emit('finish');
      return res;
    }) as typeof res.end;

    res.on('finish', () => {
      const responseBody = Buffer.concat(bodyChunks);
      const headers: Record<string, string> = {};
      const rawHeaders = res.getHeaders();
      for (const [key, value] of Object.entries(rawHeaders)) {
        if (value === undefined) continue;
        headers[key] = Array.isArray(value) ? value.map(String).join(', ') : String(value);
      }

      const contentType = headers['content-type'] ?? 'application/json';
      const isText =
        contentType.includes('json') ||
        contentType.includes('text') ||
        contentType.includes('javascript') ||
        contentType.includes('xml');

      resolve({
        status: res.statusCode || 200,
        headers,
        body: isText ? responseBody.toString('utf8') : responseBody,
      });
    });

    res.on('error', (err) => {
      context.error('Express response error', err);
      reject(err);
    });

    req.on('error', (err) => {
      context.error('Express request error', err);
      reject(err);
    });

    expressApp(req, res);
  });
}

async function readRequestBody(request: HttpRequest): Promise<Buffer> {
  try {
    const buffer = await request.arrayBuffer();
    return Buffer.from(buffer);
  } catch {
    return Buffer.alloc(0);
  }
}
