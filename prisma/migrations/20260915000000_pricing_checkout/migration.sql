ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "gstTotal" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shippingTotal" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "grandTotal" DECIMAL(12,2) NOT NULL DEFAULT 0;

ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "paidQuantity" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "freeQuantity" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "totalQuantity" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "stripsPerBox" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "isFree" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "minOrderQuantity" INTEGER NOT NULL DEFAULT 1;

UPDATE "OrderItem"
SET "paidQuantity" = "quantity", "totalQuantity" = "quantity"
WHERE "paidQuantity" = 0 AND "totalQuantity" = 0;

-- Before this migration stock was entered as boxes. Inventory is now stored
-- internally in strips so scheme stock can be deducted exactly. The number
-- after x/× is strips per box; a single numeric pack is strips per box.
UPDATE "Product"
SET "stock" = "stock" * CASE
  WHEN "pack" ~* '[x×][[:space:]]*[0-9]+' THEN regexp_replace("pack", '.*[x×][[:space:]]*([0-9]+).*', '\1')::integer
  WHEN "pack" ~ '^[[:space:]]*[0-9]+[[:space:]]*$' THEN trim("pack")::integer
  ELSE 1
END;
