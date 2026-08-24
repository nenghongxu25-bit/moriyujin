import { PlayerController } from "../Player/PlayerController";
import { Joystick } from "../PlayUI/playerui/Joystick";
import { run as RunButton } from "../PlayUI/playerui/run";
import { DataManager } from "../systems/datamanager";
import { RuntimeDiagnostics } from "../systems/RuntimeDiagnostics";
import { GameTimeService } from "../systems/time/GameTimeService";

const { regClass } = Laya;

interface DebugScopeItem {
    id: string;
    label: string;
}

interface DebugTypeItem {
    id: string;
    label: string;
}

interface DebugActionItem {
    id: string;
    label: string;
    run: () => void | Promise<void>;
}

@regClass()
export class DebugPanel extends Laya.Script {
    private readonly scopeItems: DebugScopeItem[] = [
        { id: "global", label: "\u5168\u5c40" },
        { id: "cunzhuang", label: "cunzhuang" },
        { id: "forest", label: "forest" },
        { id: "mine", label: "mine" },
    ];

    private readonly typeItemsByScope: Record<string, DebugTypeItem[]> = {
        global: [
            { id: "player", label: "\u73a9\u5bb6" },
            { id: "inventory", label: "\u80cc\u5305" },
            { id: "warehouse", label: "\u4ed3\u5e93" },
            { id: "save", label: "\u5b58\u6863" },
            { id: "reward", label: "\u5956\u52b1" },
            { id: "platform", label: "\u5e73\u53f0" },
            { id: "integrity", label: "\u5b8c\u6574\u6027" },
            { id: "danger", label: "\u5371\u9669" },
        ],
        cunzhuang: [
            { id: "player", label: "\u73a9\u5bb6" },
            { id: "ui", label: "UI" },
            { id: "warehouse", label: "\u4ed3\u5e93" },
            { id: "crafting", label: "\u5236\u4f5c" },
            { id: "map", label: "\u5730\u56fe" },
            { id: "death", label: "\u6b7b\u4ea1" },
        ],
        forest: [
            { id: "player", label: "\u73a9\u5bb6" },
            { id: "move", label: "\u79fb\u52a8" },
            { id: "combat", label: "\u6218\u6597" },
            { id: "harvest", label: "\u91c7\u96c6" },
            { id: "inventory", label: "\u80cc\u5305" },
            { id: "extract", label: "\u5e26\u51fa" },
        ],
        mine: [
            { id: "player", label: "\u73a9\u5bb6" },
            { id: "move", label: "\u79fb\u52a8" },
            { id: "combat", label: "\u6218\u6597" },
            { id: "mining", label: "\u6316\u77ff" },
            { id: "inventory", label: "\u80cc\u5305" },
            { id: "extract", label: "\u5e26\u51fa" },
        ],
    };

    private sceneListNode: Laya.Node | null = null;
    private typeListNode: Laya.Node | null = null;
    private debugListNode: Laya.Node | null = null;
    private selectedScopeId: string = "global";
    private selectedTypeId: string = "player";

    onAwake(): void {
        this.resolveBindings();
        this.refreshAll();
    }

    onEnable(): void {
        this.resolveBindings();
        this.refreshAll();
    }

    private resolveBindings(): void {
        const root = this.owner as Laya.Node;
        this.sceneListNode = this.sceneListNode || this.findChildByName(root, "scene");
        this.typeListNode = this.typeListNode || this.findChildByName(root, "type");
        this.debugListNode = this.debugListNode || this.findChildByName(root, "debug");
    }

    private refreshAll(): void {
        this.refreshSceneList();
        this.refreshTypeList();
        this.refreshDebugList();
    }

    private refreshSceneList(): void {
        this.renderList(this.sceneListNode, this.scopeItems.length, (index, node) => {
            this.renderSceneItem(this.scopeItems[index] || null, node);
        });
    }

    private refreshTypeList(): void {
        const items = this.getCurrentTypeItems();
        if (!items.some((item) => item.id === this.selectedTypeId)) {
            this.selectedTypeId = items[0]?.id || "";
        }

        this.renderList(this.typeListNode, items.length, (index, node) => {
            this.renderTypeItem(items[index] || null, node);
        });
    }

    private refreshDebugList(): void {
        const items = this.getCurrentDebugActions();
        this.renderList(this.debugListNode, items.length, (index, node) => {
            this.renderDebugItem(items[index] || null, node);
        });
    }

