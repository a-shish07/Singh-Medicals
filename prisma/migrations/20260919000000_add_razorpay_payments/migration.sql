-- Separate payment state from order state. Existing COD orders remain valid.
ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'RAZORPAY';

CREATE TYPE "PaymentStatus" AS ENUM (
  'COD_PENDING', 'CREATED', 'PENDING', 'CAPTURED', 'FAILED', 'CANCELLED',
  'REFUND_PENDING', 'REFUNDED', 'PARTIALLY_REFUNDED'
);

CREATE TABLE "Payment" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'RAZORPAY',
  "status" "PaymentStatus" NOT NULL DEFAULT 'CREATED',
  "amountPaise" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "razorpayOrderId" TEXT,
  "razorpayPaymentId" TEXT,
  "razorpaySignature" TEXT,
  "failureCode" TEXT,
  "failureDescription" TEXT,
  "capturedAt" TIMESTAMP(3),
  "refundedPaise" INTEGER NOT NULL DEFAULT 0,
  "refundId" TEXT,
  "refundStatus" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Payment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Payment_razorpayOrderId_key" ON "Payment"("razorpayOrderId");
CREATE UNIQUE INDEX "Payment_razorpayPaymentId_key" ON "Payment"("razorpayPaymentId");
CREATE UNIQUE INDEX "Payment_refundId_key" ON "Payment"("refundId");
CREATE INDEX "Payment_orderId_createdAt_idx" ON "Payment"("orderId", "createdAt");
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

CREATE TABLE "PaymentWebhookEvent" (
  "id" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "event" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentWebhookEvent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PaymentWebhookEvent_providerId_key" ON "PaymentWebhookEvent"("providerId");
