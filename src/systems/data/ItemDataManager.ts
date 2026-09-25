export interface ItemMeta {
    storageStates?: import('./ContainerPacking').PackingDefinition['storageStates'];
    container?: import('./ContainerPacking').PackingDefinition['container'];
    enabled?: boolean;
    id: string;
    category?: string;
    gridWidth?: number;
    gridHeight?: number;
    displayName: string;
    nameZh?: string;
    subCategory?: string;
    loadoutSlot?: import('./InventoryTypes').WeaponLoadoutSlot;
    icon?: string;
    stackMax?: number;
    consumable?: boolean;
    satiety?: number;
    hydration?: number;
    description?: string;
    attackPower?: number;
    attackSpeed?: number;
    bulletSpeed?: number;
    fireMode?: "auto" | "single";
    fireIntervalMs?: number;
    muzzleOffsetX?: number;
    muzzleOffsetY?: number;
    defense?: number;
    durability?: number;
    throwDamage?: number;
    blastRadius?: number;
    throwRange?: number;
    fuseMs?: number;
    useEffect?: ItemUseEffect;
}

export interface ItemTableFile {
    enabled?: boolean;
    category: string;
    items: Array<{
        storageStates?: import('./ContainerPacking').PackingDefinition['storageStates'];
        container?: import('./ContainerPacking').PackingDefinition['container'];
        enabled?: boolean;
        id: string;
        displayName: string;
        gridWidth?: number;
        gridHeight?: number;
        nameZh?: string;
        subCategory?: string;
        loadoutSlot?: import('./InventoryTypes').WeaponLoadoutSlot;
        icon?: string;
        stackMax?: number;
        consumable?: boolean;
        satiety?: number;
        hydration?: number;
        description?: string;
        attackPower?: number;
        attackSpeed?: number;
        bulletSpeed?: number;
        fireMode?: "auto" | "single";
        fireIntervalMs?: number;
        muzzleOffsetX?: number;
        muzzleOffsetY?: number;
        defense?: number;
        durability?: number;
        throwDamage?: number;
        blastRadius?: number;
        throwRange?: number;
        fuseMs?: number;
        useEffect?: ItemUseEffect;
    }>;
}

export interface ItemUseEffect {
    type: string;
    amount?: number;
}

export class ItemDataManager {
    private readonly itemMetaById: Map<string, ItemMeta> = new Map();

    public registerItemTable(table: ItemTableFile): void {
        if (!table || !Array.isArray(table.items)) {
            const type = typeof table;
            const keys = table && type === "object" ? Object.keys(table as any).join(",") : "";
            throw new Error(`Item table is invalid. type=${type} keys=${keys}`);
        }

        const items = table.items;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item || !item.id) {
                throw new Error(`Item table entry is invalid at index ${i}.`);
            }

            this.itemMetaById.set(item.id, {
                storageStates: item.storageStates,
                container: item.container,
                enabled: table.enabled !== false && item.enabled !== false,
                id: item.id,
                category: table.category,
                gridWidth: this.normalizeOptionalNumber(item.gridWidth),
                gridHeight: this.normalizeOptionalNumber(item.gridHeight),
                displayName: item.displayName || item.nameZh || item.id,
                nameZh: item.nameZh,
                subCategory: item.subCategory,
                loadoutSlot: item.loadoutSlot,
                icon: this.normalizeIconPath(item.icon),
                stackMax: this.normalizeOptionalNumber(item.stackMax),
                consumable: typeof item.consumable === "boolean" ? item.consumable : undefined,
                satiety: this.normalizeOptionalNumber(item.satiety),
                hydration: this.normalizeOptionalNumber(item.hydration),
                description: item.description,
                attackPower: this.normalizeOptionalNumber(item.attackPower),
                attackSpeed: this.normalizeOptionalNumber(item.attackSpeed),
                bulletSpeed: this.normalizeOptionalNumber(item.bulletSpeed),
                fireMode: item.fireMode === "auto" ? "auto" : "single",
                fireIntervalMs: this.normalizeOptionalNumber(item.fireIntervalMs),
                muzzleOffsetX: this.normalizeOptionalNumber(item.muzzleOffsetX),
                muzzleOffsetY: this.normalizeOptionalNumber(item.muzzleOffsetY),
                defense: this.normalizeOptionalNumber(item.defense),
                durability: this.normalizeOptionalNumber(item.durability),
                throwDamage: this.normalizeOptionalNumber(item.throwDamage),
                blastRadius: this.normalizeOptionalNumber(item.blastRadius),
                throwRange: this.normalizeOptionalNumber(item.throwRange),
                fuseMs: this.normalizeOptionalNumber(item.fuseMs),
                useEffect: this.normalizeUseEffect(item.useEffect),
            });
        }
    }

    public resolveItemMeta(itemId: string): ItemMeta | null {
        return this.itemMetaById.get(itemId) || null;
    }

    public resolveFallbackIcon(itemId: string): string | undefined {
        const fallbackIconMap: Record<string, string> = {
            wood: "atlas/picture/items/shared/basic-material.png",
            shupi: "atlas/picture/items/shared/basic-material.png",
            xiaoshuzhi: "atlas/picture/items/shared/basic-material.png",
            grass: "atlas/picture/items/materials/basic_materials/grass.png",
            yaocao: "atlas/picture/items/shared/basic-material.png",
            iron: "atlas/picture/items/materials/basic_materials/iron.png",
            copper: "atlas/picture/items/materials/basic_materials/copper.png",
            liuhuang: "atlas/picture/items/materials/basic_materials/liuhuang.png",
            xiyoujinshu: "atlas/picture/items/shared/basic-material.png",
            shitou: "atlas/picture/items/materials/basic_materials/shitou.png",
            common_material_02: "atlas/picture/items/materials/basic_materials/shitou.png",
            food_material_01: "atlas/picture/items/materials/food_materials/fruit.png",
            base_material_10: "atlas/picture/items/materials/basic_materials/chenshuimu.png",
            mutant_blood_1: "atlas/picture/items/misc/flood_1.png",
            mutant_blood_2: "atlas/picture/items/misc/flood_2.png",
            mutant_blood_3: "atlas/picture/items/misc/flood_3.png",
        };

        return fallbackIconMap[itemId] || undefined;
    }

    public isItemEnabled(itemId: string): boolean {
        const item = this.resolveItemMeta(itemId);
        return !!item && item.enabled !== false;
    }

    public resolveFallbackName(itemId: string): string | undefined {
        const fallbackNameMap: Record<string, string> = {
            mutant_blood_1: "一阶变异血",
            mutant_blood_2: "二阶变异血",
            mutant_blood_3: "三阶变异血",
        };

        return fallbackNameMap[itemId] || undefined;
    }

    private normalizeIconPath(icon?: string): string | undefined {
        const raw = String(icon || "").trim();
        if (!raw) {
            return undefined;
        }

        return raw.replace(/^assets\//, "");
    }

    private normalizeOptionalNumber(value: unknown): number | undefined {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : undefined;
    }

    private normalizeUseEffect(effect: unknown): ItemUseEffect | undefined {
        if (!effect || typeof effect !== "object") {
            return undefined;
        }

        const raw = effect as Partial<ItemUseEffect>;
        const type = String(raw.type || "").trim();
        if (!type) {
            return undefined;
        }

        return {
            type,
            amount: this.normalizeOptionalNumber(raw.amount),
        };
    }
}
