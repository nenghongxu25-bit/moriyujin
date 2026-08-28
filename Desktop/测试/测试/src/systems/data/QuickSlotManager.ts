import type { EquippedItem, EquipmentSlotType, InventorySlotItem, QuickSlotView } from "./InventoryTypes";

export interface QuickSlotUseResult {
    success: boolean;
    usedItem?: boolean;
    switchedWeapon?: boolean;
}

export class QuickSlotManager {
    private readonly items: InventorySlotItem[] = [null, null, null, null];
    private readonly views: Set<QuickSlotView> = new Set();

    public constructor(
        private readonly data: any,
        private readonly storageKey: string
    ) {
    }

    public getItems(): InventorySlotItem[] {
        return this.items.map((item) => (item ? { ...item } : null));
    }

    public registerView(view: QuickSlotView): void {
        if (!view) {
            return;
        }
        this.views.add(view);
        view.refreshQuickSlots(this.getItems());
    }

    public unregisterView(view: QuickSlotView): void {
        this.views.delete(view);
    }

    public canAssignItem(itemId: string): boolean {
        const meta = this.data.resolveItemMeta(itemId);
        const category = String(meta?.category || "").toLowerCase();
        const subCategory = String(meta?.subCategory || "").toLowerCase();
        return category === "foods"
            || category === "medicines"
            || category === "weapons"
            || subCategory.includes("food")
            || subCategory.includes("medicine")
            || subCategory.includes("weapon")
            || subCategory.includes("melee")
            || subCategory.includes("ranged");
    }

    public assignActiveItem(quickSlotIndex: number, itemId: string): boolean {
        const inventory = this.data.inventory.getInventorySnapshot();
        for (let i = 0; i < inventory.length; i++) {
            const item = inventory[i];
            if (item && item.itemId === itemId) {
                return this.assignActiveSlot(quickSlotIndex, i);
            }
        }

        return false;
    }

    public assignActiveSlot(quickSlotIndex: number, activeSlotIndex: number): boolean {
        const index = this.normalizeIndex(quickSlotIndex);
        const slotIndex = Number.isFinite(activeSlotIndex) ? Math.floor(activeSlotIndex) : -1;
        const activeItems = this.data.inventory.getInventorySnapshot();
        const sourceItem = slotIndex >= 0 ? activeItems[slotIndex] : null;
        const itemId = String(sourceItem?.itemId || "");
        if (index < 0 || slotIndex < 0 || !sourceItem || !itemId || !this.canAssignItem(itemId)) {
            return false;
        }

        const removed = this.data.inventory.removeActiveSlot(slotIndex);
        if (!removed) {
            return false;
        }

        const previousQuickItem = this.items[index];
        this.items[index] = removed;
        if (previousQuickItem) {
            this.data.inventory.placeItemInBucket("active", slotIndex, previousQuickItem);
        }

        this.save();
        this.refreshViews();
        return true;
    }

    public clear(quickSlotIndex: number): boolean {
        const index = this.normalizeIndex(quickSlotIndex);
        if (index < 0 || !this.items[index]) {
            return false;
        }

        this.items[index] = null;
        this.save();
        this.refreshViews();
        return true;
    }

    public move(sourceQuickSlotIndex: number, targetQuickSlotIndex: number): boolean {
        const sourceIndex = this.normalizeIndex(sourceQuickSlotIndex);
        const targetIndex = this.normalizeIndex(targetQuickSlotIndex);
        if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
            return false;
        }

        const sourceItem = this.items[sourceIndex];
        if (!sourceItem) {
            return false;
        }

