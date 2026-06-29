import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildContactEmail, buildToolingQuestionnaireEmail } from '../src/lib/formEmail.ts';

function makeFormData(fields) {
  const formData = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    formData.set(name, value);
  }
  return formData;
}

function assertEmailResult(result) {
  assert.equal(result.ok, true);
  return result.email;
}

test('buildContactEmail trims fields and builds the Resend payload', () => {
  const email = assertEmailResult(
    buildContactEmail(
      makeFormData({
        name: '  Ada Lovelace  ',
        company: '  Analytical Engines Inc. ',
        country: ' USA ',
        product: ' Automotive ',
        email: ' ada@example.com ',
        phone: ' +1 555 0100 ',
        message: '  Please contact me about bending systems.  ',
      }),
    ),
  );

  assert.equal(email.to, 'michael.d.christman@gmail.com');
  assert.equal(email.subject, 'Glasstech Website Inquiry from Ada Lovelace');
  assert.equal(email.replyTo, 'ada@example.com');
  assert.match(email.text, /Name: Ada Lovelace/);
  assert.match(email.text, /Company: Analytical Engines Inc\./);
  assert.match(email.text, /Product Line: Automotive/);
  assert.match(email.text, /Message:\nPlease contact me about bending systems\./);
});

test('buildContactEmail rejects whitespace-only required fields', () => {
  assert.deepEqual(
    buildContactEmail(
      makeFormData({
        name: 'Ada Lovelace',
        company: 'Analytical Engines Inc.',
        country: 'USA',
        email: '   ',
        phone: '+1 555 0100',
      }),
    ),
    { ok: false, error: 'Missing required fields.' },
  );
});

test('buildToolingQuestionnaireEmail builds required and optional questionnaire sections', () => {
  const email = assertEmailResult(
    buildToolingQuestionnaireEmail(
      makeFormData({
        contact: '  Grace Hopper ',
        partName: ' Windshield ',
        modelName: ' GT-42 ',
        customer: ' Example Auto ',
        phone: ' +1 555 0111 ',
        fax: ' +1 555 0112 ',
        email: ' grace@example.com ',
        location: ' Toledo, OH ',
        furnaceNumber: ' F-100 ',
        surfaceProbes: ' 4 probes on corners ',
        glassThickness: ' 4.0 mm ',
        standoffPins: ' Pins at A1 and B2 ',
        mathFormat: ' IGES ',
        surfaceType: ' Outside surface of the glass ',
        mathNotes: ' Include heater data ',
      }),
    ),
  );

  assert.equal(email.to, 'michael.d.christman@gmail.com');
  assert.equal(email.subject, 'Glasstech Tooling Questionnaire from Grace Hopper');
  assert.equal(email.replyTo, 'grace@example.com');
  assert.match(email.text, /Part Name: Windshield/);
  assert.match(email.text, /Fax Number: \+1 555 0112/);
  assert.match(email.text, /Quantity & Location of All Surface Probes: 4 probes on corners/);
  assert.match(email.text, /Glass Thickness: 4\.0 mm/);
  assert.match(email.text, /III\. CUSTOMER GLASS CHECKING FIXTURES\n-+\nPins at A1 and B2/);
  assert.match(email.text, /Required Math Data Format: IGES/);
  assert.match(email.text, /Data Represents: Outside surface of the glass/);
  assert.match(email.text, /Notes:\nInclude heater data/);
  assert.doesNotMatch(email.text, /Tolerance on All Surface Probes:/);
});

test('buildToolingQuestionnaireEmail rejects missing required fields', () => {
  assert.deepEqual(
    buildToolingQuestionnaireEmail(
      makeFormData({
        contact: 'Grace Hopper',
        partName: 'Windshield',
        modelName: 'GT-42',
        customer: 'Example Auto',
        phone: '+1 555 0111',
        email: 'grace@example.com',
        location: 'Toledo, OH',
        furnaceNumber: ' ',
      }),
    ),
    { ok: false, error: 'Missing required fields.' },
  );
});
