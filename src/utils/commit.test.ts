import { describe, expect, it } from 'vitest';
import { getCommitSubject } from './commit';

describe('Commit utils', () => {
  it('`getCommitSubject` should split the first line out of a PR', () => {
    const output = getCommitSubject(
      `fix(CDV-2812): Get with friends\n- Implement functionality to get with lover\n- Make last forever\n- Set friendship to NEVER_ENDS`
    );
    expect(output).toBe(`fix(CDV-2812): Get with friends`);
  });
});
