import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { CustomerDebtor } from '../types';

export const ScreenDues: React.FC = () => {
  const {
    debtors,
    addPaymentToDebtor,
    addNewDebtor,
    setActiveTab
  } = usePharmacy();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'critical' | 'recent'>('all');
  const [expandedId, setExpandedId] = useState<string>(debtors[0]?.id || 'cust-1');

  // Add payment modal
  const [payingDebtor, setPayingDebtor] = useState<CustomerDebtor | null>(null);
  const [payAmount, setPayAmount] = useState<number>(500);
  const [payMethod, setPayMethod] = useState<'Cash' | 'bKash'>('Cash');
  const [payNote, setPayNote] = useState('');
  const [paySuccess, setPaySuccess] = useState(false);

  // Add debtor modal
  const [isNewDebtorModalOpen, setIsNewDebtorModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newOpeningDue, setNewOpeningDue] = useState(0);

  // Bulk reminder alert
  const [reminderToast, setReminderToast] = useState(false);

  // Total Due calculation
  const totalDueAmount = debtors.reduce((sum, d) => sum + d.dueBalance, 0);

  // Filter debtors
  const filteredDebtors = debtors.filter((d) => {
    const q = search.toLowerCase();
    const matchQuery = d.name.toLowerCase().includes(q) || d.phone.toLowerCase().includes(q);
    if (!matchQuery) return false;

    if (filter === 'critical') {
      return d.dueBalance >= 3000;
    }
    if (filter === 'recent') {
      return d.lastPaidDate.toLowerCase().includes('today') ||
             d.lastPaidDate.toLowerCase().includes('yesterday') ||
             d.lastPaidDate.toLowerCase().includes('oct');
    }
    return true;
  });

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingDebtor || payAmount <= 0) return;

    addPaymentToDebtor(payingDebtor.id, payAmount, payMethod, payNote || undefined);
    setPaySuccess(true);
    setTimeout(() => {
      setPaySuccess(false);
      setPayingDebtor(null);
      setPayAmount(0);
      setPayNote('');
    }, 1000);
  };

  const handleCreateDebtor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const created = addNewDebtor(newName, newPhone, newOpeningDue);
    setIsNewDebtorModalOpen(false);
    setNewName('');
    setNewPhone('');
    setNewOpeningDue(0);
    setExpandedId(created.id);
  };

  const handleSendReminders = () => {
    setReminderToast(true);
    setTimeout(() => setReminderToast(false), 2500);
  };

  return (
    <div className="flex flex-col w-full pb-36 pt-1">
      {/* Brand Header Bar & Total Due Badge */}
      <div className="flex items-center justify-between pt-1 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="relative w-10 h-10 rounded-xl bg-white/[0.08] backdrop-blur-xl border border-white/15 flex items-center justify-center overflow-hidden shadow-md">
            <span
              className="material-symbols-outlined text-[#4edea3] text-[24px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              medical_services
            </span>
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-white tracking-tight leading-tight">
              Customer Dues
            </h2>
            <span className="text-[10px] text-[#938ea2] font-medium leading-tight">
              Active Debtor Records ({debtors.length})
            </span>
          </div>
        </div>

        {/* Total Outstanding Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 backdrop-blur-md shadow-sm">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <div className="flex flex-col text-right">
            <span className="text-[9px] uppercase tracking-wider text-red-300 font-bold leading-none">
              Total Due
            </span>
            <span className="text-sm font-black text-red-300 leading-tight">
              ৳{totalDueAmount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Search Input Pill */}
      <div className="relative w-full mb-3">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#938ea2]">
          <span className="material-symbols-outlined text-[20px]">search</span>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer name or phone…"
          className="w-full h-12 pl-10 pr-10 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/10 text-white placeholder:text-[#938ea2] text-sm focus:outline-none focus:border-[#6d4aff] transition-all"
        />
        {search ? (
          <button
            onClick={() => setSearch('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#938ea2] hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        ) : null}
      </div>

      {/* Filter / Sort Segmented Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 select-none no-scrollbar">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-[#6d4aff] text-white shadow-sm'
              : 'bg-white/[0.06] text-[#938ea2] hover:text-white border border-white/5'
          }`}
        >
          <span>All ({debtors.length})</span>
        </button>
        <button
          onClick={() => setFilter('critical')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            filter === 'critical'
              ? 'bg-red-500 text-white shadow-sm'
              : 'bg-white/[0.06] text-[#938ea2] hover:text-white border border-white/5'
          }`}
        >
          <span>Critical (&gt;৳3k)</span>
        </button>
        <button
          onClick={() => setFilter('recent')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            filter === 'recent'
              ? 'bg-[#4edea3] text-black shadow-sm'
              : 'bg-white/[0.06] text-[#938ea2] hover:text-white border border-white/5'
          }`}
        >
          <span>Recent Active</span>
        </button>

        <button
          onClick={() => setIsNewDebtorModalOpen(true)}
          className="ml-auto px-3 py-1.5 rounded-full bg-[#6d4aff]/20 text-[#d0bcff] border border-[#6d4aff]/40 text-xs font-semibold flex items-center gap-1 hover:bg-[#6d4aff]/30 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">person_add</span>
          <span>Add Debtor</span>
        </button>
      </div>

      {/* Customers List */}
      <div className="flex flex-col gap-3 mt-1">
        {filteredDebtors.length === 0 ? (
          <div className="p-8 text-center glass-card rounded-2xl text-[#938ea2]">
            <p className="text-sm">No customer debtors found.</p>
          </div>
        ) : (
          filteredDebtors.map((debtor) => {
            const isExpanded = expandedId === debtor.id;
            const initials = debtor.name
              .split(' ')
              .map((w) => w[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={debtor.id}
                className={`w-full rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isExpanded
                    ? 'glass-card bg-[#1a1426]/90 border-white/20 p-4 shadow-xl'
                    : 'bg-white/[0.05] border-white/10 hover:bg-white/[0.08] p-3.5 cursor-pointer shadow-sm'
                }`}
                onClick={() => {
                  if (!isExpanded) setExpandedId(debtor.id);
                }}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-11 h-11 rounded-full bg-gradient-to-tr from-[#6d4aff]/40 to-[#a78bff]/30 border border-white/15 flex items-center justify-center text-[#e5deff] font-bold text-sm shadow-md shrink-0">
                      {initials}
                      {debtor.dueBalance > 0 ? (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-red-500 ring-2 ring-[#161120]" />
                      ) : null}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-base text-white truncate">
                          {debtor.name}
                        </span>
                        <span className="material-symbols-outlined text-[#4edea3] text-[16px]">
                          verified
                        </span>
                      </div>
                      <span className="text-xs text-[#938ea2] truncate tracking-wide">
                        {debtor.phone}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-[9px] uppercase tracking-wider text-[#938ea2] font-semibold">
                      Due Balance
                    </span>
                    <span className="text-lg font-black text-red-300 tracking-tight leading-tight">
                      ৳{debtor.dueBalance.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#938ea2] mt-0.5">
                      Last paid {debtor.lastPaidDate}
                    </span>
                  </div>
                </div>

                {/* Collapsed view indicator */}
                {!isExpanded ? (
                  <div className="flex items-center justify-end mt-1 text-[11px] text-[#a78bff]">
                    <span>Tap to view ledger & actions →</span>
                  </div>
                ) : (
                  /* Expanded Details & Timeline */
                  <div className="mt-3.5 pt-3 border-t border-white/10 space-y-3">
                    {/* Quick Action Pills Strip */}
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${debtor.phone.replace(/[^0-9]/g, '') || '01712000000'}`}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-white/[0.07] border border-white/10 flex items-center justify-center gap-1 text-xs text-[#c9c4d9] hover:text-white transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">call</span>
                        <span>Call</span>
                      </a>
                      <button
                        onClick={() => {
                          const msg = `Dear ${debtor.name}, your outstanding medicine due balance at MediExpences Pharmacy is ৳${debtor.dueBalance}. Please clear it at your earliest convenience. Thank you!`;
                          window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                        }}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-white/[0.07] border border-white/10 flex items-center justify-center gap-1 text-xs text-[#c9c4d9] hover:text-white transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">chat</span>
                        <span>Remind</span>
                      </button>
                      <button
                        onClick={() => setExpandedId(debtor.id)}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-white/[0.07] border border-white/10 flex items-center justify-center gap-1 text-xs text-[#c9c4d9] hover:text-white transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">history</span>
                        <span>Ledger</span>
                      </button>
                    </div>

                    {/* Timeline Activity */}
                    <div className="rounded-xl bg-black/40 border border-white/5 p-3 space-y-2.5">
                      <div className="flex items-center justify-between pb-1 border-b border-white/5">
                        <span className="text-[10px] uppercase font-bold text-[#938ea2] flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                          <span>Recent Activity Timeline</span>
                        </span>
                        <span className="text-[10px] text-[#d0bcff]">Ledger Log</span>
                      </div>

                      <div className="relative pl-4 space-y-2.5 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                        {debtor.history.map((h) => {
                          const isPay = h.type === 'payment';
                          return (
                            <div key={h.id} className="relative flex items-center justify-between text-xs">
                              <div
                                className={`absolute -left-4 w-2 h-2 rounded-full ring-4 ring-[#161120] ${
                                  isPay ? 'bg-[#4edea3]' : 'bg-red-400'
                                }`}
                              />
                              <div className="flex flex-col">
                                <span className="text-white font-medium">
                                  {isPay ? `Paid ৳${h.amount}` : `Due added ৳${h.amount}`}
                                </span>
                                <span className="text-[10px] text-[#938ea2]">
                                  {h.date} • {h.description}
                                </span>
                              </div>
                              <span
                                className={`font-bold ${
                                  isPay ? 'text-[#4edea3]' : 'text-red-300'
                                }`}
                              >
                                {isPay ? `+৳${h.amount}` : `-৳${h.amount}`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setPayingDebtor(debtor);
                          setPayAmount(Math.min(1000, debtor.dueBalance) || 500);
                        }}
                        className="h-11 rounded-full bg-gradient-to-r from-[#6d4aff] to-[#a78bff] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#6d4aff]/30 active:scale-95 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                        <span>Add Payment</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          // Switch to sales tab
                          setActiveTab('sales');
                        }}
                        className="h-11 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-[#e5deff] font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                        <span>Sell on Due</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bulk WhatsApp Reminder Bar */}
      <div className="w-full mt-4 rounded-2xl bg-gradient-to-r from-white/[0.08] via-[#6d4aff]/20 to-white/[0.08] border border-white/15 p-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#4edea3] text-[20px]">
            send_money
          </span>
          <span className="text-xs text-white font-medium">Bulk WhatsApp Reminder</span>
        </div>
        <button
          onClick={handleSendReminders}
          className="px-3 py-1.5 rounded-full bg-[#007d55] text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
        >
          <span>Send All</span>
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </button>
      </div>

      {/* Reminder Sent Toast */}
      {reminderToast ? (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#007d55] text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-200">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>WhatsApp reminder notifications triggered for all active debtors!</span>
        </div>
      ) : null}

      {/* Add Payment Modal */}
      {payingDebtor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#161120] border border-white/20 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-white">Record Due Payment</h3>
                <p className="text-xs text-[#938ea2]">{payingDebtor.name} (Current: ৳{payingDebtor.dueBalance})</p>
              </div>
              <button
                onClick={() => setPayingDebtor(null)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-[#938ea2] block mb-1">
                  Payment Amount (৳)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={payingDebtor.dueBalance}
                  value={payAmount}
                  onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                  className="w-full h-12 px-3 rounded-xl bg-black/40 border border-white/15 text-xl font-black text-[#4edea3] outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[#938ea2] block mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayMethod('Cash')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      payMethod === 'Cash'
                        ? 'bg-[#6d4aff] text-white'
                        : 'bg-white/5 text-[#938ea2] border border-white/10'
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMethod('bKash')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      payMethod === 'bKash'
                        ? 'bg-[#e2136e] text-white'
                        : 'bg-white/5 text-[#938ea2] border border-white/10'
                    }`}
                  >
                    bKash
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[#938ea2] block mb-1">
                  Optional Note
                </label>
                <input
                  type="text"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  placeholder="e.g. Cleared installment 2"
                  className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs outline-none"
                />
              </div>

              {paySuccess ? (
                <div className="p-2 rounded-lg bg-green-950/60 border border-green-500/40 text-green-300 text-xs text-center font-bold">
                  Payment of ৳{payAmount} recorded successfully! ✨
                </div>
              ) : null}

              <button
                type="submit"
                className="w-full h-12 rounded-full bg-gradient-to-r from-[#6d4aff] to-[#a78bff] text-white font-bold text-sm shadow-md"
              >
                Confirm Payment
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {/* Add New Debtor Modal */}
      {isNewDebtorModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#161120] border border-white/20 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-white">Add Customer Debtor</h3>
              <button
                onClick={() => setIsNewDebtorModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDebtor} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-[#938ea2] block mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Mohammad Ali"
                  className="w-full h-11 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[#938ea2] block mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="017XX-XXXXXX"
                  className="w-full h-11 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[#938ea2] block mb-1">
                  Opening Due Balance (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newOpeningDue}
                  onChange={(e) => setNewOpeningDue(parseFloat(e.target.value) || 0)}
                  className="w-full h-11 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-sm outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-full bg-gradient-to-r from-[#6d4aff] to-[#a78bff] text-white font-bold text-sm shadow-md mt-2"
              >
                Save Debtor Record
              </button>
            </form>
          </div>
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
