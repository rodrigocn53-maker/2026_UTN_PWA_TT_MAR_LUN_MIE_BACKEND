import ChannelMessages from "../models/channelMessages.model.js"
import ServerError from "../helpers/error.helper.js"

class MessageRepository {
    async create(fk_id_channel, fk_id_member, content, file_url = null, file_type = null) {
        try {
            const message = await ChannelMessages.create({
                fk_id_channel,
                fk_id_member,
                content,
                file_url,
                file_type
            })
            await message.populate({
                path: 'fk_id_member',
                populate: {
                    path: 'fk_id_user',
                    select: 'name email avatar avatar_config'
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
                        select: 'name email avatar avatar_config'
                    }
                })
                .sort({ created_at: 1 })
            
            return messages
        } catch (error) {
            throw new ServerError("Error al obtener los mensajes", 500)
        }
    }

    async getById(message_id) {
        try {
            return await ChannelMessages.findById(message_id)
                .populate({
                    path: 'fk_id_member',
                    populate: {
                        path: 'fk_id_user',
                        select: 'name email avatar avatar_config'
                    }
                })
        } catch (error) {
            throw new ServerError("Error al obtener el mensaje", 500)
        }
    }

    async update(message_id, content) {
        try {
            return await ChannelMessages.findByIdAndUpdate(
                message_id,
                { content, is_edited: true },
                { new: true }
            ).populate({
                path: 'fk_id_member',
                populate: {
                    path: 'fk_id_user',
                    select: 'name email avatar avatar_config'
                }
            })
        } catch (error) {
            throw new ServerError("Error al actualizar el mensaje", 500)
        }
    }

    async delete(message_id) {
        try {
            return await ChannelMessages.findByIdAndDelete(message_id)
        } catch (error) {
            throw new ServerError("Error al eliminar el mensaje", 500)
        }
    }
}

const messageRepository = new MessageRepository()
export default messageRepository
