const { regClass } = Laya;

interface InventoryItem {
    name: string;
    type: InventoryType;
    equippedBy: string;
    detail: string;
}

type InventoryType = "装备" | "丹药" | "书籍" | "材料" | "杂物";

@regClass()
export class WarehousePanel extends Laya.Script {
    private typeList: Laya.GList | null = null;
    private bagList: Laya.GList | null = null;
    private typeSelectionFrame: Laya.Sprite | null = null;
    private bagSelectionFrame: Laya.Sprite | null = null;
    private capacityText: Laya.Text | null = null;
    private detailText: Laya.Text | null = null;

    private readonly itemTypes: InventoryType[] = ["装备", "丹药", "书籍", "材料", "杂物"];
    private readonly bagCapacity = 20;
    private readonly typeItemWidth = 150;
    private readonly typeItemHeight = 70;
    private readonly bagItemWidth = 150;
    private readonly bagItemHeight = 70;
    private readonly bagItems: InventoryItem[] = [
        { name: "\u6728\u5251", type: "装备", equippedBy: "\u9752\u69d0", detail: "\u6728\u5251\n\u57fa\u7840\u653b\u51fb +6\n\u7b80\u6613\u6728\u5236\u957f\u5251\uff0c\u9002\u5408\u521d\u5b66\u8005\u7ec3\u4e60\u3002" },
        { name: "\u5e03\u8863", type: "装备", equippedBy: "", detail: "\u5e03\u8863\n\u57fa\u7840\u9632\u5fa1 +4\n\u7c97\u5e03\u7f1d\u5236\u7684\u8863\u7269\uff0c\u80fd\u7565\u5fae\u62b5\u6321\u4f24\u5bb3\u3002" },
        { name: "\u5e03\u62a4\u8155", type: "装备", equippedBy: "", detail: "\u5e03\u62a4\u8155\n\u62db\u67b6 +3\n\u7f20\u5728\u624b\u8155\u5904\u7684\u62a4\u5177\uff0c\u4f7f\u51fa\u62db\u66f4\u7a33\u3002" },
        { name: "\u5e03\u62a4\u8170", type: "装备", equippedBy: "", detail: "\u5e03\u62a4\u8170\n\u6c14\u8840 +30\n\u666e\u901a\u62a4\u8170\uff0c\u80fd\u7a0d\u5fae\u7a33\u4f4f\u8eab\u5f62\u3002" },
        { name: "\u6728\u6212\u6307", type: "装备", equippedBy: "", detail: "\u6728\u6212\u6307\n\u547d\u4e2d +2\n\u6728\u5236\u6212\u6307\uff0c\u8d28\u5730\u8f7b\u4fbf\u3002" },
        { name: "\u6728\u540a\u5760", type: "装备", equippedBy: "", detail: "\u6728\u540a\u5760\n\u5185\u606f +2\n\u523b\u6709\u7b80\u5355\u7eb9\u8def\u7684\u540a\u5760\u3002" },
        { name: "\u6b62\u8840\u6563", type: "丹药", equippedBy: "", detail: "\u6b62\u8840\u6563\n\u6062\u590d\u6c14\u8840 120\n\u5916\u6577\u836f\u6563\uff0c\u7528\u4e8e\u7b80\u5355\u4f24\u53e3\u6b62\u8840\u3002" },
        { name: "\u56de\u6c14\u4e38", type: "丹药", equippedBy: "", detail: "\u56de\u6c14\u4e38\n\u6062\u590d\u5185\u529b 80\n\u5e38\u89c1\u4e38\u836f\uff0c\u53ef\u5c11\u91cf\u8865\u5145\u5185\u529b\u3002" },
        { name: "\u5bd2\u7f28\u843d\u6708\u67aa", type: "书籍", equippedBy: "", detail: "\u5bd2\u7f28\u843d\u6708\u67aa\n\u5957\u8def\u79d8\u7c4d\n\u57fa\u7840\u653b\u51fb 735\n\u57fa\u7840\u547d\u4e2d 234\n\u53ef\u4e60\u5f97\u96ea\u6ee1\u5173\u5c71\u6708\u7b49\u62db\u5f0f\u3002" },
        { name: "\u9752\u7af9", type: "材料", equippedBy: "", detail: "\u9752\u7af9\n\u6750\u6599\n\u9752\u69d0\u9053\u5e38\u89c1\u7af9\u6750\uff0c\u53ef\u7528\u4e8e\u5236\u4f5c\u7b80\u6613\u5668\u5177\u3002" },
        { name: "\u9ebb\u7ef3", type: "杂物", equippedBy: "", detail: "\u9ebb\u7ef3\n\u6742\u7269\n\u7c97\u9ebb\u7f16\u6210\u7684\u7ef3\u5b50\uff0c\u5e38\u7528\u4e8e\u6346\u624e\u7269\u54c1\u3002" },
    ];

