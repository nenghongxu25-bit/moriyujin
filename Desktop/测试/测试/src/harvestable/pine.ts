import { HarvestableBase, HarvestConfig } from "./HarvestableBase";

const { regClass } = Laya;

@regClass()
export class pine extends HarvestableBase {
    protected getConfig(): HarvestConfig {
        return {
            id: "harvestable_pine",
            name: "pine",
            displayName: "松树",
            action: "chop",
            interactTime: 1000,
            once: true,
            range: 180,
            sequence: [
                { animation: "attack_swing", duration: 1067, loop: false },
                { animation: "attack_swing", duration: 1067, loop: false },
                { animation: "attack_swing", duration: 1067, loop: false },
            ],
            drops: [
                { itemId: "common_material_01", label: "松木", minCount: 3, maxCount: 3, probability: 0.7 },
                { itemId: "base_material_09", label: "树脂", minCount: 1, maxCount: 1, probability: 0.3 },
            ],
        };
    }
}