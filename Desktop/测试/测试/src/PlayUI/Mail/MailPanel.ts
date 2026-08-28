const { regClass, property } = Laya;

import { glist } from "../CommonUI/glist";
import { listTemplate, type ListTemplateData } from "../CommonUI/listTemplate";

import { MailList } from "./MailList";
import { MailMessageController } from "./MailMessageController";
import type { MailListItemData } from "./MailTemplate";

import {
    MailManager,
    type PlayerMail,
    type MailAttachment
} from "../../systems/data/MailManager";
import { DataManager } from "../../systems/datamanager";


@regClass()
export class MailPanel extends Laya.Script {

    @property(Laya.Node)
    public mailListNode: Laya.Node | null = null;

    @property(Laya.Node)
    public rewardListNode: Laya.Node | null = null;

    @property(Laya.Text)
    public detailText: Laya.Text | null = null;

    @property(Laya.Node)
    public getRewardButton: Laya.Node | null = null;

    @property(Laya.Node)
    public rewardTargetNode: Laya.Node | null = null;


    @property(Laya.Text)
    public messageText: Laya.Text | null = null;


    private mailList: MailList | null = null;

    private rewardList: glist | null = null;

    private currentMailId: string = "";
    private readonly messageController: MailMessageController = new MailMessageController(
        () => this.messageText,
        (node: Laya.Node | null, shown: boolean) => this.setNodeShown(node, shown)
    );

    private readonly onMailChanged =
        (): void => {

            this.refreshMailList();
        };


    onAwake(): void {

        this.bindControllers();

        this.bindButtons();

        MailManager
            .getInstance()
            .addChangeListener(
                this.onMailChanged
            );


        // 开发阶段：
        // 自动加入欢迎邮件 + 测试奖励邮件
        MailManager
            .getInstance()
            .ensureDefaultMails();


        this.refreshMailList();

        this.clearDetail();
    }


    onEnable(): void {

        this.bindControllers();

        this.bindButtons();

        MailManager
            .getInstance()
            .addChangeListener(
                this.onMailChanged
            );

        this.refreshMailList();


        if (this.currentMailId) {

            this.openMail(
                this.currentMailId
            );
        }
    }


    onDisable(): void {

        this.messageController.clearTimers();

        MailManager
            .getInstance()
            .removeChangeListener(
                this.onMailChanged
            );

        this.unbindButtons();
    }


    onDestroy(): void {

        this.messageController.clearTimers();

        MailManager
            .getInstance()
            .removeChangeListener(
                this.onMailChanged
            );

        this.unbindButtons();


        if (this.mailList) {

            this.mailList.onMailClick =
                null;
        }


        this.mailList =
            null;

        this.rewardList =
            null;
    }


    // =========================
    // 找到两个 List
    // =========================

    private bindControllers(): void {

        this.mailList =
            this.mailListNode
                ? this.mailListNode.getComponent(
                    MailList
                )
                : null;


        this.rewardList =
            this.rewardListNode
                ? this.rewardListNode.getComponent(
                    glist
                )
                : null;


        if (this.mailList) {

            this.mailList.onMailClick =
                this.onMailClick;
        }
    }


    // =========================
    // 绑定领取按钮
    // =========================

    private bindButtons(): void {

        if (!this.getRewardButton) {
            return;
        }


        this.getRewardButton.off(
            Laya.Event.CLICK,
            this,
            this.onGetRewardClick
        );


        this.getRewardButton.on(
            Laya.Event.CLICK,
            this,
            this.onGetRewardClick
        );
    }


    private unbindButtons(): void {

        if (!this.getRewardButton) {
            return;
        }


        this.getRewardButton.off(
            Laya.Event.CLICK,
            this,
            this.onGetRewardClick
        );
    }


    // =========================
    // 刷新左边邮件列表
    // =========================

    public refreshMailList(): void {

        if (!this.mailList) {
            return;
        }


        const mails =
            MailManager
                .getInstance()
                .getMails();


        const listData:
            MailListItemData[] =
            mails.map((mail) => {

                const hasReward =
                    Array.isArray(
                        mail.attachments
                    )
                    &&
                    mail.attachments.length > 0;


                return {

                    mailId:
                        mail.id,

                    title:
                        mail.title,

                    createdAt:
                        mail.createdAt,

                    isRead:
                        mail.isRead,

                    isClaimed:
                        mail.isClaimed,

                    hasReward:
                        hasReward
                };
            });


        this.mailList.setSlotCount(
            Math.max(
                10,
                listData.length
            )
        );


        this.mailList.setItems(
            listData
        );
    }


