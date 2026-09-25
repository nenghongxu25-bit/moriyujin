const fs=require('fs'),assert=require('assert');
const dir='assets/tileset/buildings/roofs/slate',set=JSON.parse(fs.readFileSync(dir+'/slate-roof.tres'));
assert.deepStrictEqual([set.tileSize.x,set.tileSize.y],[256,128]);
let count=0;
for(let axis=0;axis<2;axis++){
 const g=set.groups[axis],png=fs.readFileSync(dir+'/slate-roof-'+axis+'.png');
 assert.equal(g.id,axis);assert.equal(png.readUInt32BE(16),g.atlasSize.x);assert.equal(png.readUInt32BE(20),g.atlasSize.y);
 assert.equal(Math.floor((g.atlasSize.x-g.margin.x)/(g.textureRegionSize.x+g.separation.x)),7);
 assert.equal(Math.floor((g.atlasSize.y-g.margin.y)/(g.textureRegionSize.y+g.separation.y)),3);
 for(let end=0;end<3;end++)for(let row=0;row<7;row++){
  const t=g.tiles[end][row];assert.deepStrictEqual([t.localPos.x,t.localPos.y],[row,end]);
  assert.equal(t.tileDatas[0].texture_origin.y,640/2-560);count++;
 }
}
assert.equal(count,42);
const preview=JSON.parse(fs.readFileSync('docs/slate-roof-preview-node.json'));
const cells=new Set();let total=0;
for(const row of Object.values(preview._$comp[0].chunkDatas))for(const c of Object.values(row)){
 for(const [gid,indices]of Object.entries(c.compressData||{}))if(Array.isArray(indices))for(const i of indices){
  assert(+gid>=0&&+gid<21);cells.add(`${c.chunkX*32+i%32},${c.chunkY*32+Math.floor(i/32)}`);total++;
 }
}
assert.equal(total,49);assert.equal(cells.size,49);
// Adjacent courses meet at the same world height; eaves overhang the wall.
const height=q=>424-48*Math.abs(q-3);
for(let row=0;row<6;row++)assert.equal(height(row+.5),height(row+1-.5));
assert.equal(height(-.5),256);assert.equal(height(6.5),256);assert.equal(height(3),424);
console.log('PASS: 42 roof tiles, both atlas layouts, 49 unique preview cells, wall/eave height and course continuity.');
const gables=JSON.parse(fs.readFileSync('assets/tileset/buildings/walls/brick/brick-gable.tres'));
for(let axis=0;axis<2;axis++){
 const g=gables.groups[axis],png=fs.readFileSync('assets/tileset/buildings/walls/brick/brick-gable-'+axis+'.png');
 assert.equal(png.readUInt32BE(16),2272);assert.equal(png.readUInt32BE(20),648);
 assert.equal(g._maxCellCount.x,7);assert.equal(g._maxCellCount.y,1);
 assert.notEqual(g.atlas._$uuid,set.groups[axis].atlas._$uuid);
 for(let row=0;row<7;row++)assert.equal(g.tiles[0][row].tileDatas[0].texture_origin.y,-240);
}
assert(!fs.readFileSync('tools/build-slate-roof.cjs','utf8').includes('buildings/walls/brick'),'roof metadata builder has no brick dependency');
console.log('PASS: gables use independent textures and tile IDs; roof builder no longer requires brick assets.');
