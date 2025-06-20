const chatService = require('../services/chatService');
const userService = require('../services/userService');

module.exports = (io, socket) => {
    const handleSendMessage = async (messageText) => {
        if (!messageText || typeof messageText !== 'string' || messageText.trim() === '') {
            return socket.emit('error', { message: 'Cannot send an empty message.' });
        }

        const user = userService.getUser(socket.id);
        if (!user) {
            return socket.emit('error', { message: 'You must be joined to send messages.' });
        }

        const savedMessage = await chatService.saveMessage(socket.id, messageText.trim());

        if (savedMessage.error) {
            socket.emit('error', { message: savedMessage.error });
        } else {
            
            io.emit('newMessage', savedMessage);
        }
    };

    const handleGetChatHistory = async () => {
        const messages = await chatService.getRecentMessages();
        if (messages.error) {
            socket.emit('error', { message: messages.error });
        } else {
            socket.emit('chatHistory', messages);
        }
    };

   

    socket.on('sendMessage', handleSendMessage);
    socket.on('getChatHistory', handleGetChatHistory);
};