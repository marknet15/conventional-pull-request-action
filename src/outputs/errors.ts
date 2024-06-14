import * as core from '@actions/core';

export const errorPrTitle = (message: string) =>
  core.error(`⛔️ PR title: ${message}`);
