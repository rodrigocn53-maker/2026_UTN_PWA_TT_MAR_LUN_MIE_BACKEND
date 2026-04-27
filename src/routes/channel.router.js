import express from 'express'
import channelController from '../controllers/channel.controller.js'
import verifyWorkspaceMiddleware from '../middlewares/verifyWorkspace.middleware.js'
import verifyMemberWorkspaceRoleMiddleware from '../middlewares/verifyMemberWorkspaceMiddleware'
import verifyChannelMiddleware from '../middlewares/verifyChannel.middleware.js'
import AVIABLE_MEMBER_ROLES from '../constants/roles.constant.js'
import messageRouter from './message.router.js'
const channelRouter = express.Router({mergeParams: true})

channelRouter.use(verifyWorkspaceMiddleware)


channelRouter.post(
    '/', 
    verifyMemberWorkspaceRoleMiddleware(
        [AVIABLE_MEMBER_ROLES.OWNER],
        [AVIABLE_MEMBER_ROLES.ADMIN]
    ),
    channelController.create
)

channelRouter.get(
    '/', 
    verifyMemberWorkspaceRoleMiddleware(),
    channelController.getAll
)

channelRouter.delete(
    '/:channel_id', 
     verifyMemberWorkspaceRoleMiddleware(
        [AVIABLE_MEMBER_ROLES.OWNER]
    ),
    verifyChannelMiddleware, 
    channelController.delete
)

channelRouter.use(
    '/:channel_id/messages',
    verifyChannelMiddleware,
    messageRouter
)

export default channelRouter