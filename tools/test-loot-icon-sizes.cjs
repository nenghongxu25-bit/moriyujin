const fs=require('fs'),assert=require('assert');
const root='assets/atlas/picture/items/extraction-loot-v1';
const manifest=JSON.parse(fs.readFileSync(root+'/manifest.json','utf8').replace(/^\uFEFF/,''));
for(const item of manifest.items){const b=fs.readFileSync(root+'/'+item.file),[w,h]=item.grid.split('x').map(Number);assert.equal(b.readUInt32BE(16),w*256,item.id+' width');assert.equal(b.readUInt32BE(20),h*256,item.id+' height');assert.equal(item.pixelWidth,w*256);assert.equal(item.pixelHeight,h*256);assert.equal(b[25],6,item.id+' RGBA');}
assert.equal(manifest.items.length,28);console.log('PASS: all 28 RGBA icons match their inventory footprints at 256 pixels per cell.');
