import messageService from "../services/message.service.js"

class MessageController {
    async create(req, res, next) {
        try {
            const workspace_id = req.workspace._id
            const channel_id = req.channel.channel_id
            const user_id = req.user.id
            const { content } = req.body

            const message = await messageService.create(workspace_id, channel_id, user_id, content)

            res.status(201).json({
                ok: true,
                status: 201,
                message: 'Mensaje enviado exitosamente',
                data: {
                    message
                }
            })
        } catch (error) {
            next(error)
        }
    }

    async getByChannel(req, res, next) {
        try {
            const workspace_id = req.workspace._id
            const channel_id = req.channel.channel_id
            const user_id = req.user.id

            const messages = await messageService.getByChannelId(workspace_id, channel_id, user_id)

            res.status(200).json({
                ok: true,
                status: 200,
                message: 'Mensajes obtenidos exitosamente',
                data: {
                    messages
                }
            })
        } catch (error) {
            next(error)
        }
    }
}

const messageController = new MessageController()
export default messageController
