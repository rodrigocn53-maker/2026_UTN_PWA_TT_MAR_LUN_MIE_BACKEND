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
}

export default new DirectMessageService();
