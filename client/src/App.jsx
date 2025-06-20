import React from 'react';
import { SocketProvider } from './contexts/SocketContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { PollProvider } from './contexts/PollContext';
import { ChatProvider } from './contexts/ChatContext';
import LandingPage from './pages/LandingPage';
import MainAppPage from './pages/MainAppPage';
import KickedOutPage from './pages/KickedOutPage'; 
import './App.css'; 

function AppContent() {
    const { user, isUserLoading, kickedMessage } = useUser();

    if (kickedMessage) {
        return <KickedOutPage message={kickedMessage} />;
    }

    if (isUserLoading) {
        
        return <div className="app-loading">Loading Application...</div>;
    }

    if (!user || !user.id) {
        return <LandingPage />;
    }

    return <MainAppPage />;
}

function App() {
    return (
        <SocketProvider>
            <UserProvider>
                <PollProvider>
                    <ChatProvider>
                        <div className="App">
                            <AppContent />
                        </div>
                    </ChatProvider>
                </PollProvider>
            </UserProvider>
        </SocketProvider>
    );
}

export default App;