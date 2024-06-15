import { beforeEach, describe, expect, it } from 'vitest';
import { getActionConfig } from './config';

describe('Config utils', () => {
  beforeEach(() => {
    delete process.env.INPUT_ENFORCEDSCOPETYPES;
    delete process.env.INPUT_SCOPEREGEX;
    process.env.INPUT_COMMITLINTRULESPATH = './commitlint.rules.js';
    process.env.GITHUB_TOKEN = 'asdf';
    process.env.GITHUB_WORKSPACE = './';
  });

  it('`getActionConfig` returns a valid config object with required values', () => {
    const config = getActionConfig();
    expect(config).toMatchObject({
      rulesPath: expect.any(String),
      githubToken: expect.any(String),
      githubWorkspace: expect.any(String)
    });
  });

  it('`getActionConfig` returns a valid config object when the enforcedScopeTypes arg is provided', () => {
    process.env.INPUT_ENFORCEDSCOPETYPES = 'feat|fix';

    const config = getActionConfig();
    expect(config).toMatchObject({
      enforcedScopeTypes: expect.any(Array),
      rulesPath: expect.any(String),
      githubToken: expect.any(String),
      githubWorkspace: expect.any(String)
    });
    expect(config.enforcedScopeTypes).toEqual(['feat', 'fix']);
  });

  it('`getActionConfig` returns a valid config object when the scopeRegex arg is provided', () => {
    process.env.INPUT_SCOPEREGEX = '[A-Z]+-[0-9]+';

    const config = getActionConfig();
    expect(config).toMatchObject({
      scopeRegex: expect.any(RegExp),
      rulesPath: expect.any(String),
      githubToken: expect.any(String),
      githubWorkspace: expect.any(String)
    });
  });
});
