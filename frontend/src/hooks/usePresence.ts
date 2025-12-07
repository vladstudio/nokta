import { useState, useEffect, useCallback, useMemo } from 'react';
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

  // Stabilize userIds dependency to prevent unnecessary re-fetches
  const userIdsKey = useMemo(() => [...userIds].sort().join(','), [userIds]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userIdsKey]);

  // Combined heartbeat + presence fetch interval
  useEffect(() => {
    const tick = () => {
      if (auth.user) sendHeartbeat();
      if (userIds.length > 0) fetchPresence();
    };
    tick();
    const intervalId = setInterval(tick, HEARTBEAT_INTERVAL);
    return () => clearInterval(intervalId);
  }, [sendHeartbeat, fetchPresence, userIds.length]);

  const isUserOnline = useCallback(
    (userId: string) => presenceMap.get(userId)?.isOnline ?? false,
    [presenceMap]
  );

  const getUserLastSeen = useCallback(
    (userId: string) => presenceMap.get(userId)?.lastSeen,
    [presenceMap]
  );

  return {
    presenceMap,
    isUserOnline,
    getUserLastSeen,
  };
}
