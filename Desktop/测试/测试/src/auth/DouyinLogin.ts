import { DataManager } from "../systems/datamanager";

export interface DouyinLoginConfig {
    loginEndpoint: string;
    privacyText?: string;
    tokenStorageKey?: string;
    sessionStorageKey?: string;
    postLoginSceneUrl?: string;
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

type LoginPanel = {
    overlay: Laya.Sprite;
    statusText: Laya.Text;
    sessionText: Laya.Text;
    endpointInput: any;
    privacyCheck: Laya.Sprite;
    loginButton: Laya.Sprite;
    logoutButton: Laya.Sprite;
    continueButton: Laya.Sprite;
    closeButton: Laya.Sprite;
    endpointHint: Laya.Text;
    loginButtonLabel: Laya.Text;
    continueButtonLabel: Laya.Text;
};

const DEFAULT_CONFIG: Required<DouyinLoginConfig> = {
    loginEndpoint: "",
    privacyText: "Privacy Policy",
    tokenStorageKey: "douyin_login_token_v1",
    sessionStorageKey: "douyin_login_session_v1",
    postLoginSceneUrl: "scenes/cunzhuang.ls",
};

const ENDPOINT_STORAGE_KEY = "douyin_login_endpoint_v1";

export class DouyinLogin {
    private static config: Required<DouyinLoginConfig> = { ...DEFAULT_CONFIG };
    private static panel: LoginPanel | null = null;
    private static loginPromise: Promise<DouyinLoginSession | null> | null = null;
    private static resolveLogin: ((session: DouyinLoginSession | null) => void) | null = null;
    private static agreedPrivacy: boolean = false;
    private static busy: boolean = false;
    private static postLoginSceneUrl: string = DEFAULT_CONFIG.postLoginSceneUrl;

