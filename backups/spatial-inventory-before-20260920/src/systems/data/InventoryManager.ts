import { SaveManager } from "./SaveManager";
import type { BagView, InventoryBucket, InventoryScope, InventorySlotItem, InventoryViewItem } from "./InventoryTypes";

export type InventoryItemNormalizer = (item: InventoryViewItem) => InventoryViewItem;
export type InventorySortPriorityResolver = (item: InventoryViewItem) => number;

export class InventoryManager {
    public static readonly BASE_STORAGE_KEY = "laya_test_base_inventory_v1";

    private loaded: boolean = false;
    private currentScope: InventoryScope = "base";
    private readonly baseInventory: InventorySlotItem[] = [];
    private readonly runInventory: InventorySlotItem[] = [];
    private readonly bagViews: Set<BagView> = new Set();
    private playerBagSlotCount: number = 50;
    private stackMaxResolver: ((itemId: string) => number) | null = null;
    private itemNormalizer: InventoryItemNormalizer | null = null;
    private sortPriorityResolver: InventorySortPriorityResolver | null = null;

    public constructor(private readonly saveManager: SaveManager) {}

    public setStackMaxResolver(resolver: (itemId: string) => number): void {
        this.stackMaxResolver = resolver;
    }

    public setItemNormalizer(normalizer: InventoryItemNormalizer): void {
        this.itemNormalizer = normalizer;
    }

    public setSortPriorityResolver(resolver: InventorySortPriorityResolver): void {
        this.sortPriorityResolver = resolver;
    }

    public loadPersistedInventories(): void {
        if (this.loaded) {
            this.syncBagViews();
            return;
        }

        this.loadInventoryFromStorage(InventoryManager.BASE_STORAGE_KEY, this.baseInventory);
        this.normalizeInventoryStacks(this.baseInventory);
        this.saveManager.saveInventory(InventoryManager.BASE_STORAGE_KEY, this.baseInventory);
        this.currentScope = "base";
        this.runInventory.length = 0;
        this.loaded = true;
        this.syncBagViews();
    }

    public enterScene(sceneUrl: string): void {
        const nextScope = this.isBaseSceneUrl(sceneUrl) ? "base" : "instance";

        if (nextScope === this.currentScope) {
            if (nextScope === "instance" && this.runInventory.length === 0) {
                this.copyInventoryList(this.baseInventory, this.runInventory);
            }

            this.syncBagViews();
            return;
        }

        if (nextScope === "instance") {
            this.copyInventoryList(this.baseInventory, this.runInventory);
            this.currentScope = "instance";
            this.syncBagViews();
            return;
        }

        this.copyInventoryList(this.runInventory, this.baseInventory);
        this.saveManager.saveInventory(InventoryManager.BASE_STORAGE_KEY, this.baseInventory);
        this.runInventory.length = 0;
        this.currentScope = "base";
        this.syncBagViews();
    }

    public returnToBaseAfterDeath(sceneUrl: string): void {
        const nextScope = this.isBaseSceneUrl(sceneUrl) ? "base" : "instance";
        if (nextScope !== "base") {
            this.enterScene(sceneUrl);
            return;
        }

        this.runInventory.length = 0;
        this.baseInventory.length = 0;
        this.currentScope = "base";
        this.saveManager.saveInventory(InventoryManager.BASE_STORAGE_KEY, this.baseInventory);
        this.syncBagViews();
    }

    public getCurrentScope(): InventoryScope {
        return this.currentScope;
    }

    public getPlayerBagSlotCount(): number {
        return Math.max(0, Math.floor(this.playerBagSlotCount));
    }

    public setPlayerBagSlotCount(count: number): void {
        const nextCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
        if (this.playerBagSlotCount === nextCount) {
            return;
        }

        this.playerBagSlotCount = nextCount;
        this.syncBagViews();
    }

