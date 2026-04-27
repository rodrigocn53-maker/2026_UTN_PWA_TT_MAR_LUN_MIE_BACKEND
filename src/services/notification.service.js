import notificationRepository from "../repository/notification.repository.js";
import memberWorkspaceService from "./memberWorkspace.service.js";
import ServerError from "../helpers/error.helper.js";

class NotificationService {
    async getUserNotifications(user_id) {
        return await notificationRepository.getByReceiverId(user_id);
    }

    async createInvitation(sender_id, receiver_id, workspace_id) {
        // Verificar si ya existe una invitación pendiente
        const existing = await notificationRepository.getByReceiverId(receiver_id);
        const alreadyInvited = existing.find(n => 
            String(n.workspace_id._id) === String(workspace_id) && 
            n.status === 'pending'
        );
        
        if (alreadyInvited) {
            throw new ServerError("Ya existe una invitación pendiente para este usuario", 400);
        }

        return await notificationRepository.create({
            sender_id,
            receiver_id,
            workspace_id,
            type: 'workspace_invitation'
        });
    }

    async respondToInvitation(notification_id, user_id, action) {
        const notification = await notificationRepository.getById(notification_id);
        
        if (!notification) throw new ServerError("Notificación no encontrada", 404);
        if (String(notification.receiver_id) !== String(user_id)) {
            throw new ServerError("No tienes permiso para responder a esta invitación", 403);
        }
        if (notification.status !== 'pending') {
            throw new ServerError("Esta invitación ya fue respondida", 400);
        }

        if (action === 'accepted') {
            await memberWorkspaceService.create(user_id, notification.workspace_id, 'member');
        }

        return await notificationRepository.updateStatus(notification_id, action);
    }

    async markNotificationsAsRead(user_id) {
        await notificationRepository.markAllAsRead(user_id);
    }
}

const notificationService = new NotificationService();
export default notificationService;
