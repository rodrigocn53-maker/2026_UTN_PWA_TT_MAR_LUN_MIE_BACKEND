/* 
GET /api/workspace 
Trae todos los espacios de trabajo asociado al usuario
Para saber que espacios de trabajo traer NECESITAMOS EL ID DEL USUARIO
*/

import {Router} from 'express'
import workspaceController from '../controllers/workspace.controller.js'
import authMiddleware from '../middlewares/authMiddleware.js'
import verifyMemberWorkspaceRoleMiddleware from '../middlewares/verifyMemberWorkspaceMiddleware'
import channelRouter from './channel.router.js'

const workspaceRouter = Router()

workspaceRouter.get(
    '/:workspace_id/member',
    workspaceController.respondToInvitation
)

workspaceRouter.use(authMiddleware)
workspaceRouter.get(
    '/',
    workspaceController.getWorkspaces
)

workspaceRouter.post(
    '/',
    workspaceController.create
)

workspaceRouter.get(
    '/:workspace_id',
    
    verifyMemberWorkspaceRoleMiddleware([]),
    workspaceController.getById
)

workspaceRouter.post(
    '/:workspace_id/member/invite',
    verifyMemberWorkspaceRoleMiddleware(['admin', 'owner']),
    workspaceController.inviteMember
)

workspaceRouter.put(
    '/:workspace_id',
    verifyMemberWorkspaceRoleMiddleware(['owner', 'admin']),
    workspaceController.update
)

workspaceRouter.delete(
    '/:workspace_id',
    verifyMemberWorkspaceRoleMiddleware(['owner']),
    workspaceController.delete
)

workspaceRouter.delete(
    '/:workspace_id/leave',
    verifyMemberWorkspaceRoleMiddleware([]),
    workspaceController.leave
)

workspaceRouter.use(
    '/:workspace_id/channels', 
    channelRouter
)


export default workspaceRouter