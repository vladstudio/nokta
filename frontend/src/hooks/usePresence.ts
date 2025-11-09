import { useState, useEffect, useRef, useCallback } from 'react';
import { pb, auth } from '../services/pocketbase';
import type { UserPresenceData } from '../types';

const HEARTBEAT_INTERVAL = 5000; // Update every 5 seconds
const ONLINE_THRESHOLD = 30000; // Consider offline after 30 seconds

interface UserPresence {
  userId: string;
  isOnline: boolean;
  lastSeen: Date;
}

export function usePresence(userIds: string[]) {
  const [presenceMap, setPresenceMap] = useState<Map<string, UserPresence>>(new Map());
  const heartbeatTimerRef = useRef<number | null>(null);

  // Send heartbeat to update own presence
  const sendHeartbeat = useCallback(async () => {
    if (!auth.user) return;

    try {
      await pb.collection('users').update(auth.user.id, {
        last_seen: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to update presence:', err);
    }
  }, []);

  // Fetch presence for users
  const fetchPresence = useCallback(async () => {
    if (userIds.length === 0) return;

    try {
      const filter = userIds.map((id) => `id="${id}"`).join(' || ');
      const users = await pb.collection('users').getFullList<UserPresenceData>({
        filter,
        fields: 'id,last_seen',
      });

      const newMap = new Map<string, UserPresence>();
      const now = Date.now();

      users.forEach((user) => {
        const lastSeen = user.last_seen ? new Date(user.last_seen) : new Date(0);
        const isOnline = now - lastSeen.getTime() < ONLINE_THRESHOLD;

        newMap.set(user.id, {
          userId: user.id,
          isOnline,
          lastSeen,
        });
      });

      setPresenceMap(newMap);
    } catch (err) {
      console.error('Failed to fetch presence:', err);
    }
  }, [userIds]);

  // Start heartbeat
  useEffect(() => {
    if (!auth.user) return;

    // Send initial heartbeat
    sendHeartbeat();

    // Set up interval
    heartbeatTimerRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    return () => {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
      }
    };
  }, [sendHeartbeat]);

  // Fetch presence periodically
  useEffect(() => {
    if (userIds.length === 0) return;

    // Initial fetch
    fetchPresence();

    // Fetch every 30 seconds
    const intervalId = setInterval(fetchPresence, HEARTBEAT_INTERVAL);

    return () => clearInterval(intervalId);
  }, [fetchPresence, userIds.length]);

  return {
    presenceMap,
    isUserOnline: (userId: string) => presenceMap.get(userId)?.isOnline ?? false,
    getUserLastSeen: (userId: string) => presenceMap.get(userId)?.lastSeen,
  };
}
