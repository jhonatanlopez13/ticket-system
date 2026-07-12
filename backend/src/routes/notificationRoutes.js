const express = require('express');
const { verifyToken } = require('../middleware/auth');
const ctrl = require('../controllers/notificationController');

const router = express.Router();

router.use(verifyToken);

router.get('/', ctrl.listarNotificaciones);
router.post('/:id/leer', ctrl.marcarLeida);
router.post('/leer-todas', ctrl.marcarTodasLeidas);

module.exports = router;
