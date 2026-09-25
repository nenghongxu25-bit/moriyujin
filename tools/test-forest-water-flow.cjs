const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
class Material {
 constructor(){this.values={};this.shaderData={setTexture:(k,v)=>this.values[k]=v,setVector:(k,v)=>this.values[k]=[...v.values]};}
 setShaderName(){} destroy(){this.destroyed=true;}
}
class Mask {static uniforms={};static glsl='';static fitToGround(g,n){return !!g;}bind(){}destroy(){this.destroyed=true;}}
const Laya={Script:class{},regClass:()=>x=>x,property:()=>()=>{},Material,
 Vector4:class{constructor(...v){this.values=v;}setValue(...v){this.values=v;}},
 RenderState:{CULL_NONE:0},ShaderFeatureType:{},ShaderDataType:{},
 Shader3D:{add:()=>({addSubShader(){}}),propertyNameToID:x=>x},SubShader:class{addShaderPass(){}},timer:{delta:16,once(){}}};
const ctx={Laya,exports:{},console,require:()=>({ForestWeatherMask:Mask})};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/systems/ForestWaterFlow.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2019,experimentalDecorators:true}}).outputText,ctx);
const flow=new ctx.exports.ForestWaterFlow(),original={};
flow.owner={texture:{bitmap:{},uv:[0,0,1,0,1,1,0,1]},material:original,width:7680,height:6784,x:-1280,y:-1536,repaint(){}};
flow.groundNode={};flow.onEnable();assert.equal(flow.owner.alpha,0);flow.onStart();
const mat=flow.owner.material;assert.equal(flow.owner.alpha,1);
flow.onUpdate();assert.ok(mat.values.u_flowState[0]>0);
Laya.timer.delta=100000;flow.onUpdate();assert.ok(flow.elapsed<.12,'background pause cannot jump flow');
assert.equal(flow.speed,12);assert.equal(flow.amplitude,5);
assert.ok(Math.abs(mat.values.u_flowState[2])<=flow.amplitude&&Math.abs(mat.values.u_flowState[3])<=flow.amplitude);
flow.speed=0;flow.amplitude=0;flow.onUpdate();assert.deepEqual(mat.values.u_flowState,[0,0,0,0]);
flow.onDisable();assert.equal(flow.owner.alpha,0);flow.onEnable();assert.equal(flow.owner.alpha,1);
flow.onDestroy();assert.equal(flow.owner.material,original);assert.equal(mat.destroyed,true);
assert.ok(fs.readFileSync('assets/tileset/forest/water-flow.png').equals(fs.readFileSync('backups/forest-water-generated-20260919-01/water-128.png')));
console.log('Water flow: initialization, bounded motion, pause clamp, disable and cleanup passed.');
