import userRepository from "../repository/user.repository.js"
import notificationService from "./notification.service.js"

class UserService {
    async getAllUsers(excludeId) {
        return await userRepository.getAll(excludeId)
    }

    async addContact(userId, contactId) {
        // Verificar si el contacto existe
        const contact = await userRepository.getById(contactId);
        if (!contact) {
            throw new Error("El usuario que intentas agregar no existe");
        }
        if (String(userId) === String(contactId)) {
            throw new Error("No puedes agregarte a ti mismo como contacto");
        }

        // Crear notificación de solicitud de contacto
        await notificationService.createContactRequest(userId, contactId);
        
        // Agregar a la lista de pendientes del emisor para feedback visual
        await userRepository.addPendingContact(userId, contactId);
    }

    async removeContact(userId, contactId) {
        await userRepository.removeContact(userId, contactId);
    }

    async getContacts(userId) {
        return await userRepository.getContacts(userId);
    }

    async updateProfile(userId, { name, avatar, avatar_config }) {
        const updateData = {};
        if (name) updateData.name = name;
        if (avatar) updateData.avatar = avatar;
        if (avatar_config) updateData.avatar_config = avatar_config;

        if (Object.keys(updateData).length === 0) {
            throw new Error("No se proporcionaron datos para actualizar");
        }

        return await userRepository.updateById(userId, updateData);
    }
}

const userService = new UserService()
export default userService
