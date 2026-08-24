import { DebugConfig } from "./DebugConfig";
import "./DebugPanel";

declare const Laya: any;

export class DebugGlobalUI {
    private static readonly ROOT_NAME = "__DebugGlobalRoot";
    private static readonly PANEL_NAME = "__DebugPanel";
    private static readonly TOGGLE_NAME = "__DebugToggle";
    private static readonly PANEL_DEFAULT_VISIBLE = false;
    private static loading: boolean = false;
    private static installed: boolean = false;
    private static hasLoggedStageMissing: boolean = false;
    private static hasLoggedLoadingSkip: boolean = false;
    private static readonly LOG_PREFIX = "[DebugGlobalUI]";

    public static install(): void {
        if (!DebugConfig.ENABLE_DEBUG_UI) {
            DebugGlobalUI.log("install skipped: debug ui disabled");
            return;
        }

        if (DebugGlobalUI.installed) {
            DebugGlobalUI.log("install skipped: already installed");
            DebugGlobalUI.ensure();
            return;
        }

        DebugGlobalUI.installed = true;
        DebugGlobalUI.log(`install start, prefab=${DebugConfig.DEBUG_PANEL_PREFAB_URL}`);
        DebugGlobalUI.ensureWhenStageReady();
    }

    public static ensure(): void {
        if (!DebugConfig.ENABLE_DEBUG_UI) {
            DebugGlobalUI.log("ensure skipped: debug ui disabled");
            return;
        }

        if (DebugGlobalUI.loading) {
            if (!DebugGlobalUI.hasLoggedLoadingSkip) {
                DebugGlobalUI.hasLoggedLoadingSkip = true;
                DebugGlobalUI.log("ensure skipped: prefab is loading");
            }
            return;
        }

        const stage = Laya.stage;
        if (!stage) {
            if (!DebugGlobalUI.hasLoggedStageMissing) {
                DebugGlobalUI.hasLoggedStageMissing = true;
                DebugGlobalUI.log("ensure skipped: Laya.stage is missing");
            }
            return;
        }

        DebugGlobalUI.hasLoggedStageMissing = false;
        const root = DebugGlobalUI.ensureRoot(stage);
        if (root.getChildByName(DebugGlobalUI.PANEL_NAME)) {
            DebugGlobalUI.ensureToggleButton(root);
            DebugGlobalUI.keepOnTop(root);
            return;
        }

        DebugGlobalUI.loading = true;
        DebugGlobalUI.hasLoggedLoadingSkip = false;
        DebugGlobalUI.logRootState("start loading prefab", root);
        void DebugGlobalUI.loadPanel(root);
    }

    private static ensureWhenStageReady(): void {
        const tryEnsure = () => DebugGlobalUI.ensure();
        tryEnsure();
        if (Laya.timer) {
            Laya.timer.loop(1000, DebugGlobalUI, tryEnsure);
        }
    }

    private static ensureRoot(stage: any): any {
        let root = stage.getChildByName(DebugGlobalUI.ROOT_NAME) as any;
        if (root) {
            return root;
        }

        root = new Laya.Sprite();
        root.name = DebugGlobalUI.ROOT_NAME;
        root.zOrder = 999990;
        root.mouseEnabled = true;
        if ("mouseThrough" in root) {
            root.mouseThrough = true;
        }
        root.size(Math.max(1, stage.width || 1334), Math.max(1, stage.height || 750));
        stage.addChild(root);
        DebugGlobalUI.keepOnTop(root);
        DebugGlobalUI.logRootState("root created", root);
        return root;
    }

    private static async loadPanel(root: any): Promise<void> {
        try {
            const loaderType = Laya.Loader && Laya.Loader.HIERARCHY ? Laya.Loader.HIERARCHY : undefined;
            DebugGlobalUI.log(`loading prefab: url=${DebugConfig.DEBUG_PANEL_PREFAB_URL}, loaderType=${loaderType || "default"}`);
            const prefab = loaderType
                ? await Laya.loader.load(DebugConfig.DEBUG_PANEL_PREFAB_URL, null, null, loaderType)
                : await Laya.loader.load(DebugConfig.DEBUG_PANEL_PREFAB_URL);
            DebugGlobalUI.log(`prefab loaded: ${DebugGlobalUI.describeNode(prefab)}`);
            const panel = DebugGlobalUI.createPanelFromPrefab(prefab);
            if (!panel) {
                DebugGlobalUI.warn("prefab loaded, but panel create failed; using fallback panel");
                const fallbackPanel = DebugGlobalUI.createFallbackPanel("Debug prefab loaded, but create() returned empty.");
                fallbackPanel.visible = DebugGlobalUI.PANEL_DEFAULT_VISIBLE;
                root.addChild(fallbackPanel);
                DebugGlobalUI.ensureToggleButton(root);
                DebugGlobalUI.keepOnTop(root);
                DebugGlobalUI.logRootState("fallback panel added after create failed", root);
                return;
            }

            panel.name = DebugGlobalUI.PANEL_NAME;
            panel.x = 20;
            panel.y = 20;
            panel.zOrder = 2;
            panel.visible = DebugGlobalUI.PANEL_DEFAULT_VISIBLE;
            root.addChild(panel);
            DebugGlobalUI.ensureToggleButton(root);
            DebugGlobalUI.keepOnTop(root);
            DebugGlobalUI.logPanelState("panel added", panel, root);
        } catch (error) {
            console.error("[DebugGlobalUI] load debug panel failed", error);
            const fallbackPanel = DebugGlobalUI.createFallbackPanel(`Debug prefab load failed: ${error instanceof Error ? error.message : String(error)}`);
            fallbackPanel.visible = DebugGlobalUI.PANEL_DEFAULT_VISIBLE;
            root.addChild(fallbackPanel);
            DebugGlobalUI.ensureToggleButton(root);
            DebugGlobalUI.keepOnTop(root);
            DebugGlobalUI.logRootState("fallback panel added after load failed", root);
        } finally {
            DebugGlobalUI.loading = false;
            DebugGlobalUI.log("load finished");
        }
    }

