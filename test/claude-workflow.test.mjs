import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflow = readFileSync(path.join(rootDir, '.github/workflows/claude.yml'), 'utf-8');

const trustedAuthorCheck = 'contains(fromJSON(\'["OWNER","MEMBER","COLLABORATOR"]\')';

test('Claude workflow only runs secret-backed jobs for trusted authors', () => {
  assert.match(workflow, /secrets\.ANTHROPIC_API_KEY/);

  for (const eventName of ['issue_comment', 'pull_request_review_comment', 'pull_request_review', 'issues']) {
    const eventIndex = workflow.indexOf(`github.event_name == '${eventName}'`);
    assert.notEqual(eventIndex, -1, `missing Claude trigger for ${eventName}`);

    const nextEventIndex = workflow.indexOf("github.event_name == '", eventIndex + 1);
    const conditionBlock = workflow.slice(eventIndex, nextEventIndex === -1 ? undefined : nextEventIndex);

    assert.match(conditionBlock, /@claude/);
    assert.match(conditionBlock, /author_association/);
    assert.ok(
      conditionBlock.includes(trustedAuthorCheck),
      `${eventName} must gate @claude runs to trusted repository participants`,
    );
  }
});
