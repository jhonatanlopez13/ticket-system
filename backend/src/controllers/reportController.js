const { db } = require('../config/firebase');

// Reporte general: conteos por estado, prioridad, categoría, agente y tiempos de resolución
async function reporteGeneral(req, res, next) {
  try {
    const snap = await db.collection('casos').get();
    const casos = snap.docs.map((d) => d.data());

    const porEstado = {};
    const porPrioridad = {};
    const porCategoria = {};
    const porAgente = {};
    let totalTiempoResolucionMs = 0;
    let resueltosConTiempo = 0;

    casos.forEach((c) => {
      porEstado[c.estado] = (porEstado[c.estado] || 0) + 1;
      porPrioridad[c.prioridad] = (porPrioridad[c.prioridad] || 0) + 1;
      porCategoria[c.categoria] = (porCategoria[c.categoria] || 0) + 1;

      if (c.asignadoANombre) {
        porAgente[c.asignadoANombre] = (porAgente[c.asignadoANombre] || 0) + 1;
      }

      if (c.estado === 'resuelto' || c.estado === 'cerrado') {
        const creado = new Date(c.createdAt).getTime();
        const actualizado = new Date(c.updatedAt).getTime();
        if (!Number.isNaN(creado) && !Number.isNaN(actualizado) && actualizado > creado) {
          totalTiempoResolucionMs += actualizado - creado;
          resueltosConTiempo += 1;
        }
      }
    });

    const tiempoPromedioResolucionHoras =
      resueltosConTiempo > 0 ? +(totalTiempoResolucionMs / resueltosConTiempo / 3600000).toFixed(1) : null;

    res.json({
      totalCasos: casos.length,
      porEstado,
      porPrioridad,
      porCategoria,
      porAgente,
      tiempoPromedioResolucionHoras,
    });
  } catch (err) {
    next(err);
  }
}

// Reporte de carga de trabajo por agente (casos abiertos/en proceso asignados)
async function reporteCargaAgentes(req, res, next) {
  try {
    const agentesSnap = await db.collection('usuarios').where('rol', '==', 'agente').get();
    const agentes = agentesSnap.docs.map((d) => d.data());

    const resultado = await Promise.all(
      agentes.map(async (a) => {
        const casosSnap = await db
          .collection('casos')
          .where('asignadoA', '==', a.uid)
          .where('estado', 'in', ['abierto', 'en_proceso'])
          .get();
        return {
          agenteUid: a.uid,
          agenteNombre: a.nombre,
          casosActivos: casosSnap.size,
        };
      })
    );

    res.json(resultado.sort((x, y) => y.casosActivos - x.casosActivos));
  } catch (err) {
    next(err);
  }
}

module.exports = { reporteGeneral, reporteCargaAgentes };
