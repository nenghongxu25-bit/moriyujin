export interface DouyinLoginConfig {
    loginEndpoint: string;
    privacyText?: string;
    tokenStorageKey?: string;
    sessionStorageKey?: string;
}

export interface DouyinLoginSession {
    token: string;
    openid: string;
    unionid?: string;
    created: boolean;
    createdAt: number;
    lastLoginAt: number;
}

type DouyinLoginApi = {
    login?: (options: {
        success?: (res: { code?: string; anonymous_code?: string; errMsg?: string }) => void;
        fail?: (err: any) => void;
    }) => void;
    request?: (options: {
        url: string;
        method?: string;
        data?: any;
        header?: Record<string, string>;
        success?: (res: { data?: any }) => void;
        fail?: (err: any) => void;
    }) => void;
    openPrivacyContract?: (options: { success?: () => void; fail?: (err: any) => void }) => void;
};

const DEFAULT_CONFIG: Required<DouyinLoginConfig> = {
    loginEndpoint: "",
    privacyText: "Privacy Policy",
    tokenStorageKey: "douyin_login_token_v1",
    sessionStorageKey: "douyin_login_session_v1",
};

export class DouyinLogin {
    private static config: Required<DouyinLoginConfig> = { ...DEFAULT_CONFIG };
    private static overlay: Laya.Sprite | null = null;
    private static loginPromise: Promise<DouyinLoginSession | null> | null = null;
    private static resolveLogin: ((session: DouyinLoginSession | null) => void) | null = null;
    private static agreedPrivacy: boolean = false;

    public static configure(config: Partial<DouyinLoginConfig>): void {
        this.config = {
            loginEndpoint: String(config.loginEndpoint || this.config.loginEndpoint || "").trim(),
            privacyText: String(config.privacyText || this.config.privacyText || DEFAULT_CONFIG.privacyText),
            tokenStorageKey: String(config.tokenStorageKey || this.config.tokenStorageKey || DEFAULT_CONFIG.tokenStorageKey),
            sessionStorageKey: String(config.sessionStorageKey || this.config.sessionStorageKey || DEFAULT_CONFIG.sessionStorageKey),
        };
    }

    public static getSession(): DouyinLoginSession | null {
        const storage = this.getStorage();
        if (!storage) {
            return null;
        }

        const raw = storage.getItem(this.config.sessionStorageKey);
        if (!raw) {
            return null;
        }

        try {
            const parsed = JSON.parse(raw) as DouyinLoginSession;
            if (!parsed || typeof parsed.token !== "string" || typeof parsed.openid !== "string") {
                return null;
            }
            return parsed;
        } catch {
            return null;
        }
    }

    public static isLoggedIn(): boolean {
        const session = this.getSession();
        return !!session && !!session.token && !!session.openid;
    }

    public static async ensureLogin(): Promise<DouyinLoginSession | null> {
        const existing = this.getSession();
        if (existing) {
            return existing;
        }

        const api = this.getApi();
        if (!api || typeof api.login !== "function" || typeof api.request !== "function") {
            const devSession = this.createDevSession();
            this.saveSession(devSession);
            return devSession;
        }

        if (!this.config.loginEndpoint) {
            const devSession = this.createDevSession();
            this.saveSession(devSession);
            return devSession;
        }

        if (this.loginPromise) {
            return this.loginPromise;
        }

        this.loginPromise = new Promise<DouyinLoginSession | null>((resolve) => {
            this.resolveLogin = resolve;
            this.showOverlay();
        });

        return this.loginPromise;
    }

    public static logout(): void {
        const storage = this.getStorage();
        if (storage) {
            storage.removeItem(this.config.sessionStorageKey);
            storage.removeItem(this.config.tokenStorageKey);
        }
        this.agreedPrivacy = false;
    }

