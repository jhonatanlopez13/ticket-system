const { auth, db } = require('../config/firebase');

// Verifica el ID token de Firebase enviado en el header Authorization: Bearer <token>
async function verifyToken(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ error: 'No se proporcionó token de autenticación.' });
    }

    const decoded = await auth.verifyIdToken(token);

    // Traemos el perfil desde Firestore para tener siempre el rol y estado actualizados
    const userDoc = await db.collection('usuarios').doc(decoded.uid).get();

    if (!userDoc.exists) {
      return res.status(403).json({ error: 'El usuario no tiene un perfil registrado en el sistema.' });
    }

    const userData = userDoc.data();

    if (userData.activo === false) {
      return res.status(403).json({ error: 'Tu cuenta está desactivada. Contacta a un administrador.' });
    }

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      rol: userData.rol,
      nombre: userData.nombre,
      ...userData,
    };

    next();
  } catch (err) {
    console.error('Error verificando token:', err.message);
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}

// Middleware factory: permite el acceso solo a los roles indicados
function requireRole(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ error: 'No tienes permisos para realizar esta acción.' });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole };
