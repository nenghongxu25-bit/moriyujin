import { ContainerBase, type ContainerItem } from "./ContainerBase";

const { regClass } = Laya;

@regClass()
export class ironbox extends ContainerBase {
    protected getDefaultContainerId(): string {
        return "container_ironbox";
    }

    protected getDefaultDisplayName(): string {
        return "ironbox";
    }

    protected getDefaultContents(): ContainerItem[] {
        return [
            { itemId: "chenshuimu", count: 1, minCount: 1, maxCount: 3, probability: 0.08 },
            { itemId: "copper", count: 1, minCount: 1, maxCount: 3, probability: 0.12 },
            { itemId: "cotton", count: 1, minCount: 1, maxCount: 3, probability: 0.08 },
            { itemId: "feather", count: 1, minCount: 1, maxCount: 2, probability: 0.06 },
            { itemId: "grass", count: 1, minCount: 1, maxCount: 4, probability: 0.08 },
            { itemId: "hide", count: 1, minCount: 1, maxCount: 2, probability: 0.08 },
            { itemId: "hua", count: 1, minCount: 1, maxCount: 3, probability: 0.06 },
            { itemId: "iron", count: 1, minCount: 1, maxCount: 4, probability: 0.18 },
            { itemId: "liuhuang", count: 1, minCount: 1, maxCount: 2, probability: 0.1 },
            { itemId: "mutan", count: 1, minCount: 1, maxCount: 3, probability: 0.1 },
            { itemId: "nail", count: 1, minCount: 1, maxCount: 3, probability: 0.12 },
            { itemId: "renshen", count: 1, minCount: 1, maxCount: 1, probability: 0.04 },
            { itemId: "shougu", count: 1, minCount: 1, maxCount: 2, probability: 0.05 },
            { itemId: "shucai", count: 1, minCount: 1, maxCount: 2, probability: 0.06 },
            { itemId: "shupi", count: 1, minCount: 1, maxCount: 3, probability: 0.08 },
            { itemId: "shuzhi", count: 1, minCount: 1, maxCount: 2, probability: 0.06 },
            { itemId: "tiaoliao", count: 1, minCount: 1, maxCount: 2, probability: 0.05 },
            { itemId: "wood", count: 1, minCount: 1, maxCount: 4, probability: 0.1 },
            { itemId: "xiaoshi", count: 1, minCount: 1, maxCount: 2, probability: 0.08 },
            { itemId: "xiaoshuzhi", count: 1, minCount: 1, maxCount: 4, probability: 0.1 },
            { itemId: "xiyoujinshu", count: 1, minCount: 1, maxCount: 1, probability: 0.04 },
            { itemId: "yaocao", count: 1, minCount: 1, maxCount: 2, probability: 0.06 },
            { itemId: "corn", count: 1, minCount: 1, maxCount: 2, probability: 0.05 },
            { itemId: "egg", count: 1, minCount: 1, maxCount: 2, probability: 0.05 },
            { itemId: "fish", count: 1, minCount: 1, maxCount: 2, probability: 0.04 },
            { itemId: "fruit", count: 1, minCount: 1, maxCount: 2, probability: 0.05 },
            { itemId: "meat", count: 1, minCount: 1, maxCount: 2, probability: 0.04 },
            { itemId: "mushroom", count: 1, minCount: 1, maxCount: 2, probability: 0.05 },
            { itemId: "potato", count: 1, minCount: 1, maxCount: 2, probability: 0.05 },
            { itemId: "rice_grain", count: 1, minCount: 1, maxCount: 2, probability: 0.05 },
            { itemId: "seasoning", count: 1, minCount: 1, maxCount: 1, probability: 0.04 },
            { itemId: "wheat", count: 1, minCount: 1, maxCount: 2, probability: 0.05 },
            { itemId: "gongyejiao", count: 1, minCount: 1, maxCount: 1, probability: 0.04 },
            { itemId: "gujiao", count: 1, minCount: 1, maxCount: 1, probability: 0.04 },
            { itemId: "leather", count: 1, minCount: 1, maxCount: 2, probability: 0.05 },
            { itemId: "shengzi", count: 1, minCount: 1, maxCount: 2, probability: 0.06 },
            { itemId: "shikuai", count: 1, minCount: 1, maxCount: 2, probability: 0.06 },
            { itemId: "muban", count: 1, minCount: 1, maxCount: 2, probability: 0.07 },
            { itemId: "tieding", count: 1, minCount: 1, maxCount: 2, probability: 0.07 },
            { itemId: "tongding", count: 1, minCount: 1, maxCount: 2, probability: 0.06 },
            { itemId: "Ti", count: 1, minCount: 1, maxCount: 1, probability: 0.03 },
            { itemId: "Wu", count: 1, minCount: 1, maxCount: 1, probability: 0.03 },
            { itemId: "yingmu", count: 1, minCount: 1, maxCount: 1, probability: 0.04 },
            { itemId: "common_material_02", count: 1, minCount: 1, maxCount: 4, probability: 0.1 },
            { itemId: "shitou", count: 1, minCount: 1, maxCount: 4, probability: 0.1 },
            { itemId: "food_material_01", count: 1, minCount: 1, maxCount: 2, probability: 0.05 },
            { itemId: "base_material_10", count: 1, minCount: 1, maxCount: 2, probability: 0.05 },
            { itemId: "gaofenzicailiao", count: 1, minCount: 1, maxCount: 1, probability: 0.03 },
            { itemId: "tezhonghejin", count: 1, minCount: 1, maxCount: 1, probability: 0.03 },
            { itemId: "taihejin", count: 1, minCount: 1, maxCount: 1, probability: 0.02 },
            { itemId: "tezhonggang", count: 1, minCount: 1, maxCount: 1, probability: 0.02 },
            { itemId: "junyongcaoci", count: 1, minCount: 1, maxCount: 1, probability: 0.02 },
            { itemId: "huoyao", count: 1, minCount: 1, maxCount: 1, probability: 0.03 },
        ];
    }
}
