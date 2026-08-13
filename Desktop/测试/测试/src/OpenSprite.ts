const { regClass, property } = Laya;

@regClass()
export class OpenSprite extends Laya.Script {
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
            owner.onClick(this, this.onOpenClick);
        } else {
            owner.on(Laya.Event.CLICK, this, this.onOpenClick);
        }
    }

    private unbindClickTarget(): void {
        if (!this.boundOwner) {
            return;
        }

        const owner = this.boundOwner as any;
        if (typeof owner.offClick === "function") {
            owner.offClick(this, this.onOpenClick);
        } else {
            this.boundOwner.off(Laya.Event.CLICK, this, this.onOpenClick);
        }

        this.boundOwner = null;
    }

    private onOpenClick(): void {
        if (this.targetNode) {
            (this.targetNode as any).visible = true;
        }
    }
}