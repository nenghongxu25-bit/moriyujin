import type { PlayerController } from "./PlayerController";
import { Joystick } from "../PlayUI/Joystick";

export class PlayerMovementController {
    private joystick: Joystick | null = null;
    private updateFrame: number = 0;
    private warnedMissingJoystick: boolean = false;
    private warnedTinyMoveSpeed: boolean = false;
    private resolveSource: string = "";
    private baseScaleX: number = 1;
    private facingSign: number = 1;
    private attackDirection: number = 1;
    private isMovingNow: boolean = false;

    constructor(private controller: PlayerController) {
    }

    public onAwake(): void {
        this.captureBaseScale();
        this.syncAttackArea();
        this.resolveJoystick();
    }

    public onStart(): void {
        this.captureBaseScale();
        this.syncAttackArea();
        this.resolveJoystick();
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
        this.updateFacing(nx);

        const nextAnimation = this.controller.isRunning ? this.controller.runAnimation : this.controller.walkAnimation;
        this.controller.animation.setLocomotionState(nextAnimation);
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

        attackNode.x = this.attackDirection > 0 ? this.controller.attackAreaRightX : this.controller.attackAreaLeftX;
    }

    private updateFacing(moveX: number): void {
        const owner = this.owner as Laya.Sprite;
        if (!owner) {
            return;
        }

        let changed = false;
        if (moveX > 0.1) {
            this.attackDirection = 1;
            this.facingSign = this.controller.initialFacingSign >= 0 ? 1 : -1;
            changed = true;
        } else if (moveX < -0.1) {
            this.attackDirection = -1;
            this.facingSign = this.controller.initialFacingSign >= 0 ? -1 : 1;
            changed = true;
        }

        if (!changed) {
            return;
        }

        owner.scaleX = this.baseScaleX * this.facingSign;
        this.syncAttackArea();
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
    }
}