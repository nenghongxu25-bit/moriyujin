const { regClass, property } = Laya;

import { PlayerController } from "../../Player/PlayerController";
import { DataManager } from "../../systems/datamanager";

@regClass()
export class attack extends Laya.Script {
    @property(Laya.Node)
    public playerNode: Laya.Node | null = null;

    @property(Laya.Sprite)
    public attackBase: Laya.Sprite | null = null;

    @property(Laya.Sprite)
    public attackHandle: Laya.Sprite | null = null;

    @property(Laya.Node)
    public weaponIconNode: Laya.Node | null = null;

    @property(Number)
    public radius: number = 48;

    @property(Number)
    public dragThreshold: number = 16;

    @property(Number)
    public tapMaxDistance: number = 14;

    @property(Boolean)
    public meleeAutoAttackEnabled: boolean = true;

    @property(Number)
    public rangedChargeStartAngle: number = 60;

    @property(Number)
    public rangedChargeEndAngle: number = 20;

    @property(Number)
    public rangedChargeVisualDuration: number = 1000;

    @property(Number)
    public rangedChargeSegments: number = 18;

    @property(String)
    public rangedChargeFillColor: string = "#000000";

    @property(String)
    public rangedChargeLineColor: string = "#000000";

    private boundTarget: Laya.Node | null = null;
    private handleStartX: number = 0;
    private handleStartY: number = 0;
    private centerX: number = 0;
    private centerY: number = 0;
    private pressing: boolean = false;
    private dragging: boolean = false;
    private activePointerId: number = -1;
    private pointerStartX: number = 0;
    private pointerStartY: number = 0;
    private maxDragDistance: number = 0;
    private lastAimX: number = 0;
    private lastAimY: number = 0;
    private lastDragRatio: number = 0;
    private pressStartedAt: number = 0;
    private autoAttackStarted: boolean = false;
    private rangedChargeVisible: boolean = false;
    private rangedIndicatorNode: Laya.Sprite | null = null;
    private defaultIconSrc: string = "";
    private lastWeaponIconSignature: string = "__init";

    onAwake(): void {
        this.resolveParts();
        this.captureDefaultIconSrc();
        this.refreshWeaponIcon(true);
        this.captureLayout();
        this.bindInputTarget();
    }

    onEnable(): void {
        this.resolveParts();
        this.captureDefaultIconSrc();
        this.refreshWeaponIcon(true);
        this.captureLayout();
        this.bindInputTarget();
    }

    onUpdate(): void {
        this.refreshWeaponIcon();
        this.updateRangedChargeIndicator();
    }

    onDisable(): void {
        this.stopInput();
        this.unbindInputTarget();
    }

    onDestroy(): void {
        this.stopInput();
        this.unbindInputTarget();
    }

    private bindInputTarget(): void {
        this.unbindInputTarget();

        const target = (this.attackBase || this.owner) as any;
        if (!target) {
            return;
        }

        this.boundTarget = target;
        target.mouseEnabled = true;
        if ("mouseThrough" in target) {
            target.mouseThrough = false;
        }

        target.on("mousedown", this, this.onPointerDown);
        target.on("touchstart", this, this.onPointerDown);
    }

    private unbindInputTarget(): void {
        if (!this.boundTarget) {
            return;
        }

        this.boundTarget.offAllCaller(this);
        this.boundTarget = null;
    }

    private onPointerDown(e: any): void {
        this.resolveParts();
        this.captureLayout();

        this.pressing = true;
        this.dragging = false;
        this.maxDragDistance = 0;
        this.lastAimX = 0;
        this.lastAimY = 0;
        this.lastDragRatio = 0;
        this.pressStartedAt = Date.now();
        this.autoAttackStarted = false;
        this.activePointerId = this.getPointerId(e);
        const pointer = this.getStagePointer();
        this.pointerStartX = pointer.x;
        this.pointerStartY = pointer.y;

        Laya.stage.on("mousemove", this, this.onPointerMove);
        Laya.stage.on("mouseup", this, this.onPointerUp);
        Laya.stage.on("mouseout", this, this.onPointerUp);
        Laya.stage.on("touchmove", this, this.onPointerMove);
        Laya.stage.on("touchend", this, this.onPointerUp);

    }

