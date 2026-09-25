const fs=require('fs'),ts=require('../node_modules/typescript');
const read=p=>fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'');
const write=(p,s)=>fs.writeFileSync(p,s);
function method(p,name,body){let s=read(p);const ast=ts.createSourceFile(p,s,ts.ScriptTarget.Latest,true);let found;function walk(n){if(ts.isMethodDeclaration(n)&&n.name.getText(ast)===name)found=n;ts.forEachChild(n,walk);}walk(ast);if(!found)throw Error(name);s=s.slice(0,found.getStart(ast))+body+s.slice(found.end);write(p,s);}
const dm='src/systems/datamanager.ts';
method(dm,'transferItem',`public transferItem(sourceBucket:InventoryBucket,targetBucket:InventoryBucket,itemId:string,targetSlotIndex?:number):boolean {
        const source=sourceBucket==='active'?this.inventory.getGridStorage():this.warehouse.getGridStorage();
        const index=source.items.findIndex(i=>i?.itemId===itemId);
        return this.moveGridItem(sourceBucket,index,targetBucket,targetSlotIndex);
    }
    public moveGridItem(sourceBucket:InventoryBucket,sourceIndex:number,targetBucket:InventoryBucket,targetIndex?:number,rotated?:boolean,preview=false):boolean {
        const source=sourceBucket==='active'?this.inventory.getGridStorage():this.warehouse.getGridStorage();
        const target=targetBucket==='active'?this.inventory.getGridStorage():this.warehouse.getGridStorage();
        const item=source.items[sourceIndex];
        if(!Number.isInteger(sourceIndex)||!item)return false;
        const moved={...item,rotated:rotated??!!item.rotated};
        const from=InventoryGrid.clone(source.items);from[sourceIndex]=null;
        const to=InventoryGrid.add(source===target?from:target.items,[moved],target.spec,target.stack,targetIndex);
        if(!to)return false;
        if(preview)return true;
        if(source===target){
            if(targetBucket==='active')this.inventory.commitGrid(to,false);else this.warehouse.commitGrid(to);
        }else{
            // Both plans are complete before committing; never remove by item ID.
            if(sourceBucket==='active'){this.inventory.commitGrid(from,false);this.warehouse.commitGrid(to);}
            else{this.warehouse.commitGrid(from);this.inventory.commitGrid(to,false);}
        }
        this.inventory.refreshBagViews();this.syncWarehouseViews();this.refreshQuickSlotViews();return true;
    }`);
method(dm,'equipItemFromActive',`public equipItemFromActive(slot:EquipmentSlotType,itemId:string):boolean {
        if(!this.canEquipItemToSlot(itemId,slot))return false;
        const grid=this.inventory.getGridStorage(),index=grid.items.findIndex(i=>i?.itemId===itemId),item=grid.items[index];
        if(!item)return false;
        let next=InventoryGrid.clone(grid.items);next[index]=item.count>1?{...item,count:item.count-1}:null;
        const old=this.equippedItems[slot];
        if(old){next=InventoryGrid.add(next,[grid.normalizer(old)],grid.spec,grid.stack);if(!next)return false;}
        this.equippedItems[slot]={...item,itemId,count:1};this.inventory.commitGrid(next);this.saveEquipment();this.clearQuickSlotsForMissingItems();return true;
    }`);
method(dm,'unequipItemToActive',`public unequipItemToActive(slot:EquipmentSlotType):boolean {
        const item=this.equippedItems[slot];if(!item)return false;
        const next=this.inventory.getGridStorage().planAdd([item]);if(!next)return false;
        this.equippedItems[slot]=null;this.inventory.commitGrid(next);this.saveEquipment();this.refreshQuickSlotViews();return true;
    }`);
const wp='src/PlayUI/Warehouse/WarehousePanel.ts';let s=read(wp);
s=s.replaceAll('DataManager.getInstance().transferItem(this.selectedSlot.bucket, targetBucket, this.selectedSlot.itemId, targetSlotIndex)','DataManager.getInstance().moveGridItem(this.selectedSlot.bucket, this.selectedSlot.slotIndex, targetBucket, targetSlotIndex)');
s=s.replace('this.warehouseGlist.setSlotCount(WarehouseManager.PAGE_SIZE);','this.warehouseGlist.slotOffset = this.currentWarehousePage * WarehouseManager.PAGE_SIZE;\n        this.warehouseGlist.setSlotCount(this.getVisiblePageSize());');
s=s.replace('items.slice(startIndex, startIndex + WarehouseManager.PAGE_SIZE)','items.slice(startIndex, startIndex + this.getVisiblePageSize())');
s=s.replace('const pageEnd = pageStart + WarehouseManager.PAGE_SIZE;','const pageEnd = pageStart + this.getVisiblePageSize();');
s=s.replace('    private getWarehousePageCount(): number {',`    private getVisiblePageSize(): number {
        return this.currentWarehousePage === WarehouseManager.PAGE_COUNT-1
            ? Math.max(WarehouseManager.PAGE_SIZE,DataManager.getInstance().getWarehouseSlotCount()-this.currentWarehousePage*WarehouseManager.PAGE_SIZE)
            : WarehouseManager.PAGE_SIZE;
    }

    private getWarehousePageCount(): number {`);
write(wp,s);
// Explicit editable item footprints. Unknown items retain a conservative 1x1 footprint.
for(const file of ['weapons','misc','foods','materials','medicines']){
 const p='assets/config/items/'+file+'.json',raw=read(p),obj=JSON.parse(raw);
 const backup='backups/spatial-inventory-before-20260920/'+p;fs.mkdirSync(require('path').dirname(backup),{recursive:true});if(!fs.existsSync(backup))fs.writeFileSync(backup,raw);
 for(const item of obj.items){
  if(item.gridWidth&&item.gridHeight)continue;
  const sub=String(item.subCategory||''),id=item.id;let size=[1,1];
  if(file==='weapons')size=/pistol|handgun/i.test(sub)?[2,1]:/melee/i.test(sub)?(/knife|cleaver/.test(id)?[1,2]:[1,3]):[5,2];
  else if(/helmet|head|gangkui/i.test(sub+' '+id))size=[2,2];
  else if(/armor|body|fangdan/i.test(sub+' '+id))size=[2,3];
  else if(/plate|insert/i.test(sub))size=[2,2];
  else if(file==='foods' && /water|bottle|drink/i.test(sub+' '+id))size=[1,2];
  item.gridWidth=size[0];item.gridHeight=size[1];
 }
 write(p,JSON.stringify(obj,null,4)+'\n');
}
