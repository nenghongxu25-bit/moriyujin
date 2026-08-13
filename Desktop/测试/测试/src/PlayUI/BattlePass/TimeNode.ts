const { regClass, property } = Laya;

@regClass()
export class TimeNode extends Laya.Script {

    /** 显示“第一周”至“第七周” */
    @property(Laya.Node)
    public weekTextNode: Laya.Node | null = null;

    public bindData(week: number): void {
        const safeWeek = Math.max(1, Math.min(7, Math.floor(week)));

        this.setNodeText(
            this.weekTextNode,
            `第${this.toChineseNumber(safeWeek)}周`
        );
    }

    private toChineseNumber(value: number): string {
        const numbers = [
            "",
            "一",
            "二",
            "三",
            "四",
            "五",
            "六",
            "七"
        ];

        return numbers[value];
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