import { useState } from 'react';
import { useApp } from '../../context';
import type { OrderStatus } from '../../types';
import { STATUS_STYLES, ALL_STATUSES } from './constants';

export default function OrdersTab() {
const {
  orders,
  updateOrderStatus,
  sendTrackingEmail,
  addToast,
} = useApp();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [searchQ, setSearchQ] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [deliveryPartner, setDeliveryPartner] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [sendingTracking, setSendingTracking] = useState(false);

  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    const q = searchQ.toLowerCase();
    const matchSearch = !q || o.id.toLowerCase().includes(q) || o.retailerShop.toLowerCase().includes(q) || o.retailerName.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

   const updateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
      addToast('Order status updated', 'success');
    }
    catch (error) { addToast(error instanceof Error ? error.message : 'Could not update order', 'error'); }
  };

   const sendTracking = async (orderId: string) => {
  if (!trackingId.trim() || !deliveryPartner.trim()) {
    addToast(
      'Enter both delivery partner and tracking ID',
      'error'
    );
    return;
  }

  setSendingTracking(true);

  try {
    await sendTrackingEmail(
      orderId,
      trackingId.trim(),
      deliveryPartner.trim()
    );

    addToast(
      'Tracking details sent to customer',
      'success'
    );
  } catch (error) {
    addToast(
      error instanceof Error
        ? error.message
        : 'Could not send tracking details',
      'error'
    );
  } finally {
    setSendingTracking(false);
  }
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
              <h4 className="font-semibold text-sm text-[#6B7280] mb-3 uppercase tracking-wide">Dispatch details</h4>
              <div className="space-y-2">
                <input value={deliveryPartner} onChange={event => setDeliveryPartner(event.target.value)} placeholder={selectedOrder.deliveryPartner || 'Delivery partner (e.g. Delhivery)'} className="w-full rounded-xl border border-black/[0.08] bg-[#F5F7F5] px-3 py-2 text-sm outline-none focus:border-[#0D9A55]" />
                               <input value={trackingId} onChange={event => setTrackingId(event.target.value)} placeholder={selectedOrder.trackingId || 'Tracking ID'} className="w-full rounded-xl border border-black/[0.08] bg-[#F5F7F5] px-3 py-2 text-sm outline-none focus:border-[#0D9A55]" />
                {selectedOrder.trackingId && <p className="text-xs text-[#0D9A55]">Current: {selectedOrder.deliveryPartner} — {selectedOrder.trackingId}</p>}
                                <button
               onClick={() => sendTracking(selectedOrder.id)}
                  disabled={ selectedOrder.status === 'Cancelled' ||
  !trackingId.trim() ||
  !deliveryPartner.trim() ||
  sendingTracking
}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[#0D9A55] text-white text-sm font-bold hover:bg-[#0B8548] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {selectedOrder.status === 'Cancelled'
  ? 'Tracking Unavailable for Cancelled Order'
  : sendingTracking
    ? 'Sending…'
    : 'Send Tracking to Customer'}
                </button>
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
