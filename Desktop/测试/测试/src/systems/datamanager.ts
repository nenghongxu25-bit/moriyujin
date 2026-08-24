import { CraftingManager, type CraftingIngredient, type CraftingOutput, type CraftingRecipeDefinition, type CraftingStationId } from "./data/CraftingManager";
import { ItemDataManager, type ItemMeta, type ItemTableFile } from "./data/ItemDataManager";
import { HarvestManager, type HarvestDropConfig, type HarvestResultItem, type HarvestTableFile } from "./data/HarvestManager";
import { InventoryManager } from "./data/InventoryManager";
import type { BagView, EquippedItem, EquipmentSlotType, InventoryBucket, InventoryScope, InventorySlotItem, InventoryViewItem, WarehouseView } from "./data/InventoryTypes";
import { MailManager } from "./data/MailManager";
import { SaveManager } from "./data/SaveManager";
import { SignInManager, type SignInRewardDefinition, type SignInRewardView, type SignInUnlockPreview } from "./data/SignInManager";
import { WarehouseManager } from "./data/WarehouseManager";

export type { InventoryViewItem, InventoryBucket, InventoryScope, BagView, WarehouseView, HarvestDropConfig, HarvestResultItem, ItemMeta, InventorySlotItem, EquippedItem, EquipmentSlotType, SignInRewardView, SignInUnlockPreview, CraftingRecipeDefinition, CraftingStationId };

export interface PlayerStatsSnapshot {
    level: number;
    currentHp: number;
    maxHp: number;
    currentStamina: number;
    maxStamina: number;
    experience: number;
    nextLevelExperience: number;
}

export class DataManager {
    private static readonly RESET_SAVE_ON_STARTUP = false;
    private static readonly EQUIPMENT_STORAGE_KEY = "laya_test_equipment_v1";
    private static readonly PLAYER_STATS_STORAGE_KEY = "laya_test_player_stats_v1";
    private static saveResetApplied: boolean = false;
    private static instance: DataManager | null = null;

