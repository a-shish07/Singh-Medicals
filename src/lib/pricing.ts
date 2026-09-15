import type { Product } from "../types";

export const GST_RATE = 5;
export const SHIPPING_FEE = 45;
export const FREE_SHIPPING_OVER = 4000;
const PTR_FACTOR = 0.7619;

export const money = (value: number) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

/** The value after × is strips per box; a lone number is also strips per box. */
export function stripsPerBox(pack: string | undefined | null): number | null {
  const text = String(pack || "").trim();
  if (!text) return null;
  const multiplied = text.match(/[x×]\s*(\d+(?:\.0+)?)/i);
  const bare = text.match(/^\s*(\d+(?:\.0+)?)\s*$/);
  const value = Number(multiplied?.[1] || bare?.[1]);
  return Number.isInteger(value) && value > 0 ? value : 1;
}

function bonusType(type?: string) {
  return type === "SAME_PRODUCT_BONUS" || type === "DIFFERENT_PRODUCT_BONUS" || type === "SAME_PRODUCT_BONUS_AND_DISCOUNT" || type === "DIFFERENT_PRODUCT_BONUS_AND_DISCOUNT";
}
function sameBonus(type?: string) { return type === "SAME_PRODUCT_BONUS" || type === "SAME_PRODUCT_BONUS_AND_DISCOUNT"; }
function hasDiscount(type?: string) { return type === "DISCOUNT_ON_PTR" || type === "SAME_PRODUCT_BONUS_AND_DISCOUNT" || type === "DIFFERENT_PRODUCT_BONUS_AND_DISCOUNT"; }

export function calculateLine(product: Product, boxes: number) {
  const strips = stripsPerBox(product.pack);
  const validBoxes = Math.max(0, Math.floor(Number(boxes) || 0));
  // MRP/PTR and customer quantities are per strip. Pack size only describes
  // how strips are physically packed into boxes.
  const ptr = Number(product.mrp || 0) * PTR_FACTOR;
  const pricePerPaidStrip = Math.max(0, ptr * (hasDiscount(product.discountType) ? 1 - Number(product.discountValue || 0) / 100 : 1));
  const paidStrips = validBoxes;
  const validOffer = bonusType(product.discountType) && Number(product.buyQuantity) > 0 && Number(product.freeQuantity) > 0;
  const freeStrips = validOffer ? Math.floor(paidStrips / Number(product.buyQuantity)) * Number(product.freeQuantity) : 0;
  const sameProductFreeStrips = sameBonus(product.discountType) ? freeStrips : 0;
  const taxableAmount = money(pricePerPaidStrip * paidStrips);
  return {
    stripsPerBox: strips,
    paidBoxes: validBoxes,
    paidStrips,
    freeStrips: sameProductFreeStrips,
    bonusStrips: !sameBonus(product.discountType) ? freeStrips : 0,
    totalStrips: paidStrips + sameProductFreeStrips,
    ptrPrice: money(ptr),
    pricePerPaidBox: strips ? money(pricePerPaidStrip * strips) : 0,
    pricePerPaidStrip: money(pricePerPaidStrip),
    effectivePrice: paidStrips + sameProductFreeStrips ? money(taxableAmount / (paidStrips + sameProductFreeStrips)) : 0,
    taxableAmount,
  };
}

export function calculateCart(products: Product[], items: Array<{ productId: string; quantity: number }>) {
  const lines = items.flatMap(item => {
    const product = products.find(p => p.id === item.productId);
    return product ? [{ product, ...calculateLine(product, item.quantity) }] : [];
  });
  const subtotal = money(lines.reduce((sum, line) => sum + line.taxableAmount, 0));
  const gst = money(subtotal * GST_RATE / 100);
  const shipping = subtotal > FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
  return { lines, subtotal, gst, shipping, grandTotal: money(subtotal + gst + shipping) };
}
