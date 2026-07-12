# Sistema de Tickets / Casos

Aplicación full-stack de gestión de casos con 4 roles:

- **Super administrador**: control total, crea/gestiona administradores, agentes y solicitantes.
- **Administrador**: crea/gestiona agentes y solicitantes, asigna casos, ve reportes.
- **Agente (usuario)**: resuelve los casos que le asignan, cambia su estado, comenta.
- **Solicitante (persona)**: registra casos y da seguimiento a los suyos.

Stack: **React (Vite)** + **Node.js/Express** + **Firebase** (Authentication + Firestore).

---

## 1. Crear el proyecto en Firebase

1. Ve a https://console.firebase.google.com y crea un proyecto nuevo.
2. **Authentication** → Sign-in method → habilita **Correo/Contraseña**.
3. **Firestore Database** → crea la base de datos (modo producción).
4. En **Configuración del proyecto → Cuentas de servicio**, haz clic en "Generar nueva clave privada". Se descarga un JSON: esto es lo que usará el backend.
5. En **Configuración del proyecto → General → Tus apps**, crea una app Web y copia el `firebaseConfig` (esto es lo que usará el frontend).
6. En **Firestore → Reglas**, pega el contenido del archivo `firestore.rules` que está en la raíz de este proyecto y publica.

## 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edita `.env`:
- Pega el JSON completo del service account (paso 4) en `FIREBASE_SERVICE_ACCOUNT`, todo en una sola línea.
- Define el correo/contraseña del primer super administrador (`BOOTSTRAP_SUPERADMIN_*`). Se crea automáticamente la primera vez que arranca el servidor si no existe ningún superadmin todavía.

```bash
npm run dev
```

El servidor queda en `http://localhost:4000`. En la consola verás confirmación de que el super administrador fue creado.

## 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Edita `src/firebase.js` y reemplaza los valores de `firebaseConfig` con los del paso 5.

```bash
npm run dev
```

La app queda en `http://localhost:5173`. Inicia sesión con el correo/contraseña del super administrador que configuraste en el backend.

## 4. Primeros pasos dentro de la app

1. Inicia sesión como super administrador.
2. Ve a **Usuarios** → crea administradores, agentes y/o solicitantes.
3. Un solicitante puede entrar y usar **Registrar caso** para crear un caso.
4. Un admin/superadmin va a **Casos**, abre el caso y lo **asigna a un agente**.
5. El agente cambia el **estado** del caso (en proceso → resuelto → cerrado) y puede comentar.
6. Todos pueden comentar en el caso; las notificaciones llegan en tiempo real (icono de campana).
7. **Reportes** (solo admin/superadmin) muestra estadísticas por estado, prioridad, categoría y carga de trabajo por agente.

## 5. Índices de Firestore

Algunas consultas combinadas (por ejemplo, casos filtrados por estado para un agente, u órdenes por fecha) pueden pedirte crear un **índice compuesto** la primera vez que se ejecutan. Firestore muestra un enlace directo en la consola del navegador/servidor para crearlo con un clic — solo ábrelo y confirma.

## 6. Notas de seguridad

- El backend usa el **Admin SDK** de Firebase, por lo que tiene acceso total a Firestore; toda la autorización por rol se valida en el middleware (`backend/src/middleware/auth.js`) y en cada controlador.
- El frontend **nunca** escribe directamente a Firestore para datos de casos/usuarios — todo pasa por la API del backend. La única excepción es la lectura en tiempo real de notificaciones propias, protegida por `firestore.rules`.
- Cambia `BOOTSTRAP_SUPERADMIN_PASSWORD` inmediatamente después del primer inicio de sesión.

## 7. Estructura del proyecto

```
ticket-system/
├── backend/
│   └── src/
│       ├── config/firebase.js       # Admin SDK
│       ├── middleware/auth.js       # verifica token + rol
│       ├── controllers/             # lógica de usuarios, casos, comentarios, reportes, notificaciones
│       ├── routes/                  # endpoints REST
│       └── index.js                 # servidor + creación del superadmin inicial
├── frontend/
│   └── src/
│       ├── firebase.js              # config cliente
│       ├── context/AuthContext.jsx  # sesión + perfil + rol
│       ├── services/                # llamadas a la API y a Firestore (notificaciones)
│       ├── components/              # Layout, Sidebar, badges, campana de notificaciones
│       └── pages/                   # Login, Dashboard, Casos, CasoDetail, NuevoCaso, Usuarios, Reportes
└── firestore.rules
```
