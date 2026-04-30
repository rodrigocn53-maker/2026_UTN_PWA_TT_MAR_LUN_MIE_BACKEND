import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        username: {
            type: String,
            required: true
        },
        tag: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        email_verified: {
            type: Boolean,
            default: false,
            required: true
        },
        created_at: {
            type: Date,
            required: true,
            default: Date.now
        },
        contacts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        pending_contacts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        avatar: {
            type: String,
            default: ""
        },
        avatar_config: {
            zoom: { type: Number, default: 1 },
            position: {
                x: { type: Number, default: 0 },
                y: { type: Number, default: 0 }
            }
        }
    }
)

// Creamos un índice único compuesto por username y tag
userSchema.index({ username: 1, tag: 1 }, { unique: true });

// Lo asociamos a la coleccion de usuarios
const User = mongoose.model('User', userSchema)

export default User