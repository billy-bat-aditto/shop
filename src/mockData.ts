import { Medicine, CustomerDebtor, Expense, Sale, PharmacySettings } from './types';

export const INITIAL_MEDICINES: Medicine[] = [
  {
    id: 'med-1',
    name: 'Napa Extra',
    generic: 'Paracetamol 500mg + Caffeine 65mg',
    company: 'Beximco Pharmaceuticals Ltd.',
    batch: 'BAT-2024-889',
    expiry: '2026-11',
    unitsPerStrip: 10,
    purchasePrice: 90,
    stripPrice: 120,
    piecePrice: 12,
    stockPieces: 150,
    lowStockThreshold: 30,
    rack: 'Rack A-14',
    category: 'Tablet',
    tags: ['DGDA Approved', 'Store below 25°C'],
    isFastMoving: true,
  },
  {
    id: 'med-2',
    name: 'Ceevit 250mg',
    generic: 'Ascorbic Acid (Vitamin C)',
    company: 'Square Pharmaceuticals',
    batch: 'BAT-2024-312',
    expiry: '2026-08',
    unitsPerStrip: 10,
    purchasePrice: 18,
    stripPrice: 25,
    piecePrice: 2.5,
    stockPieces: 320,
    lowStockThreshold: 50,
    rack: 'Rack C-03',
    category: 'Tablet',
    tags: ['Vitamin Supplement'],
    isFastMoving: true,
  },
  {
    id: 'med-3',
    name: 'Ace Plus 500mg',
    generic: 'Paracetamol + Caffeine',
    company: 'Square Pharmaceuticals',
    batch: 'BAT-2024-104',
    expiry: '2026-09-26', // within 18-20 days relative to Oct
    unitsPerStrip: 10,
    purchasePrice: 26,
    stripPrice: 35,
    piecePrice: 3.5,
    stockPieces: 14,
    lowStockThreshold: 30,
    rack: 'Rack B1',
    category: 'Tablet',
    tags: ['DGDA Approved'],
    isFastMoving: true,
  },
  {
    id: 'med-4',
    name: 'Sergel 20mg',
    generic: 'Esomeprazole Magnesium',
    company: 'Healthcare Pharmaceuticals',
    batch: 'BAT-2024-554',
    expiry: '2025-10',
    unitsPerStrip: 10,
    purchasePrice: 70,
    stripPrice: 90,
    piecePrice: 9,
    stockPieces: 9,
    lowStockThreshold: 20,
    rack: 'Rack C4',
    category: 'Capsule',
    tags: ['Schedule H Drug'],
    isFastMoving: true,
  },
  {
    id: 'med-5',
    name: 'Azithromycin 500mg',
    generic: 'Azithromycin Dihydrate',
    company: 'Incepta Pharmaceuticals',
    batch: 'BAT-2024-918',
    expiry: '2026-01',
    unitsPerStrip: 10,
    purchasePrice: 280,
    stripPrice: 350,
    piecePrice: 35,
    stockPieces: 80,
    lowStockThreshold: 20,
    rack: 'Rack E2',
    category: 'Antibiotics',
    tags: ['Schedule H Drug', 'DGDA Approved'],
    isFastMoving: false,
  },
  {
    id: 'med-6',
    name: 'Maxpro 20mg',
    generic: 'Esomeprazole 20mg',
    company: 'Renata Limited',
    batch: 'BAT-2024-772',
    expiry: '2026-12',
    unitsPerStrip: 10,
    purchasePrice: 60,
    stripPrice: 80,
    piecePrice: 8,
    stockPieces: 210,
    lowStockThreshold: 40,
    rack: 'Rack B-08',
    category: 'Capsule',
    tags: ['Gastric Care'],
    isFastMoving: true,
  },
  {
    id: 'med-7',
    name: 'Fexo 120mg',
    generic: 'Fexofenadine HCl',
    company: 'Square Pharmaceuticals',
    batch: 'BAT-2024-420',
    expiry: '2027-03',
    unitsPerStrip: 10,
    purchasePrice: 100,
    stripPrice: 140,
    piecePrice: 14,
    stockPieces: 190,
    lowStockThreshold: 25,
    rack: 'Rack D-11',
    category: 'Tablet',
    tags: ['Antihistamine'],
    isFastMoving: true,
  },
  {
    id: 'med-8',
    name: 'Monas 10mg',
    generic: 'Montelukast Sodium',
    company: 'Acme Laboratories',
    batch: 'BAT-2024-630',
    expiry: '2026-07',
    unitsPerStrip: 15,
    purchasePrice: 200,
    stripPrice: 255,
    piecePrice: 17,
    stockPieces: 120,
    lowStockThreshold: 30,
    rack: 'Rack F-02',
    category: 'Tablet',
    tags: ['Respiratory'],
    isFastMoving: false,
  },
  {
    id: 'med-9',
    name: 'Alatrex 10mg',
    generic: 'Cetirizine Dihydrochloride',
    company: 'Square Pharmaceuticals',
    batch: 'BAT-2024-219',
    expiry: '2026-05',
    unitsPerStrip: 10,
    purchasePrice: 28,
    stripPrice: 38,
    piecePrice: 3.8,
    stockPieces: 160,
    lowStockThreshold: 30,
    rack: 'Rack A-05',
    category: 'Tablet',
    tags: ['Allergy Care'],
    isFastMoving: true,
  },
  {
    id: 'med-10',
    name: 'Tusca Syrup 100ml',
    generic: 'Dextromethorphan + Pseudoephedrine',
    company: 'Square Pharmaceuticals',
    batch: 'BAT-2024-118',
    expiry: '2026-04',
    unitsPerStrip: 1,
    purchasePrice: 75,
    stripPrice: 95,
    piecePrice: 95,
    stockPieces: 45,
    lowStockThreshold: 15,
    rack: 'Rack S-01',
    category: 'Syrups',
    tags: ['Cough Relief'],
    isFastMoving: false,
  }
];

