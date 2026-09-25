import { DepthSortable } from "./DepthSortable";
import { ImageDepthOccluder } from "./ImageDepthOccluder";
import { ForestDecorationShader } from "./ForestDecorationShader";
import { ForestDecorationSnow } from "./ForestDecorationSnow";
import { worldViewportCorners } from "./WorldViewport";
import { compileCoordinateFormula, CoordinateFunction } from "./CoordinateFormula";
const { regClass, property } = Laya;

type DecorationVariant = {
    texture: Laya.Texture; amplitude: number; name: string; weight: CoordinateFunction;
};
type DecorationRecord = {
    x: number; y: number; width: number; height: number; phase: number;
    variant: DecorationVariant; sprite: Laya.Sprite | null;
};

/** Scatter stable vegetation across a region; only instantiate sprites near the camera. */
@regClass("7b4312f7-5df3-4f4d-9a6c-75363298f196")
export class ForestDecorationArea extends Laya.Script {
    @property({ type: String, caption: "Region points (x,y;...)" })
    public regionPoints = "0,0;480,0;480,320;0,320";
    @property({ type: String, caption: "Density f(x,y), plants per 480x320 area" })
    public densityFunction = "10";
    @property({ type: Number, caption: "Minimum spacing" }) public minimumDistance = 30;
    @property({ type: Number, caption: "Random seed" }) public seed = 24017;
    @property({ type: Boolean, caption: "Scale density with region area" }) public scaleCountWithRegion = true;
    @property({ type: Boolean, caption: "Use wind shader" }) public applyWindShader = false;
    @property({ type: [Laya.Texture], caption: "Plant textures" })
    public plantTextures: Laya.Texture[] = [];
    @property({ type: String, caption: "Plant 1 weight f(x,y)" }) public plantWeight1 = "1";
    @property({ type: String, caption: "Plant 2 weight f(x,y)" }) public plantWeight2 = "1";
    @property({ type: String, caption: "Plant 3 weight f(x,y)" }) public plantWeight3 = "1";
    @property({ type: String, caption: "Plant 4 weight f(x,y)" }) public plantWeight4 = "1";
    @property({ type: String, caption: "Plant 5 weight f(x,y)" }) public plantWeight5 = "1";

    private records: DecorationRecord[] = [];
    private targetLayer: Laya.Sprite | null = null;
    private viewCheckElapsed = 0;
    private layoutSignature = "";
    private readonly viewPadding = 192;
    private readonly baseArea = 480 * 320;

    onStart(): void { this.rebuild(); }

    onUpdate(): void {
        this.viewCheckElapsed += Math.max(0, Laya.timer.delta) / 1000;
        if (this.viewCheckElapsed < 0.15) return;
        this.viewCheckElapsed = 0;
        const signature = this.getLayoutSignature();
        if (signature !== this.layoutSignature) {
            this.rebuild();
            return;
        }
        this.updateVisibleDecorations();
    }

    /** Rebuild deterministic scatter data; off-camera plants have no Sprite or Script nodes. */
    public rebuild(): void {
        this.clearScatter();
        const points = this.currentRegionPoints();
        this.layoutSignature = this.getLayoutSignature();
        if (points.length < 3) return;
        const area = this.owner as Laya.Sprite;
        const target = this.findActorLayer(area.parent as Laya.Sprite);
        if (!target) return;
        this.targetLayer = target;
        const areaScale = Math.abs(area.scaleX * area.scaleY) || 1;
        const variants = this.plantTextures
            .map((texture, index): DecorationVariant | null => texture ? ({
                texture,
                amplitude: 1.4 + (index % 4) * 0.25,
                name: `plant-${index + 1}`,
                weight: this.compileFormula(this.getPlantWeightFormula(index), `plant ${index + 1} weight`)
            }) : null)
            .filter((variant): variant is DecorationVariant => variant !== null);
        if (!variants.length) return;

        const density = this.compileFormula(this.densityFunction, "density");
        const rand = this.createRandom(this.seed);
        const xs = points.filter((_, i) => i % 2 === 0), ys = points.filter((_, i) => i % 2 === 1);
        const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
        const polygonArea = this.polygonArea(points);
        const maximumDensity = this.sampleMaximumDensity(points, minX, minY, maxX, maxY, density);
        if (!(maximumDensity > 0)) return;
        const areaFactor = this.scaleCountWithRegion ? polygonArea * areaScale / this.baseArea : 1;
        const expectedMaximumCount = maximumDensity * areaFactor;
        const recordLimit = Math.min(100000, Math.floor(expectedMaximumCount) +
            (rand() < expectedMaximumCount % 1 ? 1 : 0));
        if (recordLimit <= 0) return;
        const spacing = Math.max(0, this.minimumDistance), spacing2 = spacing * spacing;
        const cellSize = Math.max(1, spacing), buckets = new Map<string, Array<{ x: number; y: number }>>();
        const tries = Math.ceil(Math.max(recordLimit * 80, 120));
        for (let attempt = 0; attempt < tries && this.records.length < recordLimit; attempt++) {
            const x = minX + rand() * (maxX - minX), y = minY + rand() * (maxY - minY);
            if (!this.contains(points, x, y)) continue;
            const cellX = Math.floor(x / cellSize), cellY = Math.floor(y / cellSize);
            let tooClose = false;
            for (let oy = -1; oy <= 1 && !tooClose; oy++) for (let ox = -1; ox <= 1; ox++) {
                const bucket = buckets.get(`${cellX + ox},${cellY + oy}`);
                if (bucket?.some(p => (p.x - x) ** 2 + (p.y - y) ** 2 < spacing2)) {
                    tooClose = true;
                    break;
                }
            }
            if (tooClose) continue;
            const localDensity = Math.max(0, Math.min(maximumDensity, density(x, y)));
            if (rand() >= localDensity / maximumDensity) continue;
            const variant = this.pickWeightedVariant(variants, x, y, rand);
            if (!variant) continue;
            const key = `${cellX},${cellY}`;
            let bucket = buckets.get(key);
            if (!bucket) buckets.set(key, bucket = []);
            bucket.push({ x, y });

            const sourceW = Math.max(1, variant.texture.sourceWidth || 256);
            const sourceH = Math.max(1, variant.texture.sourceHeight || 256);
            const scale = 0.68 * (0.88 + rand() * 0.24);
            this.records.push({ x, y, width: Math.round(sourceW * scale),
                height: Math.round(sourceH * scale), phase: rand() * Math.PI * 2,
                variant, sprite: null });
        }
        this.updateVisibleDecorations();
    }

