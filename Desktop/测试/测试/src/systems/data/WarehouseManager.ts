import { SaveManager } from "./SaveManager";
import type { InventoryViewItem } from "./InventoryTypes";

export class WarehouseManager {
    public static readonly STORAGE_KEY = "laya_test_warehouse_inventory_v1";

    private readonly itemsById: Map<string, InventoryViewItem> = new Map();

    public constructor(private readonly saveManager: SaveManager) {}

    public load(): void {
        const items = this.saveManager.loadInventory(WarehouseManager.STORAGE_KEY);

        this.itemsById.clear();

        for (const item of items) {
            if (!item.itemId) {
                continue;
            }

            this.itemsById.set(item.itemId, { ...item });
        }
    }

    public getSnapshot(): InventoryViewItem[] {
        return Array.from(this.itemsById.entries()).map(([itemId, item]) => ({
            itemId,
            ...item,
        }));
    }

    public addItem(item: InventoryViewItem): void {
        if (!item.itemId) {
            return;
        }

        const existing = this.itemsById.get(item.itemId);
        if (existing) {
            existing.count += item.count;
            if (!existing.icon && item.icon) {
                existing.icon = item.icon;
            }
            if (!existing.name && item.name) {
                existing.name = item.name;
            }
        } else {
            this.itemsById.set(item.itemId, { ...item });
        }

        this.save();
    }

    public removeItem(itemId: string): InventoryViewItem | null {
        const item = this.itemsById.get(itemId);
        if (!item) {
            return null;
        }

        this.itemsById.delete(itemId);
        this.save();
        return { ...item };
    }

    private save(): void {
        this.saveManager.saveInventory(WarehouseManager.STORAGE_KEY, this.itemsById);
    }
}