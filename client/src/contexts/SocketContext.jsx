
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        
        const socketUrl = import.meta.env.VITE_REACT_APP_SOCKET_URL || 'http://localhost:3001';
        console.log('Attempting to connect to socket server at:', socketUrl);
        const newSocket = io(socketUrl);

        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
        });

        newSocket.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message, err.type, err.description);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

        setSocket(newSocket);

        return () => {
            console.log('Closing socket connection');
            newSocket.close();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};