import ENVIRONMENT from "./config/environment.config.js"
import connectMongoDB from "./config/mongoDB.config.js"
import WorkspaceMember from "./models/workspaceMember.model.js"
import workspaceMemberRepository from "./repository/member.repository.js"
import userRepository from "./repository/user.repository.js"
import workspaceRepository from "./repository/workspace.repository.js"
import express, { response } from 'express';
import healthRouter from "./routes/health.router.js"
import authRouter from "./routes/auth.router.js"
import workspaceRouter from "./routes/workspace.router.js"
import notificationRouter from "./routes/notification.router.js"
import searchRouter from "./routes/search.router.js"
import userRouter from "./routes/user.router.js"
import supportRouter from "./routes/support.router.js"
import mailerTransporter from "./config/mailer.config.js"

// Verificar conexión con el servidor de correos al arrancar
mailerTransporter.verify((error, success) => {
    if (error) {
        console.error('[Mailer Error] Error de configuración:', error.message);
    } else {
        console.log('[Mailer Success] El servidor de correos está listo.');
    }
});
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authMiddleware from "./middlewares/authMiddleware.js"
import errorHandlerMiddleware from "./middlewares/errorHandler.middleware.js"
import ServerError from "./helpers/error.helper.js"


connectMongoDB()


const app = express()

// Servir archivos estáticos (para las imágenes y audios subidos)
app.use('/public', express.static('public'));

const allowedDomains = [
    'http://localhost:5173',
    'http://localhost:5174',
    ENVIRONMENT.URL_FRONTEND?.replace(/\/$/, ""), // Quita la barra final si existe
]

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        
        // Si el origen está en la lista o es un subdominio de vercel.app del proyecto
        const isAllowed = allowedDomains.includes(origin);
        const isVercelPreview = origin.endsWith('.vercel.app') && origin.includes('2026-utn-pwa-tt-mar-lun-mie');

        if (isAllowed || isVercelPreview) {
            callback(null, true);
        } else {
            console.error('CORS Bloqueado para:', origin);
            callback(new ServerError('No autorizado por CORS', 403));
        }
    },
    credentials: true
}));

app.use(cookieParser())

app.use(express.json())


app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/workspace', workspaceRouter)
app.use('/api/notifications', notificationRouter)
app.use('/api/search', searchRouter)
app.use('/api/users', userRouter)
app.use('/api/support', supportRouter)

app.get(
    '/api/test',
    authMiddleware,
    (request, response, next) => {
        try {
            const { user } = request
            if (true) {
                throw new ServerError('Error interno X', 400)
            }
            response.send('ok, vos sos: ' + user.id)
        }
        catch (error) {
            next(error)
        }
    }
)

app.use(
    errorHandlerMiddleware
)

export default app

if (!process.env.VERCEL) {
    app.listen(
        ENVIRONMENT.PORT,
        () => {
            console.log('La aplicacion se esta escuchando en el puerto ' + ENVIRONMENT.PORT)
        }
    )
}

