const { regClass, property } = Laya;

import { DataManager, type InventoryViewItem } from "../../systems/datamanager";
import { glist } from "../CommonUI/glist";
import { listTemplate } from "../CommonUI/listTemplate";

@regClass()
export class bag extends Laya.Script {
    @property(Laya.Node)
    public glistNode: Laya.Node | null = null;

    @property(Laya.Node)
    public templateSlot: Laya.Node | null = null;

    public items: InventoryViewItem[] = [];

    private glistController: glist | null = null;

    onAwake(): void {
        this.resolveGlistController(true);
        DataManager.getInstance().registerBagView(this);
        this.refresh();
    }

    onEnable(): void {
        this.resolveGlistController(true);
        DataManager.getInstance().registerBagView(this);
        this.refresh();
    }

    onDisable(): void {
        DataManager.getInstance().unregisterBagView(this);
    }

    onDestroy(): void {
        DataManager.getInstance().unregisterBagView(this);
    }

    public setItems(items: InventoryViewItem[]): void {
        this.items = Array.isArray(items) ? items.slice() : [];
        this.refresh();
    }

    public refresh(): void {
        this.hideTemplateSlot();

        const controller = this.resolveGlistController();
        if (controller) {
            controller.setSlotCount(DataManager.getInstance().getPlayerBagSlotCount());
            controller.setItems(this.items);
            return;
        }

        this.fallbackRefresh();
    }

    private resolveGlistController(force: boolean = false): glist | null {
        if (!force && this.glistController && this.glistController.owner) {
            return this.glistController;
        }

        const listNode = this.glistNode || (this.owner as Laya.Node) || null;
        this.glistController = listNode ? listNode.getComponent(glist) : null;
        return this.glistController;
    }

    private fallbackRefresh(): void {
        const listNode = this.glistNode as any;
        if (!listNode) {
            return;
        }

        const children = listNode.children || [];
        for (let i = 0; i < children.length; i++) {
            const slotNode = children[i] as Laya.Node;
            if (!slotNode) {
                continue;
            }

            const slot = slotNode.getComponent(listTemplate);
            if (slot) {
                slot.bindData(this.items[i] || null);
            }
        }
    }

    private hideTemplateSlot(): void {
        const template = this.templateSlot as any;
        if (template && "visible" in template) {
            (template as any).visible = false;
        }
    }
}
