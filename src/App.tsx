
import { useEffect, useRef } from "react";

import {
  AppProvider,
  useApp,
} from "./context";

import Navbar from "./components/Navbar";
import CartDrawer from "./components/CartDrawer";
import ToastContainer from "./components/Toast";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Catalogue from "./pages/Catalogue";
import ProductDetail from "./pages/ProductDetail";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import Confirmation from "./pages/Confirmation";
import Login from "./pages/Login";
import OrderHistory from "./pages/OrderHistory";
import Tracking from "./pages/Tracking";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import {
  TermsPage,
  PrivacyPage,
} from "./pages/Legal";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";

/* =========================================================
   PAGES WITHOUT FOOTER
========================================================= */

const NO_FOOTER_PAGES = new Set([
  "login",
  "confirmation",
  "admin",
]);

/* =========================================================
   PAGE → PATH
========================================================= */

const pageToPath: Record<string, string> = {
  home: "/",
  catalogue: "/catalogue",
  cart: "/cart",
  checkout: "/checkout",
  confirmation: "/confirmation",
  login: "/login",
  orders: "/orders",
  tracking: "/tracking",
  about: "/about",
  contact: "/contact",
  faq: "/faq",
  terms: "/terms",
  privacy: "/privacy",
  admin: "/admin",
  notfound: "/404",
  profile: "/profile",
};

/* =========================================================
   PATH → PAGE
========================================================= */

function pathToPage(pathname: string) {
  const path =
    pathname.replace(/\/+$/, "") || "/";

  if (path === "/") return "home";

  if (
    path === "/catalogue" ||
    path === "/shop"
  ) {
    return "catalogue";
  }

  if (path === "/cart") return "cart";

  if (path === "/checkout") {
    return "checkout";
  }

  if (path === "/confirmation") {
    return "confirmation";
  }

  if (
    path === "/login" ||
    path === "/register"
  ) {
    return "login";
  }

  if (path === "/orders") {
    return "orders";
  }
  if (path === "/profile") {
    return "profile";
  }

  if (path === "/tracking") {
    return "tracking";
  }

  if (path === "/about") {
    return "about";
  }

  if (path === "/contact") {
    return "contact";
  }

  if (path === "/faq") {
    return "faq";
  }

  if (path === "/terms") {
    return "terms";
  }

  if (path === "/privacy") {
    return "privacy";
  }

  if (path === "/admin") {
    return "admin";
  }

  if (path === "/404") {
    return "notfound";
  }

  if (path.startsWith("/product/")) {
    return "product";
  }

  return "notfound";
}

/* =========================================================
   GET PRODUCT ID
========================================================= */

function getProductIdFromPath(pathname: string) {
  const path =
    pathname.replace(/\/+$/, "");

  if (!path.startsWith("/product/")) {
    return null;
  }

  const id = path
    .substring("/product/".length)
    .split("/")[0];

  return id || null;
}

/* =========================================================
   ROUTER
========================================================= */

