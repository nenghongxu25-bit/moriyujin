const { regClass, property } = Laya;

export type AnimalClip = "idle" | "walk" | "run" | "attack";

/** Only animates the Sprite already authored in the prefab. No generated UI. */
@regClass("053362f0-cfdd-4d3d-90af-c1953215b367")
export class AnimalFrameAnimator extends Laya.Script {
    @property(Laya.Sprite) public viewNode: Laya.Sprite = null;
    @property({ type: [Laya.Texture] }) public walkFrames: Laya.Texture[] = [];
    @property({ type: [Laya.Texture] }) public runFrames: Laya.Texture[] = [];
    @property({ type: [Laya.Texture] }) public attackFrames: Laya.Texture[] = [];
    @property(Number) public walkFps = 8;
    @property(Number) public runFps = 12;
    @property(Number) public attackFps = 10;
    public clip: AnimalClip = "idle";
    public elapsed = 0;
    public frameIndex = 0;
    private baseScaleX = 1;
    private initialized = false;

    onAwake(): void { this.initialize(); }

    public initialize(): void {
        if (this.initialized || !this.viewNode) return;
        this.initialized = true;
        this.baseScaleX = Math.abs(this.viewNode.scaleX) || 1;
        this.render();
    }

    public get ready(): boolean {
        return !!this.viewNode && [this.walkFrames, this.runFrames, this.attackFrames]
            .every(frames => frames.length > 0 && frames.every(texture => !!texture && texture.width > 0));
    }

    public get attackDuration(): number { return this.attackFrames.length / Math.max(1, this.attackFps); }

    public play(clip: AnimalClip, restart = false): void {
        this.initialize();
        if (clip === this.clip && !restart) return;
        this.clip = clip;
        this.elapsed = 0;
        this.render();
    }

    public advance(seconds: number): void {
        this.elapsed += Math.max(0, seconds);
        this.render();
    }

    public face(dx: number): void {
        this.initialize();
        if (this.viewNode && Math.abs(dx) > 0.001) {
            // All source frames face left. Only the visual is mirrored, never the body collider.
            this.viewNode.scaleX = dx > 0 ? -this.baseScaleX : this.baseScaleX;
        }
    }

    private render(): void {
        if (!this.viewNode || this.viewNode.destroyed) return;
        const frames = this.clip === "run" ? this.runFrames : this.clip === "attack" ? this.attackFrames : this.walkFrames;
        if (!frames.length) return;
        const fps = this.clip === "run" ? this.runFps : this.clip === "attack" ? this.attackFps : this.walkFps;
        const index = Math.floor(this.elapsed * Math.max(1, fps) + 1e-8);
        this.frameIndex = this.clip === "idle" ? 0 : this.clip === "attack"
            ? Math.min(frames.length - 1, index) : index % frames.length;
        this.viewNode.texture = frames[this.frameIndex];
    }
}
