export const getCommitSubject = (commitMessage = '') =>
  commitMessage.split('\n')[0];
