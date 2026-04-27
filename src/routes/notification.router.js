import express from 'express';
import notificationController from '../controllers/notification.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const notificationRouter = express.Router();

notificationRouter.get('/', authMiddleware, notificationController.getMyNotifications);
notificationRouter.put('/mark-read', authMiddleware, notificationController.markAsRead);
notificationRouter.put('/:notification_id/respond', authMiddleware, notificationController.respond);

export default notificationRouter;
