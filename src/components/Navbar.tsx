import { useState } from 'react';
import { useApp } from '../context';

export default function Navbar() {
  const { navigate, cartCount, setIsCartOpen, isLoggedIn, setIsLoggedIn, addToast, page } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', page: 'home' as const },
    { label: 'Shop', page: 'catalogue' as const },
    { label: 'About Us', page: 'about' as const },
    { label: 'Contact', page: 'contact' as const },
    { label: 'FAQ', page: 'faq' as const },
  ];

  const isActive = (p: string) => page === p;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-black/[0.06] shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <button onClick={() => navigate('home')} className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0D9A55] to-[#0A7A43] flex items-center justify-center shadow-[0_2px_8px_rgba(13,154,85,0.3)]">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-[#1C1C1E] text-sm leading-tight tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>Singh Medical</p>
              <p className="text-[10px] text-[#6B7280] leading-tight font-medium tracking-wide uppercase">Stores</p>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <button
                key={link.page}
                onClick={() => navigate(link.page)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-150 font-medium ${
                  isActive(link.page)
                    ? 'bg-[#E8F5EE] text-[#0D9A55]'
                    : 'text-[#6B7280] hover:text-[#0D9A55] hover:bg-[#E8F5EE]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {isLoggedIn && (
              <button
                onClick={() => navigate('orders')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#6B7280] hover:text-[#0D9A55] hover:bg-[#E8F5EE] rounded-lg transition-all font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
                My Orders
              </button>
            )}

            <button
              onClick={() => {
                if (isLoggedIn) {
                  setIsLoggedIn(false);
                  addToast('Logged out successfully', 'info');
                } else {
                  navigate('login');
                }
              }}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#6B7280] hover:text-[#0D9A55] hover:bg-[#E8F5EE] rounded-lg transition-all font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              {isLoggedIn ? 'Logout' : 'Login'}
            </button>

            <button
              onClick={() => navigate('admin')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#6B7280] hover:text-[#0D9A55] hover:bg-[#E8F5EE] rounded-lg transition-all font-medium border border-black/[0.08]"
            >
              Admin
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-[#E8F5EE] transition-colors group"
            >
              <svg className="w-5 h-5 text-[#1C1C1E] group-hover:text-[#0D9A55] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#0D9A55] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(13,154,85,0.4)]">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(v => !v)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-black/[0.06] py-3 flex flex-col gap-1">
            {navLinks.map(link => (
              <button
                key={link.page}
                onClick={() => { navigate(link.page); setMobileMenuOpen(false); }}
                className={`text-left px-3 py-2.5 text-sm rounded-lg transition-all font-medium ${
                  isActive(link.page)
                    ? 'bg-[#E8F5EE] text-[#0D9A55]'
                    : 'text-[#6B7280] hover:text-[#0D9A55] hover:bg-[#E8F5EE]'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="h-px bg-black/[0.06] my-1" />
            <button onClick={() => navigate('tracking')} className="text-left px-3 py-2.5 text-sm text-[#6B7280] hover:text-[#0D9A55] hover:bg-[#E8F5EE] rounded-lg transition-all font-medium" >
              Track Order
            </button>
            {isLoggedIn && (
              <button
                onClick={() => { navigate('orders'); setMobileMenuOpen(false); }}
                className="text-left px-3 py-2.5 text-sm text-[#6B7280] hover:text-[#0D9A55] hover:bg-[#E8F5EE] rounded-lg transition-all font-medium"
              >
                My Orders
              </button>
            )}
            <button
              onClick={() => { navigate(isLoggedIn ? 'catalogue' : 'login'); setMobileMenuOpen(false); if (isLoggedIn) { setIsLoggedIn(false); addToast('Logged out', 'info'); } }}
              className="text-left px-3 py-2.5 text-sm text-[#6B7280] hover:text-[#0D9A55] hover:bg-[#E8F5EE] rounded-lg transition-all font-medium"
            >
              {isLoggedIn ? 'Logout' : 'Login / Register'}
            </button>
            <button
              onClick={() => { navigate('admin'); setMobileMenuOpen(false); }}
              className="text-left px-3 py-2.5 text-sm text-[#6B7280] hover:text-[#0D9A55] hover:bg-[#E8F5EE] rounded-lg transition-all font-medium"
            >
              Admin Panel
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
