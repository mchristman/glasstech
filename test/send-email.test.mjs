import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';

import { sendEmail } from '../src/lib/sendEmail.ts';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('sendEmail posts the expected Resend payload with defaults and reply-to', async () => {
  const calls = [];
  globalThis.fetch = async (...args) => {
    calls.push(args);
    return { ok: true };
  };

  await sendEmail({
    apiKey: 'test-api-key',
    to: 'sales@example.com',
    subject: 'Website inquiry',
    text: 'Name: Jane Customer',
    replyTo: 'jane@example.com',
  });

  assert.equal(calls.length, 1);

  const [url, options] = calls[0];
  assert.equal(url, 'https://api.resend.com/emails');
  assert.equal(options.method, 'POST');
  assert.deepEqual(options.headers, {
    Authorization: 'Bearer test-api-key',
    'Content-Type': 'application/json',
  });
  assert.deepEqual(JSON.parse(options.body), {
    from: 'Glasstech Website <onboarding@resend.dev>',
    to: ['sales@example.com'],
    subject: 'Website inquiry',
    text: 'Name: Jane Customer',
    reply_to: 'jane@example.com',
  });
});

test('sendEmail honors configured sender and omits empty reply-to', async () => {
  let requestBody;
  globalThis.fetch = async (_url, options) => {
    requestBody = JSON.parse(options.body);
    return { ok: true };
  };

  await sendEmail({
    apiKey: 'test-api-key',
    fromAddress: 'Glasstech Sales <sales@glasstech.com>',
    to: 'support@example.com',
    subject: 'Tooling questionnaire',
    text: 'Part Name: Windshield',
  });

  assert.deepEqual(requestBody, {
    from: 'Glasstech Sales <sales@glasstech.com>',
    to: ['support@example.com'],
    subject: 'Tooling questionnaire',
    text: 'Part Name: Windshield',
  });
  assert.equal('reply_to' in requestBody, false);
});

test('sendEmail includes Resend failure details in thrown error', async () => {
  globalThis.fetch = async () => ({
    ok: false,
    status: 422,
    text: async () => 'Invalid recipient',
  });

  await assert.rejects(
    sendEmail({
      apiKey: 'test-api-key',
      to: 'bad-recipient',
      subject: 'Broken request',
      text: 'message body',
    }),
    /Resend API error \(422\): Invalid recipient/,
  );
});
