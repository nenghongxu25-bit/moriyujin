import type { ZombieController } from "./ZombieController";
import { PlayerController } from "../Player/PlayerController";
import { DataManager } from "../systems/datamanager";

export class ZombieHealthController {
    private dropGranted: boolean = false;

    constructor(private controller: ZombieController) {
    }

    public setHp(currentHp: number, maxHp: number = this.controller.maxHp): void {
        this.controller.maxHp = Math.max(1, Math.floor(maxHp));
        this.controller.currentHp = Math.max(0, Math.min(Math.floor(currentHp), this.controller.maxHp));
        this.refreshHpBar();

        if (this.controller.currentHp <= 0) {
            this.die();
        }
    }

    public takeDamage(amount: number): void {
        const damage = Math.max(0, Math.floor(amount));
        if (damage <= 0 || this.controller.isDead()) {
            return;
        }

        this.setHp(this.controller.currentHp - damage, this.controller.maxHp);
    }

    public refreshHpBar(): void {
        const fill = this.controller.hpFillNode as any;
        if (!fill) {
            return;
        }

        const ratio = this.controller.currentHp / Math.max(1, this.controller.maxHp);
        this.applyHpFillWidth(fill, Math.max(0, this.controller.hpFillFullWidth * ratio));
    }

    public reset(): void {
        this.dropGranted = false;
        this.controller.setDeadState(false);
        this.setHp(this.controller.maxHp, this.controller.maxHp);
    }

    public snapshot(): Record<string, any> {
        return {
            dropGranted: this.dropGranted,
        };
    }

    private die(): void {
        if (this.controller.isDead()) {
            return;
        }

        this.controller.setDeadState(true);
        this.grantDropsToPlayer();
        DataManager.getInstance().grantEnemyDefeatExperience();
        PlayerController.activeInstance?.syncHpFromData();
        this.controller.movement.resetAggro();
        this.controller.combat.reset();
        this.controller.view.setAttackNodeVisible(false);
        this.controller.view.playDeathAnimation(() => {
            Laya.timer.clear(this.controller, this.controller.recycleToPool);
            Laya.timer.once(Math.max(0, this.controller.deathRecycleDelay || 0), this.controller, this.controller.recycleToPool);
        });
    }

    private grantDropsToPlayer(): void {
        if (this.dropGranted) {
            return;
        }

        this.dropGranted = true;

        const itemId = String(this.controller.dropItemId || "").trim();
        const count = Math.max(0, Math.floor(this.controller.dropCount || 0));
        if (!itemId || count <= 0) {
            return;
        }

        const dataManager = DataManager.getInstance();
        const meta = dataManager.resolveItemMeta(itemId);
        const icon = meta?.icon || dataManager.resolveFallbackIcon(itemId);
        const name = meta?.displayName || dataManager.resolveFallbackName(itemId) || itemId;
        dataManager.grantItemsToActive([
            {
                itemId,
                name,
                count,
                icon,
            },
        ]);
    }

    private applyHpFillWidth(fill: any, width: number): void {
        const nextWidth = Math.max(0, width);
        const height = this.resolveHpFillHeight(fill);
        const color = this.resolveHpFillColor(fill);
        fill.width = nextWidth;
        fill.height = height;

        const commands = fill._gcmds;
        if (Array.isArray(commands)) {
            for (let i = 0; i < commands.length; i++) {
                const command = commands[i];
                if (command && "width" in command) {
                    command.width = nextWidth;
                }
            }
        }

        if (fill.graphics && typeof fill.graphics.clear === "function" && typeof fill.graphics.drawRect === "function") {
            fill.graphics.clear();
            if (nextWidth > 0) {
                fill.graphics.drawRect(0, 0, nextWidth, height, color);
            }
        }
    }

    private resolveHpFillHeight(fill: any): number {
        if (Number.isFinite(fill?.height) && fill.height > 0) {
            return fill.height;
        }

        const commands = fill?._gcmds;
        if (Array.isArray(commands)) {
            for (let i = 0; i < commands.length; i++) {
                const command = commands[i];
                if (command && Number.isFinite(command.height) && command.height > 0) {
                    return command.height;
                }
            }
        }

        return 10;
    }

    private resolveHpFillColor(fill: any): string {
        const commands = fill?._gcmds;
        if (Array.isArray(commands)) {
            for (let i = 0; i < commands.length; i++) {
                const command = commands[i];
                if (command && typeof command.fillColor === "string" && command.fillColor) {
                    return command.fillColor;
                }
            }
        }

        return "#c93826";
    }
}