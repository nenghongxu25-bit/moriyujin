import { SaveManager } from './SaveManager';
import { SpatialStorage } from './SpatialStorage';
import { InventoryGrid } from './InventoryGrid';
import type { BagView,InventoryBucket,InventoryScope,InventorySlotItem,InventoryViewItem } from './InventoryTypes';
export type InventoryItemNormalizer=(item:InventoryViewItem)=>InventoryViewItem;
export type InventorySortPriorityResolver=(item:InventoryViewItem)=>number;

export class InventoryManager {
    static readonly BASE_STORAGE_KEY='laya_test_base_inventory_v1';
    static readonly GRID_META_KEY='laya_test_bag_grid_v2';
    static readonly COLUMNS=5;
    private loaded=false;
    private currentScope:InventoryScope='base';
    private base=new SpatialStorage(5,50);
    private run=new SpatialStorage(5,50);
    private bagViews=new Set<BagView>();
    private priority:InventorySortPriorityResolver=()=>0;
    constructor(private readonly saveManager:SaveManager){}
    private get active():SpatialStorage{return this.currentScope==='base'?this.base:this.run;}
    setStackMaxResolver(fn:(id:string)=>number):void{this.base.stack=this.run.stack=fn;}
    setItemNormalizer(fn:InventoryItemNormalizer):void{this.base.normalizer=this.run.normalizer=fn;}
    setSortPriorityResolver(fn:InventorySortPriorityResolver):void{this.priority=fn;}
    loadPersistedInventories():void{
        if(this.loaded){this.syncBagViews();return;}
        const key=InventoryManager.BASE_STORAGE_KEY;
        const old=this.saveManager.loadInventory(key);
        if(!this.saveManager.loadJson(key+'_before_grid_v2'))this.saveManager.saveJson(key+'_before_grid_v2',old);
        const meta=this.saveManager.loadJson<{capacity:number}>(InventoryManager.GRID_META_KEY);
        if(Number.isFinite(meta?.capacity))this.base.capacity=Math.max(50,meta.capacity);
        this.base.load(old);this.run.capacity=this.base.capacity;this.loaded=true;
        this.persistCurrentScope();this.syncBagViews();
    }
    enterScene(url:string):void{
        const next:InventoryScope=/cunzhuang|base/i.test(url)?'base':'instance';
        if(next===this.currentScope){this.syncBagViews();return;}
        if(next==='instance'){this.run.capacity=this.base.capacity;this.run.items=InventoryGrid.clone(this.base.items);}
        else{this.base.capacity=this.run.capacity;this.base.items=InventoryGrid.clone(this.run.items);this.run.items=[];}
        this.currentScope=next;this.persistCurrentScope();this.syncBagViews();
    }
    returnToBaseAfterDeath(url:string):void{
        if(!/cunzhuang|base/i.test(url)){this.enterScene(url);return;}
        this.run.items=[];this.base.items=[];this.currentScope='base';this.changed();
    }
    getCurrentScope():InventoryScope{return this.currentScope;}
    removeRetiredItems(keep:(id:string)=>boolean):void {
        let changed=false;
        for(const grid of [this.base,this.run])grid.items=grid.items.map(item=>{
            if(item&&!keep(item.itemId)){changed=true;return null;}return item;
        });
        // Saved inventories are cleaned separately; do not overwrite an imported save with cached items.
        if(changed)this.syncBagViews();
    }
    getPlayerBagSlotCount():number{return this.active.capacity;}
    setPlayerBagSlotCount(count:number):void{
        if(!Number.isFinite(count))return;
        const next=Math.max(0,Math.floor(count));
        if(!InventoryGrid.valid(this.active.items,{columns:5,capacity:next},this.active.stack))return;
        this.base.capacity=this.run.capacity=next;this.changed();
    }
    getInventorySnapshot():InventorySlotItem[]{return this.active.snapshot();}
    getItemCount(id:string):number{return this.active.count(id);}
    consumeItem(id:string,count:number):number{const n=this.active.consume(id,count);if(n)this.changed();return n;}
    registerBagView(view:BagView):void{this.bagViews.add(view);view.setItems(this.getInventorySnapshot());}
    unregisterBagView(view:BagView):void{this.bagViews.delete(view);}
    refreshBagViews():void{this.syncBagViews();}
    addItemToActive(itemId:string,name:string,count:number,icon?:string):boolean{
        const ok=this.active.add({itemId,name,count,icon});if(ok)this.changed();return ok;
    }
    canAddItems(items:InventoryViewItem[]):boolean{return !!this.active.planAdd(items);}
    removeItemFromActive(id:string):InventoryViewItem|null{return this.removeActiveSlot(this.active.items.findIndex(i=>i?.itemId===id));}
    removeActiveSlot(index:number):InventoryViewItem|null{const item=this.active.remove(index);if(item)this.changed();return item;}
    consumeActiveSlotItem(index:number,count:number):InventoryViewItem|null{
        const item=this.active.items[index];if(!item || !Number.isFinite(count)||count<1)return null;
        const n=Math.min(item.count,Math.floor(count)),result={...item,count:n};item.count-=n;if(!item.count)this.active.items[index]=null;this.changed();return result;
    }
    canSplitActiveSlot(index:number):boolean{
        const item=this.active.items[index];return !!item && item.count>1 && InventoryGrid.first(this.active.items,item,this.active.spec)>=0;
    }
    splitActiveSlot(index:number):boolean{
        if(!this.canSplitActiveSlot(index))return false;
        const item=this.active.items[index],target=InventoryGrid.first(this.active.items,item,this.active.spec),count=Math.floor(item.count/2);
        this.active.items[target]={...item,count};item.count-=count;this.changed();return true;
    }
    organizeActiveInventory():void{if(this.active.organize(this.priority))this.changed();}
    moveActiveSlot(from:number,to:number,rotated?:boolean):boolean{const ok=this.active.move(from,to,rotated);if(ok)this.changed();return ok;}
    canPlaceItemInBucket(bucket:InventoryBucket,index:number,id:string):boolean{
        return bucket==='active' && !!this.active.planAdd([{itemId:id,name:id,count:1}],index);
    }
    placeItemInBucket(bucket:InventoryBucket,index:number,item:InventoryViewItem):boolean{
        if(bucket!=='active')return false;const ok=this.active.add(item,index);if(ok)this.changed();return ok;
    }
    swapActiveSlotItem(index:number,item:InventoryViewItem|null):InventoryViewItem|null{
        const old=this.active.items[index];const next=InventoryGrid.clone(this.active.items);next[index]=null;
        if(item){const normalized=this.active.normalizer(item);if(!InventoryGrid.fits(next,normalized,index,this.active.spec))return null;next[index]=normalized;}
        this.active.items=next;this.changed();return old?{...old}:null;
    }
    getGridStorage():SpatialStorage{return this.active;}
    commitGrid(items:InventorySlotItem[],notify=true):void{this.active.items=items;this.persistCurrentScope();if(notify)this.syncBagViews();}
    private changed():void{this.persistCurrentScope();this.syncBagViews();}
    private persistCurrentScope():void{
        if(this.currentScope==='base'){
            this.saveManager.saveInventory(InventoryManager.BASE_STORAGE_KEY,this.base.items);
            this.saveManager.saveJson(InventoryManager.GRID_META_KEY,{capacity:this.base.capacity});
        }
    }
    private syncBagViews():void{const snapshot=this.getInventorySnapshot();for(const view of this.bagViews){view.setItems(snapshot);view.refreshPlayerStats?.();}}
}
