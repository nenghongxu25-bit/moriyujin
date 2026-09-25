const { regClass, property } = Laya;
import { AnimalController } from "./AnimalController";
import { AnimalFrameAnimator } from "./AnimalFrameAnimator";
import { AnimalTestTarget } from "./AnimalTestTarget";
import { AttackHitbox } from "../combat/AttackHitbox";
import { PlayerRangedController } from "../Player/PlayerRangedController";

/** Test scene only. Uses serialized nodes; no runtime UI or geometry creation. */
@regClass("13e0a173-96e7-4ef9-9291-135944a71204")
export class AnimalDemo extends Laya.Script {
    @property(Laya.Sprite) public wolfNode: Laya.Sprite = null;
    @property(Laya.Sprite) public boarNode: Laya.Sprite = null;
    @property(Laya.Sprite) public targetNode: Laya.Sprite = null;
    @property(Laya.Sprite) public obstacleNode: Laya.Sprite = null;
    @property(Boolean) public autoTest = true;
    private tested = false;
    private waiting = 0;
    private keys = new Set<number>();
    onEnable(): void {
        Laya.stage.on(Laya.Event.KEY_DOWN, this, this.keyDown);
        Laya.stage.on(Laya.Event.KEY_UP, this, this.keyUp);
    }
    onDisable(): void {
        Laya.stage.off(Laya.Event.KEY_DOWN, this, this.keyDown);
        Laya.stage.off(Laya.Event.KEY_UP, this, this.keyUp);
        this.keys.clear();
    }
    onUpdate(): void {
        if (!this.tested && this.autoTest) {
            this.waiting += Laya.timer.delta / 1000;
            if (this.wolfNode?.getComponent(AnimalFrameAnimator)?.ready && this.boarNode?.getComponent(AnimalFrameAnimator)?.ready) {
                this.tested = true;
                this.runTests();
            } else if (this.waiting > 10) {
                this.tested = true;
                console.error("[AnimalDemo] FAIL frame loading timeout");
            }
        }
        const dx = (this.keys.has(39) ? 1 : 0) - (this.keys.has(37) ? 1 : 0);
        const dy = (this.keys.has(40) ? 1 : 0) - (this.keys.has(38) ? 1 : 0);
        const norm = Math.hypot(dx, dy) || 1;
        const step = Math.min(0.1, Laya.timer.delta / 1000) * 220;
        if (this.targetNode) this.targetNode.pos(Math.max(50, Math.min(1280, this.targetNode.x + dx / norm * step)),
            Math.max(180, Math.min(700, this.targetNode.y + dy / norm * step)));
    }
    private keyDown(event: Laya.Event): void {
        const key = event.keyCode;
        if (this.keys.has(key)) return;
        this.keys.add(key);
        if (key === 66) this.boarNode.getComponent(AnimalController).takeDamage(5); // B
        if (key === 75) { // K
            this.boarNode.getComponent(AnimalController).takeDamage(100000);
            this.wolfNode.getComponent(AnimalController).takeDamage(100000);
        }
        if (key === 82) this.resetDemo(); // R
        if (key === 84) this.runTests(); // T
    }
    private keyUp(event: Laya.Event): void { this.keys.delete(event.keyCode); }

    public resetDemo(): void {
        this.obstacleNode.active = true;
        this.targetNode.active = true;
        this.targetNode.pos(450, 420);
        this.targetNode.getComponent(AnimalTestTarget).reset();
        this.wolfNode.getComponent(AnimalController).resetAt(680, 420);
        this.boarNode.getComponent(AnimalController).resetAt(420, 600);
    }

