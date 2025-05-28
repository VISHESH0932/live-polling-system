// client/src/components/Shared/ChatPopup/ChatPopup.js
import React, { useState } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { usePoll } from '../../contexts/PollContext'; // For active users
import MessageList from '../chatPopup/MessageList';
import MessageInput from '../chatPopup/MessageInput';
import './ChatPopup.css';
import StudentList from '../teacher/StudentList';

const ChatPopup = () => {
    const { messages, sendMessage, chatError } = useChat();
    const { activeUsers, kickStudent } = usePoll(); // Get activeUsers and kickStudent for teacher
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'participants'

    return (
        <div className="chat-popup-container">
            <div className="chat-popup-header">
                <button
                    className={activeTab === 'chat' ? 'active' : ''}
                    onClick={() => setActiveTab('chat')}
                >
                    Chat
                </button>
                <button
                    className={activeTab === 'participants' ? 'active' : ''}
                    onClick={() => setActiveTab('participants')}
                >
                    Participants ({activeUsers.filter(u => u.role === 'student').length})
                </button>
            </div>
            <div className="chat-popup-content">
                {activeTab === 'chat' && (
                    <>
                        <MessageList messages={messages} />
                        <MessageInput onSendMessage={sendMessage} />
                        {chatError && <p className="error-message chat-error">{chatError}</p>}
                    </>
                )}
                {activeTab === 'participants' && (
                    <StudentList students={activeUsers.filter(u => u.role === 'student')} onKick={kickStudent} />
                )}
            </div>
        </div>
    );
};
export default ChatPopup;