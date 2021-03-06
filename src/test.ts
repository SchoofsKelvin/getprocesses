
import getProcesses from '.';

console.log(process.pid); // 13703

getProcesses().then((processes) => {
  processes.forEach(p => console.log(p.pid, p.ppid, p.command, p.arguments.join(' ')));
  // ...
  // 13704 17272 'node' 'lib/test.js'
  // ...
});

setTimeout(async () => {
  const processes = await getProcesses();
  const p = processes.find(v => v.pid === process.pid);
  if (!p) throw new Error('Uh?');
  console.log(JSON.stringify(p));
  // {"command":"node","rawCommandLine":"node  lib/test.js","arguments":["lib/test.js"],"ppid":17272,"pid":13704}
},         1000);
