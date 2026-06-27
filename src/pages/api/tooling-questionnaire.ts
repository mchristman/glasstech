import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { sendEmail } from '../../lib/sendEmail';

export const prerender = false;

const TOOLING_EMAIL = 'michael.d.christman@gmail.com';

function getField(formData: FormData, name: string): string {
  return String(formData.get(name) ?? '').trim();
}

export const POST: APIRoute = async ({ request }) => {
  const apiKey = (env as any).RESEND_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Email service is not configured.' }), { status: 500 });
  }

  const formData = await request.formData();
  const contact = getField(formData, 'contact');
  const partName = getField(formData, 'partName');
  const modelName = getField(formData, 'modelName');
  const customer = getField(formData, 'customer');
  const phone = getField(formData, 'phone');
  const fax = getField(formData, 'fax');
  const email = getField(formData, 'email');
  const location = getField(formData, 'location');
  const furnaceNumber = getField(formData, 'furnaceNumber');

  if (!contact || !partName || !modelName || !customer || !phone || !email || !location || !furnaceNumber) {
    return new Response(JSON.stringify({ error: 'Missing required fields.' }), { status: 400 });
  }

  const lines = [
    'Glasstech Tool Design Questionnaire',
    '===================================',
    '',
    'I. GENERAL INFORMATION',
    '----------------------',
    `Part Name: ${partName}`,
    `Model Name: ${modelName}`,
    `Glasstech Customer: ${customer}`,
    `Contact: ${contact}`,
    `Phone Number: ${phone}`,
  ];

  if (fax) lines.push(`Fax Number: ${fax}`);

  lines.push(
    `Email: ${email}`,
    `Customer Location: ${location}`,
    `Furnace Number: ${furnaceNumber}`,
    '',
    'II. PART SPECIFICATIONS',
    '----------------------',
  );

  const specFields: [string, string][] = [
    ['Quantity & Location of All Surface Probes', getField(formData, 'surfaceProbes')],
    ['Tolerance on All Surface Probes', getField(formData, 'probeTolerance')],
    ['Glass Thickness', getField(formData, 'glassThickness')],
    ['Glass Color', getField(formData, 'glassColor')],
    ['Hole Diameter', getField(formData, 'holeDiameter')],
    ['Installation Angle From the Horizontal', getField(formData, 'installationAngle')],
    ['Perimeter Off Form Tolerance', getField(formData, 'perimeterTolerance')],
    ['Acceptable Marking From Edge of Glass', getField(formData, 'edgeMarking')],
    ['Perimeter Rate of Change', getField(formData, 'perimeterRate')],
    ['Crossbend and Tolerance (SAG)', getField(formData, 'crossbend')],
    ['Fracture Standard', getField(formData, 'fractureStandard')],
    ['Optical Requirements', getField(formData, 'opticalRequirements')],
    ['Number of Samples Required During Prove Out', getField(formData, 'proveOutSamples')],
  ];

  for (const [label, value] of specFields) {
    if (value) lines.push(`${label}: ${value}`);
  }

  const standoffPins = getField(formData, 'standoffPins');
  if (standoffPins) {
    lines.push('', 'III. CUSTOMER GLASS CHECKING FIXTURES', '-----------------------------------', standoffPins);
  }

  const mathFormat = getField(formData, 'mathFormat');
  const surfaceType = getField(formData, 'surfaceType');
  const mathNotes = getField(formData, 'mathNotes');

  if (mathFormat || surfaceType || mathNotes) {
    lines.push('', 'IV. MATH DATA REQUIREMENTS', '--------------------------');
    if (mathFormat) lines.push(`Required Math Data Format: ${mathFormat}`);
    if (surfaceType) lines.push(`Data Represents: ${surfaceType}`);
    if (mathNotes) lines.push('', 'Notes:', mathNotes);
  }

  try {
    await sendEmail({
      apiKey,
      fromAddress: (env as any).FROM_EMAIL,
      to: TOOLING_EMAIL,
      subject: `Glasstech Tooling Questionnaire from ${contact}`,
      text: lines.join('\n'),
      replyTo: email,
    });
  } catch (error) {
    console.error('Failed to send tooling questionnaire email', error);
    return new Response(JSON.stringify({ error: 'Failed to send message.' }), { status: 502 });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
