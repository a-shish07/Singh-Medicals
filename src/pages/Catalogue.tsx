import { useState, useEffect, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { useApp } from '../context';
import type { Category, Product } from '../types';
import { calculateLine } from '../lib/pricing';
import { loadProducts } from '../lib/api';

const CATEGORIES: (Category | 'All')[] = [
  'All',
  'Tablets',
  'Syrups',
  'Injections',
  'Eye Drops',
  'Topical',
];

type ProductOfferFields = Product & {
  effectivePtr?: number | null;
  discountType?: string | null;
  discountValue?: number | null;
  buyQuantity?: number | null;
  freeQuantity?: number | null;
  stockStrips?: number | null;
  minOrderQuantity?: number | null;
};

type ProductPricing = Product & {
  ptr?: number | null;
  gst?: number | null;
  discountType?: string | null;
  discountValue?: number | null;
  discountAmount?: number | null;
  effectivePtr?: number | null;
  buyQuantity?: number | null;
  freeQuantity?: number | null;
  bonusProductId?: string | null;
};

/*
|--------------------------------------------------------------------------
| Customer-facing Effective PTR
|--------------------------------------------------------------------------
| This is the same price used by the backend/pricing system.
|
| Priority:
| 1. effectivePtr
| 2. legacy net
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Product offer information
|--------------------------------------------------------------------------
*/
function getOfferInfo(product: Product) {
  const item = product as ProductOfferFields;

  const discountType = String(
    item.discountType || 'NONE'
  );

  const discount = Number(
    item.discountValue || 0
  );

  const buyQuantity = Math.max(
    0,
    Math.floor(Number(item.buyQuantity || 0))
  );

  const freeQuantity = Math.max(
    0,
    Math.floor(Number(item.freeQuantity || 0))
  );

  const isSameProductOffer =
    (
      discountType === 'SAME_PRODUCT_BONUS' ||
      discountType === 'SAME_PRODUCT_BONUS_AND_DISCOUNT'
    ) &&
    buyQuantity > 0 &&
    freeQuantity > 0;

  const isDifferentProductOffer =
    (
      discountType === 'DIFFERENT_PRODUCT_BONUS' ||
      discountType === 'DIFFERENT_PRODUCT_BONUS_AND_DISCOUNT'
    );

  const hasDiscount =
    (
      discountType === 'DISCOUNT_ON_PTR' ||
      discountType === 'SAME_PRODUCT_BONUS_AND_DISCOUNT' ||
      discountType === 'DIFFERENT_PRODUCT_BONUS_AND_DISCOUNT'
    ) &&
    discount > 0;

  return {
    discountType,
    discount,
    buyQuantity,
    freeQuantity,
    isSameProductOffer,
    isDifferentProductOffer,
    hasDiscount,
  };
}

/*
|--------------------------------------------------------------------------
| Offer label
|--------------------------------------------------------------------------
*/
function offerLabel(product: Product) {
  const {
    discountType,
    discount,
    buyQuantity,
    freeQuantity,
    isSameProductOffer,
    isDifferentProductOffer,
  } = getOfferInfo(product);

  if (isSameProductOffer) {
    if (
      discountType ===
      'SAME_PRODUCT_BONUS_AND_DISCOUNT'
    ) {
      return `BUY ${buyQuantity} GET ${freeQuantity} FREE + ${discount}% OFF`;
    }

    return `BUY ${buyQuantity} GET ${freeQuantity} FREE`;
  }

  if (isDifferentProductOffer) {
    if (
      discountType ===
      'DIFFERENT_PRODUCT_BONUS_AND_DISCOUNT'
    ) {
      return `BONUS PRODUCT + ${discount}% OFF`;
    }

    return 'BONUS PRODUCT FREE';
  }

  if (
    discountType === 'DISCOUNT_ON_PTR' &&
    discount > 0
  ) {
    return `${discount}% OFF`;
  }

  return null;
}

/*
|--------------------------------------------------------------------------
| Discount Badge
|--------------------------------------------------------------------------
*/
function DiscountBadge({
  mrp,
  price,
}: {
  mrp: number;
  price: number;
}) {
  const pct =
    mrp > 0
      ? Math.max(
          0,
          Math.round(
            ((mrp - price) / mrp) * 100
          )
        )
      : 0;

  if (pct <= 0) {
    return null;
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 bg-[#E8F5EE] text-[#0D9A55] text-xs font-bold rounded-lg">
      {pct}% off
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| Same-product free quantity for a paid quantity
|--------------------------------------------------------------------------
*/
function calculateFreeQuantity(
  product: Product,
  paidQuantity: number
) {
  const {
    isSameProductOffer,
    buyQuantity,
    freeQuantity,
  } = getOfferInfo(product);

  if (
    !isSameProductOffer ||
    buyQuantity <= 0 ||
    freeQuantity <= 0 ||
    paidQuantity <= 0
  ) {
    return 0;
  }

  return (
    Math.floor(paidQuantity / buyQuantity) *
    freeQuantity
  );
}

/*
|--------------------------------------------------------------------------
| Total physical quantity received
|--------------------------------------------------------------------------
*/
function calculateTotalQuantity(
  product: Product,
  paidQuantity: number
) {
  const free = calculateFreeQuantity(
    product,
    paidQuantity
  );

  return paidQuantity + free;
}

/*
|--------------------------------------------------------------------------
| Maximum paid quantity allowed by physical stock
|--------------------------------------------------------------------------
*/
function getMaxPaidQuantity(product: Product) {
  const item = product as ProductOfferFields;

  const stock = Math.max(
    0,
    Math.floor(
      Number(
        item.stockStrips ??
          product.stock ??
          0
      )
    )
  );

  if (stock <= 0) {
    return 0;
  }

  const {
    isSameProductOffer,
    buyQuantity,
  } = getOfferInfo(product);

  /*
   * Normal product:
   * paid quantity cannot exceed physical stock.
   */
  if (!isSameProductOffer) {
    return stock;
  }

  /*
   * Same-product offer:
   * physical stock = paid + free.
   */
  let low = 0;
  let high = stock;

  while (low < high) {
    const mid = Math.ceil(
      (low + high) / 2
    );

    const free =
      Math.floor(mid / buyQuantity) *
      Math.max(
        0,
        Math.floor(
          Number(
            (product as ProductOfferFields)
              .freeQuantity || 0
          )
        )
      );

    const total = mid + free;

    if (total <= stock) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }

  return low;
}

/*
|--------------------------------------------------------------------------
| Product Card
|--------------------------------------------------------------------------
*/
function ProductCard({
  product,
}: {
  product: Product;
}) {
  const {
    cartItems,
    addToCart,
    updateQty,
    addToast,
    navigateToProduct,
  } = useApp();

  const cartItem = cartItems.find(
    (item) =>
      item.productId === product.id
  );

  const item =
    product as ProductOfferFields;



  const {
    buyQuantity,
    freeQuantity,
    isSameProductOffer,
  } = getOfferInfo(product);

  const price = calculateLine(
  product,
  Math.max(1, Number(buyQuantity) || 1)
).effectivePrice;

  const mrp = Number(
    product.mrp || 0
  );

  const offer = offerLabel(product);

  const minOrderQuantity = Math.max(
    1,
    Math.floor(
      Number(
        item.minOrderQuantity || 1
      )
    )
  );

  /*
   * For same-product offers:
   *
   * BUY 2 GET 5 FREE
   *
   * Quantity should move:
   * 2 → 4 → 6 → 8
   *
   * instead of:
   * 10 → 11 → 12
   */
  const quantityStep =
    isSameProductOffer
      ? Math.max(1, buyQuantity)
      : minOrderQuantity;

  const minimumQuantity = Math.max(
    minOrderQuantity,
    isSameProductOffer
      ? buyQuantity
      : minOrderQuantity
  );

  const maxPaidQuantity =
    getMaxPaidQuantity(product);

  const isOutOfStock =
    maxPaidQuantity <= 0;

  const [localQty, setLocalQty] =
    useState<number | ''>(
      () =>
        Math.min(
          Math.max(
            minimumQuantity,
            1
          ),
          Math.max(
            maxPaidQuantity,
            minimumQuantity
          )
        )
    );

  const [cartQtyDraft, setCartQtyDraft] =
    useState<string | null>(null);

  /*
   * Effective PTR discount percentage
   */
  const discountPct =
    mrp > 0 && price < mrp
      ? Math.max(
          0,
          Math.round(
            ((mrp - price) / mrp) *
              100
          )
        )
      : 0;

  /*
   * Free quantity based on currently
   * selected local quantity.
   */
  const localFreeQuantity =
    typeof localQty === 'number'
      ? calculateFreeQuantity(
          product,
          localQty
        )
      : 0;

  /*
   * Total quantity received for
   * currently selected quantity.
   */
  const localTotalQuantity =
    typeof localQty === 'number'
      ? localQty +
        localFreeQuantity
      : 0;

  /*
   * Handle quantity input
   */
  const handleLocalQtyChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    if (value === '') {
      setLocalQty('');
      return;
    }

    const numericValue =
      Number(value);

    if (
      Number.isFinite(
        numericValue
      ) &&
      numericValue >= 0
    ) {
      setLocalQty(
        Math.floor(numericValue)
      );
    }
  };

  /*
   * Normalize quantity after input
   */
  const handleLocalQtyBlur = () => {
    if (
      localQty === '' ||
      localQty < minimumQuantity
    ) {
      setLocalQty(
        Math.min(
          minimumQuantity,
          maxPaidQuantity
        )
      );

      return;
    }

    const normalized =
      Math.floor(
        localQty / quantityStep
      ) * quantityStep;

    setLocalQty(
      Math.min(
        Math.max(
          minimumQuantity,
          normalized
        ),
        maxPaidQuantity
      )
    );
  };

  /*
   * Add product to cart
   */
  const handleAdd = () => {
    if (isOutOfStock) {
      addToast(
        `${product.name} is out of stock.`,
        'error'
      );

      return;
    }

    const rawQuantity =
      localQty === ''
        ? minimumQuantity
        : Math.max(
            minimumQuantity,
            localQty
          );

    const normalizedQuantity =
      Math.ceil(
        rawQuantity /
          quantityStep
      ) * quantityStep;

    const quantity =
      Math.min(
        normalizedQuantity,
        maxPaidQuantity
      );

    if (quantity <= 0) {
      addToast(
        `${product.name} is out of stock.`,
        'error'
      );

      return;
    }

    addToCart(
      product.id,
      quantity
    );

    addToast(
      `${product.name} × ${quantity} added to cart`
    );

    setLocalQty(
      Math.min(
        minimumQuantity,
        maxPaidQuantity
      )
    );
  };

  /*
   * Cart quantity input
   */
  const handleCartQtyChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setCartQtyDraft(
      e.target.value
    );
  };

  /*
   * Save cart quantity
   */
  const commitCartQty = () => {
    if (cartQtyDraft === null) {
      return;
    }

    const value =
      Number(cartQtyDraft);

    if (
      !Number.isFinite(value) ||
      value <= 0
    ) {
      updateQty(
        product.id,
        0
      );

      setCartQtyDraft(null);

      return;
    }

    updateQty(
      product.id,
      Math.floor(value)
    );

    setCartQtyDraft(null);
  };

  /*
   * Cart offer quantities
   */
  const cartPaidQuantity =
    Number(
      cartItem?.quantity || 0
    );

  const cartFreeQuantity =
    cartItem
      ? calculateFreeQuantity(
          product,
          cartPaidQuantity
        )
      : 0;

  const cartTotalQuantity =
    cartPaidQuantity +
    cartFreeQuantity;

  /*
   * Product value is based on the final effective price for every unit
   * received, including any same-product free quantity.
   */
  const cartAmount =
    price *
    cartTotalQuantity;

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden group">

      <div className="p-4 flex-1 flex flex-col">

        {/* --------------------------------------------------
            BADGES
        -------------------------------------------------- */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">

          <span className="px-2 py-0.5 bg-[#F5F7F5] text-[#6B7280] text-[10px] font-semibold rounded-lg uppercase tracking-wide">
            {product.category}
          </span>

          <DiscountBadge
            mrp={mrp}
            price={price}
          />

          {offer && (
            <span className="inline-flex items-center px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-200">
              🎁 {offer}
            </span>
          )}

        </div>

        {/* --------------------------------------------------
            PRODUCT NAME
        -------------------------------------------------- */}
        <h3
          onClick={() =>
            navigateToProduct(
              product.id
            )
          }
          className="font-bold text-[#1C1C1E] text-base leading-tight mb-1 hover:text-[#0D9A55] cursor-pointer transition-colors"
          style={{
            fontFamily:
              "'DM Sans', sans-serif",
          }}
        >
          {product.name}
        </h3>

        <p className="text-sm font-semibold text-[#0D9A55] mb-0.5">
          {product.company}
        </p>

        <p className="text-sm text-[#6B7280] leading-relaxed mb-1 line-clamp-2">
          {product.composition}
        </p>

        {/* --------------------------------------------------
            PACK / EXPIRY
        -------------------------------------------------- */}
        <div className="flex items-center justify-between  text-sm text-[#62666e] mb-3 font-semibold">

          <span className="flex items-center gap-1">

            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375a1.125 1.125 0 00-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>

            {product.pack}

          </span>

          <span className="flex items-center gap-1">

            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5A2.25 2.25 0 015.25 5.25h13.5A2.25 2.25 0 0121 7.5v11.25A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 18.75Zm0 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>

            Exp: {product.expiry}

          </span>

        </div>

        {/* --------------------------------------------------
            PRICING
        -------------------------------------------------- */}
        <div className="mb-3">

          <div className="flex items-end gap-2">

            <div>

              <p className="text-sm text-[#6B7280]">
                Effective PTR
              </p>

              <p
                className="text-xl font-bold text-[#1C1C1E]"
                style={{
                  fontFamily:
                    "'DM Sans', sans-serif",
                }}
              >
                ₹
                {price.toLocaleString(
                  'en-IN',
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </p>

            </div>

            {mrp > price && (
              <>
                <p className="text-sm text-[#6B7280] line-through mb-0.5">
                  ₹
                  {mrp.toLocaleString(
                    'en-IN',
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </p>

                <p className="text-xs text-[#6B7280] mb-0.5">
                  MRP
                </p>
              </>
            )}

          </div>

          {/* {discountPct > 0 && (
            <p className="text-[11px] text-[#0D9A55] font-semibold mt-1">
              You save {discountPct}% on MRP
            </p>
          )} */}

        </div>

       

        {/* --------------------------------------------------
            ACTIONS
        -------------------------------------------------- */}
        <div className="mt-auto">

          {isOutOfStock ? (

            <button
              disabled
              className="w-full h-9 bg-[#F3F4F6] text-[#9CA3AF] text-sm font-semibold rounded-xl cursor-not-allowed"
            >
              Out of Stock
            </button>

          ) : cartItem ? (

            /* =================================================
               ALREADY IN CART
            ================================================= */
            <div className="rounded-xl bg-[#E8F5EE] p-2.5">

              <div className="flex items-center gap-2">

                {/* Minus */}
                <button
                  onClick={() =>
                    updateQty(
                      product.id,
                      cartItem.quantity -
                        quantityStep
                    )
                  }
                  className="w-8 h-8 shrink-0 flex items-center justify-center bg-white text-[#0D9A55] hover:bg-[#0D9A55] hover:text-white rounded-lg transition-colors font-bold text-lg shadow-sm"
                >
                  −
                </button>

                {/* Quantity */}
                <input
                  type="number"
                  min={0}
                  value={
                    cartQtyDraft !== null
                      ? cartQtyDraft
                      : cartItem.quantity
                  }
                  onChange={
                    handleCartQtyChange
                  }
                  onFocus={() =>
                    setCartQtyDraft(
                      String(
                        cartItem.quantity
                      )
                    )
                  }
                  onBlur={
                    commitCartQty
                  }
                  className="w-16 h-8 text-center bg-white border border-[#0D9A55]/20 rounded-lg text-sm font-bold text-[#0D9A55] focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30"
                />

                {/* Plus */}
                <button
                  onClick={() =>
                    updateQty(
                      product.id,
                      cartItem.quantity +
                        quantityStep
                    )
                  }
                  className="w-8 h-8 shrink-0 flex items-center justify-center bg-white text-[#0D9A55] hover:bg-[#0D9A55] hover:text-white rounded-lg transition-colors font-bold text-lg shadow-sm"
                >
                  +
                </button>

              </div>

              {/* Cart details */}
              <div className="mt-2 px-1">

                <div className="flex items-end  justify-end">

                  
                  <span className="text-[15px] text-[#0d8a16] font-bold">
                    ₹
                    {cartAmount.toLocaleString(
                      'en-IN',
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}{' '}
                    total
                  </span>

                </div>

                {/* Offer quantity information */}
                {cartFreeQuantity > 0 && (
                  <div className="flex items-center gap-3 mt-1">

                    <span className="text-[12px] text-[#6B7280]">
                      Paid:{' '}
                      <strong className="text-[#1C1C1E]">
                        {cartPaidQuantity}
                      </strong>
                    </span>

                    <span className="text-[12px] text-[#0D9A55] font-bold">
                      Free:{' '}
                      {cartFreeQuantity}
                    </span>

                    <span className="text-[12px] text-[#6B7280]">
                      Total:{' '}
                      <strong className="text-[#1C1C1E]">
                        {cartTotalQuantity}
                      </strong>
                    </span>

                  </div>
                )}
 {/* --------------------------------------------------
            STOCK
        -------------------------------------------------- */}
        <div className="mb-3 mt-4">

          {isOutOfStock ? (
            <div className="inline-flex items-center px-2.5 py-1 bg-red-50 text-red-600 border border-red-100 rounded-lg text-[11px] font-bold">
              OUT OF STOCK
            </div>
          ) : (
            <p className="text-[13px] text-[#6B7280]">
              Stock available:{' '}
              <span className="font-semibold text-[#1C1C1E]">
                {Math.max(
                  0,
                  Math.floor(
                    Number(
                      item.stockStrips ??
                        product.stock ??
                        0
                    )
                  )
                )}
              </span>
            </p>
          )}

        </div>

              </div>

            </div>
            

          ) : (

            /* =================================================
               NOT IN CART
            ================================================= */
            <div>

              <div className="flex items-center gap-2">

                {/* Minus */}
                <button
                  onClick={() =>
                    setLocalQty(
                      (current) => {
                        const value =
                          current === ''
                            ? minimumQuantity
                            : current;

                        return Math.max(
                          minimumQuantity,
                          value -
                            quantityStep
                        );
                      }
                    )
                  }
                  className="w-9 h-9 shrink-0 flex items-center justify-center bg-[#F5F7F5] border border-black/[0.06] text-[#6B7280] hover:text-[#0D9A55] hover:bg-[#E8F5EE] rounded-xl transition-colors font-bold text-lg"
                >
                  −
                </button>

                {/* Editable quantity */}
                <input
                  type="number"
                  min={minimumQuantity}
                  value={localQty}
                  onChange={
                    handleLocalQtyChange
                  }
                  onBlur={
                    handleLocalQtyBlur
                  }
                  aria-label={`Quantity for ${product.name}`}
                  className="w-16 h-9 text-center bg-[#F5F7F5] border border-black/[0.08] rounded-xl text-sm font-bold text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30 focus:border-[#0D9A55]"
                />

                {/* Plus */}
                <button
                  onClick={() =>
                    setLocalQty(
                      (current) => {
                        const value =
                          current === ''
                            ? minimumQuantity
                            : current;

                        return Math.min(
                          maxPaidQuantity,
                          value +
                            quantityStep
                        );
                      }
                    )
                  }
                  className="w-9 h-9 shrink-0 flex items-center justify-center bg-[#F5F7F5] border border-black/[0.06] text-[#6B7280] hover:text-[#0D9A55] hover:bg-[#E8F5EE] rounded-xl transition-colors font-bold text-lg"
                >
                  +
                </button>

                {/* Add */}
                <button
                  onClick={handleAdd}
                  className="flex-1 min-w-0 h-9 bg-[#0D9A55] text-white text-sm font-semibold rounded-xl hover:bg-[#0A7A43] active:scale-95 transition-all duration-150 shadow-[0_2px_8px_rgba(13,154,85,0.25)]"
                >
                  Add to Cart
                </button>

              </div>

              {/* Selected quantity offer preview */}
              {isSameProductOffer &&
                localFreeQuantity > 0 && (
                  <div className="mt-2 px-1">

                    <div className="flex items-center gap-3 text-[12px]">

                      <span className="text-[#6B7280]">
                        Paid:{' '}
                        <strong className="text-[#1C1C1E]">
                          {typeof localQty ===
                          'number'
                            ? localQty
                            : 0}
                        </strong>
                      </span>

                      <span className="text-[#0D9A55] font-bold">
                        Free:{' '}
                        {localFreeQuantity}
                      </span>

                      <span className="text-[#6B7280]">
                        Total:{' '}
                        <strong className="text-[#1C1C1E]">
                          {localTotalQuantity}
                        </strong>
                      </span>

                    </div>

                  {/* --------------------------------------------------
            STOCK
        -------------------------------------------------- */}
        <div className="mb-3 mt-5">

          {isOutOfStock ? (
            <div className="inline-flex items-center px-2.5 py-1 bg-red-50 text-red-600 border border-red-100 rounded-lg text-[11px] font-bold">
              OUT OF STOCK
            </div>
          ) : (
            <p className="text-[13px] text-[#6B7280]">
              Stock available:{' '}
              <span className="font-semibold text-[#1C1C1E]">
                {Math.max(
                  0,
                  Math.floor(
                    Number(
                      item.stockStrips ??
                        product.stock ??
                        0
                    )
                  )
                )}
              </span>
            </p>
          )}

        </div>

                  </div>
                )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Catalogue Page
|--------------------------------------------------------------------------
*/
export default function Catalogue() {
  const {
    products,
    setProducts,
    cartItems,
    addToCart,
    updateQty,
    addToast,
    navigateToProduct,
  } = useApp();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category | 'All'>('All');
  const [company, setCompany] = useState('All');
  const [page, setPage] = useState(1);
  const [catalogueProducts, setCatalogueProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [companies, setCompanies] = useState<string[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const requestId = useRef(0);
  const PAGE_SIZE = 50;

  useEffect(() => {
    setPage(1);
  }, [search, category, company]);

  useEffect(() => {
    const currentRequest = ++requestId.current;
    let cancelled = false;

    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const response = await loadProducts({
          page,
          limit: PAGE_SIZE,
          q: search,
          category,
          company,
        });

        if (cancelled || currentRequest !== requestId.current) return;

        setCatalogueProducts(response.products);
        setTotalProducts(response.pagination.total);
        setTotalPages(Math.max(1, response.pagination.totalPages));
        setCompanies(response.companies);

        // Keep the existing product context aligned with the current page.
        // Cart-only products are fetched separately by AppProvider when needed.
        setProducts(response.products);
      } catch (error) {
        if (cancelled || currentRequest !== requestId.current) return;
        setCatalogueProducts([]);
        setTotalProducts(0);
        setTotalPages(1);
        addToast(
          error instanceof Error ? error.message : 'Could not load products.',
          'error'
        );
      } finally {
        if (!cancelled && currentRequest === requestId.current) {
          setLoadingProducts(false);
        }
      }
    };

    void fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [search, category, company, page, addToast, setProducts]);

  const filtered = catalogueProducts;

  return (
    <div className="min-h-screen">

      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="relative overflow-hidden bg-white border-b border-black/[0.06]">

        <GreenBlob className="w-[500px] h-[500px] -top-40 -right-40 opacity-60" />

        <GreenBlob className="w-[300px] h-[300px] -bottom-20 -left-20 opacity-40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

          <div className="max-w-2xl">

            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E8F5EE] rounded-full mb-4">

              <span className="w-2 h-2 rounded-full bg-[#0D9A55] animate-pulse" />

              <span className="text-xs font-semibold text-[#0D9A55]">
                Live Best Rates · Updated Today
              </span>

            </div>

            <h1
              className="text-3xl sm:text-4xl font-extrabold text-[#1C1C1E] mb-3 leading-tight"
              style={{
                fontFamily:
                  "'DM Sans', sans-serif",
              }}
            >
              Pharma Catalogue
            </h1>

            <p className="text-[#6B7280] text-lg mb-6">
              Trusted best rates for retail pharmacies — direct from distributor, no middlemen.
            </p>

            {/* Search */}
            <div className="relative max-w-xl">

              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>

              <input
                type="text"
                placeholder="Search by medicine name, company, or composition..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                className="w-full pl-12 pr-4 py-3.5 bg-[#F5F7F5] border border-black/[0.08] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30 focus:border-[#0D9A55] transition-all placeholder:text-[#9CA3AF]"
              />

              {search && (
                <button
                  onClick={() =>
                    setSearch('')
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1C1C1E] transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FILTERS
      ===================================================== */}
      <section className="sticky top-16 z-40 bg-[#F5F7F5]/95 backdrop-blur-md border-b border-black/[0.06]">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 flex-wrap">

          <div className="flex items-center gap-2 flex-wrap flex-1">

            {CATEGORIES.map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() =>
                    setCategory(cat)
                  }
                  className={`px-3.5 py-1.5 text-sm font-semibold rounded-xl transition-all duration-150 ${
                    category === cat
                      ? 'bg-[#0D9A55] text-white shadow-[0_2px_8px_rgba(13,154,85,0.3)]'
                      : 'bg-white text-[#6B7280] hover:bg-[#E8F5EE] hover:text-[#0D9A55] border border-black/[0.08]'
                  }`}
                >
                  {cat}
                </button>
              )
            )}

          </div>

          <select
            value={company}
            onChange={(e) =>
              setCompany(
                e.target.value
              )
            }
            className="px-3 py-1.5 text-sm bg-white border border-black/[0.08] rounded-xl text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#0D9A55]/30 focus:border-[#0D9A55] transition-all"
          >
            <option value="All">
              All Companies
            </option>

            {companies.map(
              (companyName) => (
                <option
                  key={companyName}
                  value={companyName}
                >
                  {companyName}
                </option>
              )
            )}

          </select>

        </div>

      </section>

      {/* =====================================================
          PRODUCTS
      ===================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {search && totalProducts > 0 && (
          <p className="text-sm text-[#6B7280] mb-4">
            {`${totalProducts} result${totalProducts === 1 ? '' : 's'} for "${search}"`}
          </p>
        )}

        {loadingProducts ? (
          <div className="flex items-center justify-center py-24 text-sm text-[#6B7280]">
            Loading medicines…
          </div>
        ) : filtered.length === 0 ? (

          /* =================================================
             EMPTY STATE
          ================================================= */
          <div className="relative flex flex-col items-center justify-center py-24 text-center">

            <div className="relative mb-6">

              <GreenBlob className="w-64 h-64 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50" />

              <div className="relative w-20 h-20 rounded-2xl bg-[#E8F5EE] flex items-center justify-center mx-auto">

                <svg
                  className="w-10 h-10 text-[#0D9A55]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>

              </div>

            </div>

            <h3
              className="text-xl font-bold text-[#1C1C1E] mb-2"
              style={{
                fontFamily:
                  "'DM Sans', sans-serif",
              }}
            >
              No medicines found
            </h3>

            <p className="text-[#6B7280] max-w-sm">
              Try adjusting your search term or changing the filters.
            </p>

            <button
              onClick={() => {
                setSearch('');
                setCategory('All');
                setCompany('All');
              }}
              className="mt-6 px-5 py-2.5 bg-[#0D9A55] text-white rounded-xl text-sm font-semibold hover:bg-[#0A7A43] transition-colors"
            >
              Clear Filters
            </button>

          </div>

        ) : (<>

         
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

            {filtered.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              )
            )}

          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                disabled={page === 1 || loadingProducts}
                onClick={() => {
                  setPage((current) => Math.max(1, current - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2 text-sm font-semibold rounded-xl border border-black/[0.08] bg-white text-[#6B7280] hover:bg-[#E8F5EE] hover:text-[#0D9A55] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <span className="px-3 py-2 text-sm font-semibold text-[#6B7280]">
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages || loadingProducts}
                onClick={() => {
                  setPage((current) => Math.min(totalPages, current + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2 text-sm font-semibold rounded-xl border border-black/[0.08] bg-white text-[#6B7280] hover:bg-[#E8F5EE] hover:text-[#0D9A55] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}

        </>)}

      </div>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Green decorative blob
|--------------------------------------------------------------------------
*/
function GreenBlob({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={`absolute pointer-events-none rounded-full bg-gradient-to-br from-[#0D9A55]/20 to-[#12B060]/5 blur-3xl ${className}`}
    />
  );
}
