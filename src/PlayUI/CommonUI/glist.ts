const { regClass, property } = Laya;

import { listTemplate, type ListTemplateData } from "./listTemplate";
import { InventoryGrid } from '../../systems/data/InventoryGrid';
import { InventoryGridInteraction } from './InventoryGridInteraction';
import { DataManager } from '../../systems/datamanager';

export type GListSlotClickHandler = (item: ListTemplateData | null, listKey: string, slotIndex: number, event?: any) => void;

@regClass()
export class glist extends Laya.Script {
    @property(Laya.Node)
    public listNode: Laya.Node | null = null;

    @property(Laya.Node)
    public templateNode: Laya.Node | null = null;

    @property(Laya.Node)
    public dragPreviewNode: Laya.Node | null = null;

    @property(Number)
    public slotCount: number = 0;

    @property(Boolean)
    public selectionEnabled: boolean = true;

    public listKey: string = "";
    public slotOffset=0;
    public onContextClick:GListSlotClickHandler|null=null;
    public itemFilter:((item:ListTemplateData)=>boolean)|null=null;
    public onGridTransfer:((sourceIndex:number,target:glist,targetIndex:number,rotated:boolean,preview:boolean)=>boolean)|null=null;
    public gridNodes:any[]=[];
    public gridCell=80;
    public get gridColumns():number{return this.listKey==='warehouse'||this.listKey==='container'?6:this.listKey==='rigContents'?(DataManager.getInstance().getEquippedContainerGridSpec('rig')?.columns||4):5;}
    public get gridRoot():any{return this.getListRoot();}
    public get gridItems():Array<ListTemplateData|null>{return this.items;}
    private get spatial():boolean{return this.listKey==='bag'||this.listKey==='warehouse'||this.listKey==='container';}
    private rotateButton:any=null;

    onDisable():void {InventoryGridInteraction.cancelView(this);Laya.timer.clearAll(this);}
    onDestroy():void {InventoryGridInteraction.cancelView(this);Laya.timer.clearAll(this);this.rotateButton?.offAllCaller(this);}

    public gridIndexAt(x:number,y:number):number {
        const root=this.gridRoot;
        if(!InventoryGridInteraction.withinClippingParents(root,x,y))return -1;
        for(let n=root;n;n=n.parent)if(n.visible===false || n.active===false)return -1;
        const p=root.globalToLocal(new Laya.Point(x,y));
        if(p.x<0||p.y<0||p.x>=this.gridColumns*this.gridCell||p.y>=root.height)return -1;
        const index=Math.floor((p.y+(root.scroller?.posY||0))/this.gridCell)*this.gridColumns+Math.floor(p.x/this.gridCell);
        return index>=0&&index<this.slotCount?index:-1;
    }

    /** Match the dragged item's visible footprint, regardless of where it was grabbed. */
    public gridDropIndexAt(x:number,y:number,item:ListTemplateData,grabX:number,grabY:number):number {
        const root=this.gridRoot;
        if(!InventoryGridInteraction.withinClippingParents(root,x,y))return -1;
        for(let n=root;n;n=n.parent)if(n.visible===false||n.active===false)return -1;
        const p=root.globalToLocal(new Laya.Point(x,y)),width=this.gridColumns*this.gridCell;
        const tolerance=12;
        if(p.x < -tolerance || p.y < -tolerance || p.x > width+tolerance || p.y > root.height+tolerance)return -1;
        const size=InventoryGrid.size(item),maxCol=this.gridColumns-size.width;
        if(maxCol<0)return -1;
        const left=p.x-grabX*(size.width*this.gridCell-2);
        const top=p.y+(root.scroller?.posY||0)-grabY*(size.height*this.gridCell-2);
        // Snap to the nearest grid line, allowing a small amount of overhang at outer edges.
        let col=Math.round(left/this.gridCell),row=Math.round(top/this.gridCell);
        const maxRow=Math.ceil(this.slotCount/this.gridColumns)-size.height;
        if(maxRow<0||left < -this.gridCell/2-tolerance||left > maxCol*this.gridCell+this.gridCell/2+tolerance||top < -this.gridCell/2-tolerance||top > maxRow*this.gridCell+this.gridCell/2+tolerance)return -1;
        col=Math.max(0,Math.min(maxCol,col));row=Math.max(0,Math.min(maxRow,row));
        const index=row*this.gridColumns+col;
        return index<this.slotCount?index:-1;
    }

