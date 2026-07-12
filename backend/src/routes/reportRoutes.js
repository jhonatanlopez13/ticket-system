const express = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const { ROLES } = require('../utils/roles');
const ctrl = require('../controllers/reportController');

const router = express.Router();

router.use(verifyToken, requireRole(ROLES.SUPERADMIN, ROLES.ADMIN));

router.get('/general', ctrl.reporteGeneral);
router.get('/carga-agentes', ctrl.reporteCargaAgentes);

module.exports = router;
