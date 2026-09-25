const { regClass } = Laya;

/** Scene-local backdrop; no gameplay or UI is created. */
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
