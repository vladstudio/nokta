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
 * Internal helper to create a notification with common logic
 */
function createNotification(
  title: string,
  notificationOptions: NotificationOptions
): Notification | null {
  const permission = getNotificationPermission();

  if (!permission.granted) {
    return null;
  }

  try {
    return new Notification(title, notificationOptions);
  } catch (err) {
    console.error('Failed to show notification:', err);
    return null;
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
    icon?: string;
    tag?: string;
  }
): Notification | null {
  const truncatedBody = body.length > 100
    ? body.substring(0, 100) + '...'
    : body;

  return createNotification(title, {
    body: truncatedBody,
    icon: options?.icon || '/logo.png',
    tag: options?.tag || `chat-${options?.chatId}`,
    badge: '/logo-badge.png',
    requireInteraction: false,
    silent: false,
    data: {
      chatId: options?.chatId,
      timestamp: Date.now(),
    },
  });
}

/**
 * Show a notification for an incoming call
 *
 * @param callerName - Name of the person calling
 * @param chatName - Name of the chat
 * @param options - Additional notification options
 */
export function showCallNotification(
  callerName: string,
  chatName: string,
  options?: {
    inviteId?: string;
    icon?: string;
    tag?: string;
  }
): Notification | null {
  return createNotification(`Incoming call from ${callerName}`, {
    body: `In ${chatName}`,
    icon: options?.icon || '/logo.png',
    tag: options?.tag || `call-invite-${options?.inviteId}`,
    badge: '/logo-badge.png',
    requireInteraction: true,
    silent: false,
    data: {
      inviteId: options?.inviteId,
      timestamp: Date.now(),
      type: 'call-invite',
    },
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
