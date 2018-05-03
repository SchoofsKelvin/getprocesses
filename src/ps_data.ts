
export interface Process {
  pid: number;
  ppid: number;
  command: string;
  arguments: string[];
  rawCommandLine: string;
}
