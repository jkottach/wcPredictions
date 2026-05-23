import { create } from 'zustand';
import { AuthState, User } from '../types';
import { apiService } from '../services/apiService';
import {
  disableGoogleAutoSelect,
  markPreventGoogleAutoselect,
} from '../services/googleAuth';
import {
  fetchClientPrincipal,
  logoutFromAzure,
  useAzureAuth,
} from '../services/swaAuth';

const readCachedUser = (): User | null => {
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  token: useAzureAuth ? null : localStorage.getItem('token'),
  user: readCachedUser(),
  isLoggedIn: false,
  authReady: false,

  login: (tokenOrUser: string | User, maybeUser?: User) => {
    if (useAzureAuth) {
      const user = typeof tokenOrUser === 'string' ? maybeUser! : tokenOrUser;
      localStorage.setItem('user', JSON.stringify(user));
      set({ token: null, user, isLoggedIn: true, authReady: true });
      return;
    }
    const token = typeof tokenOrUser === 'string' ? tokenOrUser : '';
    const user = typeof tokenOrUser === 'string' ? maybeUser! : tokenOrUser;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user, isLoggedIn: true, authReady: true });
  },

  logout: () => {
    void apiService.logout().catch(() => undefined);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, isLoggedIn: false, authReady: true });

    if (!useAzureAuth) {
      disableGoogleAutoSelect();
      markPreventGoogleAutoselect();
      return;
    }

    logoutFromAzure();
  },

  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  initialize: async () => {
    if (useAzureAuth) {
      const principal = await fetchClientPrincipal();
      if (!principal) {
        set({ isLoggedIn: false, user: null, token: null, authReady: true });
        return;
      }
      try {
        const res = await apiService.getProfile();
        set({
          user: res.data,
          isLoggedIn: true,
          token: null,
          authReady: true,
        });
        localStorage.setItem('user', JSON.stringify(res.data));
      } catch {
        set({ isLoggedIn: false, user: null, token: null, authReady: true });
      }
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      set({ authReady: true, isLoggedIn: false, token: null, user: null });
      return;
    }
    try {
      const res = await apiService.getProfile();
      set({ user: res.data, isLoggedIn: true, token, authReady: true });
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      disableGoogleAutoSelect();
      markPreventGoogleAutoselect();
      set({ token: null, user: null, isLoggedIn: false, authReady: true });
    }
  },
}));
