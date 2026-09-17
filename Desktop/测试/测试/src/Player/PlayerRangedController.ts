import type { PlayerController } from "./PlayerController";
import type { PlayerAttackOptions } from "./PlayerCombatController";

export class PlayerRangedController {
    private static readonly BULLET_DISPLAY_SPEED_MULTIPLIER = 2;

    private aimActive: boolean = false;
    private aimX: number = 1;
    private aimY: number = 0;
    private rangedWeaponBaseScaleX: number | null = null;
    private rangedWeaponBaseScaleY: number | null = null;

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
        this.syncRangedWeaponRotation();
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
        const speed = Math.max(1, Number(this.controller.rangedBulletSpeed) || 1) * PlayerRangedController.BULLET_DISPLAY_SPEED_MULTIPLIER;
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
            this.syncRangedWeaponRotation();
            return;
        }

        this.controller.syncWeaponSpineSlot(false);
        this.syncRangedWeaponRotation();
    }

    public snapshot(): Record<string, any> {
        const root = this.resolveRangedWeaponRoot() as any;
        return {
            aimActive: this.aimActive,
            aimX: this.aimX,
            aimY: this.aimY,
            rangedWeaponRotation: root ? root.rotation : null,
        };
    }

    private syncRangedWeaponRotation(): void {
        const root = this.resolveRangedWeaponRoot() as any;
        if (!root) {
            return;
        }

        this.captureRangedWeaponBaseScale(root);

        if (!this.controller.isEquippedRangedWeapon()) {
            this.applyRangedWeaponScale(root, 1);
            root.rotation = 0;
            return;
        }

        if (!this.aimActive) {
            this.applyRangedWeaponScale(root, 1);
            root.rotation = 0;
            return;
        }

        const direction = { x: this.aimX, y: this.aimY };
        this.applyRangedWeaponScale(root, 1);
        const magnitude = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        if (magnitude <= 0.0001) {
            root.rotation = 0;
            return;
        }

        const aimAngle = Math.atan2(direction.y, direction.x) * 180 / Math.PI;
        const ancestorScale = this.resolveAncestorScaleSign(root);
        const visualAngle = direction.x < 0 ? aimAngle + 180 : aimAngle;
        root.rotation = (ancestorScale.x < 0 ? -visualAngle : visualAngle)
            + (Number(this.controller.rangedWeaponAimRotationOffset) || 0);
    }

    private resolveRangedWeaponRoot(): Laya.Node | null {
        if (this.controller.rangedWeaponRootNode && !this.controller.rangedWeaponRootNode.destroyed) {
            return this.controller.rangedWeaponRootNode;
        }

        return this.findChildByName(this.controller.owner as Laya.Node | null, "ranged");
    }

    private captureRangedWeaponBaseScale(root: any): void {
        if (this.rangedWeaponBaseScaleX !== null && this.rangedWeaponBaseScaleY !== null) {
            return;
        }

        this.rangedWeaponBaseScaleX = Math.abs(Number(root.scaleX) || 1);
        this.rangedWeaponBaseScaleY = Math.abs(Number(root.scaleY) || 1);
    }

    private applyRangedWeaponScale(root: any, directionSign: number): void {
        this.captureRangedWeaponBaseScale(root);
        const sign = directionSign >= 0 ? 1 : -1;
        root.scaleX = (this.rangedWeaponBaseScaleX || 1) * sign;
        root.scaleY = (this.rangedWeaponBaseScaleY || 1) * sign;
    }

    private resolveAncestorScaleSign(node: Laya.Node): { x: number; y: number } {
        let scaleX = 1;
        let scaleY = 1;
        let current: any = node.parent;

        while (current) {
            if (typeof current.scaleX === "number" && current.scaleX !== 0) {
                scaleX *= current.scaleX;
            }
            if (typeof current.scaleY === "number" && current.scaleY !== 0) {
                scaleY *= current.scaleY;
            }
            current = current.parent;
        }

        return {
            x: scaleX >= 0 ? 1 : -1,
            y: scaleY >= 0 ? 1 : -1,
        };
    }

    private findChildByName(root: Laya.Node | null, name: string): Laya.Node | null {
        if (!root) {
            return null;
        }

        if (root.name === name) {
            return root;
        }

        const childCount = (root as any).numChildren || 0;
        for (let i = 0; i < childCount; i++) {
            const found = this.findChildByName(root.getChildAt(i), name);
            if (found) {
                return found;
            }
        }

        return null;
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

}
