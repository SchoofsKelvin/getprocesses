
import { spawn } from 'child_process';
import { Process } from './ps_data';

const realArgsplit = require('argsplit') as (str: string) => string[];
const argsplit = (str: string) => realArgsplit(str).map(v => v.startsWith('"') ? v.substr(1, v.length - 2) : v);

// powershell -command "echo '{""Hi, Test!""}'; pause"
// wmic process get ProcessId,ParentProcessId,CommandLine /format:list > gg.txt
// require('child_process').spawnSync('powershell', ['-command', 'sleep 600; "Brown\npotato"']).error

export function getProcessesWindows(): Promise<Process[]> {
  return new Promise<Process[]>((resolve, reject) => {
    const stdout: string[] = [];
    const stderr: string[] = [];
    const wmic = spawn('wmic', ['process', 'get' ,'ProcessId,ParentProcessId,CommandLine', '/format:csv']);
    wmic.stdout.on('data', stdout.push.bind(stdout));
    wmic.stderr.on('data', stderr.push.bind(stderr));
    wmic.on('exit', () => {
      const err = stderr.join('');
      if (err) return reject(new Error(err));
      const out = stdout.join('').replace(/\r/g, '').replace(/\n/g, '\n\n');
      const eh = out.match(/\n([^\n,]+),([^\n]*?|(.|\n)*?),(\d+),(\d+)\n/gm);
      const processes: Process[] = [];
      if (!eh) return processes;
      eh.slice(1).forEach((line) => {
        const mat = line.match(/\n([^\n,]+),([^\n]*?|(.|\n)*?),(\d+),(\d+)\n/);
        if (!mat) return;
        const rawCommandLine = mat[2];
        const split = argsplit(rawCommandLine);
        const command = split[0] || '';
        const args = split.slice(1);
        processes.push({
          command,
          rawCommandLine,
          arguments: args,
          ppid: Number(mat[4]),
          pid: Number(mat[5]),
        });
      });
      resolve(processes);
    });
  });
}

export default getProcessesWindows;
