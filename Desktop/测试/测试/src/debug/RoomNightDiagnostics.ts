import type { RoomNightController } from "./RoomNightController";
import { RoomNightZone } from "./RoomNightZone";
import { Joystick } from "../PlayUI/playerui/Joystick";

/** Explicitly enabled scene regression; restores all runtime state on completion. */
export class RoomNightDiagnostics {
    private readonly labels = ["day-outside", "day-inside", "night-lights-off", "night-lights-on",
        "night-exit", "second-room", "combined-room", "move-lit-room", "lit-room-edge"];
    private readonly point = new Laya.Point();
    private readonly expectedPoint = new Laya.Point();
    private readonly actualPoint = new Laya.Point();
    private readonly originalNight: boolean;
    private readonly originalCombine: boolean;
    private readonly originalLights: boolean[];
    private readonly originalX: number;
    private readonly originalY: number;
    private readonly originalUpdateRT: any;
    private readonly originalJoystickX = Joystick.instance?.valueX || 0;
    private readonly originalJoystickY = Joystick.instance?.valueY || 0;
    private readonly flashlight: Laya.Sprite | null;
    private readonly glow: Laya.Sprite | null;
    private readonly originalFlashVisible: boolean;
    private readonly originalGlowVisible: boolean;
    private step = -1;
    private started = performance.now() + 2000;
    private frames = 0;
    private rtChanges = 0;
    private sampleStart = 0;
    private measuring = false;
    private reported = false;
    private finished = false;
    private failures = 0;

    constructor(private controller: RoomNightController, private zones: RoomNightZone[],
        private target: Laya.Sprite, private night: Laya.Sprite) {
        this.originalNight = controller.isNight;
        this.originalCombine = controller.combineRooms;
        this.originalLights = zones.map(zone => zone.lightsOn);
        this.originalX = target.x; this.originalY = target.y;
        this.flashlight = night.getChildByName("circle_cutout") as Laya.Sprite | null;
        this.glow = night.getChildByName("vision_glow") as Laya.Sprite | null;
        this.originalFlashVisible = this.flashlight?.visible ?? true;
        this.originalGlowVisible = this.glow?.visible ?? true;
        this.originalUpdateRT = (night as any).updateRenderTexture;
        const diagnostic = this;
        (night as any).updateRenderTexture = function () {
            const changed = diagnostic.originalUpdateRT.call(this);
            if (changed && diagnostic.measuring) diagnostic.rtChanges++;
            return changed;
        };
        console.log("[RoomPerf] START " + JSON.stringify({ rooms: zones.length,
            documentHidden: Laya.Browser.document?.hidden }));
    }

    beforeFrame(): void {
        if (this.finished || performance.now() < this.started) return;
        const now = performance.now();
        if (this.step < 0 || now - this.started >= 5000) {
            if (this.step === this.labels.length - 1) { this.stop(); return; }
            this.step++;
            this.started = now;
            this.frames = this.rtChanges = 0;
            this.measuring = this.reported = false;
            this.controller.isNight = this.step >= 2;
            this.controller.combineRooms = this.step === 6;
            for (const zone of this.zones) zone.lightsOn = this.step !== 2;
            // Isolate room lighting at the doorway; restore the torch afterwards.
            if (this.step === 8) {
                if (this.flashlight) this.flashlight.visible = false;
                if (this.glow) this.glow.visible = false;
                this.night.reCache();
            }
            this.placePlayer();
            console.log("[RoomPerf] CASE " + this.labels[this.step]);
        }
        if (Joystick.instance) {
            Joystick.instance.valueX = 0;
            Joystick.instance.valueY = 0;
        }
        if (this.step === 7) this.placePlayer(Math.sin((now - this.started) / 700) * 120);
        if (!this.measuring && !this.reported && now - this.started >= 1000) {
            this.sampleStart = now;
            this.measuring = true;
        }
    }

    private placePlayer(offset = 0): void {
        const room = this.zones[this.step === 5 ? 1 : 0]?.owner as Laya.Sprite;
        if (!room) return;
        this.point.setTo(this.step === 0 || this.step === 4 ? room.width + 100 :
            this.step === 8 ? room.width - 100 : room.width / 2 + offset,
            room.height / 2);
        const world = this.night.parent as Laya.Sprite;
        room.localToGlobal(this.point, false, world);
        (this.target.parent as Laya.Sprite).globalToLocal(this.point, false, world);
        this.target.pos(this.point.x, this.point.y);
    }

    afterFrame(): void {
        if (this.finished || !this.measuring) return;
        if (this.frames++ === 0) return;
        const seconds = (performance.now() - this.sampleStart) / 1000;
        if (seconds < 2) return;
        const inside = this.step !== 0 && this.step !== 4;
        const activeIndex = this.step === 5 ? 1 : 0;
        let passed = this.zones.length >= 2 && this.night.visible === this.controller.isNight;
        const snapshot = this.zones.map((zone, index) => {
            const expectedReveal = inside && (this.step === 6 || index === activeIndex);
            const expectedCutout = expectedReveal && this.controller.isNight && zone.lightsOn;
            const room = zone.owner as Laya.Sprite;
            let alignmentError = 0;
            if (zone.nightCutout?.visible) {
                const world = this.night.parent as Laya.Sprite;
                this.expectedPoint.setTo(0, 0);
                this.actualPoint.setTo(0, 0);
                room.localToGlobal(this.expectedPoint, false, world);
                zone.nightCutout.localToGlobal(this.actualPoint, false, world);
                alignmentError = Math.hypot(this.actualPoint.x - this.expectedPoint.x,
                    this.actualPoint.y - this.expectedPoint.y);
            }
            passed = passed && Math.abs(room.alpha - (expectedReveal ? 0 : zone.outsideAlpha)) < 0.001 &&
                zone.nightCutout?.visible === expectedCutout && alignmentError < 0.01;
            return { name: room.name, inside: zone.playerInside, revealed: zone.revealed,
                alpha: room.alpha, cutout: zone.nightCutout?.visible, alignmentError };
        });
        if (!passed) this.failures++;
        console.log("[RoomPerf] RESULT " + JSON.stringify({ scenario: this.labels[this.step], passed,
            fps: (this.frames - 1) / seconds, rtChanges: this.rtChanges,
            rtSize: [(this.night as any)._drawOriRT?.width, (this.night as any)._drawOriRT?.height],
            documentHidden: Laya.Browser.document?.hidden, nightVisible: this.night.visible, rooms: snapshot }));
        this.reported = true;
        this.measuring = false;
    }

    stop(): void {
        if (this.finished) return;
        this.finished = true;
        this.controller.isNight = this.originalNight;
        this.controller.combineRooms = this.originalCombine;
        this.zones.forEach((zone, index) => zone.lightsOn = this.originalLights[index]);
        if (!this.target.destroyed) this.target.pos(this.originalX, this.originalY);
        if (Joystick.instance) {
            Joystick.instance.valueX = this.originalJoystickX;
            Joystick.instance.valueY = this.originalJoystickY;
        }
        (this.night as any).updateRenderTexture = this.originalUpdateRT;
        if (this.flashlight && !this.flashlight.destroyed) this.flashlight.visible = this.originalFlashVisible;
        if (this.glow && !this.glow.destroyed) this.glow.visible = this.originalGlowVisible;
        this.night.reCache();
        console.log("[RoomPerf] STOP " + JSON.stringify({ completed: this.step === this.labels.length - 1, failures: this.failures }));
    }
}
