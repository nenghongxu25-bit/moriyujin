import { DataManager, type EquipmentSlotType, type InventoryBucket, type InventorySlotItem } from '../../systems/datamanager';
import { InventoryGrid } from '../../systems/data/InventoryGrid';
import { glist } from './glist';
import { listTemplate } from './listTemplate';
import { InventoryGridInteraction } from './InventoryGridInteraction';
import { PlayerController } from '../../Player/PlayerController';

/** Controls authored prefab nodes. All grids, dialogs and buttons live in the prefab. */
export class TacticalInventoryPanel extends Laya.Script {
    protected warehouseMode=false;
    private bagGlist:glist;
    private warehouseGlist:glist;
    private selected:{bucket:InventoryBucket|'container'|'rig';index:number;item:InventorySlotItem}|null=null;
    private lastClick:{bucket:string;index:number;itemId:string;count:number;time:number;x:number;y:number;dragSequence:number}|null=null;
    private static readonly DOUBLE_CLICK_MS=250;
    private containerItems:InventorySlotItem[]=[];
    private searching=false;
    private rigStorageOpen=false;
    private statusVisible=true;
    private nextStatsRefresh=0;
    private filter='all';
    private nodes=new Map<string,any>();
    private dialogAction='';
    private readonly slots:EquipmentSlotType[]=['helmet','armor','insertPlate','weapon','pistol','secondary','melee','rig'];
    protected get dm():DataManager{return DataManager.getInstance();}
    onAwake():void {this.bind();this.register();this.refresh();}
    onEnable():void {this.bind();this.register();this.refresh();}
    onDisable():void {this.lastClick=null;this.unregister();InventoryGridInteraction.cancel();Laya.stage.offAllCaller(this);}
    onDestroy():void {this.unregister();Laya.stage.offAllCaller(this);Laya.timer.clearAll(this);}
    onUpdate():void {if(performance.now()<this.nextStatsRefresh)return;this.nextStatsRefresh=performance.now()+200;this.refreshPlayerStats();}
    private register():void {this.dm.registerBagView(this);this.dm.registerWarehouseView(this);this.dm.registerQuickSlotView(this);}
    private unregister():void {this.dm.unregisterBagView(this);this.dm.unregisterWarehouseView(this);this.dm.unregisterQuickSlotView(this);for(const slot of this.slots)InventoryGridInteraction.equipmentTargets.delete(this.node('equip_'+slot));}
    private node(name:string):any {
        if(this.nodes.has(name))return this.nodes.get(name);
        const walk=(n:any):any=>{if(n.name===name)return n;for(let i=0;i<n.numChildren;i++){const found=walk(n.getChildAt(i));if(found)return found;}return null;};
        const found=walk(this.owner);if(found)this.nodes.set(name,found);return found;
    }
    private text(name:string,value:string):void {const n=this.node(name);if(n)n.text=value;}
    private bind():void {
        this.bagGlist=this.node('carryGrid')?.getComponent(glist);
        this.warehouseGlist=this.node('storageGrid')?.getComponent(glist);
        const actions=['showStatus','showStorage','scrollEquipment','scrollBag','close','organizeBag','organizeWarehouse','transfer','equip','rotate','split','inspect','discard','dialogClose','dialogConfirm','filterAll','filterWeapons','filterOther','contextTransfer','contextEquip','contextRotate','contextSplit','contextInspect','contextDiscard'];
        actions.push('toggleContainer');
        for(const name of actions){const n=this.node(name);if(n){n.offAllCaller(this);n.on(Laya.Event.CLICK,this,this.action,[name]);}}
        for(const slot of this.slots){const n=this.node('equip_'+slot);if(n){n.mouseEnabled=true;n.offAllCaller(this);n.on(Laya.Event.CLICK,this,this.equipmentClick,[slot]);}}
        for(const slot of this.slots){const n=this.node('equip_'+slot);if(n){n.mouseEnabled=true;InventoryGridInteraction.equipmentTargets.set(n,(view,index,preview)=>{
            if(view!==this.bagGlist&&view!==this.warehouseGlist||view.listKey==='container')return false;
            const item=view.gridItems[index];if(!item||!this.dm.canEquipItemToSlot(item.itemId,slot))return false;
            if(preview)return true;
            const ok=this.dm.equipGridItem(view.listKey==='warehouse'?'warehouse':'active',index,slot);this.selected=null;this.refresh();this.notifyEquipment();this.message(ok?'装备已更新':'装备替换失败，空间不足');return ok;
        });}}
        for(let i=0;i<4;i++){const n=this.node('quick_'+i);if(n){n.offAllCaller(this);n.on(Laya.Event.CLICK,this,this.quickClick,[i]);}}
        const search=this.node('searchInput');if(search){search.offAllCaller(this);search.on(Laya.Event.INPUT,this,this.refresh);}
        Laya.stage.off(Laya.Event.KEY_DOWN,this,this.key);Laya.stage.on(Laya.Event.KEY_DOWN,this,this.key);
    }
    public setItems(_items:InventorySlotItem[]):void {this.refresh();}
    public refreshQuickSlots(_items:InventorySlotItem[]):void {this.refresh();}
    public refreshPlayerStats():void {
        const s=this.dm.getPlayerStats();
        this.text('health',`生命 ${Math.round(s.currentHp)} / ${Math.round(s.maxHp)}`);
        this.text('combatStats',`攻击 ${this.dm.getEquipmentAttackBonus()}     防护 ${this.dm.getEquipmentDefenseBonus()}`);
        for(const [key,current,max] of [['hp',s.currentHp,s.maxHp],['stamina',s.currentStamina,s.maxStamina],['hydration',s.currentHydration,s.maxHydration],['energy',s.currentSatiety,s.maxSatiety]] as [string,number,number][]){
            this.text(key+'Value',`${Math.round(current)} / ${Math.round(max)}`);
            const fill=this.node(key+'Fill');if(fill)fill.width=504*Math.max(0,Math.min(1,current/Math.max(1,max)));
        }
        const states=[];
        if(s.currentHp<s.maxHp)states.push(s.currentHp/s.maxHp<0.3?'重伤':'受伤');
        if(s.currentStamina/s.maxStamina<0.3)states.push('体力不足');
        if(s.currentHydration/s.maxHydration<0.3)states.push('缺水');
        if(s.currentSatiety/s.maxSatiety<0.3)states.push('饥饿');
        this.text('conditionText',states.length?states.join('  ·  '):'身体状态良好');
    }
    public refreshBuffStates():void {this.refreshPlayerStats();}
    public refresh():void {
        if(!this.bagGlist)return;
        const bag=this.dm.getInventorySnapshot(),stored=this.dm.getWarehouseSnapshot();
        this.bindGrid(this.bagGlist,'bag',bag,this.dm.getPlayerBagSlotCount());
        if(this.warehouseMode)this.bindGrid(this.warehouseGlist,'warehouse',stored,this.dm.getWarehouseSlotCount());
        else if(this.searching)this.bindGrid(this.warehouseGlist,'container',this.containerItems,Math.max(30,this.containerItems.length));
        else if(this.rigStorageOpen)this.bindGrid(this.warehouseGlist,'rigContents',this.dm.getEquippedContainerSnapshot('rig'),this.dm.getEquippedContainerCapacity('rig'));
        const storage=this.node('storageZone'),idle=this.node('inspectionZone');
        if(storage)storage.visible=!this.statusVisible&&(this.warehouseMode||this.searching||this.rigStorageOpen);
        if(idle)idle.visible=false;
        const status=this.node('playerStatusZone');if(status)status.visible=this.statusVisible||(!this.warehouseMode&&!this.searching);
        const storageButton=this.node('showStorage');if(storageButton){storageButton.mouseEnabled=this.warehouseMode||this.searching||this.rigStorageOpen;storageButton.alpha=storageButton.mouseEnabled?1:0.35;}
        this.text('storageTitle',this.warehouseMode?'整备仓库 / STASH':this.rigStorageOpen?'弹挂口袋 / RIG':'搜索容器 / LOOT');
        this.text('title',this.warehouseMode?'整备仓库':this.rigStorageOpen?'弹挂口袋':'随身装备');
        this.text('carryCapacity',this.capacity(bag,this.dm.getPlayerBagSlotCount()));
        const storageItems=this.warehouseMode?stored:this.rigStorageOpen?this.dm.getEquippedContainerSnapshot('rig'):this.containerItems;
        const storageCapacity=this.warehouseMode?this.dm.getWarehouseSlotCount():this.rigStorageOpen?this.dm.getEquippedContainerCapacity('rig'):Math.max(30,this.containerItems.length);
        this.text('storageCapacity',this.capacity(storageItems,storageCapacity));
        for(const slot of this.slots)this.renderSlot('equip_'+slot,this.dm.getLoadoutItem(slot));
        this.dm.getQuickSlotItems().forEach((item,i)=>this.renderSlot('quick_'+i,item));
        if(this.selected){const s=this.selected,items=s.bucket==='container'?this.containerItems:s.bucket==='rig'?this.dm.getEquippedContainerSnapshot('rig'):this.dm.getInventorySnapshot(s.bucket);if(items[s.index]?.itemId!==s.item?.itemId)this.selected=null;else s.item=items[s.index];}
        this.refreshPlayerStats();this.refreshSelection();
    }
    private capacity(items:InventorySlotItem[],max:number):string {
        const occupied=items.reduce((n,item)=>{const size=item?InventoryGrid.size(item):{width:0,height:0};return n+size.width*size.height;},0);
        return `${occupied} / ${max} 格`;
    }
    private bindGrid(view:glist,key:string,items:InventorySlotItem[],capacity:number):void {
        if(!view)return;view.listKey=key;view.slotOffset=0;
        view.onSlotClick=(item,_key,index,event)=>this.select(this.bucketForGrid(key),index,item,event);
        view.onContextClick=(item,_key,index,event)=>{
            this.select(this.bucketForGrid(key),index,item);
            if(item){const menu=this.node('contextMenu'),p=(this.owner as any).globalToLocal(new Laya.Point(Laya.stage.mouseX,Laya.stage.mouseY));
                menu.pos(Math.min(1142,Math.max(0,p.x)),Math.min(504,Math.max(0,p.y)));menu.visible=true;
            }
            event?.stopPropagation();
        };
        view.onGridTransfer=(index,target,targetIndex,rotated,preview)=>{
            if(key==='container'){
                const item=this.containerItems[index];if(!item||target!==this.bagGlist)return false;
                const ok=this.dm.transferLooseItemToActive({...item,rotated},targetIndex,preview);
                if(ok&&!preview){this.containerItems[index]=null;this.selected=null;this.refresh();}return ok;
            }
            if(key==='rigContents'&&target===this.bagGlist)return this.dm.moveEquipmentContainerItemToActive('rig',index,targetIndex,preview);
            if(key==='bag'&&target===this.warehouseGlist&&this.rigStorageOpen)return this.dm.moveActiveItemToEquipmentContainer('rig',index,targetIndex,preview);
            if(key==='rigContents'&&target===this.warehouseGlist)return this.dm.moveEquipmentContainerItem('rig',index,targetIndex,rotated,preview);
            return false;
        };
        const query=String(this.node('searchInput')?.text||'').trim().toLowerCase();
        view.itemFilter=item=>{
            const meta=this.dm.resolveItemMeta(item.itemId),weapon=meta?.category==='weapons';
            return (this.filter==='all'||(this.filter==='weapons'?weapon:!weapon))&&(!query||`${meta?.nameZh||meta?.displayName||item.name} ${item.itemId}`.toLowerCase().includes(query));
        };
        view.setSlotCount(capacity);view.setItems(items);view.setSelectedSlotIndex(this.selected?.bucket===this.bucketForGrid(key)?this.selected.index:-1);
    }
    private bucketForGrid(key:string):InventoryBucket|'container'|'rig'{return key==='warehouse'?'warehouse':key==='container'?'container':key==='rigContents'?'rig':'active';}
    private renderSlot(name:string,item:InventorySlotItem):void {
        const n=this.node(name);if(!n)return;const icon=n.getChildByName('icon'),label=n.getChildByName('itemLabel');
        if(icon){icon.visible=!!item;if(item)icon.src=item.icon||this.dm.resolveFallbackIcon(item.itemId)||this.dm.resolveItemMeta(item.itemId)?.icon||'';}
        if(label)label.text=item?this.dm.resolveFallbackName(item.itemId)||item.name:'未装备';
    }
    private select(bucket:InventoryBucket|'container'|'rig',index:number,item:InventorySlotItem,event?:any):void {
        if(InventoryGridInteraction.blockClick){this.lastClick=null;return;}
        const now=performance.now(),previous=this.lastClick;
        const plainClick=!!event&&!event.ctrlKey&&!event.altKey&&!event.shiftKey&&!event.metaKey&&!event.nativeEvent?.ctrlKey&&!event.nativeEvent?.altKey;
        const canTransfer=this.warehouseMode||bucket==='container';
        const doubleClick=!!item&&plainClick&&canTransfer&&previous?.bucket===bucket&&previous.index===index&&previous.itemId===item.itemId&&previous.count===item.count&&previous.dragSequence===InventoryGridInteraction.dragSequence&&now-previous.time<=TacticalInventoryPanel.DOUBLE_CLICK_MS&&Math.hypot(Laya.stage.mouseX-previous.x,Laya.stage.mouseY-previous.y)<=20;
        this.lastClick=item&&plainClick&&canTransfer&&!doubleClick?{bucket,index,itemId:item.itemId,count:item.count,time:now,x:Laya.stage.mouseX,y:Laya.stage.mouseY,dragSequence:InventoryGridInteraction.dragSequence}:null;
        if(this.node('contextMenu'))this.node('contextMenu').visible=false;
        if(!item&&this.selected&&this.selected.bucket!=='container'&&bucket!=='container'){
            const from=this.selected.bucket;const ok=from==="rig"&&bucket==="active"?this.dm.moveEquipmentContainerItemToActive("rig",this.selected.index,index):from==="active"&&bucket==="rig"?this.dm.moveActiveItemToEquipmentContainer("rig",this.selected.index,index):from==="rig"&&bucket==="rig"?this.dm.moveEquipmentContainerItem("rig",this.selected.index,index):from!=="rig"&&bucket!=="rig"?this.dm.moveGridItem(from as InventoryBucket,this.selected.index,bucket as InventoryBucket,index):false;this.message(ok?'已移动':'该位置无法放置');this.selected=null;this.refresh();return;
        }
        this.selected=item?{bucket,index,item:{...item}}:null;this.refreshSelection();
        if(item&&(event?.ctrlKey||event?.nativeEvent?.ctrlKey))this.action('transfer');
        else if(item&&(event?.altKey||event?.nativeEvent?.altKey))this.action('equip');
        else if(doubleClick)this.action('transfer');
    }
    private refreshSelection():void {
        const s=this.selected,item=s?.item,meta=item?this.dm.resolveItemMeta(item.itemId):null;
        const label=item?meta?.nameZh||meta?.displayName||item.name:'选择物品查看详情';
        this.text('selectedName',label);this.text('inspectionName',label);
        this.text('inspectionText',item?listTemplate.formatItemDetailText(item):'点选物品后，可查看属性、装备或整理。\n\n拖拽物品调整位置；拖拽时按 R 旋转。');
        const icon=this.node('inspectionIcon');if(icon){icon.visible=!!item;if(item)icon.src=item.icon||meta?.icon||'';}
        const fold=this.node('toggleContainer');
        if(fold){
            fold.visible=!!meta?.storageStates;
            const blocked=item?.state!=='folded'&&item?.contents?.some(Boolean);
            fold.mouseEnabled=fold.visible&&!blocked;fold.alpha=blocked?0.4:1;
            const label=fold.getChildByName('label');if(label)label.text=item?.state==='folded'?'展开':blocked?'卷起（非空）':'卷起';
        }
        this.bagGlist?.setSelectedSlotIndex(s?.bucket==='active'?s.index:-1);
        this.warehouseGlist?.setSelectedSlotIndex(s&&s.bucket!=='active'?s.index:-1);
        const enabled:any={transfer:!!item&&(s.bucket==='container'||this.warehouseMode||s.bucket==='rig'),equip:!!item&&s.bucket!=='container'&&s.bucket!=='rig'&&!!this.dm.resolveEquipmentSlotForItem(item.itemId),rotate:!!item&&(s.bucket==='active'||s.bucket==='warehouse'||s.bucket==='rig'),split:!!item&&item.count>1&&(s.bucket==='active'||s.bucket==='warehouse'),inspect:!!item,discard:!!item&&(s.bucket==='active'||s.bucket==='warehouse')};
        for(const name of Object.keys(enabled)){const n=this.node(name);if(n){n.alpha=enabled[name]?1:0.35;n.mouseEnabled=enabled[name];}}
    }
    private action(name:string):void {
        this.lastClick=null;
        if(name==='showStatus'||name==='showStorage'){this.statusVisible=name==='showStatus';this.refresh();return;}
        if(name==='scrollEquipment'||name==='scrollBag'){this.node('loadoutScroll')?.scroller?.setPosY(name==='scrollBag'?(this.node('carryTitle')?.y||0):0,false);return;}
        if(name.startsWith('context'))name=name.slice(7).toLowerCase();
        if(this.node('contextMenu'))this.node('contextMenu').visible=false;
        if(name==='close'){this.closePanel();return;}
        if(name==='dialogClose'){this.showDialog(false);this.dialogAction='';return;}
        if(name.startsWith('filter')){this.filter=name==='filterAll'?'all':name==='filterWeapons'?'weapons':'other';this.refresh();return;}
        if(name==='organizeBag'||name==='organizeWarehouse'){
            const ok=this.dm.organizeInventory(name==='organizeBag'?'active':'warehouse');this.selected=null;this.refresh();this.message(ok?'整理完成':'空间不足，保留原有排列');return;
        }
        const s=this.selected;if(!s?.item)return;
        if(name==='toggleContainer'){
            const wasFolded=s.item.state==='folded';let error:string|null;
            if(s.bucket==='container'){
                const plan=this.dm.planContainerToggle(this.containerItems,s.index,{columns:6,capacity:Math.max(30,this.containerItems.length)});
                error=plan.error;if(plan.items)this.containerItems=plan.items;
            }else if(s.bucket==='active'||s.bucket==='warehouse')error=this.dm.toggleContainerState(s.bucket,s.index);
            this.refresh();this.message(error||(wasFolded?'已展开':'已卷起'));return;
        }
        if(name==='inspect'||name==='split'||name==='discard'){
            this.dialogAction=name;this.showDialog(true);
            this.text('dialogTitle',name==='split'?'拆分数量':name==='discard'?'确认丢弃':'物品详情');
            this.text('dialogText',listTemplate.formatItemDetailText(s.item)+(name==='discard'?'\n\n丢弃后无法找回。':''));
            this.node('splitInput').visible=name==='split';this.node('splitInput').text=String(Math.floor(s.item.count/2));
            this.node('dialogConfirm').visible=name!=='inspect';return;
        }
        let ok=false;
        if(name==='dialogConfirm'){
            if(s.bucket==='container'||s.bucket==='rig')return;
            ok=this.dialogAction==='split'?this.dm.splitInventoryStack(s.bucket,s.index,Number(this.node('splitInput').text)):this.dialogAction==='discard'?this.dm.discardInventorySlot(s.bucket,s.index):false;
            if(ok){this.showDialog(false);this.dialogAction='';}
        }else if(name==='transfer'){
            if(s.bucket==='container'){ok=this.dm.transferLooseItemToActive(s.item);if(ok)this.containerItems[s.index]=null;}
            else if(this.warehouseMode&&(s.bucket==='active'||s.bucket==='warehouse'))ok=this.dm.moveGridItem(s.bucket,s.index,s.bucket==='active'?'warehouse':'active');
        }else if(name==='equip'&&s.bucket!=='container'&&s.bucket!=='rig'){
            const slot=this.dm.resolveEquipmentSlotForItem(s.item.itemId);if(slot)ok=this.dm.equipGridItem(s.bucket,s.index,slot);
        }else if(name==='rotate')ok=s.bucket==='rig'?this.dm.moveEquipmentContainerItem('rig',s.index,s.index,!s.item.rotated):s.bucket==='active'||s.bucket==='warehouse'?this.dm.moveGridItem(s.bucket,s.index,s.bucket,s.index,!s.item.rotated):false;
        if(ok)this.selected=null;this.refresh();this.notifyEquipment();this.message(ok?'操作完成':'无法完成：检查空间、物品类型或数量');
    }
    private equipmentClick(slot:EquipmentSlotType):void {
        this.lastClick=null;
        const s=this.selected;
        if(slot==='rig'&&!s){if(!this.dm.getLoadoutItem('rig')){this.message('Equip a rig first');return;}this.rigStorageOpen=!this.rigStorageOpen;this.searching=false;this.warehouseMode=false;this.statusVisible=false;this.refresh();return;}
        const ok=s&&s.bucket!=='container'&&s.bucket!=='rig'?this.dm.equipGridItem(s.bucket,s.index,slot):!s?this.dm.unequipItemToActive(slot):false;
        if(ok)this.selected=null;this.refresh();this.notifyEquipment();this.message(ok?'装备已更新':'没有适用装备，或背包空间不足');
    }
    private quickClick(index:number):void {
        this.lastClick=null;
        const s=this.selected;let ok=false;
        if(s?.bucket==='active')ok=this.dm.assignActiveSlotToQuickSlot(index,s.index);
        else if(s?.bucket==='rig'){
            const bag=this.dm.getInventorySnapshot(),to=InventoryGrid.first(bag,s.item,{columns:5,capacity:this.dm.getPlayerBagSlotCount()});
            if(to>=0&&this.dm.moveEquipmentContainerItemToActive('rig',s.index,to))ok=this.dm.assignActiveSlotToQuickSlot(index,to);
        }
        else {
            const item=this.dm.getQuickSlotItems()[index];
            if(item){const items=this.dm.getInventorySnapshot(),meta=this.dm.resolveItemMeta(item.itemId),normalized={...item,gridWidth:meta?.gridWidth,gridHeight:meta?.gridHeight};
                const target=InventoryGrid.first(items,normalized,{columns:5,capacity:this.dm.getPlayerBagSlotCount()});
                if(target>=0)ok=this.dm.moveQuickSlotToActiveSlot(index,target);
            }
        }
        if(ok)this.selected=null;this.refresh();this.message(ok?'快捷栏已更新':'请先选择背包物品，或腾出背包空间');
    }
    private notifyEquipment():void {PlayerController.activeInstance?.refreshEquipmentFromData();}
    private message(value:string):void {this.text('status',value);}
    private showDialog(visible:boolean):void {this.node('dialog').visible=visible;this.node('dialogShield').visible=visible;}
    private key(event:any):void {
        for(let n:any=this.owner;n;n=n.parent)if(n.visible===false||n.active===false)return;
        if(this.node('searchInput')?.focus||this.node('splitInput')?.focus)return;
        if(event.keyCode===27){if(InventoryGridInteraction.isDragging){InventoryGridInteraction.cancel();return;}if(this.node('dialog')?.visible)this.action('dialogClose');else this.closePanel();}
        if(this.node('dialog')?.visible)return;
        if(event.keyCode===82&&!InventoryGridInteraction.isDragging)this.action('rotate');
        if(event.keyCode===46)this.action('discard');
    }
    public closePanel():void {this.lastClick=null;InventoryGridInteraction.cancel();this.selected=null;this.showDialog(false);this.node('contextMenu').visible=false;(this.owner as any).visible=false;}
    public openDefault():void {this.lastClick=null;this.searching=false;this.rigStorageOpen=!this.warehouseMode&&!!this.dm.getLoadoutItem('rig');this.statusVisible=!this.warehouseMode&&!this.rigStorageOpen;this.selected=null;this.showDialog(false);this.node('contextMenu').visible=false;this.refresh();}
    public showDefaultState():void {this.openDefault();}
    public onPanelOpened():void {this.openDefault();}
    public openContainerSearch():void {this.lastClick=null;this.rigStorageOpen=false;this.searching=true;this.statusVisible=false;this.refresh();}
    public openContainerSearchWithItems(items:InventorySlotItem[]):void {
        this.lastClick=null;
        const spec={columns:6,capacity:Math.max(30,items.length)};
        this.containerItems=InventoryGrid.migrate(items.map(item=>{if(!item)return null;const meta=this.dm.resolveItemMeta(item.itemId),shape=meta?.storageStates?.[item.state==='folded'?'folded':'expanded'];return {...item,icon:shape?.icon||item.icon||meta?.icon||this.dm.resolveFallbackIcon(item.itemId),gridWidth:shape?.gridWidth||meta?.gridWidth||1,gridHeight:shape?.gridHeight||meta?.gridHeight||1};}),spec,id=>this.dm.resolveItemStackMax(id));
        this.searching=true;this.statusVisible=false;this.selected=null;this.refresh();
    }
    public showContainerSearchState():void {this.openContainerSearch();}
    public showState(state:number):void {state===1?this.openContainerSearch():this.openDefault();}
}
