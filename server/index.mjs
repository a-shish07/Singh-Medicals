import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { Resend } from 'resend';
import { parse } from 'csv-parse/sync';
import prismaPackage from '@prisma/client';

const {
  PrismaClient,
  Role,
  OrderStatus,
  PaymentMethod,
} = prismaPackage;

const DiscountType = Object.freeze({
  NONE: 'NONE',
  DISCOUNT_ON_PTR: 'DISCOUNT_ON_PTR',
  SAME_PRODUCT_BONUS: 'SAME_PRODUCT_BONUS',
  DIFFERENT_PRODUCT_BONUS: 'DIFFERENT_PRODUCT_BONUS',
  SAME_PRODUCT_BONUS_AND_DISCOUNT: 'SAME_PRODUCT_BONUS_AND_DISCOUNT',
  DIFFERENT_PRODUCT_BONUS_AND_DISCOUNT: 'DIFFERENT_PRODUCT_BONUS_AND_DISCOUNT',
});

const app = express();
const prisma = new PrismaClient();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const port = Number(process.env.PORT || 3001);
const jwtSecret = process.env.JWT_SECRET;
const isProduction = process.env.NODE_ENV === 'production';

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error(
    'JWT_SECRET is required and should be at least 32 characters long.'
  );
}

const PTR_FACTOR = 0.7619;
const DEFAULT_GST = 5;
const SHIPPING_FEE = 45;
const FREE_SHIPPING_OVER = 4000;
const money = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

// Numeric pack labels specify strips per box. Any other non-empty pack label
// is valid and is handled as one sellable unit for quantity calculations.
function stripsPerBox(pack) {
  const text = cleanString(pack);
  if (!text) return null;
  const multiplied = text.match(/[x×]\s*(\d+(?:\.0+)?)/i);
  const bare = text.match(/^\s*(\d+(?:\.0+)?)\s*$/);
  const value = Number(multiplied?.[1] || bare?.[1]);
  return Number.isInteger(value) && value > 0 ? value : 1;
}
function stockInStrips(pack, boxes) {
  const quantity = Number(boxes);
  if (!Number.isInteger(quantity) || quantity < 0) throw new Error('Stock must be a non-negative whole number.');
  return quantity;
}

const hasBonus = (type) => [
  DiscountType.SAME_PRODUCT_BONUS, DiscountType.DIFFERENT_PRODUCT_BONUS,
  DiscountType.SAME_PRODUCT_BONUS_AND_DISCOUNT, DiscountType.DIFFERENT_PRODUCT_BONUS_AND_DISCOUNT,
].includes(type);
const hasSameProductBonus = (type) => [DiscountType.SAME_PRODUCT_BONUS, DiscountType.SAME_PRODUCT_BONUS_AND_DISCOUNT].includes(type);
const hasPtrDiscount = (type) => [DiscountType.DISCOUNT_ON_PTR, DiscountType.SAME_PRODUCT_BONUS_AND_DISCOUNT, DiscountType.DIFFERENT_PRODUCT_BONUS_AND_DISCOUNT].includes(type);

function calculateOrderLine(product, boxes) {
  const strips = stripsPerBox(product.pack);
  if (!strips) throw new Error(`${product.name} has an invalid pack size.`);
  const paidBoxes = Math.floor(Number(boxes));
  if (!Number.isInteger(paidBoxes) || paidBoxes < 1) throw new Error(`Quantity for ${product.name} must be a positive whole number of boxes.`);
  // MRP/PTR and customer quantities are per strip. Pack size only describes
  // physical packing; offers and inventory consumption are strip-based.
  const ptr = Number(product.mrp) * PTR_FACTOR;
  const pricePerPaidStrip = ptr * (hasPtrDiscount(product.discountType) ? 1 - Number(product.discountValue || 0) / 100 : 1);
  const paidStrips = paidBoxes;
  const configuredBonus = hasBonus(product.discountType);
  if (configuredBonus && (!(Number(product.buyQuantity) > 0) || !(Number(product.freeQuantity) > 0))) throw new Error(`${product.name} has an invalid offer configuration.`);
  const freeStrips = configuredBonus ? Math.floor(paidStrips / Number(product.buyQuantity)) * Number(product.freeQuantity) : 0;
  const sameProductFree = hasSameProductBonus(product.discountType) ? freeStrips : 0;
  const taxableAmount = money(pricePerPaidStrip * paidStrips);
  return { paidBoxes, stripsPerBox: strips, paidStrips, freeStrips: sameProductFree, bonusStrips: hasSameProductBonus(product.discountType) ? 0 : freeStrips, totalStrips: paidStrips + sameProductFree, pricePerPaidBox: money(pricePerPaidStrip * strips), pricePerPaidStrip: money(pricePerPaidStrip), taxableAmount };
}

function calculateProductPricing({
  mrp,
  discountType = DiscountType.NONE,
  discountValue = 0,
  buyQuantity = 0,
  freeQuantity = 0,
}) {
  const parsedMrp = Number(mrp);
  const parsedDiscount = Number(discountValue) || 0;
  const parsedBuy = Number(buyQuantity) || 0;
  const parsedFree = Number(freeQuantity) || 0;

  if (!Number.isFinite(parsedMrp) || parsedMrp < 0) {
    throw new Error('MRP must be a valid non-negative number.');
  }

  if (
    !Number.isFinite(parsedDiscount) ||
    parsedDiscount < 0 ||
    parsedDiscount > 100
  ) {
    throw new Error('Discount must be between 0 and 100%.');
  }

  const ptr = Number((parsedMrp * PTR_FACTOR).toFixed(2));

  const usesBonus = hasBonus(discountType);
  const usesDiscount = hasPtrDiscount(discountType);
  if (usesBonus) {
    if (parsedBuy <= 0 || parsedFree <= 0) {
      throw new Error(
        'Buy quantity and free quantity are required for a same-product bonus.'
      );
    }

  }
  const discountAmount = usesDiscount ? Number((ptr * (parsedDiscount / 100)).toFixed(2)) : 0;
  const effectivePtr = Math.max(0, Number((ptr - discountAmount).toFixed(2)));

  return {
    mrp: Number(parsedMrp.toFixed(2)),
    ptr,
    gst: DEFAULT_GST,
    discountType,
    discountValue: Number(parsedDiscount.toFixed(2)),
    discountAmount: Number(discountAmount.toFixed(2)),
    effectivePtr,
    buyQuantity: usesBonus
      ? Math.max(0, Math.floor(parsedBuy))
      : null,
    freeQuantity: usesBonus
      ? Math.max(0, Math.floor(parsedFree))
      : null,
  };
}

app.disable('x-powered-by');
app.set('trust proxy', isProduction ? 1 : false);

const allowedOrigins = String(
  process.env.CORS_ORIGIN || 'http://localhost:8443'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server requests and local tools with no Origin header.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error('CORS origin not allowed.')
      );
    },
  })
);

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  if (isProduction) {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }

  next();
});

app.use(express.json({ limit: '10mb' }));

// Lightweight in-memory rate limiter for authentication endpoints.
// This is intentionally dependency-free. For multi-instance production
// deployments, move this to Redis or another shared rate-limit store.
const authRateLimitStore = new Map();

function authRateLimit({
  windowMs = 15 * 60 * 1000,
  max = 15,
} = {}) {
  return (req, res, next) => {
    const key = String(
      req.ip ||
        req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress ||
        'unknown'
    );

    const now = Date.now();
    const existing = authRateLimitStore.get(key);

    if (!existing || now - existing.startedAt >= windowMs) {
      authRateLimitStore.set(key, {
        startedAt: now,
        count: 1,
      });

      return next();
    }

    existing.count += 1;

    if (existing.count > max) {
      const retryAfter = Math.max(
        1,
        Math.ceil(
          (windowMs - (now - existing.startedAt)) / 1000
        )
      );

      res.setHeader('Retry-After', String(retryAfter));

      return res.status(429).json({
        error:
          'Too many authentication attempts. Please try again later.',
      });
    }

    next();
  };
}

// Prevent unbounded growth of the in-memory limiter map.
const rateLimitCleanup = setInterval(() => {
  const cutoff = Date.now() - 15 * 60 * 1000;

  for (const [key, entry] of authRateLimitStore.entries()) {
    if (entry.startedAt < cutoff) {
      authRateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

rateLimitCleanup.unref?.();

/* ============================================================================
   HELPERS
============================================================================ */

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  shopName: user.shopName,
  gstNumber: user.gstNumber,
  drugLicence20B: user.drugLicence20B,
  drugLicence21B: user.drugLicence21B,
  profileImage: user.profileImage,
  address: user.address,
  city: user.city,
  state: user.state,
  pincode: user.pincode,
  role: user.role,
});

const tokenFor = (user) =>
  jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    jwtSecret,
    { expiresIn: '7d' }
  );

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.replace(
    /^Bearer\s+/i,
    ''
  );

  if (!token) {
    console.log('AUTH ERROR: No token received');

    return res
      .status(401)
      .json({ error: 'Authentication required.' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);

    console.log('AUTH JWT OK:', {
      userId: payload.sub,
      role: payload.role,
    });

    req.user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!req.user) {
      console.log('AUTH ERROR: User not found:', payload.sub);

      return res
        .status(401)
        .json({ error: 'Session is no longer valid.' });
    }

    console.log('AUTH USER OK:', req.user.email);

    next();
  } catch (error) {
    console.log('AUTH JWT ERROR:', error?.message);

    return res
      .status(401)
      .json({ error: 'Invalid or expired session.' });
  }
};

