const { regClass, property } = Laya;
import { DepthBlendRenderer } from "./DepthBlendRenderer";
import { BrickWallTileLayer } from "./BrickWallTileLayer";

/** Attach to siblings in a shared world layer; only the draw order changes. */
@regClass("1806c38c-ebc3-45d1-a8a0-322ed94be4cb")
export class DepthSortable extends Laya.Script {
    @property({ type: Number, caption: "落地点Y（节点内）" })
    public groundY = 0;
    @property({ type: Number, caption: "遮挡过渡距离（0关闭）" })
    public blendDistance = 0;
    @property({ type: Number, caption: "墙前整体显示半宽（含持枪）" })
    public wallForegroundHalfWidth = 0;
    @property({type:Boolean,caption:'作为玩家视野来源'})
    public revealOccludingWalls=false;
    @property({type:Boolean,caption:'受玩家墙体视线限制'})
    public respectPlayerVision=true;
    private visionAlpha:number|null=null;
    private blend: DepthBlendRenderer | null = null;

    onLateUpdate(): void {
        const node = this.owner as Laya.Sprite;
        // Keep fractional depth so two nearby feet do not jump between equal keys.
        const foot=node.y + (this.groundY - node.pivotY) * node.scaleY;
        if(this.revealOccludingWalls)BrickWallTileLayer.viewers.set(node,{x:node.x,foot,halfWidth:84*Math.abs(node.scaleX)});
        else BrickWallTileLayer.viewers.delete(node);
        const seen=!this.respectPlayerVision||this.revealOccludingWalls||BrickWallTileLayer.targetVisible(node,foot)!==false;
        if(!seen){
            if(this.visionAlpha===null)this.visionAlpha=node.alpha;
            node.alpha=0;this.blend?.reset();
        }else if(this.visionAlpha!==null){node.alpha=this.visionAlpha;this.visionAlpha=null;}
        const reach=Math.max(0,this.wallForegroundHalfWidth)*Math.abs(node.scaleX);
        const depth=BrickWallTileLayer.foregroundDepth(node.parent as Laya.Sprite,node.x,foot,reach);
        node.zOrder=BrickWallTileLayer.lightingActorDepth(node.parent as Laya.Sprite,node.x,foot,depth,reach);
        if (seen&&this.blendDistance > 0) {
            if (!this.blend) this.blend = new DepthBlendRenderer(node, wall => {
                const sorter = wall.getComponent(DepthSortable);
                return sorter ? wall.y + (sorter.groundY - wall.pivotY) * wall.scaleY : null;
            });
            this.blend.update(foot, this.blendDistance);
        } else this.blend?.reset();
    }

    onDisable(): void {
        BrickWallTileLayer.viewers.delete(this.owner as Laya.Sprite);
        this.blend?.reset();
        const node = this.owner as Laya.Sprite;
        if(this.visionAlpha!==null&&!node.destroyed){node.alpha=this.visionAlpha;this.visionAlpha=null;}
        if (!node.destroyed) node.zOrder = node.y + (this.groundY - node.pivotY) * node.scaleY;
    }
    onDestroy(): void { BrickWallTileLayer.viewers.delete(this.owner as Laya.Sprite);this.blend?.destroy(); this.blend = null; }
}