    private rotateSelected():void {
        const index=this.selectedSlotIndex,item=this.items[index];if(!item)return;
        const bucket=InventoryGridInteraction.bucket(this);
        DataManager.getInstance().moveGridItem(bucket,index+this.slotOffset,bucket,index+this.slotOffset,!item.rotated);
    }

    private renderGrid():void {
        const root=this.gridRoot;if(!root)return;
        InventoryGridInteraction.views.add(this);
        if(root.layout){root.layout.type=0;root.layout.foldInvisibles=false;}
        this.gridCell=Math.floor((root.width-18)/this.gridColumns);
        const children=(root.children||[]).filter((n:any)=>n!==this.templateNode);
        // Sorting for overlap must not change the logical slot-to-node mapping.
        if(this.gridNodes.length!==children.length || this.gridNodes.some(n=>n.destroyed||children.indexOf(n)<0))this.gridNodes=children.slice();
        const spec=this.listKey==='rigContents'?DataManager.getInstance().getEquippedContainerGridSpec('rig')||{columns:this.gridColumns,capacity:this.slotCount}:{columns:this.gridColumns,capacity:this.slotCount};
        const occupied=new Set<number>();
        const draggedIndex=InventoryGridInteraction.vacantIndex(this);
        this.items.forEach((item,i)=>{if(item&&i!==draggedIndex)for(const c of InventoryGrid.cells(item,i,spec)||[])if(c!==i)occupied.add(c);});
        if(root.graphics){
            root.graphics.clear();
            for(const part of spec.compartments||[])root.graphics.drawRect(part.x*this.gridCell+1,part.y*this.gridCell+1,part.width*this.gridCell-2,part.height*this.gridCell-2,null,'#9a8e68',2);
        }
        for(let i=0;i<this.gridNodes.length;i++){
            const node=this.gridNodes[i],item=i===draggedIndex?null:this.items[i]||null;
            node.anchorX=node.anchorY=0;node.pos((i%this.gridColumns)*this.gridCell,Math.floor(i/this.gridColumns)*this.gridCell);
            node.scale(1,1);node.size(this.gridCell-2,this.gridCell-2);
            node.visible=i<this.slotCount&&!occupied.has(i);node.mouseEnabled=true;node.zOrder=item?2:0;
            const slot=node.getComponent(listTemplate)||node.addComponent(listTemplate);
            slot.bindData(item);
            const size=item?InventoryGrid.size(item):{width:1,height:1};
            node.size(size.width*this.gridCell-2,size.height*this.gridCell-2);
            slot.setGridBox(node.width,node.height,!!item?.rotated);
            slot.setSelected(i===this.selectedSlotIndex&&!!item);
            node.alpha=item&&this.itemFilter&&!this.itemFilter(item)?0.22:1;
            this.bindSlotClick(node,i);
            node.off(Laya.Event.RIGHT_CLICK,this,this.contextClick);node.on(Laya.Event.RIGHT_CLICK,this,this.contextClick,[i]);
            node.off(Laya.Event.MOUSE_DOWN,this,this.gridDown);node.on(Laya.Event.MOUSE_DOWN,this,this.gridDown,[i]);
        }
        root.layout?.setContentSize(this.gridColumns*this.gridCell,Math.ceil(this.slotCount/this.gridColumns)*this.gridCell);
        this.rotateButton=root.parent?.getChildByName('gridRotateButton');
        if(this.rotateButton){this.rotateButton.off(Laya.Event.CLICK,this,this.rotateSelected);this.rotateButton.on(Laya.Event.CLICK,this,this.rotateSelected);}
    }
    private gridDown(index:number,event:Laya.Event):void {InventoryGridInteraction.down(this,index,event);}
    private contextClick(index:number,event:any):void {this.onContextClick?.(this.items[index]||null,this.listKey,index,event);}
    public onSlotClick: GListSlotClickHandler | null = null;

    private items: Array<ListTemplateData | null> = [];
    private appliedSlotCount: number = -1;
    private selectedItemId: string = "";
    private selectedSlotIndex: number = -1;

