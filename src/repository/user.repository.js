import User from "../models/user.model.js"
import ServerError from "../helpers/error.helper.js"

class UserRepository {

    async create(username, email, password) {
        try {
            await User.create({
                name: username,
                email: email,
                password: password
            })
        } catch (error) {
            if (error.code === 11000) {
                if (error.keyPattern?.email) throw new ServerError("El email ya está registrado", 400);
                if (error.keyPattern?.name) throw new ServerError("El nombre de usuario ya está registrado", 400);
            }
            throw new ServerError("Error interno en la base de datos al crear usuario", 500);
        }
    }

    async daleteById(user_id) {
        try {
            await User.findByIdAndDelete(user_id)
        } catch (error) {
            throw new ServerError("Error al eliminar el usuario", 500);
        }
    }

    async getById(user_id) {
        try {
            return await User.findById(user_id)
        } catch (error) {
            throw new ServerError("Error al obtener el usuario", 500);
        }
    }

    async updateById(id, new_user_props) {
        try {
            const new_user = await User.findByIdAndUpdate(
                id,
                new_user_props,
                { returnDocument: 'after' }
            )
            return new_user
        } catch (error) {
            if (error.code === 11000) {
                throw new ServerError("Los datos proporcionados ya están en uso por otro usuario", 400);
            }
            throw new ServerError("Error al actualizar el usuario", 500);
        }
    }

    async getByEmail(email) {
        try {
            const user = await User.findOne({ email: email })
            return user
        } catch (error) {
            throw new ServerError("Error al buscar usuario por email", 500);
        }
    }

    async getUser() {
        try {
            const user = await User.findOne()
            return user
        } catch (error) {
            throw new ServerError("Error al obtener usuario", 500);
        }
    }

    async getByUsername(name) {
        try {
            const user = await User.findOne({ name: name })
            return user
        } catch (error) {
            throw new ServerError("Error al buscar usuario por nombre", 500);
        }
    }
}


const userRepository = new UserRepository()
export default userRepository