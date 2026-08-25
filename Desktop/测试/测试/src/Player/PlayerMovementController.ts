import type { PlayerController } from "./PlayerController";
import { Joystick } from "../PlayUI/playerui/Joystick";

export class PlayerMovementController {
    private joystick: Joystick | null = null;
    private updateFrame: number = 0;
    private warnedMissingJoystick: boolean = false;
    private warnedTinyMoveSpeed: boolean = false;
    private resolveSource: string = "";
    private baseScaleX: number = 1;
    private facingSign: number = 1;
    private attackDirection: number = 1;
    private attackFacingLocked: boolean = false;
    private isMovingNow: boolean = false;
    private footstepElapsed: number = 0;
    private lastFootstepUrl: string = "";
    private readonly blockedFootstepUrls: Record<string, boolean> = {};

    constructor(private controller: PlayerController) {
    }

    public onAwake(): void {
        this.captureBaseScale();
        this.syncAttackArea();
        this.resolveJoystick();
        this.preloadFootstepSounds();
    }

    public onStart(): void {
        this.captureBaseScale();
        this.syncAttackArea();
        this.resolveJoystick();
        this.preloadFootstepSounds();
    }

    public onUpdate(): void {
        if (!this.joystick) {
            this.resolveJoystick();
        }

        if (!this.joystick) {
            if ((this.updateFrame++ % 60) === 0 && !this.warnedMissingJoystick) {
                this.warnedMissingJoystick = true;
            }
            this.controller.animation.setLocomotionState(this.controller.idleAnimation);
            return;
        }

        const x = this.joystick.valueX;
        const y = this.joystick.valueY;
        const magnitude = Math.sqrt(x * x + y * y);

        if (magnitude <= 0.0001) {
            this.isMovingNow = false;
            this.footstepElapsed = 0;
            this.controller.animation.setLocomotionState(this.controller.idleAnimation);
            if ((this.updateFrame++ % 60) === 0) {
            }
            return;
        }

        this.isMovingNow = true;
        const speed = this.getCurrentSpeed();
        const sprite = this.owner as Laya.Sprite;
        const dt = Laya.timer.delta / 1000;

        if (speed > 0 && speed < 1 && !this.warnedTinyMoveSpeed) {
            this.warnedTinyMoveSpeed = true;
        }

        const nx = x / magnitude;
        const ny = y / magnitude;
        const dx = nx * speed * dt;
        const dy = ny * speed * dt;

        sprite.x += dx;
        sprite.y += dy;
        if (!this.attackFacingLocked) {
            this.updateFacing(nx);
        }

        const nextAnimation = this.controller.isRunning ? this.controller.runAnimation : this.controller.walkAnimation;
        this.controller.animation.setLocomotionState(nextAnimation);
        this.updateFootstepSound();
    }

    public getIsMovingNow(): boolean {
        return this.isMovingNow;
    }

    public getCurrentSpeed(): number {
        if (this.controller.moveSpeed > 0) {
            return this.controller.moveSpeed;
        }

        return this.controller.isRunning ? this.controller.runSpeed : this.controller.walkSpeed;
    }

    public getScaleX(): number {
        const owner = this.owner as Laya.Sprite;
        return owner ? owner.scaleX : 0;
    }

    public getFacingSign(): number {
        return this.facingSign;
    }

    public getAttackDirection(): number {
        return this.attackDirection;
    }

    public setAttackFacingByDirection(x: number, y: number = 0): boolean {
        const magnitude = Math.sqrt(x * x + y * y);
        if (magnitude <= 0.0001 || Math.abs(x) <= 0.1) {
            this.attackFacingLocked = true;
            return false;
        }

        this.attackFacingLocked = true;
        this.applyHorizontalFacing(x > 0 ? 1 : -1);
        return true;
    }

    public clearAttackFacingOverride(): void {
        this.attackFacingLocked = false;
    }

    public getResolveSource(): string {
        return this.resolveSource;
    }

    public snapshot(): Record<string, any> {
        return {
            walkSpeed: this.controller.walkSpeed,
            runSpeed: this.controller.runSpeed,
            moveSpeed: this.controller.moveSpeed,
            isRunning: this.controller.isRunning,
            joystickNode: this.controller.joystickNode ? this.controller.joystickNode.name : null,
            attackNode: this.attackNode ? this.attackNode.name : null,
            detectNode: this.controller.detectNode ? this.controller.detectNode.name : null,
            owner: this.owner ? this.owner.name : null,
            scaleX: this.owner ? (this.owner as Laya.Sprite).scaleX : null,
            initialFacingSign: this.controller.initialFacingSign,
            attackAreaRightX: this.controller.attackAreaRightX,
            attackAreaLeftX: this.controller.attackAreaLeftX,
            attackFacingLocked: this.attackFacingLocked,
            footstepElapsed: this.footstepElapsed,
            lastFootstepUrl: this.lastFootstepUrl,
        };
    }

    private get owner(): Laya.Node {
        return this.controller.owner as Laya.Node;
    }

    private get attackNode(): Laya.Node | null {
        return this.controller.attackNode;
    }

    private resolveJoystick(): void {
        if (this.controller.joystickNode) {
            const component = this.controller.joystickNode.getComponent(Joystick);
            if (component) {
                this.setJoystick(component, "joystickNode");
            }
            return;
        }

        if (!this.warnedMissingJoystick) {
            this.warnedMissingJoystick = true;
        }
    }

