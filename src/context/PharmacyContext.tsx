import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Medicine,
  CartItem,
  Sale,
  CustomerDebtor,
  Expense,
  PharmacySettings,
  DebtorTransaction
} from '../types';
import {
  INITIAL_MEDICINES,
  INITIAL_DEBTORS,
  INITIAL_EXPENSES,
  INITIAL_SALES,
  INITIAL_SETTINGS
} from '../mockData';
import {
  generateMedicinesCsv,
  generateSalesCsv,
  getSampleCsvContent,
  downloadBlobFile
} from '../utils/csvUtils';

interface PharmacyContextType {
  // State
  medicines: Medicine[];
  cart: CartItem[];
  sales: Sale[];
  debtors: CustomerDebtor[];
  expenses: Expense[];
  settings: PharmacySettings;
  activeTab: 'home' | 'sales' | 'inventory' | 'dues' | 'more' | 'medex';
  setActiveTab: (tab: 'home' | 'sales' | 'inventory' | 'dues' | 'more' | 'medex') => void;
  moreSubTab: 'expenses' | 'reports' | 'settings';
  setMoreSubTab: (sub: 'expenses' | 'reports' | 'settings') => void;
  
  // Active viewing/editing modals
  editingMedicine: Medicine | null;
  setEditingMedicine: (med: Medicine | null) => void;
  isAddMedModalOpen: boolean;
  setIsAddMedModalOpen: (open: boolean) => void;
  activeReceipt: Sale | null;
  setActiveReceipt: (sale: Sale | null) => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  isCsvModalOpen: boolean;
  setIsCsvModalOpen: (open: boolean) => void;
  isMedexModalOpen: boolean;
  setIsMedexModalOpen: (open: boolean) => void;
  medexInitialQuery: string;
  setMedexInitialQuery: (q: string) => void;
  openMedexPriceChecker: (query?: string) => void;
  closeMedexPriceChecker: () => void;

  // Actions
  addToCart: (
    medicine: Medicine,
    mode: 'strip' | 'piece',
    quantity: number,
    discountType: '%' | '৳',
    discountVal: number
  ) => { success: boolean; message?: string };
  updateCartItemQty: (itemId: string, newQty: number) => boolean;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  checkoutSale: (
    customerName: string,
    customerPhone: string,
    billDiscountPercent: number,
    status: 'Paid' | 'Due',
    paymentMethod?: 'Cash' | 'bKash' | 'Card'
  ) => { success: boolean; sale?: Sale; error?: string };

