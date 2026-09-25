const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('assert');
const ctx={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/systems/WallDepthSort.ts','utf8'),{compilerOptions:{module:1,target:4}}).outputText,ctx);
let seed=17;const rand=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
for(let run=0;run<30;run++){
 const nodes=Array.from({length:2000},(_,id)=>({id,_zOrder:Math.floor(rand()*50)-25})),structs=nodes.map(n=>({id:n.id}));
 const expected=nodes.slice();for(let i=1;i<expected.length;i++){const item=expected[i];let j=i-1;while(j>=0&&expected[j]._zOrder>item._zOrder){expected[j+1]=expected[j];j--;}expected[j+1]=item;}
 ctx.exports.sortWallChildren(nodes,structs);assert.deepStrictEqual(nodes,expected);assert.deepStrictEqual(structs.map(s=>s.id),nodes.map(n=>n.id));
}
let calls=0;const owner={_$children:Array.from({length:150},(_,id)=>({id,_zOrder:150-id})),_struct:{children:Array.from({length:150},(_,id)=>({id}))},updateZOrder(){calls++;}};
ctx.exports.installWallDepthSort(owner);const fn=owner.updateZOrder;ctx.exports.installWallDepthSort(owner);assert.strictEqual(fn,owner.updateZOrder);owner.updateZOrder();assert.equal(calls,1);assert.equal(owner._$children[0].id,149);
console.log('PASS: 60000 children match engine insertion order, equal-depth stability, paired render structures, engine callback and idempotent install.');