        this.items[sourceIndex] = this.items[targetIndex] || null;
        this.items[targetIndex] = sourceItem;
        this.save();
        this.refreshViews();
        return true;
    }

    public moveToActiveSlot(sourceQuickSlotIndex: number, targetActiveSlotIndex: number): boolean {
        const sourceIndex = this.normalizeIndex(sourceQuickSlotIndex);
        const targetIndex = Number.isFinite(targetActiveSlotIndex) ? Math.floor(targetActiveSlotIndex) : -1;
        if (sourceIndex < 0 || targetIndex < 0) {
            return false;
        }

        const sourceItem = this.items[sourceIndex];
        if (!sourceItem) {
            return false;
        }

        const previousActiveItem = this.data.inventory.swapActiveSlotItem(targetIndex, sourceItem);
        if (previousActiveItem && !this.canAssignItem(previousActiveItem.itemId || "")) {
            this.data.inventory.swapActiveSlotItem(targetIndex, previousActiveItem);
            return false;
        }

        this.items[sourceIndex] = previousActiveItem || null;
        this.save();
        this.refreshViews();
        return true;
    }

    public moveToEquipment(sourceQuickSlotIndex: number, targetSlot: EquipmentSlotType): boolean {
        const sourceIndex = this.normalizeIndex(sourceQuickSlotIndex);
        if (sourceIndex < 0) {
            return false;
        }

        const sourceItem = this.items[sourceIndex];
        const itemId = String(sourceItem?.itemId || "");
        if (!sourceItem || !this.data.canEquipItemToSlot(itemId, targetSlot)) {
            return false;
        }

        const previousEquipment = this.data.equippedItems[targetSlot] as EquippedItem | null;
        this.data.equippedItems[targetSlot] = {
            itemId,
            name: this.data.resolveDisplayName(itemId, sourceItem.name),
            count: 1,
            icon: sourceItem.icon || this.data.resolveItemMeta(itemId)?.icon || this.data.resolveFallbackIcon(itemId),
        };
        this.items[sourceIndex] = previousEquipment ? { ...previousEquipment } : null;
        this.data.saveEquipment();
        this.save();
        this.refreshViews();
        return true;
    }

    public activate(quickSlotIndex: number): QuickSlotUseResult {
        const index = this.normalizeIndex(quickSlotIndex);
        if (index < 0) {
            return { success: false };
        }

        const item = this.items[index];
        const itemId = String(item?.itemId || "").trim();
        if (!item || !itemId) {
            this.clear(index);
            return { success: false };
        }

        if (this.data.canEquipItemToSlot(itemId, "weapon")) {
            return this.switchWeapon(index, itemId);
        }

        if (this.data.canUseItem(itemId)) {
            return this.useItem(index, itemId);
        }

        return { success: false };
    }

    public clearAll(): void {
        let changed = false;
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i]) {
                this.items[i] = null;
                changed = true;
            }
        }

        if (changed) {
            this.save();
        }
        this.refreshViews();
    }

    public clearMissingItems(): void {
        let changed = false;
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if (item && (!item.itemId || item.count <= 0 || !this.canAssignItem(item.itemId))) {
                this.items[i] = null;
                changed = true;
            }
        }

        if (changed) {
            this.save();
        }
        this.refreshViews();
    }

    public load(): void {
        const stored = this.data.save.loadJson(this.storageKey) as Array<InventorySlotItem | string> | null;
        for (let i = 0; i < this.items.length; i++) {
            const storedItem = Array.isArray(stored) ? stored[i] : null;
            if (typeof storedItem === "string") {
                this.items[i] = null;
                continue;
            }

            const item = storedItem || null;
            const itemId = String(item?.itemId || "").trim();
            const rawCount = item ? item.count : 0;
            const count = Number.isFinite(rawCount) ? Math.max(0, Math.floor(rawCount)) : 0;
            this.items[i] = itemId && count > 0 && this.canAssignItem(itemId)
                ? {
                      itemId,
                      name: this.data.resolveDisplayName(itemId, item?.name),
                      count,
                      icon: item?.icon || this.data.resolveItemMeta(itemId)?.icon || this.data.resolveFallbackIcon(itemId),
                  }
                : null;
        }
        this.clearMissingItems();
    }

    public refreshViews(): void {
        const items = this.getItems();
        this.views.forEach((view) => view.refreshQuickSlots(items));
    }

    private useItem(quickSlotIndex: number, itemId: string): QuickSlotUseResult {
        const item = this.items[quickSlotIndex];
        if (!item || item.itemId !== itemId || item.count <= 0) {
            this.clear(quickSlotIndex);
            return { success: false };
        }

        item.count = Math.max(0, Math.floor(item.count || 0) - 1);
        if (item.count <= 0) {
            this.items[quickSlotIndex] = null;
        }

        const healAmount = this.data.resolveUseHealAmount(itemId);
        if (healAmount > 0) {
            const stats = this.data.getPlayerStats();
            this.data.setPlayerHp(stats.currentHp + healAmount, stats.maxHp);
        }

        this.save();
        this.refreshViews();
        return { success: true, usedItem: true };
    }

    private switchWeapon(quickSlotIndex: number, itemId: string): QuickSlotUseResult {
        if (!this.data.canEquipItemToSlot(itemId, "weapon")) {
            return { success: false };
        }

        const nextItem = this.items[quickSlotIndex];
        if (!nextItem || nextItem.itemId !== itemId) {
            this.clear(quickSlotIndex);
            return { success: false };
        }

        const previousWeapon = this.data.equippedItems.weapon as EquippedItem | null;
        this.data.equippedItems.weapon = {
            itemId: nextItem.itemId,
            name: this.data.resolveDisplayName(nextItem.itemId, nextItem.name),
            count: 1,
            icon: nextItem.icon || this.data.resolveItemMeta(nextItem.itemId)?.icon || this.data.resolveFallbackIcon(nextItem.itemId),
        };

        if (previousWeapon) {
            this.items[quickSlotIndex] = { ...previousWeapon };
        } else {
            this.items[quickSlotIndex] = null;
        }

        this.data.saveEquipment();
        this.save();
        this.refreshViews();
        return { success: true, switchedWeapon: true };
    }

    private save(): void {
        this.data.save.saveJson(this.storageKey, this.items.map((item) => (item ? { ...item } : null)));
    }

    private normalizeIndex(slotIndex: number): number {
        const index = Number.isFinite(slotIndex) ? Math.floor(slotIndex) : -1;
        return index >= 0 && index < this.items.length ? index : -1;
    }
}