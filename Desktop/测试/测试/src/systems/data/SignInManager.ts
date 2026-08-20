import { SaveManager } from "./SaveManager";

export type SignInRewardState = "locked" | "claimable" | "claimed";

export interface SignInRewardDefinition {
    day: number;
    itemId: string;
    name?: string;
    count: number;
    icon?: string;
}

export interface SignInRewardView extends SignInRewardDefinition {
    name: string;
    icon?: string;
    state: SignInRewardState;
}

interface SignInSaveData {
    startDayKey: string;
    claimedDays: number[];
}

export class SignInManager {
    private static readonly STORAGE_KEY = "laya_test_sign_in_v1";
    private static readonly DAY_MS = 24 * 60 * 60 * 1000;

    private readonly rewards: SignInRewardDefinition[] = this.createDefaultRewards();

    constructor(private readonly save: SaveManager) {}

    public getRewardViews(resolveReward: (reward: SignInRewardDefinition) => SignInRewardView): SignInRewardView[] {
        const data = this.loadOrCreateSaveData();
        const unlockedDay = this.getUnlockedDay(data.startDayKey);
        const claimed = this.toClaimedSet(data.claimedDays);
        const views: SignInRewardView[] = [];

        for (let i = 0; i < this.rewards.length; i++) {
            const reward = this.rewards[i];
            const base = resolveReward(reward);
            views.push({
                ...base,
                state: claimed.has(reward.day) ? "claimed" : reward.day <= unlockedDay ? "claimable" : "locked",
            });
        }

        return views;
    }

    public claim(day: number): SignInRewardDefinition | null {
        const normalizedDay = Number.isFinite(day) ? Math.floor(day) : 0;
        const reward = this.rewards.find((item) => item.day === normalizedDay) || null;
        if (!reward) {
            return null;
        }

        const data = this.loadOrCreateSaveData();
        const unlockedDay = this.getUnlockedDay(data.startDayKey);
        const claimed = this.toClaimedSet(data.claimedDays);
        if (reward.day > unlockedDay || claimed.has(reward.day)) {
            return null;
        }

        claimed.add(reward.day);
        this.save.saveJson(SignInManager.STORAGE_KEY, {
            startDayKey: data.startDayKey,
            claimedDays: Array.from(claimed).sort((a, b) => a - b),
        });

        return { ...reward };
    }

    private loadOrCreateSaveData(): SignInSaveData {
        const todayKey = this.getTodayKey();
        const stored = this.save.loadJson<Partial<SignInSaveData>>(SignInManager.STORAGE_KEY);
        if (stored && typeof stored.startDayKey === "string" && Array.isArray(stored.claimedDays)) {
            return {
                startDayKey: stored.startDayKey,
                claimedDays: stored.claimedDays
                    .map((day) => Math.floor(Number(day)))
                    .filter((day) => Number.isFinite(day) && day > 0),
            };
        }

        const next: SignInSaveData = {
            startDayKey: todayKey,
            claimedDays: [],
        };
        this.save.saveJson(SignInManager.STORAGE_KEY, next);
        return next;
    }

    private getUnlockedDay(startDayKey: string): number {
        const start = this.parseDayKey(startDayKey);
        const today = this.parseDayKey(this.getTodayKey());
        if (!start || !today) {
            return 1;
        }

        const elapsedDays = Math.floor((today.getTime() - start.getTime()) / SignInManager.DAY_MS);
        return Math.max(1, Math.min(this.rewards.length, elapsedDays + 1));
    }

    private getTodayKey(): string {
        const date = new Date();
        const year = date.getFullYear();
        const month = this.pad2(date.getMonth() + 1);
        const day = this.pad2(date.getDate());
        return `${year}-${month}-${day}`;
    }

    private pad2(value: number): string {
        return value < 10 ? `0${value}` : String(value);
    }

    private parseDayKey(dayKey: string): Date | null {
        const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dayKey);
        if (!match) {
            return null;
        }

        return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    }

    private toClaimedSet(days: number[]): Set<number> {
        const claimed = new Set<number>();
        for (let i = 0; i < days.length; i++) {
            const day = Math.floor(Number(days[i]));
            if (Number.isFinite(day) && day > 0 && day <= this.rewards.length) {
                claimed.add(day);
            }
        }

        return claimed;
    }

    private createDefaultRewards(): SignInRewardDefinition[] {
        const cycle: Array<Omit<SignInRewardDefinition, "day">> = [
            { itemId: "wood", name: "木头", count: 20 },
            { itemId: "grass", name: "草", count: 20 },
            { itemId: "xiaoshuzhi", name: "小树枝", count: 12 },
            { itemId: "food_material_01", name: "食物", count: 5 },
            { itemId: "common_material_02", name: "石头", count: 15 },
            { itemId: "iron", name: "铁", count: 6 },
            { itemId: "mutant_blood_1", name: "变异血", count: 1 },
        ];
        const rewards: SignInRewardDefinition[] = [];

        for (let day = 1; day <= 31; day++) {
            const base = cycle[(day - 1) % cycle.length];
            const week = Math.floor((day - 1) / cycle.length);
            rewards.push({
                day,
                itemId: base.itemId,
                name: base.name,
                count: Math.max(1, base.count + week * 2),
                icon: base.icon,
            });
        }

        return rewards;
    }
}
