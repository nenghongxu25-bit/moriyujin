import { HarvestableBase, HarvestConfig } from "./HarvestableBase";
import { DataManager } from "../systems/datamanager";

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
                { animation: "search/search_start", duration: 816, loop: false },
                { animation: "search/search_loop", duration: 2983, loop: true },
                { animation: "search/search_end", duration: 816, loop: false },
            ],
            drops: DataManager.getInstance().getHarvestDrops("harvestable_mound", [
                { itemId: "food_material_04", label: "泥土", minCount: 1, maxCount: 1, probability: 0.25 },
                { itemId: "base_material_10", label: "矿渣", minCount: 1, maxCount: 1, probability: 0.25 },
                { itemId: "xiaoshuzhi", label: "小树枝", minCount: 1, maxCount: 1, probability: 0.25 },
                { itemId: "common_material_02", label: "石头", minCount: 1, maxCount: 1, probability: 0.25 },
            ]),
        };
    }
}