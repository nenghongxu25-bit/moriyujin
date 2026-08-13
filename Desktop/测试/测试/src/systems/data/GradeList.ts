import {
    BattlePassGradeItem,
} from "../../PlayUI/BattlePass/BattlePassGradeItem";

const { regClass, property } = Laya;

@regClass()
export class GradeList extends Laya.Script {

    /** grade列表节点 */
    @property(Laya.Node)
    public listNode: Laya.Node | null = null;

    private maxGrade: number = 0;
    private playerGrade: number = 0;

    public setGrades(
        maxGrade: number,
        playerGrade: number
    ): void {
        this.maxGrade = Math.max(
            0,
            Math.floor(maxGrade)
        );

        this.playerGrade = Math.max(
            0,
            Math.floor(playerGrade)
        );

        this.setItemCount(this.maxGrade);
        this.refresh();
    }

    public refresh(): void {
        const children = this.listNode?.children || [];

        for (let i = 0; i < this.maxGrade; i++) {
            const slotNode = children[i];
            if (!slotNode) {
                continue;
            }

            const item = slotNode.getComponent(
                BattlePassGradeItem
            ) as BattlePassGradeItem | null;

            if (!item) {
                console.error(
                    `[GradeList] 第${i}个格子缺少BattlePassGradeItem`
                );
                continue;
            }

            item.bindData(
                i + 1,
                this.playerGrade
            );
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