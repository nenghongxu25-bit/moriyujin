import { SaveManager } from "./SaveManager";

export interface PlayerStatsSnapshot {
    level: number;
    currentHp: number;
    maxHp: number;
    currentStamina: number;
    maxStamina: number;
    experience: number;
    nextLevelExperience: number;
}

export class PlayerStatsManager {
    private stats: PlayerStatsSnapshot = PlayerStatsManager.createDefaultStats();

    constructor(private save: SaveManager, private storageKey: string, private onHpChanged?: () => void) {
    }

    public getSnapshot(): PlayerStatsSnapshot {
        return { ...this.stats };
    }

    public setHp(currentHp: number, maxHp: number = this.stats.maxHp): void {
        const nextMaxHp = this.normalizePositiveInt(maxHp, this.stats.maxHp || 100);
        const nextCurrentHp = Math.max(0, Math.min(nextMaxHp, this.normalizeInt(currentHp, nextMaxHp)));
        if (this.stats.currentHp === nextCurrentHp && this.stats.maxHp === nextMaxHp) {
            return;
        }

        this.stats = {
            ...this.stats,
            currentHp: nextCurrentHp,
            maxHp: nextMaxHp,
        };
        this.saveStats();
        if (this.onHpChanged) {
            this.onHpChanged();
        }
    }

    public setStamina(currentStamina: number, maxStamina: number = this.stats.maxStamina): void {
        const nextMaxStamina = this.normalizePositiveInt(maxStamina, this.stats.maxStamina || 100);
        const nextCurrentStamina = Math.max(0, Math.min(nextMaxStamina, this.normalizeInt(currentStamina, nextMaxStamina)));
        if (this.stats.currentStamina === nextCurrentStamina && this.stats.maxStamina === nextMaxStamina) {
            return;
        }

        this.stats = {
            ...this.stats,
            currentStamina: nextCurrentStamina,
            maxStamina: nextMaxStamina,
        };
        this.saveStats();
    }

    public grantGatherExperience(): void {
        this.grantExperience(1);
    }

    public grantEnemyDefeatExperience(): void {
        this.grantExperience(1);
    }

    public grantExperience(amount: number): void {
        const value = Number.isFinite(amount) ? Math.floor(amount) : 0;
        if (value <= 0) {
            return;
        }

        let leveledUp = false;
        this.stats.experience += value;
        while (this.stats.experience >= this.stats.nextLevelExperience) {
            this.stats.experience -= this.stats.nextLevelExperience;
            this.stats.level += 1;
            this.stats.maxHp += 10;
            this.stats.currentHp = this.stats.maxHp;
            this.stats.nextLevelExperience += 50;
            leveledUp = true;
        }

        if (leveledUp) {
            this.stats.currentHp = Math.min(this.stats.currentHp, this.stats.maxHp);
            if (this.onHpChanged) {
                this.onHpChanged();
            }
        }

        this.saveStats();
    }

    public load(): void {
        const stored = this.save.loadJson<Partial<PlayerStatsSnapshot>>(this.storageKey);
        if (!stored) {
            this.stats = PlayerStatsManager.createDefaultStats();
            this.saveStats();
            return;
        }

        const level = this.normalizePositiveInt(stored.level, 1);
        const maxHp = this.normalizePositiveInt(stored.maxHp, 100);
        const maxStamina = this.normalizePositiveInt(stored.maxStamina, 100);
        this.stats = {
            level,
            maxHp,
            currentHp: Math.min(maxHp, this.normalizePositiveInt(stored.currentHp, maxHp)),
            maxStamina,
            currentStamina: Math.max(0, Math.min(maxStamina, this.normalizeInt(stored.currentStamina, maxStamina))),
            experience: Math.max(0, this.normalizeInt(stored.experience, 0)),
            nextLevelExperience: this.normalizePositiveInt(stored.nextLevelExperience, 200 + Math.max(0, level - 1) * 50),
        };
    }

    private saveStats(): void {
        this.save.saveJson(this.storageKey, this.stats);
    }

    private normalizePositiveInt(value: unknown, fallback: number): number {
        const normalized = this.normalizeInt(value, fallback);
        return normalized > 0 ? normalized : fallback;
    }

    private normalizeInt(value: unknown, fallback: number): number {
        const next = Number(value);
        return Number.isFinite(next) ? Math.floor(next) : fallback;
    }

    private static createDefaultStats(): PlayerStatsSnapshot {
        return {
            level: 1,
            currentHp: 100,
            maxHp: 100,
            currentStamina: 100,
            maxStamina: 100,
            experience: 0,
            nextLevelExperience: 200,
        };
    }
}