import type { PlayerController } from "./PlayerController";

interface ActionSequenceStep {
    animation: string;
    duration: number;
    loop?: boolean;
    playbackRate?: number;
}

interface SpineAnimationSnapshot {
    animation: string | null;
    currentTime: number | null;
    playState: number | null;
    readyState: number | null;
    source: string | null;
    templetUrl: string | null;
}

export class PlayerAnimationController {
    private spine: Laya.Spine2DRenderNode | null = null;
    private currentAnimation: string = "";
    private currentLowerAnimation: string = "";
    private currentUpperAnimation: string = "";
    private desiredAnimation: string = "";
    private pendingAnimation: string = "";
    private actionAnimation: string = "";
    private actionFallbackAnimation: string = "";
    private actionEndAt: number = 0;
    private actionSequenceActive: boolean = false;
    private actionSequenceToken: number = 0;
    private actionSequenceStepIndex: number = 0;
    private actionSequence: ActionSequenceStep[] = [];

    constructor(private controller: PlayerController) {
    }

    public onAwake(): void {
        this.resolveSpine();
        this.setLocomotionState(this.controller.idleAnimation);
        this.sync(true);
    }

    public onStart(): void {
        this.resolveSpine();
        this.sync(true);
    }

    public onUpdate(): void {
        this.resolveSpine();
        this.sync(false);
    }

    public onDestroy(): void {
        this.spine = null;
        this.currentAnimation = "";
        this.currentLowerAnimation = "";
        this.currentUpperAnimation = "";
        this.desiredAnimation = "";
        this.pendingAnimation = "";
        this.actionAnimation = "";
        this.actionFallbackAnimation = "";
        this.actionEndAt = 0;
        this.actionSequenceActive = false;
        this.actionSequenceToken += 1;
        this.actionSequenceStepIndex = 0;
        this.actionSequence = [];
    }

    public setLocomotionState(animationName: string): void {
        this.pendingAnimation = animationName || this.controller.idleAnimation || "idle";
    }

    public playActionAnimation(
        animationName: string,
        durationMs: number,
        fallbackAnimation?: string,
        playbackRate: number = 1,
        onComplete?: () => void
    ): void {
        this.playActionSequence([
            {
                animation: animationName || this.controller.attackAnimation || this.controller.idleAnimation || "idle",
                duration: Math.max(0, durationMs || 0),
                loop: false,
                playbackRate,
            },
        ], fallbackAnimation || this.pendingAnimation || this.controller.idleAnimation || "idle", onComplete);
    }

    public playActionSequence(phases: ActionSequenceStep[], fallbackAnimation?: string, onComplete?: () => void): void {
        const normalizedPhases = Array.isArray(phases)
            ? phases.filter((phase) => !!phase && !!phase.animation)
            : [];

        if (normalizedPhases.length === 0) {
            if (typeof onComplete === "function") {
                onComplete();
            }
            return;
        }

        this.actionSequenceToken += 1;
        const token = this.actionSequenceToken;
        this.actionSequenceActive = true;
        this.actionSequence = normalizedPhases;
        this.actionSequenceStepIndex = 0;
        this.actionFallbackAnimation = fallbackAnimation || this.pendingAnimation || this.controller.idleAnimation || "idle";
        this.runActionSequenceStep(token, onComplete);
    }

    public isBusy(): boolean {
        return this.actionSequenceActive;
    }

    public invalidateLocomotion(): void {
        this.currentAnimation = "";
        this.currentLowerAnimation = "";
        this.currentUpperAnimation = "";
        this.sync(true);
    }

    public snapshot(): Record<string, any> {
        return {
            currentAnimation: this.currentAnimation,
            currentLowerAnimation: this.currentLowerAnimation,
            currentUpperAnimation: this.currentUpperAnimation,
            desiredAnimation: this.desiredAnimation,
            pendingAnimation: this.pendingAnimation,
            actionAnimation: this.actionAnimation,
            actionFallbackAnimation: this.actionFallbackAnimation,
            actionEndAt: this.actionEndAt,
            actionSequenceActive: this.actionSequenceActive,
            hasSpine: !!this.spine,
            ready: this.isReady(),
            spineAnimationName: this.spine ? this.spine.animationName : null,
            spineCurrentTime: this.spine ? this.spine.currentTime : null,
            spinePlayState: this.spine ? this.spine.playState : null,
            spineReadyState: this.getReadyState(),
            spineSource: this.getSpineSource(),
            spineTempletUrl: this.getSpineTempletUrl(),
        };
    }