    private onPointerMove(e: any): void {
        if (!this.pressing || !this.attackBase || !this.attackHandle) {
            return;
        }

        const pointerId = this.getPointerId(e);
        if (
            this.activePointerId !== -1 &&
            pointerId !== -1 &&
            pointerId !== this.activePointerId
        ) {
            return;
        }

        const offset = this.resolveClampedOffset();
        const pointer = this.getStagePointer();
        const dragX = pointer.x - this.pointerStartX;
        const dragY = pointer.y - this.pointerStartY;
        const dragDistance = Math.sqrt(dragX * dragX + dragY * dragY);
        this.maxDragDistance = Math.max(this.maxDragDistance, dragDistance);

        this.attackHandle.pos(this.handleStartX + offset.x, this.handleStartY + offset.y);
        this.lastAimX = offset.x;
        this.lastAimY = offset.y;
        this.lastDragRatio = Math.max(0, Math.min(1, Math.sqrt(offset.x * offset.x + offset.y * offset.y) / Math.max(1, this.radius || 1)));

        if (dragDistance < this.dragThreshold) {
            return;
        }

        this.dragging = true;
        const controller = this.resolvePlayerController();
        if (!controller) {
            return;
        }

        controller.setAttackFacingByDirection(offset.x, offset.y);

        if (!controller.isEquippedRangedWeapon() && this.meleeAutoAttackEnabled) {
            this.ensureMeleeAutoAttack(controller);
        } else if (controller.isEquippedRangedWeapon()) {
            controller.setRangedWeaponAimByDirection(offset.x, offset.y);
            this.showRangedChargeIndicator(controller, offset.x, offset.y);
        }
    }

    private onPointerUp(e: any): void {
        const pointerId = this.getPointerId(e);
        if (
            this.activePointerId !== -1 &&
            pointerId !== -1 &&
            pointerId !== this.activePointerId
        ) {
            return;
        }

        const controller = this.resolvePlayerController();
        const shouldTapAttack = !this.dragging || this.maxDragDistance <= this.tapMaxDistance;
        const shouldReleaseRangedAttack = !!controller && this.dragging && controller.isEquippedRangedWeapon();
        const rangedAttackOptions = controller && shouldReleaseRangedAttack
            ? {
                chargeRatio: controller.resolveRangedChargeRatio(Date.now() - this.pressStartedAt, this.lastDragRatio),
                directionX: this.lastAimX,
                directionY: this.lastAimY,
                spreadAngle: this.resolveRangedChargeConeAngle(),
            }
            : undefined;

        this.stopInput();

        if (controller && shouldReleaseRangedAttack && rangedAttackOptions) {
            controller.setRangedWeaponAimByDirection(rangedAttackOptions.directionX, rangedAttackOptions.directionY);
            controller.playAttack(false, rangedAttackOptions);
            Laya.timer.once(Math.max(80, (controller.rangedAttackHitDelay || 0) + 50), controller, controller.clearRangedWeaponAim);
        } else if (controller && shouldTapAttack) {
            controller.playAttack();
        }

        controller?.clearAttackFacingOverride();
    }

    private ensureMeleeAutoAttack(controller: PlayerController): void {
        if (this.autoAttackStarted) {
            return;
        }

        this.autoAttackStarted = true;
        controller.playAttack(true);
        Laya.timer.loop(this.resolveAutoAttackInterval(controller), this, this.onAutoAttackTick);
    }

    private onAutoAttackTick(): void {
        if (!this.pressing || !this.dragging) {
            return;
        }

        const controller = this.resolvePlayerController();
        if (!controller || controller.isEquippedRangedWeapon()) {
            return;
        }

        controller.playAttack(true);
    }

    private stopInput(): void {
        const wasPressing = this.pressing;
        this.pressing = false;
        this.dragging = false;
        this.activePointerId = -1;
        this.lastAimX = 0;
        this.lastAimY = 0;
        this.lastDragRatio = 0;
        this.pressStartedAt = 0;
        this.autoAttackStarted = false;

        Laya.timer.clear(this, this.onAutoAttackTick);
        Laya.stage.off("mousemove", this, this.onPointerMove);
        Laya.stage.off("mouseup", this, this.onPointerUp);
        Laya.stage.off("mouseout", this, this.onPointerUp);
        Laya.stage.off("touchmove", this, this.onPointerMove);
        Laya.stage.off("touchend", this, this.onPointerUp);
        this.resetHandle();
        this.hideRangedChargeIndicator();

        if (wasPressing) {
            const controller = this.resolvePlayerController();
            controller?.clearQueuedAttack();
            controller?.clearAttackFacingOverride();
            controller?.clearRangedWeaponAim();
        }
    }

