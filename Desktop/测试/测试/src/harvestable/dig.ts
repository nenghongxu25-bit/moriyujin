import { HarvestableBase, HarvestConfig } from "./HarvestableBase";

const { regClass } = Laya;

@regClass()
export class dig extends HarvestableBase {
    protected getConfig(): HarvestConfig {
        return {
            id: "harvestable_dig",
            name: "dig",
            displayName: "矿点",
            action: "dig",
            interactTime: 3201,
            once: true,
            range: 170,
            sequence: [
                { animation: "attack_swing", duration: 1067, loop: false },
                { animation: "attack_swing", duration: 1067, loop: false },
                { animation: "attack_swing", duration: 1067, loop: false },
            ],
            drops: [
                {
                    itemId: "food_material_04",
                    label: "泥土",
                    minCount: 1,
                    maxCount: 2,
                    probability: 1
                }
            ]
        };
    }
}