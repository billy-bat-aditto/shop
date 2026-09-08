import React from 'react';
import { usePharmacy } from '../context/PharmacyContext';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateCartItemQty,
    removeFromCart,
    clearCart,
    cartTotalPrice,
    cartTotalCount
  } = usePharmacy();

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      <div
        className="w-full max-w-[430px] max-h-[85vh] flex flex-col rounded-t-[28px] bg-[#161120] border-t border-white/20 shadow-2xl p-5 overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Pull Indicator Handle */}
        <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-3" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#6d4aff]/20 flex items-center justify-center text-[#c9bfff]">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                shopping_bag
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Active Dispense Tray</h3>
              <p className="text-xs text-[#938ea2]">
                {cartTotalCount} item{cartTotalCount === 1 ? '' : 's'} in current cart
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cart.length > 0 ? (
              <button
                onClick={clearCart}
                className="text-xs text-[#ffb4ab] hover:text-[#ffdad6] px-2 py-1 rounded-lg bg-red-950/40 transition-colors"
              >
                Clear
              </button>
            ) : null}
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 no-scrollbar">
          {cart.length === 0 ? (
            <div className="py-12 text-center text-[#938ea2]">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-50">remove_shopping_cart</span>
              <p className="text-sm">Your dispensing tray is empty.</p>
              <p className="text-xs opacity-75 mt-1">Search medicines and add strips or pieces.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-white/[0.05] border border-white/10 hover:border-white/20 transition-all flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-sm truncate text-white">{item.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.mode === 'strip'
                            ? 'bg-[#6d4aff]/30 text-[#d0bcff] border border-[#6d4aff]/40'
                            : 'bg-[#007d55]/30 text-[#4edea3] border border-[#007d55]/40'
                        }`}
                      >
                        {item.mode} ({item.mode === 'strip' ? `${item.unitsPerStrip} pcs` : '1 pc'})
                      </span>
                    </div>
                    <p className="text-xs text-[#938ea2] truncate mt-0.5">
                      Rate: ৳{item.unitPrice} / {item.mode}
                      {item.discountVal > 0 ? (
                        <span className="ml-1 text-[#4edea3]">
                          (Disc: {item.discountVal}
                          {item.discountType})
                        </span>
                      ) : null}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-bold text-base text-[#a78bff]">৳{item.lineTotal}</div>
                    {item.discountVal > 0 ? (
                      <div className="text-[10px] text-[#938ea2] line-through">
                        ৳{item.unitPrice * item.quantity}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Bottom Row: Quantity Stepper & Remove */}
                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="flex items-center gap-1 text-xs text-[#ffb4ab]/80 hover:text-[#ffb4ab] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                    <span>Remove</span>
                  </button>

                  <div className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded-xl">
                    <button
                      onClick={() => updateCartItemQty(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="font-bold text-xs min-w-[20px] text-center text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartItemQty(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout Button */}
        {cart.length > 0 ? (
          <div className="pt-3 border-t border-white/10 space-y-3">
            <div className="flex justify-between items-center text-sm px-1">
              <span className="text-[#938ea2]">Estimated Total:</span>
              <span className="text-xl font-extrabold text-white tracking-tight">৳{cartTotalPrice}</span>
            </div>

            <button
              onClick={() => {
                setIsCartDrawerOpen(false);
                onProceedToCheckout();
              }}
              className="w-full h-13 py-3 px-6 rounded-full bg-gradient-to-r from-[#6d4aff] via-[#7c56ff] to-[#a78bff] text-white font-bold flex items-center justify-between shadow-lg shadow-[#6d4aff]/40 active:scale-[0.98] transition-all cursor-pointer keep-white"
            >
              <div className="flex items-center gap-2 text-white">
                <span className="material-symbols-outlined text-[20px] text-white">shopping_cart_checkout</span>
                <span className="text-white">Proceed to Checkout</span>
              </div>
              <div className="flex items-center gap-1 text-white font-extrabold text-base">
                <span className="text-white">৳{cartTotalPrice}</span>
                <span className="material-symbols-outlined text-[18px] text-white">arrow_forward</span>
              </div>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
