import { PlayerController } from "../../Player/PlayerController";
import { DataManager } from "../../systems/datamanager";
import type { ListTemplateData } from "../CommonUI/listTemplate";

export type BagPopupActionType = "use" | "split" | "discard";

export interface BagPopupAction {
    type: BagPopupActionType;
    label: string;
    itemId?: string;
    slotIndex?: number;
}

export class BagPopupController {
    private actions: BagPopupAction[] = [];

    public constructor(private readonly panel: any) {
    }

    public getBagItemActions(item: ListTemplateData, slotIndex: number): BagPopupAction[] {
        const itemId = String(item.itemId || "");
        const dataManager = DataManager.getInstance();
        const actions: BagPopupAction[] = [];

        if (dataManager.canUseItem(itemId)) {
            actions.push({ type: "use", label: "\u4f7f\u7528", itemId, slotIndex });
        }

        if (dataManager.canSplitActiveSlot(slotIndex)) {
            actions.push({ type: "split", label: "\u5bf9\u534a\u62c6\u5206", itemId, slotIndex });
        }

        actions.push({ type: "discard", label: "\u4e22\u5f03", itemId, slotIndex });
        return actions;
    }

    public show(actions: BagPopupAction[]): void {
        this.resolvePopupListNode();
        const popup = this.panel.popupListNode as any;
        if (!popup || actions.length <= 0) {
            return;
        }

        this.actions = actions.slice();
        this.setNodeVisible(this.panel.popupListNode, true);
        popup.mouseEnabled = true;

        if ("itemRenderer" in popup) {
            popup.itemRenderer = (index: number, node: Laya.Node) => {
                this.renderPopupActionItem(node, this.actions[index] || null);
            };
        }

        if ("numItems" in popup) {
            popup.numItems = this.actions.length;
        }

        if (typeof popup.refresh === "function") {
            popup.refresh(true);
        }

        this.renderVisiblePopupActionItems();
        Laya.timer.callLater(this, this.renderVisiblePopupActionItems);
    }

    public hide(): void {
        this.resolvePopupListNode();
        const popup = this.panel.popupListNode as any;
        if (!popup) {
            return;
        }

        if (Array.isArray(popup.children)) {
            for (let i = 0; i < popup.children.length; i++) {
                const child = popup.children[i] as any;
                if (child && typeof child.off === "function") {
                    child.off(Laya.Event.CLICK, this, this.onPopupActionClick);
                }
            }
        }

        this.setNodeVisible(this.panel.popupListNode, false);
        this.actions = [];
    }

    private renderVisiblePopupActionItems(): void {
        const popup = this.panel.popupListNode as any;
        if (!popup || !Array.isArray(popup.children)) {
            return;
        }

        const children = popup.children as Laya.Node[];
        const templateNode = this.getTemplateNode(this.panel.popupListNode);
        let actionIndex = 0;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (!child || child === templateNode) {
                continue;
            }

            this.renderPopupActionItem(child, this.actions[actionIndex] || null);
            actionIndex++;
        }
    }

    private renderPopupActionItem(node: Laya.Node, action: BagPopupAction | null): void {
        const child = node as any;
        if (!child) {
            return;
        }

        this.setNodeVisible(node, !!action);
        if (typeof child.off === "function") {
            child.off(Laya.Event.CLICK, this, this.onPopupActionClick);
        }

        if (!action) {
            return;
        }

        child.mouseEnabled = true;
        this.writePopupLabelRecursive(node, action.label);
        if (typeof child.on === "function") {
            child.on(Laya.Event.CLICK, this, this.onPopupActionClick, [action]);
        }
    }

    private onPopupActionClick = (action: BagPopupAction, event?: Laya.Event): void => {
        if (event && typeof event.stopPropagation === "function") {
            event.stopPropagation();
        }

        const dataManager = DataManager.getInstance();

        if (action.type === "discard" && Number.isFinite(action.slotIndex)) {
            dataManager.discardActiveSlot(action.slotIndex as number);
        } else if (action.type === "split" && Number.isFinite(action.slotIndex)) {
            dataManager.splitActiveSlot(action.slotIndex as number);
        } else if (action.type === "use" && Number.isFinite(action.slotIndex)) {
            if (dataManager.useActiveItemAtSlot(action.slotIndex as number)) {
                const stats = dataManager.getPlayerStats();
                PlayerController.activeInstance?.setHp(stats.currentHp, stats.maxHp);
            }
        }

        this.hide();
        this.panel.clearBagSelection();
        this.panel.refresh();
    };

    private writePopupLabelRecursive(node: Laya.Node | null, label: string): void {
        const target = node as any;
        if (!target) {
            return;
        }

        if ("visible" in target) {
            target.visible = true;
        }
        if ("active" in target) {
            target.active = true;
        }

        if ("text" in target) {
            target.text = label;
        }
        if ("title" in target) {
            target.title = label;
        }
        if ("label" in target) {
            target.label = label;
        }

        const children = target.children as Laya.Node[] | undefined;
        if (!children) {
            return;
        }

        for (let i = 0; i < children.length; i++) {
            this.writePopupLabelRecursive(children[i], label);
        }
    }

    private resolvePopupListNode(): void {
        if (!this.panel.popupListNode) {
            this.panel.popupListNode = this.findChildByNameInsensitive(this.panel.owner as Laya.Node, "popuplist");
        }
    }

    private getTemplateNode(listNode: Laya.Node | null): Laya.Node | null {
        const list = listNode as any;
        return list && "templateNode" in list
            ? (list.templateNode as Laya.Node | null)
            : null;
    }

    private findChildByNameInsensitive(root: Laya.Node | null, name: string): Laya.Node | null {
        if (!root) {
            return null;
        }

        const rootAny = root as any;
        const targetName = String(name || "").toLowerCase();
        if (String(rootAny.name || "").toLowerCase() === targetName) {
            return root;
        }

        const children = rootAny.children as Laya.Node[] | undefined;
        if (!children) {
            return null;
        }

        for (let i = 0; i < children.length; i++) {
            const found = this.findChildByNameInsensitive(children[i], name);
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
}