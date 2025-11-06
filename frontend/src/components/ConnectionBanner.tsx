import { useConnectionStatus } from '../hooks/useConnectionStatus';

export default function ConnectionBanner() {
  const { isOnline } = useConnectionStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium z-50">
      You are offline. Messages will be sent when connection is restored.
    </div>
  );
}
