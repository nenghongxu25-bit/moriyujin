const fs=require('fs'),crypto=require('crypto');
const dir='assets/tileset/buildings/walls/brick',roof=JSON.parse(fs.readFileSync('assets/tileset/buildings/roofs/slate/slate-roof.tres'));
const write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');
function meta(p,importer){if(!fs.existsSync(p+'.meta'))write(p+'.meta',{uuid:crypto.randomUUID(),...(importer?{importer}:{})});return JSON.parse(fs.readFileSync(p+'.meta')).uuid;}
const set=structuredClone(roof);
for(let axis=0;axis<2;axis++){
 const g=set.groups[axis];g.name=axis===0?'Brick gable U':'Brick gable V';
 g.atlas._$uuid=meta(dir+'/brick-gable-'+axis+'.png',{textureType:2,filterMode:0});
 g.atlasSize.y=648;g._maxCellCount.y=1;g._maxAlternativesCount=7;
 delete g.tiles[1];delete g.tiles[2];
}
write(dir+'/brick-gable.tres',set);const id=meta(dir+'/brick-gable.tres');
const layer={_$ver:1,_$id:'brickgablelayer',_$type:'Sprite',name:'GableLayer',_$comp:[{_$type:'TileMapLayer',tileSet:{_$uuid:id,_$type:'TileSet'},chunkDatas:{_$type:'Record'}},{_$type:'3591ef95-3f88-4957-88b2-bb349b43fcb1',displayOrder:99999}]};
write(dir+'/brick-gable-layer.lh',layer);meta(dir+'/brick-gable-layer.lh');
console.log('Built 14 independent brick gable tiles; existing wall and roof IDs unchanged.');
