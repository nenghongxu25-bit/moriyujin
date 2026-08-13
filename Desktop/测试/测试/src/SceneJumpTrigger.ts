const { regClass, property } = Laya;

import { DataManager } from "./systems/datamanager";

@regClass()
export class SceneJumpTrigger extends Laya.Script {
    @property(Laya.Node)
    public triggerNode: Laya.Node | null = null;

    @property(String)
    public sceneUrl: string = "";

    private boundNode: Laya.Node | null = null;
    private jumped: boolean = false;

    onAwake(): void {
        this.bindTriggerNode();
    }

    onEnable(): void {
        this.bindTriggerNode();
    }

    onDisable(): void {
        this.unbindTriggerNode();
    }

    onDestroy(): void {
        this.unbindTriggerNode();
    }

    private bindTriggerNode(): void {
        this.unbindTriggerNode();

        const node = this.triggerNode || (this.owner as Laya.Node | null);
        if (!node) {
            return;
        }

        this.boundNode = node;
        const owner = node as any;

        if ("mouseEnabled" in owner) {
            owner.mouseEnabled = true;
        }

        if (typeof owner.on === "function") {
            owner.on(Laya.Event.TRIGGER_ENTER, this, this.onTriggerEnter);
        }
    }

    private unbindTriggerNode(): void {
        if (!this.boundNode) {
            return;
        }

        const node = this.boundNode as any;
        if (typeof node.off === "function") {
            node.off(Laya.Event.TRIGGER_ENTER, this, this.onTriggerEnter);
        }

        this.boundNode = null;
    }

    private onTriggerEnter(other: any): void {
        if (this.jumped) {
            return;
        }

        if (!other) {
            return;
        }

        const url = this.sceneUrl.trim();
        if (!url) {
            return;
        }

        this.jumped = true;
        DataManager.getInstance().enterScene(url);
        Laya.Scene.open(url);
    }
}
