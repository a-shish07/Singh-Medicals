import crypto from 'crypto';

export const PAYMENT_TERMINAL_STATUSES = new Set(['CAPTURED', 'REFUNDED', 'CANCELLED', 'EXPIRED']);

export function validIdempotencyKey(value) {
  return /^[A-Za-z0-9_-]{16,128}$/.test(String(value || ''));
}

export function timingSafeHexEqual(expected, received) {
  const a = Buffer.from(String(expected || ''), 'hex');
  const b = Buffer.from(String(received || ''), 'hex');
  return a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b);
}

export function validRazorpaySignature(secret, orderId, paymentId, signature) {
  const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  return timingSafeHexEqual(expected, signature);
}

export function refundPaymentState(amountPaise, refunds) {
  const refundedPaise = refunds
    .filter((refund) => refund.status === 'PROCESSED')
    .reduce((sum, refund) => sum + Number(refund.amountPaise || 0), 0);
  if (refundedPaise > amountPaise) throw new Error('Recorded refunds exceed payment amount.');
  return {
    refundedPaise,
    status: refundedPaise >= amountPaise ? 'REFUNDED' : refundedPaise > 0 ? 'PARTIALLY_REFUNDED' : 'CAPTURED',
  };
}

export function canCancelCapturedPayment(payment) {
  return payment.status !== 'CAPTURED' || Number(payment.refundedPaise || 0) >= Number(payment.amountPaise || 0);
}
