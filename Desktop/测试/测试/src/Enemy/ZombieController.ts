const { regClass, property } = Laya;

import { ZombieCombatController } from "./ZombieCombatController";
import { ZombieHealthController } from "./ZombieHealthController";
import { ZombieMovementController } from "./ZombieMovementController";
import { ZombieViewController } from "./ZombieViewController";

@regClass()
export class ZombieController extends Laya.Script {
    private static readonly pool: ZombieController[] = [];

    public static acquireFromPool(x?: number, y?: number): ZombieController | null {
        const zombie = ZombieController.pool.pop() || null;
        if (!zombie) {
            return null;
        }

        zombie.resetFromPool(x, y);
        return zombie;
    }

    @property(Laya.Node)
    public spineNode: Laya.Node | null = null;

    @property(Laya.Node)
    public playerNode: Laya.Node | null = null;

    @property(Laya.Node)
    public detectNode: Laya.Node | null = null;

    @property(Laya.Node)
    public attackNode: Laya.Node | null = null;

    @property(Laya.Node)
    public hpBarNode: Laya.Node | null = null;

    @property(Laya.Node)
    public hpFillNode: Laya.Node | null = null;

    @property(Number)
    public walkSpeed: number = 120;

    @property(Number)
    public runSpeed: number = 240;

    @property(Number)
    public attackDistance: number = 20;

    @property(Number)
    public aggroDistance: number = 400;

    @property(Number)
    public spawnIdleDuration: number = 300;

    @property(Number)
    public attackNodeShowDelay: number = 250;

    @property(Number)
    public attackPower: number = 8;

    @property(Number)
    public attackLeftX: number = -70;

    @property(Number)
    public attackRightX: number = -20;

    @property(Number)
    public detectLeftX: number = -38;

    @property(Number)
    public detectRightX: number = 38;

    @property(Number)
    public hpBarRightX: number = -35;

    @property(Number)
    public hpBarLeftX: number = 35;

    @property(Number)
    public currentHp: number = 100;

    @property(Number)
    public maxHp: number = 100;

    @property(Number)
    public hpFillFullWidth: number = 70;

    @property(String)
    public idleAnimation: string = "idle";

    @property(String)
    public walkAnimation: string = "walk";

    @property(String)
    public runAnimation: string = "run";

    @property(String)
    public attackAnimation: string = "attack";

    @property(String)
    public deathAnimation: string = "death";

    @property(Number)
    public deathRecycleDelay: number = 1500;

    @property(String)
    public dropItemId: string = "";

    @property(Number)
    public dropCount: number = 1;

    public view!: ZombieViewController;
    public combat!: ZombieCombatController;
    public health!: ZombieHealthController;
    public movement!: ZombieMovementController;
    private dead: boolean = false;

    onAwake(): void {
        this.ensureControllers();
        this.view.onAwake();
        this.combat.reset();
        this.health.refreshHpBar();
        this.movement.onAwake();
    }

    onStart(): void {
        this.ensureControllers();
        this.view.onStart();
        this.combat.reset();
        this.health.refreshHpBar();
        this.movement.onStart();
    }

    onUpdate(): void {
        if (this.dead) {
            return;
        }

        this.movement.onUpdate();
    }

    onDestroy(): void {
        Laya.timer.clear(this, this.recycleToPool);
        this.combat?.onDestroy();
        this.view?.onDestroy();
    }

    public get ownerSprite(): Laya.Sprite {
        return this.owner as Laya.Sprite;
    }

    public setHp(currentHp: number, maxHp: number = this.maxHp): void {
        this.health.setHp(currentHp, maxHp);
    }

    public takeDamage(amount: number): void {
        this.health.takeDamage(amount);
    }

    public isDead(): boolean {
        return this.dead;
    }

    public setDeadState(value: boolean): void {
        this.dead = value;
    }

    public getAttackToken(): number {
        return this.combat.getAttackToken();
    }

    public refreshHpBar(): void {
        this.health.refreshHpBar();
    }

    public resetFromPool(x?: number, y?: number): void {
        const owner = this.owner as any;
        if (!owner) {
            return;
        }

        this.ensureControllers();
        Laya.timer.clear(this, this.recycleToPool);
        this.dead = false;
        this.health.reset();
        this.combat.reset();
        this.movement.resetAggro();
        this.movement.resetSpawnIdle();

        if (Number.isFinite(x)) {
            owner.x = x;
        }

        if (Number.isFinite(y)) {
            owner.y = y;
        }

        if ("visible" in owner) {
            owner.visible = true;
        }

        if ("active" in owner) {
            owner.active = true;
        }

        this.view.reset();
    }

    public recycleToPool = (): void => {
        const owner = this.owner as any;
        if (!owner) {
            return;
        }

        Laya.timer.clear(this, this.recycleToPool);
        this.combat.reset();
        this.view.setAttackNodeVisible(false);

        if ("visible" in owner) {
            owner.visible = false;
        }

        if ("active" in owner) {
            owner.active = false;
        }

        if (ZombieController.pool.indexOf(this) < 0) {
            ZombieController.pool.push(this);
        }
    };

    public snapshot(): Record<string, any> {
        return {
            walkSpeed: this.walkSpeed,
            runSpeed: this.runSpeed,
            attackDistance: this.attackDistance,
            aggroDistance: this.aggroDistance,
            spawnIdleDuration: this.spawnIdleDuration,
            attackNodeShowDelay: this.attackNodeShowDelay,
            attackPower: this.attackPower,
            attackLeftX: this.attackLeftX,
            attackRightX: this.attackRightX,
            detectLeftX: this.detectLeftX,
            detectRightX: this.detectRightX,
            hpBarRightX: this.hpBarRightX,
            hpBarLeftX: this.hpBarLeftX,
            currentHp: this.currentHp,
            maxHp: this.maxHp,
            hpFillFullWidth: this.hpFillFullWidth,
            idleAnimation: this.idleAnimation,
            walkAnimation: this.walkAnimation,
            runAnimation: this.runAnimation,
            attackAnimation: this.attackAnimation,
            deathAnimation: this.deathAnimation,
            deathRecycleDelay: this.deathRecycleDelay,
            dropItemId: this.dropItemId,
            dropCount: this.dropCount,
            spineNode: this.spineNode ? this.spineNode.name : null,
            playerNode: this.playerNode ? this.playerNode.name : null,
            detectNode: this.detectNode ? this.detectNode.name : null,
            attackNode: this.attackNode ? this.attackNode.name : null,
            hpBarNode: this.hpBarNode ? this.hpBarNode.name : null,
            hpFillNode: this.hpFillNode ? this.hpFillNode.name : null,
            dead: this.dead,
            view: this.view ? this.view.snapshot() : null,
            combat: this.combat ? this.combat.snapshot() : null,
            health: this.health ? this.health.snapshot() : null,
            movement: this.movement ? this.movement.snapshot() : null,
        };
    }

    private ensureControllers(): void {
        if (!this.view) {
            this.view = new ZombieViewController(this);
        }
        if (!this.combat) {
            this.combat = new ZombieCombatController(this);
        }
        if (!this.health) {
            this.health = new ZombieHealthController(this);
        }
        if (!this.movement) {
            this.movement = new ZombieMovementController(this);
        }
    }
}