    private renderSceneItem(item: DebugScopeItem | null, node: Laya.Node): void {
        this.setNodeVisible(node, !!item);
        if (!item) {
            return;
        }

        this.setFirstText(node, item.label);
        this.setNodeAlpha(node, item.id === this.selectedScopeId ? 1 : 0.65);

        const target = node as any;
        if (target && typeof target.off === "function" && typeof target.on === "function") {
            target.mouseEnabled = true;
            target.off(Laya.Event.CLICK, this, this.onSceneItemClick);
            target.on(Laya.Event.CLICK, this, this.onSceneItemClick, [item.id]);
        }
    }

    private onSceneItemClick(scopeId: string): void {
        this.selectedScopeId = scopeId;
        this.selectedTypeId = this.getCurrentTypeItems()[0]?.id || "";
        console.info(`[DebugPanel] selected scope=${scopeId}`);
        this.refreshAll();
    }

    private renderTypeItem(item: DebugTypeItem | null, node: Laya.Node): void {
        this.setNodeVisible(node, !!item);
        if (!item) {
            return;
        }

        this.setFirstText(node, item.label);
        this.setNodeAlpha(node, item.id === this.selectedTypeId ? 1 : 0.65);

        const target = node as any;
        if (target && typeof target.off === "function" && typeof target.on === "function") {
            target.mouseEnabled = true;
            target.off(Laya.Event.CLICK, this, this.onTypeItemClick);
            target.on(Laya.Event.CLICK, this, this.onTypeItemClick, [item.id]);
        }
    }

    private onTypeItemClick(typeId: string): void {
        this.selectedTypeId = typeId;
        console.info(`[DebugPanel] selected type=${typeId}`);
        this.refreshTypeList();
        this.refreshDebugList();
    }

    private getCurrentTypeItems(): DebugTypeItem[] {
        return this.typeItemsByScope[this.selectedScopeId] || [];
    }

    private renderDebugItem(item: DebugActionItem | null, node: Laya.Node): void {
        this.setNodeVisible(node, !!item);
        if (!item) {
            return;
        }

        this.setFirstText(node, item.label);
        this.setNodeAlpha(node, 1);

        const target = node as any;
        if (target && typeof target.off === "function" && typeof target.on === "function") {
            target.mouseEnabled = true;
            target.off(Laya.Event.CLICK, this, this.onDebugItemClick);
            target.on(Laya.Event.CLICK, this, this.onDebugItemClick, [item.id]);
        }
    }

    private async onDebugItemClick(actionId: string): Promise<void> {
        const action = this.getCurrentDebugActions().find((item) => item.id === actionId);
        if (!action) {
            console.warn(`[DebugPanel] action missing: ${actionId}`);
            return;
        }

        try {
            console.info(`[DebugPanel] run action=${actionId}`);
            await action.run();
            console.info(`[DebugPanel] PASS ${action.label}`);
        } catch (error) {
            console.error(`[DebugPanel] FAIL ${action.label}`, error);
        }
    }

