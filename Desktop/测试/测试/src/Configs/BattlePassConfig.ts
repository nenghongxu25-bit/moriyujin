/**
 * 战令任务类型
 */
export type BattlePassTaskType =
    | "defeat_enemy"
    | "collect_resource"
    | "sign_in";

/**
 * 固定任务配置
 */
export interface BattlePassTaskConfig {
    /** 任务唯一ID */
    taskId: string;

    /** 所属周数 */
    week: number;

    /** 任务类型 */
    taskType: BattlePassTaskType;

    /** 阶段：1、2、3 */
    stage: number;

    /** 显示内容 */
    description: string;

    /** 任务目标 */
    targetProgress: number;

    /** 完成后获得的战令经验 */
    rewardExperience: number;
}

/**
 * 战令奖励配置
 */
export interface BattlePassRewardConfig {
    /** 奖励唯一ID */
    rewardId: string;

    /** 领取奖励需要达到的等级 */
    requiredGrade: number;

    /** 物品ID */
    itemId: string;

    /** 物品显示名称 */
    name: string;

    /** 奖励数量 */
    amount: number;

    /** 物品图片路径 */
    icon?: string;
}

/**
 * 战令总周数
 */
export const BATTLE_PASS_TOTAL_WEEKS = 7;

/**
 * 战令最高等级
 */
export const BATTLE_PASS_MAX_GRADE = 60;

/**
 * 每升一级需要的经验
 */
export const BATTLE_PASS_EXPERIENCE_PER_LEVEL = 200;

/**
 * 第一周任务
 */
export const WEEK_1_BATTLE_PASS_TASKS:
    BattlePassTaskConfig[] = [
        // ==================== 击败敌人 ====================

        {
            taskId: "week1_defeat_enemy_stage1",
            week: 1,
            taskType: "defeat_enemy",
            stage: 1,
            description: "击败20个敌人",
            targetProgress: 20,
            rewardExperience: 40,
        },
        {
            taskId: "week1_defeat_enemy_stage2",
            week: 1,
            taskType: "defeat_enemy",
            stage: 2,
            description: "击败50个敌人",
            targetProgress: 50,
            rewardExperience: 100,
        },
        {
            taskId: "week1_defeat_enemy_stage3",
            week: 1,
            taskType: "defeat_enemy",
            stage: 3,
            description: "击败100个敌人",
            targetProgress: 100,
            rewardExperience: 200,
        },

        // ==================== 采集物资点 ====================

        {
            taskId: "week1_collect_resource_stage1",
            week: 1,
            taskType: "collect_resource",
            stage: 1,
            description: "采集20个物资点",
            targetProgress: 20,
            rewardExperience: 40,
        },
        {
            taskId: "week1_collect_resource_stage2",
            week: 1,
            taskType: "collect_resource",
            stage: 2,
            description: "采集50个物资点",
            targetProgress: 50,
            rewardExperience: 100,
        },
        {
            taskId: "week1_collect_resource_stage3",
            week: 1,
            taskType: "collect_resource",
            stage: 3,
            description: "采集100个物资点",
            targetProgress: 100,
            rewardExperience: 200,
        },

        // ==================== 签到 ====================

        {
            taskId: "week1_sign_in_stage1",
            week: 1,
            taskType: "sign_in",
            stage: 1,
            description: "签到1天",
            targetProgress: 1,
            rewardExperience: 40,
        },
        {
            taskId: "week1_sign_in_stage2",
            week: 1,
            taskType: "sign_in",
            stage: 2,
            description: "签到3天",
            targetProgress: 3,
            rewardExperience: 100,
        },
        {
            taskId: "week1_sign_in_stage3",
            week: 1,
            taskType: "sign_in",
            stage: 3,
            description: "签到5天",
            targetProgress: 5,
            rewardExperience: 200,
        },
    ];

/**
 * 全部战令任务。
 *
 * 后面完成第二周时，将第二周任务继续添加进来。
 */
export const BATTLE_PASS_TASKS:
    BattlePassTaskConfig[] = [
        ...WEEK_1_BATTLE_PASS_TASKS,
    ];

/**
 * 10级一个循环的战令奖励。
 *
 * 这里的itemId之后要改成你ItemConfig里的真实ID。
 */
const BATTLE_PASS_REWARD_CYCLE: Array<
    Omit<
        BattlePassRewardConfig,
        "rewardId" | "requiredGrade"
    >
> = [
    {
        itemId: "wood",
        name: "木头",
        amount: 20,
    },
    {
        itemId: "stone",
        name: "石头",
        amount: 20,
    },
    {
        itemId: "grass",
        name: "草",
        amount: 20,
    },
    {
        itemId: "bandage",
        name: "绷带",
        amount: 3,
    },
    {
        itemId: "baseball_bat",
        name: "棒球棍",
        amount: 1,
    },
    {
        itemId: "wood",
        name: "木头",
        amount: 20,
    },
    {
        itemId: "stone",
        name: "石头",
        amount: 20,
    },
    {
        itemId: "grass",
        name: "草",
        amount: 20,
    },
    {
        itemId: "bandage",
        name: "绷带",
        amount: 3,
    },
    {
        itemId: "knife",
        name: "小刀",
        amount: 1,
    },
];

/**
 * 自动生成1～60级战令奖励。
 */
export const BATTLE_PASS_REWARDS:
    BattlePassRewardConfig[] = Array.from(
        {
            length: BATTLE_PASS_MAX_GRADE,
        },
        (
            _,
            index
        ): BattlePassRewardConfig => {
            const requiredGrade = index + 1;

            const cycleIndex =
                index %
                BATTLE_PASS_REWARD_CYCLE.length;

            const reward =
                BATTLE_PASS_REWARD_CYCLE[
                    cycleIndex
                ];

            return {
                rewardId:
                    `battle_pass_grade_${requiredGrade}`,
                requiredGrade,
                itemId: reward.itemId,
                name: reward.name,
                amount: reward.amount,
                icon: reward.icon,
            };
        }
    );

/**
 * 获取指定周的任务。
 */
export function getBattlePassTasksByWeek(
    week: number
): BattlePassTaskConfig[] {
    return BATTLE_PASS_TASKS.filter(
        task => task.week === week
    );
}

/**
 * 获取指定等级的奖励。
 */
export function getBattlePassRewardByGrade(
    grade: number
): BattlePassRewardConfig | null {
    return (
        BATTLE_PASS_REWARDS.find(
            reward =>
                reward.requiredGrade === grade
        ) ?? null
    );
}