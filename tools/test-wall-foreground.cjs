const fs=require('fs'),vm=require('vm'),assert=require('assert'),ts=require('typescript');
function load(p,require=()=>({})){const c={exports:{},require,Laya:{Script:class{},regClass:()=>()=>{},property:()=>()=>{},runInEditor:()=>{}}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:1,target:4,experimentalDecorators:true}}).outputText,c);return c.exports;}
const geometry=load('src/systems/BrickWallGeometry.ts');
const {BrickWallTileLayer:Wall}=load('src/systems/BrickWallTileLayer.ts',p=>p.includes('Geometry')?geometry:{houseInteriorState:()=>false});
const parent={},layer=new Wall();layer.target=parent;Wall.live.add(layer);
for(const mask of [5,10])for(const scale of [.5,1,2]){
 layer.surfaces=[{mask,x:200,y:300,a:scale,d:scale}];
 assert(Wall.foregroundDepth(parent,200,300+40*scale,160*scale)>300+40*scale,'foreground weapon clears both wall directions');
 assert.equal(Wall.foregroundDepth(parent,200,300-40*scale,160*scale),300-40*scale,'behind wall stays behind');
}
layer.surfaces=[{mask:10,x:256,y:768,a:1,d:1},{mask:12,x:128,y:832,a:1,d:1}];
assert(Wall.foregroundDepth(parent,279,819,160)>855,'reported muzzle crosses neighbouring corner tile');
assert.equal(Wall.foregroundDepth(parent,279,740,160),740,'interior side does not gain foreground order');
layer.surfaces.push({mask:5,x:0,y:768,a:1,d:1});
assert.equal(Wall.foregroundDepth(parent,187.1,741.5,160),741.5,'inside corner cannot be promoted by the adjacent face');
assert(Wall.foregroundDepth(parent,279,819,160)>855,'outside corner still shows complete gun');
assert.equal(Wall.foregroundDepth(parent,279,819,0),819,'disabled props keep ordinary depth');
assert.equal(Wall.foregroundDepth({},279,819,160),819,'unrelated actor layer stays independent');
console.log('PASS: foreground gun, both faces, corner seam, behind-wall order, scales and opt-in.');
Wall.darknessDepth.set(parent,99998);
for(const mask of [5,10])for(const scale of [.5,1,2]){
 layer.surfaces=[{mask,x:200,y:300,a:scale,d:scale}];
 const foot=300+40*scale,depth=Wall.foregroundDepth(parent,200,foot,160*scale);
 const lit=Wall.lightingActorDepth(parent,200,foot,depth,160*scale);
 assert(lit>Wall.litDepth(99998,300+24*scale)&&lit<99999,'front actor and entire weapon clear lit wall band');
 const behind=300-40*scale;assert.equal(Wall.lightingActorDepth(parent,200,behind,behind,160*scale),behind,'behind actor stays behind solid wall');
}
assert.equal(Wall.lightingActorDepth({},200,340,340,160),340,'other worlds unaffected');
Wall.darknessDepth.delete(parent);assert.equal(Wall.lightingActorDepth(parent,200,340,340,160),340,'lighting disabled restores ground ordering');
console.log('PASS: lighting depth band preserves front/behind relation on both wall axes and all scales.');
