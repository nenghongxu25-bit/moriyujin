import { InventoryGrid, type GridSpec } from './InventoryGrid';
import type { InventoryViewItem } from './InventoryTypes';
export interface PackingShape {gridWidth:number;gridHeight:number;icon:string;}
export interface PackingDefinition {id:string;name:string;container:GridSpec;storageStates:{expanded:PackingShape;folded:PackingShape};}
export interface PackedItem extends InventoryViewItem {instanceId:string;state?:'expanded'|'folded';contents?:Array<PackedItem|null>;}

/** Immutable packing plans. Callers commit both source and destination only after success. */
export class ContainerPacking {
    constructor(private definitions:Record<string,PackingDefinition>){}
    create(id:string,instanceId:string):PackedItem {
        const d=this.definitions[id];if(!d)throw Error('Unknown container '+id);
        return {itemId:id,name:d.name,count:1,instanceId,state:'expanded',contents:[],...d.storageStates.expanded};
    }
    changeState(item:PackedItem,state:'expanded'|'folded'):PackedItem|null {
        const d=this.definitions[item.itemId];if(!d||!item.contents)return null;
        if(state==='folded'&&item.contents.some(Boolean))return null;
        return {...item,...d.storageStates[state],state};
    }
    insert(target:PackedItem,incoming:PackedItem,index?:number):PackedItem|null {
        const d=this.definitions[target.itemId];if(!d||target.state!=='expanded'||!target.contents)return null;
        const ids=(node:PackedItem,out=new Set<string>()):Set<string>=>{
            if(!node.instanceId||out.has(node.instanceId))throw Error('Duplicate or cyclic instance');
            out.add(node.instanceId);for(const child of node.contents||[])if(child)ids(child,out);return out;
        };
        try{const existing=ids(target);if(Array.from(ids(incoming)).some(id=>existing.has(id)))return null;}catch{return null;}
        const contents=InventoryGrid.add(target.contents,[incoming],d.container,()=>1,index);
        return contents?{...target,contents:contents as Array<PackedItem|null>}:null;
    }
    resizeChild(parent:PackedItem,index:number,state:'expanded'|'folded'):PackedItem|null {
        const d=this.definitions[parent.itemId],child=parent.contents?.[index];
        if(!d||parent.state!=='expanded'||!child)return null;
        const next=this.changeState(child,state);if(!next||!InventoryGrid.fits(parent.contents,next,index,d.container,index))return null;
        const contents=parent.contents.slice();contents[index]=next;return {...parent,contents};
    }
}