    private setJoystick(joystick: Joystick, source: string): void {
        if (this.joystick !== joystick) {
            this.joystick = joystick;
            this.resolveSource = source;
        }
    }

    private syncAttackArea(): void {
        const attackNode = this.attackNode;
        if (!attackNode) {
            return;
        }

        (attackNode as Laya.Sprite).x = this.attackDirection > 0 ? this.controller.attackAreaRightX : this.controller.attackAreaLeftX;
    }

    private updateFacing(moveX: number): void {
        const owner = this.owner as Laya.Sprite;
        if (!owner) {
            return;
        }

        if (moveX > 0.1) {
            this.applyHorizontalFacing(1);
        } else if (moveX < -0.1) {
            this.applyHorizontalFacing(-1);
        }
    }

    private applyHorizontalFacing(direction: number): void {
        const owner = this.owner as Laya.Sprite;
        if (!owner) {
            return;
        }

        const normalizedDirection = direction >= 0 ? 1 : -1;
        if (this.attackDirection === normalizedDirection) {
            return;
        }

        this.attackDirection = normalizedDirection;
        this.facingSign = this.controller.initialFacingSign >= 0 ? normalizedDirection : -normalizedDirection;
        owner.scaleX = this.baseScaleX * this.facingSign;
        this.syncAttackArea();
        this.controller.syncStatusBarTransform();
    }

    private updateFootstepSound(): void {
        if (!this.controller.footstepSoundEnabled) {
            this.footstepElapsed = 0;
            return;
        }

        const url = this.resolveFootstepUrl();
        if (!url || this.blockedFootstepUrls[url]) {
            this.footstepElapsed = 0;
            return;
        }

        if (url !== this.lastFootstepUrl) {
            this.footstepElapsed = 0;
            this.lastFootstepUrl = url;
        }

        const interval = Math.max(80, this.controller.isRunning ? this.controller.runFootstepInterval : this.controller.walkFootstepInterval);
        this.footstepElapsed += Math.max(0, Laya.timer.delta || 0);
        if (this.footstepElapsed < interval) {
            return;
        }

        this.footstepElapsed %= interval;
        try {
            const channel = Laya.SoundManager.playSound(url, 1);
            if (channel) {
                channel.playbackRate = this.resolveFootstepPlaybackRate();
            }
        } catch (error) {
            this.blockedFootstepUrls[url] = true;
        }
    }

    private resolveFootstepPlaybackRate(): number {
        const baseRate = this.controller.isRunning ? this.controller.runFootstepPlaybackRate : this.controller.walkFootstepPlaybackRate;
        const variance = Math.max(0, Number(this.controller.footstepPlaybackRateVariance) || 0);
        const randomOffset = variance > 0 ? (Math.random() * 2 - 1) * variance : 0;
        return Math.max(0.1, Number(baseRate) + randomOffset || 1);
    }

    private resolveFootstepUrl(): string {
        const sceneUrl = this.resolveSceneUrl();
        const isRunning = this.controller.isRunning;

        if (sceneUrl.includes("mine")) {
            return this.normalizeSoundUrl(isRunning ? this.controller.mineRunSoundUrl : this.controller.mineWalkSoundUrl);
        }

        if (sceneUrl.includes("cunzhuang")) {
            return this.normalizeSoundUrl(isRunning ? this.controller.cunzhuangRunSoundUrl : this.controller.cunzhuangWalkSoundUrl);
        }

        if (sceneUrl.includes("forest") || sceneUrl.includes("main")) {
            return this.normalizeSoundUrl(isRunning ? this.controller.forestRunSoundUrl : this.controller.forestWalkSoundUrl);
        }

        return this.normalizeSoundUrl(isRunning ? this.controller.forestRunSoundUrl : this.controller.forestWalkSoundUrl);
    }

    private resolveSceneUrl(): string {
        let node: any = this.owner;
        while (node) {
            const url = String(node.url || "");
            if (url.endsWith(".ls")) {
                return url.toLowerCase();
            }
            node = node.parent;
        }

        return "";
    }

    private normalizeSoundUrl(url: string): string {
        return String(url || "").trim().replace(/^assets\//, "");
    }

    private preloadFootstepSounds(): void {
        const urls = [
            this.controller.cunzhuangWalkSoundUrl,
            this.controller.cunzhuangRunSoundUrl,
            this.controller.forestWalkSoundUrl,
            this.controller.forestRunSoundUrl,
            this.controller.mineWalkSoundUrl,
            this.controller.mineRunSoundUrl,
        ].map((url) => this.normalizeSoundUrl(url)).filter(Boolean);

        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            if (this.blockedFootstepUrls[url]) {
                continue;
            }

            try {
                const loaded = Laya.loader.getRes?.(url);
                if (loaded) {
                    continue;
                }

                const result = Laya.loader.load(url);
                if (result && typeof result.catch === "function") {
                    result.catch(() => {
                        this.blockedFootstepUrls[url] = true;
                    });
                }
            } catch (error) {
                this.blockedFootstepUrls[url] = true;
            }
        }
    }

    private captureBaseScale(): void {
        const owner = this.owner as Laya.Sprite;
        if (!owner) {
            return;
        }

        const sign = this.controller.initialFacingSign >= 0 ? 1 : -1;
        this.facingSign = sign;
        this.baseScaleX = Math.abs(owner.scaleX || 1);
        owner.scaleX = this.baseScaleX * this.facingSign;
        this.controller.syncStatusBarTransform();
    }
}
