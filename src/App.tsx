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

const AppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isAddMedModalOpen,
    setIsAddMedModalOpen,
    setEditingMedicine,
    activeReceipt,
    setActiveReceipt,
    settings
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
      {/* Liquid Glass Atmospheric Ambient Background Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top-left Purple Ambient Orb */}
        <div className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[110px] ${isDark ? 'bg-[#6d4aff]/20' : 'bg-[#6d4aff]/10'}`} />
        {/* Center-right Violet Ambient Orb */}
        <div className={`absolute top-1/3 -right-36 w-96 h-96 rounded-full blur-[120px] ${isDark ? 'bg-[#8b5cf6]/15' : 'bg-[#8b5cf6]/8'}`} />
        {/* Bottom-left Emerald Subtle Glow */}
        <div className={`absolute -bottom-24 -left-20 w-80 h-80 rounded-full blur-[100px] ${isDark ? 'bg-[#007d55]/15' : 'bg-[#007d55]/8'}`} />
        {/* Fine Grain/Glass overlay */}
        <div className={`absolute inset-0 bg-radial from-transparent ${isDark ? 'to-black/40 opacity-40' : 'to-purple-900/5 opacity-10'}`} />
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
