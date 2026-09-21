export function createRazorpayClient({ keyId, keySecret, fetchImpl = fetch, baseUrl = 'https://api.razorpay.com/v1' }) {
  if (!keyId || !keySecret) throw Object.assign(new Error('Online payments are temporarily unavailable.'), { statusCode: 503 });
  return async function request(path, options = {}) {
    const response = await fetchImpl(`${baseUrl}${path}`, {
      ...options,
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = Object.assign(new Error('Payment provider could not process the request.'), { statusCode: 502, providerCode: payload?.error?.code });
      throw error;
    }
    return payload;
  };
}
