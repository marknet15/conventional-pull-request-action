import * as core from '@actions/core';
import { type Commit } from 'conventional-commits-parser';

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

export const setFailedScopeRequired = (type?: Commit.Field | string) =>
  setFailed(
    `PR title${type ? ` of type '${type.toString()}'` : ''} must contain a scope`
  );

export const setFailedScopeNotValid = (regex: string) =>
  setFailed(
    `PR title must contain a scope which matches the regular expression: ${regex}`
  );
