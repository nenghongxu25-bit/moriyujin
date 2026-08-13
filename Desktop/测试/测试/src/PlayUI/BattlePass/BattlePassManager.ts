import {
    BATTLE_PASS_EXPERIENCE_PER_LEVEL,
    BATTLE_PASS_MAX_GRADE,
    BATTLE_PASS_REWARDS,
    BattlePassRewardConfig,
    BattlePassTaskConfig,
    BattlePassTaskType,
    getBattlePassTasksByWeek,
} from "./BattlePassConfig";

/**
 * 交给TaskNode显示的数据。
 */
export interface BattlePassTaskViewData {
    taskId: string;
    week: number;
    taskType: BattlePassTaskType;
    stage: number;
    description: string;
    currentProgress: number;
    targetProgress: number;
    rewardExperience: number;
    isCompleted: boolean;
}

/**
 * 交给RewardNode显示的数据。
 */
export interface BattlePassRewardViewData {
    rewardId: string;
    requiredGrade: number;
    itemId: string;
    name: string;
    amount: number;
    icon?: string;
    isUnlocked: boolean;
    isClaimed: boolean;
}

/**
 * 战令数据管理器。
 *
 * 负责：
 * 1. 玩家任务进度
 * 2. 任务完成判断
 * 3. 发放任务经验
 * 4. 战令升级
 * 5. 奖励是否已领取
 *
 * 当前数据只保存在内存中。
 * 后面再接入SaveManager。
 */
export class BattlePassManager {

    private static _instance:
        BattlePassManager | null = null;

    public static get instance():
        BattlePassManager {
        if (!this._instance) {
            this._instance =
                new BattlePassManager();
        }

        return this._instance;
    }

    /**
     * 玩家当前战令等级。
     *
     * 目前设置为0级：
     * 获得第一个200经验后升到1级。
     */
    private battlePassGrade: number = 0;

    /**
     * 当前等级内的经验。
     *
     * 例如：
     * 获得240经验后，等级加1，
     * 这里剩余40经验。
     */
    private battlePassExperience: number = 0;

    /**
     * 各周各类型任务的累计进度。
     *
     * 示例：
     * week1_defeat_enemy = 第一周击败敌人的累计数量
     */
    private taskProgress:
        Map<string, number> = new Map([
            ["week1_defeat_enemy", 0],
            ["week1_collect_resource", 0],
            ["week1_sign_in", 0],
        ]);

    /**
     * 已经发放过经验的任务ID。
     *
     * 防止刷新或重复增加进度时，
     * 同一个阶段任务反复增加经验。
     */
    private rewardedTaskIds:
        Set<string> = new Set();

    /**
     * 已经领取的战令等级奖励ID。
     */
    private claimedRewardIds:
        Set<string> = new Set();

    private constructor() {}

    /**
     * 获取玩家当前战令等级。
     */
    public getGrade(): number {
        return this.battlePassGrade;
    }

    /**
     * 获取当前等级内经验。
     */
    public getCurrentExperience(): number {
        return this.battlePassExperience;
    }

    /**
     * 获取升到下一级所需经验。
     */
    public getRequiredExperience(): number {
        return BATTLE_PASS_EXPERIENCE_PER_LEVEL;
    }

    /**
     * 是否达到最高等级。
     */
    public isMaxGrade(): boolean {
        return (
            this.battlePassGrade >=
            BATTLE_PASS_MAX_GRADE
        );
    }

    /**
     * 获取指定周用于页面显示的任务数据。
     */
    public getWeekTaskViewData(
        week: number
    ): BattlePassTaskViewData[] {
        const configs =
            getBattlePassTasksByWeek(week);

        return configs.map(
            config =>
                this.createTaskViewData(
                    config
                )
        );
    }

    /**
     * 获取1～60级用于奖励列表显示的数据。
     */
    public getRewardViewData():
        BattlePassRewardViewData[] {
        return BATTLE_PASS_REWARDS.map(
            reward =>
                this.createRewardViewData(
                    reward
                )
        );
    }

    /**
     * 增加任务进度。
     *
     * 示例：
     *
     * 击败一个敌人：
     * addProgress(1, "defeat_enemy", 1);
     *
     * 采集一个物资点：
     * addProgress(1, "collect_resource", 1);
     */
    public addProgress(
        week: number,
        taskType: BattlePassTaskType,
        amount: number = 1
    ): void {
        const safeWeek = Math.max(
            1,
            Math.floor(week)
        );

        const safeAmount = Math.max(
            0,
            Math.floor(amount)
        );

        if (safeAmount <= 0) {
            return;
        }

        const progressKey =
            this.getProgressKey(
                safeWeek,
                taskType
            );

        const oldProgress =
            this.taskProgress.get(
                progressKey
            ) ?? 0;

        const newProgress =
            oldProgress + safeAmount;

        this.taskProgress.set(
            progressKey,
            newProgress
        );

        this.checkCompletedTasks(
            safeWeek,
            taskType,
            newProgress
        );
    }

    /**
     * 直接设置某类任务的进度。
     *
     * 签到天数这类数据可以使用这个方法。
     */
    public setProgress(
        week: number,
        taskType: BattlePassTaskType,
        progress: number
    ): void {
        const safeWeek = Math.max(
            1,
            Math.floor(week)
        );

        const safeProgress = Math.max(
            0,
            Math.floor(progress)
        );

        const progressKey =
            this.getProgressKey(
                safeWeek,
                taskType
            );

        this.taskProgress.set(
            progressKey,
            safeProgress
        );

        this.checkCompletedTasks(
            safeWeek,
            taskType,
            safeProgress
        );
    }

