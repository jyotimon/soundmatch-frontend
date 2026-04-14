import axios from 'axios';

// FIX: Use env variable — was hardcoded to 'http://localhost:5000' and ignored NEXT_PUBLIC_API_URL
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const api = axios.create({ baseURL: API_URL, withCredentials: true });

// Attach stored JWT to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('sm_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect home on 401
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('sm_token');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const getMe  = () => api.get('/auth/me').then((r) => r.data.data);
export const logout = () => api.post('/auth/logout');

// ─── Users ────────────────────────────────────────────────────────────────────
export const getUser      = (id: string) => api.get(`/api/users/${id}`).then((r) => r.data.data);
export const getMyProfile = ()           => api.get('/api/users/me/profile').then((r) => r.data.data);
export const syncProfile  = ()           => api.post('/api/users/me/sync').then((r) => r.data);

// ─── Matches ──────────────────────────────────────────────────────────────────
export const getMatches       = (p?: { limit?: number; min_score?: number }) => api.get('/api/matches', { params: p }).then((r) => r.data.data);
export const getCompatibility = (userId: string) => api.get(`/api/matches/${userId}`).then((r) => r.data.data);
export const requestMatch     = (userId: string) => api.post(`/api/matches/${userId}`).then((r) => r.data.data);
export const updateMatch      = (matchId: string, status: string) => api.put(`/api/matches/${matchId}`, { status }).then((r) => r.data.data);
export const createPlaylist   = (matchId: string) => api.post(`/api/matches/${matchId}/playlist`).then((r) => r.data.data);

// ─── Communities ──────────────────────────────────────────────────────────────
export const getCommunities = ()           => api.get('/api/communities').then((r) => r.data.data);
export const getCommunity   = (id: string) => api.get(`/api/communities/${id}`).then((r) => r.data.data);
export const joinCommunity  = (id: string) => api.post(`/api/communities/${id}/join`).then((r) => r.data);
export const leaveCommunity = (id: string) => api.delete(`/api/communities/${id}/leave`).then((r) => r.data);
