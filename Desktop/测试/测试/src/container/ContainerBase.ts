import { PlayerController } from "../Player/PlayerController";
import { BagPanel } from "../PlayUI/Bag/BagPanel";
import { DataManager, type InventorySlotItem, type InventoryViewItem } from "../systems/datamanager";

const { regClass, property } = Laya;

export interface ContainerItem {
    itemId: string;
    name?: string;
    count: number;
    minCount?: number;
    maxCount?: number;
    probability?: number;
    icon?: string;
}

interface ContainerOpenSequenceStep {
    animation: string;
    duration: number;
    loop?: boolean;
}

@regClass()
export abstract class ContainerBase extends Laya.Script {
    @property(String)
    public containerId: string = "";

    @property(String)
    public instanceId: string = "";

    @property(String)
    public displayName: string = "";

    @property(String)
    public contentsJson: string = "";

    @property(Boolean)
    public once: boolean = true;

    @property(Boolean)
    public destroyAfterOpen: boolean = false;

    private static focusedTarget: ContainerBase | null = null;
    private static readonly instanceRegistry: Map<string, ContainerBase> = new Map();

    private opened: boolean = false;
    private busy: boolean = false;

    protected abstract getDefaultContainerId(): string;
    protected abstract getDefaultDisplayName(): string;
    protected abstract getDefaultContents(): ContainerItem[];

    onAwake(): void {
        const owner = this.owner as Laya.Sprite;
        if (owner) {
            owner.mouseEnabled = true;
        }
        this.ensureDefaults();
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

    public static getFocusedTarget(): ContainerBase | null {
        return ContainerBase.focusedTarget;
    }

    public static resolveByInstanceId(instanceId: string): ContainerBase | null {
        const id = String(instanceId || "").trim();
        return id ? ContainerBase.instanceRegistry.get(id) || null : null;
    }

    public isAvailable(): boolean {
        return !this.busy && (!this.once || !this.opened);
    }

    public open(player: PlayerController | null): boolean {
        if (!this.isAvailable()) {
            player?.showState(`${this.getResolvedDisplayName()}已经空了`);
            return false;
        }

        if (player && player.animation.isBusy()) {
            return false;
        }

        this.busy = true;

        const finishOpen = (): void => {
            const contents = this.rollContents();
            if (contents.length > 0) {
                this.openBagPanelContainerState(contents);
                player?.showItem(this.formatContents(contents));
            } else {
                this.openBagPanelContainerState([]);
                player?.showState(`${this.getResolvedDisplayName()}是空的`);
            }

            this.opened = true;
            this.busy = false;

            if (this.destroyAfterOpen) {
                this.destroySelf();
            }
        };

        Laya.timer.once(this.getOpenPanelDelay(), this, this.openBagPanelContainerState);

        if (player && typeof player.animation.playActionSequence === "function") {
            player.animation.playActionSequence(this.getOpenSequence(), player.idleAnimation, finishOpen);
        } else {
            Laya.timer.once(this.getOpenSequenceDuration(), this, finishOpen);
        }

        return true;
    }

    public onTriggerEnter(other: any): void {
        if (!this.isPlayerContact(other)) {
            return;
        }

        ContainerBase.focusedTarget = this;
    }

    public onTriggerExit(other: any): void {
        if (!this.isPlayerContact(other)) {
            return;
        }

        if (ContainerBase.focusedTarget === this) {
            ContainerBase.focusedTarget = null;
        }
    }

    private ensureDefaults(): void {
        if (!this.containerId) {
            this.containerId = this.getDefaultContainerId();
        }
        if (!this.displayName) {
            this.displayName = this.getDefaultDisplayName();
        }
    }

    private registerSelf(): void {
        this.ensureDefaults();
        const id = String(this.instanceId || "").trim();
        if (id) {
            ContainerBase.instanceRegistry.set(id, this);
        }
    }

    private unregisterSelf(): void {
        const id = String(this.instanceId || "").trim();
        if (id && ContainerBase.instanceRegistry.get(id) === this) {
            ContainerBase.instanceRegistry.delete(id);
        }
        if (ContainerBase.focusedTarget === this) {
            ContainerBase.focusedTarget = null;
        }
    }

    private resolveContents(): ContainerItem[] {
        const fromJson = this.parseContentsJson();
        return fromJson.length > 0 ? fromJson : this.getDefaultContents();
    }

    private rollContents(): InventoryViewItem[] {
        const contents = this.resolveContents();
        const results: InventoryViewItem[] = [];
        const dataManager = DataManager.getInstance();

        for (let i = 0; i < contents.length; i++) {
            const item = contents[i];
            const probability = Number.isFinite(item.probability as number)
                ? Math.max(0, Math.min(1, item.probability as number))
                : 1;
            if (Math.random() > probability) {
                continue;
            }

            const minCount = Number.isFinite(item.minCount as number)
                ? Math.max(0, Math.floor(item.minCount as number))
                : Math.max(0, Math.floor(item.count || 0));
            const maxCount = Number.isFinite(item.maxCount as number)
                ? Math.max(minCount, Math.floor(item.maxCount as number))
                : minCount;
            const count = minCount + Math.floor(Math.random() * (maxCount - minCount + 1));
            if (count <= 0) {
                continue;
            }

            const meta = dataManager.resolveItemMeta(item.itemId);
            results.push({
                itemId: item.itemId,
                name: item.name || meta?.displayName || meta?.nameZh || dataManager.resolveFallbackName(item.itemId) || item.itemId,
                count,
                icon: item.icon || meta?.icon || dataManager.resolveFallbackIcon(item.itemId),
            });
        }

        return results;
    }

    private parseContentsJson(): ContainerItem[] {
        const raw = String(this.contentsJson || "").trim();
        if (!raw) {
            return [];
        }

        try {
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) {
                return [];
            }

            return parsed
                .map((item: any) => ({
                    itemId: String(item?.itemId || "").trim(),
                    name: item?.name ? String(item.name) : undefined,
                    count: Number.isFinite(Number(item?.count)) ? Math.floor(Number(item.count)) : 0,
                    minCount: Number.isFinite(Number(item?.minCount)) ? Math.floor(Number(item.minCount)) : undefined,
                    maxCount: Number.isFinite(Number(item?.maxCount)) ? Math.floor(Number(item.maxCount)) : undefined,
                    probability: Number.isFinite(Number(item?.probability)) ? Number(item.probability) : undefined,
                    icon: item?.icon ? String(item.icon) : undefined,
                }))
                .filter((item: ContainerItem) => !!item.itemId && (item.count > 0 || (item.minCount || 0) > 0));
        } catch (error) {
            console.warn("[ContainerBase] invalid contentsJson", error);
            return [];
        }
    }

