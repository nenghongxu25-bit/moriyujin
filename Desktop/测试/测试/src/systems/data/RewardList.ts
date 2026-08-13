import {
    BattlePassRewardViewData,
} from "./BattlePassManager";

import {
    BattlePassRewardItem,
} from "../../PlayUI/BattlePass/BattlePassRewardData";

const { regClass, property } = Laya;

@regClass()
export class RewardList extends Laya.Script {

    /** reward列表节点 */
    @property(Laya.Node)
    public listNode: Laya.Node | null = null;

    /** 点击奖励 */
    public onRewardClick:
        ((reward: BattlePassRewardViewData) => void) |
        null = null;

    private rewards: BattlePassRewardViewData[] = [];
    private playerGrade: number = 0;

    public setRewards(
        rewards: BattlePassRewardViewData[],
        playerGrade: number
    ): void {
        this.rewards = Array.isArray(rewards)
            ? rewards.slice()
            : [];

        this.playerGrade = Math.max(
            0,
            Math.floor(playerGrade)
        );

        this.setItemCount(this.rewards.length);
        this.refresh();
    }

    public refresh(): void {
        const children = this.listNode?.children || [];

        for (let i = 0; i < this.rewards.length; i++) {
            const slotNode = children[i];
            if (!slotNode) {
                continue;
            }

            const item = slotNode.getComponent(
                BattlePassRewardItem
            ) as BattlePassRewardItem | null;

            if (!item) {
                console.error(
                    `[RewardList] 第${i}个格子缺少BattlePassRewardItem`
                );
                continue;
            }

            item.bindData(
                this.rewards[i],
                this.playerGrade
            );

            this.bindClick(slotNode, i);
        }
    }

    private bindClick(
        slotNode: Laya.Node,
        index: number
    ): void {
        const target = slotNode as any;

        if (
            typeof target.on !== "function" ||
            typeof target.off !== "function"
        ) {
            return;
        }

        target.off(
            Laya.Event.CLICK,
            this,
            this.onSlotClick
        );

        target.on(
            Laya.Event.CLICK,
            this,
            this.onSlotClick,
            [index]
        );
    }

    private onSlotClick(index: number): void {
        const reward = this.rewards[index];

        if (reward && this.onRewardClick) {
            this.onRewardClick(reward);
        }
    }

    private setItemCount(count: number): void {
        const list = this.listNode as any;
        if (!list) {
            return;
        }

        list.numItems = count;

        if (typeof list.refresh === "function") {
            list.refresh(true);
        }
    }
}