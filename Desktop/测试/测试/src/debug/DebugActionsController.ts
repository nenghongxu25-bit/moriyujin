import { PlayerController } from "../Player/PlayerController";
import { Joystick } from "../PlayUI/playerui/Joystick";
import { run as RunButton } from "../PlayUI/playerui/run";
import { DataManager } from "../systems/datamanager";
import { RuntimeDiagnostics } from "../systems/RuntimeDiagnostics";
import { GameTimeService } from "../systems/time/GameTimeService";

export interface DebugActionItem {
    id: string;
    label: string;
    run: () => void | Promise<void>;
}

export class DebugActionsController {
    public getActions(selectedScopeId: string, selectedTypeId: string): DebugActionItem[] {
        if (selectedScopeId !== "global") {
            return [
                {
                    id: "scene.not_ready",
                    label: "\u6682\u672a\u914d\u7f6e",
                    run: () => console.warn(`[DebugPanel] ${selectedScopeId}.${selectedTypeId} actions are not configured yet`),
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

        return actionsByType[selectedTypeId] || [];
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
}