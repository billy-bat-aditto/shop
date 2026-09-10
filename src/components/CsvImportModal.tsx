import React, { useState, useRef } from 'react';
import { usePharmacy } from '../context/PharmacyContext';
import {
  parseCsvText,
  mapRowsToMedicines,
  ParsedMedicineRow,
  getSampleCsvContent,
  downloadBlobFile
} from '../utils/csvUtils';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (count: number) => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { medicines, importMedicinesList } = usePharmacy();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [csvRawText, setCsvRawText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showPasteArea, setShowPasteArea] = useState<boolean>(false);
  const [importMode, setImportMode] = useState<'merge' | 'append' | 'replace'>('merge');
  const [filterPreview, setFilterPreview] = useState<'all' | 'new' | 'update'>('all');
  const [searchPreview, setSearchPreview] = useState<string>('');

  // Parsed state
  const [parsedItems, setParsedItems] = useState<ParsedMedicineRow[]>([]);
  const [totalExisting, setTotalExisting] = useState<number>(0);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProcessCsv = (text: string, name = 'uploaded_file.csv') => {
    setCsvRawText(text);
    setFileName(name);
    setImportSuccessMsg(null);

    const { rows, errors: pErrors } = parseCsvText(text);
    if (pErrors.length > 0 && rows.length === 0) {
      setParseErrors(pErrors);
      setParsedItems([]);
      return;
    }

    const { items, totalExisting: existCount, generalErrors } = mapRowsToMedicines(rows, medicines);
    setParsedItems(items);
    setTotalExisting(existCount);
    setParseErrors([...pErrors, ...generalErrors]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleProcessCsv(content, file.name);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleProcessCsv(content, file.name);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleLoadDemoData = () => {
    const sample = getSampleCsvContent();
    handleProcessCsv(sample, 'demo_sample_medicines.csv');
  };

  const handleDownloadTemplate = () => {
    const sample = getSampleCsvContent();
    downloadBlobFile(sample, 'medicines_import_template.csv');
  };

  const handleExecuteImport = () => {
    if (parsedItems.length === 0) return;

    setIsProcessing(true);
    setTimeout(() => {
      const itemsToImport = parsedItems.map(p => p.medicine);
      const res = importMedicinesList(itemsToImport, importMode);

      setIsProcessing(false);
      const msg = `Successfully imported ${res.total} medicines (${res.added} added, ${res.updated} updated)!`;
      setImportSuccessMsg(msg);
      if (onSuccess) {
        onSuccess(res.total);
      }

      setTimeout(() => {
        handleReset();
        onClose();
      }, 1600);
    }, 400);
  };

  const handleReset = () => {
    setCsvRawText('');
    setFileName('');
    setParsedItems([]);
    setTotalExisting(0);
    setParseErrors([]);
    setImportSuccessMsg(null);
    setShowPasteArea(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredPreviewItems = parsedItems.filter(item => {
    if (filterPreview === 'new' && item.isExisting) return false;
    if (filterPreview === 'update' && !item.isExisting) return false;
    if (searchPreview) {
      const q = searchPreview.toLowerCase();
      return (
        item.medicine.name.toLowerCase().includes(q) ||
        item.medicine.generic.toLowerCase().includes(q) ||
        item.medicine.company.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl bg-[#120d20] border border-white/15 shadow-2xl shadow-purple-950/60 overflow-hidden text-white">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#6d4aff]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#4edea3]/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6d4aff] to-[#a78bff] flex items-center justify-center text-white shadow-lg shadow-[#6d4aff]/30">
              <span className="material-symbols-outlined text-[22px]">upload_file</span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-white tracking-tight flex items-center gap-2">
                <span>Import Medicines (CSV)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6d4aff]/30 text-[#d0bcff] font-semibold border border-[#6d4aff]/40">
                  Excel / CSV
                </span>
              </h3>
              <p className="text-xs text-[#938ea2]">
                Batch upload catalogs, update pricing, racks & stock pieces
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="relative z-10 flex-1 overflow-y-auto p-5 space-y-4">
          {importSuccessMsg ? (
            <div className="p-5 rounded-2xl bg-green-950/80 border border-green-500/50 flex flex-col items-center justify-center text-center space-y-2 py-8 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-300 flex items-center justify-center">
                <span className="material-symbols-outlined text-[28px]">check_circle</span>
              </div>
              <h4 className="font-bold text-base text-white">Import Complete!</h4>
              <p className="text-xs text-green-200">{importSuccessMsg}</p>
            </div>
          ) : (
            <>
              {/* Quick Actions Bar: Template & Demo Load */}
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-white/[0.05] border border-white/10">
                <div className="flex items-center gap-1.5 text-xs text-[#c9bfff]">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  <span>Need the standard column format?</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">download</span>
                    <span>Template</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadDemoData}
                    className="px-2.5 py-1 rounded-xl bg-[#6d4aff]/30 hover:bg-[#6d4aff]/45 text-[#d0bcff] hover:text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer border border-[#6d4aff]/30"
                  >
                    <span className="material-symbols-outlined text-[15px]">play_circle</span>
                    <span>Load Demo Data</span>
                  </button>
                </div>
              </div>

              {/* Upload Drop Zone */}
              {!parsedItems.length ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
                    isDragging
                      ? 'border-[#6d4aff] bg-[#6d4aff]/15 scale-[0.99]'
                      : 'border-white/20 hover:border-white/40 bg-white/[0.03] hover:bg-white/[0.06]'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv,text/plain"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-[#d0bcff] shadow-inner">
                    <span className="material-symbols-outlined text-[32px]">cloud_upload</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      Drop your CSV file here, or <span className="text-[#a78bff] underline">browse</span>
                    </p>
                    <p className="text-[11px] text-[#938ea2] mt-0.5">
                      Supports UTF-8 CSV with Brand Name, Generic, Strip MRP, Stock Pieces & Racks
                    </p>
                  </div>
                </div>
              ) : (
                /* File Selected Banner */
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#6d4aff]/15 border border-[#6d4aff]/30">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="material-symbols-outlined text-[22px] text-[#a78bff]">description</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{fileName || 'CSV File Loaded'}</p>
                      <p className="text-[11px] text-[#c9bfff]">
                        {parsedItems.length} rows parsed • {parsedItems.length - totalExisting} new items • {totalExisting} existing
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white/80 hover:text-white transition-all cursor-pointer"
                  >
                    Change File
                  </button>
                </div>
              )}

              {/* Toggle manual CSV text paste */}
              {!parsedItems.length && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowPasteArea(!showPasteArea)}
                    className="text-xs text-[#a78bff] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {showPasteArea ? 'expand_less' : 'expand_more'}
                    </span>
                    <span>{showPasteArea ? 'Hide manual text input' : 'Or paste raw CSV text directly'}</span>
                  </button>

                  {showPasteArea && (
                    <div className="mt-2.5 space-y-2 animate-in fade-in duration-200">
                      <textarea
                        value={csvRawText}
                        onChange={(e) => setCsvRawText(e.target.value)}
                        placeholder="Paste CSV text here with headers (Name, Generic, Company, StripPrice, StockPieces...)"
                        rows={5}
                        className="w-full p-3 rounded-xl bg-black/50 border border-white/15 text-white text-xs font-mono outline-none focus:border-[#6d4aff]"
                      />
                      <button
                        type="button"
                        onClick={() => handleProcessCsv(csvRawText, 'pasted_text.csv')}
                        disabled={!csvRawText.trim()}
                        className="px-4 py-2 rounded-xl bg-[#6d4aff] hover:bg-[#5b3adb] disabled:opacity-40 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        Parse CSV Text
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Parsing Errors / Warnings */}
              {parseErrors.length > 0 && (
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-red-300">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    <span>Notice during parsing:</span>
                  </div>
                  {parseErrors.map((err, idx) => (
                    <p key={idx} className="text-[11px] pl-5">• {err}</p>
                  ))}
                </div>
              )}

              {/* Preview & Import Options Section */}
              {parsedItems.length > 0 && (
                <div className="space-y-3 pt-1 animate-in fade-in duration-200">
                  {/* Strategy Selection */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                    <label className="text-[11px] uppercase font-bold text-[#c9bfff] tracking-wider block">
                      Import Strategy
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setImportMode('merge')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          importMode === 'merge'
                            ? 'bg-[#6d4aff]/30 border-[#6d4aff] text-white shadow-md'
                            : 'bg-white/[0.02] border-white/10 text-[#938ea2] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <span className="material-symbols-outlined text-[16px] text-[#4edea3]">merge</span>
                          <span>Merge & Update</span>
                        </div>
                        <p className="text-[10px] mt-1 opacity-80">
                          Updates price/stock if item exists; adds new items.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setImportMode('append')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          importMode === 'append'
                            ? 'bg-[#6d4aff]/30 border-[#6d4aff] text-white shadow-md'
                            : 'bg-white/[0.02] border-white/10 text-[#938ea2] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <span className="material-symbols-outlined text-[16px] text-[#a78bff]">add_box</span>
                          <span>Append All</span>
                        </div>
                        <p className="text-[10px] mt-1 opacity-80">
                          Adds all rows as new products regardless of duplicates.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setImportMode('replace')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          importMode === 'replace'
                            ? 'bg-red-500/20 border-red-500 text-white shadow-md'
                            : 'bg-white/[0.02] border-white/10 text-[#938ea2] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs text-red-300">
                          <span className="material-symbols-outlined text-[16px]">sync_problem</span>
                          <span>Replace All</span>
                        </div>
                        <p className="text-[10px] mt-1 opacity-80">
                          Clears existing formulary and loads only this CSV.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Filter & Search preview */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1 bg-white/[0.06] p-1 rounded-xl border border-white/10">
                      <button
                        type="button"
                        onClick={() => setFilterPreview('all')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          filterPreview === 'all'
                            ? 'bg-[#6d4aff] text-white shadow'
                            : 'text-[#938ea2] hover:text-white'
                        }`}
                      >
                        All ({parsedItems.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterPreview('new')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          filterPreview === 'new'
                            ? 'bg-[#007d55] text-white shadow'
                            : 'text-[#938ea2] hover:text-white'
                        }`}
                      >
                        New ({parsedItems.length - totalExisting})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterPreview('update')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          filterPreview === 'update'
                            ? 'bg-amber-600 text-white shadow'
                            : 'text-[#938ea2] hover:text-white'
                        }`}
                      >
                        Update Existing ({totalExisting})
                      </button>
                    </div>

                    <div className="relative flex-1 max-w-[170px]">
                      <input
                        type="text"
                        value={searchPreview}
                        onChange={(e) => setSearchPreview(e.target.value)}
                        placeholder="Filter rows..."
                        className="w-full h-8 pl-7 pr-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs outline-none"
                      />
                      <span className="material-symbols-outlined text-[14px] text-[#938ea2] absolute left-2 top-2">
                        search
                      </span>
                    </div>
                  </div>

                  {/* Preview Items Table */}
                  <div className="max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-black/40 text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-white/[0.06] sticky top-0 z-10 text-[#938ea2] uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="py-2 px-3">Status</th>
                          <th className="py-2 px-3">Medicine & Generic</th>
                          <th className="py-2 px-3">Company</th>
                          <th className="py-2 px-3">Strip MRP</th>
                          <th className="py-2 px-3">Stock Pcs</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredPreviewItems.map((item, i) => (
                          <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                            <td className="py-2 px-3 whitespace-nowrap">
                              {item.isExisting ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold text-[10px]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                  Update
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#007d55]/30 text-green-300 font-semibold text-[10px]">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]" />
                                  New
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3">
                              <div className="font-bold text-white leading-tight">{item.medicine.name}</div>
                              <div className="text-[10px] text-[#938ea2]">{item.medicine.generic}</div>
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap text-[#c9bfff]">
                              {item.medicine.company}
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap font-semibold text-white">
                              ৳{item.medicine.stripPrice.toFixed(2)}
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap font-bold text-[#4edea3]">
                              {item.medicine.stockPieces} pcs
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="relative z-10 flex items-center justify-between px-5 py-4 border-t border-white/10 bg-black/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {parsedItems.length > 0 && !importSuccessMsg && (
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-[#938ea2] hover:text-white text-xs font-semibold transition-all cursor-pointer"
              >
                Clear
              </button>
            )}

            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={parsedItems.length === 0 || isProcessing || Boolean(importSuccessMsg)}
              className="h-11 px-6 rounded-full bg-gradient-to-r from-[#6d4aff] to-[#a78bff] hover:from-[#5b3adb] hover:to-[#9370ff] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#6d4aff]/30 active:scale-95 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">cloud_done</span>
                  <span>
                    Import {parsedItems.length > 0 ? `${parsedItems.length} Medicines` : 'CSV'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
