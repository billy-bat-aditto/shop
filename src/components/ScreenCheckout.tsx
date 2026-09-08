import React, { useState } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { Sale } from '../types';

interface ScreenCheckoutProps {
  onBack: () => void;
}

export const ScreenCheckout: React.FC<ScreenCheckoutProps> = ({ onBack }) => {
  const {
    cart,
    debtors,
    checkoutSale,
    activeReceipt,
    setActiveReceipt,
    setActiveTab
  } = usePharmacy();

  // If activeReceipt exists (already completed sale), we show the confirmed receipt view!
  // If activeReceipt is null, we are checking out the current cart.
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [billDiscountPercent, setBillDiscountPercent] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Due'>('Paid');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'bKash' | 'Card'>('Cash');
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Items to display: activeReceipt items if viewing confirmed sale, else cart
  const displayItems = activeReceipt ? activeReceipt.items : cart;

  // Calculate live financial figures
  const subtotal = displayItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const itemDiscountsTotal = displayItems.reduce((sum, item) => {
    const base = item.unitPrice * item.quantity;
    return sum + (base - item.lineTotal);
  }, 0);

  const priceAfterItemDiscounts = subtotal - itemDiscountsTotal;
  const currentBillDiscountPercent = activeReceipt ? activeReceipt.billDiscountPercent : billDiscountPercent;
  const billDiscountAmount = Math.round(
    priceAfterItemDiscounts * (currentBillDiscountPercent / 100) * 100
  ) / 100;

  const grandTotal = activeReceipt
    ? activeReceipt.grandTotal
    : Math.max(0, Math.round((priceAfterItemDiscounts - billDiscountAmount) * 100) / 100);

  const handleCompleteSale = () => {
    if (activeReceipt) {
      // Already saved, trigger print
      window.print();
      return;
    }

    const res = checkoutSale(
      customerName,
      customerPhone,
      billDiscountPercent,
      paymentStatus,
      paymentMethod
    );

    if (res.success) {
      setIsSaved(true);
      setTimeout(() => {
        window.print();
      }, 500);
    }
  };

  const handleShareReceipt = () => {
    const saleId = activeReceipt ? activeReceipt.id : 'Receipt #1042';
    const textReceipt = `
========================================
💊 MEDIEXPENCES BY ADITTO
${saleId} | ${activeReceipt ? activeReceipt.timestamp : new Date().toLocaleString()}
Customer: ${activeReceipt ? activeReceipt.customerName : customerName}
----------------------------------------
${displayItems
  .map(
    (i) =>
      `${i.name} (${i.mode} × ${i.quantity}) - ৳${i.lineTotal} (Rate: ৳${i.unitPrice})`
  )
  .join('\n')}
----------------------------------------
Subtotal: ৳${subtotal}
Item Discounts: -৳${itemDiscountsTotal}
Bill Discount: -৳${billDiscountAmount}
GRAND TOTAL: ৳${grandTotal}
Payment Status: ${activeReceipt ? activeReceipt.status : paymentStatus}
========================================
Thank you for your visit! 💜
    `.trim();

    if (navigator.share) {
      navigator
        .share({
          title: `Receipt - MediExpences`,
          text: textReceipt
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(textReceipt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col w-full pb-24 pt-2">
      <div className="relative w-full flex flex-col items-center">
        {/* Sale Status Indicator Pill */}
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#007d55]/30 text-[#4edea3] mb-3 shadow-sm backdrop-blur-md border border-[#007d55]/40">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span className="text-[10px] uppercase tracking-wider font-bold">
            {activeReceipt ? 'Sale Confirmed & Saved' : 'Checkout & Review'}
          </span>
        </div>

        {/* Main Frosted Glass Receipt Slab (Matches Image 4) */}
        <div className="w-full relative rounded-3xl bg-[#1e1928]/85 backdrop-blur-2xl p-5 border border-white/15 shadow-2xl flex flex-col overflow-hidden">
          {/* Top Jagged Glass Cutout Effect */}
          <div className="absolute -top-3 left-0 right-0 h-4 flex justify-between items-center px-3 opacity-60 pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="w-2.5 h-2.5 rounded-full bg-[#0a0614]" />
            ))}
          </div>

          {/* Receipt Meta Header */}
          <div className="flex justify-between items-start pt-2 pb-3 border-b border-white/10">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#a78bff] text-[20px]">
                  receipt_long
                </span>
                <span className="text-lg font-bold text-white tracking-tight">
                  {activeReceipt ? activeReceipt.id : 'Receipt #1042'}
                </span>
              </div>
              <span className="text-xs text-[#938ea2] mt-0.5">
                {activeReceipt
                  ? activeReceipt.timestamp
                  : new Date().toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Customer Selector / Badge */}
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-wider text-[#938ea2] font-semibold">
                Customer
              </span>
              {activeReceipt ? (
                <div className="flex items-center gap-1 mt-0.5 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
                  <span className="material-symbols-outlined text-[#d0bcff] text-[13px]">person</span>
                  <span className="text-xs font-semibold text-white truncate max-w-[120px]">
                    {activeReceipt.customerName}
                  </span>
                </div>
              ) : (
                <div className="mt-1">
                  <select
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      const deb = debtors.find((d) => d.name === e.target.value);
                      if (deb) setCustomerPhone(deb.phone);
                    }}
                    className="bg-white/10 text-white text-xs rounded-full px-2.5 py-1 border border-white/15 outline-none font-medium"
                  >
                    <option value="Walk-in Customer" className="bg-[#161120] text-white">
                      Walk-in Customer
                    </option>
                    {debtors.map((d) => (
                      <option key={d.id} value={d.name} className="bg-[#161120] text-white">
                        {d.name} (Due: ৳{d.dueBalance})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Itemized Items List */}
          <div className="flex flex-col gap-2.5 my-3.5">
            {displayItems.length === 0 ? (
              <div className="py-6 text-center text-[#938ea2] text-xs">No items in cart.</div>
            ) : (
              displayItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.04] border border-white/5"
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-white truncate">{item.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#6d4aff]/30 text-[#d0bcff] text-[10px] font-bold uppercase tracking-wider">
                        {item.mode} × {item.quantity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-[#938ea2]">Unit: ৳{item.unitPrice}</span>
                      {item.discountVal > 0 ? (
                        <span className="text-[10px] text-[#4edea3] line-through font-semibold">
                          orig ৳{item.unitPrice * item.quantity}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#938ea2]">Disc: ৳0</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-base font-bold text-white tracking-tight">
                      ৳{item.lineTotal}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Financial Calculation Summary Panel */}
          <div className="rounded-2xl bg-white/[0.04] p-3.5 flex flex-col gap-2 border border-white/10">
            <div className="flex justify-between items-center text-xs text-[#c9c4d9]">
              <span>Subtotal</span>
              <span className="font-bold text-white">৳{subtotal}</span>
            </div>

            <div className="flex justify-between items-center text-xs text-[#4edea3]">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">high_res</span>
                <span>Item Discounts</span>
              </div>
              <span className="font-bold">−৳{itemDiscountsTotal}</span>
            </div>

            <div className="flex justify-between items-center text-xs text-[#4edea3]">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">percent</span>
                <span>Bill Discount ({currentBillDiscountPercent}%)</span>
              </div>
              <span className="font-bold">−৳{billDiscountAmount}</span>
            </div>

            {/* If not finalized, allow changing bill discount % */}
            {!activeReceipt ? (
              <div className="flex items-center justify-between pt-1 text-xs text-[#938ea2]">
                <span>Adjust Bill Discount (%):</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={billDiscountPercent}
                  onChange={(e) =>
                    setBillDiscountPercent(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))
                  }
                  className="w-14 text-right bg-black/40 text-white rounded px-2 py-0.5 border border-white/10 text-xs font-bold outline-none focus:border-[#6d4aff]"
                />
              </div>
            ) : null}

            {/* Glowing Specular Line */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#6d4aff]/40 to-transparent my-1" />

            {/* Grand Total Row */}
            <div className="flex justify-between items-baseline pt-1">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-[#938ea2] tracking-wider font-semibold">
                  Grand Total
                </span>
                <span className="text-[10px] text-[#4edea3]">Inclusive of all taxes</span>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-[#e5deff] to-[#d0bcff] bg-clip-text text-transparent">
                  ৳{grandTotal}
                </span>
              </div>
            </div>
          </div>

          {/* Perforated Tear Bottom Cutout Edge */}
          <div className="relative w-full flex items-center justify-center my-3.5">
            <div className="w-full h-[1px] border-b border-dashed border-white/20" />
            <div className="absolute -left-7 w-4 h-4 rounded-full bg-[#0a0614]" />
            <div className="absolute -right-7 w-4 h-4 rounded-full bg-[#0a0614]" />
          </div>

          {/* Payment Status Toggle */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] uppercase tracking-widest text-[#938ea2] font-semibold">
              Payment Status
            </span>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black/50 border border-white/10">
              <button
                type="button"
                disabled={Boolean(activeReceipt)}
                onClick={() => setPaymentStatus('Paid')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  (activeReceipt ? activeReceipt.status === 'Paid' : paymentStatus === 'Paid')
                    ? 'bg-gradient-to-r from-[#6d4aff] to-[#a78bff] text-white shadow-md'
                    : 'text-[#938ea2] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Paid</span>
              </button>
              <button
                type="button"
                disabled={Boolean(activeReceipt)}
                onClick={() => setPaymentStatus('Due')}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  (activeReceipt ? activeReceipt.status === 'Due' : paymentStatus === 'Due')
                    ? 'bg-red-500/30 text-red-300 border border-red-500/50 shadow-md'
                    : 'text-[#938ea2] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">hourglass_empty</span>
                <span>Due</span>
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Bottom CTA Actions */}
        <div className="w-full flex flex-col gap-2.5 mt-5">
          <button
            type="button"
            onClick={handleCompleteSale}
            className="w-full h-[52px] rounded-full bg-gradient-to-r from-[#6d4aff] to-[#a78bff] text-white font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-[#6d4aff]/40 active:scale-[0.98] transition-all cursor-pointer hover:brightness-110"
          >
            <span className="material-symbols-outlined text-[20px]">print</span>
            <span>{activeReceipt ? 'Print Receipt' : 'Save Sale & Print'}</span>
          </button>

          <button
            type="button"
            onClick={handleShareReceipt}
            className="w-full h-11 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/10 text-[#d0bcff] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/[0.15] transition-all active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isCopied ? 'done' : 'ios_share'}
            </span>
            <span>{isCopied ? 'Receipt Copied to Clipboard!' : 'Share Receipt ↗'}</span>
          </button>

          {activeReceipt ? (
            <button
              type="button"
              onClick={() => {
                setActiveReceipt(null);
                setActiveTab('sales');
              }}
              className="mt-1 text-xs text-[#a78bff] hover:underline text-center"
            >
              Start New Sale →
            </button>
          ) : (
            <button
              type="button"
              onClick={onBack}
              className="mt-1 text-xs text-[#938ea2] hover:text-white text-center"
            >
              ← Back to Dispense Tray
            </button>
          )}
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
