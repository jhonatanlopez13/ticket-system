import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import api from './api';

// Escucha en tiempo real las notificaciones del usuario autenticado.
// callback recibe el arreglo de notificaciones ordenado de más reciente a más antigua.
export function escucharNotificaciones(uid, callback) {
  const q = query(
    collection(db, 'notificaciones'),
    where('paraUid', '==', uid),
    orderBy('createdAt', 'desc'),
    limit(30)
  );
  return onSnapshot(q, (snap) => {
    const notis = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(notis);
  });
}

export const marcarLeida = (id) => api.post(`/notificaciones/${id}/leer`).then((r) => r.data);
export const marcarTodasLeidas = () => api.post('/notificaciones/leer-todas').then((r) => r.data);
