import { SaveManager } from "./SaveManager";
import type { InventorySlotItem, InventoryViewItem } from "./InventoryTypes";

export type WarehouseItemNormalizer = (item: InventoryViewItem) => InventoryViewItem;

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
    private stackMaxResolver: ((itemId: string) => number) | null = null;
    private itemNormalizer: WarehouseItemNormalizer | null = null;

    public constructor(private readonly saveManager: SaveManager) {}

    public setStackMaxResolver(resolver: (itemId: string) => number): void {
        this.stackMaxResolver = resolver;
    }

    public setItemNormalizer(normalizer: WarehouseItemNormalizer): void {
        this.itemNormalizer = normalizer;
    }

    public load(): void {
        const items = this.saveManager.loadInventory(WarehouseManager.STORAGE_KEY);
        const meta = this.saveManager.loadJson<WarehouseMeta>(WarehouseManager.META_STORAGE_KEY);

        this.slotCount = this.normalizeSlotCount(meta && meta.slotCount);
        this.items.length = 0;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            this.items.push(item ? this.normalizeItem(item) : null);
        }
        this.normalizeStacks();
        this.save();
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

    public getItemCount(itemId: string): number {
        const normalizedItemId = String(itemId || "").trim();
        if (!normalizedItemId) {
            return 0;
        }

        let count = 0;
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if (item && item.itemId === normalizedItemId) {
                count += Math.max(0, Math.floor(item.count || 0));
            }
        }

        return count;
    }

    public consumeItem(itemId: string, count: number): number {
        const normalizedItemId = String(itemId || "").trim();
        let remaining = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
        if (!normalizedItemId || remaining <= 0) {
            return 0;
        }

        let consumed = 0;
        for (let i = 0; i < this.items.length && remaining > 0; i++) {
            const item = this.items[i];
            if (!item || item.itemId !== normalizedItemId) {
                continue;
            }

            const available = Math.max(0, Math.floor(item.count || 0));
            const used = Math.min(available, remaining);
            if (used <= 0) {
                continue;
            }

            item.count = available - used;
            if (item.count <= 0) {
                this.items[i] = null;
            }
            remaining -= used;
            consumed += used;
        }

        if (consumed > 0) {
            this.save();
        }

        return consumed;
    }
    public addItem(item: InventoryViewItem, targetSlotIndex?: number): boolean {
        if (!item.itemId) {
            return false;
        }
        item = this.normalizeItem(item);
        const itemId = item.itemId || "";
        if (!itemId) {
            return false;
        }

        const normalizedTarget = this.normalizeSlotIndex(targetSlotIndex);
        if (normalizedTarget !== null) {
            if (!this.canPlaceItemAt(normalizedTarget, itemId)) {
                return false;
            }

            this.placeItemAt(normalizedTarget, item);
            this.save();
            return true;
        }

        let remaining = Math.max(0, Math.floor(item.count || 0));
        while (remaining > 0) {
            remaining = this.mergeIntoExistingSlots({ ...item, count: remaining });
            if (remaining <= 0) {
                this.save();
                return true;
            }

            const stackMax = this.getStackMax(itemId);
            const placedCount = Math.min(remaining, stackMax);
            const emptyIndex = this.findEmptySlotIndex();
            if (emptyIndex < 0) {
                this.save();
                return false;
            }

            this.placeItemAt(emptyIndex, { ...item, count: placedCount });
            remaining -= placedCount;
        }

        this.save();
        return true;
    }

    public canAddItems(items: InventoryViewItem[]): boolean {
        const incoming = Array.isArray(items)
            ? items.filter((item) => item && !!item.itemId && Number.isFinite(item.count) && item.count > 0)
            : [];
        if (incoming.length === 0) {
            return true;
        }

        const slotCountsByItemId = new Map<string, number[]>();
        const limit = Math.max(0, this.slotCount);

        for (let i = 0; i < Math.min(this.items.length, limit); i++) {
            const item = this.items[i];
            if (!item || !item.itemId) {
                continue;
            }

            const itemId = item.itemId;
            const counts = slotCountsByItemId.get(itemId) || [];
            counts.push(Math.max(0, Math.floor(item.count || 0)));
            slotCountsByItemId.set(itemId, counts);
        }

        let usedSlots = 0;
        slotCountsByItemId.forEach((counts) => {
            usedSlots += counts.length;
        });

        for (let i = 0; i < incoming.length; i++) {
            const itemId = incoming[i].itemId || "";
            let remaining = Math.max(0, Math.floor(incoming[i].count || 0));
            if (!itemId || remaining <= 0) {
                continue;
            }

            const stackMax = this.getStackMax(itemId);
            const counts = slotCountsByItemId.get(itemId) || [];
            for (let slotIndex = 0; slotIndex < counts.length && remaining > 0; slotIndex++) {
                const capacity = Math.max(0, stackMax - counts[slotIndex]);
                const filled = Math.min(capacity, remaining);
                counts[slotIndex] += filled;
                remaining -= filled;
            }

            while (remaining > 0) {
                if (usedSlots >= limit) {
                    return false;
                }

                const placed = Math.min(stackMax, remaining);
                counts.push(placed);
                usedSlots += 1;
                remaining -= placed;
            }

            slotCountsByItemId.set(itemId, counts);
        }

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

    public moveSlot(sourceSlotIndex: number, targetSlotIndex: number): boolean {
        const sourceIndex = this.normalizeSlotIndex(sourceSlotIndex);
        const targetIndex = this.normalizeSlotIndex(targetSlotIndex);
        if (sourceIndex === null || targetIndex === null || sourceIndex === targetIndex) {
            return false;
        }

        if (sourceIndex >= this.slotCount || targetIndex >= this.slotCount) {
            return false;
        }

        while (this.items.length <= Math.max(sourceIndex, targetIndex)) {
            this.items.push(null);
        }

        const sourceItem = this.items[sourceIndex];
        if (!sourceItem) {
            return false;
        }

        this.items[sourceIndex] = this.items[targetIndex] || null;
        this.items[targetIndex] = sourceItem;
        this.save();
        return true;
    }

    public canPlaceItemAt(slotIndex: number, itemId: string): boolean {
        const index = this.normalizeSlotIndex(slotIndex);
        if (index === null) {
            return false;
        }

        const slot = this.items[index] || null;
        if (!slot) {
            return true;
        }

        if (slot.itemId !== itemId || this.getStackMax(itemId) <= 1) {
            return false;
        }

        return Math.max(0, Math.floor(slot.count || 0)) < this.getStackMax(itemId);
    }

    private mergeIntoExistingSlots(item: InventoryViewItem): number {
        const itemId = item.itemId || "";
        const stackMax = this.getStackMax(itemId);
        let remaining = Math.max(0, Math.floor(item.count || 0));

        if (!itemId || stackMax <= 1) {
            return remaining;
        }

        for (let i = 0; i < this.items.length && remaining > 0; i++) {
            const existing = this.items[i];
            if (!existing || existing.itemId !== itemId) {
                continue;
            }

            const currentCount = Math.max(0, Math.floor(existing.count || 0));
            const capacity = Math.max(0, stackMax - currentCount);
            if (capacity <= 0) {
                continue;
            }

            const added = Math.min(capacity, remaining);
            existing.count = currentCount + added;
            remaining -= added;
            if (!existing.icon && item.icon) {
                existing.icon = item.icon;
            }
            if (!existing.name && item.name) {
                existing.name = item.name;
            }
        }

        return remaining;
    }

    private save(): void {
        this.saveManager.saveInventory(WarehouseManager.STORAGE_KEY, this.items);
        this.saveMeta();
    }

    private normalizeStacks(): void {
        const normalized: InventorySlotItem[] = [];
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i] ? this.normalizeItem(this.items[i] as InventoryViewItem) : null;
            if (!item || !item.itemId) {
                normalized.push(null);
                continue;
            }

            let remaining = Math.max(0, Math.floor(item.count || 0));
            const stackMax = this.getStackMax(item.itemId);
            while (remaining > 0) {
                const count = Math.min(stackMax, remaining);
                normalized.push({
                    itemId: item.itemId,
                    name: item.name,
                    count,
                    icon: item.icon,
                });
                remaining -= count;
            }
        }

        this.items.length = 0;
        for (let i = 0; i < normalized.length; i++) {
            this.items.push(normalized[i]);
        }
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
        for (let i = 0; i < this.slotCount; i++) {
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

        if (normalized >= this.slotCount) {
            return;
        }

        while (this.items.length <= normalized) {
            this.items.push(null);
        }

        const current = this.items[normalized];
        if (current && current.itemId === item.itemId && this.getStackMax(item.itemId || "") > 1) {
            const stackMax = this.getStackMax(item.itemId || "");
            current.count = Math.min(stackMax, Math.max(0, Math.floor(current.count || 0)) + Math.max(0, Math.floor(item.count || 0)));
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

    private getStackMax(itemId: string): number {
        const resolved = this.stackMaxResolver ? this.stackMaxResolver(itemId) : Number.MAX_SAFE_INTEGER;
        if (!Number.isFinite(resolved)) {
            return Number.MAX_SAFE_INTEGER;
        }

        return Math.max(1, Math.floor(resolved));
    }

    private normalizeItem(item: InventoryViewItem): InventoryViewItem {
        const normalized = this.itemNormalizer ? this.itemNormalizer({ ...item }) : { ...item };
        return {
            itemId: normalized.itemId,
            name: normalized.name,
            count: Math.max(0, Math.floor(normalized.count || 0)),
            icon: normalized.icon,
        };
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
