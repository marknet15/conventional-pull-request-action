import core from '@actions/core';

export const warnMissingCheckout = () =>
  core.warning(
    `⚠️  actions/checkout is required to load your commitlint rules file`
  );

export const warnRulesNotFound = () =>
  core.warning(
    `⚠️  Commitlint rules file not found, falling back to default @commitlint/config-conventional lint rules. Check that 'commitlintRulesPath' matches the relative path and filename of a valid commitlint rules file.`
  );

export const warnPrTitle = (message: string) =>
  core.warning(`⚠️  PR title: ${message}`);
