const { regClass, property } = Laya;

@regClass()
export class AddDesktopButton extends Laya.Script {

    @property(Laya.Node)
    public buttonNode: Laya.Node | null = null;

    onEnable(): void {

        if (!this.buttonNode) {
            console.error("[AddDesktop] 没有绑定按钮节点");
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

        console.log("[AddDesktop] 玩家点击添加到桌面");

        this.addDesktop();
    }

    private addDesktop(): void {

        const tt = (globalThis as any).tt;

        if (!tt) {
            console.error(
                "[AddDesktop] 当前不是抖音小游戏环境"
            );
            return;
        }

        if (typeof tt.addShortcut !== "function") {
            console.error(
                "[AddDesktop] 当前环境不支持 addShortcut"
            );
            return;
        }

        // 必须在玩家点击事件中调用
        tt.addShortcut({

            success: (res: any) => {
                console.log(
                    "[AddDesktop] 添加桌面成功",
                    res
                );
            },

            fail: (err: any) => {
                console.error(
                    "[AddDesktop] 添加桌面失败",
                    err
                );
            },

            complete: (res: any) => {
                console.log(
                    "[AddDesktop] 添加桌面流程结束",
                    res
                );
            }
        });
    }
}