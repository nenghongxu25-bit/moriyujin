const { regClass, property } = Laya;

import { DouyinLogin } from "./auth/DouyinLogin";

@regClass()
export class OpenSprite extends Laya.Script {
    @property({ type: Laya.Node })
    public targetNode: Laya.Node | null = null;

    @property(String)
    public actionId: string = "";

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
            owner.onClick(this, this.onOpenClick);
        } else {
            owner.on(Laya.Event.CLICK, this, this.onOpenClick);
        }
    }

    private unbindClickTarget(): void {
        if (!this.boundOwner) {
            return;
        }

        const owner = this.boundOwner as any;
        if (typeof owner.offClick === "function") {
            owner.offClick(this, this.onOpenClick);
        } else {
            this.boundOwner.off(Laya.Event.CLICK, this, this.onOpenClick);
        }

        this.boundOwner = null;
    }

    private onOpenClick(): void {
        const actionId = String(this.actionId || "").trim();
        if (actionId === "douyin-login") {
            DouyinLogin.openLoginPanel();
            return;
        }

        if (this.targetNode) {
            (this.targetNode as any).visible = true;
            this.refreshTargetNode(this.targetNode);
        }
    }

    private refreshTargetNode(node: Laya.Node): void {
        const components = (node as any)._components as any[] | undefined;
        if (!Array.isArray(components)) {
            return;
        }

        for (let i = 0; i < components.length; i++) {
            const component = components[i];
            if (component && typeof component.refresh === "function") {
                component.refresh();
            }
        }
    }
}
