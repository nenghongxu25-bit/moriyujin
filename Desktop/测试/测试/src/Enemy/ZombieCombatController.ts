import type { ZombieController } from "./ZombieController";

export class ZombieCombatController {
    private attackLocked: boolean = false;
    private attackToken: number = 0;

    constructor(private controller: ZombieController) {
    }

    public startAttack(): void {
        if (this.attackLocked || this.controller.isDead()) {
            return;
        }

        if (!this.controller.view.isReady()) {
            return;
        }

        this.attackLocked = true;
        this.attackToken += 1;
        this.controller.view.setAttackNodeVisible(false);
        Laya.timer.clear(this, this.showAttackNode);
        Laya.timer.once(Math.max(0, this.controller.attackNodeShowDelay || 0), this, this.showAttackNode);
        this.controller.view.playOneShot(this.controller.attackAnimation || "attack");

        Laya.timer.clear(this, this.onAttackFinished);
        Laya.timer.once(700, this, this.onAttackFinished);
    }

    public reset(): void {
        this.attackLocked = false;
        this.attackToken = 0;
        Laya.timer.clear(this, this.showAttackNode);
        Laya.timer.clear(this, this.onAttackFinished);
        this.controller.view?.setAttackNodeVisible(false);
    }

    public onDestroy(): void {
        this.reset();
    }

    public isAttackLocked(): boolean {
        return this.attackLocked;
    }

    public getAttackToken(): number {
        return this.attackToken;
    }

    public snapshot(): Record<string, any> {
        return {
            attackLocked: this.attackLocked,
            attackToken: this.attackToken,
        };
    }

    private showAttackNode(): void {
        if (this.controller.isDead()) {
            return;
        }

        this.controller.view.setAttackNodeVisible(true);
    }

    private onAttackFinished(): void {
        if (this.controller.isDead()) {
            return;
        }

        this.attackLocked = false;
        this.attackToken = 0;
        Laya.timer.clear(this, this.showAttackNode);
        this.controller.view.setAttackNodeVisible(false);
    }
}