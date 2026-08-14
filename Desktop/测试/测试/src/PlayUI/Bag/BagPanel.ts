const { regClass, property } = Laya;

import { DataManager, type InventoryViewItem } from "../../systems/datamanager";
import { glist } from "../CommonUI/glist";
import type { ListTemplateData } from "../CommonUI/listTemplate";

@regClass()
export class BagPanel extends Laya.Script {
    @property(Laya.Node)
    public containerNode: Laya.Node | null = null;

    @property(Laya.Node)
    public bagNode: Laya.Node | null = null;

    @property(Laya.Node)
    public containerGlistNode: Laya.Node | null = null;

    @property(Laya.Node)
    public bagGlistNode: Laya.Node | null = null;

    @property(Laya.Node)
    public personPageNode: Laya.Node | null = null;

    @property(Laya.Node)
    public quickEquipNode: Laya.Node | null = null;

    @property(Number)
    public defaultState: number = 0;

    private currentState: number = -1;
    private bagGlist: glist | null = null;
    private containerGlist: glist | null = null;

    onAwake(): void {
        this.bindControllers();
        DataManager.getInstance().registerBagView(this);
        this.openDefault();
    }

    onEnable(): void {
        this.bindControllers();
        DataManager.getInstance().registerBagView(this);
        this.syncVisibleState();
    }

    onDisable(): void {
        DataManager.getInstance().unregisterBagView(this);
    }

    onDestroy(): void {
        DataManager.getInstance().unregisterBagView(this);
    }

    public setItems(items: InventoryViewItem[]): void {
        this.bindControllers();
        this.bindBagList(items);
    }

    public openDefault(): void {
        this.currentState = 0;
        this.syncVisibleState();
    }

    public openContainerSearch(): void {
        this.currentState = 1;
        this.syncVisibleState();
    }

    public closePanel(): void {
        this.setNodeVisible(this.personPageNode, false);
        this.setNodeVisible(this.quickEquipNode, false);
        this.setNodeVisible(this.containerNode, false);
        this.setNodeVisible(this.containerGlistNode, false);
        this.setNodeVisible(this.bagNode, false);
        this.setNodeVisible(this.bagGlistNode, false);
    }

    public showDefaultState(): void {
        this.openDefault();
    }

    public showContainerSearchState(): void {
        this.openContainerSearch();
    }

    public showState(stateIndex: number): void {
        this.currentState = this.normalizeState(stateIndex);
        this.syncVisibleState();
    }

    public refresh(): void {
        this.bindControllers();
        this.syncVisibleState();
    }

    private bindControllers(): void {
        this.bagGlist = this.resolveGlistController(this.bagGlistNode, "bagGlistNode");
        this.containerGlist = this.resolveGlistController(this.containerGlistNode, "containerGlistNode");
    }

    private bindBagList(items: InventoryViewItem[]): void {
        if (!this.bagGlist) {
            return;
        }

        this.bagGlist.listKey = "bag";
        this.bagGlist.setSlotCount(DataManager.getInstance().getPlayerBagSlotCount());
        this.bagGlist.setItems(this.toListData(items));
        this.bagGlist.setSelectedItemId("");
    }

    private syncVisibleState(): void {
        const showDefault = this.currentState === 0;
        const showContainer = this.currentState === 1;

        this.setNodeVisible(this.personPageNode, showDefault);
        this.setNodeVisible(this.quickEquipNode, showDefault);
        this.setNodeVisible(this.containerNode, showContainer);
        this.setNodeVisible(this.containerGlistNode, showContainer);
        this.setNodeVisible(this.bagNode, true);
        this.setNodeVisible(this.bagGlistNode, true);
    }

    private setNodeVisible(node: Laya.Node | null, visible: boolean): void {
        const target = node as any;
        if (!target) {
            return;
        }

        if ("visible" in target) {
            target.visible = visible;
        }

        if ("active" in target) {
            target.active = visible;
        }
    }

    private toListData(items: InventoryViewItem[]): ListTemplateData[] {
        return (Array.isArray(items) ? items : []).map((item) => ({
            itemId: item.itemId,
            name: item.name,
            count: item.count,
            icon: item.icon,
        }));
    }

    private normalizeState(stateIndex: number): number {
        const state = Number.isFinite(stateIndex) ? Math.floor(stateIndex) : 0;
        if (state === 1) {
            return 1;
        }
        return 0;
    }

    private resolveGlistController(node: Laya.Node | null, label: string): glist | null {
        const controller = this.findGlistController(node);
        return controller;
    }

    private findGlistController(node: Laya.Node | null): glist | null {
        if (!node) {
            return null;
        }

        const direct = node.getComponent(glist);
        if (direct) {
            return direct;
        }

        const children = (node as any).children as Laya.Node[] | undefined;
        if (!children || children.length === 0) {
            return null;
        }

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const nested = this.findGlistController(child);
            if (nested) {
                return nested;
            }
        }

        return null;
    }
}