import { HarvestableBase, HarvestConfig } from "./HarvestableBase";
import { DataManager } from "../systems/datamanager";

const { regClass } = Laya;

@regClass()
export class l1_kuang extends HarvestableBase {
    protected getConfig(): HarvestConfig {
        return {
            id: "harvestable_l1_kuang",
            name: "l1-kuang",
            displayName: "L1矿",
            action: "search",
            interactTime: 1000,
            once: true,
            range: 160,
            sequence: [
                { animation: "search/search_start", duration: 816, loop: false },
                { animation: "search/search_loop", duration: 2983, loop: true },
                { animation: "search/search_end", duration: 816, loop: false },
            ],
            drops: DataManager.getInstance().getHarvestDrops("harvestable_l1_kuang", [
                {
                    itemId: "common_material_02",
                    label: "石头",
                    minCount: 2,
                    maxCount: 4,
                    probability: 1,
                    countWeights: [
                        { count: 2, probability: 0.4 },
                        { count: 3, probability: 0.5 },
                        { count: 4, probability: 0.1 }
                    ]
                },
                {
                    itemId: "iron",
                    label: "铁",
                    minCount: 1,
                    maxCount: 3,
                    probability: 1,
                    countWeights: [
                        { count: 1, probability: 0.2 },
                        { count: 2, probability: 0.5 },
                        { count: 3, probability: 0.3 }
                    ]
                }
            ]),
        };
    }
}