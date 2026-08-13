const { regClass, property } = Laya;

@regClass()
export class SidebarNavigateButton extends Laya.Script {

    @property(String)
    public scene: string = "sidebar";

    private boundOwner: Laya.Node | null = null;


    onAwake(): void {
        this.bindClickTarget();
    }


    onEnable(): void {
        this.bindClickTarget();
    }


    onDisable(): void {
        this.unbindClickTarget();
    }


    onDestroy(): void {
        this.unbindClickTarget();
    }


    private bindClickTarget(): void {

        this.unbindClickTarget();

        const owner = this.owner as any;

        if (!owner) {
            console.log("[Sidebar] bind failed: owner不存在");
            return;
        }

        this.boundOwner = owner;

        owner.mouseEnabled = true;

        if ("mouseThrough" in owner) {
            owner.mouseThrough = false;
        }

        if (typeof owner.onClick === "function") {

            owner.onClick(
                this,
                this.onButtonClick
            );

        } else {

            owner.on(
                Laya.Event.CLICK,
                this,
                this.onButtonClick
            );
        }

        console.log("[Sidebar] button bound");
    }


    private unbindClickTarget(): void {

        if (!this.boundOwner) {
            return;
        }

        const owner = this.boundOwner as any;

        if (typeof owner.offClick === "function") {

            owner.offClick(
                this,
                this.onButtonClick
            );

        } else {

            this.boundOwner.off(
                Laya.Event.CLICK,
                this,
                this.onButtonClick
            );
        }

        this.boundOwner = null;
    }


    private onButtonClick(): void {

        console.log("[Sidebar] button clicked");

        const tt = (globalThis as any).tt;

        // ==========================
        // 1. 检查是不是抖音运行环境
        // ==========================

        if (!tt) {

            console.log(
                "[Sidebar] FAIL: tt不存在，当前不是抖音小游戏环境"
            );

            return;
        }


        // ==========================
        // 2. 检查API是否存在
        // ==========================

        if (typeof tt.navigateToScene !== "function") {

            console.log(
                "[Sidebar] FAIL: tt.navigateToScene不存在"
            );

            return;
        }


        const targetScene =
            String(this.scene || "").trim()
            || "sidebar";


        console.log(
            "[Sidebar] target scene = " +
            targetScene
        );


        // ==========================
        // 3. 先检查sidebar是否支持
        // ==========================

        if (typeof tt.checkScene === "function") {

            console.log(
                "[Sidebar] checking sidebar support..."
            );

            tt.checkScene({

                scene: targetScene,

                success: (res: any) => {

                    console.log(
                        "[Sidebar] checkScene success: " +
                        JSON.stringify(res)
                    );

                    // 支持后再跳转
                    this.navigateToSidebar(
                        tt,
                        targetScene
                    );
                },

                fail: (error: any) => {

                    console.log(
                        "[Sidebar] checkScene FAIL: " +
                        JSON.stringify(error)
                    );
                }
            });

            return;
        }


        // ==========================
        // 4. 没有checkScene时直接尝试
        // ==========================

        console.log(
            "[Sidebar] checkScene不存在，直接尝试navigateToScene"
        );

        this.navigateToSidebar(
            tt,
            targetScene
        );
    }


    private navigateToSidebar(
        tt: any,
        targetScene: string
    ): void {

        console.log(
            "[Sidebar] navigateToScene start"
        );

        tt.navigateToScene({

            scene: targetScene,


            success: (res: any) => {

                console.log(
                    "[Sidebar] NAVIGATE SUCCESS"
                );

                console.log(
                    "[Sidebar] success data: " +
                    JSON.stringify(res || {})
                );
            },


            fail: (error: any) => {

                console.log(
                    "[Sidebar] NAVIGATE FAIL"
                );

                console.log(
                    "[Sidebar] error: " +
                    JSON.stringify(error || {})
                );
            },


            complete: (res: any) => {

                console.log(
                    "[Sidebar] navigate complete: " +
                    JSON.stringify(res || {})
                );
            }
        });
    }
}