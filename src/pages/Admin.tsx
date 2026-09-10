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
  const { products, updateProduct, createProduct, addToast } = useApp();

  type PricingType =
    | 'NONE'
    | 'DISCOUNT_ON_PTR'
    | 'SAME_PRODUCT_BONUS'
    | 'DIFFERENT_PRODUCT_BONUS'
    | 'SAME_PRODUCT_BONUS_AND_DISCOUNT'
    | 'DIFFERENT_PRODUCT_BONUS_AND_DISCOUNT';

  type AdminProduct = Product & {
    ptr?: number | null;
    gst?: number | null;
    discountType?: PricingType | null;
    discountValue?: number | null;
    discountAmount?: number | null;
    effectivePtr?: number | null;
    buyQuantity?: number | null;
    freeQuantity?: number | null;
    stock?: number;
    barcode?: string | null;
  };

  type ProductForm = {
    name: string;
    company: string;
    composition: string;
    category: string;
    medicineType: string;
    productType: string;
    pack: string;
    countryOfOrigin: string;
    barcode: string;
    prescriptionRequired: boolean;
    image: string;
    description: string;
    mrp: string;
    discountType: PricingType;
    discountValue: string;
    buyQuantity: string;
    freeQuantity: string;
    expiry: string;
    stock: string;
    isActive: boolean;
  };

  const emptyForm: ProductForm = {
    name: '',
    company: '',
    composition: '',
    category: '',
    medicineType: '',
    productType: '',
    pack: '',
    countryOfOrigin: 'India',
    barcode: '',
    prescriptionRequired: false,
    image: '',
    description: '',
    mrp: '',
    discountType: 'NONE',
    discountValue: '',
    buyQuantity: '',
    freeQuantity: '',
    expiry: '',
    stock: '',
    isActive: true,
  };

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [offerFilter, setOfferFilter] = useState<'All' | 'Offers' | 'No Offer'>('All');
  const [sortKey, setSortKey] = useState<'name' | 'mrp' | 'effectivePtr' | 'stock'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const adminProducts = products as AdminProduct[];
  const categories = ['All', ...Array.from(new Set(adminProducts.map(p => p.category).filter(Boolean))).sort()];

  const calculatePreview = (source: ProductForm) => {
    const mrp = Number(source.mrp) || 0;
    const discount = Math.min(100, Math.max(0, Number(source.discountValue) || 0));
    const buy = Math.max(0, Math.floor(Number(source.buyQuantity) || 0));
    const free = Math.max(0, Math.floor(Number(source.freeQuantity) || 0));
    const ptr = Number((mrp * 0.7619).toFixed(2));

    const sameBonus =
      source.discountType === 'SAME_PRODUCT_BONUS' ||
      source.discountType === 'SAME_PRODUCT_BONUS_AND_DISCOUNT';

    const hasDiscount =
      source.discountType === 'DISCOUNT_ON_PTR' ||
      source.discountType === 'SAME_PRODUCT_BONUS_AND_DISCOUNT' ||
      source.discountType === 'DIFFERENT_PRODUCT_BONUS_AND_DISCOUNT';

    const bonusAdjustedPtr = sameBonus && buy > 0 && free > 0
      ? Number((ptr * (buy / (buy + free))).toFixed(2))
      : ptr;

    const discountAmount = hasDiscount
      ? Number((bonusAdjustedPtr * (discount / 100)).toFixed(2))
      : 0;

    const effectivePtr = Math.max(0, Number((bonusAdjustedPtr - discountAmount).toFixed(2)));

    return {
      ptr,
      gst: 5,
      discount,
      discountAmount,
      effectivePtr,
      buy: sameBonus ? buy : 0,
      free: sameBonus ? free : 0,
    };
  };

  const preview = calculatePreview(form);

  const getEffectivePtr = (product: AdminProduct) =>
    calculatePreview({
      ...emptyForm,
      mrp: product.mrp == null ? '' : String(product.mrp),
      discountType: (product.discountType || 'NONE') as PricingType,
      discountValue: product.discountValue == null ? '' : String(product.discountValue),
      buyQuantity: product.buyQuantity == null ? '' : String(product.buyQuantity),
      freeQuantity: product.freeQuantity == null ? '' : String(product.freeQuantity),
    }).effectivePtr;

  const openAdd = () => {
    setForm({ ...emptyForm });
    setAdding(true);
  };

  const openEdit = (product: AdminProduct) => {
    setForm({
      name: product.name || '',
      company: product.company || '',
      composition: product.composition || '',
      category: product.category || '',
      medicineType: product.medicineType || '',
      productType: product.productType || '',
      pack: product.pack || '',
      countryOfOrigin: product.countryOfOrigin || 'India',
      barcode: product.barcode || '',
      prescriptionRequired: Boolean(product.prescriptionRequired),
      image: product.image || '',
      description: product.description || '',
      mrp: product.mrp == null ? '' : String(product.mrp),
      discountType: (product.discountType || 'NONE') as PricingType,
      discountValue: product.discountValue == null ? '' : String(product.discountValue),
      buyQuantity: product.buyQuantity == null ? '' : String(product.buyQuantity),
      freeQuantity: product.freeQuantity == null ? '' : String(product.freeQuantity),
      expiry: product.expiry ? String(product.expiry).slice(0, 10) : '',
      stock: product.stock == null ? '0' : String(product.stock),
      isActive: product.isActive !== false,
    });
    setEditing(product);
  };

  const closeForm = () => {
    setAdding(false);
    setEditing(null);
    setSaving(false);
  };

  const setField = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  const submitProduct = async () => {
    if (!form.name.trim() || !form.company.trim() || !form.composition.trim() || !form.category.trim() || !form.pack.trim()) {
      addToast('Product name, company, composition, category and pack size are required.', 'error');
      return;
    }

    if (!form.mrp || Number(form.mrp) < 0) {
      addToast('Enter a valid MRP.', 'error');
      return;
    }

    if (!form.expiry) {
      addToast('Expiry date is required.', 'error');
      return;
    }

    const needsSameBonus =
      form.discountType === 'SAME_PRODUCT_BONUS' ||
      form.discountType === 'SAME_PRODUCT_BONUS_AND_DISCOUNT';

    if (needsSameBonus && (!(Number(form.buyQuantity) > 0) || !(Number(form.freeQuantity) > 0))) {
      addToast('Buy Quantity and Free Quantity are required for a same-product offer.', 'error');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        company: form.company.trim(),
        composition: form.composition.trim(),
        category: form.category.trim(),
        medicineType: form.medicineType.trim() || undefined,
        productType: form.productType.trim() || undefined,
        pack: form.pack.trim(),
        countryOfOrigin: form.countryOfOrigin.trim() || undefined,
        barcode: form.barcode.trim() || undefined,
        prescriptionRequired: form.prescriptionRequired,
        image: form.image.trim() || undefined,
        description: form.description.trim() || undefined,
        mrp: Number(form.mrp),
        discountType: form.discountType,
        discountValue: Number(form.discountValue) || 0,
        buyQuantity: Number(form.buyQuantity) || 0,
        freeQuantity: Number(form.freeQuantity) || 0,
        expiry: form.expiry,
        stock: Number(form.stock) || 0,
        isActive: form.isActive,
      };

      if (editing) {
        await (updateProduct as any)(editing.id, payload);
        addToast('Product updated successfully.', 'success');
      } else {
        await (createProduct as any)(payload);
        addToast('Product added successfully.', 'success');
      }

      closeForm();
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Could not save product.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(current => current === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const hasOffer = (p: AdminProduct) =>
    p.discountType && p.discountType !== 'NONE';

  const filtered = adminProducts
    .filter(p => {
      const q = search.toLowerCase().trim();
      const matchesSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        p.company.toLowerCase().includes(q) ||
        p.composition.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
      const matchesOffer = offerFilter === 'All' ||
        (offerFilter === 'Offers' ? Boolean(hasOffer(p)) : !hasOffer(p));
      return matchesSearch && matchesCategory && matchesOffer;
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'name') return a.name.localeCompare(b.name) * dir;
      if (sortKey === 'mrp') return (Number(a.mrp) - Number(b.mrp)) * dir;
      if (sortKey === 'stock') return (Number(a.stock || 0) - Number(b.stock || 0)) * dir;
      return (getEffectivePtr(a) - getEffectivePtr(b)) * dir;
    });

  const discountLabel = (p: AdminProduct) => {
    const type = p.discountType || 'NONE';
    if (type === 'SAME_PRODUCT_BONUS' || type === 'SAME_PRODUCT_BONUS_AND_DISCOUNT') {
      return `BUY ${p.buyQuantity || 0} GET ${p.freeQuantity || 0}`;
    }
    if (type === 'DISCOUNT_ON_PTR' || type === 'DIFFERENT_PRODUCT_BONUS_AND_DISCOUNT') {
      return `${Number(p.discountValue || 0)}% OFF`;
    }
    if (type === 'DIFFERENT_PRODUCT_BONUS') return 'BONUS';
    return 'No Offer';
  };

  const price = (value: number | null | undefined) =>
    `₹${Number(value || 0).toFixed(2)}`;

  const ProductFormModal = () => (
    <div className="fixed inset-0 z-[100] bg-slate-950/60 p-2 sm:p-5 flex items-center justify-center">
      <div className="w-full max-w-6xl max-h-[96vh] overflow-hidden rounded-3xl bg-[#F7F9FC] shadow-2xl flex flex-col">
        <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-7 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] font-extrabold text-[#1266F1]">Inventory Management</p>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">{editing ? 'Edit Medicine' : 'Add Medicine'}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage product information, purchase pricing and offers in one place.</p>
          </div>
          <button type="button" onClick={closeForm} className="h-10 w-10 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4 sm:gap-6">
            <div className="space-y-4">
              <section className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Medicine Details</h3>
                    <p className="text-xs text-slate-500 mt-1">Basic information shown to pharmacy buyers.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold">PRODUCT</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {[
                    ['name', 'Product Name', 'e.g. Paracetamol 500mg', true],
                    ['company', 'Company / Manufacturer', 'e.g. GSK', true],
                    ['composition', 'Composition', 'e.g. Paracetamol 500mg', true],
                    ['category', 'Category', 'e.g. Tablets', true],
                    ['medicineType', 'Medicine Type', 'e.g. Allopathic', false],
                    ['productType', 'Product Type', 'e.g. Tablet', false],
                    ['pack', 'Pack Size', 'e.g. 10 Tablets', true],
                    ['countryOfOrigin', 'Country of Origin', 'India', false],
                  ].map(([key, label, placeholder, required]) => (
                    <label key={key as string} className={key === 'composition' ? 'sm:col-span-2' : ''}>
                      <span className="text-xs font-bold text-slate-700">{label as string}{required ? ' *' : ''}</span>
                      <input
                        value={form[key as keyof ProductForm] as string}
                        onChange={e => setField(key as keyof ProductForm, e.target.value as never)}
                        placeholder={placeholder as string}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.75 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </label>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5">
                <div className="mb-4">
                  <h3 className="text-sm font-extrabold text-slate-900">Selling & Stock</h3>
                  <p className="text-xs text-slate-500 mt-1">Only enter MRP and stock. PTR and effective price are calculated automatically.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <label>
                    <span className="text-xs font-bold text-slate-700">MRP *</span>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                      <input type="number" min="0" step="0.01" value={form.mrp} onChange={e => setField('mrp', e.target.value)} className="w-full rounded-xl border border-slate-200 px-8 py-2.75 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="0.00" />
                    </div>
                  </label>
                  <label>
                    <span className="text-xs font-bold text-slate-700">Opening Stock</span>
                    <input type="number" min="0" step="1" value={form.stock} onChange={e => setField('stock', e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.75 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="0" />
                  </label>
                  <label>
                    <span className="text-xs font-bold text-slate-700">Expiry Date *</span>
                    <input type="date" value={form.expiry} onChange={e => setField('expiry', e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.75 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                  </label>
                </div>
              </section>

              <section className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Medicine Settings</h3>
                    <p className="text-xs text-slate-500 mt-1">Optional catalogue information.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <label>
                    <span className="text-xs font-bold text-slate-700">Barcode</span>
                    <input value={form.barcode} onChange={e => setField('barcode', e.target.value)} placeholder="Optional barcode" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.75 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 mt-5 sm:mt-0 cursor-pointer">
                    <input type="checkbox" checked={form.prescriptionRequired} onChange={e => setField('prescriptionRequired', e.target.checked)} className="h-4 w-4 accent-blue-600" />
                    <span><span className="block text-xs font-bold text-slate-800">Prescription required</span><span className="block text-[11px] text-slate-500 mt-0.5">Mark this medicine as prescription-only.</span></span>
                  </label>
                  <label className="sm:col-span-2">
                    <span className="text-xs font-bold text-slate-700">Description</span>
                    <textarea value={form.description} onChange={e => setField('description', e.target.value)} rows={3} placeholder="Optional medicine description" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                  </label>
                </div>
              </section>
            </div>

            <div className="space-y-4">
              <section className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 xl:sticky xl:top-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Purchase Pricing</h3>
                    <p className="text-xs text-slate-500 mt-1">Medimny-style PTR and offer calculation.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold">AUTO</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                    <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">MRP</p>
                    <p className="mt-1 text-lg font-extrabold text-slate-900">{price(Number(form.mrp) || 0)}</p>
                  </div>
                  <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
                    <p className="text-[10px] uppercase tracking-wide font-bold text-blue-500">PTR</p>
                    <p className="mt-1 text-lg font-extrabold text-blue-700">{price(preview.ptr)}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                    <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">GST</p>
                    <p className="mt-1 text-lg font-extrabold text-slate-900">{preview.gst}%</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                    <p className="text-[10px] uppercase tracking-wide font-bold text-emerald-600">Effective PTR</p>
                    <p className="mt-1 text-lg font-extrabold text-emerald-700">{price(preview.effectivePtr)}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                    <p className="text-xs font-extrabold text-slate-800">Offer</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <label>
                      <span className="text-xs font-bold text-slate-700">Offer Type</span>
                      <select value={form.discountType} onChange={e => setField('discountType', e.target.value as PricingType)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.75 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10">
                        <option value="NONE">No Offer</option>
                        <option value="DISCOUNT_ON_PTR">Discount on PTR</option>
                        <option value="SAME_PRODUCT_BONUS">Buy X Get Y — Same Product</option>
                        <option value="DIFFERENT_PRODUCT_BONUS">Buy X Get Y — Different Product</option>
                        <option value="SAME_PRODUCT_BONUS_AND_DISCOUNT">Bonus + Discount — Same Product</option>
                        <option value="DIFFERENT_PRODUCT_BONUS_AND_DISCOUNT">Bonus + Discount — Different Product</option>
                      </select>
                    </label>

                    {(form.discountType === 'DISCOUNT_ON_PTR' || form.discountType === 'SAME_PRODUCT_BONUS_AND_DISCOUNT' || form.discountType === 'DIFFERENT_PRODUCT_BONUS_AND_DISCOUNT') && (
                      <label>
                        <span className="text-xs font-bold text-slate-700">Discount on PTR (%)</span>
                        <div className="relative mt-1.5">
                          <input type="number" min="0" max="100" step="0.01" value={form.discountValue} onChange={e => setField('discountValue', e.target.value)} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.75 pr-9 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="0" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                        </div>
                      </label>
                    )}

                    {(form.discountType === 'SAME_PRODUCT_BONUS' || form.discountType === 'DIFFERENT_PRODUCT_BONUS' || form.discountType === 'SAME_PRODUCT_BONUS_AND_DISCOUNT' || form.discountType === 'DIFFERENT_PRODUCT_BONUS_AND_DISCOUNT') && (
                      <div className="grid grid-cols-2 gap-3">
                        <label>
                          <span className="text-xs font-bold text-slate-700">Buy Quantity</span>
                          <input type="number" min="1" step="1" value={form.buyQuantity} onChange={e => setField('buyQuantity', e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.75 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="10" />
                        </label>
                        <label>
                          <span className="text-xs font-bold text-slate-700">Free Quantity</span>
                          <input type="number" min="1" step="1" value={form.freeQuantity} onChange={e => setField('freeQuantity', e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.75 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="2" />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-slate-900 text-white p-4">
                  <div className="flex items-center justify-between text-xs text-slate-300"><span>PTR</span><span>{price(preview.ptr)}</span></div>
                  <div className="flex items-center justify-between text-xs text-slate-300 mt-2"><span>Discount Amount</span><span>- {price(preview.discountAmount)}</span></div>
                  <div className="flex items-center justify-between text-sm font-extrabold mt-3 pt-3 border-t border-white/10"><span>Final Effective PTR</span><span className="text-emerald-300">{price(preview.effectivePtr)}</span></div>
                  {preview.buy > 0 && preview.free > 0 && <p className="mt-3 text-[11px] text-slate-300">Offer: <strong className="text-white">BUY {preview.buy} GET {preview.free} FREE</strong></p>}
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="bg-white border-t border-slate-200 px-4 sm:px-7 py-3.5 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
          <button type="button" onClick={closeForm} className="px-5 py-2.75 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
          <button type="button" disabled={saving} onClick={() => void submitProduct()} className="px-6 py-2.75 rounded-xl bg-[#1266F1] text-white text-sm font-extrabold shadow-sm hover:bg-[#0F56D0] disabled:opacity-60">{saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Product'}</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="rounded-2xl bg-gradient-to-r from-[#0E63E8] to-[#2380F7] text-white p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-blue-100">Inventory</p>
            <h2 className="text-xl sm:text-2xl font-extrabold mt-1">Medicine Inventory</h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-1">Manage medicines, wholesale pricing, offers and stock like a professional B2B pharmacy portal.</p>
          </div>
          <button onClick={openAdd} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-[#1266F1] px-4 py-2.5 text-sm font-extrabold hover:bg-blue-50 shadow-sm">
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ['Total Medicines', adminProducts.length, 'catalogue'],
          ['Active Stock', adminProducts.reduce((s, p) => s + Number(p.stock || 0), 0), 'units'],
          ['Products on Offer', adminProducts.filter(hasOffer).length, 'offers'],
          ['Low Stock', adminProducts.filter(p => Number(p.stock || 0) <= 10).length, 'need attention'],
        ].map(([label, value, note]) => (
          <div key={label as string} className="bg-white rounded-2xl border border-slate-200 p-4">
            <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">{label as string}</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1">{Number(value).toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{note as string}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4">
        <div className="flex flex-col xl:flex-row gap-3">
          <div className="relative flex-1">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search medicine, company or composition…" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.75 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.75 text-sm outline-none focus:border-blue-500">
              {categories.map(category => <option key={category}>{category}</option>)}
            </select>
            <select value={offerFilter} onChange={e => setOfferFilter(e.target.value as typeof offerFilter)} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.75 text-sm outline-none focus:border-blue-500">
              <option value="All">All Products</option>
              <option value="Offers">Offers Only</option>
              <option value="No Offer">No Offer</option>
            </select>
          </div>
        </div>
      </div>

      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-[10px] uppercase tracking-wide text-slate-500">
                <th className="text-left px-4 py-3">Medicine</th>
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-right px-4 py-3 cursor-pointer" onClick={() => toggleSort('mrp')}>MRP</th>
                <th className="text-right px-4 py-3">PTR</th>
                <th className="text-center px-4 py-3">GST</th>
                <th className="text-center px-4 py-3">Offer</th>
                <th className="text-right px-4 py-3 cursor-pointer" onClick={() => toggleSort('effectivePtr')}>Effective PTR</th>
                <th className="text-right px-4 py-3 cursor-pointer" onClick={() => toggleSort('stock')}>Stock</th>
                <th className="text-right px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(product => {
                const effective = getEffectivePtr(product);
                const offer = discountLabel(product);
                return (
                  <tr key={product.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <button onClick={() => setSelectedProduct(product)} className="text-left">
                        <p className="font-bold text-slate-900 hover:text-blue-600">{product.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{product.composition} · {product.pack}</p>
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{product.company}</td>
                    <td className="px-4 py-3.5 text-right text-slate-600">{price(product.mrp)}</td>
                    <td className="px-4 py-3.5 text-right font-semibold text-blue-700">{price(product.ptr ?? Number(product.mrp) * 0.7619)}</td>
                    <td className="px-4 py-3.5 text-center text-slate-600">{Number(product.gst ?? 5)}%</td>
                    <td className="px-4 py-3.5 text-center"><span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${offer === 'No Offer' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700'}`}>{offer}</span></td>
                    <td className="px-4 py-3.5 text-right font-extrabold text-emerald-700">{price(effective)}</td>
                    <td className="px-4 py-3.5 text-right"><span className={`font-bold ${Number(product.stock || 0) <= 10 ? 'text-red-600' : 'text-slate-700'}`}>{Number(product.stock || 0)}</span></td>
                    <td className="px-4 py-3.5 text-right"><button onClick={() => openEdit(product)} className="rounded-lg bg-blue-50 text-blue-700 px-3 py-1.5 text-xs font-bold hover:bg-blue-100">Edit</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="px-6 py-12 text-center text-sm text-slate-500">No medicines match your search.</div>}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">Showing {filtered.length} of {adminProducts.length} medicines</div>
      </div>

      <div className="md:hidden space-y-3">
        {filtered.map(product => (
          <div key={product.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <button onClick={() => setSelectedProduct(product)} className="text-left">
                  <h3 className="font-extrabold text-slate-900 truncate">{product.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{product.company}</p>
                </button>
              </div>
              <span className={`shrink-0 px-2 py-1 rounded-lg text-[10px] font-extrabold ${hasOffer(product) ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{discountLabel(product)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] text-slate-400 font-bold">MRP</p><p className="font-extrabold text-slate-900 mt-1">{price(product.mrp)}</p></div>
              <div className="rounded-xl bg-blue-50 p-3"><p className="text-[10px] text-blue-500 font-bold">PTR</p><p className="font-extrabold text-blue-700 mt-1">{price(product.ptr ?? Number(product.mrp) * 0.7619)}</p></div>
              <div className="rounded-xl bg-emerald-50 p-3"><p className="text-[10px] text-emerald-600 font-bold">EFFECTIVE PTR</p><p className="font-extrabold text-emerald-700 mt-1">{price(getEffectivePtr(product))}</p></div>
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] text-slate-400 font-bold">STOCK</p><p className={`font-extrabold mt-1 ${Number(product.stock || 0) <= 10 ? 'text-red-600' : 'text-slate-900'}`}>{Number(product.stock || 0)}</p></div>
            </div>
            <button onClick={() => openEdit(product)} className="w-full mt-3 rounded-xl bg-blue-50 text-blue-700 py-2.5 text-xs font-extrabold">Edit Product</button>
          </div>
        ))}
        {filtered.length === 0 && <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500">No medicines match your search.</div>}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-[90] bg-slate-950/60 p-3 sm:p-5 flex items-center justify-center" onClick={() => setSelectedProduct(null)}>
          <div className="w-full max-w-4xl max-h-[94vh] overflow-y-auto rounded-3xl bg-[#F7F9FC] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="bg-white border-b border-slate-200 p-5 sm:p-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-blue-600">Medicine Details</p>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">{selectedProduct.name}</h2>
                <p className="text-sm text-slate-500 mt-1">{selectedProduct.company} · {selectedProduct.pack}</p>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="h-10 w-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                  ['MRP', price(selectedProduct.mrp), 'slate'],
                  ['PTR', price(selectedProduct.ptr ?? Number(selectedProduct.mrp) * 0.7619), 'blue'],
                  ['GST', `${Number(selectedProduct.gst ?? 5)}%`, 'slate'],
                  ['Effective PTR', price(getEffectivePtr(selectedProduct)), 'green'],
                  ['Stock', String(Number(selectedProduct.stock || 0)), 'slate'],
                ].map(([label, value, tone]) => (
                  <div key={label as string} className={`rounded-2xl p-4 ${tone === 'blue' ? 'bg-blue-50' : tone === 'green' ? 'bg-emerald-50' : 'bg-white border border-slate-200'}`}>
                    <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">{label as string}</p>
                    <p className={`mt-1 text-lg font-extrabold ${tone === 'blue' ? 'text-blue-700' : tone === 'green' ? 'text-emerald-700' : 'text-slate-900'}`}>{value as string}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <h3 className="font-extrabold text-slate-900">Product Information</h3>
                  <div className="mt-3 divide-y divide-slate-100">
                    {[
                      ['Composition', selectedProduct.composition],
                      ['Category', selectedProduct.category],
                      ['Medicine Type', selectedProduct.medicineType],
                      ['Product Type', selectedProduct.productType],
                      ['Expiry', selectedProduct.expiry],
                    ].map(([label, value]) => <div key={label as string} className="py-2.5 flex justify-between gap-4 text-sm"><span className="text-slate-400">{label as string}</span><span className="text-right font-semibold text-slate-800">{value || '—'}</span></div>)}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <h3 className="font-extrabold text-slate-900">Offer & Pricing</h3>
                  <div className="mt-3 divide-y divide-slate-100">
                    <div className="py-2.5 flex justify-between gap-4 text-sm"><span className="text-slate-400">Offer</span><span className="font-extrabold text-emerald-700">{discountLabel(selectedProduct)}</span></div>
                    <div className="py-2.5 flex justify-between gap-4 text-sm"><span className="text-slate-400">Discount Amount</span><span className="font-semibold text-slate-800">{price(selectedProduct.discountAmount)}</span></div>
                    <div className="py-2.5 flex justify-between gap-4 text-sm"><span className="text-slate-400">Buy / Free</span><span className="font-semibold text-slate-800">{selectedProduct.buyQuantity || 0} / {selectedProduct.freeQuantity || 0}</span></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={() => { setSelectedProduct(null); openEdit(selectedProduct); }} className="rounded-xl bg-[#1266F1] text-white px-5 py-2.5 text-sm font-extrabold">Edit Medicine</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {(adding || editing) && <ProductFormModal />}
    </div>
  );
}

function ImportTab() {
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
  const { navigate, adminTab, setAdminTab, isAdminLoggedIn, refreshAdminData, refreshCustomers, products, customers } = useApp();
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

        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={() => navigate('catalogue')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/10 transition-all w-full"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
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
                {adminTab === 'import' && 'Bulk import medicines with automatic PTR, GST, offers and Effective PTR'}
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
