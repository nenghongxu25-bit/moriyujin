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
    private currentWarehousePage: number = 0;
    private selectedSlot: SelectedSlotState | null = null;

    onAwake(): void {
        this.bindControllers();
        this.bindPageButtons();
        DataManager.getInstance().registerBagView(this);
        DataManager.getInstance().registerWarehouseView(this);
        this.refresh();
    }

    onEnable(): void {
        this.bindControllers();
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
        if (this.currentWarehousePage === nextPage) {
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

            const selected = i === this.currentWarehousePage;
            if ("alpha" in button) {
                button.alpha = selected ? 1 : 0.55;
            }

            if ("mouseEnabled" in button) {
                button.mouseEnabled = true;
            }
        }
    }
}
