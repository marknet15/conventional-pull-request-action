import { beforeEach, describe, expect, it, vi } from 'vitest';
import { error } from '@actions/core';
import { errorLinting } from './errors';

vi.mock('@actions/core', async importOriginal => {
  const mod = await importOriginal<typeof import('@actions/core')>();
  const error = vi.fn();
  return {
    ...mod,
    default: { error },
    error
  };
});

describe('Error outputs', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('`errorLinting` should pass the expected error to the output', () => {
    errorLinting(`Definitely isn't right!!`);
    expect(error).toHaveBeenCalledWith(
      `⛔️ Commitlint: Definitely isn't right!!`
    );
  });
});
