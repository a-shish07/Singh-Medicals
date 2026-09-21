import assert from 'node:assert/strict';
import test from 'node:test';
import { createRazorpayClient } from '../server/razorpay-client.mjs';

test('mocked Razorpay order request authenticates and returns provider session', async () => {
  let request;
  const client = createRazorpayClient({
    keyId: 'rzp_test_key', keySecret: 'secret',
    fetchImpl: async (url, options) => {
      request = { url, options };
      return new Response(JSON.stringify({ id: 'order_test_1', amount: 12345, currency: 'INR' }), { status: 200 });
    },
  });
  const order = await client('/orders', { method: 'POST', body: JSON.stringify({ amount: 12345, currency: 'INR' }) });
  assert.equal(order.id, 'order_test_1');
  assert.equal(request.url, 'https://api.razorpay.com/v1/orders');
  assert.equal(request.options.headers.Authorization, `Basic ${Buffer.from('rzp_test_key:secret').toString('base64')}`);
  assert.equal(JSON.parse(request.options.body).amount, 12345);
});

test('mocked Razorpay provider failure is safe and distinguishable', async () => {
  const client = createRazorpayClient({
    keyId: 'rzp_test_key', keySecret: 'secret',
    fetchImpl: async () => new Response(JSON.stringify({ error: { code: 'BAD_REQUEST_ERROR' } }), { status: 400 }),
  });
  await assert.rejects(client('/payments/pay_1/refund', { method: 'POST' }), (error) => error.statusCode === 502 && error.providerCode === 'BAD_REQUEST_ERROR');
});

test('Razorpay client does not start without server credentials', () => {
  assert.throws(() => createRazorpayClient({ keyId: '', keySecret: 'secret' }), { statusCode: 503 });
});