    onDestroy(): void { this.clearScatter(); }

    /** Shows an editable polygon and corner handles in the 2D Scene view. */
    onDrawGizmosSelected(): void {
        const manager = IEditorEnv.Gizmos2D.getManager(this.owner);
        if (!this.outline) {
            this.outline = manager.createPolygon(true);
            this.outline.fill({ color: "#83ba64", opacity: 0.12 });
            this.outline.stroke({ color: "#b8e98c", width: 2 });
        }
        if (!this.handles) {
            this.handles = manager.createHandleGroup("circle", 11, "#e1f78c", "#36552c", "move");
            this.handles.onHandleDragStart.add(() => EditorEnv.scene.recordObject(this, "regionPoints"));
            this.handles.onHandleDragMoving.add((handle, _event, dx, dy) => {
                const values = this.currentRegionPoints(), index = Number(handle.getData("regionIndex"));
                if (!Number.isInteger(index) || index < 0 || index >= values.length / 2) return;
                values[index * 2] += dx;
                values[index * 2 + 1] += dy;
                this.regionPoints = this.stringifyPoints(values);
            });
        }
        const points = this.currentRegionPoints();
        this.outline.points.splice(0, this.outline.points.length, ...points);
        this.outline.refresh();
        while (this.handles.array.length < points.length / 2) this.handles.add();
        while (this.handles.array.length > points.length / 2)
            this.handles.remove(this.handles.array[this.handles.array.length - 1]);
        this.handles.array.forEach((handle, index) => {
            handle.setData("regionIndex", index);
            handle.setLocalPos(points[index * 2], points[index * 2 + 1]);
        });
    }

    private updateVisibleDecorations(): void {
        const area = this.owner as Laya.Sprite, target = this.targetLayer;
        if (!target || target.destroyed || !Laya.stage?.width || !Laya.stage?.height) return;
        const corners = worldViewportCorners(area, this.viewPadding);
        const left = Math.min(...corners.map(p => p.x)), right = Math.max(...corners.map(p => p.x));
        const top = Math.min(...corners.map(p => p.y)), bottom = Math.max(...corners.map(p => p.y));
        for (let i = 0; i < this.records.length; i++) {
            const record = this.records[i], halfWidth = record.width * 0.5;
            const visible = record.x + halfWidth >= left && record.x - halfWidth <= right &&
                record.y - record.height * 0.9 <= bottom && record.y + record.height * 0.1 >= top;
            if (!visible && record.sprite) {
                record.sprite.destroy(true);
                record.sprite = null;
            } else if (visible && !record.sprite) {
                const sprite = new Laya.Sprite();
                sprite.name = `Decoration_${record.variant.name}_${i + 1}`;
                sprite.texture = record.variant.texture;
                sprite.size(record.width, record.height);
                sprite.pivotX = Math.round(record.width * 0.5);
                sprite.pivotY = Math.round(record.height * 0.9);
                const global = area.localToGlobal(new Laya.Point(record.x, record.y), false);
                const local = target.globalToLocal(global, false);
                sprite.pos(local.x, local.y);
                const sortable = sprite.addComponent(DepthSortable);
                sortable.groundY = sprite.pivotY;
                const occluder = sprite.addComponent(ImageDepthOccluder);
                occluder.imageNode = sprite;
                if (this.applyWindShader) {
                    const shader = sprite.addComponent(ForestDecorationShader);
                    shader.effect = 0;
                    shader.amplitude = record.variant.amplitude;
                    shader.phase = record.phase;
                }
                sprite.addComponent(ForestDecorationSnow);
                target.addChild(sprite);
                record.sprite = sprite;
            }
        }
    }

