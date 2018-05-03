
import { spawn } from 'child_process';
import { Process } from './ps_data';
import { getProcessesUnix } from './ps_unix';
import { getProcessesWindows } from './ps_windows';

const IS_WINDOWS = process.platform === 'win32';

export async function getProcesses(): Promise<Process[]> {
  if (IS_WINDOWS) {
    return getProcessesWindows();
  }
  return getProcessesUnix();
}

export {
  getProcessesUnix,
  getProcessesWindows,
};

export default getProcesses;
