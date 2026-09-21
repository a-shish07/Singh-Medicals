import type { Product } from "../types";

export const GST_RATE = 5;
export const SHIPPING_FEE = 45;
export const FREE_SHIPPING_OVER = 4000;
const PTR_FACTOR = 0.7619;

export const money = (value: number) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

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
  return (
    type === "SAME_PRODUCT_BONUS" ||
    type === "DIFFERENT_PRODUCT_BONUS" ||
    type === "SAME_PRODUCT_BONUS_AND_DISCOUNT" ||
    type === "DIFFERENT_PRODUCT_BONUS_AND_DISCOUNT"
  );
}

function sameBonus(type?: string) {
  return (
    type === "SAME_PRODUCT_BONUS" ||
    type === "SAME_PRODUCT_BONUS_AND_DISCOUNT"
  );
}

function hasDiscount(type?: string) {
  return (
    type === "DISCOUNT_ON_PTR" ||
    type === "SAME_PRODUCT_BONUS_AND_DISCOUNT" ||
    type === "DIFFERENT_PRODUCT_BONUS_AND_DISCOUNT"
  );
}

export function calculateLine(product: Product, boxes: number) {
  const strips = stripsPerBox(product.pack);
  const validBoxes = Math.max(0, Math.floor(Number(boxes) || 0));

  // MRP/PTR and customer quantities are per strip. Pack size only describes
  // how strips are physically packed into boxes.
  const ptr = Number(product.mrp || 0) * PTR_FACTOR;
  const ptrAfterDiscount = Math.max(
    0,
    ptr *
      (hasDiscount(product.discountType)
        ? 1 - Number(product.discountValue || 0) / 100
        : 1)
  );

  const paidStrips = validBoxes;
  const configuredOffer =
    bonusType(product.discountType) &&
    Number(product.buyQuantity) > 0 &&
    Number(product.freeQuantity) > 0;

  const buyQuantity = configuredOffer
    ? Math.floor(Number(product.buyQuantity))
    : 0;
  const freePerOffer = configuredOffer
    ? Math.floor(Number(product.freeQuantity))
    : 0;

  const offerBundles =
    configuredOffer && buyQuantity > 0
      ? Math.floor(paidStrips / buyQuantity)
      : 0;

  const freeStrips =
    configuredOffer ? offerBundles * freePerOffer : 0;

  const sameProductFreeStrips = sameBonus(product.discountType)
    ? freeStrips
    : 0;

  const bonusStrips = sameBonus(product.discountType)
    ? 0
    : freeStrips;

  /*
   * For a same-product Buy X Get Y offer:
   *   effective customer rate = PTR × X ÷ (X + Y)
   * The final effective rate is applied to the full received quantity.
   *
   * For quantities beyond a complete offer bundle, any remainder is charged
   * at the normal discounted PTR rather than receiving a partial offer.
   */
  const offerEffectivePrice =
    sameProductFreeStrips > 0 && paidStrips > 0
      ? money(
          (ptrAfterDiscount * paidStrips) /
            (paidStrips + sameProductFreeStrips)
        )
      : money(ptrAfterDiscount);

  const taxableAmount = money(
    offerEffectivePrice * (paidStrips + sameProductFreeStrips)
  );

  return {
    stripsPerBox: strips,
    paidBoxes: validBoxes,
    paidStrips,
    freeStrips: sameProductFreeStrips,
    bonusStrips,
    totalStrips: paidStrips + sameProductFreeStrips,
    ptrPrice: money(ptr),
    pricePerPaidBox: strips
      ? money(offerEffectivePrice * strips)
      : 0,
    pricePerPaidStrip: offerEffectivePrice,
    effectivePrice: offerEffectivePrice,
    taxableAmount,
    hasOffer: configuredOffer,
    isSameProductOffer: sameBonus(product.discountType),
    buyQuantity,
    freeQuantity: freePerOffer,
    freeQuantityEarned: sameProductFreeStrips,
  };
}

/** Returns the scheme-adjusted PTR shown on product pages for an order item. */
export function finalOrderItemPrice(
  product: Product | undefined,
  paidQuantity: number,
  savedRate: number
) {
  const quantity = Math.floor(Number(paidQuantity) || 0);
  const storedRate = Number(savedRate);

  if (Number.isFinite(storedRate) && storedRate > 0) {
    return money(storedRate);
  }

  return product && quantity > 0
    ? calculateLine(product, quantity).effectivePrice
    : 0;
}

export function calculateOrderTotals(subtotalAmount: number) {
  const subtotal = money(subtotalAmount);
  const gst = money((subtotal * GST_RATE) / 100);
   
  const shipping = subtotal > FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;

  return {
    subtotal,
    gst,
    shipping,
    grandTotal: money(subtotal + gst + shipping),
  };
}

export function calculateCart(
  products: Product[],
  items: Array<{ productId: string; quantity: number }>
) {
  const lines = items.flatMap((item) => {
    const product = products.find((p) => p.id === item.productId);
    return product
      ? [{ product, ...calculateLine(product, item.quantity) }]
      : [];
  });

  const totals = calculateOrderTotals(
    lines.reduce((sum, line) => sum + line.taxableAmount, 0)
  );

  return {
    lines,
    ...totals,
  };
}
