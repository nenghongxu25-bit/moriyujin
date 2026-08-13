const { regClass, property } = Laya;

@regClass()
export class BattlePassPanel extends Laya.Script {

    /** 第一周到第七周 */
    @property(Laya.Node)
    public timeListNode: Laya.Node | null = null;

    /** 当前周任务列表 */
    @property(Laya.Node)
    public taskListNode: Laya.Node | null = null;

    /** 战令等级列表 */
    @property(Laya.Node)
    public gradeListNode: Laya.Node | null = null;

    /** 战令奖励列表 */
    @property(Laya.Node)
    public rewardListNode: Laya.Node | null = null;

    /** 当前等级经验，例如：120/200 */
    @property(Laya.Node)
    public experienceTextNode: Laya.Node | null = null;

    /**
     * 刷新战令经验显示
     *
     * @param currentExperience 当前等级已获得经验
     * @param requiredExperience 升到下一级需要的经验
     */
    public setExperience(
        currentExperience: number,
        requiredExperience: number
    ): void {
        const required = Math.max(
            1,
            Math.floor(requiredExperience)
        );

        const current = Math.max(
            0,
            Math.min(Math.floor(currentExperience), required)
        );

        this.setNodeText(
            this.experienceTextNode,
            `${current}/${required}`
        );
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