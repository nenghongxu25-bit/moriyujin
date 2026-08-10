import { HarvestableBase, HarvestConfig } from "./HarvestableBase";

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
                { animation: "search_start", duration: 833, loop: false },
                { animation: "search_loop", duration: 1000, loop: false },
                { animation: "search_loop", duration: 1000, loop: false },
                { animation: "search_loop", duration: 1000, loop: false },
                { animation: "search_end", duration: 833, loop: false },
            ],
            drops: [
                {
                    itemId: "common_material_02",
                    label: "石块",
                    minCount: 2,
                    maxCount: 4,
                    probability: 1,
                },
            ],
        };
    }
}