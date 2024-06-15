import core from '@actions/core';
import { lint } from './lint';
import { getActionConfig } from './utils/config';

try {
  const {
    githubToken,
    githubWorkspace,
    rulesPath,
    enforcedScopeTypes,
    scopeRegex
  } = getActionConfig();

  lint(githubToken, githubWorkspace, rulesPath, enforcedScopeTypes, scopeRegex);
} catch (e) {
  core.setFailed(`Failed to run action with error: ${JSON.stringify(e)}`);
}
