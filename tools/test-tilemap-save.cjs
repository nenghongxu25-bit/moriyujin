const fs=require('fs'),vm=require('vm'),assert=require('assert'),ts=require('typescript');
const folder='library/minifiedJsCache/';
const engine=fs.readFileSync(folder+fs.readdirSync(folder).find(p=>p.startsWith('laya.tilemap-')),'utf8');
const start=engine.indexOf('_setCell(i,a,r){');assert(start>=0);
const setCell=Function('e','t','return ({'+engine.slice(start,engine.indexOf('_clearChunkCellInfo(e){',start))+'})')({TileMapDirtyFlag:{CELL_CHANGE:1}},{})._setCell;
class Chunk {
 get compressData(){const out={};this._refGids.forEach(g=>{if(this._cellDataRefMap[g])out[g]=this._cellDataRefMap[g]});return out;}
 set compressData(v){this._cellDataRefMap=v;this._refGids=Object.keys(v).map(Number);}
}
Chunk.prototype._setCell=setCell;
const source=ts.transpileModule(fs.readFileSync('src/systems/TileMapSerialization.ts','utf8'),{compilerOptions:{module:1,target:4}}).outputText;
const context={exports:{},Laya:{TileMapChunkData:Chunk}};vm.runInNewContext(source,context);
const wrapped=Chunk.prototype._setCell;context.exports.installTileMapSerializationGuard();assert.strictEqual(wrapped,Chunk.prototype._setCell,'hot reload does not double wrap');
for(const [a,b]of [[3,5],[0,28],[28,0]]){
 const old={gid:a,_removeNoticeRenderTile(){}},next={gid:b,z_index:0,y_sort_origin:0,_addNoticeRenderTile(){}};
 const c=Object.assign(new Chunk(),{_refGids:[a,b],_cellDataRefMap:{[a]:[0],[b]:[1,2]},_cellDataMap:{0:{cell:old,chuckLocalindex:0,celly:0}},_breakBatch(){return false},_setDirtyFlag(){}});
 c._setCell(0,next,5);
 assert.deepStrictEqual(c.compressData,{[b]:[1,2,0]},'all replacement tiles survive immediate save');
 assert.equal(c._cellDataMap[0]._transFlag,5,'rotation/flip preserved');
 c._refGids=[];assert.deepStrictEqual(c.compressData,{[b]:[1,2,0]},'recover live chunks already damaged before patch');
 const roundtrip=new Chunk();roundtrip.compressData=JSON.parse(JSON.stringify(c.compressData));assert.deepStrictEqual(roundtrip.compressData,c.compressData);
 delete c._cellDataRefMap[b];assert.deepStrictEqual(c.compressData,{},'removed cells are never resurrected');
}
console.log('PASS: engine last-cell overwrite, existing live index damage, gid zero, flags, serialization round-trip, removal and idempotent install.');
