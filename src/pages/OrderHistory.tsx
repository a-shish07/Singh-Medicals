import { useEffect } from 'react';
import { useApp } from '../context';
import type { OrderStatus } from '../types';

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
} = useApp();

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
                        ₹{order.total.toLocaleString('en-IN')}
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
                              ₹{item.rate.toLocaleString('en-IN')} ×{' '}
                              {item.quantity}
                            </p>
                          </div>

                          <span className="text-sm font-bold text-[#1C1C1E] shrink-0">
                            ₹
                            {(item.quantity * item.rate).toLocaleString(
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
    </div>
  );
}