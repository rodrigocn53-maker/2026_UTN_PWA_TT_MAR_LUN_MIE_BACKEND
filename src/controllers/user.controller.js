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
}

const userController = new UserController()
export default userController
