export const getActionConfig = () => {
  let enforcedScopeTypes;
  let scopeRegex;

  if (process.env.INPUT_ENFORCEDSCOPETYPES) {
    try {
      const types = process.env.INPUT_ENFORCEDSCOPETYPES.split('|');
      enforcedScopeTypes = types.length > 0 ? types : undefined;
    } catch (e) {
      console.error('Failed to convert scopeRegex to valid RegExp', e);
    }
  }

  if (process.env.INPUT_SCOPEREGEX) {
    try {
      const regex = new RegExp(process.env.INPUT_SCOPEREGEX, 'g');
      scopeRegex = regex ? regex : undefined;
    } catch (e) {
      console.error('Failed to convert scopeRegex to valid RegExp', e);
    }
  }

  return {
    githubToken: process.env.GITHUB_TOKEN,
    githubWorkspace: process.env.GITHUB_WORKSPACE,
    rulesPath: process.env.INPUT_COMMITLINTRULESPATH,
    ...(enforcedScopeTypes ? { enforcedScopeTypes } : {}),
    ...(scopeRegex ? { scopeRegex } : {})
  };
};
