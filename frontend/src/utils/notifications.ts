/**
 * Browser notification utility for new message alerts
 * Supports native Tauri notifications when running in desktop app
 */

declare global {
  interface Window { __TAURI__?: { notification?: unknown } }
}

const isTauri = () => {
  const result = !!window.__TAURI__;
  console.log('[notifications] isTauri:', result, 'window.__TAURI__:', window.__TAURI__);
  return result;
};

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
  console.log('[notifications] requestNotificationPermission called');
  if (isTauri()) {
    try {
      const { requestPermission, isPermissionGranted } = await import('@tauri-apps/plugin-notification');
      const alreadyGranted = await isPermissionGranted();
      console.log('[notifications] Tauri permission already granted:', alreadyGranted);
      if (alreadyGranted) return true;
      const result = await requestPermission();
      console.log('[notifications] Tauri requestPermission result:', result);
      return result === 'granted';
    } catch (err) {
      console.error('[notifications] Tauri permission error:', err);
      return false;
    }
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
  console.log('[notifications] createNotification:', title, options.body);
  const perm = await getNotificationPermission();
  console.log('[notifications] permission state:', perm);
  if (!perm.granted) {
    console.log('[notifications] permission not granted, skipping');
    return null;
  }
  try {
    if (isTauri()) {
      const { sendNotification } = await import('@tauri-apps/plugin-notification');
      console.log('[notifications] sending Tauri notification');
      sendNotification({ title, body: options.body || '' });
      console.log('[notifications] Tauri notification sent');
      return null;
    }
    return new Notification(title, options);
  } catch (err) {
    console.error('[notifications] Failed to show notification:', err);
    return null;
  }
}

/**
 * Show a notification for a new message
 */
export async function showMessageNotification(title: string, body: string, options?: { chatId?: string; icon?: string; tag?: string }) {
  console.log('[notifications] showMessageNotification:', title, body);
  const truncated = body.length > 100 ? body.substring(0, 100) + '...' : body;
  return createNotification(title, {
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
