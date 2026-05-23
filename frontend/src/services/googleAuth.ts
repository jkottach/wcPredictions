/** Prevent Google One Tap / auto-select from immediately re-signing the user in after logout. */
export function disableGoogleAutoSelect(): void {
  try {
    const g = (
      window as unknown as {
        google?: { accounts?: { id?: { disableAutoSelect: () => void } } };
      }
    ).google;
    g?.accounts?.id?.disableAutoSelect();
  } catch {
    /* ignore if GIS script not loaded */
  }
}

export const PREVENT_GOOGLE_AUTOSELECT_KEY = 'prevent_google_autoselect';

export function markPreventGoogleAutoselect(): void {
  sessionStorage.setItem(PREVENT_GOOGLE_AUTOSELECT_KEY, '1');
}

export function consumePreventGoogleAutoselect(): boolean {
  const v = sessionStorage.getItem(PREVENT_GOOGLE_AUTOSELECT_KEY) === '1';
  if (v) sessionStorage.removeItem(PREVENT_GOOGLE_AUTOSELECT_KEY);
  return v;
}
