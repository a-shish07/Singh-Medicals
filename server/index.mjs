import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import {
  PrismaClient,
  Role,
  OrderStatus,
  PaymentMethod,
} from '@prisma/client';

const app = express();
const prisma = new PrismaClient();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const port = Number(process.env.PORT || 3001);
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error(
    'JWT_SECRET is required. Copy .env.example to .env and set it.'
  );
}

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:8443',
  })
);

app.use(express.json());

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
  drugLicence: user.drugLicence,
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
    return res
      .status(401)
      .json({ error: 'Authentication required.' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);

    req.user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!req.user) {
      return res
        .status(401)
        .json({ error: 'Session is no longer valid.' });
    }

    next();
  } catch {
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

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      shopName,
      address,
    } = req.body;

    if (
      !name?.trim() ||
      !/^\S+@\S+\.\S+$/.test(email || '') ||
      typeof password !== 'string' ||
      password.length < 8
    ) {
      return res.status(400).json({
        error:
          'Name, valid email, and a password of at least 8 characters are required.',
      });
    }

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash: await bcrypt.hash(password, 12),
        phone: phone?.trim() || null,
        shopName: shopName?.trim() || null,
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

app.post('/api/auth/login', async (req, res, next) => {
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
      drugLicence,
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
        drugLicence: drugLicence?.trim() || null,
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

    const normalizedItems = items
      .map((item) => ({
        productId: cleanString(item.productId),
        quantity: Math.max(
          1,
          Number(item.quantity) || 1
        ),
      }))
      .filter((item) => item.productId);

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

    for (const item of normalizedItems) {
      const product = byId.get(item.productId);

      if (!product) {
        return res.status(400).json({
          error: 'Product not found.',
        });
      }

      if (
        Number(product.stock || 0) <
        item.quantity
      ) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}.`,
        });
      }
    }

    const total = normalizedItems.reduce(
      (sum, item) => {
        const product = byId.get(item.productId);

        return (
          sum +
          Number(product.net) *
            item.quantity
        );
      },
      0
    );

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
              subtotal: total,
              paymentMethod:
                safePaymentMethod,

              items: {
                create:
                  normalizedItems.map(
                    (item) => {
                      const product =
                        byId.get(
                          item.productId
                        );

                      return {
                        productId:
                          product.id,
                        productName:
                          product.name,
                        unitPrice:
                          product.net,
                        quantity:
                          item.quantity,
                      };
                    }
                  ),
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

        // Keep legacy Product.stock synchronized.
        for (const item of normalizedItems) {
          await tx.product.update({
            where: {
              id: item.productId,
            },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        return createdOrder;
      }
    );

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
   ADMIN - CREATE PRODUCT
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
        sku,
        barcode,
        prescriptionRequired,
        image,
        description,

        // Legacy compatibility
        mrp,
        net,
        scheme,
        expiry,
        stock,
        isActive,
      } = req.body || {};

      if (
        !name?.trim() ||
        !company?.trim() ||
        !composition?.trim() ||
        !category?.trim() ||
        !pack?.trim() ||
        !sku?.trim()
      ) {
        return res.status(400).json({
          error:
            'Name, company, composition, category, pack and SKU are required.',
        });
      }

      const parsedMrp = Number(
        mrp ?? 0
      );

      const parsedNet = Number(
        net ?? parsedMrp
      );

      if (
        !Number.isFinite(parsedMrp) ||
        parsedMrp < 0 ||
        !Number.isFinite(parsedNet) ||
        parsedNet < 0
      ) {
        return res.status(400).json({
          error:
            'MRP and Net must be valid non-negative numbers.',
        });
      }

      const parsedExpiry = parseDate(expiry);

if (!parsedExpiry) {
  return res.status(400).json({
    error: 'Expiry date is required and must be valid.',
  });
} 
      const product =
        await prisma.product.create({
          data: {
            name: name.trim(),
            company: company.trim(),
            composition:
              composition.trim(),
            category: category.trim(),
            medicineType:
              medicineType?.trim() ||
              null,
            productType:
              productType?.trim() ||
              null,
            pack: pack.trim(),
            countryOfOrigin:
              countryOfOrigin?.trim() ||
              null,
            sku: sku.trim(),
            barcode:
              barcode?.trim() || null,
            prescriptionRequired:
              Boolean(
                prescriptionRequired
              ),
            image:
              image?.trim() || null,
            description:
              description?.trim() ||
              null,

            // Legacy compatibility
            mrp: parsedMrp,
            net: parsedNet,
            scheme:
              scheme?.trim() || null,
            expiry: parsedExpiry,
            stock: Math.max(
              0,
              Number(stock) || 0
            ),
            isActive:
              isActive !== false,
          },

          include: {
            inventoryBatches: true,
          },
        });

      res.status(201).json(
        serializeProduct(product)
      );
    } catch (error) {
      if (error?.code === 'P2002') {
        const target =
          error?.meta?.target;

        if (
          Array.isArray(target) &&
          target.includes('sku')
        ) {
          return res.status(409).json({
            error:
              'A product with this SKU already exists.',
          });
        }

        if (
          Array.isArray(target) &&
          target.includes('barcode')
        ) {
          return res.status(409).json({
            error:
              'A product with this barcode already exists.',
          });
        }

        return res.status(409).json({
          error:
            'A product with this name, company and pack already exists.',
        });
      }

      next(error);
    }
  }
);

/* ============================================================================
   ADMIN - UPDATE PRODUCT
============================================================================ */

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
        sku,
        barcode,
        prescriptionRequired,
        image,
        description,

        // Legacy compatibility
        mrp,
        net,
        scheme,
        expiry,
        stock,
        isActive,
      } = req.body || {};

      if (
        !name?.trim() ||
        !company?.trim() ||
        !composition?.trim() ||
        !category?.trim() ||
        !pack?.trim() ||
        !sku?.trim()
      ) {
        return res.status(400).json({
          error:
            'Name, company, composition, category, pack and SKU are required.',
        });
      }

      const parsedMrp = Number(mrp);

      const parsedNet = Number(net);

      if (
        !Number.isFinite(parsedMrp) ||
        parsedMrp < 0 ||
        !Number.isFinite(parsedNet) ||
        parsedNet < 0
      ) {
        return res.status(400).json({
          error:
            'MRP and Net must be valid non-negative numbers.',
        });
      }

      const parsedExpiry =
        parseDate(expiry);

      if (!parsedExpiry) {
        return res.status(400).json({
          error:
            'Enter a valid expiry date.',
        });
      }

      const product =
        await prisma.product.update({
          where: {
            id: req.params.id,
          },

          data: {
            name: name.trim(),
            company: company.trim(),
            composition:
              composition.trim(),
            category: category.trim(),
            medicineType:
              medicineType?.trim() ||
              null,
            productType:
              productType?.trim() ||
              null,
            pack: pack.trim(),
            countryOfOrigin:
              countryOfOrigin?.trim() ||
              null,
            sku: sku.trim(),
            barcode:
              barcode?.trim() || null,
            prescriptionRequired:
              Boolean(
                prescriptionRequired
              ),
            image:
              image?.trim() || null,
            description:
              description?.trim() ||
              null,

            // Legacy compatibility
            mrp: parsedMrp,
            net: parsedNet,
            scheme:
              scheme?.trim() || null,
            expiry: parsedExpiry,
            stock: Math.max(
              0,
              Number(stock) || 0
            ),
            isActive:
              isActive !== false,
          },

          include: {
            inventoryBatches: {
              orderBy: {
                expiryDate: 'asc',
              },
            },
          },
        });

      res.json(
        serializeProduct(product)
      );
    } catch (error) {
      if (error?.code === 'P2002') {
        const target =
          error?.meta?.target;

        if (
          Array.isArray(target) &&
          target.includes('sku')
        ) {
          return res.status(409).json({
            error:
              'A product with this SKU already exists.',
          });
        }

        if (
          Array.isArray(target) &&
          target.includes('barcode')
        ) {
          return res.status(409).json({
            error:
              'A product with this barcode already exists.',
          });
        }

        return res.status(409).json({
          error:
            'A product with this name, company and pack already exists.',
        });
      }

      if (error?.code === 'P2025') {
        return res.status(404).json({
          error: 'Product not found.',
        });
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

      // Keep legacy Product fields synchronized.
      const allBatches =
        await prisma.inventoryBatch.findMany(
          {
            where: {
              productId: product.id,
            },
          }
        );

      const totalStock =
        allBatches.reduce(
          (sum, item) =>
            sum +
            Number(item.quantity) +
            Number(item.freeQuantity),
          0
        );

      const earliestExpiry =
        allBatches
          .map(
            (item) =>
              new Date(item.expiryDate)
          )
          .sort(
            (a, b) =>
              a.getTime() - b.getTime()
          )[0];

      await prisma.product.update({
        where: {
          id: product.id,
        },
        data: {
          stock: totalStock,
          mrp: parsedMrp,
          net: Math.max(
            0,
            parsedMrp -
              parsedDiscount
          ),
          expiry:
            earliestExpiry ||
            parsedExpiry,
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

      // Recalculate legacy Product fields.
      const allBatches =
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
        allBatches.reduce(
          (sum, item) =>
            sum +
            Number(item.quantity) +
            Number(item.freeQuantity),
          0
        );

      const primaryBatch =
        allBatches[0];

      if (primaryBatch) {
        await prisma.product.update({
          where: {
            id: existing.productId,
          },
          data: {
            stock: totalStock,
            mrp: primaryBatch.mrp,
            net: Math.max(
              0,
              Number(primaryBatch.mrp) -
                Number(
                  primaryBatch.discount
                )
            ),
            expiry:
              primaryBatch.expiryDate,
          },
        });
      }

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

      const order =
        await prisma.order.update({
          where: {
            id: target.id,
          },
          data: {
            status:
              status,

            statusHistory: {
              create: {
                status:
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

      res.json(
        serializeOrder(order)
      );
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
          })
        : Array.isArray(req.body.rows)
        ? req.body.rows.map(
            (row) => ({
              Name: row[0],
              Company: row[1],
              Composition: row[2],
              Category: row[3],
              Pack: row[4],
              MRP: row[5],
              Net: row[6],
              Expiry: row[7],
              Scheme: row[8],
            })
          )
        : null;

      if (!rows) {
        return res.status(400).json({
          error:
            'Upload a CSV file or provide parsed rows.',
        });
      }

      let created = 0;
      let updated = 0;
      const errors = [];

      for (
        const [index, row] of rows.entries()
      ) {
        try {
          const name =
            cleanString(row.Name);
          const company =
            cleanString(row.Company);
          const composition =
            cleanString(row.Composition);
          const category =
            cleanString(row.Category);
          const pack =
            cleanString(row.Pack);

          const parsedMrp =
            Number(row.MRP);
          const parsedNet =
            Number(row.Net);

          const parsedExpiry =
            parseDate(row.Expiry);

          if (
            !name ||
            !company ||
            !composition ||
            !category ||
            !pack ||
            !Number.isFinite(parsedMrp) ||
            !Number.isFinite(parsedNet) ||
            !parsedExpiry
          ) {
            throw new Error(
              'Missing/invalid required fields'
            );
          }

          // Legacy imports did not have SKU.
          // Generate a stable SKU from the row.
          const sku =
            cleanString(row.SKU) ||
            `LEGACY-${Date.now()}-${index + 1}`;

          const existing =
            await prisma.product.findUnique(
              {
                where: {
                  name_company_pack: {
                    name,
                    company,
                    pack,
                  },
                },
              }
            );

          if (existing) {
            await prisma.product.update({
              where: {
                id: existing.id,
              },
              data: {
                name,
                company,
                composition,
                category,
                pack,
                mrp: parsedMrp,
                net: parsedNet,
                scheme:
                  cleanString(
                    row.Scheme
                  ) || null,
                expiry:
                  parsedExpiry,
                stock: Math.max(
                  0,
                  Number(row.Stock) ||
                    0
                ),
                isActive: true,
              },
            });

            updated++;
          } else {
            await prisma.product.create({
              data: {
                name,
                company,
                composition,
                category,
                pack,
                sku,
                mrp: parsedMrp,
                net: parsedNet,
                scheme:
                  cleanString(
                    row.Scheme
                  ) || null,
                expiry:
                  parsedExpiry,
                stock: Math.max(
                  0,
                  Number(row.Stock) ||
                    0
                ),
                isActive: true,
              },
            });

            created++;
          }
        } catch (error) {
          errors.push({
            row: index + 2,
            error:
              error?.message ||
              'Import failed',
          });
        }
      }

      await prisma.productImport.create({
        data: {
          fileName:
            req.file?.originalname ||
            'browser-import.csv',
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
          error:
            'Upload an inventory CSV file.',
        });
      }

      const rows = parse(
        req.file.buffer,
        {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          bom: true,
        }
      );

      if (!rows.length) {
        return res.status(400).json({
          error:
            'The CSV file contains no data rows.',
        });
      }

      const requiredHeaders = [
        'SKU',
        'Product Name',
        'Composition',
        'Batch Number',
        'Company',
        'Category',
        'Medicine Type',
        'Product Type',
        'Pack Size',
        'Quantity',
        'MRP',
        'PTR',
        'Expiry Date',
      ];

      const actualHeaders =
        Object.keys(rows[0]);

      const missingHeaders =
        requiredHeaders.filter(
          (header) =>
            !actualHeaders.includes(
              header
            )
        );

      if (missingHeaders.length) {
        return res.status(400).json({
          error: `Missing required CSV columns: ${missingHeaders.join(
            ', '
          )}`,
        });
      }

      let createdProducts = 0;
      let updatedProducts = 0;
      let createdBatches = 0;
      let updatedBatches = 0;

      const errors = [];

      for (
        const [index, row] of rows.entries()
      ) {
        try {
          const sku =
            cleanString(row['SKU']);
          const productName =
            cleanString(
              row['Product Name']
            );
          const composition =
            cleanString(
              row['Composition']
            );
          const batchNumber =
            cleanString(
              row['Batch Number']
            );
          const company =
            cleanString(row['Company']);
          const category =
            cleanString(
              row['Category']
            );
          const medicineType =
            cleanString(
              row['Medicine Type']
            );
          const productType =
            cleanString(
              row['Product Type']
            );
          const pack =
            cleanString(
              row['Pack Size']
            );

          const quantity =
            Number(row['Quantity']);
          const freeQuantity =
            Number(
              row['Free Quantity'] || 0
            );
          const mrp =
            Number(row['MRP']);
          const ptr =
            Number(row['PTR']);
          const discount =
            Number(
              row['Discount'] || 0
            );
          const gst =
            Number(row['GST'] || 0);

          const expiryDate =
            parseDate(
              row['Expiry Date']
            );

          if (
            !sku ||
            !productName ||
            !composition ||
            !batchNumber ||
            !company ||
            !category ||
            !medicineType ||
            !productType ||
            !pack
          ) {
            throw new Error(
              'Missing required product/batch fields'
            );
          }

          if (
            !Number.isFinite(
              quantity
            ) ||
            quantity < 0
          ) {
            throw new Error(
              'Quantity must be a valid non-negative number'
            );
          }

          if (
            !Number.isFinite(
              freeQuantity
            ) ||
            freeQuantity < 0
          ) {
            throw new Error(
              'Free Quantity must be a valid non-negative number'
            );
          }

          if (
            !Number.isFinite(mrp) ||
            mrp < 0
          ) {
            throw new Error(
              'MRP must be a valid non-negative number'
            );
          }

          if (
            !Number.isFinite(ptr) ||
            ptr < 0
          ) {
            throw new Error(
              'PTR must be a valid non-negative number'
            );
          }

          if (
            !Number.isFinite(
              discount
            ) ||
            discount < 0
          ) {
            throw new Error(
              'Discount must be a valid non-negative number'
            );
          }

          if (
            !Number.isFinite(gst) ||
            gst < 0
          ) {
            throw new Error(
              'GST must be a valid non-negative number'
            );
          }

          if (!expiryDate) {
  throw new Error(
    'Expiry Date is invalid'
  );
}

if (expiryDate < new Date()) {
  throw new Error(
    'Expiry Date cannot be in the past'
  );
}

          const barcode =
            cleanString(
              row['Barcode']
            ) || null;

          const countryOfOrigin =
            cleanString(
              row['Country of Origin']
            ) || null;

          const prescriptionRequired =
            ['true', 'yes', '1'].includes(
              cleanString(
                row[
                  'Prescription Required'
                ]
              ).toLowerCase()
            );

          const image =
            cleanString(
              row['Image']
            ) || null;

          const description =
            cleanString(
              row['Description']
            ) || null;

          const result =
            await prisma.$transaction(
              async (tx) => {
                let product =
                  await tx.product.findUnique(
                    {
                      where: {
                        sku,
                      },
                    }
                  );

                if (!product) {
                  product =
                    await tx.product.create(
                      {
                        data: {
                          name:
                            productName,
                          company,
                          composition,
                          category,
                          medicineType:
                            medicineType ||
                            null,
                          productType:
                            productType ||
                            null,
                          pack,
                          countryOfOrigin,
                          sku,
                          barcode,
                          prescriptionRequired,
                          image,
                          description,

                          // Legacy compatibility
                          mrp,
                          net: Math.max(
                            0,
                            mrp - discount
                          ),
                          scheme: null,
                          expiry:
                            expiryDate,
                          stock:
                            quantity +
                            freeQuantity,
                          isActive: true,
                        },
                      }
                    );

                  createdProducts++;
                } else {
                  product =
                    await tx.product.update(
                      {
                        where: {
                          id: product.id,
                        },
                        data: {
                          name:
                            productName,
                          company,
                          composition,
                          category,
                          medicineType:
                            medicineType ||
                            null,
                          productType:
                            productType ||
                            null,
                          pack,
                          countryOfOrigin,
                          barcode,
                          prescriptionRequired,
                          image,
                          description,
                          isActive: true,
                        },
                      }
                    );

                  updatedProducts++;
                }

                const existingBatch =
                  await tx.inventoryBatch.findUnique(
                    {
                      where: {
                        productId_batchNumber:
                          {
                            productId:
                              product.id,
                            batchNumber,
                          },
                      },
                    }
                  );

                const batch =
                  await tx.inventoryBatch.upsert(
                    {
                      where: {
                        productId_batchNumber:
                          {
                            productId:
                              product.id,
                            batchNumber,
                          },
                      },

                      create: {
                        productId:
                          product.id,
                        batchNumber,
                        quantity,
                        freeQuantity,
                        mrp,
                        ptr,
                        discount,
                        gst,
                        expiryDate,
                      },

                      update: {
                        quantity,
                        freeQuantity,
                        mrp,
                        ptr,
                        discount,
                        gst,
                        expiryDate,
                      },
                    }
                  );

                if (existingBatch) {
                  updatedBatches++;
                } else {
                  createdBatches++;
                }

                const allBatches =
                  await tx.inventoryBatch.findMany(
                    {
                      where: {
                        productId:
                          product.id,
                      },
                      orderBy: {
                        expiryDate:
                          'asc',
                      },
                    }
                  );

                const totalStock =
                  allBatches.reduce(
                    (
                      sum,
                      item
                    ) =>
                      sum +
                      Number(
                        item.quantity
                      ) +
                      Number(
                        item.freeQuantity
                      ),
                    0
                  );

                const primaryBatch =
                  allBatches[0];

                await tx.product.update({
                  where: {
                    id: product.id,
                  },
                  data: {
                    stock:
                      totalStock,
                    mrp:
                      primaryBatch
                        ? primaryBatch.mrp
                        : mrp,
                    net: primaryBatch
                      ? Math.max(
                          0,
                          Number(
                            primaryBatch.mrp
                          ) -
                            Number(
                              primaryBatch.discount
                            )
                        )
                      : Math.max(
                          0,
                          mrp - discount
                        ),
                    expiry:
                      primaryBatch
                        ? primaryBatch.expiryDate
                        : expiryDate,
                  },
                });

                return batch;
              }
            );

          void result;
        } catch (error) {
          errors.push({
            row: index + 2,
            sku:
              row['SKU'] || '',
            batchNumber:
              row['Batch Number'] || '',
            error:
              error?.message ||
              'Import failed',
          });
        }
      }

      await prisma.productImport.create({
        data: {
          fileName:
            req.file.originalname ||
            'inventory-import.csv',
          created:
            createdProducts +
            createdBatches,
          updated:
            updatedProducts +
            updatedBatches,
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

    if (error?.code === 'P2002') {
      return res.status(409).json({
        error:
          'A record with the same unique value already exists.',
      });
    }

    res.status(500).json({
      error:
        error?.message ||
        'Unexpected server error.',
    });
  }
);

app.listen(port, '0.0.0.0', () => {
  console.log(
    `API listening on port ${port}`
  );
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

