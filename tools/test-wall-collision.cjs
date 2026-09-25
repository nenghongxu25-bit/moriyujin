const fs=require('fs'),vm=require('vm'),assert=require('assert'),ts=require('typescript');
class Point{constructor(x=0,y=0){this.x=x;this.y=y;}setTo(x,y){this.x=x;this.y=y;return this;}}
const Laya={Point,Script:class{},regClass:()=>()=>{},property:()=>()=>{}};
function load(path){const c={exports:{},Laya,require:p=>load('src/systems/'+p.replace('./','')+'.ts')};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2017,experimentalDecorators:true}}).outputText,c);return c.exports;}
const {DepthObstacle}=load('src/systems/DepthObstacle.ts'),{wallFootprints}=load('src/systems/BrickWallGeometry.ts');
const scene={};
function frame(tx,ty,sx,sy){return{scene,activeInHierarchy:true,localToGlobal(p){return p.setTo(tx+p.x*sx,ty+p.y*sy);},globalToLocal(p){return p.setTo((p.x-tx)/sx,(p.y-ty)/sy);}};}
for(const scale of [.5,1,2]){
 const parent=frame(667,260,scale,scale),actor={parent,scene};
 const wall=frame(667+200*scale,260+300*scale,scale*1.25,scale*.8);
 const point=(u,v)=>parent.globalToLocal(wall.localToGlobal(new Point(128*(u-v),64*(u+v))));
 for(const [solid,door]of [[5,16],[10,17]]){
  const across=(along,cross)=>solid===5?point(along,cross):point(cross,along);
  for(const halfDepth of [0,20])for(const mask of [solid,door]){
   const obstacles=wallFootprints(mask).map(([x,y,w,h])=>{const o=new DepthObstacle();Object.assign(o,{owner:wall,isometricGround:true,blockX:x,blockY:y,blockWidth:w,blockHeight:h});o.onEnable();return o;});
   function hit(along,from,to){const a=across(along,from),b=across(along,to);return DepthObstacle.blocksMove(actor,a.x,a.y,b.x,b.y,0,30,halfDepth);}
   assert.equal(hit(0,-1,1),mask===solid,'solid blocks; doorway centre passes, both orientations');
   assert.equal(hit(0,1,-1),mask===solid,'reverse approach');
   assert(hit(.4,-1,1),'jamb remains solid');
   assert(hit(.4,-100,100),'high speed sweep cannot tunnel');
   assert(!hit(.4,.5,1),'outside visible wall is unobstructed');
   assert(hit(.4,.5,0),'crossing rendered wall face blocks');
   assert.equal(hit(.4,.5,.34),halfDepth>0,'front/back foot area stops both diagonal walls earlier');
   for(const o of obstacles)o.onDisable();
  }
 }
}
// Existing non-isometric decorations keep their rectangular behaviour.
const parent=frame(0,0,1,1),actor={parent,scene},o=new DepthObstacle();Object.assign(o,{owner:parent,blockX:10,blockY:10,blockWidth:20,blockHeight:20});o.onEnable();
assert(DepthObstacle.blocksMove(actor,0,20,40,20,0,0));assert(!DepthObstacle.blocksMove(actor,0,0,40,0,0,0));
assert(DepthObstacle.blocksMove(actor,10.1,20,40,20,0,0),'an overlapping start cannot cross the opposite wall face');
assert(!DepthObstacle.blocksMove(actor,10.1,20,9,20,0,0),'overlap can recover through nearest face');
assert(DepthObstacle.blocksMove(actor,10.1,20,10.05,100,0,0),'small outward x cannot excuse crossing another face');
assert(!DepthObstacle.blocksMove(actor,10.1,20,10.05,20,0,0),'small nearest-face recovery remains allowed');
assert(!DepthObstacle.blocksMove(actor,20,0,20,8,0,0,0),'zero-depth legacy point can approach within 2 pixels');
assert(DepthObstacle.blocksMove(actor,20,0,20,8,0,0,3),'front/back foot area cannot overlap a wall');
o.onDisable();
console.log('PASS: wall faces and jambs, both doorway directions, translated/nonuniform-scaled houses, high-speed sweeps, ordinary decorations.');
// Compare the broad phase against the unchanged narrow phase, including its
// conservative UV corner expansion, offsets, scales and overlapping starts.
let seed=9081,transforms=0;
const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
for(let i=0;i<12000;i++){
 const sx=.2+random()*3,sy=.2+random()*3,x=random()*1000-500,y=random()*1000-500;
 const wall=frame(x,y,sx,sy),original=wall.globalToLocal;
 Object.assign(wall,{parent,x,y,scaleX:sx,scaleY:sy});
 wall.globalToLocal=function(p){transforms++;return original.call(this,p);};
 const obstacle=new DepthObstacle();Object.assign(obstacle,{owner:wall,isometricGround:i%2===0,blockX:-.4,blockY:-.1,blockWidth:.8,blockHeight:.2});
 const args=[actor,x+random()*800-400,y+random()*800-400,x+random()*800-400,y+random()*800-400,random()*50,random()*40,random()*30];
 const fast=obstacle.blocks(...args);wall.parent=null;const reference=obstacle.blocks(...args);
 assert.equal(fast,reference,'broad phase must preserve collision result');
}
const far=frame(10000,10000,1,1);Object.assign(far,{parent,x:10000,y:10000,scaleX:1,scaleY:1});
far.globalToLocal=()=>{throw Error('far wall should not require coordinate transforms');};
const farObstacle=new DepthObstacle();Object.assign(farObstacle,{owner:far,isometricGround:true});
assert.equal(farObstacle.blocks(actor,0,0,2,3,12,30,20),false);
console.log('PASS: 12000 broad-phase/reference comparisons; distant wall needs zero coordinate transforms.');
{
 const obstacles=[];let checks=0;
 for(let i=0;i<3040;i++){
  const sx=.5+random()*2,sy=.5+random()*2,x=i<40?random()*1800-900:10000+i*300,y=i<40?random()*1800-900:10000;
  const wall=frame(x,y,sx,sy);Object.assign(wall,{parent,x,y,scaleX:sx,scaleY:sy});
  const o=new DepthObstacle();Object.assign(o,{owner:wall,isometricGround:true,blockX:-.4,blockY:-.1,blockWidth:.8,blockHeight:.2});
  o.onEnable();o.indexStaticWall();obstacles.push(o);
 }
 for(let i=0;i<600;i++){
  const args=[actor,random()*2400-1200,random()*2400-1200,random()*2400-1200,random()*2400-1200,random()*30,random()*35,random()*25];
  const indexed=DepthObstacle.blocksMove(...args);
  assert.equal(indexed,obstacles.some(o=>o.blocks(...args)),'partition query matches full wall scan');
 }
 for(const o of obstacles){const original=o.blocks;o.blocks=function(...args){checks++;return original.apply(this,args);};}
 DepthObstacle.blocksMove(actor,-950,-950,-949,-949,0,30,20);
 assert(checks<40,'3000 distant walls must not enter the precise collision query');
 for(const o of obstacles)o.onDisable();
 assert.equal(DepthObstacle.walls.size,0,'destroy/disable releases partition entries');
 assert.equal(DepthObstacle.blocksMove(actor,0,0,100,100,0,30,20),false);
 console.log('PASS: 3040 walls, 600 indexed/reference sweeps, nearby query checked '+checks+' walls; disable clears index.');
}
