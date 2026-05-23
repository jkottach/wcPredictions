/** Azure Static Web Apps built-in authentication (/.auth/*). */

export const useAzureAuth = import.meta.env.VITE_USE_AZURE_AUTH === 'true';

export interface SwaClientPrincipal {
  identityProvider: string;
  userId: string;
  userDetails: string;
  userRoles: string[];
  claims?: Array<{ typ: string; val: string }>;
}

export async function fetchClientPrincipal(): Promise<SwaClientPrincipal | null> {
  try {
    const res = await fetch('/.auth/me', { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.clientPrincipal ?? null;
  } catch {
    return null;
  }
}

export function loginWithGoogle(postLoginPath = '/dashboard'): void {
  const uri = encodeURIComponent(postLoginPath);
  window.location.href = `/.auth/login/google?post_login_redirect_uri=${uri}`;
}

export function logoutFromAzure(): void {
  const uri = encodeURIComponent('/login');
  window.location.href = `/.auth/logout?post_logout_redirect_uri=${uri}`;
}

export function needsProfileSetup(user: {
  city?: string;
  state?: string;
  country?: string;
}): boolean {
  return (
    user.city === 'Not Set' ||
    user.state === 'Not Set' ||
    user.country === 'Not Set'
  );
}
