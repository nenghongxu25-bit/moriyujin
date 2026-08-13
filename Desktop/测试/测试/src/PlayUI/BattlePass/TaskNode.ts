const { regClass, property } = Laya;

import type { BattlePassTaskViewData } from "./BattlePassManager";

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

    public bindData(task: BattlePassTaskViewData): void {
        this.setNodeText(this.taskTextNode, task.description);
        this.setNodeText(
            this.progressTextNode,
            `${Math.max(0, Math.floor(task.currentProgress))}/${Math.max(0, Math.floor(task.targetProgress))}`
        );

        if (this.completeNode) {
            this.completeNode.visible = !!task.isCompleted;
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