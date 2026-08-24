import { PlayerController } from "../Player/PlayerController";
import { DataManager, type CraftingStationId, type EquipmentSlotType } from "./datamanager";

declare const Laya: any;

export type RuntimeDiagnosticStatus = "pass" | "warn" | "fail";

export interface RuntimeDiagnosticCheck {
    area: string;
    name: string;
    status: RuntimeDiagnosticStatus;
    message: string;
    details?: unknown;
}

export interface RuntimeDiagnosticReport {
    startedAt: string;
    durationMs: number;
    passed: number;
    warnings: number;
    failed: number;
    checks: RuntimeDiagnosticCheck[];
}

export interface RuntimeDiagnosticOptions {
    includeResourceLoad?: boolean;
}

const SCENE_URLS = [
    "scenes/menu.ls",
    "scenes/cunzhuang.ls",
    "scenes/forest.ls",
    "scenes/mine.ls",
];

const PREFAB_URLS = [
    "prefab/prefab_player.lh",
    "prefab/LayerPrefab/UILayer.lh",
    "prefab/prefab-ui/play_ui.lh",
    "prefab/prefab_interface/Common/HpBar.lh",
    "prefab/prefab_interface/Common/TlBar_1.lh",
    "prefab/prefab_interface/Bag/bag_panel.lh",
    "prefab/prefab_interface/Warehouse/warehouse_panel.lh",
    "prefab/prefab_interface/Mail/MailPanel.lh",
    "prefab/prefab_interface/Crafting/CraftingPanel.lh",
    "prefab/prefab_interface/panel/SidePanel.lh",
    "prefab/prefab_interface/panel/sign_in_panel.lh",
    "prefab/prefab_interface/MapChoose/mapchoose.lh",
];

const CONFIG_URLS = [
    "config/items/materials.json",
    "config/items/foods.json",
    "config/items/weapons.json",
    "config/items/misc.json",
    "config/harvest/drops.json",
];

const EQUIPMENT_SLOTS: EquipmentSlotType[] = ["insertPlate", "helmet", "weapon", "armor"];
const CRAFTING_STATIONS: CraftingStationId[] = ["campfire", "pengrenji", "processing", "equipment", "manufacture", "medicine", "advance"];

export class RuntimeDiagnostics {
    private static readonly ENABLE_RUNTIME_DIAGNOSTICS = false;
    private static readonly TEST_BUTTON_NAME = "__FeatureIntegrityTestButton";
    private static readonly TEST_PANEL_NAME = "__FeatureIntegrityTestPanel";
    private static installingButton: boolean = false;

    public static install(): void {
        if (!RuntimeDiagnostics.ENABLE_RUNTIME_DIAGNOSTICS) {
            return;
        }

        const scope = globalThis as any;
        scope.runFeatureIntegrityTest = (options?: RuntimeDiagnosticOptions) => RuntimeDiagnostics.runAndLog(options);
        scope.FeatureIntegrityTest = RuntimeDiagnostics;
    }

    public static ensureButton(): void {
        if (!RuntimeDiagnostics.ENABLE_RUNTIME_DIAGNOSTICS) {
            return;
        }

        const stage = Laya.stage;
        if (!stage) {
            return;
        }

        if (!RuntimeDiagnostics.findDirectChild(stage, RuntimeDiagnostics.TEST_BUTTON_NAME)) {
            RuntimeDiagnostics.createTestButton(stage);
        }
    }

    public static async runAndLog(options: RuntimeDiagnosticOptions = {}): Promise<RuntimeDiagnosticReport> {
        const report = await RuntimeDiagnostics.run(options);
        RuntimeDiagnostics.logReport(report);
        return report;
    }

    public static async run(options: RuntimeDiagnosticOptions = {}): Promise<RuntimeDiagnosticReport> {
        const startedAtTime = Date.now();
        const checks: RuntimeDiagnosticCheck[] = [];

        await RuntimeDiagnostics.checkDataManager(checks);
        RuntimeDiagnostics.checkPlayerRuntime(checks);
        RuntimeDiagnostics.checkCurrentStage(checks);
        RuntimeDiagnostics.checkPlatformSurface(checks);

        if (options.includeResourceLoad !== false) {
            await RuntimeDiagnostics.checkResourceLoads(checks);
        }

        return RuntimeDiagnostics.createReport(startedAtTime, checks);
    }

