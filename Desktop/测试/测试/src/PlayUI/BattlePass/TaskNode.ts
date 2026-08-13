const { regClass, property } = Laya;

@regClass()
export class BattlePassTaskItem extends Laya.Script {

    /** 任务内容 */
    @property(Laya.Node)
    public taskTextNode: Laya.Node | null = null;

    /** 任务进度，例如 4/20 */
    @property(Laya.Node)
    public progressTextNode: Laya.Node | null = null;

    /** 完成标记，默认隐藏 */
    @property(Laya.Node)
    public completeNode: Laya.Node | null = null;
}