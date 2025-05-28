const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    text: { type: String, required: true },
    senderName: { type: String, required: true }, // Name of the user who sent it
    senderId: { type: String, required: true }, // socket.id or a persistent user ID
    senderRole: { type: String, enum: ['teacher', 'student'], required: true },
    timestamp: { type: Date, default: Date.now }
    // roomId: { type: String, default: 'general' } // If you want multiple chat rooms in the future
});

module.exports = mongoose.model('Message', MessageSchema);