import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const workflow = readFileSync(path.join(rootDir, '.github', 'workflows', 'claude.yml'), 'utf-8');

function extractIndentedBlock(source, headerPattern) {
  const lines = source.split('\n');
  const headerIndex = lines.findIndex((line) => headerPattern.test(line));
  assert.notEqual(headerIndex, -1, `Missing workflow block matching ${headerPattern}`);

  const headerIndent = lines[headerIndex].match(/^\s*/)[0].length;
  const block = [];

  for (const line of lines.slice(headerIndex + 1)) {
    if (!line.trim()) {
      block.push(line);
      continue;
    }

    const indent = line.match(/^\s*/)[0].length;
    if (indent <= headerIndent) break;
    block.push(line);
  }

  return block.join('\n');
}

function parseScalarMap(block) {
  return Object.fromEntries(
    block
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const match = line.match(/^([a-z-]+):\s*([^#]+?)\s*$/i);
        assert.ok(match, `Expected scalar YAML mapping line, got: ${line}`);
        return [match[1], match[2]];
      }),
  );
}

test('Claude workflow only grants the minimum permissions needed by the automation', () => {
  const permissions = parseScalarMap(extractIndentedBlock(workflow, /^\s{4}permissions:\s*$/));

  assert.deepEqual(permissions, {
    contents: 'read',
    'pull-requests': 'read',
    issues: 'read',
    'id-token': 'write',
  });

  const writeScopes = Object.entries(permissions)
    .filter(([, access]) => access === 'write')
    .map(([scope]) => scope);

  assert.deepEqual(writeScopes, ['id-token']);
});

test('Claude workflow requires an explicit @claude mention before running', () => {
  const jobIf = extractIndentedBlock(workflow, /^\s{4}if:\s*\|\s*$/);

  assert.match(jobIf, /github\.event_name == 'issue_comment' && contains\(github\.event\.comment\.body, '@claude'\)/);
  assert.match(
    jobIf,
    /github\.event_name == 'pull_request_review_comment' && contains\(github\.event\.comment\.body, '@claude'\)/,
  );
  assert.match(jobIf, /github\.event_name == 'pull_request_review' && contains\(github\.event\.review\.body, '@claude'\)/);
  assert.match(jobIf, /github\.event_name == 'issues' && contains\(github\.event\.issue\.body, '@claude'\)/);

  assert.doesNotMatch(jobIf, /\|\|\s*true\b/);
});
