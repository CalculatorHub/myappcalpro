import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="aurora-card fixed bottom-16 md:bottom-4 left-4 z-50 flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#38BDF8]"
    >
      <WifiOff className="h-4 w-4 shrink-0 text-[#06B6D4]" aria-hidden="true" />
      <span>Offline mode active · All calculators run locally</span>
    </div>
  );
};
