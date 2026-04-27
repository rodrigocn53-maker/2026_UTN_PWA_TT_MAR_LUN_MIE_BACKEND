import ServerError from "../helpers/error.helper.js"
import messageRepository from "../repository/message.repository.js"
import workspaceMemberRepository from "../repository/member.repository.js"
import channelRepository from "../repository/channel.repository.js"

class MessageService {
    async create(workspace_id, channel_id, user_id, content) {
        if (!workspace_id || !channel_id || !user_id || !content) {
            throw new ServerError("Todos los campos son obligatorios", 400)
        }

        // Verificar que el usuario sea miembro del workspace
        const member = await workspaceMemberRepository.getByWorkspaceAndUserId(workspace_id, user_id)
        if (!member) {
            throw new ServerError("No eres miembro de este espacio de trabajo", 403)
        }

        // Verificar que el canal exista y pertenezca al workspace
        const channel = await channelRepository.getById(channel_id)
        if (!channel || String(channel.channel_workspace_id) !== String(workspace_id)) {
            throw new ServerError("Canal no encontrado en este espacio de trabajo", 404)
        }

        const message = await messageRepository.create(channel_id, member._id, content)
        
        // Actualizar la fecha del último mensaje en el canal
        await channelRepository.updateLastMessageAt(channel_id)

        // Mapeamos el mensaje a un formato más limpio para el frontend
        return {
            id: message._id,
            content: message.content,
            created_at: message.created_at,
            sender: {
                id: message.fk_id_member.fk_id_user._id,
                name: message.fk_id_member.fk_id_user.name,
                email: message.fk_id_member.fk_id_user.email
            }
        }
    }

    async getByChannelId(workspace_id, channel_id, user_id) {
        if (!workspace_id || !channel_id || !user_id) {
            throw new ServerError("Todos los campos son obligatorios", 400)
        }

        // Verificar que el usuario sea miembro del workspace
        const member = await workspaceMemberRepository.getByWorkspaceAndUserId(workspace_id, user_id)
        if (!member) {
            throw new ServerError("No eres miembro de este espacio de trabajo", 403)
        }

        const messages = await messageRepository.getByChannelId(channel_id)
        
        return messages.map(msg => ({
            id: msg._id,
            content: msg.content,
            created_at: msg.created_at,
            sender: {
                id: msg.fk_id_member.fk_id_user._id,
                name: msg.fk_id_member.fk_id_user.name,
                email: msg.fk_id_member.fk_id_user.email
            }
        }))
    }
}

const messageService = new MessageService()
export default messageService
