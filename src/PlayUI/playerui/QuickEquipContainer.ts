const { regClass, property } = Laya;

import { DataManager, type EquipmentSlotType, type InventorySlotItem, type QuickSlotView, type WeaponLoadoutSlot } from "../../systems/datamanager";
import { PlayerController } from "../../Player/PlayerController";
import { listTemplate } from "../CommonUI/listTemplate";
import { attack } from "./attack";

type HudLoadoutSlot = WeaponLoadoutSlot | "throwable" | "medicine";

@regClass("c50e856c-df34-4d80-9452-b4fbbf5a3425")
export class QuickEquipContainer extends Laya.Script implements QuickSlotView {
    @property(Laya.Node) public meleeSlot: Laya.Node | null = null;
    @property(Laya.Node) public primaryWeaponSlot: Laya.Node | null = null;
    @property(Laya.Node) public pistolSlot: Laya.Node | null = null;
    @property(Laya.Node) public secondaryWeaponSlot: Laya.Node | null = null;
    @property(Laya.Node) public throwableSlot: Laya.Node | null = null;
    @property(Laya.Node) public medicineSlot: Laya.Node | null = null;

    private quickSlotItems: InventorySlotItem[] = [];
    private readonly quickSlotIndexByHudSlot = new Map<HudLoadoutSlot, number>();
    private throwableFromRig = false;

    onAwake(): void {
        this.resolveSlots();
        this.initializeSlotIcons();
        this.bindSlotClicks();
        DataManager.getInstance().registerQuickSlotView(this);
        Laya.timer.callLater(this, this.renderLoadout);
    }

    onEnable(): void {
        this.resolveSlots();
        this.initializeSlotIcons();
        this.bindSlotClicks();
        DataManager.getInstance().registerQuickSlotView(this);
        this.renderLoadout();
        Laya.timer.callLater(this, this.renderLoadout);
    }

    onDisable(): void {
        DataManager.getInstance().unregisterQuickSlotView(this);
        this.unbindSlotClicks();
    }

    onDestroy(): void {
        DataManager.getInstance().unregisterQuickSlotView(this);
        this.unbindSlotClicks();
    }

    public refreshQuickSlots(items: InventorySlotItem[]): void {
        this.quickSlotItems = Array.isArray(items) ? items.map((item) => item ? { ...item } : null) : [];
        this.renderLoadout();
    }

    public setVisible(visible: boolean): void {
        for (const [, node] of this.getHudSlotEntries()) {
            if (node) (node as any).visible = visible;
        }
    }

    private renderLoadout = (): void => {
        this.resolveSlots();
        this.quickSlotIndexByHudSlot.clear();
        this.throwableFromRig = false;

        const data = DataManager.getInstance();
        const items = new Map<HudLoadoutSlot, InventorySlotItem>();
        const gearSlots: WeaponLoadoutSlot[] = ["melee", "weapon", "pistol", "secondary"];
        for (const slot of gearSlots) {
            const item = data.getLoadoutItem(slot);
            if (item) items.set(slot, item);
        }

        const activeWeapon = data.getEquippedItem("weapon");
        if (activeWeapon) {
            const activeSlot = data.getItemHudSlot(activeWeapon.itemId);
            if ((activeSlot === "weapon" || activeSlot === "melee" || activeSlot === "pistol" || activeSlot === "secondary") && !items.has(activeSlot)) {
                items.set(activeSlot, activeWeapon);
            }
        }

        const rigContents=data.getEquippedContainerSnapshot("rig");
        const rigIndex=rigContents.findIndex((item)=>!!item&&data.getItemHudSlot(item.itemId)==="throwable");
        if(rigIndex>=0&&rigContents[rigIndex]){
            items.set("throwable",rigContents[rigIndex]!);
            this.quickSlotIndexByHudSlot.set("throwable",rigIndex);
            this.throwableFromRig=true;
        }

        for (let i = 0; i < this.quickSlotItems.length; i++) {
            const item = this.quickSlotItems[i];
            if (!item?.itemId) continue;
            const hudSlot = data.getItemHudSlot(item.itemId);
            if ((hudSlot === "medicine" || hudSlot === "throwable") && !items.has(hudSlot)) {
                items.set(hudSlot, item);
                this.quickSlotIndexByHudSlot.set(hudSlot, i);
            }
        }

        for (const [slot, node] of this.getHudSlotEntries()) {
            if (!node) continue;
            const template = this.getTemplate(node);
            template?.bindData(items.get(slot) || null);
            this.applySlotIconSize(node);
        }
    };