    private readonly items = new ItemDataManager();
    private readonly save = new SaveManager();
    private readonly inventory = new InventoryManager(this.save);
    private readonly warehouse = new WarehouseManager(this.save);
    private readonly harvest = new HarvestManager(this.items);
    private readonly crafting = new CraftingManager();
    private readonly signIn = new SignInManager(this.save);
    private readonly warehouseViews: Set<WarehouseView> = new Set();
    private readonly equippedItems: Record<EquipmentSlotType, EquippedItem | null> = {
        insertPlate: null,
        helmet: null,
        weapon: null,
        armor: null,
    };
    private playerStats: PlayerStatsSnapshot = {
        level: 1,
        currentHp: 100,
        maxHp: 100,
        currentStamina: 100,
        maxStamina: 100,
        experience: 0,
        nextLevelExperience: 200,
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
        this.resetDevelopmentSaveOnStartup();

        if (this.loaded) {
            this.inventory.loadPersistedInventories();
            this.warehouse.load();
            this.loadEquipment();
            this.loadPlayerStats();
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
            this.loadPlayerStats();
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

    public returnToBaseAfterDeath(sceneUrl: string): void {
        this.playerStats.currentHp = this.playerStats.maxHp;
        this.playerStats.currentStamina = this.playerStats.maxStamina;
        this.savePlayerStats();
        this.inventory.returnToBaseAfterDeath(sceneUrl);
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

    public canGrantItemsToWarehouse(items: Array<{ itemId: string; name?: string; count: number; icon?: string }>): boolean {
        return this.warehouse.canAddItems(this.resolveWarehouseGrantItems(items));
    }

    public grantItemsToWarehouse(items: Array<{ itemId: string; name?: string; count: number; icon?: string }>): boolean {
        const resolvedItems = this.resolveWarehouseGrantItems(items);
        if (!this.warehouse.canAddItems(resolvedItems)) {
            return false;
        }

        for (let i = 0; i < resolvedItems.length; i++) {
            this.warehouse.addItem(resolvedItems[i]);
        }

        this.syncWarehouseViews();
        return true;
    }

    private resolveWarehouseGrantItems(items: Array<{ itemId: string; name?: string; count: number; icon?: string }>): Array<{ itemId: string; name: string; count: number; icon?: string }> {
        const resolvedItems: Array<{ itemId: string; name: string; count: number; icon?: string }> = [];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item || !item.itemId || !Number.isFinite(item.count) || item.count <= 0) {
                continue;
            }

            const meta = this.resolveItemMeta(item.itemId);
            resolvedItems.push({
                itemId: item.itemId,
                name: this.resolveDisplayName(item.itemId, item.name),
                count: Math.floor(item.count),
                icon: item.icon || meta?.icon || this.items.resolveFallbackIcon(item.itemId),
            });
        }

        return resolvedItems;
    }

    public formatHarvestResults(results: HarvestResultItem[]): string {
        return this.harvest.formatHarvestResults(results);
    }

    public getPlayerStats(): PlayerStatsSnapshot {
        return { ...this.playerStats };
    }

    public setPlayerHp(currentHp: number, maxHp: number = this.playerStats.maxHp): void {
        const nextMaxHp = this.normalizePositiveInt(maxHp, this.playerStats.maxHp || 100);
        const nextCurrentHp = Math.max(0, Math.min(nextMaxHp, this.normalizeInt(currentHp, nextMaxHp)));
        if (this.playerStats.currentHp === nextCurrentHp && this.playerStats.maxHp === nextMaxHp) {
            return;
        }

        this.playerStats = {
            ...this.playerStats,
            currentHp: nextCurrentHp,
            maxHp: nextMaxHp,
        };
        this.savePlayerStats();
        this.inventory.refreshBagViews();
    }

    public setPlayerStamina(currentStamina: number, maxStamina: number = this.playerStats.maxStamina): void {
        const nextMaxStamina = this.normalizePositiveInt(maxStamina, this.playerStats.maxStamina || 100);
        const nextCurrentStamina = Math.max(0, Math.min(nextMaxStamina, this.normalizeInt(currentStamina, nextMaxStamina)));
        if (this.playerStats.currentStamina === nextCurrentStamina && this.playerStats.maxStamina === nextMaxStamina) {
            return;
        }

        this.playerStats = {
            ...this.playerStats,
            currentStamina: nextCurrentStamina,
            maxStamina: nextMaxStamina,
        };
        this.savePlayerStats();
    }

    public grantGatherExperience(): void {
        this.grantPlayerExperience(1);
    }

    public grantEnemyDefeatExperience(): void {
        this.grantPlayerExperience(1);
    }

    public grantPlayerExperience(amount: number): void {
        const value = Number.isFinite(amount) ? Math.floor(amount) : 0;
        if (value <= 0) {
            return;
        }

        let leveledUp = false;
        this.playerStats.experience += value;
        while (this.playerStats.experience >= this.playerStats.nextLevelExperience) {
            this.playerStats.experience -= this.playerStats.nextLevelExperience;
            this.playerStats.level += 1;
            this.playerStats.maxHp += 10;
            this.playerStats.currentHp = this.playerStats.maxHp;
            this.playerStats.nextLevelExperience += 50;
            leveledUp = true;
        }

        if (leveledUp) {
            this.playerStats.currentHp = Math.min(this.playerStats.currentHp, this.playerStats.maxHp);
        }

        this.savePlayerStats();
        this.inventory.refreshBagViews();
    }

    public getInventorySnapshot(bucket: InventoryBucket = "active"): InventorySlotItem[] {
        return bucket === "warehouse" ? this.warehouse.getSnapshot() : this.inventory.getInventorySnapshot();
    }

    public getWarehouseSnapshot(): InventorySlotItem[] {
        return this.warehouse.getSnapshot();
    }

    public getSignInRewards(): SignInRewardView[] {
        return this.signIn.getRewardViews((reward) => this.resolveSignInRewardView(reward));
    }

    public previewSignInUnlock(startDayKey: string, now: Date): SignInUnlockPreview {
        return this.signIn.previewUnlock(startDayKey, now);
    }

    public getCurrentSignInDayKey(): string {
        return this.signIn.getCurrentDayKey();
    }

    public async syncSignInTimeSource(): Promise<void> {
        await this.signIn.syncTimeSource();
    }

    public getCraftingRecipes(station: CraftingStationId): CraftingRecipeDefinition[] {
        return this.crafting.getRecipesByStation(station).map((recipe) => this.resolveCraftingRecipe(recipe));
    }

    public getCraftingRecipe(recipeId: string): CraftingRecipeDefinition | null {
        const recipe = this.crafting.getRecipe(recipeId);
        return recipe ? this.resolveCraftingRecipe(recipe) : null;
    }

    public claimSignInReward(day: number): boolean {
        const reward = this.signIn.claim(day);
        if (!reward) {
            return false;
        }

        const resolved = this.resolveSignInRewardView(reward);
        MailManager.getInstance().addSignInRewardMail(resolved.day, [
            {
                itemId: resolved.itemId,
                name: resolved.name,
                count: resolved.count,
                icon: resolved.icon,
            },
        ]);
        return true;
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

    public moveWarehouseSlot(sourceSlotIndex: number, targetSlotIndex: number): boolean {
        const moved = this.warehouse.moveSlot(sourceSlotIndex, targetSlotIndex);
        if (moved) {
            this.syncWarehouseViews();
        }

        return moved;
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

    private resetDevelopmentSaveOnStartup(): void {
        if (!DataManager.RESET_SAVE_ON_STARTUP || DataManager.saveResetApplied) {
            return;
        }

        DataManager.saveResetApplied = true;
        this.save.removeItems([
            InventoryManager.BASE_STORAGE_KEY,
            WarehouseManager.STORAGE_KEY,
            WarehouseManager.META_STORAGE_KEY,
            DataManager.EQUIPMENT_STORAGE_KEY,
            DataManager.PLAYER_STATS_STORAGE_KEY,
            "laya_test_sign_in_v1",
            "laya_test_mail_v1",
        ]);
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

    private resolveSignInRewardView(reward: SignInRewardDefinition): SignInRewardView {
        const meta = this.resolveItemMeta(reward.itemId);
        const icon = reward.icon || meta?.icon || this.resolveFallbackIcon(reward.itemId);
        return {
            day: reward.day,
            itemId: reward.itemId,
            name: this.resolveDisplayName(reward.itemId, reward.name),
            count: reward.count,
            icon,
            state: "locked",
        };
    }

    private resolveCraftingRecipe(recipe: CraftingRecipeDefinition): CraftingRecipeDefinition {
        return {
            ...recipe,
            inputs: recipe.inputs.map((item) => this.resolveCraftingIngredient(item)),
            output: this.resolveCraftingOutput(recipe.output),
        };
    }

    private resolveCraftingIngredient(item: CraftingIngredient): CraftingIngredient {
        const meta = this.resolveItemMeta(item.itemId);
        return {
            itemId: item.itemId,
            name: this.resolveDisplayName(item.itemId, item.name),
            count: item.count,
            icon: item.icon || meta?.icon || this.resolveFallbackIcon(item.itemId),
        };
    }

    private resolveCraftingOutput(item: CraftingOutput): CraftingOutput {
        const meta = this.resolveItemMeta(item.itemId);
        return {
            itemId: item.itemId,
            name: this.resolveDisplayName(item.itemId, item.name),
            count: item.count,
            icon: item.icon || meta?.icon || this.resolveFallbackIcon(item.itemId),
        };
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

    private loadPlayerStats(): void {
        const stored = this.save.loadJson<Partial<PlayerStatsSnapshot>>(DataManager.PLAYER_STATS_STORAGE_KEY);
        if (!stored) {
            this.playerStats = {
                level: 1,
                currentHp: 100,
                maxHp: 100,
                currentStamina: 100,
                maxStamina: 100,
                experience: 0,
                nextLevelExperience: 200,
            };
            this.savePlayerStats();
            return;
        }

        const level = this.normalizePositiveInt(stored.level, 1);
        const maxHp = this.normalizePositiveInt(stored.maxHp, 100);
        const maxStamina = this.normalizePositiveInt(stored.maxStamina, 100);
        this.playerStats = {
            level,
            maxHp,
            currentHp: Math.min(maxHp, this.normalizePositiveInt(stored.currentHp, maxHp)),
            maxStamina,
            currentStamina: Math.max(0, Math.min(maxStamina, this.normalizeInt(stored.currentStamina, maxStamina))),
            experience: Math.max(0, this.normalizeInt(stored.experience, 0)),
            nextLevelExperience: this.normalizePositiveInt(stored.nextLevelExperience, 200 + Math.max(0, level - 1) * 50),
        };
    }

    private savePlayerStats(): void {
        this.save.saveJson(DataManager.PLAYER_STATS_STORAGE_KEY, this.playerStats);
    }

    private normalizePositiveInt(value: unknown, fallback: number): number {
        const normalized = this.normalizeInt(value, fallback);
        return normalized > 0 ? normalized : fallback;
    }

    private normalizeInt(value: unknown, fallback: number): number {
        const next = Number(value);
        return Number.isFinite(next) ? Math.floor(next) : fallback;
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
