import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    let newSocket;
    if (isAuthenticated && user?.id) {
      newSocket = io(SERVER_URL, {
        withCredentials: true,
      });

      newSocket.on('connect', () => {
        console.log('🔌 Connected to real-time server:', newSocket.id);
        newSocket.emit('register', user.id);
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Disconnected from real-time server');
      });

      setSocket(newSocket);
    }

    return () => {
      if (newSocket) newSocket.close();
    };
  }, [isAuthenticated, user?.id]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
