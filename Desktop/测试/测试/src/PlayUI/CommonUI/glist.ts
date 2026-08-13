const { regClass, property } = Laya;

import {
    listTemplate,
    type ListTemplateData,
} from "./listTemplate";

export type GListItemBinder<T> = (
    slotNode: Laya.Node,
    item: T,
    index: number
) => void;

export type GListItemClickHandler = (
    item: unknown,
    index: number
) => void;

export type GListSlotClickHandler = (
    item: ListTemplateData | null,
    listKey: string,
    slotIndex: number
) => void;

@regClass()
export class glist extends Laya.Script {
    @property(Laya.Node)
    public listNode: Laya.Node | null = null;
    
    private generatedNodes: Laya.Node[] = [];
    
    @property(Laya.Node)
    public templateNode: Laya.Node | null = null;

    @property(Number)
    public slotCount: number = 0;

    public listKey: string = "";

    public onSlotClick: GListSlotClickHandler | null = null;
    public onItemClick: GListItemClickHandler | null = null;

    private clearGeneratedNodes(): void {
    for (const node of this.generatedNodes) {
        node.removeSelf();
        node.destroy();
    }

    this.generatedNodes = [];
}
    private items: unknown[] = [];
    private customBinder: GListItemBinder<unknown> | null = null;
    private selectedItemId: string = "";

    public onAwake(): void {
        this.rebuild();
    }

    public onEnable(): void {
        this.refresh();
    }

    public setItems(items: ListTemplateData[] | null | undefined): void;
    public setItems<T>(items: T[] | null | undefined, binder: GListItemBinder<T>): void;
    public setItems<T>(items: T[] | null | undefined, binder?: GListItemBinder<T>): void {
        this.items = Array.isArray(items) ? items.slice() : [];

        if (binder) {
            this.customBinder = (
                slotNode: Laya.Node,
                item: unknown,
                index: number
            ): void => {
                binder(slotNode, item as T, index);
            };

            this.rebuild(this.items.length);
            return;
        }

        this.customBinder = null;
        this.rebuild(this.slotCount);
    }

    public clearItems(): void {
        this.items = [];

        if (this.customBinder) {
            this.rebuild(0);
        } else {
            this.rebuild(this.slotCount);
        }
    }

    public setSlotCount(count: number): void {
        this.slotCount = Number.isFinite(count)
            ? Math.max(0, Math.floor(count))
            : 0;

        if (!this.customBinder) {
            this.rebuild(this.slotCount);
        }
    }

    public setSelectedItemId(itemId: string | null): void {
        this.selectedItemId = itemId ? String(itemId) : "";
        this.refresh();
    }

    public rebuild(count?: number): void {
    const root = this.getListRoot();

    if (!root) {
        console.error("[glist] listNode未绑定");
        return;
    }

    const template = this.getTemplateNode();

    if (!template) {
        console.error("[glist] templateNode未绑定");
        return;
    }

    const targetCount = count === undefined
        ? Math.max(0, Math.floor(this.slotCount))
        : Math.max(0, Math.floor(count));

    this.clearGeneratedNodes();
    this.setVisible(template, false);

    for (let i = 0; i < targetCount; i++) {
    const templateObject = template as any;

    if (typeof templateObject.clone !== "function") {
        console.error("[glist] templateNode不支持clone()");
        break;
    }

    const slotNode =
        templateObject.clone() as Laya.Node;

    slotNode.name = `slot_${i}`;
    this.setVisible(slotNode, true);

    root.addChild(slotNode);
    this.generatedNodes.push(slotNode);
    this.bindClick(slotNode, i);
}

    this.refresh();
}

   public refresh(): void {
    for (let i = 0; i < this.generatedNodes.length; i++) {
        const slotNode = this.generatedNodes[i];
        const item = this.items[i] ?? null;

        if (this.customBinder) {
            this.setVisible(slotNode, item !== null);

            if (item !== null) {
                this.customBinder(slotNode, item, i);
            }

            continue;
        }

        const slot = slotNode.getComponent(
            listTemplate
        ) as listTemplate | null;

        if (!slot) {
            console.error(
                `[glist] 第${i}个格子缺少listTemplate脚本`
            );
            continue;
        }

        const data = item as ListTemplateData | null;

        this.setVisible(slotNode, true);
        slot.bindData(data);
        slot.setSelected(
            !!data?.itemId &&
            data.itemId === this.selectedItemId
        );
    }

    this.refreshListLayout();
}

    public getGeneratedNodes(): Laya.Node[] {
    return this.generatedNodes.slice();
}

    private getTemplateNode(): Laya.Node | null {
        if (this.templateNode) {
            return this.templateNode;
        }

        const children = this.listNode?.children || [];
        for (const child of children) {
            if (child) {
                return child;
            }
        }

        return null;
    }

    private getListRoot(): Laya.Node | null {
        return this.listNode || this.owner || null;
    }

    private bindGeneratedSlots(): void {
        const root = this.getListRoot();
        if (!root) {
            return;
        }

        const children = root.children || [];
        let slotIndex = 0;

        for (const child of children) {
            if (!child || child === this.templateNode) {
                continue;
            }

            this.bindClick(child, slotIndex);
            slotIndex++;
        }
    }

    private bindClick(slotNode: Laya.Node, index: number): void {
        const target = slotNode as any;
        if (!target || typeof target.on !== "function" || typeof target.off !== "function") {
            return;
        }

        target.off(Laya.Event.CLICK, this, this.handleClick);
        target.on(Laya.Event.CLICK, this, this.handleClick, [index]);
    }

    private handleClick(index: number): void {
        const item = this.items[index] ?? null;

        if (this.onItemClick) {
            this.onItemClick(item, index);
            return;
        }

        if (this.onSlotClick) {
            this.onSlotClick(item as ListTemplateData | null, this.listKey, index);
        }
    }

    private hideTemplateNode(): void {
        const template = this.templateNode as any;
        if (template && "visible" in template) {
            template.visible = false;
        }
    }

    private setVisible(node: Laya.Node, visible: boolean): void {
        const target = node as any;
        if (target && "visible" in target) {
            target.visible = visible;
        }
    }

    private refreshListLayout(): void {
        const list = this.listNode as any;
        if (list && typeof list.refresh === "function") {
            list.refresh(true);
        }
    }

    public onDestroy(): void {
    this.clearGeneratedNodes();
}
}
