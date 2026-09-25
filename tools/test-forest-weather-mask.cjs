const assert=require('node:assert/strict'), fs=require('node:fs'), vm=require('node:vm'), ts=require('typescript');
class Vec { constructor(...v){this.values=v;} }
class Point {constructor(x=0,y=0){this.setTo(x,y);}setTo(x,y){this.x=x;this.y=y;}}
class Tex {
    constructor(w,h){this.width=w;this.height=h;}
    setPixelsData(p){this.pixels=p;}
    destroy(){this.destroyed=true;}
}
Tex.whiteTexture={};
const Laya={Vector4:Vec,Point,Texture2D:Tex,TileMapLayer:class{},TextureFormat:{R8G8B8A8:1},FilterMode:{Point:0},ShaderDataType:{},Shader3D:{propertyNameToID:x=>x}};
const ctx={Laya,exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/systems/ForestWeatherMask.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2019}}).outputText,ctx);
const values={}, mat={shaderData:{setVector:(k,v)=>values[k]=v.values,setTexture:(k,v)=>values[k]=v}};
const atlas={width:768,height:1152};
const layer={tileSet:{tileSize:{x:128,y:128}},getCellData:(x,y)=>x<128?{cell:{cellowner:{localPos:{x:1,y:1},owner:{atlas}}}}:null};
const ground={getComponent:()=>layer,globalToLocal:p=>p}, overlay={width:256,height:128,localToGlobal:p=>p};
const mask=new ctx.exports.ForestWeatherMask();mask.bind(mat,ground,overlay);
const fitted={parent:{globalToLocal:p=>{p.x-=20;p.y-=40;}},pos(x,y){this.x=x;this.y=y;},size(w,h){this.width=w;this.height=h;}};
const fitGround={getComponent:()=>({rect:{x:-1280,y:-1536,z:6400,w:5248}}),localToGlobal:p=>{p.x+=120;p.y+=240;return p;}};
assert.equal(ctx.exports.ForestWeatherMask.fitToGround(fitGround,fitted),true);
assert.deepEqual([fitted.x,fitted.y,fitted.width,fitted.height],[-1180,-1336,7680,6784]);
assert.equal(ctx.exports.ForestWeatherMask.fitToGround(null,fitted),false);
assert.deepEqual(values.u_terrainGrid,[2,1,128,128]);
assert.deepEqual([...values.u_terrainCells.pixels],[2,2,0,255,0,0,0,0],'occupied water tile encoded; empty cell excluded');
assert.equal(values.u_terrainAtlas,atlas);
mask.destroy();assert.equal(values.u_terrainCells.destroyed,true);
const scene=JSON.parse(fs.readFileSync('assets/scenes/forest.ls','utf8'));
const area=scene._$child.find(n=>n.name==='Area2D');
const groundNode=area._$child.find(n=>n.name==='GroundLayer')._$child[0];
const effects=area._$child.find(n=>n.name==='GroundDecorLayer')._$child.filter(n=>/Ground(Rain|Snow)Preview/.test(n.name));
assert.equal(effects.length,2);
for(const n of effects){
    assert.equal(n.x,-1280);assert.equal(n.y,-1536);assert.equal(n.width,7680);assert.equal(n.height,6784);
    assert.equal(n._$comp[0].groundNode._$ref,groundNode._$id);
}
for(const row of Object.values(groundNode._$comp[0].chunkDatas)){
    if(typeof row!=='object')continue;
    for(const chunk of Object.values(row)){
        if(!chunk?.compressData)continue;
        // The atlas mask currently targets the forest's unrotated cells; catch future changes.
        for(const f of Object.values(chunk.transFlags??{})) if(typeof f==='number') assert.equal(f,0);
        for(const cells of Object.values(chunk.compressData))if(Array.isArray(cells))for(const i of cells){
            const x=(chunk.chunkX*32+i%32)*128,y=(chunk.chunkY*32+Math.floor(i/32))*128;
            for(const n of effects) assert.ok(x>=n.x&&y>=n.y&&x+128<=n.x+n.width&&y+128<=n.y+n.height);
        }
    }
}
console.log('Forest mask: lookup, empty cells, cleanup and every painted tile inside both weather bounds passed.');
