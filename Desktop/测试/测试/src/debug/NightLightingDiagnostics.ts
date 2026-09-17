import { Joystick } from "../PlayUI/playerui/Joystick";
import { attack as AttackControl } from "../PlayUI/playerui/attack";

/** Opt-in editor benchmark. Never runs unless explicitly enabled on the probe. */
export class NightLightingDiagnostics {
    private readonly scenarios = ["idle", "move", "aim", "move+aim"];
    private readonly samples = new Float64Array(8192);
    private readonly originalReCache: any;
    private readonly originalUpdateRT: any;
    private readonly originalRender2D: any;
    private readonly originalPositionTime: number;
    private readonly originalDirectionTime: number;
    private readonly baseX: number;
    private readonly baseY: number;
    private readonly savedJoystickX: number;
    private readonly savedJoystickY: number;
    private readonly savedAimX = AttackControl.activeDirectionX;
    private readonly savedAimY = AttackControl.activeDirectionY;
    private readonly savedAimActive = AttackControl.directionActive;
    private trial = -1;
    private trialStart = performance.now() + 3000;
    private lastFrame = 0;
    private measureStart = 0;
    private lastLog = 0;
    private lastLogCalls = 0;
    private calls = 0;
    private rtChecks = 0;
    private rtChanges = 0;
    private frames = 0;
    private sumMs = 0;
    private renderMs = 0;
    private renderCount = 0;
    private slow33 = 0;
    private slow50 = 0;
    private maxWidth = 0;
    private maxHeight = 0;
    private minX = Infinity;
    private maxX = -Infinity;
    private minY = Infinity;
    private maxY = -Infinity;
    private measuring = false;
    private stopped = false;

    constructor(private probe: any, private owner: any, private target: Laya.Sprite) {
        this.originalPositionTime = probe.positionSmoothTime;
        this.originalDirectionTime = probe.directionSmoothTime;
        this.baseX = target.x;
        this.baseY = target.y;
        this.savedJoystickX = Joystick.instance?.valueX || 0;
        this.savedJoystickY = Joystick.instance?.valueY || 0;
        this.originalReCache = owner.reCache;
        this.originalUpdateRT = owner.updateRenderTexture;
        this.originalRender2D = (Laya.stage as any)._render2d;
        const diagnostic = this;
        owner.reCache = function () {
            if (diagnostic.measuring) diagnostic.calls++;
            return diagnostic.originalReCache.call(this);
        };
        owner.updateRenderTexture = function () {
            const result = diagnostic.originalUpdateRT.call(this);
            if (diagnostic.measuring) {
                diagnostic.rtChecks++;
                if (result) diagnostic.rtChanges++;
                diagnostic.maxWidth = Math.max(diagnostic.maxWidth, this._drawOriRT?.width || 0);
                diagnostic.maxHeight = Math.max(diagnostic.maxHeight, this._drawOriRT?.height || 0);
            }
            return result;
        };
        (Laya.stage as any)._render2d = function () {
            if (!diagnostic.measuring) return diagnostic.originalRender2D.call(this);
            const start = performance.now();
            const result = diagnostic.originalRender2D.call(this);
            diagnostic.renderMs += performance.now() - start;
            diagnostic.renderCount++;
            return result;
        };
        console.log("[NightPerf] START " + JSON.stringify({
            viewport: [Laya.stage.width, Laya.stage.height],
            canvas: [Laya.Browser.clientWidth, Laya.Browser.clientHeight],
            positionSmoothTime: this.originalPositionTime, directionSmoothTime: this.originalDirectionTime,
            warmupSeconds: 2, measureSeconds: 6, order: "A B B A per scenario",
            input: "Joystick axes + aim direction state; no firing; normal player movement/camera/rendering",
            documentHidden: Laya.Browser.document?.hidden, focused: Laya.stage.isFocused
        }));
        Laya.timer.frameLoop(1, this, this.tick);
    }

    private get smoothing(): boolean { return this.trial % 4 === 0 || this.trial % 4 === 3; }
    private get scenario(): string { return this.scenarios[Math.floor(this.trial / 4)]; }

    private resetCounters(now: number): void {
        this.calls = this.rtChecks = this.rtChanges = this.frames = this.sumMs = 0;
        this.renderMs = this.renderCount = this.slow33 = this.slow50 = 0;
        this.maxWidth = this.maxHeight = 0;
        this.minX = this.minY = Infinity;
        this.maxX = this.maxY = -Infinity;
        this.measureStart = this.lastLog = this.lastFrame = now;
        this.lastLogCalls = 0;
    }