const adminOnly = (req, res, next) =>
  req.user?.role === Role.ADMIN
    ? next()
    : res
        .status(403)
        .json({ error: 'Administrator access required.' });

const serializeInventoryBatch = (batch) => ({
  ...batch,
  mrp: Number(batch.mrp),
  ptr: Number(batch.ptr),
  discount: Number(batch.discount),
  gst: Number(batch.gst),
});

const serializeProduct = (product) => {
  const batches = Array.isArray(product.inventoryBatches)
    ? product.inventoryBatches.map(serializeInventoryBatch)
    : [];

  const totalQuantity = batches.reduce(
    (sum, batch) =>
      sum + Number(batch.quantity || 0) + Number(batch.freeQuantity || 0),
    0
  );

  const expiringSoonDate = new Date();
  expiringSoonDate.setDate(expiringSoonDate.getDate() + 90);

  const expiringSoon = batches.filter(
    (batch) =>
      new Date(batch.expiryDate) <= expiringSoonDate
  ).length;

  return {
    ...product,
    mrp: Number(product.mrp),
    net: Number(product.net),
    stock: Number(product.stock || 0),
    stockStrips: Number(product.stock || 0),
    stripsPerBox: stripsPerBox(product.pack),
    minOrderQuantity: Math.max(1, Number(product.minOrderQuantity || 1)),
    inventoryBatches: batches,
    inventorySummary: {
      totalQuantity,
      batchCount: batches.length,
      expiringSoon,
    },
  };
};

const serializeOrder = (order) => ({
  ...order,
  subtotal: Number(order.subtotal),
  gstTotal: Number(order.gstTotal || 0),
  shippingTotal: Number(order.shippingTotal || 0),
  grandTotal: Number(order.grandTotal || order.subtotal),
  items: (order.items || []).map((item) => ({
    ...item,
    unitPrice: Number(item.unitPrice),
  })),
});

const parseDate = (value) => {
  const date = new Date(String(value || '').trim());
  return Number.isNaN(date.valueOf()) ? null : date;
};

const cleanString = (value) =>
  String(value ?? '').trim();

const escapeHtml = (value) => cleanString(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;
const mailFrom = process.env.RESEND_FROM_EMAIL;
const adminMail = process.env.ORDER_NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL;

const sendMail = async (message) => {
  if (!resend || !mailFrom) {
    console.warn('Email not sent: Resend is not configured.');
    return;
  }
  const { error } = await resend.emails.send({
    from: mailFrom,
    ...message,
  });
  if (error) throw new Error(error.message);
};

const orderLinesHtml = (order) => (order.items || []).map((item) =>
  `<tr><td style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(item.productName)}</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center">${item.quantity}</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">₹${Number(item.unitPrice).toFixed(2)}</td></tr>`
).join('');

const sendOrderEmails = async (order, customer) => {
  const total = Number(order.subtotal).toFixed(2);
  const details = `<table style="width:100%;border-collapse:collapse"><thead><tr><th align="left" style="padding:8px">Medicine</th><th style="padding:8px">Qty</th><th align="right" style="padding:8px">Rate</th></tr></thead><tbody>${orderLinesHtml(order)}</tbody></table>`;
  await Promise.all([
    sendMail({ to: customer.email, subject: `Order received — ${order.orderNumber}`, html: `<h2>Thank you for your order, ${escapeHtml(order.deliveryName)}.</h2><p>Your order <strong>${escapeHtml(order.orderNumber)}</strong> has been received.</p>${details}<p><strong>Total: ₹${total}</strong></p><p>Delivery: ${escapeHtml(order.deliveryAddress)}</p>` }),
    adminMail ? sendMail({ to: adminMail, subject: `New order — ${order.orderNumber}`, html: `<h2>New order received</h2><p><strong>${escapeHtml(order.deliveryName)}</strong> from ${escapeHtml(order.deliveryShop)} has placed order <strong>${escapeHtml(order.orderNumber)}</strong>.</p><p>Phone: ${escapeHtml(order.deliveryPhone)}<br>Address: ${escapeHtml(order.deliveryAddress)}</p>${details}<p><strong>Total: ₹${total}</strong></p>` }) : Promise.resolve(),
  ]);
};

/* ============================================================================
   HEALTH / BOOTSTRAP
============================================================================ */

app.get('/api/health', (_req, res) =>
  res.json({
    ok: true,
    message: 'Singh Medicals API is running',
  })
);

app.get('/api/bootstrap', async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        inventoryBatches: {
          orderBy: { expiryDate: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json({
      products: products.map(serializeProduct),
      orders: [],
    });
  } catch (error) {
    next(error);
  }
});

/* ============================================================================
   AUTH
============================================================================ */

app.post(
  '/api/auth/register',
  authRateLimit({ max: 10 }),
  async (req, res, next) => {
  try {
    const {
  name,
  email,
  password,
  phone,
  shopName,
  drugLicence20B,
  drugLicence21B,
  gstNumber,
  address,
} = req.body;

   if (
  !name?.trim() ||
  !/^\S+@\S+\.\S+$/.test(email || '') ||
  typeof password !== 'string' ||
  password.length < 8 ||
  !drugLicence20B?.trim() ||
  !drugLicence21B?.trim()
) {
  return res.status(400).json({
    error:
      'Name, valid email, password, and both Drug Licences (20B and 21B) are required.',
  });
}

  const user = await prisma.user.create({
  data: {
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash: await bcrypt.hash(password, 12),
    phone: phone?.trim() || null,
    shopName: shopName?.trim() || null,
    gstNumber: gstNumber?.trim() || null,
    drugLicence20B: drugLicence20B.trim(),
    drugLicence21B: drugLicence21B.trim(),
    address: address?.trim() || null,
  },
});

    res.status(201).json({
      token: tokenFor(user),
      user: publicUser(user),
    });
  } catch (error) {
    if (error?.code === 'P2002') {
      return res.status(409).json({
        error: 'An account with this email already exists.',
      });
    }

    next(error);
  }
});

app.post(
  '/api/auth/login',
  authRateLimit({ max: 15 }),
  async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email: String(email || '')
          .toLowerCase()
          .trim(),
      },
    });

    if (
      !user ||
      !(await bcrypt.compare(
        String(password || ''),
        user.passwordHash
      ))
    ) {
      return res
        .status(401)
        .json({ error: 'Incorrect email or password.' });
    }

    res.json({
      token: tokenFor(user),
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/auth/me', authenticate, (req, res) =>
  res.json({
    user: publicUser(req.user),
  })
);

app.get('/api/profile', authenticate, async (req, res) => {
  res.json({
    user: publicUser(req.user),
  });
});

app.patch('/api/profile', authenticate, async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      shopName,
      gstNumber,
      drugLicence20B,
  drugLicence21B,
      profileImage,
      address,
      city,
      state,
      pincode,
    } = req.body || {};

    if (!name?.trim()) {
      return res.status(400).json({
        error: 'Name is required.',
      });
    }

    if (
      !email ||
      !/^\S+@\S+\.\S+$/.test(email)
    ) {
      return res.status(400).json({
        error: 'A valid email address is required.',
      });
    }

    if (!drugLicence20B?.trim()) {
  return res.status(400).json({
    error: 'Drug Licence 20B is required.',
  });
}

if (!drugLicence21B?.trim()) {
  return res.status(400).json({
    error: 'Drug Licence 21B is required.',
  });
}

   const updatedUser = await prisma.user.update({
  where: {
    id: req.user.id,
  },
  data: {
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone?.trim() || null,
    shopName: shopName?.trim() || null,
    gstNumber: gstNumber?.trim() || null,
    drugLicence20B: drugLicence20B?.trim(),
    drugLicence21B: drugLicence21B?.trim(),
    profileImage: profileImage?.trim() || null,
    address: address?.trim() || null,
    city: city?.trim() || null,
    state: state?.trim() || null,
    pincode: pincode?.trim() || null,
  },
});

    res.json({
      user: publicUser(updatedUser),
    });
  } catch (error) {
    if (error?.code === 'P2002') {
      return res.status(409).json({
        error: 'This email address is already in use.',
      });
    }

    next(error);
  }
});

