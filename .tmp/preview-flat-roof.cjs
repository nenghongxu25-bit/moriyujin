const fs=require('fs');
const p='assets/tileset/buildings/walls/brick/brick-wall-sample.ls';
const s=JSON.parse(fs.readFileSync('.tmp/flat-roof-sample-backup.json'));
const id=JSON.parse(fs.readFileSync('assets/tileset/buildings/roofs/flat-concrete/flat-roof.tres.meta')).uuid;
function walk(n){if(n.name==='RoofLayer'){
 n._$child=[];const layer=n._$comp[0];layer.tileSet._$uuid=id;
 const chunks={_$type:'Record'};
 for(let u=0;u<7;u++)for(let v=0;v<7;v++){
  const mask=(u===6?1:0)|(v===6?2:0)|(u===0?4:0)|(v===0?8:0);
  const x=Math.floor((u-v)/2),y=u+v,cx=Math.floor(x/32),cy=Math.floor(y/32),index=(y-cy*32)*32+x-cx*32;
  const row=chunks[cy]||={_$type:'Record'},c=row[cx]||={_$type:'TileMapChunkData',chunkX:cx,chunkY:cy,compressData:{_$type:'Record'},transFlags:{_$type:'Record'}};
  (c.compressData[mask]||=[]).push(index);c.transFlags[index]=0;
 }
 layer.chunkDatas=chunks;
}for(const c of n._$child||[])walk(c)}walk(s);fs.writeFileSync(p,JSON.stringify(s,null,2));
