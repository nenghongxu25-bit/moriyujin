const { regClass, property } = Laya;

export interface MailListItemData {
    mailId: string;
    title: string;
    createdAt: number;
    isRead: boolean;
}

@regClass()
export class MailTemplate extends Laya.Script {

    @property(Laya.Node)
    public titleText: Laya.Node | null = null;

    @property(Laya.Node)
    public timeText: Laya.Node | null = null;

    // 点击这封邮件后显示的节点
    @property(Laya.Node)
    public targetNode: Laya.Node | null = null;

    private boundData: MailListItemData | null = null;


    onAwake(): void {
        this.owner.on(
            Laya.Event.CLICK,
            this,
            this.onClick
        );
    }


    onDestroy(): void {
        this.owner.off(
            Laya.Event.CLICK,
            this,
            this.onClick
        );
    }


    public bindData(
        data: MailListItemData | null
    ): void {

        this.boundData =
            data ? { ...data } : null;

        const title = this.titleText as any;
        const time = this.timeText as any;


        if (!data) {

            if (title) {
                title.text = "";
            }

            if (time) {
                time.text = "";
            }

            return;
        }


        if (title) {
            title.text = data.title;
        }


        if (time) {
            time.text = this.formatDate(
                data.createdAt
            );
        }
    }


    public getBoundData():
        MailListItemData | null {

        return this.boundData
            ? { ...this.boundData }
            : null;
    }


    private onClick(): void {

        // 没有邮件数据，不处理
        if (!this.boundData) {
            return;
        }


        // 显示目标节点
        if (this.targetNode) {

            const target =
                this.targetNode as any;

            if ("visible" in target) {
                target.visible = true;
            }

            if ("active" in target) {
                target.active = true;
            }
        }
    }


    private formatDate(
        timestamp: number
    ): string {

        const date =
            new Date(timestamp);

        const year =
            date.getFullYear();

        const month =
            date.getMonth() + 1;

        const day =
            date.getDate();


        return `${year}/${month}/${day}`;
    }
}