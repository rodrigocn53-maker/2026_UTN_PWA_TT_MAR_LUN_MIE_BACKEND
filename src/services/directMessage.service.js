import directMessageRepository from "../repository/directMessage.repository.js";
import userRepository from "../repository/user.repository.js";
import ServerError from "../helpers/error.helper.js";

class DirectMessageService {
    async sendMessage(senderId, receiverId, { content, image }) {
        // Verificar que sean contactos
        const user = await userRepository.getById(senderId);
        const isContact = user.contacts.some(contact => String(contact) === String(receiverId));

        if (!isContact) {
            throw new ServerError("Solo puedes enviar mensajes privados a tus contactos aceptados", 403);
        }

        return await directMessageRepository.create({
            sender: senderId,
            receiver: receiverId,
            content,
            image
        });
    }

    async getHistory(userA, userB) {
        return await directMessageRepository.getChatHistory(userA, userB);
    }

    async getConversations(userId) {
        return await directMessageRepository.getMyConversations(userId);
    }

    async updateMessage(userId, messageId, content) {
        const message = await directMessageRepository.getMessageById(messageId);
        if (!message) throw new ServerError("Mensaje no encontrado", 404);
        
        if (String(message.sender) !== String(userId)) {
            throw new ServerError("No tienes permiso para editar este mensaje", 403);
        }
        return await directMessageRepository.updateMessage(messageId, content);
    }

    async deleteMessage(userId, messageId) {
        const message = await directMessageRepository.getMessageById(messageId);
        if (!message) throw new ServerError("Mensaje no encontrado", 404);
        
        if (String(message.sender) !== String(userId)) {
            throw new ServerError("No tienes permiso para eliminar este mensaje", 403);
        }
        return await directMessageRepository.deleteMessage(messageId);
    }

    async deleteChat(userId, contactId) {
        // Podríamos verificar si son contactos, pero si hay historial se puede borrar igual
        return await directMessageRepository.deleteChatHistory(userId, contactId);
    }
}

export default new DirectMessageService();
