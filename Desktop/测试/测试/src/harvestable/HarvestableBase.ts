import type { PlayerController } from "../Player/PlayerController";

const { regClass, property } = Laya;

export type HarvestAction = "chop" | "search" | "dig";

export interface HarvestDrop {
    itemId: string;
    label: string;
    minCount: number;
    maxCount: number;
    probability: number;
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
    private static focusedChopInstanceId: string | null = null;

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

    public static getFocusedChopTarget(): HarvestableBase | null {
        if (!HarvestableBase.focusedChopInstanceId) {
            return null;
        }

        return HarvestableBase.resolveByInstanceId(HarvestableBase.focusedChopInstanceId);
    }

    public static setFocusedChopTarget(target: HarvestableBase | null): void {
        HarvestableBase.focusedChopInstanceId = target && target.instanceId ? target.instanceId : null;
    }

    public static clearFocusedChopTarget(target?: HarvestableBase | null): void {
        if (!HarvestableBase.focusedChopInstanceId) {
            return;
        }

        if (!target || target.instanceId === HarvestableBase.focusedChopInstanceId) {
            HarvestableBase.focusedChopInstanceId = null;
        }
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

            if (config.once) {
                this.harvested = true;
                this.destroySelf();
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
        if (this.getAction() !== "chop") {
            return;
        }

        if (!this.isPlayerContact(other)) {
            return;
        }

        HarvestableBase.setFocusedChopTarget(this);
    }

    public onTriggerExit(other: any): void {
        if (this.getAction() !== "chop") {
            return;
        }

        if (!this.isPlayerContact(other)) {
            return;
        }

        HarvestableBase.clearFocusedChopTarget(this);
    }

    protected rollLoot(config: HarvestConfig): string {
        const drops: string[] = [];

        for (let i = 0; i < config.drops.length; i++) {
            const drop = config.drops[i];
            if (Math.random() > drop.probability) {
                continue;
            }

            const minCount = Math.min(drop.minCount, drop.maxCount);
            const maxCount = Math.max(drop.minCount, drop.maxCount);
            const count = Math.floor(minCount + Math.random() * (maxCount - minCount + 1));
            drops.push(`${drop.label} x${count}`);
        }

        if (drops.length === 0) {
            return `${config.displayName} collected nothing`;
        }

        return drops.join(", ");
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

        if (!this.instanceId) {
            const owner = this.owner as Laya.Sprite;
            this.instanceId = owner && owner.name ? owner.name : `${config.name}_${Date.now()}`;
        }
    }

    private registerSelf(): void {
        this.ensureIdentifiers();

        if (this.instanceId) {
            HarvestableBase.instanceRegistry.set(this.instanceId, this);
        }
    }

    private unregisterSelf(): void {
        if (this.instanceId && HarvestableBase.instanceRegistry.get(this.instanceId) === this) {
            HarvestableBase.instanceRegistry.delete(this.instanceId);
        }

        if (HarvestableBase.focusedChopInstanceId === this.instanceId) {
            HarvestableBase.focusedChopInstanceId = null;
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

        owner.visible = false;
        owner.mouseEnabled = false;
        owner.active = false;
        Laya.timer.once(50, this, () => {
            owner.destroy();
        });
    }
}
