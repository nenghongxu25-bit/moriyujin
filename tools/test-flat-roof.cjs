const fs=require('fs'),assert=require('assert');
const dir='assets/tileset/buildings/roofs/flat-concrete';
const roof=JSON.parse(fs.readFileSync(dir+'/flat-roof.tres')),g=roof.groups[0];
const old=JSON.parse(fs.readFileSync('assets/tileset/buildings/roofs/slate/slate-roof.tres'));
assert.deepStrictEqual(roof.tileSize,old.tileSize);assert.equal(roof.tileShape,old.tileShape);
const png=fs.readFileSync(dir+'/flat-roof-atlas.png');
assert.equal(png.readUInt32BE(16),g.atlasSize.x);assert.equal(png.readUInt32BE(20),g.atlasSize.y);
assert.deepStrictEqual(g.textureRegionSize,old.groups[0].textureRegionSize);
for(let m=0;m<16;m++){
 const t=g.tiles[m>>2][m%4];assert.equal(t.localPos.x,m%4);assert.equal(t.localPos.y,m>>2);
 assert.deepStrictEqual(t.tileDatas,old.groups[0].tiles[0][0].tileDatas);
}
const layer=JSON.parse(fs.readFileSync(dir+'/flat-roof-layer.lh'));
assert.equal(layer.name,'RoofLayer');assert.equal(layer._$comp[0].tileSet._$uuid,JSON.parse(fs.readFileSync(dir+'/flat-roof.tres.meta')).uuid);
assert.equal(layer._$comp[1]._$type,'3591ef95-3f88-4957-88b2-bb349b43fcb1');
assert(!layer._$child?.length,'flat roof does not include pitched gables');
console.log('PASS: 16 tiles, PNG dimensions, standard grid/anchor, roof visibility component and no gable dependency.');
