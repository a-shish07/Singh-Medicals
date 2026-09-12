import { useState } from 'react';
import { useApp } from '../../context';
import { STATUS_STYLES } from './constants';

export default function CustomersTab() {
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