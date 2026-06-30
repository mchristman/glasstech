import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { sendEmail } from '../src/lib/sendEmail.ts';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('sendEmail posts the expected Resend payload', async () => {
  const calls = [];
  globalThis.fetch = async (...args) => {
    calls.push(args);
    return new Response(null, { status: 200 });
  };

  await sendEmail({
    apiKey: 'test-api-key',
    fromAddress: 'Glasstech <forms@example.com>',
    to: 'sales@example.com',
    subject: 'Website inquiry',
    text: 'Message body',
    replyTo: 'customer@example.com',
  });

  assert.equal(calls.length, 1);
  const [url, init] = calls[0];
  assert.equal(url, 'https://api.resend.com/emails');
  assert.equal(init.method, 'POST');
  assert.deepEqual(init.headers, {
    Authorization: 'Bearer test-api-key',
    'Content-Type': 'application/json',
  });
  assert.deepEqual(JSON.parse(init.body), {
    from: 'Glasstech <forms@example.com>',
    to: ['sales@example.com'],
    subject: 'Website inquiry',
    text: 'Message body',
    reply_to: 'customer@example.com',
  });
});

test('sendEmail uses the default sender and omits blank reply-to', async () => {
  let payload;
  globalThis.fetch = async (_url, init) => {
    payload = JSON.parse(init.body);
    return new Response(null, { status: 200 });
  };

  await sendEmail({
    apiKey: 'test-api-key',
    to: 'sales@example.com',
    subject: 'Website inquiry',
    text: 'Message body',
    replyTo: '',
  });

  assert.deepEqual(payload, {
    from: 'Glasstech Website <onboarding@resend.dev>',
    to: ['sales@example.com'],
    subject: 'Website inquiry',
    text: 'Message body',
  });
});

test('sendEmail surfaces Resend errors with status and response body', async () => {
  globalThis.fetch = async () => new Response('invalid API key', { status: 401 });

  await assert.rejects(
    sendEmail({
      apiKey: 'bad-key',
      to: 'sales@example.com',
      subject: 'Website inquiry',
      text: 'Message body',
    }),
    /Resend API error \(401\): invalid API key/,
  );
});
