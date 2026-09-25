const { regClass, property } = Laya;

/** A visual occluder only. Does not add or change gameplay collision. */
@regClass("ad602582-0a8d-4d34-8573-3cab8b47a2b0")
export class ImageDepthOccluder extends Laya.Script {
    private static readonly active = new Set<ImageDepthOccluder>();
    public static get activeOccluders(): Iterable<ImageDepthOccluder> { return this.active; }
    @property({ type: Laya.Sprite, caption: "遮挡轮廓图片" })
    public imageNode: Laya.Sprite | null = null;
    onEnable(): void { ImageDepthOccluder.active.add(this); }
    onDisable(): void { ImageDepthOccluder.active.delete(this); }
    onDestroy(): void { ImageDepthOccluder.active.delete(this); }
}
