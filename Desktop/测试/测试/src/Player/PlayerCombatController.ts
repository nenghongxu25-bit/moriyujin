import type { PlayerController } from "./PlayerController";

export class PlayerCombatController {
    private attackLocked: boolean = false;

    constructor(private controller: PlayerController) {
    }

    public playAttack(): void {
        if (this.attackLocked || this.controller.animation.isBusy()) {
            return;
        }

        const lockDuration = Math.max(this.controller.attackCooldown, this.controller.attackAnimationDuration);
        this.attackLocked = true;
        this.controller.animation.playActionAnimation(
            this.controller.attackAnimation,
            lockDuration,
            this.controller.idleAnimation,
        );
        this.controller.ui.showState("attack", lockDuration);
        Laya.timer.clear(this.controller, this.finishAttack);
        Laya.timer.once(lockDuration, this.controller, this.finishAttack);
    }

    public onDestroy(): void {
        Laya.timer.clear(this.controller, this.finishAttack);
    }

    public snapshot(): Record<string, any> {
        return {
            attackLocked: this.attackLocked,
        };
    }

    private finishAttack = (): void => {
        this.attackLocked = false;
    };
}