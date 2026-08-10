import { HarvestableBase, HarvestConfig } from "./HarvestableBase";

const { regClass } = Laya;

@regClass()
export class bush extends HarvestableBase {
    protected getConfig(): HarvestConfig {
        return {
            id: "harvestable_bush",
            name: "bush",
            displayName: "灌木",
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
                { itemId: "food_material_01", label: "浆果", minCount: 1, maxCount: 1, probability: 0.8 },
                { itemId: "common_material_04", label: "草料", minCount: 1, maxCount: 1, probability: 1 },
                { itemId: "common_material_03", label: "树枝", minCount: 1, maxCount: 1, probability: 0.5 },
            ],
        };
    }
}