import {IndoorFloorLayer} from './IndoorFloorLayer';
const {regClass}=Laya;

/** Editor-painted logical room; rendering never defines its membership. */
@regClass('f97a2854-4901-4ced-974c-e694db888b03')
@Laya.runInEditor
export class RoomRegion extends IndoorFloorLayer {
    private authoredAlpha:number|null=null;
    onEnable():void {super.onEnable();this.hideRuntimeGuide();}
    onStart():void {this.hideRuntimeGuide();if(Laya.LayaEnv.isPlaying)console.info(`[RoomRegion] ${this.owner.name}: logical room ready`);}
    private hideRuntimeGuide():void {
        if(!Laya.LayaEnv.isPlaying)return;
        const node=this.owner as Laya.Sprite;
        if(this.authoredAlpha===null)this.authoredAlpha=node.alpha;
        node.alpha=0;
    }
    public containsFoot(foot:Laya.Point):boolean {
        const node=this.owner as Laya.Sprite;
        if(!node.activeInHierarchy)return false;
        const map=node.getComponent(Laya.TileMapLayer);
        const p=node.globalToLocal(new Laya.Point(foot.x,foot.y),false);
        if(!map)return false;
        // Hidden layers may never run the engine's lazy render-cell parsing.
        // Membership must read painted data, independently of render visibility.
        const chunks=(map as any)._chunkDatas;
        if(chunks){
            const grid=new Laya.Vector2();map.pixelToGrid(p.x,p.y,grid);
            const size=map.renderTileSize;
            const cx=Math.floor(grid.x/size),cy=Math.floor(grid.y/size);
            const chunk=chunks[cy]?.[cx];
            if(!chunk)return false;
            const index=(grid.y-cy*size)*size+grid.x-cx*size;
            return Object.values(chunk.compressData).some((indices:any)=>Array.isArray(indices)&&indices.includes(index));
        }
        return !!map.getCellData(p.x,p.y,true)?.cell;
    }
    onDisable():void {
        const node=this.owner as Laya.Sprite;
        if(this.authoredAlpha!==null&&!node.destroyed)node.alpha=this.authoredAlpha;
        this.authoredAlpha=null;
    }
}
