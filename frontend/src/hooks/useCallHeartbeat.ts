import { useEffect } from 'react';
import { pb } from '../services/pocketbase';
import type { Call } from '../types';

/**
 * Hook to maintain call activity heartbeat
 *
 * Updates the call's last_activity timestamp every 30 seconds
 * to prevent the backend from marking it as stale and deleting it.
 *
 * This ensures calls are only cleaned up when truly abandoned
 * (browser closed, network disconnected, app crashed).
 */
export function useCallHeartbeat(activeCall: Call | null) {
  useEffect(() => {
    if (!activeCall) return;

    const HEARTBEAT_INTERVAL = 30 * 1000; // 30 seconds

    const updateActivity = async () => {
      try {
        await pb.collection('calls').update(activeCall.id, {
          last_activity: new Date().toISOString()
        });
      } catch (error) {
        console.error('[Heartbeat] Failed to update call activity:', error);
      }
    };

    // Send first heartbeat immediately
    updateActivity();

    // Then send every 30 seconds
    const intervalId = setInterval(updateActivity, HEARTBEAT_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [activeCall]);
}
