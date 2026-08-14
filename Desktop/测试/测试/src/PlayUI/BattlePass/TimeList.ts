const { regClass, property } = Laya;

import { TimeNode } from "./TimeNode";

@regClass()
export class BattlePassTimeList extends Laya.Script {
    @property(Laya.Node)
    public listNode: Laya.Node | null = null;

    @property(Laya.Node)
    public templateNode: Laya.Node | null = null;

    public onWeekClick: ((week: number) => void) | null = null;

    private weeks: number[] = [];
    private appliedCount: number = -1;

    onAwake(): void {
        this.refresh();
    }

    onEnable(): void {
        this.refresh();
    }

    public setItems(weeks: number[]): void {
        this.weeks = Array.isArray(weeks) ? weeks.slice() : [];
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
        const nextCount = Math.max(0, Math.floor(this.weeks.length));
        if (this.appliedCount !== nextCount) {
            this.appliedCount = nextCount;
            list.numItems = nextCount;
        }

        list.itemRenderer = (index: number, item: any): void => {
            const slotNode = item as Laya.Node | null;
            const week = this.weeks[index] ?? 0;
            const script = slotNode ? slotNode.getComponent(TimeNode) as TimeNode | null : null;

            if (script) {
                script.bindData(week);
            }

            this.bindClick(slotNode, week);
        };

        if (typeof list.refreshVirtualList === "function") {
            list.refreshVirtualList();
            return;
        }

        if (typeof list.refresh === "function") {
            list.refresh(true);
        }
    }

    private bindClick(node: Laya.Node | null, week: number): void {
        const target = node as any;
        if (!target || typeof target.on !== "function" || typeof target.off !== "function") {
            return;
        }

        target.off(Laya.Event.CLICK, this, this.handleClick);
        target.on(Laya.Event.CLICK, this, this.handleClick, [week]);
    }

    private handleClick(week: number): void {
        if (this.onWeekClick) {
            this.onWeekClick(week);
        }
    }
}