    private playSpineAnimation(animationName: string, loop: boolean): boolean {
        if (!this.spine || !this.isReady()) {
            return false;
        }

        if (!this.hasAnimation(animationName)) {
            return false;
        }

        (this.spine as any).play(animationName, loop, 0);
        return true;
    }

    private playSpineTrack(animationName: string, loop: boolean, trackIndex: number): boolean {
        if (!this.spine || !this.isReady()) {
            return false;
        }

        if (!this.hasAnimation(animationName)) {
            return false;
        }

        this.wakeSpineRenderer(animationName, loop);

        const render = (this.spine as any)._spineRender;
        if (!render || typeof render.play !== "function") {
            return this.playSpineAnimation(animationName, loop);
        }

        render.play(animationName, loop, trackIndex);
        return true;
    }

    private hasAnimation(animationName: string): boolean {
        if (!this.spine) {
            return false;
        }

        const name = String(animationName || "").trim();
        if (!name) {
            return false;
        }

        const templet = (this.spine as any).templet;
        if (templet && typeof templet.hasAnimation === "function") {
            return !!templet.hasAnimation(name);
        }

        const anySpine = this.spine as any;
        if (templet && typeof anySpine.getAnimNum === "function" && typeof anySpine.getAniNameByIndex === "function") {
            try {
                const count = Math.max(0, Number(anySpine.getAnimNum()) || 0);
                for (let i = 0; i < count; i++) {
                    if (anySpine.getAniNameByIndex(i) === name) {
                        return true;
                    }
                }
                return false;
            } catch (error) {
                return true;
            }
        }

        return true;
    }

    private wakeSpineRenderer(animationName: string, loop: boolean): void {
        if (!this.spine || this.spine.playState !== 0) {
            return;
        }

        try {
            (this.spine as any).play(animationName, loop, true);
        } catch (error) {
        }
    }

    private sync(force: boolean): void {
        if (!this.spine) {
            return;
        }

        if (!this.isReady()) {
            return;
        }

        const nextAnimation = this.pendingAnimation || this.controller.idleAnimation || "idle";
        this.desiredAnimation = nextAnimation;

        if (this.actionSequenceActive && this.controller.layeredSpineAnimationEnabled) {
            this.syncLayeredLowerOnly(nextAnimation, force);
            return;
        }

        if (this.actionSequenceActive) {
            return;
        }

        if (this.controller.layeredSpineAnimationEnabled) {
            this.syncLayeredLocomotion(nextAnimation, force);
            return;
        }

        if (!force && this.currentAnimation === nextAnimation) {
            return;
        }

        if (typeof this.spine.playbackRate === "function") {
            this.spine.playbackRate(1);
        }

        if (this.playSpineAnimation(nextAnimation, true)) {
            this.currentAnimation = nextAnimation;
        }
    }

    private runActionSequenceStep(token: number, onComplete?: () => void): void {
        if (token !== this.actionSequenceToken || !this.spine) {
            return;
        }

        if (!this.isReady()) {
            Laya.timer.callLater(this, () => {
                this.runActionSequenceStep(token, onComplete);
            });
            return;
        }

        const step = this.actionSequence[this.actionSequenceStepIndex];
        if (!step) {
            this.finishActionSequence(token, onComplete);
            return;
        }

        const duration = Math.max(0, step.duration || 0);
        this.actionAnimation = step.animation;
        this.actionEndAt = Date.now() + duration;
        this.desiredAnimation = step.animation;
        this.currentAnimation = step.animation;

        if (typeof this.spine.playbackRate === "function") {
            this.spine.playbackRate(Math.max(0.1, step.playbackRate || 1));
        }

        let advanced = false;
        const advanceStep = (): void => {
            if (advanced || token !== this.actionSequenceToken) {
                return;
            }

            advanced = true;
            this.actionSequenceStepIndex += 1;
            this.runActionSequenceStep(token, onComplete);
        };

        if (!step.loop) {
            const spineNode = this.controller.spineNode;
            if (!this.controller.layeredSpineAnimationEnabled && spineNode) {
                spineNode.once(Laya.Event.STOPPED, this, advanceStep);
            }

            if (duration > 0) {
                const advanceDelay = this.controller.layeredSpineAnimationEnabled
                    ? Math.max(1, duration - 34)
                    : duration + 50;
                Laya.timer.once(advanceDelay, this, advanceStep);
            }
        } else if (duration > 0) {
            Laya.timer.once(duration, this, advanceStep);
        } else {
            advanceStep();
        }

        const played = this.controller.layeredSpineAnimationEnabled
            ? this.playSpineTrack(step.animation, true, 1)
            : this.playSpineAnimation(step.animation, !!step.loop);

        if (!played) {
            Laya.timer.callLater(this, () => {
                this.runActionSequenceStep(token, onComplete);
            });
            return;
        }

        if (this.controller.layeredSpineAnimationEnabled) {
            this.currentUpperAnimation = step.animation;
        }
    }

