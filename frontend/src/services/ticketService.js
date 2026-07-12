import api from './api';

export const listarCasos = (filtros = {}) => api.get('/casos', { params: filtros }).then((r) => r.data);
export const obtenerCaso = (id) => api.get(`/casos/${id}`).then((r) => r.data);
export const crearCaso = (data) => api.post('/casos', data).then((r) => r.data);
export const actualizarCaso = (id, data) => api.put(`/casos/${id}`, data).then((r) => r.data);
export const eliminarCaso = (id) => api.delete(`/casos/${id}`).then((r) => r.data);
export const asignarCaso = (id, agenteUid) => api.post(`/casos/${id}/asignar`, { agenteUid }).then((r) => r.data);
export const cambiarEstado = (id, estado, comentario) =>
  api.post(`/casos/${id}/estado`, { estado, comentario }).then((r) => r.data);

export const listarComentarios = (casoId) => api.get(`/casos/${casoId}/comentarios`).then((r) => r.data);
export const agregarComentario = (casoId, texto) =>
  api.post(`/casos/${casoId}/comentarios`, { texto }).then((r) => r.data);

export const ESTADOS = ['abierto', 'en_proceso', 'resuelto', 'cerrado'];
export const PRIORIDADES = ['baja', 'media', 'alta', 'urgente'];
