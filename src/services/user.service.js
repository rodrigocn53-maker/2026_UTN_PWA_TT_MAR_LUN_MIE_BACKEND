import userRepository from "../repository/user.repository.js"

class UserService {
    async getAllUsers(excludeId) {
        return await userRepository.getAll(excludeId)
    }
}

const userService = new UserService()
export default userService
