const { regClass, property } = Laya;
import { AnimalFrameAnimator } from "./AnimalFrameAnimator";
import { PlayerController } from "../Player/PlayerController";
import { TileBlockMovement } from "../systems/TileBlockMovement";

type AnimalState = "idle" | "patrol" | "chase" | "attack" | "return" | "dead";
interface TargetInfo { node: Laya.Sprite; receiver: any; point: Laya.Point; }

/** Wolf and young boar share behavior; species differences live in prefab properties. */
@regClass("b09fc0ce-6350-4e19-a112-79421e795417")
export class AnimalController extends Laya.Script {
    @property(Laya.Sprite) public targetNode: Laya.Sprite = null;
    @property(Laya.Sprite) public hitBodyNode: Laya.Sprite = null;
    @property(Boolean) public aggressive = true;
    @property(Number) public maxHp = 80;
    @property(Number) public walkSpeed = 35;
    @property(Number) public runSpeed = 120;
    @property(Number) public aggroDistance = 280;
    @property(Number) public loseAggroDistance = 420;
    @property(Number) public leashDistance = 520;
    @property(Number) public patrolRadius = 90;
    @property(Number) public idleSeconds = 1.5;
    @property(Number) public attackDistance = 65;
    @property(Number) public attackPower = 8;
    @property(Number) public attackCooldown = 1.1;
    @property(Number) public attackHitFrame = 3;
    @property(Number) public collisionHalfWidth = 22;
    @property(Number) public deathFadeSeconds = 1;
    public currentHp = 0;
    public state: AnimalState = "idle";
    private animator: AnimalFrameAnimator = null;
    private movement = new TileBlockMovement();
    private home = new Laya.Point();
    private destination = new Laya.Point();
    private target: TargetInfo = null;
    private lockedTarget: Laya.Sprite = null;
    private aggro = false;
    private idleRemaining = 0;
    private cooldown = 0;
    private attackHit = false;
    private deathElapsed = 0;
    private blockedSeconds = 0;
    private patrolRemaining = 0;
    private warned = false;
    private baseAlpha = 1;
    private baseViewAlpha = 1;
    private hurtRemaining = 0;
    private attackDirection = new Laya.Point(-1, 0);

    onAwake(): void {
        this.animator = this.owner.getComponent(AnimalFrameAnimator);
        this.baseAlpha = (this.owner as Laya.Sprite).alpha;
        this.baseViewAlpha = this.animator?.viewNode?.alpha ?? 1;
        this.resetAt((this.owner as Laya.Sprite).x, (this.owner as Laya.Sprite).y);
    }

    onDisable(): void {
        // A disabled attack must never resume later and deal delayed damage.
        this.lockedTarget = null;
        this.target = null;
        this.attackHit = true;
        if (this.state !== "dead") { this.state = "idle"; this.animator?.play("idle", true); }
        if (this.animator?.viewNode) this.animator.viewNode.alpha = this.baseViewAlpha;
    }

    onUpdate(): void { this.tick(Math.min(0.1, Math.max(0, Laya.timer.delta / 1000))); }

