import { DataManager } from '../../systems/datamanager';
import { InventoryGrid } from '../../systems/data/InventoryGrid';
import type { InventoryBucket } from '../../systems/data/InventoryTypes';
import { listTemplate } from './listTemplate';
import type { glist } from './glist';

/** Uses an authored prefab preview while leaving the original grid cells visible. */
export class InventoryGridInteraction {
    static views=new Set<glist>();
    static equipmentTargets=new Map<any,(view:glist,index:number,preview:boolean)=>boolean>();
    private static drag:any=null;
    private static clickBlockUntil=0;
    private static equipmentHighlight:{node:any;color:any}|null=null;
    static get blockClick():boolean{return Date.now()<this.clickBlockUntil;}
    static get isDragging():boolean{return !!this.drag;}
    static withinClippingParents(node:any,x:number,y:number):boolean {
        for(let p=node.parent;p;p=p.parent){
            if(p.visible===false||p.active===false)return false;
            if(p.clipping||p.scroller){const local=p.globalToLocal(new Laya.Point(x,y));if(local.x<0||local.y<0||local.x>p.width||local.y>p.height)return false;}
        }
        return true;
    }
    static dragSequence=0;
    static vacantIndex(view:glist):number {return this.drag?.active&&this.drag.preview&&this.drag.view===view?this.drag.index:-1;}
    static bucket(view:glist):InventoryBucket{return view.listKey==='warehouse'?'warehouse':'active';}
    static down(view:glist,index:number,event:Laya.Event):void {
        if((event as any)?.button===2)return;
        if(this.drag || !view.gridItems[index])return;
        const node=view.gridNodes[index];if(!node)return;
        this.drag={view,index,node,item:{...view.gridItems[index]},rotated:!!view.gridItems[index].rotated,
            startX:Laya.stage.mouseX,startY:Laya.stage.mouseY,active:false,target:null};
        Laya.stage.on(Laya.Event.MOUSE_MOVE,this,this.move);
        Laya.stage.on(Laya.Event.MOUSE_UP,this,this.up);
        Laya.stage.on(Laya.Event.KEY_DOWN,this,this.key);
        Laya.stage.on(Laya.Event.BLUR,this,this.cancel);
        // Occupied items drag; scroll on empty cells, wheel or scrollbar.
        (view.gridRoot as any)?.scroller?.cancelDragging();
        event?.stopPropagation();
    }
    private static start():void {
        this.dragSequence++;
        const d=this.drag,source=d.node,origin=source.localToGlobal(new Laya.Point(0,0)),unit=source.localToGlobal(new Laya.Point(1,1));
        const n=d.view.dragPreviewNode||source;d.preview=n!==source;d.node=n;
        d.saved={parent:n.parent,index:n.parent?.getChildIndex(n)||0,x:n.x,y:n.y,scaleX:n.scaleX,scaleY:n.scaleY,z:n.zOrder,width:n.width,height:n.height,visible:n.visible,mouseEnabled:n.mouseEnabled,alpha:n.alpha};
        d.offsetX=d.startX-origin.x;d.offsetY=d.startY-origin.y;
        d.grabX=Math.max(0,Math.min(1,d.offsetX/(source.width*(unit.x-origin.x))));
        d.grabY=Math.max(0,Math.min(1,d.offsetY/(source.height*(unit.y-origin.y))));
        d.active=true;source.getComponent(listTemplate)?.suppressGridClick();
        if(d.preview){n.size(source.width,source.height);const slot=n.getComponent(listTemplate);slot.bindData(d.item);slot.setGridBox(n.width,n.height,d.rotated);slot.setSelected(false);}
        Laya.stage.addChild(n);n.scaleX=unit.x-origin.x;n.scaleY=unit.y-origin.y;n.zOrder=100000;n.alpha=0.8;
        n.visible=true;n.mouseEnabled=false;
        if(d.preview)d.view.refresh();
    }
    private static move():void {
        const d=this.drag;if(!d)return;
        if(!d.active && Math.hypot(Laya.stage.mouseX-d.startX,Laya.stage.mouseY-d.startY)<8)return;
        if(!d.active)this.start();
        d.node.pos(Laya.stage.mouseX-d.offsetX,Laya.stage.mouseY-d.offsetY);
        this.clearHighlights();d.target=null;
        const overGrid=Array.from(this.views).some(view=>view.enabled&&view.gridIndexAt(Laya.stage.mouseX,Laya.stage.mouseY)>=0);
        let equipment:any=null,bestScore=0;
        for(const [node,accept] of this.equipmentTargets){
            let visible=true;for(let n=node;n;n=n.parent)if(n.visible===false||n.active===false)visible=false;
            if(!visible||!this.withinClippingParents(node,Laya.stage.mouseX,Laya.stage.mouseY))continue;
            const p=node.globalToLocal(new Laya.Point(Laya.stage.mouseX,Laya.stage.mouseY));
            const inside=p.x>=-8&&p.y>=-8&&p.x<node.width+8&&p.y<node.height+8;
            const a=node.globalToLocal(d.node.localToGlobal(new Laya.Point(0,0)));
            const b=node.globalToLocal(d.node.localToGlobal(new Laya.Point(d.node.width,d.node.height)));
            const overlapX=Math.max(0,Math.min(node.width,b.x)-Math.max(0,a.x));
            const overlapY=Math.max(0,Math.min(node.height,b.y)-Math.max(0,a.y));
            const ratio=overlapX*overlapY/Math.max(1,Math.min(node.width*node.height,(b.x-a.x)*(b.y-a.y)));
            const score=inside?2:!overGrid&&overlapX>=18&&overlapY>=18&&ratio>=0.25?ratio:0;
            if(score>bestScore&&accept(d.view,d.index,true)){equipment={equipment:node,accept};bestScore=score;}
        }
        if(equipment){
            d.target=equipment;const node=equipment.equipment;
            if(node.background){this.equipmentHighlight={node,color:node.background.lineColor};node.background.lineColor='#83cda0';node.repaint();}
            return;
        }
        // Prefer the grid directly under the pointer over a neighbouring grid's edge tolerance.
        const views=Array.from(this.views).sort((a,b)=>Number(b.gridIndexAt(Laya.stage.mouseX,Laya.stage.mouseY)>=0)-Number(a.gridIndexAt(Laya.stage.mouseX,Laya.stage.mouseY)>=0));
        for(const view of views){
            if(!view.enabled || !view.gridRoot?.activeInHierarchy || !(view.gridRoot as any).visible)continue;
            const shape={...d.item,rotated:d.rotated};
            const index=view.gridDropIndexAt(Laya.stage.mouseX,Laya.stage.mouseY,shape,d.grabX,d.grabY);
            if(index<0)continue;
            const target=index+view.slotOffset;
            const ok=d.view.onGridTransfer?d.view.onGridTransfer(d.index,view,index,d.rotated,true):view.listKey==='container'?false:DataManager.getInstance().moveGridItem(this.bucket(d.view),d.index+d.view.slotOffset,this.bucket(view),target,d.rotated,true);
            const cells=InventoryGrid.cells(shape,index,{columns:view.gridColumns,capacity:view.slotCount})||[index];
            for(const i of cells)view.gridNodes[i]?.getComponent(listTemplate)?.setPlacementColor(ok?'#83cda0':'#e17d76');
            d.target=ok?{view,index}:null;break;
        }
    }
    private static key(event:any):void {
        if(event.keyCode===27){this.cancel();return;}
        if(event.keyCode!==82 || !this.drag)return;
        const d=this.drag;if(!d.active)this.start();d.rotated=!d.rotated;
        const size=InventoryGrid.size({...d.item,rotated:d.rotated});
        const width=size.width*d.view.gridCell-2,height=size.height*d.view.gridCell-2;
        d.node.size(width,height);d.offsetX=d.grabX*width*d.node.scaleX;d.offsetY=d.grabY*height*d.node.scaleY;
        d.node.getComponent(listTemplate)?.setGridBox(width,height,d.rotated);
        this.move();
    }
    private static restore():void {
        const d=this.drag;if(!d?.active)return;
        const n=d.node,s=d.saved;
        if(!n.destroyed){
            if(s.parent?.destroyed){n.destroy();return;}
            if(s.parent)s.parent.addChildAt(n,Math.min(s.index,s.parent.numChildren));else n.removeSelf();
            n.pos(s.x,s.y);n.scale(s.scaleX,s.scaleY);n.size(s.width,s.height);n.zOrder=s.z;n.alpha=s.alpha;n.mouseEnabled=s.mouseEnabled;n.visible=s.visible;
            if(d.preview)n.getComponent(listTemplate)?.bindData(null);
        }
    }
    private static up():void {
        const d=this.drag;if(!d)return;
        if(d.active)this.move(); // Release may arrive at a new position without a final mouse-move event.
        const target=d.target;this.restore();this.unbind();this.drag=null;
        if(d.active){
            this.clickBlockUntil=Date.now()+150;
            if(target?.equipment)target.accept(d.view,d.index,false);
            else if(target){if(d.view.onGridTransfer)d.view.onGridTransfer(d.index,target.view,target.index,d.rotated,false);else DataManager.getInstance().moveGridItem(this.bucket(d.view),d.index+d.view.slotOffset,this.bucket(target.view),target.index+target.view.slotOffset,d.rotated);}
            d.view.refresh();target?.view?.refresh();
        }
        this.clearHighlights();
    }
    static cancel():void {const d=this.drag;this.restore();this.unbind();this.drag=null;if(d?.active){this.clickBlockUntil=Date.now()+150;d.view.refresh();}this.clearHighlights();}
    static cancelView(view:glist):void{if(this.drag?.view===view)this.cancel();this.views.delete(view);}
    private static unbind():void{Laya.stage.off(Laya.Event.MOUSE_MOVE,this,this.move);Laya.stage.off(Laya.Event.MOUSE_UP,this,this.up);Laya.stage.off(Laya.Event.KEY_DOWN,this,this.key);Laya.stage.off(Laya.Event.BLUR,this,this.cancel);}
    private static clearHighlights():void{
        const h=this.equipmentHighlight;if(h&&!h.node.destroyed&&h.node.background){h.node.background.lineColor=h.color;h.node.repaint();}this.equipmentHighlight=null;
        for(const view of this.views)for(const node of view.gridNodes)node?.getComponent(listTemplate)?.setPlacementColor('#ffffff');
    }
}
