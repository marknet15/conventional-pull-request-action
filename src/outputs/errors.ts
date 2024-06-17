import * as core from '@actions/core';

export const errorLinting = (message: string) =>
  core.error(`⛔️ Commitlint: ${message}`);
