const { regClass, property } = Laya;

import { Joystick } from "../PlayUI/playerui/Joystick";
import { attack as AttackControl } from "../PlayUI/playerui/attack";

@regClass("aa8cd32e-8843-4f25-912b-14a801bce7fd")
export class NightVisionShaderOverlay extends Laya.Script {
    @property(Laya.Sprite)
    public targetNode: Laya.Sprite | null = null;

    @property(Laya.Sprite)
    public cutoutNode: Laya.Sprite | null = null;

    @property(Number)
    public darknessAlpha: number = 0.72;

    @property(Number)
    public nearRadius: number = 150;

    @property(Number)
    public coneLength: number = 760;

    @property(Number)
    public coneHalfAngle: number = 34;

    @property(Number)
    public edgeFeather: number = 0.42;

    @property(Number)
    public farFeather: number = 0.34;

    @property(Boolean)
    public followTarget: boolean = false;

    private directionX: number = 1;
    private directionY: number = 0;

    onAwake(): void {
        this.resolveTargetNode();
        this.resolveCutoutNode();
        this.configureOwner();
    }

    onEnable(): void {
        this.resolveTargetNode();
        this.resolveCutoutNode();
        this.configureOwner();
    }

    onLateUpdate(): void {
        this.resolveTargetNode();
        this.resolveCutoutNode();
        this.updateDirection();
        this.updateCutout();
    }

    private configureOwner(): void {
        const owner = this.owner as Laya.Sprite | null;
        if (!owner) {
            return;
        }

        owner.cacheAs = "bitmap";
        owner.blendMode = null;
        owner.mouseEnabled = false;
    }

    private resolveTargetNode(): void {
        if (this.targetNode && !this.targetNode.destroyed) {
            return;
        }

        const owner = this.owner as Laya.Node | null;
        const sceneRoot = this.resolveSceneRoot(owner);
        this.targetNode = this.findChildByName(sceneRoot, "prefab_player") as Laya.Sprite | null;
    }

    private resolveCutoutNode(): void {
        if (this.cutoutNode && !this.cutoutNode.destroyed) {
            return;
        }

        const owner = this.owner as Laya.Node | null;
        this.cutoutNode = owner?.getChildByName("night_cutout") as Laya.Sprite | null;
    }

    private resolveSceneRoot(node: Laya.Node | null): Laya.Node | null {
        let current = node;
        while (current?.parent) {
            current = current.parent;
        }

        return current;
    }

    private findChildByName(root: Laya.Node | null, name: string): Laya.Node | null {
        if (!root) {
            return null;
        }

        if (root.name === name) {
            return root;
        }

        const count = root.numChildren || 0;
        for (let index = 0; index < count; index++) {
            const child = root.getChildAt(index);
            const found = this.findChildByName(child, name);
            if (found) {
                return found;
            }
        }

        return null;
    }

    private updateCutout(): void {
        const owner = this.owner as Laya.Sprite | null;
        const target = this.targetNode;
        const cutout = this.cutoutNode;
        if (!owner || !target || !cutout) {
            return;
        }

        const center = this.resolveTargetCenter(target, owner);
        const rotation = Math.atan2(this.directionY, this.directionX) * 180 / Math.PI;
        cutout.x = center.x;
        cutout.y = center.y;
        cutout.rotation = rotation;

        if (typeof owner.reCache === "function") {
            owner.reCache();
        }

    }

    private resolveTargetCenter(target: Laya.Sprite, space: Laya.Sprite): Laya.Point {
        if (typeof target.localToGlobal === "function" && typeof space.globalToLocal === "function") {
            const globalCenter = target.localToGlobal(new Laya.Point(0, 0), true);
            return space.globalToLocal(globalCenter, true);
        }

        return new Laya.Point(target.x, target.y);
    }

    private updateDirection(): void {
        const direction = this.resolveViewDirection();
        const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        if (magnitude <= 0.0001) {
            return;
        }

        this.directionX = direction.x / magnitude;
        this.directionY = direction.y / magnitude;
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
