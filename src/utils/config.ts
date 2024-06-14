export const getActionConfig = () => {
  let SCOPE_PREFIXES: Array<string> = [];
  if (process.env.INPUT_SCOPEPREFIXES) {
    try {
      const scopePrefixes = JSON.parse(process.env.INPUT_SCOPEPREFIXES.trim());
      SCOPE_PREFIXES =
        scopePrefixes.length > 0 ? scopePrefixes : SCOPE_PREFIXES;
    } catch (e) {
      console.error('Failed to extract scope prefixes', e);
    }
  }

  return {
    SCOPE_PREFIXES,
    RULES_PATH: process.env.INPUT_COMMITLINTRULESPATH,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    GITHUB_WORKSPACE: process.env.GITHUB_WORKSPACE
  };
};