    private selectedTypeIndex = 0;
    private selectedBagIndex = -1;

    onAwake(): void {
        const root = this.owner as Laya.Node;
        this.typeList = this.findNode(root, "list") as Laya.GList | null;
        this.bagList = this.findNode(root, "baglist") as Laya.GList | null;
        this.capacityText = this.findNode(root, "text") as Laya.Text | null;
        this.detailText = this.findNode(root, "xiangxi") as Laya.Text | null;
        if (this.detailText) {
            this.detailText.wordWrap = true;
            this.detailText.overflow = "hidden";
            this.detailText.align = "left";
            this.detailText.valign = "top";
            this.detailText.text = "";
        }

        if (this.typeList) {
            this.setupTypeSelectionFrame();
            this.typeList.itemRenderer = (index: number, item: Laya.GWidget) => {
                this.setRenderedItemIndex(item, index);
                this.renderTypeItem(item, this.itemTypes[index] ?? "", false);
                item.offAll(Laya.Event.CLICK);
            };
            this.typeList.on(Laya.Event.CLICK, this, this.onTypeListClick);
        }

        if (this.bagList) {
            this.setupBagSelectionFrame();
            this.bagList.itemRenderer = (index: number, item: Laya.GWidget) => {
                this.setRenderedItemIndex(item, index);
                this.renderItem(item, this.visibleBagItems[index] ?? null, false);
                item.offAll(Laya.Event.CLICK);
            };
            this.bagList.on(Laya.Event.CLICK, this, this.onBagListClick);
        }

        this.refreshTypeList();
        this.refreshBagList();
        this.refreshDetail();
    }

    private selectType(index: number): void {
        if (index < 0 || index >= this.itemTypes.length) {
            return;
        }

        this.selectedTypeIndex = index;
        this.selectedBagIndex = -1;
        this.refreshTypeList();
        this.refreshBagList();
        this.refreshDetail();
    }

    private selectBagItem(index: number): void {
        this.selectedBagIndex = index;
        this.refreshBagList();
        this.refreshDetail();
    }

    private refreshTypeList(): void {
        if (this.typeList) {
            this.typeList.numItems = this.itemTypes.length;
            this.refreshVisibleTypeItems();
        }
        this.refreshTypeSelectionFrame();
    }

    private refreshBagList(): void {
        if (this.bagList) {
            this.bagList.numItems = this.visibleBagItems.length;
            this.refreshVisibleBagItems();
        }

        this.refreshBagSelectionFrame();

        if (this.capacityText) {
            this.capacityText.text = `${this.visibleBagItems.length}/${this.bagCapacity}`;
        }
    }

    private refreshVisibleTypeItems(): void {
        const list = this.typeList;
        if (!list) {
            return;
        }

        for (let childIndex = 0; childIndex < list.numChildren; childIndex++) {
            const item = list.getChildAt(childIndex) as Laya.GWidget;
            const itemIndex = this.getRenderedItemIndex(item, -1);
            if (itemIndex < 0) {
                continue;
            }
            this.renderTypeItem(item, this.itemTypes[itemIndex] ?? "", false);
        }
    }

    private refreshVisibleBagItems(): void {
        const list = this.bagList;
        const visibleItems = this.visibleBagItems;
        if (!list) {
            return;
        }

        for (let childIndex = 0; childIndex < list.numChildren; childIndex++) {
            const item = list.getChildAt(childIndex) as Laya.GWidget;
            const itemIndex = this.getRenderedItemIndex(item, -1);
            if (itemIndex < 0) {
                continue;
            }
            this.renderItem(item, visibleItems[itemIndex] ?? null, false);
        }
    }

