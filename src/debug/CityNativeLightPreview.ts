const { regClass } = Laya;

type PatchedWall = {
    node: Laya.Sprite;
    texture: Laya.Texture;
    mesh: Laya.Mesh2DRender;
};
type WallPoint = { x: number; y: number };
type WallEdge = { axis: "u" | "v"; slope: number; intercept: number; x0: number; x1: number; scaleX: number; scaleY: number };

function polygonHull(points: WallPoint[]): number[] {
    const sorted = points.slice().sort((a, b) => a.x - b.x || a.y - b.y);
    const unique = sorted.filter((p, i) => i === 0 || Math.abs(p.x - sorted[i - 1].x) > 0.01 || Math.abs(p.y - sorted[i - 1].y) > 0.01);
    if (unique.length < 3) return [];
    const cross = (o: WallPoint, a: WallPoint, b: WallPoint) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    const lower: WallPoint[] = [], upper: WallPoint[] = [];
    for (const point of unique) {
        while (lower.length > 1 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) lower.pop();
        lower.push(point);
    }
    for (let i = unique.length - 1; i >= 0; i--) {
        const point = unique[i];
        while (upper.length > 1 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) upper.pop();
        upper.push(point);
    }
    lower.pop(); upper.pop();
    const result: number[] = [];
    for (const point of lower.concat(upper)) result.push(point.x, point.y);
    return result;
}

/** Opt-in native Light2D test in city. Press N to toggle; restores original renderers on exit. */
@regClass("d6ea58ab-9135-4585-965f-baf81176cf68")
export class CityNativeLightPreview extends Laya.Script {
    private previewEnabled = false;
    private world: Laya.Sprite | null = null;
    private lightNode: Laya.Sprite | null = null;
    private receivers: { render: Laya.BaseRenderNode2D; lightReceive: boolean; layer: number }[] = [];
    private walls = new Map<Laya.Sprite, PatchedWall>();
    private mergedOccluders: Laya.Sprite[] = [];
    private readonly keyDown = (event: any): void => {
        if (event.keyCode === 78 || String(event.key || "").toLowerCase() === "n")
            this.setEnabled(!this.previewEnabled);
    };

    onStart(): void {
        console.info("[CityNativeLightPreview] Ready. Click the game preview and press N to toggle native city lighting.");
    }

    onEnable(): void {
        Laya.stage.on(Laya.Event.KEY_DOWN, this, this.keyDown);
    }

    onDisable(): void {
        Laya.stage.off(Laya.Event.KEY_DOWN, this, this.keyDown);
        this.setEnabled(false);
    }

    onUpdate(): void {
        if (!this.previewEnabled || !this.world || !this.lightNode) return;
        this.patchNewWalls();
        const player = this.findPlayer();
        if (!player) return;
        const foot = this.world.globalToLocal(
            player.localToGlobal(new Laya.Point(player.width * 0.5, player.height), false), false
        );
        this.lightNode.pos(foot.x, foot.y - 48);
    }

    private setEnabled(value: boolean): void {
        if (this.previewEnabled === value) return;
        this.previewEnabled = value;
        if (value) this.enablePreview();
        else this.disablePreview();
    }

    private enablePreview(): void {
        const scene = this.owner.scene;
        this.world = this.owner.parent as Laya.Sprite;
        if (!scene || !this.world) return;

        // The city floor is still a TileMapLayer, so its native renderer can receive light.
        const ground = this.findNamed(scene, "GroundLayer");
        if (ground) this.collectTileMapReceivers(ground);
        for (const entry of this.receivers) {
            // Ground remains the shadow-receiving layer; restore its layer on teardown.
            entry.render.layer = 0;
            entry.render.lightReceive = true;
        }

        this.lightNode = new Laya.Sprite();
        this.lightNode.name = "CityNativeLightPreviewSource";
        this.world.addChild(this.lightNode);
        const light = this.lightNode.addComponent(Laya.SpotLight2D) as Laya.SpotLight2D;
        // Keep the full-bright core wider than a single 256x384 wall sprite,
        // so a connected run of city wall tiles lights together.
        light.innerRadius = 360;
        light.outerRadius = 760;
        light.innerAngle = 360;
        light.outerAngle = 360;
        light.falloffIntensity = 1.2;
        light.color = new Laya.Color(1, 0.72, 0.42, 1);
        light.intensity = 1.25;
        // Illuminate ground (layer 0) and wall artwork (layer 1), but let
        // shadows affect only the ground through shadowLayerMask below.
        light.layerMask = 3;
        light.shadowLayerMask = 1;
        light.shadowEnable = true;
        light.shadowStrength = 0.9;
        light.shadowFilterType = Laya.ShadowFilterType.None;

        this.patchNewWalls();
        console.info("[CityNativeLightPreview] Native city light ON. Press N to turn it off.");
    }

