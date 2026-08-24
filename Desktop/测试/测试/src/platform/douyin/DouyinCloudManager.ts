declare const tt: any;

export interface DouyinLoginResult {
    code: number;
    message: string;
    data?: {
        playerId?: string;
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

    private static readonly ENV_ID: string =
        "env-EUnG5g6IM0";

    private static readonly SERVICE_ID: string =
        "1mah1688m72uu";

    private static readonly FUNCTION_NAME: string =
        "player";


    /**
     * 第一步：
     * 先让抖音小游戏确认当前用户登录状态
     */
    private static loginDouyin(): Promise<any> {

        console.log(
            "[DouyinCloud] 开始执行 tt.login()"
        );

        return new Promise((resolve, reject) => {

            if (
                typeof tt === "undefined" ||
                typeof tt.login !== "function"
            ) {
                reject(
                    new Error(
                        "当前环境不支持 tt.login"
                    )
                );
                return;
            }

            tt.login({

                force: true,

                success: (res: any) => {

                    console.log(
                        "[DouyinCloud] tt.login 成功:",
                        res
                    );

                    const hasLoginCode =
                        !!String(res && res.code || "").trim();
                    const hasAnonymousCode =
                        !!String(res && res.anonymousCode || res && res.anonymous_code || "").trim();

                    if (!res || (!hasLoginCode && !hasAnonymousCode)) {

                        reject(
                            new Error(
                                "tt.login 没有返回登录凭证"
                            )
                        );

                        return;
                    }

                    resolve(res);
                },

                fail: (err: any) => {

                    console.error(
                        "[DouyinCloud] tt.login 失败:",
                        err
                    );

                    reject(err);
                }

            });

        });
    }


    /**
     * 第二步：
     * 初始化抖音云
     */
    public static init(): boolean {

        if (this.cloud) {

            console.log(
                "[DouyinCloud] 已经初始化，无需重复初始化"
            );

            return true;
        }


        if (typeof tt === "undefined") {

            console.error(
                "[DouyinCloud] tt 不存在，当前不是抖音小游戏环境"
            );

            return false;
        }


        if (
            typeof tt.createCloud !== "function"
        ) {

            console.error(
                "[DouyinCloud] 当前基础库不支持 tt.createCloud"
            );

            return false;
        }


        try {

            console.log(
                "[DouyinCloud] 开始初始化抖音云"
            );


            this.cloud = tt.createCloud({

                envID: this.ENV_ID,

                serviceID: this.SERVICE_ID

            });


            if (!this.cloud) {

                console.error(
                    "[DouyinCloud] createCloud 返回为空"
                );

                return false;
            }


            console.log(
                "[DouyinCloud] 初始化成功"
            );


            return true;

        } catch (error) {

            console.error(
                "[DouyinCloud] 初始化异常:",
                error
            );

            this.cloud = null;

            return false;
        }
    }


    /**
     * 第三步：
     *
     * tt.login
     * ↓
     * createCloud
     * ↓
     * callContainer
     * ↓
     * 云端获取 openId
     */
    public static async login():
        Promise<DouyinLoginResult> {

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


    public static async callFunction<T>(body: Record<string, any>):
        Promise<T> {

        const action = String(body && body.action || "unknown");

        console.log(
            "[DouyinCloud] callFunction() 开始执行:",
            action
        );


        // =========================
        // 1. 初始化 cloud
        // =========================

        if (!this.cloud) {

            console.log(
                "[DouyinCloud] cloud 不存在，准备初始化"
            );


            const initialized =
                this.init();


            if (!initialized) {

                throw new Error(
                    "抖音云初始化失败"
                );
            }
        }


        if (
            !this.cloud ||
            (
                typeof this.cloud.callFunction !== "function" &&
                typeof this.cloud.callContainer !== "function"
            )
        ) {

            throw new Error(
                "云函数调用接口不可用"
            );
        }

        if (typeof this.cloud.callFunction !== "function") {
            console.log(
                "[DouyinCloud] 当前环境无 cloud.callFunction，回退到 callContainer"
            );

            return this.callCloudContainer<T>(body || {});
        }


        // =========================
        // 2. 函数调用模式才执行 tt.login
        // =========================

        const loginResult =
            await this.loginDouyin();


        console.log(
            "[DouyinCloud] 当前用户登录状态确认完成"
        );

        console.log(
            "[DouyinCloud] isLogin:",
            loginResult.isLogin
        );


        const requestBody = {
            ...(body || {}),
            loginCode: String(loginResult && loginResult.code || "").trim(),
            anonymousCode: String(loginResult && (loginResult.anonymousCode || loginResult.anonymous_code) || "").trim(),
        };


        console.log(
            "[DouyinCloud] 准备调用云函数"
        );


        // =========================
        // 3. 调用云服务
        // =========================

        return this.callCloudFunction<T>(requestBody);
    }


    private static callCloudFunction<T>(body: Record<string, any>):
        Promise<T> {

        console.log(
            "[DouyinCloud] 使用 cloud.callFunction 调用:",
            this.FUNCTION_NAME
        );

        return new Promise(
            (resolve, reject) => {

                try {

                    this.cloud.callFunction({

                        name: this.FUNCTION_NAME,

                        data: body || {},

                        success: (res: any) => {
                            console.log(
                                "[DouyinCloud] callFunction success:"
                            );
                            console.log(res);

                            this.resolveCloudResponse<T>(res, resolve, reject);
                        },

                        fail: (err: any) => {
                            console.error(
                                "[DouyinCloud] callFunction fail:",
                                err
                            );

                            reject(err);
                        }
                    });

                    console.log(
                        "[DouyinCloud] callFunction 请求已经发出"
                    );

                } catch (error) {

                    console.error(
                        "[DouyinCloud] 调用 callFunction 异常:",
                        error
                    );

                    reject(error);
                }
            }
        );
    }


    private static callCloudContainer<T>(body: Record<string, any>):
        Promise<T> {

        console.log(
            "[DouyinCloud] 使用 cloud.callContainer 调用"
        );

        return new Promise(
            (resolve, reject) => {

                try {

                    this.cloud.callContainer({

                        path: "/index",

                        init: {

                            method: "POST",

                            header: {
                                "content-type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(body || {})
                        },


                        success: (res: any) => {

                            console.log(
                                "[DouyinCloud] callContainer success:"
                            );

                            console.log(res);


                            this.resolveCloudResponse<T>(res, resolve, reject);
                        },


                        fail: (err: any) => {

                            if (this.isCloudUserAuthError(err)) {
                                console.warn(
                                    "[DouyinCloud] callContainer user auth unavailable:",
                                    err
                                );
                            } else {
                                console.error(
                                    "[DouyinCloud] callContainer fail:",
                                    err
                                );
                            }

                            reject(err);
                        }

                    });


                    console.log(
                        "[DouyinCloud] callContainer 请求已经发出"
                    );


                } catch (error) {

                    console.error(
                        "[DouyinCloud] 调用 callContainer 异常:",
                        error
                    );

                    reject(error);
                }

            }
        );
    }


    private static resolveCloudResponse<T>(
        res: any,
        resolve: (value: T) => void,
        reject: (reason?: any) => void
    ): void {

        const statusCode =
            Number(
                res &&
                res.statusCode
            );


        if (
            Number.isFinite(
                statusCode
            ) &&
            statusCode !== 200
        ) {

            reject(
                new Error(
                    "云服务 HTTP 请求失败，statusCode="
                    + statusCode
                )
            );

            return;
        }


        const data:
            DouyinCloudResponse =
            (res && res.result) ||
            (res && res.data) ||
            res;


        console.log(
            "[DouyinCloud] 云函数返回 data:",
            data
        );


        if (!data) {

            reject(
                new Error(
                    "云函数没有返回 data"
                )
            );

            return;
        }


        const code =
            Number(
                data.code
            );


        if (
            !Number.isFinite(
                code
            )
        ) {

            reject(
                new Error(
                    "云函数返回 code 无效"
                )
            );

            return;
        }


        if (code !== 0) {

            const message =
                data.message ||
                (
                    "云登录失败，code="
                    + code
                );


            console.error(
                "[DouyinCloud] 云函数业务失败:",
                data
            );


            reject(
                new Error(
                    message
                )
            );

            return;
        }


        resolve(data as T);
    }


    public static getCloud(): any {
        return this.cloud;
    }


    private static isCloudUserAuthError(error: unknown): boolean {
        const value = error as any;
        const errNo = Number(value && value.errNo);
        const message = String(
            (value && (value.errMsg || value.message)) ||
            error ||
            ""
        );

        return errNo === 24001013 ||
            message.indexOf("获取用户信息失败") >= 0 ||
            message.indexOf("请重新登录") >= 0;
    }


    public static isInitialized(): boolean {
        return !!this.cloud;
    }


    public static reset(): void {

        this.cloud = null;

        console.log(
            "[DouyinCloud] 已重置"
        );
    }
}