    public static async runFromButton(): Promise<void> {
        RuntimeDiagnostics.showTestPanel("Running feature test...");
        const report = await RuntimeDiagnostics.runAndLog();
        RuntimeDiagnostics.showTestPanel(RuntimeDiagnostics.formatPanelText(report));
    }

    private static async checkDataManager(checks: RuntimeDiagnosticCheck[]): Promise<void> {
        const area = "DataManager";
        let dataManager: DataManager;

        try {
            dataManager = DataManager.getInstance();
            await dataManager.loadAll();
            RuntimeDiagnostics.pass(checks, area, "loadAll", "DataManager.loadAll completed");
        } catch (error) {
            RuntimeDiagnostics.fail(checks, area, "loadAll", "DataManager.loadAll failed", RuntimeDiagnostics.formatError(error));
            return;
        }

        RuntimeDiagnostics.checkNoThrow(checks, area, "inventorySnapshot", "Active inventory snapshot is readable", () => {
            const snapshot = dataManager.getInventorySnapshot();
            RuntimeDiagnostics.assert(Array.isArray(snapshot), "Inventory snapshot is not an array");
            RuntimeDiagnostics.assert(snapshot.length === dataManager.getPlayerBagSlotCount(), "Inventory slot count mismatch");
            return { slots: snapshot.length, scope: dataManager.getCurrentScope() };
        });

        RuntimeDiagnostics.checkNoThrow(checks, area, "warehouseSnapshot", "Warehouse snapshot is readable", () => {
            const snapshot = dataManager.getWarehouseSnapshot();
            RuntimeDiagnostics.assert(Array.isArray(snapshot), "Warehouse snapshot is not an array");
            RuntimeDiagnostics.assert(snapshot.length === dataManager.getWarehouseSlotCount(), "Warehouse slot count mismatch");
            return { slots: snapshot.length };
        });

        RuntimeDiagnostics.checkNoThrow(checks, area, "playerStats", "Player HP and stamina are valid", () => {
            const stats = dataManager.getPlayerStats();
            RuntimeDiagnostics.assert(stats.maxHp > 0, "maxHp must be greater than 0");
            RuntimeDiagnostics.assert(stats.currentHp >= 0 && stats.currentHp <= stats.maxHp, "currentHp is out of range");
            RuntimeDiagnostics.assert(stats.maxStamina > 0, "maxStamina must be greater than 0");
            RuntimeDiagnostics.assert(stats.currentStamina >= 0 && stats.currentStamina <= stats.maxStamina, "currentStamina is out of range");
            RuntimeDiagnostics.assert(stats.level > 0, "level must be greater than 0");
            RuntimeDiagnostics.assert(stats.nextLevelExperience > 0, "nextLevelExperience must be greater than 0");
            return stats;
        });

        RuntimeDiagnostics.checkNoThrow(checks, area, "items", "Common item metadata can be resolved", () => {
            const itemIds = ["wood_club", "wood", "water"];
            const resolved = itemIds.map((itemId) => ({
                itemId,
                exists: !!dataManager.resolveItemMeta(itemId),
                fallbackName: dataManager.resolveFallbackName(itemId),
                fallbackIcon: dataManager.resolveFallbackIcon(itemId),
            }));
            RuntimeDiagnostics.assert(resolved.some((item) => item.exists), "No common test item metadata was resolved");
            return resolved;
        });

        RuntimeDiagnostics.checkNoThrow(checks, area, "harvest", "Harvest drop config is readable", () => {
            const drops = dataManager.getHarvestDrops("oak");
            RuntimeDiagnostics.assert(Array.isArray(drops), "oak harvest drops are not an array");
            return { oakDropCount: drops.length };
        });

        RuntimeDiagnostics.checkNoThrow(checks, area, "crafting", "Crafting recipes are readable", () => {
            const result: Record<string, number> = {};
            for (let i = 0; i < CRAFTING_STATIONS.length; i++) {
                const station = CRAFTING_STATIONS[i];
                result[station] = dataManager.getCraftingRecipes(station).length;
            }
            return result;
        });

        RuntimeDiagnostics.checkNoThrow(checks, area, "signIn", "Sign-in rewards are readable", () => {
            const rewards = dataManager.getSignInRewards();
            RuntimeDiagnostics.assert(Array.isArray(rewards), "Sign-in rewards are not an array");
            return { rewardCount: rewards.length };
        });

        RuntimeDiagnostics.checkNoThrow(checks, area, "equipment", "Equipment slots are readable", () => {
            const result: Record<string, unknown> = {};
            for (let i = 0; i < EQUIPMENT_SLOTS.length; i++) {
                const slot = EQUIPMENT_SLOTS[i];
                result[slot] = dataManager.getEquippedItem(slot);
            }
            return result;
        });
    }

