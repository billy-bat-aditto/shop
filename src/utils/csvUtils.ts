import { Medicine, Sale, UnitsPerStrip } from '../types';

/**
 * Escapes a cell value for standard CSV (RFC 4180)
 */
export function escapeCsvCell(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Robust RFC 4180 compliant CSV parser that handles quotes, escaped quotes,
 * commas inside quotes, and both CRLF and LF line breaks.
 */
export function parseCsvText(csvText: string): { headers: string[]; rows: Record<string, string>[]; errors: string[] } {
  const errors: string[] = [];
  if (!csvText || !csvText.trim()) {
    return { headers: [], rows: [], errors: ['CSV content is empty.'] };
  }

  const rawRows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;
  let i = 0;
  const len = csvText.length;

  while (i < len) {
    const char = csvText[i];
    const nextChar = i + 1 < len ? csvText[i + 1] : '';

    if (insideQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote
          currentCell += '"';
          i += 2;
          continue;
        } else {
          // Closing quote
          insideQuotes = false;
          i++;
          continue;
        }
      } else {
        currentCell += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
        i++;
        continue;
      } else if (char === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
        i++;
        continue;
      } else if (char === '\r' && nextChar === '\n') {
        currentRow.push(currentCell.trim());
        currentCell = '';
        if (currentRow.some(c => c.length > 0)) {
          rawRows.push(currentRow);
        }
        currentRow = [];
        i += 2;
        continue;
      } else if (char === '\n' || char === '\r') {
        currentRow.push(currentCell.trim());
        currentCell = '';
        if (currentRow.some(c => c.length > 0)) {
          rawRows.push(currentRow);
        }
        currentRow = [];
        i++;
        continue;
      } else {
        currentCell += char;
        i++;
        continue;
      }
    }
  }

  // Finalize last cell & row if exists
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(c => c.length > 0)) {
      rawRows.push(currentRow);
    }
  }

  if (rawRows.length === 0) {
    return { headers: [], rows: [], errors: ['No data rows found in CSV.'] };
  }

  const headers = rawRows[0].map(h => h.trim());
  const rows: Record<string, string>[] = [];

  for (let r = 1; r < rawRows.length; r++) {
    const rowCells = rawRows[r];
    const rowObj: Record<string, string> = {};
    headers.forEach((hdr, colIndex) => {
      rowObj[hdr] = rowCells[colIndex] !== undefined ? rowCells[colIndex].trim() : '';
    });
    rows.push(rowObj);
  }

  return { headers, rows, errors };
}

/**
 * Normalizes header string for fuzzy matching against expected fields
 */
function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Map recognized column variations to standard Medicine fields
 */
export function detectColumnMapping(headers: string[]): Record<keyof Omit<Medicine, 'id' | 'tags' | 'isFastMoving'>, string | null> {
  const map: Record<keyof Omit<Medicine, 'id' | 'tags' | 'isFastMoving'>, string | null> = {
    name: null,
    generic: null,
    company: null,
    rack: null,
    batch: null,
    expiry: null,
    unitsPerStrip: null,
    purchasePrice: null,
    stripPrice: null,
    piecePrice: null,
    stockPieces: null,
    lowStockThreshold: null,
    category: null,
  };

  const aliases: Record<keyof typeof map, string[]> = {
    name: ['name', 'medicinename', 'brand', 'brandname', 'item', 'itemname', 'product', 'productname'],
    generic: ['generic', 'genericname', 'composition', 'molecule', 'formula'],
    company: ['company', 'manufacturer', 'mfg', 'brandcompany', 'pharma', 'companyname', 'producer'],
    rack: ['rack', 'shelf', 'location', 'bin', 'rackno', 'cabinet', 'drawer'],
    batch: ['batch', 'batchno', 'batchnumber', 'lot', 'lotno'],
    expiry: ['expiry', 'exp', 'expdate', 'expirydate', 'validthru', 'expiration'],
    unitsPerStrip: ['unitsperstrip', 'packsize', 'pack', 'stripsize', 'boxsize', 'units', 'strippack'],
    purchasePrice: ['purchaseprice', 'cost', 'costprice', 'buyprice', 'tp', 'tradecost'],
    stripPrice: ['stripprice', 'mrp', 'stripmrp', 'retailprice', 'price', 'saleprice'],
    piecePrice: ['pieceprice', 'unitprice', 'piecemrp', 'perpiece', 'piececost'],
    stockPieces: ['stockpieces', 'stock', 'pieces', 'qty', 'quantity', 'inventory', 'currentstock', 'balance'],
    lowStockThreshold: ['lowstockthreshold', 'minstock', 'threshold', 'alertlevel', 'reorderlevel', 'minqty'],
    category: ['category', 'type', 'form', 'dosageform', 'drugclass'],
  };

  for (const field of Object.keys(map) as (keyof typeof map)[]) {
    const targetAliases = aliases[field];
    for (const h of headers) {
      const norm = normalizeHeader(h);
      if (targetAliases.includes(norm)) {
        map[field] = h;
        break;
      }
    }
  }

  return map;
}

