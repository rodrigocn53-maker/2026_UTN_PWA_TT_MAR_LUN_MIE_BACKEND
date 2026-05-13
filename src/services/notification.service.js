import notificationRepository from "../repository/notification.repository.js";
import memberWorkspaceService from "./memberWorkspace.service.js";
import userRepository from "../repository/user.repository.js";
import ServerError from "../helpers/error.helper.js";

class NotificationService {
    async getUserNotifications(user_id) {
        return await notificationRepository.getByReceiverId(user_id);
    }
    
    async createInvitation(sender_id, receiver_id, workspace_id, role = 'user') {
        // Verificar si ya existe una invitación pendiente
        const existing = await notificationRepository.getByReceiverId(receiver_id);
        const alreadyInvited = existing.find(notification => 
            String(notification.workspace_id?._id || notification.workspace_id) === String(workspace_id) && 
            notification.status === 'pending' && notification.type === 'workspace_invitation'
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

    async createContactRequest(sender_id, receiver_id) {
        const existing = await notificationRepository.getByReceiverId(receiver_id);
        const alreadyRequested = existing.find(notification => 
            String(notification.sender_id?._id || notification.sender_id) === String(sender_id) && 
            notification.status === 'pending' && notification.type === 'contact_request'
        );

        if (alreadyRequested) {
            throw new ServerError("Ya has enviado una solicitud a este usuario", 400);
        }

        return await notificationRepository.create({
            sender_id,
            receiver_id,
            type: 'contact_request'
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

    async notifyDirectMessage(sender_id, receiver_id) {
        // No notificar a sí mismo (por las dudas)
        if (String(sender_id) === String(receiver_id)) return;

        const pendingNotif = await notificationRepository.getPendingDirectMessageNotification(receiver_id, sender_id);
        
        if (pendingNotif) {
            await notificationRepository.incrementMessageCount(pendingNotif._id, sender_id);
        } else {
            await notificationRepository.create({
                sender_id,
                receiver_id,
                type: 'direct_message',
                status: 'pending',
                message_count: 1
            });
        }
    }

    async respondToInvitation(notification_id, user_id, action) {
        const notification = await notificationRepository.getById(notification_id);
        
        if (!notification) throw new ServerError("Notificación no encontrada", 404);
        if (String(notification.receiver_id) !== String(user_id)) {
            throw new ServerError("No tienes permiso para responder a esta notificación", 403);
        }
        if (notification.status !== 'pending') {
            throw new ServerError("Esta notificación ya fue respondida", 400);
        }

        if (notification.type === 'workspace_invitation') {
            if (action === 'accepted') {
                await memberWorkspaceService.create(user_id, notification.workspace_id, notification.role || 'user');
            }
        } else if (notification.type === 'contact_request') {
            if (action === 'accepted') {
                // Aceptar solicitud de contacto en ambos usuarios
                await userRepository.acceptContactRequest(user_id, notification.sender_id);
                
                // Notificar al emisor original que fue aceptado
                await notificationRepository.create({
                    sender_id: user_id,
                    receiver_id: notification.sender_id,
                    type: 'contact_accepted'
                });
            } else if (action === 'rejected') {
                // Remover de pendientes del emisor original
                await userRepository.removePendingContact(notification.sender_id, user_id);

                // Notificar al emisor original que fue rechazado
                await notificationRepository.create({
                    sender_id: user_id,
                    receiver_id: notification.sender_id,
                    type: 'contact_rejected'
                });
            }
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
