import { Request } from 'express';

export interface ClientPrincipal {
  identityProvider: string;
  userId: string;
  userDetails: string;
  userRoles: string[];
  claims?: Array<{ typ: string; val: string }>;
}

export function parseClientPrincipal(req: Request): ClientPrincipal | null {
  const header = req.headers['x-ms-client-principal'];
  if (!header || typeof header !== 'string') return null;
  try {
    const json = Buffer.from(header, 'base64').toString('utf8');
    return JSON.parse(json) as ClientPrincipal;
  } catch {
    return null;
  }
}

export function getClaim(principal: ClientPrincipal, ...types: string[]): string | undefined {
  for (const typ of types) {
    const claim = principal.claims?.find(
      (c) => c.typ === typ || c.typ.endsWith(`/${typ}`) || c.typ.includes(typ)
    );
    if (claim?.val) return claim.val;
  }
  return undefined;
}

export function getEmailFromPrincipal(principal: ClientPrincipal): string | null {
  if (principal.userDetails?.includes('@')) {
    return principal.userDetails.trim().toLowerCase();
  }
  const email =
    getClaim(principal, 'email', 'emailaddress') ??
    getClaim(principal, 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress');
  return email ? email.trim().toLowerCase() : null;
}

export function getNameFromPrincipal(principal: ClientPrincipal): {
  firstName: string;
  lastName: string;
} {
  const given = getClaim(principal, 'given_name', 'givenname');
  const family = getClaim(principal, 'family_name', 'surname');
  if (given || family) {
    return { firstName: given || 'Google', lastName: family || 'User' };
  }
  const full = getClaim(principal, 'name') ?? principal.userDetails;
  if (full && !full.includes('@')) {
    const parts = full.trim().split(/\s+/);
    return {
      firstName: parts[0] || 'Google',
      lastName: parts.slice(1).join(' ') || 'User',
    };
  }
  return { firstName: 'Google', lastName: 'User' };
}