    public getInventorySnapshot(): InventorySlotItem[] {
        const snapshot = this.baseOrRunInventory().map((item) => (item ? { ...item } : null));
        const slotCount = this.getPlayerBagSlotCount();
        while (snapshot.length < slotCount) {
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
        const inventory = this.getActiveInventory();
        for (let i = 0; i < inventory.length; i++) {
            const item = inventory[i];
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
        const inventory = this.getActiveInventory();
        for (let i = 0; i < inventory.length && remaining > 0; i++) {
            const item = inventory[i];
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
                inventory[i] = null;
            }
            remaining -= used;
            consumed += used;
        }

        if (consumed > 0) {
            this.persistCurrentScope();
            this.syncBagViews();
        }

        return consumed;
    }
    public registerBagView(view: BagView): void {
        this.bagViews.add(view);
        view.setItems(this.getInventorySnapshot());
    }

    public unregisterBagView(view: BagView): void {
        this.bagViews.delete(view);
    }

    public refreshBagViews(): void {
        this.syncBagViews();
    }

    public addItemToActive(itemId: string, name: string, count: number, icon?: string): void {
        const inventory = this.getActiveInventory();
        const payload = this.normalizeItem({
            itemId,
            name,
            count,
            icon,
        });

        let remaining = Math.max(0, Math.floor(payload.count || 0));
        while (remaining > 0) {
            remaining = this.mergeIntoExistingSlot(inventory, { ...payload, count: remaining });
            if (remaining <= 0) {
                break;
            }

            const stackMax = this.getStackMax(payload.itemId || "");
            const placedCount = Math.min(remaining, stackMax);
            if (placedCount <= 0) {
                break;
            }

            this.placeItemIntoInventory(inventory, { ...payload, count: placedCount });
            remaining -= placedCount;
        }

        this.persistCurrentScope();
        this.syncBagViews();
    }

    public canAddItems(items: InventoryViewItem[]): boolean {
        const incoming = Array.isArray(items)
            ? items.filter((item) => item && !!item.itemId && Number.isFinite(item.count) && item.count > 0)
            : [];
        if (incoming.length === 0) {
            return true;
        }

        const slotCountsByItemId = new Map<string, number[]>();
        const inventory = this.getActiveInventory();
        const limit = this.getPlayerBagSlotCount();

        for (let i = 0; i < Math.min(inventory.length, limit); i++) {
            const item = inventory[i];
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

    public removeItemFromActive(itemId: string): InventoryViewItem | null {
        const inventory = this.getActiveInventory();
        const index = this.findItemIndex(inventory, itemId);
        if (index < 0) {
            return null;
        }

        const item = inventory[index];
        if (!item) {
            return null;
        }

        inventory[index] = null;
        this.persistCurrentScope();
        this.syncBagViews();
        return { ...item };
    }

    public removeActiveSlot(slotIndex: number): InventoryViewItem | null {
        const index = this.normalizeSlotIndex(slotIndex);
        if (index === null) {
            return null;
        }

        const inventory = this.getActiveInventory();
        const item = inventory[index] || null;
        if (!item) {
            return null;
        }

        inventory[index] = null;
        this.persistCurrentScope();
        this.syncBagViews();
        return { ...item };
    }

    public consumeActiveSlotItem(slotIndex: number, count: number): InventoryViewItem | null {
        const index = this.normalizeSlotIndex(slotIndex);
        const amount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
        if (index === null || amount <= 0) {
            return null;
        }

        const inventory = this.getActiveInventory();
        const item = inventory[index] || null;
        if (!item) {
            return null;
        }

        const consumed = Math.min(Math.max(0, Math.floor(item.count || 0)), amount);
        if (consumed <= 0) {
            return null;
        }

        item.count -= consumed;
        if (item.count <= 0) {
            inventory[index] = null;
        }

        this.persistCurrentScope();
        this.syncBagViews();
        return {
            itemId: item.itemId,
            name: item.name,
            count: consumed,
            icon: item.icon,
        };
    }

    public canSplitActiveSlot(slotIndex: number): boolean {
        const index = this.normalizeSlotIndex(slotIndex);
        if (index === null) {
            return false;
        }

        const inventory = this.getActiveInventory();
        const item = inventory[index] || null;
        if (!item || !item.itemId) {
            return false;
        }

        const count = Math.max(0, Math.floor(item.count || 0));
        return count > 1
            && this.getStackMax(item.itemId) > 1
            && this.findEmptySlotIndexWithinLimit(inventory) >= 0;
    }

    public splitActiveSlot(slotIndex: number): boolean {
        const index = this.normalizeSlotIndex(slotIndex);
        if (index === null || !this.canSplitActiveSlot(index)) {
            return false;
        }

        const inventory = this.getActiveInventory();
        const item = inventory[index];
        if (!item || !item.itemId) {
            return false;
        }

        const emptyIndex = this.findEmptySlotIndexWithinLimit(inventory);
        if (emptyIndex < 0) {
            return false;
        }

        const totalCount = Math.max(0, Math.floor(item.count || 0));
        const newSlotCount = Math.floor(totalCount / 2);
        const sourceSlotCount = totalCount - newSlotCount;
        if (newSlotCount <= 0 || sourceSlotCount <= 0) {
            return false;
        }

        item.count = sourceSlotCount;
        this.placeItemAtIndex(inventory, emptyIndex, { ...item, count: newSlotCount });
        this.persistCurrentScope();
        this.syncBagViews();
        return true;
    }

    public organizeActiveInventory(): void {
        const inventory = this.getActiveInventory();
        const organized = this.buildOrganizedInventory(inventory);
        inventory.length = 0;
        const slotCount = this.getPlayerBagSlotCount();
        const targetLength = Math.max(slotCount, organized.length);
        for (let i = 0; i < targetLength; i++) {
            inventory.push(organized[i] || null);
        }

        this.persistCurrentScope();
        this.syncBagViews();
    }

    public moveActiveSlot(sourceSlotIndex: number, targetSlotIndex: number): boolean {
        const sourceIndex = this.normalizeSlotIndex(sourceSlotIndex);
        const targetIndex = this.normalizeSlotIndex(targetSlotIndex);
        if (sourceIndex === null || targetIndex === null || sourceIndex === targetIndex) {
            return false;
        }

        const inventory = this.getActiveInventory();
        while (inventory.length <= Math.max(sourceIndex, targetIndex)) {
            inventory.push(null);
        }

        const sourceItem = inventory[sourceIndex];
        if (!sourceItem) {
            return false;
        }

        const targetItem = inventory[targetIndex] || null;
        if (targetItem && targetItem.itemId === sourceItem.itemId && this.getStackMax(sourceItem.itemId || "") > 1) {
            const stackMax = this.getStackMax(sourceItem.itemId || "");
            const targetCount = Math.max(0, Math.floor(targetItem.count || 0));
            const sourceCount = Math.max(0, Math.floor(sourceItem.count || 0));
            const movedCount = Math.min(Math.max(0, stackMax - targetCount), sourceCount);
            if (movedCount <= 0) {
                return false;
            }

            targetItem.count = targetCount + movedCount;
            sourceItem.count = sourceCount - movedCount;
            if (!targetItem.icon && sourceItem.icon) {
                targetItem.icon = sourceItem.icon;
            }
            if (!targetItem.name && sourceItem.name) {
                targetItem.name = sourceItem.name;
            }
            if (sourceItem.count <= 0) {
                inventory[sourceIndex] = null;
            }
            this.persistCurrentScope();
            this.syncBagViews();
            return true;
        }

        inventory[sourceIndex] = inventory[targetIndex] || null;
        inventory[targetIndex] = sourceItem;
        this.persistCurrentScope();
        this.syncBagViews();
        return true;
    }

    public canPlaceItemInBucket(bucket: InventoryBucket, slotIndex: number, itemId: string): boolean {
        if (bucket !== "active") {
            return false;
        }

        const index = this.normalizeSlotIndex(slotIndex);
        if (index === null) {
            return false;
        }

        const slot = this.getActiveInventory()[index] || null;
        if (!slot) {
            return true;
        }

        if (slot.itemId !== itemId || this.getStackMax(itemId) <= 1) {
            return false;
        }

        return Math.max(0, Math.floor(slot.count || 0)) < this.getStackMax(itemId);
    }

    public placeItemInBucket(bucket: InventoryBucket, slotIndex: number, item: InventoryViewItem): boolean {
        if (bucket !== "active") {
            return false;
        }

        const index = this.normalizeSlotIndex(slotIndex);
        if (index === null) {
            return false;
        }

        if (!this.canPlaceItemInBucket(bucket, index, item.itemId || "")) {
            return false;
        }

        this.placeItemAtIndex(this.getActiveInventory(), index, item);
        this.persistCurrentScope();
        this.syncBagViews();
        return true;
    }

    public swapActiveSlotItem(slotIndex: number, item: InventoryViewItem | null): InventoryViewItem | null {
        const index = this.normalizeSlotIndex(slotIndex);
        if (index === null) {
            return null;
        }

        const inventory = this.getActiveInventory();
        while (inventory.length <= index) {
            inventory.push(null);
        }

        const previous = inventory[index] || null;
        inventory[index] = item ? { ...item } : null;
        this.persistCurrentScope();
        this.syncBagViews();
        return previous ? { ...previous } : null;
    }

    private syncBagViews(): void {
        const snapshot = this.getInventorySnapshot();
        for (const view of this.bagViews) {
            view.setItems(snapshot);
            if (typeof view.refreshPlayerStats === "function") {
                view.refreshPlayerStats();
            }
        }
    }

    private getActiveInventory(): InventorySlotItem[] {
        return this.currentScope === "base" ? this.baseInventory : this.runInventory;
    }

    private baseOrRunInventory(): InventorySlotItem[] {
        return this.getActiveInventory();
    }

    private copyInventoryList(source: InventorySlotItem[], target: InventorySlotItem[]): void {
        target.length = 0;
        for (let i = 0; i < source.length; i++) {
            const item = source[i];
            target.push(item ? { ...item } : null);
        }

        this.normalizeInventoryStacks(target);
    }

    private loadInventoryFromStorage(storageKey: string, target: InventorySlotItem[]): void {
        const items = this.saveManager.loadInventory(storageKey);
        target.length = 0;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item) {
                target.push(null);
                continue;
            }

            const itemId = item.itemId ? String(item.itemId) : "";
            if (!itemId) {
                throw new Error(`Inventory storage "${storageKey}" itemId is invalid at index ${i}.`);
            }

            target.push(this.normalizeItem({
                itemId,
                name: item.name,
                count: item.count,
                icon: item.icon,
            }));
        }
    }

    private normalizeInventoryStacks(inventory: InventorySlotItem[]): void {
        const normalized = this.buildNormalizedInventory(inventory, false);
        inventory.length = 0;
        for (let i = 0; i < normalized.length; i++) {
            inventory.push(normalized[i]);
        }
    }

    private buildOrganizedInventory(inventory: InventorySlotItem[]): InventorySlotItem[] {
        const normalized = this.buildNormalizedInventory(inventory, false)
            .filter((item): item is InventoryViewItem => !!item);

        normalized.sort((a, b) => {
            const priorityA = this.resolveSortPriority(a);
            const priorityB = this.resolveSortPriority(b);
            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }

            const nameCompare = String(a.name || "").localeCompare(String(b.name || ""));
            if (nameCompare !== 0) {
                return nameCompare;
            }

            return String(a.itemId || "").localeCompare(String(b.itemId || ""));
        });

        return normalized;
    }