/* ============================================================================
   PRODUCTS - PUBLIC
============================================================================ */

app.get('/api/products', async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(q
          ? {
              OR: [
                {
                  name: {
                    contains: q,
                    mode: 'insensitive',
                  },
                },
                {
                  company: {
                    contains: q,
                    mode: 'insensitive',
                  },
                },
                {
                  composition: {
                    contains: q,
                    mode: 'insensitive',
                  },
                },
                {
                  sku: {
                    contains: q,
                    mode: 'insensitive',
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        inventoryBatches: {
          orderBy: {
            expiryDate: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json(products.map(serializeProduct));
  } catch (error) {
    next(error);
  }
});

/* ============================================================================
   CUSTOMER ORDERS
============================================================================ */

app.get('/api/orders/mine', authenticate, async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        items: true,
        statusHistory: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(orders.map(serializeOrder));
  } catch (error) {
    next(error);
  }
});

app.post('/api/contact', async (req, res, next) => {
  try {
    const name = cleanString(req.body.name);
    const phone = cleanString(req.body.phone);
    const message = cleanString(req.body.message);

    if (!name || !phone || !message) {
      return res.status(400).json({
        error: 'Name, phone number and message are required.',
      });
    }

    if (!adminMail) {
      return res.status(500).json({
        error: 'Contact email recipient is not configured.',
      });
    }

    await sendMail({
      to: adminMail,
      subject: `New Contact Query — ${name}`,
      text: [
        `Name: ${name}`,
        `Phone: ${phone}`,
        '',
        'Message:',
        message,
      ].join('\n'),
      html: `
        <h2>New Contact Query</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      `,
    });

    res.status(201).json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.post('/api/orders', authenticate, async (req, res, next) => {
  try {
    const {
      items,
      deliveryName,
      deliveryShop,
      deliveryPhone,
      deliveryAddress,
      paymentMethod,
    } = req.body;

    if (
      !Array.isArray(items) ||
      !items.length ||
      !deliveryName?.trim() ||
      !deliveryShop?.trim() ||
      !deliveryPhone?.trim() ||
      !deliveryAddress?.trim()
    ) {
      return res.status(400).json({
        error:
          'Complete delivery details and at least one item are required.',
      });
    }

    const merged = new Map();
    for (const item of items) {
      const productId = cleanString(item.productId);
      const quantity = Number(item.quantity);
      if (!productId || !Number.isInteger(quantity) || quantity < 1) continue;
      merged.set(productId, (merged.get(productId) || 0) + quantity);
    }
    const normalizedItems = [...merged].map(([productId, quantity]) => ({ productId, quantity }));

    if (!normalizedItems.length) {
      return res.status(400).json({
        error: 'At least one valid product is required.',
      });
    }

    const ids = [
      ...new Set(
        normalizedItems.map(
          (item) => item.productId
        )
      ),
    ];

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: ids,
        },
        isActive: true,
      },
    });

    if (products.length !== ids.length) {
      return res.status(400).json({
        error:
          'One or more products are unavailable.',
      });
    }

    const byId = new Map(
      products.map((product) => [
        product.id,
        product,
      ])
    );

    const lines = [];
    for (const item of normalizedItems) {
      const product = byId.get(item.productId);

      if (!product) {
        return res.status(400).json({
          error: 'Product not found.',
        });
      }

      const line = { product, ...calculateOrderLine(product, item.quantity) };
      if (line.paidStrips < Math.max(1, Number(product.minOrderQuantity || 1))) {
        return res.status(400).json({ error: `${product.name} has a minimum order quantity of ${product.minOrderQuantity} strips.` });
      }
      lines.push(line);
    }
    // A product's stock is stored in strips. The admin enters boxes; the API
    // converts that input on save/import, allowing bonus strips to be consumed.
    const requiredStock = new Map();
    for (const line of lines) {
      requiredStock.set(line.product.id, (requiredStock.get(line.product.id) || 0) + line.totalStrips);
      if (line.bonusStrips) {
        if (!line.product.bonusProductId) return res.status(400).json({ error: `${line.product.name} needs a bonus product.` });
        requiredStock.set(line.product.bonusProductId, (requiredStock.get(line.product.bonusProductId) || 0) + line.bonusStrips);
      }
    }
    const stockProducts = await prisma.product.findMany({ where: { id: { in: [...requiredStock.keys()] }, isActive: true } });
    const stockById = new Map(stockProducts.map(product => [product.id, product]));
    for (const [id, required] of requiredStock) {
      const product = stockById.get(id);
      if (!product || Number(product.stock) < required) return res.status(400).json({ error: `Insufficient stock for ${product?.name || 'a bonus product'}.` });
    }
    const subtotal = money(lines.reduce((sum, line) => sum + line.taxableAmount, 0));
    const gstTotal = money(subtotal * DEFAULT_GST / 100);
    const shippingTotal = subtotal > FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
    const grandTotal = money(subtotal + gstTotal + shippingTotal);

    const safePaymentMethod =
      paymentMethod === PaymentMethod.COD
        ? PaymentMethod.COD
        : PaymentMethod.COD;

    const order = await prisma.$transaction(
      async (tx) => {
        const count = await tx.order.count();

        const orderNumber = `SMS-${new Date().getFullYear()}-${String(
          count + 1
        ).padStart(6, '0')}`;

        const createdOrder =
          await tx.order.create({
            data: {
              orderNumber,
              userId: req.user.id,
              deliveryName:
                deliveryName.trim(),
              deliveryShop:
                deliveryShop.trim(),
              deliveryPhone:
                deliveryPhone.trim(),
              deliveryAddress:
                deliveryAddress.trim(),
              subtotal,
              gstTotal,
              shippingTotal,
              grandTotal,
              paymentMethod:
                safePaymentMethod,

              items: {
                create:
                  lines.flatMap((line) => {
                    const paid = { productId: line.product.id, productName: line.product.name, unitPrice: line.pricePerPaidStrip, quantity: line.paidStrips, paidQuantity: line.paidStrips, freeQuantity: line.freeStrips, totalQuantity: line.totalStrips, stripsPerBox: line.stripsPerBox, isFree: false };
                    if (!line.bonusStrips) return [paid];
                    const bonus = stockById.get(line.product.bonusProductId);
                    return [...[paid], { productId: bonus.id, productName: bonus.name, unitPrice: 0, quantity: 0, paidQuantity: 0, freeQuantity: line.bonusStrips, totalQuantity: line.bonusStrips, stripsPerBox: stripsPerBox(bonus.pack) || 1, isFree: true }];
                  }),
              },

              statusHistory: {
                create: {
                  status:
                    OrderStatus.SUBMITTED,
                  note:
                    'Order submitted by customer.',
                },
              },
            },

            include: {
              items: true,
              statusHistory: true,
            },
          });

        // Deduct stock atomically inside the same transaction.
        // The stock check is repeated at the database update level so
        // concurrent orders cannot drive Product.stock below zero.
        for (const [productId, required] of requiredStock) {
          const updated = await tx.product.updateMany({
            where: {
              id: productId,
              stock: {
                gte: required,
              },
            },
            data: {
              stock: {
                decrement: required,
              },
            },
          });

          if (updated.count !== 1) {
            throw new Error(
              `Insufficient stock while placing this order.`
            );
          }
        }

        // Mark the order as having successfully deducted stock.
        const savedOrder = await tx.order.update({
          where: {
            id: createdOrder.id,
          },
          data: {
            stockDeductedAt: new Date(),
          },
          include: {
            items: true,
            statusHistory: true,
          },
        });

        return savedOrder;
      }
    );

    await sendOrderEmails(order, req.user);

    res.status(201).json(
      serializeOrder(order)
    );
  } catch (error) {
    next(error);
  }
});

/* ============================================================================
   PUBLIC ORDER TRACKING
============================================================================ */

const trackOrder = async (
  req,
  res,
  next
) => {
  try {
    const phone = String(
      req.query.phone || ''
    ).replace(/\D/g, '');

    if (!phone) {
      return res.status(400).json({
        error: 'Phone number is required.',
      });
    }

    const order =
      await prisma.order.findFirst({
        where: {
          orderNumber:
            req.params.orderNumber,
          deliveryPhone: {
            endsWith: phone.slice(-10),
          },
        },
        include: {
          items: true,
          statusHistory: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found.',
      });
    }

    res.json(serializeOrder(order));
  } catch (error) {
    next(error);
  }
};

app.get(
  '/api/orders/track/:orderNumber',
  trackOrder
);

app.get(
  '/api/orders/:orderNumber',
  trackOrder
);

/* ============================================================================
   ADMIN - ORDERS
============================================================================ */

app.get(
  '/api/admin/orders',
  authenticate,
  adminOnly,
  async (_req, res, next) => {
    try {
      const orders =
        await prisma.order.findMany({
          include: {
            user: true,
            items: true,
            statusHistory: {
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

      res.json(
        orders.map(serializeOrder)
      );
    } catch (error) {
      next(error);
    }
  }
);

/* ============================================================================
   ADMIN - PRODUCTS
============================================================================ */

app.get(
  '/api/admin/products',
  authenticate,
  adminOnly,
  async (_req, res, next) => {
    try {
      const products =
        await prisma.product.findMany({
          include: {
            inventoryBatches: {
              orderBy: {
                expiryDate: 'asc',
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        });

      res.json(
        products.map(serializeProduct)
      );
    } catch (error) {
      next(error);
    }
  }
);

app.get(
  '/api/admin/products/:id',
  authenticate,
  adminOnly,
  async (req, res, next) => {
    try {
      const product =
        await prisma.product.findUnique({
          where: {
            id: req.params.id,
          },
          include: {
            inventoryBatches: {
              orderBy: {
                expiryDate: 'asc',
              },
            },
          },
        });

      if (!product) {
        return res.status(404).json({
          error: 'Product not found.',
        });
      }

      res.json(
        serializeProduct(product)
      );
    } catch (error) {
      next(error);
    }
  }
);

/* ============================================================================
   ADMIN - CREATE / UPDATE PRODUCT
============================================================================ */

app.post(
  '/api/admin/products',
  authenticate,
  adminOnly,
  async (req, res, next) => {
    try {
      const {
        name,
        company,
        composition,
        category,
        medicineType,
        productType,
        pack,
        countryOfOrigin,
        barcode,
        prescriptionRequired,
        image,
        description,
        mrp,
        discountType = DiscountType.NONE,
        discountValue = 0,
        buyQuantity = 0,
        freeQuantity = 0,
        bonusProductId,
        minOrderQuantity = 1,
        expiry,
        stock,
        isActive,
      } = req.body || {};

      if (
        !name?.trim() ||
        !company?.trim() ||
        !composition?.trim() ||
        !category?.trim() ||
        !pack?.trim()
      ) {
        return res.status(400).json({
          error:
            'Name, company, composition, category and pack are required.',
        });
      }
      if (!Number.isInteger(Number(minOrderQuantity)) || Number(minOrderQuantity) < 1) return res.status(400).json({ error: 'Minimum order quantity must be a positive whole number of strips.' });

      let pricing;
      try {
        pricing = calculateProductPricing({
          mrp,
          discountType,
          discountValue,
          buyQuantity,
          freeQuantity,
        });
      } catch (error) {
        return res.status(400).json({
          error: error?.message || 'Invalid pricing details.',
        });
      }

      if (hasBonus(pricing.discountType) && !hasSameProductBonus(pricing.discountType)) {
        if (!bonusProductId?.trim()) return res.status(400).json({ error: 'Select a bonus product for a different-product offer.' });
        if (!await prisma.product.findUnique({ where: { id: bonusProductId.trim() }, select: { id: true } })) return res.status(400).json({ error: 'Selected bonus product does not exist.' });
      }

      const parsedExpiry = parseDate(expiry);
      if (!parsedExpiry) {
        return res.status(400).json({
          error: 'Expiry date is required and must be valid.',
        });
      }

      const generatedSku =
        `AUTO-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      const product = await prisma.product.create({
        data: {
          name: name.trim(),
          company: company.trim(),
          composition: composition.trim(),
          category: category.trim(),
          medicineType: medicineType?.trim() || null,
          productType: productType?.trim() || null,
          pack: pack.trim(),
          countryOfOrigin: countryOfOrigin?.trim() || null,
          sku: generatedSku,
          barcode: barcode?.trim() || null,
          prescriptionRequired: Boolean(prescriptionRequired),
          image: image?.trim() || null,
          description: description?.trim() || null,

          mrp: pricing.mrp,
          ptr: pricing.ptr,
          gst: pricing.gst,
          discountType: pricing.discountType,
          discountValue: pricing.discountValue,
          discountAmount: pricing.discountAmount,
          effectivePtr: pricing.effectivePtr,
          buyQuantity: pricing.buyQuantity,
          freeQuantity: pricing.freeQuantity,
          bonusProductId: bonusProductId?.trim() || null,
          net: pricing.effectivePtr,

          expiry: parsedExpiry,
          stock: stockInStrips(pack, stock ?? 0),
          minOrderQuantity: Number(minOrderQuantity),
          isActive: isActive !== false,
        },
        include: { inventoryBatches: true },
      });

      res.status(201).json(serializeProduct(product));
    } catch (error) {
      if (error?.code === 'P2002') {
        const target = error?.meta?.target;
        if (Array.isArray(target) && target.includes('barcode')) {
          return res.status(409).json({
            error: 'A product with this barcode already exists.',
          });
        }
        return res.status(409).json({
          error: 'A product with the same product details already exists.',
        });
      }
      next(error);
    }
  }
);

app.patch(
  '/api/admin/products/:id',
  authenticate,
  adminOnly,
  async (req, res, next) => {
    try {
      const {
        name,
        company,
        composition,
        category,
        medicineType,
        productType,
        pack,
        countryOfOrigin,
        barcode,
        prescriptionRequired,
        image,
        description,
        mrp,
        discountType = DiscountType.NONE,
        discountValue = 0,
        buyQuantity = 0,
        freeQuantity = 0,
        bonusProductId,
        minOrderQuantity = 1,
        expiry,
        stock,
        isActive,
      } = req.body || {};

      if (
        !name?.trim() ||
        !company?.trim() ||
        !composition?.trim() ||
        !category?.trim() ||
        !pack?.trim()
      ) {
        return res.status(400).json({
          error:
            'Name, company, composition, category and pack are required.',
        });
      }
      if (!Number.isInteger(Number(minOrderQuantity)) || Number(minOrderQuantity) < 1) return res.status(400).json({ error: 'Minimum order quantity must be a positive whole number of strips.' });

      let pricing;
      try {
        pricing = calculateProductPricing({
          mrp,
          discountType,
          discountValue,
          buyQuantity,
          freeQuantity,
        });
      } catch (error) {
        return res.status(400).json({
          error: error?.message || 'Invalid pricing details.',
        });
      }
      if (hasBonus(pricing.discountType) && !hasSameProductBonus(pricing.discountType)) {
        if (!bonusProductId?.trim()) return res.status(400).json({ error: 'Select a bonus product for a different-product offer.' });
        if (!await prisma.product.findUnique({ where: { id: bonusProductId.trim() }, select: { id: true } })) return res.status(400).json({ error: 'Selected bonus product does not exist.' });
      }

      const parsedExpiry = parseDate(expiry);
      if (!parsedExpiry) {
        return res.status(400).json({
          error: 'Enter a valid expiry date.',
        });
      }

      const existingProduct = await prisma.product.findUnique({
        where: { id: req.params.id },
      });

      if (!existingProduct) {
        return res.status(404).json({ error: 'Product not found.' });
      }

      const product = await prisma.product.update({
        where: { id: req.params.id },
        data: {
          name: name.trim(),
          company: company.trim(),
          composition: composition.trim(),
          category: category.trim(),
          medicineType: medicineType?.trim() || null,
          productType: productType?.trim() || null,
          pack: pack.trim(),
          countryOfOrigin: countryOfOrigin?.trim() || null,
          barcode: barcode?.trim() || null,
          prescriptionRequired: Boolean(prescriptionRequired),
          image: image?.trim() || null,
          description: description?.trim() || null,

          mrp: pricing.mrp,
          ptr: pricing.ptr,
          gst: pricing.gst,
          discountType: pricing.discountType,
          discountValue: pricing.discountValue,
          discountAmount: pricing.discountAmount,
          effectivePtr: pricing.effectivePtr,
          buyQuantity: pricing.buyQuantity,
          freeQuantity: pricing.freeQuantity,
          bonusProductId: bonusProductId?.trim() || null,
          net: pricing.effectivePtr,

          expiry: parsedExpiry,
          stock: stockInStrips(pack, stock ?? 0),
          minOrderQuantity: Number(minOrderQuantity),
          isActive: isActive !== false,
        },
        include: {
          inventoryBatches: { orderBy: { expiryDate: 'asc' } },
        },
      });

      res.json(serializeProduct(product));
    } catch (error) {
      if (error?.code === 'P2002') {
        const target = error?.meta?.target;
        if (Array.isArray(target) && target.includes('barcode')) {
          return res.status(409).json({
            error: 'A product with this barcode already exists.',
          });
        }
        return res.status(409).json({
          error: 'A product with the same product details already exists.',
        });
      }
      if (error?.code === 'P2025') {
        return res.status(404).json({ error: 'Product not found.' });
      }
      next(error);
    }
  }
);

/* ============================================================================
   ADMIN - INVENTORY BATCHES
============================================================================ */

app.post(
  '/api/admin/products/:id/batches',
  authenticate,
  adminOnly,
  async (req, res, next) => {
    try {
      const product =
        await prisma.product.findUnique({
          where: {
            id: req.params.id,
          },
        });

      if (!product) {
        return res.status(404).json({
          error: 'Product not found.',
        });
      }

      const {
        batchNumber,
        quantity,
        freeQuantity,
        mrp,
        ptr,
        discount,
        gst,
        expiryDate,
      } = req.body || {};

      if (
        !batchNumber?.trim() ||
        !Number.isFinite(
          Number(quantity)
        ) ||
        !Number.isFinite(Number(mrp)) ||
        !Number.isFinite(Number(ptr)) ||
        !expiryDate
      ) {
        return res.status(400).json({
          error:
            'Batch number, quantity, MRP, PTR and expiry date are required.',
        });
      }

      const parsedExpiry =
        parseDate(expiryDate);

      if (!parsedExpiry) {
        return res.status(400).json({
          error:
            'Enter a valid batch expiry date.',
        });
      }

      const parsedQuantity = Math.max(
        0,
        Number(quantity)
      );

      const parsedFreeQuantity =
        Math.max(
          0,
          Number(freeQuantity) || 0
        );

      const parsedMrp = Number(mrp);
      const parsedPtr = Number(ptr);
      const parsedDiscount =
        Math.max(
          0,
          Number(discount) || 0
        );
      const parsedGst = Math.max(
        0,
        Number(gst) || 0
      );

      if (
        parsedMrp < 0 ||
        parsedPtr < 0
      ) {
        return res.status(400).json({
          error:
            'MRP and PTR cannot be negative.',
        });
      }

      const batch =
        await prisma.inventoryBatch.create({
          data: {
            productId: product.id,
            batchNumber:
              batchNumber.trim(),
            quantity:
              parsedQuantity,
            freeQuantity:
              parsedFreeQuantity,
            mrp: parsedMrp,
            ptr: parsedPtr,
            discount:
              parsedDiscount,
            gst: parsedGst,
            expiryDate:
              parsedExpiry,
          },
        });

      // Inventory batches manage stock/expiry only.
      // Product-level pricing remains canonical and is calculated
      // by calculateProductPricing in the product create/update routes.
      const allBatches =
        await prisma.inventoryBatch.findMany({
          where: { productId: product.id },
        });

      const totalStock = allBatches.reduce(
        (sum, item) =>
          sum +
          Number(item.quantity || 0) +
          Number(item.freeQuantity || 0),
        0
      );

      const earliestExpiry = allBatches
        .map((item) => new Date(item.expiryDate))
        .sort((a, b) => a.getTime() - b.getTime())[0];

      await prisma.product.update({
        where: { id: product.id },
        data: {
          stock: totalStock,
          ...(earliestExpiry
            ? { expiry: earliestExpiry }
            : {}),
        },
      });

      res.status(201).json(
        serializeInventoryBatch(batch)
      );
    } catch (error) {
      if (error?.code === 'P2002') {
        return res.status(409).json({
          error:
            'This batch number already exists for this product.',
        });
      }

      next(error);
    }
  }
);

app.patch(
  '/api/admin/batches/:id',
  authenticate,
  adminOnly,
  async (req, res, next) => {
    try {
      const existing =
        await prisma.inventoryBatch.findUnique(
          {
            where: {
              id: req.params.id,
            },
          }
        );

      if (!existing) {
        return res.status(404).json({
          error: 'Inventory batch not found.',
        });
      }

      const {
        batchNumber,
        quantity,
        freeQuantity,
        mrp,
        ptr,
        discount,
        gst,
        expiryDate,
      } = req.body || {};

      const data = {};

      if (
        batchNumber !== undefined
      ) {
        if (!String(batchNumber).trim()) {
          return res.status(400).json({
            error:
              'Batch number cannot be empty.',
          });
        }

        data.batchNumber =
          String(batchNumber).trim();
      }

      if (quantity !== undefined) {
        const value = Number(quantity);

        if (
          !Number.isFinite(value) ||
          value < 0
        ) {
          return res.status(400).json({
            error:
              'Quantity must be a valid non-negative number.',
          });
        }

        data.quantity = value;
      }

      if (
        freeQuantity !== undefined
      ) {
        const value =
          Number(freeQuantity);

        if (
          !Number.isFinite(value) ||
          value < 0
        ) {
          return res.status(400).json({
            error:
              'Free quantity must be a valid non-negative number.',
          });
        }

        data.freeQuantity = value;
      }

      if (mrp !== undefined) {
        const value = Number(mrp);

        if (
          !Number.isFinite(value) ||
          value < 0
        ) {
          return res.status(400).json({
            error:
              'MRP must be a valid non-negative number.',
          });
        }

        data.mrp = value;
      }

      if (ptr !== undefined) {
        const value = Number(ptr);

        if (
          !Number.isFinite(value) ||
          value < 0
        ) {
          return res.status(400).json({
            error:
              'PTR must be a valid non-negative number.',
          });
        }

        data.ptr = value;
      }

      if (
        discount !== undefined
      ) {
        const value =
          Number(discount);

        if (
          !Number.isFinite(value) ||
          value < 0
        ) {
          return res.status(400).json({
            error:
              'Discount must be a valid non-negative number.',
          });
        }

        data.discount = value;
      }

      if (gst !== undefined) {
        const value = Number(gst);

        if (
          !Number.isFinite(value) ||
          value < 0
        ) {
          return res.status(400).json({
            error:
              'GST must be a valid non-negative number.',
          });
        }

        data.gst = value;
      }

      if (
        expiryDate !== undefined
      ) {
        const parsed =
          parseDate(expiryDate);

        if (!parsed) {
          return res.status(400).json({
            error:
              'Enter a valid expiry date.',
          });
        }

        data.expiryDate = parsed;
      }

      const batch =
        await prisma.inventoryBatch.update(
          {
            where: {
              id: req.params.id,
            },
            data,
          }
        );

      // Batch edits must never overwrite canonical product pricing.
      const allBatches = await prisma.inventoryBatch.findMany({
        where: { productId: existing.productId },
        orderBy: { expiryDate: 'asc' },
      });

      const totalStock = allBatches.reduce(
        (sum, item) =>
          sum +
          Number(item.quantity || 0) +
          Number(item.freeQuantity || 0),
        0
      );

      const primaryBatch = allBatches[0];

      await prisma.product.update({
        where: { id: existing.productId },
        data: {
          stock: totalStock,
          ...(primaryBatch
            ? { expiry: primaryBatch.expiryDate }
            : {}),
        },
      });

      res.json(
        serializeInventoryBatch(batch)
      );
    } catch (error) {
      if (error?.code === 'P2002') {
        return res.status(409).json({
          error:
            'This batch number already exists for this product.',
        });
      }

      if (error?.code === 'P2025') {
        return res.status(404).json({
          error:
            'Inventory batch not found.',
        });
      }

      next(error);
    }
  }
);

app.delete(
  '/api/admin/batches/:id',
  authenticate,
  adminOnly,
  async (req, res, next) => {
    try {
      const existing =
        await prisma.inventoryBatch.findUnique(
          {
            where: {
              id: req.params.id,
            },
          }
        );

      if (!existing) {
        return res.status(404).json({
          error: 'Inventory batch not found.',
        });
      }

      await prisma.inventoryBatch.delete({
        where: {
          id: req.params.id,
        },
      });

      const remaining =
        await prisma.inventoryBatch.findMany(
          {
            where: {
              productId:
                existing.productId,
            },
            orderBy: {
              expiryDate: 'asc',
            },
          }
        );

      const totalStock =
        remaining.reduce(
          (sum, item) =>
            sum +
            Number(item.quantity) +
            Number(item.freeQuantity),
          0
        );

      const primaryBatch =
        remaining[0];

      await prisma.product.update({
        where: {
          id: existing.productId,
        },
        data: {
          stock: totalStock,

          ...(primaryBatch
            ? {
                mrp: primaryBatch.mrp,
                net: Math.max(
                  0,
                  Number(
                    primaryBatch.mrp
                  ) -
                    Number(
                      primaryBatch.discount
                    )
                ),
                expiry:
                  primaryBatch.expiryDate,
              }
            : {}),
        },
      });

      res.json({
        ok: true,
      });
    } catch (error) {
      if (error?.code === 'P2025') {
        return res.status(404).json({
          error:
            'Inventory batch not found.',
        });
      }

      next(error);
    }
  }
);

/* ============================================================================
   ADMIN - CUSTOMERS
============================================================================ */

app.get(
  '/api/admin/customers',
  authenticate,
  adminOnly,
  async (_req, res, next) => {
    try {
      const customers =
        await prisma.user.findMany({
          where: {
            role: Role.CUSTOMER,
          },
          include: {
            _count: {
              select: {
                orders: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

      res.json(
        customers.map(
          ({
            passwordHash,
            _count,
            ...customer
          }) => ({
            ...customer,
            orderCount:
              _count.orders,
          })
        )
      );
    } catch (error) {
      next(error);
    }
  }
);

/* ============================================================================
   ADMIN - ORDER STATUS
============================================================================ */

app.patch(
  '/api/admin/orders/:id/status',
  authenticate,
  adminOnly,
  async (req, res, next) => {
    try {
      const status = String(
        req.body.status || ''
      ).toUpperCase();

      if (
        !Object.values(
          OrderStatus
        ).includes(status)
      ) {
        return res.status(400).json({
          error: 'Invalid status.',
        });
      }

      const target =
        await prisma.order.findFirst({
          where: {
            OR: [
              {
                id: req.params.id,
              },
              {
                orderNumber:
                  req.params.id,
              },
            ],
          },
        });

      if (!target) {
        return res.status(404).json({
          error: 'Order not found.',
        });
      }

      const allowedTransitions = {
        [OrderStatus.SUBMITTED]: [
          OrderStatus.CONFIRMED,
          OrderStatus.CANCELLED,
        ],
        [OrderStatus.CONFIRMED]: [
          OrderStatus.PACKED,
          OrderStatus.CANCELLED,
        ],
        [OrderStatus.PACKED]: [
          OrderStatus.DISPATCHED,
        ],
        [OrderStatus.DISPATCHED]: [
          OrderStatus.DELIVERED,
        ],
        [OrderStatus.DELIVERED]: [],
        [OrderStatus.CANCELLED]: [],
      };

      const currentStatus = target.status;
      const allowed = allowedTransitions[currentStatus] || [];
      const trackingId = cleanString(req.body.trackingId);
      const deliveryPartner = cleanString(req.body.deliveryPartner);

      if (
        status !== currentStatus &&
        !allowed.includes(status)
      ) {
        return res.status(400).json({
          error: `Invalid order status transition: ${currentStatus} → ${status}.`,
        });
      }

           const isTrackingUpdateOnly =
        status === currentStatus &&
        status !== OrderStatus.CANCELLED &&
        trackingId &&
        deliveryPartner;

      if (status === currentStatus && !isTrackingUpdateOnly) {
        return res.status(400).json({
          error: `Order is already ${status}.`,
        });
      }

      // if (status === OrderStatus.DISPATCHED && (!trackingId || !deliveryPartner)) {
      //   return res.status(400).json({ error: 'Delivery partner and tracking ID are required before dispatching an order.' });
      // }

      const order = await prisma.$transaction(async (tx) => {
        let restoredOrder;

        if (status === OrderStatus.CANCELLED) {
          // Restore Product.stock exactly once.
          // stockRestoredAt makes cancellation idempotent.
          const current = await tx.order.findUnique({
            where: {
              id: target.id,
            },
            include: {
              items: true,
            },
          });

          if (!current) {
            throw new Error('Order not found.');
          }

          if (!current.stockRestoredAt) {
            for (const item of current.items) {
              await tx.product.update({
                where: {
                  id: item.productId,
                },
                data: {
                  stock: {
                    increment: item.quantity,
                  },
                },
              });
            }

            restoredOrder = await tx.order.update({
              where: {
                id: current.id,
              },
              data: {
                status: OrderStatus.CANCELLED,
                cancelledAt: new Date(),
                stockRestoredAt: new Date(),
                statusHistory: {
                  create: {
                    status: OrderStatus.CANCELLED,
                    note:
                      req.body.note?.trim() ||
                      'Order cancelled. Stock restored.',
                  },
                },
              },
              include: {
                items: true,
                statusHistory: {
                  orderBy: {
                    createdAt: 'asc',
                  },
                },
              },
            });
          } else {
            restoredOrder = await tx.order.update({
              where: {
                id: current.id,
              },
              data: {
                status: OrderStatus.CANCELLED,
                cancelledAt: current.cancelledAt || new Date(),
                statusHistory: {
                  create: {
                    status: OrderStatus.CANCELLED,
                    note:
                      req.body.note?.trim() ||
                      'Order cancelled. Stock had already been restored.',
                  },
                },
              },
              include: {
                items: true,
                statusHistory: {
                  orderBy: {
                    createdAt: 'asc',
                  },
                },
              },
            });
          }
        } else {
          restoredOrder = await tx.order.update({
            where: {
              id: target.id,
            },
            data: {
              status,
              ...(status === OrderStatus.DISPATCHED ? { trackingId, deliveryPartner } : {}),
              statusHistory: {
                create: {
                  status,
                  note:
                    req.body.note?.trim() ||
                    null,
                },
              },
            },
            include: {
              items: true,
              statusHistory: {
                orderBy: {
                  createdAt: 'asc',
                },
              },
            },
          });
        }

        return restoredOrder;
      });

      // if (status === OrderStatus.DISPATCHED) {
      //   const customer = await prisma.user.findUnique({ where: { id: target.userId } });
      //   if (customer?.email) {
      //     void sendMail({
      //       to: customer.email,
      //       subject: `Your order has been dispatched — ${order.orderNumber}`,
      //       html: `<h2>Your order is on the way</h2><p>Order <strong>${escapeHtml(order.orderNumber)}</strong> has been dispatched with <strong>${escapeHtml(deliveryPartner)}</strong>.</p><p><strong>Tracking ID:</strong> ${escapeHtml(trackingId)}</p>`,
      //     }).catch((error) => console.error('Dispatch email delivery failed:', error.message));
      //   }
      // }

      res.json(
        serializeOrder(order)
      );
    } catch (error) {
      next(error);
    }
  }
);

app.post(
  '/api/admin/orders/:id/tracking-email',
  authenticate,
  adminOnly,
  async (req, res, next) => {
    try {
      const trackingId = cleanString(req.body.trackingId);
      const deliveryPartner = cleanString(req.body.deliveryPartner);

      if (!trackingId || !deliveryPartner) {
        return res.status(400).json({
          error: 'Delivery partner and tracking ID are required.',
        });
      }

      const order = await prisma.order.findFirst({
        where: {
          OR: [
            { id: req.params.id },
            { orderNumber: req.params.id },
          ],
        },
      });

      if (!order) {
        return res.status(404).json({
          error: 'Order not found.',
        });
      }

      if (order.status === OrderStatus.CANCELLED) {
        return res.status(400).json({
          error: 'Tracking email cannot be sent for a cancelled order.',
        });
      }

      const customer = await prisma.user.findUnique({
        where: {
          id: order.userId,
        },
        select: {
          name: true,
          email: true,
        },
      });

      if (!customer?.email) {
        return res.status(400).json({
          error: 'Customer email is not available.',
        });
      }

      const updatedOrder = await prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          trackingId,
          deliveryPartner,
        },
        include: {
          items: true,
          statusHistory: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

      await sendMail({
        to: customer.email,
        subject: `Order ${order.orderNumber} — Tracking Details`,
        text: [
          `Hi ${customer.name || 'there'},`,
          '',
          `Your order ${order.orderNumber} is currently ${order.status}.`,
          '',
          `Delivery Partner: ${deliveryPartner}`,
          `Tracking ID: ${trackingId}`,
          '',
          'Thank you for shopping with Singh Medicals.',
        ].join('\n'),
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6">
            <h2>Your Order Tracking Details</h2>

            <p>Hi ${escapeHtml(customer.name || 'there')},</p>

            <p>
              Your order
              <strong>${escapeHtml(order.orderNumber)}</strong>
              is currently
              <strong>${escapeHtml(order.status)}</strong>.
            </p>

            <div style="
              background:#f5f7f6;
              padding:16px;
              border-radius:10px;
              margin:16px 0;
            ">
              <p>
                <strong>Delivery Partner:</strong>
                ${escapeHtml(deliveryPartner)}
              </p>

              <p>
                <strong>Tracking ID:</strong>
                ${escapeHtml(trackingId)}
              </p>
            </div>

            <p>Thank you for shopping with Singh Medicals.</p>
          </div>
        `,
      });

      return res.json({
        ok: true,
        order: serializeOrder(updatedOrder),
      });
    } catch (error) {
      next(error);
    }
  }
);

/* ============================================================================
   ADMIN - LEGACY PRODUCT CSV IMPORT
============================================================================ */

app.post(
  '/api/admin/products/import',
  authenticate,
  adminOnly,
  upload.single('file'),
  async (req, res, next) => {
    try {
      const rows = req.file
        ? parse(req.file.buffer, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
            bom: true,
          })
        : Array.isArray(req.body.rows)
        ? req.body.rows.map((row) => ({
            'Product Name': row[0],
            Composition: row[1],
            Company: row[2],
            Category: row[3],
            'Medicine Type': row[4],
            'Product Type': row[5],
            'Pack Size': row[6],
            Quantity: row[7],
            MRP: row[8],
            'Discount Type': row[9],
            'Discount %': row[10],
            'Offer Buy Quantity': row[11],
            'Offer Free Quantity': row[12],
            'Expiry Date': row[13],
            Barcode: row[14],
            'Prescription Required': row[15],
            'Country of Origin': row[16],
            Image: row[17],
            Description: row[18],
          }))
        : null;

      if (!rows) {
        return res.status(400).json({
          error: 'Upload a CSV file or provide parsed rows.',
        });
      }

      if (!rows.length) {
        return res.status(400).json({
          error: 'The CSV file contains no data rows.',
        });
      }

      let created = 0;
      let updated = 0;
      const errors = [];

      for (const [index, row] of rows.entries()) {
        try {
          const name = cleanString(row['Product Name'] || row.Name);
          const company = cleanString(row.Company);
          const composition = cleanString(row.Composition);
          const category = cleanString(row.Category);
          const medicineType = cleanString(row['Medicine Type']);
          const productType = cleanString(row['Product Type']);
          const pack = cleanString(row['Pack Size'] || row.Pack);
          const quantity = Number(row.Quantity ?? row.Stock ?? 0);
          const mrp = Number(row.MRP);
          const discountType =
            cleanString(row['Discount Type']) || DiscountType.NONE;
          const discountValue = Number(row['Discount %'] ?? 0);
          const buyQuantity = Number(row['Offer Buy Quantity'] ?? 0);
          const freeQuantity = Number(row['Offer Free Quantity'] ?? 0);
          const parsedExpiry = parseDate(
            row['Expiry Date'] || row.Expiry
          );
          const barcode = cleanString(row.Barcode) || null;
          const countryOfOrigin =
            cleanString(row['Country of Origin']) || null;
          const prescriptionRequired = [
            'true',
            'yes',
            '1',
          ].includes(
            cleanString(row['Prescription Required']).toLowerCase()
          );
          const image = cleanString(row.Image) || null;
          const description = cleanString(row.Description) || null;

          if (!name || !company || !composition || !category || !pack) {
            throw new Error(
              'Product Name, Company, Composition, Category and Pack Size are required.'
            );
          }

          if (!Number.isFinite(quantity) || quantity < 0) {
            throw new Error(
              'Quantity must be a valid non-negative number.'
            );
          }

          if (!parsedExpiry) {
            throw new Error('Expiry Date is required and must be valid.');
          }

          if (parsedExpiry < new Date()) {
            throw new Error('Expiry Date cannot be in the past.');
          }

          let pricing;
          try {
            pricing = calculateProductPricing({
              mrp,
              discountType,
              discountValue,
              buyQuantity,
              freeQuantity,
            });
          } catch (error) {
            throw new Error(error?.message || 'Invalid pricing details.');
          }

          const existing = await prisma.product.findUnique({
            where: {
              name_company_pack: {
                name,
                company,
                pack,
              },
            },
          });

          if (existing) {
            await prisma.product.update({
              where: { id: existing.id },
              data: {
                name,
                company,
                composition,
                category,
                medicineType: medicineType || null,
                productType: productType || null,
                pack,
                countryOfOrigin,
                barcode,
                prescriptionRequired,
                image,
                description,
                mrp: pricing.mrp,
                ptr: pricing.ptr,
                gst: pricing.gst,
                discountType: pricing.discountType,
                discountValue: pricing.discountValue,
                discountAmount: pricing.discountAmount,
                effectivePtr: pricing.effectivePtr,
                buyQuantity: pricing.buyQuantity,
                freeQuantity: pricing.freeQuantity,
                net: pricing.effectivePtr,
                expiry: parsedExpiry,
                stock: Math.max(0, quantity + (pricing.freeQuantity || 0)),
                isActive: true,
              },
            });
            updated++;
          } else {
            const generatedSku =
              `AUTO-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)
                .toUpperCase()}`;

            await prisma.product.create({
              data: {
                name,
                company,
                composition,
                category,
                medicineType: medicineType || null,
                productType: productType || null,
                pack,
                countryOfOrigin,
                sku: generatedSku,
                barcode,
                prescriptionRequired,
                image,
                description,
                mrp: pricing.mrp,
                ptr: pricing.ptr,
                gst: pricing.gst,
                discountType: pricing.discountType,
                discountValue: pricing.discountValue,
                discountAmount: pricing.discountAmount,
                effectivePtr: pricing.effectivePtr,
                buyQuantity: pricing.buyQuantity,
                freeQuantity: pricing.freeQuantity,
                net: pricing.effectivePtr,
                expiry: parsedExpiry,
                stock: Math.max(0, quantity + (pricing.freeQuantity || 0)),
                isActive: true,
              },
            });
            created++;
          }
        } catch (error) {
          errors.push({
            row: index + 2,
            error: error?.message || 'Import failed',
          });
        }
      }

      await prisma.productImport.create({
        data: {
          fileName:
            req.file?.originalname || 'browser-import.csv',
          created,
          updated,
          failed: errors.length,
          errors,
        },
      });

      res.json({
        inserted: created,
        updated,
        created,
        failed: errors.length,
        errors,
      });
    } catch (error) {
      next(error);
    }
  }
);

/* ============================================================================
   ADMIN - INVENTORY CSV IMPORT
   ============================================================================ */

app.post(
  '/api/admin/inventory/import',
  authenticate,
  adminOnly,
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'Upload an inventory CSV file.',
        });
      }

      const rows = parse(req.file.buffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
      });

      if (!rows.length) {
        return res.status(400).json({
          error: 'The CSV file contains no data rows.',
        });
      }

      // CSV contract used by the Inventory Import screen.
      // SKU, Batch Number, PTR and GST are generated/calculated by the API.
      const requiredHeaders = [
        'Product Name',
        'Composition',
        'Company',
        'Category',
        'Medicine Type',
        'Product Type',
        'Pack Size',
        'Quantity',
        'MRP',
        'Min Order Quantity',
        'Discount Type',
        'Discount %',
        'Offer Buy Quantity',
        'Offer Free Quantity',
        'Bonus Product',
        'Expiry Date',
        'Barcode',
        'Prescription Required',
        'Country of Origin',
        'Image',
        'Description',
      ];

      const actualHeaders = Object.keys(rows[0]);
      const missingHeaders = requiredHeaders.filter(
        (header) => !actualHeaders.includes(header)
      );

      if (missingHeaders.length) {
        return res.status(400).json({
          error: `Missing required CSV columns: ${missingHeaders.join(', ')}`,
        });
      }

      let createdProducts = 0;
      let updatedProducts = 0;
      let createdBatches = 0;
      let updatedBatches = 0;
      const errors = [];
      const pendingBonusLinks = [];

      for (const [index, row] of rows.entries()) {
        try {
          const productName = cleanString(row['Product Name']);
          const composition = cleanString(row['Composition']);
          const company = cleanString(row['Company']);
          const category = cleanString(row['Category']);
          const medicineType = cleanString(row['Medicine Type']);
          const productType = cleanString(row['Product Type']);
          const pack = cleanString(row['Pack Size']);

          const quantity = Number(row['Quantity']);
          const mrp = Number(row['MRP']);
          const minOrderQuantity = Number(row['Min Order Quantity']);

          const discountTypeRaw = cleanString(row['Discount Type']).toUpperCase();
          const discountType = discountTypeRaw || DiscountType.NONE;

          const discountValue = Number(row['Discount %'] || 0);
          const buyQuantity = Number(row['Offer Buy Quantity'] || 0);
          const freeQuantity = Number(row['Offer Free Quantity'] || 0);
          const bonusProductName = cleanString(row['Bonus Product']);

          const barcode = cleanString(row['Barcode']) || null;
          const countryOfOrigin = cleanString(row['Country of Origin']) || null;

          const prescriptionRaw = cleanString(row['Prescription Required']).toLowerCase();
          if (prescriptionRaw && !['true', 'yes', '1', 'false', 'no', '0'].includes(prescriptionRaw)) {
            throw new Error('Prescription Required must be Yes/No or True/False.');
          }
          const prescriptionRequired = ['true', 'yes', '1'].includes(prescriptionRaw);

          const image = cleanString(row['Image']) || null;
          const description = cleanString(row['Description']) || null;

          // Blank Expiry Date defaults to 12/12/2030.
          const expiryRaw = cleanString(row['Expiry Date']);
          const expiryDate = expiryRaw
            ? parseDate(expiryRaw)
            : new Date('2030-12-12T00:00:00.000Z');

          if (
            !productName ||
            !composition ||
            !company ||
            !category ||
            !medicineType ||
            !productType ||
            !pack
          ) {
            throw new Error(
              'Product Name, Composition, Company, Category, Medicine Type, Product Type and Pack Size are required.'
            );
          }

          if (!Number.isFinite(quantity) || !Number.isInteger(quantity) || quantity < 0) {
            throw new Error('Quantity must be a valid non-negative whole number.');
          }

          if (!Number.isFinite(mrp) || mrp < 0) {
            throw new Error('MRP must be a valid non-negative number.');
          }

          if (!Number.isFinite(minOrderQuantity) || !Number.isInteger(minOrderQuantity) || minOrderQuantity < 1) {
            throw new Error('Min Order Quantity must be a positive whole number.');
          }

          if (!expiryDate) {
            throw new Error('Expiry Date is invalid.');
          }

          if (expiryDate < new Date()) {
            throw new Error('Expiry Date cannot be in the past.');
          }

          if (!Object.values(DiscountType).includes(discountType)) {
            throw new Error(`Invalid Discount Type: ${discountTypeRaw}`);
          }

          if (!Number.isFinite(discountValue) || discountValue < 0 || discountValue > 100) {
            throw new Error('Discount % must be between 0 and 100.');
          }

          const bonusOffer = hasBonus(discountType);
          const sameProductOffer = hasSameProductBonus(discountType);
          const ptrDiscountOffer = hasPtrDiscount(discountType);

          if (bonusOffer) {
            if (!Number.isFinite(buyQuantity) || !Number.isInteger(buyQuantity) || buyQuantity < 1) {
              throw new Error('Offer Buy Quantity must be a positive whole number for bonus offers.');
            }
            if (!Number.isFinite(freeQuantity) || !Number.isInteger(freeQuantity) || freeQuantity < 1) {
              throw new Error('Offer Free Quantity must be a positive whole number for bonus offers.');
            }
          } else if (buyQuantity !== 0 || freeQuantity !== 0 || bonusProductName) {
            throw new Error('Buy quantity, free quantity and bonus product must be blank/zero when no bonus offer is selected.');
          }

          if (sameProductOffer && bonusProductName) {
            throw new Error('Bonus Product must be blank for a same-product offer.');
          }

          if (!bonusOffer && !ptrDiscountOffer && discountValue !== 0) {
            throw new Error('Discount % must be 0 when no discount offer is selected.');
          }

          if (bonusOffer && !sameProductOffer && !bonusProductName) {
            throw new Error('Bonus Product is required for a different-product offer.');
          }

          let pricing;
          try {
            pricing = calculateProductPricing({
              mrp,
              discountType,
              discountValue,
              buyQuantity,
              freeQuantity,
            });
          } catch (error) {
            throw new Error(error?.message || 'Invalid pricing details.');
          }

          // Discount is applied to PTR first. For a same-product bonus,
          // the effective received-unit price is then spread across paid + free units.
          // A different-product bonus remains free and therefore does not reduce
          // the source product's own selling price.
          const csvEffectivePtr = sameProductOffer
            ? money(pricing.effectivePtr * buyQuantity / (buyQuantity + freeQuantity))
            : pricing.effectivePtr;

          const generatedBatchNumber =
            `AUTO-IMPORT-${index + 1}-${expiryDate.toISOString().slice(0, 10)}`;

          await prisma.$transaction(async (tx) => {
            let product = await tx.product.findUnique({
              where: {
                name_company_pack: {
                  name: productName,
                  company,
                  pack,
                },
              },
            });

            if (!product) {
              product = await tx.product.create({
                data: {
                  name: productName,
                  company,
                  composition,
                  category,
                  medicineType,
                  productType,
                  pack,
                  countryOfOrigin,
                  sku: `AUTO-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
                  barcode,
                  prescriptionRequired,
                  image,
                  description,
                  mrp: pricing.mrp,
                  ptr: pricing.ptr,
                  gst: pricing.gst,
                  discountType: pricing.discountType,
                  discountValue: pricing.discountValue,
                  discountAmount: pricing.discountAmount,
                  effectivePtr: csvEffectivePtr,
                  buyQuantity: pricing.buyQuantity,
                  freeQuantity: pricing.freeQuantity,
                  bonusProductId: null,
                  net: csvEffectivePtr,
                  expiry: expiryDate,
                  stock: quantity,
                  minOrderQuantity,
                  isActive: true,
                },
              });
              createdProducts++;
            } else {
              product = await tx.product.update({
                where: { id: product.id },
                data: {
                  composition,
                  category,
                  medicineType,
                  productType,
                  pack,
                  countryOfOrigin,
                  barcode,
                  prescriptionRequired,
                  image,
                  description,
                  mrp: pricing.mrp,
                  ptr: pricing.ptr,
                  gst: pricing.gst,
                  discountType: pricing.discountType,
                  discountValue: pricing.discountValue,
                  discountAmount: pricing.discountAmount,
                  effectivePtr: csvEffectivePtr,
                  buyQuantity: pricing.buyQuantity,
                  freeQuantity: pricing.freeQuantity,
                  bonusProductId: null,
                  net: csvEffectivePtr,
                  expiry: expiryDate,
                  minOrderQuantity,
                  isActive: true,
                },
              });
              updatedProducts++;
            }

            const existingBatch = await tx.inventoryBatch.findUnique({
              where: {
                productId_batchNumber: {
                  productId: product.id,
                  batchNumber: generatedBatchNumber,
                },
              },
            });

            await tx.inventoryBatch.upsert({
              where: {
                productId_batchNumber: {
                  productId: product.id,
                  batchNumber: generatedBatchNumber,
                },
              },
              create: {
                productId: product.id,
                batchNumber: generatedBatchNumber,
                quantity,
                freeQuantity: 0,
                mrp: pricing.mrp,
                ptr: pricing.ptr,
                discount: pricing.discountAmount,
                gst: pricing.gst,
                expiryDate,
              },
              update: {
                quantity,
                freeQuantity: 0,
                mrp: pricing.mrp,
                ptr: pricing.ptr,
                discount: pricing.discountAmount,
                gst: pricing.gst,
                expiryDate,
              },
            });

            if (existingBatch) updatedBatches++;
            else createdBatches++;

            const allBatches = await tx.inventoryBatch.findMany({
              where: { productId: product.id },
              orderBy: { expiryDate: 'asc' },
            });

            const totalStock = allBatches.reduce(
              (sum, item) =>
                sum + Number(item.quantity || 0) + Number(item.freeQuantity || 0),
              0
            );

            const primaryBatch = allBatches[0];

            await tx.product.update({
              where: { id: product.id },
              data: {
                stock: totalStock,
                ...(primaryBatch ? { expiry: primaryBatch.expiryDate } : {}),
              },
            });

            if (bonusOffer && !sameProductOffer) {
              pendingBonusLinks.push({
                row: index + 2,
                sourceProductId: product.id,
                bonusProductName,
              });
            }
          });
        } catch (error) {
          errors.push({
            row: index + 2,
            error: error?.message || 'Import failed',
          });
        }
      }

      // Resolve different-product bonus references after all CSV rows have been
      // imported. This allows a bonus product to appear later in the same CSV.
      for (const link of pendingBonusLinks) {
        try {
          const bonusProduct = await prisma.product.findFirst({
            where: {
              name: {
                equals: link.bonusProductName,
                mode: 'insensitive',
              },
              isActive: true,
            },
            select: { id: true, name: true },
          });

          if (!bonusProduct) {
            errors.push({
              row: link.row,
              error: `Bonus Product "${link.bonusProductName}" was not found. Import/create the bonus product first.`,
            });
            continue;
          }

          if (bonusProduct.id === link.sourceProductId) {
            errors.push({
              row: link.row,
              error: 'Bonus Product cannot be the same product for a different-product offer.',
            });
            continue;
          }

          await prisma.product.update({
            where: { id: link.sourceProductId },
            data: { bonusProductId: bonusProduct.id },
          });
        } catch (error) {
          errors.push({
            row: link.row,
            error: error?.message || 'Unable to resolve bonus product.',
          });
        }
      }

      await prisma.productImport.create({
        data: {
          fileName: req.file.originalname || 'inventory-import.csv',
          created: createdProducts + createdBatches,
          updated: updatedProducts + updatedBatches,
          failed: errors.length,
          errors,
        },
      });

      res.json({
        success: true,
        products: {
          created: createdProducts,
          updated: updatedProducts,
        },
        batches: {
          created: createdBatches,
          updated: updatedBatches,
        },
        failed: errors.length,
        errors,
      });
    } catch (error) {
      next(error);
    }
  }
);

/* ============================================================================
   ERROR HANDLING / STARTUP
============================================================================ */

app.use(
  (error, _req, res, _next) => {
    console.error(error);

    if (error?.message === 'CORS origin not allowed.') {
      return res.status(403).json({
        error: 'Origin not allowed.',
      });
    }

    if (error?.code === 'P2002') {
      return res.status(409).json({
        error:
          'A record with the same unique value already exists.',
      });
    }

    res.status(500).json({
      error: isProduction
        ? 'Unexpected server error.'
        : error?.message || 'Unexpected server error.',
    });
  }
);

if (!process.env.VERCEL) {
  app.listen(port, '0.0.0.0', () => {
    console.log(`API listening on port ${port}`);
  });
}

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
