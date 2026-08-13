import {
    BattlePassManager,
    BattlePassRewardViewData,
    BattlePassTaskViewData,
} from "./BattlePassManager";

import {
    BATTLE_PASS_MAX_GRADE,
    BATTLE_PASS_TOTAL_WEEKS,
} from "./BattlePassConfig";

import { glist } from "../Bag/BagList";
import { TimeNode } from "./TimeNode";
import { BattlePassTaskItem as TaskNode } from "./TaskNode";
import { BattlePassGradeItem } from "./BattlePassGradeItem";
import { BattlePassRewardItem } from "./BattlePassRewardData";

const { regClass, property } = Laya;

@regClass()
export class BattlePassPanel extends Laya.Script {

    /** 第一周到第七周 */
    @property(Laya.Node)
    public timeListNode: Laya.Node | null = null;

    /** 当前选中周的任务列表 */
    @property(Laya.Node)
    public taskListNode: Laya.Node | null = null;

    /** 1～60级等级列表 */
    @property(Laya.Node)
    public gradeListNode: Laya.Node | null = null;

    /** 1～60级奖励列表 */
    @property(Laya.Node)
    public rewardListNode: Laya.Node | null = null;

    /** 当前等级经验，例如：下一级所需经验：40/200 */
    @property(Laya.Node)
    public experienceTextNode: Laya.Node | null = null;

    /**
     * 当前选择查看的周数。
     */
    private selectedWeek: number = 1;

    /**
     * 战令数据管理器。
     */
    private battlePassManager:
        BattlePassManager =
        BattlePassManager.instance;

    /**
     * 页面启用时刷新。
     */
    public onEnable(): void {
        this.refreshAll();
    }

    /**
     * 刷新整个战令页面。
     */
    public refreshAll(): void {
        this.refreshTimeList();
        this.refreshTaskList();
        this.refreshGradeList();
        this.refreshRewardList();
        this.refreshExperience();
    }

    /**
     * 刷新第一周到第七周。
     */
    private refreshTimeList(): void {
        const timeList =
            this.getGList(
                this.timeListNode,
                "timelist"
            );

        if (!timeList) {
            return;
        }

        const weeks: number[] =
            Array.from(
                {
                    length:
                        BATTLE_PASS_TOTAL_WEEKS,
                },
                (_, index) => index + 1
            );

        timeList.setItems(
            weeks,
            (
                slotNode: Laya.Node,
                week: number
            ): void => {
                const timeItem =
                    slotNode.getComponent(TimeNode) as TimeNode | null;

                if (!timeItem) {
                    console.error(
                        "[BattlePassPanel] timelist格子缺少TimeNode脚本"
                    );
                    return;
                }

                timeItem.bindData(week);
            }
        );

        /**
         * 点击周按钮后切换任务列表。
         */
        timeList.onItemClick = (
            item: unknown
        ): void => {
            const week = Number(item);

            if (
                !Number.isFinite(week) ||
                week < 1 ||
                week >
                    BATTLE_PASS_TOTAL_WEEKS
            ) {
                return;
            }

            this.selectedWeek =
                Math.floor(week);

            this.refreshTaskList();
        };
    }

    /**
     * 刷新当前周任务列表。
     */
    private refreshTaskList(): void {
        const taskList =
            this.getGList(
                this.taskListNode,
                "tasklist"
            );

        if (!taskList) {
            return;
        }

        const tasks:
            BattlePassTaskViewData[] =
            this.battlePassManager
                .getWeekTaskViewData(
                    this.selectedWeek
                );

        taskList.setItems(
            tasks,
            (
                slotNode: Laya.Node,
                task: BattlePassTaskViewData
            ): void => {
                const taskItem =
                    slotNode.getComponent(TaskNode) as TaskNode | null;

                if (!taskItem) {
                    console.error(
                        "[BattlePassPanel] tasklist格子缺少TaskNode脚本"
                    );
                    return;
                }

                taskItem.bindData(task);
            }
        );
    }

