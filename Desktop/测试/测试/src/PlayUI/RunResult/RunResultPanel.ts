const { regClass } = Laya;

import { glist } from "../CommonUI/glist";
import type { ListTemplateData } from "../CommonUI/listTemplate";
import { DataManager, type InventorySlotItem } from "../../systems/datamanager";
import { RunSessionManager, type RunSessionSnapshot } from "../../systems/run/RunSessionManager";

export interface RunResultSnapshot extends RunSessionSnapshot {
    lootItems: ListTemplateData[];
}

@regClass()
export class RunResultPanel extends Laya.Script {
    private static installed: boolean = false;
    private static panels: RunResultPanel[] = [];

    private titleText: Laya.Text | null = null;
    private timeText: Laya.Text | null = null;
    private killText: Laya.Text | null = null;
    private lootList: glist | null = null;

    public static installAutoBind(): void {
        if (RunResultPanel.installed) {
            return;
        }

        RunResultPanel.installed = true;
        Laya.timer.loop(500, RunResultPanel, RunResultPanel.bindPanelsInStage);
        Laya.timer.once(0, RunResultPanel, RunResultPanel.bindPanelsInStage);
    }

    public static showSuccess(autoCloseMs: number = 0, onClosed?: () => void): boolean {
        return RunResultPanel.show(RunResultPanel.createSnapshot(true), autoCloseMs, onClosed);
    }

    public static showFailed(autoCloseMs: number = 0, onClosed?: () => void): boolean {
        return RunResultPanel.show(RunResultPanel.createSnapshot(false), autoCloseMs, onClosed);
    }

    public static show(snapshot: RunResultSnapshot, autoCloseMs: number = 0, onClosed?: () => void): boolean {
        RunResultPanel.bindPanelsInStage();

        const panel = RunResultPanel.panels.length > 0
            ? RunResultPanel.panels[RunResultPanel.panels.length - 1]
            : null;

        if (!panel) {
            return false;
        }

        panel.render(snapshot);
        panel.setShown(true);

        if (autoCloseMs > 0) {
            Laya.timer.clear(panel, panel.closeAndNotify);
            Laya.timer.once(autoCloseMs, panel, panel.closeAndNotify, [onClosed]);
        }

        return true;
    }

    onAwake(): void {
        this.bindNodes();
        this.registerPanel();
        this.setShown(false);
    }

    onEnable(): void {
        this.bindNodes();
        this.registerPanel();
    }

    onDisable(): void {
        Laya.timer.clear(this, this.closeAndNotify);
    }

    onDestroy(): void {
        Laya.timer.clear(this, this.closeAndNotify);
        const index = RunResultPanel.panels.indexOf(this);
        if (index >= 0) {
            RunResultPanel.panels.splice(index, 1);
        }
    }

    public render(snapshot: RunResultSnapshot): void {
        this.bindNodes();

        if (this.titleText) {
            this.titleText.text = snapshot.success ? "\u64a4\u79bb\u6210\u529f" : "\u64a4\u79bb\u5931\u8d25";
            this.titleText.color = snapshot.success ? "#50901e" : "#c93826";
        }

        if (this.timeText) {
            this.timeText.text = "\u672c\u6b21\u63a2\u7d22\u65f6\u95f4\uff1a" + this.formatElapsed(snapshot.elapsedMs);
        }

        if (this.killText) {
            this.killText.text = "\u672c\u6b21\u63a2\u7d22\u7d2f\u8ba1\u51fb\u8d25\u654c\u4eba\uff1a"
                + Math.max(0, Math.floor(snapshot.kills))
                + "\u4e2a";
        }

        if (this.lootList) {
            const items = this.toListData(snapshot);
            this.lootList.selectionEnabled = false;
            this.lootList.setSlotCount(Math.max(20, items.length));
            this.lootList.setItems(items);
        }
    }

    public setShown(shown: boolean): void {
        const owner = this.owner as any;
        if (!owner) {
            return;
        }

        if ("visible" in owner) {
            owner.visible = shown;
        }

        if ("active" in owner) {
            owner.active = shown;
        }

        if ("mouseEnabled" in owner) {
            owner.mouseEnabled = shown;
        }

        if ("mouseThrough" in owner) {
            owner.mouseThrough = !shown;
        }

        if ("zOrder" in owner) {
            owner.zOrder = shown ? 10000 : owner.zOrder;
        }
    }

