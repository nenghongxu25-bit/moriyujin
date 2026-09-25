const fs=require('fs'),vm=require('vm'),assert=require('assert'),ts=require('typescript');
const PlayerController={activeInstance:null};
const Laya={Script:class{},Sprite:class{},TileMapLayer:class{},Point:class{constructor(x,y){this.x=x;this.y=y;}},regClass:()=>()=>{},property:()=>()=>{},timer:{delta:50}};
const state={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/systems/HouseInteriorState.ts','utf8'),{compilerOptions:{module:1,target:4}}).outputText,state);
class RoomRegion{}
const context={exports:{},Laya,require:p=>p.includes('HouseInteriorState')?state.exports:p.includes('RoomRegion')?{RoomRegion}:{PlayerController},console:{info(){},error(){}}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/systems/HouseRoofVisibility.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2017,experimentalDecorators:true}}).outputText,context);
const scene={};
function makeHouse(offset){
 const map={getCellData(x,y,pixel){assert(pixel);return x>=0&&x<100&&y>=0&&y<100&&!(x>=40&&x<60&&y>=40&&y<60)?{cell:{gid:0}}:null;}};
 const floor={activeInHierarchy:true,children:[],getComponent:()=>map,globalToLocal:p=>({x:(p.x-offset)/2,y:p.y/2})};
 const roof={alpha:.8};const script=new context.exports.HouseRoofVisibility();script.owner={name:'House',scene,getChildByName:n=>n==='RoofLayer'?roof:n==='IndoorFloorLayer'?floor:null};script.onStart();return{script,roof,floor};
}
const a=makeHouse(100),b=makeHouse(1000);
assert(a.script.containsFoot({x:120,y:20}),'transformed interior and gid zero');
assert(!a.script.containsFoot({x:200,y:100}),'unpainted hole excluded');
assert(!a.script.containsFoot({x:90,y:20}),'outside excluded');
assert(!b.script.containsFoot({x:120,y:20}),'another house stays outside');
const actor={x:120,y:20,scene,parent:{localToGlobal:p=>p}};a.script.player=actor;b.script.player=actor;
for(let i=0;i<4;i++){a.script.onLateUpdate();b.script.onLateUpdate();}
assert.equal(a.roof.alpha,0);assert.equal(b.roof.alpha,.8);
assert(state.exports.allowsHouseWallReveal({parent:a.script.owner}),'inside house allows wall reveal');
assert(!state.exports.allowsHouseWallReveal({parent:b.script.owner}),'other house keeps solid walls');
actor.x=400;a.script.onLateUpdate();a.script.onLateUpdate();assert.equal(a.roof.alpha,0,'brief boundary crossing does not flash roof');
for(let i=0;i<6;i++)a.script.onLateUpdate();assert.equal(a.roof.alpha,.8);
assert(!state.exports.allowsHouseWallReveal({parent:a.script.owner}),'exit restores roof and denies wall reveal');
actor.x=120;a.script.onLateUpdate();actor.x=400;for(let i=0;i<8;i++)a.script.onLateUpdate();assert.equal(a.roof.alpha,.8,'reverse fade without stale tween');
actor.x=120;for(let i=0;i<4;i++)a.script.onLateUpdate();a.script.onDisable();assert.equal(a.roof.alpha,.8,'disable restores authored opacity');
// A real player uses the same foot offset as movement collision.
a.script.player=null;actor.y=-60;PlayerController.activeInstance={owner:actor,tileBlockFootOffsetY:80};
for(let i=0;i<4;i++)a.script.onLateUpdate();assert.equal(a.roof.alpha,0);
actor.destroyed=true;for(let i=0;i<4;i++)a.script.onLateUpdate();assert.equal(a.roof.alpha,.8);
console.log('PASS: painted cells/holes, transformed floor, separate houses, 0.2s fade/reversal, foot offset, disable and missing player.');
PlayerController.activeInstance=null;
const roomA={owner:{name:'A'},containsFoot:p=>p.x>=0&&p.x<100};
const roomB={owner:{name:'B'},containsFoot:p=>p.x>=100&&p.x<200};
const region=r=>({activeInHierarchy:true,children:[],getComponent:t=>t===RoomRegion?r:null});
const regions={activeInHierarchy:true,children:[region(roomA),region(roomB)],getComponent:()=>null};
const roof={alpha:1},script=new context.exports.HouseRoofVisibility();
script.owner={name:'new-house',scene,getChildByName:n=>n==='RoomRegions'?regions:n==='RoofLayer'?roof:null};script.onStart();
const player={x:50,y:0,scene,parent:{localToGlobal:p=>p}};script.player=player;
for(let i=0;i<4;i++)script.onLateUpdate();assert.equal(script.activeRoom,roomA);assert.equal(roof.alpha,0);
player.x=150;script.onLateUpdate();assert.equal(script.activeRoom,roomB);assert.equal(roof.alpha,0,'adjacent room transition never flashes roof');
regions.children=[];for(let i=0;i<8;i++)script.onLateUpdate();assert.equal(script.activeRoom,null);assert.equal(roof.alpha,1,'empty explicit region container never falls back to visible floor');
assert(!script.containsFoot({x:50,y:0}));
console.log('PASS: independent regions without a floor, adjacent room identity, roof continuity, empty region exclusion.');
