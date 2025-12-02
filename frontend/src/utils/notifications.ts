/**
 * Browser notification utility for new message alerts
 * Supports Electron desktop app, falls back to browser API
 */

declare global {
  interface Window {
    electronAPI?: { showNotification: (title: string, body: string) => void; isElectron: boolean };
  }
}

const isElectron = () => !!window.electronAPI?.isElectron;

export interface NotificationPermissionState {
  granted: boolean;
  denied: boolean;
  canRequest: boolean;
}

export async function getNotificationPermission(): Promise<NotificationPermissionState> {
  if (isElectron()) return { granted: true, denied: false, canRequest: false };
  if (!('Notification' in window)) return { granted: false, denied: true, canRequest: false };
  const p = Notification.permission;
  return { granted: p === 'granted', denied: p === 'denied', canRequest: p === 'default' };
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (isElectron()) return true;
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  return (await Notification.requestPermission()) === 'granted';
}

async function createNotification(title: string, options: NotificationOptions): Promise<Notification | null> {
  const perm = await getNotificationPermission();
  if (!perm.granted) return null;
  try {
    if (isElectron()) {
      window.electronAPI!.showNotification(title, options.body || '');
      return null;
    }
    return new Notification(title, options);
  } catch { return null; }
}

export async function showMessageNotification(title: string, body: string, options?: { chatId?: string; icon?: string; tag?: string }) {
  const truncated = body.length > 100 ? body.substring(0, 100) + '...' : body;
  return createNotification(title, {
    body: truncated,
    icon: options?.icon || '/logo.png',
    tag: options?.tag || `chat-${options?.chatId}`,
    badge: '/logo-badge.png',
    data: { chatId: options?.chatId, timestamp: Date.now() },
  });
}

export function showCallNotification(title: string, chatName: string, options?: { tag?: string }) {
  return createNotification(title, {
    body: `In ${chatName}`,
    icon: '/logo.png',
    tag: options?.tag,
    badge: '/logo-badge.png',
  });
}

const NOTIFICATION_PREF_KEY = 'notification_preference';
export function setNotificationPreference(enabled: boolean) { localStorage.setItem(NOTIFICATION_PREF_KEY, JSON.stringify(enabled)); }
export function getNotificationPreference(): boolean {
  const stored = localStorage.getItem(NOTIFICATION_PREF_KEY);
  return stored === null ? true : JSON.parse(stored);
}
