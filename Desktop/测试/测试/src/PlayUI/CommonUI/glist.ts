const { regClass, property } = Laya;

export type GListItemBinder = (
    slotNode: Laya.Node,
    item: unknown,
    index: number
) => void;

export type GListItemClickHandler = (
    item: unknown,
    index: number
) => void;

@regClass()
export class glist extends Laya.Script {

    /** 实际的GList节点 */
    @property(Laya.Node)
    public listNode: Laya.Node | null = null;

    /** 编辑器中使用的模板节点 */
    @property(Laya.Node)
    public templateNode: Laya.Node | null = null;

    /** 格子数量 */
    @property(Number)
    public slotCount: number = 0;

    /** 外部提供的数据显示方式 */
    public onBindItem: GListItemBinder | null = null;

    /** 外部提供的点击处理 */
    public onItemClick: GListItemClickHandler | null = null;

    private items: unknown[] = [];
    private appliedSlotCount: number = -1;

    public onAwake(): void {
        this.applySlotCount(true);
        this.refresh();
    }

    public onEnable(): void {
        this.applySlotCount();
        this.refresh();
    }

    /**
     * 设置任意类型的数据。
     */
    public setItems<T>(
        items: T[] | null | undefined,
        binder: (
            slotNode: Laya.Node,
            item: T,
            index: number
        ) => void
    ): void {
        this.items = Array.isArray(items)
            ? items.slice()
            : [];

        this.onBindItem = (
            slotNode,
            item,
            index
        ): void => {
            binder(
                slotNode,
                item as T,
                index
            );
        };

        this.setSlotCount(this.items.length);
    }

    public clearItems(): void {
        this.items = [];
        this.slotCount = 0;
        this.applySlotCount(true);
        this.refresh();
    }

    public setSlotCount(count: number): void {
        this.slotCount = Number.isFinite(count)
            ? Math.max(0, Math.floor(count))
            : 0;

        this.applySlotCount(true);
        this.refresh();
    }

    public refresh(): void {
        this.applySlotCount();
        this.hideTemplateNode();

        const listRoot = this.getListRoot();
        if (!listRoot) {
            return;
        }

        const children = listRoot.children || [];
        let dataIndex = 0;

        for (let i = 0; i < children.length; i++) {
            const slotNode =
                children[i] as Laya.Node;

            if (
                !slotNode ||
                slotNode === this.templateNode
            ) {
                continue;
            }

            const item =
                this.items[dataIndex];

            if (item === undefined) {
                break;
            }

            if (this.onBindItem) {
                this.onBindItem(
                    slotNode,
                    item,
                    dataIndex
                );
            }

            this.bindClick(
                slotNode,
                dataIndex
            );

            dataIndex++;
        }
    }

    private bindClick(
        slotNode: Laya.Node,
        index: number
    ): void {
        const target = slotNode as any;

        if (
            !target ||
            typeof target.on !== "function" ||
            typeof target.off !== "function"
        ) {
            return;
        }

        target.off(
            Laya.Event.CLICK,
            this,
            this.handleClick
        );

        target.on(
            Laya.Event.CLICK,
            this,
            this.handleClick,
            [index]
        );
    }

    private handleClick(index: number): void {
        if (!this.onItemClick) {
            return;
        }

        const item = this.items[index];
        this.onItemClick(item, index);
    }

    private applySlotCount(
        force: boolean = false
    ): void {
        const listRoot =
            this.getListRoot() as any;

        if (!listRoot) {
            return;
        }

        const nextCount = Math.max(
            0,
            Math.floor(this.slotCount)
        );

        if (
            !force &&
            this.appliedSlotCount === nextCount
        ) {
            return;
        }

        this.appliedSlotCount = nextCount;

        if ("numItems" in listRoot) {
            listRoot.numItems = nextCount;
        }

        if (
            typeof listRoot.refresh === "function"
        ) {
            listRoot.refresh(true);
        }
    }

    private getListRoot(): Laya.Node | null {
        return (
            this.listNode ||
            (this.owner as Laya.Node) ||
            null
        );
    }

    private hideTemplateNode(): void {
        const template =
            this.templateNode as any;

        if (
            template &&
            "visible" in template
        ) {
            template.visible = false;
        }
    }
}