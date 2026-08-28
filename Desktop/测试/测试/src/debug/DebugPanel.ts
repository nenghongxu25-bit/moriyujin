import { DebugActionsController, type DebugActionItem } from "./DebugActionsController";

const { regClass } = Laya;

interface DebugScopeItem {
    id: string;
    label: string;
}

interface DebugTypeItem {
    id: string;
    label: string;
}


@regClass()
export class DebugPanel extends Laya.Script {
    private readonly actionsController: DebugActionsController = new DebugActionsController();
    private readonly scopeItems: DebugScopeItem[] = [
        { id: "global", label: "\u5168\u5c40" },
        { id: "cunzhuang", label: "cunzhuang" },
        { id: "forest", label: "forest" },
        { id: "mine", label: "mine" },
    ];

    private readonly typeItemsByScope: Record<string, DebugTypeItem[]> = {
        global: [
            { id: "player", label: "\u73a9\u5bb6" },
            { id: "inventory", label: "\u80cc\u5305" },
            { id: "warehouse", label: "\u4ed3\u5e93" },
            { id: "save", label: "\u5b58\u6863" },
            { id: "reward", label: "\u5956\u52b1" },
            { id: "platform", label: "\u5e73\u53f0" },
            { id: "integrity", label: "\u5b8c\u6574\u6027" },
            { id: "danger", label: "\u5371\u9669" },
        ],
        cunzhuang: [
            { id: "player", label: "\u73a9\u5bb6" },
            { id: "ui", label: "UI" },
            { id: "warehouse", label: "\u4ed3\u5e93" },
            { id: "crafting", label: "\u5236\u4f5c" },
            { id: "map", label: "\u5730\u56fe" },
            { id: "death", label: "\u6b7b\u4ea1" },
        ],
        forest: [
            { id: "player", label: "\u73a9\u5bb6" },
            { id: "move", label: "\u79fb\u52a8" },
            { id: "combat", label: "\u6218\u6597" },
            { id: "harvest", label: "\u91c7\u96c6" },
            { id: "inventory", label: "\u80cc\u5305" },
            { id: "extract", label: "\u5e26\u51fa" },
        ],
        mine: [
            { id: "player", label: "\u73a9\u5bb6" },
            { id: "move", label: "\u79fb\u52a8" },
            { id: "combat", label: "\u6218\u6597" },
            { id: "mining", label: "\u6316\u77ff" },
            { id: "inventory", label: "\u80cc\u5305" },
            { id: "extract", label: "\u5e26\u51fa" },
        ],
    };

    private sceneListNode: Laya.Node | null = null;
    private typeListNode: Laya.Node | null = null;
    private debugListNode: Laya.Node | null = null;
    private selectedScopeId: string = "global";
    private selectedTypeId: string = "player";

    onAwake(): void {
        this.resolveBindings();
        this.refreshAll();
    }

    onEnable(): void {
        this.resolveBindings();
        this.refreshAll();
    }

    private resolveBindings(): void {
        const root = this.owner as Laya.Node;
        this.sceneListNode = this.sceneListNode || this.findChildByName(root, "scene");
        this.typeListNode = this.typeListNode || this.findChildByName(root, "type");
        this.debugListNode = this.debugListNode || this.findChildByName(root, "debug");
    }

    private refreshAll(): void {
        this.refreshSceneList();
        this.refreshTypeList();
        this.refreshDebugList();
    }

    private refreshSceneList(): void {
        this.renderList(this.sceneListNode, this.scopeItems.length, (index, node) => {
            this.renderSceneItem(this.scopeItems[index] || null, node);
        });
    }

    private refreshTypeList(): void {
        const items = this.getCurrentTypeItems();
        if (!items.some((item) => item.id === this.selectedTypeId)) {
            this.selectedTypeId = items[0]?.id || "";
        }

        this.renderList(this.typeListNode, items.length, (index, node) => {
            this.renderTypeItem(items[index] || null, node);
        });
    }

    private refreshDebugList(): void {
        const items = this.getCurrentDebugActions();
        this.renderList(this.debugListNode, items.length, (index, node) => {
            this.renderDebugItem(items[index] || null, node);
        });
    }

    private renderSceneItem(item: DebugScopeItem | null, node: Laya.Node): void {
        this.setNodeVisible(node, !!item);
        if (!item) {
            return;
        }

        this.setFirstText(node, item.label);
        this.setNodeAlpha(node, item.id === this.selectedScopeId ? 1 : 0.65);

        const target = node as any;
        if (target && typeof target.off === "function" && typeof target.on === "function") {
            target.mouseEnabled = true;
            target.off(Laya.Event.CLICK, this, this.onSceneItemClick);
            target.on(Laya.Event.CLICK, this, this.onSceneItemClick, [item.id]);
        }
    }

    private onSceneItemClick(scopeId: string): void {
        this.selectedScopeId = scopeId;
        this.selectedTypeId = this.getCurrentTypeItems()[0]?.id || "";
        console.info(`[DebugPanel] selected scope=${scopeId}`);
        this.refreshAll();
    }

    private renderTypeItem(item: DebugTypeItem | null, node: Laya.Node): void {
        this.setNodeVisible(node, !!item);
        if (!item) {
            return;
        }

        this.setFirstText(node, item.label);
        this.setNodeAlpha(node, item.id === this.selectedTypeId ? 1 : 0.65);

        const target = node as any;
        if (target && typeof target.off === "function" && typeof target.on === "function") {
            target.mouseEnabled = true;
            target.off(Laya.Event.CLICK, this, this.onTypeItemClick);
            target.on(Laya.Event.CLICK, this, this.onTypeItemClick, [item.id]);
        }
    }

