const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('assert');
class IndoorFloorLayer{onEnable(){this.repaired=true;}}
const Laya={LayaEnv:{isPlaying:false},regClass:()=>()=>{},runInEditor:()=>{},TileMapLayer:class{},Vector2:class{},Point:class{constructor(x,y){this.x=x;this.y=y;}}};
const ctx={exports:{},Laya,require:()=>({IndoorFloorLayer})};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/systems/RoomRegion.ts','utf8'),{compilerOptions:{module:1,target:4,experimentalDecorators:true}}).outputText,ctx);
const region=new ctx.exports.RoomRegion(),map={getCellData:(x,y)=>x>=0&&x<64&&y>=0&&y<32?{cell:{gid:0}}:null};
region.owner={alpha:.7,activeInHierarchy:true,getComponent:()=>map,globalToLocal:p=>({x:(p.x-100)/2,y:(p.y-50)/2})};
region.onEnable();assert(region.repaired);assert.equal(region.owner.alpha,.7,'guide visible in editor');
Laya.LayaEnv.isPlaying=true;region.onEnable();region.onStart();assert.equal(region.owner.alpha,0,'guide hidden in game');
assert(region.containsFoot({x:110,y:60}),'gid zero, hidden guide and transformed coordinates remain queryable');
assert(!region.containsFoot({x:99,y:60}));region.owner.activeInHierarchy=false;assert(!region.containsFoot({x:110,y:60}));
region.onDisable();assert.equal(region.owner.alpha,.7);region.owner.activeInHierarchy=true;region.onEnable();assert.equal(region.owner.alpha,0,'reenable hides guide again');
map.getCellData=()=>null;map.renderTileSize=32;map.pixelToGrid=(x,y,out)=>{out.x=-1;out.y=-1;};
map._chunkDatas={'-1':{'-1':{compressData:{0:[1023]}}}};
assert(region.containsFoot({x:110,y:60}),'unrendered hidden layer reads serialized GID zero in negative chunks');
map._chunkDatas['-1']['-1'].compressData={0:[]};assert(!region.containsFoot({x:110,y:60}),'erased logical cell is immediately excluded');
console.log('PASS: region editor/runtime guide, transformed membership, inactive exclusion, zero GID, disable/reenable, hidden unparsed chunks.');
