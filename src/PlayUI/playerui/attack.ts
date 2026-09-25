const { regClass, property } = Laya;

import { PlayerController } from "../../Player/PlayerController";
import { DataManager } from "../../systems/datamanager";
import { RangedAimState } from "../../Player/RangedAimState";
import { RangedInputDiagnostics } from "../../debug/RangedInputDiagnostics";
import { PlayerCamera2D } from "../../Player/PlayerCamera2D";

@regClass("3db5f4f4-1d50-4b5c-a876-7bc6f7a7eb10")
export class attack extends Laya.Script {
    public static activeInstance: attack | null = null;
    public selectedThrowableId = "";
    public selectedThrowableSlot = -1;
    public selectedThrowableSource: "quick" | "rig" = "quick";
    private throwOverlay: Laya.Sprite | null = null;
    private throwTargetWorld: Laya.Point | null = null;
    private throwModePressed = false;
    private readonly throwRangePx = 800;
    private readonly throwBlastRadiusPx = 150;
    public static activeDirectionX: number = 0;
    public static activeDirectionY: number = 0;
    public static directionActive: boolean = false;
    private static readonly selectedFireModes = new Map<string, boolean>();
    private fireModeSwitch: Laya.Sprite | null = null;
    private switchColor = "";

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

    @property({ type: String, caption: "瞄准提示颜色" })
    public rangedAimColor: string = "#eee9d9";

    @property({ type: String, caption: "瞄准收拢完成颜色" })
    public rangedAimReadyColor: string = "#ff4545";

    @property({ type: Number, caption: "连发扳机延迟毫秒" })
    public triggerDelayMs = 500;
    @property({ type: Number, caption: "枪口方向死区" })
    public aimDirectionDeadZone = 6;
    @property({ type: Number, caption: "精瞄进入比例" })
    public aimEnterRatio = 0.65;
    @property({ type: Number, caption: "精瞄退出比例" })
    public aimExitRatio = 0.5;
    @property({ type: Boolean, caption: "运行射击输入测试（会自动开枪）" })
    public inputDiagnosticsEnabled = false;
    private inputDiagnostics: RangedInputDiagnostics | null = null;
    private pressRanged = false;
    private pressAutomatic = false;
    private pressWeaponId = "";
    private precisionAim = false;
    private precisionStartedAt = 0;
    private nextShotAt = 0;
    private fireIntervalMs = 160;
    private rememberedAimX = 0;
    private rememberedAimY = 0;

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
    private readonly rangedArcPoints: number[] = [];
    private recoilSpread = 0;
    private lastRecoilShotAt = 0;
    private lastRecoilUpdateAt = Date.now();
    private recoilWobblePhase = 0;
    private recoilPreviewUntil = 0;
    private recoilPreviewBaseConeAngle = 20;
    private lastHapticAt = 0;
    private lastRecoilAimX = 1;
    private lastRecoilAimY = 0;
    private lastIndicatorRange = NaN;
    private lastIndicatorCone = NaN;
    private lastIndicatorDirection = NaN;
    private lastIndicatorRecoil = NaN;
    private lastIndicatorJitter = NaN;
    private lastIndicatorSegments = 0;
    private lastIndicatorColor = "";
    private defaultIconSrc: string = "";
    private lastWeaponIconSignature: string = "__init";

    onAwake(): void {
        attack.activeInstance = this;
        this.resolveParts();
        this.captureDefaultIconSrc();
        this.refreshWeaponIcon(true);
        this.captureLayout();
        this.bindInputTarget();
        this.bindFireModeSwitch();
    }

    onEnable(): void {
        attack.activeInstance = this;
        this.resolveParts();
        this.captureDefaultIconSrc();
        this.refreshWeaponIcon(true);
        this.captureLayout();
        this.bindInputTarget();
        this.bindFireModeSwitch();
    }

    onUpdate(): void {
        if (this.inputDiagnosticsEnabled && !this.inputDiagnostics && this.resolvePlayerController()?.isEquippedRangedWeapon()) {
            this.inputDiagnostics = new RangedInputDiagnostics(this);
        }
        this.inputDiagnostics?.update();
        this.refreshWeaponIcon();
        this.refreshFireModeSwitch();
        this.updateRecoilRecovery();
        this.updateRangedHold();
        this.updateRangedChargeIndicator();
    }

