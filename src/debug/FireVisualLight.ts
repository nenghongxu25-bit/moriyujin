const { regClass, property } = Laya;

/** Each copied light owns a cutout, sharing the scene-authored texture. */
@regClass("dfe8f345-1fcf-4f4d-967b-fbef9a9fa1b9")
export class FireVisualLight extends Laya.Script {
    private static readonly cutoutOwners = new WeakMap<Laya.Sprite, FireVisualLight>();
    @property({ type: Laya.Sprite, caption: "夜色扣除节点" })
    public cutoutNode: Laya.Sprite | null = null;

    @property({ type: Number, caption: "照明强度" })
    public intensity = 0.9;

    @property({ type: Number, caption: "暖色强度" })
    public warmIntensity = 0.16;

    private readonly origin = new Laya.Point();
    private readonly axisX = new Laya.Point();
    private readonly axisY = new Laya.Point();
    private readonly matrix = new Laya.Matrix();
    private lastA = NaN;
    private lastB = NaN;
    private lastC = NaN;
    private lastD = NaN;
    private resolvedCutout: Laya.Sprite | null = null;
    private generatedCutout = false;

    private resolveCutout(night: Laya.Sprite): Laya.Sprite | null {
        if (this.resolvedCutout && !this.resolvedCutout.destroyed && this.resolvedCutout.parent === night) {
            return this.resolvedCutout;
        }
        this.releaseCutout();
        const template = this.cutoutNode && !this.cutoutNode.destroyed && this.cutoutNode.parent === night
            ? this.cutoutNode
            : night.getChildByName("fire1_cutout") as Laya.Sprite | null;
        if (!template || !template.texture) return null;

        let cutout = template;
        if (FireVisualLight.cutoutOwners.has(template)) {
            // Copying a light retains its external node reference. Give the copy
            // its own sprite instead of moving the original light's cutout.
            cutout = new Laya.Sprite();
            cutout.name = `${this.owner.name}_cutout_auto`;
            cutout.texture = template.texture;
            cutout.blendMode = "destinationOut";
            cutout.mouseEnabled = false;
            cutout.visible = false;
            night.addChild(cutout);
            this.generatedCutout = true;
        }
        FireVisualLight.cutoutOwners.set(cutout, this);
        this.resolvedCutout = cutout;
        this.lastA = this.lastB = this.lastC = this.lastD = NaN;
        return cutout;
    }

    private releaseCutout(): void {
        const cutout = this.resolvedCutout;
        if (cutout && FireVisualLight.cutoutOwners.get(cutout) === this) {
            FireVisualLight.cutoutOwners.delete(cutout);
            if (!cutout.destroyed) {
                const night = cutout.parent as Laya.Sprite | null;
                cutout.visible = false;
                if (this.generatedCutout) cutout.destroy();
                night?.reCache();
            }
        }
        this.resolvedCutout = null;
        this.generatedCutout = false;
    }

    public updateAfterNight(night: Laya.Sprite): void {
        const source = this.owner as Laya.Sprite;
        if (!night.parent) return;
        const cutout = this.resolveCutout(night);
        if (!cutout) return;
        const warm = Math.max(0, Math.min(1, this.warmIntensity));
        if (source.alpha !== warm) source.alpha = warm;
        let visible = this.enabled && source.activeInHierarchy && night.visible;
        let ancestor: Laya.Node | null = source;
        while (ancestor && ancestor !== night.parent) {
            if (ancestor instanceof Laya.Sprite && !ancestor.visible) visible = false;
            ancestor = ancestor.parent;
        }
        let changed = cutout.visible !== visible;
        if (changed) cutout.visible = visible;
        if (!visible) { if (changed) night.reCache(); return; }
        const alpha = Math.max(0, Math.min(1, this.intensity));
        if (cutout.alpha !== alpha) { cutout.alpha = alpha; changed = true; }
        if (cutout.width !== source.width || cutout.height !== source.height) {
            cutout.size(source.width, source.height); changed = true;
        }
        const world = night.parent as Laya.Sprite;
        this.map(this.origin, 0, 0, source, night, world);
        this.map(this.axisX, 1, 0, source, night, world);
        this.map(this.axisY, 0, 1, source, night, world);
        const a = this.axisX.x - this.origin.x, b = this.axisX.y - this.origin.y;
        const c = this.axisY.x - this.origin.x, d = this.axisY.y - this.origin.y;
        if (!Number.isFinite(this.lastA) || Math.abs(a - this.lastA) > 0.000001 ||
            Math.abs(b - this.lastB) > 0.000001 || Math.abs(c - this.lastC) > 0.000001 ||
            Math.abs(d - this.lastD) > 0.000001) {
            this.matrix.setTo(a, b, c, d, this.origin.x, this.origin.y);
            cutout.transform = this.matrix;
            this.lastA = a; this.lastB = b; this.lastC = c; this.lastD = d;
            changed = true;
        } else if (Math.abs(cutout.x - this.origin.x) > 0.001 || Math.abs(cutout.y - this.origin.y) > 0.001) {
            cutout.pos(this.origin.x, this.origin.y); changed = true;
        }
        if (changed) night.reCache();
    }

    private map(point: Laya.Point, x: number, y: number, source: Laya.Sprite,
        night: Laya.Sprite, world: Laya.Sprite): void {
        point.setTo(x, y);
        source.localToGlobal(point, false, world);
        night.globalToLocal(point, false, world);
    }

    onDisable(): void {
        const cutout = this.resolvedCutout;
        if (cutout && !cutout.destroyed) {
            cutout.visible = false;
            (cutout.parent as Laya.Sprite)?.reCache();
        }
        (this.owner as Laya.Sprite).alpha = 0;
    }

    onDestroy(): void {
        this.releaseCutout();
    }
}
