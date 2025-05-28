const Message = require('../models/messages');
const userService = require('./userService'); // To get sender details

const MAX_CHAT_HISTORY = 50; // Max messages to retrieve from DB initially

const saveMessage = async (senderSocketId, text) => {
    const sender = userService.getUser(senderSocketId);
    if (!sender || !sender.name || !sender.role) {
        console.error('Chat: Sender not found or incomplete for socketId:', senderSocketId);
        return { error: 'Sender information is missing.' };
    }

    const newMessage = new Message({
        text,
        senderName: sender.name,
        senderId: sender.id, // Using socket.id as senderId for now
        senderRole: sender.role,
        timestamp: new Date()
    });

    try {
        const savedMessage = await newMessage.save();
        console.log(`Message from ${savedMessage.senderName} saved to DB.`);
        return savedMessage.toObject(); // Return a plain JS object
    } catch (err) {
        console.error("Error saving message to DB:", err);
        return { error: "Failed to save message." };
    }
};

const getRecentMessages = async () => {
    try {
        // Retrieve the last N messages, sorted by timestamp
        const messages = await Message.find({})
                                      .sort({ timestamp: -1 }) // Newest first
                                      .limit(MAX_CHAT_HISTORY);
        return messages.reverse(); // Reverse to show oldest of the batch first in UI
    } catch (err) {
        console.error("Error fetching recent messages:", err);
        return { error: "Failed to fetch messages." };
    }
};

module.exports = {
    saveMessage,
    getRecentMessages
};