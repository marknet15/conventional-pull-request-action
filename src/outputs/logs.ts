import * as core from '@actions/core';

export const logPrTitleFound = (title: string) =>
  core.info(`🕵️  Found PR title: "${title}"`);

export const logActionSuccessful = (hasWarnings: boolean = false) =>
  core.info(
    `✅ PR title validated ${hasWarnings ? 'with warnings' : 'successfully'}`
  );
