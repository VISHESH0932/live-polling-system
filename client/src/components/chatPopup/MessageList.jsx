// client/src/components/Shared/ChatPopup/MessageList.js
import React, { useEffect, useRef } from 'react';
import { useUser } from '../../contexts/UserContext';
import './MessageList.css';

const MessageList = ({ messages }) => {
    const { user } = useUser();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    if (!messages || messages.length === 0) {
        return <p className="no-messages">No messages yet. Start the conversation!</p>;
    }

    return (
        <div className="message-list">
            {messages.map((msg) => (
                <div
                    key={msg._id || msg.timestamp} // Use DB id if available, else timestamp
                    className={`message-item ${msg.senderId === user?.id ? 'my-message' : 'other-message'} ${msg.senderRole === 'teacher' ? 'teacher-message' : ''}`}
                >
                    <div className="message-sender">
                        {msg.senderId !== user?.id ? `${msg.senderName} (${msg.senderRole})` : 'You'}
                    </div>
                    <div className="message-bubble">
                        {msg.text}
                    </div>
                    <div className="message-timestamp">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};
export default MessageList;