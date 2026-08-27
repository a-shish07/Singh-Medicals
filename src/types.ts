export type Category = 'Tablets' | 'Syrups' | 'Injections' | 'Eye Drops' | 'Topical';
export type OrderStatus = 'Submitted' | 'Confirmed' | 'Packed' | 'Dispatched' | 'Delivered' | 'Cancelled';
export type Page = 'home' | 'catalogue' | 'product' | 'cart' | 'checkout' | 'confirmation' | 'login' | 'orders' | 'tracking' | 'about' | 'contact' | 'faq' | 'terms' | 'privacy' | 'notfound' | 'admin';
export type AdminTab = 'orders' | 'products' | 'import';

export interface Product {
  id: string;
  name: string;
  company: string;
  composition: string;
  category: Category;
  pack: string;
  mrp: number;
  net: number;
  scheme?: string;
  expiry: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  rate: number;
}

export interface Order {
  id: string;
  retailerName: string;
  retailerShop: string;
  retailerPhone: string;
  retailerAddress: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
}

export interface ToastMsg {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface CheckoutDetails {
  shopName: string;
  address: string;
  contact: string;
}