    private getCurrentDebugActions(): DebugActionItem[] {
        if (this.selectedScopeId !== "global") {
            return [
                {
                    id: "scene.not_ready",
                    label: "\u6682\u672a\u914d\u7f6e",
                    run: () => console.warn(`[DebugPanel] ${this.selectedScopeId}.${this.selectedTypeId} actions are not configured yet`),
                },
            ];
        }

        const dataManager = DataManager.getInstance();
        const actionsByType: Record<string, DebugActionItem[]> = {
            player: [
                {
                    id: "global.player.print",
                    label: "\u6253\u5370\u73a9\u5bb6",
                    run: () => console.info("[DebugPanel] player stats", dataManager.getPlayerStats(), this.getActivePlayerSnapshot()),
                },
                {
                    id: "global.player.hp_full",
                    label: "HP=\u6ee1",
                    run: () => this.setPlayerHpToFull(dataManager),
                },
                {
                    id: "global.player.hp_one",
                    label: "HP=1",
                    run: () => this.setPlayerHp(dataManager, 1),
                },
                {
                    id: "global.player.stamina_full",
                    label: "\u4f53\u529b=\u6ee1",
                    run: () => this.setPlayerStaminaToFull(dataManager),
                },
                {
                    id: "global.player.stamina_zero",
                    label: "\u4f53\u529b=0",
                    run: () => this.setPlayerStamina(dataManager, 0),
                },
                {
                    id: "global.player.run_stamina_3s",
                    label: "\u6d4b\u8bd5\u5954\u8dd110\u79d2",
                    run: () => this.runStaminaDrainTest(dataManager),
                },
            ],
            inventory: [
                {
                    id: "global.inventory.print",
                    label: "\u6253\u5370\u80cc\u5305",
                    run: () => console.info("[DebugPanel] inventory", {
                        slots: dataManager.getPlayerBagSlotCount(),
                        scope: dataManager.getCurrentScope(),
                        items: dataManager.getInventorySnapshot(),
                    }),
                },
                {
                    id: "global.inventory.add_wood_1",
                    label: "\u6728\u5934x1",
                    run: () => {
                        dataManager.grantItemsToActive([{ itemId: "wood", count: 1 }]);
                        console.info("[DebugPanel] inventory after grant", dataManager.getInventorySnapshot());
                    },
                },
            ],
            warehouse: [
                {
                    id: "global.warehouse.print",
                    label: "\u6253\u5370\u4ed3\u5e93",
                    run: () => console.info("[DebugPanel] warehouse", {
                        slots: dataManager.getWarehouseSlotCount(),
                        items: dataManager.getWarehouseSnapshot(),
                    }),
                },
            ],
            save: [
                {
                    id: "global.save.summary",
                    label: "\u5b58\u6863\u6458\u8981",
                    run: () => console.info("[DebugPanel] save summary", {
                        player: dataManager.getPlayerStats(),
                        inventoryItems: dataManager.getInventorySnapshot().filter((item) => !!item).length,
                        warehouseItems: dataManager.getWarehouseSnapshot().filter((item) => !!item).length,
                        equipment: dataManager.getEquippedItems(),
                    }),
                },
                {
                    id: "global.save.reload",
                    label: "\u91cd\u65b0\u8bfb\u53d6",
                    run: async () => {
                        await dataManager.loadAll();
                        console.info("[DebugPanel] reload complete", dataManager.getPlayerStats());
                    },
                },
            ],
            reward: [
                {
                    id: "global.reward.signin",
                    label: "\u7b7e\u5230\u72b6\u6001",
                    run: async () => {
                        const sync = await GameTimeService.getInstance().syncServerTime();
                        console.info("[DebugPanel] sign in time source", {
                            success: sync.success,
                            source: sync.source,
                            now: new Date(sync.nowMs).toISOString(),
                            error: sync.error || "",
                        });
                        console.info("[DebugPanel] sign in rewards", dataManager.getSignInRewards());
                    },
                },
                {
                    id: "global.reward.signin_midnight",
                    label: "\u7b7e\u52300\u70b9\u6d4b\u8bd5",
                    run: () => this.runSignInMidnightTest(dataManager),
                },
            ],
            platform: [
                {
                    id: "global.platform.tt",
                    label: "\u68c0\u67e5tt",
                    run: () => console.info("[DebugPanel] platform", {
                        hasTt: typeof (globalThis as any).tt !== "undefined",
                        hasCloud: !!(globalThis as any).tt?.cloud,
                    }),
                },
            ],
            integrity: [
                {
                    id: "global.integrity.run",
                    label: "\u5b8c\u6574\u6027\u68c0\u67e5",
                    run: async () => {
                        const report = await RuntimeDiagnostics.runAndLog();
                        console.info("[DebugPanel] integrity summary", {
                            pass: report.passed,
                            warn: report.warnings,
                            fail: report.failed,
                            total: report.checks.length,
                        });
                    },
                },
            ],
            danger: [
                {
                    id: "global.danger.disabled",
                    label: "\u6682\u4e0d\u5f00\u653e",
                    run: () => console.warn("[DebugPanel] danger actions require confirm flow first"),
                },
            ],
        };

        return actionsByType[this.selectedTypeId] || [];
    }

    private setPlayerHpToFull(dataManager: DataManager): void {
        const stats = dataManager.getPlayerStats();
        this.setPlayerHp(dataManager, stats.maxHp);
    }

    private setPlayerHp(dataManager: DataManager, hp: number): void {
        const stats = dataManager.getPlayerStats();
        dataManager.setPlayerHp(hp, stats.maxHp);
        const activePlayer = PlayerController.activeInstance as any;
        if (activePlayer && typeof activePlayer.syncHpFromData === "function") {
            activePlayer.syncHpFromData();
        }
        console.info("[DebugPanel] player hp updated", dataManager.getPlayerStats());
    }

