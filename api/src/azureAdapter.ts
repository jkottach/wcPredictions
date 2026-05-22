import type { Express } from 'express';
import type { HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';

/** Bridge Azure Functions v4 HTTP requests to an Express application. */
export async function runExpress(
  expressApp: Express,
  azureReq: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  const url = new URL(azureReq.url);
  const body = await readRequestBody(azureReq);

  return new Promise((resolve, reject) => {
    const socket = new Socket();
    const req = new IncomingMessage(socket);
    req.method = azureReq.method ?? 'GET';
    req.url = url.pathname + url.search;

    azureReq.headers.forEach((value, key) => {
      req.headers[key.toLowerCase()] = value;
    });

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

    if (body.length > 0) {
      req.push(body);
    }
    req.push(null);

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
