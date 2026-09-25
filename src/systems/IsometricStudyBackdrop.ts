const { regClass } = Laya;

/** Background color for the native 2D isometric study scenes. */
@regClass()
export class IsometricStudyBackdrop extends Laya.Script {
    private previous = "";

    onEnable(): void {
        this.previous = Laya.stage.bgColor;
        Laya.stage.bgColor = "#eee9e0";
    }

    onDisable(): void {
        Laya.stage.bgColor = this.previous;
    }
}
