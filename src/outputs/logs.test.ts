import { info } from '@actions/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { logActionSuccessful, logPrTitleFound } from './logs';

vi.mock('@actions/core', async importOriginal => {
  const mod = await importOriginal<typeof import('@actions/core')>();
  const info = vi.fn();
  return {
    ...mod,
    default: { info },
    info
  };
});

describe('Log outputs', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('`logPrTitleFound` should pass the expected log to the output', () => {
    logPrTitleFound(`fix(CDV-2812): Get with friends`);
    expect(info).toHaveBeenCalledWith(
      `🕵️  Found PR title: "fix(CDV-2812): Get with friends"`
    );
  });

  it('`logActionSuccessful` should log the success message when `hasWarnings` is false', () => {
    logActionSuccessful();
    expect(info).toHaveBeenCalledWith(`✅ PR title validated successfully`);
  });

  it('`logActionSuccessful` should log the success message when `hasWarnings` is false', () => {
    logActionSuccessful(true);
    expect(info).toHaveBeenCalledWith(`✅ PR title validated with warnings`);
  });
});
