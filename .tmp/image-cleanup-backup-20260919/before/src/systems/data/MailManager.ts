export interface MailAttachment {
    itemId: string;
    name: string;
    count: number;
    icon?: string;
}

export interface PlayerMail {
    id: string;

    // Left-side mail title
    title: string;

    // Right-side mail content
    content: string;

    // Sent time
    createdAt: number;

    // Whether it has been read
    isRead: boolean;

    // Whether the reward has been claimed
    isClaimed: boolean;

    // Reward attachments
    attachments: MailAttachment[];
}

export type MailChangeListener = () => void;

export class MailManager {
    private static readonly STORAGE_KEY = "laya_test_mail_v1";
    private static instance: MailManager | null = null;

    private mails: PlayerMail[] = [];

    private listeners: Set<MailChangeListener> = new Set();

    public static getInstance(): MailManager {
        if (!MailManager.instance) {
            MailManager.instance = new MailManager();
        }

        return MailManager.instance;
    }

    private constructor() {
        this.load();
    }

    // =========================
    // Get all mails
    // =========================

    public getMails(): PlayerMail[] {
        return this.mails.map((mail) => ({
            ...mail,
            attachments: mail.attachments.map((item) => ({
                ...item
            }))
        }));
    }

    // =========================
    // Get one mail
    // =========================

    public getMail(mailId: string): PlayerMail | null {
        return this.mails.find((mail) => mail.id === mailId) || null;
    }

    // =========================
    // Add mail
    // =========================

    public addMail(mail: PlayerMail): boolean {
        if (!mail || !mail.id) {
            return false;
        }

        if (this.getMail(mail.id)) {
            return false;
        }

        this.mails.push({
            ...mail,
            attachments: Array.isArray(mail.attachments)
                ? mail.attachments.map((item) => ({
                    ...item
                }))
                : []
        });

        this.mails.sort((a, b) => b.createdAt - a.createdAt);

        this.notifyChanged();

        return true;
    }

    public addChangeListener(listener: MailChangeListener): void {
        if (listener) {
            this.listeners.add(listener);
        }
    }

    public removeChangeListener(listener: MailChangeListener): void {
        this.listeners.delete(listener);
    }

    // =========================
    // Mark read
    // =========================

    public markRead(mailId: string): void {
        const mail = this.getMail(mailId);
        if (!mail) {
            return;
        }

        mail.isRead = true;
        this.notifyChanged();
    }

    // =========================
    // Mark claimed
    // =========================

    public markClaimed(mailId: string): boolean {
        const mail = this.getMail(mailId);
        if (!mail) {
            return false;
        }

        if (mail.isClaimed) {
            return false;
        }

        mail.isClaimed = true;
        this.notifyChanged();
        return true;
    }

    // =========================
    // Remove mail
    // =========================

    public removeMail(mailId: string): void {
        const next = this.mails.filter((mail) => mail.id !== mailId);
        if (next.length === this.mails.length) {
            return;
        }

        this.mails = next;
        this.notifyChanged();
    }

    // =========================
    // Default welcome mail
    // =========================

    public addWelcomeMail(): void {
        this.addMail({
            id: "welcome_mail",
            title: "欢迎来到废土摸金录",
            content:
                "欢迎来到废土摸金录！\n\n" +
                "在这片危险四伏的废土中，探索未知区域、搜集物资，并努力生存下去。\n\n" +
                "祝你好运，幸存者！",
            createdAt: Date.now(),
            isRead: false,
            isClaimed: false,
            attachments: [
                {
                    itemId: "grass",
                    name: "草",
                    count: 10,
                    icon: "atlas/picture/items/materials/basic_materials/grass.png"
                },
                {
                    itemId: "common_material_02",
                    name: "石头",
                    count: 10,
                    icon: "atlas/picture/items/materials/basic_materials/shitou.png"
                }
            ]
        });
    }

    // =========================
    // Test reward mail
    // Can be removed later
    // =========================

