import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildContactEmailPayload,
  buildToolingQuestionnaireEmailPayload,
} from '../src/lib/formEmail.ts';

const FORM_EMAIL = 'michael.d.christman@gmail.com';

function formData(fields) {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    data.append(name, value);
  }
  return data;
}

test('contact email payload trims required fields and includes optional context', () => {
  const result = buildContactEmailPayload(
    formData({
      name: '  Jane Buyer  ',
      company: '  Acme Glass  ',
      country: '  USA  ',
      product: '  Automotive  ',
      email: '  jane@example.com  ',
      phone: '  +1 555 0100  ',
      message: '  Please send pricing.  ',
    }),
  );

  assert.equal(result.ok, true);
  assert.deepEqual(
    {
      to: result.payload.to,
      subject: result.payload.subject,
      replyTo: result.payload.replyTo,
    },
    {
      to: FORM_EMAIL,
      subject: 'Glasstech Website Inquiry from Jane Buyer',
      replyTo: 'jane@example.com',
    },
  );
  assert.match(result.payload.text, /Name: Jane Buyer/);
  assert.match(result.payload.text, /Company: Acme Glass/);
  assert.match(result.payload.text, /Product Line: Automotive/);
  assert.match(result.payload.text, /Message:\nPlease send pricing\./);
  assert.doesNotMatch(result.payload.text, /  Jane Buyer  /);
});

test('contact email payload rejects whitespace-only required values', () => {
  const result = buildContactEmailPayload(
    formData({
      name: 'Dana',
      company: 'Glass Co',
      country: 'Canada',
      email: '  ',
      phone: '+1 555 0101',
    }),
  );

  assert.deepEqual(result, { ok: false });
});

test('tooling questionnaire payload includes populated optional sections', () => {
  const result = buildToolingQuestionnaireEmailPayload(
    formData({
      contact: '  Sam Tooling  ',
      partName: '  Quarter Glass  ',
      modelName: '  QG-2026  ',
      customer: '  Auto Maker  ',
      phone: '  +1 555 0102  ',
      fax: '  +1 555 0103  ',
      email: '  sam@example.com  ',
      location: '  Toledo, OH  ',
      furnaceNumber: '  F-42  ',
      glassThickness: '  4.8 mm  ',
      glassColor: '  Solar green  ',
      surfaceProbes: '  6 probes on A surface  ',
      standoffPins: '  Use customer fixture drawing  ',
      mathFormat: '  IGES  ',
      surfaceType: '  Exterior surface  ',
      mathNotes: '  Align to datum A  ',
    }),
  );

  assert.equal(result.ok, true);
  assert.equal(result.payload.to, FORM_EMAIL);
  assert.equal(result.payload.subject, 'Glasstech Tooling Questionnaire from Sam Tooling');
  assert.equal(result.payload.replyTo, 'sam@example.com');
  assert.match(result.payload.text, /Part Name: Quarter Glass/);
  assert.match(result.payload.text, /Fax Number: \+1 555 0103/);
  assert.match(result.payload.text, /Glass Thickness: 4\.8 mm/);
  assert.match(result.payload.text, /Glass Color: Solar green/);
  assert.match(result.payload.text, /III\. CUSTOMER GLASS CHECKING FIXTURES/);
  assert.match(result.payload.text, /Use customer fixture drawing/);
  assert.match(result.payload.text, /IV\. MATH DATA REQUIREMENTS/);
  assert.match(result.payload.text, /Required Math Data Format: IGES/);
  assert.match(result.payload.text, /Data Represents: Exterior surface/);
  assert.match(result.payload.text, /Notes:\nAlign to datum A/);
  assert.doesNotMatch(result.payload.text, /  Sam Tooling  /);
});

test('tooling questionnaire payload omits blank optional values', () => {
  const result = buildToolingQuestionnaireEmailPayload(
    formData({
      contact: 'Sam Tooling',
      partName: 'Quarter Glass',
      modelName: 'QG-2026',
      customer: 'Auto Maker',
      phone: '+1 555 0102',
      fax: '   ',
      email: 'sam@example.com',
      location: 'Toledo, OH',
      furnaceNumber: 'F-42',
      surfaceProbes: '   ',
      mathFormat: '',
      surfaceType: '  ',
      mathNotes: '',
    }),
  );

  assert.equal(result.ok, true);
  assert.doesNotMatch(result.payload.text, /Fax Number:/);
  assert.doesNotMatch(result.payload.text, /Quantity & Location of All Surface Probes:/);
  assert.doesNotMatch(result.payload.text, /IV\. MATH DATA REQUIREMENTS/);
});

test('tooling questionnaire payload rejects missing required fields', () => {
  const result = buildToolingQuestionnaireEmailPayload(
    formData({
      contact: 'Sam Tooling',
      partName: 'Quarter Glass',
      modelName: 'QG-2026',
      customer: 'Auto Maker',
      phone: '+1 555 0102',
      email: 'sam@example.com',
      location: 'Toledo, OH',
      furnaceNumber: ' ',
    }),
  );

  assert.deepEqual(result, { ok: false });
});
