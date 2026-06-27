import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildContactFormEmail,
  buildToolingQuestionnaireEmail,
  CONTACT_FORM_RECIPIENT,
  TOOLING_QUESTIONNAIRE_RECIPIENT,
} from '../src/lib/formEmails.ts';

const TEST_RECIPIENT = 'michael.d.christman@gmail.com';

function makeFormData(fields) {
  const formData = new FormData();

  for (const [name, value] of Object.entries(fields)) {
    formData.set(name, value);
  }

  return formData;
}

test('contact form email validates required fields and sends to test recipient', () => {
  assert.equal(CONTACT_FORM_RECIPIENT, TEST_RECIPIENT);
  assert.equal(
    buildContactFormEmail(makeFormData({ name: 'Jane Buyer', company: 'Glass Co', country: 'USA', email: 'jane@example.com' })),
    null,
  );

  const email = buildContactFormEmail(
    makeFormData({
      name: '  Jane Buyer  ',
      company: '  Glass Co  ',
      country: ' USA ',
      product: ' Automotive ',
      email: ' jane@example.com ',
      phone: ' +1 555 0100 ',
      message: ' Please contact me about a system. ',
    }),
  );

  assert.ok(email);
  assert.equal(email.to, TEST_RECIPIENT);
  assert.equal(email.subject, 'Glasstech Website Inquiry from Jane Buyer');
  assert.equal(email.replyTo, 'jane@example.com');
  assert.match(email.text, /^Glasstech Website Contact Form/);
  assert.match(email.text, /Company: Glass Co/);
  assert.match(email.text, /Product Line: Automotive/);
  assert.match(email.text, /Message:\nPlease contact me about a system\./);
});

test('tooling questionnaire email validates required fields and includes optional sections only when supplied', () => {
  assert.equal(TOOLING_QUESTIONNAIRE_RECIPIENT, TEST_RECIPIENT);
  assert.equal(
    buildToolingQuestionnaireEmail(
      makeFormData({
        contact: 'Pat Engineer',
        partName: 'Windshield',
        modelName: 'WX-1',
        customer: 'Auto Glass',
        phone: '+1 555 0101',
        email: 'pat@example.com',
        location: 'Ohio',
      }),
    ),
    null,
  );

  const email = buildToolingQuestionnaireEmail(
    makeFormData({
      contact: '  Pat Engineer  ',
      partName: ' Windshield ',
      modelName: ' WX-1 ',
      customer: ' Auto Glass ',
      phone: ' +1 555 0101 ',
      fax: ' ',
      email: ' pat@example.com ',
      location: ' Ohio ',
      furnaceNumber: ' F-42 ',
      glassThickness: ' 4.0 mm ',
      fractureStandard: ' ECE R43 ',
      standoffPins: ' Pin A: 12 mm ',
      mathFormat: ' IGES ',
      surfaceType: ' Inside surface of the glass ',
      mathNotes: ' Include heater lines. ',
    }),
  );

  assert.ok(email);
  assert.equal(email.to, TEST_RECIPIENT);
  assert.equal(email.subject, 'Glasstech Tooling Questionnaire from Pat Engineer');
  assert.equal(email.replyTo, 'pat@example.com');
  assert.match(email.text, /^Glasstech Tool Design Questionnaire/);
  assert.match(email.text, /Furnace Number: F-42/);
  assert.match(email.text, /Glass Thickness: 4\.0 mm/);
  assert.match(email.text, /Fracture Standard: ECE R43/);
  assert.match(email.text, /III\. CUSTOMER GLASS CHECKING FIXTURES/);
  assert.match(email.text, /IV\. MATH DATA REQUIREMENTS/);
  assert.match(email.text, /Required Math Data Format: IGES/);
  assert.doesNotMatch(email.text, /Fax Number:/);
});