    public addTestRewardMail(): void {
        this.addMail({
            id: "test_reward_mail",
            title: "测试奖励邮件",
            content: "这是一封用于测试奖励领取功能的邮件。",
            createdAt: Date.now() - 1000,
            isRead: false,
            isClaimed: false,
            attachments: [
                {
                    itemId: "wood",
                    name: "木头",
                    count: 10,
                    icon: "atlas/picture/items/materials/basic_materials/wood.png"
                },
                {
                    itemId: "common_material_02",
                    name: "石头",
                    count: 5,
                    icon: "atlas/picture/items/materials/basic_materials/shitou.png"
                }
            ]
        });
    }

    public addSignInRewardMail(day: number, attachments: MailAttachment[]): boolean {
        const normalizedDay = Number.isFinite(day) ? Math.max(1, Math.floor(day)) : 1;
        const normalizedAttachments = Array.isArray(attachments)
            ? attachments
                .filter((item) => item && item.itemId && Number.isFinite(item.count) && item.count > 0)
                .map((item) => ({
                    itemId: item.itemId,
                    name: item.name,
                    count: Math.floor(item.count),
                    icon: item.icon,
                }))
            : [];

        if (normalizedAttachments.length === 0) {
            return false;
        }

        return this.addMail({
            id: `sign_in_reward_day_${normalizedDay}`,
            title: `每日签到 第${normalizedDay}天奖励`,
            content: `你已完成第${normalizedDay}天签到，奖励已发放到本邮件附件。`,
            createdAt: Date.now(),
            isRead: false,
            isClaimed: false,
            attachments: normalizedAttachments,
        });
    }

    // =========================
    // Ensure default mails
    // =========================

    public ensureDefaultMails(): void {
        this.addWelcomeMail();
        this.addTestRewardMail();
    }

    private notifyChanged(): void {
        this.save();
        this.listeners.forEach((listener) => listener());
    }

    private load(): void {
        try {
            const raw = this.getStorage()?.getItem(MailManager.STORAGE_KEY);
            if (!raw) {
                return;
            }

            const parsed = JSON.parse(raw) as PlayerMail[];
            if (!Array.isArray(parsed)) {
                return;
            }

            this.mails = parsed
                .map((mail) => this.normalizeMail(mail))
                .filter((mail): mail is PlayerMail => !!mail)
                .sort((a, b) => b.createdAt - a.createdAt);
        } catch (error) {
            console.error("[MailManager] 邮件存档读取失败:", error);
        }
    }

    private save(): void {
        try {
            this.getStorage()?.setItem(MailManager.STORAGE_KEY, JSON.stringify(this.mails));
            const scope = globalThis as any;
            if (scope && typeof scope.__scheduleDouyinCloudSave === "function") {
                scope.__scheduleDouyinCloudSave();
            }
        } catch (error) {
            console.error("[MailManager] 邮件存档保存失败:", error);
        }
    }

    private normalizeMail(mail: Partial<PlayerMail> | null | undefined): PlayerMail | null {
        if (!mail || typeof mail.id !== "string" || !mail.id) {
            return null;
        }

        return {
            id: mail.id,
            title: typeof mail.title === "string" ? mail.title : "",
            content: typeof mail.content === "string" ? mail.content : "",
            createdAt: Number.isFinite(Number(mail.createdAt)) ? Number(mail.createdAt) : Date.now(),
            isRead: !!mail.isRead,
            isClaimed: !!mail.isClaimed,
            attachments: Array.isArray(mail.attachments)
                ? mail.attachments
                    .filter((item) => item && typeof item.itemId === "string" && !!item.itemId)
                    .map((item) => ({
                        itemId: item.itemId,
                        name: typeof item.name === "string" ? item.name : item.itemId,
                        count: Number.isFinite(Number(item.count)) ? Math.max(1, Math.floor(Number(item.count))) : 1,
                        icon: typeof item.icon === "string" ? item.icon : undefined,
                    }))
                : [],
        };
    }

    private getStorage(): Storage | null {
        const scope = globalThis as any;
        return scope && scope.localStorage ? scope.localStorage as Storage : null;
    }
}
