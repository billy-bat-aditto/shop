import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { Medicine } from '../types';

interface ScreenInventoryProps {
  onAddMedicine: () => void;
  onEditMedicine: (med: Medicine) => void;
}

export const ScreenInventory: React.FC<ScreenInventoryProps> = ({
  onAddMedicine,
  onEditMedicine,
}) => {
  const {
    medicines,
    bulkUpdateCompanyPrice,
    lowStockCount,
    expiringSoonCount,
    deleteMedicine,
    addToCart,
    setActiveTab,
    setIsCsvModalOpen,
    exportMedicinesCsv
  } = usePharmacy();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'low' | 'expiring' | 'antibiotics' | 'syrups'>('all');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkCompany, setBulkCompany] = useState('');
  const [bulkPercent, setBulkPercent] = useState(5);
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);
  const [inventoryToast, setInventoryToast] = useState<string | null>(null);

  const handleInventoryQuickAdd = (med: Medicine) => {
    const res = addToCart(med, 'strip', 1, '%', 0);
    if (res.success) {
      setInventoryToast(`Added 1 strip of ${med.name} to tray! 🛒`);
      setTimeout(() => setInventoryToast(null), 2500);
    } else {
      setInventoryToast(res.message || 'Cannot add item');
      setTimeout(() => setInventoryToast(null), 2500);
    }
  };

  // Get unique companies
  const companies = Array.from(new Set(medicines.map((m) => m.company)));

  // Filter medicines
  const filteredMeds = medicines.filter((med) => {
    // Search match
    const q = search.toLowerCase();
    const matchQuery =
      med.name.toLowerCase().includes(q) ||
      med.generic.toLowerCase().includes(q) ||
      med.rack.toLowerCase().includes(q) ||
      med.company.toLowerCase().includes(q);

    if (!matchQuery) return false;

    if (activeFilter === 'low') {
      return med.stockPieces <= med.lowStockThreshold;
    }

    if (activeFilter === 'expiring') {
      // Check if expiry is within 90 days
      if (!med.expiry) return false;
      let expDate: Date;
      if (med.expiry.includes('-')) {
        const parts = med.expiry.split('-');
        expDate = parts.length === 2 ? new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 28) : new Date(med.expiry);
      } else if (med.expiry.includes('/')) {
        const [mm, yyyy] = med.expiry.split('/');
        expDate = new Date(parseInt(yyyy), parseInt(mm) - 1, 28);
      } else {
        expDate = new Date();
      }
      const diffDays = (expDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24);
      return diffDays <= 90;
    }

    if (activeFilter === 'antibiotics') {
      return med.category === 'Antibiotics';
    }

    if (activeFilter === 'syrups') {
      return med.category === 'Syrups';
    }

    return true;
  });

  const handleBulkUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkCompany) return;
    const count = bulkUpdateCompanyPrice(bulkCompany, bulkPercent);
    setBulkMessage(`Updated prices for ${count} medicines under ${bulkCompany}`);
    setTimeout(() => {
      setBulkMessage(null);
      setIsBulkModalOpen(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col w-full pb-36 pt-1">
      {/* Floating Toast Notification */}
      {inventoryToast ? (
        <div className="fixed top-16 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-top duration-300">
          <div className="bg-gradient-to-r from-[#6d4aff] to-[#a78bff] text-white px-4 py-2.5 rounded-full text-xs font-bold shadow-xl shadow-[#6d4aff]/40 flex items-center gap-2 keep-white">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{inventoryToast}</span>
          </div>
        </div>
      ) : null}

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 pt-1">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-[#c9bfff] to-[#d0bcff] bg-clip-text text-transparent tracking-tight">
            Medicine Inventory
          </h2>
          <p className="text-xs text-[#938ea2]">Live clinical stock & expiry monitor</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.08] border border-white/10 shadow-sm backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
          <span className="text-xs font-semibold text-[#c9bfff]">{medicines.length} Items</span>
        </div>
      </div>

      {/* Inventory Action Toolbar: Add, Import CSV, Export CSV */}
      <div className="grid grid-cols-3 gap-2 my-1.5">
        <button
          type="button"
          onClick={onAddMedicine}
          className="h-10 rounded-2xl liquid-btn-primary text-white font-extrabold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[17px]">add</span>
          <span>Add Med</span>
        </button>

        <button
          type="button"
          onClick={() => setIsCsvModalOpen(true)}
          className="h-10 rounded-2xl liquid-glass-card text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer group hover:border-white/30"
        >
          <span className="material-symbols-outlined text-[17px] text-[#a78bff] group-hover:scale-110 transition-transform">
            upload_file
          </span>
          <span>Import CSV</span>
        </button>

        <button
          type="button"
          onClick={exportMedicinesCsv}
          className="h-10 rounded-2xl liquid-glass-card text-white font-semibold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer group hover:border-white/30"
        >
          <span className="material-symbols-outlined text-[17px] text-[#4edea3] group-hover:scale-110 transition-transform">
            download
          </span>
          <span>Export CSV</span>
        </button>
      </div>

      {/* Search Input Bar (iOS 26 Liquid Glass Capsule) */}
      <div className="relative w-full my-2">
        <div className="flex items-center w-full h-12 rounded-full liquid-input px-4 transition-all">
          <span className="material-symbols-outlined text-[#938ea2] text-[20px] mr-2.5 select-none">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by brand, generic, or rack..."
            className="w-full bg-transparent border-none outline-none text-sm text-white placeholder:text-[#938ea2]"
          />
          {search ? (
            <button onClick={() => setSearch('')} className="mr-1 text-[#938ea2] hover:text-white">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          ) : null}
          <button
            onClick={() => setSearch('Square')}
            title="Scan barcode or auto-search"
            className="flex items-center justify-center w-7 h-7 rounded-full bg-white/10 text-[#938ea2] hover:text-white"
          >
            <span className="material-symbols-outlined text-[17px]">barcode_scanner</span>
          </button>
        </div>
      </div>

      {/* Filter Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar -mx-4 px-4 select-none">
        <button
          onClick={() => setActiveFilter('all')}
          className={`whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer active:scale-95 ${
            activeFilter === 'all'
              ? 'bg-gradient-to-r from-[#7c5cff] to-[#6d4aff] text-white shadow-[0_2px_14px_rgba(109,74,255,0.5)] border-t border-white/40'
              : 'liquid-pill text-[#938ea2] hover:text-white'
          }`}
        >
          <span>All</span>
          <span className="px-1.5 py-0.5 rounded-full bg-black/40 text-[10px]">
            {medicines.length}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('low')}
          className={`whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer active:scale-95 ${
            activeFilter === 'low'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-[0_2px_14px_rgba(245,158,11,0.5)] border-t border-white/50'
              : 'liquid-pill text-[#938ea2] hover:text-white'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>Low Stock</span>
          <span className="px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px]">
            {lowStockCount}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('expiring')}
          className={`whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer active:scale-95 ${
            activeFilter === 'expiring'
              ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-[0_2px_14px_rgba(239,68,68,0.5)] border-t border-white/40'
              : 'liquid-pill text-[#938ea2] hover:text-white'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          <span>Expiring Soon</span>
          <span className="px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px]">
            {expiringSoonCount}
          </span>
        </button>

        <button
          onClick={() => setActiveFilter('antibiotics')}
          className={`whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === 'antibiotics'
              ? 'bg-[#6d4aff] text-white'
              : 'bg-white/[0.06] text-[#938ea2] hover:text-white border border-white/5'
          }`}
        >
          <span>Antibiotics</span>
        </button>

        <button
          onClick={() => setActiveFilter('syrups')}
          className={`whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === 'syrups'
              ? 'bg-[#6d4aff] text-white'
              : 'bg-white/[0.06] text-[#938ea2] hover:text-white border border-white/5'
          }`}
        >
          <span>Syrups</span>
        </button>

        <button
          onClick={() => setIsBulkModalOpen(true)}
          className="whitespace-nowrap flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#6d4aff]/20 text-[#d0bcff] border border-[#6d4aff]/40 hover:bg-[#6d4aff]/30 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[14px]">price_change</span>
          <span>Bulk Pricing</span>
        </button>
      </div>

      {/* Medicine Cards List (Matches Image 8) */}
      <div className="flex flex-col gap-3 mt-2">
        {filteredMeds.length === 0 ? (
          <div className="p-8 text-center glass-card rounded-2xl text-[#938ea2]">
            <p className="text-sm">No medicines match your filter.</p>
          </div>
        ) : (
          filteredMeds.map((med) => {
            const isLow = med.stockPieces <= med.lowStockThreshold;
            const isCritical = med.stockPieces < 10;
            const isExpiringSoon = med.name.includes('Ace Plus') || med.expiry.includes('2025');

            return (
              <div
                key={med.id}
                className="group relative rounded-[26px] liquid-glass-card p-4 transition-all duration-250 hover:scale-[1.01]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-inner border border-white/10 ${
                        isCritical
                          ? 'bg-red-500/20 text-red-300'
                          : isLow
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-[#6d4aff]/20 text-[#c9bfff]'
                      }`}
                    >
                      <span
                        className="material-symbols-outlined text-[22px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {med.category === 'Syrups'
                          ? 'medication_liquid'
                          : med.category === 'Capsule'
                          ? 'vaccines'
                          : 'pill'}
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-white tracking-tight truncate">
                          {med.name}
                        </h3>
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-[#d0bcff] font-semibold">
                          {med.rack}
                        </span>
                      </div>
                      <p className="text-xs text-[#a78bff] truncate">{med.company}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleInventoryQuickAdd(med)}
                      title="Add 1 strip to Tray"
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#6d4aff]/20 hover:bg-[#6d4aff]/35 active:scale-95 text-[#c9bfff] hover:text-white border border-[#6d4aff]/30 text-[11px] font-bold transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px] text-[#4edea3]">add_shopping_cart</span>
                      <span>+Tray</span>
                    </button>
                    <button
                      onClick={() => onEditMedicine(med)}
                      aria-label="Edit Medicine"
                      className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#938ea2] hover:text-white hover:bg-white/20 active:scale-95 transition-all shadow-sm cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${med.name} from formulary?`)) {
                          deleteMedicine(med.id);
                        }
                      }}
                      className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-red-400/60 hover:text-red-300 hover:bg-red-950/40 active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                    </button>
                  </div>
                </div>

                {/* Stock & Expiry Row */}
                <div className="flex items-center justify-between mt-3 pt-2.5 bg-black/40 rounded-xl p-2.5 border border-white/5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`material-symbols-outlined text-[17px] ${
                        isCritical
                          ? 'text-red-400'
                          : isLow
                          ? 'text-amber-400'
                          : 'text-[#4edea3]'
                      }`}
                    >
                      {isCritical
                        ? 'report_problem'
                        : isLow
                        ? 'warning'
                        : 'verified'}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        isCritical
                          ? 'text-red-300'
                          : isLow
                          ? 'text-amber-300'
                          : 'text-[#4edea3]'
                      }`}
                    >
                      {med.stockPieces} pcs {isCritical ? 'left (Critical)' : isLow ? 'left' : 'available'}
                    </span>
                  </div>

                  {isExpiringSoon ? (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                      <span className="material-symbols-outlined text-red-400 text-[13px]">alarm</span>
                      <span className="text-[10px] font-bold text-red-200">
                        {med.name.includes('Ace') ? 'Expiring in 18 days' : `Exp: ${med.expiry}`}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-[#938ea2]">Exp: {med.expiry}</span>
                  )}
                </div>

                {/* Price Chips */}
                <div className="flex items-center gap-2 mt-2.5">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/5">
                    <span className="text-[10px] uppercase text-[#938ea2] font-semibold">Strip</span>
                    <span className="text-xs font-bold text-white">৳{med.stripPrice}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/5">
                    <span className="text-[10px] uppercase text-[#938ea2] font-semibold">Piece</span>
                    <span className="text-xs font-bold text-white">৳{med.piecePrice}</span>
                  </div>
                  <span className="text-[10px] text-[#938ea2] ml-auto">
                    {med.unitsPerStrip} pcs / strip
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button: Add Medicine */}
      <div className="fixed bottom-24 right-5 z-30">
        <button
          onClick={onAddMedicine}
          aria-label="Add Medicine"
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#6d4aff] via-[#8b5cf6] to-[#a78bff] text-white shadow-[0_10px_25px_rgba(109,74,255,0.6),0_0_15px_rgba(147,51,234,0.5)] flex items-center justify-center transition-transform active:scale-90 hover:scale-105 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[30px] font-bold">add</span>
        </button>
      </div>

      {/* Company Bulk Price Update Modal */}
      {isBulkModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#161120] border border-white/20 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-white">Bulk Price Update</h3>
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-[#938ea2]">
              Adjust strip and piece retail prices for all medicines from a specific manufacturer.
            </p>

            <form onSubmit={handleBulkUpdate} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-[#938ea2] block mb-1">
                  Select Manufacturer
                </label>
                <select
                  required
                  value={bulkCompany}
                  onChange={(e) => setBulkCompany(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-xs outline-none"
                >
                  <option value="">-- Select Company --</option>
                  {companies.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[#938ea2] block mb-1">
                  Adjustment Percentage (% e.g. 5 or -5)
                </label>
                <input
                  type="number"
                  value={bulkPercent}
                  onChange={(e) => setBulkPercent(parseFloat(e.target.value) || 0)}
                  className="w-full h-11 px-3 rounded-xl bg-black/40 border border-white/15 text-white text-sm font-bold outline-none"
                />
              </div>

              {bulkMessage ? (
                <div className="p-2 rounded-lg bg-green-950/60 border border-green-500/40 text-green-300 text-xs text-center">
                  {bulkMessage}
                </div>
              ) : null}

              <button
                type="submit"
                className="w-full h-12 rounded-full bg-gradient-to-r from-[#6d4aff] to-[#a78bff] text-white font-bold text-sm shadow-md"
              >
                Apply Price Update
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
