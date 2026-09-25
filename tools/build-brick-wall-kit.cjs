const fs=require('fs'),crypto=require('crypto');
const dir='assets/tileset/buildings/walls/brick';
const write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+'\n');
const meta=(p,uuid=crypto.randomUUID(),importer)=>{if(!fs.existsSync(p+'.meta'))write(p+'.meta',{uuid,...(importer?{importer}:{})});return JSON.parse(fs.readFileSync(p+'.meta','utf8')).uuid;};
meta('src/systems/BrickWallTileLayer.ts','818f8acf-a35f-42d4-b285-b2d8b67d5af8');
meta('src/systems/BrickWallWalkthrough.ts','f46d1f31-2b7f-4f2f-88bb-64a6e40a1f51');
meta('src/systems/BrickWallGeometry.ts');
const atlas=meta(dir+'/brick-wall-atlas.png',undefined,{textureType:2,filterMode:0});
meta(dir+'/brick-material-source.png',undefined,{textureType:2});
const template=JSON.parse(fs.readFileSync('assets/tileset/forest/forest-diamond.tres','utf8'));
const cell=template.groups[0].tiles[0][0];
const set=structuredClone(template),g=set.groups[0];
set.tileSize={_$type:'Vector2',x:256,y:128};set.tileShape=1;
g.name='Brick walls / long arms';g.atlas._$uuid=atlas;g.atlasSize={_$type:'Vector2',x:1044,y:1556};
g.textureRegionSize={_$type:'Vector2',x:256,y:384};g.margin={_$type:'Vector2',x:2,y:2};g.separation={_$type:'Vector2',x:4,y:4};
g._maxCellCount={_$type:'Vector2',x:4,y:4};g._maxAlternativesCount=16;g.tiles={_$type:'Record'};
for(let i=0;i<16;i++){const x=i%4,y=i>>2,t=structuredClone(cell);t.localPos={_$type:'Vector2',x,y};t.tileDatas[0].texture_origin={_$type:'Vector2',x:0,y:-144};t.tileDatas[0].y_sort_origin=144;(g.tiles[y]||={_$type:'Record'})[x]=t;}
write(dir+'/brick-wall.tres',set);const setID=meta(dir+'/brick-wall.tres');
const makeLayer=(name,cells)=>{
 const chunks={_$type:'Record'};for(const {x,y,gid}of cells){const cx=Math.floor(x/32),cy=Math.floor(y/32),idx=((y%32+32)%32)*32+(x%32+32)%32;
 const row=chunks[cy]||={_$type:'Record'},ch=row[cx]||={_$type:'TileMapChunkData',chunkX:cx,chunkY:cy,compressData:{_$type:'Record'},transFlags:{_$type:'Record'}};(ch.compressData[gid]||=[]).push(idx);ch.transFlags[idx]=0;}
 return{_$id:crypto.randomBytes(6).toString('hex'),_$type:'Sprite',name,_$comp:[{_$type:'TileMapLayer',tileSet:{_$uuid:setID,_$type:'TileSet'},chunkDatas:chunks},{_$type:'818f8acf-a35f-42d4-b285-b2d8b67d5af8',scriptPath:'../../../src/systems/BrickWallTileLayer.ts'}]};
};
const empty=makeLayer('BrickWallLayer',[]);empty._$ver=1;write(dir+'/brick-wall-layer.lh',empty);meta(dir+'/brick-wall-layer.lh');
// Square-grid u/v coordinates map to Laya's staggered isometric rows.
const points=new Map();function add(u,v){points.set(u+','+v,{u,v});}
for(let u=0;u<=6;u++)add(u,0);
for(let v=0;v<=6;v++)add(0,v);
for(let u=0;u<=6;u++)if(u!==3&&u!==4)add(u,6); // two-cell walk-through entrance
for(let v=0;v<=6;v++)add(6,v);
const cells=[];for(const {u,v}of points.values()){
 let mask=0;[[1,0], [0,1], [-1,0], [0,-1]].forEach(([du,dv],i)=>{if(points.has((u+du)+','+(v+dv)))mask|=1<<i;});
 const row=u+v,col=Math.floor((u-v)/2);cells.push({x:col,y:row,gid:mask});}
const wall=makeLayer('BrickWallLayer',cells);
const player=JSON.parse(fs.readFileSync('assets/prefab/prefab_player.lh','utf8'))._$child[0];
player.y=-80;
const actor={_$id:'brickactor',_$type:'Sprite',name:'WalkHere',x:-96,y:416,_$comp:[{_$type:'1806c38c-ebc3-45d1-a8a0-322ed94be4cb',groundY:0},{_$type:'f46d1f31-2b7f-4f2f-88bb-64a6e40a1f51'}],_$child:[player]};
const scene={_$ver:1,_$id:'brickwallsample',_$type:'Scene',name:'BrickWallSample',width:1334,height:750,left:0,right:0,top:0,bottom:0,_$comp:[{_$type:'86fb35d4-bffe-4012-bc9f-85f003b0b723'}],_$child:[{_$id:'brickworld',_$type:'Sprite',name:'ActorLayer',x:640,y:280,_$child:[wall,actor]}]};
if(!fs.existsSync(dir+'/brick-wall-sample.ls'))write(dir+'/brick-wall-sample.ls',scene);meta(dir+'/brick-wall-sample.ls');
write(dir+'/layout.json',{grid:[256,128],tileImage:[256,384],pivot:[128,336],wallHeight:256,atlas:[1044,1556],margin:2,separation:4,maskBits:['+u','+v','-u','-v'],cells});
console.log(JSON.stringify({setID,atlas,paintedCells:cells.length}));