    private bindSlotClicks(): void {
        for (const [slot, node] of this.getHudSlotEntries()) {
            if (!node || (slot !== "weapon" && slot !== "melee" && slot !== "pistol" && slot !== "secondary" && slot !== "medicine" && slot !== "throwable")) continue;
            const target = node as any;
            target.mouseEnabled = true;
            target.off(Laya.Event.CLICK, this, this.onHudSlotClick);
            target.on(Laya.Event.CLICK, this, this.onHudSlotClick, [slot]);
        }
    }

    private unbindSlotClicks(): void {
        for (const [, node] of this.getHudSlotEntries()) {
            (node as any)?.off?.(Laya.Event.CLICK, this, this.onHudSlotClick);
        }
    }

    private onHudSlotClick = (slot: HudLoadoutSlot, event?: Laya.Event): void => {
        event?.stopPropagation?.();
        const data = DataManager.getInstance();
        if(slot==="throwable"){
            const index=this.quickSlotIndexByHudSlot.get(slot);
            const item=index===undefined?null:(this.throwableFromRig?data.getEquippedContainerSnapshot("rig")[index]:this.quickSlotItems[index]);
            if(index===undefined||!item)return;
            attack.activeInstance?.selectThrowable(item.itemId,index,this.throwableFromRig?"rig":"quick");return;
        }
        if (slot === "weapon" || slot === "melee" || slot === "pistol" || slot === "secondary") {
            if (data.activateEquipmentWeaponSlot(slot)) {
                PlayerController.activeInstance?.refreshEquipmentFromData();
                Laya.timer.callLater(this, () => PlayerController.activeInstance?.refreshEquipmentFromData());
            }
            return;
        }

        const quickSlotIndex = this.quickSlotIndexByHudSlot.get(slot);
        if (quickSlotIndex === undefined) return;
        const result = data.activateQuickSlot(quickSlotIndex);
        if (result.usedItem) {
            const stats = data.getPlayerStats();
            PlayerController.activeInstance?.setHp(stats.currentHp, stats.maxHp);
        }
        if (result.switchedWeapon) {
            PlayerController.activeInstance?.refreshEquipmentFromData();
            Laya.timer.callLater(this, () => PlayerController.activeInstance?.refreshEquipmentFromData());
        }
    };

    private getHudSlotEntries(): Array<[HudLoadoutSlot, Laya.Node | null]> {
        return [
            ["melee", this.meleeSlot],
            ["weapon", this.primaryWeaponSlot],
            ["pistol", this.pistolSlot],
            ["secondary", this.secondaryWeaponSlot],
            ["throwable", this.throwableSlot],
            ["medicine", this.medicineSlot],
        ];
    }

    private resolveSlots(): void {
        this.meleeSlot ||= this.findDirectChildByName("dao");
        this.primaryWeaponSlot ||= this.findDirectChildByName("zhu");
        this.pistolSlot ||= this.findDirectChildByName("shou");
        this.secondaryWeaponSlot ||= this.findDirectChildByName("fu");
        this.throwableSlot ||= this.findDirectChildByName("touzhi");
        this.medicineSlot ||= this.findDirectChildByName("yaopin");
    }

    private findDirectChildByName(name: string): Laya.Node | null {
        const children = (this.owner as any)?.children as Laya.Node[] | undefined;
        return children?.find((child) => String((child as any)?.name || "") === name) || null;
    }

    private getTemplate(node: Laya.Node): listTemplate {
        return node.getComponent(listTemplate) || node.addComponent(listTemplate);
    }

    private initializeSlotIcons(): void {
        for (const [, node] of this.getHudSlotEntries()) this.applySlotIconSize(node);
        Laya.timer.callLater(this, () => {
            this.resolveSlots();
            for (const [, node] of this.getHudSlotEntries()) this.applySlotIconSize(node);
        });
    }

    private applySlotIconSize(slotNode: Laya.Node | null): void {
        const icon = slotNode ? this.findChildByName(slotNode, "icon") as any : null;
        if (!icon) return;
        if ("width" in icon) icon.width = 55;
        if ("height" in icon) icon.height = 55;
        if ("autoSize" in icon) icon.autoSize = false;
        if ("scaleX" in icon) icon.scaleX = 1;
        if ("scaleY" in icon) icon.scaleY = 1;
    }

    private findChildByName(root: Laya.Node | null, name: string): Laya.Node | null {
        if (!root) return null;
        if (String((root as any).name || "") === name) return root;
        const children = (root as any).children as Laya.Node[] | undefined;
        if (!children) return null;
        for (const child of children) {
            const found = this.findChildByName(child, name);
            if (found) return found;
        }
        return null;
    }
}
