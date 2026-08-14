import { HarvestableBase, HarvestConfig } from "./HarvestableBase";
import { DataManager } from "../systems/datamanager";

const { regClass } = Laya;

@regClass()
export class l2_kuang extends HarvestableBase {
    protected getConfig(): HarvestConfig {
        return {
            id: "harvestable_l2_kuang",
            name: "l2-kuang",
            displayName: "L2矿",
            action: "search",
            interactTime: 1000,
            once: true,
            range: 160,
            sequence: [
                { animation: "search/search_start", duration: 816, loop: false },
                { animation: "search/search_loop", duration: 2983, loop: true },
                { animation: "search/search_end", duration: 816, loop: false },
            ],
            drops: DataManager.getInstance().getHarvestDrops("harvestable_l2_kuang", [
                {
                    itemId: "iron",
                    label: "铁",
                    minCount: 1,
                    maxCount: 3,
                    probability: 1,
                    countWeights: [
                        { count: 1, probability: 0.2 },
                        { count: 2, probability: 0.5 },
                        { count: 3, probability: 0.3 },
                    ],
                },
                {
                    itemId: "copper",
                    label: "铜",
                    minCount: 1,
                    maxCount: 3,
                    probability: 0.5,
                    countWeights: [
                        { count: 1, probability: 0.5 },
                        { count: 2, probability: 0.3 },
                        { count: 3, probability: 0.2 },
                    ],
                },
                {
                    itemId: "xiyoujinshu",
                    label: "稀有金属",
                    minCount: 1,
                    maxCount: 1,
                    probability: 0.1,
                },
                {
                    itemId: "liuhuang",
                    label: "硫磺",
                    minCount: 1,
                    maxCount: 2,
                    probability: 0.2,
                    countWeights: [
                        { count: 1, probability: 0.7 },
                        { count: 2, probability: 0.3 },
                    ],
                },
                {
                    itemId: "mutan",
                    label: "煤",
                    minCount: 1,
                    maxCount: 2,
                    probability: 0.3,
                    countWeights: [
                        { count: 1, probability: 0.7 },
                        { count: 2, probability: 0.3 },
                    ],
                },
            ]),
        };
    }
}