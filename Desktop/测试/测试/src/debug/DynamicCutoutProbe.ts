const { regClass, property } = Laya;

import { Joystick } from "../PlayUI/playerui/Joystick";
import { attack as AttackControl } from "../PlayUI/playerui/attack";
import { NightLightingDiagnostics } from "./NightLightingDiagnostics";

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

    @property(Number)
    public directionSmoothTime: number = 0.045;

    @property(Number)
    public positionSmoothTime: number = 0;

    @property(Boolean)
    public diagnosticsEnabled: boolean = false;

    private diagnostics: NightLightingDiagnostics | null = null;

    onDisable(): void {
        this.diagnostics?.stop();
        this.diagnostics = null;
    }

    private direction: number = 1;
    private readonly targetPoint = new Laya.Point();
    private glowNode: Laya.Sprite | null = null;
    private following: boolean = false;
    private facingInitialized: boolean = false;
    private readonly lightPoint = new Laya.Point();
    private readonly cacheBounds = new Laya.Rectangle();
    private readonly backgroundBounds = new Laya.Rectangle();
    private backgroundNode: Laya.Sprite | null = null;

    onAwake(): void {
        this.resolveCutoutNode();
        this.configureCache();
    }

    onEnable(): void {
        this.following = false;
        this.facingInitialized = false;
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

        if (this.diagnosticsEnabled && !this.diagnostics) {
            this.diagnostics = new NightLightingDiagnostics(this, owner, target);
        }

        // Both nodes are in the same Area2D; stop before applying its camera.
        this.targetPoint.setTo(0, 0);
        target.localToGlobal(this.targetPoint, false, owner.parent as Laya.Sprite);
        // Follow in world space so camera motion does not introduce light jitter.
        const dt = Math.min(0.1, Math.max(0, Number(Laya.timer.delta) || 0) / 1000);
        const offsetX = this.targetPoint.x - this.lightPoint.x;
        const offsetY = this.targetPoint.y - this.lightPoint.y;
        const snap = !this.following || offsetX * offsetX + offsetY * offsetY > 160 * 160;
        const positionBlend = snap || this.positionSmoothTime <= 0 ? 1 :
            1 - Math.exp(-dt / this.positionSmoothTime);
        if (positionBlend === 1) {
            this.lightPoint.setTo(this.targetPoint.x, this.targetPoint.y);
        } else {
            this.lightPoint.setTo(this.lightPoint.x + offsetX * positionBlend,
                this.lightPoint.y + offsetY * positionBlend);
        }
        this.following = true;
        // Keep the full-screen darkness attached to the player; only lag its cutout.
        owner.pos(this.targetPoint.x, this.targetPoint.y);
        const cutout = this.cutoutNode;
        if (cutout) {
            this.updateCacheBounds(owner);
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
                    const difference = ((angle - cutout.rotation + 180) % 360 + 360) % 360 - 180;
                    const blend = !this.facingInitialized || this.directionSmoothTime <= 0 ? 1 :
                        1 - Math.exp(-dt / this.directionSmoothTime);
                    this.facingInitialized = true;
                    if (Math.abs(difference) > 0.001) {
                        cutout.rotation += Math.abs(difference) < 0.05 ? difference : difference * blend;
                        cutout.rotation = ((cutout.rotation + 180) % 360 + 360) % 360 - 180;
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
        const x = this.lightPoint.x - this.targetPoint.x;
        const y = this.lightPoint.y - this.targetPoint.y;
        if (node.pivotX === pivotX && node.pivotY === pivotY && node.x === x && node.y === y) {
            return false;
        }
        node.pivot(pivotX, pivotY);
        node.pos(x, y);
        return true;
    }

    private resolveCutoutNode(): void {
        const owner = this.owner as Laya.Node | null;
        this.glowNode = owner?.getChildByName("vision_glow") as Laya.Sprite | null;
        this.backgroundNode = owner?.getChildByName("black_rect") as Laya.Sprite | null;
        if (this.cutoutNode) {
            return;
        }

        this.cutoutNode = owner?.getChildByName("circle_cutout") as Laya.Sprite | null;
    }

    private configureCache(): void {
        const owner = this.owner as Laya.Sprite | null;
        if (owner) {
            owner.cacheAs = "bitmap";
            this.updateCacheBounds(owner);
        }
    }

    private updateCacheBounds(owner: Laya.Sprite): void {
        const cutout = this.cutoutNode;
        const background = this.backgroundNode;
        if (!cutout || !background || this.demoMotion) {
            return;
        }
        // Bound every orientation once, rather than reallocating the RT for each
        // rotated AABB. Include the entire texture rectangle (even transparent
        // corners), both light layers, and the existing background. No cropping.
        const lagMargin = this.positionSmoothTime > 0 ? 160 : 0;
        const radius = Math.ceil(Math.max(this.lightRadius(cutout),
            this.glowNode ? this.lightRadius(this.glowNode) : 0) + lagMargin) + 2;
        const rect = background.getBounds(this.backgroundBounds);
        const left = Math.floor(Math.min(rect.x, -radius));
        const top = Math.floor(Math.min(rect.y, -radius));
        const right = Math.ceil(Math.max(rect.right, radius));
        const bottom = Math.ceil(Math.max(rect.bottom, radius));
        const bounds = this.cacheBounds;
        if (bounds.x === left && bounds.y === top &&
            bounds.width === right - left && bounds.height === bottom - top) {
            return;
        }
        bounds.setTo(left, top, right - left, bottom - top);
        owner.setSelfBounds(bounds);
        owner.reCache();
    }

    private lightRadius(node: Laya.Sprite): number {
        return Math.hypot(
            (node.width * 0.5 + Math.abs(this.rearOffset)) * Math.abs(node.scaleX),
            node.height * 0.5 * Math.abs(node.scaleY));
    }
}
