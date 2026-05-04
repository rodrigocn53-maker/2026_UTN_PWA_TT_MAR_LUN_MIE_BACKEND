# Slack Clone API - Backend

Este es el servidor principal para el clon de Slack, una API REST robusta construida con Node.js y Express, siguiendo una arquitectura profesional en capas.

## 🚀 Tecnologías Utilizadas

- **Node.js & Express**: Entorno de ejecución y framework web.
- **MongoDB & Mongoose**: Base de datos NoSQL y modelado de objetos.
- **JWT (JSON Web Tokens)**: Autenticación segura y gestión de sesiones.
- **Bcryptjs**: Hashing de contraseñas (12 salt rounds).
- **Nodemailer**: Sistema de envío de correos electrónicos transaccionales.
- **Cloudinary**: Gestión de almacenamiento multimedia (imágenes y audios).
- **Dotenv**: Gestión de variables de entorno.
- **CORS**: Intercambio de recursos de origen cruzado.

## 🏗️ Arquitectura del Proyecto

La API sigue una **Arquitectura en Capas** para garantizar el desacoplamiento y la escalabilidad:

- **Routes (`/src/routes`)**: Define los puntos de entrada de la API y asigna los middlewares necesarios.
- **Controllers (`/src/controllers`)**: Maneja el flujo de la solicitud (request) y la respuesta (response).
- **Services (`/src/services`)**: Contiene la lógica de negocio pura. Es independiente de la tecnología de base de datos.
- **Repositories (`/src/repository`)**: Capa de acceso a datos que interactúa directamente con los modelos de Mongoose.
- **Models (`/src/models`)**: Define los esquemas de datos de MongoDB.
- **Middlewares (`/src/middlewares`)**: Filtros de seguridad, validación y manejo de errores.

## 🛡️ Seguridad y Funcionalidades Core

### Autenticación y Autorización
- **Hashing**: Todas las contraseñas se encriptan antes de guardarse.
- **JWT**: Generación de Bearer tokens con expiración para sesiones seguras.
- **Verificación de Email**: Al registrarse, el sistema envía un link de activación único. El usuario debe verificar su cuenta para poder loguearse.
- **Protección de Rutas**: Middleware de autenticación que valida el token en cada petición sensible.

### Middlewares Obligatorios
- **CORS**: Configurado para permitir conexiones seguras desde el Frontend.
- **Centralized Error Handler**: Un middleware global que captura y formatea todos los errores del sistema.
- **Input Validation**: Validación de datos obligatorios en la capa de servicios.

## ⚙️ Configuración e Instalación

1. Clona el repositorio.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura el archivo `.env` en la raíz del proyecto:
   ```env
   PORT=3000
   MONGO_DB_CONNECTION_STRING=tu_url_de_mongodb
   JWT_SECRET_KEY=tu_secreto_super_seguro
   MAIL_USER=tu_correo_de_envio@gmail.com
   MAIL_PASSWORD=tu_password_de_aplicacion
   URL_FRONTEND=http://localhost:5173
   URL_BACKEND=http://localhost:3000
   ```
4. Inicia el servidor:
   ```bash
   npm run dev
   ```

## 📄 Documentación de API

Para facilitar la integración y las pruebas, se listan los endpoints principales de la aplicación:

### 🔐 Autenticación (`/api/auth`)
| Método | Endpoint | Descripción | Protegido |
| :--- | :--- | :--- | :--- |
| POST | `/register` | Registra un nuevo usuario | No |
| POST | `/login` | Inicia sesión y devuelve un token | No |
| GET | `/verify-email` | Verifica el correo mediante token | No |
| POST | `/reset-password-request` | Solicita recuperación de contraseña | No |
| POST | `/reset-password/:token` | Establece una nueva contraseña | No |

### 🏢 Workspaces (`/api/workspace`)
| Método | Endpoint | Descripción | Protegido |
| :--- | :--- | :--- | :--- |
| GET | `/` | Lista workspaces del usuario | Sí |
| POST | `/` | Crea un nuevo workspace | Sí |
| GET | `/:workspace_id` | Obtiene detalles de un workspace | Sí |
| DELETE | `/:workspace_id` | Elimina un workspace (solo Owner) | Sí |
| POST | `/:workspace_id/invite` | Invita a un usuario al workspace | Sí |

### 💬 Canales (`/api/workspace/:workspace_id/channels`)
| Método | Endpoint | Descripción | Protegido |
| :--- | :--- | :--- | :--- |
| GET | `/` | Lista canales de un workspace | Sí |
| POST | `/` | Crea un canal en el workspace | Sí |
| DELETE | `/:channel_id` | Elimina un canal específico | Sí |

### ✉️ Mensajes (`/api/workspace/:workspace_id/channels/:channel_id/messages`)
| Método | Endpoint | Descripción | Protegido |
| :--- | :--- | :--- | :--- |
| GET | `/` | Obtiene historial de mensajes | Sí |
| POST | `/` | Envía un mensaje (soporta archivos) | Sí |
| PUT | `/:message_id` | Edita un mensaje (máx 5 min) | Sí |
| DELETE | `/:message_id` | Elimina un mensaje | Sí |

### 👤 Usuarios y Contactos (`/api/user`)
| Método | Endpoint | Descripción | Protegido |
| :--- | :--- | :--- | :--- |
| GET | `/` | Lista todos los usuarios (para búsqueda) | Sí |
| GET | `/contacts` | Lista contactos del usuario | Sí |
| POST | `/contacts/:contactId` | Envía solicitud de contacto | Sí |
| DELETE | `/contacts/:contactId` | Elimina un contacto | Sí |
| PUT | `/profile` | Actualiza perfil (nombre/avatar) | Sí |

### 📥 Mensajes Directos (`/api/dm`)
| Método | Endpoint | Descripción | Protegido |
| :--- | :--- | :--- | :--- |
| GET | `/conversations` | Lista conversaciones activas | Sí |
| GET | `/history/:contactId` | Historial de chat con un contacto | Sí |
| POST | `/send/:receiverId` | Envía mensaje directo | Sí |

---

### 🚀 Cómo probar la API
En la raíz de esta carpeta encontrarás el archivo `Api Slack.postman_collection.json` que puedes importar en Postman para probar todos estos endpoints de forma interactiva.

---
Proyecto desarrollado para el Trabajo Integrador Final - Fullstack (React + Express).