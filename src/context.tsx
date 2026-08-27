import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { CartItem, Order, Page, AdminTab, ToastMsg, CheckoutDetails } from './types';
import { MOCK_ORDERS, PRODUCTS } from './data';

interface AppContextValue {
  page: Page;
  navigate: (p: Page) => void;
  navigateToProduct: (id: string) => void;
  selectedProductId: string | null;
  adminTab: AdminTab;
  setAdminTab: (t: AdminTab) => void;

  cartItems: CartItem[];
  addToCart: (productId: string, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;

  isCartOpen: boolean;
  setIsCartOpen: (v: boolean) => void;

  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;

  toasts: ToastMsg[];
  addToast: (message: string, type?: ToastMsg['type']) => void;
  removeToast: (id: string) => void;

  orders: Order[];
  setOrders: (orders: Order[]) => void;
  confirmedOrderId: string;
  placeOrder: (details: CheckoutDetails) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>('home');
  const [adminTab, setAdminTab] = useState<AdminTab>('orders');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [confirmedOrderId, setConfirmedOrderId] = useState('');
  const toastCounter = useRef(0);

  const navigate = useCallback((p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const navigateToProduct = useCallback((id: string) => {
    setSelectedProductId(id);
    setPage('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const addToast = useCallback((message: string, type: ToastMsg['type'] = 'success') => {
    const id = `toast-${++toastCounter.current}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToCart = useCallback((productId: string, qty = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) {
        return prev.map(i => i.productId === productId ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, { productId, quantity: qty }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems(prev => prev.filter(i => i.productId !== productId));
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setCartItems(prev => prev.filter(i => i.productId !== productId));
    } else {
      setCartItems(prev => prev.map(i => i.productId === productId ? { ...i, quantity: qty } : i));
    }
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => {
    const product = PRODUCTS.find(p => p.id === item.productId);
    return sum + (product ? product.net * item.quantity : 0);
  }, 0);

  const placeOrder = useCallback((details: CheckoutDetails) => {
    const orderId = `ORD-2024-${String(orders.length + 1).padStart(3, '0')}`;
    const newOrder: Order = {
      id: orderId,
      retailerName: isLoggedIn ? 'Rajesh Kumar' : details.shopName,
      retailerShop: details.shopName,
      retailerPhone: details.contact,
      retailerAddress: details.address,
      date: new Date().toISOString().split('T')[0],
      items: cartItems.map(item => {
        const product = PRODUCTS.find(p => p.id === item.productId)!;
        return { productId: item.productId, productName: product.name, quantity: item.quantity, rate: product.net };
      }),
      total: cartTotal,
      status: 'Submitted',
    };
    setOrders(prev => [newOrder, ...prev]);
    setConfirmedOrderId(orderId);
    clearCart();
    navigate('confirmation');
  }, [cartItems, cartTotal, orders.length, isLoggedIn, clearCart, navigate]);

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isCartOpen]);

  return (
    <AppContext.Provider value={{
      page, navigate, navigateToProduct, selectedProductId, adminTab, setAdminTab,
      cartItems, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal,
      isCartOpen, setIsCartOpen,
      isLoggedIn, setIsLoggedIn,
      toasts, addToast, removeToast,
      orders, setOrders, confirmedOrderId, placeOrder,
    }}>
      {children}
    </AppContext.Provider>
  );
}
