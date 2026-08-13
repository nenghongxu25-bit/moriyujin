const { regClass, property } = Laya;

import { PlayerController } from "../../Player/PlayerController";

@regClass()
export class run extends Laya.Script {
    @property(Laya.Node)
    public playerNode: Laya.Node | null = null;

    @property(Laya.Node)
    public targetNode: Laya.Node | null = null;

    private boundOwner: Laya.Node | null = null;

    onAwake(): void {
        this.bindClickTarget();
        this.syncVisualState();
    }

    onEnable(): void {
        this.bindClickTarget();
        this.syncVisualState();
    }

    onDisable(): void {
        this.unbindClickTarget();
    }

    onDestroy(): void {
        this.unbindClickTarget();
    }

    private bindClickTarget(): void {
        this.unbindClickTarget();

        const owner = this.owner as any;
        if (!owner) {
            return;
        }

        this.boundOwner = owner;
        owner.mouseEnabled = true;
        if ("mouseThrough" in owner) {
            owner.mouseThrough = false;
        }

        if (typeof owner.onClick === "function") {
            owner.onClick(this, this.onRunClick);
        } else {
            owner.on(Laya.Event.CLICK, this, this.onRunClick);
        }
    }

    private unbindClickTarget(): void {
        if (!this.boundOwner) {
            return;
        }

        const owner = this.boundOwner as any;
        if (typeof owner.offClick === "function") {
            owner.offClick(this, this.onRunClick);
        } else {
            this.boundOwner.off(Laya.Event.CLICK, this, this.onRunClick);
        }

        this.boundOwner = null;
    }

    private onRunClick(): void {
        const controller = this.resolvePlayerController();
        if (!controller) {
            return;
        }

        controller.setRunningState(!controller.isRunning);
        this.syncVisualState();
    }

    private syncVisualState(): void {
        const controller = this.resolvePlayerController();
        const owner = this.owner as any;
        const target = this.targetNode;
        if (!owner || !target) {
            return;
        }

        const running = !!controller && controller.isRunning;
        owner.alpha = running ? 0.55 : 1;
        (target as any).visible = !running;
    }

    private resolvePlayerController(): PlayerController | null {
        if (this.playerNode) {
            const controller = this.playerNode.getComponent(PlayerController);
            if (controller) {
                return controller;
            }
        }

        return PlayerController.activeInstance;
    }
}