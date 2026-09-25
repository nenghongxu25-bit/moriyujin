const fs=require('fs'),assert=require('assert');
(async()=>{
 const tabs=await(await fetch('http://localhost:9234/json')).json(),ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r));let seq=0;const pending=new Map();ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}};
 const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
 const ev=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const delay=()=>new Promise(r=>setTimeout(r,350));
 await ev(fs.readFileSync('.tmp/preview-remastered-weapons.js','utf8'));
 await ev(`(()=>{function walk(n){for(const c of n._components||[])if(c.warehouseMode===true)globalThis.p=c;for(let i=0;i<n.numChildren;i++)walk(n.getChildAt(i));}walk(Laya.stage);p.dm.registerContainerEquipment(${fs.readFileSync('assets/config/equipment-design-v1.json','utf8')});p.dm.inventory.getGridStorage().items=[];p.dm.warehouse.getGridStorage().items=[];p.dm.grantItemsToActive([{itemId:'backpack_compact',count:1}]);p.dm.grantItemsToWarehouse([{itemId:'rig_light',count:1}]);p.refresh();p.action('showStorage');p.action('scrollBag');})()`);await delay();
 const click=async expr=>{const q=await ev(`(()=>{const q=(${expr}).localToGlobal(new Laya.Point(20,16)),r=document.querySelector('canvas').getBoundingClientRect();return {x:r.x+q.x*r.width/Laya.stage.width,y:r.y+q.y*r.height/Laya.stage.height};})()`);for(const type of ['mousePressed','mouseReleased'])await call('Input.dispatchMouseEvent',{type,...q,button:'left',clickCount:1});await delay();};
 assert.equal(await ev("p.node('toggleContainer').visible"),false);
 for(const [grid,bucket] of [['bagGlist','active'],['warehouseGlist','warehouse']]){
  await click(`p.${grid}.gridNodes[0]`);assert.equal(await ev("p.node('toggleContainer').visible"),true);
  assert.equal(await ev("p.node('toggleContainer').getChildByName('label').text"),'卷起');
  await click("p.node('toggleContainer')");assert.equal(await ev("p.selected.item.state"),'folded');
  assert.equal(await ev("p.node('toggleContainer').getChildByName('label').text"),'展开');
  await click("p.node('toggleContainer')");assert.equal(await ev("p.selected.item.state"),'expanded');
 }
 fs.writeFileSync('docs/container-fold-button.png',Buffer.from((await call('Page.captureScreenshot',{format:'png'})).data,'base64'));
 await ev("p.dm.warehouse.getGridStorage().items[0].contents=[{itemId:'test',name:'test',count:1}];p.refresh()");assert.equal(await ev("p.node('toggleContainer').mouseEnabled"),false);
 console.log('PASS: real clicks select bag/rig, reveal bottom button, fold/unfold with refreshed selection and nonempty disabled state');ws.close();
})().catch(e=>{console.error(e);process.exit(1);});
