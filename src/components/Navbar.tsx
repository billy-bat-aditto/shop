import React from 'react';
import { usePharmacy } from '../context/PharmacyContext';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, cartTotalCount, settings } = usePharmacy();
  const isDark = (settings.themeMode || settings.theme) !== 'light';

  interface NavItem {
    id: 'home' | 'sales' | 'inventory' | 'dues' | 'more';
    label: string;
    icon: string;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'sales', label: 'Sales', icon: 'point_of_sale', badge: cartTotalCount },
    { id: 'inventory', label: 'Inventory', icon: 'inventory_2' },
    { id: 'dues', label: 'Dues', icon: 'receipt_long' },
    { id: 'more', label: 'More', icon: 'more_horiz' },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 pointer-events-none pb-safe">
      <div className="w-full max-w-[430px] mx-auto px-4 pb-3 pointer-events-auto">
        <nav className="liquid-glass-dock rounded-[32px] h-16 flex items-center justify-around px-2.5 transition-all duration-300">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center w-14 h-12 rounded-[22px] transition-all duration-250 cursor-pointer active:scale-90 ${
                  isActive
                    ? isDark
                      ? 'text-white bg-gradient-to-b from-[#6d4aff]/50 to-[#6d4aff]/20 border-t border-white/40 shadow-[0_4px_18px_rgba(109,74,255,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] font-extrabold'
                      : 'text-[#5b3adb] bg-gradient-to-b from-white to-[#ede9f6] border-t border-white shadow-[0_4px_14px_rgba(109,74,255,0.18),inset_0_1px_2px_rgba(255,255,255,1)] font-extrabold'
                    : isDark
                      ? 'text-[#938ea2] hover:text-[#e8dff5] hover:bg-white/[0.04]'
                      : 'text-slate-600 hover:text-black hover:bg-black/[0.03] font-semibold'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[22px] transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>
                <span className="text-[10px] leading-none mt-0.5 tracking-tight font-medium">
                  {item.label}
                </span>

                {/* Badge for items in cart with Liquid Glow */}
                {item.badge !== undefined && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-0.5 min-w-[20px] h-[20px] px-1 rounded-full bg-gradient-to-tr from-[#6d4aff] via-[#e84188] to-[#ff7eb3] border border-white/40 text-white text-[10px] font-black flex items-center justify-center shadow-[0_2px_10px_rgba(232,65,136,0.6)] animate-pulse keep-white">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
