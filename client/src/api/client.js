import axios from 'axios';

const raw = import.meta.env.VITE_API_URL || '/api';
const baseURL = raw.replace(/\/+$/, '') + '/';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}
