import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import test from 'node:test';

import { createMatrxNdjsonFramer } from '@ai-matrx/agents/stream/ndjson';

test('the mobile XHR kernel preserves JSON split across progress callbacks', () => {
  const malformed = [];
  const framer = createMatrxNdjsonFramer({
    onMalformedLine: (issue) => malformed.push(issue),
  });

  assert.deepEqual(framer.pushText('{"event":"chunk","data":{"te'), []);
  assert.deepEqual(
    framer.pushText('xt":"never lost"}}\n{"e":"r","t":"thinking"}\n'),
    [
      { event: 'chunk', data: { text: 'never lost' } },
      { event: 'reasoning_chunk', data: { text: 'thinking' } },
    ],
  );
  assert.deepEqual(framer.pushText('{"event":"end","data":{}'), []);
  assert.deepEqual(framer.pushText('}'), []);
  assert.deepEqual(framer.finish(), [{ event: 'end', data: {} }]);
  assert.deepEqual(malformed, []);
});

test('the production XHR path owns no second line parser or duplicate service', () => {
  const source = readFileSync(new URL('../lib/api/agent.ts', import.meta.url), 'utf8');

  assert.match(source, /createMatrxNdjsonFramer/);
  assert.match(source, /framer\.pushText\(newData\)/);
  assert.match(source, /framer\.finish\(\)/);
  assert.doesNotMatch(source, /newData\.split\(['"]\\n['"]\)/);
  assert.equal(existsSync(new URL('../lib/agent-service.ts', import.meta.url)), false);
});
