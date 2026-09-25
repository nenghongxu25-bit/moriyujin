const { regClass, property } = Laya;

import type { ListTemplateData } from "../CommonUI/listTemplate";
import { CraftingItemBox } from "./CraftingItemBox";

@regClass()
export class CraftingItemList extends Laya.Script {
    @property(Laya.Node)
    public listNode: Laya.Node | null = null;

    @property(Laya.Node)
    public templateNode: Laya.Node | null = null;

    private items: ListTemplateData[] = [];

    onAwake(): void {
        this.resolveBindings();
    }

    public setItems(items: ListTemplateData[]): void {
        this.resolveBindings();
        this.items = Array.isArray(items) ? items.map((item) => ({ ...item })) : [];
        this.refresh();
    }

    private refresh(): void {
        const list = this.getListRoot() as any;
        if (!list) {
            return;
        }

        if ("itemRenderer" in list) {
            list.itemRenderer = (index: number, item: Laya.Node) => {
                this.renderItem(index, item);
            };
        }

        if ("numItems" in list) {
            list.numItems = this.items.length;
        }

        if (typeof list.refresh === "function") {
            list.refresh(true);
        }

        Laya.timer.callLater(this, this.renderVisibleItems);
    }

    private renderVisibleItems(): void {
        const list = this.getListRoot() as any;
        const children = list && Array.isArray(list.children) ? (list.children as Laya.Node[]) : [];
        let dataIndex = 0;
        for (let i = 0; i < children.length; i++) {
            const node = children[i];
            if (!node || node === this.getTemplateNode()) {
                continue;
            }

            this.renderItem(dataIndex, node);
            dataIndex++;
        }
    }

    private renderItem(index: number, node: Laya.Node): void {
        if (!node) {
            return;
        }

        const item = this.items[index] || null;
        this.setNodeVisible(node, !!item);
        let box = node.getComponent(CraftingItemBox);
        if (!box) {
            box = node.addComponent(CraftingItemBox);
        }
        box.bind(item);
    }

    private resolveBindings(): void {
        const list = this.getListRoot() as any;
        if (!this.templateNode && list) {
            this.templateNode = (list._templateNode as Laya.Node | null) || (list.templateNode as Laya.Node | null) || null;
        }
    }

    private getListRoot(): Laya.Node | null {
        return this.listNode || (this.owner as Laya.Node) || null;
    }

    private getTemplateNode(): Laya.Node | null {
        const list = this.getListRoot() as any;
        return this.templateNode || (list?._templateNode as Laya.Node | null) || (list?.templateNode as Laya.Node | null) || null;
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
