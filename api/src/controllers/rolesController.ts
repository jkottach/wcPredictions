import { Request, Response } from 'express';
import { ClientPrincipal, getEmailFromPrincipal } from '../lib/clientPrincipal';
import { logger } from '../lib/logger';
import { resolveUserFromPrincipal } from '../middleware/resolveUser';

/** Built-in SWA roles */
const ROLE_AUTHENTICATED = 'authenticated';
const ROLE_ANONYMOUS = 'anonymous';

function principalFromRequest(req: Request): ClientPrincipal | null {
  const body = req.body;
  if (body && typeof body === 'object' && typeof body.identityProvider === 'string') {
    return body as ClientPrincipal;
  }
  return null;
}

/**
 * Azure Static Web Apps role assignment (rolesSource: /api/getRoles).
 * POST body = client principal after sign-in.
 * All signed-in users get "authenticated" only (no admin role).
 */
export const getRoles = async (req: Request, res: Response) => {
  try {
    const principal = principalFromRequest(req);

    if (!principal?.identityProvider) {
      return res.json({ roles: [ROLE_ANONYMOUS] });
    }

    const email = getEmailFromPrincipal(principal);
    if (!email) {
      logger.error('getRoles', new Error('No email on client principal'), {
        identityProvider: principal.identityProvider,
      });
      return res.json({ roles: [ROLE_ANONYMOUS] });
    }

    await resolveUserFromPrincipal(principal);

    return res.json({ roles: [ROLE_AUTHENTICATED] });
  } catch (error) {
    logger.error('getRoles', error, { method: req.method, path: req.path });
    return res.status(500).json({ roles: [ROLE_ANONYMOUS] });
  }
};
