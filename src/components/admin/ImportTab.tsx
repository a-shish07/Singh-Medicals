import { useState, useRef } from 'react';
import type React from 'react';
import { useApp } from '../../context';
import { importInventoryCsv } from '../../lib/api';

export default function ImportTab() {
  const { adminToken, addToast, refreshAdminData } = useApp();

  const [phase, setPhase] = useState<'idle' | 'dragging' | 'parsing' | 'preview' | 'success'>('idle');
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFileSize, setSelectedFileSize] = useState('');
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  // New inventory CSV: SKU, Batch Number, PTR and GST are generated/calculated by the system.
  const PREVIEW_HEADERS = [
    'Product Name',
    'Composition',
    'Company',
    'Category',
    'Medicine Type',
    'Product Type',
    'Pack Size',
    'Quantity',
    'MRP',
    'Discount Type',
    'Discount %',
    'Offer Buy Quantity',
    'Offer Free Quantity',
    'Expiry Date',
    'Barcode',
    'Prescription Required',
    'Country of Origin',
    'Image',
    'Description',
  ];

  const SAMPLE_ROWS = [
    ['Augmentin 625 Duo', 'Amoxicillin 500mg + Clavulanic Acid 125mg', 'GSK', 'Antibiotics', 'Tablet', 'Allopathic', '10x6', '100', '250', 'DISCOUNT_ON_PTR', '10', '0', '0', '2027-12-31', '', 'false', 'India', '', 'Antibiotic tablets'],
    ['Paracetamol 500mg', 'Paracetamol 500mg', 'Sun Pharma', 'Analgesics', 'Tablet', 'Allopathic', '10x10', '500', '100', 'NONE', '0', '0', '0', '2028-06-30', '', 'false', 'India', '', 'Paracetamol 500mg tablets'],
    ['Pantoprazole 40mg', 'Pantoprazole 40mg', 'Abbott', 'Gastro', 'Tablet', 'Allopathic', '10x10', '350', '180', 'SAME_PRODUCT_BONUS_AND_DISCOUNT', '5', '10', '2', '2028-03-31', '', 'false', 'India', '', 'Buy 10 get 2 free'],
  ];

  const ALLOWED_DISCOUNT_TYPES = [
    'NONE',
    'DISCOUNT_ON_PTR',
    'SAME_PRODUCT_BONUS',
    'DIFFERENT_PRODUCT_BONUS',
    'SAME_PRODUCT_BONUS_AND_DISCOUNT',
    'DIFFERENT_PRODUCT_BONUS_AND_DISCOUNT',
  ];

  const parseCSV = (text: string): string[][] => {
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(cell.trim());
        cell = '';
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && next === '\n') i += 1;
        row.push(cell.trim());
        cell = '';
        if (row.some(value => value !== '')) rows.push(row);
        row = [];
      } else {
        cell += char;
      }
    }

    if (cell !== '' || row.length > 0) {
      row.push(cell.trim());
      if (row.some(value => value !== '')) rows.push(row);
    }

    return rows;
  };

  const validateCSV = (rows: string[][]): { data: string[][]; errors: string[] } => {
    if (!rows.length) return { data: [], errors: ['The CSV file is empty.'] };

    const headers = rows[0].map(value => value.replace(/^\uFEFF/, '').trim());
    const errors: string[] = [];

    const missingHeaders = PREVIEW_HEADERS.filter(header => !headers.includes(header));
    const extraHeaders = headers.filter(header => header && !PREVIEW_HEADERS.includes(header));

    if (missingHeaders.length) errors.push(`Missing columns: ${missingHeaders.join(', ')}`);
    if (extraHeaders.length) errors.push(`Unknown columns: ${extraHeaders.join(', ')}`);
    if (headers.length !== PREVIEW_HEADERS.length) {
      errors.push(`Expected exactly ${PREVIEW_HEADERS.length} columns in the Inventory CSV.`);
    }
    if (errors.length) return { data: [], errors };

    const indexes = PREVIEW_HEADERS.map(header => headers.indexOf(header));
    const data: string[][] = [];

    rows.slice(1).forEach((sourceRow, rowIndex) => {
      const csvRowNumber = rowIndex + 2;
      const row = indexes.map(index => (sourceRow[index] ?? '').trim());
      const rowErrors: string[] = [];

      const requiredIndexes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 13];
      requiredIndexes.forEach(index => {
        if (!row[index]) rowErrors.push(`${PREVIEW_HEADERS[index]} is required`);
      });

      const numericFields = [
        { index: 7, label: 'Quantity', integer: true },
        { index: 8, label: 'MRP', integer: false },
        { index: 10, label: 'Discount %', integer: false, optional: true },
        { index: 11, label: 'Offer Buy Quantity', integer: true, optional: true },
        { index: 12, label: 'Offer Free Quantity', integer: true, optional: true },
      ];

      numericFields.forEach(field => {
        if (field.optional && !row[field.index]) return;
        const value = Number(row[field.index]);
        if (!Number.isFinite(value) || value < 0) {
          rowErrors.push(`${field.label} must be a valid non-negative number`);
        } else if (field.integer && !Number.isInteger(value)) {
          rowErrors.push(`${field.label} must be a whole number`);
        }
      });

      const discount = row[10] ? Number(row[10]) : 0;
      if (Number.isFinite(discount) && discount > 100) {
        rowErrors.push('Discount % cannot be greater than 100');
      }

      const discountType = row[9] || 'NONE';
      if (!ALLOWED_DISCOUNT_TYPES.includes(discountType)) {
        rowErrors.push(`Discount Type must be one of: ${ALLOWED_DISCOUNT_TYPES.join(', ')}`);
      }

      const sameProductBonus =
        discountType === 'SAME_PRODUCT_BONUS' ||
        discountType === 'SAME_PRODUCT_BONUS_AND_DISCOUNT';

      const buy = row[11] ? Number(row[11]) : 0;
      const free = row[12] ? Number(row[12]) : 0;
      if (sameProductBonus && (buy <= 0 || free <= 0)) {
        rowErrors.push('Offer Buy Quantity and Offer Free Quantity are required for a same-product offer');
      }

      const prescription = row[15].toLowerCase();
      if (prescription && !['true', 'false', 'yes', 'no', '1', '0'].includes(prescription)) {
        rowErrors.push('Prescription Required must be true/false, yes/no, or 1/0');
      }

      const expiry = new Date(row[13]);
      if (Number.isNaN(expiry.valueOf())) rowErrors.push('Expiry Date must be a valid date');
      else if (expiry < new Date()) rowErrors.push('Expiry Date cannot be in the past');

      if (rowErrors.length) errors.push(`Row ${csvRowNumber}: ${rowErrors.join('; ')}`);
      else data.push(row);
    });

    if (!data.length && !errors.length) errors.push('No inventory rows were found in the CSV.');
    return { data, errors };
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const downloadTemplate = () => {
    const escapeCSV = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [
      PREVIEW_HEADERS.join(','),
      SAMPLE_ROWS[0].map(escapeCSV).join(','),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'singh-medicals-inventory-template.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    addToast('New inventory CSV template downloaded', 'success');
  };

  const readCSVFile = async (file: File) => {
    setSelectedFile(file);
    setSelectedFileName(file.name);
    setSelectedFileSize(formatFileSize(file.size));
    setParseErrors([]);
    setParsedRows([]);
    setPhase('parsing');

    try {
      const text = await file.text();
      const result = validateCSV(parseCSV(text));
      setParsedRows(result.data);
      setParseErrors(result.errors);
      setPhase('preview');
    } catch (error) {
      setParsedRows([]);
      setParseErrors([error instanceof Error ? error.message : 'Could not read the CSV file.']);
      setPhase('preview');
    }
  };

  const resetImport = () => {
    setPhase('idle');
    setParsedRows([]);
    setSelectedFileName('');
    setSelectedFileSize('');
    setParseErrors([]);
    setSelectedFile(null);
    setImporting(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      addToast('Please upload a .csv file', 'error');
      return;
    }
    void readCSVFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
    else setPhase('idle');
  };

  const handleConfirm = async () => {
    if (!parsedRows.length || parseErrors.length) return;
    if (!selectedFile) {
      addToast('Please select a CSV file first.', 'error');
      return;
    }
    if (!adminToken) {
      addToast('Admin session expired. Please login again.', 'error');
      return;
    }

    try {
      setImporting(true);
      const result = await importInventoryCsv(adminToken, selectedFile);
      await refreshAdminData();
      addToast(
        result.message ||
          `Inventory imported successfully. ${result.imported ?? result.created ?? parsedRows.length} rows processed.`,
        'success'
      );
      setPhase('success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Inventory import failed.', 'error');
    } finally {
      setImporting(false);
    }
  };

  const pricingPreview = (row: string[]) => {
    const mrp = Number(row[8]) || 0;
    const ptr = Number((mrp * 0.7619).toFixed(2));
    const discount = Number(row[10]) || 0;
    const type = row[9] || 'NONE';
    const buy = Number(row[11]) || 0;
    const free = Number(row[12]) || 0;
    const sameBonus = type === 'SAME_PRODUCT_BONUS' || type === 'SAME_PRODUCT_BONUS_AND_DISCOUNT';
    const bonusPtr = sameBonus && buy > 0 && free > 0 ? Number((ptr * (buy / (buy + free))).toFixed(2)) : ptr;
    const appliesDiscount = type === 'DISCOUNT_ON_PTR' || type === 'SAME_PRODUCT_BONUS_AND_DISCOUNT' || type === 'DIFFERENT_PRODUCT_BONUS_AND_DISCOUNT';
    const discountAmount = appliesDiscount ? Number((bonusPtr * discount / 100).toFixed(2)) : 0;
    return Math.max(0, Number((bonusPtr - discountAmount).toFixed(2)));
  };

  return (
    <div className="w-full max-w-7xl">
      {phase === 'idle' || phase === 'dragging' ? (
        <div>
          <div className="mb-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#1C1C1E]">Import Inventory CSV</h3>
              <p className="text-xs sm:text-sm text-[#6B7280] mt-1 leading-5">
                Bulk-add or update medicines. SKU, Batch Number, PTR and GST are handled automatically by the system.
              </p>
            </div>
            <button type="button" onClick={downloadTemplate} className="w-full sm:w-auto shrink-0 px-4 py-2.5 rounded-xl border border-[#0D9A55]/20 bg-[#E8F5EE] text-[#0D9A55] text-xs font-bold hover:bg-[#D8F0E2] transition-colors">
              Download Template
            </button>
          </div>

          <div className="mb-4 rounded-2xl border border-[#DDEBE3] bg-[#F8FCF9] p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-[#4B725F]">
              <div><span className="font-bold text-[#17683E]">PTR:</span> automatically calculated at 76.19% of MRP</div>
              <div><span className="font-bold text-[#17683E]">GST:</span> automatically set to 5%</div>
              <div><span className="font-bold text-[#17683E]">Offers:</span> discount and bonus fields drive Effective PTR</div>
            </div>
          </div>

          <div
            onDragOver={e => { e.preventDefault(); setPhase('dragging'); }}
            onDragLeave={() => setPhase('idle')}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-12 min-h-[220px] sm:min-h-[280px] flex flex-col items-center justify-center text-center cursor-pointer transition-all ${phase === 'dragging' ? 'border-[#0D9A55] bg-[#E8F5EE]' : 'border-black/[0.12] bg-white hover:border-[#0D9A55]/40 hover:bg-[#FBFDFB]'}`}
          >
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) handleFile(file); }} />
            <div className="w-14 h-14 rounded-2xl bg-[#E8F5EE] text-[#0D9A55] flex items-center justify-center mb-4">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0-4 4m4-4 4 4M5 13v4a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-4" /></svg>
            </div>
            <p className="text-sm sm:text-base font-bold text-[#1C1C1E]">{phase === 'dragging' ? 'Drop to upload inventory' : 'Drag & drop your inventory CSV here'}</p>
            <p className="text-xs text-[#6B7280] mt-1">or choose a CSV file from your computer</p>
            <button type="button" onClick={e => { e.stopPropagation(); fileRef.current?.click(); }} className="mt-5 px-5 py-2.5 rounded-xl bg-[#0D9A55] text-white text-xs font-bold hover:bg-[#0A7A43] transition-colors">Choose CSV File</button>
            <p className="text-[10px] text-[#9CA3AF] mt-4">CSV files only · New format without SKU or Batch Number</p>
          </div>
        </div>
      ) : phase === 'parsing' ? (
        <div className="bg-white rounded-2xl p-10 sm:p-16 text-center shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
          <div className="w-14 h-14 rounded-full border-4 border-[#E8F5EE] border-t-[#0D9A55] animate-spin mx-auto" />
          <p className="text-sm text-[#1C1C1E] font-bold mt-4">Reading inventory CSV…</p>
          <p className="text-xs text-[#6B7280] mt-1">Validating product fields and pricing configuration.</p>
        </div>
      ) : phase === 'preview' ? (
        <div>
          <div className="mb-4 rounded-2xl bg-white p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-black/[0.04] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-[#1C1C1E] truncate">{selectedFileName || 'CSV file'}</p>
              <p className="text-xs text-[#6B7280] mt-1">{selectedFileSize} · {parsedRows.length} valid row{parsedRows.length === 1 ? '' : 's'}</p>
            </div>
            <button onClick={resetImport} className="self-start sm:self-auto text-sm text-[#6B7280] hover:text-[#1C1C1E] font-semibold">Choose another file</button>
          </div>

          {parseErrors.length > 0 && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 font-bold">!</div>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-red-800">Inventory CSV validation failed</p>
                  <p className="text-xs text-red-700 mt-1">Fix the following issue{parseErrors.length === 1 ? '' : 's'} and upload the file again.</p>
                  <ul className="mt-3 space-y-1.5 list-disc pl-4 text-xs text-red-700">{parseErrors.slice(0, 20).map((error, index) => <li key={`${error}-${index}`}>{error}</li>)}</ul>
                  {parseErrors.length > 20 && <p className="text-xs text-red-700 mt-2">+ {parseErrors.length - 20} more issue(s)</p>}
                </div>
              </div>
            </div>
          )}

          {parseErrors.length === 0 && parsedRows.length > 0 && (
            <div className="mb-4 rounded-2xl border border-[#BFE6CF] bg-[#E8F5EE] p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#0D9A55] font-bold">✓</div>
              <div>
                <p className="text-sm font-extrabold text-[#17683E]">Inventory CSV is ready</p>
                <p className="text-xs text-[#4B725F] mt-0.5">All {parsedRows.length} row{parsedRows.length === 1 ? '' : 's'} passed validation.</p>
              </div>
            </div>
          )}

          {parsedRows.length > 0 && <div className="hidden xl:block bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F5F7F5]"><tr>
                  <th className="text-left px-3 py-2.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">#</th>
                  {PREVIEW_HEADERS.map(h => <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>)}
                  <th className="text-right px-3 py-2.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Effective PTR</th>
                </tr></thead>
                <tbody className="divide-y divide-black/[0.05]">
                  {parsedRows.map((row, i) => <tr key={i} className="hover:bg-[#F5F7F5]/50">
                    <td className="px-3 py-2.5 text-xs text-[#9CA3AF]">{i + 1}</td>
                    {row.map((value, j) => <td key={j} className="px-3 py-2.5 text-[#1C1C1E] text-xs whitespace-nowrap">{value || '—'}</td>)}
                    <td className="px-3 py-2.5 text-right text-[#0D9A55] font-extrabold text-xs whitespace-nowrap">₹{pricingPreview(row).toFixed(2)}</td>
                  </tr>)}
                </tbody>
              </table>
            </div>
          </div>}

          <div className="xl:hidden space-y-3 mb-4">
            {parsedRows.map((row, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-black/[0.04]">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-black/[0.06]">
                  <div className="min-w-0"><p className="text-[10px] uppercase tracking-wide text-[#9CA3AF]">Inventory {i + 1}</p><p className="font-bold text-sm text-[#1C1C1E] mt-1 break-words">{row[0] || 'Unnamed product'}</p><p className="text-xs text-[#6B7280] mt-1 break-words">{row[2]} · {row[3]}</p></div>
                  <span className="shrink-0 px-2 py-1 bg-[#E8F5EE] rounded-lg text-[10px] font-bold text-[#0D9A55]">Effective ₹{pricingPreview(row).toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3">
                  {[
                    ['Composition', row[1]], ['Pack', row[6]], ['Quantity', row[7]], ['MRP', `₹${row[8]}`],
                    ['PTR', `₹${(Number(row[8] || 0) * 0.7619).toFixed(2)}`], ['Discount', row[10] ? `${row[10]}%` : '0%'],
                    ['Offer', row[9] || 'NONE'], ['Expiry', row[13]], ['Barcode', row[14] || 'Auto / optional'], ['GST', '5%']
                  ].map(([label, value]) => <div key={label}><p className="text-[10px] uppercase tracking-wide text-[#9CA3AF]">{label}</p><p className="text-xs font-semibold text-[#1C1C1E] mt-1 break-words">{value || '—'}</p></div>)}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button onClick={() => { void handleConfirm(); }} disabled={importing || !parsedRows.length || parseErrors.length > 0} className="w-full sm:w-auto px-6 py-3 bg-[#0D9A55] text-white rounded-2xl font-bold hover:bg-[#0A7A43] transition-colors shadow-[0_4px_16px_rgba(13,154,85,0.3)] text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none">
              {importing ? 'Importing…' : parseErrors.length > 0 ? 'Fix CSV Errors First' : `Import ${parsedRows.length} Inventory Row${parsedRows.length === 1 ? '' : 's'} →`}
            </button>
            <button onClick={resetImport} className="w-full sm:w-auto px-6 py-3 border border-black/[0.08] text-[#6B7280] rounded-2xl font-semibold text-sm hover:bg-[#F5F7F5]">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 sm:p-16 text-center shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
          <div className="w-16 h-16 rounded-full bg-[#E8F5EE] flex items-center justify-center mx-auto mb-4"><svg className="w-9 h-9 text-[#0D9A55]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
          <h3 className="text-xl font-extrabold text-[#1C1C1E] mb-2">Inventory imported successfully!</h3>
          <p className="text-[#6B7280] text-sm mb-6">Products, stock and automatic pricing were saved and the Admin inventory has been refreshed.</p>
          <button onClick={resetImport} className="w-full sm:w-auto px-5 py-2.5 border-2 border-[#0D9A55] text-[#0D9A55] rounded-xl font-semibold text-sm hover:bg-[#E8F5EE] transition-colors">Import Another CSV</button>
        </div>
      )}
    </div>
  );
}