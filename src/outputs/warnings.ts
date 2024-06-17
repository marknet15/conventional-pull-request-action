import * as core from '@actions/core';

export const warnMissingWorkspace = () =>
  core.warning(
    `⚠️ Could not find Github Action Workspace. Falling back to default @commitlint/config-conventional lint rules.`
  );

export const warnRulesNotFound = (path?: string) =>
  core.warning(
    `⚠️ Commitlint rules file not found, falling back to default @commitlint/config-conventional lint rules. Check that 'commitlintRulesPath${path ? `: ${path}` : ''}' matches the relative path and filename of a valid commitlint rules file, and you have included the actions/checkout step.`
  );

export const warnLinting = (message: string) =>
  core.warning(`⚠️ Commitlint: ${message}`);
