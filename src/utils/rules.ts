import path from 'path';
import config from '@commitlint/config-conventional';

export const MISSING_WORKSPACE = 'MISSING_WORKSPACE';
export const MISSING_RULES_FILE = 'MISSING_RULES_FILE';

export const getLintRules = async (rules?: string, workspace?: string) => {
  let overrideRules = {};

  if (rules && (!workspace || workspace === '')) {
    return {
      error: MISSING_WORKSPACE,
      rules: { ...config.rules, ...overrideRules }
    };
  } else if (rules && workspace) {
    const configPath = path.resolve(workspace, rules);
    try {
      /* eslint-disable-next-line global-require, import/no-dynamic-require */
      const localRules = require(configPath);
      overrideRules = localRules.rules;
    } catch (e) {
      if (
        typeof e === 'object' &&
        e &&
        'code' in e &&
        typeof e.code === 'string' &&
        e.code === 'MODULE_NOT_FOUND'
      ) {
        return {
          error: MISSING_RULES_FILE,
          rules: { ...config.rules, ...overrideRules }
        };
      } else {
        throw e;
      }
    }
  }

  return {
    rules: { ...config.rules, ...overrideRules }
  };
};
