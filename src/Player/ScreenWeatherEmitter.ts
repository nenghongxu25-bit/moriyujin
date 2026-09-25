const { regClass, property } = Laya;

/** Screen-space weather in its own camera-free Area2D. No player/camera dependency. */
@regClass("e312cb13-7d08-4e8c-bf9a-72512691e032")
export class ScreenWeatherEmitter extends Laya.Script {
    @property(Number) public margin = 96;
    private materials: Laya.Material[] = [];

    onAwake(): void {
        for (const child of this.owner.children) {
            const renderer = child.getComponent(Laya.ShurikenParticle2DRenderer);
            if (renderer?.sharedMaterial) {
                const material = renderer.sharedMaterial.clone();
                material.cull = Laya.RenderState.CULL_NONE;
                renderer.sharedMaterial = material;
                this.materials.push(material);
            }
        }
        this.resize();
    }
    onEnable(): void {
        Laya.stage.on(Laya.Event.RESIZE, this, this.resize);
        this.resize();
    }
    onDisable(): void { Laya.stage.off(Laya.Event.RESIZE, this, this.resize); }
    onDestroy(): void {
        Laya.stage.off(Laya.Event.RESIZE, this, this.resize);
        this.materials.forEach(material => material.destroy());
        this.materials.length = 0;
    }
    private resize(): void {
        const node = this.owner as Laya.Sprite;
        node.pos(Laya.stage.width / 2, Laya.stage.height / 2);
        for (const child of node.children) {
            const system = child.getComponent(Laya.ShurikenParticle2DRenderer)?.particleSystem;
            const shape = system?.shape?.shape;
            if (shape instanceof Laya.Box2DShape)
                shape.size.setValue((Laya.stage.width + this.margin * 2) / system.main.unitPixels,
                    (Laya.stage.height + this.margin * 2) / system.main.unitPixels);
        }
    }
}
