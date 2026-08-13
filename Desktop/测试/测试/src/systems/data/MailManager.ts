export interface MailAttachment {
    itemId: string;
    name: string;
    count: number;
    icon?: string;
}

export interface PlayerMail {
    id: string;

    // 左边信封标题
    title: string;

    // 右边邮件正文
    content: string;

    // 发送时间
    createdAt: number;

    // 是否看过
    isRead: boolean;

    // 奖励是否已经领取
    isClaimed: boolean;

    // 奖励附件
    attachments: MailAttachment[];
}


export class MailManager {

    private static instance: MailManager | null = null;

    private mails: PlayerMail[] = [];


    public static getInstance(): MailManager {

        if (!MailManager.instance) {
            MailManager.instance = new MailManager();
        }

        return MailManager.instance;
    }


    // =========================
    // 获取全部邮件
    // =========================

    public getMails(): PlayerMail[] {

        return this.mails.map((mail) => ({
            ...mail,

            attachments: mail.attachments.map(
                (item) => ({
                    ...item
                })
            )
        }));
    }


    // =========================
    // 获取某一封邮件
    // =========================

    public getMail(
        mailId: string
    ): PlayerMail | null {

        return this.mails.find(
            (mail) =>
                mail.id === mailId
        ) || null;
    }


    // =========================
    // 添加邮件
    // =========================

    public addMail(
        mail: PlayerMail
    ): boolean {

        if (!mail || !mail.id) {
            return false;
        }


        // 同 ID 邮件不能重复
        if (this.getMail(mail.id)) {
            return false;
        }


        this.mails.push({

            ...mail,

            attachments:
                Array.isArray(mail.attachments)
                    ? mail.attachments.map(
                        (item) => ({
                            ...item
                        })
                    )
                    : []
        });


        // 新邮件排最前面
        this.mails.sort(
            (a, b) =>
                b.createdAt -
                a.createdAt
        );


        return true;
    }


    // =========================
    // 标记已读
    // =========================

    public markRead(
        mailId: string
    ): void {

        const mail =
            this.getMail(mailId);

        if (!mail) {
            return;
        }

        mail.isRead = true;
    }


    // =========================
    // 标记奖励已领取
    // =========================

    public markClaimed(
        mailId: string
    ): boolean {

        const mail =
            this.getMail(mailId);

        if (!mail) {
            return false;
        }

        if (mail.isClaimed) {
            return false;
        }

        mail.isClaimed = true;

        return true;
    }


    // =========================
    // 删除邮件
    // =========================

    public removeMail(
        mailId: string
    ): void {

        this.mails =
            this.mails.filter(
                (mail) =>
                    mail.id !== mailId
            );
    }


    // =========================
    // 默认欢迎邮件
    // 无奖励
    // =========================

    public addWelcomeMail(): void {

        this.addMail({

            id:
                "welcome_mail",

            title:
                "欢迎来到废土摸金录",

            content:
                "欢迎来到废土摸金录！\n\n" +
                "在这片危机四伏的废土中，探索未知区域、搜集物资，并努力生存下去。\n\n" +
                "祝你好运，幸存者！",

            createdAt:
                Date.now(),

            isRead:
                false,

            isClaimed:
                false,

            attachments:
                []
        });
    }


    // =========================
    // 测试奖励邮件
    // 后面可以删掉
    // =========================

    public addTestRewardMail(): void {

        this.addMail({

            id:
                "test_reward_mail",

            title:
                "测试奖励邮件",

            content:
                "这是一封用于测试奖励领取功能的邮件。",

            createdAt:
                Date.now() - 1000,

            isRead:
                false,

            isClaimed:
                false,

            attachments: [

                {
                    itemId:
                        "wood",

                    name:
                        "木头",

                    count:
                        10,

                    icon:
                        "atlas/picture/items/materials/basic_materials/wood.png"
                },

                {
                    itemId:
                        "common_material_02",

                    name:
                        "石头",

                    count:
                        5,

                    icon:
                        "atlas/picture/items/materials/basic_materials/shitou.png"
                }
            ]
        });
    }


    // =========================
    // 开发阶段默认邮件
    // =========================

    public ensureDefaultMails(): void {

        this.addWelcomeMail();

        this.addTestRewardMail();
    }
}