    private static checkPlayerRuntime(checks: RuntimeDiagnosticCheck[]): void {
        const area = "Player";
        const player = PlayerController.activeInstance;

        if (!player) {
            RuntimeDiagnostics.warn(checks, area, "activeInstance", "No active player in this scene; run again inside a gameplay scene to check player bindings");
            return;
        }

        RuntimeDiagnostics.pass(checks, area, "activeInstance", "Active player found", { owner: player.owner?.name || null });
        RuntimeDiagnostics.checkNoThrow(checks, area, "snapshot", "Player snapshot is readable", () => player.snapshot());
        RuntimeDiagnostics.checkMethod(checks, area, player, "syncHpFromData");
        RuntimeDiagnostics.checkMethod(checks, area, player, "syncStaminaFromData");
        RuntimeDiagnostics.checkMethod(checks, area, player, "consumeStaminaForCompletedAttack");
        RuntimeDiagnostics.checkMethod(checks, area, player, "syncStatusBarTransform");

        const requiredNodes: Array<[string, unknown]> = [
            ["spineNode", player.spineNode],
            ["attackNode", player.attackNode],
            ["detectNode", player.detectNode],
            ["hpFillNode", player.hpFillNode],
            ["staminaFillNode", player.staminaFillNode],
        ];

        for (let i = 0; i < requiredNodes.length; i++) {
            const item = requiredNodes[i];
            if (item[1]) {
                RuntimeDiagnostics.pass(checks, area, item[0], `${item[0]} is bound`);
            } else {
                RuntimeDiagnostics.fail(checks, area, item[0], `${item[0]} is not bound; drag the node onto the Player prefab`);
            }
        }

        RuntimeDiagnostics.checkNumericRange(checks, area, "hp", player.currentHp, 0, player.maxHp);
        RuntimeDiagnostics.checkNumericRange(checks, area, "stamina", player.currentStamina, 0, player.maxStamina);
        RuntimeDiagnostics.checkNumericRange(checks, area, "attackPower", player.attackPower, 0, Number.POSITIVE_INFINITY);
        RuntimeDiagnostics.checkNumericRange(checks, area, "attackSpeed", player.attackSpeed, 0.1, Number.POSITIVE_INFINITY);
    }

    private static checkCurrentStage(checks: RuntimeDiagnosticCheck[]): void {
        const area = "Stage";
        const stage = Laya.stage;

        if (!stage) {
            RuntimeDiagnostics.warn(checks, area, "stage", "Laya.stage is missing; start the game before checking scene state");
            return;
        }

        RuntimeDiagnostics.pass(checks, area, "stage", "Stage is initialized", { width: stage.width, height: stage.height });

        const nodes = RuntimeDiagnostics.collectNodes(stage);
        RuntimeDiagnostics.pass(checks, area, "nodeTree", "Node tree can be traversed", { nodeCount: nodes.length });

        const loadingPanels = nodes.filter((node) => String(node?.name || "").toLowerCase().includes("loadingpanel"));
        if (loadingPanels.length > 1) {
            RuntimeDiagnostics.fail(checks, area, "loadingPanelCount", "Multiple LoadingPanel nodes exist; duplicated creation or missing destroy is likely", RuntimeDiagnostics.nodeNames(loadingPanels));
        } else {
            RuntimeDiagnostics.pass(checks, area, "loadingPanelCount", "No stacked LoadingPanel nodes detected", { count: loadingPanels.length });
        }

        const sceneLikeNodes = nodes.filter((node) => {
            const url = String((node as any)?.url || "");
            return url.endsWith(".ls");
        });
        if (sceneLikeNodes.length > 1) {
            RuntimeDiagnostics.warn(checks, area, "sceneCount", "Multiple scene-like nodes are on stage; confirm whether this stacking is expected", RuntimeDiagnostics.nodeNames(sceneLikeNodes));
        } else {
            RuntimeDiagnostics.pass(checks, area, "sceneCount", "Stage scene count looks normal", { count: sceneLikeNodes.length });
        }

        RuntimeDiagnostics.checkComponentPresence(checks, nodes, "Joystick", false);
        RuntimeDiagnostics.checkComponentPresence(checks, nodes, "attack", false);
        RuntimeDiagnostics.checkComponentPresence(checks, nodes, "run", false);
        RuntimeDiagnostics.checkComponentPresence(checks, nodes, "BagPanel", false);
        RuntimeDiagnostics.checkComponentPresence(checks, nodes, "WarehousePanel", false);
        RuntimeDiagnostics.checkComponentPresence(checks, nodes, "MailPanel", false);
        RuntimeDiagnostics.checkComponentPresence(checks, nodes, "CraftingPanel", false);
    }