    private setPlayerStaminaToFull(dataManager: DataManager): void {
        const stats = dataManager.getPlayerStats();
        this.setPlayerStamina(dataManager, stats.maxStamina);
    }

    private setPlayerStamina(dataManager: DataManager, stamina: number): void {
        const stats = dataManager.getPlayerStats();
        dataManager.setPlayerStamina(stamina, stats.maxStamina);
        const activePlayer = PlayerController.activeInstance as any;
        if (activePlayer && typeof activePlayer.syncStaminaFromData === "function") {
            activePlayer.syncStaminaFromData();
        }
        console.info("[DebugPanel] player stamina updated", dataManager.getPlayerStats());
    }

    private getActivePlayerSnapshot(): unknown {
        const activePlayer = PlayerController.activeInstance as any;
        if (activePlayer && typeof activePlayer.snapshot === "function") {
            return activePlayer.snapshot();
        }

        return { activePlayer: false };
    }

    private async runStaminaDrainTest(dataManager: DataManager): Promise<void> {
        const player = PlayerController.activeInstance;
        if (!player) {
            throw new Error("No active PlayerController; enter a gameplay scene first.");
        }

        const joystick = Joystick.instance as any;
        if (!joystick) {
            throw new Error("No active Joystick; enter a gameplay scene with play_ui first.");
        }

        const runButton = this.findRunButton();
        if (!runButton) {
            throw new Error("No active run button; test must go through the formal run button flow.");
        }

        const previousJoystickX = Number(joystick.valueX) || 0;
        const previousJoystickY = Number(joystick.valueY) || 0;
        const previousRunning = player.isRunning;
        const startStats = dataManager.getPlayerStats();
        const startStamina = Math.max(60, startStats.currentStamina);

        this.setPlayerStamina(dataManager, Math.min(startStats.maxStamina, startStamina));
        joystick.valueX = 1;
        joystick.valueY = 0;
        await this.clickRunButtonToState(runButton, player, true);
        console.info("[DebugPanel] run stamina test start", dataManager.getPlayerStats(), {
            runButtonOwner: (runButton.owner as any)?.name || null,
            isRunning: player.isRunning,
        });

        try {
            await this.delay(5000);
            console.info("[DebugPanel] run stamina test middle", dataManager.getPlayerStats(), player.snapshot());
            await this.delay(5000);
            console.info("[DebugPanel] run stamina test end", dataManager.getPlayerStats(), player.snapshot());
        } finally {
            joystick.valueX = previousJoystickX;
            joystick.valueY = previousJoystickY;
            await this.clickRunButtonToState(runButton, player, previousRunning);
            console.info("[DebugPanel] run stamina test restored", dataManager.getPlayerStats());
        }
    }

    private async clickRunButtonToState(runButton: RunButton, player: PlayerController, running: boolean): Promise<void> {
        if (player.isRunning === running) {
            return;
        }

        const owner = runButton.owner as any;
        if (!owner) {
            throw new Error("Run button owner is missing.");
        }

        if (typeof owner.event === "function") {
            owner.event(Laya.Event.CLICK);
            await this.delay(50);
        }

        if (player.isRunning !== running && typeof (runButton as any).onRunClick === "function") {
            (runButton as any).onRunClick();
            await this.delay(50);
        }

        if (player.isRunning !== running) {
            throw new Error(`Run button did not switch running state to ${running}.`);
        }
    }

    private findRunButton(): RunButton | null {
        return this.findComponentInTree(Laya.stage as Laya.Node | null, RunButton);
    }

