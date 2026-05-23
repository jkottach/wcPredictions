import { useEffect } from 'react';
import { useAuthStore } from '../context/authStore';
import { consumePreventGoogleAutoselect, disableGoogleAutoSelect } from '../services/googleAuth';
import { needsProfileSetup, useAzureAuth } from '../services/swaAuth';

/**
 * On Azure: load session from /.auth/me + /api/auth/profile.
 * Redirects new users to profile-setup after Google sign-in.
 */
const AuthBootstrap: React.FC = () => {
  const initialize = useAuthStore((s) => s.initialize);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  useEffect(() => {
    if (!useAzureAuth && consumePreventGoogleAutoselect()) {
      disableGoogleAutoSelect();
    }
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (!useAzureAuth || !isLoggedIn) return;

    const path = window.location.pathname;
    if (path === '/login' || path === '/register') return;

    const user = useAuthStore.getState().user;
    if (user && needsProfileSetup(user) && path !== '/profile-setup') {
      window.location.replace('/profile-setup');
    }
  }, [isLoggedIn]);

  return null;
};

export default AuthBootstrap;