    private static checkPlatformSurface(checks: RuntimeDiagnosticCheck[]): void {
        const area = "Platform";
        const scope = globalThis as any;
        if (scope.tt) {
            RuntimeDiagnostics.pass(checks, area, "tt", "Douyin mini-game API object exists");
        } else {
            RuntimeDiagnostics.warn(checks, area, "tt", "Not running in Douyin mini-game environment; tt API is missing");
        }
    }

    private static async checkResourceLoads(checks: RuntimeDiagnosticCheck[]): Promise<void> {
        for (let i = 0; i < CONFIG_URLS.length; i++) {
            await RuntimeDiagnostics.checkLoad(checks, "Resource:Config", CONFIG_URLS[i], Laya.Loader.JSON);
        }

        for (let i = 0; i < SCENE_URLS.length; i++) {
            await RuntimeDiagnostics.checkLoad(checks, "Resource:Scene", SCENE_URLS[i]);
        }

        for (let i = 0; i < PREFAB_URLS.length; i++) {
            await RuntimeDiagnostics.checkLoad(checks, "Resource:Prefab", PREFAB_URLS[i]);
        }
    }

    private static async checkLoad(checks: RuntimeDiagnosticCheck[], area: string, url: string, type?: string): Promise<void> {
        try {
            const result = await Laya.loader.load(url, null, null, type);
            if (result) {
                RuntimeDiagnostics.pass(checks, area, url, "Resource loaded");
            } else {
                RuntimeDiagnostics.warn(checks, area, url, "Loader returned no object; confirm packaging in the runtime environment");
            }
        } catch (error) {
            RuntimeDiagnostics.fail(checks, area, url, "Resource load failed", RuntimeDiagnostics.formatError(error));
        }
    }

    private static checkNoThrow(checks: RuntimeDiagnosticCheck[], area: string, name: string, successMessage: string, action: () => unknown): void {
        try {
            const details = action();
            RuntimeDiagnostics.pass(checks, area, name, successMessage, details);
        } catch (error) {
            RuntimeDiagnostics.fail(checks, area, name, "Check threw an exception", RuntimeDiagnostics.formatError(error));
        }
    }

    private static checkMethod(checks: RuntimeDiagnosticCheck[], area: string, target: unknown, methodName: string): void {
        const method = (target as Record<string, unknown>)[methodName];
        if (typeof method === "function") {
            RuntimeDiagnostics.pass(checks, area, methodName, `${methodName} method exists`);
        } else {
            RuntimeDiagnostics.fail(checks, area, methodName, `${methodName} method is missing`);
        }
    }

    private static checkNumericRange(checks: RuntimeDiagnosticCheck[], area: string, name: string, value: number, min: number, max: number): void {
        if (Number.isFinite(value) && value >= min && value <= max) {
            RuntimeDiagnostics.pass(checks, area, name, `${name} value is valid`, { value, min, max });
        } else {
            RuntimeDiagnostics.fail(checks, area, name, `${name} value is out of range`, { value, min, max });
        }
    }

