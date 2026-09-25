import { InventoryGrid, type GridSpec } from './InventoryGrid';
import type { InventorySlotItem, InventoryViewItem } from './InventoryTypes';

/** Shared placement/stack rules for backpack and warehouse. No UI dependencies. */
export class SpatialStorage {
    items:InventorySlotItem[]=[];
    capacity:number;
    normalizer:(item:InventoryViewItem)=>InventoryViewItem = i=>({...i});
    stack:(id:string)=>number = ()=>Number.MAX_SAFE_INTEGER;
    constructor(public columns:number,capacity:number,public pageSize?:number){this.capacity=capacity;}
    get spec():GridSpec{return {columns:this.columns,capacity:this.capacity,pageSize:this.pageSize};}
    snapshot():InventorySlotItem[]{const result=InventoryGrid.clone(this.items);while(result.length<this.capacity)result.push(null);return result;}
    load(items:InventorySlotItem[]):void {
        const spec=this.spec;
        this.items=InventoryGrid.migrate(items.map(i=>i?this.normalizer(i):null),spec,this.stack);
        this.capacity=spec.capacity;
    }
    planAdd(items:InventoryViewItem[],target?:number):InventorySlotItem[]|null{return InventoryGrid.add(this.items,items.map(i=>this.normalizer(i)),this.spec,this.stack,target);}
    add(item:InventoryViewItem,target?:number):boolean{const next=this.planAdd([item],target);if(!next)return false;this.items=next;return true;}
    move(from:number,to:number,rotated?:boolean):boolean{const next=InventoryGrid.move(this.items,from,to,this.spec,this.stack,rotated);if(!next)return false;this.items=next;return true;}
    remove(index:number):InventoryViewItem|null{if(!Number.isInteger(index)||index<0)return null;const item=this.items[index];if(!item)return null;this.items[index]=null;return {...item};}
    count(id:string):number{return this.items.reduce((n,i)=>n+(i?.itemId===id?i.count:0),0);}
    consume(id:string,count:number):number{
        let left=Number.isFinite(count)?Math.max(0,Math.floor(count)):0,used=0;
        for(let i=0;i<this.items.length && left>0;i++)if(this.items[i]?.itemId===id){const n=Math.min(left,this.items[i].count);this.items[i].count-=n;left-=n;used+=n;if(!this.items[i].count)this.items[i]=null;}
        return used;
    }
    organize(priority:(item:InventoryViewItem)=>number):boolean{
        const items=this.items.filter((i):i is InventoryViewItem=>!!i).sort((a,b)=>{
            const sa=InventoryGrid.size(a),sb=InventoryGrid.size(b);
            return sb.width*sb.height-sa.width*sa.height || priority(a)-priority(b);
        });
        const next=InventoryGrid.add([],items,this.spec,this.stack);
        if(!next)return false;this.items=next;return true;
    }
}
