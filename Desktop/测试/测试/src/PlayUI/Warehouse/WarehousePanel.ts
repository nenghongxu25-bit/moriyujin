const { regClass, property } = Laya;

import { DataManager, type InventoryBucket, type InventorySlotItem } from "../../systems/datamanager";
import { WarehouseManager } from "../../systems/data/WarehouseManager";
import { glist } from "../CommonUI/glist";
import type { ListTemplateData } from "../CommonUI/listTemplate";

interface SelectedSlotState {
    bucket: InventoryBucket;
    itemId: string;
}

@regClass()
export class WarehousePanel extends Laya.Script {
    @property(Laya.Node)
    public bagGlistNode: Laya.Node | null = null;

    @property(Laya.Node)
    public warehouseGlistNode: Laya.Node | null = null;

    @property(Laya.Node)
    public warehousePageButton1: Laya.Node | null = null;

    @property(Laya.Node)
    public warehousePageButton2: Laya.Node | null = null;

    @property(Laya.Node)
    public warehousePageButton3: Laya.Node | null = null;

    @property(Laya.Node)
    public warehousePageButton4: Laya.Node | null = null;

    @property(Laya.Node)
    public warehousePageButton5: Laya.Node | null = null;

    @property(Laya.Node)
    public warehousePageButton6: Laya.Node | null = null;

    @property(Laya.Node)
    public warehousePageButton7: Laya.Node | null = null;

    private bagGlist: glist | null = null;
    private warehouseGlist: glist | null = null;
    private warehousePageButtons: Array<Laya.Node | null> = [];
    private warehousePageOpenStates: boolean[] = [true, false, false, false, false, false, false];
    private currentWarehousePage: number = 0;
    private selectedSlot: SelectedSlotState | null = null;

    onAwake(): void {
        this.bindControllers();
        this.resetWarehousePageState();
        this.bindPageButtons();
        DataManager.getInstance().registerBagView(this);
        DataManager.getInstance().registerWarehouseView(this);
        this.refresh();
    }

    onEnable(): void {
        this.bindControllers();
        this.resetWarehousePageState();
        this.bindPageButtons();
        DataManager.getInstance().registerBagView(this);
        DataManager.getInstance().registerWarehouseView(this);
        this.refresh();
    }

    onDisable(): void {
        DataManager.getInstance().unregisterBagView(this);
        DataManager.getInstance().unregisterWarehouseView(this);
        this.unbindPageButtons();
        this.clearSelection();
    }

    onDestroy(): void {
        DataManager.getInstance().unregisterBagView(this);
        DataManager.getInstance().unregisterWarehouseView(this);
        this.unbindPageButtons();
    }

    public setItems(items: InventorySlotItem[]): void {
        this.bindControllers();
        this.bindBagList(items);
    }

    public refresh(): void {
        this.bindControllers();
        this.bindPageButtons();
        this.bindWarehouseList();
        this.applySelectionState();
    }

    public onPanelOpened(): void {
        this.resetWarehousePageState();
        this.refresh();
    }

    private bindControllers(): void {
        this.bagGlist = this.bagGlistNode ? this.bagGlistNode.getComponent(glist) : null;
        this.warehouseGlist = this.warehouseGlistNode ? this.warehouseGlistNode.getComponent(glist) : null;
    }

    private bindBagList(items: InventorySlotItem[]): void {
        if (!this.bagGlist) {
            return;
        }

        this.bagGlist.listKey = "bag";
        this.bagGlist.onSlotClick = this.handleBagSlotClick;
        this.bagGlist.setSlotCount(DataManager.getInstance().getPlayerBagSlotCount());
        this.bagGlist.setItems(this.toListData(items));
        this.bagGlist.setSelectedItemId(this.getSelectedItemId("active"));
    }

    private bindWarehouseList(): void {
        if (!this.warehouseGlist) {
            return;
        }

        const pageCount = this.getWarehousePageCount();
        this.currentWarehousePage = this.clampWarehousePage(this.currentWarehousePage, pageCount);

        this.warehouseGlist.listKey = "warehouse";
        this.warehouseGlist.onSlotClick = this.handleWarehouseSlotClick;
        this.warehouseGlist.setSlotCount(WarehouseManager.PAGE_SIZE);
        this.warehouseGlist.setItems(this.toWarehousePageData(DataManager.getInstance().getWarehouseSnapshot()));
        this.warehouseGlist.setSelectedItemId(this.getSelectedItemId("warehouse"));
        this.updateWarehousePageButtonState();
    }

