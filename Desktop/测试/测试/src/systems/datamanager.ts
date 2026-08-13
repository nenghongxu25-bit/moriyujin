import { ItemDataManager, type ItemMeta, type ItemTableFile } from "./data/ItemDataManager";
import { HarvestManager, type HarvestDropConfig, type HarvestResultItem, type HarvestTableFile } from "./data/HarvestManager";
import { InventoryManager } from "./data/InventoryManager";
import type { BagView, InventoryBucket, InventoryScope, InventoryViewItem } from "./data/InventoryTypes";
import { SaveManager } from "./data/SaveManager";
import { WarehouseManager } from "./data/WarehouseManager";

export type { InventoryViewItem, InventoryBucket, InventoryScope, BagView, HarvestDropConfig, HarvestResultItem, ItemMeta };

export class DataManager {
    private static instance: DataManager | null = null;

    private readonly items = new ItemDataManager();
    private readonly save = new SaveManager();
    private readonly inventory = new InventoryManager(this.save);
    private readonly warehouse = new WarehouseManager(this.save);
    private readonly harvest = new HarvestManager(this.items);
    private loaded: boolean = false;

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
            return;
        }

        const [materials, foods, harvest] = await Promise.all([
            this.loadJson<ItemTableFile>("assets/config/items/materials.json"),
            this.loadJson<ItemTableFile>("assets/config/items/foods.json"),
            this.loadJson<HarvestTableFile>("assets/config/harvest/drops.json"),
        ]);

        this.items.registerItemTable(materials);
        this.items.registerItemTable(foods);
        this.harvest.registerHarvestTable(harvest);
        this.inventory.loadPersistedInventories();
        this.warehouse.load();
        this.loaded = true;
    }

    public enterScene(sceneUrl: string): void {
        this.inventory.enterScene(sceneUrl);
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

    public formatHarvestResults(results: HarvestResultItem[]): string {
        return this.harvest.formatHarvestResults(results);
    }

    public getInventorySnapshot(bucket: InventoryBucket = "active"): InventoryViewItem[] {
        return this.inventory.getInventorySnapshot(bucket);
    }

    public getWarehouseSnapshot(): InventoryViewItem[] {
        return this.warehouse.getSnapshot();
    }

    public registerBagView(view: BagView): void {
        this.inventory.registerBagView(view);
    }

    public unregisterBagView(view: BagView): void {
        this.inventory.unregisterBagView(view);
    }

    public resolveItemMeta(itemId: string): ItemMeta | null {
        return this.items.resolveItemMeta(itemId);
    }

    public transferItem(sourceBucket: InventoryBucket, targetBucket: InventoryBucket, itemId: string): boolean {
        if (sourceBucket === targetBucket) {
            return false;
        }

        if (sourceBucket === "active" && targetBucket === "warehouse") {
            const item = this.inventory.removeItemFromActive(itemId);
            if (!item) {
                return false;
            }

            this.warehouse.addItem(item);
            return true;
        }

        if (sourceBucket === "warehouse" && targetBucket === "active") {
            const item = this.warehouse.removeItem(itemId);
            if (!item) {
                return false;
            }

            this.inventory.addItemToActive(item.itemId || itemId, item.name, item.count, item.icon);
            return true;
        }

        return false;
    }

    private async loadJson<T>(url: string): Promise<T> {
        return (await Laya.loader.load(url, null, null, Laya.Loader.JSON)) as T;
    }
}