    /** Explicit step enables deterministic tests; normal gameplay uses onUpdate. */
    public tick(dt: number): void {
        if (!Number.isFinite(dt) || dt <= 0) return;
        const owner = this.owner as Laya.Sprite;
        if (this.state === "dead") {
            this.deathElapsed += dt;
            owner.alpha = this.baseAlpha * Math.max(0, 1 - this.deathElapsed / Math.max(0.05, this.deathFadeSeconds));
            if (this.deathElapsed >= Math.max(0.05, this.deathFadeSeconds)) owner.active = false;
            return;
        }
        if (!this.animator?.ready) {
            if (!this.warned) { this.warned = true; console.warn("[Animal] missing view/frames", owner.name); }
            return;
        }
        this.cooldown = Math.max(0, this.cooldown - dt);
        this.hurtRemaining = Math.max(0, this.hurtRemaining - dt);
        this.animator.viewNode.alpha = this.hurtRemaining > 0 ? this.baseViewAlpha * 0.55 : this.baseViewAlpha;
        this.animator.advance(dt);
        this.target = this.resolveTarget();

        if (this.state === "attack") {
            const hitTime = Math.max(0, Math.min(this.animator.attackFrames.length - 1, Math.floor(this.attackHitFrame)))
                / Math.max(1, this.animator.attackFps);
            if (!this.attackHit && this.animator.elapsed >= hitTime) {
                this.attackHit = true; // exactly one opportunity per attack, including misses
                if (this.target?.node === this.lockedTarget && this.distance(this.target.point) <= this.attackDistance
                    && this.inAttackDirection(this.target.point) && this.canReach(this.target.point)) {
                    this.target.receiver.takeDamage(Math.max(0, this.attackPower));
                }
            }
            if (this.animator.elapsed >= this.animator.attackDuration) {
                this.lockedTarget = null;
                this.state = "idle";
                this.animator.play("idle");
            }
            return;
        }

        if (this.state === "return") {
            if (this.distance(this.home) < 3 || !this.moveTo(this.home, this.walkSpeed, dt, "walk")) {
                if (this.distance(this.home) < 3 || this.blockedSeconds > 2) this.setIdle();
            }
            return;
        }
        const distance = this.target ? this.distance(this.target.point) : Infinity;
        if (this.aggro && (!this.target || distance > this.loseAggroDistance || this.distance(this.home) > this.leashDistance)) {
            this.aggro = false;
            this.state = "return";
            this.blockedSeconds = 0;
            this.animator.play("walk");
            return;
        }
        if (!this.aggro && this.aggressive && this.target && distance <= this.aggroDistance
            && this.distance(this.home) <= this.leashDistance && this.canReach(this.target.point)) this.aggro = true;
        if (this.aggro && this.target) {
            this.animator.face(this.target.point.x - owner.x);
            if (distance <= this.attackDistance) {
                this.animator.play("idle");
                this.state = "idle";
                if (this.cooldown <= 0 && this.canReach(this.target.point)) this.startAttack();
            } else {
                this.state = "chase";
                this.moveTo(this.target.point, this.runSpeed, dt, "run", this.attackDistance * 0.9);
            }
            return;
        }
        this.patrol(dt);
    }

    public takeDamage(amount: number): void {
        if (!Number.isFinite(amount) || amount <= 0 || this.isDead() || !this.owner.activeInHierarchy) return;
        const damage = Math.floor(amount);
        if (damage <= 0) return;
        this.currentHp = Math.max(0, this.currentHp - damage);
        if (this.currentHp === 0) {
            this.state = "dead";
            this.aggro = false;
            this.lockedTarget = null;
            this.attackHit = true;
            this.deathElapsed = 0;
            if (this.hitBodyNode) this.hitBodyNode.active = false;
            // No fabricated death clip: freeze current pose, then fade/deactivate.
            this.owner.event("animal-died", [this]);
        } else {
            this.hurtRemaining = 0.14;
            this.aggro = true;
            if (this.state === "return") this.state = "idle";
        }
    }

    public isDead(): boolean { return this.state === "dead"; }

    public resetAt(x: number, y: number): void {
        const owner = this.owner as Laya.Sprite;
        owner.pos(x, y);
        this.home.setTo(x, y);
        owner.alpha = this.baseAlpha;
        owner.active = true;
        this.currentHp = Math.max(1, this.maxHp);
        this.aggro = false;
        this.lockedTarget = null;
        this.target = null;
        this.cooldown = 0;
        this.deathElapsed = 0;
        this.hurtRemaining = 0;
        if (this.hitBodyNode) this.hitBodyNode.active = true;
        if (this.animator?.viewNode) this.animator.viewNode.alpha = this.baseViewAlpha;
        this.setIdle();
    }

    public snapshot(): Record<string, any> {
        return { name: this.owner.name, state: this.state, hp: this.currentHp, aggro: this.aggro,
            clip: this.animator?.clip, frame: this.animator?.frameIndex, ready: this.animator?.ready,
            facing: this.animator?.viewNode?.scaleX, x: (this.owner as Laya.Sprite).x, y: (this.owner as Laya.Sprite).y };
    }

