import type { PlayerController } from "./PlayerController";
import type { PlayerAttackOptions } from "./PlayerCombatController";
import { Joystick } from "../PlayUI/playerui/Joystick";
import { DataManager } from "../systems/datamanager";

export class PlayerRangedController {
    private static readonly BULLET_DISPLAY_SPEED_MULTIPLIER = 2;
    private static readonly bulletTexturePromises = new Map<string, Promise<Laya.Texture | null>>();
    private static readonly MUZZLE_FLASH_FRAME_URLS = [0, 1, 2, 3].map((frame) =>
        `animation/effects/combat-vfx/rifle_muzzle_flash_f0${frame}.png`);
    private static muzzleFlashFramesPromise: Promise<Laya.Texture[]> | null = null;

    private aimActive: boolean = false;
    private aimX: number = 1;
    private aimY: number = 0;
    private visualAimX = 1;
    private visualAimY = 0;
    private rangedWeaponBaseScaleX: number | null = null;
    private rangedWeaponBaseScaleY: number | null = null;
    // The equipped gun is a child of the player and inherits its visibility and
    // opacity. Wall position must not independently hide an otherwise visible gun.

    constructor(private controller: PlayerController) {
        void PlayerRangedController.loadMuzzleFlashFrames();
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

    public getThrowableDirection(): { x: number; y: number } {
        if (this.aimActive) return { x: this.aimX, y: this.aimY };
        const facing=this.controller.movement?.getAttackDirection()||1;
        return { x: facing>=0?1:-1, y:0 };
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
        const textureUrl = String(this.controller.rangedBulletTextureUrl || "").trim()
            .replace(/^assets\//i, "")
            .replace(/^res:\/\//i, "");
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
        const globalStart = this.resolveMuzzleGlobalPoint(owner, direction);
        const globalEnd = new Laya.Point(
            globalStart.x + Math.cos(radians) * range,
            globalStart.y + Math.sin(radians) * range,
        );
        // Laya's globalToLocal may transform the supplied Point in place.
        // Keep globalStart intact because the muzzle flash also needs world coords.
        const localStart = parent.globalToLocal(new Laya.Point(globalStart.x, globalStart.y), false);
        const localEnd = parent.globalToLocal(new Laya.Point(globalEnd.x, globalEnd.y), false);
        const localAngle = Math.atan2(localEnd.y - localStart.y, localEnd.x - localStart.x) * 180 / Math.PI;
        const bullet = new Laya.Sprite();
        const scale = Math.max(0.01, Number(this.controller.rangedBulletScale) || 1);

        bullet.mouseEnabled = false;
        bullet.pos(localStart.x, localStart.y);
        bullet.scale(scale, scale);
        bullet.rotation = localAngle + (Number(this.controller.rangedBulletRotationOffset) || 0);
        parent.addChild(bullet);
        console.info(`[CombatVFX] Shot spawned: direction=(${direction.x.toFixed(2)}, ${direction.y.toFixed(2)}), muzzle=(${globalStart.x.toFixed(1)}, ${globalStart.y.toFixed(1)}), bulletParent=${parent.name || parent.constructor?.name || "unnamed"}`);
        this.spawnMuzzleFlash(globalStart, bulletAngle);
        void this.loadBulletTexture(textureUrl).then((texture) => {
            if (!texture || bullet.destroyed) {
                return;
            }
            bullet.texture = texture;
            this.centerBulletPivot(bullet);
        });

        Laya.Tween.to(
            bullet,
            {
                x: localEnd.x,
                y: localEnd.y,
            },
            duration,
            undefined,
            Laya.Handler.create(this, this.destroyBullet, [bullet]),
        );
    }

    private loadBulletTexture(url: string): Promise<Laya.Texture | null> {
        const cached = PlayerRangedController.bulletTexturePromises.get(url);
        if (cached) {
            return cached;
        }

        const loading = PlayerRangedController.loadTexture(url);
        PlayerRangedController.bulletTexturePromises.set(url, loading);
        return loading;
    }

    private static loadTexture(url: string): Promise<Laya.Texture | null> {
        return Laya.loader.load(url, null, null, Laya.Loader.IMAGE)
            .then((texture: Laya.Texture | null) => texture || null)
            .catch((): null => null);
    }

    private static loadMuzzleFlashFrames(): Promise<Laya.Texture[]> {
        if (!PlayerRangedController.muzzleFlashFramesPromise) {
            PlayerRangedController.muzzleFlashFramesPromise = Promise.all(
                PlayerRangedController.MUZZLE_FLASH_FRAME_URLS.map((url) => PlayerRangedController.loadTexture(url)),
            ).then((frames) => {
                const loaded = frames.filter((texture): texture is Laya.Texture => !!texture);
                if (loaded.length !== PlayerRangedController.MUZZLE_FLASH_FRAME_URLS.length) {
                    console.warn(`[PlayerRangedController] Loaded ${loaded.length}/${PlayerRangedController.MUZZLE_FLASH_FRAME_URLS.length} muzzle flash frames.`);
                }
                return loaded;
            });
        }
        return PlayerRangedController.muzzleFlashFramesPromise;
    }

    private spawnMuzzleFlash(globalPosition: Laya.Point, angle: number): void {
        // Keep the flash in the world render tree so camera/depth transforms match
        // the muzzle. A stage child would ignore the forest Area2D camera transform.
        const owner = this.controller.owner as Laya.Sprite;
        const flashParent = owner.parent as Laya.Sprite;
        if (!flashParent || typeof flashParent.globalToLocal !== "function") {
            console.warn("[CombatVFX] Muzzle flash skipped: player world parent has no globalToLocal().");
            return;
        }

        const worldX = globalPosition.x;
        const worldY = globalPosition.y;
        const localPosition = flashParent.globalToLocal(new Laya.Point(worldX, worldY), false);
        const globalDirectionEnd = new Laya.Point(worldX + Math.cos(angle * Math.PI / 180), worldY + Math.sin(angle * Math.PI / 180));
        const localDirectionEnd = flashParent.globalToLocal(globalDirectionEnd, false);
        const localAngle = Math.atan2(localDirectionEnd.y - localPosition.y, localDirectionEnd.x - localPosition.x) * 180 / Math.PI;
        const flash = new Laya.Sprite();
        flash.name = "muzzle_flash";
        flash.mouseEnabled = false;
        flash.zOrder = 10000;
        flash.pos(localPosition.x, localPosition.y);
        flash.rotation = localAngle;
        flash.scale(0.45, 0.45);
        flashParent.addChild(flash);
        console.info(`[CombatVFX] Muzzle flash created: world=(${worldX.toFixed(1)}, ${worldY.toFixed(1)}), local=(${localPosition.x.toFixed(1)}, ${localPosition.y.toFixed(1)}), angle=${localAngle.toFixed(1)}, parent=${flashParent.name || flashParent.constructor?.name || "unnamed"}`);
        this.spawnMuzzleSparks(flashParent, localPosition, localAngle);

        void PlayerRangedController.loadMuzzleFlashFrames().then((frames) => {
            if (flash.destroyed || frames.length === 0) {
                console.warn(`[CombatVFX] Muzzle flash has no usable texture frames (loaded ${frames.length}/4); spriteDestroyed=${flash.destroyed}.`);
                if (!flash.destroyed) flash.destroy();
                return;
            }

            // Play the whole ignition -> expansion -> decay sequence. Smooth scale
            // and alpha animation bridges the authored frame changes.
            flash.texture = frames[0] || frames[1] || frames[2];
            flash.scale(0.12, 0.12);
            this.centerBulletPivot(flash);
            console.info(`[CombatVFX] Muzzle flash animation started: frames=${frames.length}, size=${flash.texture.width}x${flash.texture.height}, scale=${flash.scaleX.toFixed(2)}.`);
            Laya.Tween.to(flash, { scaleX: 0.45, scaleY: 0.45 }, 65, Laya.Ease.quadOut);
            const frameTimes = [22, 46, 76];
            for (let i = 1; i < Math.min(frames.length, 4); i++) {
                Laya.timer.once(frameTimes[i - 1], flash, () => {
                    if (!flash.destroyed) flash.texture = frames[i];
                });
            }
            Laya.timer.once(72, flash, () => {
                if (!flash.destroyed) {
                    Laya.Tween.to(flash, { alpha: 0, scaleX: 0.34, scaleY: 0.34 }, 88, Laya.Ease.quadIn,
                        Laya.Handler.create(this, () => {
                            console.info("[CombatVFX] Muzzle flash finished; sprite removed.");
                            if (!flash.destroyed) flash.destroy();
                        }));
                }
            });
        });
    }

    private spawnMuzzleSparks(parent: Laya.Sprite, origin: Laya.Point, angle: number): void {
        const colors = ["#fffbd8", "#fff2a8", "#ffe36a", "#fff7c2", "#ffdc72"];
        for (let i = 0; i < colors.length; i++) {
            const spread = (Math.random() - 0.5) * 62;
            const radians = (angle + spread) * Math.PI / 180;
            const length = 4 + Math.random() * 7;
            const distance = 12 + Math.random() * 22;
            const spark = new Laya.Sprite();
            spark.name = "muzzle_spark";
            spark.mouseEnabled = false;
            spark.graphics.drawLine(0, 0, length, 0, colors[i], i === 0 ? 2 : 1);
            spark.pos(origin.x + Math.cos(radians) * 2, origin.y + Math.sin(radians) * 2);
            spark.rotation = angle + spread;
            spark.alpha = 0.95;
            spark.zOrder = 10001;
            parent.addChild(spark);
            Laya.Tween.to(spark, {
                x: spark.x + Math.cos(radians) * distance,
                y: spark.y + Math.sin(radians) * distance,
                alpha: 0,
                scaleX: 0.3,
                scaleY: 0.3,
            }, 75 + Math.random() * 65, Laya.Ease.quadOut,
            Laya.Handler.create(this, () => {
                if (!spark.destroyed) spark.destroy();
            }));
        }
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

        if (this.aimActive) {
            this.visualAimX = this.aimX;
            this.visualAimY = this.aimY;
        } else {
            const moveX = Joystick.instance?.valueX || 0;
            const moveY = Joystick.instance?.valueY || 0;
            if (moveX * moveX + moveY * moveY > 0.0009) {
                this.visualAimX = moveX;
                this.visualAimY = moveY;
            }
        }

        const direction = { x: this.visualAimX, y: this.visualAimY };
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

    private resolveMuzzleGlobalPoint(owner: Laya.Sprite, direction: { x: number; y: number }): Laya.Point {
        const image = this.controller.rangedWeaponImageNode as Laya.Sprite | null;
        let muzzle: Laya.Point;
        if (image && !image.destroyed && Number(image.width) > 0 && Number(image.height) > 0 && typeof image.localToGlobal === "function") {
            const left = image.localToGlobal(new Laya.Point(0, image.height * 0.5), false);
            const right = image.localToGlobal(new Laya.Point(image.width, image.height * 0.5), false);
            const center = image.localToGlobal(new Laya.Point(image.width * 0.5, image.height * 0.5), false);
            const leftDot = (left.x - center.x) * direction.x + (left.y - center.y) * direction.y;
            const rightDot = (right.x - center.x) * direction.x + (right.y - center.y) * direction.y;
            muzzle = rightDot >= leftDot ? right : left;
        } else {
            muzzle = owner.localToGlobal(new Laya.Point(), false);
        }

        // Per-weapon offsets are stored in the equipped item's data and measured
        // in the gun image's local pixels, so rotated/flipped guns stay aligned.
        if (image && !image.destroyed) {
            const equippedWeapon = DataManager.getInstance().getEquippedItem("weapon");
            const weaponMeta = equippedWeapon ? DataManager.getInstance().resolveItemMeta(equippedWeapon.itemId) : null;
            const offsetX = Number(weaponMeta?.muzzleOffsetX) || 0;
            const offsetY = Number(weaponMeta?.muzzleOffsetY) || 0;
            if (offsetX !== 0 || offsetY !== 0) {
                const origin = image.localToGlobal(new Laya.Point(0, 0), false);
                const offsetPoint = image.localToGlobal(new Laya.Point(offsetX, offsetY), false);
                muzzle.x += offsetPoint.x - origin.x;
                muzzle.y += offsetPoint.y - origin.y;
            }
        }

        const forwardOffset = 5 + (Number(this.controller.rangedBulletSpawnOffsetX) || 0);
        const verticalOffset = Number(this.controller.rangedBulletSpawnOffsetY) || 0;
        return new Laya.Point(
            muzzle.x + direction.x * forwardOffset,
            muzzle.y + direction.y * forwardOffset + verticalOffset,
        );
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
