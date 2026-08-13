import { PlayerController } from "../Player/PlayerController";
import { DataManager } from "../systems/datamanager";

const { regClass, property } = Laya;

export type HarvestAction = "chop" | "search" | "dig";

export interface HarvestDrop {
    itemId: string;
    label: string;
    minCount: number;
    maxCount: number;
    probability: number;
    countWeights?: {
        count: number;
        probability: number;
    }[];
}

export interface HarvestSequenceStep {
    animation: string;
    duration: number;
    loop?: boolean;
}

export interface HarvestConfig {
    id: string;
    name: string;
    displayName: string;
    action: HarvestAction;
    interactTime: number;
    once: boolean;
    range: number;
    drops: HarvestDrop[];
    sequence?: HarvestSequenceStep[];
}

@regClass()
export abstract class HarvestableBase extends Laya.Script {
    @property(String)
    public resourceId: string = "";

    @property(String)
    public instanceId: string = "";

    @property(String)
    public text: string = "";

    private static readonly instanceRegistry: Map<string, HarvestableBase> = new Map();
    private static readonly focusedTargets: Record<HarvestAction, HarvestableBase | null> = {
        chop: null,
        search: null,
        dig: null,
    };

    private harvested: boolean = false;
    private busy: boolean = false;

    protected abstract getConfig(): HarvestConfig;

    onAwake(): void {
        const owner = this.owner as Laya.Sprite;
        owner.mouseEnabled = true;
        this.ensureIdentifiers();
    }

    onEnable(): void {
        this.registerSelf();
    }

    onDisable(): void {
        this.unregisterSelf();
    }

    onDestroy(): void {
        this.unregisterSelf();
    }

    public static resolveByInstanceId(instanceId: string): HarvestableBase | null {
        if (!instanceId) {
            return null;
        }

        return HarvestableBase.instanceRegistry.get(instanceId) || null;
    }

    public static destroyByInstanceId(instanceId: string): boolean {
        const target = HarvestableBase.resolveByInstanceId(instanceId);
        if (!target) {
            return false;
        }

        target.destroySelf();
        return true;
    }

    public static getFocusedTarget(action: HarvestAction): HarvestableBase | null {
        return HarvestableBase.focusedTargets[action];
    }

    public static setFocusedTarget(action: HarvestAction, target: HarvestableBase | null): void {
        HarvestableBase.focusedTargets[action] = target;
    }

    public static clearFocusedTarget(action: HarvestAction, target?: HarvestableBase | null): void {
        const currentTarget = HarvestableBase.focusedTargets[action];
        if (!currentTarget) {
            return;
        }

        if (!target || target === currentTarget) {
            HarvestableBase.focusedTargets[action] = null;
        }
    }

    public static getFocusedChopTarget(): HarvestableBase | null {
        return HarvestableBase.getFocusedTarget("chop");
    }

    public static getFocusedDigTarget(): HarvestableBase | null {
        return HarvestableBase.getFocusedTarget("dig");
    }

    public static setFocusedChopTarget(target: HarvestableBase | null): void {
        HarvestableBase.setFocusedTarget("chop", target);
    }

    public static setFocusedDigTarget(target: HarvestableBase | null): void {
        HarvestableBase.setFocusedTarget("dig", target);
    }

    public static clearFocusedChopTarget(target?: HarvestableBase | null): void {
        HarvestableBase.clearFocusedTarget("chop", target);
    }

    public static clearFocusedDigTarget(target?: HarvestableBase | null): void {
        HarvestableBase.clearFocusedTarget("dig", target);
    }

    public getAction(): HarvestAction {
        return this.getConfig().action;
    }

    public getDisplayName(): string {
        return this.getConfig().displayName;
    }

    public getRange(): number {
        return this.getConfig().range;
    }

    public isAvailableFor(action: HarvestAction): boolean {
        return !this.harvested && !this.busy && this.getAction() === action;
    }

    public isBusy(): boolean {
        return this.busy;
    }

    public isHarvested(): boolean {
        return this.harvested;
    }

