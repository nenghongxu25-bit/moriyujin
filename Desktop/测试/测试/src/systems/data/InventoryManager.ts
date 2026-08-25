import { SaveManager } from "./SaveManager";
import type { BagView, InventoryBucket, InventoryScope, InventorySlotItem, InventoryViewItem } from "./InventoryTypes";

export class InventoryManager {
    public static readonly BASE_STORAGE_KEY = "laya_test_base_inventory_v1";

    private loaded: boolean = false;
    private currentScope: InventoryScope = "base";
    private readonly baseInventory: InventorySlotItem[] = [];
    private readonly runInventory: InventorySlotItem[] = [];
    private readonly bagViews: Set<BagView> = new Set();
    private playerBagSlotCount: number = 50;

    public constructor(private readonly saveManager: SaveManager) {}

    public loadPersistedInventories(): void {
        if (this.loaded) {
            this.syncBagViews();
            return;
        }

        this.loadInventoryFromStorage(InventoryManager.BASE_STORAGE_KEY, this.baseInventory);
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
        const payload: InventoryViewItem = {
            itemId,
            name,
            count,
            icon,
        };

        if (!this.mergeIntoExistingSlot(inventory, payload)) {
            this.placeItemIntoInventory(inventory, payload);
        }

        this.persistCurrentScope();
        this.syncBagViews();
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
        return !slot || slot.itemId === itemId;
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

            target.push({
                itemId,
                name: item.name,
                count: item.count,
                icon: item.icon,
            });
        }
    }

    private mergeIntoExistingSlot(inventory: InventorySlotItem[], item: InventoryViewItem): boolean {
        const index = this.findItemIndex(inventory, item.itemId || "");
        if (index < 0) {
            return false;
        }

        const existing = inventory[index];
        if (!existing) {
            return false;
        }

        existing.count += item.count;
        if (!existing.icon && item.icon) {
            existing.icon = item.icon;
        }
        if (!existing.name && item.name) {
            existing.name = item.name;
        }
        return true;
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

        inventory[slotIndex] = { ...item };
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
