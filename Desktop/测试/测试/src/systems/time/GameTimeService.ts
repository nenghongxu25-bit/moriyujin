import { DouyinCloudManager } from "../../platform/douyin/DouyinCloudManager";

export type GameTimeSource = "debug" | "server" | "client";

export interface GameTimeSyncResult {
    success: boolean;
    source: GameTimeSource;
    nowMs: number;
    error?: string;
}

export class GameTimeService {
    private static instance: GameTimeService | null = null;

    private serverNowMs: number = 0;
    private serverReceivedClientMs: number = 0;
    private debugNowMs: number | null = null;
    private lastSyncError: string = "";

    public static getInstance(): GameTimeService {
        if (!GameTimeService.instance) {
            GameTimeService.instance = new GameTimeService();
        }

        return GameTimeService.instance;
    }

    public async syncServerTime(): Promise<GameTimeSyncResult> {
        try {
            const response = await DouyinCloudManager.getServerTime();
            const serverTimeMs = Number(response && response.data && response.data.serverTimeMs);
            if (!Number.isFinite(serverTimeMs) || serverTimeMs <= 0) {
                throw new Error("serverTimeMs is invalid");
            }

            this.serverNowMs = serverTimeMs;
            this.serverReceivedClientMs = Date.now();
            this.lastSyncError = "";
            return {
                success: true,
                source: this.getSource(),
                nowMs: this.getNowMs(),
            };
        } catch (error) {
            this.lastSyncError = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                source: this.getSource(),
                nowMs: this.getNowMs(),
                error: this.lastSyncError,
            };
        }
    }

    public getNow(): Date {
        return new Date(this.getNowMs());
    }

    public getNowMs(): number {
        if (this.debugNowMs !== null) {
            return this.debugNowMs;
        }

        if (this.serverNowMs > 0 && this.serverReceivedClientMs > 0) {
            return this.serverNowMs + Math.max(0, Date.now() - this.serverReceivedClientMs);
        }

        return Date.now();
    }

    public getTodayKey(): string {
        return this.getDayKey(this.getNow());
    }

    public getSource(): GameTimeSource {
        if (this.debugNowMs !== null) {
            return "debug";
        }

        return this.serverNowMs > 0 && this.serverReceivedClientMs > 0 ? "server" : "client";
    }

    public getLastSyncError(): string {
        return this.lastSyncError;
    }

    public setDebugNow(date: Date | null): void {
        const time = date ? date.getTime() : NaN;
        this.debugNowMs = Number.isFinite(time) ? time : null;
    }

    public clearServerTime(): void {
        this.serverNowMs = 0;
        this.serverReceivedClientMs = 0;
    }

    private getDayKey(date: Date): string {
        const year = date.getFullYear();
        const month = this.pad2(date.getMonth() + 1);
        const day = this.pad2(date.getDate());
        return `${year}-${month}-${day}`;
    }

    private pad2(value: number): string {
        return value < 10 ? `0${value}` : String(value);
    }
}
