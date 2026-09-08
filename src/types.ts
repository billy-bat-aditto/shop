export type UnitsPerStrip = 1 | 4 | 8 | 10 | 15 | 20;

export type PaymentMethod = 'Cash' | 'bKash' | 'Card';

export interface Medicine {
  id: string;
  name: string;
  generic: string;
  company: string;
  batch: string;
  expiry: string; // YYYY-MM or MM/YYYY
  unitsPerStrip: UnitsPerStrip;
  purchasePrice: number; // per strip purchase cost
  stripPrice: number;    // strip MRP
  piecePrice: number;    // piece retail
  stockPieces: number;   // total pieces available
  lowStockThreshold: number; // in pieces
  rack: string;
  category: string;
  tags?: string[];
  isFastMoving?: boolean;
}

export interface CartItem {
  id: string; // unique line ID
  medicineId: string;
  name: string;
  generic: string;
  company: string;
  mode: 'strip' | 'piece';
  unitsPerStrip: number;
  unitPrice: number;
  quantity: number;
  discountType: '%' | '৳';
  discountVal: number;
  lineTotal: number;
}

export interface Sale {
  id: string;
  timestamp: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  subtotal: number;
  itemDiscountsTotal: number;
  billDiscountPercent: number;
  billDiscountAmount: number;
  grandTotal: number;
  status: 'Paid' | 'Due';
  paymentMethod: 'Cash' | 'bKash' | 'Card';
}

export interface DebtorTransaction {
  id: string;
  date: string;
  type: 'payment' | 'due_added';
  amount: number;
  description: string;
  invoiceId?: string;
  method?: string;
}

export interface CustomerDebtor {
  id: string;
  name: string;
  phone: string;
  dueBalance: number;
  lastPaidDate: string;
  history: DebtorTransaction[];
}

export type ExpenseCategory = 
  | 'Transport' 
  | 'Rent' 
  | 'Shop Rent'
  | 'Staff Salary' 
  | 'Electricity Bill' 
  | 'Utility Bill'
  | 'Staff Snacks & Tea'
  | 'Tea & Snacks'
  | 'Cleaning Supplies'
  | 'Cleaning & Misc'
  | 'Supplier Invoice'
  | 'Packaging' 
  | 'Other';

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  amount: number;
  category: ExpenseCategory;
  note: string;
  method: 'Cash' | 'bKash';
}

export interface PharmacySettings {
  pharmacyName: string;
  adminName: string;
  location: string;
  tradeLicense: string;
  vatBin: string;
  printerConnected: boolean;
  printerModel: string;
  theme: 'dark' | 'light';
  themeMode?: 'dark' | 'light';
  currency: string;
  monthlyBudget: number;
}
