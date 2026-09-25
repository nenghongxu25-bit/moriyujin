import { ContainerBase, type ContainerItem } from "./ContainerBase";

const { regClass } = Laya;

@regClass()
export class kongtou extends ContainerBase {
    protected getDefaultContainerId(): string {
        return "container_kongtou";
    }

    protected getDefaultDisplayName(): string {
        return "kongtou";
    }

    protected getDefaultContents(): ContainerItem[] {
        return [
            { itemId: "wood_club", count: 1, minCount: 1, maxCount: 1, probability: 0.18 },
            { itemId: "knife", count: 1, minCount: 1, maxCount: 1, probability: 0.16 },
            { itemId: "cleaver", count: 1, minCount: 1, maxCount: 1, probability: 0.14 },
            { itemId: "baseket_bat", count: 1, minCount: 1, maxCount: 1, probability: 0.14 },
            { itemId: "qiaogun", count: 1, minCount: 1, maxCount: 1, probability: 0.1 },
            { itemId: "langyabang", count: 1, minCount: 1, maxCount: 1, probability: 0.08 },
            { itemId: "machete", count: 1, minCount: 1, maxCount: 1, probability: 0.06 },
            { itemId: "long_knife", count: 1, minCount: 1, maxCount: 1, probability: 0.05 },
        ];
    }
}
