import directMessageService from "../services/directMessage.service.js";
import notificationService from "../services/notification.service.js";

class DirectMessageController {
    async sendMessage(req, res, next) {
        try {
            const senderId = req.user.id;
            const { receiverId } = req.params;
            const { content } = req.body;
            const image = req.file ? req.file.path : undefined;

            const message = await directMessageService.sendMessage(senderId, receiverId, { content, image });

            // Generar notificación de nuevo mensaje privado
            await notificationService.notifyDirectMessage(senderId, receiverId);

            res.status(201).json({
                ok: true,
                status: 201,
                message: "Mensaje enviado",
                data: message
            });
        } catch (error) {
            next(error);
        }
    }

    async getHistory(req, res, next) {
        try {
            const userId = req.user.id;
            const { contactId } = req.params;

            const history = await directMessageService.getHistory(userId, contactId);

            res.status(200).json({
                ok: true,
                status: 200,
                message: "Historial obtenido",
                data: history
            });
        } catch (error) {
            next(error);
        }
    }

    async getConversations(req, res, next) {
        try {
            const userId = req.user.id;
            const conversations = await directMessageService.getConversations(userId);

            res.status(200).json({
                ok: true,
                status: 200,
                message: "Conversaciones obtenidas",
                data: conversations
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new DirectMessageController();
