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

export default function OrderHistory() {
  const { orders, navigate, isLoggedIn } = useApp();

  const myOrders = orders.filter(o => o.retailerPhone === '9876543210' || o.retailerShop === 'Kumar Medical Store' || isLoggedIn);

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-extrabold text-[#1C1C1E]" style={{ fontFamily: "'DM Sans', sans-serif" }}>My Orders</h1>
        <button
          onClick={() => navigate('catalogue')}
          className="px-4 py-2 bg-[#0D9A55] text-white rounded-xl text-sm font-semibold hover:bg-[#0A7A43] transition-colors"
        >
          + New Order
        </button>
      </div>

      {myOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#E8F5EE] flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#0D9A55]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-[#1C1C1E] mb-2">No orders yet</h3>
          <p className="text-[#6B7280] mb-6 text-sm">Start browsing the catalogue to place your first wholesale order.</p>
          <button onClick={() => navigate('catalogue')} className="px-5 py-2.5 bg-[#0D9A55] text-white rounded-xl font-semibold hover:bg-[#0A7A43] transition-colors text-sm">
            Browse Catalogue
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {myOrders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5 hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-shadow">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-sm font-bold text-[#1C1C1E]">{order.id}</span>
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${STATUS_STYLES[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-[#6B7280]">{new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xl font-extrabold text-[#1C1C1E]" style={{ fontFamily: "'DM Sans', sans-serif" }}>₹{order.total.toLocaleString()}</p>
                  <p className="text-xs text-[#6B7280]">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-black/[0.06]">
                <div className="flex flex-wrap gap-1.5">
                  {order.items.map(item => (
                    <span key={item.productId} className="px-2.5 py-1 bg-[#F5F7F5] rounded-lg text-xs text-[#6B7280] font-medium">
                      {item.productName} ×{item.quantity}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
