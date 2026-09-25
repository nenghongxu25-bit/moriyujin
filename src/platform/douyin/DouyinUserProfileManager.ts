import {
    DouyinCloudManager,
    DouyinUserProfile,
} from "./DouyinCloudManager";

declare const tt: any;

type ProfileApi = {
    login?: (options: {
        force?: boolean;
        success?: (res: any) => void;
        fail?: (err: any) => void;
    }) => void;
    getSetting?: (options: {
        success?: (res: { authSetting?: Record<string, boolean> }) => void;
        fail?: (err: any) => void;
    }) => void;
    authorize?: (options: {
        scope: string;
        success?: (res: any) => void;
        fail?: (err: any) => void;
    }) => void;
    showDouyinOpenAuth?: (options: {
        scope: string;
        success?: (res: any) => void;
        fail?: (err: any) => void;
    }) => void;
    getUserInfo?: (options: {
        withCredentials?: boolean;
        success?: (res: { userInfo?: any }) => void;
        fail?: (err: any) => void;
    }) => void;
    getUserProfile?: (options: {
        desc: string;
        success?: (res: { userInfo?: any }) => void;
        fail?: (err: any) => void;
    }) => void;
};

const PROFILE_STORAGE_KEY = "douyin_user_profile_v1";
const USER_INFO_SCOPE = "scope.userInfo";

export class DouyinUserProfileManager {
    public static readonly PROFILE_CHANGED_EVENT = "douyin_user_profile_changed";

    public static getLocalProfile(): DouyinUserProfile | null {
        const storage = this.getStorage();
        if (!storage) {
            return null;
        }

        const raw = storage.getItem(PROFILE_STORAGE_KEY);
        if (!raw) {
            return null;
        }

        try {
            return this.normalizeProfile(JSON.parse(raw));
        } catch {
            return null;
        }
    }

    public static async loadCloudProfile(): Promise<DouyinUserProfile | null> {
        try {
            const result = await DouyinCloudManager.getProfile();
            const profile = this.normalizeProfile(result.data?.profile || null);
            if (profile) {
                this.saveLocalProfile(profile);
            }

            return profile;
        } catch (error) {
            console.warn("[DouyinUserProfile] load cloud profile failed:", error);
            return this.getLocalProfile();
        }
    }

    public static async requestAndSaveProfile(
        desc: string = "show player avatar and nickname"
    ): Promise<DouyinUserProfile> {
        const profile = await this.requestProfile(desc);
        this.saveLocalProfile(profile);

        try {
            await DouyinCloudManager.updateProfile(profile);
        } catch (error) {
            console.warn("[DouyinUserProfile] upload profile failed:", error);
        }

        return profile;
    }

