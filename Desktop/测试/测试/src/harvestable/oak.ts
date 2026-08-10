import { HarvestableBase, HarvestConfig } from "./HarvestableBase";

const { regClass } = Laya;

@regClass()
export class oak extends HarvestableBase {
    protected getConfig(): HarvestConfig {
        return {
            id: "harvestable_oak",
            name: "oak",
            displayName: "橡树",
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
                {
                    itemId: "common_material_03",
                    label: "木材",
                    minCount: 2,
                    maxCount: 4,
                    probability: 1,
                },
            ],
        };
    }
}