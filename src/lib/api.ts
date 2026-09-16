import type {
  CheckoutDetails,
  Order,
  OrderStatus,
  Product,
  Customer,
  InventoryBatch,
} from "../types";

type ApiError = {
  error?: string;
};

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "";

const STATUS_LABELS: Record<string, OrderStatus> = {
  SUBMITTED: "Submitted",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

/* =========================================================
   API MAPPERS
========================================================= */

function inventoryBatchFromApi(batch: any): InventoryBatch {
  return {
    id: batch.id,
    productId: batch.productId,
    batchNumber: batch.batchNumber,
    quantity: Number(batch.quantity || 0),
    freeQuantity: Number(batch.freeQuantity || 0),
    mrp: Number(batch.mrp || 0),
    ptr: Number(batch.ptr || 0),
    discount: Number(batch.discount || 0),
    gst: Number(batch.gst || 0),
    expiryDate: batch.expiryDate,
  };
}

function productFromApi(product: any): Product {
  return {
    ...product,

    // Existing/legacy fields
    mrp: Number(product.mrp || 0),
    net: Number(product.net || 0),
    stock: Number(product.stock || 0),
    minOrderQuantity: Number(product.minOrderQuantity || 1),
    stockStrips: product.stockStrips == null ? undefined : Number(product.stockStrips),
    stripsPerBox: product.stripsPerBox == null ? null : Number(product.stripsPerBox),

    ptr:
  product.ptr == null
    ? null
    : Number(product.ptr),

gst:
  product.gst == null
    ? 5
    : Number(product.gst),

discountType:
  product.discountType || "NONE",

discountValue:
  product.discountValue == null
    ? 0
    : Number(product.discountValue),

discountAmount:
  product.discountAmount == null
    ? 0
    : Number(product.discountAmount),

effectivePtr:
  product.effectivePtr == null
    ? Number(product.net || 0)
    : Number(product.effectivePtr),

buyQuantity:
  product.buyQuantity == null
    ? null
    : Number(product.buyQuantity),

freeQuantity:
  product.freeQuantity == null
    ? null
    : Number(product.freeQuantity),
bonusProductId: product.bonusProductId || null,

    expiry:
      typeof product.expiry === "string"
        ? new Date(product.expiry).toLocaleDateString("en-IN", {
            month: "short",
            year: "numeric",
          })
        : product.expiry,

    // New Product Master fields
    medicineType: product.medicineType || "",
    productType: product.productType || "",
    countryOfOrigin: product.countryOfOrigin || "",
    sku: product.sku || "",
    barcode: product.barcode || "",
    prescriptionRequired: Boolean(product.prescriptionRequired),
    image: product.image || "",
    description: product.description || "",

    // Inventory
    inventoryBatches: Array.isArray(product.inventoryBatches)
      ? product.inventoryBatches.map(inventoryBatchFromApi)
      : [],

    inventorySummary: product.inventorySummary
      ? {
          totalQuantity: Number(
            product.inventorySummary.totalQuantity || 0
          ),
          batchCount: Number(
            product.inventorySummary.batchCount || 0
          ),
          expiringSoon: Number(
            product.inventorySummary.expiringSoon || 0
          ),
        }
      : undefined,
  } as Product;
}

function orderFromApi(order: any): Order {
  return {
    id: order.orderNumber || order.id,

    retailerName:
      order.deliveryName || order.retailerName || "",

    retailerShop:
      order.deliveryShop || order.retailerShop || "",

    retailerPhone:
      order.deliveryPhone || order.retailerPhone || "",

    retailerAddress:
      order.deliveryAddress || order.retailerAddress || "",

    date: order.createdAt
      ? String(order.createdAt).slice(0, 10)
      : order.date,

   items: (order.items || []).map((item: any) => ({
  productId: item.productId,
  productName: item.productName,

  // Paid quantity
  quantity: Number(item.quantity ?? item.paidQuantity ?? 0),

  // Price charged per paid unit
  rate: Number(item.unitPrice ?? item.rate ?? 0),

  // Offer quantities
  paidQuantity: Number(
    item.paidQuantity ?? item.quantity ?? 0
  ),

  freeQuantity: Number(
    item.freeQuantity ?? 0
  ),

  totalQuantity: Number(
    item.totalQuantity ??
      Number(item.paidQuantity ?? item.quantity ?? 0) +
      Number(item.freeQuantity ?? 0)
  ),

  // Used for a separate free bonus-product line
  isFree: Boolean(item.isFree),
})),

    total: Number(order.grandTotal ?? order.subtotal ?? order.total ?? 0),

    status:
      STATUS_LABELS[order.status] || order.status,

    paymentMethod:
      order.paymentMethod || "COD",
    deliveryPartner: order.deliveryPartner || null,
    trackingId: order.trackingId || null,
  };
}

/* =========================================================
   GENERIC REQUEST
========================================================= */

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const raw = await response.text();

  let payload: any = {};

  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    payload = {
      error: raw || "Invalid server response",
    };
  }

  if (!response.ok) {
    const message =
      (payload as ApiError).error ||
      response.statusText ||
      "Request failed";

    throw new Error(message);
  }

  return payload as T;
}

