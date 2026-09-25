const { regClass, property } = Laya;
import { RangedAimState } from "./RangedAimState";

@regClass()
export class PlayerCamera2D extends Laya.Script {
    public static throwAimActive = false;
    @property({ type: Number, caption: "瞄准镜头前移距离" })
    public aimLookAhead = 180;
    @property({ type: Number, caption: "镜头过渡秒数" })
    public aimSmoothSeconds = 0.18;
    private offsetX = 0;
    private offsetY = 0;
    private throwZoomRatio = 1;
    private baseZoom: Laya.Vector2 | null = null;
    private readonly zoomValue = new Laya.Vector2(1, 1);
    @property({ type: Number, caption: "投掷瞄准缩放比例" })
    public throwAimZoom = 0.55;
    onAwake(): void {
        this.applyCameraState();
    }

    onEnable(): void {
        this.applyCameraState();
    }

    onUpdate(): void {
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
        const dt = Math.min(0.1, Math.max(0, Laya.timer.delta || 0) / 1000);
        const blend = this.aimSmoothSeconds <= 0 ? 1 : 1 - Math.exp(-dt / this.aimSmoothSeconds);
        if (!this.baseZoom) this.baseZoom = new Laya.Vector2(camera.zoom.x, camera.zoom.y);
        const aimZoom = Number.isFinite(this.throwAimZoom) ? Math.max(0.2, Math.min(1, this.throwAimZoom)) : 0.55;
        const targetZoom = PlayerCamera2D.throwAimActive ? aimZoom : 1;
        this.throwZoomRatio += (targetZoom - this.throwZoomRatio) * blend;
        if (Math.abs(targetZoom - this.throwZoomRatio) < 0.001) this.throwZoomRatio = targetZoom;
        // Camera2D zoom scales the visible world span, so a smaller visual ratio
        // requires a larger camera zoom value.
        this.zoomValue.setValue(this.baseZoom.x / this.throwZoomRatio, this.baseZoom.y / this.throwZoomRatio);
        camera.zoom = this.zoomValue;
        const distance = RangedAimState.active ? Math.max(0, this.aimLookAhead) * RangedAimState.amount : 0;
        const x = RangedAimState.x * distance, y = RangedAimState.y * distance;
        this.offsetX += (x - this.offsetX) * blend;
        this.offsetY += (y - this.offsetY) * blend;
        if (Math.abs(x - this.offsetX) < 0.01) this.offsetX = x;
        if (Math.abs(y - this.offsetY) < 0.01) this.offsetY = y;
        // The camera is a child of the player; compensate any mirrored parent.
        let sx = 1, sy = 1;
        for (let node: any = camera.parent; node; node = node.parent) {
            sx *= typeof node.scaleX === "number" ? node.scaleX : 1;
            sy *= typeof node.scaleY === "number" ? node.scaleY : 1;
        }
        camera.x = this.offsetX / (sx || 1);
        camera.y = this.offsetY / (sy || 1);
        RangedAimState.cameraOffsetX = this.offsetX;
        RangedAimState.cameraOffsetY = this.offsetY;
    }

    onDisable(): void {
        PlayerCamera2D.throwAimActive = false;
        this.offsetX = this.offsetY = 0;
        this.throwZoomRatio = 1;
        if (this.baseZoom && this.owner instanceof Laya.Camera2D) this.owner.zoom = this.baseZoom;
        this.baseZoom = null;
        (this.owner as Laya.Sprite).pos(0, 0);
        RangedAimState.reset();
        RangedAimState.cameraOffsetX = RangedAimState.cameraOffsetY = 0;
    }
}