    private handleBagSlotClick = (item: ListTemplateData | null, listKey: string, slotIndex: number): void => {
        this.handleSlotClick("active", item, listKey, slotIndex);
    };

    private handleWarehouseSlotClick = (item: ListTemplateData | null, listKey: string, slotIndex: number): void => {
        this.handleSlotClick("warehouse", item, listKey, slotIndex);
    };

    private handleSlotClick(sourceBucket: InventoryBucket, item: ListTemplateData | null, listKey: string, slotIndex: number): void {
        const itemId = item && item.itemId ? String(item.itemId) : "";
        const targetBucket: InventoryBucket = listKey === "warehouse" ? "warehouse" : "active";
        const targetSlotIndex = targetBucket === "warehouse" ? this.toWarehouseSlotIndex(slotIndex) : (Number.isFinite(slotIndex) ? Math.floor(slotIndex) : -1);

        if (!this.selectedSlot) {
            if (itemId) {
                this.setSelection(sourceBucket, itemId);
            }
            return;
        }

        if (this.selectedSlot.bucket === sourceBucket && this.selectedSlot.itemId === itemId) {
            this.clearSelection();
            return;
        }

        if (!itemId) {
            if (this.selectedSlot.bucket !== targetBucket && DataManager.getInstance().transferItem(this.selectedSlot.bucket, targetBucket, this.selectedSlot.itemId, targetSlotIndex)) {
                this.clearSelection();
                this.refresh();
                return;
            }

            this.clearSelection();
            return;
        }

        if (this.selectedSlot.bucket === targetBucket) {
            this.clearSelection();
            return;
        }

        if (DataManager.getInstance().transferItem(this.selectedSlot.bucket, targetBucket, this.selectedSlot.itemId, targetSlotIndex)) {
            this.clearSelection();
            this.refresh();
            return;
        }

        this.clearSelection();
    }

    private setSelection(bucket: InventoryBucket, itemId: string): void {
        this.selectedSlot = { bucket, itemId };
        this.applySelectionState();
    }

    private clearSelection(): void {
        this.selectedSlot = null;
        this.applySelectionState();
    }

    private applySelectionState(): void {
        const activeSelected = this.getSelectedItemId("active");
        const warehouseSelected = this.getSelectedItemId("warehouse");

        if (this.bagGlist) {
            this.bagGlist.setSelectedItemId(activeSelected);
        }

        if (this.warehouseGlist) {
            this.warehouseGlist.setSelectedItemId(warehouseSelected);
        }

        this.updateWarehousePageButtonState();
    }

    private getSelectedItemId(bucket: InventoryBucket): string {
        return this.selectedSlot && this.selectedSlot.bucket === bucket ? this.selectedSlot.itemId : "";
    }

    private toListData(items: InventorySlotItem[]): Array<ListTemplateData | null> {
        return (Array.isArray(items) ? items : []).map((item) =>
            item
                ? {
                      itemId: item.itemId,
                      name: item.name,
                      count: item.count,
                      icon: item.icon,
                  }
                : null,
        );
    }

    private toWarehousePageData(items: InventorySlotItem[]): Array<ListTemplateData | null> {
        const startIndex = this.currentWarehousePage * WarehouseManager.PAGE_SIZE;
        const pageItems = Array.isArray(items) ? items.slice(startIndex, startIndex + WarehouseManager.PAGE_SIZE) : [];
        return this.toListData(pageItems);
    }

    private toWarehouseSlotIndex(slotIndex: number): number {
        if (!Number.isFinite(slotIndex)) {
            return -1;
        }

        return this.currentWarehousePage * WarehouseManager.PAGE_SIZE + Math.floor(slotIndex);
    }

    private getWarehousePageCount(): number {
        return WarehouseManager.PAGE_COUNT;
    }

    private clampWarehousePage(pageIndex: number, pageCount: number = this.getWarehousePageCount()): number {
        const maxPage = Math.max(0, Math.floor(pageCount) - 1);
        if (!Number.isFinite(pageIndex)) {
            return 0;
        }

        return Math.min(maxPage, Math.max(0, Math.floor(pageIndex)));
    }

