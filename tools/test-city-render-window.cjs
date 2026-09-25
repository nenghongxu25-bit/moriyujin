const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('assert');
const Laya={Script:class{},Point:class{constructor(x,y){this.x=x;this.y=y;}},regClass:()=>()=>{},property:()=>()=>{},runInEditor:()=>{},stage:{width:1000,height:600}};
function load(file){const c={exports:{},Laya,require:p=>p.includes('WorldViewport')?load('src/systems/WorldViewport.ts'):({})};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:1,target:4,experimentalDecorators:true}}).outputText,c);return c.exports;}
const {clipRoomPolygon}=load('src/systems/RoomDarkness.ts');
const {stableRoomWindow}=load('src/systems/RoomDarkness.ts');
const viewport={x:0,y:0,width:1334,height:750};let cached=stableRoomWindow(viewport,null);
for(let x=1;x<90;x++)assert.strictEqual(stableRoomWindow({...viewport,x},cached),cached,'small camera moves reuse the same cache');
const jumped=stableRoomWindow({...viewport,x:6000},cached);assert.notStrictEqual(jumped,cached);assert.equal(jumped.width,cached.width);assert(jumped.x<=6000&&jumped.x+jumped.width>=7334);
assert.notStrictEqual(stableRoomWindow({...viewport,width:2000},cached),cached,'zoom/viewport changes resize safely');
const view={x:100,y:200,width:1000,height:600};
const clipped=clipRoomPolygon([-10000,-10000,10000,-10000,10000,10000,-10000,10000],view);
assert.equal(clipped.length,8);
for(let i=0;i<clipped.length;i+=2){assert(clipped[i]>=100&&clipped[i]<=1100);assert(clipped[i+1]>=200&&clipped[i+1]<=800);}
assert.equal(clipRoomPolygon([3000,3000,4000,3000,3500,4000],view).length,0);
assert.equal(clipRoomPolygon([100,200,200,200,200,300,100,300],view).length,8);
const {BrickWallTileLayer:Wall}=load('src/systems/BrickWallTileLayer.ts');
const layer=new Wall();let cameraX=0;layer.target={globalToLocal:p=>({x:p.x+cameraX,y:p.y})};layer.owner={visible:true};
function surface(x){const s={x,y:400,a:1,d:1,nodes:[],caps:[]};s.buildVisual=()=>s.nodes.push({});s.clearVisual=()=>s.nodes.length=0;return s;}
const near=surface(500),far=surface(6500);layer.surfaces=[near,far];layer.pieces=[{collision:true}];
layer.updateVisibleSurfaces();assert.equal(near.nodes.length,1);assert.equal(far.nodes.length,0);
layer.updateVisibleSurfaces();assert.equal(near.nodes.length,1,'no duplicate allocation');
cameraX=900;layer.updateVisibleSurfaces();assert.equal(near.nodes.length,1,'loaded wall survives just beyond its entry boundary');
cameraX=6000;layer.updateVisibleSurfaces();assert.equal(near.nodes.length,0);assert.equal(far.nodes.length,1);
cameraX=0;layer.updateVisibleSurfaces();assert.equal(near.nodes.length,1);assert.equal(far.nodes.length,0);
assert.equal(layer.pieces.length,1,'offscreen physics persists');
layer.owner.visible=false;layer.updateVisibleSurfaces();assert.equal(near.nodes.length,0);
const {worldViewportCorners}=load('src/systems/WorldViewport.ts');
Laya.RenderState2D={width:1000,height:600};
const area={mainCamera:{},transformPoint:(x,y)=>({x:x+6000,y:y+200}),localToGlobal:p=>p};
const world={parent:area,globalToLocal:p=>p};
assert.equal(worldViewportCorners(world,0)[0].x,6000,'camera offset is included even when Sprite transforms do not change');
console.log('PASS: bounded polygon clipping, distant shade exclusion, camera entry/exit/re-entry, no duplicate render nodes, persistent collision.');
