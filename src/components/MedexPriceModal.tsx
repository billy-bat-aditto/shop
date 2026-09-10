import React from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import { ScreenMedexPrice } from './ScreenMedexPrice';

export const MedexPriceModal: React.FC = () => {
  const { isMedexModalOpen, closeMedexPriceChecker, medexInitialQuery, settings } = usePharmacy();

  if (!isMedexModalOpen) return null;

  const isDark = (settings.themeMode || settings.theme) !== 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md transition-opacity duration-250 animate-fadeIn">
      <div
        className={`w-full max-w-[440px] max-h-[92vh] flex flex-col rounded-t-[32px] sm:rounded-[32px] overflow-hidden border shadow-2xl transition-all duration-300 ${
          isDark
            ? 'bg-[#0f0b1d] border-white/20 text-[#e8dff5]'
            : 'bg-white border-purple-900/10 text-slate-800'
        }`}
      >
        {/* Pull handle on mobile */}
        <div className="pt-2.5 pb-1 flex justify-center shrink-0">
          <div className="w-12 h-1 rounded-full bg-white/20" />
        </div>

        {/* Modal Body with scrollable content */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-1">
          <ScreenMedexPrice
            initialQuery={medexInitialQuery}
            onClose={closeMedexPriceChecker}
            isModal={true}
          />
        </div>
      </div>
    </div>
  );
};
