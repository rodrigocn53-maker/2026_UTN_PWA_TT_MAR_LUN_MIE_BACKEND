import { Router } from "express"
import userController from "../controllers/user.controller.js"
import authMiddleware from "../middlewares/authMiddleware.js"

const userRouter = Router()

userRouter.use(authMiddleware)

userRouter.get('/', userController.getAllUsers)
userRouter.post('/contacts', userController.addContact)
userRouter.delete('/contacts/:contact_id', userController.removeContact)
userRouter.get('/contacts', userController.getContacts)

export default userRouter
