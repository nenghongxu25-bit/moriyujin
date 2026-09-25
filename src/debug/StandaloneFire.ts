const { regClass, property } = Laya;

type FireFrames = { frames: Laya.Texture[]; users: number };

/** Reusable visual fire. One shared set of atlas regions, no per-frame texture creation. */
@regClass("46162c80-4b23-4988-a13a-48a184e32811")
export class StandaloneFire extends Laya.Script {
    private static readonly cache = new WeakMap<Laya.Texture, FireFrames>();

    @property({ type: Laya.Texture, caption: "火焰图集" })
    public sheet: Laya.Texture = null;

    @property({ type: Number, caption: "每秒帧数" })
    public fps = 8;

    @property({ type: Boolean, caption: "随机播放起点" })
    public randomStart = true;

    private shared: FireFrames = null;
    private source: Laya.Texture = null;
    private phase = 0;
    private frame = -1;

    onAwake(): void {
        (this.owner as Laya.Sprite).mouseEnabled = false;
        if (!this.sheet) return;
        this.source = this.sheet;
        this.shared = StandaloneFire.cache.get(this.source);
        if (!this.shared) {
            const frames: Laya.Texture[] = [];
            const w = this.source.width / 4, h = this.source.height / 2;
            for (let i = 0; i < 8; i++) {
                frames.push(Laya.Texture.createFromTexture(this.source, (i % 4) * w, Math.floor(i / 4) * h, w, h));
            }
            this.shared = { frames, users: 0 };
            StandaloneFire.cache.set(this.source, this.shared);
        }
        this.shared.users++;
        this.phase = this.randomStart ? Math.random() * 8 : 0;
        this.showFrame();
    }

    onUpdate(): void {
        if (!this.shared) return;
        const speed = Number.isFinite(this.fps) ? Math.max(0, this.fps) : 8;
        this.phase = (this.phase + Laya.timer.delta * 0.001 * speed) % 8;
        this.showFrame();
    }

    private showFrame(): void {
        const next = Math.floor(this.phase);
        if (next === this.frame) return;
        this.frame = next;
        (this.owner as Laya.Sprite).texture = this.shared.frames[next];
    }

    onDestroy(): void {
        if (!this.shared) return;
        if (!this.owner.destroyed) (this.owner as Laya.Sprite).texture = null;
        if (--this.shared.users === 0) {
            for (const frame of this.shared.frames) frame.destroy();
            StandaloneFire.cache.delete(this.source);
        }
        this.shared = null;
        this.source = null;
    }
}
