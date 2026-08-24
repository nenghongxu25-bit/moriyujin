const { regClass, property } = Laya;

import { PlayerController } from "../Player/PlayerController";
import { DataManager } from "../systems/datamanager";

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

    private spine: Laya.Spine2DRenderNode | null = null;
    private currentAnimation: string = "";
    private baseScaleX: number = 1;
    private facingSign: number = 1;
    private attackLocked: boolean = false;
    private hasAggro: boolean = false;
    private spawnIdleUntil: number = 0;
    private dead: boolean = false;
    private attackToken: number = 0;
    private deathAnimationStarted: boolean = false;
    private dropGranted: boolean = false;

    onAwake(): void {
        this.captureBaseScale();
        this.syncDetectNodeX();
        this.setAttackNodeVisible(false);
        this.refreshHpBar();
        this.resolveSpine();
        this.spawnIdleUntil = Date.now() + Math.max(0, this.spawnIdleDuration || 0);
        this.playLocomotion(this.idleAnimation);
    }

    onStart(): void {
        this.captureBaseScale();
        this.syncDetectNodeX();
        this.setAttackNodeVisible(false);
        this.refreshHpBar();
        this.resolveSpine();
        if (this.spawnIdleUntil <= 0) {
            this.spawnIdleUntil = Date.now() + Math.max(0, this.spawnIdleDuration || 0);
        }
        this.playLocomotion(this.idleAnimation);
    }

    onUpdate(): void {
        if (this.dead) {
            return;
        }

        this.resolveSpine();

        if (Date.now() < this.spawnIdleUntil) {
            this.playLocomotion(this.idleAnimation);
            return;
        }

        const target = this.resolveTargetNode();
        if (!target) {
            this.playLocomotion(this.idleAnimation);
            return;
        }

        const owner = this.owner as Laya.Sprite;
        const targetPos = this.getGlobalPosition(target);
        const ownerPos = this.getGlobalPosition(owner);
        const deltaX = targetPos.x - ownerPos.x;
        const deltaY = targetPos.y - ownerPos.y;
        const distance = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));

        if (!this.hasAggro) {
            if (distance > this.aggroDistance) {
                this.playLocomotion(this.idleAnimation);
                return;
            }

            this.hasAggro = true;
        }

        if (this.attackLocked) {
            return;
        }

        if (distance <= this.attackDistance) {
            this.updateFacing(deltaX);
            this.startAttack();
            return;
        }

        this.attackLocked = false;

        const moveSpeed = this.runSpeed;
        const dt = Laya.timer.delta / 1000;
        const nx = distance > 0 ? deltaX / distance : 0;
        const ny = distance > 0 ? deltaY / distance : 0;

        owner.x += nx * moveSpeed * dt;
        owner.y += ny * moveSpeed * dt;
        this.updateFacing(nx);
        this.playLocomotion(this.runAnimation);
    }

    onDestroy(): void {
        Laya.timer.clear(this, this.showAttackNode);
        Laya.timer.clear(this, this.onAttackFinished);
        Laya.timer.clear(this, this.playDeathAnimation);
        Laya.timer.clear(this, this.recycleToPool);
        this.setAttackNodeVisible(false);
        this.spine = null;
        this.currentAnimation = "";
    }

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
            hasAggro: this.hasAggro,
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
            currentAnimation: this.currentAnimation,
            facingSign: this.facingSign,
            dead: this.dead,
            deathAnimationStarted: this.deathAnimationStarted,
        };
    }

    private get ownerSprite(): Laya.Sprite {
        return this.owner as Laya.Sprite;
    }

    public setHp(currentHp: number, maxHp: number = this.maxHp): void {
        this.maxHp = Math.max(1, Math.floor(maxHp));
        this.currentHp = Math.max(0, Math.min(Math.floor(currentHp), this.maxHp));
        this.refreshHpBar();

        if (this.currentHp <= 0) {
            this.die();
        }
    }

    public takeDamage(amount: number): void {
        const damage = Math.max(0, Math.floor(amount));
        if (damage <= 0 || this.dead) {
            return;
        }

        this.setHp(this.currentHp - damage, this.maxHp);
    }

    public isDead(): boolean {
        return this.dead;
    }

    public getAttackToken(): number {
        return this.attackToken;
    }

    public refreshHpBar(): void {
        const fill = this.hpFillNode as any;
        if (!fill) {
            return;
        }

        const ratio = this.currentHp / Math.max(1, this.maxHp);
        this.applyHpFillWidth(fill, Math.max(0, this.hpFillFullWidth * ratio));
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

    private resolveTargetNode(): Laya.Node | null {
        if (this.playerNode) {
            return this.playerNode;
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

    private resolveSpine(): void {
        if (this.spine) {
            return;
        }

        if (!this.spineNode) {
            return;
        }

        this.spine = this.spineNode.getComponent(Laya.Spine2DRenderNode);
    }

    private playLocomotion(animationName: string): void {
        const nextAnimation = animationName || this.idleAnimation || "idle";

        if (!this.spine) {
            return;
        }

        if (!this.isSpineReady()) {
            return;
        }

        if (this.currentAnimation === nextAnimation) {
            return;
        }

        this.spine.play(nextAnimation, true, 0);
        this.currentAnimation = nextAnimation;
    }

    private startAttack(): void {
        if (this.attackLocked || this.dead) {
            return;
        }

        if (!this.spine) {
            return;
        }

        if (!this.isSpineReady()) {
            return;
        }

        this.attackLocked = true;
        this.attackToken += 1;
        this.setAttackNodeVisible(false);
        Laya.timer.clear(this, this.showAttackNode);
        Laya.timer.once(Math.max(0, this.attackNodeShowDelay || 0), this, this.showAttackNode);
        this.playOneShot(this.attackAnimation || "attack", 700);
    }

    private playOneShot(animationName: string, durationMs: number): void {
        const nextAnimation = animationName || this.attackAnimation || "attack";

        if (!this.spine) {
            return;
        }

        this.spine.play(nextAnimation, false, 0);
        this.currentAnimation = nextAnimation;

        Laya.timer.clear(this, this.onAttackFinished);
        Laya.timer.once(Math.max(100, durationMs || 0), this, this.onAttackFinished);
    }

    private onAttackFinished(): void {
        if (this.dead) {
            return;
        }

        this.attackLocked = false;
        this.attackToken = 0;
        this.currentAnimation = "";
        Laya.timer.clear(this, this.showAttackNode);
        this.setAttackNodeVisible(false);
    }

    private showAttackNode(): void {
        if (this.dead) {
            return;
        }

        this.setAttackNodeVisible(true);
    }

    private setAttackNodeVisible(visible: boolean): void {
        const attackNode = this.attackNode as any;
        if (!attackNode) {
            return;
        }

        attackNode.visible = visible;
        if ("active" in attackNode) {
            attackNode.active = visible;
        }
    }

    private isSpineReady(): boolean {
        if (!this.spine) {
            return false;
        }

        const anySpine = this.spine as any;
        if (!anySpine.templet) {
            return false;
        }

        if (typeof anySpine.getAnimNum !== "function") {
            return true;
        }

        try {
            return Number(anySpine.getAnimNum()) > 0;
        } catch (error) {
            return false;
        }
    }

    private die(): void {
        if (this.dead) {
            return;
        }

        this.dead = true;
        this.grantDropsToPlayer();
        DataManager.getInstance().grantEnemyDefeatExperience();
        PlayerController.activeInstance?.syncHpFromData();
        this.attackLocked = false;
        this.attackToken = 0;
        this.hasAggro = false;
        Laya.timer.clear(this, this.showAttackNode);
        Laya.timer.clear(this, this.onAttackFinished);
        Laya.timer.clear(this, this.playDeathAnimation);
        Laya.timer.clear(this, this.recycleToPool);
        this.setAttackNodeVisible(false);

        this.playDeathAnimation();
    }

    private playDeathAnimation(): void {
        if (this.deathAnimationStarted) {
            return;
        }

        this.resolveSpine();

        if (!this.spine || !this.isSpineReady()) {
            Laya.timer.once(0, this, this.playDeathAnimation);
            return;
        }

        const animationName = this.deathAnimation || "death";
        try {
            this.spine.play(animationName, false, 0);
        } catch (error) {
            if (animationName !== "death") {
                this.spine.play("death", false, 0);
                this.currentAnimation = "death";
                this.deathAnimationStarted = true;
                return;
            }

            throw error;
        }

        this.currentAnimation = animationName;
        this.deathAnimationStarted = true;
        Laya.timer.clear(this, this.recycleToPool);
        Laya.timer.once(Math.max(0, this.deathRecycleDelay || 0), this, this.recycleToPool);
    }

    private recycleToPool(): void {
        const owner = this.owner as any;
        if (!owner) {
            return;
        }

        Laya.timer.clear(this, this.showAttackNode);
        Laya.timer.clear(this, this.onAttackFinished);
        Laya.timer.clear(this, this.playDeathAnimation);
        Laya.timer.clear(this, this.recycleToPool);
        this.setAttackNodeVisible(false);

        if ("visible" in owner) {
            owner.visible = false;
        }

        if ("active" in owner) {
            owner.active = false;
        }

        if (!ZombieController.pool.includes(this)) {
            ZombieController.pool.push(this);
        }
    }

    public resetFromPool(x?: number, y?: number): void {
        const owner = this.owner as any;
        if (!owner) {
            return;
        }

        this.dead = false;
        this.deathAnimationStarted = false;
        this.dropGranted = false;
        this.attackLocked = false;
        this.attackToken = 0;
        this.hasAggro = false;
        this.currentAnimation = "";
        this.setHp(this.maxHp, this.maxHp);
        this.setAttackNodeVisible(false);
        this.spawnIdleUntil = Date.now() + Math.max(0, this.spawnIdleDuration || 0);

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

        this.resolveSpine();
        this.playLocomotion(this.idleAnimation);
    }

    private grantDropsToPlayer(): void {
        if (this.dropGranted) {
            return;
        }

        this.dropGranted = true;

        const itemId = String(this.dropItemId || "").trim();
        const count = Math.max(0, Math.floor(this.dropCount || 0));
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

    private updateFacing(moveX: number): void {
        const owner = this.ownerSprite;
        if (!owner) {
            return;
        }

        const desiredSign = moveX >= 0 ? -1 : 1;
        if (this.facingSign === desiredSign) {
            return;
        }

        this.facingSign = desiredSign;
        owner.scaleX = this.baseScaleX * this.facingSign;
        this.syncDetectNodeX();
        this.syncAttackNodeX();
        this.syncHpBarTransform();
    }

    private captureBaseScale(): void {
        const owner = this.ownerSprite;
        if (!owner) {
            return;
        }

        this.baseScaleX = Math.abs(owner.scaleX || 1);
        if (this.baseScaleX === 0) {
            this.baseScaleX = 1;
        }

        if (this.facingSign === 0) {
            this.facingSign = 1;
        }

        owner.scaleX = this.baseScaleX * this.facingSign;
        this.syncDetectNodeX();
        this.syncAttackNodeX();
        this.syncHpBarTransform();
    }

    private syncDetectNodeX(): void {
        const detectNode = this.detectNode as Laya.Sprite | null;
        if (!detectNode) {
            return;
        }

        detectNode.x = this.facingSign < 0 ? this.detectRightX : this.detectLeftX;
    }

    private syncAttackNodeX(): void {
        const attackNode = this.attackNode as Laya.Sprite | null;
        if (!attackNode) {
            return;
        }

        attackNode.x = this.facingSign < 0 ? this.attackRightX : this.attackLeftX;
    }

    private syncHpBarTransform(): void {
        const hpBarNode = (this.hpBarNode || this.hpFillNode?.parent || null) as Laya.Sprite | null;
        if (!hpBarNode) {
            return;
        }

        const facingRight = this.facingSign < 0;
        hpBarNode.x = facingRight ? this.hpBarRightX : this.hpBarLeftX;
        hpBarNode.scaleX = facingRight ? -1 : 1;
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