    /**
     * 刷新1～60级等级列表。
     */
    private refreshGradeList(): void {
        const gradeList =
            this.getGList(
                this.gradeListNode,
                "grade"
            );

        if (!gradeList) {
            return;
        }

        const playerGrade =
            this.battlePassManager
                .getGrade();

        const grades: number[] =
            Array.from(
                {
                    length:
                        BATTLE_PASS_MAX_GRADE,
                },
                (_, index) => index + 1
            );

        gradeList.setItems(
            grades,
            (
                slotNode: Laya.Node,
                requiredGrade: number
            ): void => {
                const gradeItem =
                    slotNode.getComponent(BattlePassGradeItem) as BattlePassGradeItem | null;

                if (!gradeItem) {
                    console.error(
                        "[BattlePassPanel] grade格子缺少BattlePassGradeItem脚本"
                    );
                    return;
                }

                gradeItem.bindData(
                    requiredGrade,
                    playerGrade
                );
            }
        );
    }

    /**
     * 刷新1～60级奖励列表。
     */
    private refreshRewardList(): void {
        const rewardList =
            this.getGList(
                this.rewardListNode,
                "reward"
            );

        if (!rewardList) {
            return;
        }

        const playerGrade =
            this.battlePassManager
                .getGrade();

        const rewards:
            BattlePassRewardViewData[] =
            this.battlePassManager
                .getRewardViewData();

        rewardList.setItems(
            rewards,
            (
                slotNode: Laya.Node,
                reward:
                    BattlePassRewardViewData
            ): void => {
                const rewardItem =
                    slotNode.getComponent(BattlePassRewardItem) as BattlePassRewardItem | null;

                if (!rewardItem) {
                    console.error(
                        "[BattlePassPanel] reward格子缺少BattlePassRewardItem脚本"
                    );
                    return;
                }

                rewardItem.bindData(
                    reward,
                    playerGrade
                );
            }
        );

        /**
         * 点击奖励格子，尝试领取。
         */
        rewardList.onItemClick = (
            item: unknown
        ): void => {
            const reward =
                item as
                    BattlePassRewardViewData;

            this.onRewardClick(reward);
        };
    }

    /**
     * 刷新经验文字。
     */
    private refreshExperience(): void {
        const currentExperience =
            this.battlePassManager
                .getCurrentExperience();

        const requiredExperience =
            this.battlePassManager
                .getRequiredExperience();

        if (
            this.battlePassManager
                .isMaxGrade()
        ) {
            this.setNodeText(
                this.experienceTextNode,
                "战令等级已满"
            );

            return;
        }

        this.setNodeText(
            this.experienceTextNode,
            `${currentExperience}/${requiredExperience}`
        );
    }

    /**
     * 点击奖励格子。
     */
    private onRewardClick(
        reward:
            BattlePassRewardViewData |
            null |
            undefined
    ): void {
        if (
            !reward ||
            !reward.rewardId
        ) {
            return;
        }

        const claimedReward =
            this.battlePassManager
                .claimReward(
                    reward.rewardId
                );

        if (!claimedReward) {
            if (!reward.isUnlocked) {
                console.info(
                    `[BattlePassPanel] 战令等级不足，需要达到${reward.requiredGrade}级`
                );
                return;
            }

            if (reward.isClaimed) {
                console.info(
                    "[BattlePassPanel] 该奖励已经领取"
                );
                return;
            }

            console.info(
                "[BattlePassPanel] 当前奖励不能领取"
            );

            return;
        }

        console.info(
            `[BattlePassPanel] 领取奖励：${claimedReward.name} ×${claimedReward.amount}`
        );

        /*
         * Manager已经将奖励标记为领取。
         * 重新刷新奖励列表，让mask_1显示。
         */
        this.refreshRewardList();

        /*
         * 注意：
         * 当前还没有把奖励真正放进背包。
         * 后面需要在BattlePassManager.claimReward()
         * 中调用InventoryManager。
         */
    }

    /**
     * 获取节点上的glist脚本。
     */
    private getGList(
        node: Laya.Node | null,
        listName: string
    ): glist | null {
        if (!node) {
            console.error(
                `[BattlePassPanel] ${listName}节点未绑定`
            );
            return null;
        }

        const list =
            node.getComponent(glist) as glist | null;

        if (!list) {
            console.error(
                `[BattlePassPanel] ${listName}节点没有挂glist脚本`
            );
            return null;
        }

        return list;
    }

    /**
     * 设置文本节点内容。
     */
    private setNodeText(
        node: Laya.Node | null,
        value: string
    ): void {
        if (!node) {
            return;
        }

        const textNode =
            node as Laya.Node & {
                text?: string;
            };

        if ("text" in textNode) {
            textNode.text = value;
        }
    }
}