import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import type { ReactNode } from "react";

import { MOCK_ORDERS, PRODUCTS as SEED_PRODUCTS } from "./data";
import {
  adminLogin as apiAdminLogin,
  createAdminProduct as apiCreateAdminProduct,
  createOrder as apiCreateOrder,
  importProducts as apiImportProducts,
  loadCustomers as apiLoadCustomers,
  loadCustomerOrders,
  loadAdminOrders,
  loadAdminProducts,
  loadBootstrap,
  lookupOrder,
  requestOtp as apiRequestOtp,
  updateOrderStatus as apiUpdateOrderStatus,
  updateProduct as apiUpdateProduct,
  verifyOtp as apiVerifyOtp,
  loadCustomerProfile,
  updateCustomerProfile,
  getAuthenticatedUser,
} from "./lib/api";

import type {
  AdminTab,
  CartItem,
  Customer,
  CheckoutDetails,
  Order,
  OrderStatus,
  Page,
  Product,
  ToastMsg,
} from "./types";

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;

  // Kept for existing checkout/order code
  retailerName: string;

  shopName: string;
  gstNumber: string;
  drugLicence: string;
  profileImage: string;

  address: string;
  city: string;
  state: string;
  pincode: string;

  role?: "CUSTOMER" | "ADMIN";
}

interface AppContextValue {
  page: Page;
  navigate: (p: Page) => void;
  navigateToProduct: (id: string) => void;
  selectedProductId: string | null;
  selectedOrderId: string | null;
navigateToOrder: (id: string) => void;

  adminTab: AdminTab;
  setAdminTab: (t: AdminTab) => void;

 products: Product[];
setProducts: (products: Product[]) => void;
refreshProducts: () => Promise<void>;
createProduct: (payload: {
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
  mrp?: number;
  net?: number;
  scheme?: string;
  expiry?: string;
  stock?: number;
  isActive?: boolean;
}) => Promise<Product>;
updateProduct: (id: string, patch: Partial<Product>) => Promise<void>;

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
customerPhone: string;
customerProfile: CustomerProfile | null;

completeCustomerLogin: (
  phone: string,
  profile: CustomerProfile,
  token: string
) => void;

refreshCustomerProfile: () => Promise<CustomerProfile | null>;

saveCustomerProfile: (profile: {
  name: string;
  email: string;
  phone?: string;
  shopName?: string;
  gstNumber?: string;
  drugLicence?: string;
  profileImage?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}) => Promise<CustomerProfile>;

logoutCustomer: () => void;
  requestOtp: (phone: string) => Promise<string | null>;
  verifyOtp: (
    phone: string,
    otp: string
  ) => Promise<CustomerProfile>;

  adminToken: string;
  isAdminLoggedIn: boolean;
adminLogin: (
  email: string,
  password: string
) => Promise<void>;
  logoutAdmin: () => void;

  toasts: ToastMsg[];
  addToast: (
    message: string,
    type?: ToastMsg["type"]
  ) => void;
  removeToast: (id: string) => void;

  orders: Order[];
  setOrders: (orders: Order[]) => void;
  refreshOrders: () => Promise<void>;
  refreshAdminData: () => Promise<void>;
  customers: Customer[];
  refreshCustomers: () => Promise<void>;

  confirmedOrderId: string;
  placeOrder: (details: CheckoutDetails) => Promise<void>;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus
  ) => Promise<void>;
  importProductRows: (
    rows: string[][]
  ) => Promise<{ inserted: number; updated: number }>;

  lookupTrackedOrder: (
    orderId: string,
    phone: string
  ) => Promise<Order | null>;
}

const AppContext =
  createContext<AppContextValue | null>(null);

const CUSTOMER_PHONE_KEY = "singh.customerPhone";
const CUSTOMER_PROFILE_KEY = "singh.customerProfile";
const CUSTOMER_TOKEN_KEY = "singh.customerToken";
const ADMIN_TOKEN_KEY = "singh.adminToken";

