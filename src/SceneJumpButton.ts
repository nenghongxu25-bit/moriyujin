const { regClass, property } = Laya;

@regClass()
export class SceneJumpButton extends Laya.Script {
    @property(String)
    scenePath = "main.ls";

    @property(Boolean)
    closeOther = true;

    private button!: Laya.Node;

    onAwake(): void {
        this.button = this.owner as Laya.Node;
        this.button.mouseEnabled = true;
        this.button.on(Laya.Event.CLICK, this, this.jumpScene);
    }

    onDestroy(): void {
        this.button?.off(Laya.Event.CLICK, this, this.jumpScene);
    }

    private jumpScene(): void {
        if (!this.scenePath) {
            return;
        }

        Laya.Scene.open(this.scenePath, this.closeOther);
    }
}
