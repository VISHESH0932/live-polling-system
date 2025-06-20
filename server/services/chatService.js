const Message = require('../models/messages');
const userService = require('./userService'); 

const MAX_CHAT_HISTORY = 50; 

const saveMessage = async (senderSocketId, text) => {
    const sender = userService.getUser(senderSocketId);
    if (!sender || !sender.name || !sender.role) {
        console.error('Chat: Sender not found or incomplete for socketId:', senderSocketId);
        return { error: 'Sender information is missing.' };
    }

    const newMessage = new Message({
        text,
        senderName: sender.name,
        senderId: sender.id, 
        senderRole: sender.role,
        timestamp: new Date()
    });

    try {
        const savedMessage = await newMessage.save();
        console.log(`Message from ${savedMessage.senderName} saved to DB.`);
        return savedMessage.toObject(); 
    } catch (err) {
        console.error("Error saving message to DB:", err);
        return { error: "Failed to save message." };
    }
};

const getRecentMessages = async () => {
    try {
        
        const messages = await Message.find({})
                                      .sort({ timestamp: -1 }) 
                                      .limit(MAX_CHAT_HISTORY);
        return messages.reverse(); 
    } catch (err) {
        console.error("Error fetching recent messages:", err);
        return { error: "Failed to fetch messages." };
    }
};

module.exports = {
    saveMessage,
    getRecentMessages
};