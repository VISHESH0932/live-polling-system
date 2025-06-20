
import React, { useState } from 'react';
import './MessageInput.css';

const MessageInput = ({ onSendMessage }) => {
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            onSendMessage(text.trim());
            setText('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="message-input-form">
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your message..."
                aria-label="Chat message input"
            />
            <button type="submit" className="primary">Send</button>
        </form>
    );
};
export default MessageInput;