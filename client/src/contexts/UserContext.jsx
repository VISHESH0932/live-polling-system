// client/src/contexts/UserContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';

const UserContext = createContext(null);
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const socket = useSocket();
    const [user, setUser] = useState(null);
    const [isUserLoading, setIsUserLoading] = useState(true); // Start true, assume we might load from session
    const [userError, setUserError] = useState('');
    const [kickedMessage, setKickedMessage] = useState('');

    const login = useCallback((name, role) => {
        if (!socket) {
            setUserError('Socket not connected. Cannot login.');
            console.error('Login attempt failed: Socket not available.');
            setIsUserLoading(false); // Stop loading if socket isn't there
            return;
        }
        if (!name || !role) {
            setUserError('Name and role are required.');
            setIsUserLoading(false); // Stop loading
            return;
        }
        console.log(`UserContext: Emitting 'join' with name: ${name}, role: ${role}`);
        socket.emit('join', { name, role });
        setIsUserLoading(true); // We are now actively trying to log in
        setUserError('');
    }, [socket]);

    const logout = useCallback(() => {
        if (socket && socket.connected) { // Check if socket is connected before disconnecting
            console.log('UserContext: Logging out, disconnecting socket.');
            socket.disconnect();
        }
        setUser(null);
        sessionStorage.removeItem('studentName');
        setIsUserLoading(false); // No longer trying to load/be a user
        setKickedMessage('');
        // socket instance in SocketContext will be new on next App load, or if SocketProvider re-creates it
    }, [socket]);

    // Effect for attempting to restore student session
    useEffect(() => {
        const studentNameFromSession = sessionStorage.getItem('studentName');
        if (studentNameFromSession) {
            // We have a name, so we intend to log in. Keep/Set loading true until socket is ready.
            setIsUserLoading(true);
            if (socket && socket.connected) { // If socket is already connected
                console.log('UserContext: Session found & socket connected, auto-joining student:', studentNameFromSession);
                login(studentNameFromSession, 'student');
            } else if (socket) { // Socket exists but not connected yet, wait for 'connect'
                 console.log('UserContext: Session found, waiting for socket to connect to auto-join student:', studentNameFromSession);
                 // The 'connect' listener below will handle this.
            } else {
                 console.log('UserContext: Session found, but socket is not yet available.');
                 // SocketProvider will eventually provide socket, then 'connect' listener fires.
            }
        } else {
            // No session name, so we are not trying to auto-login. User needs to go through LandingPage.
            setIsUserLoading(false);
        }
    }, [socket]); // Rerun when socket becomes available. No `login` in deps here.

    // Socket event listeners
    useEffect(() => {
        if (!socket) {
            // If there's no socket, and we weren't trying to load from session, stop loading.
            if (!sessionStorage.getItem('studentName')) {
                setIsUserLoading(false);
            }
            return;
        }

        const handleConnect = () => {
            console.log('UserContext: Socket connected. Checking for student session for auto-join.');
            const studentNameFromSession = sessionStorage.getItem('studentName');
            if (studentNameFromSession && !user) { // If session exists and not already logged in
                console.log('UserContext: Socket now connected, auto-joining as student:', studentNameFromSession);
                login(studentNameFromSession, 'student');
            } else if (!studentNameFromSession) {
                // No student session, user has to login manually
                setIsUserLoading(false);
            }
            // If user is already set, do nothing, they are already logged in.
        };

        const handleJoined = (userData) => {
            console.log('UserContext: Received "joined" event:', userData);
            setUser(userData);
            if (userData.role === 'student') {
                sessionStorage.setItem('studentName', userData.name);
            }
            setIsUserLoading(false);
            setUserError('');
            setKickedMessage(''); // Clear any previous kicked message on successful join
        };

        const handleKicked = (message) => {
            console.warn('UserContext: Received "kicked" event:', message);
            setKickedMessage(message || 'You have been removed by the teacher.');
            setUser(null);
            sessionStorage.removeItem('studentName');
            setIsUserLoading(false); // No longer a user
        };

        const handleUserError = (errorData) => {
            console.error('UserContext: Received server error for user:', errorData.message);
            setUserError(errorData.message || 'An error occurred.');
            setIsUserLoading(false); // Stop loading on error
            // If error is critical for login, consider setUser(null)
        };

        const handleDisconnect = (reason) => {
            console.log(`UserContext: Socket disconnected, reason: ${reason}`);
            // If the server initiated the disconnect and it wasn't a kick,
            // and we have a student session, we might want to try re-joining on next connect.
            // However, socket.io client handles auto-reconnection.
            // For now, just ensure loading state is false if no user.
            // If user was set, a server disconnect doesn't mean they are "logged out" from app perspective
            // until they explicitly logout or get kicked. Reconnection will try to maintain session.
            // If socket.io can't reconnect after retries, then it's a persistent issue.
            if (!user) { // If no user was set (e.g. join failed, then disconnected)
                setIsUserLoading(false);
            }
        };

        socket.on('connect', handleConnect); // Listen to 'connect' for session restore
        socket.on('joined', handleJoined);
        socket.on('kicked', handleKicked);
        socket.on('error', handleUserError);
        socket.on('disconnect', handleDisconnect);


        // Initial check in case socket is already connected when this effect runs
        if (socket.connected) {
            handleConnect();
        }


        return () => {
            socket.off('connect', handleConnect);
            socket.off('joined', handleJoined);
            socket.off('kicked', handleKicked);
            socket.off('error', handleUserError);
            socket.off('disconnect', handleDisconnect);
        };
    }, [socket, login, user]); // Added user to dependency to re-evaluate if user changes externally

    return (
        <UserContext.Provider value={{ user, login, logout, isUserLoading, userError, setUserError, kickedMessage }}>
            {children}
        </UserContext.Provider>
    );
};