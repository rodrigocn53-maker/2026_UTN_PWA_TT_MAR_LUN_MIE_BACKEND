//Responsabilidad de manejar la logica de negocio
/* 
Registro:
    - Validar que no exista previamente el usuario
    - Enviar un mail de verificacion de correo electronico
*/
import jwt from 'jsonwebtoken'
import ENVIRONMENT from "../config/environment.config.js";
import mailerTransporter from "../config/mailer.config.js";
import ServerError from "../helpers/error.helper.js";
import userRepository from "../repository/user.repository.js";
import bcrypt from 'bcryptjs'

class AuthService {
    generateRandomTag() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Evitamos O, 0, I, 1 por legibilidad
        let tag = '';
        for (let i = 0; i < 4; i++) {
            tag += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return tag;
    }

    async generateUniqueTag(username) {
        let tag;
        let exists = true;
        let attempts = 0;
        while (exists && attempts < 10) {
            tag = this.generateRandomTag();
            const user = await userRepository.getByUsernameAndTag(username, tag);
            if (!user) exists = false;
            attempts++;
        }
        if (exists) throw new ServerError("No se pudo generar un tag único, intenta con otro nombre", 500);
        return tag;
    }

    async register({ name, email, password }) {
        if (!name || !email || !password) {
            throw new ServerError("Email, nombre de usuario y contraseña son obligatorios", 400);
        }

        const userByEmail = await userRepository.getByEmail(email);
        if (userByEmail) {
            throw new ServerError('Email ya en uso!', 400)
        }
        
        // El 'name' enviado en el registro lo usaremos como base para el 'username'
        const username = name.trim().replace(/\s+/g, '').toLowerCase();
        const tag = await this.generateUniqueTag(username);

        const passwordHashed = await bcrypt.hash(password, 12)
        await userRepository.create({ 
            name, 
            username, 
            tag, 
            email, 
            password: passwordHashed 
        });
        
        await this.sendVerifyEmail({ email, name: `${username}#${tag}` })
    }

    async verifyEmail({ verify_email_token }) {
        if (!verify_email_token) {
            throw new ServerError('No se encuentra el token', 400)
        }

        try {
            const { email } = jwt.verify(verify_email_token, ENVIRONMENT.JWT_SECRET_KEY)
            const user = await userRepository.getByEmail(email)
            if (!user) {
                throw new ServerError('El usuario no existe', 404)
            }
            else if (user.email_verified) {
                throw new ServerError('Usuario con email ya validado', 400)
            }
            else {
                const user_updated = await userRepository.updateById(
                    user._id,
                    { email_verified: true }
                )
                if (!user_updated.email_verified) {
                    throw new ServerError('Usuario no se pudo actualizar', 400)
                }
                else {
                    return user_updated
                }
            }
        }
        catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                const { email, name } = jwt.decode(verify_email_token)
                await this.sendVerifyEmail({ email, name })
                throw new ServerError('El token de verificacion expiro', 401)
            }
            else if (error instanceof jwt.JsonWebTokenError) {
                throw new ServerError('Token invalido', 401)
            }
            else {
                throw error
            }
        }
    }

    async login({ email, password }) {
        const user = await userRepository.getByEmail(email);
        if (!user) {
            throw new ServerError('Usuario no encontrado', 404);
        }
        if (!user.email_verified) {
            throw new ServerError('Usuario no verificado', 401);
        }
        const is_same_password = await bcrypt.compare(password, user.password)
        if (!is_same_password) {
            throw new ServerError('Contraseña incorrecta', 401);
        }

        const auth_token = jwt.sign(
            {
                email: user.email,
                name: user.name,
                username: user.username,
                tag: user.tag,
                id: user._id,
                created_at: user.created_at
            },
            ENVIRONMENT.JWT_SECRET_KEY,
            { expiresIn: '7d' }
        )
        return auth_token
    }

    async sendVerifyEmail({ email, name }) {
        const verify_email_token = jwt.sign(
            { email: email },
            ENVIRONMENT.JWT_SECRET_KEY,
            { expiresIn: '7d' }
        )
        await mailerTransporter.sendMail(
            {
                from: ENVIRONMENT.MAIL_USER,
                to: email,
                subject: `Bienvenido verifica tu correo electronico`,
                html: `
                    <h1>Bienvenido</h1>
                    <p>Te has registrado correctamente, necesitamos verificar tu correo electronico</p>
                    <a href="${ENVIRONMENT.URL_BACKEND + `/api/auth/verify-email?verify_email_token=${verify_email_token}`}">Click aqui para verificar</a>
                    <span>Si no reconoces este registro desestima este mail.</span>
                `
            }
        )
    }

    async resetPasswordRequest({ email }) {
        if (!email) {
            throw new ServerError("El email es obligatorio", 400)
        }
        try {
            const user = await userRepository.getByEmail(email);
            if (!user) {
                throw new ServerError("El usuario no existe", 404)
            }

            const secret = ENVIRONMENT.JWT_SECRET_KEY + user.password;
            const reset_password_token = jwt.sign(
                { email },
                secret,
                { expiresIn: "15m" }
            )

            await mailerTransporter.sendMail({
                from: ENVIRONMENT.MAIL_USER,
                to: email,
                subject: "Restablecimiento de contraseña",
                html: `
                    <h1> Restablecimiento de contraseña</h1>
                    <p>Has solicitado restablecer tu contraseña. Haz clic en el enlace para hacerlo</p>
                    <a href="${ENVIRONMENT.URL_FRONTEND + `/reset-password/${reset_password_token}`}">Click aqui para restablecer</a>
                    <span>Si no reconoces este registro, desestima este mail.</span>
                `
            })
        } catch (error) {
            if (error instanceof ServerError) throw error;
            throw new ServerError("Error al solicitar el restablecimiento de contraseña", 500)
        }
    }

    async resetPassword({ reset_password_token, password }) {
        if (!reset_password_token || !password) {
            throw new ServerError("Todos los campos son obligatorios", 400)
        }
        try {
            const decoded = jwt.decode(reset_password_token);
            if (!decoded || !decoded.email) {
                throw new ServerError("Token inválido", 400);
            }

            const user = await userRepository.getByEmail(decoded.email);
            if (!user) {
                throw new ServerError("El usuario no existe", 404)
            }

            const secret = ENVIRONMENT.JWT_SECRET_KEY + user.password;
            jwt.verify(reset_password_token, secret);

            const hashedPassword = await bcrypt.hash(password, 12);
            await userRepository.updateById(user._id, { password: hashedPassword });

        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new ServerError("Token de restablecimiento de contraseña inválido", 400)
            }
            else if (error instanceof jwt.TokenExpiredError) {
                throw new ServerError("Token de restablecimiento de contraseña expirado", 400)
            }
            throw error
        }
    }
}

const authService = new AuthService()
export default authService