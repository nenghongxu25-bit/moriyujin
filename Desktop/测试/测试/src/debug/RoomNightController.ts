const { regClass, property } = Laya;
import { RoomNightZone } from "./RoomNightZone";
import { RoomNightDiagnostics } from "./RoomNightDiagnostics";

@regClass("b0f26c1a-7564-48ad-a3b9-a1b836acf471")
export class RoomNightController extends Laya.Script {
    @property({ type: Laya.Sprite, caption: "玩家" })
    public targetNode: Laya.Sprite | null = null;

    @property({ type: Laya.Sprite, caption: "全局黑夜层" })
    public nightLayer: Laya.Sprite | null = null;

    @property({ type: Boolean, caption: "夜晚" })
    public isNight: boolean = true;

    @property({ type: Boolean, caption: "所有区域属于同一房间" })
    public combineRooms: boolean = false;

    @property({ type: Boolean, caption: "运行房间回归测试（会移动玩家）" })
    public diagnosticsEnabled: boolean = false;

    private diagnostics: RoomNightDiagnostics | null = null;

    private readonly rooms: RoomNightZone[] = [];
    private originalNightVisible = true;

    onEnable(): void {
        this.rooms.length = 0;
        for (let index = 0; index < this.owner.numChildren; index++) {
            const zone = this.owner.getChildAt(index).getComponent(RoomNightZone);
            if (zone) this.rooms.push(zone);
        }
        this.originalNightVisible = this.nightLayer?.visible ?? true;
    }

    // Called explicitly by the existing flashlight at the end of its LateUpdate.
    // Scene-owned 2D scripts do not receive the stage's pre-render callbacks.
    public updateAfterFlashlight(): void {
        const target = this.targetNode;
        const night = this.nightLayer;
        if (!target || target.destroyed || !night || night.destroyed || !night.parent) return;
        if (this.diagnosticsEnabled && !this.diagnostics) {
            this.diagnostics = new RoomNightDiagnostics(this, this.rooms, target, night);
        }
        this.diagnostics?.beforeFrame();
        const world = night.parent as Laya.Sprite;
        let insideAny = false;
        for (let index = 0; index < this.rooms.length; index++) {
            if (this.rooms[index].containsPlayer(target, world)) insideAny = true;
        }
        let changed = night.visible !== this.isNight;
        if (changed) night.visible = this.isNight;
        const dt = Math.min(0.1, Math.max(0, Number(Laya.timer.delta) || 0) / 1000);
        for (let index = 0; index < this.rooms.length; index++) {
            const zone = this.rooms[index];
            changed = zone.updateRoom(this.combineRooms ? insideAny : zone.playerInside,
                this.isNight, night, world, dt) || changed;
        }
        if (changed && this.isNight) night.reCache();
        this.diagnostics?.afterFrame();
    }

    onDisable(): void {
        this.diagnostics?.stop();
        this.diagnostics = null;
        for (let index = 0; index < this.rooms.length; index++) this.rooms[index].resetRoom();
        if (this.nightLayer && !this.nightLayer.destroyed) {
            this.nightLayer.visible = this.originalNightVisible;
            this.nightLayer.reCache();
        }
    }

}
