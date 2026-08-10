import { HarvestableBase, HarvestConfig } from "./HarvestableBase";

const { regClass } = Laya;

@regClass()
export class mound extends HarvestableBase {
    protected getConfig(): HarvestConfig {
        return {
            id: "harvestable_mound",
            name: "mound",
            displayName: "土堆",
            action: "search",
            interactTime: 1000,
            once: true,
            range: 160,
            sequence: [
                { animation: "search_start", duration: 833, loop: false },
                { animation: "search_loop", duration: 1000, loop: false },
                { animation: "search_loop", duration: 1000, loop: false },
                { animation: "search_loop", duration: 1000, loop: false },
                { animation: "search_end", duration: 833, loop: false },
            ],
            drops: [
                { itemId: "food_material_04", label: "土层残片", minCount: 1, maxCount: 1, probability: 0.25 },
                { itemId: "base_material_10", label: "矿渣", minCount: 1, maxCount: 1, probability: 0.25 },
                { itemId: "common_material_03", label: "碎枝", minCount: 1, maxCount: 1, probability: 0.25 },
                { itemId: "common_material_02", label: "石块", minCount: 1, maxCount: 1, probability: 0.25 },
            ],
        };
    }
}