/* =========================================================
   BOOTSTRAP
========================================================= */

export async function loadBootstrap() {
  const response = await request<{
    products: any[];
    orders: any[];
  }>("/api/bootstrap");

  return {
    products: response.products.map(productFromApi),
    orders: response.orders.map(orderFromApi),
  };
}

export type ProductPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export async function loadProducts(params: {
  page?: number;
  limit?: number;
  q?: string;
  category?: string;
  company?: string;
}) {
  const query = new URLSearchParams();
  query.set("page", String(params.page || 1));
  query.set("limit", String(Math.min(params.limit || 50, 50)));
  if (params.q?.trim()) query.set("q", params.q.trim());
  if (params.category && params.category !== "All") query.set("category", params.category);
  if (params.company && params.company !== "All") query.set("company", params.company);

  const response = await request<{
    products: any[];
    companies: string[];
    pagination: ProductPagination;
  }>(`/api/products?${query.toString()}`);

  return {
    products: response.products.map(productFromApi),
    companies: response.companies || [],
    pagination: response.pagination,
  };
}

export async function loadProductsByIds(ids: string[]) {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return { products: [] as Product[] };

  const response = await request<any[]>(
    `/api/products?ids=${encodeURIComponent(uniqueIds.join(","))}`
  );

  return { products: response.map(productFromApi) };
}

/* =========================================================
   OTP AUTH
========================================================= */

export async function requestOtp(phone: string) {
  return request<{
    ok: boolean;
    demoOtp?: string;
    expiresInSeconds: number;
  }>("/api/auth/request-otp", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

export async function verifyOtp(
  phone: string,
  otp: string
) {
  return request<{
    ok: boolean;
    token: string;
    phone: string;
    profile: {
      id: string;
      name: string;
      email: string;
      phone: string;
      retailerName: string;
      shopName: string;
      gstNumber: string;
      drugLicence20B: string;
      drugLicence21B: string;
      profileImage: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
      role: "CUSTOMER" | "ADMIN";
    };
  }>("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({
      phone,
      otp,
    }),
  });
}

/* =========================================================
   EMAIL AUTH
========================================================= */

export type EmailAuthProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  retailerName: string;
  shopName: string;
  gstNumber: string;
  drugLicence20B: string;
  drugLicence21B: string;
  profileImage: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  role: "CUSTOMER" | "ADMIN";
};

function mapEmailUser(user: {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  shopName?: string | null;
   gstNumber?: string | null;
  drugLicence20B?: string | null;
  drugLicence21B?: string | null;
  profileImage?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  role: "CUSTOMER" | "ADMIN";
}): EmailAuthProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    retailerName: user.name,
    shopName: user.shopName || "",
    gstNumber: user.gstNumber || "",
    drugLicence20B: user.drugLicence20B || "",
    drugLicence21B: user.drugLicence21B || "",
    profileImage: user.profileImage || "",
    address: user.address || "",
    city: user.city || "",
    state: user.state || "",
    pincode: user.pincode || "",
    role: user.role,
  };
}

