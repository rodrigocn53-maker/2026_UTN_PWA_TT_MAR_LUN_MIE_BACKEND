import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        receiver_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        sender_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        workspace_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Workspace',
            required: true
        },
        type: {
            type: String,
            enum: ['workspace_invitation'],
            default: 'workspace_invitation',
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending',
            required: true
        },
        read: {
            type: Boolean,
            default: false,
            required: true
        },
        created_at: {
            type: Date,
            default: Date.now,
            required: true
        }
    }
)

const Notification = mongoose.model('Notification', notificationSchema)

export default Notification
