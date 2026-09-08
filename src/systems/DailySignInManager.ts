import { MailManager, RewardItem } from "./MailManager";

export interface DailySignInResult {
    ok: boolean;
    reason?: string;
    rewards?: RewardItem[];
    mailId?: string;
}

export class DailySignInManager {
    private static readonly STORAGE_KEY = "qinghuai.dailySignIn";

    static canClaimToday(): boolean {
        return DailySignInManager.getState().lastClaimDate !== DailySignInManager.getTodayKey();
    }

    static claimToday(): DailySignInResult {
        if (!DailySignInManager.canClaimToday()) {
            return {
                ok: false,
                reason: "today_claimed",
            };
        }

        const rewards = DailySignInManager.getTodayRewards();
        const mail = MailManager.sendMail(
            "\u6bcf\u65e5\u7b7e\u5230\u5956\u52b1",
            "\u4eca\u65e5\u7b7e\u5230\u5956\u52b1\u5df2\u53d1\u653e\uff0c\u8bf7\u5728\u90ae\u4ef6\u4e2d\u9886\u53d6\u3002",
            rewards
        );

        DailySignInManager.saveState({
            lastClaimDate: DailySignInManager.getTodayKey(),
            totalClaimCount: DailySignInManager.getState().totalClaimCount + 1,
        });

        return {
            ok: true,
            rewards,
            mailId: mail.id,
        };
    }

    private static getTodayRewards(): RewardItem[] {
        return [
            {
                id: "coin",
                name: "\u94dc\u94b1",
                count: 1000,
            },
            {
                id: "qinghuai_token",
                name: "\u9752\u69d0\u4ee4",
                count: 1,
            },
        ];
    }

    private static getState(): { lastClaimDate: string; totalClaimCount: number } {
        const data = Laya.LocalStorage.getJSON(DailySignInManager.STORAGE_KEY);
        if (!data || typeof data !== "object") {
            return {
                lastClaimDate: "",
                totalClaimCount: 0,
            };
        }

        return {
            lastClaimDate: String(data.lastClaimDate || ""),
            totalClaimCount: Number(data.totalClaimCount || 0),
        };
    }

    private static saveState(state: { lastClaimDate: string; totalClaimCount: number }): void {
        Laya.LocalStorage.setJSON(DailySignInManager.STORAGE_KEY, state);
    }

    private static getTodayKey(): string {
        const date = new Date();
        const month = `${date.getMonth() + 1}`.padStart(2, "0");
        const day = `${date.getDate()}`.padStart(2, "0");
        return `${date.getFullYear()}-${month}-${day}`;
    }
}