export async function loginWithEmail(
  email: string,
  password: string
) {
  const response = await request<{
    token: string;
    user: Parameters<typeof mapEmailUser>[0];
  }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  return {
    token: response.token,
    profile: mapEmailUser(response.user),
  };
}

export async function registerWithEmail(input: {
  name: string;
  email: string;
  password: string;
  phone: string;
  drugLicence20B: string;
  drugLicence21B: string;
  gstNumber?: string;
}) {
  const response = await request<{
    token: string;
    user: Parameters<typeof mapEmailUser>[0];
  }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return {
    token: response.token,
    profile: mapEmailUser(response.user),
  };
}

/* =========================================================
   CUSTOMER PROFILE
========================================================= */

export async function getAuthenticatedUser(token: string) {
  const response = await request<{
    user: Parameters<typeof mapEmailUser>[0];
  }>("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return {
    profile: mapEmailUser(response.user),
  };
}

export async function loadCustomerProfile(
  token: string
) {
  const response = await request<{
    user: Parameters<typeof mapEmailUser>[0];
  }>("/api/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return {
    profile: mapEmailUser(response.user),
  };
}

export async function updateCustomerProfile(
  token: string,
  profile: {
    name: string;
    email: string;
    phone?: string;
    shopName?: string;
    gstNumber?: string;
    drugLicence20B?: string;
    drugLicence21B?: string;
    profileImage?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }
) {
  const response = await request<{
    user: Parameters<typeof mapEmailUser>[0];
  }>("/api/profile", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profile),
  });

  return {
    profile: mapEmailUser(response.user),
  };
}

/* =========================================================
   ADMIN LOGIN
========================================================= */

export async function adminLogin(
  email: string,
  password: string
) {
  const response = await request<{
    token: string;
    user: Parameters<typeof mapEmailUser>[0];
  }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const profile = mapEmailUser(response.user);

  if (profile.role !== "ADMIN") {
    throw new Error("Administrator access required.");
  }

  return {
    token: response.token,
    profile,
  };
}

/* =========================================================
   CUSTOMER ORDERS
========================================================= */

export async function createOrder(payload: {
  shopName: string;
  address: string;
  contact: string;
  retailerName?: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  token: string;
}) {
  const response = await request<any>("/api/orders", {
    method: "POST",

    headers: {
      Authorization: `Bearer ${payload.token}`,
    },

    body: JSON.stringify({
      items: payload.items,

      deliveryName:
        payload.retailerName || payload.shopName,

      deliveryShop: payload.shopName,

      deliveryPhone: payload.contact,

      deliveryAddress: payload.address,

      paymentMethod: "COD",
    }),
  });

  return {
    order: orderFromApi(response),
  };
}

