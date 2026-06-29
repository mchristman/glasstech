import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { buildToolingQuestionnaireEmail } from '../../lib/formEmail';
import { sendEmail } from '../../lib/sendEmail';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const apiKey = (env as any).RESEND_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Email service is not configured.' }), { status: 500 });
  }

  const formData = await request.formData();
  const email = buildToolingQuestionnaireEmail(formData);
  if (!email.ok) {
    return new Response(JSON.stringify({ error: email.error }), { status: 400 });
  }

  try {
    await sendEmail({
      apiKey,
      fromAddress: (env as any).FROM_EMAIL,
      ...email.email,
    });
  } catch (error) {
    console.error('Failed to send tooling questionnaire email', error);
    return new Response(JSON.stringify({ error: 'Failed to send message.' }), { status: 502 });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
