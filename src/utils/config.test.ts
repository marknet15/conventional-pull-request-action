import { beforeEach, describe, expect, it } from 'vitest';
import { getActionConfig } from './config';

describe('Config utils', () => {
  beforeEach(() => {
    process.env.INPUT_SCOPEPREFIXES = `["FOO-", "BAR-"]`;
    process.env.INPUT_COMMITLINTRULESPATH = './commitlint.rules.js';
    process.env.GITHUB_TOKEN = 'asdf';
    process.env.GITHUB_WORKSPACE = './';
  });

  it('`getActionConfig` returns a valid config object', () => {
    const config = getActionConfig();
    expect(config).toMatchObject({
      SCOPE_PREFIXES: expect.any(Object),
      RULES_PATH: expect.any(String),
      GITHUB_TOKEN: expect.any(String),
      GITHUB_WORKSPACE: expect.any(String)
    });
  });

  it('`getActionConfig` transforms the SCOPE_PREFIXES input from string to array', () => {
    const config = getActionConfig();
    expect(config['SCOPE_PREFIXES']).toEqual(['FOO-', 'BAR-']);
  });
});
