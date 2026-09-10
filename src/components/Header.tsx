import React from 'react';
import { usePharmacy } from '../context/PharmacyContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack
}) => {
  const { activeTab, setActiveTab, settings, toggleTheme } = usePharmacy();
  const isDark = (settings.themeMode || settings.theme) !== 'light';

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setActiveTab('home');
    }
  };

  const getHeaderTitle = () => {
    if (title) return title;
    switch (activeTab) {
      case 'home':
        return 'Dashboard';
      case 'sales':
        return 'New Sale Transaction';
      case 'inventory':
        return 'Inventory';
      case 'dues':
        return 'Dues';
      case 'more':
        return 'More Settings';
      default:
        return 'Dashboard';
    }
  };

  const getHeaderSubtitle = () => {
    if (subtitle) return subtitle;
    return 'MediExpences';
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 pointer-events-none px-3 pt-2">
      <div className={`w-full max-w-[430px] mx-auto pointer-events-auto rounded-[24px] backdrop-blur-2xl transition-all duration-300 ${
        isDark
          ? 'bg-gradient-to-b from-[#18112a]/90 to-[#0e0a1b]/92 border-t border-white/35 border-x border-white/15 border-b border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.65),inset_0_1px_2px_rgba(255,255,255,0.3)] text-[#e8dff5]'
          : 'bg-gradient-to-b from-white/95 to-[#f7f5fc]/92 border-t border-white border-x border-purple-900/10 border-b border-purple-900/10 shadow-[0_14px_30px_rgba(109,74,255,0.12),inset_0_1px_2px_rgba(255,255,255,1)] text-slate-800'
      }`}>
        {/* Navigation & Action Bar */}
        <div className="h-14 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {showBack ? (
              <button
                onClick={handleBack}
                aria-label="Go back"
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-inherit active:scale-90 transition-all cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back_ios_new</span>
              </button>
            ) : null}
            <div className="flex flex-col min-w-0">
              <span className={`text-[9px] uppercase tracking-wider font-extrabold leading-none ${
                isDark ? 'text-[#a78bff]' : 'text-[#6d4aff]'
              }`}>
                {getHeaderSubtitle()}
              </span>
              <h1 className={`text-[16px] font-black tracking-tight truncate leading-tight ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}>
                {getHeaderTitle()}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="theme-mode-toggle-btn"
              onClick={toggleTheme}
              type="button"
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-inherit cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isDark ? 'dark_mode' : 'light_mode'}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('more')}
              title="Notifications"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/15 active:scale-95 transition-all text-inherit cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">notifications</span>
            </button>
            <div
              onClick={() => setActiveTab('more')}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6d4aff] to-[#a78bff] flex items-center justify-center text-white shadow-md shadow-[#6d4aff]/40 cursor-pointer hover:opacity-95 active:scale-95 transition-transform"
              title={`${settings.adminName} (Admin)`}
            >
              <span className="material-symbols-outlined text-[16px]">person</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
