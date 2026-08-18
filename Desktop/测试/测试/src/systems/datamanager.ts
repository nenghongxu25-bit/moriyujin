import { ItemDataManager, type ItemMeta, type ItemTableFile } from "./data/ItemDataManager";
import { HarvestManager, type HarvestDropConfig, type HarvestResultItem, type HarvestTableFile } from "./data/HarvestManager";
import { InventoryManager } from "./data/InventoryManager";
import type { BagView, EquippedItem, EquipmentSlotType, InventoryBucket, InventoryScope, InventorySlotItem, InventoryViewItem, WarehouseView } from "./data/InventoryTypes";
import { SaveManager } from "./data/SaveManager";
import { WarehouseManager } from "./data/WarehouseManager";

export type { InventoryViewItem, InventoryBucket, InventoryScope, BagView, WarehouseView, HarvestDropConfig, HarvestResultItem, ItemMeta, InventorySlotItem, EquippedItem, EquipmentSlotType };

export class DataManager {
    private static readonly EQUIPMENT_STORAGE_KEY = "laya_test_equipment_v1";
    private static instance: DataManager | null = null;

    private readonly items = new ItemDataManager();
    private readonly save = new SaveManager();
    private readonly inventory = new InventoryManager(this.save);
    private readonly warehouse = new WarehouseManager(this.save);
    private readonly harvest = new HarvestManager(this.items);
    private readonly warehouseViews: Set<WarehouseView> = new Set();
    private readonly equippedItems: Record<EquipmentSlotType, EquippedItem | null> = {
        insertPlate: null,
        helmet: null,
        weapon: null,
        armor: null,
    };
    private loaded: boolean = false;
    private loading: boolean = false;

    public static getInstance(): DataManager {
        if (!DataManager.instance) {
            DataManager.instance = new DataManager();
        }

        return DataManager.instance;
    }

    public async loadAll(): Promise<void> {
        if (this.loaded) {
            this.inventory.loadPersistedInventories();
            this.warehouse.load();
            this.loadEquipment();
            this.ensureStarterItems();
            return;
        }

        if (this.loading) {
            return;
        }

        this.loading = true;

        try {
            const [materials, foods, weapons, misc, harvest] = await Promise.all([
                this.loadJson<ItemTableFile>("config/items/materials.json", "assets/config/items/materials.json"),
                this.loadJson<ItemTableFile>("config/items/foods.json", "assets/config/items/foods.json"),
                this.loadJson<ItemTableFile>("config/items/weapons.json", "assets/config/items/weapons.json"),
                this.loadJson<ItemTableFile>("config/items/misc.json", "assets/config/items/misc.json"),
                this.loadJson<HarvestTableFile>("config/harvest/drops.json", "assets/config/harvest/drops.json"),
            ]);

            this.items.registerItemTable(materials);
            this.items.registerItemTable(foods);
            this.items.registerItemTable(weapons);
            this.items.registerItemTable(misc);
            this.harvest.registerHarvestTable(harvest);
            this.inventory.loadPersistedInventories();
            this.warehouse.load();
            this.loadEquipment();
            this.loaded = true;
            this.ensureStarterItems();
        } finally {
            this.loading = false;
        }
    }

    public enterScene(sceneUrl: string): void {
        this.inventory.enterScene(sceneUrl);
        if (this.loaded) {
            this.ensureStarterItems();
        }
    }

    public getCurrentScope(): InventoryScope {
        return this.inventory.getCurrentScope();
    }

    public getPlayerBagSlotCount(): number {
        return this.inventory.getPlayerBagSlotCount();
    }

    public setPlayerBagSlotCount(count: number): void {
        this.inventory.setPlayerBagSlotCount(count);
    }

    public getWarehouseSlotCount(): number {
        return this.warehouse.getSlotCount();
    }

    public setWarehouseSlotCount(count: number): void {
        this.warehouse.setSlotCount(count);
    }

    public getHarvestDrops(harvestId: string, fallback: HarvestDropConfig[] = []): HarvestDropConfig[] {
        return this.harvest.getHarvestDrops(harvestId, fallback);
    }

    public rollHarvestDrops(harvestId: string, fallback: HarvestDropConfig[] = []): HarvestResultItem[] {
        return this.harvest.rollHarvestDrops(harvestId, fallback);
    }

    public grantHarvestDrops(harvestId: string, fallback: HarvestDropConfig[] = []): HarvestResultItem[] {
        const results = this.harvest.rollHarvestDrops(harvestId, fallback);

        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            this.inventory.addItemToActive(result.itemId, result.name, result.count, result.icon);
        }

