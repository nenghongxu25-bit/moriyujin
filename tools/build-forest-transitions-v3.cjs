// Generates MCP edit requests, not scene files. Apply requests with the Laya MCP.
const fs = require('fs');
const path = require('path');
const idFor = name => require('crypto').createHash('sha256').update(name).digest('hex').slice(0,12);
const root = path.resolve(__dirname, '..');
const directory = 'assets/tileset/forest-kit-v3/';
const read = name => JSON.parse(fs.readFileSync(path.join(root,name), 'utf8'));
const uuid = name => read(directory+name+'.meta').uuid;
const v = (x,y) => ({'_$type':'Vector2',x,y});
const template = read('assets/tileset/forest-kit-v2/forest-terrain.tres');
function tileset(name) {
  const png=fs.readFileSync(path.join(root,directory,name+'.png'));
  if(png.readUInt32BE(16)!==1536||png.readUInt32BE(20)!==1024) throw Error('Unexpected atlas dimensions');
  const result=JSON.parse(JSON.stringify(template));
  result.tileSize=v(256,256);const group=result.groups[0];
  group.atlas={'_$uuid':uuid(name+'.png'),'_$type':'Texture2D'};
  group.atlasSize=v(1536,1024);group.textureRegionSize=v(256,256);
  group._maxCellCount=v(6,4);group._maxAlternativesCount=24;
  return result;
}
// Neighbor bits: N,E,S,W,NW,NE,SE,SW. Diagonals only matter when
// both adjoining cardinal neighbors are foreground (47 canonical masks).
function normalize(m) {
  if((m&9)!==9)m&=~16;if((m&3)!==3)m&=~32;
  if((m&6)!==6)m&=~64;if((m&12)!==12)m&=~128;
  return m;
}
const masks=[...new Set(Array.from({length:256},(_,m)=>normalize(m)))].sort((a,b)=>a-b);
if(masks.length!==47)throw Error('Expected 47 canonical masks');
function quarters(mask, grassForeground) {
  const offset=grassForeground?3:0, reverse=grassForeground?0:3;
  return [[0,0,8,1,16],[1,0,2,1,32],[0,1,8,4,128],[1,1,2,4,64]].map(([qx,qy,h,v,d])=>{
    let sx,sy,base=offset,kind;
    if(!(mask&h)&&!(mask&v)){sx=qx*2;sy=qy*2;kind='convex';}
    else if(!(mask&h)){sx=qx*2;sy=1;kind='vertical';}
    else if(!(mask&v)){sx=1;sy=qy*2;kind='horizontal';}
    else if(!(mask&d)){sx=(1-qx)*2;sy=(1-qy)*2;base=reverse;kind='concave';}
    else {sx=1;sy=1;kind='solid';}
    const gid=sy*6+base+sx;
    if(gid<0||gid>=24)throw Error('Undefined atlas cell');
    return {qx,qy,gid,kind};
  });
}
const kinds=new Set();
for(const foreground of [false,true])for(const mask of masks)for(const q of quarters(mask,foreground))kinds.add(q.qx+','+q.qy+':'+q.kind);
if(kinds.size!==20)throw Error('Missing quarter topology');
function mapCells(rows,grassForeground) {
  if(rows.some(r=>r.length!==rows[0].length))throw Error('Unequal map rows');
  const at=(x,y)=>rows[y]?.[x]==='1';const cells=[];
  const neighbors=[[0,-1,1],[1,0,2],[0,1,4],[-1,0,8],[-1,-1,16],[1,-1,32],[1,1,64],[-1,1,128]];
  rows.forEach((row,y)=>[...row].forEach((cell,x)=>{
    let qs;
    if(cell==='0') qs=[[0,0],[1,0],[0,1],[1,1]].map(([qx,qy])=>({qx,qy,gid:grassForeground?21:18}));
    else {
      const mask=neighbors.reduce((m,[dx,dy,bit])=>m|(at(x+dx,y+dy)?bit:0),0);
      qs=quarters(normalize(mask),grassForeground);
    }
    qs.forEach(q=>cells.push([x*2+q.qx,y*2+q.qy,q.gid]));
  }));return cells;
}
function node(name,set,cells,x=0,y=0,scale=.25) {
  const chunks={'_$type':'Record'};
  for(const [cx,cy,gid] of cells) {
    const chunkX=Math.floor(cx/32),chunkY=Math.floor(cy/32);
    chunks[chunkY]??={'_$type':'Record'};
    const c=chunks[chunkY][chunkX]??={'_$type':'TileMapChunkData',chunkX,chunkY,compressData:{'_$type':'Record'},transFlags:{'_$type':'Record'}};
    const index=(cy%32)*32+(cx%32);(c.compressData[gid]??=[]).push(index);c.transFlags[index]=0;
  }
  return {'_$id':idFor(name),'_$type':'Sprite',name,x,y,scaleX:scale,scaleY:scale,'_$comp':[{'_$type':'TileMapLayer',layer:0,tileSet:{'_$uuid':uuid(set+'.tres')},renderTileSize:32,lightReceive:false,chunkDatas:chunks}]};
}
const examples=[
 {name:'grass-island',set:'grass-water',grass:true,rows:['000000000','001111000','011011100','001111000','000000000']},
 {name:'grass-patch-in-dirt',set:'grass-dirt',grass:true,rows:['000000000','011110000','011111110','000011110','000000000']},
 {name:'concave-pond',set:'grass-water',grass:false,rows:['000000000','011111110','011001110','011101110','000000000']},
 {name:'branching-dirt',set:'grass-dirt',grass:false,rows:['000010000','000010000','011111110','001000100','001000100']}
];
const scene=(name,children)=>({'_$ver':1,'_$id':idFor(name),'_$type':'Scene',name,width:1334,height:750,left:0,right:0,top:0,bottom:0,'_$child':children});
const requests=[];const edit=(file,value)=>requests.push({name:'Laya_EditAsset',arguments:{file_path:directory+file,ops:[{op:'replace',path:'',value:JSON.stringify(value)}]}});
for(const set of ['grass-water','grass-dirt'])edit(set+'.tres',tileset(set));
const children=examples.map((e,i)=>{
 const cells=mapCells(e.rows,e.grass);
 const prefab=node(e.name,e.set,cells);prefab._$ver=1;edit('patterns/'+e.name+'.lh',prefab);
 return node(e.name,e.set,cells,i%2?731:27,i<2?30:390,.125);
});
edit('terrain-transitions-demo.ls',scene('TerrainTransitionsV3',children));
const coverage=[];
for(const [index,set] of ['grass-water','grass-dirt'].entries()) {
 const cells=[];
 masks.forEach((mask,i)=>quarters(mask,true).forEach(q=>cells.push([(i%8)*2+q.qx,Math.floor(i/8)*2+q.qy,q.gid])));
 coverage.push(node('All47_'+set,set,cells,index?687:27,120,.15625));
}
edit('terrain-47-patterns.ls',scene('Terrain47Patterns',coverage));
const report={canonicalMasks:masks.length,quarterKinds:kinds.size,materials:['grass-water','grass-dirt'],foregroundDirectionsPerMaterial:2,masks,patterns:masks.map(mask=>({mask,grassForeground:quarters(mask,true),otherForeground:quarters(mask,false)})),examples};
fs.mkdirSync(path.join(root,'.tmp'),{recursive:true});
fs.writeFileSync(path.join(root,'.tmp/forest-v3-requests.json'),JSON.stringify(requests));
fs.writeFileSync(path.join(root,directory,'topology.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({requestCount:requests.length,canonicalMasks:masks.length,quarterKinds:kinds.size,demoUuid:uuid('terrain-transitions-demo.ls'),coverageUuid:uuid('terrain-47-patterns.ls')}));
