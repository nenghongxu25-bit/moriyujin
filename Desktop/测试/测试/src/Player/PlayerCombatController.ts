import type { PlayerController } from "./PlayerController";

export interface PlayerAttackOptions {
    chargeRatio?: number;
    directionX?: number;
    directionY?: number;
}

export class PlayerCombatController {
    private attackLocked: boolean = false;
    private queuedAttack: boolean = false;
    private queuedAttackOptions: PlayerAttackOptions | null = null;

    constructor(private controller: PlayerController) {
    }

    public playAttack(queueIfBusy: boolean = false, options: PlayerAttackOptions = {}): boolean {
        if (this.attackLocked || this.controller.animation.isBusy()) {
            if (queueIfBusy) {
                this.queuedAttack = true;
                this.queuedAttackOptions = options;
            }
            return false;
        }

        this.startAttack(options);
        return true;
    }

    public clearQueuedAttack(): void {
        this.queuedAttack = false;
        this.queuedAttackOptions = null;
    }

    private startAttack(options: PlayerAttackOptions = {}): void {
        this.queuedAttack = false;
        this.queuedAttackOptions = null;

        const attackSpeed = Math.max(0.1, this.controller.attackSpeed || 1);
        const lockDuration = Math.max(
            Math.floor(this.controller.attackCooldown / attackSpeed),
            Math.floor(this.controller.attackAnimationDuration / attackSpeed),
        );
        const isRanged = this.controller.isEquippedRangedWeapon();
        this.attackLocked = true;
        this.controller.beginAttackHit();
        this.setAttackNodeVisible(!isRanged);
        this.controller.animation.playActionAnimation(
            this.controller.resolveAttackAnimation(),
            lockDuration,
            undefined,
            attackSpeed,
            () => {
                this.controller.consumeStaminaForCompletedAttack();
            },
        );
        const finishDelay = this.controller.layeredSpineAnimationEnabled
            ? Math.max(1, lockDuration - 34)
            : lockDuration;
        if (isRanged) {
            const hitDelay = Math.max(0, this.controller.rangedAttackHitDelay || 0);
            Laya.timer.clear(this.controller, this.applyRangedAttack);
            Laya.timer.once(hitDelay, this.controller, this.applyRangedAttack, [options]);
        }
        Laya.timer.clear(this.controller, this.finishAttack);
        Laya.timer.once(finishDelay, this.controller, this.finishAttack);
    }

    public setAttackNodeVisible(visible: boolean): void {
        const attackNode = this.controller.attackNode as any;
        if (!attackNode) {
            return;
        }

        (attackNode as any).visible = visible;
        if ("active" in attackNode) {
            attackNode.active = visible;
        }
    }

    public onDestroy(): void {
        Laya.timer.clear(this.controller, this.finishAttack);
        Laya.timer.clear(this.controller, this.applyRangedAttack);
        this.queuedAttack = false;
        this.queuedAttackOptions = null;
        this.controller.endAttackHit();
        this.setAttackNodeVisible(false);
    }

    public snapshot(): Record<string, any> {
        return {
            attackLocked: this.attackLocked,
            queuedAttack: this.queuedAttack,
        };
    }

    private finishAttack = (): void => {
        this.attackLocked = false;
        this.controller.endAttackHit();
        this.setAttackNodeVisible(false);
        Laya.timer.clear(this.controller, this.applyRangedAttack);

        if (this.queuedAttack) {
            this.startAttack(this.queuedAttackOptions || {});
        }
    };

    private applyRangedAttack = (options: PlayerAttackOptions = {}): void => {
        if (!this.attackLocked || !this.controller.isEquippedRangedWeapon()) {
            return;
        }

        this.controller.applyRangedAttackDamage(options);
    };
}
