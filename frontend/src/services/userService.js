import api from './api';

export const getMiPerfil = () => api.get('/usuarios/me').then((r) => r.data);
export const listarUsuarios = (rol) => api.get('/usuarios', { params: { rol } }).then((r) => r.data);
export const crearUsuario = (data) => api.post('/usuarios', data).then((r) => r.data);
export const actualizarUsuario = (id, data) => api.put(`/usuarios/${id}`, data).then((r) => r.data);
export const eliminarUsuario = (id) => api.delete(`/usuarios/${id}`).then((r) => r.data);
