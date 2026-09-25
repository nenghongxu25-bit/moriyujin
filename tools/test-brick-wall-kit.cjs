const fs=require('fs'),assert=require('node:assert/strict'),vm=require('vm'),ts=require('typescript');
const dir='assets/tileset/buildings/walls/brick',set=JSON.parse(fs.readFileSync(dir+'/brick-wall.tres','utf8')),layout=JSON.parse(fs.readFileSync(dir+'/layout.json','utf8'));
const g=set.groups[0],png=fs.readFileSync(dir+'/brick-wall-atlas.png');
// The editor omits derived atlasSize and zero-valued vector coordinates on save.
g.atlasSize ??= {x:1044,y:1556};
assert.equal(png.readUInt32BE(16),g.atlasSize.x);assert.equal(png.readUInt32BE(20),g.atlasSize.y);
// Laya's actual column/row formula: excludes leading margin, includes trailing separation.
assert.equal(Math.floor((g.atlasSize.x-g.margin.x)/(g.textureRegionSize.x+g.separation.x)),4);
assert.equal(Math.floor((g.atlasSize.y-g.margin.y)/(g.textureRegionSize.y+g.separation.y)),4);
for(let y=0;y<4;y++)for(let x=0;x<4;x++){const t=g.tiles[y][x];assert.equal(t.localPos.x??0,x);assert.equal(t.localPos.y??0,y);assert.equal(t.tileDatas[0].texture_origin.y,g.textureRegionSize.y/2-layout.pivot[1]);}
const context={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/systems/BrickWallGeometry.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2019}}).outputText,context);
const {wallFootprints,wallGroundAtX}=context.exports;
assert.equal(wallFootprints(0)[0][2]*128,48,'physical thickness preserved while length doubles');
assert.equal(wallFootprints(0)[0][3]*64,24,'physical thickness preserved on both ground axes');
assert.equal((.5-3/16)*128,40,'exposed connection arm grows from 8 to 40 horizontal pixels');
for(let mask=0;mask<16;mask++){
 const boxes=wallFootprints(mask);assert.ok(boxes.length>=1);assert.ok(wallGroundAtX(mask,0)!==null);
 for(const [u,v,w,h]of boxes){assert.ok(u>=-.5&&v>=-.5&&u+w<=.5&&v+h<=.5);}
 for(let bit=0;bit<4;bit++){
  const endpoints=[[.5,0],[0,.5],[-.5,0],[0,-.5]],p=endpoints[bit];
  const hit=boxes.some(([u,v,w,h])=>p[0]>=u&&p[0]<=u+w&&p[1]>=v&&p[1]<=v+h);
  assert.equal(hit,!!(mask&(1<<bit)),'correct open and joined ends');
 }
}
assert.equal(layout.cells.length,22);assert.equal(new Set(layout.cells.map(c=>c.x+','+c.y)).size,22);
assert.equal(set.groups.some(g=>g.id===1),false,'doorway tiles retired');
for(const mask of [16,17]) {
 const boxes=wallFootprints(mask),solid=wallFootprints(mask===16?5:10);
 const hit=(list,u,v)=>list.some(([x,y,w,h])=>u>=x&&u<=x+w&&v>=y&&v<=y+h);
 for(let i=-32;i<=32;i++)for(let j=-32;j<=32;j++){
  const u=i/64,v=j/64,along=mask===16?u:v;
  assert.equal(hit(boxes,u,v),hit(solid,u,v)&&Math.abs(along)>=.25,'door opening only removes middle, preserves full-length connections');
 }
 assert.equal(hit(boxes,0,0),false,'no collision in doorway');
 for(let x=-100;x<=100;x+=4)assert.equal(wallGroundAtX(mask,x),wallGroundAtX(mask===16?5:10,x),'lintel retains full rendering span');
}
console.log('PASS: doorway atlas retired; legacy doorway geometry remains compatible.');
console.log('PASS: atlas stride/GIDs, all 16 mask interfaces, ground extents, tile pivots and 22 sample cells.');
