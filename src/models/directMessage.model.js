import mongoose from 'mongoose';

const DirectMessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: null
    },
    is_read: {
        type: Boolean,
        default: false
    },
    is_edited: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Índice para buscar rápidamente la conversación entre dos usuarios
DirectMessageSchema.index({ sender: 1, receiver: 1 });
DirectMessageSchema.index({ receiver: 1, sender: 1 });

const DirectMessage = mongoose.model('DirectMessage', DirectMessageSchema);

export default DirectMessage;
