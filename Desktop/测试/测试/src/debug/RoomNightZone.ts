const { regClass, property } = Laya;

/** A room's editor-authored black rectangle and its reusable night exclusion. */
@regClass("ea0adccf-1276-4447-bd10-35cd1242e487")
export class RoomNightZone extends Laya.Script {
    @property({ type: Boolean, caption: "房间开灯" })
    public lightsOn: boolean = true;

    @property({ type: Laya.Sprite, caption: "黑夜扣除节点" })
    public nightCutout: Laya.Sprite | null = null;

    @property({ type: Number, caption: "室外遮挡强度" })
    public outsideAlpha: number = 1;

    @property({ type: Number, caption: "进屋渐亮秒数" })
    public fadeSeconds: number = 0.5;

    @property({ type: Number, caption: "出屋渐暗秒数" })
    public exitFadeSeconds: number = 0.3;

    @property({ type: Number, caption: "边界缓冲像素" })
    public exitPadding: number = 6;

    public playerInside: boolean = false;
    public revealed: boolean = false;
    private readonly point = new Laya.Point();
    private readonly origin = new Laya.Point();
    private readonly axisX = new Laya.Point();
    private readonly axisY = new Laya.Point();
    private readonly matrix = new Laya.Matrix();
    private lastA = NaN;
    private lastB = NaN;
    private lastC = NaN;
    private lastD = NaN;
    private revealProgress = 0;
    private lightProgress = 0;

    public containsPlayer(target: Laya.Sprite, world: Laya.Sprite): boolean {
        const room = this.owner as Laya.Sprite;
        this.point.setTo(0, 0);
        target.localToGlobal(this.point, false, world);
        room.globalToLocal(this.point, false, world);
        const padding = this.playerInside ? Math.max(0, this.exitPadding) : 0;
        this.playerInside = this.point.x >= -padding && this.point.x < room.width + padding &&
            this.point.y >= -padding && this.point.y < room.height + padding;
        return this.playerInside;
    }

    public updateRoom(reveal: boolean, isNight: boolean, targetNight: Laya.Sprite,
        world: Laya.Sprite, deltaSeconds: number): boolean {
        const room = this.owner as Laya.Sprite;
        this.revealed = reveal;
        // Reverse the existing progress at the doorway instead of restarting a tween.
        this.revealProgress = this.advance(this.revealProgress, reveal, deltaSeconds);
        const revealAmount = this.ease(this.revealProgress);
        const desiredAlpha = (1 - revealAmount) * Math.max(0, Math.min(1, this.outsideAlpha));
        if (room.alpha !== desiredAlpha) room.alpha = desiredAlpha;
        this.lightProgress = this.advance(this.lightProgress, reveal && isNight && this.lightsOn, deltaSeconds);
        const cutout = this.nightCutout;
        if (!cutout || cutout.destroyed) return false;
        // Outside rooms are already covered by the separate room concealment.
        // Avoid moving invisible exclusions inside the bitmap cache every frame.
        const lightAmount = this.ease(this.lightProgress);
        const enabled = isNight && lightAmount > 0;
        let changed = cutout.visible !== enabled;
        if (changed) cutout.visible = enabled;
        if (cutout.alpha !== lightAmount) {
            cutout.alpha = lightAmount;
            changed = true;
        }
        if (!enabled || room.width <= 0 || room.height <= 0) return changed;

        this.mapPoint(this.origin, 0, 0, room, targetNight, world);
        this.mapPoint(this.axisX, room.width, 0, room, targetNight, world);
        this.mapPoint(this.axisY, 0, room.height, room, targetNight, world);
        const a = (this.axisX.x - this.origin.x) / room.width;
        const b = (this.axisX.y - this.origin.y) / room.width;
        const c = (this.axisY.x - this.origin.x) / room.height;
        const d = (this.axisY.y - this.origin.y) / room.height;
        if (cutout.width !== room.width || cutout.height !== room.height) {
            cutout.size(room.width, room.height);
            changed = true;
        }
        if (Math.abs(a - this.lastA) > 0.000001 || Math.abs(b - this.lastB) > 0.000001 ||
            Math.abs(c - this.lastC) > 0.000001 || Math.abs(d - this.lastD) > 0.000001 ||
            !Number.isFinite(this.lastA)) {
            this.matrix.setTo(a, b, c, d, this.origin.x, this.origin.y);
            cutout.transform = this.matrix;
            this.lastA = a; this.lastB = b; this.lastC = c; this.lastD = d;
            changed = true;
        } else if (Math.abs(cutout.x - this.origin.x) > 0.001 || Math.abs(cutout.y - this.origin.y) > 0.001) {
            cutout.pos(this.origin.x, this.origin.y);
            changed = true;
        }
        return changed;
    }

    private mapPoint(point: Laya.Point, x: number, y: number, room: Laya.Sprite,
        targetNight: Laya.Sprite, world: Laya.Sprite): void {
        point.setTo(x, y);
        room.localToGlobal(point, false, world);
        targetNight.globalToLocal(point, false, world);
    }

    private advance(progress: number, brighten: boolean, dt: number): number {
        const seconds = brighten ? this.fadeSeconds : this.exitFadeSeconds;
        const step = seconds <= 0 ? 1 : Math.max(0, dt) / seconds;
        return brighten ? Math.min(1, progress + step) : Math.max(0, progress - step);
    }

    private ease(progress: number): number {
        return progress * progress * (3 - 2 * progress);
    }

    public resetRoom(): void {
        const room = this.owner as Laya.Sprite;
        if (!room.destroyed) room.alpha = Math.max(0, Math.min(1, this.outsideAlpha));
        if (this.nightCutout && !this.nightCutout.destroyed) {
            this.nightCutout.visible = false;
            this.nightCutout.alpha = 0;
        }
        this.revealProgress = this.lightProgress = 0;
        this.playerInside = this.revealed = false;
    }
}