    private buildNormalizedInventory(inventory: InventorySlotItem[], keepEmptySlots: boolean): InventorySlotItem[] {
        const normalized: InventorySlotItem[] = [];
        const totals = new Map<string, InventoryViewItem>();

        for (let i = 0; i < inventory.length; i++) {
            const item = inventory[i] ? this.normalizeItem(inventory[i] as InventoryViewItem) : null;
            if (!item || !item.itemId) {
                if (keepEmptySlots) {
                    normalized.push(null);
                }
                continue;
            }

            const itemId = item.itemId;
            const existing = totals.get(itemId);
            if (existing) {
                existing.count += Math.max(0, Math.floor(item.count || 0));
                if (!existing.icon && item.icon) {
                    existing.icon = item.icon;
                }
                if (!existing.name && item.name) {
                    existing.name = item.name;
                }
            } else {
                totals.set(itemId, { ...item, count: Math.max(0, Math.floor(item.count || 0)) });
            }
        }

        totals.forEach((item) => {
            let remaining = Math.max(0, Math.floor(item.count || 0));
            const itemId = item.itemId || "";
            const stackMax = this.getStackMax(itemId);
            while (remaining > 0) {
                const count = Math.min(stackMax, remaining);
                normalized.push({
                    itemId,
                    name: item.name,
                    count,
                    icon: item.icon,
                });
                remaining -= count;
            }
        });

        return normalized;
    }

