import { HarvestableBase, HarvestConfig } from "./HarvestableBase";
import { DataManager } from "../systems/datamanager";

const { regClass } = Laya;

@regClass()
export class pine extends HarvestableBase {
    protected getConfig(): HarvestConfig {
        return {
            id: "harvestable_pine",
            name: "pine",
            displayName: "ËÉÊ÷",
            action: "chop",
            interactTime: 1000,
            once: true,
            range: 180,
            sequence: [
                { animation: "attack_swing", duration: 1067, loop: false },
                { animation: "attack_swing", duration: 1067, loop: false },
                { animation: "attack_swing", duration: 1067, loop: false },
            ],
            drops: DataManager.getInstance().getHarvestDrops("harvestable_pine", [
                {
                    itemId: "wood",
                    label: "Ä¾Í·",
                    minCount: 2,
                    maxCount: 3,
                    probability: 1,
                    countWeights: [
                        { count: 2, probability: 0.5 },
                        { count: 3, probability: 0.5 },
                    ],
                },
                {
                    itemId: "shupi",
                    label: "Ê÷Æ¤",
                    minCount: 1,
                    maxCount: 1,
                    probability: 0.2,
                },
                {
                    itemId: "xiaoshuzhi",
                    label: "Ð¡Ê÷Ö¦",
                    minCount: 1,
                    maxCount: 1,
                    probability: 0.2,
                },
            ]),
        };
    }
}
