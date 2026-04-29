import userRepository from "../repository/user.repository.js"

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
        await userRepository.addContact(userId, contactId);
    }

    async getContacts(userId) {
        return await userRepository.getContacts(userId);
    }
}

const userService = new UserService()
export default userService
