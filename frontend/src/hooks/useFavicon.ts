import { useEffect } from 'react';

/**
 * Updates the favicon based on unread message status
 *
 * @param hasUnread - Whether there are any unread messages
 */
export function useFavicon(hasUnread: boolean) {
  useEffect(() => {
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');

    if (favicon) {
      favicon.href = hasUnread ? '/favicon-unread.svg' : '/favicon.svg';
    }
  }, [hasUnread]);
}
