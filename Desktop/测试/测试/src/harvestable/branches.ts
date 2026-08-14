import { HarvestableBase, HarvestConfig } from "./HarvestableBase";
import { DataManager } from "../systems/datamanager";

const { regClass } = Laya;

@regClass()
export class branches extends HarvestableBase {
    protected getConfig(): HarvestConfig {
        return {
            id: "harvestable_branches",
            name: "branches",
            displayName: "小树枝堆",
            action: "search",
            interactTime: 1000,
            once: true,
            range: 160,
            sequence: [
                { animation: "search/search_start", duration: 816, loop: false },
                { animation: "search/search_loop", duration: 2983, loop: true },
                { animation: "search/search_end", duration: 816, loop: false },
            ],
            drops: DataManager.getInstance().getHarvestDrops("harvestable_branches", [
                {
                    itemId: "xiaoshuzhi",
                    label: "小树枝",
                    minCount: 1,
                    maxCount: 3,
                    probability: 1,
                },
            ]),
        };
    }
}