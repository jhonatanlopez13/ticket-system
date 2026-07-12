import axios from 'axios';
import { auth } from '../firebase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
});

// Adjunta el ID token de Firebase a cada petición
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Extrae mensajes de error legibles
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const mensaje = err.response?.data?.error || 'Ocurrió un error inesperado.';
    return Promise.reject(new Error(mensaje));
  }
);

export default api;
