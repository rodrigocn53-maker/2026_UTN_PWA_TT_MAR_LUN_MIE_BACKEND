import jwt from 'jsonwebtoken'
import ENVIRONMENT from '../config/environment.config.js'
import ServerError from '../helpers/error.helper.js'
import JWTHelper from '../helpers/jwt.helper.js'

function authMiddleware(request, response, next) {
    try {
        // El token se envía en la cookie HttpOnly o en el header Authorization
        let auth_token = request.cookies?.auth_token;

        if (!auth_token && request.headers.authorization) {
            auth_token = request.headers.authorization.split(' ')[1];
        }

        if(!auth_token){
            throw new ServerError('Token faltante o invalido', 401)
        }

        //Valido el token
        const payload = JWTHelper.verify(auth_token)

        //IMPORTANTE!!!, guardo en la request la sesion del usuario
        request.user = payload
        next()
    }
    catch (error) {
        if( error instanceof jwt.JsonWebTokenError ){
            return response.status(401).json(
                {
                    ok: false,
                    status: 401,
                    message: 'Token invalido'
                }
            )
        }
        //Errores esperables en el sistema
        if (error instanceof ServerError) {
            return response.status(error.status).json(
                {
                    ok: false,
                    status: error.status,
                    message: error.message
                }
            )
        }
        else {
            console.error('Error inesperado en el registro', error)
            return response.status(500).json(
                {
                    ok: false,
                    status: 500,
                    message: "Internal server error"
                }
            )
        }
    }

}

export default authMiddleware