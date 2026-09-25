import { DataManager } from "../systems/datamanager";
import { RangedAimState } from "../Player/RangedAimState";

/** Opt-in runtime input regression. Restores metadata and method hooks on exit. */
export class RangedInputDiagnostics {
    private started = Date.now();
    private step = 0;
    private shots = 0;
    private firstShotAt = 0;
    private lastShotAt = 0;
    private baseShots = 0;
    private failures = 0;
    private done = false;
    private readonly pointer = { x: 0, y: 0 };
    private readonly offset = { x: 0, y: 0 };
    private readonly oldPointer: any;
    private readonly oldOffset: any;
    private readonly oldAttack: any;
    private readonly oldMode: any;
    private readonly meta: any;
    private readonly controller: any;
    private readonly oldSelection: boolean | undefined;
    private readonly weaponId: string;

    constructor(private input: any) {
        const data = DataManager.getInstance();
        const weapon = data.getEquippedItem("weapon");
        this.weaponId = weapon?.itemId || "";
        this.oldSelection = input.constructor.selectedFireModes.get(this.weaponId);
        this.meta = weapon && data.resolveItemMeta(weapon.itemId);
        this.controller = input.resolvePlayerController();
        this.oldPointer = input.getStagePointer;
        this.oldOffset = input.resolveClampedOffset;
        this.oldAttack = this.controller.playAttack;
        this.oldMode = this.meta?.fireMode;
        if (!this.meta) { this.done = true; return; }
        input.getStagePointer = () => this.pointer;
        input.resolveClampedOffset = () => this.offset;
        this.controller.playAttack = (queue: boolean, options: any) => {
            const result = this.oldAttack.call(this.controller, queue, options);
            if (result) {
                this.shots++;
                if (!this.firstShotAt) this.firstShotAt = Date.now();
                this.lastShotAt = Date.now();
            }
            return result;
        };
        this.meta.fireMode = "auto";
        input.constructor.selectedFireModes.delete(this.weaponId);
        input.refreshFireModeSwitch();
        this.report("switch-default-white", input.fireModeSwitch?.visible && input.switchColor === "#ffffff");
        this.clickSwitch();
        this.report("switch-click-red", input.switchColor === "#ff0000");
        input.onPointerDown({});
        this.move(20, 0);
        console.log("[WeaponInput] START");
    }

    private move(x: number, y: number): void {
        this.offset.x = this.pointer.x = x;
        this.offset.y = this.pointer.y = y;
        this.input.onPointerMove({});
    }

    private clickSwitch(): void {
        const node = this.input.fireModeSwitch;
        const point = node.localToGlobal(new Laya.Point(node.width / 2, node.height / 2));
        const stage = Laya.stage as any;
        const manager = (Laya.InputManager as any).inst;
        const hit = manager.getNodeUnderPoint(point.x, point.y);
        console.log("[WeaponInput] HIT " + JSON.stringify({ name: hit?.name, switchHit: hit === node || node.contains(hit) }));
        point.x *= stage.clientScaleX;
        point.y *= stage.clientScaleY;
        stage._canvasTransform.transformPoint(point);
        const event = { pageX: point.x, pageY: point.y, clientX: point.x, clientY: point.y, button: 0 };
        manager.handleMouse(event, 0);
        manager.handleMouse(event, 1);
    }

    update(): void {
        if (this.done) return;
        const seconds = (Date.now() - this.started) / 1000;
        switch (this.step) {
            case 0: if (seconds >= 0.3) { this.report("delay", this.shots === 0); this.step++; } break;
            case 1: if (seconds >= 1.4) { this.report("hip-auto", this.shots >= 3 && !this.input.precisionAim); this.move(0, -48); this.step++; } break;
            case 2: if (seconds >= 2.9) { const spread = this.input.resolveRangedChargeConeAngle(); this.report("precision-auto", this.input.precisionAim && spread >= 20 && spread <= 44 && RangedAimState.cameraOffsetY < -30); this.move(20, 0); this.step++; } break;
            case 3: if (seconds >= 3.5) {
                this.report("return-hip", !this.input.precisionAim && Math.abs(RangedAimState.cameraOffsetY) < 20);
                const rpm = (this.shots - 1) * 60000 / (this.lastShotAt - this.firstShotAt);
                const expected = 60000 / Math.max(80, this.meta.fireIntervalMs / Math.max(0.1, this.controller.attackSpeed || 1));
                console.log("[WeaponInput] CADENCE " + JSON.stringify({ rpm, expected, shots: this.shots }));
                this.report("configured-cadence", Math.abs(rpm - expected) / expected < 0.08);
                this.input.onPointerUp({}); this.baseShots = this.shots; this.step++;
            } break;
            case 4: if (seconds >= 4.1) {
                this.report("release-stops", this.shots === this.baseShots);
                this.clickSwitch();
                this.report("switch-click-white", this.input.switchColor === "#ffffff");
                this.pointer.x = this.pointer.y = 0;
                this.input.onPointerDown({}); this.move(-48, 0); this.step++;
            } break;
            case 5: if (seconds >= 5.5) {
                this.report("single-held", this.shots === this.baseShots && RangedAimState.cameraOffsetX < -30);
                this.input.onPointerUp({}); this.step++;
            } break;
            case 6: if (seconds >= 6.1) {
                this.report("single-release", this.shots === this.baseShots + 1);
                this.baseShots = this.shots;
                this.pointer.x = this.pointer.y = 0;
                this.input.onPointerDown({}); this.move(48, 0); this.input.onPointerCancel(); this.step++;
            } break;
            case 7: if (seconds >= 6.8) {
                this.report("cancel", this.shots === this.baseShots);
                this.input.onPointerDown({}); this.move(48, 0);
                this.clickSwitch();
                this.report("switch-cancels-hold", !this.input.pressing && this.shots === this.baseShots);
                this.meta.fireMode = "single";
                this.input.refreshFireModeSwitch();
                this.report("single-weapon-hides-switch", !this.input.fireModeSwitch.visible);
                this.meta.fireMode = "auto";
                this.input.refreshFireModeSwitch();
                this.report("restore-remembers-mode", this.input.fireModeSwitch.visible && this.input.switchColor === "#ff0000");
                this.stop();
            } break;
        }
    }

    private report(label: string, passed: boolean): void {
        if (!passed) this.failures++;
        console.log("[WeaponInput] RESULT " + JSON.stringify({ label, passed, shots: this.shots,
            cameraX: RangedAimState.cameraOffsetX, cameraY: RangedAimState.cameraOffsetY,
            spread: this.input.resolveRangedChargeConeAngle(), hidden: Laya.Browser.document?.hidden }));
    }

    stop(): void {
        if (this.done) return;
        this.done = true;
        this.input.stopInput();
        this.input.getStagePointer = this.oldPointer;
        this.input.resolveClampedOffset = this.oldOffset;
        this.controller.playAttack = this.oldAttack;
        this.meta.fireMode = this.oldMode;
        if (this.oldSelection === undefined) this.input.constructor.selectedFireModes.delete(this.weaponId);
        else this.input.constructor.selectedFireModes.set(this.weaponId, this.oldSelection);
        this.input.refreshFireModeSwitch();
        console.log("[WeaponInput] STOP " + JSON.stringify({ failures: this.failures }));
    }
}
