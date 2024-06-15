import { setFailed, warning, error, info } from '@actions/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { lint } from './lint';

const mocks = vi.hoisted(() => {
  return {
    getOctokit: vi.fn()
  };
});

vi.mock('@actions/core', async importOriginal => {
  const mod = await importOriginal<typeof import('@actions/core')>();
  const error = vi.fn();
  const info = vi.fn();
  const warning = vi.fn();
  const setFailed = vi.fn();

  return {
    ...mod,
    default: { error, info, warning, setFailed },
    setFailed,
    info,
    warning,
    error
  };
});

vi.mock('@actions/github', async importOriginal => {
  const mod = await importOriginal<typeof import('@actions/github')>();

  const context = {
    eventName: 'pull_request',
    payload: {
      pull_request: {
        number: 1234,
        base: {
          user: { login: 'bob_cratchett' },
          repo: { name: 'http://github.com/bob_cratchett/stuff' }
        }
      }
    }
  };

  return {
    ...mod,
    default: { getOctokit: mocks.getOctokit, context },
    getOctokit: mocks.getOctokit,
    context
  };
});

describe('Linter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();

    delete process.env.INPUT_SCOPEPREFIXES;
    process.env.INPUT_COMMITLINTRULESPATH =
      './src/fixtures/commitlint.rules.js';
    process.env.GITHUB_TOKEN = 'TOKEN';
    process.env.GITHUB_WORKSPACE = './';
  });

  it('should find and log the PR title', async () => {
    mocks.getOctokit.mockReturnValue({
      rest: {
        pulls: {
          get: vi.fn().mockReturnValue({
            data: {
              commits: 1,
              title: 'feat(BAR-1234): hello i am a valid title'
            }
          })
        }
      }
    });

    await lint();

    expect(info).toHaveBeenCalledWith(
      '🕵️  Found PR title: "feat(BAR-1234): hello i am a valid title"'
    );
  });

  it.each(['feat(BAR-1234): subject is valid', 'feat!: subject is valid'])(
    'should output a success message if PR title is valid: %s',
    async title => {
      mocks.getOctokit.mockReturnValue({
        rest: {
          pulls: {
            get: vi.fn().mockReturnValue({
              data: {
                commits: 1,
                title
              }
            })
          }
        }
      });

      await lint();

      expect(info).toHaveBeenLastCalledWith(
        '✅ PR title validated successfully'
      );

      expect(error).not.toHaveBeenCalled();
      expect(warning).not.toHaveBeenCalled();
      expect(setFailed).not.toHaveBeenCalled();
    }
  );

  it('should fail and output an error if title does not pass a custom error rule', async () => {
    mocks.getOctokit.mockReturnValue({
      rest: {
        pulls: {
          get: vi.fn().mockReturnValue({
            data: {
              commits: 1,
              title: 'feat(BAR-1234): TITLES SHOULD BE LOWERCASE'
            }
          })
        }
      }
    });

    await lint();

    expect(error).toHaveBeenCalledWith(
      '⛔️ PR title: subject must be lower-case'
    );
    expect(setFailed).toHaveBeenCalledWith(
      '🛑 Pull request title does not conform to the conventional commit spec'
    );
  });

  it('should pass and output a warning if title does not pass a custom warning rule', async () => {
    mocks.getOctokit.mockReturnValue({
      rest: {
        pulls: {
          get: vi.fn().mockReturnValue({
            data: {
              commits: 1,
              title:
                'feat(BAR-1234): subject should not be longer than 20 characters long'
            }
          })
        }
      }
    });

    await lint();

    expect(warning).toHaveBeenCalledWith(
      '⚠️  PR title: subject must not be longer than 20 characters'
    );
    expect(info).toHaveBeenLastCalledWith(
      '✅ PR title validated with warnings'
    );
    expect(setFailed).not.toHaveBeenCalled();
  });

  it('should fail if the title is a valid conventional commit but a required scope is expected', async () => {
    process.env.INPUT_SCOPEPREFIXES = `["FOO-"]`;

    mocks.getOctokit.mockReturnValue({
      rest: {
        pulls: {
          get: vi.fn().mockReturnValue({
            data: {
              commits: 1,
              title:
                'feat(BAR-1234): subject should not be longer than 20 characters long'
            }
          })
        }
      }
    });

    await lint();

    expect(setFailed).toHaveBeenCalledWith(
      '🛑 PR title must contain a scope with a ticket number containing one of FOO-'
    );
  });
});
