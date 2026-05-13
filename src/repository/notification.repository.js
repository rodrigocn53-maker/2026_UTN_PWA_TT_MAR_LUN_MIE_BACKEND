import Notification from "../models/notification.model.js";
import ServerError from "../helpers/error.helper.js";

class NotificationRepository {
    async create(data) {
        try {
            return await Notification.create(data);
        } catch (error) {
            throw new ServerError("Error al crear la notificación", 500);
        }
    }

    async getByReceiverId(receiver_id) {
        try {
            return await Notification.find({ receiver_id })
                .populate('sender_id', 'name username tag avatar avatar_config')
                .populate('workspace_id', 'title')
                .populate('channel_id', 'name')
                .sort({ created_at: -1 });
        } catch (error) {
            throw new ServerError("Error al obtener notificaciones", 500);
        }
    }

    async getPendingChannelNotification(receiver_id, channel_id) {
        try {
            return await Notification.findOne({
                receiver_id,
                channel_id,
                type: 'channel_message',
                read: false
            });
        } catch (error) {
            throw new ServerError("Error al obtener notificación del canal", 500);
        }
    }

    async getPendingDirectMessageNotification(receiver_id, sender_id) {
        try {
            return await Notification.findOne({
                receiver_id,
                sender_id,
                type: 'direct_message',
                read: false
            });
        } catch (error) {
            throw new ServerError("Error al obtener notificación de mensaje directo", 500);
        }
    }

    async incrementMessageCount(notification_id, sender_id) {
        try {
            return await Notification.findByIdAndUpdate(
                notification_id,
                { $inc: { message_count: 1 }, sender_id, created_at: new Date() },
                { new: true }
            );
        } catch (error) {
            throw new ServerError("Error al actualizar la notificación", 500);
        }
    }

    async getById(id) {
        try {
            return await Notification.findById(id);
        } catch (error) {
            throw new ServerError("Error al obtener la notificación", 500);
        }
    }

    async updateStatus(id, status) {
        try {
            return await Notification.findByIdAndUpdate(id, { status }, { new: true });
        } catch (error) {
            throw new ServerError("Error al actualizar el estado de la notificación", 500);
        }
    }

    async markAllAsRead(receiver_id) {
        try {
            await Notification.updateMany({ receiver_id, read: false }, { read: true });
        } catch (error) {
            throw new ServerError("Error al marcar notificaciones como leídas", 500);
        }
    }

    async markAsReadById(id) {
        try {
            return await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
        } catch (error) {
            throw new ServerError("Error al marcar la notificación como leída", 500);
        }
    }
}

const notificationRepository = new NotificationRepository();
export default notificationRepository;
