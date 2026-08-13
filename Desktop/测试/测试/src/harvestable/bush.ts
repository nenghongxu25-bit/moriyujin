import { HarvestableBase, HarvestConfig } from "./HarvestableBase";
import { DataManager } from "../systems/datamanager";

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
                { animation: "search/search_start", duration: 816, loop: false },
                { animation: "search/search_loop", duration: 2983, loop: true },
                { animation: "search/search_end", duration: 816, loop: false },
            ],
            drops: DataManager.getInstance().getHarvestDrops("harvestable_bush", [
                {
                    itemId: "common_material_04",
                    label: "草",
                    minCount: 2,
                    maxCount: 3,
                    probability: 0.9,
                    countWeights: [
                        { count: 2, probability: 0.5 },
                        { count: 3, probability: 0.5 }
                    ]
                },
                {
                    itemId: "xiaoshuzhi",
                    label: "小树枝",
                    minCount: 1,
                    maxCount: 2,
                    probability: 0.8,
                    countWeights: [
                        { count: 1, probability: 0.4 },
                        { count: 2, probability: 0.2 }
                    ]
                },
                {
                    itemId: "food_material_01",
                    label: "浆果",
                    minCount: 1,
                    maxCount: 2,
                    probability: 0.8,
                    countWeights: [
                        { count: 1, probability: 0.5 },
                        { count: 2, probability: 0.3 }
                    ]
                },
                {
                    itemId: "yaocao",
                    label: "药草",
                    minCount: 1,
                    maxCount: 1,
                    probability: 0.3
                }
            ]),
        };
    }
}