import { app } from '@azure/functions';
import { getExpressApp } from '../bootstrap';
import { runExpress } from '../azureAdapter';

app.http('httpTrigger', {
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  authLevel: 'anonymous',
  route: '{*segments}',
  handler: async (request, context) => runExpress(await getExpressApp(), request, context),
});
