(async()=>{
 const scene=await Laya.Scene.open('scenes/city.ls');
 const layers=[];function visit(n){const l=n.getComponent(Laya.TileMapLayer);if(l&&l.tileSet){let count=0;for(const r of Object.values(l._chunkDatas))for(const c of Object.values(r)){for(const a of Object.values(c.compressData))if(Array.isArray(a))count+=a.length;}layers.push({name:n.name,parent:n.parent?.name,cells:count});}for(const c of n.children)visit(c);}visit(scene);
 const p=Laya.TileMapChunkData.prototype,chunk=Object.create(p);
 Object.assign(chunk,{_refGids:[3],_cellDataRefMap:{25:[1,2,3]}});
 return{guard:p.__projectTileSaveGuard===true,repairedSerialization:chunk.compressData,layers};
})()
