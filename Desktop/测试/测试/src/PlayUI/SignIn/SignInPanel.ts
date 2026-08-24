const { regClass, property } = Laya;

import { DataManager, type SignInRewardView } from "../../systems/datamanager";
import { SignInDayItem } from "./SignInDayItem";

@regClass()
export class SignInPanel extends Laya.Script {
    @property(Laya.Node)
    public listNode: Laya.Node | null = null;

    @property(Laya.Node)
    public templateNode: Laya.Node | null = null;

    @property(Number)
    public dayCount: number = 31;

    private rewards: SignInRewardView[] = [];
    private refreshToken: number = 0;

    onAwake(): void {
        this.resolveBindings();
        this.refresh();
    }

    onEnable(): void {
        this.resolveBindings();
        this.refresh();
    }

    public refresh(): void {
        void this.refreshAsync();
    }

    private async refreshAsync(): Promise<void> {
        const token = ++this.refreshToken;
        await DataManager.getInstance().syncSignInTimeSource();
        if (token !== this.refreshToken) {
            return;
        }

        const list = this.listNode as any;
        if (!list) {
            return;
        }

        this.rewards = DataManager.getInstance().getSignInRewards();
        const count = Math.max(0, Math.floor(this.dayCount || this.rewards.length));

        if ("itemRenderer" in list) {
            list.itemRenderer = (index: number, item: Laya.Node) => {
                this.renderItem(index, item);
            };
        }

        if ("numItems" in list) {
            list.numItems = count;
        }

        if (typeof list.refresh === "function") {
            list.refresh(true);
        }

        Laya.timer.callLater(this, this.bindVisibleItems);
    }

    private renderItem(index: number, slotNode: Laya.Node): void {
        const reward = this.rewards[index] || null;
        if (!slotNode || !reward) {
            this.setNodeVisible(slotNode, false);
            return;
        }

        this.setNodeVisible(slotNode, true);
        let item = slotNode.getComponent(SignInDayItem);
        if (!item) {
            item = slotNode.addComponent(SignInDayItem);
        }

        item.bind(reward);
        this.bindItemClick(slotNode);
    }

    private bindVisibleItems(): void {
        const list = this.listNode as any;
        const children = list && Array.isArray(list.children) ? (list.children as Laya.Node[]) : [];
        if (!children.length) {
            return;
        }

        const template = this.templateNode;
        let dataIndex = 0;
        for (let i = 0; i < children.length; i++) {
            const slotNode = children[i];
            if (!slotNode || slotNode === template) {
                continue;
            }

            this.renderItem(dataIndex, slotNode);
            dataIndex++;
        }
    }

    private bindItemClick(slotNode: Laya.Node): void {
        const target = slotNode as any;
        if (!target || typeof target.on !== "function" || typeof target.off !== "function") {
            return;
        }

        target.off(Laya.Event.CLICK, this, this.onItemClick);
        target.on(Laya.Event.CLICK, this, this.onItemClick, [slotNode]);
    }

    private async onItemClick(slotNode: Laya.Node): Promise<void> {
        const item = slotNode.getComponent(SignInDayItem);
        if (!item || item.getState() !== "claimable") {
            return;
        }

        await DataManager.getInstance().syncSignInTimeSource();
        if (DataManager.getInstance().claimSignInReward(item.getDay())) {
            this.refresh();
        }
    }

    private resolveBindings(): void {
        const root = this.owner as Laya.Node;
        this.listNode = this.listNode || this.findChildByName(root, "list");
        if (!this.templateNode && this.listNode) {
            const children = (this.listNode as any).children as Laya.Node[] | undefined;
            this.templateNode = children && children.length > 0 ? children[0] : null;
        }
    }

    private setNodeVisible(node: Laya.Node | null, visible: boolean): void {
        const target = node as any;
        if (!target) {
            return;
        }

        if ("visible" in target) {
            target.visible = visible;
        }
        if ("active" in target) {
            target.active = visible;
        }
    }

    private findChildByName(root: Laya.Node | null, name: string): Laya.Node | null {
        if (!root) {
            return null;
        }

        if ((root as any).name === name) {
            return root;
        }

        const children = (root as any).children as Laya.Node[] | undefined;
        if (!children) {
            return null;
        }

        for (let i = 0; i < children.length; i++) {
            const found = this.findChildByName(children[i], name);
            if (found) {
                return found;
            }
        }

        return null;
    }
}