function safeRead<T>(key: string): T | null {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function safeWrite(key: string, value: unknown) {
  try {
    window.localStorage.setItem(
      key,
      typeof value === "string" ? value : JSON.stringify(value)
    );
  } catch {}
}

function safeRemove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage failures.
  }
}

function getStoredString(key: string) {
  try {
    return window.localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

export function useApp() {
  const ctx = useContext(AppContext);

  if (!ctx) {
    throw new Error("useApp must be used inside AppProvider");
  }

  return ctx;
}

export function AppProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [page, setPage] = useState<Page>("home");
  const [adminTab, setAdminTab] =
    useState<AdminTab>("orders");
  const [selectedProductId, setSelectedProductId] =
    useState<string | null>(null);

    const [selectedOrderId, setSelectedOrderId] =
  useState<string | null>(null);

  const [products, setProducts] =
    useState<Product[]>(SEED_PRODUCTS);
  const [orders, setOrders] =
    useState<Order[]>(MOCK_ORDERS);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [cartItems, setCartItems] =
    useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] =
    useState(false);

  const [customerPhone, setCustomerPhone] =
    useState<string>(() =>
      typeof window === "undefined"
        ? ""
        : getStoredString(CUSTOMER_PHONE_KEY)
    );
  const [customerProfile, setCustomerProfile] =
    useState<CustomerProfile | null>(() =>
      typeof window === "undefined"
        ? null
        : safeRead<CustomerProfile>(CUSTOMER_PROFILE_KEY)
    );
  const [customerToken, setCustomerToken] =
    useState<string>(() =>
      typeof window === "undefined"
        ? ""
        : getStoredString(CUSTOMER_TOKEN_KEY)
    );

  const [adminToken, setAdminToken] =
    useState<string>(() =>
      typeof window === "undefined"
        ? ""
        : getStoredString(ADMIN_TOKEN_KEY)
    );

  const [toasts, setToasts] =
    useState<ToastMsg[]>([]);
  const toastCounter = useRef(0);

  const [confirmedOrderId, setConfirmedOrderId] =
    useState("");

  const isLoggedIn = Boolean(customerToken);
  const isAdminLoggedIn = Boolean(adminToken);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const bootstrap = await loadBootstrap();

        if (cancelled) {
          return;
        }

        setProducts(
          bootstrap.products.length > 0
            ? bootstrap.products
            : SEED_PRODUCTS
        );
        setOrders(
          bootstrap.orders.length > 0
            ? bootstrap.orders
            : MOCK_ORDERS
        );
      } catch {
        if (!cancelled) {
          setProducts(SEED_PRODUCTS);
          setOrders(MOCK_ORDERS);
        }
      }
    }

    hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (customerPhone) {
      safeWrite(CUSTOMER_PHONE_KEY, customerPhone);
    } else {
      safeRemove(CUSTOMER_PHONE_KEY);
    }
  }, [customerPhone]);

  useEffect(() => {
    if (customerProfile) {
      safeWrite(CUSTOMER_PROFILE_KEY, customerProfile);
    } else {
      safeRemove(CUSTOMER_PROFILE_KEY);
    }
  }, [customerProfile]);

  useEffect(() => {
    if (customerToken) {
      safeWrite(CUSTOMER_TOKEN_KEY, customerToken);
    } else {
      safeRemove(CUSTOMER_TOKEN_KEY);
    }
  }, [customerToken]);

  useEffect(() => {
    if (adminToken) {
      safeWrite(ADMIN_TOKEN_KEY, adminToken);
    } else {
      safeRemove(ADMIN_TOKEN_KEY);
    }
  }, [adminToken]);

  // Validate persisted customer/admin sessions when the app starts.
  // A token that is expired, revoked, malformed, or belongs to the wrong
  // role is removed so the UI never shows a stale logged-in state.
  useEffect(() => {
    let cancelled = false;

    async function validateStoredSessions() {
      const storedCustomerToken =
        getStoredString(CUSTOMER_TOKEN_KEY);
      const storedAdminToken =
        getStoredString(ADMIN_TOKEN_KEY);

      if (storedCustomerToken) {
        try {
          const result =
            await getAuthenticatedUser(storedCustomerToken);

          if (
            !cancelled &&
            result.profile.role === "CUSTOMER"
          ) {
            setCustomerProfile(result.profile);
            setCustomerPhone(result.profile.phone);
          } else if (!cancelled) {
            setCustomerToken("");
            setCustomerProfile(null);
            setCustomerPhone("");
            safeRemove(CUSTOMER_TOKEN_KEY);
            safeRemove(CUSTOMER_PROFILE_KEY);
            safeRemove(CUSTOMER_PHONE_KEY);
          }
        } catch {
          if (!cancelled) {
            setCustomerToken("");
            setCustomerProfile(null);
            setCustomerPhone("");
            safeRemove(CUSTOMER_TOKEN_KEY);
            safeRemove(CUSTOMER_PROFILE_KEY);
            safeRemove(CUSTOMER_PHONE_KEY);
          }
        }
      }

      if (storedAdminToken) {
        try {
          const result =
            await getAuthenticatedUser(storedAdminToken);

          if (
            !cancelled &&
            result.profile.role === "ADMIN"
          ) {
            setAdminToken(storedAdminToken);
          } else if (!cancelled) {
            setAdminToken("");
            safeRemove(ADMIN_TOKEN_KEY);
          }
        } catch {
          if (!cancelled) {
            setAdminToken("");
            safeRemove(ADMIN_TOKEN_KEY);
          }
        }
      }
    }

    validateStoredSessions();

    return () => {
      cancelled = true;
    };
  }, []);

  const navigate = useCallback((p: Page) => {
    if (p !== "product") {
      setSelectedProductId(null);
    }

    setIsCartOpen(false);
    setPage(p);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const navigateToProduct = useCallback((id: string) => {
    setSelectedProductId(id);
    setPage("product");
    setIsCartOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const navigateToOrder = useCallback((id: string) => {
  setSelectedOrderId(id);
  setIsCartOpen(false);
  setPage("tracking");

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}, []);

  const addToast = useCallback(
    (
      message: string,
      type: ToastMsg["type"] = "success"
    ) => {
      const id = `toast-${++toastCounter.current}`;

      setToasts((prev) => [
        ...prev,
        {
          id,
          message,
          type,
        },
      ]);

      window.setTimeout(() => {
        setToasts((prev) =>
          prev.filter((toast) => toast.id !== id)
        );
      }, 3000);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.filter((toast) => toast.id !== id)
    );
  }, []);

  const addToCart = useCallback(
    (productId: string, qty = 1) => {
      const quantity = Math.max(1, qty);

      setCartItems((prev) => {
        const existing = prev.find(
          (item) => item.productId === productId
        );

        if (existing) {
          return prev.map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                }
              : item
          );
        }

        return [
          ...prev,
          {
            productId,
            quantity,
          },
        ];
      });
    },
    []
  );

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((prev) =>
      prev.filter((item) => item.productId !== productId)
    );
  }, []);

  const updateQty = useCallback(
    (productId: string, qty: number) => {
      if (qty <= 0) {
        setCartItems((prev) =>
          prev.filter((item) => item.productId !== productId)
        );
        return;
      }

      setCartItems((prev) =>
        prev.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: qty,
              }
            : item
        )
      );
    },
    []
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const cartTotal = cartItems.reduce((sum, item) => {
    const product = products.find(
      (entry) => entry.id === item.productId
    );

    if (!product) {
      return sum;
    }

    return sum + product.net * item.quantity;
  }, 0);

  const setIsLoggedIn = useCallback(
  (value: boolean) => {
    if (!value) {
      setCustomerPhone("");
      setCustomerProfile(null);
      setCustomerToken("");

      safeRemove(CUSTOMER_PHONE_KEY);
      safeRemove(CUSTOMER_PROFILE_KEY);
      safeRemove(CUSTOMER_TOKEN_KEY);
    }
  },
  []
);

  const logoutCustomer = useCallback(() => {
    setIsLoggedIn(false);
    addToast("Logged out successfully", "info");
    navigate("home");
  }, [addToast, navigate, setIsLoggedIn]);

  const logoutAdmin = useCallback(() => {
  setAdminToken("");

  setCustomerToken("");
  setCustomerProfile(null);
  setCustomerPhone("");

  safeRemove(ADMIN_TOKEN_KEY);
  safeRemove(CUSTOMER_TOKEN_KEY);
  safeRemove(CUSTOMER_PROFILE_KEY);
  safeRemove(CUSTOMER_PHONE_KEY);

  addToast(
    "Logged out successfully",
    "info"
  );

  navigate("home");
}, [addToast, navigate]);

  const completeCustomerLogin = useCallback(
    (phone: string, profile: CustomerProfile, token: string) => {
      setCustomerPhone(phone);
      setCustomerProfile(profile);
      setCustomerToken(token);
    },
    []
  );
