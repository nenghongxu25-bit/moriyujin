const { regClass } = Laya;

/** Center the existing fixed-width HUD inside the expanded mini-game stage. */
@regClass("d6686b69-ea29-463d-95b8-5e22b631036f")
export class DesignWidthCenter extends Laya.Script {
    onEnable(): void {
        Laya.stage.on(Laya.Event.RESIZE, this, this.updatePosition);
        this.updatePosition();
        Laya.timer.callLater(this, this.updatePosition);
    }

    onDisable(): void {
        Laya.stage.off(Laya.Event.RESIZE, this, this.updatePosition);
        Laya.timer.clear(this, this.updatePosition);
    }

    private updatePosition(): void {
        const root = this.owner as Laya.Sprite;
        if (!root || root.destroyed) return;
        // UILayer uses stage coordinates; keep every child and vertical offset intact.
        root.x = (Laya.stage.width - root.width * root.scaleX) / 2;
    }
}
