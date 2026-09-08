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
    <header className={`fixed top-0 inset-x-0 z-50 backdrop-blur-xl border-b transition-colors duration-200 ${
      isDark
        ? 'bg-[#161120]/85 border-white/10 text-[#e8dff5]'
        : 'bg-white/90 border-slate-200 text-slate-800 shadow-sm'
    }`}>
      <div className="w-full max-w-[440px] mx-auto">
        {/* Dark and Light Mode Toggle Bar */}
        <div className={`px-5 py-1.5 flex items-center justify-between border-b transition-colors duration-200 select-none ${
          isDark ? 'border-white/5 text-[#e8dff5]' : 'border-slate-200/80 text-slate-700'
        }`}>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#a78bff]' : 'bg-[#6d4aff]'} animate-pulse`} />
            <span className="text-[10px] font-bold tracking-wider uppercase opacity-80">
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>

          {/* Interactive Mode Toggle Pill */}
          <button
            id="theme-mode-toggle-btn"
            onClick={toggleTheme}
            type="button"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            className={`flex items-center gap-0.5 p-0.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 active:scale-95 ${
              isDark
                ? 'bg-white/10 hover:bg-white/15 border border-white/15 text-white'
                : 'bg-slate-200 hover:bg-slate-300 border border-slate-300 text-slate-800'
            }`}
          >
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-all duration-200 ${
                !isDark
                  ? 'bg-white text-[#6d4aff] shadow-sm font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">light_mode</span>
              <span className="text-[10px]">Light</span>
            </div>
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-all duration-200 ${
                isDark
                  ? 'bg-[#6d4aff] text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">dark_mode</span>
              <span className="text-[10px]">Dark</span>
            </div>
          </button>
        </div>

        {/* Navigation Bar */}
        <div className="h-13 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            {showBack ? (
              <button
                onClick={handleBack}
                aria-label="Go back"
                className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-inherit hover:text-[#6d4aff] active:scale-90 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[22px]">arrow_back_ios_new</span>
              </button>
            ) : null}
            <div className="flex flex-col min-w-0">
              <span className={`text-[10px] uppercase tracking-wider font-bold leading-tight ${
                isDark ? 'text-[#a78bff]' : 'text-[#6d4aff]'
              }`}>
                {getHeaderSubtitle()}
              </span>
              <h1 className={`text-[18px] font-black tracking-tight truncate leading-tight ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}>
                {getHeaderTitle()}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('more');
              }}
              title="Notifications"
              className="w-9 h-9 rounded-full flex items-center justify-center text-inherit/70 hover:text-inherit hover:bg-white/10 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>
            <div
              onClick={() => setActiveTab('more')}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6d4aff] to-[#a78bff] flex items-center justify-center text-white shadow-md cursor-pointer hover:opacity-90 active:scale-95 transition-transform"
              title={`${settings.adminName} (Admin)`}
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
