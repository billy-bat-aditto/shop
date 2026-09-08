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
        <nav className="glass-dock rounded-full h-16 flex items-center justify-around px-2 shadow-2xl">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 cursor-pointer active:scale-90 ${
                  isActive
                    ? isDark
                      ? 'text-white bg-[#6d4aff]/30 shadow-[0_0_16px_rgba(109,74,255,0.6)] font-bold'
                      : 'text-[#6d4aff] bg-[#6d4aff]/20 shadow-sm font-bold'
                    : isDark
                      ? 'text-[#938ea2] hover:text-[#e8dff5]'
                      : 'text-slate-600 hover:text-black font-semibold'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[22px] transition-transform"
                  style={{
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  {item.icon}
                </span>
                <span className="text-[10px] leading-none mt-0.5">
                  {item.label}
                </span>

                {/* Badge for items in cart */}
                {item.badge !== undefined && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-[#6d4aff] to-[#e84188] text-white text-[10px] font-bold flex items-center justify-center shadow-lg animate-bounce keep-white">
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
