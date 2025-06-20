import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';

const UserContext = createContext(null);
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const socket = useSocket();
    const [user, setUser] = useState(null);
    const [isUserLoading, setIsUserLoading] = useState(true); 
    const [userError, setUserError] = useState('');
    const [kickedMessage, setKickedMessage] = useState('');

    const login = useCallback((name, role) => {
        if (!socket) {
            setUserError('Socket not connected. Cannot login.');
            console.error('Login attempt failed: Socket not available.');
            setIsUserLoading(false);
            return;
        }
        if (!name || !role) {
            setUserError('Name and role are required.');
            setIsUserLoading(false); 
            return;
        }
        console.log(`UserContext: Emitting 'join' with name: ${name}, role: ${role}`);
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
        setIsUserLoading(false);
        setKickedMessage('');
        
    }, [socket]);

    
    useEffect(() => {
        const studentNameFromSession = sessionStorage.getItem('studentName');
        if (studentNameFromSession) {
            
            setIsUserLoading(true);
            if (socket && socket.connected) { 
                console.log('UserContext: Session found & socket connected, auto-joining student:', studentNameFromSession);
                login(studentNameFromSession, 'student');
            } else if (socket) { 
                 console.log('UserContext: Session found, waiting for socket to connect to auto-join student:', studentNameFromSession);
                 
            } else {
                 console.log('UserContext: Session found, but socket is not yet available.');
                 
            }
        } else {
            
            setIsUserLoading(false);
        }
    }, [socket]);

    
    useEffect(() => {
        if (!socket) {
            
            if (!sessionStorage.getItem('studentName')) {
                setIsUserLoading(false);
            }
            return;
        }

        const handleConnect = () => {
            console.log('UserContext: Socket connected. Checking for student session for auto-join.');
            const studentNameFromSession = sessionStorage.getItem('studentName');
            if (studentNameFromSession && !user) { 
                console.log('UserContext: Socket now connected, auto-joining as student:', studentNameFromSession);
                login(studentNameFromSession, 'student');
            } else if (!studentNameFromSession) {
               
                setIsUserLoading(false);
            }
           
        };

        const handleJoined = (userData) => {
            console.log('UserContext: Received "joined" event:', userData);
            setUser(userData);
            if (userData.role === 'student') {
                sessionStorage.setItem('studentName', userData.name);
            }
            setIsUserLoading(false);
            setUserError('');
            setKickedMessage('');
        };

        const handleKicked = (message) => {
            console.warn('UserContext: Received "kicked" event:', message);
            setKickedMessage(message || 'You have been removed by the teacher.');
            setUser(null);
            sessionStorage.removeItem('studentName');
            setIsUserLoading(false); 
        };

        const handleUserError = (errorData) => {
            console.error('UserContext: Received server error for user:', errorData.message);
            setUserError(errorData.message || 'An error occurred.');
            setIsUserLoading(false);
            
        };

        const handleDisconnect = (reason) => {
            console.log(`UserContext: Socket disconnected, reason: ${reason}`);
    
            if (!user) { 
                setIsUserLoading(false);
            }
        };

        socket.on('connect', handleConnect); 
        socket.on('kicked', handleKicked);
        socket.on('error', handleUserError);
        socket.on('disconnect', handleDisconnect);


        
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
    }, [socket, login, user]); 

    return (
        <UserContext.Provider value={{ user, login, logout, isUserLoading, userError, setUserError, kickedMessage }}>
            {children}
        </UserContext.Provider>
    );
};