    private mergeIntoExistingSlot(inventory: InventorySlotItem[], item: InventoryViewItem): number {
        const itemId = item.itemId || "";
        const stackMax = this.getStackMax(itemId);
        let remaining = Math.max(0, Math.floor(item.count || 0));

        if (!itemId || stackMax <= 1) {
            return remaining;
        }

        for (let i = 0; i < inventory.length && remaining > 0; i++) {
            const existing = inventory[i];
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

    private placeItemIntoInventory(inventory: InventorySlotItem[], item: InventoryViewItem): void {
        const emptyIndex = this.findEmptySlotIndex(inventory);
        if (emptyIndex >= 0) {
            this.placeItemAtIndex(inventory, emptyIndex, item);
            return;
        }

        inventory.push({ ...item });
    }

    private placeItemAtIndex(inventory: InventorySlotItem[], slotIndex: number, item: InventoryViewItem): void {
        while (inventory.length <= slotIndex) {
            inventory.push(null);
        }

        const current = inventory[slotIndex];
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

        inventory[slotIndex] = { ...item };
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

    private resolveSortPriority(item: InventoryViewItem): number {
        return this.sortPriorityResolver ? this.sortPriorityResolver(item) : Number.MAX_SAFE_INTEGER;
    }

    private persistCurrentScope(): void {
        if (this.currentScope === "base") {
            this.saveManager.saveInventory(InventoryManager.BASE_STORAGE_KEY, this.baseInventory);
        }
    }

    private findItemIndex(inventory: InventorySlotItem[], itemId: string): number {
        if (!itemId) {
            return -1;
        }

        for (let i = 0; i < inventory.length; i++) {
            const item = inventory[i];
            if (item && item.itemId === itemId) {
                return i;
            }
        }

        return -1;
    }

    private findEmptySlotIndex(inventory: InventorySlotItem[]): number {
        for (let i = 0; i < inventory.length; i++) {
            if (!inventory[i]) {
                return i;
            }
        }

        return -1;
    }

    private findEmptySlotIndexWithinLimit(inventory: InventorySlotItem[]): number {
        const limit = this.getPlayerBagSlotCount();
        for (let i = 0; i < limit; i++) {
            if (!inventory[i]) {
                return i;
            }
        }

        return -1;
    }

    private normalizeSlotIndex(slotIndex: number): number | null {
        if (!Number.isFinite(slotIndex)) {
            return null;
        }

        const index = Math.floor(slotIndex);
        return index >= 0 ? index : null;
    }

    private isBaseSceneUrl(sceneUrl: string): boolean {
        const url = String(sceneUrl || "").trim().toLowerCase();
        if (!url) {
            return false;
        }

        return url.includes("cunzhuang") || url.includes("base");
    }
}
