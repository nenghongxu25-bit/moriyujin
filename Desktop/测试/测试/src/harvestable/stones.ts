import { HarvestableBase, HarvestConfig } from "./HarvestableBase";
import { DataManager } from "../systems/datamanager";

const { regClass } = Laya;

@regClass()
export class stones extends HarvestableBase {
    protected getConfig(): HarvestConfig {
        return {
            id: "harvestable_stones",
            name: "stones",
            displayName: "石堆",
            action: "search",
            interactTime: 1000,
            once: true,
            range: 160,
            sequence: [
                { animation: "search/search_start", duration: 816, loop: false },
                { animation: "search/search_loop", duration: 2983, loop: true },
                { animation: "search/search_end", duration: 816, loop: false },
            ],
            drops: DataManager.getInstance().getHarvestDrops("harvestable_stones", [
                {
                    itemId: "common_material_02",
                    label: "石头",
                    minCount: 2,
                    maxCount: 4,
                    probability: 1,
                },
            ]),
        };
    }
}