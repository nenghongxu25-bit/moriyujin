export interface RunSessionSnapshot {
    success: boolean;
    elapsedMs: number;
    kills: number;
}

export class RunSessionManager {
    private static readonly BASE_SCENE_KEYWORDS = ["menu", "cunzhuang"];
    private static instance: RunSessionManager | null = null;

    private startedAt: number = 0;
    private sceneUrl: string = "";
    private kills: number = 0;

    public static getInstance(): RunSessionManager {
        if (!RunSessionManager.instance) {
            RunSessionManager.instance = new RunSessionManager();
        }

        return RunSessionManager.instance;
    }

    public enterScene(sceneUrl: string): void {
        const nextSceneUrl = String(sceneUrl || "");
        this.sceneUrl = nextSceneUrl;

        if (this.isBaseScene(nextSceneUrl)) {
            return;
        }

        this.start(nextSceneUrl);
    }

    public start(sceneUrl: string = this.sceneUrl): void {
        this.startedAt = Date.now();
        this.sceneUrl = String(sceneUrl || this.sceneUrl || "");
        this.kills = 0;
    }

    public recordEnemyKill(): void {
        this.ensureStarted();
        this.kills++;
    }

    public createSnapshot(success: boolean): RunSessionSnapshot {
        this.ensureStarted();

        return {
            success,
            elapsedMs: Math.max(0, Date.now() - this.startedAt),
            kills: this.kills,
        };
    }

    public getElapsedMs(): number {
        this.ensureStarted();
        return Math.max(0, Date.now() - this.startedAt);
    }

    private ensureStarted(): void {
        if (this.startedAt > 0) {
            return;
        }

        this.start(this.sceneUrl);
    }

    private isBaseScene(sceneUrl: string): boolean {
        const normalized = String(sceneUrl || "").toLowerCase();

        for (let i = 0; i < RunSessionManager.BASE_SCENE_KEYWORDS.length; i++) {
            if (normalized.includes(RunSessionManager.BASE_SCENE_KEYWORDS[i])) {
                return true;
            }
        }

        return false;
    }
}
