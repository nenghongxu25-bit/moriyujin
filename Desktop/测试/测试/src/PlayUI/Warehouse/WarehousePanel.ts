const { regClass, property } = Laya;

import { DataManager, type InventoryViewItem, type InventoryBucket } from "../../systems/datamanager";
import { glist } from "../CommonUI/glist";
import type { ListTemplateData } from "./listTemplate";

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

    private bagGlist: glist | null = null;
    private warehouseGlist: glist | null = null;
    private selectedSlot: SelectedSlotState | null = null;

    onAwake(): void {
        this.bindControllers();
        DataManager.getInstance().registerBagView(this);
        this.refresh();
    }

    onEnable(): void {
        this.bindControllers();
        DataManager.getInstance().registerBagView(this);
        this.refresh();
    }

    onDisable(): void {
        DataManager.getInstance().unregisterBagView(this);
        this.clearSelection();
    }

    public setItems(items: InventoryViewItem[]): void {
        this.bindControllers();
        this.bindBagList(items);
    }

    public refresh(): void {
        this.bindControllers();
        this.bindWarehouseList();
        this.applySelectionState();
    }

    private bindControllers(): void {
        this.bagGlist = this.bagGlistNode ? this.bagGlistNode.getComponent(glist) : null;
        this.warehouseGlist = this.warehouseGlistNode ? this.warehouseGlistNode.getComponent(glist) : null;
    }

    private bindBagList(items: InventoryViewItem[]): void {
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

        this.warehouseGlist.listKey = "warehouse";
        this.warehouseGlist.onSlotClick = this.handleWarehouseSlotClick;
        this.warehouseGlist.setItems(this.toListData(DataManager.getInstance().getWarehouseSnapshot()));
        this.warehouseGlist.setSelectedItemId(this.getSelectedItemId("warehouse"));
    }

    private handleBagSlotClick = (item: ListTemplateData | null, listKey: string): void => {
        this.handleSlotClick("active", item, listKey);
    };

    private handleWarehouseSlotClick = (item: ListTemplateData | null, listKey: string): void => {
        this.handleSlotClick("warehouse", item, listKey);
    };

    private handleSlotClick(sourceBucket: InventoryBucket, item: ListTemplateData | null, listKey: string): void {
        const itemId = item && item.itemId ? String(item.itemId) : "";
        const targetBucket: InventoryBucket = listKey === "warehouse" ? "warehouse" : "active";

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
            if (this.selectedSlot.bucket !== targetBucket && DataManager.getInstance().transferItem(this.selectedSlot.bucket, targetBucket, this.selectedSlot.itemId)) {
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

        if (DataManager.getInstance().transferItem(this.selectedSlot.bucket, targetBucket, this.selectedSlot.itemId)) {
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
    }

    private getSelectedItemId(bucket: InventoryBucket): string {
        return this.selectedSlot && this.selectedSlot.bucket === bucket ? this.selectedSlot.itemId : "";
    }

    private toListData(items: InventoryViewItem[]): ListTemplateData[] {
        return (Array.isArray(items) ? items : []).map((item) => ({
            itemId: item.itemId,
            name: item.name,
            count: item.count,
            icon: item.icon,
        }));
    }
}
