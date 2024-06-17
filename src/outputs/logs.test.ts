import { info } from '@actions/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  logActionSuccessful,
  logLintableScopeFound,
  logLintingPrTitle,
  logLintingPrTitleWithCustomRules,
  logPrTitleFound,
  logScopeCheckSkipped
} from './logs';

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
      `🕵️ Found PR title: "fix(CDV-2812): Get with friends"`
    );
  });

  it('`logLintingPrTitle` should pass the expected log to the output', () => {
    logLintingPrTitle();
    expect(info).toHaveBeenCalledWith(`📋 Checking PR title with commitlint`);
  });

  it('`logLintingPrTitleWithCustomRules` should pass the expected log to the output', () => {
    logLintingPrTitleWithCustomRules('./commitlint.rules.js');
    expect(info).toHaveBeenCalledWith(
      `📋 Found custom commitlint rules file at "./commitlint.rules.js". Checking PR title with commitlint`
    );
  });

  it('`logLintableScopeFound` ', () => {
    logLintableScopeFound('CDV-2812', '$[A-Z]+-[0-9]+^');
    expect(info).toHaveBeenCalledWith(
      `👀 Found scope "CDV-2812". Linting with "$[A-Z]+-[0-9]+^"`
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

  it('`logScopeCheckSkipped` should pass the expected log to the output', () => {
    logScopeCheckSkipped('chore');
    expect(info).toHaveBeenCalledWith(
      `⏩ Skipping scope check for type "chore"`
    );
  });
});
