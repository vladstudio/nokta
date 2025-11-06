import { useState, useEffect } from 'react';
import { pb } from '../services/pocketbase';

export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isPbConnected, setIsPbConnected] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check PocketBase connection by pinging health endpoint
    const checkPbConnection = async () => {
      try {
        await pb.health.check();
        setIsPbConnected(true);
      } catch {
        setIsPbConnected(false);
      }
    };

    // Check connection every 10 seconds
    const interval = setInterval(checkPbConnection, 10000);
    checkPbConnection();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return { isOnline: isOnline && isPbConnected };
}
