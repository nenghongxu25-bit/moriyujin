const fs=require('fs'),assert=require('assert');
const root='assets/tileset/buildings',read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
function check(candidate,base){
 const a=read(candidate),b=read(base);assert.deepStrictEqual(a.tileSize,b.tileSize);assert.equal(a.tileShape,b.tileShape);assert.equal(a.groups.length,b.groups.length);
 a.groups.forEach((g,i)=>{const expected=b.groups[i];for(const k of ['id','atlasSize','textureRegionSize','margin','separation','_maxCellCount','_maxAlternativesCount','tiles'])assert.deepStrictEqual(g[k],expected[k],candidate+': '+k);});
}
for(const id of ['wood','concrete','plaster','stone']){
 check(`${root}/walls/${id}/${id}-wall.tres`,'assets/tileset/buildings/walls/brick/brick-wall.tres');
 check(`${root}/walls/${id}/${id}-gable.tres`,'assets/tileset/buildings/walls/brick/brick-gable.tres');
 const l=read(`${root}/walls/${id}/${id}-wall-layer.lh`);assert.equal(l._$comp[1]._$type,'818f8acf-a35f-42d4-b285-b2d8b67d5af8');
 assert.deepStrictEqual(l._$comp[0].chunkDatas,{_$type:'Record'});
}
for(const id of ['terracotta','metal'])check(`${root}/roofs/${id}/${id}-roof.tres`,'assets/tileset/buildings/roofs/slate/slate-roof.tres');
const f=read(root+'/floors/indoor-floor.tres'),g=f.groups[0],original=read('assets/tileset/buildings/floors/terrain/terrain-diamond.tres').groups[0];
assert.deepStrictEqual(g.textureRegionSize,original.textureRegionSize);assert.deepStrictEqual(g.margin,original.margin);assert.deepStrictEqual(g.separation,original.separation);
for(let i=0;i<3;i++)assert.deepStrictEqual(g.tiles[0][i].tileDatas,original.tiles[0][0].tileDatas);
const ids=new Set();function walk(p){for(const e of fs.readdirSync(p,{withFileTypes:true})){const q=p+'/'+e.name;if(e.isDirectory())walk(q);else if(q.endsWith('.meta')){const id=read(q).uuid;assert(!ids.has(id),'duplicate UUID '+q);ids.add(id);}else if(q.endsWith('.tres'))for(const group of read(q).groups){assert(group.atlas._$uuid);}}}walk(root);
console.log('PASS: identical wall/roof/gable geometry, tile IDs, origins, scripts; floor diamond scale and unique new asset UUIDs.');
