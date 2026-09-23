ALTER TABLE "OrderItem"
ADD COLUMN IF NOT EXISTS "ptr" DECIMAL(10,2);

UPDATE "OrderItem" oi
SET "ptr" = p."ptr"
FROM "Product" p
WHERE oi."productId" = p."id"
  AND oi."ptr" IS NULL;