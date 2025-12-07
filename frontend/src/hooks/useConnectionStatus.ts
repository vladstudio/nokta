import { useState, useEffect, useRef } from 'react';
import { pb, nokta } from '../services/pocketbase';

export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isPbConnected, setIsPbConnected] = useState(true);
  const [needsReload, setNeedsReload] = useState(false);
  const initialVersion = useRef<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check PocketBase connection and version
    const checkPbConnection = async () => {
      try {
        const { version } = await nokta.getInfo();
        if (!initialVersion.current) initialVersion.current = version;
        else if (version !== initialVersion.current) setNeedsReload(true);
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

  return { isOnline: isOnline && isPbConnected, needsReload };
}
