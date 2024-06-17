import * as github from '@actions/github';
import commitlint from '@commitlint/lint';
import conventionalCommitsParser from 'conventional-commits-parser';
import createPreset from 'conventional-changelog-conventionalcommits';
import {
  logActionSuccessful,
  logLintableScopeFound,
  logLintingPrTitle,
  logLintingPrTitleWithCustomRules,
  logPrTitleFound,
  logScopeCheckSkipped
} from './outputs/logs';
import {
  setFailedDoesNotMatchSpec,
  setFailedMissingToken,
  setFailedPrNotFound,
  setFailedScopeNotValid,
  setFailedScopeRequired
} from './outputs/fails';
import {
  getLintRules,
  MISSING_RULES_FILE,
  MISSING_WORKSPACE
} from './utils/rules';
import {
  warnLinting,
  warnMissingWorkspace,
  warnRulesNotFound
} from './outputs/warnings';
import { errorLinting } from './outputs/errors';

const lint = async (
  githubToken?: string,
  githubWorkspace?: string,
  rulesPath?: string,
  enforcedScopeTypes?: Array<string>,
  scopeRegex?: RegExp
) => {
  if (!githubToken) {
    return setFailedMissingToken();
  }

  const octokit = github.getOctokit(githubToken);

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

  const commitlintRules = await getLintRules(rulesPath, githubWorkspace);

  if (commitlintRules.error === MISSING_WORKSPACE) warnMissingWorkspace();
  if (commitlintRules.error === MISSING_RULES_FILE)
    warnRulesNotFound(rulesPath);

  if (rulesPath && !commitlintRules.error) {
    logLintingPrTitleWithCustomRules(rulesPath);
  } else {
    logLintingPrTitle();
  }

  const {
    conventionalChangelog: { parserOpts }
  } = await createPreset(null, null);

  const lintOutput = await commitlint(
    pullRequest.title,
    commitlintRules.rules,
    {
      parserOpts
    }
  );
  lintOutput.warnings.forEach(warn => warnLinting(warn.message));
  lintOutput.errors.forEach(err => errorLinting(err.message));

  const hasWarnings = lintOutput.warnings.length > 0;

  if (!lintOutput.valid) {
    return setFailedDoesNotMatchSpec();
  }

  const { scope, type } = conventionalCommitsParser.sync(pullRequest.title);

  if (
    !enforcedScopeTypes ||
    (enforcedScopeTypes && type && enforcedScopeTypes.includes(type))
  ) {
    if (enforcedScopeTypes && !scope) {
      return setFailedScopeRequired(type);
    }

    if (scope && scopeRegex) {
      logLintableScopeFound(scope, scopeRegex.toString());

      if (!scope.match(scopeRegex)) {
        return setFailedScopeNotValid(scopeRegex.toString());
      }
    }
  } else {
    if (type) logScopeCheckSkipped(type);
  }

  return logActionSuccessful(hasWarnings);
};

export { lint };
