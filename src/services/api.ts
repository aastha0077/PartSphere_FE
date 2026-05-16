import axios from 'axios';

const API_URL = 'http://localhost:5186/api'; // Update if backend port is different

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = String(error.config?.url ?? '');
    const isAuthAttempt = /\/auth\/(login|register)(\?|$)/i.test(url);

    // Do not redirect on failed login/register — let the form show the error.
    if (status === 401 && !isAuthAttempt) {
      localStorage.removeItem('token');
      const onLoginPage = window.location.pathname === '/login';
      if (!onLoginPage) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;