function RouterSync() {
  const {
    page,
    navigate,
    navigateToProduct,
    selectedProductId,
  } = useApp();

  /*
   * This is extremely important.
   *
   * It prevents the URL → state synchronization
   * from running again after the initial load.
   */
  const initialized = useRef(false);

  /*
   * Prevents the page → URL effect from pushing
   * a duplicate URL immediately after browser
   * back/forward navigation.
   */
  const ignoreNextPageSync = useRef(false);

  /* =======================================================
     INITIAL LOAD
  ====================================================== */

  useEffect(() => {
    if (initialized.current) {
      return;
    }

    initialized.current = true;

    const pathname =
      window.location.pathname;

    const initialPage =
      pathToPage(pathname);

    /*
     * PRODUCT PAGE
     */

    if (initialPage === "product") {
      const productId =
        getProductIdFromPath(pathname);

      if (productId) {
        /*
         * Do NOT update browser history here.
         * We are already at the correct URL.
         */

        ignoreNextPageSync.current = true;

        navigateToProduct(
          productId
        );

        return;
      }
    }

    /*
     * NORMAL PAGE
     */

    if (initialPage !== page) {
      ignoreNextPageSync.current = true;

      navigate(
        initialPage as any
      );
    }
  }, []); // IMPORTANT: only run ONCE

  /* =======================================================
     PAGE → URL
  ====================================================== */

  useEffect(() => {
    /*
     * Ignore the page update caused by
     * initial URL → state synchronization.
     */

    if (ignoreNextPageSync.current) {
      ignoreNextPageSync.current = false;
      return;
    }

    /*
     * Product page
     */

    if (page === "product") {
      if (selectedProductId) {
        const productPath =
          `/product/${selectedProductId}`;

        if (
          window.location.pathname !==
          productPath
        ) {
          window.history.pushState(
            {
              page: "product",
              productId:
                selectedProductId,
            },
            "",
            productPath
          );
        }
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    /*
     * Normal page
     */

    const newPath =
      pageToPath[page] || "/404";

    /*
     * Only change URL when it is actually
     * different.
     */

    if (
      window.location.pathname !==
      newPath
    ) {
      window.history.pushState(
        {
          page,
        },
        "",
        newPath
      );
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [
    page,
    selectedProductId,
  ]);

  /* =======================================================
     BROWSER BACK / FORWARD
  ====================================================== */

  useEffect(() => {
    const handlePopState = () => {
      const pathname =
        window.location.pathname;

      const newPage =
        pathToPage(pathname);

      /*
       * Product URL
       */

      if (
        newPage === "product"
      ) {
        const productId =
          getProductIdFromPath(
            pathname
          );

        if (productId) {
          ignoreNextPageSync.current =
            true;

          navigateToProduct(
            productId
          );

          return;
        }
      }

      /*
       * Normal URL
       */

      ignoreNextPageSync.current =
        true;

      navigate(
        newPage as any
      );
    };

    window.addEventListener(
      "popstate",
      handlePopState
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState
      );
    };
  }, [
    navigate,
    navigateToProduct,
  ]);

  return null;
}

/* =========================================================
   APP SHELL
========================================================= */

function AppShell() {
  const { page } = useApp();

  /*
   * RouterSync is rendered exactly once here, OUTSIDE the
   * admin/non-admin branch. It must never appear inside both
   * JSX return branches: doing so causes React to fully
   * unmount + remount it whenever `page` crosses the admin
   * boundary (different root element types = different tree),
   * which resets its `initialized` / `ignoreNextPageSync` refs
   * and re-fires the "initial load" navigate() call — producing
   * the infinite update loop.
   */
  return (
    <>
      <RouterSync />

      {page === "admin" ? (
        <>
          <Admin />
          <ToastContainer />
        </>
      ) : (
        <div className="min-h-screen flex flex-col bg-[#F5F7F5]">
          <Navbar />
          <CartDrawer />

          <main className="flex-1">
            {page === "home" && <Home />}
            {page === "catalogue" && <Catalogue />}
            {page === "product" && <ProductDetail />}
            {page === "cart" && <CartPage />}
            {page === "checkout" && <Checkout />}
            {page === "confirmation" && <Confirmation />}
            {page === "login" && <Login />}
            {page === "orders" && <OrderHistory />}
            {page === "profile" && <Profile />}
            {page === "tracking" && <Tracking />}
            {page === "about" && <About />}
            {page === "contact" && <Contact />}
            {page === "faq" && <FAQ />}
            {page === "terms" && <TermsPage />}
            {page === "privacy" && <PrivacyPage />}
            {page === "notfound" && <NotFound />}
          </main>

          {!NO_FOOTER_PAGES.has(page) && <Footer />}

          <ToastContainer />
        </div>
      )}
    </>
  );
}

/* =========================================================
   APP
========================================================= */

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}