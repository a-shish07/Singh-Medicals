import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "@prisma/client";
import { PRODUCTS } from "../src/data";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@singhmedicals.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 12) {
    throw new Error("Set an ADMIN_PASSWORD of at least 12 characters in .env before seeding.");
  }

  await prisma.user.upsert({
    where: { email },
    update: { role: Role.ADMIN, passwordHash: await bcrypt.hash(password, 12) },
    create: { name: "Singh Medical Admin", email, passwordHash: await bcrypt.hash(password, 12), role: Role.ADMIN },
  });

  for (const product of PRODUCTS) {
    const data = {
      name: product.name,
      company: product.company,
      composition: product.composition,
      category: product.category,
      pack: product.pack,
      mrp: product.mrp,
      net: product.net,
      scheme: product.scheme || null,
      expiry: new Date(`1 ${product.expiry}`),
      stock: 100,
      isActive: true,
    };
    await prisma.product.upsert({
      where: { name_company_pack: { name: data.name, company: data.company, pack: data.pack } },
      create: data,
      update: data,
    });
  }
  console.log(`Admin account and ${PRODUCTS.length} catalogue products are ready.`);
}

main().finally(() => prisma.$disconnect());
