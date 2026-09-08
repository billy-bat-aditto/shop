import React, { useState, useEffect } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { UnitsPerStrip } from '../types';

interface ScreenAddEditMedicineProps {
  onClose: () => void;
}

export const ScreenAddEditMedicine: React.FC<ScreenAddEditMedicineProps> = ({ onClose }) => {
  const {
    editingMedicine,
    setEditingMedicine,
    addMedicine,
    updateMedicine,
    setActiveTab
  } = usePharmacy();

  const isEditing = Boolean(editingMedicine);

  // Form states
  const [name, setName] = useState(editingMedicine?.name || 'Napa Extra 500mg');
  const [generic, setGeneric] = useState(editingMedicine?.generic || 'Paracetamol + Caffeine');
  const [company, setCompany] = useState(editingMedicine?.company || 'Beximco Pharmaceuticals Ltd.');
  const [batch, setBatch] = useState(editingMedicine?.batch || 'BAT-2024-889');
  const [expiry, setExpiry] = useState(editingMedicine?.expiry || '11/2026');
  const [unitsPerStrip, setUnitsPerStrip] = useState<UnitsPerStrip>(editingMedicine?.unitsPerStrip || 10);
  const [purchasePrice, setPurchasePrice] = useState(editingMedicine?.purchasePrice || 90);
  const [stripPrice, setStripPrice] = useState(editingMedicine?.stripPrice || 120);
  const [piecePrice, setPiecePrice] = useState(editingMedicine?.piecePrice || 12);
  const [stockPieces, setStockPieces] = useState(editingMedicine?.stockPieces || 100);
  const [lowStockThreshold, setLowStockThreshold] = useState(editingMedicine?.lowStockThreshold || 15);
  const [rack, setRack] = useState(editingMedicine?.rack || 'Rack A3');
  const [category, setCategory] = useState(editingMedicine?.category || 'Tablet');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Auto calculate piece price when strip price or unitsPerStrip change
  const handleStripPriceChange = (newStripPrice: number) => {
    setStripPrice(newStripPrice);
    // piece price auto-suggest: strip ÷ units × 1.25, editable
    const suggested = Math.round((newStripPrice / unitsPerStrip) * 1.25 * 10) / 10;
    setPiecePrice(suggested);
  };

  const handleUnitsChange = (units: UnitsPerStrip) => {
    setUnitsPerStrip(units);
    const suggested = Math.round((stripPrice / units) * 1.25 * 10) / 10;
    setPiecePrice(suggested);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isEditing && editingMedicine) {
      updateMedicine(editingMedicine.id, {
        name,
        generic,
        company,
        batch,
        expiry,
        unitsPerStrip,
        purchasePrice: Number(purchasePrice),
        stripPrice: Number(stripPrice),
        piecePrice: Number(piecePrice),
        stockPieces: Number(stockPieces),
        lowStockThreshold: Number(lowStockThreshold),
        rack,
        category
      });
    } else {
      addMedicine({
        name,
        generic,
        company,
        batch,
        expiry,
        unitsPerStrip,
        purchasePrice: Number(purchasePrice),
        stripPrice: Number(stripPrice),
        piecePrice: Number(piecePrice),
        stockPieces: Number(stockPieces),
        lowStockThreshold: Number(lowStockThreshold),
        rack,
        category,
        tags: ['DGDA Approved', 'Store below 25°C'],
        isFastMoving: true
      });
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setEditingMedicine(null);
      onClose();
      setActiveTab('inventory');
    }, 900);
  };

  return (
    <div className="flex flex-col w-full pb-24 pt-1">
      {/* Header Badge & Title */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-lg shadow-[#6d4aff]/20">
            <span
              className="material-symbols-outlined text-[#4edea3] text-[26px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              medication
            </span>
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold bg-gradient-to-r from-white via-[#d0bcff] to-[#6ffbbe] bg-clip-text text-transparent">
              {isEditing ? 'Edit Formulary' : 'New Formulary'}
            </h2>
            <span className="text-[10px] text-[#938ea2] uppercase tracking-wider font-semibold">
              Inventory Catalog Entry
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/10 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
          <span className="text-[10px] text-[#6ffbbe] font-semibold tracking-wide uppercase">
            OLED Sync
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        {/* Primary Formulary Card (Frosted Glass Panel) */}
        <div className="glass-card rounded-[24px] p-5 flex flex-col gap-3.5">
          <div className="flex items-center gap-2 pb-1 border-b border-white/10">
            <span className="material-symbols-outlined text-[18px] text-[#a78bff]">
              clinical_notes
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#d0bcff]">
              Clinical Identification
            </span>
          </div>

          {/* Medicine Name */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[#938ea2] uppercase tracking-wider font-semibold px-1">
              Medicine Name
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-[#938ea2] text-[18px]">
                pill
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Napa Extra 500mg"
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm outline-none focus:border-[#6d4aff] transition-all"
              />
            </div>
          </div>

          {/* Generic Name */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[#938ea2] uppercase tracking-wider font-semibold px-1">
              Generic Name
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-[#938ea2] text-[18px]">
                science
              </span>
              <input
                type="text"
                required
                value={generic}
                onChange={(e) => setGeneric(e.target.value)}
                placeholder="e.g. Paracetamol + Caffeine"
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm outline-none focus:border-[#6d4aff] transition-all"
              />
            </div>
          </div>

          {/* Company / Manufacturer */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[#938ea2] uppercase tracking-wider font-semibold px-1">
              Company / Manufacturer
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-[#938ea2] text-[18px]">
                domain
              </span>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Beximco Pharmaceuticals Ltd."
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm outline-none focus:border-[#6d4aff] transition-all"
              />
            </div>
          </div>

          {/* Dual Row: Batch Code & Expiry Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#938ea2] uppercase tracking-wider font-semibold px-1">
                Batch Code
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#d0bcff] text-[17px]">
                  qr_code_2
                </span>
                <input
                  type="text"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  placeholder="BAT-2024-889"
                  className="w-full h-12 pl-9 pr-3 rounded-xl bg-white/[0.06] border border-white/10 text-[#d0bcff] text-xs font-semibold outline-none focus:border-[#6d4aff]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#938ea2] uppercase tracking-wider font-semibold px-1">
                Expiry Date
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#4edea3] text-[17px]">
                  calendar_month
                </span>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YYYY or YYYY-MM"
                  className="w-full h-12 pl-9 pr-3 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs font-semibold outline-none focus:border-[#6d4aff]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing, Packaging & Stock Matrix Card */}
        <div className="glass-card rounded-[24px] p-5 flex flex-col gap-3.5">
          <div className="flex items-center justify-between pb-1 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#4edea3]">
                payments
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#d0bcff]">
                Commercial & Unit Pricing
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6d4aff]/30 text-[#d0bcff] font-semibold">
              BDT (৳) Standard
            </span>
          </div>

          {/* Units Per Strip Chip Selector (4, 8, 10, 15, 20) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] text-[#938ea2] uppercase tracking-wider font-semibold">
                Units Per Strip
              </label>
              <span className="text-[10px] text-[#a78bff]">Per-Medicine Dropdown</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {([4, 8, 10, 15, 20] as UnitsPerStrip[]).map((val) => {
                const isSelected = unitsPerStrip === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleUnitsChange(val)}
                    className={`h-10 rounded-xl text-sm font-bold flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#6d4aff] text-white shadow-md shadow-[#6d4aff]/40 scale-105'
                        : 'bg-white/[0.06] border border-white/10 text-[#c9c4d9] hover:bg-white/[0.12]'
                    }`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3-Column Pricing Bento Display */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {/* Purchase Price */}
            <div className="flex flex-col p-2.5 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-[10px] text-[#938ea2] uppercase truncate font-medium">
                Purchase
              </span>
              <div className="flex items-baseline gap-0.5 mt-1">
                <span className="text-xs text-[#938ea2]">৳</span>
                <input
                  type="number"
                  step="any"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent text-sm font-bold text-white outline-none"
                />
              </div>
              <span className="text-[9px] text-[#938ea2] mt-0.5">Per strip net</span>
            </div>

            {/* Strip MRP */}
            <div className="flex flex-col p-2.5 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-[10px] text-[#d0bcff] uppercase truncate font-medium">
                Strip MRP
              </span>
              <div className="flex items-baseline gap-0.5 mt-1">
                <span className="text-xs text-[#d0bcff]">৳</span>
                <input
                  type="number"
                  step="any"
                  value={stripPrice}
                  onChange={(e) => handleStripPriceChange(parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent text-sm font-bold text-[#d0bcff] outline-none"
                />
              </div>
              <span className="text-[9px] text-[#4edea3] mt-0.5">
                +
                {purchasePrice > 0
                  ? Math.round(((stripPrice - purchasePrice) / purchasePrice) * 100)
                  : 33}
                % margin
              </span>
            </div>

            {/* Piece Retail */}
            <div className="flex flex-col p-2.5 rounded-2xl bg-[#6d4aff]/20 border border-[#6d4aff]/30">
              <span className="text-[10px] text-[#a78bff] uppercase truncate font-medium">
                Piece Retail
              </span>
              <div className="flex items-baseline gap-0.5 mt-1">
                <span className="text-xs text-[#a78bff]">৳</span>
                <input
                  type="number"
                  step="any"
                  value={piecePrice}
                  onChange={(e) => setPiecePrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-transparent text-sm font-bold text-[#e5deff] outline-none"
                />
              </div>
              <span className="text-[9px] text-[#d0bcff] mt-0.5">Unit sale</span>
            </div>
          </div>

          {/* Auto Compute Helper Note */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/5">
            <span className="material-symbols-outlined text-[16px] text-[#a78bff]">calculate</span>
            <span className="text-xs text-[#d0bcff]">
              Auto: strip ({stripPrice}) ÷ units ({unitsPerStrip}) × 1.25 margin rule
            </span>
          </div>

          {/* Stock & Low Stock Alert */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#938ea2] uppercase tracking-wider font-semibold px-1">
                Stock in Pieces
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#4edea3] text-[18px]">
                  inventory_2
                </span>
                <input
                  type="number"
                  value={stockPieces}
                  onChange={(e) => setStockPieces(parseInt(e.target.value) || 0)}
                  className="w-full h-12 pl-9 pr-3 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm font-bold outline-none focus:border-[#6d4aff]"
                />
              </div>
              <span className="text-[10px] text-[#938ea2] px-1">
                ≈ {Math.floor(stockPieces / unitsPerStrip)} strips + {stockPieces % unitsPerStrip} pcs
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#ffb4ab] uppercase tracking-wider font-semibold px-1">
                Low Stock Threshold
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#ffb4ab] text-[18px]">
                  warning
                </span>
                <input
                  type="number"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 0)}
                  className="w-full h-12 pl-9 pr-3 rounded-xl bg-white/[0.06] border border-white/10 text-[#ffb4ab] text-sm font-bold outline-none focus:border-[#6d4aff]"
                />
              </div>
              <span className="text-[10px] text-[#938ea2] px-1">Alert in pieces</span>
            </div>
          </div>

          {/* Rack Location & Category */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#938ea2] uppercase tracking-wider font-semibold px-1">
                Rack Location
              </label>
              <input
                type="text"
                value={rack}
                onChange={(e) => setRack(e.target.value)}
                placeholder="e.g. Rack A-14"
                className="w-full h-11 px-3 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-[#938ea2] uppercase tracking-wider font-semibold px-1">
                Formulary Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-[#161120] border border-white/10 text-white text-xs outline-none cursor-pointer"
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrups">Syrups</option>
                <option value="Antibiotics">Antibiotics</option>
                <option value="Injection">Injection</option>
                <option value="Drops">Drops</option>
                <option value="Ointment">Ointment</option>
              </select>
            </div>
          </div>
        </div>

        {/* Auxiliary Tags */}
        <div className="flex flex-wrap items-center gap-2 px-1">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-white">
            <span className="material-symbols-outlined text-[#d0bcff] text-[15px]">schedule</span>
            <span className="text-[10px] font-medium text-[#c9c4d9]">Schedule H Drug</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-white">
            <span className="material-symbols-outlined text-[#4edea3] text-[15px]">ac_unit</span>
            <span className="text-[10px] font-medium text-[#c9c4d9]">Store below 25°C</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-white">
            <span className="material-symbols-outlined text-[#6d4aff] text-[15px]">verified</span>
            <span className="text-[10px] font-medium text-[#c9c4d9]">DGDA Approved</span>
          </div>
        </div>

        {/* Primary Interactive Glowing Save Button */}
        <button
          type="submit"
          className={`w-full h-[52px] rounded-full bg-gradient-to-r from-[#6d4aff] via-[#8b5cf6] to-[#6d4aff] text-white font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-[#6d4aff]/40 active:scale-[0.98] transition-all cursor-pointer ${
            saveSuccess ? 'brightness-125' : ''
          }`}
        >
          <span className="material-symbols-outlined text-[22px]">
            {saveSuccess ? 'check_circle' : 'auto_awesome'}
          </span>
          <span>
            {saveSuccess
              ? 'Saved to Catalog! ✨'
              : isEditing
              ? 'Update Medicine ✨'
              : 'Save Medicine ✨'}
          </span>
        </button>
      </form>
    </div>
  );
};
