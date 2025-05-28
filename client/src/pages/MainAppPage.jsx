// client/src/pages/MainAppPage.js
import React from 'react';
import { useUser } from '../contexts/UserContext';
import { useChat } from '../contexts/ChatContext';
import TeacherView from '../components/teacher/TeacherView'; // Make sure this path is correct
import StudentView from '../components/student/StudentView'; // Make sure this path is correct
import ChatPopup from '../components/chatPopup/ChatPopup'; // Make sure this path is correct
import './MainAppPage.css';

const MainAppPage = () => {
    const { user } = useUser();
    const { isChatOpen, toggleChat } = useChat(); // isChatOpen from context

    return (
        <div className="main-app-container">
            {/* Optional: Common Header
            <Header AppName="Intervue Poll" user={user} onLogout={logout} />
            */}

            <div className="app-content">
                {user.role === 'teacher' && <TeacherView />}
                {user.role === 'student' && <StudentView />}
            </div>

            {/* Chat Popup - rendered conditionally based on isChatOpen state from ChatContext */}
            {isChatOpen && <ChatPopup />}

            {/* Chat Toggle Button - always rendered after login */}
            <button className="chat-toggle-button" onClick={toggleChat} aria-label="Toggle Chat">
                💬 {/* Replace with actual SVG or Font Icon */}
            </button>
        </div>
    );
};

export default MainAppPage;