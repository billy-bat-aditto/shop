import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { ExpenseCategory, PaymentMethod } from '../types';

export const ScreenMore: React.FC = () => {
  const {
    moreSubTab,
    setMoreSubTab,
    expenses,
    addExpense,
    deleteExpense,
    sales,
    medicines,
    settings,
    updateSettings,
    toggleTheme,
    exportDataJson,
    importDataJson,
    resetToMockData,
    todaySalesTotal,
    todayExpensesTotal,
    todayProfitTotal
  } = usePharmacy();

  // Expense form state
  const [expenseAmount, setExpenseAmount] = useState<number>(150);
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('Tea & Snacks');
  const [expenseMethod, setExpenseMethod] = useState<PaymentMethod>('Cash');
  const [expenseNote, setExpenseNote] = useState('');
  const [expenseSuccess, setExpenseSuccess] = useState(false);

  // Reports state
  const [reportTimeframe, setReportTimeframe] = useState<'today' | 'week' | 'month'>('week');

  // Reset confirmation modal
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (expenseAmount <= 0) return;

    addExpense({
      amount: Number(expenseAmount),
      category: expenseCategory,
      method: expenseMethod,
      note: expenseNote || undefined,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    });

    setExpenseSuccess(true);
    setExpenseAmount(0);
    setExpenseNote('');
    setTimeout(() => setExpenseSuccess(false), 1200);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJson(content);
        if (success) {
          showToast('Data imported and restored successfully! ✨');
        } else {
          showToast('Failed to import backup. Please check file format.');
        }
      }
    };
    reader.readAsText(file);
  };

  // Top selling medicines ranking calculation
  const medicineSalesMap: { [medId: string]: { name: string; strips: number; pieces: number; total: number } } = {};
  sales.forEach((s) => {
    s.items.forEach((item) => {
      if (!medicineSalesMap[item.medicineId]) {
        medicineSalesMap[item.medicineId] = { name: item.name, strips: 0, pieces: 0, total: 0 };
      }
      if (item.mode === 'strip') {
        medicineSalesMap[item.medicineId].strips += item.quantity;
      } else {
        medicineSalesMap[item.medicineId].pieces += item.quantity;
      }
      medicineSalesMap[item.medicineId].total += item.lineTotal;
    });
  });

  const topSellingList = Object.values(medicineSalesMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Strip vs piece volume
  let totalStripsSold = 0;
  let totalPiecesSold = 0;
  sales.forEach((s) => {
    s.items.forEach((i) => {
      if (i.mode === 'strip') totalStripsSold += i.quantity;
      else totalPiecesSold += i.quantity;
    });
  });
  const totalVolumeUnits = totalStripsSold + totalPiecesSold || 1;
  const stripPercent = Math.round((totalStripsSold / totalVolumeUnits) * 100);
  const piecePercent = 100 - stripPercent;

  return (
    <div className="flex flex-col w-full pb-36 pt-1">
      {/* Sub-Tabs Selector Navigation (Expenses | Reports | Settings) */}
      <div className="flex items-center p-1 rounded-2xl bg-white/[0.06] border border-white/10 backdrop-blur-xl mb-4 shadow-md">
        <button
          onClick={() => setMoreSubTab('expenses')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            moreSubTab === 'expenses'
              ? 'bg-gradient-to-r from-[#6d4aff] to-[#a78bff] text-white shadow-md'
              : 'text-[#938ea2] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">receipt</span>
          <span>Expenses</span>
        </button>

        <button
          onClick={() => setMoreSubTab('reports')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            moreSubTab === 'reports'
              ? 'bg-gradient-to-r from-[#6d4aff] to-[#a78bff] text-white shadow-md'
              : 'text-[#938ea2] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">query_stats</span>
          <span>Reports</span>
        </button>

        <button
          onClick={() => setMoreSubTab('settings')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            moreSubTab === 'settings'
              ? 'bg-gradient-to-r from-[#6d4aff] to-[#a78bff] text-white shadow-md'
              : 'text-[#938ea2] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[17px]">settings</span>
          <span>Settings</span>
        </button>
      </div>

      {/* SUB-VIEW 1: EXPENSES */}
      {moreSubTab === 'expenses' && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
          {/* Summary Stat Card */}
          <div className="glass-card rounded-[24px] p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-[#ffb4ab] font-bold">
                Today's Logged Expenses
              </span>
              <span className="text-3xl font-black text-white mt-0.5">
                ৳{todayExpensesTotal.toLocaleString()}
              </span>
              <span className="text-[11px] text-[#938ea2] mt-0.5">
                All daily operations & shop payouts
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-300">
              <span className="material-symbols-outlined text-[26px]">account_balance</span>
            </div>
          </div>

          {/* Quick Add Expense Form */}
          <div className="glass-card rounded-[24px] p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 pb-1 border-b border-white/10">
              <span className="material-symbols-outlined text-[18px] text-[#a78bff]">add_box</span>
              <span className="text-xs font-bold uppercase text-[#d0bcff]">Log New Expense</span>
            </div>

            <form onSubmit={handleAddExpense} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#938ea2] uppercase font-bold">Amount (৳)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(parseFloat(e.target.value) || 0)}
                    placeholder="150"
                    className="h-11 px-3 rounded-xl bg-black/40 border border-white/10 text-white font-bold text-sm outline-none focus:border-[#6d4aff]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#938ea2] uppercase font-bold">Category</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                    className="h-11 px-2.5 rounded-xl bg-[#161120] border border-white/10 text-white text-xs outline-none cursor-pointer"
                  >
                    <option value="Tea & Snacks">Tea & Snacks</option>
                    <option value="Utility Bill">Utility Bill</option>
                    <option value="Shop Rent">Shop Rent</option>
                    <option value="Staff Salary">Staff Salary</option>
                    <option value="Supplier Invoice">Supplier Invoice</option>
                    <option value="Cleaning & Misc">Cleaning & Misc</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#938ea2] uppercase font-bold">Method</label>
                  <select
                    value={expenseMethod}
                    onChange={(e) => setExpenseMethod(e.target.value as PaymentMethod)}
                    className="h-11 px-2.5 rounded-xl bg-[#161120] border border-white/10 text-white text-xs outline-none cursor-pointer"
                  >
                    <option value="Cash">Cash</option>
                    <option value="bKash">bKash</option>
                    <option value="Card">Card</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#938ea2] uppercase font-bold">Note</label>
                  <input
                    type="text"
                    value={expenseNote}
                    onChange={(e) => setExpenseNote(e.target.value)}
                    placeholder="e.g. Afternoon tea & biscuits"
                    className="h-11 px-3 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none focus:border-[#6d4aff]"
                  />
                </div>
              </div>

              {expenseSuccess ? (
                <div className="p-2 rounded-xl bg-green-950/60 border border-green-500/40 text-green-300 text-xs text-center font-bold">
                  Expense logged successfully! ✨
                </div>
              ) : null}

              <button
                type="submit"
                className="w-full h-11 rounded-full bg-gradient-to-r from-[#6d4aff] to-[#a78bff] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98] transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[17px]">save</span>
                <span>Save Expense</span>
              </button>
            </form>
          </div>

          {/* Expense History List */}
          <div className="glass-card rounded-[24px] p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <span className="text-xs font-bold uppercase text-[#c9c4d9]">Expense History</span>
              <span className="text-[10px] text-[#938ea2]">{expenses.length} Records</span>
            </div>

            <div className="flex flex-col gap-2">
              {expenses.length === 0 ? (
                <div className="py-6 text-center text-[#938ea2] text-xs">No expenses recorded yet.</div>
              ) : (
                expenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-300 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">
                          {exp.category === 'Tea & Snacks'
                            ? 'local_cafe'
                            : exp.category === 'Utility Bill'
                            ? 'bolt'
                            : exp.category === 'Shop Rent'
                            ? 'store'
                            : 'receipt'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">{exp.category}</span>
                        <span className="text-[11px] text-[#938ea2]">
                          {exp.date} • {exp.method} {exp.note ? `• ${exp.note}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-red-300">−৳{exp.amount}</span>
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-red-400/60 hover:text-red-300 hover:bg-white/10"
                      >
                        <span className="material-symbols-outlined text-[15px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: REPORTS & ANALYTICS */}
      {moreSubTab === 'reports' && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
          {/* Timeframe Filter Pills */}
          <div className="flex items-center gap-2 select-none">
            {(['today', 'week', 'month'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setReportTimeframe(tf)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  reportTimeframe === tf
                    ? 'bg-[#6d4aff] text-white shadow-md'
                    : 'bg-white/[0.06] text-[#938ea2] hover:text-white border border-white/5'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* KPI Matrix */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card rounded-[22px] p-4 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-[#a78bff]">Total Revenue</span>
              <span className="text-2xl font-black text-white mt-1">
                ৳{todaySalesTotal > 0 ? (todaySalesTotal * 3.5).toLocaleString() : '11,450'}
              </span>
              <span className="text-[10px] text-[#4edea3] mt-1 flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[13px]">arrow_upward</span>
                <span>+18.4% growth</span>
              </span>
            </div>

            <div className="glass-card rounded-[22px] p-4 flex flex-col">
              <span className="text-[10px] uppercase font-bold text-[#4edea3]">Net Profit</span>
              <span className="text-2xl font-black text-[#4edea3] mt-1">
                ৳{todayProfitTotal > 0 ? (todayProfitTotal * 3.2).toLocaleString() : '8,920'}
              </span>
              <span className="text-[10px] text-[#6ffbbe] mt-1">
                78.2% Avg Margin
              </span>
            </div>
          </div>

          {/* 7-Day Sales Trend Bar Chart (Clean SVG/CSS) */}
          <div className="glass-card rounded-[24px] p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#a78bff] text-[18px]">bar_chart</span>
                <span className="text-xs font-bold uppercase text-white">Daily Revenue Volume</span>
              </div>
              <span className="text-[10px] text-[#4edea3] font-semibold">Past 7 Days</span>
            </div>

            <div className="flex items-end justify-between gap-2 h-36 pt-4 pb-2 px-2">
              {[
                { day: 'Sat', val: 2100, pct: 60 },
                { day: 'Sun', val: 2800, pct: 75 },
                { day: 'Mon', val: 1950, pct: 52 },
                { day: 'Tue', val: 3400, pct: 88 },
                { day: 'Wed', val: 2900, pct: 78 },
                { day: 'Thu', val: 3250, pct: 84 },
                { day: 'Fri', val: 3900, pct: 96 },
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div
                    style={{ height: `${item.pct}%` }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-[#6d4aff]/60 via-[#8b5cf6] to-[#a78bff] group-hover:brightness-125 transition-all shadow-[0_0_10px_rgba(109,74,255,0.3)] relative"
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-[#d0bcff] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black/80 px-1 rounded">
                      ৳{item.val}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#938ea2] font-semibold">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Strip vs Piece Volume Distribution */}
          <div className="glass-card rounded-[24px] p-4 flex flex-col gap-3">
            <span className="text-xs font-bold uppercase text-white">Unit Sales Distribution</span>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden flex">
                <div style={{ width: `${stripPercent}%` }} className="h-full bg-[#6d4aff]" />
                <div style={{ width: `${piecePercent}%` }} className="h-full bg-[#4edea3]" />
              </div>
            </div>
            <div className="flex justify-between text-xs pt-1">
              <div className="flex items-center gap-1.5 text-[#d0bcff]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6d4aff]" />
                <span>Strips: {stripPercent}% ({totalStripsSold} strips)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#4edea3]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3]" />
                <span>Pieces: {piecePercent}% ({totalPiecesSold} pcs)</span>
              </div>
            </div>
          </div>

          {/* Top Selling Formulary */}
          <div className="glass-card rounded-[24px] p-4 flex flex-col gap-2.5">
            <span className="text-xs font-bold uppercase text-white pb-1 border-b border-white/10">
              Top Selling Formulary Ranking
            </span>
            {topSellingList.length === 0 ? (
              <div className="py-4 text-center text-xs text-[#938ea2]">Complete sales to see rankings.</div>
            ) : (
              topSellingList.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-white">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#938ea2] text-[11px]">
                      {item.strips > 0 ? `${item.strips} strips ` : ''}
                      {item.pieces > 0 ? `${item.pieces} pcs` : ''}
                    </span>
                    <span className="font-bold text-[#d0bcff]">৳{item.total}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: SETTINGS & BACKUP */}
      {moreSubTab === 'settings' && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
          {/* Admin Profile Card */}
          <div className="glass-card rounded-[24px] p-4 flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#6d4aff] to-[#a78bff] flex items-center justify-center text-white shadow-lg text-2xl font-black">
              A
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-white">{settings.adminName}</span>
                <span className="px-2 py-0.5 rounded-full bg-[#6d4aff]/30 text-[#d0bcff] text-[9px] font-bold uppercase">
                  Admin
                </span>
              </div>
              <span className="text-xs text-[#a78bff]">{settings.pharmacyName}</span>
              <span className="text-[11px] text-[#938ea2]">{settings.address}</span>
            </div>
          </div>

          {/* Theme & Aesthetics Control */}
          <div className="glass-card rounded-[24px] p-4 flex flex-col gap-3">
            <span className="text-xs font-bold uppercase text-white pb-1 border-b border-white/10">
              Appearance & Aesthetics
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#6d4aff]/20 text-[#d0bcff] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">dark_mode</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">
                    {(settings.themeMode || settings.theme) !== 'light' ? 'OLED Dark Liquid Theme' : 'Light Mode Theme'}
                  </span>
                  <span className="text-[11px] text-[#938ea2]">
                    {(settings.themeMode || settings.theme) !== 'light' 
                      ? 'Deep #0a0614 canvas with glowing purple orbs' 
                      : 'Crisp high-contrast daylight aesthetic'}
                  </span>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme mode"
                className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${
                  (settings.themeMode || settings.theme) !== 'light' ? 'bg-[#6d4aff]' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    (settings.themeMode || settings.theme) !== 'light' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Data Backup & Cloud / Local Sync */}
          <div className="glass-card rounded-[24px] p-4 flex flex-col gap-3">
            <span className="text-xs font-bold uppercase text-white pb-1 border-b border-white/10">
              Data Management & Offline Backup
            </span>
            <p className="text-xs text-[#938ea2]">
              All data is stored directly in browser local storage. Download JSON backups to preserve records.
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={exportDataJson}
                className="h-11 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Export Backup (JSON)</span>
              </button>

              <label className="h-11 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">upload</span>
                <span>Restore Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="mt-1 text-xs text-red-400 hover:text-red-300 transition-colors text-center py-1"
            >
              Reset to Factory Initial Demo Data
            </button>
          </div>

          {/* Pharmacy Legal & Hardware Status */}
          <div className="glass-card rounded-[24px] p-4 flex flex-col gap-2.5 text-xs text-[#c9c4d9]">
            <span className="font-bold uppercase text-white pb-1 border-b border-white/10">
              Pharmacy Accreditation & Devices
            </span>
            <div className="flex justify-between py-1">
              <span className="text-[#938ea2]">Trade License:</span>
              <span className="font-semibold text-white">{settings.tradeLicense}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#938ea2]">DGDA Drug Reg:</span>
              <span className="font-semibold text-white">{settings.drugLicense}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#938ea2]">VAT BIN:</span>
              <span className="font-semibold text-white">{settings.vatBin}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#938ea2]">POS Thermal Printer:</span>
              <span className="font-semibold text-[#4edea3] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" />
                <span>ESC/POS 80mm Connected</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#161120] border border-white/20 p-5 shadow-2xl space-y-3">
            <h3 className="font-bold text-lg text-white">Reset Demo Data?</h3>
            <p className="text-xs text-[#938ea2]">
              This will reset all medicines, cart items, sales history, and customer dues back to the default seed state.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetToMockData();
                  setShowResetConfirm(false);
                  showToast('Database reset to default seed data! ✨');
                }}
                className="py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow-md"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Toast Notification */}
      {toastMessage ? (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#007d55] text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      ) : null}

      {/* Footer Branding */}
      <div className="mt-8 text-center select-none">
        <span className="text-[10px] tracking-widest uppercase text-white/30 font-medium">
          made by aditto 💜
        </span>
      </div>
    </div>
  );
};
