const admin = require('firebase-admin');
const { db } = require('../config/firebase');
const { ROLES } = require('../utils/roles');
const { notificar } = require('../utils/notify');

const ESTADOS = ['abierto', 'en_proceso', 'resuelto', 'cerrado'];
const PRIORIDADES = ['baja', 'media', 'alta', 'urgente'];

function nuevoEventoHistorial(usuario, accion, detalle) {
  return {
    fecha: new Date().toISOString(),
    usuarioUid: usuario.uid,
    usuarioNombre: usuario.nombre,
    accion,
    detalle: detalle || '',
  };
}

// Crear un caso nuevo (lo crea un solicitante, o un admin/superadmin en nombre de alguien)
async function crearCaso(req, res, next) {
  try {
    const { titulo, descripcion, categoria, prioridad } = req.body;
    const usuario = req.user;

    if (!titulo || !descripcion) {
      return res.status(400).json({ error: 'Título y descripción son obligatorios.' });
    }
    const prioridadFinal = PRIORIDADES.includes(prioridad) ? prioridad : 'media';

    const ref = db.collection('casos').doc();
    const caso = {
      id: ref.id,
      titulo,
      descripcion,
      categoria: categoria || 'general',
      prioridad: prioridadFinal,
      estado: 'abierto',
      creadoPor: usuario.uid,
      creadoPorNombre: usuario.nombre,
      asignadoA: null,
      asignadoANombre: null,
      comentariosCount: 0,
      historial: [nuevoEventoHistorial(usuario, 'creacion', 'Caso creado')],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await ref.set(caso);

    // Notificar a todos los admins y superadmins que hay un caso nuevo
    const admins = await db.collection('usuarios').where('rol', 'in', [ROLES.ADMIN, ROLES.SUPERADMIN]).get();
    await Promise.all(
      admins.docs.map((d) =>
        notificar({
          paraUid: d.id,
          mensaje: `Nuevo caso: "${titulo}"`,
          tipo: 'info',
          casoId: ref.id,
        })
      )
    );

    res.status(201).json(caso);
  } catch (err) {
    next(err);
  }
}

// Listar casos según el rol del usuario
async function listarCasos(req, res, next) {
  try {
    const usuario = req.user;
    const { estado, prioridad, asignadoA } = req.query;

    let query = db.collection('casos');

    if (usuario.rol === ROLES.SOLICITANTE) {
      query = query.where('creadoPor', '==', usuario.uid);
    } else if (usuario.rol === ROLES.AGENTE) {
      query = query.where('asignadoA', '==', usuario.uid);
    }
    // admin y superadmin ven todos los casos, con filtros opcionales

    if (estado) query = query.where('estado', '==', estado);
    if (prioridad) query = query.where('prioridad', '==', prioridad);
    if (asignadoA && (usuario.rol === ROLES.ADMIN || usuario.rol === ROLES.SUPERADMIN)) {
      query = query.where('asignadoA', '==', asignadoA);
    }

    const snap = await query.get();
    const casos = snap.docs.map((d) => d.data()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    res.json(casos);
  } catch (err) {
    next(err);
  }
}

// Obtener un caso por id
async function obtenerCaso(req, res, next) {
  try {
    const usuario = req.user;
    const doc = await db.collection('casos').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Caso no encontrado.' });
    const caso = doc.data();

    const esDueño = caso.creadoPor === usuario.uid;
    const esAsignado = caso.asignadoA === usuario.uid;
    const esStaff = usuario.rol === ROLES.ADMIN || usuario.rol === ROLES.SUPERADMIN;

    if (!esDueño && !esAsignado && !esStaff) {
      return res.status(403).json({ error: 'No tienes acceso a este caso.' });
    }

    res.json(caso);
  } catch (err) {
    next(err);
  }
}

// Asignar un caso a un agente (admin/superadmin)
async function asignarCaso(req, res, next) {
  try {
    const { agenteUid } = req.body;
    const usuario = req.user;
    const ref = db.collection('casos').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Caso no encontrado.' });

    if (!agenteUid) return res.status(400).json({ error: 'Debes indicar el agenteUid.' });

    const agenteDoc = await db.collection('usuarios').doc(agenteUid).get();
    if (!agenteDoc.exists || agenteDoc.data().rol !== ROLES.AGENTE) {
      return res.status(400).json({ error: 'El usuario indicado no es un agente válido.' });
    }
    const agente = agenteDoc.data();

    const evento = nuevoEventoHistorial(usuario, 'asignacion', `Asignado a ${agente.nombre}`);

    await ref.update({
      asignadoA: agenteUid,
      asignadoANombre: agente.nombre,
      estado: 'en_proceso',
      updatedAt: new Date().toISOString(),
      historial: admin.firestore.FieldValue.arrayUnion(evento),
    });

    await notificar({
      paraUid: agenteUid,
      mensaje: `Se te asignó el caso: "${doc.data().titulo}"`,
      tipo: 'asignacion',
      casoId: doc.id,
    });

    const actualizado = await ref.get();
    res.json(actualizado.data());
  } catch (err) {
    next(err);
  }
}

// Cambiar el estado de un caso (agente asignado, admin o superadmin)
async function cambiarEstado(req, res, next) {
  try {
    const { estado, comentario } = req.body;
    const usuario = req.user;

    if (!ESTADOS.includes(estado)) {
      return res.status(400).json({ error: `Estado inválido. Válidos: ${ESTADOS.join(', ')}` });
    }

    const ref = db.collection('casos').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Caso no encontrado.' });
    const caso = doc.data();

    const esAsignado = caso.asignadoA === usuario.uid;
    const esStaff = usuario.rol === ROLES.ADMIN || usuario.rol === ROLES.SUPERADMIN;
    if (!esAsignado && !esStaff) {
      return res.status(403).json({ error: 'Solo el agente asignado o un administrador pueden cambiar el estado.' });
    }

    const evento = nuevoEventoHistorial(usuario, 'cambio_estado', comentario || `Estado cambiado a ${estado}`);

    await ref.update({
      estado,
      updatedAt: new Date().toISOString(),
      historial: admin.firestore.FieldValue.arrayUnion(evento),
    });

    await notificar({
      paraUid: caso.creadoPor,
      mensaje: `Tu caso "${caso.titulo}" cambió de estado a: ${estado}`,
      tipo: 'cambio_estado',
      casoId: doc.id,
    });

    const actualizado = await ref.get();
    res.json(actualizado.data());
  } catch (err) {
    next(err);
  }
}

// Editar campos generales del caso (titulo, descripcion, categoria, prioridad)
async function actualizarCaso(req, res, next) {
  try {
    const { titulo, descripcion, categoria, prioridad } = req.body;
    const usuario = req.user;
    const ref = db.collection('casos').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Caso no encontrado.' });
    const caso = doc.data();

    const esDueño = caso.creadoPor === usuario.uid && caso.estado === 'abierto';
    const esStaff = usuario.rol === ROLES.ADMIN || usuario.rol === ROLES.SUPERADMIN;
    if (!esDueño && !esStaff) {
      return res.status(403).json({ error: 'No puedes editar este caso.' });
    }

    const cambios = { updatedAt: new Date().toISOString() };
    if (titulo !== undefined) cambios.titulo = titulo;
    if (descripcion !== undefined) cambios.descripcion = descripcion;
    if (categoria !== undefined) cambios.categoria = categoria;
    if (prioridad !== undefined && PRIORIDADES.includes(prioridad)) cambios.prioridad = prioridad;

    cambios.historial = admin.firestore.FieldValue.arrayUnion(
      nuevoEventoHistorial(usuario, 'edicion', 'Se editaron los datos del caso')
    );

    await ref.update(cambios);
    const actualizado = await ref.get();
    res.json(actualizado.data());
  } catch (err) {
    next(err);
  }
}

// Eliminar un caso (solo admin/superadmin)
async function eliminarCaso(req, res, next) {
  try {
    const ref = db.collection('casos').doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Caso no encontrado.' });

    const comentarios = await ref.collection('comentarios').get();
    const batch = db.batch();
    comentarios.docs.forEach((c) => batch.delete(c.ref));
    batch.delete(ref);
    await batch.commit();

    res.json({ mensaje: 'Caso eliminado correctamente.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  crearCaso,
  listarCasos,
  obtenerCaso,
  asignarCaso,
  cambiarEstado,
  actualizarCaso,
  eliminarCaso,
  ESTADOS,
  PRIORIDADES,
};
