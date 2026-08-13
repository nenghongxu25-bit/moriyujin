const { regClass, property } = Laya;

export interface BattlePassRewardData {
    rewardId: string;

    /** 奖励要求的战令等级 */
    requiredGrade: number;

    /** 奖励物品信息 */
    itemId: string;
    name: string;
    amount: number;
    icon?: string;

    /** 是否已经领取 */
    isClaimed: boolean;
}

@regClass()
export class BattlePassRewardItem extends Laya.Script {

    /** 格子背景，同时作为点击区域 */
    @property(Laya.Node)
    public itemNode: Laya.Node | null = null;

    /** 奖励图标 */
    @property(Laya.Node)
    public iconNode: Laya.Node | null = null;

    /** 奖励名称 */
    @property(Laya.Node)
    public nameTextNode: Laya.Node | null = null;

    /** 奖励数量 */
    @property(Laya.Node)
    public amountTextNode: Laya.Node | null = null;

    /** 等级未达到时显示，对应 mask_0 */
    @property(Laya.Node)
    public maskLockedNode: Laya.Node | null = null;

    /** 奖励领取后显示，对应 mask_1 */
    @property(Laya.Node)
    public maskClaimedNode: Laya.Node | null = null;

    private rewardData: BattlePassRewardData | null = null;
    private playerGrade: number = 0;

    public bindData(
        reward: BattlePassRewardData,
        playerGrade: number
    ): void {
        this.rewardData = reward;
        this.playerGrade = Math.max(0, Math.floor(playerGrade));

        this.setNodeText(this.nameTextNode, reward.name);
        this.setNodeText(
            this.amountTextNode,
            `×${Math.max(1, Math.floor(reward.amount))}`
        );

        this.setIcon(reward.icon);
        this.refreshState();
    }

    private refreshState(): void {
        if (!this.rewardData) {
            return;
        }

        const isUnlocked =
            this.playerGrade >= this.rewardData.requiredGrade;

        const isClaimed =
            isUnlocked && this.rewardData.isClaimed;

        if (this.maskLockedNode) {
            this.maskLockedNode.visible = !isUnlocked;
        }

        if (this.maskClaimedNode) {
            this.maskClaimedNode.visible = isClaimed;
        }
    }

    private setNodeText(
        node: Laya.Node | null,
        value: string
    ): void {
        if (!node) {
            return;
        }

        const textNode = node as Laya.Node & {
            text?: string;
        };

        if ("text" in textNode) {
            textNode.text = value;
        }
    }

    private setIcon(icon: string | undefined): void {
        if (!this.iconNode) {
            return;
        }

        const imageNode = this.iconNode as Laya.Node & {
            skin?: string;
            url?: string;
        };

        if ("skin" in imageNode) {
            imageNode.skin = icon ?? "";
            return;
        }

        if ("url" in imageNode) {
            imageNode.url = icon ?? "";
        }
    }
}