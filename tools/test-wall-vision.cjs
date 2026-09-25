const fs=require('fs'),vm=require('vm'),assert=require('assert'),ts=require('typescript');
const Laya={Script:class{},Point:class{constructor(x,y){this.x=x;this.y=y;}},regClass:()=>()=>{},property:()=>()=>{},runInEditor:()=>{},LayaEnv:{isPlaying:true},timer:{delta:100}};
function load(p,require=()=>({})){const c={exports:{},require,Laya};vm.runInNewContext(ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:1,target:4,experimentalDecorators:true}}).outputText,c);return c.exports;}
const geometry=load('src/systems/BrickWallGeometry.ts');
const vision=load('src/systems/WallVisionGeometry.ts',()=>geometry);
const interior=load('src/systems/HouseInteriorState.ts');
const {BrickWallTileLayer:Wall}=load('src/systems/BrickWallTileLayer.ts',p=>p.includes('SpatialBuckets')?load('src/systems/SpatialBuckets.ts'):p.includes('HouseInteriorState')?interior:p.includes('WallVision')?vision:p.includes('Geometry')?geometry:{});
for(const mask of [5,10])for(const scale of [.5,1,2]){
 const wall={mask,x:200,y:300,a:scale*1.2,d:scale*.8};
 const p=(u,v)=>[200+128*(u-v)*wall.a,300+64*(u+v)*wall.d];
 const a=mask===5?p(0,-1):p(-1,0),b=mask===5?p(0,1):p(1,0);
 assert(vision.wallBlocksSight(wall,...a,...b),'both diagonal faces block sight under scaling');
 assert(vision.wallBlocksSight(wall,...b,...a),'sight is symmetric');
 assert(!vision.wallBlocksSight({...wall,mask:mask===5?16:17},...a,...b),'opening admits sight');
 assert(!vision.wallBlocksSight(wall,...a,...a),'same-point visibility');
}
const scene=JSON.parse(fs.readFileSync('assets/tileset/buildings/walls/brick/brick-wall-sample.ls','utf8'));
const house=scene._$child[0]._$child[0],wallNode=house._$child.find(n=>n.name==='BrickWallLayer');
const chunks=wallNode._$comp[0].chunkDatas,parent={localToGlobal:p=>p,globalToLocal:p=>p};
const layer=new Wall();layer.target=parent;layer.surfaces=[];
for(const row of Object.values(chunks))for(const ch of Object.values(row))if(ch?.compressData)for(const [mask,indices]of Object.entries(ch.compressData))if(Array.isArray(indices))for(const i of indices){const r=ch.chunkY*32+Math.floor(i/32),c=ch.chunkX*32+i%32;layer.surfaces.push({mask:Number(mask),x:(2*c+(r&1)+1)*128,y:(r+1)*64,a:1,d:1});}
Wall.live.add(layer);
assert(Wall.canSeeGround(parent,125,448,131,769),'same-room corner visible from centre');
assert(!Wall.canSeeGround(parent,125,448,131,900),'outside target stays hidden behind front wall');
const actor={parent,scene,activeInHierarchy:true,visible:true};Wall.viewers.set(actor,{x:125,foot:448});
assert.equal(Wall.targetVisible({parent,scene,x:131},769),true);
assert.equal(Wall.targetVisible({parent,scene,x:131},900),false);
assert.equal(Wall.targetVisible(actor,448),true,'observer always visible');
Wall.viewers.clear();assert.equal(Wall.targetVisible({parent,scene,x:131},900),null,'no observer does not hide a scene');
layer.owner={alpha:1,visible:true};
const houseOwner={};layer.owner.parent=houseOwner;
for(const inside of [false,true,false]){
 interior.setHouseInterior(houseOwner,inside);
 Wall.viewers.set(actor,{x:125,foot:448});
 for(const s of layer.surfaces){s.opacity=.28;s.nodes=[{alpha:.28,visible:true}];}
 layer.onLateUpdate();
 assert(layer.surfaces.every(s=>s.opacity===1&&s.nodes[0].alpha===1),'walls stay solid indoors and outdoors');
 assert.equal(layer.revealed.size,0,'no wall reveal selection');
}
Wall.viewers.clear();
console.log('PASS: wall sight blocking and permanent opaque rendering indoors/outdoors.');

{
 const before=Wall.canSeeGround(parent,125,448,131,900);
 const far=new Wall();far.target=parent;far.surfaces=Array.from({length:3000},(_,i)=>({mask:5,x:10000+i*300,y:10000,a:1,d:1}));
 Wall.live.add(far);Wall.sightRevision++;
 assert.equal(Wall.canSeeGround(parent,125,448,131,900),before);
 const index=Wall.sightIndexes.get(parent);
 const candidates=Array.from(index.grid.query(125,448,131,900));
 assert(candidates.length<layer.surfaces.length+1,'far houses do not enter local sight queries');
 for(let i=0;i<500;i++){
  const ray=[i*17%2400-1200,i*31%2400-1200,i*53%2400-1200,i*73%2400-1200];
  assert.equal(Wall.canSeeGround(parent,...ray),!layer.surfaces.concat(far.surfaces).some(s=>vision.wallBlocksSight(s,...ray)));
 }
 Wall.live.delete(layer);Wall.live.delete(far);Wall.sightRevision++;
 assert(Wall.canSeeGround(parent,125,448,131,900),'removed walls leave no stale occlusion');
 console.log('PASS: 3000 distant walls excluded, 500 indexed/reference rays, removal invalidates sight index.');
}
