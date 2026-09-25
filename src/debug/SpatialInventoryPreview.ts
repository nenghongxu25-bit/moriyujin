import { DataManager } from '../systems/datamanager';
import { glist } from '../PlayUI/CommonUI/glist';
import { InventoryGrid } from '../systems/data/InventoryGrid';
const {regClass}=Laya;

/** Isolated, non-saving manual interaction fixture. Only attached to the test scene. */
@regClass()
export class SpatialInventoryPreview extends Laya.Script {
    onAwake():void {
        const dm=DataManager.getInstance() as any;
        dm.save.saveInventory=()=>{};dm.save.saveJson=()=>{};
    }
    async onStart():Promise<void>{
        const dm=DataManager.getInstance() as any;
        await dm.loadAll();
        const make=(id:string,count=1)=>({...dm.normalizeInventoryItem({itemId:id,name:id,count}),gridVersion:2});
        const bag=dm.inventory.getGridStorage(),warehouse=dm.warehouse.getGridStorage();
        bag.capacity=50;warehouse.capacity=210;
        bag.items=[];bag.items[0]=make('bandage',3);bag.items[2]=make('knife');bag.items[10]=make('akm');
        warehouse.items=[];warehouse.items[0]=make('bandage',6);warehouse.items[3]=make('laoshigangkui');warehouse.items[12]=make('m16');
        dm.inventory.refreshBagViews();dm.syncWarehouseViews();
        Laya.timer.once(500,this,this.report);
        Laya.stage.on(Laya.Event.MOUSE_UP,this,this.scheduleReport);
        Laya.stage.on(Laya.Event.MOUSE_DOWN,this,this.pointerReport);
    }
    private pointerReport(e:Laya.Event):void{const n=e.target as any,v=n?.parent?.getComponent(glist);console.log('[SpatialPointer] '+JSON.stringify({x:Laya.stage.mouseX,y:Laya.stage.mouseY,target:n?.name,chain:n?.parent?.name,index:v?.gridNodes.indexOf(n),item:v?.gridItems[v?.gridNodes.indexOf(n)],node:[n?.x,n?.y,n?.width,n?.height],listener:n?.hasListener(Laya.Event.MOUSE_DOWN)}));}
    private scheduleReport():void{Laya.timer.once(150,this,this.report);}
    private report():void{
        const views:any[]=[];
        const walk=(n:Laya.Node)=>{const v=n.getComponent(glist);if(v && (v.listKey==='bag'||v.listKey==='warehouse')){
            const root=v.gridRoot,p=root.localToGlobal(new Laya.Point(0,0));
            views.push({key:v.listKey,offset:v.slotOffset,origin:[p.x,p.y],cell:v.gridCell,children:v.gridNodes.length,
                items:v.gridItems.map((item,i)=>item?{index:i,id:item.itemId,count:item.count,rotated:item.rotated,size:InventoryGrid.size(item),box:[v.gridNodes[i]?.x,v.gridNodes[i]?.y,v.gridNodes[i]?.width,v.gridNodes[i]?.height]}:null).filter(Boolean)});
        }for(let i=0;i<n.numChildren;i++)walk(n.getChildAt(i));};walk(this.owner);
        console.log('[SpatialInventoryPreview] '+JSON.stringify(views));
    }
    onDestroy():void{Laya.stage.off(Laya.Event.MOUSE_UP,this,this.scheduleReport);Laya.stage.off(Laya.Event.MOUSE_DOWN,this,this.pointerReport);Laya.timer.clearAll(this);}
}