    private get visibleBagItems(): InventoryItem[] {
        const type = this.itemTypes[this.selectedTypeIndex];
        return this.bagItems.filter((item) => item.type === type);
    }

    private refreshDetail(): void {
        if (!this.detailText) {
            return;
        }

        const item = this.visibleBagItems[this.selectedBagIndex] ?? null;
        this.detailText.text = item?.detail ?? "";
    }

    private onBagListClick(): void {
        const index = this.getBagIndexByStagePoint(Laya.stage.mouseX, Laya.stage.mouseY);
        if (index < 0 || index >= this.visibleBagItems.length) {
            return;
        }

        this.selectBagItem(index);
    }

    private onTypeListClick(): void {
        const index = this.getTypeIndexByStagePoint(Laya.stage.mouseX, Laya.stage.mouseY);
        if (index < 0 || index >= this.itemTypes.length) {
            return;
        }

        this.selectType(index);
    }

    private renderTypeItem(item: Laya.GWidget, label: string, selected: boolean): void {
        item.mouseEnabled = true;

        const highlight = item.getChildByName("Highlight") as Laya.Sprite | null;
        if (highlight) {
            highlight.visible = selected;
            highlight.graphics.clear();
            highlight.graphics.drawRect(0, 0, item.width, item.height, "rgba(0,0,0,0)", "#f1df8a", 4);
        }

        const text = item.getChildByName("Text") as Laya.Text | null;
        if (text) {
            text.text = label;
        }
    }

    private renderItem(item: Laya.GWidget, data: InventoryItem | null, selected: boolean): void {
        item.mouseEnabled = true;

        const highlight = item.getChildByName("Highlight") as Laya.Sprite | null;
        if (highlight) {
            highlight.visible = selected;
            highlight.graphics.clear();
            highlight.graphics.drawRect(0, 0, item.width, item.height, "rgba(0,0,0,0)", "#f1df8a", 4);
        }

        const text = item.getChildByName("Text") as Laya.Text | null;
        if (text) {
            text.text = data?.name ?? "";
        }

        this.renderEquippedBy(item, data?.equippedBy ?? "");
    }

    private setupTypeSelectionFrame(): void {
        const list = this.typeList;
        const parent = list?.parent as Laya.Sprite | null;
        if (!list || !parent || this.typeSelectionFrame) {
            return;
        }

        this.typeSelectionFrame = new Laya.Sprite();
        this.typeSelectionFrame.name = "TypeSelectionFrame";
        this.typeSelectionFrame.mouseEnabled = false;
        parent.addChild(this.typeSelectionFrame);
    }

    private refreshTypeSelectionFrame(): void {
        const list = this.typeList;
        const frame = this.typeSelectionFrame;
        if (!list || !frame || this.selectedTypeIndex < 0 || this.selectedTypeIndex >= this.itemTypes.length) {
            if (frame) {
                frame.visible = false;
            }
            return;
        }

        const columns = this.getTypeListColumns();
        const row = Math.floor(this.selectedTypeIndex / columns);
        const column = this.selectedTypeIndex % columns;
        frame.x = list.x + column * this.typeItemWidth;
        frame.y = list.y + row * this.typeItemHeight;
        frame.width = this.typeItemWidth;
        frame.height = this.typeItemHeight;
        frame.visible = true;
        frame.graphics.clear();
        frame.graphics.drawRect(0, 0, this.typeItemWidth, this.typeItemHeight, "rgba(0,0,0,0)", "#f1df8a", 4);
    }

    private getTypeIndexByStagePoint(stageX: number, stageY: number): number {
        const list = this.typeList;
        if (!list) {
            return -1;
        }

        const local = list.globalToLocal(new Laya.Point(stageX, stageY), true);
        const x = local.x;
        const y = local.y;
        if (x < 0 || y < 0 || x >= list.width || y >= list.height) {
            return -1;
        }

        const column = Math.floor(x / this.typeItemWidth);
        const row = Math.floor(y / this.typeItemHeight);
        if (column < 0 || column >= this.getTypeListColumns()) {
            return -1;
        }

        return row * this.getTypeListColumns() + column;
    }

