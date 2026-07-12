// Roles disponibles en el sistema
const ROLES = {
  SUPERADMIN: 'superadmin', // control total, gestiona administradores
  ADMIN: 'admin', // gestiona agentes y solicitantes, asigna casos, ve reportes
  AGENTE: 'agente', // usuario que resuelve casos asignados
  SOLICITANTE: 'solicitante', // persona que registra casos
};

const ROLE_HIERARCHY = {
  [ROLES.SUPERADMIN]: 4,
  [ROLES.ADMIN]: 3,
  [ROLES.AGENTE]: 2,
  [ROLES.SOLICITANTE]: 1,
};

const ALL_ROLES = Object.values(ROLES);

// Quién puede crear/gestionar a quién
const CAN_MANAGE = {
  [ROLES.SUPERADMIN]: [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.AGENTE, ROLES.SOLICITANTE],
  [ROLES.ADMIN]: [ROLES.AGENTE, ROLES.SOLICITANTE],
};

module.exports = { ROLES, ROLE_HIERARCHY, ALL_ROLES, CAN_MANAGE };
