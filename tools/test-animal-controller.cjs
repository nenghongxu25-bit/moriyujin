// Deterministic controller tests; no editor, graphics, player state or saves.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');
const ts = require('typescript');
class Point { constructor(x=0,y=0){this.x=x;this.y=y;} setTo(x,y){this.x=x;this.y=y;return this;} }
class Sprite {
 constructor(){Object.assign(this,{x:0,y:0,alpha:1,scaleX:1,scaleY:1,active:true,activeInHierarchy:true,destroyed:false,components:[],scene:scene,name:'test',texture:null});}
 pos(x,y){this.x=x;this.y=y;return this;}
 getComponent(type){return this.components.find(c=>c instanceof type)||null;}
 localToGlobal(p){p.x+=this.x;p.y+=this.y;return p;}
 globalToLocal(p){p.x-=this.x;p.y-=this.y;return p;}
 event(){}
}
const scene={};
class Movement {
 static blocked=false;
 canTraverse(){return !Movement.blocked;}
 move(node,dx,dy){if(Movement.blocked)return{moved:false};node.x+=dx;node.y+=dy;return{moved:true};}
}
const Laya={Script:class{},Sprite,Point,Texture:class{},regClass:()=>c=>c,property:()=>()=>{},timer:{delta:16}};
function load(file,requires){const source=fs.readFileSync(path.join(__dirname,'..',file),'utf8');const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,experimentalDecorators:true}}).outputText;const exports={};vm.runInNewContext(js,{exports,require:n=>{if(!(n in requires))throw Error(n);return requires[n];},Laya,console,Math,Number});return exports;}
const animatorModule=load('src/Animals/AnimalFrameAnimator.ts',{});
const {AnimalFrameAnimator}=animatorModule;
const {AnimalController}=load('src/Animals/AnimalController.ts',{'./AnimalFrameAnimator':animatorModule,'../Player/PlayerController':{PlayerController:{activeInstance:null}},'../systems/TileBlockMovement':{TileBlockMovement:Movement}});
function fixture(aggressive=true){
 Movement.blocked=false;
 const owner=new Sprite(),parent=new Sprite(),view=new Sprite(),body=new Sprite(),target=new Sprite();owner.parent=parent;target.parent=parent;target.x=50;
 const damage={currentHp:1000,calls:0,takeDamage(n){this.currentHp-=n;this.calls++;},isDead(){return this.currentHp<=0;}};target.components=[damage];
 const animator=new AnimalFrameAnimator();animator.owner=owner;animator.viewNode=view;
 const frames=Array.from({length:8},()=>({width:160}));animator.walkFrames=frames;animator.runFrames=frames;animator.attackFrames=frames.slice(0,6);
 const animal=new AnimalController();animal.owner=owner;animal.targetNode=target;animal.hitBodyNode=body;animal.aggressive=aggressive;animal.patrolRadius=0;
 owner.components=[animator,animal];animator.onAwake();animal.onAwake();
 return {animal,animator,owner,view,body,target,damage};
}
let passed=0;
function test(name,fn){fn();passed++;console.log('PASS '+name);}
function ticks(a,n,dt=.05){for(let i=0;i<n;i++)a.tick(dt);}
test('passive boar requires damage',()=>{const f=fixture(false);ticks(f.animal,50);assert.equal(f.damage.calls,0);f.animal.takeDamage(1);f.animal.tick(.01);assert.equal(f.animal.state,'attack');});
test('one hit at frame 3, never during windup',()=>{const f=fixture();f.animal.tick(.01);ticks(f.animal,5);assert.equal(f.damage.calls,0);ticks(f.animal,2);assert.equal(f.damage.calls,1);ticks(f.animal,5);assert.equal(f.damage.calls,1);});
test('large delta crosses hit only once',()=>{const f=fixture();f.animal.tick(.01);f.animal.tick(.7);assert.equal(f.damage.calls,1);});
test('moving out of range dodges',()=>{const f=fixture();f.animal.tick(.01);f.target.x=250;ticks(f.animal,8);assert.equal(f.damage.calls,0);});
test('moving behind attacker dodges locked direction',()=>{const f=fixture();f.animal.tick(.01);f.target.x=-50;ticks(f.animal,8);assert.equal(f.damage.calls,0);});
test('invalid target never receives damage',()=>{for(const field of ['destroyed','inactive','dead']){const f=fixture();f.animal.tick(.01);if(field==='destroyed')f.target.destroyed=true;if(field==='inactive')f.target.activeInHierarchy=false;if(field==='dead')f.damage.currentHp=0;ticks(f.animal,8);assert.equal(f.damage.calls,0);}});
test('disable cancels unfinished hit',()=>{const f=fixture();f.animal.tick(.01);f.animal.onDisable();f.animal.tick(.4);assert.equal(f.damage.calls,0);});
test('death is terminal until reset, hitbox disabled',()=>{const f=fixture();f.animal.tick(.01);f.animal.takeDamage(10000);ticks(f.animal,25);assert(f.animal.isDead());assert.equal(f.owner.active,false);assert.equal(f.body.active,false);assert.equal(f.damage.calls,0);f.animal.resetAt(20,30);assert.equal(f.animal.currentHp,f.animal.maxHp);assert.equal(f.owner.alpha,1);assert.equal(f.body.active,true);});
test('wall blocks detection and retaliatory melee',()=>{const f=fixture();Movement.blocked=true;f.animal.tick(.1);assert.equal(f.animal.snapshot().aggro,false);f.animal.takeDamage(1);ticks(f.animal,30);assert.equal(f.damage.calls,0);});
test('movement stops at obstacles',()=>{const f=fixture();f.target.x=200;f.animal.tick(.1);assert(f.owner.x>0);Movement.blocked=true;const x=f.owner.x;f.animal.tick(.1);assert.equal(f.owner.x,x);});
test('visual flip does not flip root collider',()=>{const f=fixture();f.target.x=200;f.animal.tick(.1);assert.equal(f.view.scaleX,-1);assert.equal(f.owner.scaleX,1);f.target.x=-100;f.animal.tick(.1);assert.equal(f.view.scaleX,1);});
test('invalid damage never corrupts HP',()=>{const f=fixture();for(const n of [NaN,Infinity,-1,0,.5])f.animal.takeDamage(n);assert.equal(f.animal.currentHp,f.animal.maxHp);});
test('same animation never restarts per update',()=>{const f=fixture();f.animator.play('walk');f.animator.advance(.26);assert.equal(f.animator.frameIndex,2);f.animator.play('walk');assert.equal(f.animator.frameIndex,2);f.animator.play('attack');f.animator.advance(2);assert.equal(f.animator.frameIndex,5);});
test('missing frames stalls AI safely',()=>{const f=fixture();f.animator.attackFrames=[];ticks(f.animal,10);assert.equal(f.damage.calls,0);assert.equal(f.owner.x,0);});
test('new target cannot inherit a previous attack',()=>{const f=fixture();f.animal.tick(.01);const t=new Sprite();t.parent=f.target.parent;t.x=50;t.components=f.target.components;f.animal.targetNode=t;ticks(f.animal,8);assert.equal(f.damage.calls,0);});
console.log(`Animal controller: ${passed} tests passed.`);
