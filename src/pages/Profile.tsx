import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "../context";

type ProfileForm = {
  name: string;
  email: string;
  phone: string;
  shopName: string;
  gstNumber: string;
  drugLicence: string;
  profileImage: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

const emptyForm: ProfileForm = {
  name: "",
  email: "",
  phone: "",
  shopName: "",
  gstNumber: "",
  drugLicence: "",
  profileImage: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

const getInitials = (name?: string) => {
  const safeName = name?.trim() || "User";

  const parts = safeName.split(/\s+/);

  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#6B7280]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-2xl border px-4 py-3.5 text-sm font-medium outline-none transition-all ${
          disabled
            ? "cursor-not-allowed border-black/[0.05] bg-[#F5F7F5] text-[#9CA3AF]"
            : "border-black/[0.08] bg-white text-[#1C1C1E] placeholder:text-[#B0B5BA] focus:border-[#0D9A55]/40 focus:ring-4 focus:ring-[#0D9A55]/10"
        }`}
      />
    </div>
  );
}

function SectionIcon({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E8F5EE] text-[#0D9A55]">
      {children}
    </div>
  );
}

export default function Profile() {
  const {
    customerProfile,
    refreshCustomerProfile,
    saveCustomerProfile,
    addToast,
  } = useApp();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProfileForm>(emptyForm);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);

      const profile = await refreshCustomerProfile();

      if (profile) {
        setForm({
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          shopName: profile.shopName || "",
          gstNumber: profile.gstNumber || "",
          drugLicence: profile.drugLicence || "",
          profileImage: profile.profileImage || "",
          address: profile.address || "",
          city: profile.city || "",
          state: profile.state || "",
          pincode: profile.pincode || "",
        });
      }

      setLoading(false);
    }

    loadProfile();
  }, [refreshCustomerProfile]);

  useEffect(() => {
    if (!customerProfile || editing) return;

    setForm({
      name: customerProfile.name || "",
      email: customerProfile.email || "",
      phone: customerProfile.phone || "",
      shopName: customerProfile.shopName || "",
      gstNumber: customerProfile.gstNumber || "",
      drugLicence: customerProfile.drugLicence || "",
      profileImage: customerProfile.profileImage || "",
      address: customerProfile.address || "",
      city: customerProfile.city || "",
      state: customerProfile.state || "",
      pincode: customerProfile.pincode || "",
    });
  }, [customerProfile, editing]);

  const updateField = (
    field: keyof ProfileForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  function startEditing() {
    if (!customerProfile) return;

    setForm({
      name: customerProfile.name || "",
      email: customerProfile.email || "",
      phone: customerProfile.phone || "",
      shopName: customerProfile.shopName || "",
      gstNumber: customerProfile.gstNumber || "",
      drugLicence: customerProfile.drugLicence || "",
      profileImage: customerProfile.profileImage || "",
      address: customerProfile.address || "",
      city: customerProfile.city || "",
      state: customerProfile.state || "",
      pincode: customerProfile.pincode || "",
    });

    setEditing(true);
  }

  function cancelEditing() {
    if (customerProfile) {
      setForm({
        name: customerProfile.name || "",
        email: customerProfile.email || "",
        phone: customerProfile.phone || "",
        shopName: customerProfile.shopName || "",
        gstNumber: customerProfile.gstNumber || "",
        drugLicence: customerProfile.drugLicence || "",
        profileImage: customerProfile.profileImage || "",
        address: customerProfile.address || "",
        city: customerProfile.city || "",
        state: customerProfile.state || "",
        pincode: customerProfile.pincode || "",
      });
    }

    setEditing(false);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      addToast("Name is required.", "error");
      return;
    }

    if (!form.email.trim()) {
      addToast("Email is required.", "error");
      return;
    }

    try {
      setSaving(true);

      await saveCustomerProfile({
        name: form.name,
        email: form.email,
        phone: form.phone,
        shopName: form.shopName,
        gstNumber: form.gstNumber,
        drugLicence: form.drugLicence,
        profileImage: form.profileImage,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      });

      setEditing(false);
      addToast("Profile updated successfully.", "success");
    } catch (error) {
      addToast(
        error instanceof Error
          ? error.message
          : "Failed to update profile.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#F8FAF8] px-4 py-16">
        <div className="mx-auto flex max-w-5xl items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E8F5EE] border-t-[#0D9A55]" />
            <p className="text-sm font-medium text-[#6B7280]">
              Loading your profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!customerProfile) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#F8FAF8] px-4">
        <div className="rounded-3xl border border-black/[0.05] bg-white p-8 text-center shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#E8F5EE] text-[#0D9A55]">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.6}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
              />
            </svg>
          </div>

          <h1 className="text-xl font-extrabold text-[#1C1C1E]">
            Profile unavailable
          </h1>

          <p className="mt-2 text-sm text-[#6B7280]">
            Please log in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  const initials = getInitials(
    editing ? form.name : customerProfile.name
  );

  const image =
    editing
      ? form.profileImage
      : customerProfile.profileImage;

  return (
    <div className="min-h-screen bg-[#F8FAF8]">
      {/* Header */}
      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute -right-32 -top-40 h-80 w-80 rounded-full bg-[#0D9A55]/[0.07] blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-[#0D9A55]/[0.04] blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#0D9A55]">
                Account
              </p>

              <h1
                className="text-3xl font-extrabold tracking-tight text-[#1C1C1E] sm:text-4xl"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                My Profile
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#6B7280] sm:text-base">
                Keep your personal, business and delivery information
                up to date.
              </p>
            </div>

            {!editing && (
              <motion.button
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                onClick={startEditing}
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#0D9A55] px-6 py-3.5 text-sm font-bold text-white shadow-[0_7px_25px_rgba(13,154,85,0.25)] transition-shadow hover:shadow-[0_12px_30px_rgba(13,154,85,0.35)]"
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
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 7.125 16.875 4.5"
                  />
                </svg>
                Edit Profile
              </motion.button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Profile summary */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6 overflow-hidden rounded-[2rem] border border-black/[0.05] bg-white shadow-[0_5px_25px_rgba(0,0,0,0.06)]"
        >
          <div className="h-24 bg-gradient-to-r from-[#0D9A55] to-[#12B060]" />

          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end">
              {/* Avatar */}
              <div className="relative h-24 w-24 shrink-0">
                {image ? (
                  <img
                    src={image}
                    alt={customerProfile.name}
                    className="h-24 w-24 rounded-3xl border-4 border-white object-cover shadow-lg"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-white bg-[#E8F5EE] text-2xl font-extrabold text-[#0D9A55] shadow-lg">
                    {initials}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 sm:pb-1">
                <h2 className="truncate text-2xl font-extrabold text-[#1C1C1E]">
                  {customerProfile.name}
                </h2>

                <p className="mt-1 truncate text-sm text-[#6B7280]">
                  {customerProfile.email}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#E8F5EE] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0D9A55]">
                    {customerProfile.role === "ADMIN"
                      ? "Administrator"
                      : "Retailer"}
                  </span>

                  {customerProfile.shopName && (
                    <span className="rounded-full bg-[#F5F7F5] px-3 py-1 text-[10px] font-bold text-[#6B7280]">
                      {customerProfile.shopName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {editing && (
              <div className="mt-7 rounded-2xl border border-[#0D9A55]/10 bg-[#F8FAF8] p-4">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#6B7280]">
                  Profile Image URL
                </label>

                <input
                  value={form.profileImage}
                  onChange={(e) =>
                    updateField("profileImage", e.target.value)
                  }
                  placeholder="https://example.com/profile.jpg"
                  className="w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0D9A55]/40 focus:ring-4 focus:ring-[#0D9A55]/10"
                />

                <p className="mt-2 text-[11px] text-[#9CA3AF]">
                  Image upload from your device will be connected in the
                  next step.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Personal Information */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-[2rem] border border-black/[0.05] bg-white p-5 shadow-[0_5px_25px_rgba(0,0,0,0.05)] sm:p-8"
        >
          <div className="mb-7 flex items-center gap-4">
            <SectionIcon>
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.7}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0"
                />
              </svg>
            </SectionIcon>

            <div>
              <h2 className="text-lg font-extrabold text-[#1C1C1E]">
                Personal Information
              </h2>

              <p className="mt-0.5 text-xs text-[#9CA3AF]">
                Your basic contact information
              </p>
            </div>
          </div>

          {editing ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field
                label="Full Name"
                value={form.name}
                onChange={(value) => updateField("name", value)}
                placeholder="Enter your name"
              />

              <Field
                label="Email Address"
                value={form.email}
                onChange={(value) => updateField("email", value)}
                placeholder="you@example.com"
                type="email"
              />

              <Field
                label="Phone Number"
                value={form.phone}
                onChange={(value) => updateField("phone", value)}
                placeholder="Enter phone number"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                ["Full Name", customerProfile.name],
                ["Email Address", customerProfile.email],
                ["Phone Number", customerProfile.phone],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl bg-[#F8FAF8] p-4"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF]">
                    {label}
                  </p>
                  <p className="break-words text-sm font-bold text-[#1C1C1E]">
                    {value || "Not added"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Business Information */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6 rounded-[2rem] border border-black/[0.05] bg-white p-5 shadow-[0_5px_25px_rgba(0,0,0,0.05)] sm:p-8"
        >
          <div className="mb-7 flex items-center gap-4">
            <SectionIcon>
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.7}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 21h16.5M5.25 21V7.5L12 3l6.75 4.5V21M9 21v-6h6v6M8.25 9.75h.008v.008H8.25V9.75Zm3.746 0h.008v.008h-.008V9.75Zm3.746 0h.008v.008h-.008V9.75Z"
                />
              </svg>
            </SectionIcon>

            <div>
              <h2 className="text-lg font-extrabold text-[#1C1C1E]">
                Business Information
              </h2>

              <p className="mt-0.5 text-xs text-[#9CA3AF]">
                Your pharmacy and licensing details
              </p>
            </div>
          </div>

          {editing ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field
                label="Shop / Pharmacy Name"
                value={form.shopName}
                onChange={(value) => updateField("shopName", value)}
                placeholder="Enter shop name"
              />

              <Field
                label="GST Number"
                value={form.gstNumber}
                onChange={(value) => updateField("gstNumber", value)}
                placeholder="Enter GST number"
              />

              <Field
                label="Drug Licence Number"
                value={form.drugLicence}
                onChange={(value) =>
                  updateField("drugLicence", value)
                }
                placeholder="Enter drug licence number"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                ["Shop / Pharmacy", customerProfile.shopName],
                ["GST Number", customerProfile.gstNumber],
                ["Drug Licence", customerProfile.drugLicence],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl bg-[#F8FAF8] p-4"
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF]">
                    {label}
                  </p>
                  <p className="break-words text-sm font-bold text-[#1C1C1E]">
                    {value || "Not added"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Address */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 rounded-[2rem] border border-black/[0.05] bg-white p-5 shadow-[0_5px_25px_rgba(0,0,0,0.05)] sm:p-8"
        >
          <div className="mb-7 flex items-center gap-4">
            <SectionIcon>
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.7}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 10.5-7.5 10.5S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
              </svg>
            </SectionIcon>

            <div>
              <h2 className="text-lg font-extrabold text-[#1C1C1E]">
                Business Address
              </h2>

              <p className="mt-0.5 text-xs text-[#9CA3AF]">
                Your pharmacy delivery address
              </p>
            </div>
          </div>

          {editing ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field
                  label="Address"
                  value={form.address}
                  onChange={(value) => updateField("address", value)}
                  placeholder="House / Shop number, street, locality"
                />
              </div>

              <Field
                label="City"
                value={form.city}
                onChange={(value) => updateField("city", value)}
                placeholder="Enter city"
              />

              <Field
                label="State"
                value={form.state}
                onChange={(value) => updateField("state", value)}
                placeholder="Enter state"
              />

              <Field
                label="Pincode"
                value={form.pincode}
                onChange={(value) => updateField("pincode", value)}
                placeholder="Enter pincode"
              />
            </div>
          ) : (
            <div>
              <div className="rounded-2xl bg-[#F8FAF8] p-5">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF]">
                  Address
                </p>

                <p className="text-sm font-bold leading-6 text-[#1C1C1E]">
                  {customerProfile.address || "Address not added"}
                </p>

                <p className="mt-1 text-sm text-[#6B7280]">
                  {[
                    customerProfile.city,
                    customerProfile.state,
                    customerProfile.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Location not added"}
                </p>
              </div>
            </div>
          )}
        </motion.section>

        {/* Save controls */}
        {editing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky bottom-4 z-30 rounded-3xl border border-black/[0.06] bg-white/95 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.12)] backdrop-blur-md sm:flex sm:items-center sm:justify-between sm:px-5"
          >
            <p className="hidden text-sm font-medium text-[#6B7280] sm:block">
              Make sure your information is correct before saving.
            </p>

            <div className="flex w-full gap-3 sm:w-auto">
              <button
                onClick={cancelEditing}
                disabled={saving}
                className="flex-1 rounded-2xl border border-black/[0.08] bg-white px-5 py-3 text-sm font-bold text-[#374151] transition hover:bg-[#F8FAF8] disabled:opacity-50 sm:flex-none"
              >
                Cancel
              </button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0D9A55] px-6 py-3 text-sm font-bold text-white shadow-[0_6px_20px_rgba(13,154,85,0.25)] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving...
                  </>
                ) : (
                  <>
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
                        d="m4.5 12.75 6 6 9-13.5"
                      />
                    </svg>
                    Save Changes
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}