    // =========================
    // 点击左边某封邮件
    // =========================

    private onMailClick =
        (
            item:
                MailListItemData
        ): void => {

            if (!item.mailId) {
                return;
            }


            this.openMail(
                item.mailId
            );
        };


    // =========================
    // 打开邮件
    // =========================

    private openMail(
        mailId: string
    ): void {

        const manager =
            MailManager.getInstance();


        const mail =
            manager.getMail(
                mailId
            );


        if (!mail) {

            this.clearDetail();

            return;
        }


        // 当前正在看这封邮件
        this.currentMailId =
            mail.id;


        // 真正打开以后标记已读
        manager.markRead(
            mail.id
        );


        // 正文
        this.showDetailText(
            mail.content
        );


        // 奖励附件
        this.showRewards(
            mail.attachments
        );
        this.hideMessageText();


        // 右侧按钮状态
        this.renderMailState(
            mail
        );


        // 左边已读状态同步
        this.refreshMailList();
    }


    // =========================
    // 判断右边状态
    // =========================

    private renderMailState(
        mail:
            PlayerMail
    ): void {

        const hasReward =
            Array.isArray(
                mail.attachments
            )
            &&
            mail.attachments.length > 0;


        // -------------------------
        // 没奖励
        // -------------------------

        if (!hasReward) {

            if (this.getRewardButton) {

                this.setNodeShown(
                    this.getRewardButton,
                    false
                );
            }


            if (this.rewardTargetNode) {

                this.setNodeShown(
                    this.rewardTargetNode,
                    false
                );
            }


            this.setRewardClaimedShown(
                false
            );


            return;
        }


        // -------------------------
        // 有奖励，已领取
        // -------------------------

        if (mail.isClaimed) {

            if (this.getRewardButton) {

                this.setNodeShown(
                    this.getRewardButton,
                    false
                );
            }


            if (this.rewardTargetNode) {

                this.setNodeShown(
                    this.rewardTargetNode,
                    true
                );
            }


            this.setRewardClaimedShown(
                true
            );


            return;
        }


        // -------------------------
        // 有奖励，未领取
        // -------------------------

        if (this.getRewardButton) {

            this.setNodeShown(
                this.getRewardButton,
                true
            );
        }


        if (this.rewardTargetNode) {

            this.setNodeShown(
                this.rewardTargetNode,
                false
            );
        }


        this.setRewardClaimedShown(
            false
        );
    }


    // =========================
    // 点击领取奖励
    // =========================

    private onGetRewardClick(): void {

        if (!this.currentMailId) {
            return;
        }


        const manager =
            MailManager.getInstance();


        const mail =
            manager.getMail(
                this.currentMailId
            );


        if (!mail) {
            return;
        }


        if (mail.isClaimed) {
            return;
        }


        if (
            !mail.attachments
            ||
            mail.attachments.length === 0
        ) {
            return;
        }


        // =====================================
        // 后面这里再接 InventoryManager
        //
        // 把 attachments 真正加入玩家背包
        // =====================================


        const dataManager =
            DataManager.getInstance();


        if (
            !dataManager.canGrantItemsToWarehouse(
                mail.attachments
            )
        ) {

            this.showMessageText(
                "仓库已满，请清理仓库"
            );
            return;
        }


        if (
            !dataManager.grantItemsToWarehouse(
                mail.attachments
            )
        ) {

            this.showMessageText(
                "仓库已满，请清理仓库"
            );
            return;
        }


        const rewardMessage =
            this.buildRewardClaimMessage(
                mail.attachments
            );


        const success =
            manager.markClaimed(
                mail.id
            );


        if (!success) {
            return;
        }


        this.showMessageText(
            rewardMessage
        );


        const updatedMail =
            manager.getMail(
                mail.id
            );


        if (!updatedMail) {
            return;
        }


        // 重新显示右边状态
        this.renderMailState(
            updatedMail
        );


        // 刷新左边已处理状态
        this.refreshMailList();
    }


