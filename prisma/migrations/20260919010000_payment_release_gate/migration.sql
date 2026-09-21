ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'EXPIRED';
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'PROCESSED', 'FAILED');
ALTER TABLE "Order" ADD COLUMN "idempotencyKey" TEXT;
CREATE UNIQUE INDEX "Order_userId_idempotencyKey_key" ON "Order"("userId", "idempotencyKey");
CREATE TABLE "Refund" (
  "id" TEXT NOT NULL, "orderId" TEXT NOT NULL, "paymentId" TEXT NOT NULL,
  "requestedById" TEXT NOT NULL, "razorpayRefundId" TEXT, "idempotencyKey" TEXT NOT NULL,
  "amountPaise" INTEGER NOT NULL, "currency" TEXT NOT NULL DEFAULT 'INR',
  "status" "RefundStatus" NOT NULL DEFAULT 'PENDING', "reason" TEXT,
  "providerFailure" TEXT, "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Refund_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Refund_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Refund_razorpayRefundId_key" ON "Refund"("razorpayRefundId");
CREATE UNIQUE INDEX "Refund_idempotencyKey_key" ON "Refund"("idempotencyKey");
CREATE INDEX "Refund_paymentId_createdAt_idx" ON "Refund"("paymentId", "createdAt");
CREATE INDEX "Refund_orderId_createdAt_idx" ON "Refund"("orderId", "createdAt");
