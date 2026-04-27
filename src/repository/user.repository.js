import User from "../models/user.model.js"
import ServerError from "../helpers/error.helper.js"

class UserRepository {

    async create({ name, username, tag, email, password }) {
        try {
            return await User.create({
                name,
                username,
                tag,
                email,
                password
            })
        } catch (error) {
            if (error.code === 11000) {
                if (error.keyPattern?.email) throw new ServerError("El email ya está registrado", 400);
                if (error.keyPattern?.username && error.keyPattern?.tag) {
                    throw new ServerError("Esta combinación de nombre y tag ya está en uso", 400);
                }
            }
            throw new ServerError("Error interno en la base de datos al crear usuario", 500);
        }
    }

    async deleteById(user_id) {
        try {
            await User.findByIdAndDelete(user_id)
        } catch (error) {
            throw new ServerError("Error al eliminar el usuario", 500);
        }
    }

    async getById(user_id) {
        try {
            const user = await User.findById(user_id);
            
            // Reparación automática para usuarios antiguos (Lazy Migration)
            if (user && (!user.tag || !user.username)) {
                console.log(`[Migration] Reparando usuario antiguo: ${user.name}`);
                if (!user.username) user.username = user.name.toLowerCase().replace(/\s/g, '');
                if (!user.tag) user.tag = Math.random().toString(36).substring(2, 6).toUpperCase();
                await user.save();
            }
            
            return user;
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

    async getByUsernameAndTag(username, tag) {
        try {
            return await User.findOne({ username, tag });
        } catch (error) {
            throw new ServerError("Error al buscar usuario por ID público", 500);
        }
    }

    async getByUsername(name) {
        try {
            // Buscamos por el campo 'name' (que era el original) o 'username'
            const user = await User.findOne({ 
                $or: [{ name: name }, { username: name }] 
            })
            return user
        } catch (error) {
            throw new ServerError("Error al buscar usuario por nombre", 500);
        }
    }
}


const userRepository = new UserRepository()
export default userRepository