    private static createPanelFromPrefab(prefab: any): any {
        if (!prefab) {
            return null;
        }

        if (typeof prefab.create === "function") {
            return prefab.create();
        }

        if (prefab instanceof Laya.Node) {
            return prefab;
        }

        return null;
    }

    private static ensureToggleButton(root: any): any {
        let toggle = root.getChildByName(DebugGlobalUI.TOGGLE_NAME) as any;
        if (toggle) {
            toggle.zOrder = 3;
            return toggle;
        }

        toggle = new Laya.Sprite();
        toggle.name = DebugGlobalUI.TOGGLE_NAME;
        toggle.pos(20, 20);
        toggle.size(86, 36);
        toggle.zOrder = 3;
        toggle.mouseEnabled = true;
        toggle.graphics.drawRect(0, 0, 86, 36, "#111827", "#ffffff", 1);

        const label = new Laya.Text();
        label.name = "Label";
        label.text = "DEBUG";
        label.color = "#ffffff";
        label.fontSize = 18;
        label.bold = true;
        label.width = 86;
        label.height = 36;
        label.align = "center";
        label.valign = "middle";
        label.mouseEnabled = false;
        toggle.addChild(label);

        toggle.on(Laya.Event.CLICK, DebugGlobalUI, DebugGlobalUI.togglePanel);
        root.addChild(toggle);
        DebugGlobalUI.log("toggle button added: x=20, y=20, w=86, h=36");
        return toggle;
    }

    private static togglePanel(): void {
        const root = Laya.stage && Laya.stage.getChildByName(DebugGlobalUI.ROOT_NAME);
        const panel = root && root.getChildByName(DebugGlobalUI.PANEL_NAME);
        if (!panel) {
            DebugGlobalUI.warn("toggle clicked, but debug panel is missing");
            return;
        }

        panel.visible = !panel.visible;
        DebugGlobalUI.keepOnTop(root);
        DebugGlobalUI.log(`panel visible=${panel.visible}`);
    }

    private static createFallbackPanel(message: string): any {
        const panel = new Laya.Sprite();
        panel.name = DebugGlobalUI.PANEL_NAME;
        panel.pos(20, 20);
        panel.size(520, 120);
        panel.zOrder = 2;
        panel.mouseEnabled = true;
        panel.graphics.drawRect(0, 0, 520, 120, "#7f1d1d", "#fca5a5", 2);

        const text = new Laya.Text();
        text.name = "Text";
        text.text = message;
        text.color = "#ffffff";
        text.fontSize = 20;
        text.width = 500;
        text.height = 100;
        text.wordWrap = true;
        text.leading = 6;
        text.pos(10, 10);
        panel.addChild(text);
        return panel;
    }

    private static keepOnTop(root: any): void {
        const stage = Laya.stage;
        if (!stage || !root) {
            return;
        }

        root.zOrder = 999990;
        if (typeof root.size === "function") {
            root.size(Math.max(1, stage.width || 1334), Math.max(1, stage.height || 750));
        }
        if (root.parent !== stage) {
            stage.addChild(root);
        }

        if (typeof stage.updateZOrder === "function") {
            stage.updateZOrder();
        }
    }

    private static log(message: string): void {
        console.info(`${DebugGlobalUI.LOG_PREFIX} ${message}`);
    }

    private static warn(message: string): void {
        console.warn(`${DebugGlobalUI.LOG_PREFIX} ${message}`);
    }

    private static logRootState(message: string, root: any): void {
        const stage = Laya.stage;
        DebugGlobalUI.log(`${message}: stage=${DebugGlobalUI.describeNode(stage)}, root=${DebugGlobalUI.describeNode(root)}, rootChildren=${root && root.numChildren}`);
    }

    private static logPanelState(message: string, panel: any, root: any): void {
        DebugGlobalUI.log(`${message}: panel=${DebugGlobalUI.describeNode(panel)}, parent=${panel && panel.parent && panel.parent.name}, rootChildren=${root && root.numChildren}`);
    }

    private static describeNode(node: any): string {
        if (!node) {
            return "null";
        }

        const name = node.name || "(no name)";
        const type = node.constructor && node.constructor.name ? node.constructor.name : typeof node;
        const x = typeof node.x === "number" ? node.x : "n/a";
        const y = typeof node.y === "number" ? node.y : "n/a";
        const width = typeof node.width === "number" ? node.width : "n/a";
        const height = typeof node.height === "number" ? node.height : "n/a";
        const zOrder = typeof node.zOrder === "number" ? node.zOrder : "n/a";
        const visible = typeof node.visible === "boolean" ? node.visible : "n/a";
        return `${type}(name=${name}, x=${x}, y=${y}, w=${width}, h=${height}, zOrder=${zOrder}, visible=${visible})`;
    }
}
