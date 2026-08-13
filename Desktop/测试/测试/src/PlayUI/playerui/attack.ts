const { regClass, property } = Laya;

import { PlayerController } from "../../Player/PlayerController";

@regClass()
export class attack extends Laya.Script {
    @property(Laya.Node)
    public playerNode: Laya.Node | null = null;

    private boundOwner: Laya.Node | null = null;

    onAwake(): void {
        this.bindClickTarget();
    }

    onEnable(): void {
        this.bindClickTarget();
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
            owner.onClick(this, this.onAttackClick);
        } else {
            owner.on(Laya.Event.CLICK, this, this.onAttackClick);
        }
    }

    private unbindClickTarget(): void {
        if (!this.boundOwner) {
            return;
        }

        const owner = this.boundOwner as any;
        if (typeof owner.offClick === "function") {
            owner.offClick(this, this.onAttackClick);
        } else {
            this.boundOwner.off(Laya.Event.CLICK, this, this.onAttackClick);
        }

        this.boundOwner = null;
    }

    private onAttackClick(): void {
        const controller = this.resolvePlayerController();
        if (!controller) {
            return;
        }

        controller.playAttack();
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