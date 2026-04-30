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
En la raíz de esta carpeta encontrarás el archivo `Api Slack.postman_collection.json` que puedes importar en Postman para probar todos los endpoints disponibles.

---
Proyecto desarrollado para el Trabajo Integrador Final - Fullstack (React + Express).