    private static checkComponentPresence(checks: RuntimeDiagnosticCheck[], nodes: any[], componentName: string, required: boolean): void {
        const matches = nodes.filter((node) => RuntimeDiagnostics.hasComponentNamed(node, componentName));
        if (matches.length > 0) {
            RuntimeDiagnostics.pass(checks, "Stage:Component", componentName, `${componentName} is mounted`, RuntimeDiagnostics.nodeNames(matches));
        } else if (required) {
            RuntimeDiagnostics.fail(checks, "Stage:Component", componentName, `${componentName} is missing`);
        } else {
            RuntimeDiagnostics.warn(checks, "Stage:Component", componentName, `${componentName} was not found in this scene; ignore if this scene does not use it`);
        }
    }

    private static collectNodes(root: any): any[] {
        const result: any[] = [];
        const stack = [root];
        while (stack.length > 0) {
            const node = stack.pop();
            if (!node) {
                continue;
            }

            result.push(node);
            const children = node._children || node.children || [];
            for (let i = children.length - 1; i >= 0; i--) {
                stack.push(children[i]);
            }
        }
        return result;
    }

    private static hasComponentNamed(node: any, componentName: string): boolean {
        const components = node?._components || [];
        for (let i = 0; i < components.length; i++) {
            const component = components[i];
            const ctorName = String(component?.constructor?.name || "");
            const scriptName = String(component?.name || "");
            if (ctorName === componentName || scriptName === componentName) {
                return true;
            }
        }
        return false;
    }

    private static nodeNames(nodes: any[]): string[] {
        return nodes.map((node) => String(node?.name || node?.url || "(unnamed)"));
    }

    private static createReport(startedAtTime: number, checks: RuntimeDiagnosticCheck[]): RuntimeDiagnosticReport {
        let passed = 0;
        let warnings = 0;
        let failed = 0;

        for (let i = 0; i < checks.length; i++) {
            if (checks[i].status === "pass") {
                passed += 1;
            } else if (checks[i].status === "warn") {
                warnings += 1;
            } else {
                failed += 1;
            }
        }

        return {
            startedAt: new Date(startedAtTime).toISOString(),
            durationMs: Date.now() - startedAtTime,
            passed,
            warnings,
            failed,
            checks,
        };
    }

    private static logReport(report: RuntimeDiagnosticReport): void {
        console.group(`[FeatureIntegrityTest] pass=${report.passed} warn=${report.warnings} fail=${report.failed} duration=${report.durationMs}ms`);
        for (let i = 0; i < report.checks.length; i++) {
            const check = report.checks[i];
            const details = check.details === undefined ? "" : ` ${RuntimeDiagnostics.stringifyDetails(check.details)}`;
            console.log(`${check.status.toUpperCase()} ${check.area}.${check.name}: ${check.message}${details}`);
        }
        console.log(RuntimeDiagnostics.formatSummaryText(report));
        console.groupEnd();
    }

    private static installButtonWhenStageReady(): void {
        if (RuntimeDiagnostics.installingButton) {
            return;
        }

        RuntimeDiagnostics.installingButton = true;
        const tryInstall = () => {
            const stage = Laya.stage;
            if (!stage) {
                return;
            }

            RuntimeDiagnostics.ensureButton();
        };

        tryInstall();
        if (Laya.timer) {
            Laya.timer.loop(1000, RuntimeDiagnostics, tryInstall);
        }
    }

    private static createTestButton(stage: any): void {
        const button = new Laya.Sprite();
        button.name = RuntimeDiagnostics.TEST_BUTTON_NAME;
        button.size(118, 42);
        button.pos(12, 12);
        button.zOrder = 999999;
        button.mouseEnabled = true;
        button.graphics.drawRect(0, 0, 118, 42, "#111827", "#60a5fa", 2);

        const label = new Laya.Text();
        label.text = "TEST";
        label.color = "#ffffff";
        label.fontSize = 20;
        label.bold = true;
        label.width = 118;
        label.height = 42;
        label.align = "center";
        label.valign = "middle";
        label.mouseEnabled = false;
        button.addChild(label);

        button.on(Laya.Event.CLICK, RuntimeDiagnostics, RuntimeDiagnostics.onTestButtonClick);
        stage.addChild(button);
        if (typeof stage.updateZOrder === "function") {
            stage.updateZOrder();
        }
    }

    private static async onTestButtonClick(): Promise<void> {
        await RuntimeDiagnostics.runFromButton();
    }

