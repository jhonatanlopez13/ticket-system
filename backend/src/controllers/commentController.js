const admin = require('firebase-admin');
const { db } = require('../config/firebase');
const { ROLES } = require('../utils/roles');
const { notificar } = require('../utils/notify');

// Listar comentarios de un caso
async function listarComentarios(req, res, next) {
  try {
    const { casoId } = req.params;
    const snap = await db
      .collection('casos')
      .doc(casoId)
      .collection('comentarios')
      .orderBy('createdAt', 'asc')
      .get();
    res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch (err) {
    next(err);
  }
}

// Agregar un comentario a un caso
async function agregarComentario(req, res, next) {
  try {
    const { casoId } = req.params;
    const { texto } = req.body;
    const usuario = req.user;

    if (!texto || !texto.trim()) {
      return res.status(400).json({ error: 'El comentario no puede estar vacío.' });
    }

    const casoRef = db.collection('casos').doc(casoId);
    const casoDoc = await casoRef.get();
    if (!casoDoc.exists) return res.status(404).json({ error: 'Caso no encontrado.' });
    const caso = casoDoc.data();

    const esDueño = caso.creadoPor === usuario.uid;
    const esAsignado = caso.asignadoA === usuario.uid;
    const esStaff = usuario.rol === ROLES.ADMIN || usuario.rol === ROLES.SUPERADMIN;
    if (!esDueño && !esAsignado && !esStaff) {
      return res.status(403).json({ error: 'No tienes acceso para comentar en este caso.' });
    }

    const comentario = {
      texto: texto.trim(),
      autorUid: usuario.uid,
      autorNombre: usuario.nombre,
      autorRol: usuario.rol,
      createdAt: new Date().toISOString(),
    };

    const ref = await casoRef.collection('comentarios').add(comentario);

    await casoRef.update({
      comentariosCount: admin.firestore.FieldValue.increment(1),
      updatedAt: new Date().toISOString(),
    });

    // Notificar a las otras partes involucradas (no al autor del comentario)
    const destinatarios = new Set([caso.creadoPor, caso.asignadoA].filter(Boolean));
    destinatarios.delete(usuario.uid);
    await Promise.all(
      [...destinatarios].map((uid) =>
        notificar({
          paraUid: uid,
          mensaje: `${usuario.nombre} comentó en el caso "${caso.titulo}"`,
          tipo: 'comentario',
          casoId,
        })
      )
    );

    res.status(201).json({ id: ref.id, ...comentario });
  } catch (err) {
    next(err);
  }
}

module.exports = { listarComentarios, agregarComentario };
