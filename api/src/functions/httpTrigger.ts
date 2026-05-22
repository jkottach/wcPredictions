import { app } from '@azure/functions';
import { getExpressApp } from '../bootstrap';
import { runExpress } from '../azureAdapter';

app.http('httpTrigger', {
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  authLevel: 'anonymous',
  route: '{*segments}',
  handler: async (request, context) => {
    try {
      const expressApp = await getExpressApp();
      return runExpress(expressApp, request, context);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      context.error('API startup failed', err);
      return {
        status: 500,
        jsonBody: {
          error: 'API initialization failed',
          message,
          hint: 'Check Azure SWA settings: MONGODB_URI, MONGODB_DB, and Atlas network access.',
        },
      };
    }
  },
});