/**
 * Coerces units per strip into allowed enum: 1 | 4 | 8 | 10 | 15 | 20
 */
export function coerceUnitsPerStrip(val: number): UnitsPerStrip {
  if (val <= 1) return 1;
  if (val <= 4) return 4;
  if (val <= 8) return 8;
  if (val <= 12) return 10;
  if (val <= 16) return 15;
  return 20;
}

export interface ParsedMedicineRow {
  rowNumber: number;
  medicine: Omit<Medicine, 'id'>;
  isExisting: boolean;
  existingId?: string;
  originalName: string;
  hasWarnings: boolean;
  warnings: string[];
}

/**
 * Maps raw parsed CSV records into validated Medicine objects
 */
export function mapRowsToMedicines(
  rows: Record<string, string>[],
  existingMedicines: Medicine[]
): {
  items: ParsedMedicineRow[];
  totalValid: number;
  totalExisting: number;
  generalErrors: string[];
} {
  const generalErrors: string[] = [];
  if (rows.length === 0) {
    return { items: [], totalValid: 0, totalExisting: 0, generalErrors: ['No rows to parse.'] };
  }

  const headers = Object.keys(rows[0]);
  const columnMap = detectColumnMapping(headers);

  // Must at least detect 'name'
  if (!columnMap.name) {
    generalErrors.push('Missing required column: "Name" or "Medicine Name" could not be detected.');
    return { items: [], totalValid: 0, totalExisting: 0, generalErrors };
  }

  const items: ParsedMedicineRow[] = [];
  let totalExisting = 0;

  rows.forEach((row, idx) => {
    const rowNumber = idx + 2; // +1 for 0-index, +1 for header line
    const warnings: string[] = [];

    const rawName = (columnMap.name ? row[columnMap.name] : '').trim();
    if (!rawName) {
      // Empty row or blank name
      return;
    }

    const rawGeneric = (columnMap.generic ? row[columnMap.generic] : '').trim() || 'General Formulary';
    const rawCompany = (columnMap.company ? row[columnMap.company] : '').trim() || 'Standard Pharma';
    const rawRack = (columnMap.rack ? row[columnMap.rack] : '').trim() || 'A-01';
    const rawBatch = (columnMap.batch ? row[columnMap.batch] : '').trim() || `BX-${Math.floor(100 + Math.random() * 899)}`;
    let rawExpiry = (columnMap.expiry ? row[columnMap.expiry] : '').trim();

    if (!rawExpiry) {
      rawExpiry = '2027-12';
      warnings.push('Expiry missing; defaulted to 2027-12');
    }

    // Units per strip
    const parsedUnits = parseFloat(columnMap.unitsPerStrip ? row[columnMap.unitsPerStrip] : '10') || 10;
    const unitsPerStrip = coerceUnitsPerStrip(parsedUnits);

    // Strip Price (MRP)
    const rawStripPrice = parseFloat(columnMap.stripPrice ? row[columnMap.stripPrice] : '0') || 0;
    let stripPrice = rawStripPrice > 0 ? Math.round(rawStripPrice * 10) / 10 : 30;
    if (rawStripPrice <= 0) {
      warnings.push('Strip MRP was 0 or invalid; defaulted to ৳30.00');
    }

    // Piece Price
    const rawPiecePrice = parseFloat(columnMap.piecePrice ? row[columnMap.piecePrice] : '0') || 0;
    let piecePrice = rawPiecePrice > 0 ? Math.round(rawPiecePrice * 10) / 10 : 0;
    if (piecePrice <= 0) {
      piecePrice = Math.max(1, Math.round((stripPrice / unitsPerStrip) * 1.25 * 10) / 10);
    }

    // Purchase Price
    const rawPurchasePrice = parseFloat(columnMap.purchasePrice ? row[columnMap.purchasePrice] : '0') || 0;
    let purchasePrice = rawPurchasePrice > 0 ? Math.round(rawPurchasePrice * 10) / 10 : 0;
    if (purchasePrice <= 0) {
      purchasePrice = Math.round(stripPrice * 0.82 * 10) / 10;
    }

    // Stock Pieces
    const rawStock = parseInt(columnMap.stockPieces ? row[columnMap.stockPieces] : '100', 10);
    const stockPieces = isNaN(rawStock) ? 100 : Math.max(0, rawStock);

    // Low stock threshold
    const rawThreshold = parseInt(columnMap.lowStockThreshold ? row[columnMap.lowStockThreshold] : '30', 10);
    const lowStockThreshold = isNaN(rawThreshold) ? 30 : Math.max(5, rawThreshold);

    // Category
    const rawCategory = (columnMap.category ? row[columnMap.category] : '').trim() || 'Tablet';

    // Check if name matches an existing medicine
    const existing = existingMedicines.find(
      m => m.name.toLowerCase().trim() === rawName.toLowerCase().trim()
    );

    if (existing) {
      totalExisting++;
    }

    items.push({
      rowNumber,
      originalName: rawName,
      isExisting: Boolean(existing),
      existingId: existing?.id,
      hasWarnings: warnings.length > 0,
      warnings,
      medicine: {
        name: rawName,
        generic: rawGeneric,
        company: rawCompany,
        rack: rawRack,
        batch: rawBatch,
        expiry: rawExpiry,
        unitsPerStrip,
        purchasePrice,
        stripPrice,
        piecePrice,
        stockPieces,
        lowStockThreshold,
        category: rawCategory,
        tags: [rawCategory, rawRack]
      }
    });
  });

  return {
    items,
    totalValid: items.length,
    totalExisting,
    generalErrors
  };
}

