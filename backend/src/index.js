require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { db, auth } = require('./config/firebase');
const { ROLES } = require('./utils/roles');
const errorHandler = require('./middleware/errorHandler');

const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/usuarios', userRoutes);
app.use('/api/casos', ticketRoutes);
app.use('/api/reportes', reportRoutes);
app.use('/api/notificaciones', notificationRoutes);

app.use(errorHandler);

// Crea automáticamente el primer super administrador si no existe ninguno todavía
async function bootstrapSuperAdmin() {
  try {
    const existentes = await db.collection('usuarios').where('rol', '==', ROLES.SUPERADMIN).limit(1).get();
    if (!existentes.empty) return;

    const email = process.env.BOOTSTRAP_SUPERADMIN_EMAIL;
    const password = process.env.BOOTSTRAP_SUPERADMIN_PASSWORD;
    const nombre = process.env.BOOTSTRAP_SUPERADMIN_NAME || 'Super Administrador';

    if (!email || !password) {
      console.warn(
        '⚠️  No hay super administrador y faltan BOOTSTRAP_SUPERADMIN_EMAIL / BOOTSTRAP_SUPERADMIN_PASSWORD en .env'
      );
      return;
    }

    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
    } catch {
      userRecord = await auth.createUser({ email, password, displayName: nombre });
    }

    await db.collection('usuarios').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      nombre,
      rol: ROLES.SUPERADMIN,
      telefono: '',
      activo: true,
      creadoPor: 'sistema',
      createdAt: new Date().toISOString(),
    });

    console.log(`✅ Super administrador inicial creado: ${email}`);
  } catch (err) {
    console.error('Error creando super administrador inicial:', err.message);
  }
}

const PORT = process.env.PORT || 4000;

bootstrapSuperAdmin().finally(() => {
  app.listen(PORT, () => console.log(`🚀 API de tickets corriendo en http://localhost:${PORT}`));
});
