const cp = require('child_process');
const fs = require('fs');
const requests = JSON.parse(fs.readFileSync(0, 'utf8').replace(/^\uFEFF/, ''));
const calls = Array.isArray(requests) ? requests : [requests];
const p = cp.spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'C:/Users/xunenghong/.codex/laya-mcp-stdio.ps1']);
let buffer = '', index = 0;
const timeout = setTimeout(() => { p.kill(); console.error('MCP timeout'); process.exitCode = 1; }, 45000);
const send = message => p.stdin.write(JSON.stringify(message) + '\n');
p.stderr.on('data', data => process.stderr.write(data));
p.stdout.on('data', data => {
  buffer += data;
  let end;
  while ((end = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, end).trim(); buffer = buffer.slice(end + 1);
    if (!line) continue;
    const response = JSON.parse(line);
    if (response.id === 1) send({jsonrpc:'2.0', method:'notifications/initialized'});
    else console.log(JSON.stringify({tool:calls[index-1].name || calls[index-1].method, response}));
    if (index < calls.length) {
      const request = calls[index++];
      const message={jsonrpc:'2.0', id:index+1, method:request.method || 'tools/call', params:request.params || request};
      if(request.delayMs) setTimeout(()=>send(message),request.delayMs);
      else send(message);
    } else { clearTimeout(timeout); p.stdin.end(); }
  }
});
p.on('error', error => { clearTimeout(timeout); console.error(error); process.exitCode = 1; });
send({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2024-11-05',capabilities:{},clientInfo:{name:'codex-laya-assets',version:'1.0'}}});
