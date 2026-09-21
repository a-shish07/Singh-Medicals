import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import test from 'node:test';
import { canCancelCapturedPayment, refundPaymentState, timingSafeHexEqual, validIdempotencyKey, validRazorpaySignature } from '../server/payment-utils.mjs';

test('checkout idempotency keys have a strict, stable contract', () => {
  assert.equal(validIdempotencyKey('1234567890abcdef'), true);
  assert.equal(validIdempotencyKey('checkout_1234567890'), true);
  assert.equal(validIdempotencyKey('too-short'), false);
  assert.equal(validIdempotencyKey('has spaces 123456'), false);
});

test('Razorpay callback signatures require exact HMAC bytes', () => {
  const secret = 'test-secret';
  const signature = crypto.createHmac('sha256', secret).update('order_1|pay_1').digest('hex');
  assert.equal(validRazorpaySignature(secret, 'order_1', 'pay_1', signature), true);
  assert.equal(validRazorpaySignature(secret, 'order_1', 'pay_2', signature), false);
  assert.equal(timingSafeHexEqual(signature, 'bad'), false);
});

test('partial refunds remain auditable and cannot exceed a payment', () => {
  assert.deepEqual(refundPaymentState(10_000, [{ amountPaise: 2500, status: 'PROCESSED' }, { amountPaise: 1000, status: 'PENDING' }]), { refundedPaise: 2500, status: 'PARTIALLY_REFUNDED' });
  assert.deepEqual(refundPaymentState(10_000, [{ amountPaise: 4000, status: 'PROCESSED' }, { amountPaise: 6000, status: 'PROCESSED' }]), { refundedPaise: 10_000, status: 'REFUNDED' });
  assert.throws(() => refundPaymentState(100, [{ amountPaise: 101, status: 'PROCESSED' }]));
});

test('captured payments block cancellation until fully refunded', () => {
  assert.equal(canCancelCapturedPayment({ status: 'CAPTURED', amountPaise: 100, refundedPaise: 99 }), false);
  assert.equal(canCancelCapturedPayment({ status: 'CAPTURED', amountPaise: 100, refundedPaise: 100 }), true);
  assert.equal(canCancelCapturedPayment({ status: 'PENDING', amountPaise: 100, refundedPaise: 0 }), true);
});
