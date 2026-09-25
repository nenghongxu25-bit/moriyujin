const fs=require('fs'),assert=require('assert');
const items=JSON.parse(fs.readFileSync('assets/config/items/weapons.json','utf8')).items;
const manifest=JSON.parse(fs.readFileSync('docs/weapon-remaster-manifest.json','utf8').replace(/^\uFEFF/,''));
assert.equal(manifest.items.length,items.length);
for(const item of items){
 const file='assets/'+item.icon,b=fs.readFileSync(file),m=manifest.items.find(r=>r.id===item.id);
 assert(m,item.id);assert.equal(b.readUInt32BE(16),item.gridWidth*256);assert.equal(b.readUInt32BE(20),item.gridHeight*256);assert.equal(b[25],6,'RGBA: '+item.id);
 assert.equal(m.pixelWidth,item.gridWidth*256);assert.equal(m.pixelHeight,item.gridHeight*256);assert(fs.existsSync(m.localSource),'local source preserved');
 assert.equal(fs.readFileSync(file+'.meta','utf8'),fs.readFileSync('backups/weapons-before-remaster-20260921/'+item.icon+'.meta','utf8'),'metadata unchanged');
 assert(!b.equals(fs.readFileSync('backups/weapons-before-remaster-20260921/'+item.icon)),'image replaced');
}
console.log('PASS: all 12 weapon icons replaced, exact grid dimensions, RGBA, sources saved, original metadata retained.');
