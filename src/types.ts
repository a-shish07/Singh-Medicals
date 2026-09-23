export type Category = 'Tablets' | 'Syrups' | 'Injections' | 'Eye Drops' | 'Topical';
export type OrderStatus = 'Submitted' | 'Confirmed' | 'Packed' | 'Dispatched' | 'Delivered' | 'Cancelled';
export type Page = 'home' | 'catalogue' | 'product' | 'cart' | 'checkout' | 'confirmation' | 'login' | 'orders' | 'tracking' | 'about' | 'contact' | 'faq' | 'terms' | 'privacy' | 'notfound' | 'admin' | 'profile';
export type AdminTab = 'orders' | 'products' | 'customers' | 'import';

export interface Product {
  id: string;
  name: string;
  company: string;
  composition: string;
  category: Category;
  pack: string;
  mrp: number;
  net: number;
  expiry: string;
  stock?: number;
  minOrderQuantity?: number;
  stockStrips?: number;
  stripsPerBox?: number | null;
  isActive?: boolean;
  medicineType?: string;
productType?: string;
countryOfOrigin?: string;
sku?: string;
barcode?: string;
prescriptionRequired?: boolean;
image?: string;
description?: string;
effectivePtr?: number | null;
inventoryBatches?: InventoryBatch[];
ptr?: number | null;
gst?: number | null;
discountType?: string;
discountValue?: number;
discountAmount?: number;
buyQuantity?: number | null;
  freeQuantity?: number | null;
  bonusProductId?: string | null;

inventorySummary?: {
  totalQuantity: number;
  batchCount: number;
  expiringSoon: number;
};
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  shopName?: string | null;
  address?: string | null;
  createdAt: string;
  orderCount: number;
  gstNumber?: string;
drugLicence20B?: string;
drugLicence21B?: string;
city?: string;
state?: string;
pincode?: string;
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
  ptr:number;

  paidQuantity?: number;
  freeQuantity?: number;
  totalQuantity?: number;
  isFree?: boolean;
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
  paymentMethod: 'COD' | 'RAZORPAY';
  paymentStatus?: string | null;
  payment?: {
    status: string;
    method: string;
    amount: number;
    refundedAmount: number;
    refunds: Array<{ id: string; amount: number; status: string; reason?: string | null; createdAt?: string }>;
  } | null;
  deliveryPartner?: string | null;
  trackingId?: string | null;
  cancellationReason?: string | null;
  cancelledAt?: string | null;
  invoiceFileName?: string | null;
  invoiceUploadedAt?: string | null;
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

export interface InventoryBatch {
  id: string;
  productId: string;
  batchNumber: string;
  quantity: number;
  freeQuantity: number;
  mrp: number;
  ptr: number;
  discount: number;
  gst: number;
  expiryDate: string;
}