    public static configure(config: Partial<DouyinLoginConfig>): void {
        this.config = {
            loginEndpoint: String(config.loginEndpoint || this.config.loginEndpoint || "").trim(),
            privacyText: String(config.privacyText || this.config.privacyText || DEFAULT_CONFIG.privacyText),
            tokenStorageKey: String(config.tokenStorageKey || this.config.tokenStorageKey || DEFAULT_CONFIG.tokenStorageKey),
            sessionStorageKey: String(config.sessionStorageKey || this.config.sessionStorageKey || DEFAULT_CONFIG.sessionStorageKey),
            postLoginSceneUrl: String(config.postLoginSceneUrl || this.config.postLoginSceneUrl || DEFAULT_CONFIG.postLoginSceneUrl).trim(),
        };
        this.postLoginSceneUrl = this.config.postLoginSceneUrl;
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

    public static openLoginPanel(): void {
        this.ensurePanel();
    }

    public static async ensureLogin(): Promise<DouyinLoginSession | null> {
        const existing = this.getSession();
        if (existing) {
            return existing;
        }

        if (this.loginPromise) {
            return this.loginPromise;
        }

        if (!Laya.stage) {
            const devSession = this.createDevSession();
            this.saveSession(devSession);
            return devSession;
        }

        if (!this.hasInteractiveApi()) {
            const devSession = this.createDevSession();
            this.saveSession(devSession);
            return devSession;
        }

        this.loginPromise = new Promise<DouyinLoginSession | null>((resolve) => {
            this.resolveLogin = resolve;
            this.ensurePanel();
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
        this.busy = false;
        this.renderPanel();
    }

    private static ensurePanel(): void {
        const stage = Laya.stage as any;
        if (!stage) {
            return;
        }

        if (this.panel && this.panel.overlay && !this.panel.overlay.destroyed) {
            this.renderPanel();
            return;
        }

        this.panel = this.createPanel();
        stage.addChild(this.panel.overlay);
        this.panel.endpointInput.text = this.resolveLoginEndpoint();
        this.renderPanel();
    }

    private static createPanel(): LoginPanel {
        const stageWidth = Math.max(1, Number(Laya.stage?.width || 1334));
        const stageHeight = Math.max(1, Number(Laya.stage?.height || 750));

        const overlay = new Laya.Sprite();
        overlay.size(stageWidth, stageHeight);
        overlay.mouseEnabled = true;

        const mask = new Laya.Sprite();
        mask.size(stageWidth, stageHeight);
        mask.graphics.drawRect(0, 0, stageWidth, stageHeight, "#07111f");
        mask.alpha = 0.8;
        mask.mouseEnabled = true;
        overlay.addChild(mask);

        const panelWidth = 780;
        const panelHeight = 540;
        const panel = new Laya.Sprite();
        panel.size(panelWidth, panelHeight);
        panel.pos((stageWidth - panelWidth) / 2, (stageHeight - panelHeight) / 2);
        panel.graphics.drawRect(0, 0, panelWidth, panelHeight, "#111826");
        panel.mouseEnabled = true;
        overlay.addChild(panel);

        const accent = new Laya.Sprite();
        accent.size(panelWidth, 10);
        accent.graphics.drawRect(0, 0, panelWidth, 10, "#2d7cff");
        panel.addChild(accent);

        const title = this.createText("抖音账号登录", 34, "#f4f7fb", true, 420);
        title.pos(34, 24);
        panel.addChild(title);

        const subtitle = this.createText("点击菜单里的登录按钮打开此面板。所有登录 UI 都是这里动态新建的。", 18, "#97a6ba", false, 700);
        subtitle.wordWrap = true;
        subtitle.pos(34, 70);
        subtitle.height = 52;
        panel.addChild(subtitle);

        const sessionCard = this.createCard(34, 132, 712, 90, "#0e1522");
        panel.addChild(sessionCard);

        const sessionTitle = this.createText("当前会话", 20, "#cbd5e1", true, 160);
        sessionTitle.pos(18, 14);
        sessionCard.addChild(sessionTitle);

        const sessionText = this.createText("", 18, "#e2e8f0", false, 660);
        sessionText.wordWrap = true;
        sessionText.pos(18, 42);
        sessionText.height = 34;
        sessionCard.addChild(sessionText);

        const endpointCard = this.createCard(34, 236, 712, 132, "#0e1522");
        panel.addChild(endpointCard);

        const endpointTitle = this.createText("登录后端地址", 20, "#cbd5e1", true, 220);
        endpointTitle.pos(18, 14);
        endpointCard.addChild(endpointTitle);

        const endpointDesc = this.createText("一键登录需要一个后端接口，用来把抖音登录 code 换成你自己的 token。这个地址会保存到本地。", 16, "#94a3b8", false, 660);
        endpointDesc.wordWrap = true;
        endpointDesc.pos(18, 42);
        endpointDesc.height = 36;
        endpointCard.addChild(endpointDesc);

        const endpointFrame = this.createCard(18, 82, 540, 36, "#111827");
        endpointCard.addChild(endpointFrame);

        const endpointInput = this.createEndpointInput(520, 34);
        endpointInput.pos(8, 1);
        endpointFrame.addChild(endpointInput);

        const endpointHint = this.createText("空地址只会在开发环境创建本地会话，正式环境请填写真实后端。", 15, "#64748b", false, 660);
        endpointHint.wordWrap = true;
        endpointHint.pos(18, 104);
        endpointHint.height = 22;
        endpointCard.addChild(endpointHint);

        const privacyCard = this.createCard(34, 382, 712, 58, "#0e1522");
        panel.addChild(privacyCard);

        const privacyCheck = this.createCheckBox();
        privacyCheck.pos(18, 18);
        privacyCard.addChild(privacyCheck);

        const privacyText = this.createText("我已阅读并同意", 18, "#cbd5e1", false, 140);
        privacyText.pos(52, 17);
        privacyCard.addChild(privacyText);

        const privacyLink = this.createLinkText(this.config.privacyText);
        privacyLink.pos(176, 17);
        privacyLink.on(Laya.Event.CLICK, this, () => {
            this.openPrivacyContract();
        });
        privacyCard.addChild(privacyLink);

        const statusText = this.createText("", 18, "#fca5a5", false, 712);
        statusText.wordWrap = true;
        statusText.pos(34, 452);
        statusText.height = 28;
        panel.addChild(statusText);

        const loginButton = this.createButton("一键登录", "#2d7cff", "#ffffff", 170);
        loginButton.pos(34, 480);
        panel.addChild(loginButton);

        const logoutButton = this.createButton("退出登录", "#4b1f24", "#fecaca", 170);
        logoutButton.pos(222, 480);
        panel.addChild(logoutButton);

        const continueButton = this.createButton("进入游戏", "#166534", "#dcfce7", 170);
        continueButton.pos(410, 480);
        panel.addChild(continueButton);

        const closeButton = this.createButton("关闭", "#162033", "#dbeafe", 124);
        closeButton.pos(598, 480);
        panel.addChild(closeButton);

        const footer = this.createText("登录成功后会自动保存 token 与 session，然后可以直接进入游戏。", 15, "#8190a5", false, 720);
        footer.wordWrap = true;
        footer.pos(34, 520);
        footer.height = 20;
        panel.addChild(footer);

        mask.on(Laya.Event.CLICK, this, () => {
            // keep the panel open
        });

        loginButton.on(Laya.Event.CLICK, this, () => {
            void this.beginLogin();
        });

        logoutButton.on(Laya.Event.CLICK, this, () => {
            this.logout();
        });

        continueButton.on(Laya.Event.CLICK, this, () => {
            this.enterPostLoginScene();
        });

        closeButton.on(Laya.Event.CLICK, this, () => {
            this.closePanel(true);
        });

        return {
            overlay,
            statusText,
            sessionText,
            endpointInput,
            privacyCheck,
            loginButton,
            logoutButton,
            continueButton,
            closeButton,
            endpointHint,
            loginButtonLabel: loginButton.getChildByName("label") as Laya.Text,
            continueButtonLabel: continueButton.getChildByName("label") as Laya.Text,
        };
    }

    private static renderPanel(): void {
        const panel = this.panel;
        if (!panel) {
            return;
        }

        const session = this.getSession();
        const endpoint = this.resolveLoginEndpoint();
        const hasApi = this.hasInteractiveApi();

        if (session) {
            panel.sessionText.text = [
                "已登录",
                `openid: ${this.maskValue(session.openid, 4)}`,
                session.unionid ? `unionid: ${this.maskValue(session.unionid, 4)}` : "",
                `created: ${session.created ? "yes" : "no"}`,
                `lastLoginAt: ${new Date(session.lastLoginAt).toLocaleString()}`,
            ].filter(Boolean).join("    ");
        } else {
            panel.sessionText.text = "未登录。输入后端地址并同意隐私协议后，点击一键登录。";
        }

        panel.endpointHint.text = endpoint ? `当前保存的后端地址：${endpoint}` : "空地址只会在开发环境创建本地会话，正式环境请填写真实后端。";

        if (session) {
            panel.loginButtonLabel.text = "重新登录";
        } else if (!hasApi) {
            panel.loginButtonLabel.text = "开发会话";
        } else {
            panel.loginButtonLabel.text = "一键登录";
        }

        panel.continueButtonLabel.text = "进入游戏";
        panel.logoutButton.visible = !!session;
        panel.logoutButton.mouseEnabled = !!session && !this.busy;
        panel.continueButton.visible = !!session;
        panel.continueButton.mouseEnabled = !!session && !this.busy;
        panel.closeButton.mouseEnabled = !this.busy;
        this.setButtonEnabled(panel.loginButton, !this.busy);

        if (!hasApi) {
            panel.statusText.color = "#fbbf24";
            panel.statusText.text = "当前环境未提供 tt.login / tt.request，点击登录会创建本地开发会话。";
        } else if (!endpoint) {
            panel.statusText.color = "#fca5a5";
            panel.statusText.text = "请先填写登录后端地址。";
        } else if (!this.agreedPrivacy) {
            panel.statusText.color = "#fca5a5";
            panel.statusText.text = "请先勾选隐私协议。";
        } else if (this.busy) {
            panel.statusText.color = "#93c5fd";
            panel.statusText.text = "正在登录，请稍候...";
        } else if (session) {
            panel.statusText.color = "#86efac";
            panel.statusText.text = "登录成功，下一步可以进入游戏。";
        } else {
            panel.statusText.color = "#cbd5e1";
            panel.statusText.text = "填写完成后点击一键登录。";
        }

        this.renderPrivacy(panel);
    }

    private static renderPrivacy(panel: LoginPanel): void {
        const tick = panel.privacyCheck.getChildByName("tick") as Laya.Text | null;
        if (tick) {
            tick.text = this.agreedPrivacy ? "✓" : "";
        }
    }

    private static async beginLogin(): Promise<void> {
        if (!this.panel || this.busy) {
            return;
        }

        const endpoint = this.normalizeEndpoint(String(this.panel.endpointInput?.text || ""));
        this.saveLoginEndpoint(endpoint);

        if (!this.agreedPrivacy) {
            this.renderPanel();
            if (this.panel) {
                this.panel.statusText.color = "#fca5a5";
                this.panel.statusText.text = "请先勾选隐私协议。";
            }
            return;
        }

        const api = this.getApi();
        const canRealLogin = !!api && typeof api.login === "function" && typeof api.request === "function" && !!endpoint;

        this.busy = true;
        this.renderPanel();

        try {
            if (!api) {
                const devSession = this.createDevSession();
                this.saveSession(devSession);
                this.finishLogin(devSession);
                return;
            }

            if (!canRealLogin) {
                throw new Error("请先填写登录后端地址，然后再点击一键登录。");
            }

            const code = await this.requestLoginCode();
            const session = await this.exchangeCode(code, endpoint);
            this.saveSession(session);
            this.finishLogin(session);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error || "Login failed");
            this.busy = false;
            this.renderPanel();
            if (this.panel) {
                this.panel.statusText.color = "#fca5a5";
                this.panel.statusText.text = message;
            }
        }
    }

    private static finishLogin(session: DouyinLoginSession | null): void {
        const resolve = this.resolveLogin;
        this.resolveLogin = null;
        this.loginPromise = null;
        this.busy = false;
        if (resolve) {
            resolve(session);
        }
        this.renderPanel();
    }

    private static closePanel(resolvePending: boolean): void {
        if (resolvePending && this.resolveLogin) {
            const resolve = this.resolveLogin;
            this.resolveLogin = null;
            this.loginPromise = null;
            resolve(null);
        }

        this.busy = false;
        this.destroyPanel();
    }

    private static enterPostLoginScene(): void {
        const url = this.normalizeEndpoint(this.postLoginSceneUrl || DEFAULT_CONFIG.postLoginSceneUrl);
        if (!url) {
            this.closePanel(false);
            return;
        }

        this.closePanel(false);
        DataManager.getInstance().enterScene(url);
        Laya.Scene.open(url);
    }

    private static destroyPanel(): void {
        const overlay = this.panel?.overlay || null;
        this.panel = null;

        if (!overlay || overlay.destroyed) {
            return;
        }

        // Defer teardown so the current click handler can finish cleanly.
        Laya.timer.once(0, null, () => {
            if (!overlay.destroyed) {
                if (overlay.parent) {
                    overlay.removeSelf();
                }
                overlay.destroy(true);
            }
        });
    }

    private static requestLoginCode(): Promise<string> {
        const api = this.getApi();
        if (!api || typeof api.login !== "function") {
            return Promise.reject(new Error("tt.login unavailable"));
        }

        return new Promise<string>((resolve, reject) => {
            api.login?.({
                success: (res) => {
                    const code = String(res?.code || res?.anonymous_code || "").trim();
                    if (!code) {
                        reject(new Error("登录接口没有返回 code"));
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

    private static exchangeCode(code: string, endpoint: string): Promise<DouyinLoginSession> {
        const api = this.getApi();
        if (!api || typeof api.request !== "function") {
            return Promise.reject(new Error("tt.request unavailable"));
        }

        const normalizedEndpoint = this.normalizeEndpoint(endpoint);
        if (!normalizedEndpoint) {
            return Promise.reject(new Error("登录后端地址未配置"));
        }

        return new Promise<DouyinLoginSession>((resolve, reject) => {
            api.request?.({
                url: normalizedEndpoint,
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
                        reject(new Error(body?.err_msg || body?.err_tips || body?.message || "登录后端返回错误"));
                        return;
                    }

                    const data = body?.data || {};
                    const token = String(data?.token || "").trim();
                    const openid = String(data?.openid || "").trim();
                    if (!token || !openid) {
                        reject(new Error("登录后端没有返回完整的 token / openid"));
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

    private static saveLoginEndpoint(endpoint: string): void {
        const normalized = this.normalizeEndpoint(endpoint);
        this.config.loginEndpoint = normalized;

        const storage = this.getStorage();
        if (!storage) {
            return;
        }

        if (normalized) {
            storage.setItem(ENDPOINT_STORAGE_KEY, normalized);
        } else {
            storage.removeItem(ENDPOINT_STORAGE_KEY);
        }
    }

    private static resolveLoginEndpoint(): string {
        const storage = this.getStorage();
        const stored = storage ? String(storage.getItem(ENDPOINT_STORAGE_KEY) || "").trim() : "";
        const globalEndpoint = this.normalizeEndpoint(String((globalThis as any).__DOUYIN_LOGIN_ENDPOINT__ || ""));
        return this.normalizeEndpoint(this.config.loginEndpoint || stored || globalEndpoint);
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
            fail: () => {
                // ignore
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
        const label = this.createText(text, 18, "#60a5fa", false);
        label.underline = true;
        label.mouseEnabled = true;
        return label;
    }

    private static createButton(text: string, backgroundColor: string, color: string, width: number): Laya.Sprite {
        const button = new Laya.Sprite();
        button.size(width, 48);
        button.graphics.drawRect(0, 0, width, 48, backgroundColor);
        button.mouseEnabled = true;

        const label = this.createText(text, 20, color, true, width);
        label.name = "label";
        label.align = "center";
        label.valign = "middle";
        label.height = 48;
        button.addChild(label);

        return button;
    }

    private static createCard(x: number, y: number, width: number, height: number, color: string): Laya.Sprite {
        const card = new Laya.Sprite();
        card.pos(x, y);
        card.size(width, height);
        card.graphics.drawRect(0, 0, width, height, color);
        return card;
    }

    private static createCheckBox(): Laya.Sprite {
        const box = new Laya.Sprite();
        box.size(22, 22);
        box.graphics.drawRect(0, 0, 22, 22, "#111827", "#94a3b8", 1);
        box.mouseEnabled = true;
        const tick = this.createText("", 16, "#60a5fa", true, 22);
        tick.name = "tick";
        tick.align = "center";
        tick.valign = "middle";
        tick.height = 22;
        box.addChild(tick);

        box.on(Laya.Event.CLICK, this, () => {
            this.agreedPrivacy = !this.agreedPrivacy;
            this.renderPanel();
        });

        return box;
    }

    private static createEndpointInput(width: number, height: number): any {
        const runtime = Laya as any;
        const InputCtor = typeof runtime.Input === "function" ? runtime.Input : (typeof runtime.TextInput === "function" ? runtime.TextInput : null);
        if (InputCtor) {
            const input = new InputCtor();
            input.size(width, height);
            input.prompt = "https://example.com/api/douyin/login";
            input.editable = true;
            input.fontSize = 18;
            input.color = "#f8fafc";
            input.bold = false;
            input.padding = [8, 12, 8, 12];
            input.maxLength = 512;
            return input;
        }

        const fallback = new Laya.Sprite() as any;
        fallback.size(width, height);
        fallback.graphics.drawRect(0, 0, width, height, "#111827", "#334155", 1);
        const label = this.createText("输入框不可用", 18, "#94a3b8", false, width - 16);
        label.pos(8, 6);
        fallback.addChild(label);
        return fallback;
    }

    private static setButtonEnabled(button: Laya.Sprite, enabled: boolean): void {
        const owner = button as any;
        owner.mouseEnabled = enabled;
        button.alpha = enabled ? 1 : 0.58;
    }

    private static hasInteractiveApi(): boolean {
        const api = this.getApi();
        return !!api && typeof api.login === "function" && typeof api.request === "function";
    }

    private static normalizeEndpoint(value: string): string {
        return String(value || "").trim();
    }

    private static maskValue(value: string, visibleCount: number): string {
        const raw = String(value || "").trim();
        if (raw.length <= visibleCount) {
            return raw;
        }

        return `${raw.slice(0, visibleCount)}...${raw.slice(-visibleCount)}`;
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
