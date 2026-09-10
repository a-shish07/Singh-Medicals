import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context";

export default function Navbar() {
  const {
    navigate,
    cartCount,
    setIsCartOpen,
    isLoggedIn,
    isAdminLoggedIn,
    customerProfile,
    logoutCustomer,
    logoutAdmin,
    page,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const isCustomer =
    isLoggedIn && customerProfile?.role === "CUSTOMER";
  const isAdmin = isAdminLoggedIn;

  const getInitials = (name?: string) => {
    const safeName = name?.trim() || "User";

    return safeName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const navLinks = [
    {
      label: "Home",
      page: "home" as const,
    },
    {
      label: "Shop",
      page: "catalogue" as const,
    },
    {
      label: "About Us",
      page: "about" as const,
    },
    {
      label: "Contact",
      page: "contact" as const,
    },
    {
      label: "FAQ",
      page: "faq" as const,
    },
  ];

  const isActive = (p: string) => page === p;

  const handleNavigation = (
    target: typeof navLinks[number]["page"]
  ) => {
    navigate(target);
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  };

 const handleLogout = () => {
  setProfileMenuOpen(false);
  setMobileMenuOpen(false);

  if (isAdmin) {
    logoutAdmin();
  } else if (isCustomer) {
    logoutCustomer();
  }
};

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/90 shadow-[0_2px_20px_rgba(0,0,0,0.05)] backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-[68px] items-center justify-between gap-4">

          {/* =====================================================
              LOGO
          ====================================================== */}

          <motion.button
            type="button"
            onClick={() => handleNavigation("home")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="group flex shrink-0 items-center gap-2.5"
          >
            <motion.div
  whileHover={{ scale: 1.06 }}
  transition={{ type: "spring", stiffness: 400, damping: 15 }}
  className="flex h-20 w-14 items-center justify-center overflow-hidden rounded-xl"
>
  <img
    src="/logo.PNG"
    alt="Singh Medical"
    className="h-full w-full object-contain"
  />
</motion.div>

            <div className="text-left">
              <p
                className="text-sm font-extrabold leading-tight tracking-tight text-[#1C1C1E]"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Singh Medical
              </p>

              <p className="text-[9px] font-semibold uppercase leading-tight tracking-[0.18em] text-[#6B7280]">
                Stores
              </p>
            </div>
          </motion.button>

          {/* =====================================================
              DESKTOP NAV
          ====================================================== */}

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <button
                key={link.page}
                type="button"
                onClick={() => handleNavigation(link.page)}
                className={`relative rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-200 ${
                  isActive(link.page)
                    ? "text-[#0D9A55]"
                    : "text-[#6B7280] hover:bg-[#E8F5EE] hover:text-[#0D9A55]"
                }`}
              >
                {link.label}

                {isActive(link.page) && (
                  <motion.span
                    layoutId="activeNav"
                    className="absolute bottom-0.5 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-[#0D9A55]"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* =====================================================
              RIGHT ACTIONS
          ====================================================== */}

          <div className="flex items-center gap-1.5">
             {/* =================================================
                CART - ALWAYS VISIBLE
            ================================================== */}

            <motion.button
              type="button"
              onClick={() => setIsCartOpen(true)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-[#E8F5EE]"
            >
              <svg
                className="h-5 w-5 text-[#1C1C1E]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>

              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{
                      scale: 0,
                      opacity: 0,
                    }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                    }}
                    exit={{
                      scale: 0,
                      opacity: 0,
                    }}
                    className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0D9A55] px-1 text-[9px] font-extrabold text-white shadow-[0_3px_10px_rgba(13,154,85,0.35)]"
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>


            {/* =================================================
                CUSTOMER ACTIONS
            ================================================== */}

            {isCustomer && (
              <>
                {/* My Orders */}
                <motion.button
                  type="button"
                  onClick={() => {
                    navigate("orders");
                    setProfileMenuOpen(false);
                  }}
                  whileHover={{ y: -1 }}
                  className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-[#6B7280] transition-colors hover:bg-[#E8F5EE] hover:text-[#0D9A55] sm:flex"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
                    />
                  </svg>

                  My Orders
                </motion.button>

                {/* Profile */}
                <div className="relative hidden sm:block">
                  <motion.button
                    type="button"
                    onClick={() =>
                      setProfileMenuOpen((prev) => !prev)
                    }
                    whileHover={{ y: -1 }}
                    className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 transition-colors hover:bg-[#E8F5EE]"
                  >
                    {/* Profile image */}
                    {customerProfile?.profileImage ? (
                      <img
                        src={customerProfile.profileImage}
                        alt={customerProfile.name || "Profile"}
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-[#E8F5EE]"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#0D9A55] to-[#0A7A43] text-xs font-bold text-white shadow-sm">
                        {getInitials(customerProfile?.name)}
                      </div>
                    )}

                    {/* Customer name */}
                    <span className="max-w-[120px] truncate text-sm font-semibold text-[#1C1C1E]">
                      {customerProfile?.name || "Profile"}
                    </span>

                    {/* Arrow */}
                    <svg
                      className={`h-4 w-4 text-[#6B7280] transition-transform duration-200 ${
                        profileMenuOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m6 9 6 6 6-6"
                      />
                    </svg>
                  </motion.button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {profileMenuOpen && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: -8,
                          scale: 0.97,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          y: -8,
                          scale: 0.97,
                        }}
                        transition={{
                          duration: 0.18,
                        }}
                        className="absolute right-0 top-full z-[100] mt-2 w-56 overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
                      >
                        {/* Profile Header */}
                        <div className="border-b border-black/[0.06] px-4 py-3">
                          <div className="flex items-center gap-3">
                            {customerProfile?.profileImage ? (
                              <img
                                src={customerProfile.profileImage}
                                alt={customerProfile.name || "Profile"}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E8F5EE] text-sm font-bold text-[#0D9A55]">
                                {getInitials(customerProfile?.name)}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-[#1C1C1E]">
                                {customerProfile?.name || "User"}
                              </p>

                              <p className="truncate text-xs text-[#6B7280]">
                                {customerProfile?.email || ""}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* My Profile */}
                        <button
                          type="button"
                          onClick={() => {
                            navigate("profile");
                            setProfileMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-[#4B5563] transition-colors hover:bg-[#E8F5EE] hover:text-[#0D9A55]"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.8}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                            />
                          </svg>

                          <span>My Profile</span>
                        </button>

                        {/* My Orders */}
                        <button
                          type="button"
                          onClick={() => {
                            navigate("orders");
                            setProfileMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-[#4B5563] transition-colors hover:bg-[#E8F5EE] hover:text-[#0D9A55]"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.8}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.25 0 00.75-.75 2.25.25 0 00-.1-.664m-5.8 0A2.251 2.25 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
                            />
                          </svg>

                          <span>My Orders</span>
                        </button>

                        {/* Divider */}
                        <div className="my-1 h-px bg-black/[0.06]" />

                        {/* Logout */}
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.8}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h9.75"
                            />
                          </svg>

                          <span>Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {isAdmin && (
  <motion.button
    type="button"
    onClick={handleLogout}
    whileHover={{ y: -1 }}
    className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 sm:flex"
  >
    Logout
  </motion.button>
)}

            {/* =================================================
                LOGIN - ONLY WHEN NOT LOGGED IN
            ================================================== */}

            {!isLoggedIn && !isAdmin && (
              <motion.button
                type="button"
                onClick={() => navigate("login")}
                whileHover={{ y: -1 }}
                className="hidden items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-[#6B7280] transition-colors hover:bg-[#E8F5EE] hover:text-[#0D9A55] sm:flex"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>

                Login
              </motion.button>
            )}

           
            {/* =================================================
                MOBILE MENU BUTTON
            ================================================== */}

            <motion.button
              type="button"
              onClick={() =>
                setMobileMenuOpen((v) => !v)
              }
              whileTap={{ scale: 0.9 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-[#E8F5EE] md:hidden"
            >
              <svg
                className="h-5 w-5 text-[#1C1C1E]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={
                    mobileMenuOpen
                      ? "M6 18 18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* =====================================================
            MOBILE MENU
        ====================================================== */}

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{
                height: 0,
                opacity: 0,
              }}
              animate={{
                height: "auto",
                opacity: 1,
              }}
              exit={{
                height: 0,
                opacity: 0,
              }}
              transition={{
                duration: 0.25,
              }}
              className="overflow-hidden md:hidden"
            >
              <div className="border-t border-black/[0.06] py-3">

                {/* Customer Profile Header */}
                {isCustomer && (
                  <div className="mb-2 rounded-2xl bg-[#E8F5EE] px-4 py-3">
                    <div className="flex items-center gap-3">
                      {customerProfile?.profileImage ? (
                        <img
                          src={customerProfile.profileImage}
                          alt={customerProfile.name || "Profile"}
                          className="h-11 w-11 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#0D9A55] to-[#0A7A43] text-sm font-bold text-white">
                          {getInitials(customerProfile?.name)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#1C1C1E]">
                          {customerProfile?.name || "User"}
                        </p>

                        <p className="truncate text-xs text-[#6B7280]">
                          {customerProfile?.email || ""}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Navigation */}
                {navLinks.map((link, index) => (
                  <motion.button
                    key={link.page}
                    type="button"
                    initial={{
                      opacity: 0,
                      x: -10,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: index * 0.04,
                    }}
                    onClick={() =>
                      handleNavigation(link.page)
                    }
                    className={`mb-1 flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all ${
                      isActive(link.page)
                        ? "bg-[#E8F5EE] text-[#0D9A55]"
                        : "text-[#6B7280] hover:bg-[#E8F5EE] hover:text-[#0D9A55]"
                    }`}
                  >
                    {link.label}

                    {isActive(link.page) && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#0D9A55]" />
                    )}
                  </motion.button>
                ))}

                <div className="my-2 h-px bg-black/[0.06]" />

                {/* Track Order */}
                <button
                  type="button"
                  onClick={() => {
                    navigate("tracking");
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-[#6B7280] transition-colors hover:bg-[#E8F5EE] hover:text-[#0D9A55]"
                >
                  Track Order
                </button>

                {/* Customer Options */}
                {isCustomer && (
                  <>
                    {/* My Profile */}
                    <button
                      type="button"
                      onClick={() => {
                        navigate("profile");
                        setMobileMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-[#6B7280] transition-colors hover:bg-[#E8F5EE] hover:text-[#0D9A55]"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                        />
                      </svg>

                      My Profile
                    </button>

                    {/* My Orders */}
                    <button
                      type="button"
                      onClick={() => {
                        navigate("orders");
                        setMobileMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-[#6B7280] transition-colors hover:bg-[#E8F5EE] hover:text-[#0D9A55]"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
                        />
                      </svg>

                      My Orders
                    </button>

                    {/* Logout */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h9.75"
                        />
                      </svg>

                      Logout
                    </button>
                  </>
                )}

                {isAdmin && (
  <button
    type="button"
    onClick={handleLogout}
    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
  >
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h9.75"
      />
    </svg>

    Logout
  </button>
)}

                {/* Login */}
               {!isLoggedIn && !isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      navigate("login");
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-[#6B7280] transition-colors hover:bg-[#E8F5EE] hover:text-[#0D9A55]"
                  >
                    Login / Register
                  </button>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}