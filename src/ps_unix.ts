
import { spawn } from 'child_process';
import { Process } from './ps_data';

const realArgsplit = require('argsplit') as (str: string) => string[];
const argsplit = (str: string) => realArgsplit(str).map(v => v.startsWith('"') ? v.substr(1, v.length - 2) : v);

export function getProcessesUnix(): Promise<Process[]> {
  return new Promise<Process[]>((resolve, reject) => {
    const stdout: string[] = [];
    const stderr: string[] = [];
    const wmic = spawn('ps', ['-A', '-o', 'ppid:1,pid:1,args:1', '--no-headers']);
    wmic.stdout.on('data', stdout.push.bind(stdout));
    wmic.stderr.on('data', stderr.push.bind(stderr));
    wmic.on('exit', () => {
      const err = stderr.join('');
      if (err) return reject(new Error(err));
      const out = stdout.join('').replace(/\r/g, '');
      const processes: Process[] = [];
      out.split('\n').forEach((line) => {
        const mat = line.match(/(\d+) (\d+) (.*)/);
        if (!mat) return;
        const rawCommandLine = mat[3];
        const split = argsplit(rawCommandLine);
        const command = split[0] || '';
        const args = split.slice(1);
        processes.push({
          command,
          rawCommandLine,
          arguments: args,
          ppid: Number(mat[1]),
          pid: Number(mat[2]),
        });
      });
      resolve(processes);
    });
  });
}

export default getProcessesUnix;
