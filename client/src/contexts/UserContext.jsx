// client/src/contexts/UserContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';

const UserContext = createContext(null);
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const socket = useSocket();
    const [user, setUser] = useState(null); // { id, name, role }
    const [isUserLoading, setIsUserLoading] = useState(true);
    const [userError, setUserError] = useState('');
    const [kickedMessage, setKickedMessage] = useState('');


    const login = useCallback((name, role) => {
        if (!socket) {
            setUserError('Socket not connected. Cannot login.');
            console.error('Login attempt failed: Socket not available.');
            return;
        }
        if (!name || !role) {
            setUserError('Name and role are required.');
            return;
        }
        console.log(`UserContext: Emitting 'join' with name: ${name}, role: ${role}`);
        socket.emit('join', { name, role });
        setIsUserLoading(true);
        setUserError('');
    }, [socket]);

    const logout = useCallback(() => { // For manual logout or after being kicked
        if (socket) {
            socket.disconnect(); // This will trigger disconnect event in SocketContext
        }
        setUser(null);
        sessionStorage.removeItem('studentName'); // Clear student name
        setIsUserLoading(false);
        setKickedMessage(''); // Clear kicked message on explicit logout attempt
        // Optionally, re-initialize socket connection if needed for a fresh login
    }, [socket]);

    useEffect(() => {
        const studentNameFromSession = sessionStorage.getItem('studentName');
        if (studentNameFromSession && !user) { // Only if no user is set yet
            console.log('UserContext: Found student name in session, attempting auto-join:', studentNameFromSession);
            // We need socket to be ready for this.
            // The login function handles socket readiness.
            // This auto-login should ideally happen once socket is connected.
        } else {
            setIsUserLoading(false); // No session data, not loading user from session
        }
    }, [user]); // Rerun if user changes (e.g., logs out)

    useEffect(() => { // Effect for socket readiness for auto-login
        if (socket && sessionStorage.getItem('studentName') && !user && !isUserLoading) {
            const studentName = sessionStorage.getItem('studentName');
            console.log('UserContext: Socket ready, auto-joining as student:', studentName);
            login(studentName, 'student');
        }
    }, [socket, user, isUserLoading, login]);


    useEffect(() => {
        if (!socket) return;

        const handleJoined = (userData) => {
            console.log('UserContext: Received "joined" event:', userData);
            setUser(userData);
            if (userData.role === 'student') {
                sessionStorage.setItem('studentName', userData.name);
            }
            setIsUserLoading(false);
            setUserError('');
        };

        const handleKicked = (message) => {
            console.warn('UserContext: Received "kicked" event:', message);
            setKickedMessage(message || 'You have been removed by the teacher.');
            setUser(null); // Clear user state
            sessionStorage.removeItem('studentName');
            // Socket will be disconnected by server, or we can do it here:
            // socket.disconnect();
            setIsUserLoading(false);
        };

        const handleUserError = (errorData) => {
            console.error('UserContext: Received server error for user:', errorData.message);
            setUserError(errorData.message || 'An error occurred.');
            setIsUserLoading(false);
            // Potentially clear user if join failed critically
            // setUser(null);
        };

        socket.on('joined', handleJoined);
        socket.on('kicked', handleKicked);
        socket.on('error', handleUserError); // Generic error listener, might need to be more specific

        return () => {
            socket.off('joined', handleJoined);
            socket.off('kicked', handleKicked);
            socket.off('error', handleUserError);
        };
    }, [socket]);

    return (
        <UserContext.Provider value={{ user, login, logout, isUserLoading, userError, setUserError, kickedMessage, setKickedMessage }}>
            {children}
        </UserContext.Provider>
    );
};