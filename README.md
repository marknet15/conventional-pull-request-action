# conventional-pull-request-action

A Github Action that enforces the [conventional commit spec](https://www.conventionalcommits.org/en/v1.0.0/#specification) on pull request titles, whilst allowing for linting of scopes to be applied, for example to enforce the use of ticket numbers from issue and project management tracker.

Forked from, and heavily based on, Conde Nast's [conventional-pull-request-action](https://github.com/CondeNast/conventional-pull-request-action).

## Example

```yaml
name: Lint PR Title

on:
  pull_request:
    branches:
      - main
    types:
      - opened
      - edited

jobs:
  pr-lint:
    runs-on: ubuntu-latest
    steps:
      # Note: The repo checkout step is only required if using a custom commitlintRulesPath file
      - name: Check Out
        uses: actions/checkout@v4

      - name: Lint PR Title
        uses: benhodgson87/conventional-pull-request-action@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          commitlintRulesPath: './commitlint.rules.js'
          enforcedScopeTypes: 'feat|fix'
          scopeRegex: '[A-Z]+-[0-9]+'
```

## Arguments

| Argument              | Required | Example                   | Purpose                                                                                                                                   |
| --------------------- | -------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `commitlintRulesPath` | No       | `'./commitlint.rules.js'` | A relative path from the repo root to a file containing custom Commitlint rules to override the default ([docs](#customising-lint-rules)) |
| `scopeRegex`          | No       | `'[A-Z]+-[0-9]+'`         | A JS regex (without slashes or flags) used to lint the PR scope ([docs](#linting-scope))                                                  |
| `enforcedScopeTypes`  | No       | `'feat\|fix'`             | A list of PR types where the scope is always required and linted ([docs](#skipping-scope-linting))                                        |

## Usage

### Squash merge commit titles

This action has been written with the intent of being used on Squash Merge PRs, where Github has been set to use the PR title as the merge commit.

If you do not use this setting in your repo, Github will by default use the title of the first commit when merging, which will not have been linted.

You can find the option in the root General settings of your Github repo.

> Pull Requests > Allow Squash Merging > Default Commit Message > Pull Request Title

### Customising lint rules

Out of the box the action follows the [@commitlint/config-conventional](https://github.com/conventional-changelog/commitlint/tree/master/%40commitlint/config-conventional) rules, however you can pass a config of override rules to customise to your needs, using the `commitlintRulesPath` arg.

```yaml
commitlintRulesPath: './commitlint.rules.js'
```

```ts
// ./commitlint.rules.js

module.exports = {
  rules: {
    'subject-case': [2, 'always', ['lower-case']],
    'subject-max-length': [0]
  }
};
```

Note that if you include a custom rules file you need to add the `actions/checkout` step before the linter, so it is able to reference your custom rules file. If you just want to run with the default rules, the checkout step is not required.

### Linting scope

To enforce a format for PR scopes, you can pass a `scopeRegex` value containing a valid JS regex.

Note that this is converted using `RegExp()` by the action, so should not include the leading and trailing slashes, or any flags, as these are added at runtime.

For example, to enforce scopes containing a valid Jira ticket ID (`ABC-123`), the following Regex would be provided;

```yaml
scopeRegex: '[A-Z]+-[0-9]+'
```

Note that by default, scope linting will only occur when a PR title contains a scope. If you wish to enforce that all PRs must contain a scope to be linted, you should set `'scope-empty': [2, 'never']` in your custom rules.

#### Example regexes

##### Any Jira ticket

Lint for any Jira ticket format, eg `FOO-123`, `BAR-234`, `BAZ-345`

```ts
[A-Z]+-[0-9]+
```

##### Specific Jira project tickets

Only allow tickets from three specific projects; `SPECIFIC-123`, `JIRA-234`, `PROJECT-345`. `FOO-456` would be rejected.

```ts
\b(SPECIFIC|JIRA|PROJECT)\b-[0-9]+
```

### Skipping scope linting

You may only want certain types of ticket to require a scope, such as `feat` or `fix`, while allowing `chore` or `docs` PRs to skip this check.

`enforcedScopeTypes` allows for this, accepting a pipe-separated string list of ticket types that should always contain a scope which matches the Regex.

```yaml
enforcedScopeTypes: 'feat|fix'
```

With the above config, using the example regex string in the previous section;

> ✅ feat(BAR-1234): This PR title is ok

> ✅ fix(FOO-2345): This PR title is also ok

> ✅ chore: This PR title is ok too, as chore is not an enforced type

> 🚫 feat: This is a feature PR so requires a ticket in the scope

> 🚫 fix(FOO-): The regex also expects the ticket number

> 🚫 feat(ci): This scope doesn't match the permitted regex

### Skipping for bot PRs

If you're using a tool like Renovate or Dependabot, which does not include a ticket in the scope, you can skip the action running for these PRs by adding the following after your `runs-on` command.

```yaml
if: ${{ github.actor != 'renovate[bot]' }}
```
