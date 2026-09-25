const fs=require('fs'),assert=require('assert'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const storage=new Map();global.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
const {DataManager}=require('../src/systems/datamanager.ts');
const dm=DataManager.getInstance(),catalog=JSON.parse(fs.readFileSync('assets/config/equipment-design-v1.json'));
dm.registerContainerEquipment(catalog);dm.inventory.loadPersistedInventories();dm.warehouse.load();
const bag=dm.inventory.getGridStorage(),wh=dm.warehouse.getGridStorage();
for(const d of catalog.items.filter(i=>i.storageStates)){
 wh.items=[];wh.items[0]=dm.normalizeInventoryItem({itemId:d.id,name:d.name,count:1,instanceId:d.id});
 assert.equal(dm.toggleContainerState('warehouse',0),null);
 let item=wh.items[0];assert.equal(item.state,'folded');assert.equal(item.gridWidth,d.storageStates.folded.gridWidth);assert.equal(item.icon,d.storageStates.folded.icon);
 dm.warehouse.load();item=wh.items[0];assert.equal(item.state,'folded');assert.equal(item.instanceId,d.id);
 bag.items=[];assert(dm.moveGridItem('warehouse',0,'active',0));assert.equal(bag.items[0].state,'folded');
 assert(dm.organizeInventory('active'));assert.equal(bag.items[0].state,'folded');
 assert.equal(dm.toggleContainerState('active',0),null);assert.equal(bag.items[0].icon,d.storageStates.expanded.icon);
 bag.items[0].contents=[{itemId:'test',name:'test',count:1}];let before=JSON.stringify(bag.items);
 assert(dm.toggleContainerState('active',0));assert.equal(JSON.stringify(bag.items),before);
 bag.items[0].contents=[];assert.equal(dm.toggleContainerState('active',0),null);
 bag.items[4]={itemId:'blocker',name:'blocker',count:1,gridWidth:1,gridHeight:1};
 // Occupy a cell needed by every expanded layout, outside the folded footprint.
 bag.items[4]=null;bag.items[15]={itemId:'blocker',name:'blocker',count:1,gridWidth:1,gridHeight:1};
 if(d.storageStates.expanded.gridHeight===3){bag.items[15]=null;bag.items[10]={itemId:'blocker',name:'blocker',count:1,gridWidth:1,gridHeight:1};}
 before=JSON.stringify(bag.items);assert(dm.toggleContainerState('active',0));assert.equal(JSON.stringify(bag.items),before);
}
console.log('PASS: eight container toggles, art/size, save reload, transfer, sorting, nonempty rejection and atomic blocked expansion');
