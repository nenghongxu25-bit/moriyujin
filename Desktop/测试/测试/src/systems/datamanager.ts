import { CraftingManager, type CraftingIngredient, type CraftingOutput, type CraftingRecipeDefinition, type CraftingStationId } from "./data/CraftingManager";
import { ItemDataManager, type ItemMeta, type ItemTableFile } from "./data/ItemDataManager";
import { HarvestManager, type HarvestDropConfig, type HarvestResultItem, type HarvestTableFile } from "./data/HarvestManager";
import { InventoryManager } from "./data/InventoryManager";
import type { BagView, EquippedItem, EquipmentSlotType, InventoryBucket, InventoryScope, InventorySlotItem, InventoryViewItem, QuickSlotView, WarehouseView } from "./data/InventoryTypes";
import { MailManager } from "./data/MailManager";
import { QuickMakeManager, type QuickMakeRecipeDefinition } from "./data/QuickMakeManager";
import { SaveManager } from "./data/SaveManager";
import { SignInManager, type SignInRewardDefinition, type SignInRewardView, type SignInUnlockPreview } from "./data/SignInManager";
import { WarehouseManager } from "./data/WarehouseManager";

export type { InventoryViewItem, InventoryBucket, InventoryScope, BagView, QuickSlotView, WarehouseView, HarvestDropConfig, HarvestResultItem, ItemMeta, InventorySlotItem, EquippedItem, EquipmentSlotType, SignInRewardView, SignInUnlockPreview, CraftingRecipeDefinition, CraftingStationId, QuickMakeRecipeDefinition };

export interface CraftResult {
    success: boolean;
    message: string;
}

export interface QuickSlotUseResult {
    success: boolean;
    usedItem?: boolean;
    changedWeapon?: boolean;
}

