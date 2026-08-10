import { HarvestableBase, HarvestConfig } from "./HarvestableBase";

const { regClass } = Laya;

@regClass()
export class branches extends HarvestableBase {
    protected getConfig(): HarvestConfig {
        return {
            id: "harvestable_branches",
            name: "branches",
            displayName: "树枝",
            action: "search",
            interactTime: 1000,
            once: true,
            range: 160,
            sequence: [
                {
                    animation: "search_start",
                    duration: 833,
                    loop: false
                },
                {
                    animation: "search_loop",
                    duration: 1000,
                    loop: false
                },
                {
                    animation: "search_loop",
                    duration: 1000,
                    loop: false
                },
                {
                    animation: "search_loop",
                    duration: 1000,
                    loop: false
                },
                {
                    animation: "search_end",
                    duration: 833,
                    loop: false
                }
            ],
            drops: [
                {
                    itemId: "common_material_03",
                    label: "树枝",
                    minCount: 1,
                    maxCount: 3,
                    probability: 1
                }
            ]
        };
    }
}