    private tick(): void {
        const now = performance.now();
        if (now < this.trialStart) return;
        if (this.trial < 0) this.beginTrial(now);
        const elapsed = (now - this.trialStart) / 1000;
        if (!this.measuring && elapsed >= 2) {
            this.resetCounters(now);
            this.measuring = true;
        } else if (this.measuring) {
            const delta = now - this.lastFrame;
            this.lastFrame = now;
            if (this.frames < this.samples.length) this.samples[this.frames] = delta;
            this.frames++;
            this.sumMs += delta;
            if (delta > 33.4) this.slow33++;
            if (delta > 50) this.slow50++;
            this.minX = Math.min(this.minX, this.target.x);
            this.maxX = Math.max(this.maxX, this.target.x);
            this.minY = Math.min(this.minY, this.target.y);
            this.maxY = Math.max(this.maxY, this.target.y);
            if (now - this.lastLog >= 1000) {
                console.log("[NightPerf] SECOND " + JSON.stringify({ trial: this.trial,
                    scenario: this.scenario, smoothing: this.smoothing,
                    recachePerSec: (this.calls - this.lastLogCalls) * 1000 / (now - this.lastLog) }));
                this.lastLog = now;
                this.lastLogCalls = this.calls;
            }
            if (now - this.measureStart >= 6000) {
                this.report(now);
                this.measuring = false;
                if (this.trial === 15) { this.stop(); return; }
                this.beginTrial(now);
            }
        }
        // Deterministic input replay. Both variants receive the same waveform.
        const t = (now - this.trialStart) / 1000;
        const moving = this.scenario.indexOf("move") >= 0;
        const aiming = this.scenario.indexOf("aim") >= 0;
        const joystick = Joystick.instance;
        if (joystick) {
            joystick.valueX = moving ? (Math.floor(t / 1.5) % 2 === 0 ? 1 : -1) : 0;
            joystick.valueY = 0;
        }
        AttackControl.directionActive = aiming;
        AttackControl.activeDirectionX = aiming ? Math.cos(t * Math.PI / 3) : 0;
        AttackControl.activeDirectionY = aiming ? Math.sin(t * Math.PI / 3) : 0;
    }

    private beginTrial(now: number): void {
        this.trial++;
        this.trialStart = now;
        this.probe.positionSmoothTime = this.smoothing ? this.originalPositionTime : 0;
        this.probe.directionSmoothTime = this.smoothing ? this.originalDirectionTime : 0;
        this.target.pos(this.baseX, this.baseY);
        console.log("[NightPerf] TRIAL " + JSON.stringify({ trial: this.trial,
            scenario: this.scenario, smoothing: this.smoothing }));
    }

    private report(now: number): void {
        const sorted = Array.from(this.samples.subarray(0, Math.min(this.frames, this.samples.length))).sort((a, b) => a - b);
        const seconds = (now - this.measureStart) / 1000;
        console.log("[NightPerf] RESULT " + JSON.stringify({
            trial: this.trial, scenario: this.scenario, smoothing: this.smoothing,
            seconds, frames: this.frames, fps: this.frames / seconds,
            recache: this.calls, recachePerSec: this.calls / seconds,
            rtChecks: this.rtChecks, rtChanges: this.rtChanges,
            maxRT: [this.maxWidth, this.maxHeight],
            meanFrameMs: this.sumMs / this.frames,
            p95FrameMs: sorted[Math.ceil(sorted.length * 0.95) - 1],
            maxFrameMs: sorted[sorted.length - 1], slow33: this.slow33, slow50: this.slow50,
            render2DCpuMs: this.renderMs / Math.max(1, this.renderCount),
            playerSpan: [this.maxX - this.minX, this.maxY - this.minY],
            documentHidden: Laya.Browser.document?.hidden, focused: Laya.stage.isFocused,
            renderFrames: this.renderCount
        }));
    }

    stop(): void {
        if (this.stopped) return;
        this.stopped = true;
        this.measuring = false;
        Laya.timer.clearAll(this);
        this.owner.reCache = this.originalReCache;
        this.owner.updateRenderTexture = this.originalUpdateRT;
        (Laya.stage as any)._render2d = this.originalRender2D;
        this.probe.positionSmoothTime = this.originalPositionTime;
        this.probe.directionSmoothTime = this.originalDirectionTime;
        const joystick = Joystick.instance;
        if (joystick) { joystick.valueX = this.savedJoystickX; joystick.valueY = this.savedJoystickY; }
        AttackControl.activeDirectionX = this.savedAimX;
        AttackControl.activeDirectionY = this.savedAimY;
        AttackControl.directionActive = this.savedAimActive;
        if (!this.target.destroyed) this.target.pos(this.baseX, this.baseY);
        console.log("[NightPerf] STOP " + JSON.stringify({ completed: this.trial === 15,
            restoredPositionSmoothTime: this.probe.positionSmoothTime,
            restoredDirectionSmoothTime: this.probe.directionSmoothTime }));
    }
}
