export interface SendEmailOptions {
  apiKey: string;
  fromAddress?: string;
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}

const DEFAULT_FROM_ADDRESS = 'Glasstech Website <onboarding@resend.dev>';

export async function sendEmail({ apiKey, fromAddress, to, subject, text, replyTo }: SendEmailOptions): Promise<void> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress || DEFAULT_FROM_ADDRESS,
      to: [to],
      subject,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API error (${response.status}): ${body}`);
  }
}
