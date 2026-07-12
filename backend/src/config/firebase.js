const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

function cargarServiceAccount() {
  // Opción 1 (recomendada en Windows): archivo serviceAccountKey.json en la carpeta backend/
  const rutaPorDefecto = path.join(__dirname, '..', '..', 'serviceAccountKey.json');
  const rutaPersonalizada = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    ? path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    : rutaPorDefecto;

  if (fs.existsSync(rutaPersonalizada)) {
    try {
      return JSON.parse(fs.readFileSync(rutaPersonalizada, 'utf8'));
    } catch (err) {
      throw new Error(`El archivo ${rutaPersonalizada} no es un JSON válido: ${err.message}`);
    }
  }

  // Opción 2: JSON completo pegado en la variable de entorno FIREBASE_SERVICE_ACCOUNT
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (err) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT no es un JSON válido. Debe ser el contenido completo del archivo del service account, en una sola línea y entre comillas simples.'
      );
    }
  }

  throw new Error(
    `No se encontró la credencial de Firebase. Coloca el archivo descargado desde Firebase Console como "backend/serviceAccountKey.json" (recomendado), o define FIREBASE_SERVICE_ACCOUNT en el .env. Se buscó en: ${rutaPersonalizada}`
  );
}

if (!admin.apps.length) {
  const serviceAccount = cargarServiceAccount();

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
