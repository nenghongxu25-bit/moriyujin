const fs=require('fs'),crypto=require('crypto');
const folder='assets/tileset/city-isometric';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');
const meta=(p,texture=false)=>{if(!fs.existsSync(p+'.meta'))write(p+'.meta',{uuid:crypto.randomUUID(),...(texture?{importer:{textureType:2}}:{})});return read(p+'.meta').uuid;};
const backup='backups/city-before-diamond-20260921';fs.mkdirSync(backup,{recursive:true});
for(const name of ['city.png','city.png.meta','city.tres','city.tres.meta'])if(!fs.existsSync(`${backup}/${name}`))fs.copyFileSync(`assets/tileset/city/${name}`,`${backup}/${name}`);
meta(folder);meta(folder+'/tiles');
for(const name of fs.readdirSync(folder+'/tiles'))if(name.endsWith('.png'))meta(`${folder}/tiles/${name}`,true);
const tileset=read('assets/tileset/city/city.tres'),group=tileset.groups[0];
tileset.tileShape=1;tileset.tileSize={_$type:'Vector2',x:128,y:64};
group.atlas._$uuid=meta(folder+'/tiles/city-diamond-atlas.png',true);
group.atlasSize={_$type:'Vector2',x:794,y:342};
group.textureRegionSize={_$type:'Vector2',x:128,y:64};
group.margin={_$type:'Vector2',x:2,y:2};group.separation={_$type:'Vector2',x:4,y:4};
write(folder+'/city-diamond.tres',tileset);const tileUuid=meta(folder+'/city-diamond.tres');
const cells=[];
for(const [row,alts] of Object.entries(group.tiles)){if(row==='_$type')continue;for(const [col,a] of Object.entries(alts)){if(col==='_$type')continue;const x=a.localPos.x||0,y=a.localPos.y||0;cells.push({id:y*6+x,x,y});}}
console.log('Tile mapping',JSON.stringify(cells));
const compressData={_$type:'Record'},transFlags={_$type:'Record'};
for(const cell of cells){const x=4+Math.floor((cell.x-cell.y)/2),y=cell.x+cell.y,index=y*32+x;(compressData[cell.id]??=[]).push(index);transFlags[index]=0;}
const scene={_$ver:1,_$id:'cityDiamondPreview',_$type:'Scene',name:'CityDiamondPreview',width:1334,height:750,left:0,right:0,top:0,bottom:0,_$child:[{
 _$id:'cityDiamondGround',_$type:'Sprite',name:'CityDiamondGround',x:60,y:120,width:1280,height:600,
 _$comp:[{_$type:'TileMapLayer',layer:0,tileSet:{_$uuid:tileUuid,_$type:'TileSet'},chunkDatas:{_$type:'Record','0':{_$type:'Record','0':{_$type:'TileMapChunkData',chunkX:0,chunkY:0,compressData,transFlags}}}}]
}]};
write(folder+'/city-diamond-preview.ls',scene);meta(folder+'/city-diamond-preview.ls');
if(cells.length!==30)throw Error('Expected 30 tiles');
console.log('Created city diamond TileSet and native TileMap preview; source assets unchanged.');