  addMedicine: (med: Omit<Medicine, 'id'>) => void;
  updateMedicine: (id: string, updates: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  bulkUpdateCompanyPrice: (company: string, percentage: number) => number;

  addExpense: (exp: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;

  addPaymentToDebtor: (
    debtorId: string,
    amount: number,
    method?: string,
    note?: string
  ) => boolean;
  addNewDebtor: (name: string, phone: string, initialDue?: number) => CustomerDebtor;

  toggleTheme: () => void;
  updateSettings: (updates: Partial<PharmacySettings>) => void;
  exportBackup: () => void;
  importBackup: (jsonStr: string) => boolean;
  resetAllData: () => void;

  // CSV Import & Export methods
  importMedicinesList: (
    items: Array<Omit<Medicine, 'id'>>,
    mode: 'merge' | 'append' | 'replace'
  ) => { added: number; updated: number; total: number };
  exportMedicinesCsv: () => void;
  exportSalesCsv: () => void;
  downloadSampleCsv: () => void;

  // Aliases for backup/data management
  exportDataJson: () => void;
  importDataJson: (jsonStr: string) => boolean;
  resetToMockData: () => void;

  // Calculated stats helpers
  todaySalesTotal: number;
  todayExpensesTotal: number;
  todayProfitTotal: number;
  lowStockCount: number;
  expiringSoonCount: number;
  cartTotalCount: number;
  cartTotalPrice: number;
}

const PharmacyContext = createContext<PharmacyContextType | null>(null);

export const PharmacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initial State from localStorage or Seeds
  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    const saved = localStorage.getItem('mediexpences_medicines');
    return saved ? JSON.parse(saved) : INITIAL_MEDICINES;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('mediexpences_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('mediexpences_sales');
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [debtors, setDebtors] = useState<CustomerDebtor[]>(() => {
    const saved = localStorage.getItem('mediexpences_debtors');
    return saved ? JSON.parse(saved) : INITIAL_DEBTORS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('mediexpences_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [settings, setSettings] = useState<PharmacySettings>(() => {
    const saved = localStorage.getItem('mediexpences_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'home' | 'sales' | 'inventory' | 'dues' | 'more' | 'medex'>('home');
  const [moreSubTab, setMoreSubTab] = useState<'expenses' | 'reports' | 'settings'>('expenses');
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [isAddMedModalOpen, setIsAddMedModalOpen] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState<Sale | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isMedexModalOpen, setIsMedexModalOpen] = useState(false);
  const [medexInitialQuery, setMedexInitialQuery] = useState('');

  const openMedexPriceChecker = (query = '') => {
    setMedexInitialQuery(query);
    setIsMedexModalOpen(true);
  };

  const closeMedexPriceChecker = () => {
    setIsMedexModalOpen(false);
  };

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('mediexpences_medicines', JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem('mediexpences_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('mediexpences_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('mediexpences_debtors', JSON.stringify(debtors));
  }, [debtors]);

  useEffect(() => {
    localStorage.setItem('mediexpences_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('mediexpences_settings', JSON.stringify(settings));
  }, [settings]);

  // Sync theme class
  useEffect(() => {
    const isDarkMode = (settings.themeMode || settings.theme) !== 'light';
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [settings.theme, settings.themeMode]);

  // Cart Calculations
  const cartTotalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotalPrice = cart.reduce((acc, item) => acc + item.lineTotal, 0);

  // Stats Calculations
  // Today's Sales: Sum of sales on current date
  const todayDateStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }); // e.g., "24 Oct 2024" or matching current day
  
  // For demo consistency, we also match if sale contains '24 Oct 2024' or current day
  const todaySales = sales.filter(s => s.timestamp.includes(todayDateStr) || s.timestamp.includes('24 Oct 2024'));
  const todaySalesTotal = todaySales.reduce((acc, s) => acc + s.grandTotal, 0);

  const todayExp = expenses.filter(e => e.date === '2024-10-24' || e.date === new Date().toISOString().split('T')[0]);
  const todayExpensesTotal = todayExp.reduce((acc, e) => acc + e.amount, 0);

  // Profit: (Sales Revenue) - (Approximate COGS from sales purchase price) - (Expenses)
  // Or standard Net Profit as displayed on Dashboard:
  const todayProfitTotal = Math.max(0, todaySalesTotal - todayExpensesTotal);

  const lowStockCount = medicines.filter(m => m.stockPieces <= m.lowStockThreshold).length;
  
  // Expiring within 90 days (<3 months)
  const expiringSoonCount = medicines.filter(m => {
    if (!m.expiry) return false;
    let expDate: Date;
    if (m.expiry.includes('-')) {
      const parts = m.expiry.split('-');
      if (parts.length === 2) {
        expDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 28);
      } else {
        expDate = new Date(m.expiry);
      }
    } else if (m.expiry.includes('/')) {
      const [mm, yyyy] = m.expiry.split('/');
      expDate = new Date(parseInt(yyyy), parseInt(mm) - 1, 28);
    } else {
      expDate = new Date();
    }
    const diffDays = (expDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    return diffDays >= -10 && diffDays <= 90;
  }).length;

  // Add to Cart Logic
  const addToCart = (
    medicine: Medicine,
    mode: 'strip' | 'piece',
    quantity: number,
    discountType: '%' | '৳',
    discountVal: number
  ) => {
    if (quantity <= 0) return { success: false, message: 'Quantity must be at least 1' };

    // Calculate pieces required
    const piecesPerUnit = mode === 'strip' ? medicine.unitsPerStrip : 1;
    const totalPiecesRequested = quantity * piecesPerUnit;

    // Check how many pieces of this med are already in cart
    const piecesAlreadyInCart = cart
      .filter(item => item.medicineId === medicine.id)
      .reduce((sum, item) => sum + (item.quantity * (item.mode === 'strip' ? item.unitsPerStrip : 1)), 0);

    if (piecesAlreadyInCart + totalPiecesRequested > medicine.stockPieces) {
      const remainingPieces = Math.max(0, medicine.stockPieces - piecesAlreadyInCart);
      const remainingUnits = mode === 'strip' ? Math.floor(remainingPieces / medicine.unitsPerStrip) : remainingPieces;
      return {
        success: false,
        message: `Insufficient stock! Only ${remainingUnits} ${mode}(s) (${remainingPieces} pcs) available.`
      };
    }

    const unitPrice = mode === 'strip' ? medicine.stripPrice : medicine.piecePrice;
    const baseAmount = unitPrice * quantity;
    let lineTotal = baseAmount;

    if (discountType === '%') {
      lineTotal = Math.max(0, baseAmount - (baseAmount * (discountVal / 100)));
    } else {
      lineTotal = Math.max(0, baseAmount - discountVal);
    }

    const newItem: CartItem = {
      id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      medicineId: medicine.id,
      name: medicine.name,
      generic: medicine.generic,
      company: medicine.company,
      mode,
      unitsPerStrip: medicine.unitsPerStrip,
      unitPrice,
      quantity,
      discountType,
      discountVal,
      lineTotal: Math.round(lineTotal * 100) / 100
    };

    setCart(prev => [...prev, newItem]);
    return { success: true };
  };

  const updateCartItemQty = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(itemId);
      return true;
    }

    const item = cart.find(c => c.id === itemId);
    if (!item) return false;

    const med = medicines.find(m => m.id === item.medicineId);
    if (!med) return false;

    // Validate stock
    const piecesPerUnit = item.mode === 'strip' ? item.unitsPerStrip : 1;
    const totalPiecesOtherItems = cart
      .filter(c => c.medicineId === item.medicineId && c.id !== itemId)
      .reduce((sum, c) => sum + (c.quantity * (c.mode === 'strip' ? c.unitsPerStrip : 1)), 0);

    if (totalPiecesOtherItems + (newQty * piecesPerUnit) > med.stockPieces) {
      return false;
    }

    setCart(prev =>
      prev.map(c => {
        if (c.id !== itemId) return c;
        const baseAmount = c.unitPrice * newQty;
        let lineTotal = baseAmount;
        if (c.discountType === '%') {
          lineTotal = Math.max(0, baseAmount - (baseAmount * (c.discountVal / 100)));
        } else {
          lineTotal = Math.max(0, baseAmount - c.discountVal);
        }
        return {
          ...c,
          quantity: newQty,
          lineTotal: Math.round(lineTotal * 100) / 100
        };
      })
    );
    return true;
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Checkout Sale
  const checkoutSale = (
    customerName: string,
    customerPhone: string,
    billDiscountPercent: number,
    status: 'Paid' | 'Due',
    paymentMethod: 'Cash' | 'bKash' | 'Card' = 'Cash'
  ) => {
    if (cart.length === 0) {
      return { success: false, error: 'Cart is empty!' };
    }

    // Double check stock for all items
    for (const item of cart) {
      const med = medicines.find(m => m.id === item.medicineId);
      const reqPieces = item.quantity * (item.mode === 'strip' ? item.unitsPerStrip : 1);
      if (!med || med.stockPieces < reqPieces) {
        return {
          success: false,
          error: `Insufficient stock for ${item.name} (${item.mode})`
        };
      }
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const itemDiscountsTotal = cart.reduce((sum, item) => {
      const base = item.unitPrice * item.quantity;
      return sum + (base - item.lineTotal);
    }, 0);

    const priceAfterItemDiscounts = subtotal - itemDiscountsTotal;
    const billDiscountAmount = Math.round((priceAfterItemDiscounts * (billDiscountPercent / 100)) * 100) / 100;
    const grandTotal = Math.max(0, Math.round((priceAfterItemDiscounts - billDiscountAmount) * 100) / 100);

    const now = new Date();
    const formattedTimestamp = now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) + ', ' + now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const newSaleId = `REC-${1043 + sales.length}`;
    const newSale: Sale = {
      id: newSaleId,
      timestamp: formattedTimestamp,
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim(),
      items: [...cart],
      subtotal,
      itemDiscountsTotal,
      billDiscountPercent,
      billDiscountAmount,
      grandTotal,
      status,
      paymentMethod
    };

    // 1. Deduct stock for all items
    setMedicines(prevMeds => {
      return prevMeds.map(med => {
        const itemsForMed = cart.filter(c => c.medicineId === med.id);
        if (itemsForMed.length === 0) return med;
        const totalPcsDeducted = itemsForMed.reduce((sum, item) => {
          return sum + (item.quantity * (item.mode === 'strip' ? item.unitsPerStrip : 1));
        }, 0);
        return {
          ...med,
          stockPieces: Math.max(0, med.stockPieces - totalPcsDeducted)
        };
      });
    });

    // 2. If status is Due, update or create debtor
    if (status === 'Due') {
      const finalCustomerName = customerName.trim() || 'Walk-in Customer';
      setDebtors(prevDebtors => {
        const existingIndex = prevDebtors.findIndex(
          d => d.name.toLowerCase() === finalCustomerName.toLowerCase() ||
               (customerPhone && d.phone && d.phone === customerPhone)
        );

        const newTrans: DebtorTransaction = {
          id: `trans_${Date.now()}`,
          date: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          type: 'due_added',
          amount: grandTotal,
          description: `Sale #${newSaleId}`,
          invoiceId: newSaleId
        };

        if (existingIndex >= 0) {
          const updated = [...prevDebtors];
          const curr = updated[existingIndex];
          updated[existingIndex] = {
            ...curr,
            dueBalance: curr.dueBalance + grandTotal,
            history: [newTrans, ...curr.history]
          };
          return updated;
        } else {
          const newDebtor: CustomerDebtor = {
            id: `debtor_${Date.now()}`,
            name: finalCustomerName,
            phone: customerPhone.trim() || 'Unlisted',
            dueBalance: grandTotal,
            lastPaidDate: 'Pending',
            history: [newTrans]
          };
          return [newDebtor, ...prevDebtors];
        }
      });
    }

    // 3. Save Sale
    setSales(prev => [newSale, ...prev]);

    // 4. Clear cart
    setCart([]);

    // 5. Open Active Receipt view
    setActiveReceipt(newSale);

    return { success: true, sale: newSale };
  };

  // Medicine Management
  const addMedicine = (medData: Omit<Medicine, 'id'>) => {
    const newMed: Medicine = {
      ...medData,
      id: `med-${Date.now()}`
    };
    setMedicines(prev => [newMed, ...prev]);
  };

  const updateMedicine = (id: string, updates: Partial<Medicine>) => {
    setMedicines(prev =>
      prev.map(m => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const deleteMedicine = (id: string) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
  };

  const bulkUpdateCompanyPrice = (company: string, percentage: number) => {
    let affectedCount = 0;
    setMedicines(prev =>
      prev.map(m => {
        if (m.company.toLowerCase() === company.toLowerCase()) {
          affectedCount++;
          const factor = 1 + percentage / 100;
          const newStripPrice = Math.round(m.stripPrice * factor * 10) / 10;
          const newPiecePrice = Math.round((newStripPrice / m.unitsPerStrip) * 1.25 * 10) / 10;
          return {
            ...m,
            stripPrice: newStripPrice,
            piecePrice: newPiecePrice
          };
        }
        return m;
      })
    );
    return affectedCount;
  };

  // Expenses
  const addExpense = (expData: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`
    };
    setExpenses(prev => [newExp, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Debtors
  const addPaymentToDebtor = (
    debtorId: string,
    amount: number,
    method: string = 'Cash',
    note?: string
  ) => {
    if (amount <= 0) return false;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    setDebtors(prev =>
      prev.map(d => {
        if (d.id !== debtorId) return d;
        const newDue = Math.max(0, d.dueBalance - amount);
        const trans: DebtorTransaction = {
          id: `trans_${Date.now()}`,
          date: dateStr,
          type: 'payment',
          amount,
          description: note || `${method} Payment`,
          method
        };
        return {
          ...d,
          dueBalance: newDue,
          lastPaidDate: 'Today',
          history: [trans, ...d.history]
        };
      })
    );
    return true;
  };

  const addNewDebtor = (name: string, phone: string, initialDue: number = 0) => {
    const newDebtor: CustomerDebtor = {
      id: `debtor_${Date.now()}`,
      name: name.trim(),
      phone: phone.trim() || 'Unlisted',
      dueBalance: initialDue,
      lastPaidDate: initialDue > 0 ? 'Pending' : 'Never',
      history: initialDue > 0 ? [
        {
          id: `trans_${Date.now()}`,
          date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          type: 'due_added',
          amount: initialDue,
          description: 'Initial Opening Balance'
        }
      ] : []
    };
    setDebtors(prev => [newDebtor, ...prev]);
    return newDebtor;
  };

  // Settings & Theme
  const toggleTheme = () => {
    setSettings(prev => {
      const current = (prev.themeMode || prev.theme) !== 'light' ? 'dark' : 'light';
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      return {
        ...prev,
        theme: nextTheme,
        themeMode: nextTheme
      };
    });
  };

  const updateSettings = (updates: Partial<PharmacySettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const exportBackup = () => {
    const backupData = {
      version: '1.0.4',
      appName: 'MediExpences by Aditto',
      exportDate: new Date().toISOString(),
      medicines,
      sales,
      debtors,
      expenses,
      settings
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MediExpences_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importBackup = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.medicines && Array.isArray(data.medicines)) {
        setMedicines(data.medicines);
      }
      if (data.sales && Array.isArray(data.sales)) {
        setSales(data.sales);
      }
      if (data.debtors && Array.isArray(data.debtors)) {
        setDebtors(data.debtors);
      }
      if (data.expenses && Array.isArray(data.expenses)) {
        setExpenses(data.expenses);
      }
      if (data.settings) {
        setSettings(data.settings);
      }
      return true;
    } catch {
      return false;
    }
  };

  const resetAllData = () => {
    setMedicines(INITIAL_MEDICINES);
    setSales(INITIAL_SALES);
    setDebtors(INITIAL_DEBTORS);
    setExpenses(INITIAL_EXPENSES);
    setSettings(INITIAL_SETTINGS);
    setCart([]);
  };

  // CSV Import & Export Implementations
  const importMedicinesList = (
    items: Array<Omit<Medicine, 'id'>>,
    mode: 'merge' | 'append' | 'replace'
  ) => {
    let added = 0;
    let updated = 0;

    if (mode === 'replace') {
      const newMeds: Medicine[] = items.map((item, idx) => ({
        ...item,
        id: `med-${Date.now()}-${idx + 1}`
      }));
      setMedicines(newMeds);
      return { added: newMeds.length, updated: 0, total: newMeds.length };
    }

    if (mode === 'append') {
      const newMeds: Medicine[] = items.map((item, idx) => ({
        ...item,
        id: `med-${Date.now()}-${idx + 1}`
      }));
      setMedicines(prev => [...newMeds, ...prev]);
      return { added: newMeds.length, updated: 0, total: newMeds.length };
    }

    // Default 'merge': update existing if medicine name matches, otherwise add new
    setMedicines(prev => {
      const nextList = [...prev];
      items.forEach((item, idx) => {
        const existingIdx = nextList.findIndex(
          m => m.name.toLowerCase().trim() === item.name.toLowerCase().trim()
        );
        if (existingIdx >= 0) {
          updated++;
          const existing = nextList[existingIdx];
          nextList[existingIdx] = {
            ...existing,
            generic: item.generic || existing.generic,
            company: item.company || existing.company,
            rack: item.rack || existing.rack,
            batch: item.batch || existing.batch,
            expiry: item.expiry || existing.expiry,
            unitsPerStrip: item.unitsPerStrip || existing.unitsPerStrip,
            purchasePrice: item.purchasePrice > 0 ? item.purchasePrice : existing.purchasePrice,
            stripPrice: item.stripPrice > 0 ? item.stripPrice : existing.stripPrice,
            piecePrice: item.piecePrice > 0 ? item.piecePrice : existing.piecePrice,
            stockPieces: existing.stockPieces + (item.stockPieces || 0),
            lowStockThreshold: item.lowStockThreshold || existing.lowStockThreshold,
            category: item.category || existing.category
          };
        } else {
          added++;
          nextList.unshift({
            ...item,
            id: `med-${Date.now()}-${idx + 1}`
          });
        }
      });
      return nextList;
    });

    return { added, updated, total: added + updated };
  };

  const exportMedicinesCsv = () => {
    const csv = generateMedicinesCsv(medicines);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadBlobFile(csv, `MediExpences_Inventory_${dateStr}.csv`);
  };

  const exportSalesCsv = () => {
    const csv = generateSalesCsv(sales);
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadBlobFile(csv, `MediExpences_Sales_${dateStr}.csv`);
  };

  const downloadSampleCsv = () => {
    const csv = getSampleCsvContent();
    downloadBlobFile(csv, 'medicines_import_template.csv');
  };

  return (
    <PharmacyContext.Provider
      value={{
        medicines,
        cart,
        sales,
        debtors,
        expenses,
        settings,
        activeTab,
        setActiveTab,
        moreSubTab,
        setMoreSubTab,
        editingMedicine,
        setEditingMedicine,
        isAddMedModalOpen,
        setIsAddMedModalOpen,
        activeReceipt,
        setActiveReceipt,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        isCsvModalOpen,
        setIsCsvModalOpen,
        isMedexModalOpen,
        setIsMedexModalOpen,
        medexInitialQuery,
        setMedexInitialQuery,
        openMedexPriceChecker,
        closeMedexPriceChecker,
        addToCart,
        updateCartItemQty,
        removeFromCart,
        clearCart,
        checkoutSale,
        addMedicine,
        updateMedicine,
        deleteMedicine,
        bulkUpdateCompanyPrice,
        addExpense,
        deleteExpense,
        addPaymentToDebtor,
        addNewDebtor,
        toggleTheme,
        updateSettings,
        exportBackup,
        importBackup,
        resetAllData,
        importMedicinesList,
        exportMedicinesCsv,
        exportSalesCsv,
        downloadSampleCsv,
        exportDataJson: exportBackup,
        importDataJson: importBackup,
        resetToMockData: resetAllData,
        todaySalesTotal,
        todayExpensesTotal,
        todayProfitTotal,
        lowStockCount,
        expiringSoonCount,
        cartTotalCount,
        cartTotalPrice
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
};

export const usePharmacy = () => {
  const context = useContext(PharmacyContext);
  if (!context) {
    throw new Error('usePharmacy must be used within a PharmacyProvider');
  }
  return context;
};
