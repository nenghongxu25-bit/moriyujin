const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
class Material {
    constructor() {
        this.values = {};
        this.shaderData = {
            setTexture: (k,v) => this.values[k] = v,
            setVector: (k,v) => this.values[k] = [...v.values]
        };
    }
    setShaderName() {}
    destroy() { this.destroyed = true; }
}
const Laya = {
    Script: class {}, regClass: () => x => x, property: () => () => {}, Material,
    Vector4: class { constructor(...v) { this.values=v; } setValue(...v) { this.values=v; } },
    Point: class { constructor(x=0,y=0) { this.setTo(x,y); } setTo(x,y) { this.x=x; this.y=y; } },
    RenderState: { CULL_NONE: 0 }, ShaderFeatureType: {}, ShaderDataType: {},
    Shader3D: { add: () => ({ addSubShader() {} }), propertyNameToID: x => x },
    SubShader: class { addShaderPass() {} }, timer: { delta: 1000 }
};
const context = { Laya, exports: {}, console, require: () => ({
    ForestWeatherMask: class { static uniforms={}; static glsl=''; static fitToGround() {} bind() {} destroy() {} }
}) };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/systems/GroundRain.ts','utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019, experimentalDecorators: true }
}).outputText, context);
const rain = new context.exports.GroundRain(), original = {};
rain.owner = {
    texture: { bitmap: {}, uv: [0,0,1,0,1,1,0,1], width: 1536, height: 1024 },
    material: original, width: 1536, height: 1024, alpha: 0, repaint() {}
};
rain.onAwake(); rain.onEnable();
assert.equal(rain.owner.alpha,1);
assert.equal(rain.owner.material.values.u_rainState[0],0);
rain.onUpdate(); assert.ok(Math.abs(rain.wetness - 1/18) < 1e-8);
for(let i=0;i<30;i++) rain.onUpdate();
assert.equal(rain.wetness,1);
rain.wetness=0.4; rain.rainIntensity=0; rain.onUpdate();
assert.equal(rain.wetness,0.4,'stopping rain preserves water');
assert.equal(rain.owner.material.values.u_rainState[2],0,'ripple intensity zero');
rain.autoAccumulate=false; rain.rainIntensity=1; rain.onUpdate();
assert.equal(rain.wetness,0.4,'manual mode');
rain.wetness=-1; rain.onUpdate(); assert.equal(rain.wetness,0);
rain.wetness=3; rain.onUpdate(); assert.equal(rain.wetness,1);
rain.trackFoot(200,200,0.016);
for(let i=0;i<120;i++) rain.trackFoot(200,200,0.016);
assert.equal(rain.nextStep,0,'idle never generates foot ripples');
rain.trackFoot(1000,1000,0.016);
assert.equal(rain.nextStep,0,'teleport ignored');
for(let i=1;i<=18;i++) rain.trackFoot(1000+i*4,1000,0.02);
assert.equal(rain.nextStep,1,'walking emits one ripple per stride');
assert.equal(rain.owner.material.values.u_step0[3],1);
for(let i=1;i<=18;i++) rain.trackFoot(1072+i*4,1000,0.0125);
assert.equal(rain.nextStep,2,'faster motion reaches stride sooner');
assert.equal(rain.owner.material.values.u_step1[3],1.25);
rain.rainIntensity=0;
for(let i=1;i<=18;i++) rain.trackFoot(1144+i*4,1000,0.02);
assert.equal(rain.nextStep,3,'foot ripples independent of falling rain');
rain.trackFoot(1220,1000,1);
assert.equal(rain.travelled,0,'background catch-up ignored');
const material=rain.owner.material;
rain.onDisable(); assert.equal(rain.owner.alpha,0);
assert.equal(rain.lastFoot,null);
assert.ok(rain.steps.every(s=>s.values[3]===0),'disable clears stale ripples');
rain.onEnable(); assert.equal(rain.owner.alpha,1);
rain.onDestroy(); assert.equal(material.destroyed,true);
assert.equal(rain.owner.material,original);
const scene=JSON.parse(fs.readFileSync('assets/scenes/forest.ls','utf8'));
const area=scene._$child.find(n=>n.name==='Area2D');
const decor=area._$child.findIndex(n=>n.name==='GroundDecorLayer');
assert.ok(decor<area._$child.findIndex(n=>n.name==='ActorLayer'));
const nodes=area._$child[decor]._$child;
assert.equal(nodes.find(n=>n.name==='GroundSnowPreview').active,false);
assert.equal(nodes.find(n=>n.name==='GroundRainPreview').texture._$uuid,'f3344eba-8afb-41ad-b3d3-0bccb5bfc37e');
assert.equal(nodes.find(n=>n.name==='GroundRainPreview')._$comp[0].playerNode._$ref,'eojseri5');
console.log('Ground rain: accumulation, rain stop, manual control, cleanup and scene wiring passed.');
