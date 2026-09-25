import { SaveManager } from './SaveManager';
import { SpatialStorage } from './SpatialStorage';
import type { InventorySlotItem,InventoryViewItem } from './InventoryTypes';
export type WarehouseItemNormalizer=(item:InventoryViewItem)=>InventoryViewItem;

export class WarehouseManager {
    static readonly STORAGE_KEY='laya_test_warehouse_inventory_v1';
    static readonly META_STORAGE_KEY='laya_test_warehouse_meta_v1';
    static readonly PAGE_SIZE=30;
    static readonly PAGE_COUNT=7;
    static readonly DEFAULT_SLOT_COUNT=210;
    static readonly COLUMNS=6;
    private grid=new SpatialStorage(6,210);
    constructor(private readonly saveManager:SaveManager){}
    setStackMaxResolver(fn:(id:string)=>number):void{this.grid.stack=fn;}
    setItemNormalizer(fn:WarehouseItemNormalizer):void{this.grid.normalizer=fn;}
    load():void{
        const items=this.saveManager.loadInventory(WarehouseManager.STORAGE_KEY);
        const backup=WarehouseManager.STORAGE_KEY+'_before_grid_v2';
        if(!this.saveManager.loadJson(backup))this.saveManager.saveJson(backup,items);
        const meta=this.saveManager.loadJson<{slotCount:number}>(WarehouseManager.META_STORAGE_KEY);
        this.grid.capacity=Math.max(210,Number(meta?.slotCount)||210);this.grid.load(items);this.save();
    }
    getSlotCount():number{return this.grid.capacity;}
    setSlotCount(n:number):void{if(Number.isFinite(n)&&n>=this.grid.capacity){this.grid.capacity=Math.ceil(n/30)*30;this.save();}}
    getSnapshot():InventorySlotItem[]{return this.grid.snapshot();}
    getItemCount(id:string):number{return this.grid.count(id);}
    consumeItem(id:string,n:number):number{const used=this.grid.consume(id,n);if(used)this.save();return used;}
    addItem(item:InventoryViewItem,target?:number):boolean{const ok=this.grid.add(item,target);if(ok)this.save();return ok;}
    canAddItems(items:InventoryViewItem[]):boolean{return !!this.grid.planAdd(items);}
    removeItem(id:string):InventoryViewItem|null{return this.removeSlot(this.grid.items.findIndex(i=>i?.itemId===id));}
    removeSlot(index:number):InventoryViewItem|null{const item=this.grid.remove(index);if(item)this.save();return item;}
    moveSlot(from:number,to:number,rotated?:boolean):boolean{const ok=this.grid.move(from,to,rotated);if(ok)this.save();return ok;}
    canPlaceItemAt(index:number,id:string):boolean{return !!this.grid.planAdd([{itemId:id,name:id,count:1}],index);}
    getGridStorage():SpatialStorage{return this.grid;}
    commitGrid(items:InventorySlotItem[]):void{this.grid.items=items;this.save();}
    private save():void{
        this.saveManager.saveInventory(WarehouseManager.STORAGE_KEY,this.grid.items);
        this.saveManager.saveJson(WarehouseManager.META_STORAGE_KEY,{slotCount:this.grid.capacity});
    }
}
