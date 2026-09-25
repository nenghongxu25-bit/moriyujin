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
            return;
        }

        this.boundOwner = owner;
        owner.mouseEnabled = true;

        if ("mouseThrough" in owner) {
            owner.mouseThrough = false;
        }

        if (typeof owner.onClick === "function") {
            owner.onClick(this, this.onButtonClick);
        } else {
            owner.on(Laya.Event.CLICK, this, this.onButtonClick);
        }
    }

    private unbindClickTarget(): void {
        if (!this.boundOwner) {
            return;
        }

        const owner = this.boundOwner as any;
        if (typeof owner.offClick === "function") {
            owner.offClick(this, this.onButtonClick);
        } else {
            this.boundOwner.off(Laya.Event.CLICK, this, this.onButtonClick);
        }

        this.boundOwner = null;
    }

    private onButtonClick(): void {
        const tt = (globalThis as any).tt;
        if (!tt || typeof tt.navigateToScene !== "function") {
            return;
        }

        const targetScene = String(this.scene || "").trim() || "sidebar";

        if (typeof tt.checkScene === "function") {
            tt.checkScene({
                scene: targetScene,
                success: () => {
                    this.navigateToSidebar(tt, targetScene);
                },
                fail: () => {
                    // ignore
                },
            });
            return;
        }

        this.navigateToSidebar(tt, targetScene);
    }

    private navigateToSidebar(tt: any, targetScene: string): void {
        tt.navigateToScene({
            scene: targetScene,
            success: () => {
                // ignore
            },
            fail: () => {
                // ignore
            },
            complete: () => {
                // ignore
            },
        });
    }
}