import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../context/authStore';
import { loginWithGoogle, useAzureAuth } from './swaAuth';

/** SWA production uses same-origin `/api`; local dev uses Vite proxy. */
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api' : '/api');

type AuthRequestConfig = InternalAxiosRequestConfig & {
  /** If true, a 401 will not clear storage or redirect to login. */
  skipAuthRedirect?: boolean;
};

const PUBLIC_PATHS = new Set(['/', '/login', '/register', '/profile-setup']);

function isPublicPath(): boolean {
  return PUBLIC_PATHS.has(window.location.pathname);
}

function shouldRedirectAfter401(hadToken: boolean): boolean {
  if (!hadToken || useAzureAuth) return false;
  if (!useAuthStore.getState().authReady) return false;
  if (isPublicPath()) return false;

  const last = sessionStorage.getItem('auth_redirect_at');
  const now = Date.now();
  if (last && now - Number(last) < 5000) return false;

  sessionStorage.setItem('auth_redirect_at', String(now));
  return true;
}

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: useAzureAuth,
    });

    this.client.interceptors.request.use((config) => {
      if (!useAzureAuth) {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const config = error.config as AuthRequestConfig | undefined;
        const hadToken = Boolean(config?.headers?.Authorization);
        const skipRedirect = config?.skipAuthRedirect === true;
        const url = String(config?.url ?? '');

        if (error.response?.status === 401 && !skipRedirect && !url.includes('/auth/google')) {
          if (useAzureAuth) {
            if (!isPublicPath()) {
              const returnPath = window.location.pathname + window.location.search;
              loginWithGoogle(returnPath || '/dashboard');
            }
            return Promise.reject(error);
          }

          if (hadToken) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            useAuthStore.setState({
              token: null,
              user: null,
              isLoggedIn: false,
              authReady: true,
            });

            if (shouldRedirectAfter401(hadToken)) {
              window.location.replace('/login');
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  register(data: Record<string, unknown>) {
    return this.client.post('/auth/register', data);
  }

  googleLogin(credential: string) {
    return this.client.post('/auth/google', { credential });
  }

  getProfile() {
    return this.client.get('/auth/profile', { skipAuthRedirect: true } as AuthRequestConfig);
  }

  updateProfile(data: Record<string, unknown>) {
    return this.client.put('/auth/profile', data);
  }

  getAllMatches(status?: string, page?: number, limit?: number) {
    return this.client.get('/matches', {
      params: { status, page, limit },
    });
  }

  getMatch(matchId: string) {
    return this.client.get(`/matches/${matchId}`);
  }

  getTeams() {
    return this.client.get('/matches/teams');
  }

  submitPrediction(data: Record<string, unknown>) {
    return this.client.post('/predictions', data);
  }

  getUserPredictions(page?: number, limit?: number) {
    return this.client.get('/predictions', {
      params: { page, limit },
    });
  }

  getUserPredictionsFromResults(page?: number, limit?: number) {
    return this.client.get('/predictions/results/list', {
      params: { page, limit },
    });
  }

  updatePrediction(predictionId: string, data: Record<string, unknown>) {
    return this.client.put(`/predictions/${predictionId}`, data);
  }

  deletePrediction(predictionId: string) {
    return this.client.delete(`/predictions/${predictionId}`);
  }

  getTopLeaderboard(limit?: number) {
    return this.client.get('/leaderboard/top', { params: { limit } });
  }

  getUserStats() {
    return this.client.get('/leaderboard/stats');
  }
}

export const apiService = new ApiService();
