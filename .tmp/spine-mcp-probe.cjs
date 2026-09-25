const { spawn } = require('child_process');
const request = process.argv[2] ? JSON.parse(Buffer.from(process.argv[2], 'base64').toString('utf8')) : { method: 'tools/list', params: {} };
const child = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'C:/Users/xunenghong/.codex/laya-mcp-stdio.ps1'], { windowsHide: true });
let buffer = '';
let done = false;
const timeout = setTimeout(() => { console.error('MCP timeout'); child.kill(); process.exitCode = 1; }, 45000);
const send = (message) => child.stdin.write(JSON.stringify(message) + '\n');
child.stderr.on('data', data => process.stderr.write(data));
child.stdout.on('data', data => {
  buffer += data;
  let end;
  while ((end = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, end).trim(); buffer = buffer.slice(end + 1);
    if (!line) continue;
    let message;
    try { message = JSON.parse(line); } catch { console.error(line); continue; }
    if (message.id === 1) {
      send({ jsonrpc: '2.0', method: 'notifications/initialized' });
      send({ jsonrpc: '2.0', id: 2, ...request });
    } else if (message.id === 2) {
      console.log(JSON.stringify(message)); done = true; clearTimeout(timeout); child.stdin.end(); child.kill();
    }
  }
});
child.on('exit', () => { clearTimeout(timeout); if (!done) process.exitCode = 1; });
send({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'spine-runtime-probe', version: '1.0' } } });
