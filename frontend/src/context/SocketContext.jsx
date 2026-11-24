import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { isAuthenticated, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const s = io(SOCKET_URL, { auth: { token }, transports: ['websocket'] });
      setSocket(s);
      s.on('connect', () => setConnected(true));
      s.on('disconnect', () => setConnected(false));
      return () => {
        s.disconnect();
        setSocket(null);
        setConnected(false);
      };
    }
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