/**
 * Generates an exportable CSV string of all current medicines
 */
export function generateMedicinesCsv(medicines: Medicine[]): string {
  const headers = [
    'Name',
    'Generic',
    'Company',
    'Category',
    'Rack',
    'Batch',
    'Expiry',
    'UnitsPerStrip',
    'PurchasePrice',
    'StripPrice',
    'PiecePrice',
    'StockPieces',
    'LowStockThreshold'
  ];

  const rows = medicines.map(m => [
    escapeCsvCell(m.name),
    escapeCsvCell(m.generic),
    escapeCsvCell(m.company),
    escapeCsvCell(m.category),
    escapeCsvCell(m.rack),
    escapeCsvCell(m.batch),
    escapeCsvCell(m.expiry),
    m.unitsPerStrip,
    m.purchasePrice.toFixed(2),
    m.stripPrice.toFixed(2),
    m.piecePrice.toFixed(2),
    m.stockPieces,
    m.lowStockThreshold
  ].join(','));

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Generates an exportable CSV string of sales history
 */
export function generateSalesCsv(sales: Sale[]): string {
  const headers = [
    'Receipt ID',
    'Date & Time',
    'Customer Name',
    'Customer Phone',
    'Items Summary',
    'Subtotal',
    'Discount Amount',
    'Grand Total',
    'Payment Status',
    'Payment Method'
  ];

  const rows = sales.map(s => {
    const itemsSummary = s.items.map(i => `${i.name} (${i.quantity} ${i.mode})`).join('; ');
    return [
      escapeCsvCell(s.id),
      escapeCsvCell(s.timestamp),
      escapeCsvCell(s.customerName),
      escapeCsvCell(s.customerPhone),
      escapeCsvCell(itemsSummary),
      s.subtotal.toFixed(2),
      s.billDiscountAmount.toFixed(2),
      s.grandTotal.toFixed(2),
      escapeCsvCell(s.status),
      escapeCsvCell(s.paymentMethod)
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Standard ready-to-use CSV template with sample Bangladesh pharmacy medicines
 */
export function getSampleCsvContent(): string {
  return [
    'Name,Generic,Company,Category,Rack,Batch,Expiry,UnitsPerStrip,PurchasePrice,StripPrice,PiecePrice,StockPieces,LowStockThreshold',
    'Napa Extra 500mg,Paracetamol + Caffeine,Beximco Pharma,Tablet,A-02,BX-994,2027-06,10,24.00,30.00,3.00,450,50',
    'Seclo 20mg,Omeprazole,Square Pharmaceuticals,Capsule,B-01,SQ-412,2026-11,10,48.00,60.00,6.00,280,30',
    'Ace Plus 500mg,Paracetamol + Caffeine,Square Pharmaceuticals,Tablet,A-03,SQ-881,2027-03,10,25.00,32.00,3.20,320,40',
    'Monas 10mg,Montelukast Sodium,Acme Laboratories,Tablet,C-04,AC-109,2026-09,10,120.00,160.00,16.00,140,20',
    'Tofen Syrup 100ml,Ketotifen Fumarate,Beximco Pharma,Syrups,D-01,BX-221,2027-01,1,65.00,80.00,80.00,45,10',
    'Ceevit 250mg Chewable,Vitamin C (Ascorbic Acid),Square Pharmaceuticals,Tablet,A-05,SQ-302,2027-08,10,18.00,22.00,2.20,500,60',
    'Fexo 120mg,Fexofenadine HCl,Square Pharmaceuticals,Tablet,B-03,SQ-515,2026-12,10,75.00,95.00,9.50,210,25',
    'Azithrocin 500mg,Azithromycin,Beximco Pharma,Antibiotics,E-02,BX-711,2026-10,4,115.00,140.00,35.00,160,20',
    'Neotack 150mg,Ranitidine,Square Pharmaceuticals,Tablet,B-05,SQ-120,2027-04,10,28.00,35.00,3.50,180,30'
  ].join('\r\n');
}

/**
 * Triggers a browser download for a text/CSV blob
 */
export function downloadBlobFile(content: string, filename: string, mimeType = 'text/csv;charset=utf-8;'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
