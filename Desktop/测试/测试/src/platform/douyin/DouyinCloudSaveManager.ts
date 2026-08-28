import { DataManager } from "../../systems/datamanager";
import { DouyinCloudManager, type CloudSaveData } from "./DouyinCloudManager";

declare const tt: any;

type SaveRecordMap = Record<string, string>;

export class DouyinCloudSaveManager {
    private static readonly SAVE_VERSION = 1;
    private static readonly SAVE_KEYS: string[] = [
        "laya_test_base_inventory_v1",
        "laya_test_warehouse_inventory_v1",
        "laya_test_warehouse_meta_v1",
        "laya_test_equipment_v1",
        "laya_test_player_stats_v1",
        "laya_test_quick_slots_v1",
        "laya_test_sign_in_v1",
        "laya_test_mail_v1",
    ];

    private static bootstrapping: boolean = false;
    private static bootstrapPromise: Promise<void> | null = null;
    private static ready: boolean = false;
    private static applyingCloudSave: boolean = false;
    private static dirty: boolean = false;
    private static uploadTimer: number = 0;
    private static playerId: string = "";
    private static displayId: number = 0;

    public static getPlayerId(): string {
        return this.playerId;
    }

    public static getDisplayId(): number {
        return this.displayId;
    }

    public static isReady(): boolean {
        return this.ready;
    }

    public static async bootstrap(): Promise<void> {
        if (this.ready) {
            return;
        }

        if (this.bootstrapPromise) {
            return this.bootstrapPromise;
        }

        this.bootstrapPromise = this.runBootstrap();
        return this.bootstrapPromise;
    }

    private static async runBootstrap(): Promise<void> {
        if (this.bootstrapping || this.ready) {
            return;
        }

        this.bootstrapping = true;
        console.log("[DouyinCloudSave] bootstrap cloud save");

        try {
            const loginResult = await DouyinCloudManager.login();
            const playerId = String(loginResult.data?.playerId || "").trim();
            if (!playerId) {
                throw new Error("cloud login success but playerId is empty");
            }

            this.playerId = playerId;
            this.displayId = Number(loginResult.data?.displayId) || 0;
            console.log("[DouyinCloudSave] login success:", playerId);

            await this.loadCloudSave();
            this.installAutoUploadHooks();
            this.ready = true;

            if (this.dirty) {
                this.scheduleUpload();
            }
        } catch (error) {
            if (this.isCloudUserAuthError(error)) {
                console.warn(
                    "[DouyinCloudSave] cloud user auth unavailable, keep local save only.",
                    error
                );
            } else {
                console.error("[DouyinCloudSave] bootstrap failed:", error);
            }
        } finally {
            this.bootstrapping = false;
            this.bootstrapPromise = null;
        }
    }

    public static scheduleUpload(delayMs: number = 1500): void {
        if (this.applyingCloudSave) {
            return;
        }

        this.dirty = true;
        if (!this.ready || !this.playerId) {
            return;
        }

        if (this.uploadTimer) {
            clearTimeout(this.uploadTimer);
        }

        this.uploadTimer = setTimeout(() => {
            this.uploadTimer = 0;
            void this.uploadNow();
        }, Math.max(100, Math.floor(delayMs))) as any as number;
    }

    public static async uploadNow(): Promise<void> {
        if (!this.ready || !this.playerId || this.applyingCloudSave) {
            return;
        }

        this.dirty = false;
        const saveData = this.collectLocalSaveData();

        try {
            await DouyinCloudManager.saveGame(saveData);
            console.log("[DouyinCloudSave] cloud save uploaded");
        } catch (error) {
            this.dirty = true;
            console.error("[DouyinCloudSave] cloud save upload failed:", error);
        }
    }

    private static async loadCloudSave(): Promise<void> {
        const result = await DouyinCloudManager.loadSave();
        const saveData = result.data?.saveData || null;
        if (!this.isValidSaveData(saveData)) {
            console.log("[DouyinCloudSave] no cloud save, keep local save");
            this.scheduleUpload(100);
            return;
        }

        this.applyCloudSaveData(saveData);
        await DataManager.getInstance().loadAll();
        console.log("[DouyinCloudSave] cloud save applied to local storage");
    }

    private static collectLocalSaveData(): CloudSaveData {
        const records: SaveRecordMap = {};
        const storage = this.getStorage();

        for (let i = 0; i < this.SAVE_KEYS.length; i++) {
            const key = this.SAVE_KEYS[i];
            const value = storage.getItem(key);
            if (typeof value === "string") {
                records[key] = value;
            }
        }

        return {
            version: this.SAVE_VERSION,
            updatedAt: Date.now(),
            records,
        };
    }

    private static applyCloudSaveData(saveData: CloudSaveData): void {
        const storage = this.getStorage();
        const records = saveData.records || {};

        this.applyingCloudSave = true;
        try {
            for (let i = 0; i < this.SAVE_KEYS.length; i++) {
                const key = this.SAVE_KEYS[i];
                if (Object.prototype.hasOwnProperty.call(records, key)) {
                    storage.setItem(key, String(records[key]));
                }
            }
        } finally {
            this.applyingCloudSave = false;
        }
    }

    private static installAutoUploadHooks(): void {
        const scope = globalThis as any;
        scope.__scheduleDouyinCloudSave = (): void => {
            DouyinCloudSaveManager.scheduleUpload();
        };

        const api = typeof tt !== "undefined" ? tt : null;
        if (api && typeof api.onHide === "function") {
            api.onHide(() => {
                void DouyinCloudSaveManager.uploadNow();
            });
        }
    }

    private static isValidSaveData(value: unknown): value is CloudSaveData {
        const saveData = value as CloudSaveData | null;
        return !!saveData &&
            typeof saveData === "object" &&
            typeof saveData.records === "object" &&
            !!saveData.records;
    }

    private static isCloudUserAuthError(error: unknown): boolean {
        const value = error as any;
        const errNo = Number(value && value.errNo);
        const message = String(
            (value && (value.errMsg || value.message)) ||
            error ||
            ""
        ).toLowerCase();

        return errNo === 24001013 ||
            message.indexOf("auth") >= 0 ||
            message.indexOf("login") >= 0 ||
            message.indexOf("user") >= 0;
    }

    private static getStorage(): Storage {
        const scope = globalThis as any;
        if (!scope || !scope.localStorage) {
            throw new Error("localStorage is unavailable.");
        }

        return scope.localStorage as Storage;
    }
}
