const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
class Vector4{constructor(...v){this.values=v;}setValue(...v){this.values=v;}}
class Material{constructor(){this.values={};this.shaderData={setVector:(k,v)=>this.values[k]=[...v.values]};}setShaderName(){}destroy(){this.destroyed=true;}}
class Mask{static uniforms={};static glsl='';bind(){}destroy(){this.destroyed=true;}}
class GroundRain{}
const Laya={Script:class{},Sprite:class{},Vector4,Material,regClass:()=>v=>v,property:()=>()=>{},
    ShaderFeatureType:{},ShaderDataType:{},RenderState:{CULL_NONE:0},
    Shader3D:{add:()=>({addSubShader(){}}),propertyNameToID:v=>v},
    SubShader:class{addShaderPass(){}},timer:{delta:1000,once(){}}};
const context={Laya,exports:{},require:()=>({ForestWeatherMask:Mask,GroundRain})};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/systems/ForestRiverSurface.ts','utf8'),{
    compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2019,experimentalDecorators:true}
}).outputText,context);
const river=new context.exports.ForestRiverSurface(),original={};
river.owner={texture:{uv:[0,0,1,0,1,1,0,1]},width:7680,height:6784,x:-1280,y:-1536,material:original,repaint(){}};
const rain={enabled:true,rainIntensity:0.75};
river.groundNode={};river.rainNode={activeInHierarchy:true,getComponent:()=>rain};
river.onAwake();river.onEnable();
assert.equal(river.owner.alpha,1);
river.onUpdate();assert.equal(river.owner.material.values.u_riverState[0],1);
assert.equal(river.owner.material.values.u_riverState[1],0.75);
rain.rainIntensity=0;river.onUpdate();assert.equal(river.owner.material.values.u_riverState[1],0);
assert.equal(river.owner.alpha,1,'water remains when rain stops');
rain.rainIntensity=1;river.rainNode.activeInHierarchy=false;river.onUpdate();
assert.equal(river.owner.material.values.u_riverState[1],0,'inactive rain node suppresses rain rings');
river.onDisable();assert.equal(river.owner.alpha,0);
river.onEnable();assert.equal(river.owner.alpha,1);
const material=river.owner.material;river.onDestroy();
assert.equal(material.destroyed,true);assert.equal(river.owner.material,original);
const before=JSON.parse(fs.readFileSync('backups/forest-river-polish/forest-before.ls','utf8'));
const after=JSON.parse(fs.readFileSync('assets/scenes/forest.ls','utf8'));
assert.deepEqual(after._$child[0]._$child[0],before._$child[0]._$child[0],'ground tiles unchanged');
const nodes=after._$child[0]._$child.find(n=>n.name==='GroundDecorLayer')._$child;
assert.equal(nodes[0].name,'ForestRiverSurface');
assert.equal(nodes[0]._$comp[0].groundNode._$ref,'grx8wpt5');
console.log('River surface: rain control, lifecycle, ground preservation and scene wiring passed.');