    private getTypeListColumns(): number {
        const width = this.typeList?.width ?? this.typeItemWidth;
        return Math.max(1, Math.floor(width / this.typeItemWidth));
    }

    private setupBagSelectionFrame(): void {
        const list = this.bagList;
        const parent = list?.parent as Laya.Sprite | null;
        if (!list || !parent || this.bagSelectionFrame) {
            return;
        }

        this.bagSelectionFrame = new Laya.Sprite();
        this.bagSelectionFrame.name = "BagSelectionFrame";
        this.bagSelectionFrame.mouseEnabled = false;
        this.bagSelectionFrame.visible = false;
        parent.addChild(this.bagSelectionFrame);
    }

    private refreshBagSelectionFrame(): void {
        const list = this.bagList;
        const frame = this.bagSelectionFrame;
        if (!list || !frame || this.selectedBagIndex < 0 || this.selectedBagIndex >= this.visibleBagItems.length) {
            if (frame) {
                frame.visible = false;
            }
            return;
        }

        const columns = this.getBagListColumns();
        const scrollY = list.scroller?.posY ?? 0;
        const row = Math.floor(this.selectedBagIndex / columns);
        const column = this.selectedBagIndex % columns;
        frame.x = list.x + column * this.bagItemWidth;
        frame.y = list.y + row * this.bagItemHeight - scrollY;
        frame.width = this.bagItemWidth;
        frame.height = this.bagItemHeight;
        frame.visible = frame.y + this.bagItemHeight > list.y && frame.y < list.y + list.height;
        frame.graphics.clear();
        frame.graphics.drawRect(0, 0, this.bagItemWidth, this.bagItemHeight, "rgba(0,0,0,0)", "#f1df8a", 4);
    }

    private getBagIndexByStagePoint(stageX: number, stageY: number): number {
        const list = this.bagList;
        if (!list) {
            return -1;
        }

        const local = list.globalToLocal(new Laya.Point(stageX, stageY), true);
        const scrollY = list.scroller?.posY ?? 0;
        const x = local.x;
        const y = local.y + scrollY;
        if (x < 0 || y < 0 || x >= list.width) {
            return -1;
        }

        const column = Math.floor(x / this.bagItemWidth);
        const row = Math.floor(y / this.bagItemHeight);
        if (column < 0 || column >= this.getBagListColumns()) {
            return -1;
        }

        return row * this.getBagListColumns() + column;
    }

    private getBagListColumns(): number {
        const width = this.bagList?.width ?? this.bagItemWidth;
        return Math.max(1, Math.floor(width / this.bagItemWidth));
    }

    private renderEquippedBy(item: Laya.GWidget, equippedBy: string): void {
        const ownerList = this.findFirstChildList(item);
        if (ownerList) {
            ownerList.itemRenderer = (_index: number, ownerItem: Laya.GWidget) => {
                const text = ownerItem.getChildByName("Text") as Laya.Text | null;
                if (text) {
                    text.text = equippedBy;
                }
            };
            ownerList.numItems = equippedBy ? 1 : 0;
            return;
        }

        const ownerText = item.getChildByName("Text_1") as Laya.Text | null;
        if (ownerText) {
            ownerText.text = equippedBy;
            ownerText.visible = equippedBy.length > 0;
        }
    }

    private findNode(root: Laya.Node, name: string): Laya.Node | null {
        if (root.name === name) {
            return root;
        }

        for (let i = 0; i < root.numChildren; i++) {
            const result = this.findNode(root.getChildAt(i), name);
            if (result) {
                return result;
            }
        }

        return null;
    }

    private setRenderedItemIndex(item: Laya.GWidget, index: number): void {
        (item as any).__warehouseItemIndex = index;
    }

    private getRenderedItemIndex(item: Laya.GWidget, fallbackIndex: number): number {
        const index = (item as any).__warehouseItemIndex;
        return typeof index === "number" ? index : fallbackIndex;
    }

    private findFirstChildList(root: Laya.Node): Laya.GList | null {
        for (let i = 0; i < root.numChildren; i++) {
            const child = root.getChildAt(i);
            if (child instanceof Laya.GList) {
                return child;
            }
        }

        return null;
    }
}
