import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full' | 'card';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'compact',
  className = ''
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running as an installed standalone app, suppress prompt
  if (isInstalled) {
    if (variant === 'card') {
      return (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#007d55]/15 border border-[#007d55]/30 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#4edea3] text-[20px]">check_circle</span>
            <div className="flex flex-col">
              <span className="font-bold text-white">App Installed</span>
              <span className="text-[11px] text-[#4edea3]">Running in standalone PWA mode</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#007d55]/30 text-[#4edea3] text-[10px] font-bold uppercase">
            Active
          </span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 3000);
    }
  };

  // Card Variant: For display inside More / Settings tab
  if (variant === 'card') {
    return (
      <div className="glass-card rounded-[24px] p-4 flex flex-col gap-3 relative overflow-hidden">
        <div className="flex items-center justify-between pb-1 border-b border-white/10">
          <span className="text-xs font-bold uppercase text-white flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-[#a78bff]">install_mobile</span>
            <span>Install Web App (PWA / PWABuilder)</span>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-[#6d4aff]/20 text-[#d0bcff] text-[9px] font-bold uppercase">
            PWA Ready
          </span>
        </div>

        <p className="text-xs text-[#938ea2] leading-relaxed">
          Install MediExpences directly onto your Android, iPhone, iPad, Windows, or Mac home screen with offline POS caching and standalone window support.
        </p>

        {isInstallable ? (
          <button
            type="button"
            onClick={handleInstallClick}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-[#6d4aff] to-[#a78bff] hover:from-[#5b3adb] hover:to-[#9370ff] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#6d4aff]/30 active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
            <span>Install on this Device</span>
          </button>
        ) : isIOS ? (
          <button
            type="button"
            onClick={() => setShowIOSGuide(true)}
            className="w-full h-11 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#a78bff]">ios_share</span>
            <span>Install on iPhone / iPad</span>
          </button>
        ) : (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-white/5 text-[11px] text-[#938ea2]">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-[#4edea3]">verified</span>
              <span>PWABuilder Manifest & Service Worker Active</span>
            </span>
            <span className="text-white/60">PWA 100% Valid</span>
          </div>
        )}

        {/* iOS Modal Guide */}
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div className="w-full max-w-sm rounded-3xl bg-[#161120] border border-white/20 p-5 shadow-2xl space-y-3.5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#6d4aff]/20 flex items-center justify-center text-[#d0bcff]">
                    <span className="material-symbols-outlined text-[18px]">phone_iphone</span>
                  </div>
                  <h3 className="font-bold text-sm text-white">Install on iOS / Safari</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>

              <div className="flex flex-col gap-2.5 text-xs text-[#c9c4d9]">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.04]">
                  <span className="w-5 h-5 rounded-full bg-[#6d4aff] text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                  <span>Tap the <strong>Share</strong> icon in the bottom Safari toolbar.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.04]">
                  <span className="w-5 h-5 rounded-full bg-[#6d4aff] text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                  <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.04]">
                  <span className="w-5 h-5 rounded-full bg-[#4edea3] text-black flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                  <span>Tap <strong>Add</strong> in the top right corner. The app will launch full screen!</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Compact Header / Pill Variant
  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={handleInstallClick}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#6d4aff] to-[#a78bff] text-white text-xs font-bold shadow-md shadow-[#6d4aff]/30 hover:scale-105 active:scale-95 transition-all cursor-pointer ${className}`}
        title="Install app to your home screen or desktop"
      >
        <span className="material-symbols-outlined text-[15px]">download_for_offline</span>
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold transition-all cursor-pointer ${className}`}
          title="Install on iOS Home Screen"
        >
          <span className="material-symbols-outlined text-[15px] text-[#a78bff]">ios_share</span>
          <span>Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
            <div className="w-full max-w-sm rounded-3xl bg-[#161120] border border-white/20 p-5 shadow-2xl space-y-3.5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white">Install on iPhone / iPad</h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
              <div className="text-xs text-[#c9c4d9] space-y-2">
                <p>1. Tap the <strong>Share</strong> button in Safari toolbar.</p>
                <p>2. Scroll down and choose <strong>Add to Home Screen</strong>.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
