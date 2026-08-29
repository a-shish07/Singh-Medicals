
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";

import type { ReactNode } from "react";

import type {
  CartItem,
  Order,
  Page,
  AdminTab,
  ToastMsg,
  CheckoutDetails,
} from "./types";

import { MOCK_ORDERS, PRODUCTS } from "./data";

/* =========================================================
   CONTEXT TYPE
========================================================= */

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

  addToast: (
    message: string,
    type?: ToastMsg["type"]
  ) => void;

  removeToast: (id: string) => void;

  orders: Order[];

  setOrders: (orders: Order[]) => void;

  confirmedOrderId: string;

  placeOrder: (details: CheckoutDetails) => void;
}

/* =========================================================
   CONTEXT
========================================================= */

const AppContext =
  createContext<AppContextValue | null>(null);

/* =========================================================
   HOOK
========================================================= */

export function useApp() {
  const ctx = useContext(AppContext);

  if (!ctx) {
    throw new Error(
      "useApp must be used inside AppProvider"
    );
  }

  return ctx;
}

/* =========================================================
   PROVIDER
========================================================= */

export function AppProvider({
  children,
}: {
  children: ReactNode;
}) {
  /*
   * IMPORTANT:
   *
   * Start with null-ish routing logic handled by App.tsx.
   * Home is still the fallback.
   */

  const [page, setPage] =
    useState<Page>("home");

  /*
   * Admin state is completely independent
   * from customer page routing.
   */

  const [adminTab, setAdminTab] =
    useState<AdminTab>("orders");

  /*
   * Currently selected product.
   */

  const [selectedProductId, setSelectedProductId] =
    useState<string | null>(null);

  /*
   * Cart
   */

  const [cartItems, setCartItems] =
    useState<CartItem[]>([]);

  const [isCartOpen, setIsCartOpen] =
    useState(false);

  /*
   * Authentication
   */

  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  /*
   * Toasts
   */

  const [toasts, setToasts] =
    useState<ToastMsg[]>([]);

  const toastCounter = useRef(0);

  /*
   * Orders
   */

  const [orders, setOrders] =
    useState<Order[]>(MOCK_ORDERS);

  const [confirmedOrderId, setConfirmedOrderId] =
    useState("");

  /* =======================================================
     NAVIGATION
  ====================================================== */

  const navigate = useCallback(
    (p: Page) => {
      /*
       * When navigating away from product page,
       * clear the selected product.
       */

      if (p !== "product") {
        setSelectedProductId(null);
      }

      /*
       * Closing the cart when changing pages
       * prevents drawer overlap.
       */

      setIsCartOpen(false);

      /*
       * Change application page.
       *
       * App.tsx RouterSync is responsible for
       * changing the browser URL.
       */

      setPage(p);

      /*
       * Scroll immediately to top.
       */

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
    []
  );

  /* =======================================================
     PRODUCT NAVIGATION
  ====================================================== */


const navigateToProduct = useCallback(
  (id: string) => {
    setSelectedProductId(id);
    setPage("product");
    setIsCartOpen(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  },
  []
);

  /* =======================================================
     TOASTS
  ====================================================== */

  const addToast = useCallback(
    (
      message: string,
      type: ToastMsg["type"] = "success"
    ) => {
      const id =
        `toast-${++toastCounter.current}`;

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
          prev.filter(
            (toast) => toast.id !== id
          )
        );
      }, 3000);
    },
    []
  );

  const removeToast = useCallback(
    (id: string) => {
      setToasts((prev) =>
        prev.filter(
          (toast) => toast.id !== id
        )
      );
    },
    []
  );

  /* =======================================================
     CART
  ====================================================== */

  const addToCart = useCallback(
    (
      productId: string,
      qty = 1
    ) => {
      /*
       * Never allow zero/negative quantities.
       */

      const quantity = Math.max(
        1,
        qty
      );

      setCartItems((prev) => {
        const existing = prev.find(
          (item) =>
            item.productId === productId
        );

        /*
         * Existing item:
         * increase quantity.
         */

        if (existing) {
          return prev.map((item) =>
            item.productId === productId
              ? {
                  ...item,
                  quantity:
                    item.quantity +
                    quantity,
                }
              : item
          );
        }

        /*
         * New item.
         */

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

  /* =======================================================
     REMOVE FROM CART
  ====================================================== */

  const removeFromCart = useCallback(
    (productId: string) => {
      setCartItems((prev) =>
        prev.filter(
          (item) =>
            item.productId !== productId
        )
      );
    },
    []
  );

  /* =======================================================
     UPDATE QUANTITY
  ====================================================== */

  const updateQty = useCallback(
    (
      productId: string,
      qty: number
    ) => {
      /*
       * Quantity <= 0 means remove.
       */

      if (qty <= 0) {
        setCartItems((prev) =>
          prev.filter(
            (item) =>
              item.productId !==
              productId
          )
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

  /* =======================================================
     CLEAR CART
  ====================================================== */

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  /* =======================================================
     CART TOTALS
  ====================================================== */

  const cartCount =
    cartItems.reduce(
      (sum, item) =>
        sum + item.quantity,
      0
    );

  const cartTotal =
    cartItems.reduce(
      (sum, item) => {
        const product =
          PRODUCTS.find(
            (p) =>
              p.id ===
              item.productId
          );

        if (!product) {
          return sum;
        }

        return (
          sum +
          product.net *
            item.quantity
        );
      },
      0
    );

  /* =======================================================
     PLACE ORDER
  ====================================================== */

  const placeOrder = useCallback(
    (details: CheckoutDetails) => {
      const orderId =
        `ORD-2024-${String(
          orders.length + 1
        ).padStart(3, "0")}`;

      const newOrder: Order = {
        id: orderId,

        retailerName: isLoggedIn
          ? "Rajesh Kumar"
          : details.shopName,

        retailerShop:
          details.shopName,

        retailerPhone:
          details.contact,

        retailerAddress:
          details.address,

        date: new Date()
          .toISOString()
          .split("T")[0],

        items: cartItems.map(
          (item) => {
            const product =
              PRODUCTS.find(
                (p) =>
                  p.id ===
                  item.productId
              )!;

            return {
              productId:
                item.productId,

              productName:
                product.name,

              quantity:
                item.quantity,

              rate:
                product.net,
            };
          }
        ),

        total: cartTotal,

        status: "Submitted",
      };

      setOrders((prev) => [
        newOrder,
        ...prev,
      ]);

      setConfirmedOrderId(
        orderId
      );

      clearCart();

      navigate(
        "confirmation"
      );
    },
    [
      orders.length,
      isLoggedIn,
      cartItems,
      cartTotal,
      clearCart,
      navigate,
    ]
  );

  /* =======================================================
     CART BODY LOCK
  ====================================================== */

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow =
        "hidden";
    } else {
      document.body.style.overflow =
        "";
    }

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [isCartOpen]);

  /* =======================================================
     PROVIDER
  ====================================================== */

  return (
    <AppContext.Provider
      value={{
        page,

        navigate,

        navigateToProduct,

        selectedProductId,

        adminTab,

        setAdminTab,

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

        toasts,

        addToast,

        removeToast,

        orders,

        setOrders,

        confirmedOrderId,

        placeOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}