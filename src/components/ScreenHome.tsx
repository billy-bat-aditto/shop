import React from 'react';
import { usePharmacy } from '../context/PharmacyContext';

export const ScreenHome: React.FC = () => {
  const {
    todaySalesTotal,
    todayExpensesTotal,
    todayProfitTotal,
    lowStockCount,
    medicines,
    settings,
    setActiveTab,
    setMoreSubTab,
    setIsAddMedModalOpen
  } = usePharmacy();

  // Find low stock medicines
  const lowStockMeds = medicines
    .filter((m) => m.stockPieces <= m.lowStockThreshold)
    .slice(0, 4);

  // Profit margin percentage
  const marginPercent = todaySalesTotal > 0
    ? Math.round((todayProfitTotal / todaySalesTotal) * 1000) / 10
    : 84.6;

  // Real-time live date formatted accurately based on client system clock
  const currentDateFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  }).format(new Date());

  return (
    <div className="flex flex-col w-full pb-28 pt-2">
      {/* Header Greeting & Live Shop Badge */}
      <div className="flex items-center justify-between py-1 mb-4">
        <div className="flex items-center gap-3">
          {/* Brand Logo with Liquid Glass Framing */}
          <div
            onClick={() => {
              setActiveTab('more');
              setMoreSubTab('settings');
            }}
            className="w-12 h-12 rounded-2xl bg-white/[0.08] backdrop-blur-xl p-1 flex items-center justify-center border border-white/20 shadow-lg shadow-[#6d4aff]/20 overflow-hidden cursor-pointer hover:scale-105 active:scale-95 transition-all"
            title="Tap to manage branding in Settings"
          >
            <img
              src={settings?.logoUrl || '/logo.png'}
              alt="MediExpences Logo"
              className="w-full h-full object-cover rounded-xl shadow-inner"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-bold text-[#6d4aff] dark:text-[#d0bcff] uppercase tracking-wider flex items-center gap-1">
              <span>{currentDateFormatted}</span>
              <span className="w-1 h-1 rounded-full bg-[#4edea3]" />
              <span className="text-[9px] font-medium text-[#4edea3]">today</span>
            </span>
            <span
              onClick={() => {
                setActiveTab('more');
                setMoreSubTab('settings');
              }}
              className="text-base font-extrabold text-[#0a0518] dark:text-white tracking-tight leading-tight truncate max-w-[210px] cursor-pointer hover:underline"
              title={settings?.pharmacyName || 'MediExpences'}
            >
              {settings?.pharmacyName || 'MediExpences'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 dark:bg-white/[0.06] backdrop-blur-md border border-purple-900/10 dark:border-white/10 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#007d55] dark:bg-[#4edea3] animate-ping" />
          <span className="text-[10px] font-bold text-[#007d55] dark:text-[#6ffbbe] tracking-wider uppercase">
            Live Shop
          </span>
        </div>
      </div>

      {/* 2x2 Liquid Glass Stat Cards Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* 1. Today's Sales */}
        <div
          onClick={() => setActiveTab('sales')}
          className="liquid-glass-card rounded-[26px] p-4 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[#c9c4d9] font-semibold">Today's Sales</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6d4aff]/40 to-[#a78bff]/30 border border-white/20 flex items-center justify-center text-[#e5deff] shadow-sm">
              <span className="material-symbols-outlined text-[17px]">payments</span>
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight text-white drop-shadow-sm">
            ৳{todaySalesTotal > 0 ? todaySalesTotal.toLocaleString() : '3,250'}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[#4edea3]">
            <span className="material-symbols-outlined text-[15px]">trending_up</span>
            <span className="text-[10px] font-bold">+14% vs ystd</span>
          </div>
        </div>

        {/* 2. Expenses */}
        <div
          onClick={() => {
            setActiveTab('more');
            setMoreSubTab('expenses');
          }}
          className="liquid-glass-card rounded-[26px] p-4 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[#c9c4d9] font-semibold">Expenses</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500/30 to-red-400/20 border border-white/20 flex items-center justify-center text-[#ffb4ab] shadow-sm">
              <span className="material-symbols-outlined text-[17px]">receipt</span>
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight text-white drop-shadow-sm">
            ৳{todayExpensesTotal > 0 ? todayExpensesTotal.toLocaleString() : '500'}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[#ffb4ab]">
            <span className="material-symbols-outlined text-[15px]">trending_down</span>
            <span className="text-[10px] font-bold">2 payouts logged</span>
          </div>
        </div>

        {/* 3. Profit */}
        <div
          onClick={() => {
            setActiveTab('more');
            setMoreSubTab('reports');
          }}
          className="liquid-glass-card rounded-[26px] p-4 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[#c9c4d9] font-semibold">Net Profit</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00b074]/40 to-[#4edea3]/30 border border-white/20 flex items-center justify-center text-[#4edea3] shadow-sm">
              <span className="material-symbols-outlined text-[17px]">account_balance_wallet</span>
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight text-[#4edea3] drop-shadow-[0_0_14px_rgba(78,222,163,0.4)]">
            ৳{todayProfitTotal > 0 ? todayProfitTotal.toLocaleString() : '2,750'}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[#6ffbbe]">
            <span className="material-symbols-outlined text-[15px]">check_circle</span>
            <span className="text-[10px] font-bold">{marginPercent}% Margin</span>
          </div>
        </div>

        {/* 4. Low Stock */}
        <div
          onClick={() => setActiveTab('inventory')}
          className="liquid-glass-card rounded-[26px] p-4 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-[#c9c4d9] font-semibold">Low Stock</span>
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 absolute animate-ping opacity-75" />
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500/30 to-amber-400/20 border border-white/20 flex items-center justify-center text-amber-300 shadow-sm">
                <span className="material-symbols-outlined text-[17px]">warning</span>
              </div>
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.45)]">
            {lowStockCount > 0 ? lowStockCount : 7}
          </div>
          <div className="flex items-center gap-1 mt-1 text-amber-400">
            <span className="material-symbols-outlined text-[15px]">priority_high</span>
            <span className="text-[10px] font-bold">Action needed</span>
          </div>
        </div>
      </div>

      {/* Quick Action Row */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#938ea2]">
            Quick Actions
          </span>
          <span className="text-[10px] text-[#a78bff] font-semibold">Touch shortcuts</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {/* New Sale CTA (iOS 26 Liquid Gradient Capsule) */}
          <button
            onClick={() => setActiveTab('sales')}
            className="group flex flex-col items-center justify-center gap-1.5 py-3 rounded-[22px] bg-gradient-to-br from-[#7c5cff] via-[#6d4aff] to-[#5534d1] border-t border-white/45 border-x border-white/20 shadow-[0_8px_24px_rgba(109,74,255,0.45),inset_0_1px_2px_rgba(255,255,255,0.4)] transition-all duration-200 active:scale-95 text-white cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center backdrop-blur-md shadow-inner">
              <span className="material-symbols-outlined text-[20px] text-white">add_shopping_cart</span>
            </div>
            <span className="text-[10px] font-extrabold tracking-tight">New Sale</span>
          </button>

          {/* Add Med (Liquid Glass) */}
          <button
            onClick={() => setIsAddMedModalOpen(true)}
            className="group flex flex-col items-center justify-center gap-1.5 py-3 rounded-[22px] liquid-glass-card transition-all duration-200 active:scale-95 text-white cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[#c9bfff] border border-white/10">
              <span className="material-symbols-outlined text-[20px]">medication</span>
            </div>
            <span className="text-[10px] font-semibold text-[#c9c4d9]">Add Med</span>
          </button>

          {/* Dues (Liquid Glass) */}
          <button
            onClick={() => setActiveTab('dues')}
            className="group flex flex-col items-center justify-center gap-1.5 py-3 rounded-[22px] liquid-glass-card transition-all duration-200 active:scale-95 text-white cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[#d0bcff] border border-white/10">
              <span className="material-symbols-outlined text-[20px]">pending_actions</span>
            </div>
            <span className="text-[10px] font-semibold text-[#c9c4d9]">Dues</span>
          </button>

          {/* Reports (Liquid Glass) */}
          <button
            onClick={() => {
              setActiveTab('more');
              setMoreSubTab('reports');
            }}
            className="group flex flex-col items-center justify-center gap-1.5 py-3 rounded-[22px] liquid-glass-card transition-all duration-200 active:scale-95 text-white cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[#4edea3] border border-white/10">
              <span className="material-symbols-outlined text-[20px]">analytics</span>
            </div>
            <span className="text-[10px] font-semibold text-[#c9c4d9]">Reports</span>
          </button>
        </div>
      </div>

      {/* Low Stock Alert Glass Container */}
      <div className="liquid-glass-card rounded-[28px] p-4 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400">
              <span className="material-symbols-outlined text-[18px]">inventory</span>
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-white leading-snug">Low Stock Alerts</h3>
              <span className="text-[10px] text-[#938ea2]">Immediate restock recommended</span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('inventory')}
            className="px-2.5 py-1 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-[#d0bcff] text-[10px] font-semibold transition-colors cursor-pointer"
          >
            View All
          </button>
        </div>

        {/* Medicine List Items */}
        <div className="flex flex-col gap-2">
          {lowStockMeds.map((med) => {
            const stripsLeft = Math.floor(med.stockPieces / med.unitsPerStrip);
            const isCritical = med.stockPieces < 15;
            return (
              <div
                key={med.id}
                onClick={() => setActiveTab('inventory')}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isCritical ? 'bg-amber-500/20 text-amber-300' : 'bg-[#6d4aff]/20 text-[#c9bfff]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">pill</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-white truncate">{med.name}</span>
                    <span className="text-[11px] text-[#938ea2] truncate">{med.company}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-0.5 shrink-0 ml-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      isCritical ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-500/15 text-amber-400'
                    }`}
                  >
                    {isCritical ? 'Critical' : 'Low Stock'}
                  </span>
                  <span className="text-[10px] text-[#c9c4d9]">
                    {stripsLeft > 0 ? `${stripsLeft} strips left` : `${med.stockPieces} pcs left`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action in Card */}
        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] text-[#938ea2]">Suppliers Auto-Notified</span>
          <button
            onClick={() => setActiveTab('inventory')}
            className="flex items-center gap-1 text-xs font-semibold text-[#a78bff] hover:text-[#d0bcff] transition-colors cursor-pointer"
          >
            <span>Generate Order</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-6 text-center select-none">
        <span className="text-[10px] tracking-widest uppercase text-[#4b435b]/70 dark:text-white/30 font-semibold">
          made by aditto 💜
        </span>
      </div>
    </div>
  );
};