export async function loadCustomerOrders(
  token: string
) {
  const response = await request<any[]>(
    "/api/orders/mine",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return {
    orders: response.map(orderFromApi),
  };
}

/* =========================================================
   ADMIN ORDERS
========================================================= */

export async function loadAdminOrders(
  token: string
) {
  const response = await request<any[]>(
    "/api/admin/orders",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return {
    orders: response.map(orderFromApi),
  };
}

export async function updateOrderStatus(
  token: string,
  orderId: string,
  status: OrderStatus,
  trackingId?: string,
  deliveryPartner?: string
) {
  const response = await request<any>(
    `/api/admin/orders/${encodeURIComponent(
      orderId
    )}/status`,
    {
      method: "PATCH",

      headers: {
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        status: status.toUpperCase(),
        trackingId,
        deliveryPartner,
      }),
    }
  );

  return {
    order: orderFromApi(response),
  };
}

export async function submitContactQuery(payload: {
  name: string;
  phone: string;
  message: string;
}) {
  return request<{ ok: boolean }>("/api/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* =========================================================
   ADMIN PRODUCTS
========================================================= */

export async function loadAdminProducts(
  token: string,
  params: {
    page?: number;
    limit?: number;
    q?: string;
    category?: string;
    offer?: "All" | "Offers" | "No Offer";
    sortKey?: "name" | "mrp" | "effectivePtr" | "stock";
    sortDir?: "asc" | "desc";
  } = {}
) {
  const query = new URLSearchParams();

  query.set("page", String(Math.max(1, params.page || 1)));

  query.set(
    "limit",
    String(Math.min(Math.max(1, params.limit || 50), 50))
  );

  if (params.q?.trim()) {
    query.set("q", params.q.trim());
  }

  if (params.category && params.category !== "All") {
    query.set("category", params.category);
  }

  if (params.offer && params.offer !== "All") {
    query.set("offer", params.offer);
  }

  query.set("sortKey", params.sortKey || "name");
  query.set("sortDir", params.sortDir || "asc");

  const response = await request<{
    products: any[];
    categories: string[];
    productOptions: Array<{
      id: string;
      name: string;
      pack: string;
    }>;
    pagination: ProductPagination;
    stats: {
      totalMedicines: number;
      activeStock: number;
      productsOnOffer: number;
      lowStock: number;
    };
  }>(`/api/admin/products?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Make sure products is always an array before using .map()
  const products = Array.isArray(response.products)
    ? response.products
    : [];

  return {
    products: products.map(productFromApi),

    categories: Array.isArray(response.categories)
      ? response.categories
      : [],

    productOptions: Array.isArray(response.productOptions)
      ? response.productOptions
      : [],

    pagination: response.pagination,

    stats: response.stats,
  };
}

export async function loadAdminProduct(
  token: string,
  productId: string
) {
  const response = await request<any>(
    `/api/admin/products/${encodeURIComponent(
      productId
    )}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return productFromApi(response);
}

/* =========================================================
   CREATE PRODUCT
========================================================= */

export async function createAdminProduct(
  token: string,
  payload: {
    name: string;
    company: string;
    composition: string;
    category: string;

    medicineType?: string;
    productType?: string;

    pack: string;

    countryOfOrigin?: string;

    sku: string;

    barcode?: string;

    prescriptionRequired?: boolean;

    image?: string;

    description?: string;

    // Legacy compatibility
    mrp?: number;
    net?: number;
    expiry?: string;
    stock?: number;
    minOrderQuantity?: number;
    bonusProductId?: string;

    isActive?: boolean;
  }
) {
  const response = await request<any>(
    "/api/admin/products",
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(payload),
    }
  );

  return productFromApi(response);
}

export async function sendTrackingEmail(
  token: string,
  orderId: string,
  trackingId: string,
  deliveryPartner: string
) {
  const response = await request<any>(
    `/api/admin/orders/${encodeURIComponent(orderId)}/tracking-email`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        trackingId,
        deliveryPartner,
      }),
    }
  );

  return {
    order: orderFromApi(response.order),
  };
}

/* =========================================================
   UPDATE PRODUCT
========================================================= */

export async function updateProduct(
  token: string,
  product: Product & {
    ptr?: number | null;
    gst?: number | null;
    discountType?: string | null;
    discountValue?: number | null;
    discountAmount?: number | null;
    effectivePtr?: number | null;
    buyQuantity?: number | null;
    freeQuantity?: number | null;
    bonusProductId?: string | null;
    minOrderQuantity?: number;
  }
) {
  const response = await request<any>(
    `/api/admin/products/${encodeURIComponent(
      product.id
    )}`,
    {
      method: "PATCH",

      headers: {
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        name: product.name,
        company: product.company,
        composition: product.composition,
        category: product.category,

        medicineType: product.medicineType,
        productType: product.productType,

        pack: product.pack,

        countryOfOrigin: product.countryOfOrigin,

        // SKU is kept internally for compatibility.
        // Admin does not edit it.
        sku: product.sku,

        barcode: product.barcode,

        prescriptionRequired:
          product.prescriptionRequired,

        image: product.image,
        description: product.description,

        // ================================
        // AUTOMATIC PRICING
        // ================================
        mrp: product.mrp,

        discountType:
          product.discountType || "NONE",

        discountValue:
          Number(product.discountValue) || 0,

        buyQuantity:
          Number(product.buyQuantity) || 0,

        freeQuantity:
          Number(product.freeQuantity) || 0,
        bonusProductId: product.bonusProductId || undefined,

        // ================================
        // PRODUCT LIFECYCLE
        // ================================
        expiry: product.expiry,
        stock: product.stock,
        minOrderQuantity: product.minOrderQuantity,
        isActive: product.isActive,
      }),
    }
  );

  return productFromApi(response);
}

