const { regClass } = Laya;

@regClass()
export class PlayerCamera2D extends Laya.Script {
    onAwake(): void {
        this.applyCameraState();
    }

    onEnable(): void {
        this.applyCameraState();
    }

    onLateUpdate(): void {
        this.applyCameraState();
    }

    private applyCameraState(): void {
        const camera = this.owner as Laya.Camera2D;

        if (!(camera instanceof Laya.Camera2D)) {
            return;
        }

        camera.isMain = true;
        camera.ignoreRotation = true;
        camera.positionSmooth = false;
        camera.positionSpeed = 0;
        camera.x = 0;
        camera.y = 0;
    }
}