import axios, { AxiosInstance } from 'axios';

/** SWA production uses same-origin `/api`; local dev uses Vite proxy. */
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api' : '/api');

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  register(data: Record<string, unknown>) {
    return this.client.post('/auth/register', data);
  }

  login(email: string, password: string) {
    return this.client.post('/auth/login', { email, password });
  }

  googleLogin(credential: string) {
    return this.client.post('/auth/google', { credential });
  }

  getProfile() {
    return this.client.get('/auth/profile');
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

  getDailyLeaderboard(limit?: number, date?: string) {
    return this.client.get('/leaderboard/daily', { params: { limit, date } });
  }

  getUserStats() {
    return this.client.get('/leaderboard/stats');
  }
}

export const apiService = new ApiService();