    onDisable(): void {
        if (attack.activeInstance === this) attack.activeInstance = null;
        this.inputDiagnostics?.stop();
        this.inputDiagnostics = null;
        this.recoilPreviewUntil = 0;
        this.stopInput();
        this.unbindInputTarget();
        this.fireModeSwitch?.offAllCaller(this);
    }

    onDestroy(): void {
        if (attack.activeInstance === this) attack.activeInstance = null;
        this.inputDiagnostics?.stop();
        this.inputDiagnostics = null;
        this.recoilPreviewUntil = 0;
        this.stopInput();
        this.unbindInputTarget();
        this.fireModeSwitch?.offAllCaller(this);
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
        if (this.pressing) return;
        this.resolveParts();
        this.captureLayout();
        this.recoilPreviewUntil = 0;
        this.hideRangedChargeIndicator();

        this.pressing = true;
        this.dragging = false;
        this.maxDragDistance = 0;
        this.lastAimX = 0;
        this.lastAimY = 0;
        this.lastDragRatio = 0;
        this.pressStartedAt = Date.now();
        const controller = this.resolvePlayerController();
        this.throwModePressed = !!this.selectedThrowableId;
        if (this.throwModePressed) {
            PlayerCamera2D.throwAimActive = true;
            controller?.playThrowableSound(this.selectedThrowableId, "prime");
            e?.stopPropagation?.();
            this.pressRanged = false;
            this.pressAutomatic = false;
            this.throwTargetWorld = this.getPlayerWorldPoint(controller);
            this.updateThrowPreview(controller);
        }
        const data = DataManager.getInstance();
        const weapon = data.getEquippedItem("weapon");
        const meta = weapon ? data.resolveItemMeta(weapon.itemId) : null;
        this.pressWeaponId = weapon?.itemId || "";
        this.pressRanged = !!controller?.isEquippedRangedWeapon();
        this.pressAutomatic = this.pressRanged && meta?.fireMode === "auto" &&
            attack.selectedFireModes.get(this.pressWeaponId) === true;
        if (this.throwModePressed) this.pressRanged = this.pressAutomatic = false;
        this.fireIntervalMs = Math.max(80, Number(meta?.fireIntervalMs) || 160);
        this.precisionAim = false;
        this.precisionStartedAt = 0;
        this.nextShotAt = this.pressStartedAt + Math.max(0, this.triggerDelayMs);
        if (this.pressRanged && controller) {
            this.lastAimX = this.rememberedAimX || this.rememberedAimY ? this.rememberedAimX :
                (controller.movement.getAttackDirection() >= 0 ? 1 : -1);
            this.lastAimY = this.rememberedAimY;
        }
        this.autoAttackStarted = false;
        this.activePointerId = this.getPointerId(e);
        const pointer = this.getStagePointer();
        this.pointerStartX = pointer.x;
        this.pointerStartY = pointer.y;

        Laya.stage.on("mousemove", this, this.onPointerMove);
        Laya.stage.on("mouseup", this, this.onPointerUp);
        Laya.stage.on("mouseout", this, this.onPointerCancel);
        Laya.stage.on("blur", this, this.onPointerCancel);
        Laya.stage.on("touchmove", this, this.onPointerMove);
        Laya.stage.on("touchend", this, this.onPointerUp);
        Laya.stage.on("touchcancel", this, this.onPointerCancel);

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
        this.lastDragRatio = Math.max(0, Math.min(1, Math.sqrt(offset.x * offset.x + offset.y * offset.y) / Math.max(1, this.radius || 1)));

        if (this.throwModePressed) {
            this.dragging = dragDistance >= this.dragThreshold;
            const magnitude = Math.hypot(offset.x, offset.y);
            const player = this.getPlayerWorldPoint(this.resolvePlayerController());
            if (player) {
                const scale = magnitude > 0 ? (this.throwRangePx * Math.min(1, magnitude / Math.max(1, this.radius))) / magnitude : 0;
                this.throwTargetWorld = new Laya.Point(player.x + offset.x * scale, player.y + offset.y * scale);
            }
            this.updateThrowPreview(this.resolvePlayerController());
            return;
        }

        if (this.pressRanged) {
            const controller = this.resolvePlayerController();
            if (!controller) return;
            const magnitude = Math.hypot(offset.x, offset.y);
            if (magnitude >= Math.max(1, this.aimDirectionDeadZone)) {
                this.lastAimX = this.rememberedAimX = offset.x / magnitude;
                this.lastAimY = this.rememberedAimY = offset.y / magnitude;
            }
            if (dragDistance >= this.dragThreshold) this.dragging = true;
            const enter = Math.max(0.05, Math.min(1, this.aimEnterRatio));
            const exit = Math.max(0, Math.min(enter - 0.01, this.aimExitRatio));
            const aiming = this.pressAutomatic ? this.lastDragRatio >= (this.precisionAim ? exit : enter) : this.dragging;
            if (aiming !== this.precisionAim) {
                this.precisionAim = aiming;
                this.precisionStartedAt = aiming ? Date.now() : 0;
            }
            this.updateRangedHold();
            return;
        }
        this.lastAimX = offset.x;
        this.lastAimY = offset.y;

        if (dragDistance < this.dragThreshold) {
            return;
        }

        this.dragging = true;
        attack.activeDirectionX = offset.x;
        attack.activeDirectionY = offset.y;
        attack.directionActive = true;

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
        if (!this.pressing) return;
        const pointerId = this.getPointerId(e);
        if (
            this.activePointerId !== -1 &&
            pointerId !== -1 &&
            pointerId !== this.activePointerId
        ) {
            return;
        }

        const controller = this.resolvePlayerController();
        if (this.throwModePressed) {
            const itemId = this.selectedThrowableId;
            const target = this.throwTargetWorld;
            const slot = this.selectedThrowableSlot;
            const shouldThrow = this.dragging && !!controller && !!target && !!itemId &&
                controller.throwThrowable(itemId, target.x, target.y, 2000, this.throwBlastRadiusPx);
            this.stopInput();
            if (shouldThrow) {
                controller.playThrowableSound(itemId, "throw");
                const data=DataManager.getInstance();
                if(this.selectedThrowableSource==="rig")data.consumeThrowableFromEquipmentContainer("rig",slot,itemId);
                else data.consumeThrowableQuickSlot(slot);
                const stillAvailable=this.selectedThrowableSource==="rig"
                    ?data.getEquippedContainerSnapshot("rig")[slot]?.itemId===itemId
                    :data.getQuickSlotItems()[slot]?.itemId===itemId;
                if(!stillAvailable)this.clearSelectedThrowable();
            }
            controller?.clearAttackFacingOverride();
            return;
        }
        const sameWeapon = (DataManager.getInstance().getEquippedItem("weapon")?.itemId || "") === this.pressWeaponId;
        const shouldTapAttack = !this.pressRanged && sameWeapon && (!this.dragging || this.maxDragDistance <= this.tapMaxDistance);
        const shouldReleaseRangedAttack = !!controller && sameWeapon && !this.pressAutomatic && this.dragging && controller.isEquippedRangedWeapon();
        const rangedAttackOptions = controller && shouldReleaseRangedAttack
            ? {
                chargeRatio: controller.resolveRangedChargeRatio(Date.now() - this.precisionStartedAt, 0),
                directionX: this.lastAimX,
                directionY: this.lastAimY,
                spreadAngle: this.resolveRangedChargeConeAngle(),
            }
            : undefined;

        this.stopInput();

        if (controller && shouldReleaseRangedAttack && rangedAttackOptions) {
            controller.setRangedWeaponAimByDirection(rangedAttackOptions.directionX, rangedAttackOptions.directionY);
            if (controller.playAttack(false, rangedAttackOptions)) {
                this.registerRangedShot(rangedAttackOptions.directionX, rangedAttackOptions.directionY, rangedAttackOptions.spreadAngle);
            }
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
        const previewAimX = this.lastAimX || this.rememberedAimX || 1;
        const previewAimY = this.lastAimY || this.rememberedAimY;
        this.pressing = false;
        PlayerCamera2D.throwAimActive = false;
        this.throwModePressed = false;
        this.hideThrowPreview();
        this.dragging = false;
        this.activePointerId = -1;
        this.lastAimX = 0;
        this.lastAimY = 0;
        this.lastDragRatio = 0;
        this.pressStartedAt = 0;
        this.autoAttackStarted = false;
        attack.activeDirectionX = 0;
        attack.activeDirectionY = 0;
        attack.directionActive = false;
        RangedAimState.reset();
        this.pressRanged = this.pressAutomatic = this.precisionAim = false;
        this.precisionStartedAt = this.nextShotAt = 0;

        Laya.timer.clear(this, this.onAutoAttackTick);
        Laya.stage.off("mousemove", this, this.onPointerMove);
        Laya.stage.off("mouseup", this, this.onPointerUp);
        Laya.stage.off("mouseout", this, this.onPointerCancel);
        Laya.stage.off("blur", this, this.onPointerCancel);
        Laya.stage.off("touchmove", this, this.onPointerMove);
        Laya.stage.off("touchend", this, this.onPointerUp);
        Laya.stage.off("touchcancel", this, this.onPointerCancel);
        this.resetHandle();
        if (Date.now() < this.recoilPreviewUntil) {
            const controller = this.resolvePlayerController();
            if (controller?.isEquippedRangedWeapon()) {
                this.showRangedChargeIndicator(controller,
                    previewAimX,
                    previewAimY);
            } else {
                this.hideRangedChargeIndicator();
            }
        } else {
            this.hideRangedChargeIndicator();
        }

        if (wasPressing) {
            const controller = this.resolvePlayerController();
            controller?.clearQueuedAttack();
            controller?.clearAttackFacingOverride();
            controller?.clearRangedWeaponAim();
        }
    }

    public selectThrowable(itemId: string, slot: number, source: "quick" | "rig" = "quick"): void {
        PlayerCamera2D.throwAimActive = false;
        this.selectedThrowableId = itemId;
        this.selectedThrowableSlot = slot;
        this.selectedThrowableSource = source;
        this.refreshWeaponIcon(true);
    }

    public clearSelectedThrowable(): void {
        this.selectedThrowableId = "";
        this.selectedThrowableSlot = -1;
        this.selectedThrowableSource = "quick";
        this.refreshWeaponIcon(true);
    }

    private getPlayerWorldPoint(controller: PlayerController | null): Laya.Point | null {
        const owner = controller?.owner as Laya.Sprite | null;
        const parent=owner?.parent as Laya.Sprite|null;
        if(!owner||!parent?.globalToLocal||!owner.localToGlobal)return null;
        const stagePoint=owner.localToGlobal(new Laya.Point(0,0),false);
        return parent.globalToLocal(new Laya.Point(stagePoint.x,stagePoint.y),false);
    }

    private updateThrowPreview(controller: PlayerController | null): void {
        const player = this.getPlayerWorldPoint(controller);
        if (!player || !this.throwTargetWorld) return;
        const owner = controller!.owner as Laya.Sprite;
        const parent = owner.parent as Laya.Sprite;
        if (!parent) return;
        if (!this.throwOverlay || this.throwOverlay.destroyed) {
            this.throwOverlay = new Laya.Sprite();
            this.throwOverlay.zOrder = 999;
            this.throwOverlay.mouseEnabled = false;
        }
        // Ending a throw detaches the reusable preview; attach it again for each aim.
        if (this.throwOverlay.parent !== parent) parent.addChild(this.throwOverlay);
        this.throwOverlay.pos(0, 0);
        this.throwOverlay.graphics.clear();
        this.throwOverlay.graphics.drawCircle(player.x, player.y, this.throwRangePx, "rgba(80,190,255,0.04)", "#68cfff", 2);
        this.throwOverlay.graphics.drawCircle(this.throwTargetWorld.x, this.throwTargetWorld.y, this.throwBlastRadiusPx, "rgba(255,95,55,0.16)", "#ff7958", 2);
        this.throwOverlay.graphics.drawLine(player.x, player.y, this.throwTargetWorld.x, this.throwTargetWorld.y, "#ffffff", 1);
    }

    private hideThrowPreview(): void {
        if (this.throwOverlay && !this.throwOverlay.destroyed) this.throwOverlay.removeSelf();
    }

    private onPointerCancel(e?: any): void {
        // Moving from the handle to its parent is not leaving the game window.
        if (e?.type === "mouseout" && e.target !== Laya.stage) return;
        const pointerId = this.getPointerId(e);
        if (this.activePointerId !== -1 && pointerId !== -1 && pointerId !== this.activePointerId) return;
        this.stopInput();
    }

    private updateRangedHold(): void {
        if (!this.pressing || !this.pressRanged) return;
        const controller = this.resolvePlayerController();
        if (!controller || !controller.isEquippedRangedWeapon() ||
            (DataManager.getInstance().getEquippedItem("weapon")?.itemId || "") !== this.pressWeaponId ||
            Laya.Browser.document?.hidden) { this.stopInput(); return; }
        if (!this.pressAutomatic && !this.dragging) return;
        attack.activeDirectionX = this.lastAimX;
        attack.activeDirectionY = this.lastAimY;
        attack.directionActive = true;
        controller.setAttackFacingByDirection(this.lastAimX, this.lastAimY);
        controller.setRangedWeaponAimByDirection(this.lastAimX, this.lastAimY);
        this.showRangedChargeIndicator(controller, this.lastAimX, this.lastAimY);
        const progress = this.aimProgress();
        RangedAimState.active = this.precisionAim;
        RangedAimState.x = this.lastAimX;
        RangedAimState.y = this.lastAimY;
        RangedAimState.amount = this.precisionAim ? progress * (0.4 + 0.6 * this.lastDragRatio) : 0;
        const now = Date.now();
        if (this.pressAutomatic && now >= this.nextShotAt) {
            const spreadAngle = this.resolveRangedChargeConeAngle();
            const fired = controller.playAttack(false, {
                directionX: this.lastAimX, directionY: this.lastAimY,
                spreadAngle,
                chargeRatio: this.precisionAim ? controller.resolveRangedChargeRatio(now - this.precisionStartedAt, 0) : 0,
                automaticIntervalMs: this.fireIntervalMs,
            });
            if (fired) this.registerRangedShot(this.lastAimX, this.lastAimY, spreadAngle);
            const interval = Math.max(80, this.fireIntervalMs / Math.max(0.1, controller.attackSpeed || 1));
            // Preserve the cadence across frame rounding, but never burst to catch up after a stall.
            if (fired) this.nextShotAt = Math.max(this.nextShotAt + interval, now + interval - Math.min(34, interval / 2));
        }
    }

    private aimProgress(): number {
        if (this.pressRanged && !this.precisionAim) return 0;
        const started = this.pressRanged ? this.precisionStartedAt : this.pressStartedAt;
        return Math.max(0, Math.min(1, (Date.now() - started) / Math.max(1, Number(this.rangedChargeVisualDuration) || 1)));
    }

    private registerRangedShot(aimX: number, aimY: number, firedSpreadAngle: number): void {
        const now = Date.now();
        this.recoilPreviewBaseConeAngle = Math.max(0, firedSpreadAngle - this.recoilSpread);
        this.recoilSpread = Math.min(24, this.recoilSpread + 5.5);
        this.recoilWobblePhase += 1.7;
        this.lastRecoilShotAt = now;
        this.recoilPreviewUntil = now + 300;
        this.lastRecoilAimX = aimX;
        this.lastRecoilAimY = aimY;
        this.triggerFireHaptic(now);
        const controller = this.resolvePlayerController();
        if (controller?.isEquippedRangedWeapon()) {
            this.showRangedChargeIndicator(controller, aimX, aimY);
        }
    }

    private updateRecoilRecovery(): void {
        const now = Date.now();
        const elapsed = Math.max(0, Math.min(50, now - this.lastRecoilUpdateAt));
        this.lastRecoilUpdateAt = now;
        const settleDelay = Math.max(140, this.fireIntervalMs * 1.6);
        if (this.recoilSpread > 0 && now - this.lastRecoilShotAt > settleDelay) {
            this.recoilSpread = Math.max(0, this.recoilSpread - elapsed * 0.075);
        }
    }

    private triggerFireHaptic(now: number): void {
        if (now - this.lastHapticAt < 130) return;
        this.lastHapticAt = now;
        const host = Laya.Browser.window as any;
        try {
            if (typeof host?.tt?.vibrateShort === "function") {
                host.tt.vibrateShort({ type: "light" });
            } else if (typeof host?.wx?.vibrateShort === "function") {
                host.wx.vibrateShort({ type: "light" });
            } else if (typeof host?.navigator?.vibrate === "function") {
                host.navigator.vibrate(12);
            }
        } catch (_error) {
            // Haptics are optional; unsupported devices keep the visual recoil.
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
        const activeAim = this.pressing && (this.dragging || this.pressAutomatic);
        const recoilPreview = !this.pressing && Date.now() < this.recoilPreviewUntil;
        if (!this.rangedChargeVisible || (!activeAim && !recoilPreview)) {
            if (this.rangedChargeVisible && !this.pressing && !recoilPreview) this.hideRangedChargeIndicator();
            return;
        }

        const controller = this.resolvePlayerController();
        if (!controller || !controller.isEquippedRangedWeapon()) {
            this.hideRangedChargeIndicator();
            return;
        }

        const previewing = !this.pressing && Date.now() < this.recoilPreviewUntil;
        this.drawRangedChargeIndicator(controller,
            previewing ? this.lastRecoilAimX : this.lastAimX,
            previewing ? this.lastRecoilAimY : this.lastAimY);
    }

    private hideRangedChargeIndicator(): void {
        this.rangedChargeVisible = false;
        const indicator = this.rangedIndicatorNode;
        if (!indicator) {
            return;
        }

        indicator.visible = false;
        indicator.graphics?.clear();
        this.lastIndicatorRange = NaN;
        if ("active" in indicator) {
            (indicator as any).active = false;
        }
    }

    private drawRangedChargeIndicator(controller: PlayerController, aimX: number, aimY: number): void {
        const indicator = this.resolveRangedIndicator(controller);
        if (!indicator || !indicator.graphics) {
            return;
        }

        const range = Math.max(1, Number(controller.rangedAttackRange) || 1) *
            (this.pressRanged ? 0.75 + 0.25 * this.aimProgress() : 1);
        const coneAngle = this.resolveRangedChargeConeAngle();
        const jitterY = Math.round(Math.sin(Date.now() * 0.045 + this.recoilWobblePhase) * Math.min(5, this.recoilSpread * 0.22));
        const direction = this.resolveAimAngle(aimX, aimY, controller, indicator);
        const half = coneAngle * 0.5;
        const segments = Math.max(2, Math.floor(this.rangedChargeSegments || 18));
        const ready = this.pressing && this.aimProgress() >= 1;
        const color = ready ? (this.rangedAimReadyColor || "#ff4545") :
            (this.rangedAimColor || "#eee9d9");
        if (this.lastIndicatorRange === range && this.lastIndicatorCone === coneAngle &&
            this.lastIndicatorDirection === direction && this.lastIndicatorSegments === segments &&
            this.lastIndicatorColor === color && this.lastIndicatorRecoil === this.recoilSpread &&
            this.lastIndicatorJitter === jitterY) return;
        this.lastIndicatorRange = range;
        this.lastIndicatorCone = coneAngle;
        this.lastIndicatorDirection = direction;
        this.lastIndicatorRecoil = this.recoilSpread;
        this.lastIndicatorJitter = jitterY;
        this.lastIndicatorSegments = segments;
        this.lastIndicatorColor = color;
        // Reuse the existing prefab node; only draw the far arc, never a filled cone.
        indicator.graphics.clear();
        const points = this.rangedArcPoints;
        points.length = (segments + 1) * 2;

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const degrees = direction - half + coneAngle * t;
            const radians = degrees * Math.PI / 180;
            points[i * 2] = Math.cos(radians) * range;
            points[i * 2 + 1] = Math.sin(radians) * range;
        }

        const graphics = indicator.graphics;
        graphics.drawLines(0, 0, points, "#242420", 4);
        graphics.drawLines(0, 0, points, color, 2);
        const radians = direction * Math.PI / 180;
        const cx = Math.cos(radians) * range, cy = Math.sin(radians) * range + jitterY;
        // Open centre keeps small targets readable; the arc still shows real spread.
        const gap = 5 + Math.round(this.recoilSpread * 0.22);
        const arm = gap + 7;
        for (let pass = 0; pass < 2; pass++) {
            const stroke = pass === 0 ? "#242420" : color;
            const width = pass === 0 ? 5 : 2;
            graphics.drawLine(cx - arm, cy, cx - gap, cy, stroke, width);
            graphics.drawLine(cx + gap, cy, cx + arm, cy, stroke, width);
            graphics.drawLine(cx, cy - arm, cx, cy - gap, stroke, width);
            graphics.drawLine(cx, cy + gap, cx, cy + arm, stroke, width);
        }
    }

    private resolveRangedChargeConeAngle(): number {
        if (!this.pressing && Date.now() < this.recoilPreviewUntil) {
            return Math.min(100, this.recoilPreviewBaseConeAngle + this.recoilSpread);
        }
        const ratio = this.aimProgress();
        const startAngle = Number(this.rangedChargeStartAngle) || 60;
        const endAngle = Number(this.rangedChargeEndAngle) || 20;
        return Math.min(100, startAngle + (endAngle - startAngle) * ratio + this.recoilSpread);
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

    private bindFireModeSwitch(): void {
        this.fireModeSwitch = this.findChildByName(this.owner.parent, "pre-switch") as Laya.Sprite | null;
        const node = this.fireModeSwitch;
        if (!node) return;
        node.offAllCaller(this);
        node.mouseEnabled = true;
        node.mouseThrough = false;
        node.on("mousedown", this, this.stopSwitchPropagation);
        node.on("touchstart", this, this.stopSwitchPropagation);
        node.on("click", this, this.onFireModeSwitch);
        this.refreshFireModeSwitch();
    }

    private stopSwitchPropagation(e: any): void {
        e?.stopPropagation();
    }

    private onFireModeSwitch(e?: any): void {
        e?.stopPropagation();
        const data = DataManager.getInstance();
        const weapon = data.getEquippedItem("weapon");
        if (!weapon || data.resolveItemMeta(weapon.itemId)?.fireMode !== "auto" ||
            !this.resolvePlayerController()?.isEquippedRangedWeapon()) return;
        this.stopInput();
        attack.selectedFireModes.set(weapon.itemId, !attack.selectedFireModes.get(weapon.itemId));
        this.refreshFireModeSwitch();
    }

    private refreshFireModeSwitch(): void {
        const node = this.fireModeSwitch;
        if (!node) return;
        const data = DataManager.getInstance();
        const weapon = data.getEquippedItem("weapon");
        node.visible = !!weapon && data.resolveItemMeta(weapon.itemId)?.fireMode === "auto" &&
            !!this.resolvePlayerController()?.isEquippedRangedWeapon();
        const color = weapon && attack.selectedFireModes.get(weapon.itemId) ? "#ff0000" : "#ffffff";
        if (this.switchColor === color) return;
        const graphic = node.getChildByName("Sprite") as Laya.Sprite | null;
        if (!graphic) return;
        // Recolor the existing prefab graphic; do not create or redraw UI.
        for (const cmd of graphic.graphics.cmds) {
            if (cmd instanceof Laya.DrawCircleCmd) cmd.fillColor = color;
        }
        // Invalidate the graphics mesh as well as the Sprite's display cache.
        graphic.graphics.repaint();
        this.switchColor = color;
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
        const throwableMeta = this.selectedThrowableId ? dataManager.resolveItemMeta(this.selectedThrowableId) : null;
        const throwableIcon = throwableMeta?.icon || "";
        const meta = weapon?.itemId ? dataManager.resolveItemMeta(weapon.itemId) : null;
        const iconPath = throwableIcon || weapon?.icon || meta?.icon || "";
        const resolvedIconPath = iconPath ? this.resolveIconPath(iconPath) : this.defaultIconSrc;
        const signature = `${this.selectedThrowableId}|${weapon?.itemId || ""}|${resolvedIconPath}`;

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