    private finishActionSequence(token: number, onComplete?: () => void): void {
        if (token !== this.actionSequenceToken) {
            return;
        }

        const fallbackAnimation = this.controller.layeredSpineAnimationEnabled
            ? this.pendingAnimation || this.controller.idleAnimation || "idle"
            : this.actionFallbackAnimation || this.pendingAnimation || this.controller.idleAnimation || "idle";

        this.actionSequenceActive = false;
        this.actionSequenceStepIndex = 0;
        this.actionSequence = [];
        this.actionAnimation = "";
        this.actionEndAt = 0;
        this.desiredAnimation = fallbackAnimation;
        this.actionFallbackAnimation = fallbackAnimation;

        if (this.spine) {
            if (typeof this.spine.playbackRate === "function") {
                this.spine.playbackRate(1);
            }

            if (this.controller.layeredSpineAnimationEnabled) {
                this.currentUpperAnimation = "";
                this.syncLayeredLocomotion(fallbackAnimation, true);
            } else if (this.playSpineAnimation(fallbackAnimation, true)) {
                this.currentAnimation = fallbackAnimation;
            }
        }

        this.actionFallbackAnimation = "";

        if (typeof onComplete === "function") {
            onComplete();
        }
    }

    private isReady(): boolean {
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

    private getReadyState(): number {
        if (!this.spine) {
            return 0;
        }

        const anySpine = this.spine as any;
        const templet = anySpine.templet;
        if (!templet) {
            return 0;
        }

        return typeof templet.readyState === "number" ? templet.readyState : 0;
    }

    private getSpineTempletUrl(): string | null {
        if (!this.spine) {
            return null;
        }

        const anySpine = this.spine as any;
        const templet = anySpine.templet;
        if (!templet) {
            return null;
        }

        return typeof templet.url === "string" ? templet.url : null;
    }

    private getSpineSource(): string | null {
        if (!this.spine) {
            return null;
        }

        const anySpine = this.spine as any;
        return typeof anySpine.source === "string" ? anySpine.source : null;
    }

    private resolveSpine(): void {
        if (this.spine) {
            return;
        }

        const spineNode = this.controller.spineNode;
        if (!spineNode) {
            return;
        }

        const found = spineNode.getComponent(Laya.Spine2DRenderNode);
        if (found) {
            this.spine = found;
        }
    }

    private syncLayeredLocomotion(lowerAnimation: string, force: boolean): void {
        const upperAnimation = this.resolveUpperLocomotionAnimation(lowerAnimation);

        if (typeof this.spine?.playbackRate === "function") {
            this.spine.playbackRate(1);
        }

        this.syncLayeredLowerOnly(lowerAnimation, force);

        if ((force || this.currentUpperAnimation !== upperAnimation) && this.playSpineTrack(upperAnimation, true, 1)) {
            this.currentUpperAnimation = upperAnimation;
        }

        this.currentAnimation = `${this.currentLowerAnimation} + ${this.currentUpperAnimation}`;
    }

    private syncLayeredLowerOnly(lowerAnimation: string, force: boolean): void {
        if (typeof this.spine?.playbackRate === "function") {
            this.spine.playbackRate(1);
        }

        if ((force || this.currentLowerAnimation !== lowerAnimation) && this.playSpineTrack(lowerAnimation, true, 0)) {
            this.currentLowerAnimation = lowerAnimation;
        }
    }

    private resolveUpperLocomotionAnimation(lowerAnimation: string): string {
        return this.controller.resolveUpperLocomotionAnimation(lowerAnimation);
    }

}
