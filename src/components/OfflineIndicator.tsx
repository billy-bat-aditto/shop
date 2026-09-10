import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 inset-x-4 max-w-sm mx-auto z-50 flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl bg-[#281814]/90 border border-amber-500/40 text-amber-200 text-xs shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <span className="font-semibold text-white">Offline Mode Active</span>
      </div>
      <span className="text-[11px] text-amber-300/80">Using local cached inventory</span>
    </div>
  );
};
