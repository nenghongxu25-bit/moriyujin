const { regClass, property } = Laya;

import { Joystick } from "../PlayUI/playerui/Joystick";
import { attack as AttackControl } from "../PlayUI/playerui/attack";

@regClass("7f27ea9f-45c4-4a5a-9f28-99cf250706b9")
export class DynamicCutoutProbe extends Laya.Script {
    @property(Laya.Sprite)
    public cutoutNode: Laya.Sprite | null = null;

    @property(Laya.Sprite)
    public targetNode: Laya.Sprite | null = null;

    @property(Boolean)
    public demoMotion: boolean = false;

    @property(Boolean)
    public directionalLight: boolean = false;

    @property(Number)
    public rearOffset: number = 0;

    @property(Number)
    public leftX: number = 40;

    @property(Number)
    public rightX: number = 230;

    @property(Number)
    public speed: number = 120;

    private direction: number = 1;
    private readonly targetPoint = new Laya.Point();
    private glowNode: Laya.Sprite | null = null;

    onAwake(): void {
        this.resolveCutoutNode();
        this.configureCache();
    }

    onEnable(): void {
        this.resolveCutoutNode();
        this.configureCache();
    }

    onUpdate(): void {
        if (!this.demoMotion || this.targetNode) {
            return;
        }
        const cutout = this.cutoutNode;
        const owner = this.owner as Laya.Sprite | null;
        if (!cutout || !owner) {
            return;
        }

        const dt = Math.max(0, Number(Laya.timer.delta) || 0) / 1000;
        cutout.x += this.direction * Math.max(1, this.speed) * dt;

        if (cutout.x >= this.rightX) {
            cutout.x = this.rightX;
            this.direction = -1;
        } else if (cutout.x <= this.leftX) {
            cutout.x = this.leftX;
            this.direction = 1;
        }

        if (typeof owner.reCache === "function") {
            owner.reCache();
        }
    }

    onLateUpdate(): void {
        const owner = this.owner as Laya.Sprite;
        if (this.demoMotion) {
            return;
        }
        if (!this.targetNode || this.targetNode.destroyed) {
            this.targetNode = owner.parent?.getChildByName("ActorLayer")
                ?.getChildByName("prefab_player") as Laya.Sprite | null;
        }
        const target = this.targetNode;
        if (!target || target.destroyed || !owner.parent) {
            return;
        }

        // Both nodes are in the same Area2D; stop before applying its camera.
        this.targetPoint.setTo(0, 0);
        target.localToGlobal(this.targetPoint, false, owner.parent as Laya.Sprite);
        owner.pos(this.targetPoint.x, this.targetPoint.y);
        const cutout = this.cutoutNode;
        if (cutout) {
            let changed = this.alignLightPivot(cutout);
            if (this.directionalLight) {
                const attackX = AttackControl.activeDirectionX;
                const attackY = AttackControl.activeDirectionY;
                const attacking = AttackControl.directionActive &&
                    attackX * attackX + attackY * attackY > 0.0001;
                const dx = attacking ? attackX : Joystick.instance?.valueX || 0;
                const dy = attacking ? attackY : Joystick.instance?.valueY || 0;
                if (dx * dx + dy * dy > 0.0001) {
                    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                    const difference = (angle - cutout.rotation + 540) % 360 - 180;
                    if (Math.abs(difference) >= 0.5) {
                        cutout.rotation = angle;
                        changed = true;
                    }
                }
            }
            const glow = this.glowNode;
            if (glow) {
                changed = this.alignLightPivot(glow) || changed;
                if (glow.rotation !== cutout.rotation) {
                    glow.rotation = cutout.rotation;
                    changed = true;
                }
            }
            if (changed) {
                owner.reCache();
            }
        }
    }

    private alignLightPivot(node: Laya.Sprite): boolean {
        // Moving the texture behind its pivot keeps rotation fixed at the player root.
        const pivotX = node.width * 0.5 + this.rearOffset;
        const pivotY = node.height * 0.5;
        if (node.pivotX === pivotX && node.pivotY === pivotY && node.x === 0 && node.y === 0) {
            return false;
        }
        node.pivot(pivotX, pivotY);
        node.pos(0, 0);
        return true;
    }

    private resolveCutoutNode(): void {
        const owner = this.owner as Laya.Node | null;
        this.glowNode = owner?.getChildByName("vision_glow") as Laya.Sprite | null;
        if (this.cutoutNode) {
            return;
        }

        this.cutoutNode = owner?.getChildByName("circle_cutout") as Laya.Sprite | null;
    }

    private configureCache(): void {
        const owner = this.owner as Laya.Sprite | null;
        if (owner) {
            owner.cacheAs = "bitmap";
        }
    }
}