    private resetHandle(): void {
        if (!this.attackHandle) {
            return;
        }

        this.attackHandle.pos(this.handleStartX, this.handleStartY);
    }

    private resolveAutoAttackInterval(controller: PlayerController): number {
        const attackSpeed = Math.max(0.1, controller.attackSpeed || 1);
        return Math.max(80, Math.floor((controller.attackCooldown || 300) / attackSpeed));
    }

    private showRangedChargeIndicator(controller: PlayerController, aimX: number, aimY: number): void {
        const indicator = this.resolveRangedIndicator(controller);
        if (!indicator) {
            return;
        }

        this.rangedChargeVisible = true;
        indicator.visible = true;
        if ("active" in indicator) {
            (indicator as any).active = true;
        }

        this.drawRangedChargeIndicator(controller, aimX, aimY);
    }

    private updateRangedChargeIndicator(): void {
        if (!this.rangedChargeVisible || !this.pressing || !this.dragging) {
            return;
        }

        const controller = this.resolvePlayerController();
        if (!controller || !controller.isEquippedRangedWeapon()) {
            this.hideRangedChargeIndicator();
            return;
        }

        this.drawRangedChargeIndicator(controller, this.lastAimX, this.lastAimY);
    }

    private hideRangedChargeIndicator(): void {
        this.rangedChargeVisible = false;
        const indicator = this.rangedIndicatorNode;
        if (!indicator) {
            return;
        }

        indicator.visible = false;
        indicator.graphics?.clear();
        if ("active" in indicator) {
            (indicator as any).active = false;
        }
    }

    private drawRangedChargeIndicator(controller: PlayerController, aimX: number, aimY: number): void {
        const indicator = this.resolveRangedIndicator(controller);
        if (!indicator || !indicator.graphics) {
            return;
        }

        const range = Math.max(1, Number(controller.rangedAttackRange) || 1);
        const coneAngle = this.resolveRangedChargeConeAngle();
        const direction = this.resolveAimAngle(aimX, aimY, controller, indicator);
        const half = coneAngle * 0.5;
        const segments = Math.max(2, Math.floor(this.rangedChargeSegments || 18));
        const points: number[] = [0, 0];

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const degrees = direction - half + coneAngle * t;
            const radians = degrees * Math.PI / 180;
            points.push(Math.cos(radians) * range, Math.sin(radians) * range);
        }

