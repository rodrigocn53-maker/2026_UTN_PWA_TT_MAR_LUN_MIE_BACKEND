import express from 'express';
import supportController from '../controllers/support.controller.js';
import extractUserMiddleware from '../middlewares/extractUser.middleware.js';

const supportRouter = express.Router();

supportRouter.post('/', extractUserMiddleware, supportController.sendSupportEmail);

export default supportRouter;
