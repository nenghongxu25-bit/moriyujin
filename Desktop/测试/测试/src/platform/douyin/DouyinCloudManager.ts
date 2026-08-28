declare const tt: any;

export interface DouyinUserProfile {
    nickName: string;
    avatarUrl: string;
    gender?: number;
    city?: string;
    province?: string;
    country?: string;
    language?: string;
    updatedAt?: number;
}

export interface DouyinLoginResult {
    code: number;
    message: string;
    data?: {
        playerId?: string;
        displayId?: number;
        isFormalAccount?: boolean;
        profile?: DouyinUserProfile | null;
        saveData?: CloudSaveData | null;
    };
}

export interface DouyinCloudResponse<T = unknown> {
    code: number;
    message: string;
    data?: T;
}

export interface DouyinServerTimeData {
    serverTimeMs: number;
    iso?: string;
}

export interface CloudSaveData {
    version: number;
    updatedAt: number;
    records: Record<string, string>;
}

export class DouyinCloudManager {
    private static cloud: any = null;

    private static readonly ENV_ID = "env-EUnG5g6IM0";
    private static readonly SERVICE_ID = "1mah1688m72uu";
    private static readonly FUNCTION_NAME = "player";

    public static async login(): Promise<DouyinLoginResult> {
        return this.callFunction<DouyinLoginResult>({
            action: "login",
        });
    }

    public static async loadSave():
        Promise<DouyinCloudResponse<{ saveData: CloudSaveData | null }>> {

        return this.callFunction<DouyinCloudResponse<{ saveData: CloudSaveData | null }>>({
            action: "loadSave",
        });
    }

    public static async saveGame(saveData: CloudSaveData):
        Promise<DouyinCloudResponse<{ updatedAt: number }>> {

        return this.callFunction<DouyinCloudResponse<{ updatedAt: number }>>({
            action: "saveGame",
            saveData,
        });
    }

    public static async getServerTime():
        Promise<DouyinCloudResponse<DouyinServerTimeData>> {

        return this.callFunction<DouyinCloudResponse<DouyinServerTimeData>>({
            action: "getServerTime",
        });
    }

    public static async getProfile():
        Promise<DouyinCloudResponse<{ displayId?: number; profile: DouyinUserProfile | null }>> {

        return this.callFunction<DouyinCloudResponse<{ displayId?: number; profile: DouyinUserProfile | null }>>({
            action: "getProfile",
        });
    }

    public static async updateProfile(profile: DouyinUserProfile):
        Promise<DouyinCloudResponse<{ profile: DouyinUserProfile }>> {

        return this.callFunction<DouyinCloudResponse<{ profile: DouyinUserProfile }>>({
            action: "updateProfile",
            profile,
        });
    }

    public static async callFunction<T>(body: Record<string, any>): Promise<T> {
        const action = String((body && body.action) || "unknown");
        console.log("[DouyinCloud] callFunction start:", action);

        if (!this.cloud && !this.init()) {
            throw new Error("Douyin cloud init failed.");
        }

        if (
            !this.cloud ||
            (
                typeof this.cloud.callFunction !== "function" &&
                typeof this.cloud.callContainer !== "function"
            )
        ) {
            throw new Error("Douyin cloud call API is unavailable.");
        }

        if (typeof this.cloud.callFunction !== "function") {
            console.log("[DouyinCloud] callFunction unavailable, fallback to callContainer.");
            return this.callCloudContainer<T>(body || {});
        }

        const loginResult = await this.loginDouyin();
        const requestBody = {
            ...(body || {}),
            loginCode: String((loginResult && loginResult.code) || "").trim(),
            anonymousCode: String(
                (loginResult && (loginResult.anonymousCode || loginResult.anonymous_code)) || ""
            ).trim(),
        };

        return this.callCloudFunction<T>(requestBody);
    }

