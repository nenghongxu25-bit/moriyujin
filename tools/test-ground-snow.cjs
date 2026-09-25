const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

class Material {
    constructor() {
        this.values = {};
        this.shaderData = {
            setTexture: (k, v) => this.values[k] = v,
            setVector: (k, v) => this.values[k] = v,
            setNumber: (k, v) => this.values[k] = v
        };
    }
    setShaderName() {}
    destroy() { this.destroyed = true; }
}
const Laya = {
    Script: class {}, regClass: () => x => x, property: () => () => {},
    Material, Vector4: class { constructor(...values) { this.values = values; } },
    RenderState: { CULL_NONE: 0 }, ShaderFeatureType: {}, ShaderDataType: {},
    Shader3D: { add: () => ({ addSubShader() {} }), propertyNameToID: x => x },
    SubShader: class { addShaderPass() {} }, timer: { delta: 1000 }
};
const context = { Laya, exports: {}, console, require: () => ({
    ForestWeatherMask: class { static uniforms={}; static glsl=''; static fitToGround() {} bind() {} destroy() {} }
}) };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/systems/GroundSnow.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019, experimentalDecorators: true }
}).outputText, context);
const snow = new context.exports.GroundSnow();
const original = {};
snow.owner = {
    texture: { bitmap: {}, uv: [0, 0, 1, 0, 1, 1, 0, 1], width: 128, height: 128 },
    material: original, x: -160, y: 3700, width: 1536, height: 1024, alpha: 0, repaint() {}
};
snow.onAwake(); snow.onEnable();
assert.equal(snow.owner.alpha, 1);
assert.equal(snow.owner.material.values.u_snowCoverage, 0);
snow.onUpdate(); snow.onUpdate();
assert.equal(snow.coverage, 0, 'startup delay');
snow.onUpdate();
assert.ok(Math.abs(snow.coverage - 1 / 30) < 1e-8, 'time based accumulation');
for (let i = 0; i < 60; i++) snow.onUpdate();
assert.equal(snow.coverage, 0.9, 'stops at configured maximum');
snow.autoAccumulate = false; snow.coverage = 0.35; snow.onUpdate();
assert.equal(snow.owner.material.values.u_snowCoverage, 0.35, 'manual coverage');
snow.coverage = -1; snow.onUpdate(); assert.equal(snow.coverage, 0);
snow.coverage = 2; snow.onUpdate(); assert.equal(snow.coverage, 1);
snow.onDisable(); assert.equal(snow.owner.alpha, 0);
snow.onEnable(); assert.equal(snow.owner.alpha, 1);
const material = snow.owner.material;
snow.onDestroy();
assert.equal(snow.owner.material, original);
assert.equal(material.destroyed, true);
assert.equal(snow.owner.alpha, 0);

const scene = JSON.parse(fs.readFileSync('assets/scenes/forest.ls', 'utf8'));
const area = scene._$child.find(n => n.name === 'Area2D');
const decor = area._$child.findIndex(n => n.name === 'GroundDecorLayer');
assert.ok(decor > area._$child.findIndex(n => n.name === 'GroundLayer'));
assert.ok(decor < area._$child.findIndex(n => n.name === 'ActorLayer'));
const node = area._$child[decor]._$child.find(n => n.name === 'GroundSnowPreview');
assert.equal(node.texture._$uuid, '9b73924f-6eb3-4ee9-82c6-0736f536a5f6');
assert.equal(node._$comp[0]._$type, '490e7f77-d07b-4c90-863b-e7bc71a68659');
console.log('Ground snow: accumulation, manual control, lifecycle and scene wiring passed.');