    private bindPageButtons(): void {
        this.resolvePageButtonBindings();

        const nextButtons: Array<Laya.Node | null> = [
            this.warehousePageButton1,
            this.warehousePageButton2,
            this.warehousePageButton3,
            this.warehousePageButton4,
            this.warehousePageButton5,
            this.warehousePageButton6,
            this.warehousePageButton7,
        ];

        this.unbindPageButtons();
        this.warehousePageButtons = nextButtons;

        for (let i = 0; i < this.warehousePageButtons.length; i++) {
            const button = this.warehousePageButtons[i] as any;
            if (!button || typeof button.on !== "function" || typeof button.off !== "function") {
                continue;
            }

            button.off(Laya.Event.CLICK, this, this.onWarehousePageButtonClick);
            button.on(Laya.Event.CLICK, this, this.onWarehousePageButtonClick, [i]);
        }

        this.updateWarehousePageButtonState();
    }

    private unbindPageButtons(): void {
        for (let i = 0; i < this.warehousePageButtons.length; i++) {
            const button = this.warehousePageButtons[i] as any;
            if (button && typeof button.off === "function") {
                button.off(Laya.Event.CLICK, this, this.onWarehousePageButtonClick);
            }
        }

        this.warehousePageButtons = [];
    }

    private onWarehousePageButtonClick(pageIndex: number): void {
        const nextPage = this.clampWarehousePage(pageIndex);
        const previousPage = this.clampWarehousePage(this.currentWarehousePage);

        this.closeWarehousePage(previousPage);
        this.openWarehousePage(nextPage);
        this.applyWarehousePageButtonMasks();

        if (previousPage === nextPage) {
            return;
        }

        this.currentWarehousePage = nextPage;
        this.bindWarehouseList();
        this.applySelectionState();
    }

    private updateWarehousePageButtonState(): void {
        for (let i = 0; i < this.warehousePageButtons.length; i++) {
            const button = this.warehousePageButtons[i] as any;
            if (!button) {
                continue;
            }

            if ("alpha" in button) {
                button.alpha = 1;
            }

            if ("mouseEnabled" in button) {
                button.mouseEnabled = true;
            }
        }

        this.applyWarehousePageButtonMasks();
    }

    private resetWarehousePageState(): void {
        this.currentWarehousePage = 0;
        this.warehousePageOpenStates = [true, false, false, false, false, false, false];
        this.applyWarehousePageButtonMasks();
    }

    private closeWarehousePage(pageIndex: number): void {
        if (pageIndex >= 0 && pageIndex < this.warehousePageOpenStates.length) {
            this.warehousePageOpenStates[pageIndex] = false;
        }
    }

    private openWarehousePage(pageIndex: number): void {
        if (pageIndex >= 0 && pageIndex < this.warehousePageOpenStates.length) {
            this.warehousePageOpenStates[pageIndex] = true;
        }
    }

    private applyWarehousePageButtonMasks(): void {
        for (let i = 0; i < this.warehousePageButtons.length; i++) {
            const mask = this.findChildByName(this.warehousePageButtons[i], "mask") as any;
            if (!mask || !("visible" in mask)) {
                continue;
            }

            mask.visible = !this.warehousePageOpenStates[i];
        }
    }

    private resolvePageButtonBindings(): void {
        const root = this.owner as Laya.Node;
        const buttonContainer = this.findChildByName(root, "button");
        if (!buttonContainer) {
            return;
        }

        this.warehousePageButton1 = this.warehousePageButton1 || this.findDirectChildByName(buttonContainer, "1");
        this.warehousePageButton2 = this.warehousePageButton2 || this.findDirectChildByName(buttonContainer, "2");
        this.warehousePageButton3 = this.warehousePageButton3 || this.findDirectChildByName(buttonContainer, "3");
        this.warehousePageButton4 = this.warehousePageButton4 || this.findDirectChildByName(buttonContainer, "4");
        this.warehousePageButton5 = this.warehousePageButton5 || this.findDirectChildByName(buttonContainer, "5");
        this.warehousePageButton6 = this.warehousePageButton6 || this.findDirectChildByName(buttonContainer, "6");
        this.warehousePageButton7 = this.warehousePageButton7 || this.findDirectChildByName(buttonContainer, "7");
    }

    private findChildByName(root: Laya.Node | null, name: string): Laya.Node | null {
        if (!root) {
            return null;
        }

        if ((root as any).name === name) {
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

    private findDirectChildByName(root: Laya.Node | null, name: string): Laya.Node | null {
        const children = root && Array.isArray((root as any).children)
            ? ((root as any).children as Laya.Node[])
            : [];

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (child && (child as any).name === name) {
                return child;
            }
        }

        return null;
    }
}
