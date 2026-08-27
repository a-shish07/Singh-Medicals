import { useState, useRef } from 'react';
import React from 'react';
import { useApp } from '../context';
import { PRODUCTS } from '../data';
import type { AdminTab, OrderStatus } from '../types';

const STATUS_STYLES: Record<OrderStatus, string> = {
  Submitted: 'bg-amber-100 text-amber-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Packed: 'bg-purple-100 text-purple-700',
  Dispatched: 'bg-cyan-100 text-cyan-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const ALL_STATUSES: OrderStatus[] = ['Submitted', 'Confirmed', 'Packed', 'Dispatched', 'Delivered', 'Cancelled'];

function OrdersTab() {
  const { orders, setOrders } = useApp();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [searchQ, setSearchQ] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    const q = searchQ.toLowerCase();
    const matchSearch = !q || o.id.toLowerCase().includes(q) || o.retailerShop.toLowerCase().includes(q) || o.retailerName.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  const updateStatus = (orderId: string, status: OrderStatus) => {
    setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
  };

  if (selectedOrder) {
    return (
      <div>
        <button onClick={() => setSelectedOrderId(null)} className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#0D9A55] transition-colors mb-5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          Back to Orders
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5">
            <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
              <div>
                <h3 className="font-extrabold text-lg text-[#1C1C1E] font-mono">{selectedOrder.id}</h3>
                <p className="text-sm text-[#6B7280]">{new Date(selectedOrder.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${STATUS_STYLES[selectedOrder.status]}`}>{selectedOrder.status}</span>
                <select
                  value={selectedOrder.status}
                  onChange={e => updateStatus(selectedOrder.id, e.target.value as OrderStatus)}
                  className="px-3 py-1.5 text-sm bg-[#F5F7F5] border border-black/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30 focus:border-[#0D9A55] transition-all"
                >
                  {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <h4 className="font-semibold text-sm text-[#6B7280] mb-3 uppercase tracking-wide">Line Items</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[#6B7280] text-xs uppercase tracking-wide">
                    <th className="text-left pb-2">Product</th>
                    <th className="text-right pb-2">Qty</th>
                    <th className="text-right pb-2">Rate</th>
                    <th className="text-right pb-2">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.05]">
                  {selectedOrder.items.map(item => (
                    <tr key={item.productId}>
                      <td className="py-2.5 font-medium">{item.productName}</td>
                      <td className="py-2.5 text-right text-[#6B7280]">{item.quantity}</td>
                      <td className="py-2.5 text-right text-[#6B7280]">₹{item.rate}</td>
                      <td className="py-2.5 text-right font-semibold">₹{(item.rate * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={3} className="pt-3 text-right font-bold">Total</td>
                    <td className="pt-3 text-right font-extrabold text-[#0D9A55] text-base">₹{selectedOrder.total.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5">
            <h4 className="font-semibold text-sm text-[#6B7280] mb-3 uppercase tracking-wide">Retailer Info</h4>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs text-[#6B7280]">Shop Name</p>
                <p className="font-semibold text-sm text-[#1C1C1E]">{selectedOrder.retailerShop}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280]">Contact Person</p>
                <p className="font-semibold text-sm text-[#1C1C1E]">{selectedOrder.retailerName}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280]">Phone</p>
                <p className="font-semibold text-sm text-[#1C1C1E]">+91 {selectedOrder.retailerPhone}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B7280]">Delivery Address</p>
                <p className="font-semibold text-sm text-[#1C1C1E]">{selectedOrder.retailerAddress}</p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-black/[0.06]">
              <h4 className="font-semibold text-sm text-[#6B7280] mb-3 uppercase tracking-wide">Update Status</h4>
              <div className="flex flex-col gap-2">
                {ALL_STATUSES.map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatus(selectedOrder.id, s)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all text-left ${selectedOrder.status === s ? STATUS_STYLES[s] + ' ring-2 ring-offset-1' : 'hover:bg-[#F5F7F5] text-[#6B7280]'}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${selectedOrder.status === s ? 'bg-current' : 'bg-[#D1D5DB]'}`} />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-3 mb-5 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-black/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30 focus:border-[#0D9A55] transition-all"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          className="px-3 py-2.5 text-sm bg-white border border-black/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30 focus:border-[#0D9A55] transition-all"
        >
          <option value="All">All Status</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F7F5]">
              <tr className="text-[#6B7280] text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3">Order ID</th>
                <th className="text-left px-4 py-3">Retailer</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Date</th>
                <th className="text-right px-4 py-3 hidden md:table-cell">Items</th>
                <th className="text-right px-4 py-3">Total</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-[#F5F7F5]/50 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-xs text-[#1C1C1E]">{order.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#1C1C1E]">{order.retailerShop}</p>
                    <p className="text-xs text-[#6B7280]">{order.retailerName}</p>
                  </td>
                  <td className="px-4 py-3 text-[#6B7280] hidden sm:table-cell">
                    {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-4 py-3 text-right text-[#6B7280] hidden md:table-cell">{order.items.length}</td>
                  <td className="px-4 py-3 text-right font-bold text-[#1C1C1E]">₹{order.total.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}
                      onClick={e => e.stopPropagation()}
                      className={`text-xs font-bold px-2 py-1 rounded-lg border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30 ${STATUS_STYLES[order.status]}`}
                    >
                      {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedOrderId(order.id)}
                      className="text-[#0D9A55] hover:underline text-xs font-semibold"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-[#6B7280] text-sm">No orders match the filter</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProductsTab() {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'name' | 'mrp' | 'net'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...PRODUCTS]
    .filter(p => {
      const q = search.toLowerCase();
      return !q || p.name.toLowerCase().includes(q) || p.company.toLowerCase().includes(q) || p.composition.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'name') return a.name.localeCompare(b.name) * dir;
      return (a[sortKey] - b[sortKey]) * dir;
    });

  const SortIcon = ({ k }: { k: string }) => (
    <span className="ml-1 opacity-40">
      {sortKey === k ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  return (
    <div>
      <div className="relative mb-5 max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-black/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30 focus:border-[#0D9A55] transition-all"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F7F5]">
              <tr className="text-[#6B7280] text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3 cursor-pointer hover:text-[#0D9A55] transition-colors" onClick={() => toggleSort('name')}>
                  Product <SortIcon k="name" />
                </th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Company</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Category</th>
                <th className="text-left px-4 py-3 hidden xl:table-cell">Pack</th>
                <th className="text-right px-4 py-3 cursor-pointer hover:text-[#0D9A55] transition-colors" onClick={() => toggleSort('mrp')}>
                  MRP <SortIcon k="mrp" />
                </th>
                <th className="text-right px-4 py-3 cursor-pointer hover:text-[#0D9A55] transition-colors" onClick={() => toggleSort('net')}>
                  Net <SortIcon k="net" />
                </th>
                <th className="text-right px-4 py-3">Disc%</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Expiry</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {sorted.map(p => {
                const disc = Math.round(((p.mrp - p.net) / p.mrp) * 100);
                return (
                  <tr key={p.id} className="hover:bg-[#F5F7F5]/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#1C1C1E]">{p.name}</p>
                      <p className="text-xs text-[#9CA3AF] hidden sm:block truncate max-w-[180px]">{p.composition}</p>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280] hidden md:table-cell">{p.company}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="px-2 py-0.5 bg-[#F5F7F5] text-[#6B7280] text-xs rounded-lg">{p.category}</span>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280] text-xs hidden xl:table-cell">{p.pack}</td>
                    <td className="px-4 py-3 text-right text-[#6B7280]">₹{p.mrp}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#0D9A55]">₹{p.net}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="px-2 py-0.5 bg-[#E8F5EE] text-[#0D9A55] text-xs font-bold rounded-lg">{disc}%</span>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280] text-xs hidden sm:table-cell">{p.expiry}</td>
                    <td className="px-4 py-3">
                      <button className="text-[#0D9A55] hover:underline text-xs font-semibold">Edit</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-[#F5F7F5] border-t border-black/[0.06] text-xs text-[#6B7280]">
          Showing {sorted.length} of {PRODUCTS.length} products
        </div>
      </div>
    </div>
  );
}

function ImportTab() {
  const [phase, setPhase] = useState<'idle' | 'dragging' | 'parsing' | 'preview' | 'success'>('idle');
  const [parsedRows, setParsedRows] = useState<string[][]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const PREVIEW_HEADERS = ['Name', 'Company', 'Composition', 'Category', 'Pack', 'MRP', 'Net', 'Expiry', 'Scheme'];

  const SAMPLE_ROWS = [
    ['Metformin SR 500', 'Sun Pharma', 'Metformin 500mg', 'Tablets', '10×10', '95', '67', 'Jan 2027', ''],
    ['Pantocid D', 'Sun Pharma', 'Pantoprazole 40mg + Domperidone 10mg', 'Tablets', '10×10', '185', '130', 'Mar 2027', '10+1 Free'],
    ['Ciplox 500', 'Cipla', 'Ciprofloxacin 500mg', 'Tablets', '5×10', '225', '158', 'Sep 2026', ''],
    ['Aristozyme Syrup', 'Aristopharma', 'Fungal Diastase + Papain', 'Syrups', '200ml', '140', '98', 'Feb 2027', ''],
    ['Neomercazole 5', 'Roche', 'Carbimazole 5mg', 'Tablets', '10×10', '320', '225', 'Dec 2026', ''],
  ];

  const simulateParse = (fileName: string) => {
    setPhase('parsing');
    setTimeout(() => {
      setParsedRows(SAMPLE_ROWS);
      setPhase('preview');
    }, 1200);
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a .csv file');
      return;
    }
    simulateParse(file.name);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setPhase('idle');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleConfirm = () => {
    setPhase('success');
  };

  return (
    <div className="max-w-2xl">
      {phase === 'idle' || phase === 'dragging' ? (
        <div>
          <p className="text-sm text-[#6B7280] mb-4">Upload a CSV file to bulk-update the product catalogue. Download the template below to see the required format.</p>

          <div
            onDragOver={e => { e.preventDefault(); setPhase('dragging'); }}
            onDragLeave={() => setPhase('idle')}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all ${phase === 'dragging' ? 'border-[#0D9A55] bg-[#E8F5EE]' : 'border-black/[0.12] hover:border-[#0D9A55] hover:bg-[#F5F7F5]'}`}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#E8F5EE] flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-[#0D9A55]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <p className="font-semibold text-[#1C1C1E] text-sm mb-1">
              {phase === 'dragging' ? 'Drop to upload' : 'Drag & drop CSV here'}
            </p>
            <p className="text-xs text-[#6B7280] mb-3">or click to browse files</p>
            <span className="px-4 py-2 bg-[#0D9A55] text-white text-xs font-semibold rounded-xl">Choose File</span>
          </div>

          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

          <div className="mt-4 p-4 bg-[#F5F7F5] rounded-xl">
            <p className="text-xs font-semibold text-[#6B7280] mb-2">Required CSV columns (in order):</p>
            <p className="text-xs font-mono text-[#1C1C1E]">{PREVIEW_HEADERS.join(', ')}</p>
          </div>

          <button
            onClick={() => simulateParse('template.csv')}
            className="mt-4 text-sm text-[#0D9A55] hover:underline font-medium"
          >
            Use sample data for demo →
          </button>
        </div>
      ) : phase === 'parsing' ? (
        <div className="flex flex-col items-center py-16 gap-4">
          <svg className="w-10 h-10 text-[#0D9A55] animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
          <p className="text-sm text-[#6B7280] font-medium">Parsing CSV and validating rows...</p>
        </div>
      ) : phase === 'preview' ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#1C1C1E]" style={{ fontFamily: "'DM Sans', sans-serif" }}>Preview — {parsedRows.length} rows detected</h3>
              <p className="text-sm text-[#6B7280]">Review before importing. Duplicate products will be updated.</p>
            </div>
            <button onClick={() => setPhase('idle')} className="text-sm text-[#6B7280] hover:text-[#1C1C1E]">Cancel</button>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F5F7F5]">
                  <tr>
                    {PREVIEW_HEADERS.map(h => (
                      <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.05]">
                  {parsedRows.map((row, i) => (
                    <tr key={i} className="hover:bg-[#F5F7F5]/50">
                      {row.map((cell, j) => (
                        <td key={j} className="px-3 py-2.5 text-[#1C1C1E] text-xs whitespace-nowrap">{cell || '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={handleConfirm}
            className="px-6 py-3 bg-[#0D9A55] text-white rounded-2xl font-bold hover:bg-[#0A7A43] transition-colors shadow-[0_4px_16px_rgba(13,154,85,0.3)] text-sm"
          >
            Import {parsedRows.length} Products →
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-[#E8F5EE] flex items-center justify-center mb-4">
            <svg className="w-9 h-9 text-[#0D9A55]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-extrabold text-[#1C1C1E] mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {parsedRows.length} products updated!
          </h3>
          <p className="text-[#6B7280] text-sm mb-6">The catalogue has been updated with the imported data.</p>
          <button onClick={() => setPhase('idle')} className="px-5 py-2.5 border-2 border-[#0D9A55] text-[#0D9A55] rounded-xl font-semibold text-sm hover:bg-[#E8F5EE] transition-colors">
            Import Another File
          </button>
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const { navigate, adminTab, setAdminTab } = useApp();
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminPwd, setAdminPwd] = useState('');
  const [pwdError, setPwdError] = useState(false);

  const handleAdminLogin = () => {
    if (adminPwd === 'admin123' || adminPwd.length > 0) {
      setAdminAuth(true);
    } else {
      setPwdError(true);
    }
  };

  if (!adminAuth) {
    return (
      <div className="min-h-screen bg-[#1C1C1E] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0D9A55] to-[#0A7A43] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
            </div>
            <div>
              <p className="font-bold text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>Admin Access</p>
              <p className="text-xs text-[#6B7280]">Singh Medical Stores</p>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1.5">Password</label>
            <input
              type="password"
              value={adminPwd}
              onChange={e => { setAdminPwd(e.target.value); setPwdError(false); }}
              onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
              placeholder="Enter admin password"
              className={`w-full px-4 py-3 bg-[#F5F7F5] border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30 focus:border-[#0D9A55] transition-all ${pwdError ? 'border-red-400' : 'border-black/[0.08]'}`}
            />
            {pwdError && <p className="text-red-500 text-xs mt-1">Incorrect password</p>}
            <p className="text-xs text-[#9CA3AF] mt-1">Hint: type anything to enter demo mode</p>
          </div>
          <button onClick={handleAdminLogin} className="w-full py-3 bg-[#0D9A55] text-white rounded-xl font-bold hover:bg-[#0A7A43] transition-colors text-sm">
            Enter Admin Panel
          </button>
          <button onClick={() => navigate('catalogue')} className="w-full mt-3 text-sm text-[#6B7280] hover:text-[#0D9A55] transition-colors">
            Back to Store
          </button>
        </div>
      </div>
    );
  }

  const tabs: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    {
      key: 'orders',
      label: 'Orders',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
        </svg>
      ),
    },
    {
      key: 'products',
      label: 'Products',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .3 2.7-1.1 2.7H3.9c-1.4 0-2.1-1.7-1.1-2.7L4.2 15.3" />
        </svg>
      ),
    },
    {
      key: 'import',
      label: 'Import CSV',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
      ),
    },
  ];

  const { orders } = useApp();

  return (
    <div className="min-h-screen bg-[#F5F7F5] flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-[#1C1C1E] text-white flex flex-col min-h-screen sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0D9A55] to-[#0A7A43] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            </div>
            <div>
              <p className="font-bold text-xs leading-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>Singh Medical</p>
              <p className="text-[10px] text-white/40 leading-tight uppercase tracking-wide">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setAdminTab(tab.key)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${adminTab === tab.key ? 'bg-[#0D9A55] text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
            >
              {tab.icon}
              {tab.label}
              {tab.key === 'orders' && (
                <span className="ml-auto text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-full">
                  {orders.filter(o => o.status === 'Submitted').length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={() => navigate('catalogue')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/10 transition-all w-full"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" /></svg>
            Back to Store
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-[#1C1C1E]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {tabs.find(t => t.key === adminTab)?.label}
          </h1>
          <p className="text-sm text-[#6B7280] mt-0.5">
            {adminTab === 'orders' && `${orders.length} total orders · ${orders.filter(o => o.status === 'Submitted').length} pending`}
            {adminTab === 'products' && `${PRODUCTS.length} products in catalogue`}
            {adminTab === 'import' && 'Bulk update catalogue via CSV upload'}
          </p>
        </div>

        {adminTab === 'orders' && <OrdersTab />}
        {adminTab === 'products' && <ProductsTab />}
        {adminTab === 'import' && <ImportTab />}
      </main>
    </div>
  );
}
