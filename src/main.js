import ENVIRONMENT from "./config/environment.config.js"
import connectMongoDB from "./config/mongoDB.config.js"
/* import User from "./models/user.model.js"
import Workspace from "./models/workspace.model.js" */
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
import mailerTransporter from "./config/mailer.config.js"
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authMiddleware from "./middlewares/authMiddleware.js"
import errorHandlerMiddleware from "./middlewares/errorHandler.middleware.js"
import ServerError from "./helpers/error.helper.js"


connectMongoDB()


const app = express()

/* 
API es privada y los clientes son limitados y de confianza
WHITE LIST DE DOMINIOS PERMITIDOS
*/
const allowedDomains = [
    'http://localhost:5173', //Frontend local
    'http://localhost:5174', //Frontend local alternativo
    ENVIRONMENT.URL_FRONTEND //Frontend desplegado (Traído desde el .env)
]

app.use(cors(
    {
        // origin direccion de quien consulta 
        origin: (origin, callback) => {
            //Si no hay origin (ej. Postman o llamadas locales)
            if (!origin) {
                return callback(null, true)
            }
            //Si el origin esta en la white list, permito la peticion
            if (allowedDomains.includes(origin)) {
                return callback(null, true)
            } else {
                return callback(new ServerError('No autorizado por CORS', 403))
            }
        },
        credentials: true
    }
))

app.use(cookieParser())

/* 
API es publica y los clientes son ilimitados
BLACK LIST DE DOMINIOS PROHIBIDOS (Comentado para arreglar el error de fetch)
*/
/*
const blockedOrgins = [
    'http://localhost:5173' //Front esta bloqueado
]
app.use(
    cors(
        {
            origin: (origin, callback) => {
                if (blockedOrgins.includes(origin)) {
                    callback(new ServerError('No autorizado', 403))
                } else {
                    callback(null, true)
                }
            }
        }
    )
)
*/

// app.use(cors()) // CORS Global desactivado, ahora usamos la White List de arriba.

app.use(express.json())


/* 
Delegamos las consultas que vengan sobre '/api/health' al healthRouter
*/
app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/workspace', workspaceRouter)
app.use('/api/notifications', notificationRouter)
app.use('/api/search', searchRouter)

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

//Siempre debe ir al final de todos los endpoints, rutas o middlewares
//Para poder dar uso correcto, nuestros controladores ahora seran "middlewares"
app.use(
    errorHandlerMiddleware
)

app.listen(
    ENVIRONMENT.PORT,
    () => {
        console.log('La aplicacion se esta escuchando en el puerto ' + ENVIRONMENT.PORT)
    }
)

