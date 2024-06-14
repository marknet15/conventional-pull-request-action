import * as core from '@actions/core';

export const logPrTitleFound = (title: string) =>
  core.info(`Found PR title: "${title}"`);
