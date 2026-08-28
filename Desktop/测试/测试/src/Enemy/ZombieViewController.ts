import type { ZombieController } from "./ZombieController";

export class ZombieViewController {
    private spine: Laya.Spine2DRenderNode | null = null;
    private currentAnimation: string = "";
    private baseScaleX: number = 1;
    private facingSign: number = 1;
    private deathAnimationStarted: boolean = false;

    constructor(private controller: ZombieController) {
    }

    public onAwake(): void {
        this.captureBaseScale();
        this.syncDetectNodeX();
        this.setAttackNodeVisible(false);
        this.resolveSpine();
        this.playLocomotion(this.controller.idleAnimation);
    }

    public onStart(): void {
        this.captureBaseScale();
        this.syncDetectNodeX();
        this.setAttackNodeVisible(false);
        this.resolveSpine();
        this.playLocomotion(this.controller.idleAnimation);
    }

    public onDestroy(): void {
        Laya.timer.clear(this, this.playDeathAnimation);
        this.setAttackNodeVisible(false);
        this.spine = null;
        this.currentAnimation = "";
    }

    public reset(): void {
        this.currentAnimation = "";
        this.deathAnimationStarted = false;
        this.captureBaseScale();
        this.setAttackNodeVisible(false);
        this.resolveSpine();
        this.playLocomotion(this.controller.idleAnimation);
    }

    public playLocomotion(animationName: string): void {
        const nextAnimation = animationName || this.controller.idleAnimation || "idle";

        if (!this.spine || !this.isReady()) {
            return;
        }

        if (this.currentAnimation === nextAnimation) {
            return;
        }

        (this.spine as any).play(nextAnimation, true, 0);
        this.currentAnimation = nextAnimation;
    }

    public playOneShot(animationName: string): void {
        const nextAnimation = animationName || this.controller.attackAnimation || "attack";

        if (!this.spine) {
            return;
        }

        (this.spine as any).play(nextAnimation, false, 0);
        this.currentAnimation = nextAnimation;
    }

    public playDeathAnimation(onStarted?: () => void): void {
        if (this.deathAnimationStarted) {
            return;
        }

        this.resolveSpine();

        if (!this.spine || !this.isReady()) {
            Laya.timer.once(0, this, this.playDeathAnimation, [onStarted]);
            return;
        }

        const animationName = this.controller.deathAnimation || "death";
        try {
            (this.spine as any).play(animationName, false, 0);
            this.currentAnimation = animationName;
        } catch (error) {
            if (animationName !== "death") {
                (this.spine as any).play("death", false, 0);
                this.currentAnimation = "death";
            } else {
                throw error;
            }
        }

        this.deathAnimationStarted = true;
        if (typeof onStarted === "function") {
            onStarted();
        }
    }

    public setAttackNodeVisible(visible: boolean): void {
        const attackNode = this.controller.attackNode as any;
        if (!attackNode) {
            return;
        }

        attackNode.visible = visible;
        if ("active" in attackNode) {
            attackNode.active = visible;
        }
    }

    public updateFacing(moveX: number): void {
        const owner = this.controller.ownerSprite;
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

    public isReady(): boolean {
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

    public snapshot(): Record<string, any> {
        return {
            currentAnimation: this.currentAnimation,
            facingSign: this.facingSign,
            deathAnimationStarted: this.deathAnimationStarted,
            hasSpine: !!this.spine,
            ready: this.isReady(),
        };
    }

    private resolveSpine(): void {
        if (this.spine || !this.controller.spineNode) {
            return;
        }

        this.spine = this.controller.spineNode.getComponent(Laya.Spine2DRenderNode);
    }

    private captureBaseScale(): void {
        const owner = this.controller.ownerSprite;
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
        const detectNode = this.controller.detectNode as Laya.Sprite | null;
        if (!detectNode) {
            return;
        }

        detectNode.x = this.facingSign < 0 ? this.controller.detectRightX : this.controller.detectLeftX;
    }

    private syncAttackNodeX(): void {
        const attackNode = this.controller.attackNode as Laya.Sprite | null;
        if (!attackNode) {
            return;
        }

        attackNode.x = this.facingSign < 0 ? this.controller.attackRightX : this.controller.attackLeftX;
    }

    private syncHpBarTransform(): void {
        const hpBarNode = (this.controller.hpBarNode || this.controller.hpFillNode?.parent || null) as Laya.Sprite | null;
        if (!hpBarNode) {
            return;
        }

        const facingRight = this.facingSign < 0;
        hpBarNode.x = facingRight ? this.controller.hpBarRightX : this.controller.hpBarLeftX;
        hpBarNode.scaleX = facingRight ? -1 : 1;
    }
}