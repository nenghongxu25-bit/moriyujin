/** A reusable copy of the flashlight, erased only inside a room's own cache. */
export class RoomFlashlightCutout {
    private readonly origin = new Laya.Point();
    private readonly axisX = new Laya.Point();
    private readonly axisY = new Laya.Point();
    private readonly matrix = new Laya.Matrix();
    private readonly bounds = new Laya.Rectangle();
    private a = NaN;
    private b = NaN;
    private c = NaN;
    private d = NaN;

    update(room: Laya.Sprite, copy: Laya.Sprite | null, source: Laya.Sprite | null,
        world: Laya.Sprite): void {
        if (!copy || copy.destroyed) return;
        // Alpha zero rooms need no redraw: they have already faded out on entry.
        if (!source || source.destroyed || !source.visible || !source.activeInHierarchy ||
            source.alpha <= 0 || room.alpha <= 0 || room.width <= 0 || room.height <= 0) {
            if (copy.visible) { copy.visible = false; room.reCache(); }
            return;
        }
        let changed = false;
        if (room.cacheAs !== "bitmap") { room.cacheAs = "bitmap"; changed = true; }
        // Exclude the moving/rotating light bounds from cache allocation.
        if (this.bounds.width !== room.width || this.bounds.height !== room.height) {
            this.bounds.setTo(0, 0, room.width, room.height);
            room.setSelfBounds(this.bounds); changed = true;
        }
        this.map(this.origin, 0, 0, source, room, world);
        this.map(this.axisX, 1, 0, source, room, world);
        this.map(this.axisY, 0, 1, source, room, world);
        const a = this.axisX.x - this.origin.x, b = this.axisX.y - this.origin.y;
        const c = this.axisY.x - this.origin.x, d = this.axisY.y - this.origin.y;
        const x = this.origin.x, y = this.origin.y;
        const wx = a * source.width, wy = b * source.width;
        const hx = c * source.height, hy = d * source.height;
        const overlaps = Math.max(x, x + wx, x + hx, x + wx + hx) > 0 &&
            Math.min(x, x + wx, x + hx, x + wx + hx) < room.width &&
            Math.max(y, y + wy, y + hy, y + wy + hy) > 0 &&
            Math.min(y, y + wy, y + hy, y + wy + hy) < room.height;
        if (copy.visible !== overlaps) { copy.visible = overlaps; changed = true; }
        if (!overlaps) { if (changed) room.reCache(); return; }
        if (copy.texture !== source.texture) { copy.texture = source.texture; changed = true; }
        if (copy.alpha !== source.alpha) { copy.alpha = source.alpha; changed = true; }
        if (copy.width !== source.width || copy.height !== source.height) {
            copy.size(source.width, source.height); changed = true;
        }
        if (!Number.isFinite(this.a) || Math.abs(a - this.a) > 0.000001 ||
            Math.abs(b - this.b) > 0.000001 || Math.abs(c - this.c) > 0.000001 || Math.abs(d - this.d) > 0.000001) {
            this.matrix.setTo(a, b, c, d, x, y); copy.transform = this.matrix;
            this.a = a; this.b = b; this.c = c; this.d = d; changed = true;
        } else if (Math.abs(copy.x - x) > 0.001 || Math.abs(copy.y - y) > 0.001) {
            copy.pos(x, y); changed = true;
        }
        if (changed) room.reCache();
    }

    private map(point: Laya.Point, x: number, y: number, source: Laya.Sprite,
        room: Laya.Sprite, world: Laya.Sprite): void {
        point.setTo(x, y); source.localToGlobal(point, false, world);
        room.globalToLocal(point, false, world);
    }
}
