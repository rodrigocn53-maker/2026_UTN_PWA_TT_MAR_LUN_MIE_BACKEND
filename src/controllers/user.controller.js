import userService from "../services/user.service.js"

class UserController {
    async getAllUsers(req, res, next) {
        try {
            const excludeId = req.user.id
            const users = await userService.getAllUsers(excludeId)
            
            res.status(200).json({
                ok: true,
                status: 200,
                message: 'Lista de usuarios obtenida',
                data: users
            })
        } catch (error) {
            next(error)
        }
    }

    async addContact(req, res, next) {
        try {
            const userId = req.user.id;
            const { contact_id } = req.body;
            await userService.addContact(userId, contact_id);
            res.status(200).json({
                ok: true,
                status: 200,
                message: 'Contacto agregado correctamente'
            });
        } catch (error) {
            next(error)
        }
    }

    async removeContact(req, res, next) {
        try {
            const userId = req.user.id;
            const { contact_id } = req.params;
            await userService.removeContact(userId, contact_id);
            res.status(200).json({
                ok: true,
                status: 200,
                message: 'Contacto eliminado correctamente'
            });
        } catch (error) {
            next(error)
        }
    }

    async getContacts(req, res, next) {
        try {
            const userId = req.user.id;
            const contacts = await userService.getContacts(userId);
            res.status(200).json({
                ok: true,
                status: 200,
                message: 'Contactos obtenidos',
                data: contacts
            });
        } catch (error) {
            next(error)
        }
    }

    async updateProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const { name, avatar_config } = req.body;
            
            // Si hay un archivo (gracias al middleware de multer/cloudinary), usamos su URL
            const avatar = req.file ? req.file.path : undefined;

            // Parsear avatar_config si viene como string (form-data lo envía como string)
            let parsedConfig = avatar_config;
            if (typeof avatar_config === 'string') {
                try {
                    parsedConfig = JSON.parse(avatar_config);
                } catch (e) {
                    parsedConfig = undefined;
                }
            }

            const updatedUser = await userService.updateProfile(userId, { 
                name, 
                avatar, 
                avatar_config: parsedConfig 
            });

            res.status(200).json({
                ok: true,
                status: 200,
                message: 'Perfil actualizado correctamente',
                data: {
                    user: {
                        name: updatedUser.name,
                        avatar: updatedUser.avatar,
                        avatar_config: updatedUser.avatar_config
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

const userController = new UserController()
export default userController
