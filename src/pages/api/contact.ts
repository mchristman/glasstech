import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { sendEmail } from '../../lib/sendEmail';

export const prerender = false;

const CONTACT_EMAIL = 'michael.d.christman@gmail.com';

function getField(formData: FormData, name: string): string {
  return String(formData.get(name) ?? '').trim();
}

export const POST: APIRoute = async ({ request }) => {
  const apiKey = (env as any).RESEND_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Email service is not configured.' }), { status: 500 });
  }

  const formData = await request.formData();
  const name = getField(formData, 'name');
  const company = getField(formData, 'company');
  const country = getField(formData, 'country');
  const product = getField(formData, 'product');
  const email = getField(formData, 'email');
  const phone = getField(formData, 'phone');
  const message = getField(formData, 'message');

  if (!name || !company || !country || !email || !phone) {
    return new Response(JSON.stringify({ error: 'Missing required fields.' }), { status: 400 });
  }

  const lines = [
    'Glasstech Website Contact Form',
    '==============================',
    '',
    `Name: ${name}`,
    `Company: ${company}`,
    `Country: ${country}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
  ];

  if (product) {
    lines.push(`Product Line: ${product}`);
  }

  if (message) {
    lines.push('', 'Message:', message);
  }

  try {
    await sendEmail({
      apiKey,
      fromAddress: (env as any).FROM_EMAIL,
      to: CONTACT_EMAIL,
      subject: `Glasstech Website Inquiry from ${name}`,
      text: lines.join('\n'),
      replyTo: email,
    });
  } catch (error) {
    console.error('Failed to send contact form email', error);
    return new Response(JSON.stringify({ error: 'Failed to send message.' }), { status: 502 });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
