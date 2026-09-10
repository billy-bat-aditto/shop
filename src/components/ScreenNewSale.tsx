import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { Medicine } from '../types';

interface ScreenNewSaleProps {
  onOpenCheckout: () => void;
}

export const ScreenNewSale: React.FC<ScreenNewSaleProps> = ({ onOpenCheckout }) => {
  const {
    medicines,
    addToCart,
    cartTotalCount,
    cartTotalPrice,
    setIsCartDrawerOpen,
    openMedexPriceChecker
  } = usePharmacy();

  const [searchTerm, setSearchTerm] = useState('');
  const [fastMovingOnly, setFastMovingOnly] = useState(false);

  // Quick dispense drawer / modal state
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
  const [isDispenseModalOpen, setIsDispenseModalOpen] = useState(false);
  const [dispenseUnit, setDispenseUnit] = useState<'strip' | 'piece'>('strip');
  const [dispenseQty, setDispenseQty] = useState(1);
  const [discountType, setDiscountType] = useState<'%' | '৳'>('%');
  const [discountVal, setDiscountVal] = useState<number>(0);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [addFeedback, setAddFeedback] = useState(false);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Filter medicines
  const filteredMeds = medicines.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.generic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.rack.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFast = !fastMovingOnly || med.isFastMoving;
    return matchesSearch && matchesFast;
  });

  const handleOpenDispense = (med: Medicine) => {
    setSelectedMed(med);
    setDispenseUnit('strip');
    setDispenseQty(1);
    setDiscountVal(0);
    setAlertMessage(null);
    setIsDispenseModalOpen(true);
  };

  const handleQuickAdd = (e: React.MouseEvent, med: Medicine, mode: 'strip' | 'piece') => {
    e.stopPropagation();
    const res = addToCart(med, mode, 1, '%', 0);
    if (res.success) {
      setToastNotification(`Added 1 ${mode} of ${med.name} to tray (৳${mode === 'strip' ? med.stripPrice : med.piecePrice})`);
      setTimeout(() => setToastNotification(null), 2500);
    } else {
      setToastNotification(res.message || 'Cannot add item');
      setTimeout(() => setToastNotification(null), 2500);
    }
  };

  // Calculate drawer total
  const currentPrice = selectedMed
    ? dispenseUnit === 'strip'
      ? selectedMed.stripPrice
      : selectedMed.piecePrice
    : 0;

  const baseLineTotal = currentPrice * dispenseQty;
  const calculatedLineTotal =
    discountType === '%'
      ? Math.max(0, baseLineTotal - baseLineTotal * (discountVal / 100))
      : Math.max(0, baseLineTotal - discountVal);

  const handleAddToCart = () => {
    if (!selectedMed) return;

    const res = addToCart(
      selectedMed,
      dispenseUnit,
      dispenseQty,
      discountType,
      discountVal
    );

    if (!res.success) {
      setAlertMessage(res.message || 'Error adding item');
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }

    setAddFeedback(true);
    setAlertMessage(null);
    setToastNotification(`Added ${dispenseQty} ${dispenseUnit}${dispenseQty > 1 ? 's' : ''} of ${selectedMed.name} to tray!`);
    setTimeout(() => {
      setAddFeedback(false);
      setIsDispenseModalOpen(false);
    }, 600);
    setTimeout(() => setToastNotification(null), 2500);
  };

  return (
    <div className="flex flex-col w-full pb-36 pt-1">
      {/* Page Header Subtitle & Ambient Glow */}
      <div className="flex items-center justify-between mt-1 mb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#a78bff]">
            POS Quick Dispense
          </span>
          <h2 className="text-2xl font-black bg-gradient-to-r from-white via-[#d0bcff] to-[#e5deff] bg-clip-text text-transparent">
            New Sale
          </h2>
        </div>
        <div className="flex items-center gap-1.5 bg-white/[0.06] border border-white/10 px-3 py-1.5 rounded-full shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#4edea3] animate-pulse" />
          <span className="text-[10px] text-[#c9c4d9] font-medium">Terminal #02 Active</span>
        </div>
      </div>

      {/* Search & Barcode Scan Pill Input Bar */}
      <div className="relative w-full mb-4">
        <div className="relative flex items-center w-full h-12 rounded-full liquid-input px-4 transition-all">
          <span className="material-symbols-outlined text-gray-400 dark:text-[#938ea2] text-[22px] mr-2.5 select-none">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search medicine by name or barcode…"
            className="w-full bg-transparent text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-[#938ea2] text-sm outline-none border-none focus:outline-none font-medium"
          />
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              className="mr-1 text-gray-500 hover:text-black dark:text-[#938ea2] dark:hover:text-white"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          ) : null}
          <button
            type="button"
            title="Scan barcode"
            onClick={() => setSearchTerm('Ace Plus')}
            className="ml-1 w-8 h-8 rounded-full bg-[#6d4aff]/30 flex items-center justify-center text-[#6d4aff] dark:text-[#d0bcff] hover:bg-[#6d4aff]/50 active:scale-95 transition-all cursor-pointer border border-[#6d4aff]/40 shadow-sm"
          >
            <span className="material-symbols-outlined text-[19px]">qr_code_scanner</span>
          </button>

          <button
            type="button"
            title="Check live market MRP on medex.com.bd"
            onClick={() => openMedexPriceChecker(searchTerm)}
            className="ml-1 px-2.5 h-8 rounded-full bg-gradient-to-r from-[#1a9e75]/25 to-[#4edea3]/20 flex items-center gap-1 text-[#4edea3] hover:bg-[#1a9e75]/35 active:scale-95 transition-all cursor-pointer border border-[#1a9e75]/40 text-xs font-bold shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse" />
            <span className="material-symbols-outlined text-[15px]">travel_explore</span>
            <span className="hidden sm:inline">MedEx</span>
          </button>
        </div>
      </div>

      {/* Filter Fast Moving Section */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[11px] tracking-wider text-[#938ea2] uppercase font-semibold">
          Matched Medicines ({filteredMeds.length})
        </span>
        <button
          onClick={() => setFastMovingOnly(!fastMovingOnly)}
          className={`text-[11px] flex items-center gap-1 cursor-pointer transition-colors ${
            fastMovingOnly ? 'text-[#4edea3] font-bold' : 'text-[#a78bff]'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">tune</span>
          <span>{fastMovingOnly ? 'Showing Fast Moving' : 'Filter Fast Moving'}</span>
        </button>
      </div>

      {/* Floating Toast Notification */}
      {toastNotification ? (
        <div className="fixed top-16 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-top duration-300">
          <div className="bg-gradient-to-r from-[#6d4aff] to-[#a78bff] text-white px-4 py-2.5 rounded-full text-xs font-bold shadow-xl shadow-[#6d4aff]/40 flex items-center gap-2 keep-white">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{toastNotification}</span>
          </div>
        </div>
      ) : null}

      {/* Medicine Search Results Section */}
      <div className="flex flex-col gap-3 mb-5">
        {filteredMeds.length === 0 ? (
          <div className="p-8 text-center glass-card rounded-2xl text-[#938ea2] flex flex-col items-center">
            <p className="text-sm">No inventory medicines found matching "{searchTerm}".</p>
            {searchTerm ? (
              <button
                type="button"
                onClick={() => openMedexPriceChecker(searchTerm)}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a9e75]/25 text-[#4edea3] hover:bg-[#1a9e75]/40 border border-[#1a9e75]/40 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse" />
                <span className="material-symbols-outlined text-[16px]">travel_explore</span>
                <span>Lookup "{searchTerm}" on MedEx BD</span>
              </button>
            ) : null}
            <button
              onClick={() => setSearchTerm('')}
              className="mt-2 text-xs text-[#a78bff] underline font-medium cursor-pointer"
            >
              Clear search filter
            </button>
          </div>
        ) : (
          filteredMeds.map((med) => {
            const isSelected = selectedMed?.id === med.id;
            return (
              <div
                key={med.id}
                onClick={() => handleOpenDispense(med)}
                className={`relative overflow-hidden rounded-[26px] p-4 transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-[#6d4aff]/20 border border-[#8b5cf6]/60 shadow-[0_0_24px_rgba(109,74,255,0.35)]'
                    : 'liquid-glass-card hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Glowing Capsule Avatar */}
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#6d4aff]/30 to-[#4edea3]/20 flex items-center justify-center text-[#c9bfff] shadow-inner shrink-0 relative overflow-hidden border border-white/10">
                      <span
                        className="material-symbols-outlined text-[24px] relative z-10 text-[#d0bcff]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {med.category === 'Syrups' ? 'medication_liquid' : 'pill'}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-white truncate">{med.name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold leading-none ${
                            med.stockPieces <= med.lowStockThreshold
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-[#007d55]/30 text-[#6ffbbe]'
                          }`}
                        >
                          {med.stockPieces <= med.lowStockThreshold ? 'Low Stock' : 'In Stock'}
                        </span>
                      </div>
                      <p className="text-xs text-[#c9c4d9] truncate mt-0.5">{med.generic}</p>
                      <p className="text-[10px] text-[#938ea2] mt-0.5">
                        {med.company} • {med.rack} • {med.stockPieces} pcs left
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDispense(med);
                    }}
                    title="Open Dispense Options"
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all bg-white/10 text-[#c9bfff] hover:bg-[#6d4aff] hover:text-white cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">tune</span>
                  </button>
                </div>

                {/* 1-Tap Direct Quick Add Buttons */}
                <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-white/10">
                  <button
                    type="button"
                    onClick={(e) => handleQuickAdd(e, med, 'strip')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#6d4aff]/20 hover:bg-[#6d4aff]/35 active:scale-95 border border-[#6d4aff]/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px] text-[#a78bff]">add</span>
                    <span className="text-white">1 Strip</span>
                    <span className="text-[#a78bff] font-extrabold ml-0.5">৳{med.stripPrice}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleQuickAdd(e, med, 'piece')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/15 text-xs font-bold transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px] text-[#4edea3]">add</span>
                    <span className="text-white">1 Pc</span>
                    <span className="text-[#4edea3] font-extrabold ml-0.5">৳{med.piecePrice}</span>
                  </button>

                  <span className="text-[10px] text-[#938ea2] shrink-0 font-medium">
                    {med.unitsPerStrip}u/str
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Interactive Quick Dispense Modal Sheet */}
      {isDispenseModalOpen && selectedMed ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsDispenseModalOpen(false)}
        >
          <div
            className="w-full max-w-[430px] rounded-t-[32px] bg-[#161120] border-t border-white/20 backdrop-blur-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Indicator Pill */}
            <div className="w-12 h-1.5 rounded-full bg-white/25 mx-auto mb-4" />

            {/* Drawer Header & Details */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6d4aff] animate-ping" />
                  <h3 className="text-xl font-extrabold text-white tracking-tight">
                    {selectedMed.name}
                  </h3>
                </div>
                <p className="text-xs text-[#c9c4d9] mt-0.5">
                  {selectedMed.company} • Strip: ৳{selectedMed.stripPrice} | Unit: ৳{selectedMed.piecePrice}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-[#938ea2] block font-semibold">
                    Stock
                  </span>
                  <span className="text-xs font-bold text-[#4edea3]">
                    {selectedMed.stockPieces} pcs
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDispenseModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            {/* Unit Toggle Pills */}
            <div className="mb-4">
              <label className="text-[10px] tracking-wider uppercase text-[#938ea2] mb-1.5 block font-semibold">
                Select Dispensing Unit
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-black/40 border border-white/10">
                <button
                  type="button"
                  onClick={() => setDispenseUnit('strip')}
                  className={`py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    dispenseUnit === 'strip'
                      ? 'bg-gradient-to-r from-[#6d4aff] to-[#a78bff] text-white shadow-md keep-white'
                      : 'text-[#c9c4d9] hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">view_week</span>
                  <span>Strip (৳{selectedMed.stripPrice})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDispenseUnit('piece')}
                  className={`py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    dispenseUnit === 'piece'
                      ? 'bg-gradient-to-r from-[#6d4aff] to-[#a78bff] text-white shadow-md keep-white'
                      : 'text-[#c9c4d9] hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">circle</span>
                  <span>Piece (৳{selectedMed.piecePrice})</span>
                </button>
              </div>
            </div>

            {/* Quantity Stepper with Quick Presets */}
            <div className="mb-4 bg-white/[0.04] p-3 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex flex-col">
                  <span className="text-sm text-white font-medium">Quantity</span>
                  <span className="text-[11px] text-[#938ea2]">
                    Adjust {dispenseUnit === 'strip' ? 'strip count' : 'piece count'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDispenseQty(Math.max(1, dispenseQty - 1))}
                    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 active:scale-90 transition-all cursor-pointer font-bold text-lg"
                  >
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <span className="text-lg font-bold text-white w-8 text-center select-none">
                    {dispenseQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const unitPieces = dispenseUnit === 'strip' ? selectedMed.unitsPerStrip : 1;
                      if ((dispenseQty + 1) * unitPieces <= selectedMed.stockPieces) {
                        setDispenseQty(dispenseQty + 1);
                      }
                    }}
                    className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 active:scale-90 transition-all cursor-pointer font-bold text-lg"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </div>

              {/* Quick Qty Preset Pills */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <span className="text-[10px] uppercase text-[#938ea2] font-semibold mr-1">Presets:</span>
                {[1, 2, 5, 10].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setDispenseQty(qty)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      dispenseQty === qty
                        ? 'bg-[#6d4aff] text-white keep-white'
                        : 'bg-white/5 text-[#c9c4d9] hover:bg-white/10'
                    }`}
                  >
                    {qty}
                  </button>
                ))}
              </div>
            </div>

            {/* Instant Discount Row */}
            <div className="mb-4 bg-white/[0.04] p-3 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white font-medium">Instant Discount</span>
                <div className="flex items-center bg-black/40 p-0.5 rounded-lg border border-white/10">
                  <button
                    type="button"
                    onClick={() => setDiscountType('%')}
                    className={`px-2.5 py-0.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                      discountType === '%'
                        ? 'bg-[#6d4aff] text-white keep-white'
                        : 'text-[#938ea2] hover:text-white'
                    }`}
                  >
                    %
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('৳')}
                    className={`px-2.5 py-0.5 rounded text-xs font-bold transition-colors cursor-pointer ${
                      discountType === '৳'
                        ? 'bg-[#6d4aff] text-white keep-white'
                        : 'text-[#938ea2] hover:text-white'
                    }`}
                  >
                    ৳
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#938ea2]">Deduction applied to line-item</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max={discountType === '%' ? 100 : baseLineTotal}
                    value={discountVal || 0}
                    onChange={(e) => setDiscountVal(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-16 text-right bg-white/10 text-white rounded-lg px-2 py-1 text-sm font-bold outline-none border border-white/10 focus:border-[#6d4aff]"
                  />
                  <span className="text-xs text-[#938ea2] font-semibold">{discountType}</span>
                </div>
              </div>
            </div>

            {/* Error / Alert Message */}
            {alertMessage ? (
              <div className="mb-3 px-3 py-2 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{alertMessage}</span>
              </div>
            ) : null}

            {/* Glowing Purple Add to Cart CTA */}
            <button
              type="button"
              onClick={handleAddToCart}
              className={`w-full h-13 py-3.5 px-6 rounded-full bg-gradient-to-r from-[#6d4aff] via-[#6d4aff] to-[#a78bff] text-white font-bold flex items-center justify-between shadow-lg shadow-[#6d4aff]/40 active:scale-[0.98] transition-all cursor-pointer keep-white ${
                addFeedback ? 'brightness-125 scale-[0.99]' : ''
              }`}
            >
              <span className="flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-[20px] text-white">
                  {addFeedback ? 'check_circle' : 'add_shopping_cart'}
                </span>
                <span className="text-white">{addFeedback ? 'Added to Tray! ✨' : 'Add to Cart'}</span>
              </span>
              <span className="text-lg tracking-tight font-extrabold text-white">
                ৳{Math.round(calculatedLineTotal)}
              </span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Sticky Floating Glass Cart Bar Pill (Matches Image 2 Bottom) */}
      <div className="fixed bottom-20 inset-x-0 z-30 pointer-events-none">
        <div className="w-full max-w-[430px] mx-auto px-4 pointer-events-auto">
          <div className="relative flex items-center justify-between p-2.5 pl-4 rounded-full bg-[#100c1a]/95 backdrop-blur-2xl border border-white/20 shadow-2xl shadow-black/80">
            {/* Left: Cart Count & Total */}
            <div
              onClick={() => setIsCartDrawerOpen(true)}
              className="flex items-center gap-3 cursor-pointer hover:opacity-90 active:scale-95 transition-transform"
            >
              <div className="w-9 h-9 rounded-full bg-[#6d4aff]/20 flex items-center justify-center text-[#c9bfff] relative">
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  shopping_bag
                </span>
                {cartTotalCount > 0 ? (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#e84188] text-white text-[9px] font-bold flex items-center justify-center">
                    {cartTotalCount}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white leading-tight">
                  {cartTotalCount} item{cartTotalCount === 1 ? '' : 's'} in tray
                </span>
                <span className="text-sm font-bold text-[#d0bcff] leading-tight">
                  ৳{cartTotalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Right: Checkout Button */}
            <button
              type="button"
              disabled={cartTotalCount === 0}
              onClick={onOpenCheckout}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full font-bold text-sm shadow-md transition-all cursor-pointer ${
                cartTotalCount > 0
                  ? 'bg-gradient-to-r from-[#6d4aff] to-[#a78bff] text-white shadow-[#6d4aff]/40 active:scale-95'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              }`}
            >
              <span>Checkout</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="mt-8 text-center select-none">
        <span className="text-[10px] tracking-widest uppercase text-white/30 font-medium">
          made by aditto 💜
        </span>
      </div>
    </div>
  );
};