    private static showOverlay(): void {
        const stage = Laya.stage as any;
        if (!stage) {
            const devSession = this.createDevSession();
            this.finishLogin(devSession);
            return;
        }

        this.destroyOverlay();

        const mask = new Laya.Sprite();
        mask.size(Laya.stage.width, Laya.stage.height);
        mask.graphics.drawRect(0, 0, Laya.stage.width, Laya.stage.height, "#000000");
        mask.alpha = 0.72;
        mask.mouseEnabled = true;

        const panel = new Laya.Sprite();
        const panelWidth = 560;
        const panelHeight = 360;
        panel.size(panelWidth, panelHeight);
        panel.pos((Laya.stage.width - panelWidth) / 2, (Laya.stage.height - panelHeight) / 2);
        panel.graphics.drawRect(0, 0, panelWidth, panelHeight, "#FFFFFF");
        panel.mouseEnabled = true;

        const title = this.createText("Douyin Login", 34, "#1f1f1f", true);
        title.pos(36, 28);

        const description = this.createText(
            "Sign in to create or bind your game account. Progress can sync across devices.",
            22,
            "#5a5a5a",
            false,
            488,
        );
        description.wordWrap = true;
        description.pos(36, 82);
        description.height = 72;

        const checkBox = this.createCheckBox();
        checkBox.pos(36, 176);

        const checkText = this.createText("I agree to the", 20, "#4d4d4d", false);
        checkText.pos(70, 177);

        const privacy = this.createLinkText(this.config.privacyText);
        privacy.pos(180, 177);
        privacy.on(Laya.Event.CLICK, this, () => {
            this.openPrivacyContract();
        });

        const agreeHint = this.createText("Login is disabled until you agree.", 18, "#999999", false);
        agreeHint.pos(36, 214);

        const statusText = this.createText("", 18, "#c0392b", false, 488);
        statusText.pos(36, 252);
        statusText.height = 28;

        const loginButton = this.createButton("Douyin Login", "#2d7cff", "#ffffff");
        loginButton.pos(36, 292);
        loginButton.on(Laya.Event.CLICK, this, () => {
            this.beginLogin(statusText, checkBox, loginButton);
        });

        const hint = this.createText("First sign-in will create the account automatically.", 16, "#8a8a8a", false, 488);
        hint.pos(214, 308);
        hint.height = 24;

        panel.addChild(title);
        panel.addChild(description);
        panel.addChild(checkBox);
        panel.addChild(checkText);
        panel.addChild(privacy);
        panel.addChild(agreeHint);
        panel.addChild(statusText);
        panel.addChild(loginButton);
        panel.addChild(hint);

        mask.on(Laya.Event.CLICK, this, () => {
            // Keep the login flow blocking until the user either logs in or we run in dev mode.
        });

        this.overlay = new Laya.Sprite();
        this.overlay.addChild(mask);
        this.overlay.addChild(panel);
        stage.addChild(this.overlay);

        this.bindCheckbox(checkBox, loginButton, statusText);
    }

    private static bindCheckbox(checkBox: Laya.Sprite, loginButton: Laya.Sprite, statusText: Laya.Text): void {
        const tick = checkBox.getChildByName("tick") as Laya.Text | null;
        const update = (agreed: boolean) => {
            this.agreedPrivacy = agreed;
            if (tick) {
                tick.text = agreed ? "✓" : "";
            }
            loginButton.alpha = agreed ? 1 : 0.55;
            statusText.text = agreed ? "" : "Please agree to the privacy policy first.";
        };

        update(false);
        checkBox.on(Laya.Event.CLICK, this, () => {
            update(!this.agreedPrivacy);
        });
    }

