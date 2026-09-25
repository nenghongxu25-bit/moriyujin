const fs = require('fs');
const dir = 'assets/tileset/forest-kit-v2/';
const uuid = file => JSON.parse(fs.readFileSync(dir + file + '.meta', 'utf8')).uuid;
const template = JSON.parse(fs.readFileSync('assets/tileset/forest/forest.tres', 'utf8'));
const exemplar = template.groups[0].tiles[0][0];
const vector = (x, y) => ({'_$type':'Vector2', x, y});
function tileSet(texture) {
  const set = JSON.parse(JSON.stringify(template));
  set.tileSize = vector(256,256);
  const group = set.groups[0];
  group._maxCellCount = vector(6,4); group._maxAlternativesCount = 24;
  group.atlas = {'_$uuid':uuid(texture),'_$type':'Texture2D'};
  group.atlasSize = vector(1536,1024); group.textureRegionSize = vector(256,256);
  group.tiles = {'_$type':'Record'};
  for(let y=0;y<4;y++) {
    group.tiles[y] = {'_$type':'Record'};
    for(let x=0;x<6;x++) {
      const tile=JSON.parse(JSON.stringify(exemplar)); tile.localPos=vector(x,y); group.tiles[y][x]=tile;
    }
  }
  return set;
}
function layer(name, tileSetFile, cells, x, y, scale, zOrder) {
  const compressData={'_$type':'Record'},transFlags={'_$type':'Record'};
  for(const [cx,cy,id] of cells) { const n=cy*32+cx; (compressData[id]??=[]).push(n); transFlags[n]=0; }
  return {'_$id':name,'_$type':'Sprite',name,x,y,scaleX:scale,scaleY:scale,'_$comp':[{'_$type':'TileMapLayer',layer:zOrder,renderTileSize:32,lightReceive:false,tileSet:{'_$uuid':uuid(tileSetFile)},chunkDatas:{'_$type':'Record','0':{'_$type':'Record','0':{'_$type':'TileMapChunkData',chunkX:0,chunkY:0,compressData,transFlags}}}}]};
}
const grid=Array.from({length:7},(_,y)=>Array.from({length:20},(_,x)=>(x+y)%5===0?19:18));
function nineSlice(x,y,w,h,offset) {
  for(let j=0;j<h;j++) for(let i=0;i<w;i++) grid[y+j][x+i]=(j===0?0:j===h-1?2:1)*6+offset+(i===0?0:i===w-1?2:1);
}
nineSlice(1,2,12,3,0);
nineSlice(14,0,5,6,3);
grid[3][5]=22;grid[3][6]=23;grid[3][7]=22;
grid[0][4]=20;grid[0][5]=20;grid[1][4]=20;
const ground=grid.flatMap((r,y)=>r.map((id,x)=>[x,y,id]));
const props=[[0,0,22],[1,0,3],[2,1,2],[4,1,12],[5,0,1],[7,1,4],[9,0,21],[10,1,3],[12,0,22],[13,1,18],[15,1,19],[17,2,19],[18,5,18],[19,4,8],[0,4,6],[1,5,3],[2,5,13],[3,6,0],[4,5,14],[6,5,16],[7,6,17],[8,5,15],[10,5,8],[11,6,5],[12,5,20],[13,6,23],[19,0,21],[19,6,10],[0,6,4],[3,1,11]];
const catalog=Array.from({length:24},(_,id)=>[id%12,Math.floor(id/12),id]);
const scene={'_$ver':1,'_$id':'forestKitDemoV2','_$type':'Scene',name:'ForestKitV2',width:1334,height:750,left:0,right:0,top:0,bottom:0,'_$child':[
  layer('TerrainExample','forest-terrain.tres',ground,27,27,0.25,0),
  layer('ForestElementsExample','forest-props.tres',props,27,27,0.25,1),
  layer('All24ReusableElements','forest-props.tres',catalog,91,519,0.375,2)
]};
const edit=(file,value)=>({name:'Laya_EditAsset',arguments:{file_path:dir+file,ops:[{op:'replace',path:'',value:JSON.stringify(value)}]}});
const requests=[edit('forest-terrain.tres',tileSet('forest-terrain.png')),edit('forest-props.tres',tileSet('forest-props.png')),edit('forest-kit-demo.ls',scene)];
fs.writeFileSync('.tmp/forest-kit-v2-requests.json',JSON.stringify(requests));
console.log(JSON.stringify({sceneUuid:uuid('forest-kit-demo.ls'),terrainTiles:24,propTiles:24,mapCells:ground.length,propInstances:props.length+catalog.length}));