const refreshCustomerProfile = useCallback(async () => {
  const token =
    customerToken || getStoredString(CUSTOMER_TOKEN_KEY);

  if (!token) {
    return null;
  }

  try {
    const result = await loadCustomerProfile(token);

    setCustomerProfile(result.profile);
    setCustomerPhone(result.profile.phone);

    return result.profile;
  } catch (error) {
    console.error("Failed to load customer profile:", error);

    // If the stored token is invalid/expired,
    // clear the customer session.
    const message =
      error instanceof Error ? error.message : "";

    if (
      message.toLowerCase().includes("invalid") ||
      message.toLowerCase().includes("expired") ||
      message.toLowerCase().includes("session")
    ) {
      setCustomerToken("");
      setCustomerProfile(null);
      setCustomerPhone("");

      safeRemove(CUSTOMER_TOKEN_KEY);
      safeRemove(CUSTOMER_PROFILE_KEY);
      safeRemove(CUSTOMER_PHONE_KEY);
    }

    return null;
  }
}, [customerToken]);

const saveCustomerProfile = useCallback(
  async (profile: {
    name: string;
    email: string;
    phone?: string;
    shopName?: string;
    gstNumber?: string;
    drugLicence?: string;
    profileImage?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }) => {
    const token =
      customerToken || getStoredString(CUSTOMER_TOKEN_KEY);

    if (!token) {
      throw new Error("You are not logged in.");
    }

    const result = await updateCustomerProfile(
      token,
      profile
    );

    setCustomerProfile(result.profile);
    setCustomerPhone(result.profile.phone);

    safeWrite(CUSTOMER_PROFILE_KEY, result.profile);
    safeWrite(CUSTOMER_PHONE_KEY, result.profile.phone);

    return result.profile;
  },
  [customerToken]
);

  const requestOtp = useCallback(async (phone: string) => {
    const response = await apiRequestOtp(phone);
    return response.demoOtp ?? null;
  }, []);

  const verifyOtp = useCallback(
    async (phone: string, otp: string) => {
      const response = await apiVerifyOtp(phone, otp);
      completeCustomerLogin(
        response.phone,
        response.profile,
        response.token
      );
      return response.profile;
    },
    [completeCustomerLogin]
  );

  const adminLogin = useCallback(
    async (email: string, password: string) => {
      const response = await apiAdminLogin(email, password);

      if (response.profile.role !== "ADMIN") {
        throw new Error("Administrator access required.");
      }

      setAdminToken(response.token);
      safeWrite(ADMIN_TOKEN_KEY, response.token);

      addToast("Admin access granted", "success");
      navigate("admin");
    },
    [addToast, navigate]
  );

  const refreshProducts = useCallback(async () => {
    const response = await loadBootstrap();
    if (response.products?.length) {
      setProducts(response.products);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    if (!customerToken) { setOrders([]); return; }
    const response = await loadCustomerOrders(customerToken);
    setOrders(response.orders);
  }, [customerToken]);

  const refreshAdminData = useCallback(async () => {
    if (!adminToken) {
      return;
    }

    const [orderResponse, productResponse] = await Promise.all([
      loadAdminOrders(adminToken),
      loadAdminProducts(adminToken),
    ]);

    setOrders(orderResponse.orders);
    setProducts(productResponse.products);
  }, [adminToken]);

  const refreshCustomers = useCallback(async () => {
    if (!adminToken) { setCustomers([]); return; }
    setCustomers(await apiLoadCustomers(adminToken));
  }, [adminToken]);

  const updateProduct = useCallback(async (id: string, patch: Partial<Product>) => {
    if (!adminToken) throw new Error("Admin session required");
    const current = products.find((product) => product.id === id);
    if (!current) throw new Error("Product not found");
    const saved = await apiUpdateProduct(adminToken, { ...current, ...patch });
    setProducts((previous) => previous.map((product) => product.id === id ? saved : product));
  }, [adminToken, products]);

  const createProduct = useCallback(
  async (payload: {
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
    mrp?: number;
    net?: number;
    scheme?: string;
    expiry?: string;
    stock?: number;
    isActive?: boolean;
  }) => {
    if (!adminToken) {
      throw new Error("Admin session required");
    }

    const saved = await apiCreateAdminProduct(adminToken, payload);

    setProducts((previous) => [saved, ...previous]);

    return saved;
  },
  [adminToken]
);

  const placeOrder = useCallback(
    async (details: CheckoutDetails) => {
      const response = await apiCreateOrder({
        shopName: details.shopName,
        address: details.address,
        contact: details.contact,
        retailerName:
          customerProfile?.retailerName || details.shopName,
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        token: customerToken,
      });

      setOrders((prev) => [response.order, ...prev]);
      setConfirmedOrderId(response.order.id);
      clearCart();
      navigate("confirmation");
    },
    [cartItems, clearCart, customerProfile, customerToken, navigate]
  );

  const updateOrderStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      if (!adminToken) {
        throw new Error("Admin session required");
      }

      const response = await apiUpdateOrderStatus(
        adminToken,
        orderId,
        status
      );

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? response.order : order
        )
      );
    },
    [adminToken]
  );

  const importProductRows = useCallback(
    async (rows: string[][]) => {
      if (!adminToken) {
        throw new Error("Admin session required");
      }

      const response = await apiImportProducts(adminToken, rows);
      setProducts(response.products);
      return {
        inserted: response.inserted,
        updated: response.updated,
      };
    },
    [adminToken]
  );

  const lookupTrackedOrder = useCallback(
    async (orderId: string, phone: string) => {
      try {
        const response = await lookupOrder(orderId, phone);
        return response.order;
      } catch {
        return null;
      }
    },
    []
  );

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  return (
    <AppContext.Provider
      value={{
        page,
        navigate,
        navigateToProduct,
        selectedProductId,
selectedOrderId,
navigateToOrder,
        adminTab,
        setAdminTab,
        products,
setProducts,
refreshProducts,
createProduct,
updateProduct,
        cartItems,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        isLoggedIn,
setIsLoggedIn,
customerPhone,
customerProfile,
completeCustomerLogin,
refreshCustomerProfile,
saveCustomerProfile,
logoutCustomer,
requestOtp,
verifyOtp,
        adminToken,
        isAdminLoggedIn,
        adminLogin,
        logoutAdmin,
        toasts,
        addToast,
        removeToast,
        orders,
        setOrders,
        refreshOrders,
        refreshAdminData,
        customers,
        refreshCustomers,
        confirmedOrderId,
        placeOrder,
        updateOrderStatus,
        importProductRows,
        lookupTrackedOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
