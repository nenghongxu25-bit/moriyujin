const { regClass, property } = Laya;

import { BattlePassTaskItem } from "./TaskNode";
import type { BattlePassTaskViewData } from "../../systems/data/BattlePassManager";

@regClass()
export class BattlePassTaskList extends Laya.Script {
    @property(Laya.Node)
    public listNode: Laya.Node | null = null;

    @property(Laya.Node)
    public templateNode: Laya.Node | null = null;

    private tasks: BattlePassTaskViewData[] = [];
    private appliedCount: number = -1;

    onAwake(): void {
        this.refresh();
    }

    onEnable(): void {
        this.refresh();
    }

    public setItems(tasks: BattlePassTaskViewData[]): void {
        this.tasks = Array.isArray(tasks) ? tasks.slice() : [];
        this.refresh();
    }

    public refresh(): void {
        const list = this.getList();
        if (!list) {
            return;
        }

        this.applyTemplate(list);
        this.bindItems(list);
    }

    private getList(): any {
        return this.listNode || (this.owner as Laya.Node) || null;
    }

    private applyTemplate(list: any): void {
        const templateNode = this.templateNode || this.findTemplateNode(list);
        const prefab = this.resolvePrefab(templateNode);

        if (prefab && list.itemTemplate !== prefab) {
            list.itemTemplate = prefab;
        }
    }

    private findTemplateNode(list: any): Laya.Node | null {
        const children = list?.children || [];
        for (const child of children) {
            if (child && (child as any).prefabUrl) {
                return child as Laya.Node;
            }
        }

        return this.templateNode;
    }

    private resolvePrefab(node: Laya.Node | null): any {
        const prefabUrl = node ? String((node as any).prefabUrl || "") : "";
        if (!prefabUrl) {
            return null;
        }

        const loader = Laya.loader as any;
        if (loader && typeof loader.getRes === "function") {
            return loader.getRes(prefabUrl) || null;
        }

        return null;
    }

    private bindItems(list: any): void {
        const nextCount = Math.max(0, Math.floor(this.tasks.length));
        if (this.appliedCount !== nextCount) {
            this.appliedCount = nextCount;
            list.numItems = nextCount;
        }

        list.itemRenderer = (index: number, item: any): void => {
            const slotNode = item as Laya.Node | null;
            const task = this.tasks[index] ?? null;
            const script = slotNode ? slotNode.getComponent(BattlePassTaskItem) as BattlePassTaskItem | null : null;

            if (script && task) {
                script.bindData(task);
            }
        };

        if (typeof list.refreshVirtualList === "function") {
            list.refreshVirtualList();
            return;
        }

        if (typeof list.refresh === "function") {
            list.refresh(true);
        }
    }
}