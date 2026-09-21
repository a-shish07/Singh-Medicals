# Singh Medicals

## Payments

Razorpay checkout uses server-calculated paise amounts, signed callback verification, raw-body webhook verification, replay protection, and persistent browser checkout idempotency keys. Payment attempts are kept separately from business orders.

Unpaid Razorpay orders are reconciled with Razorpay before expiry. The worker then expires the order and restores stock exactly once. Configure it with:

```env
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
PAYMENT_EXPIRY_MINUTES=30
PAYMENT_RECONCILIATION_INTERVAL_MS=300000
```

Point the Razorpay webhook at `https://<api-domain>/api/payments/razorpay/webhook`.

On a long-running backend, reconciliation runs at `PAYMENT_RECONCILIATION_INTERVAL_MS`. On serverless hosting, schedule an authenticated `POST` to `/api/internal/payments/reconcile` with `Authorization: Bearer $PAYMENT_RECONCILIATION_SECRET`.

Captured payments can be refunded from the admin order panel. Every refund has its own idempotency key and ledger record, so partial refunds are supported. A captured order cannot be cancelled or restore stock until its full refund is confirmed by Razorpay.

## Database and verification

```bash
npx prisma migrate deploy
npm run prisma:generate
npm test
npm run typecheck
npm run build
```

`npm test` uses mocked Razorpay HTTP responses and verifies callback signatures, idempotency-key validation, refund accounting, cancellation guards, and provider failures. Use Razorpay test mode plus a disposable PostgreSQL database for end-to-end deployment checks.
