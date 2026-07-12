const { db, auth } = require('../config/firebase');
const { ROLES, ALL_ROLES, CAN_MANAGE } = require('../utils/roles');

// Crear un nuevo usuario (superadmin crea admins/agentes/solicitantes, admin crea agentes/solicitantes)
async function crearUsuario(req, res, next) {
  try {
    const { email, password, nombre, rol, telefono } = req.body;
    const creador = req.user;

    if (!email || !password || !nombre || !rol) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: email, password, nombre, rol.' });
    }

    if (!ALL_ROLES.includes(rol)) {
      return res.status(400).json({ error: `Rol inválido. Roles válidos: ${ALL_ROLES.join(', ')}` });
    }

    const permitidos = CAN_MANAGE[creador.rol] || [];
    if (!permitidos.includes(rol)) {
      return res.status(403).json({ error: `Tu rol (${creador.rol}) no puede crear usuarios con rol ${rol}.` });
    }

    const userRecord = await auth.createUser({ email, password, displayName: nombre });

    const nuevoUsuario = {
      uid: userRecord.uid,
      email,
      nombre,
      rol,
      telefono: telefono || '',
      activo: true,
      creadoPor: creador.uid,
      createdAt: new Date().toISOString(),
    };

    await db.collection('usuarios').doc(userRecord.uid).set(nuevoUsuario);

    res.status(201).json(nuevoUsuario);
  } catch (err) {
    if (err.code === 'auth/email-already-exists') {
      return res.status(409).json({ error: 'Ya existe un usuario con ese correo.' });
    }
    next(err);
  }
}

// Listar usuarios (con filtro opcional por rol)
async function listarUsuarios(req, res, next) {
  try {
    const { rol } = req.query;
    let query = db.collection('usuarios');
    if (rol) query = query.where('rol', '==', rol);

    const snap = await query.get();
    const usuarios = snap.docs.map((d) => d.data());
    res.json(usuarios);
  } catch (err) {
    next(err);
  }
}

// Obtener un usuario por id
async function obtenerUsuario(req, res, next) {
  try {
    const doc = await db.collection('usuarios').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json(doc.data());
  } catch (err) {
    next(err);
  }
}

// Actualizar datos de un usuario (nombre, telefono, activo, rol)
async function actualizarUsuario(req, res, next) {
  try {
    const { id } = req.params;
    const { nombre, telefono, activo, rol } = req.body;
    const editor = req.user;

    const ref = db.collection('usuarios').doc(id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Usuario no encontrado.' });
    const objetivo = doc.data();

    // Solo superadmin puede editar a otro superadmin o cambiar a alguien A superadmin
    if ((objetivo.rol === ROLES.SUPERADMIN || rol === ROLES.SUPERADMIN) && editor.rol !== ROLES.SUPERADMIN) {
      return res.status(403).json({ error: 'Solo un super administrador puede gestionar cuentas de super administrador.' });
    }

    const permitidos = CAN_MANAGE[editor.rol] || [];
    if (!permitidos.includes(objetivo.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para editar este usuario.' });
    }

    const cambios = {};
    if (nombre !== undefined) cambios.nombre = nombre;
    if (telefono !== undefined) cambios.telefono = telefono;
    if (activo !== undefined) cambios.activo = activo;
    if (rol !== undefined) {
      if (!permitidos.includes(rol)) {
        return res.status(403).json({ error: `No puedes asignar el rol ${rol}.` });
      }
      cambios.rol = rol;
    }
    cambios.updatedAt = new Date().toISOString();

    await ref.update(cambios);

    if (activo === false) {
      await auth.updateUser(id, { disabled: true });
    } else if (activo === true) {
      await auth.updateUser(id, { disabled: false });
    }
    if (nombre) {
      await auth.updateUser(id, { displayName: nombre });
    }

    const actualizado = await ref.get();
    res.json(actualizado.data());
  } catch (err) {
    next(err);
  }
}

// Eliminar usuario
async function eliminarUsuario(req, res, next) {
  try {
    const { id } = req.params;
    const editor = req.user;

    const ref = db.collection('usuarios').doc(id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Usuario no encontrado.' });
    const objetivo = doc.data();

    const permitidos = CAN_MANAGE[editor.rol] || [];
    if (!permitidos.includes(objetivo.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar este usuario.' });
    }
    if (objetivo.uid === editor.uid) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta.' });
    }

    await auth.deleteUser(id);
    await ref.delete();

    res.json({ mensaje: 'Usuario eliminado correctamente.' });
  } catch (err) {
    next(err);
  }
}

// Perfil propio
async function miPerfil(req, res) {
  res.json(req.user);
}

module.exports = {
  crearUsuario,
  listarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario,
  miPerfil,
};