    public static init(): boolean {
        if (this.cloud) {
            return true;
        }

        if (typeof tt === "undefined") {
            console.error("[DouyinCloud] tt is unavailable.");
            return false;
        }

        if (typeof tt.createCloud !== "function") {
            console.error("[DouyinCloud] tt.createCloud is unavailable.");
            return false;
        }

        try {
            this.cloud = tt.createCloud({
                envID: this.ENV_ID,
                serviceID: this.SERVICE_ID,
            });

            if (!this.cloud) {
                console.error("[DouyinCloud] tt.createCloud returned empty cloud.");
                return false;
            }

            console.log("[DouyinCloud] cloud initialized.");
            return true;
        } catch (error) {
            console.error("[DouyinCloud] cloud init error:", error);
            this.cloud = null;
            return false;
        }
    }

    public static getCloud(): any {
        return this.cloud;
    }

    public static isInitialized(): boolean {
        return !!this.cloud;
    }

    public static reset(): void {
        this.cloud = null;
        console.log("[DouyinCloud] reset.");
    }

    private static loginDouyin(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (
                typeof tt === "undefined" ||
                typeof tt.login !== "function"
            ) {
                reject(new Error("tt.login is unavailable."));
                return;
            }

            tt.login({
                force: true,
                success: (res: any) => {
                    const hasLoginCode = !!String((res && res.code) || "").trim();
                    const hasAnonymousCode = !!String(
                        (res && (res.anonymousCode || res.anonymous_code)) || ""
                    ).trim();

                    if (!res || (!hasLoginCode && !hasAnonymousCode)) {
                        reject(new Error("tt.login did not return code."));
                        return;
                    }

                    resolve(res);
                },
                fail: (err: any) => {
                    console.error("[DouyinCloud] tt.login failed:", err);
                    reject(err);
                },
            });
        });
    }

    private static callCloudFunction<T>(body: Record<string, any>): Promise<T> {
        return new Promise((resolve, reject) => {
            try {
                this.cloud.callFunction({
                    name: this.FUNCTION_NAME,
                    data: body || {},
                    success: (res: any) => {
                        console.log("[DouyinCloud] callFunction success:", res);
                        this.resolveCloudResponse<T>(res, resolve, reject);
                    },
                    fail: (err: any) => {
                        console.error("[DouyinCloud] callFunction failed:", err);
                        reject(err);
                    },
                });
            } catch (error) {
                console.error("[DouyinCloud] callFunction error:", error);
                reject(error);
            }
        });
    }

    private static callCloudContainer<T>(body: Record<string, any>): Promise<T> {
        return new Promise((resolve, reject) => {
            try {
                this.cloud.callContainer({
                    path: "/index",
                    init: {
                        method: "POST",
                        header: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify(body || {}),
                    },
                    success: (res: any) => {
                        console.log("[DouyinCloud] callContainer success:", res);
                        this.resolveCloudResponse<T>(res, resolve, reject);
                    },
                    fail: (err: any) => {
                        if (this.isCloudUserAuthError(err)) {
                            console.warn("[DouyinCloud] user auth unavailable:", err);
                        } else {
                            console.error("[DouyinCloud] callContainer failed:", err);
                        }

                        reject(err);
                    },
                });
            } catch (error) {
                console.error("[DouyinCloud] callContainer error:", error);
                reject(error);
            }
        });
    }

    private static resolveCloudResponse<T>(
        res: any,
        resolve: (value: T) => void,
        reject: (reason?: any) => void
    ): void {
        const statusCode = Number(res && res.statusCode);

        if (Number.isFinite(statusCode) && statusCode !== 200) {
            reject(new Error("Cloud request failed, statusCode=" + statusCode));
            return;
        }

        const data: DouyinCloudResponse =
            (res && res.result) ||
            (res && res.data) ||
            res;

        if (!data) {
            reject(new Error("Cloud function returned empty data."));
            return;
        }

        const code = Number(data.code);

        if (!Number.isFinite(code)) {
            reject(new Error("Cloud function returned invalid code."));
            return;
        }

        if (code !== 0) {
            const message = data.message || ("Cloud function failed, code=" + code);
            console.error("[DouyinCloud] business failed:", data);
            reject(new Error(message));
            return;
        }

        resolve(data as T);
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
}