export const INITIAL_DEBTORS: CustomerDebtor[] = [
  {
    id: 'cust-1',
    name: 'Rafiqul Khan',
    phone: '01712-XXXXXX',
    dueBalance: 3450,
    lastPaidDate: '21 Oct 2024',
    history: [
      {
        id: 'hist-1',
        date: '21 Oct 2024',
        type: 'payment',
        amount: 1000,
        description: 'Cash Payment',
        method: 'Cash'
      },
      {
        id: 'hist-2',
        date: '15 Oct 2024',
        type: 'due_added',
        amount: 2450,
        description: 'Sale #1012 (Chronic Prescription)',
        invoiceId: 'REC-1012'
      },
      {
        id: 'hist-3',
        date: '02 Oct 2024',
        type: 'payment',
        amount: 500,
        description: 'bKash Digital',
        method: 'bKash'
      }
    ]
  },
  {
    id: 'cust-2',
    name: 'Abul Hossain',
    phone: '01823-XXXXXX',
    dueBalance: 1800,
    lastPaidDate: 'Yesterday',
    history: [
      {
        id: 'hist-4',
        date: 'Yesterday',
        type: 'payment',
        amount: 600,
        description: 'Cash Payment',
        method: 'Cash'
      },
      {
        id: 'hist-5',
        date: '12 Oct 2024',
        type: 'due_added',
        amount: 2400,
        description: 'Sale #1008',
        invoiceId: 'REC-1008'
      }
    ]
  },
  {
    id: 'cust-3',
    name: 'Sharmin Sultana',
    phone: '01911-XXXXXX',
    dueBalance: 920,
    lastPaidDate: '12 Oct 2024',
    history: [
      {
        id: 'hist-6',
        date: '12 Oct 2024',
        type: 'due_added',
        amount: 920,
        description: 'Sale #1024',
        invoiceId: 'REC-1024'
      }
    ]
  },
  {
    id: 'cust-4',
    name: 'Tariqul Karim',
    phone: '01633-XXXXXX',
    dueBalance: 8150,
    lastPaidDate: '28 Sep 2024',
    history: [
      {
        id: 'hist-7',
        date: '28 Sep 2024',
        type: 'payment',
        amount: 2000,
        description: 'Cash Payment',
        method: 'Cash'
      },
      {
        id: 'hist-8',
        date: '10 Sep 2024',
        type: 'due_added',
        amount: 10150,
        description: 'Monthly Family Pack #990',
        invoiceId: 'REC-990'
      }
    ]
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    date: '2024-10-24',
    time: '10:30 AM',
    amount: 200,
    category: 'Transport',
    note: 'Medicine collection from Mitford',
    method: 'Cash'
  },
  {
    id: 'exp-2',
    date: '2024-10-24',
    time: '04:15 PM',
    amount: 300,
    category: 'Staff Snacks & Tea',
    note: 'Evening refreshment & snacks for shop staff',
    method: 'Cash'
  },
  {
    id: 'exp-3',
    date: '2024-10-23',
    time: '11:00 AM',
    amount: 1500,
    category: 'Electricity Bill',
    note: 'DESCO Bill prepaid recharge',
    method: 'bKash'
  },
  {
    id: 'exp-4',
    date: '2024-10-23',
    time: '03:40 PM',
    amount: 350,
    category: 'Cleaning Supplies',
    note: 'Floor cleaner & sanitizer refill',
    method: 'Cash'
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'REC-1042',
    timestamp: '24 Oct 2024, 04:15 PM',
    customerName: 'Walk-in Customer',
    customerPhone: '',
    items: [
      {
        id: 'item-1',
        medicineId: 'med-1',
        name: 'Napa Extra',
        generic: 'Paracetamol 500mg + Caffeine 65mg',
        company: 'Beximco Pharmaceuticals Ltd.',
        mode: 'strip',
        unitsPerStrip: 10,
        unitPrice: 120,
        quantity: 2,
        discountType: '৳',
        discountVal: 0,
        lineTotal: 240
      },
      {
        id: 'item-2',
        medicineId: 'med-6',
        name: 'Maxpro 20mg',
        generic: 'Esomeprazole 20mg',
        company: 'Renata Limited',
        mode: 'piece',
        unitsPerStrip: 10,
        unitPrice: 8,
        quantity: 5,
        discountType: '৳',
        discountVal: 0,
        lineTotal: 40
      },
      {
        id: 'item-3',
        medicineId: 'med-7',
        name: 'Fexo 120mg',
        generic: 'Fexofenadine HCl',
        company: 'Square Pharmaceuticals',
        mode: 'strip',
        unitsPerStrip: 10,
        unitPrice: 140,
        quantity: 2,
        discountType: '৳',
        discountVal: 40,
        lineTotal: 240
      }
    ],
    subtotal: 520,
    itemDiscountsTotal: 20,
    billDiscountPercent: 5,
    billDiscountAmount: 25,
    grandTotal: 475,
    status: 'Paid',
    paymentMethod: 'Cash'
  },
  {
    id: 'REC-1041',
    timestamp: '24 Oct 2024, 02:20 PM',
    customerName: 'Kazi Farhan',
    customerPhone: '01799-XXXXXX',
    items: [
      {
        id: 'item-4',
        medicineId: 'med-2',
        name: 'Ceevit 250mg',
        generic: 'Ascorbic Acid',
        company: 'Square Pharmaceuticals',
        mode: 'strip',
        unitsPerStrip: 10,
        unitPrice: 25,
        quantity: 4,
        discountType: '%',
        discountVal: 0,
        lineTotal: 100
      },
      {
        id: 'item-5',
        medicineId: 'med-5',
        name: 'Azithromycin 500mg',
        generic: 'Azithromycin Dihydrate',
        company: 'Incepta Pharmaceuticals',
        mode: 'strip',
        unitsPerStrip: 10,
        unitPrice: 350,
        quantity: 1,
        discountType: '%',
        discountVal: 5,
        lineTotal: 332.5
      }
    ],
    subtotal: 450,
    itemDiscountsTotal: 17.5,
    billDiscountPercent: 0,
    billDiscountAmount: 0,
    grandTotal: 432.5,
    status: 'Paid',
    paymentMethod: 'Cash'
  },
  {
    id: 'REC-1040',
    timestamp: '24 Oct 2024, 11:05 AM',
    customerName: 'Salma Begum',
    customerPhone: '01812-XXXXXX',
    items: [
      {
        id: 'item-6',
        medicineId: 'med-1',
        name: 'Napa Extra',
        generic: 'Paracetamol 500mg',
        company: 'Beximco',
        mode: 'piece',
        unitsPerStrip: 10,
        unitPrice: 12,
        quantity: 10,
        discountType: '৳',
        discountVal: 0,
        lineTotal: 120
      },
      {
        id: 'item-7',
        medicineId: 'med-4',
        name: 'Sergel 20mg',
        generic: 'Esomeprazole',
        company: 'Healthcare Pharma',
        mode: 'strip',
        unitsPerStrip: 10,
        unitPrice: 90,
        quantity: 2,
        discountType: '৳',
        discountVal: 0,
        lineTotal: 180
      }
    ],
    subtotal: 300,
    itemDiscountsTotal: 0,
    billDiscountPercent: 0,
    billDiscountAmount: 0,
    grandTotal: 300,
    status: 'Paid',
    paymentMethod: 'bKash'
  }
];

export const INITIAL_SETTINGS: PharmacySettings = {
  pharmacyName: 'MediExpences Pharmacy',
  adminName: 'Aditto',
  location: 'Dhaka, Bangladesh',
  tradeLicense: 'TRAD/DHK/99410',
  vatBin: '002849182-0101',
  printerConnected: true,
  printerModel: 'RPP02N Bluetooth (58/80mm)',
  theme: 'dark',
  currency: '৳',
  monthlyBudget: 15000
};
