import { info } from '@actions/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { logPrTitleFound } from './logs';

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
      `Found PR title: "fix(CDV-2812): Get with friends"`
    );
  });
});
