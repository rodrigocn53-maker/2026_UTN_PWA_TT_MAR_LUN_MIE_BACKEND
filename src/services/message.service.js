import ServerError from "../helpers/error.helper.js"
import messageRepository from "../repository/message.repository.js"
import workspaceMemberRepository from "../repository/member.repository.js"
import channelRepository from "../repository/channel.repository.js"

class MessageService {
    async create(workspace_id, channel_id, user_id, content, file_url = null, file_type = null) {
        if (!workspace_id || !channel_id || !user_id) {
            throw new ServerError("Todos los campos son obligatorios", 400)
        }

        const member = await workspaceMemberRepository.getByWorkspaceAndUserId(workspace_id, user_id)
        if (!member) {
            throw new ServerError("No eres miembro de este espacio de trabajo", 403)
        }

        const channel = await channelRepository.getById(channel_id)
        if (!channel || String(channel.channel_workspace_id) !== String(workspace_id)) {
            throw new ServerError("Canal no encontrado en este espacio de trabajo", 404)
        }

        const message = await messageRepository.create(channel_id, member._id, content, file_url, file_type)
        await channelRepository.updateLastMessageAt(channel_id)

        return {
            id: message._id,
            content: message.content,
            created_at: message.created_at,
            file_url: message.file_url,
            file_type: message.file_type,
            sender: {
                id: message.fk_id_member?.fk_id_user?._id,
                name: message.fk_id_member?.fk_id_user?.name,
                email: message.fk_id_member?.fk_id_user?.email
            }
        }
    }

    async getByChannelId(workspace_id, channel_id, user_id) {
        if (!workspace_id || !channel_id || !user_id) {
            throw new ServerError("Todos los campos son obligatorios", 400)
        }

        const member = await workspaceMemberRepository.getByWorkspaceAndUserId(workspace_id, user_id)
        if (!member) {
            throw new ServerError("No eres miembro de este espacio de trabajo", 403)
        }

        const messages = await messageRepository.getByChannelId(channel_id)
        
        return messages.map(msg => ({
            id: msg._id,
            content: msg.content,
            created_at: msg.created_at,
            is_edited: msg.is_edited,
            file_url: msg.file_url,
            file_type: msg.file_type,
            sender: {
                id: msg.fk_id_member.fk_id_user?._id,
                name: msg.fk_id_member.fk_id_user?.name,
                email: msg.fk_id_member.fk_id_user?.email
            }
        }))
    }

    async update(workspace_id, message_id, user_id, content) {
        if (!workspace_id || !message_id || !user_id || !content) {
            throw new ServerError("Todos los campos son obligatorios", 400)
        }

        const message = await messageRepository.getById(message_id)
        if (!message) {
            throw new ServerError("Mensaje no encontrado", 404)
        }

        if (String(message.fk_id_member.fk_id_user._id) !== String(user_id)) {
            throw new ServerError("No tienes permiso para editar este mensaje", 403)
        }

        const diffInMinutes = (new Date() - new Date(message.created_at)) / 1000 / 60
        if (diffInMinutes > 2) {
            throw new ServerError("El tiempo límite para editar este mensaje ha expirado (2 min)", 403)
        }

        const updatedMessage = await messageRepository.update(message_id, content)
        return {
            id: updatedMessage._id,
            content: updatedMessage.content,
            created_at: updatedMessage.created_at,
            is_edited: updatedMessage.is_edited,
            sender: {
                id: updatedMessage.fk_id_member.fk_id_user._id,
                name: updatedMessage.fk_id_member.fk_id_user.name
            }
        }
    }

    async delete(workspace_id, message_id, user_id) {
        if (!workspace_id || !message_id || !user_id) {
            throw new ServerError("Todos los campos son obligatorios", 400)
        }

        const message = await messageRepository.getById(message_id)
        if (!message) {
            throw new ServerError("Mensaje no encontrado", 404)
        }

        if (String(message.fk_id_member.fk_id_user._id) !== String(user_id)) {
            throw new ServerError("No tienes permiso para eliminar este mensaje", 403)
        }

        const diffInMinutes = (new Date() - new Date(message.created_at)) / 1000 / 60
        if (diffInMinutes > 2) {
            throw new ServerError("El tiempo límite para eliminar este mensaje ha expirado (2 min)", 403)
        }

        await messageRepository.delete(message_id)
        return { ok: true }
    }
}

const messageService = new MessageService()
export default messageService
