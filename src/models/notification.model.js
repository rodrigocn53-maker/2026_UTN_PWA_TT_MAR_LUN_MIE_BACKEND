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
            required: false
        },
        type: {
            type: String,
            enum: ['workspace_invitation', 'channel_message', 'contact_request', 'contact_accepted', 'contact_rejected'],
            default: 'workspace_invitation',
            required: true
        },
        channel_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Channel',
            required: false
        },
        message_count: {
            type: Number,
            default: 1
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
        },
        role: {
            type: String,
            enum: ['admin', 'user'],
            default: 'user'
        }
    }
)

const Notification = mongoose.model('Notification', notificationSchema)

export default Notification
