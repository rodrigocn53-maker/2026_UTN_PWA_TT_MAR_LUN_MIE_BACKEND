import notificationRepository from "../repository/notification.repository.js";
import memberWorkspaceService from "./memberWorkspace.service.js";
import ServerError from "../helpers/error.helper.js";

class NotificationService {
    async getUserNotifications(user_id) {
        return await notificationRepository.getByReceiverId(user_id);
    }
    
    async createInvitation(sender_id, receiver_id, workspace_id, role = 'user') {
        // Verificar si ya existe una invitación pendiente
        const existing = await notificationRepository.getByReceiverId(receiver_id);
        const alreadyInvited = existing.find(n => 
            String(n.workspace_id?._id || n.workspace_id) === String(workspace_id) && 
            n.status === 'pending' && n.type === 'workspace_invitation'
        );
        
        if (alreadyInvited) {
            throw new ServerError("Ya existe una invitación pendiente para este usuario", 400);
        }

        return await notificationRepository.create({
            sender_id,
            receiver_id,
            workspace_id,
            role,
            type: 'workspace_invitation'
        });
    }

    async notifyChannelMessage(workspace_id, channel_id, sender_id) {
        // Obtenemos todos los miembros del workspace
        const members = await memberWorkspaceService.getMemberList(workspace_id);
        
        for (const member of members) {
            // No notificar al que envió el mensaje
            if (String(member.user_id) === String(sender_id)) continue;

            const receiver_id = member.user_id;
            
            const pendingNotif = await notificationRepository.getPendingChannelNotification(receiver_id, channel_id);
            
            if (pendingNotif) {
                await notificationRepository.incrementMessageCount(pendingNotif._id, sender_id);
            } else {
                await notificationRepository.create({
                    sender_id,
                    receiver_id,
                    workspace_id,
                    channel_id,
                    type: 'channel_message',
                    status: 'pending',
                    message_count: 1
                });
            }
        }
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
            await memberWorkspaceService.create(user_id, notification.workspace_id, notification.role || 'user');
        }

        return await notificationRepository.updateStatus(notification_id, action);
    }

    async markNotificationsAsRead(user_id) {
        await notificationRepository.markAllAsRead(user_id);
    }

    async markNotificationAsRead(notification_id, user_id) {
        const notification = await notificationRepository.getById(notification_id);
        if (!notification) throw new ServerError("Notificación no encontrada", 404);
        if (String(notification.receiver_id) !== String(user_id)) {
            throw new ServerError("No tienes permiso para marcar esta notificación", 403);
        }
        return await notificationRepository.markAsReadById(notification_id);
    }
}

const notificationService = new NotificationService();
export default notificationService;
