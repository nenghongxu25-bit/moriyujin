const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('assert');
function load(p,require=()=>({})){const c={exports:{},require,Laya:{Script:class{},regClass:()=>()=>{},property:()=>()=>{},runInEditor:()=>{}}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:1,target:4,experimentalDecorators:true}}).outputText,c);return c.exports;}
const geometry=load('src/systems/BrickWallGeometry.ts');
const {BrickWallTileLayer:Wall}=load('src/systems/BrickWallTileLayer.ts',p=>p.includes('BrickWallGeometry')?geometry:{houseInteriorState:()=>undefined});
{
 Wall.live.clear();const layer=new Wall(),far=new Wall(),target={};
 layer.target=far.target=target;layer.owner=far.owner={visible:true,activeInHierarchy:true,alpha:1};
 const cap={node:{},bit:1};layer.surfaces=[{mask:5,x:0,y:0,a:1,d:1,caps:[cap]}];
 let scans=0;Object.defineProperty(far,'surfaces',{get(){scans++;return [{mask:5,x:10000,y:10000,a:1,d:1}];}});
 Wall.live.add(layer);Wall.live.add(far);layer.updateCaps();assert.equal(scans,1);
 for(let i=0;i<100;i++)layer.updateCaps();assert.equal(scans,1,'stationary connectivity does not rescan distant houses');
 Wall.sightRevision++;layer.updateCaps();assert.equal(scans,2,'rebuilding geometry invalidates connectivity');
 Wall.live.clear();
}
for(const own of [0,.28,.5,1])for(const other of [0,.28,.5,1]){
 const a=geometry.wallCapAlpha(own,other);assert(a>=0&&a<=1);
 if(own>=other)assert(Math.abs(a*(1-other)+other-own)<1e-8,'join never exceeds desired opacity');else assert.equal(a,0);
}
for(const bit of [1,2])for(const scale of [.5,1,2]){
 Wall.live.clear();const layer=new Wall(),adjacent=new Wall(),target={};
 layer.owner={visible:true,activeInHierarchy:true,alpha:1};adjacent.owner={visible:true,activeInHierarchy:true,alpha:1};layer.target=adjacent.target=target;
 const cap={node:{},bit},s={mask:bit===1?5:10,x:10,y:20,a:scale,d:scale,opacity:1,caps:[cap]};
 const n={mask:bit===1?5:10,x:10+(bit===1?128:-128)*scale,y:20+64*scale,a:scale,d:scale,opacity:1};
 layer.surfaces=[s];adjacent.surfaces=[n];Wall.live.add(layer);Wall.live.add(adjacent);
 layer.updateCaps();assert.equal(cap.node.alpha,0,'opaque neighbours hide interior cap');
 n.opacity=.28;layer.updateCaps();assert.equal(cap.node.alpha,1,'solid remaining wall closes opening');
 s.opacity=.28;layer.updateCaps();assert.equal(cap.node.alpha,0,'equal translucent neighbours do not double-blend');
 adjacent.owner.visible=false;layer.updateCaps();assert.equal(cap.node.alpha,.28,'hidden neighbour restores own cap');
 adjacent.owner.visible=true;adjacent.target={};layer.updateCaps();assert.equal(cap.node.alpha,.28,'different actor layer is not connected');
 adjacent.target=target;n.x+=1;layer.updateCaps();assert.equal(cap.node.alpha,.28,'nearby but unaligned wall does not suppress end');
 Wall.live.delete(adjacent);s.opacity=1;layer.updateCaps();assert.equal(cap.node.alpha,1,'removed neighbour restores complete wall');
 layer.owner.visible=false;layer.updateCaps();assert.equal(cap.node.alpha,0);
}
for(const bit of [1,2]){
 Wall.live.clear();const layer=new Wall(),target={};layer.target=target;layer.owner={visible:true,activeInHierarchy:true,alpha:1};Wall.live.add(layer);
 const cap={node:{},bit},s={mask:bit===1?5:10,x:0,y:0,a:1,d:1,opacity:.28,caps:[cap]},n={mask:bit===1?5:10,x:bit===1?128:-128,y:64,a:1,d:1,opacity:1};layer.surfaces=[s,n];
 Wall.darknessDepth.set(target,99998);layer.updateCaps();assert.equal(cap.node.alpha,.28,'wall under darkness cannot suppress foreground cap');
 n.opacity=.28;layer.updateCaps();assert.equal(cap.node.alpha,0,'same lighting band still avoids doubled cap opacity');
 n.opacity=1;Wall.darknessDepth.delete(target);layer.updateCaps();assert.equal(cap.node.alpha,0,'disabling darkness restores ordinary cap rule');
}
for(const mask of [5,10]){let count=0;for(let x=-127.5;x<128;x++){const cap=geometry.wallConnectorCap(mask,x);if(cap){count++;assert.equal(cap.bottom-cap.top,256);}}assert.equal(count,48,'full 48px connector face separated');}
assert.equal(geometry.wallConnectorCap(0,64),null,'actual short end is never removed');
console.log('PASS: both axes, shared/separate layers, scales, solid/translucent/hidden/removed neighbours, cap compositing and exact face bounds.');