        indicator.graphics.clear();
        (indicator.graphics as any).drawPoly(0, 0, points, this.rangedChargeFillColor, this.rangedChargeLineColor, 1);
    }

    private resolveRangedChargeConeAngle(): number {
        const elapsed = Math.max(0, Date.now() - this.pressStartedAt);
        const duration = Math.max(1, Number(this.rangedChargeVisualDuration) || 1);
        const ratio = Math.max(0, Math.min(1, elapsed / duration));
        const startAngle = Number(this.rangedChargeStartAngle) || 60;
        const endAngle = Number(this.rangedChargeEndAngle) || 20;
        return startAngle + (endAngle - startAngle) * ratio;
    }

    private resolveAimAngle(aimX: number, aimY: number, controller: PlayerController, indicator: Laya.Sprite): number {
        const scaleSign = this.resolveWorldScaleSign(indicator);
        const localAimX = scaleSign.x < 0 ? -aimX : aimX;
        const localAimY = scaleSign.y < 0 ? -aimY : aimY;
        const localFacing = scaleSign.x < 0
            ? -controller.movement.getAttackDirection()
            : controller.movement.getAttackDirection();
        const magnitude = Math.sqrt(localAimX * localAimX + localAimY * localAimY);
        if (magnitude > 0.0001) {
            return Math.atan2(localAimY, localAimX) * 180 / Math.PI;
        }

        return localFacing >= 0 ? 0 : 180;
    }

    private resolveWorldScaleSign(node: Laya.Node): { x: number; y: number } {
        let scaleX = 1;
        let scaleY = 1;
        let current: any = node;

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

    private resolveRangedIndicator(controller: PlayerController): Laya.Sprite | null {
        if (this.rangedIndicatorNode && !this.rangedIndicatorNode.destroyed) {
            return this.rangedIndicatorNode;
        }

        this.rangedIndicatorNode = this.findChildByName(controller.owner as Laya.Node, "attack_ranged") as Laya.Sprite | null;
        if (this.rangedIndicatorNode) {
            this.rangedIndicatorNode.mouseEnabled = false;
            this.hideRangedChargeIndicator();
        }

        return this.rangedIndicatorNode;
    }

    private resolveClampedOffset(): { x: number; y: number } {
        const pointer = this.getStagePointer();
        const localPoint = this.attackBase!.globalToLocal(new Laya.Point(pointer.x, pointer.y));

        let offsetX = localPoint.x - this.centerX;
        let offsetY = localPoint.y - this.centerY;
        const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
        const maxRadius = Math.max(1, this.radius || 1);

        if (distance > maxRadius) {
            offsetX = (offsetX / distance) * maxRadius;
            offsetY = (offsetY / distance) * maxRadius;
        }

        return { x: offsetX, y: offsetY };
    }

    private getStagePointer(): { x: number; y: number } {
        const mouseX = typeof Laya.stage.mouseX === "number" ? Laya.stage.mouseX : (Laya.stage as any).touchX;
        const mouseY = typeof Laya.stage.mouseY === "number" ? Laya.stage.mouseY : (Laya.stage as any).touchY;
        return { x: Number(mouseX) || 0, y: Number(mouseY) || 0 };
    }

    private captureLayout(): void {
        if (!this.attackBase || !this.attackHandle) {
            return;
        }

        this.centerX = this.attackBase.width / 2;
        this.centerY = this.attackBase.height / 2;
        this.handleStartX = this.attackHandle.x;
        this.handleStartY = this.attackHandle.y;
    }

    private resolveParts(): void {
        if (!this.attackBase) {
            this.attackBase = this.findChildByName(this.owner as Laya.Node, "base") as Laya.Sprite | null;
        }

        if (!this.attackHandle) {
            this.attackHandle = this.findChildByName(this.owner as Laya.Node, "handle") as Laya.Sprite | null;
        }

        if (!this.weaponIconNode) {
            this.weaponIconNode =
                this.findChildByName(this.owner as Laya.Node, "gimg") ||
                this.findChildByName(this.owner as Laya.Node, "img");
        }
    }

    private captureDefaultIconSrc(): void {
        if (this.defaultIconSrc || !this.weaponIconNode) {
            return;
        }

        const icon = this.weaponIconNode as any;
        this.defaultIconSrc = String(icon.src || icon.skin || "");
    }

    private refreshWeaponIcon(force: boolean = false): void {
        this.resolveParts();
        if (!this.weaponIconNode) {
            return;
        }

        const dataManager = DataManager.getInstance();
        const weapon = dataManager.getEquippedItem("weapon");
        const meta = weapon?.itemId ? dataManager.resolveItemMeta(weapon.itemId) : null;
        const iconPath = weapon?.icon || meta?.icon || "";
        const resolvedIconPath = iconPath ? this.resolveIconPath(iconPath) : this.defaultIconSrc;
        const signature = `${weapon?.itemId || ""}|${resolvedIconPath}`;

        if (!force && signature === this.lastWeaponIconSignature) {
            return;
        }

        this.lastWeaponIconSignature = signature;
        this.setImageSource(this.weaponIconNode, resolvedIconPath);
    }

    private setImageSource(node: Laya.Node | null, path: string): void {
        const target = node as any;
        if (!target) {
            return;
        }

        if ("visible" in target) {
            target.visible = !!path;
        }
        if ("skin" in target) {
            target.skin = path;
        }
        if ("src" in target) {
            target.src = path;
        }
    }

    private resolveIconPath(iconPath: string): string {
        const raw = String(iconPath || "").trim();
        if (!raw) {
            return "";
        }

        if (raw.startsWith("res://")) {
            return raw;
        }

        const normalized = raw.replace(/^assets\//, "");
        const url = (Laya as any).URL;
        if (url && typeof url.formatURL === "function") {
            return String(url.formatURL(normalized) || normalized);
        }

        return normalized;
    }
    private findChildByName(root: Laya.Node | null, name: string): Laya.Node | null {
        if (!root) {
            return null;
        }

        if (root.name === name) {
            return root;
        }

        const children = (root as any).children || (root as any)._children || [];
        for (let i = 0; i < children.length; i++) {
            const found = this.findChildByName(children[i] as Laya.Node, name);
            if (found) {
                return found;
            }
        }

        return null;
    }

    private getPointerId(e: any): number {
        return e && typeof e.touchId === "number" ? e.touchId : -1;
    }

    private resolvePlayerController(): PlayerController | null {
        if (this.playerNode) {
            const controller = this.playerNode.getComponent(PlayerController);
            if (controller) {
                return controller;
            }
        }

        return PlayerController.activeInstance;
    }
}
