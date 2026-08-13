const { regClass, property } = Laya;

@regClass()
export class BattlePassGradeItem extends Laya.Script {

    /** 显示该奖励要求的战令等级 */
    @property(Laya.Node)
    public gradeTextNode: Laya.Node | null = null;

    /** 未达到等级时显示的遮罩 */
    @property(Laya.Node)
    public maskNode: Laya.Node | null = null;

    /**
     * 绑定等级数据
     *
     * @param requiredGrade 领取该行奖励所需等级
     * @param playerGrade 玩家当前战令等级
     */
    public bindData(
        requiredGrade: number,
        playerGrade: number
    ): void {
        const required = Math.max(1, Math.floor(requiredGrade));
        const current = Math.max(0, Math.floor(playerGrade));

        this.setNodeText(this.gradeTextNode, String(required));

        if (this.maskNode) {
            this.maskNode.visible = current < required;
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
}