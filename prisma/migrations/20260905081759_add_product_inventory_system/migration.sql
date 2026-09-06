/*
  Warnings:

  - A unique constraint covering the columns `[sku]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[barcode]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sku` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- AlterTable
ALTER TABLE "Product"
ADD COLUMN "barcode" TEXT,
ADD COLUMN "countryOfOrigin" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "image" TEXT,
ADD COLUMN "medicineType" TEXT,
ADD COLUMN "prescriptionRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "productType" TEXT,
ADD COLUMN "sku" TEXT;

-- Generate temporary unique SKUs for existing products
UPDATE "Product"
SET "sku" = 'LEGACY-' || "id"
WHERE "sku" IS NULL;

-- Make SKU required after existing rows have been populated
ALTER TABLE "Product"
ALTER COLUMN "sku" SET NOT NULL;

-- CreateTable
CREATE TABLE "InventoryBatch" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "freeQuantity" INTEGER NOT NULL DEFAULT 0,
    "mrp" DECIMAL(10,2) NOT NULL,
    "ptr" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "gst" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InventoryBatch_productId_idx" ON "InventoryBatch"("productId");

-- CreateIndex
CREATE INDEX "InventoryBatch_expiryDate_idx" ON "InventoryBatch"("expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryBatch_productId_batchNumber_key" ON "InventoryBatch"("productId", "batchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Product_barcode_key" ON "Product"("barcode");

-- CreateIndex
CREATE INDEX "Product_composition_idx" ON "Product"("composition");

-- CreateIndex
CREATE INDEX "Product_company_idx" ON "Product"("company");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- AddForeignKey
ALTER TABLE "InventoryBatch" ADD CONSTRAINT "InventoryBatch_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
