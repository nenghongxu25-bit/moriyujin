// Verify saved gameplay prefabs, rather than invoking private animation methods.
const fs=require('fs'),assert=require('assert');
const batch=Number((process.argv.find(a=>/^--batch\d+$/.test(a))||'--batch4').slice(7));
const records=JSON.parse(fs.readFileSync(`assets/config/loot-points-v${batch}.json`,'utf8')).items;
for(const r of records){
 const p=JSON.parse(fs.readFileSync(r.prefab,'utf8'));
 assert.equal(p._$comp.filter(c=>c.scriptPath==='../src/container/LootPoint.ts').length,1);
 assert(!p._$comp.some(c=>c.scriptPath==='../src/container/LootPointPreview.ts'));
 const depth=p._$comp.find(c=>c.scriptPath==='../src/systems/DepthSortable.ts');
 assert.equal(depth.groundY,r.displaySize*476/512);
 assert(p._$comp.find(c=>c._$type==='StaticCollider').shapes[0].isSensor);
}
(async()=>{
 const tabs=await(await fetch('http://localhost:9234/json')).json();
 const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
 await new Promise(r=>ws.addEventListener('open',r));let id=0;const waiting=new Map();
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=waiting.get(m.id);waiting.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}};
 const call=(method,params)=>new Promise((resolve,reject)=>{const n=++id;waiting.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
 try{
  const request=call('Runtime.evaluate',{awaitPromise:true,returnByValue:true,expression:`(async()=>{
   const records=${JSON.stringify(records)},scene=new Laya.Scene();
   scene.width=1334;scene.height=750;Laya.stage.addChild(scene);const checked=[];
   try {
    for(const r of records){
     const prefab=await Laya.loader.load(r.prefab.slice(7));
     const node=prefab.create();scene.addChild(node);
     const c=node._components.find(c=>typeof c.open==='function'&&c.visualId===r.id);
     if(!c)throw Error('Missing gameplay component '+r.id);
     await Laya.loader.load(c.getOpenVisualFrames());
     const initiallyAvailable=c.isAvailable(),accepted=c.open(null),busyBlocked=!c.isAvailable(),duplicateRejected=!c.open(null);
     checked.push({id:r.id,c,node,initiallyAvailable,accepted,busyBlocked,duplicateRejected});
    }
    await new Promise(r=>setTimeout(r,4900));
    return checked.map(v=>({id:v.id,initiallyAvailable:v.initiallyAvailable,accepted:v.accepted,busyBlocked:v.busyBlocked,duplicateRejected:v.duplicateRejected,openFrame:v.node.getChildByName('img').src.endsWith('frame_03.png'),usedUp:!v.c.isAvailable(),reopenRejected:!v.c.open(null)}));
   } finally {scene.destroy(true);}
  })()`});
  let timeout;const result=await Promise.race([request,new Promise((_,reject)=>{timeout=setTimeout(()=>reject(Error('Gameplay verification timed out')),20000);})]).finally(()=>clearTimeout(timeout));
  if(result.exceptionDetails)throw Error(JSON.stringify(result.exceptionDetails));
  const checks=result.result.value;assert.equal(checks.length,records.length);
  for(const r of checks)for(const [k,v] of Object.entries(r))if(k!=='id')assert.strictEqual(v,true,r.id+': '+k);
  console.log(JSON.stringify(checks,null,2));console.log('PASS: gameplay open sequence, busy guard, once-only state, authored components');
 }finally{ws.close();}
})().catch(e=>{console.error(e);process.exit(1);});
