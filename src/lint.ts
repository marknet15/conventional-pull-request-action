import * as github from '@actions/github';
import commitlint from '@commitlint/lint';
import conventionalCommitsParser from 'conventional-commits-parser';
import createPreset from 'conventional-changelog-conventionalcommits';
import { getActionConfig } from './utils/config';
import { logActionSuccessful, logPrTitleFound } from './outputs/logs';
import {
  setFailedDoesNotMatchSpec,
  setFailedMissingToken,
  setFailedPrNotFound,
  setFailedScopeNotValid
} from './outputs/fails';
import { getLintRules, MISSING_CHECKOUT, RULES_NOT_FOUND } from './utils/rules';
import {
  warnMissingCheckout,
  warnPrTitle,
  warnRulesNotFound
} from './outputs/warnings';
import { errorPrTitle } from './outputs/errors';

const lint = async () => {
  const actionConfig = getActionConfig();
  const { GITHUB_TOKEN, SCOPE_PREFIXES } = actionConfig;

  if (!GITHUB_TOKEN) {
    return setFailedMissingToken();
  }

  const octokit = github.getOctokit(GITHUB_TOKEN);

  if (!github.context.payload.pull_request) {
    return setFailedPrNotFound();
  }

  const {
    number: pullNumber,
    base: {
      user: { login: owner },
      repo: { name: repo }
    }
  } = github.context.payload.pull_request;

  const { data: pullRequest } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: pullNumber
  });

  logPrTitleFound(pullRequest.title);

  const commitlintRules = await getLintRules(
    actionConfig.RULES_PATH,
    actionConfig.GITHUB_WORKSPACE
  );

  if (commitlintRules === MISSING_CHECKOUT) return warnMissingCheckout();
  if (commitlintRules === RULES_NOT_FOUND) return warnRulesNotFound();

  const {
    conventionalChangelog: { parserOpts }
  } = await createPreset(null, null);

  const lintOutput = await commitlint(pullRequest.title, commitlintRules, {
    parserOpts
  });
  lintOutput.warnings.forEach(warn => warnPrTitle(warn.message));
  lintOutput.errors.forEach(err => errorPrTitle(err.message));

  const hasWarnings = lintOutput.warnings.length > 0;

  if (!lintOutput.valid) {
    return setFailedDoesNotMatchSpec();
  }

  const pullRequestScope = conventionalCommitsParser.sync(
    pullRequest.title
  ).scope;

  if (
    pullRequestScope &&
    SCOPE_PREFIXES &&
    SCOPE_PREFIXES.length > 0 &&
    !SCOPE_PREFIXES.some((scope: string) => pullRequestScope.includes(scope))
  ) {
    return setFailedScopeNotValid(SCOPE_PREFIXES);
  }

  return logActionSuccessful(hasWarnings);
};

export { lint };
