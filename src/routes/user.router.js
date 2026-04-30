import { Router } from "express"
import userController from "../controllers/user.controller.js"
import authMiddleware from "../middlewares/authMiddleware.js"
import upload from "../middlewares/upload.middleware.js"

const userRouter = Router()

userRouter.use(authMiddleware)

userRouter.get('/', userController.getAllUsers)
userRouter.post('/contacts', userController.addContact)
userRouter.delete('/contacts/:contact_id', userController.removeContact)
userRouter.get('/contacts', userController.getContacts)

// Nueva ruta para actualizar perfil (Nombre y Avatar)
userRouter.put('/profile', upload.single('avatar'), userController.updateProfile)

export default userRouter
