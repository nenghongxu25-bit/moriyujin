const fs=require('fs'),crypto=require('crypto');
const root='assets/tileset/buildings';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p,v)=>{fs.mkdirSync(require('path').dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');};
function meta(p,texture=false){if(!fs.existsSync(p+'.meta'))write(p+'.meta',{uuid:crypto.randomUUID(),...(texture?{importer:{textureType:2,filterMode:0}}:{})});return read(p+'.meta').uuid;}
function layer(file,name,set,script,extra={}){write(file,{_$ver:1,_$id:crypto.randomBytes(6).toString('hex'),_$type:'Sprite',name,...extra,_$comp:[{_$type:'TileMapLayer',tileSet:{_$uuid:meta(set),_$type:'TileSet'},chunkDatas:{_$type:'Record'}},{_$type:script}]});meta(file);}
const wallBase=read('assets/tileset/buildings/walls/brick/brick-wall.tres');
const roofBase=read('assets/tileset/buildings/roofs/slate/slate-roof.tres');
const gableBase=read('assets/tileset/buildings/walls/brick/brick-gable.tres');
const wallLabels={wood:'旧木板墙',concrete:'旧水泥墙',plaster:'旧白粉墙',stone:'灰石墙'};
const catalog={standard:'docs/building-tiles-standard.md',walls:[],floors:[],roofs:[]};
for(const [id,label]of Object.entries(wallLabels)){
 const dir=root+'/walls/'+id;const set=structuredClone(wallBase);
 set.groups[0].name=label;set.groups[0].atlas._$uuid=meta(dir+'/brick-wall-atlas.png',true);
 const file=dir+'/'+id+'-wall.tres';write(file,set);meta(file);
 layer(dir+'/'+id+'-wall-layer.lh','BrickWallLayer',file,'818f8acf-a35f-42d4-b285-b2d8b67d5af8');
 const gable=structuredClone(gableBase);
 for(let axis=0;axis<2;axis++){gable.groups[axis].name=label+'山墙 '+(axis?'V':'U');gable.groups[axis].atlas._$uuid=meta(dir+'/brick-gable-'+axis+'.png',true);}
 const gf=dir+'/'+id+'-gable.tres';write(gf,gable);meta(gf);
 layer(dir+'/'+id+'-gable-layer.lh','GableLayer',gf,'3591ef95-3f88-4957-88b2-bb349b43fcb1');
 const gl=read(dir+'/'+id+'-gable-layer.lh');gl._$comp[1].displayOrder=99999;write(dir+'/'+id+'-gable-layer.lh',gl);
 catalog.walls.push({id,label,tileset:file,gable:gf,tiles:16,gableTiles:14});
}
for(const [id,label]of [['terracotta','旧红瓦屋顶'],['metal','锈蚀金属屋顶']]){
 const dir=root+'/roofs/'+id,set=structuredClone(roofBase);
 for(let axis=0;axis<2;axis++){set.groups[axis].name=label+' '+(axis?'V':'U');set.groups[axis].atlas._$uuid=meta(dir+'/slate-roof-'+axis+'.png',true);}
 const file=dir+'/'+id+'-roof.tres';write(file,set);meta(file);
 layer(dir+'/'+id+'-roof-layer.lh','RoofLayer',file,'3591ef95-3f88-4957-88b2-bb349b43fcb1');
 catalog.roofs.push({id,label,tileset:file,tiles:42});
}
const floor=read('assets/tileset/buildings/floors/terrain/terrain-diamond.tres'),base=structuredClone(floor.groups[0].tiles[0][0]);
floor.groups=[floor.groups[0]];const g=floor.groups[0];g.id=0;g.name='室内地板 / 木板·水泥·石板';
g.atlas._$uuid=meta(root+'/floors/indoor-floor-atlas.png',true);g.atlasSize={_$type:'Vector2',x:792,y:136};
g._maxCellCount={_$type:'Vector2',x:3,y:1};g._maxAlternativesCount=3;g.tiles={_$type:'Record',0:{_$type:'Record'}};
['旧木板地板','水泥地板','灰石板地板'].forEach((label,i)=>{const t=structuredClone(base);t.localPos={_$type:'Vector2',x:i,y:0};g.tiles[0][i]=t;catalog.floors.push({gid:i,label});});
const ff=root+'/floors/indoor-floor.tres';write(ff,floor);meta(ff);
layer(root+'/floors/indoor-floor-layer.lh','IndoorFloorLayer',ff,'567e9b12-042a-4a56-88a1-a8e69f9fd745',{scaleX:.25,scaleY:.25});
for(const id of ['wood','concrete','plaster','stone','terracotta','metal'])meta(root+'/materials/'+id+'.png',true);
write(root+'/catalog.json',catalog);
// One empty house prefab shares the accepted scripts; users paint their own rooms.
const house=read('assets/tileset/buildings/roofs/slate/house-template.lh');
house._$id=crypto.randomBytes(6).toString('hex');
house._$child=[read(root+'/floors/indoor-floor-layer.lh'),read(root+'/walls/wood/wood-wall-layer.lh'),read(root+'/roofs/terracotta/terracotta-roof-layer.lh')];
house._$child[2]._$child=[read(root+'/walls/wood/wood-gable-layer.lh')];
for(const n of house._$child)delete n._$ver;
delete house._$child[2]._$child[0]._$ver;
// Preserve the authored standard model and its independent RoomRegions structure.
if(!fs.existsSync(root+'/house-template.lh'))write(root+'/house-template.lh',house);meta(root+'/house-template.lh');
console.log('Built 4 wall sets (64 tiles), 4 independent gable sets (56 tiles), 3 floor tiles, 2 roof sets (84 tiles).');
