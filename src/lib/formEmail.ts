export interface FormEmailPayload {
  to: string;
  subject: string;
  text: string;
  replyTo: string;
}

type FormEmailResult = { ok: true; payload: FormEmailPayload } | { ok: false };

const CONTACT_EMAIL = 'michael.d.christman@gmail.com';
const TOOLING_EMAIL = 'michael.d.christman@gmail.com';

function getField(formData: FormData, name: string): string {
  return String(formData.get(name) ?? '').trim();
}

export function buildContactEmailPayload(formData: FormData): FormEmailResult {
  const name = getField(formData, 'name');
  const company = getField(formData, 'company');
  const country = getField(formData, 'country');
  const product = getField(formData, 'product');
  const email = getField(formData, 'email');
  const phone = getField(formData, 'phone');
  const message = getField(formData, 'message');

  if (!name || !company || !country || !email || !phone) {
    return { ok: false };
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

  return {
    ok: true,
    payload: {
      to: CONTACT_EMAIL,
      subject: `Glasstech Website Inquiry from ${name}`,
      text: lines.join('\n'),
      replyTo: email,
    },
  };
}

export function buildToolingQuestionnaireEmailPayload(formData: FormData): FormEmailResult {
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
    return { ok: false };
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

  return {
    ok: true,
    payload: {
      to: TOOLING_EMAIL,
      subject: `Glasstech Tooling Questionnaire from ${contact}`,
      text: lines.join('\n'),
      replyTo: email,
    },
  };
}
