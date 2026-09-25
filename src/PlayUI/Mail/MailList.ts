const { regClass, property } = Laya;

import {
    MailTemplate,
    type MailListItemData
} from "./MailTemplate";


export type MailClickHandler =
    (
        mail:
            MailListItemData
    ) => void;


@regClass()
export class MailList
    extends Laya.Script {

    @property(Laya.Node)
    public listNode:
        Laya.Node | null = null;

    @property(Laya.Node)
    public templateNode:
        Laya.Node | null = null;

    @property(Number)
    public slotCount:
        number = 10;


    public onMailClick:
        MailClickHandler | null =
        null;


    private items:
        MailListItemData[] = [];


    private appliedSlotCount:
        number = -1;


    onAwake(): void {

        this.applySlotCount(true);

        this.refresh();
    }


    onEnable(): void {

        this.applySlotCount();

        this.refresh();
    }


    // =========================
    // 设置邮件列表
    // =========================

    public setItems(
        items:
            MailListItemData[]
            | null
            | undefined
    ): void {

        this.items =
            Array.isArray(items)
                ? items.slice()
                : [];

        this.refresh();
    }


    // =========================
    // 设置格子数量
    // =========================

    public setSlotCount(
        count: number
    ): void {

        this.slotCount =
            Number.isFinite(count)
                ? Math.max(
                    0,
                    Math.floor(count)
                )
                : 0;

        this.applySlotCount(true);

        this.refresh();
    }


    // =========================
    // 刷新列表
    // =========================

    public refresh(): void {

        this.applySlotCount();

        this.hideTemplateNode();


        const root =
            this.getListRoot();

        if (!root) {
            return;
        }


        const children =
            root.children || [];


        let dataIndex = 0;


        for (
            let i = 0;
            i < children.length;
            i++
        ) {

            const node =
                children[i] as Laya.Node;


            if (
                !node ||
                node === this.templateNode
            ) {
                continue;
            }


            const template =
                node.getComponent(
                    MailTemplate
                );


            if (!template) {
                continue;
            }


            const item =
                this.items[dataIndex]
                || null;


            template.bindData(item);


            // 有数据才允许点击
            const target =
                node as any;


            target.off(
                Laya.Event.CLICK,
                this,
                this.onSlotClick
            );


            if (item) {

                target.on(
                    Laya.Event.CLICK,
                    this,
                    this.onSlotClick,
                    [dataIndex]
                );
            }


            dataIndex++;
        }
    }


    // =========================
    // 点击邮件
    // =========================

    private onSlotClick(
        dataIndex: number
    ): void {

        const item =
            this.items[dataIndex];

        if (!item) {
            return;
        }


        if (this.onMailClick) {

            this.onMailClick(
                item
            );
        }
    }


    private getListRoot():
        Laya.Node | null {

        return this.listNode
            || this.owner
            || null;
    }


    private applySlotCount(
        force:
            boolean = false
    ): void {

        const root =
            this.getListRoot() as any;


        if (!root) {
            return;
        }


        const nextCount =
            Math.max(
                0,
                Math.floor(
                    this.slotCount
                )
            );


        if (
            !force &&
            this.appliedSlotCount
                === nextCount
        ) {
            return;
        }


        this.appliedSlotCount =
            nextCount;


        // GList
        if ("numItems" in root) {

            root.numItems =
                nextCount;
        }


        if (
            typeof root.refresh
                === "function"
        ) {

            root.refresh(true);
        }
    }


    private hideTemplateNode():
        void {

        const template =
            this.templateNode as any;


        if (
            template &&
            "visible" in template
        ) {

            template.visible =
                false;
        }
    }
}