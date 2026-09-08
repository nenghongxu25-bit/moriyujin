export interface RewardItem {
    id: string;
    name: string;
    count: number;
}

export interface MailData {
    id: string;
    title: string;
    content: string;
    rewards: RewardItem[];
    createdAt: number;
    read: boolean;
    claimed: boolean;
}

export class MailManager {
    private static readonly STORAGE_KEY = "qinghuai.mails";

    static sendMail(title: string, content: string, rewards: RewardItem[]): MailData {
        const mail: MailData = {
            id: MailManager.createId(),
            title,
            content,
            rewards: rewards.map((reward) => ({ ...reward })),
            createdAt: Date.now(),
            read: false,
            claimed: false,
        };

        const mails = MailManager.getMails();
        mails.unshift(mail);
        MailManager.saveMails(mails);
        return mail;
    }

    static getMails(): MailData[] {
        const data = Laya.LocalStorage.getJSON(MailManager.STORAGE_KEY);
        return Array.isArray(data) ? data : [];
    }

    static markRead(mailId: string): void {
        MailManager.updateMail(mailId, (mail) => {
            mail.read = true;
        });
    }

    static markClaimed(mailId: string): void {
        MailManager.updateMail(mailId, (mail) => {
            mail.claimed = true;
            mail.read = true;
        });
    }

    private static updateMail(mailId: string, update: (mail: MailData) => void): void {
        const mails = MailManager.getMails();
        const mail = mails.find((item) => item.id === mailId);
        if (!mail) {
            return;
        }

        update(mail);
        MailManager.saveMails(mails);
    }

    private static saveMails(mails: MailData[]): void {
        Laya.LocalStorage.setJSON(MailManager.STORAGE_KEY, mails);
    }

    private static createId(): string {
        return `mail_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    }
}
