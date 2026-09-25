const assert=require('assert');
(async()=>{
 const tabs=await(await fetch('http://localhost:9234/json')).json(),ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
 await new Promise(r=>ws.addEventListener('open',r));let seq=0;const pending=new Map();
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}};
 const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 await evaluate("Laya.Scene.open('spatial-inventory-study/spatial-inventory-preview.ls',true).then(()=>new Promise(r=>setTimeout(r,1000)))");
 await evaluate(`(()=>{function walk(n){for(const c of n._components||[])if(c.warehouseMode===true)globalThis.panel=c;for(let i=0;i<n.numChildren;i++)walk(n.getChildAt(i));}walk(Laya.stage);})()`);
 const point=(view,index)=>evaluate(`(()=>{const p=panel.${view}.gridNodes[${index}].localToGlobal(new Laya.Point(18,18));const r=document.querySelector('canvas').getBoundingClientRect();return {x:r.x+p.x*r.width/Laya.stage.width,y:r.y+p.y*r.height/Laya.stage.height};})()`);
 const click=async p=>{await call('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',buttons:1,clickCount:1});await wait(20);await call('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',buttons:0,clickCount:1});await wait(25);};
 const double=async p=>{await click(p);await wait(75);await click(p);await wait(80);};
 const count=(bucket,id)=>evaluate(`panel.dm.getInventorySnapshot('${bucket}').filter(i=>i?.itemId==='${id}').reduce((n,i)=>n+i.count,0)`);
 const bagPoint=await point('bagGlist',2);
 await click(bagPoint);assert.equal(await count('active','knife'),1,'single click only selects');
 await wait(320);await click(bagPoint);assert.equal(await count('active','knife'),1,'slow repeated click does not transfer');
 await wait(280);await double(bagPoint);assert.equal(await count('active','knife'),0);assert.equal(await count('warehouse','knife'),1,'fast pair transfers once');
 assert.equal(await evaluate("panel.dm.getEquippedItem('weapon')"),null,'double click must not equip');
 const index=await evaluate("panel.dm.getWarehouseSnapshot().findIndex(i=>i?.itemId==='knife')");await double(await point('warehouseGlist',index));
 assert.equal(await count('active','knife'),1,'reverse transfer');assert.equal(await count('warehouse','knife'),0);
 await click(await point('bagGlist',0));await click(await point('bagGlist',1));assert.equal(await count('active','bandage'),3,'different items are not a pair');
 // Fill every warehouse cell with separate one-cell fixtures, so transfer must fail atomically.
 await evaluate("panel.dm.warehouse.getGridStorage().items=Array.from({length:210},()=>({...panel.dm.normalizeInventoryItem({itemId:'bandage',name:'bandage',count:1}),gridWidth:1,gridHeight:1}));panel.refresh();panel.lastClick=null;");
 const knife=await evaluate("panel.dm.getInventorySnapshot().findIndex(i=>i?.itemId==='knife')");await double(await point('bagGlist',knife));assert.equal(await count('active','knife'),1,'full target retains source');
 await evaluate(`(async()=>{panel.owner.visible=false;const prefab=await Laya.loader.load('prefab/prefab_interface/Bag/bag_panel.lh');const root=prefab.create();Laya.stage.addChild(root);panel=root._components.find(c=>c.bagGlist);panel.openContainerSearchWithItems([{itemId:'knife',name:'knife',count:1}]);})()`);await wait(150);
 const before=await count('active','knife');await double(await point('warehouseGlist',0));assert.equal(await count('active','knife'),before+1,'container double click picks up');assert.equal(await evaluate('panel.containerItems.filter(Boolean).length'),0);
 console.log('PASS: single/slow click selection, fast 250ms transfer both ways, no auto-equip, different item isolation, full target rollback, container pickup');ws.close();
})().catch(e=>{console.error(e);process.exit(1);});