    private static createSnapshot(success: boolean): RunResultSnapshot {
        const session = RunSessionManager.getInstance().createSnapshot(success);
        return {
            ...session,
            lootItems: RunResultPanel.resolveLootItems(),
        };
    }

    private static resolveLootItems(): ListTemplateData[] {
        const snapshot = DataManager.getInstance().getInventorySnapshot("active");
        const items = Array.isArray(snapshot) ? snapshot : [];
        const result: ListTemplateData[] = [];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item || item.count <= 0) {
                continue;
            }

            result.push(RunResultPanel.resolveItem(item));
        }

        return result;
    }

    private static resolveItem(item: InventorySlotItem): ListTemplateData {
        const dataManager = DataManager.getInstance();
        const itemId = String(item?.itemId || "");
        const meta = itemId ? dataManager.resolveItemMeta(itemId) : null;

        return {
            itemId: itemId || undefined,
            name: meta?.displayName || item?.name || itemId || "\u672a\u77e5\u7269\u54c1",
            count: Math.max(1, Math.floor(item?.count || 1)),
            icon: item?.icon || meta?.icon || (itemId ? dataManager.resolveFallbackIcon(itemId) : undefined),
        };
    }

    private static bindPanelsInStage(): void {
        const stage = Laya.stage as Laya.Node | null;
        if (!stage) {
            return;
        }

        const nodes = RunResultPanel.findNodesByName(stage, "jiesuan");
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (!node || node.destroyed || node.getComponent(RunResultPanel)) {
                continue;
            }

            node.addComponent(RunResultPanel);
        }
    }

    private static findNodesByName(root: Laya.Node, name: string): Laya.Node[] {
        const result: Laya.Node[] = [];
        RunResultPanel.visitNodes(root, (node) => {
            if (node.name === name) {
                result.push(node);
            }
        });
        return result;
    }

    private static visitNodes(root: Laya.Node | null, visitor: (node: Laya.Node) => void): void {
        if (!root) {
            return;
        }

        visitor(root);
        const count = root.numChildren || 0;
        for (let i = 0; i < count; i++) {
            RunResultPanel.visitNodes(root.getChildAt(i), visitor);
        }
    }

    private bindNodes(): void {
        const root = this.owner as Laya.Node | null;
        if (!root) {
            return;
        }

        this.titleText = (this.findChildByName(root, "resultTitle")
            || this.findChildByName(root, "Text")) as Laya.Text | null;
        this.timeText = (this.findChildByName(root, "timeText")
            || this.findChildByName(root, "Text_1")) as Laya.Text | null;
        this.killText = (this.findChildByName(root, "killText")
            || this.findChildByName(root, "Text_3")) as Laya.Text | null;

        const listNode = this.findChildByName(root, "lootList")
            || this.findChildByName(root, "list");
        this.lootList = listNode ? listNode.getComponent(glist) : null;

        if (listNode && !this.lootList) {
            this.lootList = listNode.addComponent(glist);
        }

        if (this.lootList && listNode) {
            this.lootList.listNode = listNode;
            this.lootList.templateNode = this.findChildByName(listNode, "boxmodule");
        }
    }

    private registerPanel(): void {
        if (RunResultPanel.panels.indexOf(this) < 0) {
            RunResultPanel.panels.push(this);
        }
    }

    private toListData(snapshot: RunResultSnapshot): Array<ListTemplateData | null> {
        const result: Array<ListTemplateData | null> = [];

        for (let i = 0; i < snapshot.lootItems.length; i++) {
            const item = snapshot.lootItems[i];
            result.push({
                itemId: item.itemId,
                name: item.name,
                count: item.count,
                icon: item.icon,
            });
        }

        return result;
    }

    private formatElapsed(elapsedMs: number): string {
        const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return String(minutes) + "\u5206\u949f" + String(seconds) + "\u79d2";
    }

    private closeAndNotify(onClosed?: () => void): void {
        this.setShown(false);
        if (onClosed) {
            onClosed();
        }
    }

    private findChildByName(root: Laya.Node | null, name: string): Laya.Node | null {
        if (!root) {
            return null;
        }

        if (root.name === name) {
            return root;
        }

        const count = root.numChildren || 0;
        for (let i = 0; i < count; i++) {
            const found = this.findChildByName(root.getChildAt(i), name);
            if (found) {
                return found;
            }
        }

        return null;
    }
}
