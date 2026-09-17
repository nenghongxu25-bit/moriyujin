import { HarvestableBase, HarvestConfig } from "./HarvestableBase";
import { DataManager } from "../systems/datamanager";

const { regClass } = Laya;

@regClass()
export class l3_kuang extends HarvestableBase {
    protected getConfig(): HarvestConfig {
        return {
            id: "harvestable_l3_kuang",
            name: "l3-kuang",
            displayName: "L3矿",
            action: "dig",
            interactTime: 3201,
            once: true,
            range: 160,
            sequence: [
                { animation: "attack/attack_melee_swing", duration: 1067, loop: false },
                { animation: "attack/attack_melee_swing", duration: 1067, loop: false },
                { animation: "attack/attack_melee_swing", duration: 1067, loop: false },
            ],
            drops: DataManager.getInstance().getHarvestDrops("harvestable_l3_kuang", [
                {
                    itemId: "xiyoujinshu",
                    label: "稀有金属",
                    minCount: 1,
                    maxCount: 2,
                    probability: 1,
                    countWeights: [
                        { count: 1, probability: 0.7 },
                        { count: 2, probability: 0.3 },
                    ],
                },
                {
                    itemId: "tezhonghejin",
                    label: "特种合金",
                    minCount: 1,
                    maxCount: 1,
                    probability: 0.15,
                },
            ]),
        };
    }
}
