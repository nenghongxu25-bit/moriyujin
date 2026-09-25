const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('assert');
function load(path,require=()=>({})){const ctx={exports:{},require};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:1,target:4}}).outputText,ctx);return ctx.exports;}
const geometry=load('src/systems/BrickWallGeometry.ts'),vision=load('src/systems/WallVisionGeometry.ts',()=>geometry);
// Reference clipping implementation used before the allocation/broad-phase optimization.
function reference(w,ax,ay,bx,by){
 const project=(x,y)=>{x=(x-w.x)/w.a;y=(y-w.y)/w.d;return[x/256+y/128,-x/256+y/128]};
 const a=project(ax,ay),b=project(bx,by);
 for(const [u,v,width,height]of geometry.wallFootprints(w.mask)){
  let enter=0,leave=1;
  for(let axis=0;axis<2;axis++){
   const lo=axis? v:u,hi=lo+(axis?height:width),delta=b[axis]-a[axis];
   if(Math.abs(delta)<1e-9){if(a[axis]<=lo||a[axis]>=hi){leave=-1;break;}}
   else {const p=(lo-a[axis])/delta,q=(hi-a[axis])/delta;enter=Math.max(enter,Math.min(p,q));leave=Math.min(leave,Math.max(p,q));}
  }
  if(enter<leave-1e-8&&leave>1e-8&&enter<1-1e-8)return true;
 }return false;
}
let seed=20260922;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
for(let i=0;i<50000;i++){
 const wall={mask:i%18,x:rand()*4000-2000,y:rand()*4000-2000,a:.1+rand()*3,d:.1+rand()*3};
 const ray=Array.from({length:4},()=>rand()*6000-3000);
 assert.equal(vision.wallBlocksSight(wall,...ray),reference(wall,...ray));
}
assert.strictEqual(geometry.wallFootprints(5),geometry.wallFootprints(5));
assert(Object.isFrozen(geometry.wallFootprints(5)[0]));
console.log('PASS: 50000 seeded rays match previous clipping; cached footprint arrays are immutable.');
