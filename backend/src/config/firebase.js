const admin = require('firebase-admin');

if (!admin.apps.length) {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error(
      'Falta la variable de entorno FIREBASE_SERVICE_ACCOUNT. Revisa el archivo .env (ver .env.example).'
    );
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (err) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT no es un JSON válido. Debe ser el contenido completo del archivo del service account.'
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
