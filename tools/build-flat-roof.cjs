const fs=require('fs'),crypto=require('crypto');
const dir='assets/tileset/buildings/roofs/flat-concrete';
fs.mkdirSync(dir,{recursive:true});
const write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');
const meta=(p,importer)=>{if(!fs.existsSync(p+'.meta'))write(p+'.meta',{uuid:crypto.randomUUID(),...(importer?{importer}:{})});return JSON.parse(fs.readFileSync(p+'.meta')).uuid;};
const base=JSON.parse(fs.readFileSync('assets/tileset/buildings/roofs/slate/slate-roof.tres'));
const set=structuredClone(base),g=structuredClone(base.groups[0]);set.groups=[g];
g.id=0;g.name='Flat concrete / exposed edges 0-15';
g.atlas._$uuid=meta(dir+'/flat-roof-atlas.png',{textureType:2,filterMode:0});
g.atlasSize={_$type:'Vector2',x:1300,y:2580};g._maxCellCount={_$type:'Vector2',x:4,y:4};g._maxAlternativesCount=16;
g.tiles={_$type:'Record'};
for(let m=0;m<16;m++){
 const t=structuredClone(base.groups[0].tiles[0][0]);t.localPos={_$type:'Vector2',x:m%4,y:Math.floor(m/4)};
 (g.tiles[Math.floor(m/4)]||={_$type:'Record'})[m%4]=t;
}
write(dir+'/flat-roof.tres',set);const id=meta(dir+'/flat-roof.tres');
const layer=JSON.parse(fs.readFileSync('assets/tileset/buildings/roofs/slate/slate-roof-layer.lh'));
layer._$id='flatrooflayer';layer._$comp[0].tileSet._$uuid=id;
write(dir+'/flat-roof-layer.lh',layer);meta(dir+'/flat-roof-layer.lh');
console.log('Built flat concrete roof: 16 edge variants; standard grid, anchor and RoofTileLayer.');
