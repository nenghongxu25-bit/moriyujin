const { regClass, property } = Laya;

/** Preview-only click handler. It never opens inventory or consumes a container. */
@regClass()
export class LootPointPreview extends Laya.Script {
    @property(String)
    public visualId = '';

    @property(String)
    public visualFolder = 'loot-points-v1';

    private playing = false;

    onAwake(): void {
        const owner = this.owner as Laya.Sprite;
        owner.mouseEnabled = true;
        owner.on(Laya.Event.CLICK, this, this.play);
    }

    private play(): void {
        if (this.playing) return;
        const owner = this.owner as Laya.Sprite;
        const image = owner.getChildByName('img') as any;
        if (!image || !this.visualId) return;
        this.playing = true;
        const frames = [0, 1, 2, 3].map(i => `animation/container/${this.visualFolder}/${this.visualId}/frame_0${i}.png`);
        Laya.loader.load(frames).then(() => {
            if (owner.destroyed) return;
            Laya.timer.clearAll(this);
            frames.forEach((src, index) => Laya.timer.once(index * 125, this, () => {
                if (!owner.destroyed) image.src = src;
            }));
            Laya.timer.once(1800, this, () => {
                if (owner.destroyed) return;
                image.src = frames[0];
                this.playing = false;
            });
        });
    }
}
