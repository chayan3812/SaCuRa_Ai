import { useState, useEffect } from 'react';

// 👁️ Enhanced by AI on 2025-06-15 — Feature: RestrictionMonitor
export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.socket) {
      const socket = window.socket;
      
      const handleConnect = () => setIsConnected(true);
      const handleDisconnect = () => setIsConnected(false);
      
      // Set initial state
      setIsConnected(socket.connected);
      
      // Listen for connection events
      socket.on('connect', handleConnect);
      socket.on('disconnect', handleDisconnect);
      
      return () => {
        socket.off('connect', handleConnect);
        socket.off('disconnect', handleDisconnect);
      };
    }
  }, []);

  return { isConnected };
}