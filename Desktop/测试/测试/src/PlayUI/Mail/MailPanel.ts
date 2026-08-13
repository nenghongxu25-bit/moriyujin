const { regClass, property } = Laya;

import { glist } from "../Bag/BagList";
import { listTemplate } from "../Bag/listTemplate";
import type { ListTemplateData } from "../Bag/listTemplate";

import { MailList } from "./MailList";
import type { MailListItemData } from "./MailTemplate";

import {
    MailManager,
    type PlayerMail,
    type MailAttachment
} from "../../systems/data/MailManager";


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


    private mailList: MailList | null = null;

    private rewardList: glist | null = null;

    private currentMailId: string = "";


    onAwake(): void {

        this.bindControllers();

        this.bindButtons();


        // 闁诲孩顔栭崰鎺楀磻閹剧粯鐓曟繛鍡樺姇閻忓瓨淇婇娆戭槮闁崇粯鎸鹃崰濠冨緞瀹€鈧悰?
        // 闂備胶鍘ч〃搴㈢濠婂嫭鍙忛柍鍝勬噹缁€澶愭煟濡绲荤€殿喛娅曠换娑㈠幢閹邦剛浼囩紓浣筋嚙椤戝寮婚崶顒夋晩缂備焦锕╅崑?+ 婵犵數鍋炲娆擃敄閸儲鍎婃い鏍ㄧ〒闂勫嫰鏌″畵顔煎敪閿熺姵鈷戞い鎾楀啯鐏嗗┑?
        MailManager
            .getInstance()
            .ensureDefaultMails();


        this.refreshMailList();

        this.clearDetail();
    }


    onEnable(): void {

        this.bindControllers();

        this.bindButtons();

        this.refreshMailList();


        if (this.currentMailId) {

            this.openMail(
                this.currentMailId
            );
        }
    }


    onDisable(): void {

        this.unbindButtons();
    }


    onDestroy(): void {

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
    // 闂備胶鎳撻悘姘跺磿閹惰棄鏄ラ悘鐐插⒔閳绘棃鏌曢崼婵嗩伃闁?List
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
    // 缂傚倸鍊烽悞锕傚垂閻㈠憡鍋╅柣鎰靛墾缁憋綁鏌涢埄鍐炬當缂佹彃娼￠弻鐔虹矙濞嗙偓鈻堥梺?
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
    // 闂備礁鎲＄敮锟犲绩闁秴钃熷┑鐘插亞閸熷懘鏌ㄩ弴姘冲厡闁绘繂鐖煎娲敇瑜嶉弸娆愮箾閸℃劕鐏茬€规洘鑹捐灃闁告洍鏂侀崑?
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
    // 闂備胶绮崝妤呭箠閹捐鍚规い鏃傗拡閸熷懘鏌ㄩ弴姘冲厡闁绘繂鐖奸弻锛勪沪閹冾潓闂佹眹鍔嶇换鍫ュ蓟閸ヮ剦鏁婄紓浣癸供閸?
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
    // 闂備胶鎳撻悘姘跺箰閸濄儲顫曢柟杈鹃檮閻掕姤銇勯弮鍌滃笡妞?
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


        this.currentMailId =
            mail.id;


        // 闂備焦妞挎禍鐐哄窗閹伴偊鏁嗘繝濠傜墕缁犮儵鏌熼幆褏锛嶇痪鎹愵嚙闇夐柣姗嗗枛閸旀岸鏌熼绛嬫疁鐎殿喕绮欏畷鍫曨敂瀹ュ懏鏆柣搴ゎ潐閻℃洜浜搁鍫晪?
        manager.markRead(
            mail.id
        );


        // 婵犳鍠楃换鎰緤妤ｅ啫鍑?
        this.showDetailText(
            mail.content
        );


        // 濠电娀娼ч崐褰掓偋閺囩喐鍙忛柟鎯板Г閳锋棃鏌涢弴銊ょ凹妞?
        this.showRewards(
            mail.attachments
        );


        this.renderMailState(
            mail
        );


        this.refreshMailList();
    }


    // =========================
    // 闂備礁鎲＄敮鍥磹閺嶎厼钃熼柛銉墮閻鎮楅崷顓炐ラ柣婵嗙埣閺岋絽螣閸喚鍘梺?    // =========================

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
        // 婵犵數鍋涙径鍥焵椤掍礁澧繛鍫灦閺?        // -------------------------

        if (!hasReward) {

            if (this.getRewardButton) {

                this.getRewardButton.active =
                    false;
            }


            if (this.rewardTargetNode) {

                this.rewardTargetNode.active =
                    false;
            }


            return;
        }


        // -------------------------
        // 闂備礁鎼悧鍡浰囬鐐偓鍐ㄢ槈閵忕姷顦梺瑙勫絻椤戝洨绮堟径灞稿亾閻熺増鍟為柣鎿勭節閵嗗倿顢曢敃鈧惌?        // -------------------------

        if (mail.isClaimed) {

            if (this.getRewardButton) {

                this.getRewardButton.active =
                    false;
            }


            if (this.rewardTargetNode) {

                this.rewardTargetNode.active =
                    true;
            }


            return;
        }


        // -------------------------
        // 闂備礁鎼悧鍡浰囬鐐偓鍐ㄢ槈閵忕姷顦梺瑙勫絻椤戝洨绮堟径鎰厸闁割偒鍋傞柇顖涖亜閿濆骸浜扮€?        // -------------------------

        if (this.getRewardButton) {

            this.getRewardButton.active =
                true;
        }


        if (this.rewardTargetNode) {

            this.rewardTargetNode.active =
                false;
        }
    }


    // =========================
    // 闂備胶绮崝妤呭箠閹捐鍚规い鏃€鏋荤槐锝夋煕閳╁喚娈旂紒鎻掔仢閳规垿宕掑☉姘吂婵?
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
        // 闂備礁鎲￠懝楣冩煀閿濆拋鐒介柣妤€鐗婃禍銈嗙箾閸℃ɑ灏繛鍜冪節閺屾盯骞囬鍌傦綁鎮?InventoryManager
        //
        // 闂?attachments 闂備焦妞挎禍鐐哄窗閹伴偊鏁嗘繝濠傜墕缁€澶愭煟濡绲荤€殿喗濞婇弻锝呪攦閻愵剚鐝斿銈嗘煥缁夊綊骞婂Δ鍐ф勃闁芥ê顦卞Ο?
        // =====================================


        const success =
            manager.markClaimed(
                mail.id
            );


        if (!success) {
            return;
        }


        const updatedMail =
            manager.getMail(
                mail.id
            );


        if (!updatedMail) {
            return;
        }


        this.renderMailState(
            mail
        );


        this.refreshMailList();
    }


    // =========================
    // 闂備礁鎼€氼剚鏅舵禒瀣︽慨妯垮煐閻掕姤銇勯弮鍌滃笡妞ゆ劘濮ら幈銊モ攽閹惧墎蓱闂?
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
    // 闂備礁鎼€氼剚鏅舵禒瀣︽慨姗嗗幘闂勫嫰鏌″畵顔煎敪閿熺姵鐓熸俊鐐电帛濞呭懘鏌?
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
            5
        );

        this.rewardList.setItems(
            listData,
            (
                slotNode: Laya.Node,
                item: ListTemplateData
            ): void => {
                const slot =
                    slotNode.getComponent(listTemplate) as listTemplate | null;

                if (!slot) {
                    console.error("[MailPanel] reward list missing listTemplate script");
                    return;
                }

                slot.bindData(item);
            }
        );
    }


    // =========================
    // 婵犵數鍋涢惌澶屾崲濠靛鐒垫い鎺嗗亾妞わ富鍣ｉ幊娆撳箣閿旂晫鍔峰銈嗘⒒缁垶顢?
    // =========================

    private clearDetail(): void {

        this.currentMailId =
            "";


        this.showDetailText(
            ""
        );


        if (this.rewardList) {

            this.rewardList.clearItems();
        }


        if (this.getRewardButton) {

            this.getRewardButton.active =
                false;
        }


        if (this.rewardTargetNode) {

            this.rewardTargetNode.active =
                false;
        }
    }
}
