const { regClass, property } = Laya;

declare const tt: any;

@regClass()
export class SubscribeButton extends Laya.Script {

    @property(Laya.Node)
    public buttonNode: Laya.Node | null = null;

    @property(String)
    public templateId: string = "";

    onEnable(): void {
        if (!this.buttonNode) {
            console.error("[Subscribe] 未绑定按钮");
            return;
        }

        this.buttonNode.on(
            Laya.Event.CLICK,
            this,
            this.onClick
        );
    }

    onDisable(): void {
        if (!this.buttonNode) {
            return;
        }

        this.buttonNode.off(
            Laya.Event.CLICK,
            this,
            this.onClick
        );
    }

    private onClick(): void {
        console.log("[Subscribe] 点击订阅按钮");

        if (typeof tt === "undefined") {
            console.error("[Subscribe] 当前不是抖音小游戏环境");
            return;
        }

        if (typeof tt.requestSubscribeMessage !== "function") {
            console.error("[Subscribe] 当前不支持订阅消息");
            return;
        }

        if (!this.templateId) {
            console.error("[Subscribe] templateId 未配置");
            return;
        }

        tt.requestSubscribeMessage({
            tmplIds: [this.templateId],

            success: (res: any) => {
                console.log("[Subscribe] 订阅结果:", res);

                const result = res[this.templateId];

                if (result === "accept") {
                    console.log("[Subscribe] 用户同意订阅");
                } else if (result === "reject") {
                    console.log("[Subscribe] 用户拒绝订阅");
                } else {
                    console.log("[Subscribe] 订阅状态:", result);
                }
            },

            fail: (err: any) => {
                console.error("[Subscribe] 订阅失败:", err);
            }
        });
    }
}