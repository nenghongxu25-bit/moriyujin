import type { PlayerController } from "./PlayerController";
import type { PlayerAttackOptions } from "./PlayerCombatController";

export class PlayerRangedController {
    private aimActive: boolean = false;
    private aimX: number = 1;
    private aimY: number = 0;

    constructor(private controller: PlayerController) {
    }

    public setAimByDirection(x: number, y: number = 0): void {
        const magnitude = Math.sqrt(x * x + y * y);
        if (magnitude <= 0.0001) {
            return;
        }

        Laya.timer.clear(this.controller, this.controller.clearRangedWeaponAim);
        this.aimActive = true;
        this.aimX = x / magnitude;
        this.aimY = y / magnitude;
        this.syncAimRotation("input");
    }

    public clearAim(): void {
        Laya.timer.clear(this.controller, this.controller.clearRangedWeaponAim);
        this.aimActive = false;
    }

    public onDestroy(): void {
        Laya.timer.clear(this.controller, this.controller.clearRangedWeaponAim);
        this.aimActive = false;
    }

    public applyDamage(options: PlayerAttackOptions = {}): boolean {
        const target = this.resolveAttackTarget(options);
        if (!target) {
            return false;
        }

        target.receiver.takeDamage(this.resolveAttackDamage(options.chargeRatio));
        return true;
    }

