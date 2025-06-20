// client/src/components/Shared/ChatPopup/ChatPopup.js
import React, { useState } from 'react';
import { useChat } from '../../contexts/ChatContext'; // For messages, sendMessage, chatError
import { usePoll } from '../../contexts/PollContext'; // For active users & kickStudent
import { useUser } from '../../contexts/UserContext';   // To check if current user is teacher
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import StudentList from '../teacher/StudentList'; // We will use this!
import './ChatPopup.css';

const ChatPopup = () => {
    const { user } = useUser(); // Get the current logged-in user
    const { messages, sendMessage, chatError } = useChat();
    const { activeUsers, kickStudent } = usePoll(); // Get activeUsers and kickStudent
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'participants'

    const studentParticipants = activeUsers.filter(u => u.role === 'student');

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
                    Participants ({studentParticipants.length})
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
                    // Pass students and onKick (only if current user is a teacher)
                    <StudentList
                        students={studentParticipants}
                        onKick={user?.role === 'teacher' ? kickStudent : undefined}
                    />
                )}
            </div>
        </div>
    );
};
export default ChatPopup;