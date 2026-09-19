import { useEffect, useState } from 'react';
import { useApp } from '../context';
import type { OrderStatus } from '../types';
import { calculateOrderTotals, finalOrderItemPrice } from '../lib/pricing';

const STATUS_STYLES: Record<OrderStatus, string> = {
  Submitted: 'bg-amber-100 text-amber-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Packed: 'bg-purple-100 text-purple-700',
  Dispatched: 'bg-cyan-100 text-cyan-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const STATUS_ICONS: Record<OrderStatus, string> = {
  Submitted: '🕐',
  Confirmed: '✓',
  Packed: '📦',
  Dispatched: '🚚',
  Delivered: '✓',
  Cancelled: '✕',
};

export default function OrderHistory() {
 const {
  orders,
  navigate,
  navigateToOrder,
  isLoggedIn,
  refreshOrders,
  addToast,
  products,
  cancelOrder,
  downloadInvoice,
} = useApp();
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancellationTarget, setCancellationTarget] = useState<(typeof orders)[number] | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const cancel = async () => {
    if (!cancellationTarget) return;
    const orderId = cancellationTarget.id;
    setCancellingOrderId(orderId);
    try {
      await cancelOrder(orderId, cancellationReason.trim() || undefined);
      addToast('Order cancelled. Stock has been restored.', 'success');
      setCancellationTarget(null);
      setCancellationReason('');
    }
    catch (error) { addToast(error instanceof Error ? error.message : 'Could not cancel order', 'error'); }
    finally { setCancellingOrderId(null); }
  };

  useEffect(() => {
    if (isLoggedIn) {
      refreshOrders().catch((error) =>
        addToast(
          error instanceof Error
            ? error.message
            : 'Could not load your orders',
          'error'
        )
      );
    }
  }, [isLoggedIn, refreshOrders, addToast]);

  const myOrders = isLoggedIn ? orders : [];
  const orderItemPrice = (item: (typeof orders)[number]['items'][number]) =>
    finalOrderItemPrice(
      products.find((product) => product.id === item.productId),
      Number(item.paidQuantity ?? item.quantity ?? 0),
      item.rate
    );
  const orderItemTotalQuantity = (item: (typeof orders)[number]['items'][number]) =>
    Number(item.totalQuantity ?? (item.paidQuantity ?? item.quantity ?? 0) + (item.freeQuantity ?? 0));
  const orderValue = (order: (typeof orders)[number]) =>
    calculateOrderTotals(
      order.items.reduce(
        (sum, item) => sum + orderItemPrice(item) * orderItemTotalQuantity(item),
        0
      )
    ).grandTotal;

  return (
    <div className="min-h-screen bg-[#F7F9F7]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-7">
          <div>
            <h1
              className="text-2xl sm:text-3xl font-extrabold text-[#1C1C1E]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              My Orders
            </h1>

            <p className="text-sm text-[#6B7280] mt-1">
              View and track all your  orders.
            </p>
          </div>

          <button
            onClick={() => navigate('catalogue')}
            className="shrink-0 px-4 sm:px-5 py-2.5 bg-[#0D9A55] text-white rounded-xl text-sm font-bold hover:bg-[#0A7A43] transition-colors shadow-sm"
          >
            <span className="hidden sm:inline">+ New Order</span>
            <span className="sm:hidden">+ Order</span>
          </button>
        </div>

        {/* Empty State */}
        {myOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">

              <div className="w-16 h-16 rounded-2xl bg-[#E8F5EE] flex items-center justify-center mb-5">
                <svg
                  className="w-8 h-8 text-[#0D9A55]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
                  />
                </svg>
              </div>

              <h3 className="text-lg font-bold text-[#1C1C1E] mb-2">
                No orders yet
              </h3>

              <p className="text-[#6B7280] mb-6 text-sm max-w-sm">
                Start browsing the catalogue to place your first 
                order.
              </p>

              <button
                onClick={() => navigate('catalogue')}
                className="px-5 py-2.5 bg-[#0D9A55] text-white rounded-xl font-semibold hover:bg-[#0A7A43] transition-colors text-sm"
              >
                Browse Catalogue
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">

            {myOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-[0_5px_25px_rgba(0,0,0,0.08)] transition-shadow"
              >

                {/* Order Header */}
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">

                        <span className="font-mono text-sm sm:text-base font-bold text-[#1C1C1E]">
                          {order.id}
                        </span>

                        <span
                          className={`px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-1 ${STATUS_STYLES[order.status]}`}
                        >
                          <span>{STATUS_ICONS[order.status]}</span>
                          {order.status}
                        </span>
                      </div>

                      <p className="text-sm text-[#6B7280]">
                        {new Date(order.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    {/* Total */}
                    <div className="sm:text-right shrink-0">
                      <p className="text-xs text-[#9CA3AF] mb-0.5">
                        Order Total
                      </p>

                      <p
                        className="text-xl sm:text-2xl font-extrabold text-[#1C1C1E]"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        ₹{orderValue(order).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Delivery Details */}
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">

                    <div className="bg-[#F7F9F7] rounded-xl p-3.5">
                      <p className="text-[11px] uppercase tracking-wide font-bold text-[#9CA3AF] mb-1">
                        Delivery To
                      </p>

                      <p className="text-sm font-semibold text-[#1C1C1E]">
                        {order.retailerShop || order.retailerName}
                      </p>

                      <p className="text-xs text-[#6B7280] mt-1 line-clamp-2">
                        {order.retailerAddress}
                      </p>
                    </div>

                    <div className="bg-[#F7F9F7] rounded-xl p-3.5">
                      <p className="text-[11px] uppercase tracking-wide font-bold text-[#9CA3AF] mb-1">
                        Payment
                      </p>

                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-[#E8F5EE] flex items-center justify-center text-sm">
                          💵
                        </span>

                        <div>
                          <p className="text-sm font-semibold text-[#1C1C1E]">
                            Cash on Delivery
                          </p>
                          <p className="text-xs text-[#6B7280]">
                            Pay when your order arrives
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Items */}
                  <div className="mt-5">
                    <div className="flex items-center justify-between mb-2.5">
                      <h3 className="text-xs uppercase tracking-wide font-bold text-[#6B7280]">
                        Order Items
                      </h3>

                      <span className="text-xs text-[#9CA3AF]">
                        {order.items.length}{' '}
                        {order.items.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    <div className="border border-black/[0.06] rounded-xl overflow-hidden">
                      {order.items.map((item, index) => (
                        <div
                          key={`${item.productId}-${index}`}
                          className="flex items-center justify-between gap-4 px-3.5 py-3 border-b border-black/[0.05] last:border-b-0"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#1C1C1E] truncate">
                              {item.productName}
                            </p>

                            <p className="text-xs text-[#9CA3AF] mt-0.5">
                              ₹{orderItemPrice(item).toLocaleString('en-IN')} ×{' '}
                              {orderItemTotalQuantity(item)}
                            </p>
                          </div>

                          <span className="text-sm font-bold text-[#1C1C1E] shrink-0">
                            ₹
                            {(orderItemTotalQuantity(item) * orderItemPrice(item)).toLocaleString(
                              'en-IN'
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex flex-col-reverse sm:flex-row gap-3 mt-5">

                    <button
                     onClick={() => navigateToOrder(order.id)}
                      className="flex-1 sm:flex-none sm:px-6 py-3 border-2 border-[#0D9A55] text-[#0D9A55] rounded-xl font-bold text-sm hover:bg-[#E8F5EE] transition-colors"
                    >
                      🚚 Track Order
                    </button>

                    {['Submitted', 'Confirmed'].includes(order.status) && (
                      <button onClick={() => { setCancellationTarget(order); setCancellationReason(''); }} disabled={cancellingOrderId === order.id} className="flex-1 sm:flex-none sm:px-6 py-3 border-2 border-red-500 text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 transition-colors disabled:opacity-50">
                        {cancellingOrderId === order.id ? 'Cancelling…' : 'Cancel Order'}
                      </button>
                    )}
                    {order.invoiceFileName && (
                      <button onClick={() => downloadInvoice(order.id).catch((error) => addToast(error.message || 'Could not download invoice', 'error'))} className="flex-1 sm:flex-none sm:px-6 py-3 border-2 border-[#0D9A55] text-[#0D9A55] rounded-xl font-bold text-sm hover:bg-[#E8F5EE] transition-colors">
                        Download Invoice
                      </button>
                    )}
                    <button
                      onClick={() => navigate('catalogue')}
                      className="flex-1 sm:flex-none sm:px-6 py-3 bg-[#0D9A55] text-white rounded-xl font-bold text-sm hover:bg-[#0A7A43] transition-colors"
                    >
                      + New Order
                    </button>

                  </div>
                </div>
              </div>
            ))}

          </div>
        )}
      </div>

      {cancellationTarget && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-950/45 p-0 sm:p-5" role="dialog" aria-modal="true" aria-labelledby="cancel-order-title">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m15 9-6 6m0-6 6 6m6 3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
              </div>
              <div>
                <h2 id="cancel-order-title" className="text-lg font-extrabold text-[#1C1C1E]">Cancel this order?</h2>
                <p className="mt-1 text-sm leading-6 text-[#6B7280]">Your order <span className="font-mono font-semibold text-[#1C1C1E]">{cancellationTarget.id}</span> will be cancelled and cannot be restored. We will notify you and Singh Medicals by email.</p>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">Cancellation is available only before packing. Stock reserved for this order will be released.</div>
            <label className="mt-5 block text-sm font-bold text-[#1C1C1E]">Reason <span className="font-normal text-[#9CA3AF]">(optional)</span></label>
            <textarea value={cancellationReason} onChange={(event) => setCancellationReason(event.target.value)} maxLength={500} rows={3} placeholder="Tell us why you are cancelling…" className="mt-2 w-full resize-none rounded-xl border border-black/[0.10] bg-[#F7F9F7] px-3 py-2.5 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100" />
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button onClick={() => setCancellationTarget(null)} disabled={cancellingOrderId !== null} className="rounded-xl px-4 py-2.5 text-sm font-bold text-[#6B7280] hover:bg-slate-100 disabled:opacity-50">Keep order</button>
              <button onClick={cancel} disabled={cancellingOrderId !== null} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">{cancellingOrderId ? 'Cancelling…' : 'Yes, cancel order'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
