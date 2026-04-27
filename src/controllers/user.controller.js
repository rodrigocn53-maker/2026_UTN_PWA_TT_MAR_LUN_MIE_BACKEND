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
}

const userController = new UserController()
export default userController