    private disablePreview(): void {
        for (const entry of this.receivers) {
            if (!entry.render.destroyed) {
                entry.render.lightReceive = entry.lightReceive;
                entry.render.layer = entry.layer;
            }
        }
        this.receivers.length = 0;
        for (const patched of this.walls.values()) {
            const { node, texture, mesh } = patched;
            if (node.destroyed) continue;
            node.texture = texture;
            mesh.destroy();
        }
        this.walls.clear();
        for (const node of this.mergedOccluders) if (!node.destroyed) node.destroy(true);
        this.mergedOccluders.length = 0;
        if (this.lightNode && !this.lightNode.destroyed) this.lightNode.destroy(true);
        this.lightNode = null;
        this.world = null;
        console.info("[CityNativeLightPreview] Native city light OFF; original walls restored.");
    }

    private patchNewWalls(): void {
        if (!this.world) return;
        const found = new Set<Laya.Sprite>();
        let changed = false;
        const visit = (node: Laya.Node): void => {
            const sprite = node as Laya.Sprite;
            if (sprite.name === "BrickWallVisual") {
                found.add(sprite);
                if (!this.walls.has(sprite) && sprite.texture) {
                    const texture = sprite.texture;
                    const mesh = sprite.addComponent(Laya.Mesh2DRender) as Laya.Mesh2DRender;
                    mesh.useUnitQuad = true;
                    mesh.size = new Laya.Vector2(256, 384);
                    mesh.texture = texture;
                    mesh.layer = 1;
                    mesh.lightReceive = true;
                    this.walls.set(sprite, { node: sprite, texture, mesh });
                    sprite.texture = null;
                    changed = true;
                }
            }
            for (const child of node.children) visit(child);
        };
        visit(this.world);
        for (const [node, patched] of this.walls) {
            if (found.has(node) && !node.destroyed) continue;
            if (!node.destroyed) {
                node.texture = patched.texture;
                patched.mesh.destroy();
            }
            this.walls.delete(node);
            changed = true;
        }
        if (changed) this.rebuildMergedOccluders();
    }

