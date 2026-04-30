import mongoose from 'mongoose';

const SupportTicketSchema = new mongoose.Schema({
    ticketId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    problem: { type: String, required: true },
    description: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    status: { type: String, enum: ['open', 'in_progress', 'closed'], default: 'open' },
    created_at: { type: Date, default: Date.now }
});

const SupportTicket = mongoose.model('SupportTicket', SupportTicketSchema);

export default SupportTicket;
