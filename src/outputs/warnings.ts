import * as core from '@actions/core';

export const warnMissingCheckout = () =>
  core.warning(
    `⚠️  actions/checkout is required to load a custom commitlint rules file. Falling back to default @commitlint/config-conventional lint rules.`
  );

export const warnRulesNotFound = () =>
  core.warning(
    `⚠️  Commitlint rules file not found, falling back to default @commitlint/config-conventional lint rules. If using custom rules, check that 'commitlintRulesPath' matches the relative path and filename of a valid commitlint rules file.`
  );

export const warnPrTitle = (message: string) =>
  core.warning(`⚠️  PR title: ${message}`);
