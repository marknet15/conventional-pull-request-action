import { warning } from '@actions/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  warnMissingCheckout,
  warnPrTitle,
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

  it('`warnMissingCheckout` should pass the expected error to the output', () => {
    warnMissingCheckout();
    expect(warning).toHaveBeenCalledWith(
      `⚠️  actions/checkout is required to load your commitlint rules file`
    );
  });

  it('`warnRulesNotFound` should pass the expected error to the output', () => {
    warnRulesNotFound();
    expect(warning).toHaveBeenCalledWith(
      `⚠️  Commitlint rules file not found, falling back to default @commitlint/config-conventional lint rules. Check that 'commitlintRulesPath' matches the relative path and filename of a valid commitlint rules file.`
    );
  });

  it('`warnPrTitle` should pass the expected error to the output with given arguments', () => {
    warnPrTitle(`Doesn't look right!`);
    expect(warning).toHaveBeenCalledWith(`⚠️  PR title: Doesn't look right!`);
  });
});
