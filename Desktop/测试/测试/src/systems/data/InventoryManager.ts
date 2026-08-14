import { SaveManager } from "./SaveManager";
import type { BagView, InventoryBucket, InventoryScope, InventoryViewItem } from "./InventoryTypes";

export class InventoryManager {
    public static readonly BASE_STORAGE_KEY = "laya_test_base_inventory_v1";

    private loaded: boolean = false;
    private currentScope: InventoryScope = "base";
    private readonly baseInventoryById: Map<string, InventoryViewItem> = new Map();
    private readonly runInventoryById: Map<string, InventoryViewItem> = new Map();
    private readonly bagViews: Set<BagView> = new Set();
    private playerBagSlotCount: number = 30;

    public constructor(private readonly saveManager: SaveManager) {}

    public loadPersistedInventories(): void {
        if (this.loaded) {
            this.syncBagViews();
            return;
        }

        this.loadInventoryFromStorage(InventoryManager.BASE_STORAGE_KEY, this.baseInventoryById);
        this.currentScope = "base";
        this.runInventoryById.clear();
        this.loaded = true;
        this.syncBagViews();
    }

    public enterScene(sceneUrl: string): void {
        const nextScope = this.isBaseSceneUrl(sceneUrl) ? "base" : "instance";

        if (nextScope === this.currentScope) {
            if (nextScope === "instance" && this.runInventoryById.size === 0) {
                this.copyInventoryMap(this.baseInventoryById, this.runInventoryById);
            }

            this.syncBagViews();
            return;
        }

        if (nextScope === "instance") {
            this.copyInventoryMap(this.baseInventoryById, this.runInventoryById);
            this.currentScope = "instance";
            this.syncBagViews();
            return;
        }

        this.copyInventoryMap(this.runInventoryById, this.baseInventoryById);
        this.saveManager.saveInventory(InventoryManager.BASE_STORAGE_KEY, this.baseInventoryById);
        this.runInventoryById.clear();
        this.currentScope = "base";
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

    public getInventorySnapshot(bucket: InventoryBucket = "active"): InventoryViewItem[] {
        return Array.from(this.getInventoryMap(bucket).entries()).map(([itemId, item]) => ({
            itemId,
            ...item,
        }));
    }

    public registerBagView(view: BagView): void {
        this.bagViews.add(view);
        view.setItems(this.getInventorySnapshot());
    }

    public unregisterBagView(view: BagView): void {
        this.bagViews.delete(view);
    }

    public addItemToActive(itemId: string, name: string, count: number, icon?: string): void {
        const inventory = this.getInventoryMap("active");
        const existing = inventory.get(itemId);
        if (existing) {
            existing.itemId = existing.itemId || itemId;
            existing.count += count;
            if (!existing.icon && icon) {
                existing.icon = icon;
            }
            if (!existing.name && name) {
                existing.name = name;
            }
        } else {
            inventory.set(itemId, {
                itemId,
                name,
                count,
                icon,
            });
        }

        if (this.currentScope === "base") {
            this.saveManager.saveInventory(InventoryManager.BASE_STORAGE_KEY, this.baseInventoryById);
        }

        this.syncBagViews();
    }

    public removeItemFromActive(itemId: string): InventoryViewItem | null {
        const inventory = this.getInventoryMap("active");
        const item = inventory.get(itemId);
        if (!item) {
            return null;
        }

        inventory.delete(itemId);

        if (this.currentScope === "base") {
            this.saveManager.saveInventory(InventoryManager.BASE_STORAGE_KEY, this.baseInventoryById);
        }

        this.syncBagViews();
        return { ...item };
    }

    private syncBagViews(): void {
        const snapshot = this.getInventorySnapshot();
        for (const view of this.bagViews) {
            view.setItems(snapshot);
        }
    }

    private getInventoryMap(bucket: InventoryBucket): Map<string, InventoryViewItem> {
        return this.currentScope === "base" ? this.baseInventoryById : this.runInventoryById;
    }

    private copyInventoryMap(source: Map<string, InventoryViewItem>, target: Map<string, InventoryViewItem>): void {
        target.clear();
        for (const [itemId, item] of source.entries()) {
            target.set(itemId, { ...item });
        }
    }

    private loadInventoryFromStorage(storageKey: string, target: Map<string, InventoryViewItem>): void {
        const items = this.saveManager.loadInventory(storageKey);
        target.clear();
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const itemId = item.itemId ? String(item.itemId) : "";
            if (!itemId) {
                throw new Error(`Inventory storage "${storageKey}" itemId is invalid at index ${i}.`);
            }

            target.set(itemId, {
                itemId,
                name: item.name,
                count: item.count,
                icon: item.icon,
            });
        }
    }

    private isBaseSceneUrl(sceneUrl: string): boolean {
        const url = String(sceneUrl || "").trim().toLowerCase();
        if (!url) {
            return false;
        }

        return url.includes("cunzhuang") || url.includes("base");
    }
}