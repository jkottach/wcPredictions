import {
  ClientPrincipal,
  getClaim,
  getEmailFromPrincipal,
  getNameFromPrincipal,
  parseClientPrincipal,
} from '../lib/clientPrincipal';
import { createUser, findUserByEmail, updateUserById } from '../db/repositories';
import { formatUserId } from '../db/helpers';
import { Request } from 'express';

export async function resolveUserFromPrincipal(
  principal: ClientPrincipal
): Promise<{ userId: string; email: string; role?: 'user' | 'admin' } | null> {
  const email = getEmailFromPrincipal(principal);
  if (!email) return null;

  const googleId = principal.userId;
  const picture = getClaimPicture(principal);
  const { firstName, lastName } = getNameFromPrincipal(principal);

  let user = await findUserByEmail(email);

  if (!user) {
    user = await createUser({
      email,
      firstName,
      lastName,
      googleId,
      profileImage: picture ?? null,
      status: 'active',
      isActive: true,
      city: 'Not Set',
      state: 'Not Set',
      country: 'Not Set',
      role: 'user',
    });
  } else if (!user.googleId || !user.profileImage) {
    user =
      (await updateUserById(formatUserId(user), {
        googleId: user.googleId ?? googleId,
        profileImage: user.profileImage ?? picture ?? null,
      })) ?? user;
  }

  return {
    userId: formatUserId(user),
    email: user.email,
    role: user.role,
  };
}

export async function resolveUserFromRequest(req: Request) {
  const principal = parseClientPrincipal(req);
  if (!principal) return null;
  return resolveUserFromPrincipal(principal);
}

function getClaimPicture(principal: ClientPrincipal): string | null {
  return getClaim(principal, 'picture') ?? null;
}
