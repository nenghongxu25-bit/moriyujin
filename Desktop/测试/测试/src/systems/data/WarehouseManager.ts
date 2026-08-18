import { SaveManager } from "./SaveManager";
import type { InventorySlotItem, InventoryViewItem } from "./InventoryTypes";

interface WarehouseMeta {
    slotCount: number;
}

export class WarehouseManager {
    public static readonly STORAGE_KEY = "laya_test_warehouse_inventory_v1";
    public static readonly META_STORAGE_KEY = "laya_test_warehouse_meta_v1";
    public static readonly PAGE_SIZE = 30;
    public static readonly PAGE_COUNT = 7;
    public static readonly DEFAULT_SLOT_COUNT = WarehouseManager.PAGE_SIZE * WarehouseManager.PAGE_COUNT;

    private readonly items: InventorySlotItem[] = [];
    private slotCount: number = WarehouseManager.DEFAULT_SLOT_COUNT;

    public constructor(private readonly saveManager: SaveManager) {}

    public load(): void {
        const items = this.saveManager.loadInventory(WarehouseManager.STORAGE_KEY);
        const meta = this.saveManager.loadJson<WarehouseMeta>(WarehouseManager.META_STORAGE_KEY);

        this.slotCount = this.normalizeSlotCount(meta && meta.slotCount);
        this.items.length = 0;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            this.items.push(item ? { ...item } : null);
        }
    }

    public getSlotCount(): number {
        return this.slotCount;
    }

    public setSlotCount(count: number): void {
        const nextCount = this.normalizeSlotCount(count);
        if (this.slotCount === nextCount) {
            return;
        }

        this.slotCount = nextCount;
        this.saveMeta();
    }

    public getSnapshot(): InventorySlotItem[] {
        const snapshot = this.items.map((item) => (item ? { ...item } : null));
        while (snapshot.length < this.slotCount) {
            snapshot.push(null);
        }

        return snapshot;
    }

    public addItem(item: InventoryViewItem, targetSlotIndex?: number): boolean {
        if (!item.itemId) {
            return false;
        }

        const normalizedTarget = this.normalizeSlotIndex(targetSlotIndex);
        if (normalizedTarget !== null) {
            if (!this.canPlaceItemAt(normalizedTarget, item.itemId)) {
                return false;
            }

            this.placeItemAt(normalizedTarget, item);
            this.save();
            return true;
        }

        const existingIndex = this.findItemIndex(item.itemId);
        if (existingIndex >= 0) {
            const existing = this.items[existingIndex];
            if (existing) {
                existing.count += item.count;
                if (!existing.icon && item.icon) {
                    existing.icon = item.icon;
                }
                if (!existing.name && item.name) {
                    existing.name = item.name;
                }
            }
            this.save();
            return true;
        }

        const emptyIndex = this.findEmptySlotIndex();
        if (emptyIndex >= 0) {
            this.placeItemAt(emptyIndex, item);
        } else {
            this.items.push({ ...item });
        }

        this.save();
        return true;
    }

    public removeItem(itemId: string): InventoryViewItem | null {
        const index = this.findItemIndex(itemId);
        if (index < 0) {
            return null;
        }

        const item = this.items[index];
        if (!item) {
            return null;
        }

        this.items[index] = null;
        this.save();
        return { ...item };
    }

    public canPlaceItemAt(slotIndex: number, itemId: string): boolean {
        const index = this.normalizeSlotIndex(slotIndex);
        if (index === null) {
            return false;
        }

        const slot = this.items[index] || null;
        return !slot || slot.itemId === itemId;
    }

    private save(): void {
        this.saveManager.saveInventory(WarehouseManager.STORAGE_KEY, this.items);
        this.saveMeta();
    }

    private saveMeta(): void {
        this.saveManager.saveJson(WarehouseManager.META_STORAGE_KEY, {
            slotCount: this.slotCount,
        });
    }

    private findItemIndex(itemId: string): number {
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if (item && item.itemId === itemId) {
                return i;
            }
        }

        return -1;
    }

    private findEmptySlotIndex(): number {
        for (let i = 0; i < this.items.length; i++) {
            if (!this.items[i]) {
                return i;
            }
        }

        return -1;
    }

    private placeItemAt(slotIndex: number, item: InventoryViewItem): void {
        const normalized = this.normalizeSlotIndex(slotIndex);
        if (normalized === null) {
            return;
        }

        while (this.items.length <= normalized) {
            this.items.push(null);
        }

        const current = this.items[normalized];
        if (current && current.itemId === item.itemId) {
            current.count += item.count;
            if (!current.icon && item.icon) {
                current.icon = item.icon;
            }
            if (!current.name && item.name) {
                current.name = item.name;
            }
            return;
        }

        this.items[normalized] = { ...item };
    }

    private normalizeSlotIndex(slotIndex: number | undefined): number | null {
        if (slotIndex === undefined || slotIndex === null || !Number.isFinite(slotIndex)) {
            return null;
        }

        const normalized = Math.floor(slotIndex);
        return normalized >= 0 ? normalized : null;
    }

    private normalizeSlotCount(count: number | null | undefined): number {
        if (!Number.isFinite(Number(count))) {
            return WarehouseManager.DEFAULT_SLOT_COUNT;
        }

        const normalized = Math.floor(Number(count));
        return normalized >= WarehouseManager.DEFAULT_SLOT_COUNT ? normalized : WarehouseManager.DEFAULT_SLOT_COUNT;
    }
}