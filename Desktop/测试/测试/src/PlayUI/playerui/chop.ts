const { regClass, property } = Laya;

import { PlayerController } from "../../Player/PlayerController";
import { HarvestableBase } from "../../harvestable/HarvestableBase";

@regClass()
export class chop extends Laya.Script {
    @property(Laya.Node)
    public playerNode: Laya.Node | null = null;

    private boundOwner: Laya.Node | null = null;
    private currentTarget: HarvestableBase | null = null;

    onAwake(): void {
        this.bindClickTarget();
        this.refreshTarget();
    }

    onEnable(): void {
        this.bindClickTarget();
        this.refreshTarget();
    }

    onUpdate(): void {
        this.refreshTarget();
    }

    onDisable(): void {
        this.unbindClickTarget();
        this.currentTarget = null;
        this.setVisible(false);
    }

    onDestroy(): void {
        this.unbindClickTarget();
        this.currentTarget = null;
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
            owner.onClick(this, this.onChopClick);
        } else {
            owner.on(Laya.Event.CLICK, this, this.onChopClick);
        }
    }

    private unbindClickTarget(): void {
        if (!this.boundOwner) {
            return;
        }

        const owner = this.boundOwner as any;
        if (typeof owner.offClick === "function") {
            owner.offClick(this, this.onChopClick);
        } else {
            this.boundOwner.off(Laya.Event.CLICK, this, this.onChopClick);
        }

        this.boundOwner = null;
    }

    private onChopClick(): void {
        const controller = this.resolvePlayerController();
        const target = this.currentTarget || HarvestableBase.getFocusedChopTarget();
        if (!controller || !target) {
            return;
        }

        if (!target.harvest(controller)) {
            this.refreshTarget();
            return;
        }

        this.setVisible(false);
    }

    private refreshTarget(): void {
        const target = HarvestableBase.getFocusedChopTarget();
        this.currentTarget = target;

        if (!target) {
            this.setVisible(false);
            return;
        }

        this.setVisible(true);
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

    private setVisible(visible: boolean): void {
        const owner = this.owner as Laya.Node;
        if (owner) {
            (owner as any).visible = visible;
        }
    }
}
