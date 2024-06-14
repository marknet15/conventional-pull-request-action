import core from '@actions/core';
import { lint } from './lint';

try {
  lint();
} catch (e) {
  core.setFailed(`Failed to run action with error: ${JSON.stringify(e)}`);
}