interface WarehouseRecipePayload {
    inputs: CraftingIngredient[];
    output: CraftingOutput;
}
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
    private static readonly QUICK_SLOT_STORAGE_KEY = "laya_test_quick_slots_v1";
    private static saveResetApplied: boolean = false;
    private static instance: DataManager | null = null;

    private readonly items = new ItemDataManager();
    private readonly save = new SaveManager();
    private readonly inventory = new InventoryManager(this.save);
    private readonly warehouse = new WarehouseManager(this.save);
    private readonly harvest = new HarvestManager(this.items);
    private readonly crafting = new CraftingManager();
    private readonly quickMake = new QuickMakeManager();
    private readonly signIn = new SignInManager(this.save);
    private readonly warehouseViews: Set<WarehouseView> = new Set();
    private readonly quickSlotViews: Set<QuickSlotView> = new Set();
    private readonly quickSlotItems: InventorySlotItem[] = [null, null, null, null];
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
            this.loadQuickSlots();
            this.ensureStarterItems();
            return;
        }

        if (this.loading) {
            return;
        }

        this.loading = true;

        try {
            const [materials, foods, weapons, misc, medicines, harvest] = await Promise.all([
                this.loadJson<ItemTableFile>("config/items/materials.json", "assets/config/items/materials.json"),
                this.loadJson<ItemTableFile>("config/items/foods.json", "assets/config/items/foods.json"),
                this.loadJson<ItemTableFile>("config/items/weapons.json", "assets/config/items/weapons.json"),
                this.loadJson<ItemTableFile>("config/items/misc.json", "assets/config/items/misc.json"),
                this.loadJson<ItemTableFile>("config/items/medicines.json", "assets/config/items/medicines.json"),
                this.loadJson<HarvestTableFile>("config/harvest/drops.json", "assets/config/harvest/drops.json"),
            ]);

            this.items.registerItemTable(materials);
            this.items.registerItemTable(foods);
            this.items.registerItemTable(weapons);
            this.items.registerItemTable(misc);
            this.items.registerItemTable(medicines);
            this.harvest.registerHarvestTable(harvest);
            this.inventory.loadPersistedInventories();
            this.warehouse.load();
            this.loadEquipment();
            this.loadPlayerStats();
            this.loadQuickSlots();
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
        this.clearQuickSlots();
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

        this.refreshQuickSlotViews();
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
        this.refreshQuickSlotViews();
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
        this.clearQuickSlotsForMissingItems();
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

    public discardActiveSlot(slotIndex: number): boolean {
        const removed = this.inventory.removeActiveSlot(slotIndex);
        if (removed?.itemId) {
            this.clearQuickSlotsForMissingItems();
        }
        return !!removed;
    }

    public useActiveItemAtSlot(slotIndex: number): boolean {
        const snapshot = this.inventory.getInventorySnapshot();
        const index = Number.isFinite(slotIndex) ? Math.floor(slotIndex) : -1;
        const item = index >= 0 ? snapshot[index] : null;
        const itemId = String(item?.itemId || "");
        if (!item || !itemId || !this.canUseItem(itemId)) {
            return false;
        }

        const consumed = this.inventory.consumeActiveSlotItem(index, 1);
        if (!consumed) {
            return false;
        }

        const healAmount = this.resolveUseHealAmount(consumed.itemId || "");
        if (healAmount > 0) {
            this.setPlayerHp(this.playerStats.currentHp + healAmount, this.playerStats.maxHp);
        }

        this.clearQuickSlotsForMissingItems();
        return true;
    }

    public canUseItem(itemId: string): boolean {
        const meta = this.resolveItemMeta(itemId);
        const category = String(meta?.category || "").toLowerCase();
        const subCategory = String(meta?.subCategory || "").toLowerCase();
        return category === "foods"
            || category === "medicines"
            || subCategory.includes("food")
            || subCategory.includes("medicine")
            || itemId === "bandage"
            || itemId === "kangfuyao";
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

    public getQuickSlotItems(): InventorySlotItem[] {
        return this.quickSlotItems.map((item) => (item ? { ...item } : null));
    }

    public canAssignItemToQuickSlot(itemId: string): boolean {
        const meta = this.resolveItemMeta(itemId);
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

    public assignActiveItemToQuickSlot(quickSlotIndex: number, itemId: string): boolean {
        const inventory = this.inventory.getInventorySnapshot();
        for (let i = 0; i < inventory.length; i++) {
            const item = inventory[i];
            if (item && item.itemId === itemId) {
                return this.assignActiveSlotToQuickSlot(quickSlotIndex, i);
            }
        }

        return false;
    }

    public assignActiveSlotToQuickSlot(quickSlotIndex: number, activeSlotIndex: number): boolean {
        const index = this.normalizeQuickSlotIndex(quickSlotIndex);
        const slotIndex = Number.isFinite(activeSlotIndex) ? Math.floor(activeSlotIndex) : -1;
        const activeItems = this.inventory.getInventorySnapshot();
        const sourceItem = slotIndex >= 0 ? activeItems[slotIndex] : null;
        const itemId = String(sourceItem?.itemId || "");
        if (index < 0 || slotIndex < 0 || !sourceItem || !itemId || !this.canAssignItemToQuickSlot(itemId)) {
            return false;
        }

        const removed = this.inventory.removeActiveSlot(slotIndex);
        if (!removed) {
            return false;
        }

        const previousQuickItem = this.quickSlotItems[index];
        this.quickSlotItems[index] = removed;
        if (previousQuickItem) {
            this.inventory.placeItemInBucket("active", slotIndex, previousQuickItem);
        }

        this.saveQuickSlots();
        this.refreshQuickSlotViews();
        return true;
    }

    public clearQuickSlot(quickSlotIndex: number): boolean {
        const index = this.normalizeQuickSlotIndex(quickSlotIndex);
        if (index < 0 || !this.quickSlotItems[index]) {
            return false;
        }

        this.quickSlotItems[index] = null;
        this.saveQuickSlots();
        this.refreshQuickSlotViews();
        return true;
    }

    public moveQuickSlot(sourceQuickSlotIndex: number, targetQuickSlotIndex: number): boolean {
        const sourceIndex = this.normalizeQuickSlotIndex(sourceQuickSlotIndex);
        const targetIndex = this.normalizeQuickSlotIndex(targetQuickSlotIndex);
        if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
            return false;
        }

        const sourceItem = this.quickSlotItems[sourceIndex];
        if (!sourceItem) {
            return false;
        }

        this.quickSlotItems[sourceIndex] = this.quickSlotItems[targetIndex] || null;
        this.quickSlotItems[targetIndex] = sourceItem;
        this.saveQuickSlots();
        this.refreshQuickSlotViews();
        return true;
    }

    public moveQuickSlotToActiveSlot(sourceQuickSlotIndex: number, targetActiveSlotIndex: number): boolean {
        const sourceIndex = this.normalizeQuickSlotIndex(sourceQuickSlotIndex);
        const targetIndex = Number.isFinite(targetActiveSlotIndex) ? Math.floor(targetActiveSlotIndex) : -1;
        if (sourceIndex < 0 || targetIndex < 0) {
            return false;
        }

        const sourceItem = this.quickSlotItems[sourceIndex];
        if (!sourceItem) {
            return false;
        }

        const previousActiveItem = this.inventory.swapActiveSlotItem(targetIndex, sourceItem);
        if (previousActiveItem && !this.canAssignItemToQuickSlot(previousActiveItem.itemId || "")) {
            this.inventory.swapActiveSlotItem(targetIndex, previousActiveItem);
            return false;
        }

        this.quickSlotItems[sourceIndex] = previousActiveItem || null;
        this.saveQuickSlots();
        this.refreshQuickSlotViews();
        return true;
    }

    public moveQuickSlotToEquipment(sourceQuickSlotIndex: number, targetSlot: EquipmentSlotType): boolean {
        const sourceIndex = this.normalizeQuickSlotIndex(sourceQuickSlotIndex);
        if (sourceIndex < 0) {
            return false;
        }

        const sourceItem = this.quickSlotItems[sourceIndex];
        const itemId = String(sourceItem?.itemId || "");
        if (!sourceItem || !this.canEquipItemToSlot(itemId, targetSlot)) {
            return false;
        }

        const previousEquipment = this.equippedItems[targetSlot];
        this.equippedItems[targetSlot] = {
            itemId,
            name: this.resolveDisplayName(itemId, sourceItem.name),
            count: 1,
            icon: sourceItem.icon || this.resolveItemMeta(itemId)?.icon || this.resolveFallbackIcon(itemId),
        };
        this.quickSlotItems[sourceIndex] = previousEquipment ? { ...previousEquipment } : null;
        this.saveEquipment();
        this.saveQuickSlots();
        this.refreshQuickSlotViews();
        return true;
    }

    public activateQuickSlot(quickSlotIndex: number): QuickSlotUseResult {
        const index = this.normalizeQuickSlotIndex(quickSlotIndex);
        if (index < 0) {
            return { success: false };
        }

        const item = this.quickSlotItems[index];
        const itemId = String(item?.itemId || "").trim();
        if (!item || !itemId) {
            this.clearQuickSlot(index);
            return { success: false };
        }

        if (this.canEquipItemToSlot(itemId, "weapon")) {
            return this.switchWeaponWithQuickSlot(index, itemId);
        }

        if (this.canUseItem(itemId)) {
            return this.useItemFromQuickSlot(index, itemId);
        }

        return { success: false };
    }

    public getWarehouseSnapshot(): InventorySlotItem[] {
        return this.warehouse.getSnapshot();
    }

    public getAvailableItemCount(itemId: string): number {
        return this.inventory.getItemCount(itemId) + this.warehouse.getItemCount(itemId);
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

    public getQuickMakeRecipes(): QuickMakeRecipeDefinition[] {
        return this.quickMake.getRecipes().map((recipe) => this.resolveQuickMakeRecipe(recipe));
    }

    public getQuickMakeRecipe(recipeId: string): QuickMakeRecipeDefinition | null {
        const recipe = this.quickMake.getRecipe(recipeId);
        return recipe ? this.resolveQuickMakeRecipe(recipe) : null;
    }

    public canQuickMakeToWarehouse(recipeId: string): boolean {
        const recipe = this.getQuickMakeRecipe(recipeId);
        if (!recipe) {
            return false;
        }

        return this.canRecipeToWarehouse(recipe);
    }

    public quickMakeToWarehouse(recipeId: string): CraftResult {
        const recipe = this.getQuickMakeRecipe(recipeId);
        if (!recipe) {
            return { success: false, message: "\u914d\u65b9\u4e0d\u5b58\u5728" };
        }

        return this.makeRecipeToWarehouse(recipe);
    }

    public canCraftToWarehouse(recipeId: string): boolean {
        const recipe = this.getCraftingRecipe(recipeId);
        if (!recipe) {
            return false;
        }

        return this.canRecipeToWarehouse(recipe);
    }

    public craftToWarehouse(recipeId: string): CraftResult {
        const recipe = this.getCraftingRecipe(recipeId);
        if (!recipe) {
            return { success: false, message: "\u914d\u65b9\u4e0d\u5b58\u5728" };
        }

        return this.makeRecipeToWarehouse(recipe);
    }

    private canRecipeToWarehouse(recipe: WarehouseRecipePayload | null): boolean {
        if (!recipe) {
            return false;
        }

        return this.hasIngredientsInActiveAndWarehouse(recipe.inputs) && this.canGrantItemsToWarehouse([recipe.output]);
    }

    private makeRecipeToWarehouse(recipe: WarehouseRecipePayload | null): CraftResult {
        if (!recipe) {
            return { success: false, message: "\u914d\u65b9\u4e0d\u5b58\u5728" };
        }

        if (!this.hasIngredientsInActiveAndWarehouse(recipe.inputs)) {
            return { success: false, message: "\u6750\u6599\u4e0d\u8db3\uff0c\u4e0d\u8fdb\u884c\u5236\u9020" };
        }

        if (!this.canGrantItemsToWarehouse([recipe.output])) {
            return { success: false, message: "\u4ed3\u5e93\u7a7a\u95f4\u4e0d\u8db3" };
        }

        if (!this.consumeIngredientsFromActiveAndWarehouse(recipe.inputs)) {
            return { success: false, message: "\u6750\u6599\u4e0d\u8db3\uff0c\u4e0d\u8fdb\u884c\u5236\u9020" };
        }

        if (!this.grantItemsToWarehouse([recipe.output])) {
            return { success: false, message: "\u4ed3\u5e93\u7a7a\u95f4\u4e0d\u8db3" };
        }

        return {
            success: true,
            message: `\u83b7\u5f97${recipe.output.name || recipe.output.itemId}*${Math.max(0, Math.floor(recipe.output.count || 0))}`,
        };
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

    public registerQuickSlotView(view: QuickSlotView): void {
        this.quickSlotViews.add(view);
        view.refreshQuickSlots(this.getQuickSlotItems());
        if (!this.loaded) {
            void this.loadAll();
        }
    }

    public unregisterQuickSlotView(view: QuickSlotView): void {
        this.quickSlotViews.delete(view);
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

    public resolveEquipmentSlotForItem(itemId: string): EquipmentSlotType | null {
        const slots: EquipmentSlotType[] = ["weapon", "insertPlate", "helmet", "armor"];
        for (let i = 0; i < slots.length; i++) {
            const slot = slots[i];
            if (this.canEquipItemToSlot(itemId, slot)) {
                return slot;
            }
        }

        return null;
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
        this.clearQuickSlotsForMissingItems();
        return true;
    }

    private resolveUseHealAmount(itemId: string): number {
        const normalizedItemId = String(itemId || "").trim();
        if (normalizedItemId === "bandage") {
            return 25;
        }

        if (normalizedItemId === "kangfuyao") {
            return 50;
        }

        const meta = this.resolveItemMeta(normalizedItemId);
        const category = String(meta?.category || "").toLowerCase();
        if (category === "foods") {
            return 10;
        }

        return 0;
    }

    public unequipItemToActive(slot: EquipmentSlotType): boolean {
        const item = this.equippedItems[slot];
        if (!item) {
            return false;
        }

        this.equippedItems[slot] = null;
        this.inventory.addItemToActive(item.itemId, item.name, item.count, item.icon);
        this.saveEquipment();
        this.refreshQuickSlotViews();
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

    private useItemFromQuickSlot(quickSlotIndex: number, itemId: string): QuickSlotUseResult {
        const item = this.quickSlotItems[quickSlotIndex];
        if (!item || item.itemId !== itemId || item.count <= 0) {
            this.clearQuickSlot(quickSlotIndex);
            return { success: false };
        }

        item.count = Math.max(0, Math.floor(item.count || 0) - 1);
        if (item.count <= 0) {
            this.quickSlotItems[quickSlotIndex] = null;
        }

        const healAmount = this.resolveUseHealAmount(itemId);
        if (healAmount > 0) {
            this.setPlayerHp(this.playerStats.currentHp + healAmount, this.playerStats.maxHp);
        }

        this.saveQuickSlots();
        this.refreshQuickSlotViews();
        return { success: true, usedItem: true };
    }

    private switchWeaponWithQuickSlot(quickSlotIndex: number, itemId: string): QuickSlotUseResult {
        if (!this.canEquipItemToSlot(itemId, "weapon")) {
            return { success: false };
        }

        const nextItem = this.quickSlotItems[quickSlotIndex];
        if (!nextItem || nextItem.itemId !== itemId) {
            this.clearQuickSlot(quickSlotIndex);
            return { success: false };
        }

        const previousWeapon = this.equippedItems.weapon;
        this.equippedItems.weapon = {
            itemId: nextItem.itemId,
            name: this.resolveDisplayName(nextItem.itemId, nextItem.name),
            count: 1,
            icon: nextItem.icon || this.resolveItemMeta(nextItem.itemId)?.icon || this.resolveFallbackIcon(nextItem.itemId),
        };

        if (previousWeapon) {
            this.quickSlotItems[quickSlotIndex] = { ...previousWeapon };
        } else {
            this.quickSlotItems[quickSlotIndex] = null;
        }

        this.saveEquipment();
        this.saveQuickSlots();
        this.refreshQuickSlotViews();
        return { success: true, changedWeapon: true };
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
                    this.refreshQuickSlotViews();
                }
                return success;
            }

            this.inventory.addItemToActive(item.itemId || itemId, item.name, item.count, item.icon);
            this.syncWarehouseViews();
            this.refreshQuickSlotViews();
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
            const raw = await Laya.loader.load(url, undefined, undefined, Laya.Loader.JSON);
            const data = this.normalizeLoadedJson<T>(raw, url);
            return data;
        } catch (error) {
            if (!fallbackUrl) {
                throw error;
            }

            const raw = await Laya.loader.load(fallbackUrl, undefined, undefined, Laya.Loader.JSON);
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

    private hasIngredientsInActiveAndWarehouse(ingredients: CraftingIngredient[]): boolean {
        const requirements = this.mergeCraftingIngredients(ingredients);
        for (let i = 0; i < requirements.length; i++) {
            const item = requirements[i];
            const available = this.inventory.getItemCount(item.itemId) + this.warehouse.getItemCount(item.itemId);
            if (available < item.count) {
                return false;
            }
        }

        return true;
    }

    private consumeIngredientsFromActiveAndWarehouse(ingredients: CraftingIngredient[]): boolean {
        if (!this.hasIngredientsInActiveAndWarehouse(ingredients)) {
            return false;
        }

        const requirements = this.mergeCraftingIngredients(ingredients);
        for (let i = 0; i < requirements.length; i++) {
            const item = requirements[i];
            let remaining = item.count;
            remaining -= this.inventory.consumeItem(item.itemId, remaining);
            if (remaining > 0) {
                remaining -= this.warehouse.consumeItem(item.itemId, remaining);
            }

            if (remaining > 0) {
                return false;
            }
        }

        this.syncWarehouseViews();
        return true;
    }

    private mergeCraftingIngredients(ingredients: CraftingIngredient[]): CraftingIngredient[] {
        const merged: Record<string, CraftingIngredient> = {};
        for (let i = 0; i < ingredients.length; i++) {
            const item = ingredients[i];
            const itemId = String(item?.itemId || "").trim();
            const count = Number.isFinite(item?.count) ? Math.max(0, Math.floor(item.count)) : 0;
            if (!itemId || count <= 0) {
                continue;
            }

            if (!merged[itemId]) {
                merged[itemId] = { ...item, itemId, count: 0 };
            }
            merged[itemId].count += count;
        }

        return Object.keys(merged).map((itemId) => merged[itemId]);
    }
    private resolveCraftingRecipe(recipe: CraftingRecipeDefinition): CraftingRecipeDefinition {
        return {
            ...recipe,
            inputs: recipe.inputs.map((item) => this.resolveCraftingIngredient(item)),
            output: this.resolveCraftingOutput(recipe.output),
        };
    }

    private resolveQuickMakeRecipe(recipe: QuickMakeRecipeDefinition): QuickMakeRecipeDefinition {
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

    private refreshQuickSlotViews(): void {
        const items = this.getQuickSlotItems();
        this.quickSlotViews.forEach((view) => view.refreshQuickSlots(items));
    }

    private clearQuickSlots(): void {
        let changed = false;
        for (let i = 0; i < this.quickSlotItems.length; i++) {
            if (this.quickSlotItems[i]) {
                this.quickSlotItems[i] = null;
                changed = true;
            }
        }

        if (changed) {
            this.saveQuickSlots();
        }
        this.refreshQuickSlotViews();
    }

    private clearQuickSlotsForMissingItems(): void {
        let changed = false;
        for (let i = 0; i < this.quickSlotItems.length; i++) {
            const item = this.quickSlotItems[i];
            if (item && (!item.itemId || item.count <= 0 || !this.canAssignItemToQuickSlot(item.itemId))) {
                this.quickSlotItems[i] = null;
                changed = true;
            }
        }

        if (changed) {
            this.saveQuickSlots();
        }
        this.refreshQuickSlotViews();
    }

    private loadQuickSlots(): void {
        const stored = this.save.loadJson<Array<InventorySlotItem | string>>(DataManager.QUICK_SLOT_STORAGE_KEY);
        for (let i = 0; i < this.quickSlotItems.length; i++) {
            const storedItem = Array.isArray(stored) ? stored[i] : null;
            if (typeof storedItem === "string") {
                this.quickSlotItems[i] = null;
                continue;
            }

            const item = storedItem || null;
            const itemId = String(item?.itemId || "").trim();
            const rawCount = item ? item.count : 0;
            const count = Number.isFinite(rawCount) ? Math.max(0, Math.floor(rawCount)) : 0;
            this.quickSlotItems[i] = itemId && count > 0 && this.canAssignItemToQuickSlot(itemId)
                ? {
                      itemId,
                      name: this.resolveDisplayName(itemId, item?.name),
                      count,
                      icon: item?.icon || this.resolveItemMeta(itemId)?.icon || this.resolveFallbackIcon(itemId),
                  }
                : null;
        }
        this.clearQuickSlotsForMissingItems();
    }

    private saveQuickSlots(): void {
        this.save.saveJson(DataManager.QUICK_SLOT_STORAGE_KEY, this.quickSlotItems.map((item) => (item ? { ...item } : null)));
    }

    private normalizeQuickSlotIndex(slotIndex: number): number {
        const index = Number.isFinite(slotIndex) ? Math.floor(slotIndex) : -1;
        return index >= 0 && index < this.quickSlotItems.length ? index : -1;
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
        const starterItemIds = ["wood_club", "m16"];
        const missingItems: Array<{ itemId: string; name?: string; count: number; icon?: string }> = [];

        for (let i = 0; i < starterItemIds.length; i++) {
            const itemId = starterItemIds[i];
            if (this.hasActiveItem(itemId) || this.equippedItems.weapon?.itemId === itemId) {
                continue;
            }

            const meta = this.resolveItemMeta(itemId);
            missingItems.push({
                itemId,
                name: meta?.displayName || this.resolveFallbackName(itemId) || itemId,
                count: 1,
                icon: meta?.icon || this.resolveFallbackIcon(itemId),
            });
        }

        if (missingItems.length > 0) {
            this.grantItemsToActive(missingItems);
        }
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
