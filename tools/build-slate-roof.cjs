const fs=require('fs'),crypto=require('crypto');
const dir='assets/tileset/buildings/roofs/slate';
const write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');
const meta=(p,importer)=>{if(!fs.existsSync(p+'.meta'))write(p+'.meta',{uuid:crypto.randomUUID(),...(importer?{importer}:{})});return JSON.parse(fs.readFileSync(p+'.meta')).uuid;};
meta(dir+'/slate-material-source.png',{textureType:2});
const source=JSON.parse(fs.readFileSync(dir+'/slate-roof.tres'));
const set={_$type:'TileSet',tileSize:{_$type:'Vector2',x:256,y:128},tileShape:1,groups:[]};
for(let axis=0;axis<2;axis++){
 const g=structuredClone(source.groups[0]);g.id=axis;g.name=axis===0?'Ridge U / grey slate':'Ridge V / grey slate';
 g.atlas._$uuid=meta(dir+'/slate-roof-'+axis+'.png',{textureType:2,filterMode:0});
 g.atlasSize={_$type:'Vector2',x:2272,y:1936};g.textureRegionSize={_$type:'Vector2',x:320,y:640};
 g._maxCellCount={_$type:'Vector2',x:7,y:3};g._maxAlternativesCount=21;g.tiles={_$type:'Record'};
 for(let end=0;end<3;end++)for(let row=0;row<7;row++){
  const t=structuredClone(source.groups[0].tiles[0][0]);t.localPos={_$type:'Vector2',x:row,y:end};
  t.tileDatas[0].texture_origin={_$type:'Vector2',x:0,y:-240};t.tileDatas[0].y_sort_origin=240;
  (g.tiles[end]||={_$type:'Record'})[row]=t;
 }
 set.groups.push(g);
}
write(dir+'/slate-roof.tres',set);const id=meta(dir+'/slate-roof.tres');
const layer={_$ver:1,_$id:'slaterooflayer',_$type:'Sprite',name:'RoofLayer',_$comp:[{_$type:'TileMapLayer',tileSet:{_$uuid:id,_$type:'TileSet'},chunkDatas:{_$type:'Record'}},{_$type:'3591ef95-3f88-4957-88b2-bb349b43fcb1'}]};
write(dir+'/slate-roof-layer.lh',layer);meta(dir+'/slate-roof-layer.lh');
const chunks={_$type:'Record'};
for(let u=0;u<7;u++)for(let v=0;v<7;v++){
 const x=Math.floor((u-v)/2),y=u+v,cx=Math.floor(x/32),cy=Math.floor(y/32),index=(y-cy*32)*32+x-cx*32;
 const end=u===0?1:u===6?2:0,gid=end*7+v;
 const row=chunks[cy]||={_$type:'Record'},c=row[cx]||={_$type:'TileMapChunkData',chunkX:cx,chunkY:cy,compressData:{_$type:'Record'},transFlags:{_$type:'Record'}};
 (c.compressData[gid]||=[]).push(index);c.transFlags[index]=0;
}
const preview=structuredClone(layer);delete preview._$ver;preview._$comp[0].chunkDatas=chunks;
write('docs/slate-roof-preview-node.json',preview);
console.log('Built 42 roof tiles, two orientations; preview node ready.');

