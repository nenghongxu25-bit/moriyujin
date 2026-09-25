import type { InventorySlotItem, InventoryViewItem } from './InventoryTypes';
export interface GridCompartment { id:string; x:number; y:number; width:number; height:number; }
export interface GridSpec { columns: number; capacity: number; pageSize?: number; compartments?:GridCompartment[]; }
export type StackLimit = (id: string) => number;

/** Anchors contain items, covered cells remain null. All plans are atomic copies. */
export class InventoryGrid {
    static clone(items: InventorySlotItem[]): InventorySlotItem[] { return Array.from(items, i => i ? {...i} : null); }
    static size(item: InventoryViewItem): {width:number; height:number} {
        const w = Math.max(1, Math.min(6, Math.floor(Number(item.gridWidth) || 1)));
        const h = Math.max(1, Math.min(6, Math.floor(Number(item.gridHeight) || 1)));
        return item.rotated ? {width:h,height:w} : {width:w,height:h};
    }
    static cells(item: InventoryViewItem, index: number, spec: GridSpec): number[] | null {
        if (!Number.isInteger(index) || index < 0 || index >= spec.capacity) return null;
        const {width,height} = this.size(item);
        if (index % spec.columns + width > spec.columns) return null;
        const end = index + (height-1)*spec.columns + width-1;
        if (end >= spec.capacity || (spec.pageSize && Math.floor(index/spec.pageSize)!==Math.floor(end/spec.pageSize))) return null;
        // Adjacent pockets remain separate: the entire footprint must fit one pocket.
        if(spec.compartments){
            const x=index%spec.columns,y=Math.floor(index/spec.columns);
            if(!spec.compartments.some(p=>x>=p.x&&y>=p.y&&x+width<=p.x+p.width&&y+height<=p.y+p.height))return null;
        }
        const cells:number[]=[];
        for(let y=0;y<height;y++)for(let x=0;x<width;x++)cells.push(index+y*spec.columns+x);
        return cells;
    }
    static anchor(items: InventorySlotItem[], index:number, spec:GridSpec): number {
        for(let i=0;i<items.length;i++) if(items[i] && this.cells(items[i],i,spec)?.indexOf(index)>=0) return i;
        return -1;
    }
    static fits(items:InventorySlotItem[],item:InventoryViewItem,index:number,spec:GridSpec,ignore=-1):boolean {
        const cells=this.cells(item,index,spec);
        if(!cells)return false;
        const occupied=new Set<number>();
        for(let i=0;i<items.length;i++)if(items[i] && i!==ignore)for(const c of this.cells(items[i],i,spec)||[])occupied.add(c);
        return cells.every(c=>!occupied.has(c));
    }
    static first(items:InventorySlotItem[],item:InventoryViewItem,spec:GridSpec):number {
        for(let i=0;i<spec.capacity;i++)if(this.fits(items,item,i,spec))return i;
        return -1;
    }
    static add(items:InventorySlotItem[],incoming:InventoryViewItem[],spec:GridSpec,stack:StackLimit,target?:number):InventorySlotItem[]|null {
        const result=this.clone(items);
        for(const original of incoming){
            if(!original?.itemId || !Number.isFinite(original.count) || original.count<=0)return null;
            const item={...original,gridVersion:2};
            let remaining=Math.floor(item.count);
            const max=Math.max(1,stack(item.itemId));
            if(target!==undefined){
                if(!Number.isInteger(target) || target<0 || target>=spec.capacity)return null;
                const anchor=this.anchor(result,target,spec), existing=result[anchor];
                if(existing){
                    if(existing.itemId!==item.itemId || existing.count+remaining>max)return null;
                    existing.count+=remaining;
                }else{
                    if(remaining>max || !this.fits(result,item,target,spec))return null;
                    result[target]=item;
                }
                continue;
            }
            for(const other of result){
                if(!other || other.itemId!==item.itemId)continue;
                const n=Math.min(remaining,Math.max(0,max-other.count));other.count+=n;remaining-=n;
            }
            while(remaining>0){
                const piece={...item,count:Math.min(remaining,max)};
                let index=this.first(result,piece,spec);
                if(index<0){piece.rotated=!piece.rotated;index=this.first(result,piece,spec);}
                if(index<0)return null;
                result[index]=piece;remaining-=piece.count;
            }
        }
        return this.clone(result);
    }
    static move(items:InventorySlotItem[],from:number,to:number,spec:GridSpec,stack:StackLimit,rotated?:boolean):InventorySlotItem[]|null {
        if(!Number.isInteger(from) || !items[from])return null;
        const result=this.clone(items), item={...result[from],rotated:rotated??!!result[from].rotated};
        result[from]=null;
        return this.add(result,[item],spec,stack,to);
    }
    static valid(items:InventorySlotItem[],spec:GridSpec,stack:StackLimit):boolean {
        const occupied=new Set<number>();
        for(let i=0;i<items.length;i++)if(items[i]){
            const item=items[i],cells=this.cells(item,i,spec);
            if(!cells || item.count<=0 || item.count>stack(item.itemId||''))return false;
            for(const c of cells){if(occupied.has(c))return false;occupied.add(c);}
        }
        return true;
    }
    /** Migration only: extend recovery space instead of discarding old possessions. */
    static migrate(items:InventorySlotItem[],spec:GridSpec,stack:StackLimit):InventorySlotItem[] {
        if(items.every(i=>!i||i.gridVersion===2) && this.valid(items,spec,stack))return this.clone(items);
        const result:InventorySlotItem[]=[];
        for(const old of items){
            if(!old)continue;
            let left=old.count;
            while(left>0){
                const item={...old,count:Math.min(left,stack(old.itemId||'')),gridVersion:2};
                let index=this.first(result,item,spec);
                if(index<0){item.rotated=!item.rotated;index=this.first(result,item,spec);}
                while(index<0){
                    // Fixed pockets cannot grow. The caller keeps the original save on failure.
                    if(spec.compartments)throw Error('Item does not fit fixed container compartments');
                    if(this.size(item).width>spec.columns || (spec.pageSize && this.size(item).height>spec.pageSize/spec.columns))throw Error('Item exceeds grid dimensions');
                    spec.capacity+=spec.pageSize||spec.columns;
                    index=this.first(result,item,spec);
                }
                result[index]=item;left-=item.count;
            }
        }
        return this.clone(result);
    }
}
