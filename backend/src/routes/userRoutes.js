const express = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const { ROLES } = require('../utils/roles');
const ctrl = require('../controllers/userController');

const router = express.Router();

router.use(verifyToken);

router.get('/me', ctrl.miPerfil);
router.get('/', requireRole(ROLES.SUPERADMIN, ROLES.ADMIN), ctrl.listarUsuarios);
router.post('/', requireRole(ROLES.SUPERADMIN, ROLES.ADMIN), ctrl.crearUsuario);
router.get('/:id', requireRole(ROLES.SUPERADMIN, ROLES.ADMIN), ctrl.obtenerUsuario);
router.put('/:id', requireRole(ROLES.SUPERADMIN, ROLES.ADMIN), ctrl.actualizarUsuario);
router.delete('/:id', requireRole(ROLES.SUPERADMIN, ROLES.ADMIN), ctrl.eliminarUsuario);

module.exports = router;
