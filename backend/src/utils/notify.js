const { db } = require('../config/firebase');
const admin = require('firebase-admin');

// Crea una notificación en Firestore para un usuario. El frontend escucha
// esta colección en tiempo real con onSnapshot.
async function notificar({ paraUid, mensaje, tipo = 'info', casoId = null }) {
  if (!paraUid) return;
  await db.collection('notificaciones').add({
    paraUid,
    mensaje,
    tipo, // info | asignacion | cambio_estado | comentario
    casoId,
    leido: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

module.exports = { notificar };
