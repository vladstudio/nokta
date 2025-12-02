/**
 * Browser notification utility for new message alerts
 * Supports native Tauri notifications when running in desktop app
 */

declare global {
  interface Window { __TAURI__?: { notification?: unknown } }
}

const isTauri = () => !!window.__TAURI__;

export interface NotificationPermissionState {
  granted: boolean;
  denied: boolean;
  canRequest: boolean;
}

/**
 * Check current notification permission status
 */
export async function getNotificationPermission(): Promise<NotificationPermissionState> {
  if (isTauri()) {
    const { isPermissionGranted } = await import('@tauri-apps/plugin-notification');
    const granted = await isPermissionGranted();
    return { granted, denied: false, canRequest: !granted };
  }
  if (!('Notification' in window)) return { granted: false, denied: true, canRequest: false };
  const p = Notification.permission;
  return { granted: p === 'granted', denied: p === 'denied', canRequest: p === 'default' };
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (isTauri()) {
    const { requestPermission, isPermissionGranted } = await import('@tauri-apps/plugin-notification');
    if (await isPermissionGranted()) return true;
    return (await requestPermission()) === 'granted';
  }
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  return (await Notification.requestPermission()) === 'granted';
}

/**
 * Internal helper to create a notification
 */
async function createNotification(title: string, options: NotificationOptions): Promise<Notification | null> {
  const perm = await getNotificationPermission();
  if (!perm.granted) return null;
  try {
    if (isTauri()) {
      const { sendNotification } = await import('@tauri-apps/plugin-notification');
      sendNotification({ title, body: options.body || '' });
      return null;
    }
    return new Notification(title, options);
  } catch (err) {
    console.error('Failed to show notification:', err);
    return null;
  }
}

/**
 * Show a notification for a new message
 */
export function showMessageNotification(title: string, body: string, options?: { chatId?: string; icon?: string; tag?: string }) {
  const truncated = body.length > 100 ? body.substring(0, 100) + '...' : body;
  createNotification(title, {
    body: truncated,
    icon: options?.icon || '/logo.png',
    tag: options?.tag || `chat-${options?.chatId}`,
    badge: '/logo-badge.png',
    data: { chatId: options?.chatId, timestamp: Date.now() },
  });
}

/**
 * Show a notification for an incoming call
 */
export function showCallNotification(callerName: string, chatName: string, options?: { inviteId?: string; icon?: string; tag?: string }) {
  createNotification(`Incoming call from ${callerName}`, {
    body: `In ${chatName}`,
    icon: options?.icon || '/logo.png',
    tag: options?.tag || `call-invite-${options?.inviteId}`,
    badge: '/logo-badge.png',
    requireInteraction: true,
    data: { inviteId: options?.inviteId, timestamp: Date.now(), type: 'call-invite' },
  });
}

/**
 * Store notification preference in localStorage
 */
const NOTIFICATION_PREF_KEY = 'notification_preference';

export function setNotificationPreference(enabled: boolean) {
  localStorage.setItem(NOTIFICATION_PREF_KEY, JSON.stringify(enabled));
}

export function getNotificationPreference(): boolean {
  const stored = localStorage.getItem(NOTIFICATION_PREF_KEY);
  if (stored === null) {
    return true; // Default: enabled
  }
  return JSON.parse(stored);
}
