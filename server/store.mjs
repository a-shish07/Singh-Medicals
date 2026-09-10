import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createJiti } from "jiti";

const ROOT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

const DB_PATH = path.join(
  ROOT_DIR,
  "server",
  "db.json"
);

const JITI = createJiti(import.meta.url);

const VALID_STATUSES = new Set([
  "Submitted",
  "Confirmed",
  "Packed",
  "Dispatched",
  "Delivered",
  "Cancelled",
]);

async function loadSeed() {
  const mod = await JITI.import(
    path.join(ROOT_DIR, "src", "data.ts")
  );

  return {
    products: structuredClone(mod.PRODUCTS),
    orders: structuredClone(mod.MOCK_ORDERS),
  };
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeOrder(order, index = 0) {
  const createdAt =
    order.createdAt ||
    `${order.date}T09:00:00.000Z`;
  const updatedAt =
    order.updatedAt ||
    createdAt;
  const status =
    VALID_STATUSES.has(order.status)
      ? order.status
      : "Submitted";

  return {
    ...order,
    customerPhone:
      order.customerPhone ||
      order.retailerPhone,
    createdAt,
    updatedAt,
    status,
    statusHistory:
      Array.isArray(order.statusHistory) &&
      order.statusHistory.length > 0
        ? order.statusHistory
        : [
            {
              status,
              at: updatedAt,
              note: index === 0 ? "Seeded from demo data" : "Created",
            },
          ],
  };
}

function normalizeProduct(product) {
  return {
    ...product,
    mrp: Number(product.mrp) || 0,
    net: Number(product.net) || 0,
  };
}

async function createDefaultStore() {
  const seed = await loadSeed();

  return {
    products: seed.products.map(normalizeProduct),
    orders: seed.orders.map((order, index) =>
      normalizeOrder(order, index)
    ),
    users: [],
  };
}

export async function loadStore() {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(raw);

    return {
      products: Array.isArray(parsed.products)
        ? parsed.products.map(normalizeProduct)
        : [],
      orders: Array.isArray(parsed.orders)
        ? parsed.orders.map((order, index) =>
            normalizeOrder(order, index)
          )
        : [],
      users: Array.isArray(parsed.users)
        ? parsed.users
        : [],
    };
  } catch (error) {
    if ((error)?.code !== "ENOENT") {
      throw error;
    }

    const store = await createDefaultStore();
    await saveStore(store);
    return store;
  }
}

export async function saveStore(store) {
  const payload = JSON.stringify(
    store,
    null,
    2
  );
  const tempPath = `${DB_PATH}.tmp`;

  await fs.mkdir(path.dirname(DB_PATH), {
    recursive: true,
  });
  await fs.writeFile(tempPath, payload, "utf8");
  await fs.rename(tempPath, DB_PATH);
}

export function makeProductId(products) {
  const maxId = products.reduce((max, product) => {
    const match = /^p(\d+)$/i.exec(product.id);
    return match
      ? Math.max(max, Number(match[1]))
      : max;
  }, 0);

  return `p${maxId + 1}`;
}

export function makeOrderId(orders) {
  const year = new Date().getFullYear();
  const count = orders.filter((order) =>
    String(order.id).startsWith(`ORD-${year}-`)
  ).length;

  return `ORD-${year}-${String(count + 1).padStart(3, "0")}`;
}

export function appendStatusHistory(order, status, note) {
  const at = nowIso();
  return {
    ...order,
    status,
    updatedAt: at,
    statusHistory: [
      ...(Array.isArray(order.statusHistory)
        ? order.statusHistory
        : []),
      {
        status,
        at,
        note,
      },
    ],
  };
}

export function sanitizePhone(phone) {
  return String(phone || "").replace(/\D/g, "").slice(-10);
}
