import { ContainerBase, type ContainerItem } from "./ContainerBase";

const { regClass } = Laya;

@regClass()
export class pobudai extends ContainerBase {
    protected getDefaultContainerId(): string {
        return "container_pobudai";
    }

    protected getDefaultDisplayName(): string {
        return "破布袋";
    }

    protected getDefaultContents(): ContainerItem[] {
        return [
            { itemId: "bandage", name: "绷带", count: 1, minCount: 1, maxCount: 2, probability: 0.2 },
            { itemId: "egg", name: "鸡蛋", count: 1, minCount: 1, maxCount: 2, probability: 0.2 },
            { itemId: "corn", name: "玉米", count: 1, minCount: 1, maxCount: 2, probability: 0.2 },
            { itemId: "seasoning", name: "调料", count: 1, minCount: 1, maxCount: 1, probability: 0.1 },
            { itemId: "wheat", name: "小麦", count: 1, minCount: 1, maxCount: 2, probability: 0.2 },
            { itemId: "hide", name: "皮革", count: 1, minCount: 1, maxCount: 2, probability: 0.2 },
            { itemId: "grass", name: "草", count: 1, minCount: 1, maxCount: 3, probability: 0.3 },
            { itemId: "nail", name: "钉子", count: 1, minCount: 1, maxCount: 1, probability: 0.1 },
            { itemId: "muban", name: "木板", count: 1, minCount: 1, maxCount: 2, probability: 0.2 },
        ];
    }
}
