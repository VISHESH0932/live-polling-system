// client/src/pages/MainAppPage.jsx
import React from 'react';
import { useUser } from '../contexts/UserContext'; // Make sure logout is pulled from here
import { useChat } from '../contexts/ChatContext';
import TeacherView from '../components/teacher/TeacherView';
import StudentView from '../components/student/StudentView';
import ChatPopup from '../components/chatPopup/ChatPopup';
import './MainAppPage.css';

const MainAppPage = () => {
    const { user, logout } = useUser(); // Get user and logout function
    const { isChatOpen, toggleChat } = useChat();

    if (!user) { // Should ideally not happen if App.jsx logic is correct, but good safeguard
        return null; // Or a redirect to landing
    }

    return (
        <div className="main-app-container">
            {/* Simple Header Section for User Info and Logout */}
            <header className="main-app-page-header">
                <div className="app-branding">✨ Intervue Poll</div>
                <div className="user-info-logout">
                    <span>Welcome, {user.name}! ({user.role})</span>
                    <button onClick={logout} className="logout-button-main">
                        Change Role / Logout
                    </button>
                </div>
            </header>

            <div className="app-content">
                {user.role === 'teacher' && <TeacherView />}
                {user.role === 'student' && <StudentView />}
            </div>

            {isChatOpen && <ChatPopup />}

            <button className="chat-toggle-button" onClick={toggleChat} aria-label="Toggle Chat">
                💬
            </button>
        </div>
    );
};

export default MainAppPage;