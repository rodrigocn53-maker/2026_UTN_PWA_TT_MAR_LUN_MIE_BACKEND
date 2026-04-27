import ChannelMessages from "../models/channelMessages.model.js"
import ServerError from "../helpers/error.helper.js"

class MessageRepository {
    async create(fk_id_channel, fk_id_member, content) {
        try {
            const message = await ChannelMessages.create({
                fk_id_channel,
                fk_id_member,
                content
            })
            // Poblamos el miembro para tener acceso al usuario creador
            await message.populate({
                path: 'fk_id_member',
                populate: {
                    path: 'fk_id_user',
                    select: 'name email'
                }
            })
            return message
        } catch (error) {
            throw new ServerError("Error al guardar el mensaje", 500)
        }
    }

    async getByChannelId(channel_id) {
        try {
            const messages = await ChannelMessages.find({ fk_id_channel: channel_id })
                .populate({
                    path: 'fk_id_member',
                    populate: {
                        path: 'fk_id_user',
                        select: 'name email'
                    }
                })
                .sort({ created_at: 1 }) // Orden cronológico (más antiguos primero)
            
            return messages
        } catch (error) {
            throw new ServerError("Error al obtener los mensajes", 500)
        }
    }
}

const messageRepository = new MessageRepository()
export default messageRepository
