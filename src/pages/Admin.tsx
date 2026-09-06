import { useEffect, useState, useRef } from 'react';
import React from 'react';
import { useApp } from '../context';
import type { AdminTab, OrderStatus, Product } from '../types';
import { Plus, X } from "lucide-react";
import { importInventoryCsv } from '../lib/api';

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
  const { orders, updateOrderStatus, addToast } = useApp();
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

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    try { await updateOrderStatus(orderId, status); addToast('Order status updated', 'success'); }
    catch (error) { addToast(error instanceof Error ? error.message : 'Could not update order', 'error'); }
  };

  if (selectedOrder) {
    return (
      <div>
        <button onClick={() => setSelectedOrderId(null)} className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#0D9A55] transition-colors mb-5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          Back to Orders
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
              <div>
                <h3 className="font-extrabold text-lg text-[#1C1C1E] font-mono">{selectedOrder.id}</h3>
                <p className="text-sm text-[#6B7280]">{new Date(selectedOrder.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${STATUS_STYLES[selectedOrder.status]}`}>{selectedOrder.status}</span>
                <select
                  value={selectedOrder.status}
                  onChange={e => updateStatus(selectedOrder.id, e.target.value as OrderStatus)}
                  className="flex-1 sm:flex-none min-w-0 px-3 py-2 text-sm bg-[#F5F7F5] border border-black/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30 focus:border-[#0D9A55] transition-all"
                >
                  {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <h4 className="font-semibold text-sm text-[#6B7280] mb-3 uppercase tracking-wide">Line Items</h4>
            {/* Desktop line-items table */}
            <div className="hidden sm:block overflow-x-auto">
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

            {/* Mobile line-item cards */}
            <div className="sm:hidden space-y-2">
              {selectedOrder.items.map(item => (
                <div
                  key={item.productId}
                  className="rounded-xl bg-[#F5F7F5] p-3 border border-black/[0.04]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-[#1C1C1E] leading-snug min-w-0">
                      {item.productName}
                    </p>
                    <p className="text-sm font-extrabold text-[#0D9A55] shrink-0">
                      ₹{(item.rate * item.quantity).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-[#6B7280]">
                    <span>Qty: <strong className="text-[#1C1C1E]">{item.quantity}</strong></span>
                    <span>Rate: <strong className="text-[#1C1C1E]">₹{item.rate}</strong></span>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-3 border-t border-black/[0.06]">
                <span className="text-sm font-bold text-[#1C1C1E]">Total</span>
                <span className="text-lg font-extrabold text-[#0D9A55]">
                  ₹{selectedOrder.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-4 sm:p-5">
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
  <h4 className="font-semibold text-sm text-[#6B7280] mb-3 uppercase tracking-wide">
    Payment
  </h4>

  <div className="flex items-center gap-3 bg-[#E8F5EE] rounded-xl p-3">
    <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
      💵
    </div>

    <div>
      <p className="text-sm font-bold text-[#1C1C1E]">
        Cash on Delivery
      </p>
      <p className="text-xs text-[#6B7280]">
        Payment due on delivery
      </p>
    </div>
  </div>
</div>

            <div className="mt-5 pt-4 border-t border-black/[0.06]">
              <h4 className="font-semibold text-sm text-[#6B7280] mb-3 uppercase tracking-wide">Update Status</h4>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-2">
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

      {/* Desktop Orders Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F7F5]">
              <tr className="text-[#6B7280] text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3">Order ID</th>
                <th className="text-left px-4 py-3">Retailer</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-right px-4 py-3">Items</th>
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
                  <td className="px-4 py-3 text-[#6B7280]">
                    {new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-4 py-3 text-right text-[#6B7280]">{order.items.length}</td>
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

      {/* Mobile Orders Cards */}
      <div className="md:hidden space-y-3">
        {filtered.map(order => (
          <div
            key={order.id}
            className="bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-black/[0.04]"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <p className="font-mono font-bold text-xs text-[#1C1C1E] truncate">
                  {order.id}
                </p>
                <p className="font-semibold text-sm text-[#1C1C1E] mt-1 truncate">
                  {order.retailerShop}
                </p>
                <p className="text-xs text-[#6B7280] truncate">
                  {order.retailerName}
                </p>
              </div>

              <span className={`shrink-0 px-2.5 py-1 text-[10px] font-bold rounded-full ${STATUS_STYLES[order.status]}`}>
                {order.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 border-y border-black/[0.06]">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-[#9CA3AF]">Date</p>
                <p className="text-xs font-semibold text-[#1C1C1E] mt-0.5">
                  {new Date(order.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wide text-[#9CA3AF]">Items</p>
                <p className="text-xs font-semibold text-[#1C1C1E] mt-0.5">
                  {order.items.length}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wide text-[#9CA3AF]">Total</p>
                <p className="text-sm font-extrabold text-[#0D9A55] mt-0.5">
                  ₹{order.total.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              <select
                value={order.status}
                onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}
                onClick={e => e.stopPropagation()}
                className={`flex-1 min-w-0 text-xs font-bold px-3 py-2 rounded-xl border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30 ${STATUS_STYLES[order.status]}`}
              >
                {ALL_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <button
                onClick={() => setSelectedOrderId(order.id)}
                className="shrink-0 px-4 py-2 rounded-xl bg-[#E8F5EE] text-[#0D9A55] text-xs font-bold hover:bg-[#D8F0E2] transition-colors"
              >
                View Order →
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center text-[#6B7280] text-sm shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
            No orders match the filter
          </div>
        )}
      </div>
    </div>
  );
}

function ProductsTab() {
  const {
    products,
    updateProduct,
    createProduct,
    addToast,
  } = useApp();  
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'name' | 'mrp' | 'net'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [editing, setEditing] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
const [creating, setCreating] = useState(false);

const [newProduct, setNewProduct] = useState({
  name: '',
  company: '',
  composition: '',
  category: '',
  medicineType: '',
  productType: '',
  pack: '',
  countryOfOrigin: 'India',
  sku: '',
  barcode: '',
  prescriptionRequired: false,
  image: '',
  description: '',
  mrp: '',
  net: '',
  scheme: '',
  expiry: '',
  stock: '',
});

const handleCreateProduct = async () => {
  if (
    !newProduct.name.trim() ||
    !newProduct.company.trim() ||
    !newProduct.composition.trim() ||
    !newProduct.category.trim() ||
    !newProduct.pack.trim() ||
    !newProduct.sku.trim() ||
    !newProduct.expiry
  ) {
    addToast(
      'Please fill all required product fields.',
      'error'
    );
    return;
  }

  try {
    setCreating(true);

    await createProduct({
      name: newProduct.name.trim(),
      company: newProduct.company.trim(),
      composition: newProduct.composition.trim(),
      category: newProduct.category.trim(),
      medicineType: newProduct.medicineType.trim() || undefined,
      productType: newProduct.productType.trim() || undefined,
      pack: newProduct.pack.trim(),
      countryOfOrigin:
        newProduct.countryOfOrigin.trim() || undefined,
      sku: newProduct.sku.trim(),
      barcode: newProduct.barcode.trim() || undefined,
      prescriptionRequired:
        newProduct.prescriptionRequired,
      image: newProduct.image.trim() || undefined,
      description:
        newProduct.description.trim() || undefined,
      mrp: newProduct.mrp
        ? Number(newProduct.mrp)
        : undefined,
      net: newProduct.net
        ? Number(newProduct.net)
        : undefined,
      scheme: newProduct.scheme.trim() || undefined,
      expiry: newProduct.expiry || undefined,
      stock: newProduct.stock
        ? Number(newProduct.stock)
        : 0,
      isActive: true,
    });

    addToast(
      'Product created successfully.',
      'success'
    );

    setAdding(false);

    setNewProduct({
      name: '',
      company: '',
      composition: '',
      category: '',
      medicineType: '',
      productType: '',
      pack: '',
      countryOfOrigin: 'India',
      sku: '',
      barcode: '',
      prescriptionRequired: false,
      image: '',
      description: '',
      mrp: '',
      net: '',
      scheme: '',
      expiry: '',
      stock: '',
    });
  } catch (error) {
    addToast(
      error instanceof Error
        ? error.message
        : 'Failed to create product.',
      'error'
    );
  } finally {
    setCreating(false);
  }
};

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = [...products]
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

  if (selectedProduct) {
    const stock = (selectedProduct as Product & { stock?: number }).stock;
    const discount = selectedProduct.mrp > 0
      ? Math.round(((selectedProduct.mrp - selectedProduct.net) / selectedProduct.mrp) * 100)
      : 0;

    return (
      <div className="space-y-4 sm:space-y-5">
        <button
          onClick={() => setSelectedProduct(null)}
          className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#0D9A55] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Products
        </button>

        <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-1 rounded-lg bg-[#E8F5EE] text-[#0D9A55] text-[10px] font-bold uppercase tracking-wide">Product</span>
                <span className="px-2.5 py-1 rounded-lg bg-[#F5F7F5] text-[#6B7280] text-[10px] font-bold">{selectedProduct.category}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1C1C1E] break-words">{selectedProduct.name}</h2>
              <p className="mt-1 text-sm text-[#6B7280]">{selectedProduct.company}</p>
              <p className="mt-3 text-sm text-[#374151] leading-6 max-w-3xl">{selectedProduct.composition || 'Composition not added yet.'}</p>
            </div>
            <button
              onClick={() => setEditing(selectedProduct)}
              className="w-full lg:w-auto px-5 py-2.5 rounded-xl bg-[#0D9A55] text-white text-sm font-bold hover:bg-[#0A7F45] transition-colors"
            >
              Edit Product
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
            <p className="text-[10px] uppercase tracking-wide text-[#9CA3AF]">MRP</p>
            <p className="mt-1 text-lg font-extrabold text-[#1C1C1E]">₹{selectedProduct.mrp}</p>
          </div>
          <div className="bg-[#E8F5EE] rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wide text-[#0D9A55]">Net Price</p>
            <p className="mt-1 text-lg font-extrabold text-[#0D9A55]">₹{selectedProduct.net}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
            <p className="text-[10px] uppercase tracking-wide text-[#9CA3AF]">Discount</p>
            <p className="mt-1 text-lg font-extrabold text-[#1C1C1E]">{discount}%</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
            <p className="text-[10px] uppercase tracking-wide text-[#9CA3AF]">Stock</p>
            <p className={`mt-1 text-lg font-extrabold ${stock !== undefined && stock <= 10 ? 'text-red-600' : 'text-[#1C1C1E]'}`}>
              {stock === undefined ? '—' : stock}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
          <section className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-4 sm:p-5">
            <h3 className="font-extrabold text-[#1C1C1E]">Product Information</h3>
            <div className="mt-4 divide-y divide-black/[0.06]">
              {[
                ['Product Name', selectedProduct.name],
                ['Composition', selectedProduct.composition],
                ['Company / Manufacturer', selectedProduct.company],
                ['Category', selectedProduct.category],
                ['Pack Size', selectedProduct.pack],
              ].map(([label, value]) => (
                <div key={label} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
                  <span className="text-xs font-semibold text-[#9CA3AF]">{label}</span>
                  <span className="text-sm font-medium text-[#1C1C1E] sm:text-right break-words">{value || 'Not added'}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-4 sm:p-5">
            <h3 className="font-extrabold text-[#1C1C1E]">Current Inventory Snapshot</h3>
            <p className="text-xs text-[#9CA3AF] mt-1">Temporary view until batch inventory is connected to the backend.</p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#F7F8F7] p-4">
                <p className="text-[10px] uppercase tracking-wide text-[#9CA3AF]">Available Stock</p>
                <p className="mt-1 text-xl font-extrabold text-[#1C1C1E]">{stock === undefined ? 'Not available' : `${stock} units`}</p>
              </div>
              <div className="rounded-xl bg-[#F7F8F7] p-4">
                <p className="text-[10px] uppercase tracking-wide text-[#9CA3AF]">Current Expiry</p>
                <p className="mt-1 text-xl font-extrabold text-[#1C1C1E]">{selectedProduct.expiry || 'Not added'}</p>
              </div>
            </div>
          </section>
        </div>

        <section className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-[#1C1C1E]">Batch Inventory</h3>
              <p className="text-xs text-[#9CA3AF] mt-1">Each product can have multiple batches with separate stock, pricing and expiry.</p>
            </div>
            <span className="w-fit px-3 py-1.5 rounded-lg bg-[#FFF8E8] text-[#795B13] text-[10px] font-bold">Coming with Inventory System</span>
          </div>

          <div className="mt-4 rounded-2xl border border-dashed border-[#D6DDD8] bg-[#F8FAF8] p-6 sm:p-10 text-center">
            <div className="mx-auto w-11 h-11 rounded-xl bg-white flex items-center justify-center text-[#0D9A55] shadow-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0v10l-8 4-8-4V7m16 0l-8 4-8-4m8 4v10" />
              </svg>
            </div>
            <p className="mt-3 text-sm font-bold text-[#1C1C1E]">No batch records connected yet</p>
            <p className="mt-1 text-xs text-[#6B7280] max-w-md mx-auto leading-5">Batch Number, Quantity, Free Quantity, MRP, PTR, GST, Discount and Expiry will appear here after the inventory backend is implemented.</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2.5 mb-4 sm:mb-5">
        <div className="relative flex-1 sm:max-w-lg">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
          <input type="text" placeholder="Search product, company or composition..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-10 py-2.5 text-sm bg-white border border-black/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30 focus:border-[#0D9A55] transition-all" />
          {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg text-[#9CA3AF] hover:bg-[#F5F7F5] hover:text-[#1C1C1E]" aria-label="Clear search">×</button>}
        </div>
        <select value={`${sortKey}-${sortDir}`} onChange={e => { const [key, dir] = e.target.value.split('-') as [typeof sortKey, typeof sortDir]; setSortKey(key); setSortDir(dir); }} className="sm:w-44 px-3 py-2.5 text-sm bg-white border border-black/[0.08] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30">
          <option value="name-asc">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
          <option value="mrp-asc">MRP Low–High</option>
          <option value="mrp-desc">MRP High–Low</option>
          <option value="net-asc">Net Low–High</option>
          <option value="net-desc">Net High–Low</option>
        </select>
      </div>
      <button
  type="button"
  onClick={() => setAdding(true)}
  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
>
  <Plus className="h-4 w-4" />
  Add Product
</button>

      {/* Desktop Products Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F7F5]">
              <tr className="text-[#6B7280] text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3 cursor-pointer hover:text-[#0D9A55] transition-colors" onClick={() => toggleSort('name')}>
                  Product <SortIcon k="name" />
                </th>
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Category</th>
                <th className="text-left px-4 py-3 hidden xl:table-cell">Pack</th>
                <th className="text-right px-4 py-3 cursor-pointer hover:text-[#0D9A55] transition-colors" onClick={() => toggleSort('mrp')}>
                  MRP <SortIcon k="mrp" />
                </th>
                <th className="text-right px-4 py-3 cursor-pointer hover:text-[#0D9A55] transition-colors" onClick={() => toggleSort('net')}>
                  Net <SortIcon k="net" />
                </th>
                <th className="text-right px-4 py-3">Disc%</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Expiry</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {sorted.map(p => {
                const disc = p.mrp > 0 ? Math.round(((p.mrp - p.net) / p.mrp) * 100) : 0;
                return (
                  <tr key={p.id} className="hover:bg-[#F5F7F5]/50 transition-colors">
                    <td className="px-4 py-3">
                      <button onClick={() => setSelectedProduct(p)} className="font-semibold text-[#1C1C1E] text-left hover:text-[#0D9A55] transition-colors">{p.name}</button>
                      <p className="text-xs text-[#9CA3AF] truncate max-w-[220px]">{p.composition}</p>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280]">{p.company}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="px-2 py-0.5 bg-[#F5F7F5] text-[#6B7280] text-xs rounded-lg">{p.category}</span>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280] text-xs hidden xl:table-cell">{p.pack}</td>
                    <td className="px-4 py-3 text-right text-[#6B7280]">₹{p.mrp}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#0D9A55]">₹{p.net}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="px-2 py-0.5 bg-[#E8F5EE] text-[#0D9A55] text-xs font-bold rounded-lg">{disc}%</span>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280] text-xs hidden lg:table-cell">{p.expiry}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3"><button onClick={() => setSelectedProduct(p)} className="text-[#6B7280] hover:text-[#0D9A55] text-xs font-semibold">View</button><button onClick={() => setEditing(p)} className="text-[#0D9A55] hover:underline text-xs font-semibold">Edit</button></div>
                    </td>
                  </tr>
                );
              })}
              {sorted.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-[#6B7280] text-sm">No products match your search</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 bg-[#F5F7F5] border-t border-black/[0.06] text-xs text-[#6B7280]">
          Showing {sorted.length} of {products.length} products
        </div>
      </div>

      {/* Mobile Products Cards */}
      <div className="md:hidden space-y-3">
        {sorted.map(p => {
          const disc = p.mrp > 0 ? Math.round(((p.mrp - p.net) / p.mrp) * 100) : 0;
          const stock = (p as Product & { stock?: number }).stock;
          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-black/[0.04]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <button onClick={() => setSelectedProduct(p)} className="font-bold text-[15px] leading-5 text-[#1C1C1E] text-left break-words hover:text-[#0D9A55] transition-colors">{p.name}</button>
                  <p className="text-xs text-[#6B7280] mt-1 break-words">{p.company}</p>
                </div>
                <span className="shrink-0 px-2 py-1 bg-[#F5F7F5] text-[#6B7280] text-[10px] font-bold rounded-lg">
                  {p.category}
                </span>
              </div>

              <p className="text-xs text-[#9CA3AF] mt-2 leading-4 break-words">{p.composition}</p>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="rounded-xl bg-[#F7F8F7] p-3">
                  <p className="text-[10px] uppercase tracking-wide text-[#9CA3AF]">MRP</p>
                  <p className="text-sm font-semibold text-[#1C1C1E] mt-1">₹{p.mrp}</p>
                </div>
                <div className="rounded-xl bg-[#E8F5EE] p-3">
                  <p className="text-[10px] uppercase tracking-wide text-[#0D9A55]">Net Price</p>
                  <p className="text-sm font-extrabold text-[#0D9A55] mt-1">₹{p.net}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-2 py-3 border-y border-black/[0.06]">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-[#9CA3AF]">Discount</p>
                  <p className="text-xs font-bold text-[#0D9A55] mt-1">{disc}%</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-[#9CA3AF]">Pack</p>
                  <p className="text-xs font-semibold text-[#1C1C1E] mt-1 truncate">{p.pack}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-[#9CA3AF]">Expiry</p>
                  <p className="text-xs font-semibold text-[#1C1C1E] mt-1 truncate">{p.expiry}</p>
                </div>
              </div>

              {stock !== undefined && (
                <div className="flex items-center justify-between mt-3 text-xs">
                  <span className="text-[#6B7280]">Stock</span>
                  <span className={`font-bold ${stock <= 10 ? 'text-red-600' : 'text-[#1C1C1E]'}`}>
                    {stock} units
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mt-3"><button onClick={() => setSelectedProduct(p)} className="py-2.5 rounded-xl bg-[#F5F7F5] text-[#374151] text-xs font-bold hover:bg-[#E8F5EE] hover:text-[#0D9A55] transition-colors">View Details</button><button onClick={() => setEditing(p)} className="py-2.5 rounded-xl bg-[#E8F5EE] text-[#0D9A55] text-xs font-bold hover:bg-[#D8F0E2] transition-colors">Edit Product</button></div>
            </div>
          );
        })}

        {sorted.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center text-[#6B7280] text-sm shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
            No products match your search
          </div>
        )}

        <div className="px-1 pt-1 text-xs text-[#6B7280] text-center">
          Showing {sorted.length} of {products.length} products
        </div>
      </div>

      {editing && (() => {
        const editField = (field: 'name' | 'company' | 'composition' | 'category' | 'pack' | 'mrp' | 'net' | 'scheme' | 'expiry', label: string, type: 'text' | 'number' = 'text', required = true) => (
          <label className="block text-xs font-bold text-[#374151]">
            {label}{required && <span className="text-red-500"> *</span>}
            <input
              type={type}
              required={required}
              min={type === 'number' ? 0 : undefined}
              step={type === 'number' ? '0.01' : undefined}
              value={editing[field] ?? ''}
              onChange={e => setEditing({ ...editing, [field]: type === 'number' ? Number(e.target.value) : e.target.value })}
              className="mt-1.5 w-full px-3.5 py-2.5 border border-black/[0.10] rounded-xl text-sm font-normal text-[#1C1C1E] bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/20 focus:border-[#0D9A55]"
            />
          </label>
        );

        return (
          <div className="fixed inset-0 z-50 bg-black/50 p-3 sm:p-5 flex items-center justify-center">
            <form
              onSubmit={async e => {
                e.preventDefault();
                setSaving(true);
                try {
                  await updateProduct(editing.id, editing);
                  addToast('Product updated successfully', 'success');
                  setEditing(null);
                } catch (error) {
                  addToast(error instanceof Error ? error.message : 'Could not update product', 'error');
                } finally {
                  setSaving(false);
                }
              }}
              className="w-full max-w-3xl max-h-[94vh] overflow-y-auto bg-[#F8FAF8] rounded-2xl shadow-2xl"
            >
              <div className="sticky top-0 z-10 bg-white border-b border-black/[0.07] px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#0D9A55]">Product Catalogue</p>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#1C1C1E] truncate">Edit Product</h3>
                </div>
                <button type="button" onClick={() => setEditing(null)} className="w-9 h-9 shrink-0 rounded-xl bg-[#F5F7F5] text-[#6B7280] hover:text-[#1C1C1E] flex items-center justify-center" aria-label="Close">
                  ×
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                <section className="bg-white rounded-2xl border border-black/[0.06] p-4 sm:p-5">
                  <div className="mb-4">
                    <h4 className="font-extrabold text-[#1C1C1E]">Basic Information</h4>
                    <p className="text-xs text-[#9CA3AF] mt-1">Core information that identifies the medicine.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {editField('name', 'Product Name')}
                    {editField('company', 'Company / Manufacturer')}
                    <div className="sm:col-span-2">{editField('composition', 'Composition')}</div>
                    {editField('category', 'Category')}
                    {editField('pack', 'Pack Size')}
                  </div>
                </section>

                <section className="bg-white rounded-2xl border border-black/[0.06] p-4 sm:p-5">
                  <div className="mb-4">
                    <h4 className="font-extrabold text-[#1C1C1E]">Pricing</h4>
                    <p className="text-xs text-[#9CA3AF] mt-1">Current catalogue pricing. Batch-level pricing will be separated later.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {editField('mrp', 'MRP', 'number')}
                    {editField('net', 'Net Price', 'number')}
                    <div className="sm:col-span-2">{editField('scheme', 'Scheme / Offer', 'text', false)}</div>
                  </div>
                </section>

                <section className="bg-white rounded-2xl border border-black/[0.06] p-4 sm:p-5">
                  <div className="mb-4">
                    <h4 className="font-extrabold text-[#1C1C1E]">Inventory Snapshot</h4>
                    <p className="text-xs text-[#9CA3AF] mt-1">Temporary catalogue stock fields. Full batch management comes with the inventory system.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block text-xs font-bold text-[#374151]">
                      Stock
                      <input
                        type="number"
                        min="0"
                        value={(editing as Product & { stock?: number }).stock ?? 0}
                        onChange={e => setEditing({ ...editing, stock: Number(e.target.value) } as Product)}
                        className="mt-1.5 w-full px-3.5 py-2.5 border border-black/[0.10] rounded-xl text-sm font-normal focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/20 focus:border-[#0D9A55]"
                      />
                    </label>
                    {editField('expiry', 'Current Expiry')}
                  </div>
                </section>

                <div className="rounded-xl bg-[#FFF8E8] border border-[#F3D58A] px-4 py-3 text-xs text-[#795B13]">
                  <strong>Coming with the inventory upgrade:</strong> SKU, batch number, quantity, free quantity, PTR, GST, discount and multiple batch/expiry records will be managed separately from the Product Master.
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-black/[0.07] px-4 sm:px-6 py-4 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                <button type="button" onClick={() => setEditing(null)} className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold text-[#6B7280] hover:bg-[#F5F7F5]">Cancel</button>
                <button disabled={saving} className="w-full sm:w-auto px-5 py-2.5 bg-[#0D9A55] text-white rounded-xl text-sm font-bold disabled:opacity-60 shadow-sm">
                  {saving ? 'Saving…' : 'Save Product Changes'}
                </button>
              </div>
            </form>
          </div>
        );
      })()}
    
  {adding && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-3 sm:p-6">
    <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Add New Product
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Create a new product in your medical inventory.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAdding(false)}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6">

        {/* Basic Information */}
        <div className="mb-7">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-700">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            <label className="md:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Product Name *
              </span>
              <input
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    name: e.target.value,
                  })
                }
                placeholder="e.g. Paracetamol 500mg"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Company *
              </span>
              <input
                value={newProduct.company}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    company: e.target.value,
                  })
                }
                placeholder="Manufacturer"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Composition *
              </span>
              <input
                value={newProduct.composition}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    composition: e.target.value,
                  })
                }
                placeholder="e.g. Paracetamol"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Category *
              </span>
              <input
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    category: e.target.value,
                  })
                }
                placeholder="e.g. Tablets"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Medicine Type
              </span>
              <input
                value={newProduct.medicineType}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    medicineType: e.target.value,
                  })
                }
                placeholder="e.g. Allopathic"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Product Type
              </span>
              <input
                value={newProduct.productType}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    productType: e.target.value,
                  })
                }
                placeholder="e.g. Prescription"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Pack Size *
              </span>
              <input
                value={newProduct.pack}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    pack: e.target.value,
                  })
                }
                placeholder="e.g. 10 Tablets"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Country of Origin
              </span>
              <input
                value={newProduct.countryOfOrigin}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    countryOfOrigin: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

          </div>
        </div>

        {/* Identification */}
        <div className="mb-7">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-700">
            Identification
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            <label>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                SKU *
              </span>
              <input
                value={newProduct.sku}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    sku: e.target.value,
                  })
                }
                placeholder="e.g. PCM-500-001"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Barcode
              </span>
              <input
                value={newProduct.barcode}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    barcode: e.target.value,
                  })
                }
                placeholder="Optional barcode"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

          </div>
        </div>

        {/* Pricing */}
        <div className="mb-7">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-700">
            Pricing & Inventory
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

            <label>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                MRP
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newProduct.mrp}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    mrp: e.target.value,
                  })
                }
                placeholder="0.00"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Net Price
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newProduct.net}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    net: e.target.value,
                  })
                }
                placeholder="0.00"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Opening Stock
              </span>
              <input
                type="number"
                min="0"
                value={newProduct.stock}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    stock: e.target.value,
                  })
                }
                placeholder="0"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

          </div>
        </div>

        {/* Extra */}
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-700">
            Additional Details
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            <label>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Expiry Date
              </span>
              <input
                type="date"
                value={newProduct.expiry}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    expiry: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Scheme
              </span>
              <input
                value={newProduct.scheme}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    scheme: e.target.value,
                  })
                }
                placeholder="Optional scheme"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="md:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Image URL
              </span>
              <input
                value={newProduct.image}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    image: e.target.value,
                  })
                }
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="md:col-span-2">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Description
              </span>
              <textarea
                rows={4}
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    description: e.target.value,
                  })
                }
                placeholder="Product description..."
                className="w-full resize-none rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="flex items-center gap-3 md:col-span-2">
              <input
                type="checkbox"
                checked={newProduct.prescriptionRequired}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    prescriptionRequired: e.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">
                Prescription required
              </span>
            </label>

          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">

        <button
          type="button"
          onClick={() => setAdding(false)}
          disabled={creating}
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleCreateProduct}
          disabled={creating}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {creating ? 'Creating...' : 'Create Product'}
        </button>

      </div>
    </div>
  </div>
      )}
    </div>
  );
}

function ImportTab() {
 const { adminToken, addToast, refreshAdminData } = useApp();

const [phase, setPhase] = useState<
  'idle' | 'dragging' | 'parsing' | 'preview' | 'success'
>('idle');

const [parsedRows, setParsedRows] = useState<string[][]>([]);
const [selectedFileName, setSelectedFileName] = useState('');
const [selectedFileSize, setSelectedFileSize] = useState('');
const [parseErrors, setParseErrors] = useState<string[]>([]);
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [importing, setImporting] = useState(false);

const fileRef = useRef<HTMLInputElement>(null);

  // Inventory CSV format. Composition is included because it belongs to the Product Master.
  const PREVIEW_HEADERS = [
    'SKU',
    'Product Name',
    'Composition',
    'Batch Number',
    'Company',
    'Category',
    'Medicine Type',
    'Product Type',
    'Pack Size',
    'Quantity',
    'Free Quantity',
    'MRP',
    'PTR',
    'Discount',
    'GST',
    'Expiry Date',
  ];

  const SAMPLE_ROWS = [
    ['MED001', 'Augmentin 625 Duo', 'Amoxicillin 500mg + Clavulanic Acid 125mg', 'GSK-A123', 'GSK', 'Antibiotics', 'Tablet', 'Allopathic', '10x6', '100', '10', '250', '190', '10', '12', 'Dec 2027'],
    ['MED002', 'Paracetamol 500mg', 'Paracetamol 500mg', 'SUN-B456', 'Sun Pharma', 'Analgesics', 'Tablet', 'Allopathic', '10x10', '500', '20', '100', '75', '5', '12', 'Jun 2028'],
    ['MED003', 'Pantoprazole 40mg', 'Pantoprazole 40mg', 'ABB-C789', 'Abbott', 'Gastro', 'Tablet', 'Allopathic', '10x10', '350', '15', '180', '130', '8', '12', 'Mar 2028'],
  ];

const REQUIRED_INDEXES = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 15
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

      REQUIRED_INDEXES.forEach(index => {
        if (!row[index]) rowErrors.push(`${PREVIEW_HEADERS[index]} is required`);
      });

      const numericFields = [
        { index: 9, label: 'Quantity', integer: true },
        { index: 10, label: 'Free Quantity', integer: true, optional: true },
        { index: 11, label: 'MRP', integer: false },
        { index: 12, label: 'PTR', integer: false },
        { index: 13, label: 'Discount', integer: false, optional: true },
        { index: 14, label: 'GST', integer: false, optional: true },
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

      const mrp = Number(row[11]);
      const ptr = Number(row[12]);
      if (Number.isFinite(mrp) && Number.isFinite(ptr) && ptr > mrp) {
        rowErrors.push('PTR cannot be greater than MRP');
      }

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
    const exampleRow = [
      'PCM-500-001',
      'Paracetamol 500mg',
      'Paracetamol 500mg',
      'BATCH-001',
      'Example Pharma',
      'Analgesics',
      'Tablet',
      'Allopathic',
      '10 Tablets',
      '100',
      '0',
      '100',
      '80',
      '5',
      '12',
      '2027-12-31',
    ];

    const csv = [
      PREVIEW_HEADERS.join(','),
      exampleRow.map(value => `"${value.replace(/"/g, '""')}"`).join(','),
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
    addToast('Inventory CSV template downloaded', 'success');
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

  if (fileRef.current) {
    fileRef.current.value = '';
  }
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
  if (!parsedRows.length || parseErrors.length) {
    return;
  }

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

    const result = await importInventoryCsv(
      adminToken,
      selectedFile
    );

    await refreshAdminData();

    addToast(
      result.message ||
        `Inventory imported successfully. ${result.imported ?? result.created ?? parsedRows.length} rows processed.`,
      'success'
    );

    setPhase('success');
  } catch (error) {
    addToast(
      error instanceof Error
        ? error.message
        : 'Inventory import failed.',
      'error'
    );
  } finally {
    setImporting(false);
  }
};

  return (
    <div className="w-full max-w-6xl">
      {phase === 'idle' || phase === 'dragging' ? (
        <div>
          <div className="mb-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#1C1C1E]">Import Inventory CSV</h3>
              <p className="text-xs sm:text-sm text-[#6B7280] mt-1 leading-5">
                Download the template, fill in your product and batch inventory details, then upload the completed CSV. The file is validated in your browser before import.
              </p>
            </div>
            <button type="button" onClick={downloadTemplate} className="w-full sm:w-auto shrink-0 px-4 py-2.5 rounded-xl border border-[#0D9A55]/20 bg-[#E8F5EE] text-[#0D9A55] text-xs font-bold hover:bg-[#D8F0E2] transition-colors">
              Download Template
            </button>
          </div>

          <div
            onDragOver={e => { e.preventDefault(); setPhase('dragging'); }}
            onDragLeave={() => setPhase('idle')}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-12 min-h-[220px] sm:min-h-[300px] flex flex-col items-center justify-center text-center cursor-pointer transition-all ${phase === 'dragging' ? 'border-[#0D9A55] bg-[#E8F5EE]' : 'border-black/[0.12] hover:border-[#0D9A55] hover:bg-[#F5F7F5]'}`}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#E8F5EE] flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-[#0D9A55]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <p className="font-bold text-[#1C1C1E] text-sm sm:text-base mb-1">
              {phase === 'dragging' ? 'Drop to upload inventory' : 'Drag & drop your inventory CSV here'}
            </p>
            <p className="text-xs sm:text-sm text-[#6B7280] mb-4">or tap to browse files</p>
            <span className="px-5 py-2.5 bg-[#0D9A55] text-white text-xs sm:text-sm font-bold rounded-xl shadow-[0_4px_12px_rgba(13,154,85,0.22)]">
              Choose CSV File
            </span>
            <p className="text-[10px] text-[#9CA3AF] mt-4">CSV files only</p>
          </div>

          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) handleFile(file); }} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
            <div className="p-4 bg-white rounded-xl border border-black/[0.06]">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-[#6B7280] mb-2">Required columns</p>
              <p className="text-xs font-mono text-[#1C1C1E] leading-5 break-words">
                SKU, Product Name, Composition, Batch Number, Company, Category, Medicine Type, Product Type, Pack Size, Quantity, MRP, PTR, Expiry Date
              </p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-black/[0.06]">
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-[#6B7280] mb-2">Optional columns</p>
              <p className="text-xs font-mono text-[#1C1C1E] leading-5 break-words">Free Quantity, Discount, GST</p>
            </div>
          </div>
</div>
      ) : phase === 'parsing' ? (
        <div className="bg-white rounded-2xl p-8 sm:p-16 text-center shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
          <svg className="w-10 h-10 text-[#0D9A55] animate-spin mx-auto" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p className="text-sm text-[#1C1C1E] font-bold mt-4">Reading inventory CSV…</p>
          <p className="text-xs text-[#6B7280] mt-1 break-all">{selectedFileName}</p>
          <p className="text-xs text-[#9CA3AF] mt-3">Parsing and validating the actual file</p>
        </div>
      ) : phase === 'preview' ? (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="min-w-0">
              <h3 className="font-extrabold text-[#1C1C1E] text-base sm:text-lg">Inventory Preview</h3>
              <p className="text-xs sm:text-sm text-[#6B7280] mt-1 break-words">
                {selectedFileName || 'CSV file'} · {selectedFileSize} · {parsedRows.length} valid row{parsedRows.length === 1 ? '' : 's'}
              </p>
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
                  <ul className="mt-3 space-y-1.5 list-disc pl-4 text-xs text-red-700">
                    {parseErrors.slice(0, 20).map((error, index) => <li key={`${error}-${index}`}>{error}</li>)}
                  </ul>
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

          {parsedRows.length > 0 && <div className="hidden md:block bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F5F7F5]">
                  <tr>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wide">#</th>
                    {PREVIEW_HEADERS.map(h => <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-[#6B7280] uppercase tracking-wide whitespace-nowrap">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.05]">
                  {parsedRows.map((row, i) => (
                    <tr key={i} className="hover:bg-[#F5F7F5]/50">
                      <td className="px-3 py-2.5 text-xs text-[#9CA3AF]">{i + 1}</td>
                      {PREVIEW_HEADERS.map((_, j) => <td key={j} className="px-3 py-2.5 text-[#1C1C1E] text-xs whitespace-nowrap">{row[j] || '—'}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>}

          {parsedRows.length > 0 && <div className="md:hidden space-y-3 mb-4">
            {parsedRows.map((row, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-black/[0.04]">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-black/[0.06]">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wide text-[#9CA3AF]">Inventory {i + 1}</p>
                    <p className="font-bold text-sm text-[#1C1C1E] mt-1 break-words">{row[1] || 'Unnamed product'}</p>
                    <p className="text-xs text-[#6B7280] mt-1 break-words">{row[0]} · {row[4]}</p>
                  </div>
                  <span className="shrink-0 px-2 py-1 bg-[#F5F7F5] rounded-lg text-[10px] font-bold text-[#6B7280]">{row[5] || '—'}</span>
                </div>
                <p className="text-xs text-[#6B7280] mt-3"><strong className="text-[#1C1C1E]">Composition:</strong> {row[2] || '—'}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3 mt-3 border-t border-black/[0.06]">
                  {[['Batch', row[3]], ['Pack', row[8]], ['Quantity', row[9]], ['Free', row[10]], ['MRP', `₹${row[11]}`], ['PTR', `₹${row[12]}`], ['Discount', row[13] ? `${row[13]}%` : '—'], ['GST', row[14] ? `${row[14]}%` : '—'], ['Expiry', row[15]]].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[10px] uppercase tracking-wide text-[#9CA3AF]">{label}</p>
                      <p className="text-xs font-semibold text-[#1C1C1E] mt-1 break-words">{value || '—'}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button onClick={() => { void handleConfirm(); }} disabled={importing || !parsedRows.length || parseErrors.length > 0} className="w-full sm:w-auto px-6 py-3 bg-[#0D9A55] text-white rounded-2xl font-bold hover:bg-[#0A7A43] transition-colors shadow-[0_4px_16px_rgba(13,154,85,0.3)] text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none">
              {importing
  ? 'Importing…'
  : parseErrors.length > 0
    ? 'Fix CSV Errors First'
    : `Import ${parsedRows.length} Inventory Row${parsedRows.length === 1 ? '' : 's'} →`}
            </button>
            <button onClick={resetImport} className="w-full sm:w-auto px-6 py-3 border border-black/[0.08] text-[#6B7280] rounded-2xl font-semibold text-sm hover:bg-[#F5F7F5]">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 sm:p-16 text-center shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
          <div className="w-16 h-16 rounded-full bg-[#E8F5EE] flex items-center justify-center mx-auto mb-4">
            <svg className="w-9 h-9 text-[#0D9A55]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 className="text-xl font-extrabold text-[#1C1C1E] mb-2">Inventory CSV validated!</h3>
          <p className="text-[#6B7280] text-sm mb-6">The file structure and inventory rows passed the browser validation.</p>
          <button onClick={resetImport} className="w-full sm:w-auto px-5 py-2.5 border-2 border-[#0D9A55] text-[#0D9A55] rounded-xl font-semibold text-sm hover:bg-[#E8F5EE] transition-colors">Validate Another File</button>
        </div>
      )}
    </div>
  );
}

function CustomersTab() {
  const { customers, orders, refreshCustomers } = useApp();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const visible = customers.filter(c =>
    `${c.name} ${c.email} ${c.phone || ''} ${c.shopName || ''} ${c.gstNumber || ''} ${c.drugLicence || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || null;

  const customerOrders = selectedCustomer
    ? orders
        .filter(o => {
          const samePhone = selectedCustomer.phone && o.retailerPhone === selectedCustomer.phone;
          const sameShop = selectedCustomer.shopName && o.retailerShop === selectedCustomer.shopName;
          const sameName = selectedCustomer.name && o.retailerName === selectedCustomer.name;
          return Boolean(samePhone || sameShop || sameName);
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  const customerTotal = customerOrders.reduce((sum, o) => sum + o.total, 0);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshCustomers();
    } finally {
      setRefreshing(false);
    }
  };

  const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wide text-[#9CA3AF] font-bold">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#1C1C1E] break-words">{value || '—'}</p>
    </div>
  );

  if (selectedCustomer) {
    return (
      <div>
        {/* Back */}
        <button
          onClick={() => setSelectedCustomerId(null)}
          className="flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#0D9A55] transition-colors mb-5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Customers
        </button>

        {/* Customer header */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-[0_2px_16px_rgba(0,0,0,.06)] border border-black/[.04] mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-16 h-16 shrink-0 rounded-2xl bg-[#EAF7F0] text-[#0D9A55] flex items-center justify-center text-2xl font-extrabold">
              {(selectedCustomer.name || 'C').trim().charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#1C1C1E] break-words">
                  {selectedCustomer.name || 'Unnamed customer'}
                </h2>
                <span className="px-2.5 py-1 rounded-full bg-[#E8F5EE] text-[#0D9A55] text-[10px] font-bold uppercase tracking-wide">
                  Customer
                </span>
              </div>
              <p className="text-sm text-[#6B7280] mt-1 break-all">{selectedCustomer.email || 'No email provided'}</p>
              <p className="text-xs text-[#9CA3AF] mt-1">Customer ID: {selectedCustomer.id}</p>
            </div>
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-4">
              <div className="rounded-xl bg-[#F5F7F5] px-4 py-3 text-center min-w-[90px]">
                <p className="text-lg font-extrabold text-[#0D9A55]">{customerOrders.length || selectedCustomer.orderCount || 0}</p>
                <p className="text-[10px] text-[#6B7280] font-semibold">Orders</p>
              </div>
              <div className="rounded-xl bg-[#F5F7F5] px-4 py-3 text-center min-w-[110px]">
                <p className="text-lg font-extrabold text-[#1C1C1E]">₹{customerTotal.toLocaleString()}</p>
                <p className="text-[10px] text-[#6B7280] font-semibold">Order Value</p>
              </div>
            </div>
          </div>
        </div>

        {/* Details + address */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-5">
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,.06)]">
            <h3 className="font-extrabold text-[#1C1C1E] mb-4">Personal Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="Full Name" value={selectedCustomer.name} />
              <InfoRow label="Email" value={selectedCustomer.email} />
              <InfoRow label="Phone" value={selectedCustomer.phone} />
              <InfoRow label="Customer ID" value={selectedCustomer.id} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,.06)]">
            <h3 className="font-extrabold text-[#1C1C1E] mb-4">Business Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow label="Shop Name" value={selectedCustomer.shopName} />
              <InfoRow label="GST Number" value={selectedCustomer.gstNumber} />
              <InfoRow label="Drug Licence" value={selectedCustomer.drugLicence} />
              <InfoRow label="Account Role" value="CUSTOMER" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_16px_rgba(0,0,0,.06)] lg:col-span-2">
            <h3 className="font-extrabold text-[#1C1C1E] mb-4">Address & Delivery Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="sm:col-span-2 lg:col-span-2"><InfoRow label="Address" value={selectedCustomer.address} /></div>
              <InfoRow label="City" value={selectedCustomer.city} />
              <InfoRow label="State" value={selectedCustomer.state} />
              <InfoRow label="Pincode" value={selectedCustomer.pincode} />
            </div>
          </div>
        </div>

        {/* Order history */}
        <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,.06)] overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-black/[.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-[#1C1C1E]">Order History</h3>
              <p className="text-xs text-[#6B7280] mt-1">All orders currently associated with this customer.</p>
            </div>
            <span className="text-sm font-bold text-[#0D9A55]">₹{customerTotal.toLocaleString()} total</span>
          </div>

          {customerOrders.length > 0 ? (
            <>
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F5F7F5] text-xs text-[#6B7280]">
                    <tr>
                      <th className="text-left p-4">Order</th>
                      <th className="text-left p-4">Date</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-right p-4">Items</th>
                      <th className="text-right p-4">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[.05]">
                    {customerOrders.map(order => (
                      <tr key={order.id} className="hover:bg-[#FAFBFA]">
                        <td className="p-4 font-mono font-semibold text-[#1C1C1E]">{order.id}</td>
                        <td className="p-4 text-[#6B7280]">{new Date(order.date).toLocaleDateString('en-IN')}</td>
                        <td className="p-4"><span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${STATUS_STYLES[order.status]}`}>{order.status}</span></td>
                        <td className="p-4 text-right text-[#6B7280]">{order.items.length}</td>
                        <td className="p-4 text-right font-extrabold text-[#0D9A55]">₹{order.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="sm:hidden p-3 space-y-2">
                {customerOrders.map(order => (
                  <div key={order.id} className="rounded-xl bg-[#F5F7F5] p-3 border border-black/[.04]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-bold text-[#1C1C1E] break-all">{order.id}</p>
                        <p className="text-xs text-[#6B7280] mt-1">{new Date(order.date).toLocaleDateString('en-IN')}</p>
                      </div>
                      <p className="font-extrabold text-[#0D9A55] shrink-0">₹{order.total.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_STYLES[order.status]}`}>{order.status}</span>
                      <span className="text-xs text-[#6B7280]">{order.items.length} item{order.items.length === 1 ? '' : 's'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-10 text-center text-sm text-[#6B7280]">No matching orders found for this customer.</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Search + refresh */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 min-w-0">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="m20 20-4-4" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, shop, phone, email or GST..." className="w-full pl-10 pr-4 py-3 bg-white border border-black/[.08] rounded-xl text-sm outline-none focus:border-[#0D9A55] focus:ring-2 focus:ring-[#0D9A55]/10" />
        </div>
        <button onClick={handleRefresh} disabled={refreshing} className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#0D9A55] text-white text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2">
          <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M20 11a8.1 8.1 0 0 0-14.9-4M4 5v5h5" /><path strokeLinecap="round" d="M4 13a8.1 8.1 0 0 0 14.9 4M20 19v-5h-5" /></svg>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Mobile customer cards */}
      <div className="md:hidden space-y-3">
        {visible.map(c => (
          <div key={c.id} className="bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(0,0,0,.06)] border border-black/[.04]">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 shrink-0 rounded-xl bg-[#EAF7F0] text-[#0D9A55] flex items-center justify-center font-extrabold">{(c.name || 'C').trim().charAt(0).toUpperCase()}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><p className="font-bold text-[#1C1C1E] truncate">{c.name || 'Unnamed customer'}</p><p className="text-xs text-[#6B7280] break-all mt-0.5">{c.email || 'No email'}</p></div>
                  <div className="shrink-0 text-right"><p className="text-lg font-extrabold text-[#0D9A55] leading-none">{c.orderCount}</p><p className="text-[10px] text-[#9CA3AF] mt-1">orders</p></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
              <div className="rounded-xl bg-[#F7F8F7] px-3 py-2.5 min-w-0"><p className="text-[10px] uppercase tracking-wide text-[#9CA3AF] font-bold">Shop</p><p className="text-sm font-semibold text-[#374151] truncate mt-0.5">{c.shopName || '—'}</p></div>
              <div className="rounded-xl bg-[#F7F8F7] px-3 py-2.5 min-w-0"><p className="text-[10px] uppercase tracking-wide text-[#9CA3AF] font-bold">Phone</p><p className="text-sm font-semibold text-[#374151] truncate mt-0.5">{c.phone || '—'}</p></div>
            </div>
            {(c.gstNumber || c.drugLicence) && <div className="flex flex-wrap gap-2 mt-3">{c.gstNumber && <span className="max-w-full truncate px-2.5 py-1.5 rounded-lg bg-[#F5F7F5] text-[11px] font-semibold text-[#6B7280]">GST: {c.gstNumber}</span>}{c.drugLicence && <span className="max-w-full truncate px-2.5 py-1.5 rounded-lg bg-[#F5F7F5] text-[11px] font-semibold text-[#6B7280]">DL: {c.drugLicence}</span>}</div>}
            <button onClick={() => setSelectedCustomerId(c.id)} className="w-full mt-3 py-2.5 rounded-xl bg-[#E8F5EE] text-[#0D9A55] text-xs font-bold hover:bg-[#D8F0E2] transition-colors">View Full Details →</button>
          </div>
        ))}
        {visible.length === 0 && <div className="bg-white rounded-2xl p-10 text-center text-sm text-[#6B7280] shadow-[0_2px_16px_rgba(0,0,0,.06)]">No customers found</div>}
      </div>

      {/* Desktop customer table */}
      <div className="hidden md:block bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,.06)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F7F5] text-xs text-[#6B7280]"><tr><th className="text-left p-4">Customer</th><th className="text-left p-4">Shop</th><th className="text-left p-4">Phone</th><th className="text-right p-4">Orders</th><th className="text-right p-4">Action</th></tr></thead>
            <tbody className="divide-y divide-black/[.05]">
              {visible.map(c => <tr key={c.id} className="hover:bg-[#FAFBFA] transition-colors"><td className="p-4 font-semibold">{c.name}<p className="font-normal text-xs text-[#6B7280] mt-0.5">{c.email}</p></td><td className="p-4">{c.shopName || '—'}</td><td className="p-4">{c.phone || '—'}</td><td className="p-4 text-right text-[#0D9A55] font-bold">{c.orderCount}</td><td className="p-4 text-right"><button onClick={() => setSelectedCustomerId(c.id)} className="px-3 py-2 rounded-lg bg-[#E8F5EE] text-[#0D9A55] text-xs font-bold hover:bg-[#D8F0E2]">View Details</button></td></tr>)}
              {visible.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-[#6B7280]">No customers found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-3 text-xs text-[#9CA3AF] text-center sm:text-left">Showing {visible.length} of {customers.length} customers</div>
    </div>
  );
}

export default function Admin() {
  const { navigate, adminTab, setAdminTab, isAdminLoggedIn, logoutAdmin, refreshAdminData, refreshCustomers, products, customers } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => { if (isAdminLoggedIn) { refreshAdminData().catch(() => undefined); refreshCustomers().catch(() => undefined); } }, [isAdminLoggedIn, refreshAdminData, refreshCustomers]);

  if (!isAdminLoggedIn) {
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
          <p className="text-sm text-[#6B7280] mb-5">Sign in using an administrator email and password.</p>
          <button onClick={() => navigate('login')} className="w-full py-3 bg-[#0D9A55] text-white rounded-xl font-bold hover:bg-[#0A7A43] transition-colors text-sm">
            Go to Sign In
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
      key: 'customers', label: 'Customers',
      icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 19.125a9.35 9.35 0 01-9 0M12 12a3.375 3.375 0 100-6.75A3.375 3.375 0 0012 12z" /><path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.125v-.675a6.75 6.75 0 00-13.5 0v.675" /></svg>,
    },
    {
      key: 'import',
      label: 'Inventory CSV',
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
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 bg-[#1C1C1E] text-white flex-col min-h-screen sticky top-0 h-screen">
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

       <div className="px-3 py-4 border-t border-white/10 space-y-1">

  {/* Logout */}
  <button
    type="button"
    onClick={() => {
      logoutAdmin();
      setMobileMenuOpen(false);
    }}
    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full"
  >
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h9.75"
      />
    </svg>

    Logout
  </button>

  {/* Back to Store */}
  <button
    type="button"
    onClick={() => navigate('catalogue')}
    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/10 transition-all w-full"
  >
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
      />
    </svg>

    Back to Store
  </button>

</div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-[60] w-[280px] max-w-[85vw] bg-[#1C1C1E] text-white flex flex-col md:hidden transition-transform duration-300 ease-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0D9A55] to-[#0A7A43] flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Singh Medical</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wide">Admin Panel</p>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white/70 hover:text-white"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => {
                setAdminTab(tab.key);
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                adminTab === tab.key
                  ? 'bg-[#0D9A55] text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}

              {tab.key === 'orders' && (
                <span className="ml-auto text-[10px] font-bold bg-white/20 px-2 py-1 rounded-full">
                  {orders.filter(o => o.status === 'Submitted').length}
                </span>
              )}
            </button>
          ))}
        </nav>

       <div className="px-3 py-4 border-t border-white/10 space-y-1">

  {/* Logout */}
  <button
    type="button"
    onClick={() => {
      logoutAdmin();
      setMobileMenuOpen(false);
    }}
    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all w-full"
  >
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h9.75"
      />
    </svg>

    Logout
  </button>

  {/* Back to Store */}
  <button
    type="button"
    onClick={() => {
      navigate('catalogue');
      setMobileMenuOpen(false);
    }}
    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/10 transition-all w-full"
  >
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 00-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 00-.621 4.72"
      />
    </svg>

    Back to Store
  </button>

</div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 px-4 sm:px-6 py-4 sm:py-8">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-5">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-11 h-11 rounded-xl bg-[#1C1C1E] text-white flex items-center justify-center shadow-sm"
            aria-label="Open admin menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="text-right">
            <p className="text-xs font-bold text-[#1C1C1E]">Singh Medical</p>
            <p className="text-[10px] text-[#9CA3AF]">Admin Panel</p>
          </div>
        </div>

        <div className="mb-5 sm:mb-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.16em] text-[#0D9A55]">Singh Medical Stores</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1C1E] mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {tabs.find(t => t.key === adminTab)?.label}
              </h1>
              <p className="text-sm text-[#6B7280] mt-1">
                {adminTab === 'orders' && 'Review, manage and update customer orders'}
                {adminTab === 'products' && 'Manage medicines, compositions, pricing and catalogue information'}
                {adminTab === 'customers' && 'View registered customers and their complete order history'}
                {adminTab === 'import' && 'Bulk import medicine inventory by SKU and batch via CSV upload'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#6B7280] bg-white border border-black/[0.06] rounded-xl px-3 py-2 w-fit shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#0D9A55]" />
              Admin workspace
            </div>
          </div>

          <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5 sm:gap-3 mt-4">
            {[
              { label: 'Total Orders', value: orders.length, tab: 'orders' as AdminTab },
              { label: 'Pending Orders', value: orders.filter(o => o.status === 'Submitted').length, tab: 'orders' as AdminTab, accent: true },
              { label: 'Products', value: products.length, tab: 'products' as AdminTab },
              { label: 'Customers', value: customers.length, tab: 'customers' as AdminTab },
            ].map(stat => (
              <button key={stat.label} onClick={() => setAdminTab(stat.tab)} className="text-left bg-white rounded-2xl border border-black/[0.05] p-3 sm:p-4 shadow-[0_2px_14px_rgba(0,0,0,0.04)] hover:border-[#0D9A55]/30 hover:-translate-y-0.5 transition-all">
                <p className="text-[10px] sm:text-xs uppercase tracking-wide font-bold text-[#9CA3AF]">{stat.label}</p>
                <p className={`text-xl sm:text-2xl font-extrabold mt-1 ${stat.accent ? 'text-[#0D9A55]' : 'text-[#1C1C1E]'}`}>{stat.value}</p>
              </button>
            ))}
          </div>
        </div>

        {adminTab === 'orders' && <OrdersTab />}
        {adminTab === 'products' && <ProductsTab />}
        {adminTab === 'customers' && <CustomersTab />}
        {adminTab === 'import' && <ImportTab />}
      </main>
    </div>
  );
}
