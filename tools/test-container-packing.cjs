const fs=require('fs'),assert=require('assert'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const {ContainerPacking:P}=require('../src/systems/data/ContainerPacking.ts');
const items=JSON.parse(fs.readFileSync('assets/config/equipment-design-v1.json')).items.filter(i=>i.storageStates),defs=Object.fromEntries(items.map(i=>[i.id,i]));
const p=new P(defs),unit={instanceId:'unit',itemId:'test',name:'test',count:1,gridWidth:1,gridHeight:1};
for(const d of items){
 const bag=p.create(d.id,d.id),folded=p.changeState(bag,'folded');assert(folded);assert(folded.gridWidth*folded.gridHeight<bag.gridWidth*bag.gridHeight);
 assert.equal(p.insert(folded,unit),null);const open=p.changeState(folded,'expanded');assert.equal(open.icon,d.storageStates.expanded.icon);
 const loaded=p.insert(open,unit);assert(loaded);assert.equal(p.changeState(loaded,'folded'),null);assert.equal(open.contents.length,0);
 assert.equal(d.spaceBenefit,d.container.usableCells-d.gridWidth*d.gridHeight);
 assert(d.container.usableCells/(d.gridWidth*d.gridHeight)<=1.3);
 for(const state of Object.values(d.storageStates).filter(s=>s?.icon)){const b=fs.readFileSync('assets/'+state.icon);assert.equal(b.readUInt32BE(16),state.gridWidth*256);assert.equal(b.readUInt32BE(20),state.gridHeight*256);assert.equal(b[25],6);}
}
const cargo=p.create('backpack_cargo','outer'),heavy=p.create('rig_heavy','inner');
const nested=p.insert(cargo,heavy,0);assert(nested);assert.equal(p.changeState(nested,'folded'),null);
assert(p.insert(nested.contents[0],unit),'expanded nested bag accepts items');
assert.equal(p.insert(cargo,cargo),null);assert.equal(p.insert(heavy,nested),null,'ancestor cannot fit inside child');
const compact=p.create('backpack_compact','small'),folded=p.changeState(heavy,'folded'),smallLoaded=p.insert(compact,folded,0);
assert(smallLoaded);const before=JSON.stringify(smallLoaded);assert.equal(p.resizeChild(smallLoaded,0,'expanded'),null);assert.equal(JSON.stringify(smallLoaded),before);
const largeLoaded=p.insert(cargo,folded,0);assert(p.resizeChild(largeLoaded,0,'expanded'));
const rig=p.create('rig_light','rig');assert.equal(p.insert(rig,{...unit,gridWidth:2,gridHeight:2}),null,'cannot cross adjacent magazine pockets');
console.log('PASS: eight art pairs and balance; empty-only folding; folded storage rejection; nesting, cycles, independent compartments and atomic in-parent expansion.');
