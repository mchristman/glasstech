import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const handlers = [
  {
    name: 'contact',
    file: 'src/pages/api/contact.ts',
    expectedRecipient: "const CONTACT_EMAIL = 'sales@glasstech.com';",
  },
  {
    name: 'tooling questionnaire',
    file: 'src/pages/api/tooling-questionnaire.ts',
    expectedRecipient: "const TOOLING_EMAIL = 'tooling@glasstech.com';",
  },
];

for (const { name, file, expectedRecipient } of handlers) {
  test(`${name} submissions route to Glasstech-owned recipients`, () => {
    const source = readFileSync(path.join(rootDir, file), 'utf-8');

    assert.match(source, new RegExp(expectedRecipient.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.doesNotMatch(
      source,
      /michael\.d\.christman@gmail\.com|@gmail\.com/,
      'Form submissions must not be hardcoded to personal or test inboxes.',
    );
  });
}