    public static saveLocalProfile(profile: DouyinUserProfile): void {
        const normalized = this.normalizeProfile(profile);
        const storage = this.getStorage();
        if (!normalized || !storage) {
            return;
        }

        storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(normalized));
        const laya = (globalThis as any).Laya;
        if (laya && laya.stage) {
            laya.stage.event(this.PROFILE_CHANGED_EVENT, normalized);
        }
    }

    private static requestProfile(desc: string): Promise<DouyinUserProfile> {
        const api = this.getApi();
        if (!api) {
            return Promise.reject(new Error("tt is unavailable."));
        }

        if (typeof api.getUserInfo === "function") {
            return this.requestMiniGameProfile(api);
        }

        if (typeof api.getUserProfile === "function") {
            return this.requestMiniAppProfile(api, desc);
        }

        return Promise.reject(new Error("tt.getUserInfo is unavailable."));
    }

    private static async requestMiniGameProfile(api: ProfileApi): Promise<DouyinUserProfile> {
        await this.ensureLoginSession(api);
        await this.ensureUserInfoAuthorized(api);
        return this.getUserInfo(api);
    }

    private static requestMiniAppProfile(
        api: ProfileApi,
        desc: string
    ): Promise<DouyinUserProfile> {
        return new Promise<DouyinUserProfile>((resolve, reject) => {
            api.getUserProfile?.({
                desc,
                success: (res) => {
                    const profile = this.normalizeProfile(res && res.userInfo);
                    if (!profile) {
                        reject(new Error("tt.getUserProfile returned empty userInfo."));
                        return;
                    }

                    resolve(profile);
                },
                fail: (err) => {
                    reject(new Error(
                        (err && (err.errMsg || err.message)) ||
                        "tt.getUserProfile failed."
                    ));
                },
            });
        });
    }

    private static ensureLoginSession(api: ProfileApi): Promise<void> {
        if (typeof api.login !== "function") {
            return Promise.resolve();
        }

        return new Promise<void>((resolve, reject) => {
            api.login?.({
                force: false,
                success: () => resolve(),
                fail: (err) => reject(this.createApiError(err, "tt.login failed.")),
            });
        });
    }

    private static async ensureUserInfoAuthorized(api: ProfileApi): Promise<void> {
        const setting = await this.getSetting(api);
        if (setting && setting[USER_INFO_SCOPE]) {
            return;
        }

        const authError = await this.tryShowDouyinOpenAuth(api);
        if (!authError) {
            return;
        }

        if (typeof api.authorize !== "function") {
            throw authError;
        }

        await new Promise<void>((resolve, reject) => {
            api.authorize?.({
                scope: USER_INFO_SCOPE,
                success: () => resolve(),
                fail: (err) => reject(this.createApiError(err, "tt.authorize failed.")),
            });
        });
    }

    private static getSetting(api: ProfileApi): Promise<Record<string, boolean> | null> {
        if (typeof api.getSetting !== "function") {
            return Promise.resolve(null);
        }

        return new Promise<Record<string, boolean> | null>((resolve) => {
            api.getSetting?.({
                success: (res) => resolve((res && res.authSetting) || null),
                fail: () => resolve(null),
            });
        });
    }

    private static tryShowDouyinOpenAuth(api: ProfileApi): Promise<Error | null> {
        if (typeof api.showDouyinOpenAuth !== "function") {
            return Promise.resolve(new Error("tt.showDouyinOpenAuth is unavailable."));
        }

        return new Promise<Error | null>((resolve) => {
            api.showDouyinOpenAuth?.({
                scope: USER_INFO_SCOPE,
                success: () => resolve(null),
                fail: (err) => resolve(this.createApiError(err, "tt.showDouyinOpenAuth failed.")),
            });
        });
    }

    private static getUserInfo(api: ProfileApi): Promise<DouyinUserProfile> {
        return new Promise<DouyinUserProfile>((resolve, reject) => {
            api.getUserInfo?.({
                withCredentials: false,
                success: (res) => {
                    const profile = this.normalizeProfile(res && res.userInfo);
                    if (!profile) {
                        reject(new Error("tt.getUserInfo returned empty userInfo."));
                        return;
                    }

                    resolve(profile);
                },
                fail: (err) => reject(this.createApiError(err, "tt.getUserInfo failed.")),
            });
        });
    }

    private static normalizeProfile(value: any): DouyinUserProfile | null {
        if (!value || typeof value !== "object") {
            return null;
        }

        const nickName = String(value.nickName || value.nickname || "").trim();
        const avatarUrl = String(value.avatarUrl || value.avatar || "").trim();

        if (!nickName && !avatarUrl) {
            return null;
        }

        return {
            nickName,
            avatarUrl,
            gender: this.optionalNumber(value.gender),
            city: this.optionalString(value.city),
            province: this.optionalString(value.province),
            country: this.optionalString(value.country),
            language: this.optionalString(value.language),
            updatedAt: Number(value.updatedAt) || Date.now(),
        };
    }

    private static optionalString(value: unknown): string | undefined {
        const text = String(value || "").trim();
        return text || undefined;
    }

    private static optionalNumber(value: unknown): number | undefined {
        const num = Number(value);
        return Number.isFinite(num) ? num : undefined;
    }

    private static createApiError(err: any, fallback: string): Error {
        return new Error(
            (err && (err.errMsg || err.message)) ||
            fallback
        );
    }

    private static getApi(): ProfileApi | null {
        const scope = globalThis as any;
        return scope && scope.tt ? scope.tt as ProfileApi : null;
    }

    private static getStorage(): Storage | null {
        const scope = globalThis as any;
        if (!scope || !scope.localStorage) {
            return null;
        }

        return scope.localStorage as Storage;
    }
}
