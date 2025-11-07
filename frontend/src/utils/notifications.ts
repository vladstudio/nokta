/**
 * Browser notification utility for new message alerts
 */

export interface NotificationPermissionState {
  granted: boolean;
  denied: boolean;
  canRequest: boolean;
}

/**
 * Check current notification permission status
 */
export function getNotificationPermission(): NotificationPermissionState {
  if (!('Notification' in window)) {
    return { granted: false, denied: true, canRequest: false };
  }

  const permission = Notification.permission;

  return {
    granted: permission === 'granted',
    denied: permission === 'denied',
    canRequest: permission === 'default',
  };
}

/**
 * Request notification permission from user
 * Should be called on user interaction (e.g., button click, app mount)
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('User has denied notification permission');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (err) {
    console.error('Failed to request notification permission:', err);
    return false;
  }
}

/**
 * Show a notification for a new message
 *
 * @param title - Chat name or sender name
 * @param body - Message content (truncated if too long)
 * @param options - Additional notification options
 */
export function showMessageNotification(
  title: string,
  body: string,
  options?: {
    chatId?: string;
    spaceId?: string;
    icon?: string;
    tag?: string;
  }
): Notification | null {
  const permission = getNotificationPermission();

  if (!permission.granted) {
    return null;
  }

  try {
    // Truncate body if too long
    const truncatedBody = body.length > 100
      ? body.substring(0, 100) + '...'
      : body;

    const notification = new Notification(title, {
      body: truncatedBody,
      icon: options?.icon || '/logo.png', // App logo
      tag: options?.tag || `chat-${options?.chatId}`, // Prevent duplicates
      badge: '/logo-badge.png', // Small icon for mobile
      requireInteraction: false, // Auto-dismiss after timeout
      silent: false, // Play sound
      data: {
        chatId: options?.chatId,
        spaceId: options?.spaceId,
        timestamp: Date.now(),
      },
    });

    return notification;
  } catch (err) {
    console.error('Failed to show notification:', err);
    return null;
  }
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
