import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useApp } from '../context';
import type { AdminTab } from '../types';
import OrdersTab from '../components/admin/OrdersTab';
import ProductsTab from '../components/admin/ProductsTab';
import CustomersTab from '../components/admin/CustomersTab';
import ImportTab from '../components/admin/ImportTab';

export default function Admin() {
  const { navigate, adminTab, setAdminTab, isAdminLoggedIn, refreshAdminData, refreshCustomers, products, customers, orders } = useApp();
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

  const tabs: { key: AdminTab; label: string; icon: ReactNode }[] = [
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