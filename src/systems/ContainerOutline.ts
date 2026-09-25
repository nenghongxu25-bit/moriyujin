import { PlayerOutline } from "./PlayerOutline";

/** World-space image silhouette, above roofs and lighting but below the UI. */
export class ContainerOutline {
    private overlay: Laya.Sprite;
    private material: Laya.Material;
    private target: Laya.RenderTexture2D;
    private texture: Laya.Texture;
    private signature = "";

    constructor(private owner: Laya.Sprite) {}

    update(visible: boolean, highlighted: boolean): void {
        const visual = this.owner.getChildByName("img") as Laya.Sprite;
        let area: Laya.Node = this.owner.parent;
        while (area && area.name !== "Area2D") area = area.parent;
        if (!visible || !visual || !visual.visible || !visual.texture || !area) {
            this.hide(); return;
        }
        if (!this.overlay) {
            this.material = PlayerOutline.createMaterial();
            this.overlay = new Laya.Sprite();
            this.overlay.name = "ContainerOutlineVisual";
            this.overlay.mouseEnabled = false;
            this.overlay.zOrder = 199999;
            this.overlay.material = this.material;
            area.addChild(this.overlay);
        }
        const bounds = visual.getBounds();
        const pad = 6;
        const width = Math.ceil(bounds.width) + pad * 2;
        const height = Math.ceil(bounds.height) + pad * 2;
        if (width <= pad * 2 || height <= pad * 2) { this.hide(); return; }
        // Static containers need only one capture; recapture opening animation frames.
        const signature = [(visual as any).src, visual.texture?.url, bounds.x, bounds.y,
            width, height, visual.scaleX, visual.scaleY, visual.rotation].join("|");
        if (!this.texture || signature !== this.signature) {
            this.overlay.graphics.clear();
            this.texture?.destroy(); this.target?.destroy();
            this.target = visual.drawToRenderTexture2D(width, height,
                visual.x - bounds.x + pad, visual.y - bounds.y + pad,
                undefined, false, false, new Laya.Color(0, 0, 0, 0));
            this.texture = new Laya.Texture(this.target);
            this.overlay.graphics.drawTexture(this.texture, bounds.x - pad, bounds.y - pad,
                width, height, null, 1, null, null, [0,1,1,1,1,0,0,0]);
            this.signature = signature;
            this.material.shaderData.setTexture(Laya.Shader3D.propertyNameToID("u_outlineCapture"), this.target);
            this.material.shaderData.setVector(Laya.Shader3D.propertyNameToID("u_outlineStep"),
                new Laya.Vector4(2 / width, 2 / height, 0, 0));
        }
        const parent = this.overlay.parent as Laya.Sprite;
        const map = (x: number, y: number) => parent.globalToLocal(
            this.owner.localToGlobal(new Laya.Point(x, y), false), false);
        const o = map(0, 0), x = map(1, 0), y = map(0, 1);
        this.overlay.transform = new Laya.Matrix(x.x-o.x,x.y-o.y,y.x-o.x,y.y-o.y,o.x,o.y);
        this.material.shaderData.setVector(Laya.Shader3D.propertyNameToID("u_outlineColor"),
            highlighted ? new Laya.Vector4(1, .95, .72, .95) : new Laya.Vector4(.62, .62, .62, .65));
        this.overlay.visible = true;
    }

    hide(): void { if (this.overlay) this.overlay.visible = false; }
    destroy(): void {
        this.overlay?.destroy(); this.material?.destroy();
        this.texture?.destroy(); this.target?.destroy();
    }
}