    /** Build one blocker per continuous straight wall run, not one per render tile. */
    private rebuildMergedOccluders(): void {
        if (!this.world) return;
        for (const node of this.mergedOccluders) if (!node.destroyed) node.destroy(true);
        this.mergedOccluders.length = 0;

        const edgeMap = new Map<string, WallEdge>();
        const addEdge = (axis: "u" | "v", from: WallPoint, to: WallPoint, sx: number, sy: number): void => {
            const p0 = from.x <= to.x ? from : to, p1 = from.x <= to.x ? to : from;
            const slope = (p1.y - p0.y) / (p1.x - p0.x || 1);
            const intercept = p0.y - slope * p0.x;
            const key = `${axis}:${Math.round(p0.x * 10)}:${Math.round(p0.y * 10)}:${Math.round(p1.x * 10)}:${Math.round(p1.y * 10)}`;
            if (!edgeMap.has(key)) edgeMap.set(key, { axis, slope, intercept, x0: p0.x, x1: p1.x, scaleX: sx, scaleY: sy });
        };

        const addOccluder = (hull: number[]): void => {
            if (hull.length < 6) return;
            const blocker = new Laya.Sprite();
            blocker.name = "CityMergedWallOccluder";
            this.world!.addChild(blocker);
            const occluder = blocker.addComponent(Laya.LightOccluder2D) as Laya.LightOccluder2D;
            occluder.layerMask = 1;
            occluder.polygonPoint = new Laya.PolygonPoint2D(hull);
            this.mergedOccluders.push(blocker);
        };

        for (const { node } of this.walls.values()) {
            const data = node as any;
            const mask = Number(data.__nativeWallMask);
            if (!Number.isFinite(mask) || mask >= 16) continue; // Doorway tiles are an open light portal.
            const cx = Number(data.__nativeWallCenterX), cy = Number(data.__nativeWallCenterY);
            const sx = Number(data.__nativeWallScaleX), sy = Number(data.__nativeWallScaleY);
            if (![cx, cy, sx, sy].every(Number.isFinite)) continue;
            const u = { x: 128 * sx, y: 64 * sy };
            const v = { x: -128 * sx, y: 64 * sy };
            if (mask & 1) addEdge("u", { x: cx, y: cy }, { x: cx + u.x, y: cy + u.y }, sx, sy);
            if (mask & 4) addEdge("u", { x: cx - u.x, y: cy - u.y }, { x: cx, y: cy }, sx, sy);
            if (mask & 2) addEdge("v", { x: cx, y: cy }, { x: cx + v.x, y: cy + v.y }, sx, sy);
            if (mask & 8) addEdge("v", { x: cx - v.x, y: cy - v.y }, { x: cx, y: cy }, sx, sy);
        }

        const lines = new Map<string, WallEdge[]>();
        for (const edge of edgeMap.values()) {
            const key = `${edge.axis}:${Math.round(edge.intercept / 2)}`;
            const list = lines.get(key) || [];
            list.push(edge);
            lines.set(key, list);
        }

        const createRun = (run: WallEdge[]): void => {
            if (!run.length) return;
            const first = run[0], x0 = Math.min(...run.map(e => e.x0)), x1 = Math.max(...run.map(e => e.x1));
            if (x1 - x0 < 1) return;
            const y0 = first.slope * x0 + first.intercept, y1 = first.slope * x1 + first.intercept;
            const thickness = 3 / 16;
            const offset = first.axis === "u"
                ? { x: -128 * first.scaleX * thickness, y: 64 * first.scaleY * thickness }
                : { x: 128 * first.scaleX * thickness, y: 64 * first.scaleY * thickness };
            const height = 256 * first.scaleY;
            const hull = polygonHull([
                { x: x0 + offset.x, y: y0 + offset.y }, { x: x0 - offset.x, y: y0 - offset.y },
                { x: x1 + offset.x, y: y1 + offset.y }, { x: x1 - offset.x, y: y1 - offset.y },
                { x: x0 + offset.x, y: y0 + offset.y - height }, { x: x0 - offset.x, y: y0 - offset.y - height },
                { x: x1 + offset.x, y: y1 + offset.y - height }, { x: x1 - offset.x, y: y1 - offset.y - height }
            ]);
            addOccluder(hull);
        };

        for (const edges of lines.values()) {
            edges.sort((a, b) => a.x0 - b.x0);
            let run: WallEdge[] = [];
            let end = -Infinity;
            for (const edge of edges) {
                if (run.length && edge.x0 > end + 2) {
                    createRun(run);
                    run = [];
                }
                run.push(edge);
                end = Math.max(end, edge.x1);
            }
            createRun(run);
        }
        console.info(`[CityNativeLightPreview] Merged ${edgeMap.size} wall edges into ${this.mergedOccluders.length} continuous occluders.`);
    }

    private collectTileMapReceivers(root: Laya.Node): void {
        const visit = (node: Laya.Node): void => {
            const tilemap = (node as Laya.Sprite).getComponent?.(Laya.TileMapLayer) as Laya.TileMapLayer;
            if (tilemap && !this.receivers.some(entry => entry.render === tilemap))
                this.receivers.push({ render: tilemap, lightReceive: tilemap.lightReceive, layer: tilemap.layer });
            for (const child of node.children) visit(child);
        };
        visit(root);
    }

    private findNamed(root: Laya.Node, name: string): Laya.Node | null {
        if (root.name === name) return root;
        for (const child of root.children) {
            const result = this.findNamed(child, name);
            if (result) return result;
        }
        return null;
    }

    private findPlayer(): Laya.Sprite | null {
        const root = this.owner.scene;
        if (!root) return null;
        const visit = (node: Laya.Node): Laya.Sprite | null => {
            if (node.name === "prefab_player") return node as Laya.Sprite;
            for (const child of node.children) {
                const result = visit(child);
                if (result) return result;
            }
            return null;
        };
        return visit(root);
    }
}
