import notificationService from "../services/notification.service.js";

class NotificationController {
    async getMyNotifications(req, res, next) {
        try {
            const notifications = await notificationService.getUserNotifications(req.user.id);
            res.json({
                ok: true,
                status: 200,
                data: notifications
            });
        } catch (error) {
            next(error);
        }
    }

    async respond(req, res, next) {
        try {
            const { notification_id } = req.params;
            const { action } = req.body; // 'accepted' o 'rejected'
            const result = await notificationService.respondToInvitation(notification_id, req.user.id, action);
            res.json({
                ok: true,
                status: 200,
                message: `Invitación ${action === 'accepted' ? 'aceptada' : 'rechazada'}`,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async markAsRead(req, res, next) {
        try {
            await notificationService.markNotificationsAsRead(req.user.id);
            res.json({
                ok: true,
                status: 200,
                message: "Notificaciones marcadas como leídas"
            });
        } catch (error) {
            next(error);
        }
    }
}

const notificationController = new NotificationController();
export default notificationController;
