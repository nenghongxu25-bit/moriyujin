const { regClass, property } = Laya;

@regClass()
export class CloseSprite extends Laya.Script {
    @property({ type: Laya.Node })
    public targetNode: Laya.Node | null = null;

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
            owner.onClick(this, this.onCloseClick);
        } else {
            owner.on(Laya.Event.CLICK, this, this.onCloseClick);
        }
    }

    private unbindClickTarget(): void {
        if (!this.boundOwner) {
            return;
        }

        const owner = this.boundOwner as any;
        if (typeof owner.offClick === "function") {
            owner.offClick(this, this.onCloseClick);
        } else {
            this.boundOwner.off(Laya.Event.CLICK, this, this.onCloseClick);
        }

        this.boundOwner = null;
    }

    private onCloseClick(): void {
        if (this.targetNode) {
            (this.targetNode as any).visible = false;
        }
    }
}