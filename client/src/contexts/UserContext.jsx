import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';

const UserContext = createContext(null);
export const useUser = () => useContext(UserContext);

// client/src/contexts/UserContext.jsx

// ... (existing code) ...

export const UserProvider = ({ children }) => {
    const socket = useSocket();
    const [user, setUser] = useState(null);
    const [isUserLoading, setIsUserLoading] = useState(true);
    const [userError, setUserError] = useState('');
    const [kickedMessage, setKickedMessage] = useState('');

    // Add a log to see when isUserLoading changes
    useEffect(() => {
        console.log('UserContext: isUserLoading changed to:', isUserLoading, 'User:', user);
    }, [isUserLoading, user]);

    const login = useCallback((name, role) => {
        if (!socket) {
            console.error('UserContext: Login attempt - Socket not available.');
            setUserError('Socket not connected. Cannot login.');
            setIsUserLoading(false);
            return;
        }
        if (!name || !role) {
            console.error('UserContext: Login attempt - Name or role missing.');
            setUserError('Name and role are required.');
            setIsUserLoading(false);
            return;
        }
        console.log(`UserContext: Emitting 'join' (Name: ${name}, Role: ${role}). Setting isUserLoading = true.`);
        socket.emit('join', { name, role });
        setIsUserLoading(true);
        setUserError('');
    }, [socket]);

    const logout = useCallback(() => {
        if (socket && socket.connected) {
            console.log('UserContext: Logging out, disconnecting socket.');
            socket.disconnect();
        }
        setUser(null);
        sessionStorage.removeItem('studentName');
        console.log('UserContext: Logout. Setting isUserLoading = false.');
        setIsUserLoading(false);
        setKickedMessage('');
    }, [socket]);

    // Effect for attempting to restore student session
    useEffect(() => {
        const studentNameFromSession = sessionStorage.getItem('studentName');
        if (studentNameFromSession) {
            console.log('UserContext: Session effect - Found student name:', studentNameFromSession, 'Socket connected:', socket?.connected);
            if (!user) { // Only attempt auto-login if not already logged in
                setIsUserLoading(true); // Indicate we are attempting to load from session
                if (socket && socket.connected) {
                    console.log('UserContext: Session effect - Socket connected, auto-joining student:', studentNameFromSession);
                    login(studentNameFromSession, 'student');
                } else {
                    console.log('UserContext: Session effect - Socket not yet connected or available, will wait for "connect" event.');
                }
            } else {
                 console.log('UserContext: Session effect - User already exists, not auto-joining.');
                 setIsUserLoading(false); // Already logged in, no longer loading
            }
        } else {
            console.log('UserContext: Session effect - No student session found. Setting isUserLoading = false.');
            setIsUserLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket]); // Run primarily when socket instance becomes available

    // Socket event listeners
    useEffect(() => {
        if (!socket) {
            if (!sessionStorage.getItem('studentName')) { // If no session, and no socket, we are not loading.
                 console.log('UserContext: Socket events effect - No socket, no session. Setting isUserLoading = false.');
                 setIsUserLoading(false);
            }
            return;
        }

        const handleConnect = () => {
            console.log('UserContext: Socket "connect" event. Current user:', user, 'isUserLoading:', isUserLoading);
            const studentNameFromSession = sessionStorage.getItem('studentName');
            if (studentNameFromSession && !user) {
                console.log('UserContext: Socket "connect" event - auto-joining student:', studentNameFromSession);
                login(studentNameFromSession, 'student');
            } else if (!studentNameFromSession && !user) {
                console.log('UserContext: Socket "connect" event - No session, no user. Setting isUserLoading = false.');
                setIsUserLoading(false); // No session, not trying to log in, so not loading.
            }
            // If user exists, they are already "logged in" from the app's perspective
        };

        const handleJoined = (userData) => {
            console.log('UserContext: Received "joined" event:', userData, '. Setting isUserLoading = false.');
            setUser(userData);
            if (userData.role === 'student') {
                sessionStorage.setItem('studentName', userData.name);
            }
            setIsUserLoading(false);
            setUserError('');
            setKickedMessage('');
        };

        const handleKicked = (message) => {
            console.warn('UserContext: Received "kicked" event:', message, '. Setting isUserLoading = false.');
            setKickedMessage(message || 'You have been removed by the teacher.');
            setUser(null);
            sessionStorage.removeItem('studentName');
            setIsUserLoading(false);
        };

        const handleUserError = (errorData) => { // This is for 'error' events from the server
            console.error('UserContext: Received server "error" event:', errorData.message, '. Setting isUserLoading = false.');
            setUserError(errorData.message || 'An error occurred.');
            setIsUserLoading(false);
            // Potentially clear user if it was a join error
            // if (isUserLoading && !user) setUser(null); // If we were trying to join and failed
        };

        const handleDisconnect = (reason) => {
            console.log(`UserContext: Socket "disconnect" event, reason: ${reason}. isUserLoading: ${isUserLoading}`);
            // If the disconnect was unexpected and we were logged in, the user might appear logged out
            // but socket.io will try to reconnect.
            // If we were in the middle of a login (isUserLoading=true) and socket disconnects, that's an issue.
            if (isUserLoading) { // If we were in a loading state (e.g. trying to join)
                setUserError("Connection lost during operation. Please try again.");
                setIsUserLoading(false); // Stop the loading screen
            }
        };

        socket.on('connect', handleConnect);
        socket.on('joined', handleJoined);
        socket.on('kicked', handleKicked);
        socket.on('error', handleUserError);
        socket.on('disconnect', handleDisconnect);

        if (socket.connected) { // If socket was already connected when this effect ran
            console.log('UserContext: Socket events effect - Socket already connected, running handleConnect.');
            handleConnect();
        }


        return () => {
            socket.off('connect', handleConnect);
            socket.off('joined', handleJoined);
            socket.off('kicked', handleKicked);
            socket.off('error', handleUserError);
            socket.off('disconnect', handleDisconnect);
        };
    }, [socket, login, user, isUserLoading]); // Added isUserLoading to see if its changes affect this.

    return (
        <UserContext.Provider value={{ user, login, logout, isUserLoading, userError, setUserError, kickedMessage }}>
            {children}
        </UserContext.Provider>
    );
};