    // =========================
    // 显示邮件正文
    // =========================

    private showDetailText(
        value: string
    ): void {

        if (!this.detailText) {
            return;
        }


        this.detailText.text =
            String(
                value || ""
            );
    }


    // =========================
    // 显示奖励物品
    // =========================

    private showRewards(
        attachments:
            MailAttachment[]
    ): void {

        if (!this.rewardList) {
            return;
        }


        const listData:
            ListTemplateData[] =
            (attachments || [])
                .map(
                    (item) => ({

                        itemId:
                            item.itemId,

                        name:
                            item.name,

                        count:
                            item.count,

                        icon:
                            item.icon
                    })
                );


        this.rewardList.setSlotCount(
            listData.length
        );


        this.rewardList.setItems(
            listData
        );

    }


    private buildRewardClaimMessage(
        attachments:
            MailAttachment[]
    ): string {

        const rewardText =
            (attachments || [])
                .filter(
                    (item) =>
                        !!item
                        &&
                        !!item.itemId
                        &&
                        Number.isFinite(
                            item.count
                        )
                        &&
                        item.count > 0
                )
                .map(
                    (item) =>
                        `${item.name || item.itemId}*${Math.max(
                            1,
                            Math.floor(
                                item.count
                            )
                        )}`
                )
                .join(
                    "\uff0c"
                );


        return rewardText
            ? `\u83b7\u5f97${rewardText}`
            : "\u83b7\u5f97\u5956\u52b1";
    }


    // =========================
    // 没选中邮件
    // =========================

    private clearDetail(): void {

        this.currentMailId =
            "";


        this.showDetailText(
            ""
        );


        if (this.rewardList) {

            this.rewardList.setItems(
                []
            );
        }


        if (this.getRewardButton) {

            this.setNodeShown(
                this.getRewardButton,
                false
            );
        }


        if (this.rewardTargetNode) {

            this.setNodeShown(
                this.rewardTargetNode,
                false
            );
        }


        this.setRewardClaimedShown(
            false
        );
        this.hideMessageText();
    }


    private showMessageText(
        message: string
    ): void {

        this.messageController.show(
            message
        );
    }


    private hideMessageText(): void {

        this.messageController.hide();
    }

    private setRewardClaimedShown(
        shown: boolean
    ): void {

        this.applyRewardClaimedShown(
            shown
        );


        Laya.timer.callLater(
            this,
            () => this.applyRewardClaimedShown(
                shown
            )
        );
    }


    private applyRewardClaimedShown(
        shown: boolean
    ): void {

        const rewardRoot =
            this.rewardListNode ||
            ((this.rewardList as any)?.listNode as Laya.Node | null) ||
            ((this.rewardList as any)?.owner as Laya.Node | null) ||
            null;

        const children =
            rewardRoot && Array.isArray((rewardRoot as any).children)
                ? ((rewardRoot as any).children as Laya.Node[])
                : [];

        const templateNode =
            (this.rewardList as any)?.templateNode as Laya.Node | null;

        for (let i = 0; i < children.length; i++) {

            const slotNode =
                children[i];

            if (
                !slotNode ||
                slotNode === templateNode
            ) {
                continue;
            }


            const template =
                slotNode.getComponent(
                    listTemplate
                );

            const data =
                template ? template.getBoundData() : null;

            const claimedNode =
                this.findDirectChildByName(
                    slotNode,
                    "Sprite"
                );

            this.setNodeShown(
                claimedNode,
                shown && !!data
            );
        }
    }


    private findDirectChildByName(
        node: Laya.Node | null,
        name: string
    ): Laya.Node | null {

        const children =
            node && Array.isArray((node as any).children)
                ? ((node as any).children as Laya.Node[])
                : [];

        for (let i = 0; i < children.length; i++) {

            const child =
                children[i] as any;

            if (
                child &&
                child.name === name
            ) {
                return child as Laya.Node;
            }
        }


        return null;
    }


    private setNodeShown(
        node: Laya.Node | null,
        shown: boolean
    ): void {

        const target =
            node as any;

        if (!target) {
            return;
        }


        if ("active" in target) {

            target.active =
                shown;
        }


        if ("visible" in target) {

            target.visible =
                shown;
        }
    }
}