    private startAttack(): void {
        const owner = this.owner as Laya.Sprite;
        const dx = this.target.point.x - owner.x, dy = this.target.point.y - owner.y;
        const length = Math.max(0.001, Math.hypot(dx, dy));
        this.attackDirection.setTo(dx / length, dy / length);
        this.lockedTarget = this.target.node;
        this.attackHit = false;
        this.cooldown = Math.max(this.animator.attackDuration, this.attackCooldown);
        this.state = "attack";
        this.animator.play("attack", true);
    }

    private inAttackDirection(point: Laya.Point): boolean {
        const owner = this.owner as Laya.Sprite;
        const dx = point.x - owner.x, dy = point.y - owner.y;
        return dx * this.attackDirection.x + dy * this.attackDirection.y >= -1;
    }

    private patrol(dt: number): void {
        if (this.state !== "patrol") {
            this.idleRemaining -= dt;
            this.animator.play("idle");
            if (this.idleRemaining > 0 || this.patrolRadius <= 0) return;
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.sqrt(Math.random()) * Math.max(0, this.patrolRadius);
            this.destination.setTo(this.home.x + Math.cos(angle) * radius, this.home.y + Math.sin(angle) * radius);
            this.state = "patrol";
            this.blockedSeconds = 0;
            this.patrolRemaining = 8;
        }
        this.patrolRemaining -= dt;
        this.moveTo(this.destination, this.walkSpeed, dt, "walk");
        if (this.distance(this.destination) < 3 || this.blockedSeconds > 0.5 || this.patrolRemaining <= 0) this.setIdle();
    }

    private setIdle(): void {
        this.state = "idle";
        this.idleRemaining = Math.max(0.1, this.idleSeconds);
        this.blockedSeconds = 0;
        this.animator?.play("idle", true);
    }

    private moveTo(point: Laya.Point, speed: number, dt: number, clip: "walk" | "run", stopDistance = 0): boolean {
        const owner = this.owner as Laya.Sprite;
        const dx = point.x - owner.x, dy = point.y - owner.y;
        const distance = Math.hypot(dx, dy);
        const step = Math.min(Math.max(0, speed) * dt, Math.max(0, distance - stopDistance));
        if (distance <= 0.001 || step <= 0) { this.animator.play("idle"); return false; }
        this.animator.face(dx);
        const pieces = Math.max(1, Math.ceil(step / 8));
        let moved = false;
        for (let i = 0; i < pieces; i++) {
            moved = this.movement.move(owner, dx / distance * step / pieces, dy / distance * step / pieces,
                { halfWidth: this.collisionHalfWidth, footOffsetY: 0 }).moved || moved;
        }
        this.blockedSeconds = moved ? 0 : this.blockedSeconds + dt;
        this.animator.play(moved ? clip : "idle");
        return moved;
    }

    private canReach(point: Laya.Point): boolean {
        return this.movement.canTraverse(this.owner as Laya.Sprite, point.x, point.y,
            { halfWidth: 0, footOffsetY: 0 });
    }

    private distance(point: Laya.Point): number {
        const owner = this.owner as Laya.Sprite;
        return Math.hypot(point.x - owner.x, point.y - owner.y);
    }

    private resolveTarget(): TargetInfo | null {
        const node = this.targetNode || PlayerController.activeInstance?.owner as Laya.Sprite;
        const owner = this.owner as Laya.Sprite;
        if (!node || node === owner || node.destroyed || !node.activeInHierarchy || !owner.parent
            || node.scene !== owner.scene) return null;
        const receiver = node.components.find((c: any) => typeof c.takeDamage === "function") as any;
        if (!receiver || receiver.enabled === false || receiver.isDead?.() || receiver.currentHp <= 0) return null;
        const footOffset = Number(receiver.tileBlockFootOffsetY) || 0;
        const point = node.localToGlobal(new Laya.Point(0, footOffset), true);
        (owner.parent as Laya.Sprite).globalToLocal(point, false);
        return { node, receiver, point };
    }
}
