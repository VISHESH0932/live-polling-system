import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { useUser } from './UserContext';

const ChatContext = createContext(null);
export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const socket = useSocket();
    const { user } = useUser(); 

    const [messages, setMessages] = useState([]);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatError, setChatError] = useState('');

    
    useEffect(() => {
        if (socket && user?.id) { 
            console.log('ChatContext: User joined, emitting getChatHistory');
            socket.emit('getChatHistory');
        }
    }, [socket, user]);

    const sendMessage = useCallback((text) => {
        if (socket && text.trim()) {
            console.log('ChatContext: Emitting sendMessage', text);
            socket.emit('sendMessage', text);
            setChatError('');
        } else if (!text.trim()) {
            setChatError("Cannot send an empty message.");
        }
    }, [socket]);

    const toggleChat = () => setIsChatOpen(prev => !prev);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message) => {
            console.log('ChatContext: Received newMessage', message);
            setMessages(prevMessages => [...prevMessages, message]);
        };

        const handleChatHistory = (history) => {
            console.log('ChatContext: Received chatHistory', history);
            setMessages(history);
        };

        const handleChatError = (errorData) => {
            console.error('ChatContext: Received server error for chat:', errorData.message);
            setChatError(errorData.message || 'A chat error occurred.');
        };

        socket.on('newMessage', handleNewMessage);
        socket.on('chatHistory', handleChatHistory);
        socket.on('error', handleChatError); 

        return () => {
            socket.off('newMessage', handleNewMessage);
            socket.off('chatHistory', handleChatHistory);
            socket.off('error', handleChatError);
        };
    }, [socket]);

    return (
        <ChatContext.Provider value={{ messages, sendMessage, isChatOpen, toggleChat, chatError, setChatError }}>
            {children}
        </ChatContext.Provider>
    );
};