    public runTests(): void {
        const wolf = this.wolfNode.getComponent(AnimalController);
        const boar = this.boarNode.getComponent(AnimalController);
        const target = this.targetNode.getComponent(AnimalTestTarget);
        const animator = this.wolfNode.getComponent(AnimalFrameAnimator);
        let passed = 0;
        const check = (value: boolean, label: string) => {
            if (!value) throw new Error(label);
            passed++; console.info("[AnimalDemo] PASS " + label);
        };
        const step = (animal: AnimalController, count: number, dt = 0.05) => { for (let i = 0; i < count; i++) animal.tick(dt); };
        try {
            this.targetNode.active = true;
            this.obstacleNode.active = false;
            target.reset();
            wolf.resetAt(300, 300); boar.resetAt(900, 600);
            this.targetNode.pos(500, 300);
            wolf.tick(0.05);
            check(wolf.state === "chase" && this.wolfNode.x > 300, "wolf detects/chases");
            check(animator.viewNode.scaleX < 0, "right-facing flips visual only");
            boar.resetAt(500, 340); boar.tick(0.05);
            check(!boar.snapshot().aggro && target.damageCalls === 0, "boar stays neutral nearby");
            boar.takeDamage(5); boar.tick(0.05);
            check(boar.currentHp === boar.maxHp - 5 && boar.state === "attack", "boar retaliates after hit");
            wolf.resetAt(300, 300); this.targetNode.pos(350, 300); target.reset();
            wolf.tick(0.01);
            check(wolf.state === "attack", "attack begins in range");
            step(wolf, 5);
            check(target.damageCalls === 0, "wind-up does not deal early damage");
            step(wolf, 2);
            check(target.damageCalls === 1, "hit frame damages once");
            step(wolf, 5);
            check(target.damageCalls === 1, "no repeated damage during recovery");
            wolf.resetAt(300, 300); target.reset(); this.targetNode.pos(350, 300); wolf.tick(0.01);
            this.targetNode.pos(600, 300); step(wolf, 8);
            check(target.damageCalls === 0, "moving out of range dodges attack");
            wolf.resetAt(300, 300); this.targetNode.pos(350, 300); wolf.tick(0.01);
            this.targetNode.active = false; step(wolf, 8);
            check(target.damageCalls === 0, "inactive target cannot be hit");
            this.targetNode.active = true;
            wolf.resetAt(300, 300); this.targetNode.pos(100, 300); wolf.tick(0.01);
            check(animator.viewNode.scaleX > 0, "left-facing preserves source direction");
            this.targetNode.pos(1200, 300); wolf.tick(0.01);
            check(wolf.state === "return", "lost target releases aggro");
            // Synthetic trigger verifies the existing melee receiver adapter against the prefab body node.
            boar.resetAt(500, 340);
            this.targetNode.getComponent(AttackHitbox).onTriggerEnter({ owner: boar.hitBodyNode });
            check(boar.currentHp === boar.maxHp - target.attackPower, "existing melee hitbox recognizes animal");
            wolf.resetAt(950, 600); boar.resetAt(500, 300); this.targetNode.pos(350, 300);
            const ranged = new PlayerRangedController({ owner: this.targetNode, rangedAttackRange: 250,
                rangedAttackWidth: 40, attackPower: 7, rangedMinDamageMultiplier: 1, rangedMaxDamageMultiplier: 1 } as any);
            check(ranged.applyDamage({ directionX: 1, directionY: 0 }) && boar.currentHp === boar.maxHp - 7,
                "existing ranged damage recognizes animal");
            this.obstacleNode.active = true;
            this.obstacleNode.pos(350, 280); wolf.resetAt(300, 300); this.targetNode.pos(400, 300);
            wolf.tick(0.01);
            check(!wolf.snapshot().aggro, "obstacle blocks detection");
            wolf.takeDamage(1); step(wolf, 30);
            check(this.wolfNode.x < 350 && target.damageCalls === 0, "obstacle blocks movement/melee");
            this.obstacleNode.active = false;
            wolf.resetAt(300, 300); this.targetNode.pos(350, 300); wolf.tick(0.01);
            target.reset(); wolf.takeDamage(100000); step(wolf, 25);
            check(wolf.isDead() && !this.wolfNode.active && !wolf.hitBodyNode.active && target.damageCalls === 0,
                "death cancels attack/fades/disables body");
            wolf.resetAt(300, 300);
            check(!wolf.isDead() && wolf.currentHp === wolf.maxHp && this.wolfNode.alpha === 1 && wolf.hitBodyNode.active,
                "reset restores health/visibility/collider");
            animator.play("walk", true); animator.advance(0.26);
            check(animator.frameIndex === 2 && !!animator.viewNode.texture, "frame playback advances");
            animator.play("walk");
            check(animator.frameIndex === 2, "same clip does not restart each update");
            console.info("[AnimalDemo] ALL PASS " + passed + " " + JSON.stringify({wolf:wolf.snapshot(),boar:boar.snapshot()}));
        } catch (error) {
            console.error("[AnimalDemo] FAIL after " + passed, error);
        } finally {
            this.obstacleNode.pos(870, 480);
            this.resetDemo();
        }
    }
}
