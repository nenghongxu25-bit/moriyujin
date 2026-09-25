import {installTileMapSerializationGuard} from './TileMapSerialization';
const {regClass}=Laya;
/** Keep a nested house floor behind the shared actor layer; repair engine save IDs. */
@regClass('567e9b12-042a-4a56-88a1-a8e69f9fd745')
@Laya.runInEditor
export class IndoorFloorLayer extends Laya.Script {
    onEnable():void {installTileMapSerializationGuard();this.repair();}
    onUpdate():void {if(!Laya.LayaEnv.isPlaying)this.repair();}
    private repair():void {
        const layer=this.owner.getComponent(Laya.TileMapLayer),chunks=layer&&(layer as any)._chunkDatas;
        if(!chunks)return;
        for(const row of Object.values(chunks))for(const chunk of Object.values(row)){
            const c=chunk as any;if(!c._cellDataRefMap||!c._refGids)continue;
            const repair=()=>{c._refGids.splice(0,c._refGids.length,...Object.keys(c._cellDataRefMap).filter(k=>c._cellDataRefMap[k]?.length).map(Number));};repair();
            if(Object.prototype.hasOwnProperty.call(c,'compressData'))continue;
            const d=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(c),'compressData');
            if(d?.get&&d.set)Object.defineProperty(c,'compressData',{configurable:true,get:()=>{repair();return d.get.call(c);},set:v=>d.set.call(c,v)});
        }
    }
}
