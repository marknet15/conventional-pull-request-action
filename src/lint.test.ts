import { setFailed, warning, error, info } from '@actions/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

const mockArgs = ['TOKEN', './', './src/fixtures/commitlint.rules.js'];

describe('Linter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
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

    await lint.apply(null, mockArgs);

    expect(info).toHaveBeenCalledWith(
      '🕵️  Found PR title: "feat(BAR-1234): hello i am a valid title"'
    );
  });

  it.each([
    'fix: subject is valid',
    'feat(BAR-1234): subject is valid',
    'feat!: subject is valid'
  ])(
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

      await lint.apply(null, mockArgs);

      expect(info).toHaveBeenLastCalledWith(
        '✅ PR title validated successfully'
      );

      expect(error).not.toHaveBeenCalled();
      expect(warning).not.toHaveBeenCalled();
      expect(setFailed).not.toHaveBeenCalled();
    }
  );

  it('should fail and output an error if title does not have a type', async () => {
    mocks.getOctokit.mockReturnValue({
      rest: {
        pulls: {
          get: vi.fn().mockReturnValue({
            data: {
              commits: 1,
              title: 'this is not a conventional commit'
            }
          })
        }
      }
    });

    await lint.apply(null, mockArgs);

    expect(error).toHaveBeenCalledWith('⛔️ PR title: type may not be empty');
    expect(setFailed).toHaveBeenCalledWith(
      '🛑 Pull request title does not conform to the conventional commit spec'
    );
  });

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

    await lint.apply(null, mockArgs);

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

    await lint.apply(null, mockArgs);

    expect(warning).toHaveBeenCalledWith(
      '⚠️  PR title: subject must not be longer than 20 characters'
    );
    expect(info).toHaveBeenLastCalledWith(
      '✅ PR title validated with warnings'
    );
    expect(setFailed).not.toHaveBeenCalled();
  });

  it('should fail if the title is a valid conventional commit but a correct scope pattern is missing', async () => {
    mocks.getOctokit.mockReturnValue({
      rest: {
        pulls: {
          get: vi.fn().mockReturnValue({
            data: {
              commits: 1,
              title:
                'feat(QUX-1234): subject should not be longer than 20 characters long'
            }
          })
        }
      }
    });

    await lint.apply(null, [
      ...mockArgs,
      undefined,
      new RegExp(`\\b(FOO|BAR|BAZ)\\b-[0-9]+`, 'g')
    ]);

    expect(setFailed).toHaveBeenCalledWith(
      '🛑 PR title must contain a scope which matches the regular expression: /\\b(FOO|BAR|BAZ)\\b-[0-9]+/g'
    );
  });

  it('should pass if the title is a valid conventional commit and a correct scope pattern is present', async () => {
    mocks.getOctokit.mockReturnValue({
      rest: {
        pulls: {
          get: vi.fn().mockReturnValue({
            data: {
              commits: 1,
              title:
                'feat(FOO-123): subject should not be longer than 20 characters long'
            }
          })
        }
      }
    });

    await lint.apply(null, [
      ...mockArgs,
      undefined,
      new RegExp(`\\b(FOO|BAR|BAZ)\\b-[0-9]+`, 'g')
    ]);

    expect(setFailed).not.toHaveBeenCalled();
  });

  it('should pass if the title is a valid conventional commit and a correct scope pattern is present for a required type', async () => {
    mocks.getOctokit.mockReturnValue({
      rest: {
        pulls: {
          get: vi.fn().mockReturnValue({
            data: {
              commits: 1,
              title:
                'feat(FOO-123): subject should not be longer than 20 characters long'
            }
          })
        }
      }
    });

    await lint.apply(null, [
      ...mockArgs,
      ['feat', 'fix'],
      new RegExp(`\\b(FOO|BAR|BAZ)\\b-[0-9]+`, 'g')
    ]);

    expect(info).toHaveBeenLastCalledWith(
      '✅ PR title validated with warnings'
    );
    expect(setFailed).not.toHaveBeenCalled();
  });

  it('should pass if the title is a valid conventional commit and type is omitted from scope checks', async () => {
    mocks.getOctokit.mockReturnValue({
      rest: {
        pulls: {
          get: vi.fn().mockReturnValue({
            data: {
              commits: 1,
              title: 'chore: valid subject'
            }
          })
        }
      }
    });

    await lint.apply(null, [
      ...mockArgs,
      ['feat', 'fix'],
      new RegExp(`\\b(FOO|BAR|BAZ)\\b-[0-9]+`, 'g')
    ]);

    expect(info).toHaveBeenCalledWith(
      `⏩ Skipping scope check for type 'chore'`
    );
    expect(info).toHaveBeenLastCalledWith('✅ PR title validated successfully');
    expect(setFailed).not.toHaveBeenCalled();
  });

  it('should fail if the title is a valid conventional commit but scope is missing for a required type', async () => {
    mocks.getOctokit.mockReturnValue({
      rest: {
        pulls: {
          get: vi.fn().mockReturnValue({
            data: {
              commits: 1,
              title: 'chore: subject is valid'
            }
          })
        }
      }
    });

    await lint.apply(null, [
      ...mockArgs,
      ['feat', 'fix', 'chore'],
      new RegExp(`\\b(FOO|BAR|BAZ)\\b-[0-9]+`, 'g')
    ]);

    expect(setFailed).toHaveBeenCalledWith(
      `🛑 PR title of type 'chore' must contain a scope`
    );
  });
});
