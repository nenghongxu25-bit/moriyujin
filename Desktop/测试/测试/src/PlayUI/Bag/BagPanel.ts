const { regClass, property } = Laya;

import { bag } from "../playerui/bag";
import { glist } from "./BagList";

@regClass()
export class BagPanel extends Laya.Script {
    @property(Laya.Node)
    public containerNode: Laya.Node | null = null;

    @property(Laya.Node)
    public bagNode: Laya.Node | null = null;

    @property(Laya.Node)
    public containerGlistNode: Laya.Node | null = null;

    @property(Laya.Node)
    public bagGlistNode: Laya.Node | null = null;

    @property(Laya.Node)
    public personPageNode: Laya.Node | null = null;

    @property(Laya.Node)
    public quickEquipNode: Laya.Node | null = null;

    @property(Number)
    public defaultState: number = 0;

    private currentState: number = -1;

    onAwake(): void {
        this.openDefault();
    }

    onEnable(): void {
        this.syncVisibleState();
    }

    public openDefault(): void {
        this.currentState = 0;
        this.syncVisibleState();
    }

    public openContainerSearch(): void {
        this.currentState = 1;
        this.syncVisibleState();
    }

    public closePanel(): void {
        this.setNodeVisible(this.personPageNode, false);
        this.setNodeVisible(this.quickEquipNode, false);
        this.setNodeVisible(this.containerNode, false);
        this.setNodeVisible(this.containerGlistNode, false);
        this.setNodeVisible(this.bagNode, false);
        this.setNodeVisible(this.bagGlistNode, false);
    }

    public showDefaultState(): void {
        this.openDefault();
    }

    public showContainerSearchState(): void {
        this.openContainerSearch();
    }

    public showState(stateIndex: number): void {
        this.currentState = this.normalizeState(stateIndex);
        this.syncVisibleState();
    }

    public refresh(): void {
        this.syncVisibleState();
    }

    private syncVisibleState(): void {
        const showDefault = this.currentState === 0;
        const showContainer = this.currentState === 1;

        this.setNodeVisible(this.personPageNode, showDefault);
        this.setNodeVisible(this.quickEquipNode, showDefault);
        this.setNodeVisible(this.containerNode, showContainer);
        this.setNodeVisible(this.containerGlistNode, showContainer);
        this.setNodeVisible(this.bagNode, true);
        this.setNodeVisible(this.bagGlistNode, true);
    }

    private dumpState(): Record<string, any> {
        return {
            currentState: this.currentState,
            defaultState: this.defaultState,
            containerNode: this.nodeInfo(this.containerNode),
            bagNode: this.nodeInfo(this.bagNode),
            containerGlistNode: this.nodeInfo(this.containerGlistNode),
            bagGlistNode: this.nodeInfo(this.bagGlistNode),
            personPageNode: this.nodeInfo(this.personPageNode),
            quickEquipNode: this.nodeInfo(this.quickEquipNode),
            bagScriptAttached: this.bagNode ? !!this.bagNode.getComponent(bag) : false,
            bagGlistScriptAttached: this.bagGlistNode ? !!this.bagGlistNode.getComponent(glist) : false,
        };
    }

    private nodeInfo(node: Laya.Node | null): Record<string, any> {
        const target = node as any;
        if (!target) {
            return { present: false };
        }

        return {
            present: true,
            name: target.name || "",
            visible: "visible" in target ? target.visible : undefined,
            active: "active" in target ? target.active : undefined,
        };
    }

    private setNodeVisible(node: Laya.Node | null, visible: boolean): void {
        const target = node as any;
        if (!target) {
            return;
        }

        if ("visible" in target) {
            (target as any).visible = visible;
        }

        if ("active" in target) {
            target.active = visible;
        }
    }

    private normalizeState(stateIndex: number): number {
        const state = Number.isFinite(stateIndex) ? Math.floor(stateIndex) : 0;
        if (state === 1) {
            return 1;
        }
        return 0;
    }
}
