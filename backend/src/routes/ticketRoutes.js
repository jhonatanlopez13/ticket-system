const express = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const { ROLES } = require('../utils/roles');
const ctrl = require('../controllers/ticketController');
const comentarios = require('../controllers/commentController');

const router = express.Router();

router.use(verifyToken);

router.get('/', ctrl.listarCasos);
router.post('/', ctrl.crearCaso);
router.get('/:id', ctrl.obtenerCaso);
router.put('/:id', ctrl.actualizarCaso);
router.delete('/:id', requireRole(ROLES.SUPERADMIN, ROLES.ADMIN), ctrl.eliminarCaso);

router.post('/:id/asignar', requireRole(ROLES.SUPERADMIN, ROLES.ADMIN), ctrl.asignarCaso);
router.post('/:id/estado', ctrl.cambiarEstado);

router.get('/:casoId/comentarios', comentarios.listarComentarios);
router.post('/:casoId/comentarios', comentarios.agregarComentario);

module.exports = router;