    onAwake(): void {
        this.applySlotCount(true);
        this.refresh();
    }

    onEnable(): void {
        this.applySlotCount();
        this.refresh();
    }

    public setItems(items: Array<ListTemplateData | null> | null | undefined): void {
        this.items = Array.isArray(items) ? items.slice() : [];
        this.refresh();
    }

    public clearItems(): void {
        this.items = [];
        this.refresh();
    }

    public setSlotCount(count: number): void {
        this.slotCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
        this.applySlotCount(true);
        this.refresh();
    }

    public setSelectedItemId(itemId: string | null): void {
        this.selectedItemId = itemId ? String(itemId) : "";
        this.selectedSlotIndex = -1;
        this.refresh();
    }

    public setSelectedSlotIndex(slotIndex: number | null): void {
        this.selectedSlotIndex = Number.isFinite(slotIndex) ? Math.floor(slotIndex as number) : -1;
        this.selectedItemId = "";
        this.refresh();
    }

    public refresh(): void {
        this.applySlotCount();

        const listRoot = this.getListRoot();
        if (!listRoot) {
            return;
        }

        this.hideTemplateNode();
        this.renderSlots();
        Laya.timer.callLater(this, this.renderSlots);
    }

    private renderSlots(): void {
        if(this.spatial){this.renderGrid();return;}
        const listRoot = this.getListRoot();
        if (!listRoot) {
            return;
        }

        const children = listRoot.children || [];
        const maxSlots = Math.max(0, Math.floor(this.slotCount));
        const bindLimit = maxSlots > 0 ? Math.min(maxSlots, children.length) : children.length;
        let dataIndex = 0;

        for (let i = 0; i < bindLimit; i++) {
            const slotNode = children[i] as Laya.Node;
            if (!slotNode || slotNode === this.templateNode) {
                continue;
            }

            let slot = slotNode.getComponent(listTemplate);
            if (!slot) {
                slot = slotNode.addComponent(listTemplate);
            }

            const item = this.items[dataIndex] || null;
            slot.bindData(item);
            if (this.selectionEnabled) {
                const selected =
                    this.selectedSlotIndex >= 0
                        ? i === this.selectedSlotIndex && !!item
                        : !!item && !!item.itemId && item.itemId === this.selectedItemId;
                slot.setSelected(selected);
            }
            this.bindSlotClick(slotNode, i);
            dataIndex++;
        }
    }

    private bindSlotClick(slotNode: Laya.Node, slotIndex: number): void {
        const target = slotNode as any;
        if (!target || typeof target.on !== "function" || typeof target.off !== "function") {
            return;
        }

        target.off(Laya.Event.CLICK, this, this.onSlotNodeClick);
        target.on(Laya.Event.CLICK, this, this.onSlotNodeClick, [slotIndex]);
    }

    private onSlotNodeClick(slotIndex: number, event: any): void {
        if(InventoryGridInteraction.blockClick)return;
        const listRoot = this.getListRoot();
        if (!listRoot) {
            return;
        }

        const children = this.spatial ? this.gridNodes : listRoot.children || [];
        const slotNode = children[slotIndex] as Laya.Node;
        if (!slotNode) {
            return;
        }

        const slot = slotNode.getComponent(listTemplate);
        if (!slot) {
            return;
        }

        if (slot.consumeSuppressNextClick()) {
            return;
        }

        const data = slot.getBoundData();
        if (this.onSlotClick) {
            this.onSlotClick(data, this.listKey, slotIndex,event);
        }
    }

    private applySlotCount(force: boolean = false): void {
        const listRoot = this.getListRoot() as any;
        if (!listRoot) {
            return;
        }

        const nextCount = Math.max(0, Math.floor(this.slotCount));
        if (!force && this.appliedSlotCount === nextCount) {
            return;
        }

        this.appliedSlotCount = nextCount;

        if ("numItems" in listRoot) {
            listRoot.numItems = nextCount;
        }

        if (typeof listRoot.refresh === "function") {
            listRoot.refresh(true);
        }
    }

    private getListRoot(): Laya.Node | null {
        return this.listNode || (this.owner as Laya.Node) || null;
    }

    private hideTemplateNode(): void {
        const template = this.templateNode as any;
        if (template && "visible" in template) {
            (template as any).visible = false;
        }
    }
}
