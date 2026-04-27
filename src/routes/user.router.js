import { Router } from "express"
import userController from "../controllers/user.controller.js"
import authMiddleware from "../middlewares/authMiddleware.js"

const userRouter = Router()

userRouter.use(authMiddleware)

userRouter.get('/', userController.getAllUsers)

export default userRouter
