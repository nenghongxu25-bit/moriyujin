import type { ZombieController } from "./ZombieController";
import { PlayerController } from "../Player/PlayerController";

export class ZombieMovementController {
    private hasAggro: boolean = false;
    private spawnIdleUntil: number = 0;

    constructor(private controller: ZombieController) {
    }

    public onAwake(): void {
        this.resetSpawnIdle();
    }

    public onStart(): void {
        if (this.spawnIdleUntil <= 0) {
            this.resetSpawnIdle();
        }
    }

    public onUpdate(): void {
        if (Date.now() < this.spawnIdleUntil) {
            this.controller.view.playLocomotion(this.controller.idleAnimation);
            return;
        }

        const target = this.resolveTargetNode();
        if (!target) {
            this.controller.view.playLocomotion(this.controller.idleAnimation);
            return;
        }

        const owner = this.controller.ownerSprite;
        const targetPos = this.getGlobalPosition(target);
        const ownerPos = this.getGlobalPosition(owner);
        const deltaX = targetPos.x - ownerPos.x;
        const deltaY = targetPos.y - ownerPos.y;
        const distance = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));

        if (!this.hasAggro) {
            if (distance > this.controller.aggroDistance) {
                this.controller.view.playLocomotion(this.controller.idleAnimation);
                return;
            }

            this.hasAggro = true;
        }

        if (this.controller.combat.isAttackLocked()) {
            return;
        }

        if (distance <= this.controller.attackDistance) {
            this.controller.view.updateFacing(deltaX);
            this.controller.combat.startAttack();
            return;
        }

        const moveSpeed = this.controller.runSpeed;
        const dt = Laya.timer.delta / 1000;
        const nx = distance > 0 ? deltaX / distance : 0;
        const ny = distance > 0 ? deltaY / distance : 0;

        owner.x += nx * moveSpeed * dt;
        owner.y += ny * moveSpeed * dt;
        this.controller.view.updateFacing(nx);
        this.controller.view.playLocomotion(this.controller.runAnimation);
    }

    public resetAggro(): void {
        this.hasAggro = false;
    }

    public resetSpawnIdle(): void {
        this.spawnIdleUntil = Date.now() + Math.max(0, this.controller.spawnIdleDuration || 0);
    }

    public snapshot(): Record<string, any> {
        return {
            hasAggro: this.hasAggro,
            spawnIdleUntil: this.spawnIdleUntil,
        };
    }

    private resolveTargetNode(): Laya.Node | null {
        if (this.controller.playerNode) {
            return this.controller.playerNode;
        }

        const activePlayer = PlayerController.activeInstance;
        if (activePlayer && activePlayer.owner) {
            return activePlayer.owner;
        }

        return this.findPlayerNode(Laya.stage);
    }

    private findPlayerNode(root: Laya.Node | null): Laya.Node | null {
        if (!root) {
            return null;
        }

        if (root.getComponent(PlayerController)) {
            return root;
        }

        const childCount = (root as any).numChildren || 0;
        for (let i = 0; i < childCount; i += 1) {
            const child = root.getChildAt(i);
            const found = this.findPlayerNode(child);
            if (found) {
                return found;
            }
        }

        return null;
    }

    private getGlobalPosition(node: Laya.Node): Laya.Point {
        const point = new Laya.Point();
        const sprite = node as Laya.Sprite;

        if (sprite && typeof sprite.localToGlobal === "function") {
            sprite.localToGlobal(point, false);
        }

        return point;
    }
}