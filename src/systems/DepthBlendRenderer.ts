import { DepthObstacle } from "./DepthObstacle";
import { ImageDepthOccluder } from "./ImageDepthOccluder";
import { DepthMaskMaterial } from "./DepthMaskMaterial";

/** Blends draw orders within wall rectangles or prefab image alpha contours.
 * The original actor remains behind the occluder; a clipped live copy supplies
 * the distance-weighted foreground contribution. Other scenery never fades.
 */
export class DepthBlendRenderer {
    private readonly size = 512;
    private readonly pad = 256;
    private target: Laya.RenderTexture2D | null = null;
    private texture: Laya.Texture | null = null;
    private overlays: Laya.Sprite[] = [];
    private materials: Laya.Material[] = [];
    constructor(private actor: Laya.Sprite, private depthOf: (wall: Laya.Sprite) => number | null) {}

    public update(foot: number, band: number): void {
        this.reset();
        const actor = this.actor;
        if (!actor.parent || !actor.visible || actor.rotation !== 0 || !actor.scaleX || !actor.scaleY) return;
        const candidates: { wall: Laya.Sprite; depth: number; weight: number;
            left: number; top: number; right: number; bottom: number;
            image?: Laya.Sprite; matrix?: Laya.Matrix }[] = [];
        for (const obstacle of DepthObstacle.activeObstacles) {
            const wall = obstacle.owner as Laya.Sprite;
            // Only solid rectangular tile walls, not trees or arbitrary sprites.
            if (wall.parent !== actor.parent || !wall.visible || wall.rotation !== 0 ||
                wall.scaleX !== 1 || wall.scaleY !== 1 || !wall.getComponent(Laya.TileMapLayer)) continue;
            const depth = this.depthOf(wall);
            if (depth === null) continue;
            const delta = foot - depth;
            if (delta <= -band || delta >= band) continue;
            if (actor.x + this.pad * Math.abs(actor.scaleX) <= wall.x ||
                actor.x - this.pad * Math.abs(actor.scaleX) >= wall.x + wall.width ||
                actor.y + this.pad * Math.abs(actor.scaleY) <= wall.y ||
                actor.y - this.pad * Math.abs(actor.scaleY) >= wall.y + wall.height) continue;
            const t = Math.max(0, Math.min(1, (delta + band) / (2 * band)));
            candidates.push({ wall, depth, weight: t * t * (3 - 2 * t),
                left: wall.x, top: wall.y, right: wall.x + wall.width, bottom: wall.y + wall.height });
        }
        for (const occluder of ImageDepthOccluder.activeOccluders) {
            const wall = occluder.owner as Laya.Sprite, image = occluder.imageNode;
            if (wall.parent !== actor.parent || !wall.visible || !image || image.destroyed ||
                !image.visible || !image.activeInHierarchy || !image.texture || !image.width || !image.height) continue;
            const depth = this.depthOf(wall);
            if (depth === null || Math.abs(foot - depth) >= band) continue;
            const map = (x: number, y: number) => (actor.parent as Laya.Sprite).globalToLocal(
                image.localToGlobal(new Laya.Point(x, y), false), false);
            const p = map(0, 0), px = map(image.width, 0), py = map(0, image.height);
            const endX = px.x + py.x - p.x, endY = px.y + py.y - p.y;
            const left = Math.min(p.x, px.x, py.x, endX), right = Math.max(p.x, px.x, py.x, endX);
            const top = Math.min(p.y, px.y, py.y, endY), bottom = Math.max(p.y, px.y, py.y, endY);
            if (right <= actor.x - this.pad || left >= actor.x + this.pad ||
                bottom <= actor.y - this.pad || top >= actor.y + this.pad) continue;
            const t = (foot - depth + band) / (2 * band);
            candidates.push({ wall, depth, weight: t * t * (3 - 2 * t), left, top, right, bottom, image,
                matrix: new Laya.Matrix((px.x - p.x) / image.width, (px.y - p.y) / image.width,
                    (py.x - p.x) / image.height, (py.y - p.y) / image.height, p.x - actor.x, p.y - actor.y) });
        }
        if (!candidates.length) return;
        // Reuse a single render target; no duplicate animated Spine or input node.
        this.target = actor.drawToRenderTexture2D(this.size, this.size, this.pad * actor.scaleX, this.pad * actor.scaleY,
            this.target || undefined, false, false, new Laya.Color(0, 0, 0, 0));
        if (!this.texture) this.texture = new Laya.Texture(this.target);
        let index = 0;
        for (const candidate of candidates) {
            const { depth, weight, image, matrix } = candidate;
            let copy = this.overlays[index];
            if (!copy) {
                copy = new Laya.Sprite();
                copy.name = "DepthBlendVisual";
                copy.mouseEnabled = false;
                this.overlays[index] = copy;
            }
            if (copy.parent !== actor.parent) actor.parent.addChild(copy);
            copy.pos(actor.x, actor.y);
            // The offscreen result already contains the actor's facing transform.
            copy.scale(1, 1);
            copy.zOrder = depth + 0.01;
            copy.visible = true;
            const x0 = candidate.left - actor.x;
            const x1 = candidate.right - actor.x;
            const y0 = candidate.top - actor.y;
            const y1 = candidate.bottom - actor.y;
            const g = copy.graphics;
            g.clear();
            const left = Math.max(-this.pad, Math.min(x0, x1));
            const top = Math.max(-this.pad, Math.min(y0, y1));
            const right = Math.min(this.pad, Math.max(x0, x1));
            const bottom = Math.min(this.pad, Math.max(y0, y1));
            const u0 = (left + this.pad) / this.size, u1 = (right + this.pad) / this.size;
            const v0 = 1 - (top + this.pad) / this.size, v1 = 1 - (bottom + this.pad) / this.size;
            g.drawTexture(this.texture, left, top, right - left, bottom - top, null, weight,
                null, null, [u0, v0, u1, v0, u1, v1, u0, v1]);
            if (image) {
                let material = this.materials[index];
                if (!material) material = this.materials[index] = DepthMaskMaterial.create();
                DepthMaskMaterial.update(material, image, matrix, this.size, this.pad);
                matrix.destroy();
                copy.material = material;
            } else copy.material = null;
            actor.zOrder = Math.min(actor.zOrder, depth - 0.01);
            index++;
        }
    }

    public reset(): void { for (const copy of this.overlays) copy.visible = false; }
    public destroy(): void {
        for (const copy of this.overlays) copy.destroy(true);
        for (const material of this.materials) material?.destroy();
        this.materials.length = 0;
        this.overlays.length = 0;
        this.texture?.destroy(); this.texture = null;
        this.target?.destroy(); this.target = null;
    }
}
