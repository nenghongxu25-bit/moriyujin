const fs=require('fs');
(async()=>{
const targets=await(await fetch('http://127.0.0.1:9234/json/list')).json();
const page=targets.find(t=>t.url.includes(':18090'));
const ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pending=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){pending.get(m.id)?.(m);pending.delete(m.id);}};
const call=(method,params={})=>new Promise(r=>{const n=++id;pending.set(n,r);ws.send(JSON.stringify({id:n,method,params}));});
const result=await call('Runtime.evaluate',{expression:`JSON.stringify({url:location.href,children:Laya.stage.children.map(n=>({name:n.name,url:n.url})),fps:Laya.Stat.FPS})`,returnByValue:true});console.log(JSON.stringify(result));
if(process.argv[2]==='reload'){await call('Page.reload',{ignoreCache:true});}
if(process.argv[2]==='screenshot'){const r=await call('Page.captureScreenshot',{format:'png'});fs.writeFileSync('.tmp/city-perf-after.png',Buffer.from(r.result.data,'base64'));}
if(process.argv[2]==='profile'){
 await call('Profiler.enable');await call('Profiler.setSamplingInterval',{interval:1000});await call('Profiler.start');
 await new Promise(r=>setTimeout(r,6000));const p=(await call('Profiler.stop')).result.profile;
 fs.writeFileSync('.tmp/city-'+(process.argv[3]||'before')+'.cpuprofile',JSON.stringify(p));
 const counts=new Map();for(const n of p.samples||[])counts.set(n,(counts.get(n)||0)+1);
 console.log(p.nodes.map(n=>({fn:n.callFrame.functionName,url:n.callFrame.url,line:n.callFrame.lineNumber,samples:counts.get(n.id)||0})).sort((a,b)=>b.samples-a.samples).slice(0,25));
}
if(process.argv[2]==='eval'){console.log(JSON.stringify(await call('Runtime.evaluate',{expression:fs.readFileSync(process.argv[3],'utf8'),returnByValue:true,awaitPromise:true})));}
ws.close();
})().catch(e=>{console.error(e);process.exitCode=1});
