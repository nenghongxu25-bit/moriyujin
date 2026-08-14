import { ItemDataManager } from "./ItemDataManager";

export interface DropCountWeight {
    count: number;
    probability: number;
}

export interface HarvestDropConfig {
    itemId: string;
    label: string;
    minCount: number;
    maxCount: number;
    probability: number;
    countWeights?: DropCountWeight[];
}

export interface HarvestTableFile {
    category: string;
    items: Array<{
        id: string;
        name: string;
        displayName: string;
        action: string;
        drops: HarvestDropConfig[];
    }>;
}

export interface HarvestResultItem {
    itemId: string;
    name: string;
    count: number;
    icon?: string;
}

export class HarvestManager {
    private readonly harvestDropsById: Map<string, HarvestDropConfig[]> = new Map();

    public constructor(private readonly itemData: ItemDataManager) {}

    public registerHarvestTable(table: HarvestTableFile): void {
        if (!table || !Array.isArray(table.items)) {
            throw new Error("Harvest table is invalid.");
        }

        const items = table.items;
        for (let i = 0; i < items.length; i++) {
            const entry = items[i];
            if (!entry || !entry.id) {
                throw new Error(`Harvest table entry is invalid at index ${i}.`);
            }
            if (!Array.isArray(entry.drops)) {
                throw new Error(`Harvest table drops are invalid for entry ${entry.id}.`);
            }

            this.harvestDropsById.set(entry.id, this.cloneDropList(entry.drops));
        }
    }

    public getHarvestDrops(harvestId: string, fallback: HarvestDropConfig[] = []): HarvestDropConfig[] {
        const source = this.harvestDropsById.get(harvestId);
        return this.cloneDropList(source && source.length > 0 ? source : fallback);
    }

    public rollHarvestDrops(harvestId: string, fallback: HarvestDropConfig[] = []): HarvestResultItem[] {
        const drops = this.getHarvestDrops(harvestId, fallback);
        const results: HarvestResultItem[] = [];

        for (let i = 0; i < drops.length; i++) {
            const drop = drops[i];
            if (!this.rollProbability(drop.probability)) {
                continue;
            }

            const count = this.rollCount(drop);
            const meta = this.itemData.resolveItemMeta(drop.itemId);
            const icon = meta && meta.icon ? meta.icon : this.itemData.resolveFallbackIcon(drop.itemId);
            results.push({
                itemId: drop.itemId,
                name: meta ? meta.displayName : drop.label,
                count,
                icon,
            });
        }

        return results;
    }

    public formatHarvestResults(results: HarvestResultItem[]): string {
        if (!results || results.length === 0) {
            return "没有可获得的物品";
        }

        return results.map((item) => `${item.name} x${item.count}`).join(", ");
    }

    private cloneDropList(drops: HarvestDropConfig[]): HarvestDropConfig[] {
        return drops.map((drop) => ({
            ...drop,
            countWeights: drop.countWeights ? drop.countWeights.map((weight) => ({ ...weight })) : undefined,
        }));
    }

    private rollProbability(probability: number): boolean {
        const chance = Number.isFinite(probability) ? Math.max(0, Math.min(1, probability)) : 0;
        return Math.random() <= chance;
    }

    private rollCount(drop: HarvestDropConfig): number {
        if (Array.isArray(drop.countWeights) && drop.countWeights.length > 0) {
            return this.rollWeightedCount(drop.countWeights, drop.minCount, drop.maxCount);
        }

        const minCount = Math.min(drop.minCount, drop.maxCount);
        const maxCount = Math.max(drop.minCount, drop.maxCount);
        if (minCount === maxCount) {
            return Math.max(1, minCount);
        }

        return Math.floor(minCount + Math.random() * (maxCount - minCount + 1));
    }

    private rollWeightedCount(weights: DropCountWeight[], fallbackMin: number, fallbackMax: number): number {
        let totalWeight = 0;
        for (let i = 0; i < weights.length; i++) {
            totalWeight += Math.max(0, weights[i].probability);
        }

        if (totalWeight <= 0) {
            return this.rollCount({
                itemId: "",
                label: "",
                minCount: fallbackMin,
                maxCount: fallbackMax,
                probability: 1,
            });
        }

        let cursor = Math.random() * totalWeight;
        for (let i = 0; i < weights.length; i++) {
            cursor -= Math.max(0, weights[i].probability);
            if (cursor <= 0) {
                return Math.max(1, weights[i].count);
            }
        }

        return Math.max(1, weights[weights.length - 1].count);
    }
}