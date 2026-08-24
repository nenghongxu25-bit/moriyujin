import type { PlayerController } from "./PlayerController";

export class PlayerCombatController {
    private attackLocked: boolean = false;

    constructor(private controller: PlayerController) {
    }

    public playAttack(): void {
        if (this.attackLocked || this.controller.animation.isBusy()) {
            return;
        }

        const attackSpeed = Math.max(0.1, this.controller.attackSpeed || 1);
        const lockDuration = Math.max(
            Math.floor(this.controller.attackCooldown / attackSpeed),
            Math.floor(this.controller.attackAnimationDuration / attackSpeed),
        );
        this.attackLocked = true;
        this.controller.beginAttackHit();
        this.setAttackNodeVisible(true);
        this.controller.animation.playActionAnimation(
            this.controller.resolveAttackAnimation(),
            lockDuration,
            undefined,
            attackSpeed,
            () => {
                this.controller.consumeStaminaForCompletedAttack();
            },
        );
        Laya.timer.clear(this.controller, this.finishAttack);
        Laya.timer.once(lockDuration, this.controller, this.finishAttack);
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
        this.controller.endAttackHit();
        this.setAttackNodeVisible(false);
    }

    public snapshot(): Record<string, any> {
        return {
            attackLocked: this.attackLocked,
        };
    }

    private finishAttack = (): void => {
        this.attackLocked = false;
        this.controller.endAttackHit();
        this.setAttackNodeVisible(false);
    };
}
