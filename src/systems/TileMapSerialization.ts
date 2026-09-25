/** Work around Laya's last-cell replacement removing the NEW gid from _refGids.
 * The per-gid cell table remains intact, but compressData otherwise omits that
 * entire tile type on save. Install before painting, including ordinary roads.
 */
export function repairTileChunkReferences(chunk:any):void {
    if(!chunk?._cellDataRefMap||!Array.isArray(chunk._refGids))return;
    const gids=Object.keys(chunk._cellDataRefMap).filter(k=>chunk._cellDataRefMap[k]?.length>0).map(Number);
    if(gids.length===chunk._refGids.length&&gids.every((gid,i)=>gid===chunk._refGids[i]))return;
    chunk._refGids.splice(0,chunk._refGids.length,...gids);
}

export function installTileMapSerializationGuard():void {
    const proto=(Laya.TileMapChunkData as any)?.prototype;
    if(!proto||proto.__projectTileSaveGuard)return;
    const descriptor=Object.getOwnPropertyDescriptor(proto,'compressData');
    if(!descriptor?.get||!descriptor.set)return;
    Object.defineProperty(proto,'compressData',{
        ...descriptor,
        get:function(){repairTileChunkReferences(this);return descriptor.get.call(this);}
    });
    // Also repair immediately around paint/erase, so render/resource bookkeeping
    // never consumes the broken list between the edit and the next save.
    for(const name of ['_setCell','_removeCell']){
        const original=proto[name];if(typeof original!=='function')continue;
        proto[name]=function(...args:any[]){
            repairTileChunkReferences(this);
            try{return original.apply(this,args);}finally{repairTileChunkReferences(this);}
        };
    }
    Object.defineProperty(proto,'__projectTileSaveGuard',{value:true});
}

installTileMapSerializationGuard();
