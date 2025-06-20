const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    text: { type: String, required: true },
    senderName: { type: String, required: true }, 
    senderId: { type: String, required: true },
    senderRole: { type: String, enum: ['teacher', 'student'], required: true },
    timestamp: { type: Date, default: Date.now }
    
});

module.exports = mongoose.model('Message', MessageSchema);