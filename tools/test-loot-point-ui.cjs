const fs=require('fs'),assert=require('assert');
const batch=Number((process.argv.find(a=>/^--batch[1-9]\d*$/.test(a))||'--batch1').slice(7));
const previewName=batch===1?'loot-points-preview':`loot-points-batch${batch}-preview`;
(async()=>{
 const tabs=await(await fetch('http://localhost:9234/json')).json(),ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r));let seq=0;const pending=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}};
 const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
 const ev=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const result=await ev(`(async()=>{await Laya.Scene.open('loot-points-study/${previewName}.ls',true);await new Promise(r=>setTimeout(r,1000));const found=[];function walk(n){for(const c of n._components||[])if(typeof c.visualId==='string')found.push(c);for(let i=0;i<n.numChildren;i++)walk(n.getChildAt(i));}walk(Laya.stage);globalThis.lootProps=found;const results=[];for(const c of found){const frames=typeof c.getOpenVisualFrames==='function'?c.getOpenVisualFrames():[0,1,2,3].map(i=>'animation/container/'+c.visualFolder+'/'+c.visualId+'/frame_0'+i+'.png');await Laya.loader.load(frames);results.push({id:c.visualId,loaded:frames.every(f=>!!Laya.loader.getRes(f)),count:frames.length});if(typeof c.playOpenVisualAnimation==='function')c.playOpenVisualAnimation();else c.owner.event(Laya.Event.CLICK);}return results;})()`);
 const expected=JSON.parse(fs.readFileSync(`assets/config/loot-points-v${batch}.json`,'utf8')).items.length;
 assert.equal(result.length,expected);assert(result.every(r=>r.loaded&&r.count===4));await new Promise(r=>setTimeout(r,700));
 assert(await ev("lootProps.every(c=>c.owner.getChildByName('img').src.endsWith('frame_03.png'))"));
 fs.writeFileSync(`docs/${previewName}-runtime-open.png`,Buffer.from((await call('Page.captureScreenshot',{format:'png'})).data,'base64'));
 await ev("lootProps.forEach(c=>{const frames=typeof c.getOpenVisualFrames==='function'?c.getOpenVisualFrames():[0,1,2,3].map(i=>'animation/container/'+c.visualFolder+'/'+c.visualId+'/frame_0'+i+'.png');c.owner.getChildByName('img').src=frames[0]})");await new Promise(r=>setTimeout(r,150));
 fs.writeFileSync(`docs/${previewName}-runtime-closed.png`,Buffer.from((await call('Page.captureScreenshot',{format:'png'})).data,'base64'));
 console.log(`PASS: ${expected} authored Laya props, ${expected*4} textures loaded, all opening sequences finish on open frame`);ws.close();
})().catch(e=>{console.error(e);process.exit(1);});
