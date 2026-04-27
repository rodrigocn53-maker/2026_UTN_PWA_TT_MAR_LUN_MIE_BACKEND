import express from 'express'
import authController from '../controllers/auth.controller.js'
import authMiddleware from '../middlewares/authMiddleware.js'
const authRouter = express.Router()

authRouter.post(
    '/register', 
    authController.register
)

authRouter.post(
    '/login', 
    authController.login
)

authRouter.post(
    '/logout',
    authController.logout
)

authRouter.get(
    '/verify-email',
    authController.verifyEmail
)

authRouter.get(
    '/verify-token',
    authMiddleware,
    authController.verifyToken
)


authRouter.post(
    '/reset-password-request',
    authController.resetPasswordRequest
)

authRouter.post(
    '/reset-password/:reset_password_token',
    authController.resetPassword

)
export default authRouter