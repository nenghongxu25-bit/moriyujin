const fs=require('fs'),assert=require('assert'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,f);
const {InventoryGrid:G}=require('../src/systems/data/InventoryGrid.ts');
const catalog=JSON.parse(fs.readFileSync('assets/config/equipment-design-v1.json','utf8'));
assert.equal(catalog.items.length,23);assert.equal(new Set(catalog.items.map(i=>i.id)).size,23);
for(const category of ['armor','helmet'])assert.deepEqual(catalog.items.filter(i=>i.category===category).map(i=>i.protectionLevel),[1,2,3,4,5,6]);
assert.equal(catalog.items.filter(i=>i.category==='headset').length,3);
const item=(w,h)=>({itemId:'test',name:'test',count:1,gridWidth:w,gridHeight:h,gridVersion:2});
const pockets={columns:2,capacity:2,compartments:[{id:'a',x:0,y:0,width:1,height:1},{id:'b',x:1,y:0,width:1,height:1}]};
assert.equal(G.add([],[item(2,1)],pockets,()=>1),null,'adjacent cells cannot merge');
assert.equal(G.add([],[item(1,2)],pockets,()=>1),null,'rotation cannot bypass seam');
assert(G.add([],[item(1,1),item(1,1)],pockets,()=>1));
const split={columns:4,capacity:8,compartments:[{id:'a',x:0,y:0,width:2,height:2},{id:'b',x:2,y:0,width:2,height:2}]};
const before=G.add([],[item(2,2)],split,()=>1,0),saved=JSON.stringify(before);
assert.equal(G.move(before,0,1,split,()=>1),null);assert.equal(JSON.stringify(before),saved);
assert(G.move(before,0,2,split,()=>1));
const incompatible=[item(3,2)];assert.throws(()=>G.migrate(incompatible,split,()=>1),/fixed container/);assert.equal(split.capacity,8);assert.equal(incompatible[0].count,1);
for(const i of catalog.items){
 assert.equal(i.pixelWidth,i.gridWidth*256);assert.equal(i.pixelHeight,i.gridHeight*256);assert.equal(i.enabled,false);
 if(!i.container)continue;const c=i.container,used=new Set();
 for(const p of c.compartments){assert(p.x>=0&&p.y>=0&&p.width>0&&p.height>0);assert(p.x+p.width<=c.columns);assert((p.y+p.height)*c.columns<=c.capacity);
  for(let y=p.y;y<p.y+p.height;y++)for(let x=p.x;x<p.x+p.width;x++){const index=y*c.columns+x;assert(!used.has(index),'overlap');used.add(index);}
 }
 assert.equal(used.size,c.usableCells);
 const filled=G.add([],Array.from({length:c.usableCells},()=>item(1,1)),c,()=>1);assert(filled);assert(G.valid(filled,c,()=>1));assert.equal(G.add(filled,[item(1,1)],c,()=>1),null);
 for(let index=0;index<c.capacity;index++)assert.equal(!!G.cells(item(1,1),index,c),used.has(index));
 for(let w=1;w<=5;w++)for(let h=1;h<=5;h++)for(let index=0;index<c.capacity;index++){
  const cells=G.cells(item(w,h),index,c);if(!cells)continue;
  assert(c.compartments.some(p=>cells.every(n=>n%c.columns>=p.x&&n%c.columns<p.x+p.width&&Math.floor(n/c.columns)>=p.y&&Math.floor(n/c.columns)<p.y+p.height)));
 }
}
console.log('PASS: 23 designs, tiers 1–6, exact art sizes, 8 compartment layouts, seams, rotation, dead cells, full capacity, atomic failure and bounded migration.');
if(fs.existsSync('docs/equipment-art-manifest.json')){
 for(const i of catalog.items){const png=fs.readFileSync('assets/'+i.icon);assert.equal(png.readUInt32BE(16),i.pixelWidth);assert.equal(png.readUInt32BE(20),i.pixelHeight);assert.equal(png[25],6,'RGBA');}
 for(const category of ['armor','helmet'])assert.deepEqual(catalog.items.filter(i=>i.category===category).map(i=>i.presentation.quality),['gray','green','blue','purple','gold','red']);
 assert.deepEqual(catalog.items.filter(i=>i.category==='headset').map(i=>i.presentation.quality),['blue','purple','gold']);
 assert.equal(new Set(catalog.items.filter(i=>i.category==='rig').map(i=>i.icon)).size,4);
 console.log('PASS: all 23 icon references, PNG dimensions and alpha format, six protection colors, three headset colors, four distinct rigs.');
}
