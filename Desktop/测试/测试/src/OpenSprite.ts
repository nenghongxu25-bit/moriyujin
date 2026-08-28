const { regClass, property } = Laya;

import { DouyinLogin } from "./platform/douyin/DouyinLogin";
import { DouyinCloudSaveManager } from "./platform/douyin/DouyinCloudSaveManager";
import { DouyinUserProfileManager } from "./platform/douyin/DouyinUserProfileManager";
import { PlayerProfileView } from "./PlayUI/playerui/PlayerProfileView";

@regClass()
export class OpenSprite extends Laya.Script {
    private static cloudLoginStarted: boolean = false;

    @property({ type: Laya.Node })
    public targetNode: Laya.Node | null = null;

    @property(String)
    public actionId: string = "";

    private boundOwner: Laya.Node | null = null;

    onAwake(): void {
        OpenSprite.startCloudLoginOnce();
        OpenSprite.bindPlayerProfileViewOnce();
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

    private static startCloudLoginOnce(): void {
        if (OpenSprite.cloudLoginStarted) {
            return;
        }

        OpenSprite.cloudLoginStarted = true;
        console.log("[DouyinCloud] 菜单启动，开始免登录");

        void DouyinCloudSaveManager.bootstrap();
    }

    private static bindPlayerProfileViewOnce(): void {
        Laya.timer.once(0, null, () => {
            const stage = Laya.stage as Laya.Node | null;
            if (!stage) {
                return;
            }

            const profileNode = OpenSprite.findNodeByName(stage, "touxiang");
            if (!profileNode || profileNode.destroyed) {
                return;
            }

            if (!profileNode.getComponent(PlayerProfileView)) {
                profileNode.addComponent(PlayerProfileView);
            }
        });
    }

    private static findNodeByName(root: Laya.Node, name: string): Laya.Node | null {
        if (root.name === name) {
            return root;
        }

        const count = root.numChildren;
        for (let i = 0; i < count; i++) {
            const child = root.getChildAt(i);
            const found = OpenSprite.findNodeByName(child, name);
            if (found) {
                return found;
            }
        }

        return null;
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

        if (actionId === "douyin-profile") {
            void this.requestDouyinProfile();
            return;
        }

        if (this.targetNode) {
            (this.targetNode as any).visible = true;
            this.refreshTargetNode(this.targetNode);
        }
    }

    private async requestDouyinProfile(): Promise<void> {
        try {
            const profile = await DouyinUserProfileManager.requestAndSaveProfile();
            console.log("[DouyinProfile] profile saved:", profile);
        } catch (error) {
            console.warn("[DouyinProfile] request profile failed:", error);
        }
    }

    private refreshTargetNode(node: Laya.Node): void {
        const components = (node as any)._components as any[] | undefined;
        if (!Array.isArray(components)) {
            return;
        }

        for (let i = 0; i < components.length; i++) {
            const component = components[i];
            if (component && typeof component.onPanelOpened === "function") {
                component.onPanelOpened();
            } else if (component && typeof component.refresh === "function") {
                component.refresh();
            }
        }
    }
}
