const { regClass, property } = Laya;

@regClass()
export class JumpToScene extends Laya.Script {
    @property(String)
    public sceneUrl: string = "";

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
            owner.onClick(this, this.onJumpClick);
        } else {
            owner.on(Laya.Event.CLICK, this, this.onJumpClick);
        }
    }

    private unbindClickTarget(): void {
        if (!this.boundOwner) {
            return;
        }

        const owner = this.boundOwner as any;
        if (typeof owner.offClick === "function") {
            owner.offClick(this, this.onJumpClick);
        } else {
            this.boundOwner.off(Laya.Event.CLICK, this, this.onJumpClick);
        }

        this.boundOwner = null;
    }

    private onJumpClick(): void {
        const url = this.sceneUrl.trim();
        if (!url) {
            return;
        }

        Laya.Scene.open(url);
    }
}