    private findComponentInTree<T>(root: Laya.Node | null, componentType: new (...args: any[]) => T): T | null {
        if (!root) {
            return null;
        }

        const component = root.getComponent(componentType as any) as T | null;
        if (component) {
            return component;
        }

        const children = (root as any).children as Laya.Node[] | undefined;
        if (!children) {
            return null;
        }

        for (let i = 0; i < children.length; i++) {
            const found = this.findComponentInTree(children[i], componentType);
            if (found) {
                return found;
            }
        }

        return null;
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => {
            Laya.timer.once(ms, this, resolve);
        });
    }

    private runSignInMidnightTest(dataManager: DataManager): void {
        const now = new Date();
        const startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const beforeMidnight = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate(), 23, 59, 59, 999);
        const afterMidnight = new Date(startDay.getFullYear(), startDay.getMonth(), startDay.getDate() + 1, 0, 0, 0, 0);
        const startDayKey = this.formatDayKey(startDay);
        const before = dataManager.previewSignInUnlock(startDayKey, beforeMidnight);
        const after = dataManager.previewSignInUnlock(startDayKey, afterMidnight);
        const pass = before.unlockedDay === 1 && after.unlockedDay === 2;

        console.info("[DebugPanel] sign in midnight test", {
            pass,
            startDayKey,
            beforeMidnight: before,
            afterMidnight: after,
            rule: "same local date unlocks day 1; next local date at 00:00 unlocks day 2",
            currentTimeSource: GameTimeService.getInstance().getSource(),
        });

        if (!pass) {
            throw new Error(`Sign-in midnight rule failed: before=${before.unlockedDay}, after=${after.unlockedDay}`);
        }
    }

    private formatDayKey(date: Date): string {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${date.getFullYear()}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`;
    }

    private renderList(
        listNode: Laya.Node | null,
        count: number,
        renderer: (index: number, node: Laya.Node) => void
    ): void {
        const list = listNode as any;
        if (!list) {
            console.warn("[DebugPanel] scene list node missing");
            return;
        }

        if (!this.getTemplateNode(listNode)) {
            Laya.timer.callLater(this, () => this.renderList(listNode, count, renderer));
            return;
        }

        if ("itemRenderer" in list) {
            list.itemRenderer = (index: number, item: Laya.Node) => {
                renderer(index, item);
            };
        }

        if ("numItems" in list) {
            list.numItems = count;
        }

        if (typeof list.refresh === "function") {
            list.refresh(true);
        }

        Laya.timer.callLater(this, () => this.renderVisibleListItems(listNode, count, renderer));
    }

    private renderVisibleListItems(
        listNode: Laya.Node | null,
        count: number,
        renderer: (index: number, node: Laya.Node) => void
    ): void {
        const children = listNode && Array.isArray((listNode as any).children)
            ? ((listNode as any).children as Laya.Node[])
            : [];
        const templateNode = this.getTemplateNode(listNode);
        let dataIndex = 0;

        for (let i = 0; i < children.length && dataIndex < count; i++) {
            const node = children[i];
            if (!node || node === templateNode) {
                continue;
            }

            renderer(dataIndex, node);
            dataIndex++;
        }
    }

    private getTemplateNode(listNode: Laya.Node | null): Laya.Node | null {
        const list = listNode as any;
        const explicitTemplate = (list?._templateNode as Laya.Node | null)
            || (list?.templateNode as Laya.Node | null);
        if (explicitTemplate) {
            return explicitTemplate;
        }

        const children = listNode && Array.isArray((listNode as any).children)
            ? ((listNode as any).children as Laya.Node[])
            : [];
        return children[0] || null;
    }

    private setFirstText(root: Laya.Node | null, text: string): void {
        const textNode = this.findChildByType(root, "Text") as Laya.Text | null;
        if (textNode) {
            textNode.text = text;
        }
    }

    private findChildByName(root: Laya.Node | null, name: string): Laya.Node | null {
        if (!root) {
            return null;
        }

        if ((root as any).name === name) {
            return root;
        }

        const children = (root as any).children as Laya.Node[] | undefined;
        if (!children) {
            return null;
        }

        for (let i = 0; i < children.length; i++) {
            const found = this.findChildByName(children[i], name);
            if (found) {
                return found;
            }
        }

        return null;
    }

    private findChildByType(root: Laya.Node | null, typeName: string): Laya.Node | null {
        if (!root) {
            return null;
        }

        if ((root as any).constructor?.name === typeName || (root as any)._$type === typeName) {
            return root;
        }

        const children = (root as any).children as Laya.Node[] | undefined;
        if (!children) {
            return null;
        }

        for (let i = 0; i < children.length; i++) {
            const found = this.findChildByType(children[i], typeName);
            if (found) {
                return found;
            }
        }

        return null;
    }

    private setNodeVisible(node: Laya.Node | null, visible: boolean): void {
        const target = node as any;
        if (!target) {
            return;
        }

        if ("visible" in target) {
            target.visible = visible;
        }
        if ("active" in target) {
            target.active = visible;
        }
    }

    private setNodeAlpha(node: Laya.Node | null, alpha: number): void {
        const target = node as any;
        if (target && "alpha" in target) {
            target.alpha = alpha;
        }
    }
}
