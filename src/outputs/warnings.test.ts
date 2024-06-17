import { warning } from '@actions/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  warnMissingWorkspace,
  warnLinting,
  warnRulesNotFound
} from './warnings';

vi.mock('@actions/core', async importOriginal => {
  const mod = await importOriginal<typeof import('@actions/core')>();
  const warning = vi.fn();
  return {
    ...mod,
    default: { warning },
    warning
  };
});

describe('Warning outputs', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('`warnMissingWorkspace` should pass the expected error to the output', () => {
    warnMissingWorkspace();
    expect(warning).toHaveBeenCalledWith(
      `⚠️ Could not find Github Action Workspace. Falling back to default @commitlint/config-conventional lint rules.`
    );
  });

  it('`warnRulesNotFound` should pass the expected error to the output', () => {
    warnRulesNotFound();
    expect(warning).toHaveBeenCalledWith(
      `⚠️ Commitlint rules file not found, falling back to default @commitlint/config-conventional lint rules. Check that 'commitlintRulesPath' matches the relative path and filename of a valid commitlint rules file, and you have included the actions/checkout step.`
    );
  });

  it('`warnRulesNotFound` should pass the expected error to the output when path arg is provided', () => {
    warnRulesNotFound('./commitlint.rules.js');
    expect(warning).toHaveBeenCalledWith(
      `⚠️ Commitlint rules file not found, falling back to default @commitlint/config-conventional lint rules. Check that 'commitlintRulesPath: ./commitlint.rules.js' matches the relative path and filename of a valid commitlint rules file, and you have included the actions/checkout step.`
    );
  });

  it('`warnPrTitle` should pass the expected error to the output with given arguments', () => {
    warnLinting(`Doesn't look right!`);
    expect(warning).toHaveBeenCalledWith(`⚠️ Commitlint: Doesn't look right!`);
  });
});
