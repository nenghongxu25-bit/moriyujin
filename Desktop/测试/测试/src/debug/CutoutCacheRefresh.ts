const { regClass, property } = Laya;

import { Joystick } from "../PlayUI/playerui/Joystick";
import { attack as AttackControl } from "../PlayUI/playerui/attack";

@regClass("2df33374-591c-4f3e-987d-3f86b7c991db")
export class CutoutCacheRefresh extends Laya.Script {
    @property(Laya.Sprite)
    public targetNode: Laya.Sprite | null = null;

    @property(Laya.Sprite)
    public cutoutNode: Laya.Sprite | null = null;

    @property(Laya.Sprite)
    public darkNode: Laya.Sprite | null = null;

    @property(Number)
    public coneCenterAngle: number = -90;

    private darkOffsetX: number = 0;
    private darkOffsetY: number = 0;
    private hasDarkOffset: boolean = false;
    private lastCutoutRotation: number = 0;
    private hasCutoutRotation: boolean = false;
    private lastMaskX: number = Number.NaN;
    private lastMaskY: number = Number.NaN;
    private lastMaskRotation: number = Number.NaN;

    onAwake(): void {
        this.configureCache();
        this.resolveNodes();
        this.captureDarkOffset();
        this.syncNodes();
    }

    onEnable(): void {
        this.configureCache();
        this.resolveNodes();
        this.captureDarkOffset();
        this.syncNodes();
    }

    onUpdate(): void {
        this.resolveNodes();
        this.captureDarkOffset();
    }

    onLateUpdate(): void {
        const owner = this.owner as Laya.Sprite | null;
        const changed = this.syncNodes();

        if (changed && owner && typeof owner.reCache === "function") {
            owner.reCache();
        }
    }

    private resolveNodes(): void {
        const owner = this.owner as Laya.Node | null;
        if (!owner) {
            return;
        }

        if (!this.targetNode) {
            this.targetNode =
                owner.getChildByName("prefab_player") as Laya.Sprite | null ||
                owner.parent?.getChildByName("prefab_player") as Laya.Sprite | null;
        }

        if (!this.cutoutNode) {
            this.cutoutNode = owner.getChildByName("city_cutout_circle") as Laya.Sprite | null;
        }

        if (this.cutoutNode && !this.hasCutoutRotation) {
            this.lastCutoutRotation = Number(this.cutoutNode.rotation) || 0;
            this.hasCutoutRotation = true;
        }

        if (!this.darkNode) {
            this.darkNode = owner.getChildByName("city_dark_rect") as Laya.Sprite | null;
        }
    }

    private captureDarkOffset(): void {
        if (this.hasDarkOffset || !this.targetNode || !this.darkNode) {
            return;
        }

        this.darkOffsetX = this.darkNode.x - this.targetNode.x;
        this.darkOffsetY = this.darkNode.y - this.targetNode.y;
        this.hasDarkOffset = true;
    }

    private configureCache(): void {
        const owner = this.owner as Laya.Sprite | null;
        if (owner) {
            owner.cacheAs = "bitmap";
        }
    }

    private syncNodes(): boolean {
        const owner = this.owner as Laya.Sprite | null;
        const target = this.targetNode;
        const cutout = this.cutoutNode;
        if (!owner || !target) {
            return false;
        }

        const targetCenter = this.resolveTargetCenter(target);
        let changed = this.hasChanged(owner.x, targetCenter.x) || this.hasChanged(owner.y, targetCenter.y);
        owner.x = targetCenter.x;
        owner.y = targetCenter.y;

        if (cutout) {
            const rotation = this.resolveCutoutRotation(cutout);
            cutout.x = 0;
            cutout.y = 0;
            changed = changed || this.hasChanged(cutout.rotation, rotation);
            cutout.rotation = rotation;
        }

        changed = changed
            || this.hasChanged(this.lastMaskX, owner.x)
            || this.hasChanged(this.lastMaskY, owner.y)
            || this.hasChanged(this.lastMaskRotation, cutout ? cutout.rotation : 0);

        this.lastMaskX = owner.x;
        this.lastMaskY = owner.y;
        this.lastMaskRotation = cutout ? cutout.rotation : 0;

        return changed;
    }

    private resolveTargetCenter(target: Laya.Sprite): Laya.Point {
        const parent = (this.owner as Laya.Sprite | null)?.parent as Laya.Sprite | null;
        if (parent && typeof target.localToGlobal === "function" && typeof parent.globalToLocal === "function") {
            const globalCenter = target.localToGlobal(new Laya.Point(0, 0), true);
            return parent.globalToLocal(globalCenter, true);
        }

        return new Laya.Point(target.x, target.y);
    }

    private resolveCutoutRotation(cutout: Laya.Sprite): number {
        const direction = this.resolveViewDirection();
        const x = direction.x;
        const y = direction.y;
        const magnitude = Math.sqrt(x * x + y * y);

        if (magnitude > 0.0001) {
            this.lastCutoutRotation = Math.atan2(y, x) * 180 / Math.PI - this.coneCenterAngle;
            this.hasCutoutRotation = true;
            return this.lastCutoutRotation;
        }

        if (!this.hasCutoutRotation) {
            this.lastCutoutRotation = Number(cutout.rotation) || 0;
            this.hasCutoutRotation = true;
        }

        return this.lastCutoutRotation;
    }

    private hasChanged(previous: number, next: number): boolean {
        return !Number.isFinite(previous) || Math.abs(previous - next) > 0.001;
    }

    private resolveViewDirection(): { x: number; y: number } {
        const attackX = Number(AttackControl.activeDirectionX) || 0;
        const attackY = Number(AttackControl.activeDirectionY) || 0;
        const attackMagnitude = Math.sqrt(attackX * attackX + attackY * attackY);
        if (AttackControl.directionActive && attackMagnitude > 0.0001) {
            return { x: attackX, y: attackY };
        }

        const joystick = Joystick.instance;
        return {
            x: Number(joystick?.valueX) || 0,
            y: Number(joystick?.valueY) || 0,
        };
    }
}