    private openBagPanelContainerState(items?: InventorySlotItem[]): void {
        const panel = this.findBagPanel(Laya.stage as Laya.Node | null);
        if (!panel) {
            return;
        }

        const panelOwner = panel.owner as any;
        if (panelOwner) {
            panelOwner.visible = true;
            panelOwner.active = true;
        }
        if (items) {
            panel.openContainerSearchWithItems(items);
        } else {
            panel.openContainerSearch();
        }
        panel.refresh();
    }

    private getOpenSequence(): ContainerOpenSequenceStep[] {
        return [
            { animation: "search/search_start", duration: 816, loop: false },
            { animation: "search/search_loop", duration: 2983, loop: true },
            { animation: "search/search_end", duration: 816, loop: false },
        ];
    }

    private getOpenSequenceDuration(): number {
        const sequence = this.getOpenSequence();
        let total = 0;
        for (let i = 0; i < sequence.length; i++) {
            total += Math.max(0, sequence[i].duration || 0);
        }

        return Math.max(100, total);
    }

    private getOpenPanelDelay(): number {
        const firstStep = this.getOpenSequence()[0];
        return Math.max(0, firstStep?.duration || 0);
    }

    private findBagPanel(root: Laya.Node | null): BagPanel | null {
        if (!root) {
            return null;
        }

        const panel = root.getComponent(BagPanel);
        if (panel) {
            return panel;
        }

        const count = root.numChildren || 0;
        for (let i = 0; i < count; i++) {
            const found = this.findBagPanel(root.getChildAt(i));
            if (found) {
                return found;
            }
        }

        return null;
    }

    private formatContents(contents: InventoryViewItem[]): string {
        return contents
            .map((item) => {
                const name = item.name || item.itemId;
                return `${name}x${item.count}`;
            })
            .join(" ");
    }

    private getResolvedDisplayName(): string {
        return this.displayName || this.getDefaultDisplayName() || this.containerId || "容器";
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

        this.unregisterSelf();
        owner.visible = false;
        owner.mouseEnabled = false;
        owner.active = false;

        Laya.timer.once(0, null, () => {
            if (!owner.destroyed) {
                owner.removeSelf();
                owner.destroy();
            }
        });
    }
}