    public spawnBullet(options: PlayerAttackOptions = {}): void {
        const owner = this.controller.owner as Laya.Sprite | null;
        const textureUrl = String(this.controller.rangedBulletTextureUrl || "").trim().replace(/^assets\//, "");
        if (!owner || !textureUrl) {
            return;
        }

        const parent = owner.parent as Laya.Sprite | null;
        if (!parent || typeof parent.globalToLocal !== "function") {
            return;
        }

        const direction = this.resolveDirection(options);
        const baseAngle = Math.atan2(direction.y, direction.x) * 180 / Math.PI;
        const spreadAngle = Math.max(0, Number(options.spreadAngle) || 0);
        const bulletAngle = baseAngle + (Math.random() - 0.5) * spreadAngle;
        const radians = bulletAngle * Math.PI / 180;
        const range = Math.max(1, Number(this.controller.rangedAttackRange) || Number(this.controller.attackDamageRange) || 1);
        const speed = Math.max(1, Number(this.controller.rangedBulletSpeed) || 1);
        const duration = Math.max(1, Math.floor(range / speed * 1000));
        const globalStart = this.resolveBulletStartGlobalPoint(owner, direction);
        const localStart = parent.globalToLocal(globalStart, false);
        const bullet = new Laya.Sprite();
        const scale = Math.max(0.01, Number(this.controller.rangedBulletScale) || 1);

        bullet.mouseEnabled = false;
        bullet.loadImage(textureUrl, Laya.Handler.create(this, this.centerBulletPivot, [bullet]));
        bullet.pos(localStart.x, localStart.y);
        bullet.scale(scale, scale);
        bullet.rotation = bulletAngle + (Number(this.controller.rangedBulletRotationOffset) || 0);
        parent.addChild(bullet);

        Laya.Tween.to(
            bullet,
            {
                x: localStart.x + Math.cos(radians) * range,
                y: localStart.y + Math.sin(radians) * range,
            },
            duration,
            undefined,
            Laya.Handler.create(this, this.destroyBullet, [bullet]),
        );
    }

    public resolveChargeRatio(heldMs: number, dragRatio: number): number {
        const duration = Math.max(1, this.controller.rangedChargeDuration || 1);
        const timeRatio = Math.max(0, Math.min(1, heldMs / duration));
        const aimRatio = Math.max(0, Math.min(1, dragRatio));
        return Math.max(timeRatio, aimRatio);
    }

    public syncAimRotation(phase: string = "update"): void {
        if (!this.aimActive || !this.controller.isEquippedRangedWeapon()) {
            return;
        }

        const slotName = String(this.controller.weaponRangedSpineSlotName || this.controller.weaponSpineSlotName || "").trim();
        if (!slotName) {
            return;
        }

        const spine = this.controller.spineNode ? this.controller.spineNode.getComponent(Laya.Spine2DRenderNode) : null;
        this.configureSpineForRuntimeAim(spine);
        const skeleton = this.resolveSpineSkeleton(spine);
        const bone = this.resolveSpineSlotBone(spine, slotName, skeleton);
        if (!bone) {
            return;
        }

        const worldAngle = Math.atan2(this.aimY, this.aimX) * 180 / Math.PI;
        const ownerScaleX = this.controller.owner ? (this.controller.owner as Laya.Sprite).scaleX : 1;
        const localAngle = ownerScaleX < 0 ? 180 - worldAngle : worldAngle;
        const targetRotation = this.normalizeDegrees(localAngle + (Number(this.controller.rangedWeaponAimRotationOffset) || 0));
        bone.rotation = targetRotation;

        if (skeleton && typeof skeleton.updateWorldTransform === "function") {
            try {
                const physics = (globalThis as any).spine?.Physics?.update ?? 2;
                skeleton.updateWorldTransform(physics);
            } catch (error) {
            }
        } else if (typeof bone.updateWorldTransform === "function") {
            try {
                bone.updateWorldTransform();
            } catch (error) {
            }
        }

        this.markSpineRenderDirty(spine);
    }

    public snapshot(): Record<string, any> {
        return {
            aimActive: this.aimActive,
            aimX: this.aimX,
            aimY: this.aimY,
        };
    }

    private resolveAttackDamage(chargeRatio: number = 0): number {
        const ratio = Math.max(0, Math.min(1, Number(chargeRatio) || 0));
        const minMultiplier = Math.max(0, Number(this.controller.rangedMinDamageMultiplier) || 0);
        const maxMultiplier = Math.max(minMultiplier, Number(this.controller.rangedMaxDamageMultiplier) || minMultiplier);
        const multiplier = minMultiplier + (maxMultiplier - minMultiplier) * ratio;
        return Math.max(1, Math.floor((this.controller.attackPower || 0) * multiplier));
    }

    private resolveAttackTarget(options: PlayerAttackOptions): { receiver: { takeDamage(amount: number): void }; distance: number } | null {
        const owner = this.controller.owner as Laya.Sprite | null;
        if (!owner || !Laya.stage) {
            return null;
        }

        const origin = this.getGlobalPosition(owner);
        const direction = this.resolveDirection(options);
        const range = Math.max(1, this.controller.rangedAttackRange || this.controller.attackDamageRange || 1);
        const halfWidth = Math.max(1, (this.controller.rangedAttackWidth || 1) / 2);
        let best: { receiver: { takeDamage(amount: number): void }; distance: number } | null = null;

        this.visitNodes(Laya.stage, (node) => {
            if (node === this.controller.owner) {
                return;
            }

            const receiver = this.findDamageReceiver(node);
            if (!receiver || (receiver.isDead && receiver.isDead())) {
                return;
            }

            const point = this.getGlobalPosition(node as Laya.Sprite);
            const dx = point.x - origin.x;
            const dy = point.y - origin.y;
            const forward = dx * direction.x + dy * direction.y;
            if (forward <= 0 || forward > range) {
                return;
            }

            const side = Math.abs(dx * direction.y - dy * direction.x);
            if (side > halfWidth) {
                return;
            }

            if (!best || forward < best.distance) {
                best = { receiver, distance: forward };
            }
        });

        return best;
    }

    private resolveDirection(options: PlayerAttackOptions): { x: number; y: number } {
        let x = Number(options.directionX) || 0;
        let y = Number(options.directionY) || 0;
        const magnitude = Math.sqrt(x * x + y * y);
        if (magnitude > 0.0001) {
            return { x: x / magnitude, y: y / magnitude };
        }

        x = this.controller.movement?.getAttackDirection() || 1;
        return { x: x >= 0 ? 1 : -1, y: 0 };
    }

    private resolveBulletStartGlobalPoint(owner: Laya.Sprite, direction: { x: number; y: number }): Laya.Point {
        const localStart = new Laya.Point(
            direction.x * (Number(this.controller.rangedBulletSpawnOffsetX) || 0),
            direction.y * (Number(this.controller.rangedBulletSpawnOffsetX) || 0) + (Number(this.controller.rangedBulletSpawnOffsetY) || 0),
        );
        return owner.localToGlobal(localStart, false);
    }

    private destroyBullet(bullet: Laya.Sprite): void {
        Laya.Tween.clearAll(bullet);
        if (!bullet.destroyed) {
            bullet.destroy();
        }
    }

    private centerBulletPivot(bullet: Laya.Sprite): void {
        if (!bullet || bullet.destroyed) {
            return;
        }

        const texture = (bullet as any).texture;
        const width = Number(texture?.width) || Number((bullet as any).width) || 0;
        const height = Number(texture?.height) || Number((bullet as any).height) || 0;
        if (width > 0 && height > 0) {
            bullet.pivot(width * 0.5, height * 0.5);
        }
    }

    private findDamageReceiver(node: Laya.Node | null): ({ takeDamage(amount: number): void; isDead?(): boolean } | null) {
        const components = (node as any)?._components || (node as any)?.components || [];
        for (let i = 0; i < components.length; i++) {
            const component = components[i] as any;
            if (component === this.controller || !component || typeof component.takeDamage !== "function") {
                continue;
            }

            if (typeof component.isDead === "function") {
                return component;
            }
        }

        return null;
    }

    private visitNodes(root: Laya.Node | null, visitor: (node: Laya.Node) => void): void {
        if (!root) {
            return;
        }

        visitor(root);
        const childCount = (root as any).numChildren || 0;
        for (let i = 0; i < childCount; i++) {
            this.visitNodes(root.getChildAt(i), visitor);
        }
    }

    private getGlobalPosition(node: Laya.Sprite): Laya.Point {
        const point = new Laya.Point();
        if (node && typeof node.localToGlobal === "function") {
            node.localToGlobal(point, false);
        }
        return point;
    }

    private configureSpineForRuntimeAim(spine: Laya.Spine2DRenderNode | null): void {
        const anySpine = spine as any;
        if (!anySpine) {
            return;
        }

        try {
            if ("enableCache" in anySpine) {
                anySpine.enableCache = false;
            }
            if ("useFastRender" in anySpine) {
                anySpine.useFastRender = false;
            }
        } catch (error) {
        }
    }

    private markSpineRenderDirty(spine: Laya.Spine2DRenderNode | null): void {
        const anySpine = spine as any;
        if (!anySpine) {
            return;
        }

        if ("_needUpdate" in anySpine) {
            anySpine._needUpdate = true;
        }
    }

    private resolveSpineSlotBone(spine: Laya.Spine2DRenderNode | null, slotName: string, skeleton?: any | null): any | null {
        if (!spine) {
            return null;
        }

        const anySpine = spine as any;

        try {
            const slot = typeof anySpine.getSlotByName === "function"
                ? anySpine.getSlotByName(slotName)
                : null;
            if (slot?.bone) {
                return slot.bone;
            }
        } catch (error) {
        }

        try {
            const slot = typeof anySpine.findSlot === "function"
                ? anySpine.findSlot(slotName)
                : null;
            if (slot?.bone) {
                return slot.bone;
            }
        } catch (error) {
        }

        try {
            const slot = skeleton && typeof skeleton.findSlot === "function"
                ? skeleton.findSlot(slotName)
                : null;
            return slot?.bone || null;
        } catch (error) {
            return null;
        }
    }

    private resolveSpineSkeleton(spine: Laya.Spine2DRenderNode | null): any | null {
        const render = (spine as any)?._spineRender;
        if (!render || typeof render.getSkeleton !== "function") {
            return null;
        }

        try {
            return render.getSkeleton();
        } catch (error) {
            return null;
        }
    }

    private normalizeDegrees(value: number): number {
        let result = value;
        while (result > 180) {
            result -= 360;
        }
        while (result < -180) {
            result += 360;
        }
        return result;
    }
}