    /**
     * 获取某周某类任务的当前累计进度。
     */
    public getProgress(
        week: number,
        taskType: BattlePassTaskType
    ): number {
        const progressKey =
            this.getProgressKey(
                week,
                taskType
            );

        return (
            this.taskProgress.get(
                progressKey
            ) ?? 0
        );
    }

    /**
     * 给玩家增加战令经验。
     *
     * 每满200经验升一级，
     * 升级后减去200经验。
     */
    public addExperience(
        amount: number
    ): void {
        const safeAmount = Math.max(
            0,
            Math.floor(amount)
        );

        if (
            safeAmount <= 0 ||
            this.isMaxGrade()
        ) {
            return;
        }

        this.battlePassExperience +=
            safeAmount;

        while (
            this.battlePassExperience >=
                BATTLE_PASS_EXPERIENCE_PER_LEVEL &&
            this.battlePassGrade <
                BATTLE_PASS_MAX_GRADE
        ) {
            this.battlePassExperience -=
                BATTLE_PASS_EXPERIENCE_PER_LEVEL;

            this.battlePassGrade++;
        }

        if (this.isMaxGrade()) {
            this.battlePassGrade =
                BATTLE_PASS_MAX_GRADE;

            this.battlePassExperience = 0;
        }
    }

    /**
     * 判断某一级奖励能否领取。
     */
    public canClaimReward(
        rewardId: string
    ): boolean {
        const reward =
            this.getRewardConfig(
                rewardId
            );

        if (!reward) {
            return false;
        }

        const isUnlocked =
            this.battlePassGrade >=
            reward.requiredGrade;

        const isClaimed =
            this.claimedRewardIds.has(
                rewardId
            );

        return (
            isUnlocked &&
            !isClaimed
        );
    }

    /**
     * 标记奖励已经领取。
     *
     * 当前这里只修改领取状态，
     * 还没有真正把物品放进背包。
     *
     * 后面需要在这里调用InventoryManager。
     */
    public claimReward(
        rewardId: string
    ): BattlePassRewardConfig | null {
        if (
            !this.canClaimReward(
                rewardId
            )
        ) {
            return null;
        }

        const reward =
            this.getRewardConfig(
                rewardId
            );

        if (!reward) {
            return null;
        }

        this.claimedRewardIds.add(
            rewardId
        );

        return {
            ...reward,
        };
    }

    /**
     * 判断奖励是否已经领取。
     */
    public isRewardClaimed(
        rewardId: string
    ): boolean {
        return this.claimedRewardIds.has(
            rewardId
        );
    }

    /**
     * 检查新完成的阶段任务，
     * 并自动发放战令经验。
     */
    private checkCompletedTasks(
        week: number,
        taskType: BattlePassTaskType,
        currentProgress: number
    ): void {
        const configs =
            getBattlePassTasksByWeek(
                week
            ).filter(
                task =>
                    task.taskType ===
                    taskType
            );

        for (const task of configs) {
            const isCompleted =
                currentProgress >=
                task.targetProgress;

            const hasRewarded =
                this.rewardedTaskIds.has(
                    task.taskId
                );

            if (
                !isCompleted ||
                hasRewarded
            ) {
                continue;
            }

            this.rewardedTaskIds.add(
                task.taskId
            );

            this.addExperience(
                task.rewardExperience
            );
        }
    }

    /**
     * 将任务配置和玩家进度合并，
     * 生成TaskNode需要的数据。
     */
    private createTaskViewData(
        config: BattlePassTaskConfig
    ): BattlePassTaskViewData {
        const rawProgress =
            this.getProgress(
                config.week,
                config.taskType
            );

        const currentProgress =
            Math.min(
                rawProgress,
                config.targetProgress
            );

        return {
            taskId: config.taskId,
            week: config.week,
            taskType: config.taskType,
            stage: config.stage,
            description:
                config.description,
            currentProgress,
            targetProgress:
                config.targetProgress,
            rewardExperience:
                config.rewardExperience,
            isCompleted:
                rawProgress >=
                config.targetProgress,
        };
    }

    /**
     * 将奖励配置和玩家状态合并，
     * 生成RewardNode需要的数据。
     */
    private createRewardViewData(
        reward: BattlePassRewardConfig
    ): BattlePassRewardViewData {
        return {
            rewardId: reward.rewardId,
            requiredGrade:
                reward.requiredGrade,
            itemId: reward.itemId,
            name: reward.name,
            amount: reward.amount,
            icon: reward.icon,
            isUnlocked:
                this.battlePassGrade >=
                reward.requiredGrade,
            isClaimed:
                this.claimedRewardIds.has(
                    reward.rewardId
                ),
        };
    }

    /**
     * 根据奖励ID获取固定配置。
     */
    private getRewardConfig(
        rewardId: string
    ): BattlePassRewardConfig | null {
        return (
            BATTLE_PASS_REWARDS.find(
                reward =>
                    reward.rewardId ===
                    rewardId
            ) ?? null
        );
    }

    /**
     * 生成任务进度存储键。
     */
    private getProgressKey(
        week: number,
        taskType: BattlePassTaskType
    ): string {
        return `week${week}_${taskType}`;
    }
}