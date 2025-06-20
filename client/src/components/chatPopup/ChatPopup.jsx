import React, { useState } from 'react';
import { useChat } from '../../contexts/ChatContext'; 
import { usePoll } from '../../contexts/PollContext'; 
import { useUser } from '../../contexts/UserContext';   
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import StudentList from '../teacher/StudentList'; 
import './ChatPopup.css';

const ChatPopup = () => {
    const { user } = useUser();
    const { messages, sendMessage, chatError } = useChat();
    const { activeUsers, kickStudent } = usePoll(); 
    const [activeTab, setActiveTab] = useState('chat'); 

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