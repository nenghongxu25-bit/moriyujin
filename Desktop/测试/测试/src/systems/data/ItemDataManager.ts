export interface ItemMeta {
    id: string;
    category?: string;
    displayName: string;
    nameZh?: string;
    subCategory?: string;
    icon?: string;
    attackPower?: number;
    attackSpeed?: number;
    durability?: number;
}

export interface ItemTableFile {
    category: string;
    items: Array<{
        id: string;
        displayName: string;
        nameZh?: string;
        subCategory?: string;
        icon?: string;
        attackPower?: number;
        attackSpeed?: number;
        durability?: number;
    }>;
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
                id: item.id,
                category: table.category,
                displayName: item.displayName || item.nameZh || item.id,
                nameZh: item.nameZh,
                subCategory: item.subCategory,
                icon: this.normalizeIconPath(item.icon),
                attackPower: this.normalizeOptionalNumber(item.attackPower),
                attackSpeed: this.normalizeOptionalNumber(item.attackSpeed),
                durability: this.normalizeOptionalNumber(item.durability),
            });
        }
    }

    public resolveItemMeta(itemId: string): ItemMeta | null {
        return this.itemMetaById.get(itemId) || null;
    }

    public resolveFallbackIcon(itemId: string): string | undefined {
        const fallbackIconMap: Record<string, string> = {
            wood: "atlas/picture/items/materials/basic_materials/wood.png",
            shupi: "atlas/picture/items/materials/basic_materials/shupi.png",
            xiaoshuzhi: "atlas/picture/items/materials/basic_materials/xiaoshuzhi.png",
            grass: "atlas/picture/items/materials/basic_materials/grass.png",
            yaocao: "atlas/picture/items/materials/basic_materials/yaocao.png",
            iron: "atlas/picture/items/materials/basic_materials/iron.png",
            copper: "atlas/picture/items/materials/basic_materials/copper.png",
            liuhuang: "atlas/picture/items/materials/basic_materials/liuhuang.png",
            xiyoujinshu: "atlas/picture/items/materials/basic_materials/xiyoujinshu.png",
            common_material_02: "atlas/picture/items/materials/basic_materials/shitou.png",
            common_material_04: "atlas/picture/items/materials/basic_materials/grass.png",
            food_material_01: "atlas/picture/items/materials/food_materials/fruit.png",
            food_material_04: "atlas/picture/items/materials/basic_materials/chenshuimu.png",
            base_material_10: "atlas/picture/items/materials/basic_materials/chenshuimu.png",
            mutant_blood_1: "atlas/picture/items/misc/flood_1.png",
            mutant_blood_2: "atlas/picture/items/misc/flood_2.png",
            mutant_blood_3: "atlas/picture/items/misc/flood_3.png",
        };

        return fallbackIconMap[itemId] || undefined;
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
}
