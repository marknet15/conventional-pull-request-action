import * as core from '@actions/core';

const setFailed = (message: string) => core.setFailed(`🛑 ${message}`);

export const setFailedPrNotFound = () =>
  setFailed(
    `Pull request not found. Use pull request event to trigger this action`
  );

export const setFailedMissingToken = () =>
  setFailed(
    `Could not find Github Token. Ensure you have passed a valid 'GITHUB_TOKEN' value to the action.`
  );

export const setFailedDoesNotMatchSpec = () =>
  setFailed(
    `Pull request title does not conform to the conventional commit spec`
  );

export const setFailedScopeNotValid = (scopes: Array<string>) =>
  setFailed(
    `PR title must contain a scope with a ticket number containing one of ${scopes.join(
      ', '
    )}`
  );