        return results;
    }

    public grantItemsToActive(items: Array<{ itemId: string; name?: string; count: number; icon?: string }>): void {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item || !item.itemId || !Number.isFinite(item.count) || item.count <= 0) {
                continue;
            }

            const meta = this.resolveItemMeta(item.itemId);
            const icon = item.icon || meta?.icon || this.items.resolveFallbackIcon(item.itemId);
            const name = this.resolveDisplayName(item.itemId, item.name);
            this.inventory.addItemToActive(item.itemId, name, item.count, icon);
        }
    }

    public grantItemsToWarehouse(items: Array<{ itemId: string; name?: string; count: number; icon?: string }>): void {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item || !item.itemId || !Number.isFinite(item.count) || item.count <= 0) {
                continue;
            }

            const meta = this.resolveItemMeta(item.itemId);
            this.warehouse.addItem({
                itemId: item.itemId,
                name: this.resolveDisplayName(item.itemId, item.name),
                count: item.count,
                icon: item.icon || meta?.icon || this.items.resolveFallbackIcon(item.itemId),
            });
        }

        this.syncWarehouseViews();
    }

    public formatHarvestResults(results: HarvestResultItem[]): string {
        return this.harvest.formatHarvestResults(results);
    }

    public getInventorySnapshot(bucket: InventoryBucket = "active"): InventorySlotItem[] {
        return bucket === "warehouse" ? this.warehouse.getSnapshot() : this.inventory.getInventorySnapshot();
    }

    public getWarehouseSnapshot(): InventorySlotItem[] {
        return this.warehouse.getSnapshot();
    }

    public registerBagView(view: BagView): void {
        this.inventory.registerBagView(view);
        if (!this.loaded) {
            void this.loadAll();
        }
    }

    public unregisterBagView(view: BagView): void {
        this.inventory.unregisterBagView(view);
    }

    public registerWarehouseView(view: WarehouseView): void {
        this.warehouseViews.add(view);
        view.refresh();
    }

    public unregisterWarehouseView(view: WarehouseView): void {
        this.warehouseViews.delete(view);
    }

    public resolveItemMeta(itemId: string): ItemMeta | null {
        return this.items.resolveItemMeta(itemId);
    }

    public resolveFallbackIcon(itemId: string): string | undefined {
        return this.items.resolveFallbackIcon(itemId);
    }

    public resolveFallbackName(itemId: string): string | undefined {
        return this.items.resolveFallbackName(itemId);
    }

    public getEquippedItem(slot: EquipmentSlotType): EquippedItem | null {
        const item = this.equippedItems[slot] || null;
        return item ? { ...item } : null;
    }

    public getEquippedItems(): Record<EquipmentSlotType, EquippedItem | null> {
        return {
            insertPlate: this.getEquippedItem("insertPlate"),
            helmet: this.getEquippedItem("helmet"),
            weapon: this.getEquippedItem("weapon"),
            armor: this.getEquippedItem("armor"),
        };
    }

    public canEquipItemToSlot(itemId: string, slot: EquipmentSlotType): boolean {
        const meta = this.resolveItemMeta(itemId);
        if (!meta) {
            return false;
        }

        const category = String(meta.category || "").toLowerCase();
        const subCategory = String(meta.subCategory || "").toLowerCase();
        if (slot === "weapon") {
            return category === "weapons" || subCategory.includes("weapon") || subCategory.includes("melee") || Number.isFinite(meta.attackPower) || Number.isFinite(meta.attackSpeed);
        }

        if (slot === "insertPlate") {
            return category.includes("plate") || subCategory.includes("plate") || subCategory.includes("insert");
        }

        if (slot === "helmet") {
            return category.includes("helmet") || subCategory.includes("helmet") || subCategory.includes("head");
        }

        if (slot === "armor") {
            return category.includes("armor") || subCategory.includes("armor") || subCategory.includes("body");
        }

        return false;
    }

    public equipItemFromActive(slot: EquipmentSlotType, itemId: string): boolean {
        if (!this.canEquipItemToSlot(itemId, slot)) {
            return false;
        }

        const nextItem = this.inventory.removeItemFromActive(itemId);
        if (!nextItem || !nextItem.itemId) {
            return false;
        }

        const previousItem = this.equippedItems[slot];
        this.equippedItems[slot] = {
            itemId: nextItem.itemId,
            name: this.resolveDisplayName(nextItem.itemId, nextItem.name),
            count: 1,
            icon: nextItem.icon || this.resolveItemMeta(nextItem.itemId)?.icon || this.resolveFallbackIcon(nextItem.itemId),
        };

        if (previousItem) {
            this.inventory.addItemToActive(previousItem.itemId, previousItem.name, previousItem.count, previousItem.icon);
        }

        this.saveEquipment();
        return true;
    }

    public unequipItemToActive(slot: EquipmentSlotType): boolean {
        const item = this.equippedItems[slot];
        if (!item) {
            return false;
        }

        this.equippedItems[slot] = null;
        this.inventory.addItemToActive(item.itemId, item.name, item.count, item.icon);
        this.saveEquipment();
        return true;
    }

    public getEquipmentAttackBonus(): number {
        const weapon = this.equippedItems.weapon;
        if (!weapon) {
            return 0;
        }

        return this.resolveItemMeta(weapon.itemId)?.attackPower || 0;
    }

    public getEquipmentAttackSpeed(): number {
        const weapon = this.equippedItems.weapon;
        if (!weapon) {
            return 1;
        }

        return Math.max(0.1, this.resolveItemMeta(weapon.itemId)?.attackSpeed || 1);
    }

    public transferItem(sourceBucket: InventoryBucket, targetBucket: InventoryBucket, itemId: string, targetSlotIndex?: number): boolean {
        if (sourceBucket === targetBucket) {
            return false;
        }

        if (sourceBucket === "active" && targetBucket === "warehouse") {
            if (targetSlotIndex !== undefined && !this.warehouse.canPlaceItemAt(targetSlotIndex, itemId)) {
                return false;
            }

            const item = this.inventory.removeItemFromActive(itemId);
            if (!item) {
                return false;
            }

            const success = this.warehouse.addItem(item, targetSlotIndex);
            if (success) {
                this.syncWarehouseViews();
            }
            return success;
        }

        if (sourceBucket === "warehouse" && targetBucket === "active") {
            if (targetSlotIndex !== undefined && !this.inventory.canPlaceItemInBucket("active", targetSlotIndex, itemId)) {
                return false;
            }

            const item = this.warehouse.removeItem(itemId);
            if (!item) {
                return false;
            }

            if (targetSlotIndex !== undefined) {
                const success = this.inventory.placeItemInBucket("active", targetSlotIndex, item);
                if (success) {
                    this.syncWarehouseViews();
                }
                return success;
            }

            this.inventory.addItemToActive(item.itemId || itemId, item.name, item.count, item.icon);
            this.syncWarehouseViews();
            return true;
        }

        return false;
    }

    public moveActiveInventorySlot(sourceSlotIndex: number, targetSlotIndex: number): boolean {
        return this.inventory.moveActiveSlot(sourceSlotIndex, targetSlotIndex);
    }

    private async loadJson<T>(url: string, fallbackUrl?: string): Promise<T> {
        try {
            const raw = await Laya.loader.load(url, null, null, Laya.Loader.JSON);
            const data = this.normalizeLoadedJson<T>(raw, url);
            return data;
        } catch (error) {
            if (!fallbackUrl) {
                throw error;
            }

            const raw = await Laya.loader.load(fallbackUrl, null, null, Laya.Loader.JSON);
            const data = this.normalizeLoadedJson<T>(raw, fallbackUrl);
            return data;
        }
    }

    private normalizeLoadedJson<T>(raw: unknown, url: string): T {
        if (typeof raw === "string") {
            return JSON.parse(raw) as T;
        }

        if (raw && typeof raw === "object") {
            const data = (raw as any).data;
            if (typeof data === "string") {
                return JSON.parse(data) as T;
            }

            if (data && typeof data === "object") {
                return data as T;
            }

            return raw as T;
        }

        throw new Error(`JSON load result is invalid: ${url}`);
    }

    private resolveDisplayName(itemId: string, incomingName?: string): string {
        const rawName = String(incomingName || "").trim();
        const meta = this.resolveItemMeta(itemId);
        if (meta?.displayName) {
            return meta.displayName;
        }

        const fallbackName = this.items.resolveFallbackName(itemId);
        if (fallbackName) {
            return fallbackName;
        }

        return rawName && rawName !== itemId ? rawName : itemId;
    }

    private syncWarehouseViews(): void {
        this.warehouseViews.forEach((view) => view.refresh());
    }

    private loadEquipment(): void {
        const stored = this.save.loadJson<Partial<Record<EquipmentSlotType, EquippedItem | null>>>(DataManager.EQUIPMENT_STORAGE_KEY) || {};
        const slots: EquipmentSlotType[] = ["insertPlate", "helmet", "weapon", "armor"];
        for (let i = 0; i < slots.length; i++) {
            const slot = slots[i];
            const item = stored[slot];
            this.equippedItems[slot] = item && item.itemId
                ? {
                      itemId: item.itemId,
                      name: this.resolveDisplayName(item.itemId, item.name),
                      count: Math.max(1, Math.floor(item.count || 1)),
                      icon: item.icon || this.resolveItemMeta(item.itemId)?.icon || this.resolveFallbackIcon(item.itemId),
                  }
                : null;
        }
    }

    private saveEquipment(): void {
        this.save.saveJson(DataManager.EQUIPMENT_STORAGE_KEY, this.equippedItems);
    }

    private ensureStarterItems(): void {
        if (this.hasActiveItem("wood_club") || this.equippedItems.weapon?.itemId === "wood_club") {
            return;
        }

        const meta = this.resolveItemMeta("wood_club");
        this.grantItemsToActive([
            {
                itemId: "wood_club",
                name: meta?.displayName || "简易木棒",
                count: 1,
                icon: meta?.icon || this.resolveFallbackIcon("wood_club"),
            },
        ]);
    }

    private hasActiveItem(itemId: string): boolean {
        const items = this.inventory.getInventorySnapshot();
        for (let i = 0; i < items.length; i++) {
            if (items[i]?.itemId === itemId) {
                return true;
            }
        }

        return false;
    }
}
