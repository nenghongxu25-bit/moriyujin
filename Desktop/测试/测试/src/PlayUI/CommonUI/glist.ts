const { regClass, property } = Laya;

import { listTemplate, type ListTemplateData } from "./listTemplate";

export type GListSlotClickHandler = (item: ListTemplateData | null, listKey: string, slotIndex: number) => void;

@regClass()
export class glist extends Laya.Script {
    @property(Laya.Node)
    public listNode: Laya.Node | null = null;

    @property(Laya.Node)
    public templateNode: Laya.Node | null = null;

    @property(Number)
    public slotCount: number = 0;

    public listKey: string = "";
    public onSlotClick: GListSlotClickHandler | null = null;

    private items: Array<ListTemplateData | null> = [];
    private appliedSlotCount: number = -1;
    private selectedItemId: string = "";
    private selectedSlotIndex: number = -1;

    onAwake(): void {
        this.applySlotCount(true);
        this.refresh();
    }

    onEnable(): void {
        this.applySlotCount();
        this.refresh();
    }

    public setItems(items: Array<ListTemplateData | null> | null | undefined): void {
        this.items = Array.isArray(items) ? items.slice() : [];
        this.refresh();
    }

    public clearItems(): void {
        this.items = [];
        this.refresh();
    }

    public setSlotCount(count: number): void {
        this.slotCount = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
        this.applySlotCount(true);
        this.refresh();
    }

    public setSelectedItemId(itemId: string | null): void {
        this.selectedItemId = itemId ? String(itemId) : "";
        this.selectedSlotIndex = -1;
        this.refresh();
    }

    public setSelectedSlotIndex(slotIndex: number | null): void {
        this.selectedSlotIndex = Number.isFinite(slotIndex) ? Math.floor(slotIndex as number) : -1;
        this.selectedItemId = "";
        this.refresh();
    }

    public refresh(): void {
        this.applySlotCount();

        const listRoot = this.getListRoot();
        if (!listRoot) {
            return;
        }

        this.hideTemplateNode();

        const children = listRoot.children || [];
        const maxSlots = Math.max(0, Math.floor(this.slotCount));
        const bindLimit = maxSlots > 0 ? Math.min(maxSlots, children.length) : children.length;
        let dataIndex = 0;

        for (let i = 0; i < bindLimit; i++) {
            const slotNode = children[i] as Laya.Node;
            if (!slotNode || slotNode === this.templateNode) {
                continue;
            }

            const slot = slotNode.getComponent(listTemplate);
            if (!slot) {
                continue;
            }

            const item = this.items[dataIndex] || null;
            slot.bindData(item);
            const selected =
                this.selectedSlotIndex >= 0
                    ? i === this.selectedSlotIndex && !!item
                    : !!item && !!item.itemId && item.itemId === this.selectedItemId;
            slot.setSelected(selected);
            this.bindSlotClick(slotNode, i);
            dataIndex++;
        }
    }

    private bindSlotClick(slotNode: Laya.Node, slotIndex: number): void {
        const target = slotNode as any;
        if (!target || typeof target.on !== "function" || typeof target.off !== "function") {
            return;
        }

        target.off(Laya.Event.CLICK, this, this.onSlotNodeClick);
        target.on(Laya.Event.CLICK, this, this.onSlotNodeClick, [slotIndex]);
    }

    private onSlotNodeClick(slotIndex: number, event: any): void {
        const listRoot = this.getListRoot();
        if (!listRoot) {
            return;
        }

        const children = listRoot.children || [];
        const slotNode = children[slotIndex] as Laya.Node;
        if (!slotNode) {
            return;
        }

        const slot = slotNode.getComponent(listTemplate);
        if (!slot) {
            return;
        }

        const data = slot.getBoundData();
        if (this.onSlotClick) {
            this.onSlotClick(data, this.listKey, slotIndex);
        }
    }

    private applySlotCount(force: boolean = false): void {
        const listRoot = this.getListRoot() as any;
        if (!listRoot) {
            return;
        }

        const nextCount = Math.max(0, Math.floor(this.slotCount));
        if (!force && this.appliedSlotCount === nextCount) {
            return;
        }

        this.appliedSlotCount = nextCount;

        if ("numItems" in listRoot) {
            listRoot.numItems = nextCount;
        }

        if (typeof listRoot.refresh === "function") {
            listRoot.refresh(true);
        }
    }

    private getListRoot(): Laya.Node | null {
        return this.listNode || (this.owner as Laya.Node) || null;
    }

    private hideTemplateNode(): void {
        const template = this.templateNode as any;
        if (template && "visible" in template) {
            (template as any).visible = false;
        }
    }
}