    private onTypeItemClick(typeId: string): void {
        this.selectedTypeId = typeId;
        console.info(`[DebugPanel] selected type=${typeId}`);
        this.refreshTypeList();
        this.refreshDebugList();
    }

    private getCurrentTypeItems(): DebugTypeItem[] {
        return this.typeItemsByScope[this.selectedScopeId] || [];
    }

    private renderDebugItem(item: DebugActionItem | null, node: Laya.Node): void {
        this.setNodeVisible(node, !!item);
        if (!item) {
            return;
        }

        this.setFirstText(node, item.label);
        this.setNodeAlpha(node, 1);

        const target = node as any;
        if (target && typeof target.off === "function" && typeof target.on === "function") {
            target.mouseEnabled = true;
            target.off(Laya.Event.CLICK, this, this.onDebugItemClick);
            target.on(Laya.Event.CLICK, this, this.onDebugItemClick, [item.id]);
        }
    }

    private async onDebugItemClick(actionId: string): Promise<void> {
        const action = this.getCurrentDebugActions().find((item) => item.id === actionId);
        if (!action) {
            console.warn(`[DebugPanel] action missing: ${actionId}`);
            return;
        }

        try {
            console.info(`[DebugPanel] run action=${actionId}`);
            await action.run();
            console.info(`[DebugPanel] PASS ${action.label}`);
        } catch (error) {
            console.error(`[DebugPanel] FAIL ${action.label}`, error);
        }
    }

    private getCurrentDebugActions(): DebugActionItem[] {
        return this.actionsController.getActions(
            this.selectedScopeId,
            this.selectedTypeId
        );
    }
    private renderList(
        listNode: Laya.Node | null,
        count: number,
        renderer: (index: number, node: Laya.Node) => void
    ): void {
        const list = listNode as any;
        if (!list) {
            console.warn("[DebugPanel] scene list node missing");
            return;
        }

        if (!this.getTemplateNode(listNode)) {
            Laya.timer.callLater(this, () => this.renderList(listNode, count, renderer));
            return;
        }

        if ("itemRenderer" in list) {
            list.itemRenderer = (index: number, item: Laya.Node) => {
                renderer(index, item);
            };
        }

        if ("numItems" in list) {
            list.numItems = count;
        }

        if (typeof list.refresh === "function") {
            list.refresh(true);
        }

        Laya.timer.callLater(this, () => this.renderVisibleListItems(listNode, count, renderer));
    }

    private renderVisibleListItems(
        listNode: Laya.Node | null,
        count: number,
        renderer: (index: number, node: Laya.Node) => void
    ): void {
        const children = listNode && Array.isArray((listNode as any).children)
            ? ((listNode as any).children as Laya.Node[])
            : [];
        const templateNode = this.getTemplateNode(listNode);
        let dataIndex = 0;

        for (let i = 0; i < children.length && dataIndex < count; i++) {
            const node = children[i];
            if (!node || node === templateNode) {
                continue;
            }

            renderer(dataIndex, node);
            dataIndex++;
        }
    }

    private getTemplateNode(listNode: Laya.Node | null): Laya.Node | null {
        const list = listNode as any;
        const explicitTemplate = (list?._templateNode as Laya.Node | null)
            || (list?.templateNode as Laya.Node | null);
        if (explicitTemplate) {
            return explicitTemplate;
        }

        const children = listNode && Array.isArray((listNode as any).children)
            ? ((listNode as any).children as Laya.Node[])
            : [];
        return children[0] || null;
    }

    private setFirstText(root: Laya.Node | null, text: string): void {
        const textNode = this.findChildByType(root, "Text") as Laya.Text | null;
        if (textNode) {
            textNode.text = text;
        }
    }

    private findChildByName(root: Laya.Node | null, name: string): Laya.Node | null {
        if (!root) {
            return null;
        }

        if ((root as any).name === name) {
            return root;
        }

        const children = (root as any).children as Laya.Node[] | undefined;
        if (!children) {
            return null;
        }

        for (let i = 0; i < children.length; i++) {
            const found = this.findChildByName(children[i], name);
            if (found) {
                return found;
            }
        }

        return null;
    }

    private findChildByType(root: Laya.Node | null, typeName: string): Laya.Node | null {
        if (!root) {
            return null;
        }

        if ((root as any).constructor?.name === typeName || (root as any)._$type === typeName) {
            return root;
        }

        const children = (root as any).children as Laya.Node[] | undefined;
        if (!children) {
            return null;
        }

        for (let i = 0; i < children.length; i++) {
            const found = this.findChildByType(children[i], typeName);
            if (found) {
                return found;
            }
        }

        return null;
    }

    private setNodeVisible(node: Laya.Node | null, visible: boolean): void {
        const target = node as any;
        if (!target) {
            return;
        }

        if ("visible" in target) {
            target.visible = visible;
        }
        if ("active" in target) {
            target.active = visible;
        }
    }

    private setNodeAlpha(node: Laya.Node | null, alpha: number): void {
        const target = node as any;
        if (target && "alpha" in target) {
            target.alpha = alpha;
        }
    }
}
