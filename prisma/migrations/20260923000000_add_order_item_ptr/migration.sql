-- Add historical PTR snapshot to order items.
ALTER TABLE "OrderItem"
ADD COLUMN "ptr" DECIMAL(10,2);

-- Backfill existing order items from their products.
UPDATE "OrderItem" oi
SET "ptr" = p."ptr"
FROM "Product" p
WHERE oi."productId" = p."id"
  AND oi."ptr" IS NULL;