const { db } = require('../config/firebase');

// Listar notificaciones del usuario autenticado
async function listarNotificaciones(req, res, next) {
  try {
    const snap = await db
      .collection('notificaciones')
      .where('paraUid', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (err) {
    next(err);
  }
}

// Marcar una notificación como leída
async function marcarLeida(req, res, next) {
  try {
    const ref = db.collection('notificaciones').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Notificación no encontrada.' });
    if (doc.data().paraUid !== req.user.uid) {
      return res.status(403).json({ error: 'No puedes modificar esta notificación.' });
    }
    await ref.update({ leido: true });
    res.json({ mensaje: 'Notificación marcada como leída.' });
  } catch (err) {
    next(err);
  }
}

// Marcar todas como leídas
async function marcarTodasLeidas(req, res, next) {
  try {
    const snap = await db
      .collection('notificaciones')
      .where('paraUid', '==', req.user.uid)
      .where('leido', '==', false)
      .get();
    const batch = db.batch();
    snap.docs.forEach((d) => batch.update(d.ref, { leido: true }));
    await batch.commit();
    res.json({ mensaje: 'Todas las notificaciones fueron marcadas como leídas.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listarNotificaciones, marcarLeida, marcarTodasLeidas };
