import express from 'express'
import messageController from '../controllers/message.controller.js'
import verifyMemberWorkspaceRoleMiddleware from '../middlewares/verifyMemberWorkspaceMiddleware'

const messageRouter = express.Router({mergeParams: true})

// Las validaciones de workspace y channel ya deberían haber ocurrido en los routers padres.
// Aseguramos que solo los miembros puedan leer y escribir.
messageRouter.post(
    '/', 
    verifyMemberWorkspaceRoleMiddleware([]),
    messageController.create
)

messageRouter.get(
    '/', 
    verifyMemberWorkspaceRoleMiddleware([]),
    messageController.getByChannel
)

export default messageRouter
