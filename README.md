# TalentLink

App móvil tipo LinkedIn simplificado para conectar estudiantes con reclutadores.
Hecha con Ionic + React + Capacitor y Firebase. Proyecto final de Desarrollo Móvil, Universidad Autónoma de Occidente.

## Integrantes

| Integrante | Módulo | Rama |
|---|---|---|
| Lucas Garcia | Identidad, perfil, rutas y administración | `develop-Lucas` |
| Laura Campo | Vacantes, búsqueda, postulaciones y geolocalización | `develop-Laura` |
| Alex Silva | Chat en tiempo real, hoja de vida y código QR | `develop-Alex` |

## Prototipo

Prototipo hecho con IA en Lovable:

- Proyecto en Lovable: https://lovable.dev/projects/7531cc6b-1286-553e-a55a-4f674b26497b
- Prototipo publicado: https://talent-link-mity.lovable.app

## Repositorio y ramas

Repositorio: https://github.com/Mity619/TalentLink

- `main`: versión de entrega.
- `develop`: integración. Cada rama personal se mezcla aquí por Pull Request.
- `develop-Lucas`, `develop-Laura`, `develop-Alex`: trabajo de cada integrante.

## Funcionalidades

- **Cuentas:** registro e inicio de sesión como estudiante o reclutador, sesión persistente y rutas protegidas.
- **Perfil:** nombre, habilidades y foto con la cámara (o un archivo en la web). Código QR con los datos del perfil.
- **Vacantes:** los reclutadores publican, editan y borran. Los estudiantes buscan, filtran por área, modalidad y distancia, y guardan vacantes.
- **Postulaciones:** con transacción y ID compuesto `jobId_uid`, para que nadie se postule dos veces.
- **Chat en tiempo real:** entre estudiante y reclutador, con borrador del mensaje guardado en el dispositivo.
- **Hoja de vida:** subir un PDF o llenar un formulario.
- **Administración:** listar y buscar usuarios, cambiar roles, bloquear y eliminar.

## APIs y servicios

| API / servicio | Uso |
|---|---|
| Firebase Authentication | Registro e inicio de sesión con correo y contraseña |
| Cloud Firestore | Usuarios, vacantes, postulaciones, vacantes guardadas, hojas de vida y chats (`onSnapshot` para tiempo real) |
| Firebase Storage | Fotos de perfil (`profiles/`) y hojas de vida en PDF (`cvs/`) |
| Capacitor Camera | Foto de perfil |
| Capacitor Geolocation | Ubicación del estudiante y distancia a las vacantes |
| Capacitor Preferences | Sesión, filtros, vacantes guardadas y borradores de chat |
| qrcode.react | Código QR del perfil |

Las reglas de seguridad están en [`TalentLink/firestore.rules`](TalentLink/firestore.rules) y [`TalentLink/storage.rules`](TalentLink/storage.rules). Se publican desde la consola de Firebase.

## Ejecución

Requisitos: Node.js 20 o superior y un proyecto de Firebase con Authentication (correo y contraseña), Firestore y Storage activados.

1. Instalar dependencias:
   ```bash
   cd TalentLink
   npm install
   ```
2. Crear `TalentLink/.env` con las claves del proyecto de Firebase (no se sube al repositorio):
   ```env
   VITE_FIREBASE_API_KEY=
   VITE_FIREBASE_AUTH_DOMAIN=
   VITE_FIREBASE_DATABASE_URL=
   VITE_FIREBASE_PROJECT_ID=
   VITE_FIREBASE_STORAGE_BUCKET=
   VITE_FIREBASE_MESSAGING_SENDER_ID=
   VITE_FIREBASE_APP_ID=
   ```
3. Iniciar en el navegador:
   ```bash
   npm run dev
   ```
   Abre http://localhost:5173.
4. Android (opcional):
   ```bash
   npm run build
   npx cap add android
   npx cap sync android
   npx cap open android
   ```

## Estructura

```
TalentLink/src/
  Components/   Jobs/, Profile/, Shared/ (pestañas y menú)
  Context/      AuthContext, JobContext, ApplicationContext, SavedJobContext
  Helpers/      firebase, servicios de Firestore/Storage, validadores, distancia
  Hooks/        useAuth, useJobs, useApplications, useSavedJobs, useLocation
  Pages/        Welcome, Login, Register, Index, Jobs, Chats, CV, Profile, Admin
  Routes/       PrivateRoute y AdminRoute
```

## Documentación

Documento final con arquitectura y tecnologías: [`docs/Documento_Final.pdf`](docs/Documento_Final.pdf)
