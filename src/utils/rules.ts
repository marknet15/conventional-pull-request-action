import path from 'path';
import config from '@commitlint/config-conventional';

export const MISSING_CHECKOUT = 'MISSING_CHECKOUT';
export const RULES_NOT_FOUND = 'RULES_NOT_FOUND';

export const getLintRules = async (rules?: string, workspace?: string) => {
  let overrideRules = {};

  if (rules && !workspace) {
    return MISSING_CHECKOUT;
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
        return RULES_NOT_FOUND;
      } else {
        throw e;
      }
    }
  }
  return { ...config.rules, ...overrideRules };
};
