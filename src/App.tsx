import React, { useState } from 'react';
import { PharmacyProvider, usePharmacy } from './context/PharmacyContext';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { CartDrawer } from './components/CartDrawer';
import { ScreenHome } from './components/ScreenHome';
import { ScreenNewSale } from './components/ScreenNewSale';
import { ScreenCheckout } from './components/ScreenCheckout';
import { ScreenInventory } from './components/ScreenInventory';
import { ScreenAddEditMedicine } from './components/ScreenAddEditMedicine';
import { ScreenDues } from './components/ScreenDues';
import { ScreenMore } from './components/ScreenMore';
import { CsvImportModal } from './components/CsvImportModal';

const AppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isAddMedModalOpen,
    setIsAddMedModalOpen,
    setEditingMedicine,
    activeReceipt,
    setActiveReceipt,
    settings,
    isCsvModalOpen,
    setIsCsvModalOpen
  } = usePharmacy();

  // State to toggle checkout screen view
  const [isCheckoutView, setIsCheckoutView] = useState(false);

  // If there's an active receipt that was just completed, show checkout view
  const showCheckout = isCheckoutView || Boolean(activeReceipt);

  const handleOpenCheckout = () => {
    setIsCheckoutView(true);
  };

  const handleCloseCheckout = () => {
    setIsCheckoutView(false);
    setActiveReceipt(null);
  };

  const handleAddMedicine = () => {
    setEditingMedicine(null);
    setIsAddMedModalOpen(true);
  };

  const handleEditMedicine = (med: any) => {
    setEditingMedicine(med);
    setIsAddMedModalOpen(true);
  };

  const isDark = (settings.themeMode || settings.theme) !== 'light';

  return (
    <div className={`min-h-screen relative overflow-x-hidden transition-colors duration-300 ${isDark ? 'dark bg-[#0a0614] text-[#e8dff5]' : 'light bg-[#f4f2f8] text-[#0a0518]'}`}>
      {/* iOS 26 Liquid Glass Dynamic Fluid Mesh Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top-left Electric Indigo Fluid Orb */}
        <div className={`absolute -top-24 -left-24 w-[380px] h-[380px] rounded-full blur-[110px] animate-liquid-orb-1 ${isDark ? 'bg-[#6d4aff]/25' : 'bg-[#7c5cff]/14'}`} />
        {/* Center-right Bioluminescent Cyan/Mint Fluid Orb */}
        <div className={`absolute top-1/4 -right-32 w-[360px] h-[360px] rounded-full blur-[115px] animate-liquid-orb-2 ${isDark ? 'bg-[#00f5a0]/12' : 'bg-[#00d084]/8'}`} />
        {/* Mid-left Violet Glow */}
        <div className={`absolute top-2/3 -left-32 w-[340px] h-[340px] rounded-full blur-[105px] animate-liquid-orb-3 ${isDark ? 'bg-[#8b5cf6]/18' : 'bg-[#a78bff]/10'}`} />
        {/* Bottom-right Coral/Rose Accent Orb */}
        <div className={`absolute -bottom-20 -right-20 w-[300px] h-[300px] rounded-full blur-[120px] animate-liquid-orb-1 ${isDark ? 'bg-[#e84188]/12' : 'bg-[#ff6584]/6'}`} />
        {/* iOS Caustic Glass Radial Vignette */}
        <div className={`absolute inset-0 bg-radial from-transparent ${isDark ? 'to-black/60 opacity-60' : 'to-purple-950/5 opacity-20'}`} />
      </div>

      {/* Main App Container Constrained to Mobile Viewport Standard */}
      <div className="relative z-10 w-full max-w-[440px] min-h-screen mx-auto flex flex-col px-4 pt-20">
        {/* iOS 26 Status Bar & Top Navigation Header */}
        <Header
          showBack={showCheckout || isAddMedModalOpen}
          onBack={() => {
            if (showCheckout) handleCloseCheckout();
            else if (isAddMedModalOpen) setIsAddMedModalOpen(false);
          }}
          title={
            showCheckout
              ? 'Receipt & Checkout'
              : isAddMedModalOpen
              ? 'Formulary Entry'
              : undefined
          }
          subtitle={
            showCheckout
              ? 'POS Cashier'
              : isAddMedModalOpen
              ? 'Pharmacy Catalog'
              : undefined
          }
        />

        {/* Dynamic Screen View Switching */}
        <main className="flex-1 w-full flex flex-col">
          {showCheckout ? (
            <ScreenCheckout onBack={handleCloseCheckout} />
          ) : isAddMedModalOpen ? (
            <ScreenAddEditMedicine onClose={() => setIsAddMedModalOpen(false)} />
          ) : (
            <>
              {activeTab === 'home' && <ScreenHome />}
              {activeTab === 'sales' && (
                <ScreenNewSale onOpenCheckout={handleOpenCheckout} />
              )}
              {activeTab === 'inventory' && (
                <ScreenInventory
                  onAddMedicine={handleAddMedicine}
                  onEditMedicine={handleEditMedicine}
                />
              )}
              {activeTab === 'dues' && <ScreenDues />}
              {activeTab === 'more' && <ScreenMore />}
            </>
          )}
        </main>

        {/* Global Multi-Item Cart Drawer Modal */}
        <CartDrawer onProceedToCheckout={handleOpenCheckout} />

        {/* Global CSV Import Modal */}
        <CsvImportModal
          isOpen={isCsvModalOpen}
          onClose={() => setIsCsvModalOpen(false)}
        />

        {/* Floating Glass Dock Bottom Navigation */}
        {!showCheckout && !isAddMedModalOpen && <Navbar />}
      </div>
    </div>
  );
};

export function App() {
  return (
    <PharmacyProvider>
      <AppContent />
    </PharmacyProvider>
  );
}

export default App;
