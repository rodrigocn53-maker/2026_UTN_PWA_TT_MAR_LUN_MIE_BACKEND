import userRepository from "../repository/user.repository.js";
import authService from "../services/auth.service.js";

class AuthController {
    async register(req, res, next) {

        try {

            const { email, name, password } = req.body;

            await authService.register({ name, email, password })

            return res.status(201).json({
                ok: true,
                status: 201,
                message: "El usuario se ha creado exitosamente",
            });
        }
        catch (error) {
            next(error)
        }
    }


    async login(req, res, next) {
        try {
            const { email, password, rememberMe } = req.body;
            const auth_token = await authService.login({ email, password })

            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                // If rememberMe is true, set maxAge to 7 days. Otherwise, omit it for a session cookie.
                ...(rememberMe && { maxAge: 7 * 24 * 60 * 60 * 1000 })
            };

            res.cookie('auth_token', auth_token, cookieOptions);

            return res.status(200).json({
                message: "Login successful",
                status: 200,
                ok: true
            });
        }
        catch (error) {
            next(error)
        }
    }

    async logout(req, res, next) {
        try {
            res.clearCookie('auth_token');
            return res.status(200).json({
                ok: true,
                status: 200,
                message: "Logout exitoso"
            });
        } catch (error) {
            next(error);
        }
    }

    async verifyEmail(request, response, next) {
        try {
            const { verify_email_token } = request.query

            await authService.verifyEmail({ verify_email_token })

            response.status(200).send(`<h1>Mail verificado exitosamente</h1>`)
        }
        catch (error) {
            next(error)
        }

    }

    async resetPasswordRequest(req, res, next) {
        try {
            const { email } = req.body;
            await authService.resetPasswordRequest({ email });
            return res.status(200).json({
                ok: true,
                status: 200,
                message: "Se ha enviado un correo electrónico para restablecer la contraseña",
            });
        } catch (error) {
            next(error)
        }
    }

    async resetPassword(req, res, next) {
        try {
            const { reset_password_token } = req.params;
            const { password } = req.body;
            await authService.resetPassword({ reset_password_token, password });
            return res.status(200).json({
                ok: true,
                status: 200,
                message: "La contraseña se ha restablecido exitosamente",
            });
        } catch (error) {
            next(error)
        }
    }

    async verifyToken(req, res, next) {
        try {
            // El request.user fue seteado por el authMiddleware (payload del token)
            // Buscamos los datos actualizados en la base de datos
            const user = await userRepository.getById(req.user.id);
            
            return res.status(200).json({
                ok: true,
                status: 200,
                message: "Token is valid",
                data: {
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        username: user.username,
                        tag: user.tag,
                        created_at: user.created_at
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

}
const authController = new AuthController();
export default authController

/* 
Hacer el flujo de restablecimiento de contraseña

    POST /api/auth/reset-password-request
    body: {email}
    Esto enviara un mail al email proporcionado con un link para restablecer la password, ese link tendra un JWT firmado con datos del usuario como el email o id.
    
Por otro lado desarrollaran el 
    POST /api/auth/reset-password/:reset_token
    body: {new_password}
    El backend valida el token enviado y la nueva contraseña, si todo esta bien cambia la password

*/