/* =========================================================
   INVENTORY BATCHES
========================================================= */

export async function createInventoryBatch(
  token: string,
  productId: string,
  payload: {
    batchNumber: string;
    quantity: number;
    freeQuantity?: number;
    mrp: number;
    ptr: number;
    discount?: number;
    gst?: number;
    expiryDate: string;
  }
) {
  const response = await request<any>(
    `/api/admin/products/${encodeURIComponent(
      productId
    )}/batches`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(payload),
    }
  );

  return inventoryBatchFromApi(response);
}

export async function updateInventoryBatch(
  token: string,
  batchId: string,
  payload: Partial<{
    batchNumber: string;
    quantity: number;
    freeQuantity: number;
    mrp: number;
    ptr: number;
    discount: number;
    gst: number;
    expiryDate: string;
  }>
) {
  const response = await request<any>(
    `/api/admin/batches/${encodeURIComponent(
      batchId
    )}`,
    {
      method: "PATCH",

      headers: {
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(payload),
    }
  );

  return inventoryBatchFromApi(response);
}

export async function deleteInventoryBatch(
  token: string,
  batchId: string
) {
  return request<{ ok: boolean }>(
    `/api/admin/batches/${encodeURIComponent(
      batchId
    )}`,
    {
      method: "DELETE",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

/* =========================================================
   INVENTORY CSV IMPORT
========================================================= */

export async function importInventoryCsv(
  token: string,
  file: File
) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_BASE}/api/admin/inventory/import`,
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${token}`,
      },

      body: formData,
    }
  );

  const raw = await response.text();

  let payload: any = {};

  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    payload = {
      error: raw || "Invalid server response",
    };
  }

  if (!response.ok) {
    throw new Error(
      payload.error ||
        response.statusText ||
        "Inventory import failed"
    );
  }

  return payload;
}

/* =========================================================
   LEGACY PRODUCT CSV IMPORT
========================================================= */

export async function importProducts(
  token: string,
  rows: string[][]
) {
  const response = await request<{
    inserted: number;
    updated: number;
    products?: Product[];
  }>("/api/admin/products/import", {
    method: "POST",

    headers: {
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      rows,
    }),
  });

  // Always reload products so the UI receives
  // the latest inventory/product data.
  const products = await loadAdminProducts(token);

  return {
    ...response,
    products: products.products,
  };
}

/* =========================================================
   ADMIN CUSTOMERS
========================================================= */

export async function loadCustomers(
  token: string
) {
  return request<Customer[]>(
    "/api/admin/customers",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

/* =========================================================
   ORDER TRACKING
========================================================= */

export async function lookupOrder(
  orderId: string,
  phone: string
) {
  const response = await request<any>(
    `/api/orders/${encodeURIComponent(
      orderId
    )}?phone=${encodeURIComponent(phone)}`
  );

  return {
    order: orderFromApi(response),
  };
}

export async function publicOrderLookup(
  orderId: string
) {
  return request<{ order: Order }>(
    `/api/orders/${encodeURIComponent(orderId)}`
  );
}

/* =========================================================
   TYPES
========================================================= */

export type {
  CheckoutDetails,
  Order,
  OrderStatus,
  Product,
  Customer,
  InventoryBatch,
};
