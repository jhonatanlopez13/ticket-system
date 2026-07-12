import api from './api';

export const reporteGeneral = () => api.get('/reportes/general').then((r) => r.data);
export const reporteCargaAgentes = () => api.get('/reportes/carga-agentes').then((r) => r.data);