    private static showTestPanel(text: string): void {
        const stage = Laya.stage;
        if (!stage) {
            return;
        }

        let panel = RuntimeDiagnostics.findDirectChild(stage, RuntimeDiagnostics.TEST_PANEL_NAME) as any;
        if (!panel) {
            panel = RuntimeDiagnostics.createTestPanel();
            stage.addChild(panel);
        }

        panel.zOrder = 999998;
        if (typeof stage.updateZOrder === "function") {
            stage.updateZOrder();
        }
        const body = panel.getChildByName("body") as any;
        if (body) {
            body.text = text;
        }
    }

    private static createTestPanel(): any {
        const panel = new Laya.Sprite();
        panel.name = RuntimeDiagnostics.TEST_PANEL_NAME;
        panel.size(560, 420);
        panel.pos(12, 62);
        panel.zOrder = 999998;
        panel.mouseEnabled = true;
        panel.graphics.drawRect(0, 0, 560, 420, "#0f172a", "#334155", 2);

        const title = new Laya.Text();
        title.text = "功能完整性测试";
        title.color = "#e5e7eb";
        title.fontSize = 22;
        title.bold = true;
        title.width = 450;
        title.height = 40;
        title.pos(14, 8);
        panel.addChild(title);

        const close = new Laya.Text();
        close.name = "close";
        close.text = "X";
        close.color = "#ffffff";
        close.fontSize = 22;
        close.bold = true;
        close.width = 42;
        close.height = 40;
        close.align = "center";
        close.valign = "middle";
        close.pos(506, 6);
        close.mouseEnabled = true;
        close.on(Laya.Event.CLICK, RuntimeDiagnostics, () => {
            panel.removeSelf();
            panel.destroy(true);
        });
        panel.addChild(close);

        const body = new Laya.Text();
        body.name = "body";
        body.text = "";
        body.color = "#d1d5db";
        body.fontSize = 18;
        body.width = 532;
        body.height = 350;
        body.wordWrap = true;
        body.leading = 8;
        body.pos(14, 58);
        panel.addChild(body);

        return panel;
    }

    private static formatPanelText(report: RuntimeDiagnosticReport): string {
        const problemChecks = report.checks.filter((check) => check.status !== "pass").slice(0, 10);
        const lines = [
            RuntimeDiagnostics.formatSummaryText(report),
            "",
        ];

        if (problemChecks.length === 0) {
            lines.push("No failed or warning checks.");
        } else {
            for (let i = 0; i < problemChecks.length; i++) {
                const check = problemChecks[i];
                lines.push(`${check.status.toUpperCase()} ${check.area}.${check.name}`);
                lines.push(check.message);
                if (check.details !== undefined) {
                    lines.push(RuntimeDiagnostics.stringifyDetails(check.details).slice(0, 180));
                }
                lines.push("");
            }
        }

        if (report.checks.length > problemChecks.length) {
            lines.push("Full result is also printed in dev console.");
        }

        return lines.join("\n");
    }

    private static formatSummaryText(report: RuntimeDiagnosticReport): string {
        const status = report.failed > 0 ? "未通过" : "通过";
        return `最终结论：${status}，错误=${report.failed}，警告=${report.warnings}，通过=${report.passed}，总数=${report.checks.length}，耗时=${report.durationMs}ms`;
    }

    private static findDirectChild(parent: any, name: string): any {
        if (!parent || typeof parent.getChildByName !== "function") {
            return null;
        }
        return parent.getChildByName(name);
    }

    private static stringifyDetails(details: unknown): string {
        if (typeof details === "string") {
            return details;
        }

        try {
            return JSON.stringify(details);
        } catch {
            return String(details);
        }
    }

    private static pass(checks: RuntimeDiagnosticCheck[], area: string, name: string, message: string, details?: unknown): void {
        checks.push({ area, name, status: "pass", message, details });
    }

    private static warn(checks: RuntimeDiagnosticCheck[], area: string, name: string, message: string, details?: unknown): void {
        checks.push({ area, name, status: "warn", message, details });
    }

    private static fail(checks: RuntimeDiagnosticCheck[], area: string, name: string, message: string, details?: unknown): void {
        checks.push({ area, name, status: "fail", message, details });
    }

    private static assert(condition: boolean, message: string): void {
        if (!condition) {
            throw new Error(message);
        }
    }

    private static formatError(error: unknown): string {
        if (error instanceof Error) {
            return error.stack || error.message;
        }
        return String(error);
    }
}

RuntimeDiagnostics.install();
