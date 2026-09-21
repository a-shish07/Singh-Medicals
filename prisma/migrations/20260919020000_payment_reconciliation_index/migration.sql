-- The expiry worker scans only non-terminal payment attempts by status and age.
CREATE INDEX "Payment_status_createdAt_idx" ON "Payment"("status", "createdAt");
