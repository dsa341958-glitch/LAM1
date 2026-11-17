import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:3001' });

// Envía el token en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si el token expiró, vuelve al login
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response && err.response.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

export default api;