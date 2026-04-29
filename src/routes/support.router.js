import express from 'express';
import supportController from '../controllers/support.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const supportRouter = express.Router();

supportRouter.post('/', authMiddleware, supportController.sendSupportEmail);

export default supportRouter;
