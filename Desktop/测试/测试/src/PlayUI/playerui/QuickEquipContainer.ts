const { regClass, property } = Laya;

import { DataManager, type InventorySlotItem } from "../../systems/datamanager";
import { PlayerController } from "../../Player/PlayerController";
import { listTemplate } from "../CommonUI/listTemplate";

@regClass("c50e856c-df34-4d80-9452-b4fbbf5a3425")
export class QuickEquipContainer extends Laya.Script {
    @property(Laya.Node)
    public quickSlot1: Laya.Node | null = null;

    @property(Laya.Node)
    public quickSlot2: Laya.Node | null = null;

    @property(Laya.Node)
    public quickSlot3: Laya.Node | null = null;

    @property(Laya.Node)
    public quickSlot4: Laya.Node | null = null;

    @property(Laya.Node)
    public weaponSlot: Laya.Node | null = null;

    @property(Laya.Node)
    public plateSlot: Laya.Node | null = null;

    @property(Laya.Node)
    public armorSlot: Laya.Node | null = null;

    private quickSlotItems: InventorySlotItem[] = [];

    onAwake(): void {
        this.resolveQuickSlotsByName();
        this.initializeQuickSlotIconSizes();
        this.bindQuickSlotClicks();
        DataManager.getInstance().registerQuickSlotView(this);
        Laya.timer.callLater(this, this.renderQuickSlots);
    }

    onEnable(): void {
        this.resolveQuickSlotsByName();
        this.initializeQuickSlotIconSizes();
        this.bindQuickSlotClicks();
        DataManager.getInstance().registerQuickSlotView(this);
        this.renderQuickSlots();
        Laya.timer.callLater(this, this.renderQuickSlots);
    }

    onDisable(): void {
        DataManager.getInstance().unregisterQuickSlotView(this);
    }

    onDestroy(): void {
        DataManager.getInstance().unregisterQuickSlotView(this);
    }

    public refreshQuickSlots(items: InventorySlotItem[]): void {
        this.quickSlotItems = Array.isArray(items) ? items.map((item) => (item ? { ...item } : null)) : [];
        this.resolveQuickSlotsByName();
        this.bindQuickSlotClicks();
        this.renderQuickSlots();
    }

    public setVisible(visible: boolean): void {
        this.setNodeVisible(this.quickSlot1, visible);
        this.setNodeVisible(this.quickSlot2, visible);
        this.setNodeVisible(this.quickSlot3, visible);
        this.setNodeVisible(this.quickSlot4, visible);
        this.setNodeVisible(this.weaponSlot, visible);
        this.setNodeVisible(this.plateSlot, visible);
        this.setNodeVisible(this.armorSlot, visible);
    }

    public getQuickSlots(): Array<Laya.Node | null> {
        return [this.quickSlot1, this.quickSlot2, this.quickSlot3, this.quickSlot4];
    }

    public getEquipSlots(): Array<Laya.Node | null> {
        return [this.weaponSlot, this.plateSlot, this.armorSlot];
    }

    private renderQuickSlots(): void {
        const slots = this.getQuickSlots();
        for (let i = 0; i < slots.length; i++) {
            const node = slots[i];
            if (!node) {
                continue;
            }

            let template = node.getComponent(listTemplate);
            if (!template) {
                template = node.addComponent(listTemplate);
            }

            const item = this.quickSlotItems[i] || null;
            template.bindData(item ? {
                itemId: item.itemId,
                name: item.name,
                count: item.count,
                icon: item.icon,
            } : null);
            this.applySlotIconSize(node);
        }
    }

    private bindQuickSlotClicks(): void {
        const slots = this.getQuickSlots();
        for (let i = 0; i < slots.length; i++) {
            const node = slots[i] as any;
            if (!node || typeof node.on !== "function" || typeof node.off !== "function") {
                continue;
            }

            node.mouseEnabled = true;
            node.off(Laya.Event.CLICK, this, this.onQuickSlotClick);
            node.on(Laya.Event.CLICK, this, this.onQuickSlotClick, [i]);
        }
    }

    private onQuickSlotClick(quickSlotIndex: number, event?: Laya.Event): void {
        if (event && typeof event.stopPropagation === "function") {
            event.stopPropagation();
        }

        const result = DataManager.getInstance().activateQuickSlot(quickSlotIndex);
        if (!result.success) {
            return;
        }

        if (result.usedItem) {
            const stats = DataManager.getInstance().getPlayerStats();
            PlayerController.activeInstance?.setHp(stats.currentHp, stats.maxHp);
        }

        if (result.switchedWeapon) {
            PlayerController.activeInstance?.refreshEquipmentFromData();
            Laya.timer.callLater(this, () => {
                PlayerController.activeInstance?.refreshEquipmentFromData();
            });
        }
    }

    private resolveQuickSlotsByName(): void {
        if (!this.quickSlot1) {
            this.quickSlot1 = this.findDirectChildByName("1");
        }
        if (!this.quickSlot2) {
            this.quickSlot2 = this.findDirectChildByName("2");
        }
        if (!this.quickSlot3) {
            this.quickSlot3 = this.findDirectChildByName("3");
        }
        if (!this.quickSlot4) {
            this.quickSlot4 = this.findDirectChildByName("4");
        }
    }

    private findDirectChildByName(name: string): Laya.Node | null {
        const children = (this.owner as any)?.children as Laya.Node[] | undefined;
        if (!children) {
            return null;
        }

        for (const child of children) {
            if (String((child as any)?.name || "") === name) {
                return child;
            }
        }

        return null;
    }

    private setNodeVisible(node: Laya.Node | null, visible: boolean): void {
        const target = node as any;
        if (!target) {
            return;
        }

        if ("visible" in target) {
            (target as any).visible = visible;
        }

        if ("active" in target) {
            target.active = visible;
        }
    }

    private initializeQuickSlotIconSizes(): void {
        const slots = this.getQuickSlots();
        for (let i = 0; i < slots.length; i++) {
            this.applySlotIconSize(slots[i]);
        }

        Laya.timer.callLater(this, () => {
            this.resolveQuickSlotsByName();
            const delayedSlots = this.getQuickSlots();
            for (let i = 0; i < delayedSlots.length; i++) {
                this.applySlotIconSize(delayedSlots[i]);
            }
        });
    }

    private applySlotIconSize(slotNode: Laya.Node | null): void {
        const icon = slotNode ? this.findChildByName(slotNode, "icon") as any : null;
        if (!icon) {
            return;
        }

        if ("width" in icon) {
            icon.width = 55;
        }

        if ("height" in icon) {
            icon.height = 55;
        }

        if ("autoSize" in icon) {
            icon.autoSize = false;
        }

        if ("scaleX" in icon) {
            icon.scaleX = 1;
        }

        if ("scaleY" in icon) {
            icon.scaleY = 1;
        }
    }

    private findChildByName(root: Laya.Node | null, name: string): Laya.Node | null {
        if (!root) {
            return null;
        }

        if (String((root as any).name || "") === name) {
            return root;
        }

        const children = (root as any).children as Laya.Node[] | undefined;
        if (!children) {
            return null;
        }

        for (let i = 0; i < children.length; i++) {
            const found = this.findChildByName(children[i], name);
            if (found) {
                return found;
            }
        }

        return null;
    }
}