    public getWorldPosition(): Laya.Point {
        const point = new Laya.Point();
        const owner = this.owner as Laya.Sprite;
        owner.localToGlobal(point, false);
        return point;
    }

    public harvest(player: PlayerController | null): boolean {
        const config = this.getConfig();

        if (this.harvested || this.busy) {
            return false;
        }

        if (player && player.animation.isBusy()) {
            return false;
        }

        this.busy = true;

        const sequence = config.sequence && config.sequence.length > 0 ? config.sequence.slice() : null;
        const totalDuration = sequence ? this.getSequenceDuration(sequence) : Math.max(100, config.interactTime);

        const finishHarvest = (): void => {
            this.busy = false;

            const drops = DataManager.getInstance().grantHarvestDrops(config.id, config.drops);
            const dropText = DataManager.getInstance().formatHarvestResults(drops);

            if (config.once) {
                this.harvested = true;
                this.destroySelf();
            }

            if (player) {
                player.showItem(dropText);
            }
        };

        if (player && sequence && typeof player.animation.playActionSequence === "function") {
            player.animation.playActionSequence(sequence, player.idleAnimation, finishHarvest);
            return true;
        }

        Laya.timer.once(Math.max(100, totalDuration), this, finishHarvest);
        return true;
    }

    public onTriggerEnter(other: any): void {
        const action = this.getAction();
        if (!this.isInteractionAction(action)) {
            return;
        }

        if (!this.isPlayerContact(other)) {
            return;
        }

        HarvestableBase.setFocusedTarget(action, this);
    }

    public onTriggerExit(other: any): void {
        const action = this.getAction();
        if (!this.isInteractionAction(action)) {
            return;
        }

        if (!this.isPlayerContact(other)) {
            return;
        }

        HarvestableBase.clearFocusedTarget(action, this);
    }

    private isInteractionAction(action: HarvestAction): boolean {
        return action === "chop" || action === "search" || action === "dig";
    }

    private getSequenceDuration(sequence: HarvestSequenceStep[]): number {
        let total = 0;
        for (let i = 0; i < sequence.length; i++) {
            total += Math.max(0, sequence[i].duration || 0);
        }
        return total;
    }

    private ensureIdentifiers(): void {
        const config = this.getConfig();
        if (!this.resourceId) {
            this.resourceId = config.name;
        }
    }

    private registerSelf(): void {
        this.ensureIdentifiers();

        if (!this.instanceId) {
            return;
        }

        HarvestableBase.instanceRegistry.set(this.instanceId, this);
    }

    private unregisterSelf(): void {
        if (this.instanceId && HarvestableBase.instanceRegistry.get(this.instanceId) === this) {
            HarvestableBase.instanceRegistry.delete(this.instanceId);
        }

        for (const action of ["chop", "search", "dig"] as HarvestAction[]) {
            if (HarvestableBase.focusedTargets[action] === this) {
                HarvestableBase.focusedTargets[action] = null;
            }
        }
    }

    private isPlayerContact(other: any): boolean {
        const node = this.resolveOtherNode(other);
        return !!this.resolvePlayerControllerFromNode(node);
    }

    private resolveOtherNode(other: any): Laya.Node | null {
        if (!other) {
            return null;
        }

        const node = other.owner || other.node || other.colliderOwner || null;
        return node instanceof Laya.Node ? node : null;
    }

    private resolvePlayerControllerFromNode(node: Laya.Node | null): PlayerController | null {
        let current = node;
        while (current) {
            const controller = current.getComponent(PlayerController);
            if (controller) {
                return controller;
            }
            current = current.parent;
        }

        return null;
    }

    private destroySelf(): void {
        const owner = this.owner as Laya.Sprite;
        if (!owner) {
            return;
        }

        this.busy = false;
        this.harvested = true;
        this.unregisterSelf();
        Laya.timer.clearAll(this);

        (owner as any).visible = false;
        owner.mouseEnabled = false;
        owner.active = false;
        owner.destroy();
    }
}