    private static async beginLogin(statusText: Laya.Text, checkBox: Laya.Sprite, loginButton: Laya.Sprite): Promise<void> {
        if (!this.agreedPrivacy) {
            statusText.text = "Please agree to the privacy policy first.";
            return;
        }

        const api = this.getApi();
        if (!api || typeof api.login !== "function" || typeof api.request !== "function" || !this.config.loginEndpoint) {
            const devSession = this.createDevSession();
            this.finishLogin(devSession);
            return;
        }

        loginButton.mouseEnabled = false;
        statusText.text = "Requesting login code...";

        try {
            const code = await this.requestLoginCode();
            statusText.text = "Creating session...";
            const session = await this.exchangeCode(code);
            this.saveSession(session);
            this.finishLogin(session);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error || "Login failed");
            statusText.text = message;
            loginButton.mouseEnabled = true;
        }
    }

    private static finishLogin(session: DouyinLoginSession | null): void {
        this.destroyOverlay();
        const resolve = this.resolveLogin;
        this.resolveLogin = null;
        this.loginPromise = null;
        if (resolve) {
            resolve(session);
        }
    }

    private static destroyOverlay(): void {
        if (this.overlay && !this.overlay.destroyed) {
            this.overlay.removeSelf();
            this.overlay.destroy(true);
        }
        this.overlay = null;
    }

    private static requestLoginCode(): Promise<string> {
        const api = this.getApi();
        if (!api || typeof api.login !== "function") {
            return Promise.reject(new Error("tt.login unavailable"));
        }

        return new Promise<string>((resolve, reject) => {
            api.login?.({
                success: (res) => {
                    const code = String(res?.code || "").trim();
                    if (!code) {
                        reject(new Error("Missing login code"));
                        return;
                    }
                    resolve(code);
                },
                fail: (err) => {
                    reject(new Error(err?.errMsg || err?.message || "tt.login failed"));
                },
            });
        });
    }

    private static exchangeCode(code: string): Promise<DouyinLoginSession> {
        const api = this.getApi();
        if (!api || typeof api.request !== "function") {
            return Promise.reject(new Error("tt.request unavailable"));
        }

        const endpoint = String(this.config.loginEndpoint || "").trim();
        if (!endpoint) {
            return Promise.reject(new Error("Login endpoint is not configured"));
        }

        return new Promise<DouyinLoginSession>((resolve, reject) => {
            api.request?.({
                url: endpoint,
                method: "POST",
                header: {
                    "content-type": "application/json",
                },
                data: {
                    code,
                },
                success: (res) => {
                    const body = res?.data || {};
                    const errno = Number(body?.err_no ?? body?.errno ?? -1);
                    if (errno !== 0) {
                        reject(new Error(body?.err_msg || body?.err_tips || body?.message || "Login backend returned an error"));
                        return;
                    }

                    const data = body?.data || {};
                    const token = String(data?.token || "").trim();
                    const openid = String(data?.openid || "").trim();
                    if (!token || !openid) {
                        reject(new Error("Login backend returned incomplete data"));
                        return;
                    }

                    resolve({
                        token,
                        openid,
                        unionid: String(data?.unionid || "").trim() || undefined,
                        created: !!data?.created,
                        createdAt: Number(data?.createdAt || Date.now()),
                        lastLoginAt: Number(data?.lastLoginAt || Date.now()),
                    });
                },
                fail: (err) => {
                    reject(new Error(err?.errMsg || err?.message || "Login request failed"));
                },
            });
        });
    }

    private static saveSession(session: DouyinLoginSession): void {
        const storage = this.getStorage();
        if (!storage) {
            return;
        }

        storage.setItem(this.config.tokenStorageKey, session.token);
        storage.setItem(this.config.sessionStorageKey, JSON.stringify(session));
    }

    private static createDevSession(): DouyinLoginSession {
        const now = Date.now();
        return {
            token: `dev_${now}`,
            openid: "dev-openid",
            unionid: "dev-unionid",
            created: true,
            createdAt: now,
            lastLoginAt: now,
        };
    }

    private static openPrivacyContract(): void {
        const api = this.getApi();
        if (!api || typeof api.openPrivacyContract !== "function") {
            return;
        }

        api.openPrivacyContract({
            fail: (err) => {
                console.warn("[DouyinLogin] openPrivacyContract failed", err);
            },
        });
    }

    private static createText(text: string, fontSize: number, color: string, bold: boolean, width?: number): Laya.Text {
        const label = new Laya.Text();
        label.text = text;
        label.fontSize = fontSize;
        label.color = color;
        label.bold = bold;
        label.width = width || 0;
        label.wordWrap = !!width;
        label.leading = 6;
        label.align = "left";
        return label;
    }

    private static createLinkText(text: string): Laya.Text {
        const label = this.createText(text, 20, "#2d7cff", false);
        label.underline = true;
        label.mouseEnabled = true;
        return label;
    }

    private static createButton(text: string, backgroundColor: string, color: string): Laya.Sprite {
        const button = new Laya.Sprite();
        button.size(170, 48);
        button.graphics.drawRect(0, 0, 170, 48, backgroundColor);
        button.mouseEnabled = true;
        const label = this.createText(text, 20, color, true, 170);
        label.align = "center";
        label.valign = "middle";
        label.height = 48;
        button.addChild(label);
        return button;
    }

    private static createCheckBox(): Laya.Sprite {
        const box = new Laya.Sprite();
        box.size(22, 22);
        box.graphics.drawRect(0, 0, 22, 22, "#ffffff", "#4d4d4d", 1);
        box.mouseEnabled = true;
        const tick = this.createText("", 18, "#2d7cff", true, 22);
        tick.name = "tick";
        tick.align = "center";
        tick.valign = "middle";
        tick.height = 22;
        box.addChild(tick);
        return box;
    }

    private static getApi(): DouyinLoginApi | null {
        const scope = globalThis as any;
        return (scope && scope.tt) ? (scope.tt as DouyinLoginApi) : null;
    }

    private static getStorage(): Storage | null {
        const scope = globalThis as any;
        if (!scope || !scope.localStorage) {
            return null;
        }
        return scope.localStorage as Storage;
    }
}
