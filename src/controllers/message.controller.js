import messageService from "../services/message.service.js"

class MessageController {
    async create(req, res, next) {
        try {
            const workspace_id = req.workspace._id
            const channel_id = req.channel.channel_id
            const user_id = req.user.id
            const { content } = req.body
            
            let file_url = null;
            let file_type = null;

            if (req.file) {
                file_url = `/public/uploads/${req.file.filename}`;
                file_type = req.file.mimetype.startsWith('image/') ? 'image' : 'audio';
            }

            const message = await messageService.create(workspace_id, channel_id, user_id, content, file_url, file_type)

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
    async update(req, res, next) {
        try {
            const workspace_id = req.workspace._id
            const { message_id } = req.params
            const user_id = req.user.id
            const { content } = req.body

            const message = await messageService.update(workspace_id, message_id, user_id, content)

            res.status(200).json({
                ok: true,
                status: 200,
                message: 'Mensaje actualizado exitosamente',
                data: {
                    message
                }
            })
        } catch (error) {
            next(error)
        }
    }

    async delete(req, res, next) {
        try {
            const workspace_id = req.workspace._id
            const { message_id } = req.params
            const user_id = req.user.id

            await messageService.delete(workspace_id, message_id, user_id)

            res.status(200).json({
                ok: true,
                status: 200,
                message: 'Mensaje eliminado exitosamente'
            })
        } catch (error) {
            next(error)
        }
    }
}

const messageController = new MessageController()
export default messageController