    private currentRegionPoints(): number[] {
        const points = this.parsePoints();
        const isDefault = points.length === 8 && points[0] === 0 && points[1] === 0 &&
            points[2] === 480 && points[3] === 0 && points[4] === 480 &&
            points[5] === 320 && points[6] === 0 && points[7] === 320;
        const node = this.owner as Laya.Sprite;
        if (isDefault && node.width > 0 && node.height > 0 && (node.width !== 480 || node.height !== 320))
            return [0, 0, node.width, 0, node.width, node.height, 0, node.height];
        return points;
    }
    private getLayoutSignature(): string {
        const area = this.owner as Laya.Sprite;
        return [area.width, area.height, area.scaleX, area.scaleY, this.regionPoints,
            this.densityFunction,
            this.plantWeight1, this.plantWeight2, this.plantWeight3,
            this.plantWeight4, this.plantWeight5, this.minimumDistance, this.seed,
            this.scaleCountWithRegion].join("|");
    }
    private parsePoints(): number[] {
        const values = this.regionPoints.split(/[;,\s]+/).map(Number).filter(Number.isFinite);
        return values.length >= 6 && values.length % 2 === 0 ? values : [];
    }
    private polygonArea(points: number[]): number {
        let area = 0, count = points.length / 2;
        for (let i = 0, j = count - 1; i < count; j = i++)
            area += points[j * 2] * points[i * 2 + 1] - points[i * 2] * points[j * 2 + 1];
        return Math.abs(area) * 0.5;
    }
    private sampleMaximumDensity(points: number[], minX: number, minY: number,
        maxX: number, maxY: number, density: CoordinateFunction): number {
        let maximum = 0;
        for (let yIndex = 0; yIndex <= 32; yIndex++) {
            const y = minY + (maxY - minY) * yIndex / 32;
            for (let xIndex = 0; xIndex <= 32; xIndex++) {
                const x = minX + (maxX - minX) * xIndex / 32;
                if (this.contains(points, x, y)) maximum = Math.max(maximum, density(x, y));
            }
        }
        return Math.min(10000, Math.max(0, maximum));
    }
    private stringifyPoints(points: number[]): string {
        return Array.from({ length: points.length / 2 }, (_, i) =>
            `${Math.round(points[i * 2])},${Math.round(points[i * 2 + 1])}`).join(";");
    }
    private contains(points: number[], x: number, y: number): boolean {
        let inside = false;
        for (let i = 0, j = points.length / 2 - 1; i < points.length / 2; j = i++) {
            const xi = points[i * 2], yi = points[i * 2 + 1], xj = points[j * 2], yj = points[j * 2 + 1];
            if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
        }
        return inside;
    }
    private findActorLayer(start: Laya.Sprite | null): Laya.Sprite | null {
        let node = start;
        while (node) {
            if (node.name === "ActorLayer") return node;
            node = node.parent as Laya.Sprite;
        }
        return start;
    }
    private createRandom(seed: number): () => number {
        let state = seed >>> 0;
        return () => {
            state += 0x6D2B79F5;
            let t = state;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }
    private compileFormula(source: string, label: string): CoordinateFunction {
        try {
            return compileCoordinateFormula(source);
        } catch (error) {
            console.warn(`[ForestDecorationArea] Invalid ${label} formula '${source}': ${String(error)}. Using 1.`);
            return () => 1;
        }
    }
    private getPlantWeightFormula(index: number): string {
        switch (index) {
            case 0: return this.plantWeight1;
            case 1: return this.plantWeight2;
            case 2: return this.plantWeight3;
            case 3: return this.plantWeight4;
            case 4: return this.plantWeight5;
            default: return "1";
        }
    }
    private pickWeightedVariant(variants: DecorationVariant[], x: number, y: number,
        rand: () => number): DecorationVariant | null {
        const rawWeights = variants.map((variant) => Math.max(0, variant.weight(x, y)));
        const total = rawWeights.reduce((sum, weight) => sum + weight, 0);
        if (!(total > 0) || !Number.isFinite(total)) return null;
        // Normalize this location's weights into probabilities before choosing a plant type.
        const probabilities = rawWeights.map((weight) => weight / total);
        let cursor = rand();
        for (let i = 0; i < variants.length; i++) {
            cursor -= probabilities[i];
            if (cursor < 0) return variants[i];
        }
        return variants[variants.length - 1];
    }
    private clearScatter(): void {
        for (const record of this.records) {
            if (record.sprite && !record.sprite.destroyed) record.sprite.destroy(true);
            record.sprite = null;
        }
        this.records.length = 0;
        this.targetLayer = null;
    }

    private outline: IEditorEnv.IGizmoPolygon | null = null;
    private handles: IEditorEnv.IGizmoHandleGroup | null = null;
}
