import { Router } from "express";
import directMessageController from "../controllers/directMessage.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.middleware.js";

const dmRouter = Router();

dmRouter.use(authMiddleware);

// Listar todas las conversaciones activas (chats abiertos)
dmRouter.get("/conversations", directMessageController.getConversations);

// Obtener historial con un contacto específico
dmRouter.get("/history/:contactId", directMessageController.getHistory);

// Enviar un mensaje privado (con soporte opcional de imagen)
dmRouter.post("/send/:receiverId", upload.single('image'), directMessageController.sendMessage);

// Editar un mensaje
dmRouter.put("/message/:messageId", directMessageController.updateMessage);

// Eliminar un mensaje
dmRouter.delete("/message/:messageId", directMessageController.deleteMessage);

// Eliminar el chat completo con un contacto
dmRouter.delete("/chat/:contactId", directMessageController.deleteChat);

export default dmRouter;
