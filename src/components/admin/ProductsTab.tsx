import { useState } from 'react';
import { useApp } from '../../context';
import type { Product } from '../../types';
import { Plus, X } from "lucide-react";

function parseProductImages(image?: string) {
  if (!image) return [];
  try {
    const parsed = JSON.parse(image);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === 'string' && value.length > 0)
      : [image];
  } catch {
    return [image];
  }
}

export default function ProductsTab() {
  const { products, updateProduct, createProduct, addToast } = useApp();

  type PricingType =
    | 'NONE'
    | 'DISCOUNT_ON_PTR'
    | 'SAME_PRODUCT_BONUS'
    | 'DIFFERENT_PRODUCT_BONUS'
    | 'SAME_PRODUCT_BONUS_AND_DISCOUNT'
    | 'DIFFERENT_PRODUCT_BONUS_AND_DISCOUNT';

  type AdminProduct = Product & {
    ptr?: number | null;
    gst?: number | null;
    discountType?: PricingType | null;
    discountValue?: number | null;
    discountAmount?: number | null;
    effectivePtr?: number | null;
    buyQuantity?: number | null;
    freeQuantity?: number | null;
    stock?: number;
    barcode?: string | null;
  };

  type ProductForm = {
    name: string;
    company: string;
    composition: string;
    category: string;
    medicineType: string;
    productType: string;
    pack: string;
    countryOfOrigin: string;
    barcode: string;
    prescriptionRequired: boolean;
    image: string;
    description: string;
    mrp: string;
    discountType: PricingType;
    discountValue: string;
    buyQuantity: string;
    freeQuantity: string;
    bonusProductId: string;
    expiry: string;
    stock: string;
    minOrderQuantity: string;
    isActive: boolean;
  };

  const emptyForm: ProductForm = {
    name: '',
    company: '',
    composition: '',
    category: '',
    medicineType: '',
    productType: '',
    pack: '',
    countryOfOrigin: 'India',
    barcode: '',
    prescriptionRequired: false,
    image: '',
    description: '',
    mrp: '',
    discountType: 'NONE',
    discountValue: '',
    buyQuantity: '',
    freeQuantity: '',
    bonusProductId: '',
    expiry: '',
    stock: '',
    minOrderQuantity: '1',
    isActive: true,
  };

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [offerFilter, setOfferFilter] = useState<'All' | 'Offers' | 'No Offer'>('All');
  const [sortKey, setSortKey] = useState<'name' | 'mrp' | 'effectivePtr' | 'stock'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const adminProducts = products as AdminProduct[];
  const categories = ['All', ...Array.from(new Set(adminProducts.map(p => p.category).filter(Boolean))).sort()];

  const calculatePreview = (source: ProductForm) => {
    const mrp = Number(source.mrp) || 0;
    const discount = Math.min(100, Math.max(0, Number(source.discountValue) || 0));
    const buy = Math.max(0, Math.floor(Number(source.buyQuantity) || 0));
    const free = Math.max(0, Math.floor(Number(source.freeQuantity) || 0));
    const ptr = Number((mrp * 0.7619).toFixed(2));

    const hasDiscount =
      source.discountType === 'DISCOUNT_ON_PTR' ||
      source.discountType === 'SAME_PRODUCT_BONUS_AND_DISCOUNT' ||
      source.discountType === 'DIFFERENT_PRODUCT_BONUS_AND_DISCOUNT';
    const hasSameBonus = source.discountType === 'SAME_PRODUCT_BONUS' || source.discountType === 'SAME_PRODUCT_BONUS_AND_DISCOUNT';

    const discountAmount = hasDiscount
      ? Number((ptr * (discount / 100)).toFixed(2))
      : 0;

    const discountedPtr = Math.max(0, Number((ptr - discountAmount).toFixed(2)));
    // Display the effective per-strip cost for one complete same-product
    // scheme group; billing still uses discounted PTR × paid strips.
    const effectivePtr = hasSameBonus && buy > 0 && free > 0
      ? Number((discountedPtr * buy / (buy + free)).toFixed(2))
      : discountedPtr;

    return {
      ptr,
      gst: 5,
      discount,
      discountAmount,
      effectivePtr,
      buy,
      free,
    };
  };

  const preview = calculatePreview(form);

  const getEffectivePtr = (product: AdminProduct) =>
    calculatePreview({
      ...emptyForm,
      mrp: product.mrp == null ? '' : String(product.mrp),
      discountType: (product.discountType || 'NONE') as PricingType,
      discountValue: product.discountValue == null ? '' : String(product.discountValue),
      buyQuantity: product.buyQuantity == null ? '' : String(product.buyQuantity),
      freeQuantity: product.freeQuantity == null ? '' : String(product.freeQuantity),
      bonusProductId: product.bonusProductId || '',
    }).effectivePtr;

  const openAdd = () => {
    setForm({ ...emptyForm });
    setAdding(true);
  };

  const openEdit = (product: AdminProduct) => {
    setForm({
      name: product.name || '',
      company: product.company || '',
      composition: product.composition || '',
      category: product.category || '',
      medicineType: product.medicineType || '',
      productType: product.productType || '',
      pack: product.pack || '',
      countryOfOrigin: product.countryOfOrigin || 'India',
      barcode: product.barcode || '',
      prescriptionRequired: Boolean(product.prescriptionRequired),
      image: product.image || '',
      description: product.description || '',
      mrp: product.mrp == null ? '' : String(product.mrp),
      discountType: (product.discountType || 'NONE') as PricingType,
      discountValue: product.discountValue == null ? '' : String(product.discountValue),
      buyQuantity: product.buyQuantity == null ? '' : String(product.buyQuantity),
      freeQuantity: product.freeQuantity == null ? '' : String(product.freeQuantity),
      bonusProductId: product.bonusProductId || '',
      expiry: product.expiry ? String(product.expiry).slice(0, 10) : '',
      stock: product.stock == null ? '0' : String(product.stock),
      minOrderQuantity: String(product.minOrderQuantity || 1),
      isActive: product.isActive !== false,
    });
    setEditing(product);
  };

  const closeForm = () => {
    setAdding(false);
    setEditing(null);
    setSaving(false);
  };

  const setField = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => {
    setForm(current => ({ ...current, [key]: value }));
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const currentImages = parseProductImages(form.image);
    event.target.value = '';

    if (!files.length) return;
    if (currentImages.length + files.length > 4) {
      addToast('You can add up to 4 medicine images.', 'error');
      return;
    }
    if (files.some(file => !file.type.startsWith('image/'))) {
      addToast('Please select valid image files.', 'error');
      return;
    }
    if (files.some(file => file.size > 1.5 * 1024 * 1024)) {
      addToast('Each medicine image must be 1.5 MB or smaller.', 'error');
      return;
    }

    try {
      const encodedImages = await Promise.all(files.map(file => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Image could not be read'));
        reader.readAsDataURL(file);
      })));
      setField('image', JSON.stringify([...currentImages, ...encodedImages]));
    } catch {
      addToast('One or more medicine images could not be read.', 'error');
    }
  };

  const submitProduct = async () => {
    if (!form.name.trim() || !form.company.trim() || !form.composition.trim() || !form.category.trim() || !form.pack.trim()) {
      addToast('Product name, company, composition, category and pack size are required.', 'error');
      return;
    }

    if (!form.mrp || Number(form.mrp) < 0) {
      addToast('Enter a valid MRP.', 'error');
      return;
    }

    if (!form.expiry) {
      addToast('Expiry date is required.', 'error');
      return;
    }

    if (!Number.isInteger(Number(form.minOrderQuantity)) || Number(form.minOrderQuantity) < 1) {
      addToast('Minimum order quantity must be a positive whole number.', 'error');
      return;
    }

    const needsSameBonus = form.discountType.includes('BONUS');

    if (needsSameBonus && (!(Number(form.buyQuantity) > 0) || !(Number(form.freeQuantity) > 0))) {
      addToast('Buy and free quantities are required for every bonus offer.', 'error');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        company: form.company.trim(),
        composition: form.composition.trim(),
        category: form.category.trim(),
        medicineType: form.medicineType.trim() || undefined,
        productType: form.productType.trim() || undefined,
        pack: form.pack.trim(),
        countryOfOrigin: form.countryOfOrigin.trim() || undefined,
        barcode: form.barcode.trim() || undefined,
        prescriptionRequired: form.prescriptionRequired,
        image: form.image.trim() || undefined,
        description: form.description.trim() || undefined,
        mrp: Number(form.mrp),
        discountType: form.discountType,
        discountValue: Number(form.discountValue) || 0,
        buyQuantity: Number(form.buyQuantity) || 0,
        freeQuantity: Number(form.freeQuantity) || 0,
        bonusProductId: form.bonusProductId || undefined,
        expiry: form.expiry,
        stock: Number(form.stock) || 0,
        minOrderQuantity: Number(form.minOrderQuantity) || 1,
        isActive: form.isActive,
      };

      if (editing) {
        await (updateProduct as any)(editing.id, payload);
        addToast('Product updated successfully.', 'success');
      } else {
        await (createProduct as any)(payload);
        addToast('Product added successfully.', 'success');
      }

      closeForm();
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Could not save product.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(current => current === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const hasOffer = (p: AdminProduct) =>
    p.discountType && p.discountType !== 'NONE';

  const filtered = adminProducts
    .filter(p => {
      const q = search.toLowerCase().trim();
      const matchesSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        p.company.toLowerCase().includes(q) ||
        p.composition.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
      const matchesOffer = offerFilter === 'All' ||
        (offerFilter === 'Offers' ? Boolean(hasOffer(p)) : !hasOffer(p));
      return matchesSearch && matchesCategory && matchesOffer;
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'name') return a.name.localeCompare(b.name) * dir;
      if (sortKey === 'mrp') return (Number(a.mrp) - Number(b.mrp)) * dir;
      if (sortKey === 'stock') return (Number(a.stock || 0) - Number(b.stock || 0)) * dir;
      return (getEffectivePtr(a) - getEffectivePtr(b)) * dir;
    });

  const discountLabel = (p: AdminProduct) => {
    const type = p.discountType || 'NONE';
    if (type === 'SAME_PRODUCT_BONUS' || type === 'SAME_PRODUCT_BONUS_AND_DISCOUNT') {
      return `BUY ${p.buyQuantity || 0} GET ${p.freeQuantity || 0}`;
    }
    if (type === 'DISCOUNT_ON_PTR' || type === 'DIFFERENT_PRODUCT_BONUS_AND_DISCOUNT') {
      return `${Number(p.discountValue || 0)}% OFF`;
    }
    if (type === 'DIFFERENT_PRODUCT_BONUS') return 'BONUS';
    return 'No Offer';
  };

  const price = (value: number | null | undefined) =>
    `₹${Number(value || 0).toFixed(2)}`;

const productFormModal = (adding || editing) ? (
    <div className="fixed inset-0 z-[100] bg-slate-950/60 p-2 sm:p-5 flex items-center justify-center">
      <div className="w-full max-w-6xl max-h-[96vh] overflow-hidden rounded-3xl bg-[#F7F9FC] shadow-2xl flex flex-col">
        <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-7 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] font-extrabold text-[#1266F1]">Inventory Management</p>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">{editing ? 'Edit Medicine' : 'Add Medicine'}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage product information, purchase pricing and offers in one place.</p>
          </div>
          <button type="button" onClick={closeForm} className="h-10 w-10 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-4 sm:gap-6">
            <div className="space-y-4">
              <section className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Medicine Details</h3>
                    <p className="text-xs text-slate-500 mt-1">Basic information shown to pharmacy buyers.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold">PRODUCT</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {[
                    ['name', 'Product Name', 'e.g. Paracetamol 500mg', true],
                    ['company', 'Company / Manufacturer', 'e.g. GSK', true],
                    ['composition', 'Composition', 'e.g. Paracetamol 500mg', true],
                    ['category', 'Category', 'e.g. Tablets', true],
                    ['medicineType', 'Medicine Type', 'e.g. Allopathic', false],
                    ['productType', 'Product Type', 'e.g. Tablet', false],
                    ['pack', 'Pack Size', 'e.g. 10 Tablets or 100 ml bottle', true],
                    ['countryOfOrigin', 'Country of Origin', 'India', false],
                  ].map(([key, label, placeholder, required]) => (
                    <label key={key as string} className={key === 'composition' ? 'sm:col-span-2' : ''}>
                      <span className="text-xs font-bold text-slate-700">{label as string}{required ? ' *' : ''}</span>
                      <input
                        value={form[key as keyof ProductForm] as string}
                        onChange={e => setField(key as keyof ProductForm, e.target.value as never)}
                        placeholder={placeholder as string}
                        className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.75 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </label>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5">
                <div className="mb-4">
                  <h3 className="text-sm font-extrabold text-slate-900">Selling & Stock</h3>
                  <p className="text-xs text-slate-500 mt-1">MRP, stock and minimum order quantity are entered in sellable units. PTR and effective price are calculated automatically.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <label>
                    <span className="text-xs font-bold text-slate-700">MRP *</span>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                      <input type="number" min="0" step="0.01" value={form.mrp} onChange={e => setField('mrp', e.target.value)} className="w-full rounded-xl border border-slate-200 px-8 py-2.75 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="0.00" />
                    </div>
                  </label>
                  <label>
                    <span className="text-xs font-bold text-slate-700">Opening Stock</span>
                    <input type="number" min="0" step="1" value={form.stock} onChange={e => setField('stock', e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.75 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="0" />
                  </label>
                  <label>
                    <span className="text-xs font-bold text-slate-700">Minimum Order Quantity</span>
                    <input type="number" min="1" step="1" value={form.minOrderQuantity} onChange={e => setField('minOrderQuantity', e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.75 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="1" />
                  </label>
                  <label>
                    <span className="text-xs font-bold text-slate-700">Expiry Date *</span>
                    <input type="date" value={form.expiry} onChange={e => setField('expiry', e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.75 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
                  </label>
                </div>
              </section>

              <section className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5">
               
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                 
                  
                 
                  <div className="sm:col-span-2">
                    <span className="text-xs font-bold text-slate-700">Medicine Images</span>
                    <div className="mt-1.5 flex flex-col sm:flex-row gap-3">
                      <label className="inline-flex min-h-28 flex-1 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-center transition hover:border-blue-400 hover:bg-blue-50/50">
                        <input type="file" multiple accept="image/png,image/jpeg,image/webp" onChange={event => void handleImageChange(event)} className="sr-only" />
                        <span>
                          <span className="block text-sm font-bold text-slate-700">Choose medicine images</span>
                          <span className="mt-1 block text-xs text-slate-500">PNG, JPG or WebP — maximum 5 MB</span>
                        </span>
                      </label>
                      {parseProductImages(form.image).map((image, index) => (
                        <div key={`${image.slice(0, 30)}-${index}`} className="relative h-28 w-full overflow-hidden rounded-xl border border-slate-200 bg-white sm:w-36">
                          <img src={image} alt={`Medicine preview ${index + 1}`} className="h-full w-full object-contain p-2" />
                          <button type="button" onClick={() => setField('image', JSON.stringify(parseProductImages(form.image).filter((_, imageIndex) => imageIndex !== index)))} className="absolute right-1.5 top-1.5 rounded-lg bg-slate-900/75 px-2 py-1 text-[10px] font-bold text-white hover:bg-slate-900">Remove</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-4">
              <section className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 xl:sticky xl:top-0">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Purchase Pricing</h3>
                    <p className="text-xs text-slate-500 mt-1">Medimny-style PTR and offer calculation.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold">AUTO</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                    <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">MRP</p>
                    <p className="mt-1 text-lg font-extrabold text-slate-900">{price(Number(form.mrp) || 0)}</p>
                  </div>
                  <div className="rounded-xl bg-blue-50 border border-blue-100 p-3">
                    <p className="text-[10px] uppercase tracking-wide font-bold text-blue-500">PTR</p>
                    <p className="mt-1 text-lg font-extrabold text-blue-700">{price(preview.ptr)}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                    <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">GST</p>
                    <p className="mt-1 text-lg font-extrabold text-slate-900">{preview.gst}%</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                    <p className="text-[10px] uppercase tracking-wide font-bold text-emerald-600">Effective PTR</p>
                    <p className="mt-1 text-lg font-extrabold text-emerald-700">{price(preview.effectivePtr)}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                    <p className="text-xs font-extrabold text-slate-800">Offer</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <label>
                      <span className="text-xs font-bold text-slate-700">Offer Type</span>
                      <select value={form.discountType} onChange={e => setField('discountType', e.target.value as PricingType)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.75 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10">
                        <option value="NONE">No Offer</option>
                        <option value="DISCOUNT_ON_PTR">Discount on PTR</option>
                        <option value="SAME_PRODUCT_BONUS">Buy X Get Y — Same Product</option>
                        <option value="DIFFERENT_PRODUCT_BONUS">Buy X Get Y — Different Product</option>
                        <option value="SAME_PRODUCT_BONUS_AND_DISCOUNT">Bonus + Discount — Same Product</option>
                        <option value="DIFFERENT_PRODUCT_BONUS_AND_DISCOUNT">Bonus + Discount — Different Product</option>
                      </select>
                    </label>

                    {(form.discountType === 'DISCOUNT_ON_PTR' || form.discountType === 'SAME_PRODUCT_BONUS_AND_DISCOUNT' || form.discountType === 'DIFFERENT_PRODUCT_BONUS_AND_DISCOUNT') && (
                      <label>
                        <span className="text-xs font-bold text-slate-700">Discount on PTR (%)</span>
                        <div className="relative mt-1.5">
                          <input type="number" min="0" max="100" step="0.01" value={form.discountValue} onChange={e => setField('discountValue', e.target.value)} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.75 pr-9 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="0" />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                        </div>
                      </label>
                    )}

                    {(form.discountType === 'SAME_PRODUCT_BONUS' || form.discountType === 'DIFFERENT_PRODUCT_BONUS' || form.discountType === 'SAME_PRODUCT_BONUS_AND_DISCOUNT' || form.discountType === 'DIFFERENT_PRODUCT_BONUS_AND_DISCOUNT') && (
                      <>
                      <div className="grid grid-cols-2 gap-3">
                        <label>
                          <span className="text-xs font-bold text-slate-700">Buy Quantity</span>
                          <input type="number" min="1" step="1" value={form.buyQuantity} onChange={e => setField('buyQuantity', e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.75 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="10" />
                        </label>
                        <label>
                          <span className="text-xs font-bold text-slate-700">Free Quantity</span>
                          <input type="number" min="1" step="1" value={form.freeQuantity} onChange={e => setField('freeQuantity', e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.75 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" placeholder="2" />
                        </label>
                      </div>
                      {(form.discountType === 'DIFFERENT_PRODUCT_BONUS' || form.discountType === 'DIFFERENT_PRODUCT_BONUS_AND_DISCOUNT') && (
                        <label className="block">
                          <span className="text-xs font-bold text-slate-700">Free bonus product</span>
                          <select value={form.bonusProductId} onChange={e => setField('bonusProductId', e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.75 text-sm outline-none focus:border-blue-500">
                            <option value="">Select the product given free</option>
                            {adminProducts.filter(product => product.id !== editing?.id).map(product => <option key={product.id} value={product.id}>{product.name} — {product.pack}</option>)}
                          </select>
                        </label>
                      )}
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-slate-900 text-white p-4">
                  <div className="flex items-center justify-between text-xs text-slate-300"><span>PTR</span><span>{price(preview.ptr)}</span></div>
                  <div className="flex items-center justify-between text-xs text-slate-300 mt-2"><span>Discount Amount</span><span>- {price(preview.discountAmount)}</span></div>
                  <div className="flex items-center justify-between text-sm font-extrabold mt-3 pt-3 border-t border-white/10"><span>Final Effective PTR (Without GST)</span><span className="text-emerald-300">{price(preview.effectivePtr)}</span></div>
                  {preview.buy > 0 && preview.free > 0 && <p className="mt-3 text-[11px] text-slate-300">Offer: <strong className="text-white">BUY {preview.buy} GET {preview.free} FREE</strong></p>}
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="bg-white border-t border-slate-200 px-4 sm:px-7 py-3.5 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
          <button type="button" onClick={closeForm} className="px-5 py-2.75 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
          <button type="button" disabled={saving} onClick={() => void submitProduct()} className="px-6 py-2.75 rounded-xl bg-[#1266F1] text-white text-sm font-extrabold shadow-sm hover:bg-[#0F56D0] disabled:opacity-60">{saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Product'}</button>
        </div>
         </div>
    </div>
  ) : null;

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="rounded-2xl bg-gradient-to-r from-[#0E63E8] to-[#2380F7] text-white p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-blue-100">Inventory</p>
            <h2 className="text-xl sm:text-2xl font-extrabold mt-1">Medicine Inventory</h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-1">Manage medicines, best pricing, offers and stock like a professional B2B pharmacy portal.</p>
          </div>
          <button onClick={openAdd} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-[#1266F1] px-4 py-2.5 text-sm font-extrabold hover:bg-blue-50 shadow-sm">
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ['Total Medicines', adminProducts.length, 'catalogue'],
          ['Active Stock', adminProducts.reduce((s, p) => s + Number(p.stock || 0), 0), 'units'],
          ['Products on Offer', adminProducts.filter(hasOffer).length, 'offers'],
          ['Low Stock', adminProducts.filter(p => Number(p.stock || 0) <= 10).length, 'need attention'],
        ].map(([label, value, note]) => (
          <div key={label as string} className="bg-white rounded-2xl border border-slate-200 p-4">
            <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">{label as string}</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1">{Number(value).toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{note as string}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4">
        <div className="flex flex-col xl:flex-row gap-3">
          <div className="relative flex-1">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search medicine, company or composition…" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.75 text-sm outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.75 text-sm outline-none focus:border-blue-500">
              {categories.map(category => <option key={category}>{category}</option>)}
            </select>
            <select value={offerFilter} onChange={e => setOfferFilter(e.target.value as typeof offerFilter)} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.75 text-sm outline-none focus:border-blue-500">
              <option value="All">All Products</option>
              <option value="Offers">Offers Only</option>
              <option value="No Offer">No Offer</option>
            </select>
          </div>
        </div>
      </div>

      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-[10px] uppercase tracking-wide text-slate-500">
                <th className="text-left px-4 py-3">Medicine</th>
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-right px-4 py-3 cursor-pointer" onClick={() => toggleSort('mrp')}>MRP</th>
                <th className="text-right px-4 py-3">PTR</th>
                <th className="text-center px-4 py-3">GST</th>
                <th className="text-center px-4 py-3">Offer</th>
                <th className="text-right px-4 py-3 cursor-pointer" onClick={() => toggleSort('effectivePtr')}>Effective PTR</th>
                <th className="text-right px-4 py-3 cursor-pointer" onClick={() => toggleSort('stock')}>Stock</th>
                <th className="text-right px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(product => {
                const effective = getEffectivePtr(product);
                const offer = discountLabel(product);
                return (
                  <tr key={product.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <button onClick={() => setSelectedProduct(product)} className="text-left">
                        <p className="font-bold text-slate-900 hover:text-blue-600">{product.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{product.composition} · {product.pack}</p>
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{product.company}</td>
                    <td className="px-4 py-3.5 text-right text-slate-600">{price(product.mrp)}</td>
                    <td className="px-4 py-3.5 text-right font-semibold text-blue-700">{price(product.ptr ?? Number(product.mrp) * 0.7619)}</td>
                    <td className="px-4 py-3.5 text-center text-slate-600">{Number(product.gst ?? 5)}%</td>
                    <td className="px-4 py-3.5 text-center"><span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${offer === 'No Offer' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700'}`}>{offer}</span></td>
                    <td className="px-4 py-3.5 text-right font-extrabold text-emerald-700">{price(effective)}</td>
                    <td className="px-4 py-3.5 text-right"><span className={`font-bold ${Number(product.stock || 0) <= 10 ? 'text-red-600' : 'text-slate-700'}`}>{Number(product.stock || 0)}</span></td>
                    <td className="px-4 py-3.5 text-right"><button onClick={() => openEdit(product)} className="rounded-lg bg-blue-50 text-blue-700 px-3 py-1.5 text-xs font-bold hover:bg-blue-100">Edit</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="px-6 py-12 text-center text-sm text-slate-500">No medicines match your search.</div>}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">Showing {filtered.length} of {adminProducts.length} medicines</div>
      </div>

      <div className="md:hidden space-y-3">
        {filtered.map(product => (
          <div key={product.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <button onClick={() => setSelectedProduct(product)} className="text-left">
                  <h3 className="font-extrabold text-slate-900 truncate">{product.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{product.company}</p>
                </button>
              </div>
              <span className={`shrink-0 px-2 py-1 rounded-lg text-[10px] font-extrabold ${hasOffer(product) ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{discountLabel(product)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] text-slate-400 font-bold">MRP</p><p className="font-extrabold text-slate-900 mt-1">{price(product.mrp)}</p></div>
              <div className="rounded-xl bg-blue-50 p-3"><p className="text-[10px] text-blue-500 font-bold">PTR</p><p className="font-extrabold text-blue-700 mt-1">{price(product.ptr ?? Number(product.mrp) * 0.7619)}</p></div>
              <div className="rounded-xl bg-emerald-50 p-3"><p className="text-[10px] text-emerald-600 font-bold">EFFECTIVE PTR</p><p className="font-extrabold text-emerald-700 mt-1">{price(getEffectivePtr(product))}</p></div>
              <div className="rounded-xl bg-slate-50 p-3"><p className="text-[10px] text-slate-400 font-bold">STOCK</p><p className={`font-extrabold mt-1 ${Number(product.stock || 0) <= 10 ? 'text-red-600' : 'text-slate-900'}`}>{Number(product.stock || 0)}</p></div>
            </div>
            <button onClick={() => openEdit(product)} className="w-full mt-3 rounded-xl bg-blue-50 text-blue-700 py-2.5 text-xs font-extrabold">Edit Product</button>
          </div>
        ))}
        {filtered.length === 0 && <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500">No medicines match your search.</div>}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-[90] bg-slate-950/60 p-3 sm:p-5 flex items-center justify-center" onClick={() => setSelectedProduct(null)}>
          <div className="w-full max-w-4xl max-h-[94vh] overflow-y-auto rounded-3xl bg-[#F7F9FC] shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="bg-white border-b border-slate-200 p-5 sm:p-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-blue-600">Medicine Details</p>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">{selectedProduct.name}</h2>
                <p className="text-sm text-slate-500 mt-1">{selectedProduct.company} · {selectedProduct.pack}</p>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="h-10 w-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                {[
                  ['MRP', price(selectedProduct.mrp), 'slate'],
                  ['PTR', price(selectedProduct.ptr ?? Number(selectedProduct.mrp) * 0.7619), 'blue'],
                  ['GST', `${Number(selectedProduct.gst ?? 5)}%`, 'slate'],
                  ['Effective PTR', price(getEffectivePtr(selectedProduct)), 'green'],
                  ['Stock', String(Number(selectedProduct.stock || 0)), 'slate'],
                ].map(([label, value, tone]) => (
                  <div key={label as string} className={`rounded-2xl p-4 ${tone === 'blue' ? 'bg-blue-50' : tone === 'green' ? 'bg-emerald-50' : 'bg-white border border-slate-200'}`}>
                    <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">{label as string}</p>
                    <p className={`mt-1 text-lg font-extrabold ${tone === 'blue' ? 'text-blue-700' : tone === 'green' ? 'text-emerald-700' : 'text-slate-900'}`}>{value as string}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <h3 className="font-extrabold text-slate-900">Product Information</h3>
                  <div className="mt-3 divide-y divide-slate-100">
                    {[
                      ['Composition', selectedProduct.composition],
                      ['Category', selectedProduct.category],
                      ['Medicine Type', selectedProduct.medicineType],
                      ['Product Type', selectedProduct.productType],
                      ['Expiry', selectedProduct.expiry],
                    ].map(([label, value]) => <div key={label as string} className="py-2.5 flex justify-between gap-4 text-sm"><span className="text-slate-400">{label as string}</span><span className="text-right font-semibold text-slate-800">{value || '—'}</span></div>)}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <h3 className="font-extrabold text-slate-900">Offer & Pricing</h3>
                  <div className="mt-3 divide-y divide-slate-100">
                    <div className="py-2.5 flex justify-between gap-4 text-sm"><span className="text-slate-400">Offer</span><span className="font-extrabold text-emerald-700">{discountLabel(selectedProduct)}</span></div>
                    <div className="py-2.5 flex justify-between gap-4 text-sm"><span className="text-slate-400">Discount Amount</span><span className="font-semibold text-slate-800">{price(selectedProduct.discountAmount)}</span></div>
                    <div className="py-2.5 flex justify-between gap-4 text-sm"><span className="text-slate-400">Buy / Free</span><span className="font-semibold text-slate-800">{selectedProduct.buyQuantity || 0} / {selectedProduct.freeQuantity || 0}</span></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={() => { setSelectedProduct(null); openEdit(selectedProduct); }} className="rounded-xl bg-[#1266F1] text-white px-5 py-2.5 text-sm font-extrabold">Edit Medicine</button>
              </div>
            </div>
          </div>
        </div>
      )}

            {productFormModal}
    </div>
  );
}
