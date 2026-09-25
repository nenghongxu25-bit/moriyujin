import {SpatialBuckets} from './SpatialBuckets';
const { regClass, property } = Laya;

/** A solid ground footprint, independent of the image above it. */
@regClass("20c26d35-af30-488e-9ed0-20b58656a0cb")
export class DepthObstacle extends Laya.Script {
    private static readonly active = new Set<DepthObstacle>();
    private static readonly dynamic = new Set<DepthObstacle>();
    private static readonly walls=new Map<Laya.Sprite,{grid:SpatialBuckets<DepthObstacle>;aspectX:number;aspectY:number}>();
    private indexedParent:Laya.Sprite=null;
    /** Generated walls are fixed until BrickWallTileLayer.rebuild(). */
    public indexStaticWall():void {
        this.removeFromIndex();
        const n=this.owner as Laya.Sprite,parent=n.parent as Laya.Sprite;
        if(!parent||!this.isometricGround||n.rotation||n.skewX||n.skewY||n.pivotX||n.pivotY||n.scaleX<=0||n.scaleY<=0)return;
        let index=DepthObstacle.walls.get(parent);
        if(!index)DepthObstacle.walls.set(parent,index={grid:new SpatialBuckets(),aspectX:0,aspectY:0});
        const x=this.blockX,y=this.blockY,w=this.blockWidth,h=this.blockHeight;
        index.grid.add(this,n.x+128*(x-y-h)*n.scaleX,n.y+64*(x+y)*n.scaleY,
            n.x+128*(x+w-y)*n.scaleX,n.y+64*(x+w+y+h)*n.scaleY);
        index.aspectX=Math.max(index.aspectX,n.scaleX/n.scaleY);
        index.aspectY=Math.max(index.aspectY,n.scaleY/n.scaleX);
        this.indexedParent=parent;DepthObstacle.dynamic.delete(this);
    }
    private removeFromIndex():void {
        if(this.indexedParent){
            const index=DepthObstacle.walls.get(this.indexedParent);
            index?.grid.remove(this);if(index&&!index.grid.count)DepthObstacle.walls.delete(this.indexedParent);
            this.indexedParent=null;
        }
        if(DepthObstacle.active.has(this))DepthObstacle.dynamic.add(this);
    }
    public static get activeObstacles(): Iterable<DepthObstacle> { return this.active; }
    @property({ type: Number, caption: "阻挡左边（节点内）" }) public blockX = 0;
    @property({ type: Number, caption: "阻挡上边（节点内）" }) public blockY = 0;
    @property({ type: Number, caption: "阻挡宽度" }) public blockWidth = 128;
    @property({ type: Number, caption: "阻挡厚度" }) public blockHeight = 24;
    @property({ type: Boolean, caption: "墙后枪械防穿出" }) public stowCrossingWeapon = false;
    @property({ type: Boolean, caption: "等距墙脚坐标" }) public isometricGround = false;

    /** Test the actual rotated weapon rectangle against the wall's bottom edge. */
    public static weaponCrossesWall(actor: Laya.Sprite, weapon: Laya.Sprite, footY: number): boolean {
        if (!actor.parent || !weapon.width || !weapon.height) return false;
        for (const obstacle of this.active) {
            const wall = obstacle.owner as Laya.Sprite;
            if (!obstacle.stowCrossingWeapon || wall.scene !== actor.scene || !wall.activeInHierarchy) continue;
            const foot = (actor.parent as Laya.Sprite).localToGlobal(new Laya.Point(actor.x, actor.y + footY), false);
            wall.globalToLocal(foot, false);
            // Only actors behind the wall; those in front keep their normal weapon.
            if (foot.y > obstacle.blockY) continue;
            const edge = obstacle.blockY + obstacle.blockHeight - 2;
            const points = [new Laya.Point(0, 0), new Laya.Point(weapon.width, 0),
                new Laya.Point(weapon.width, weapon.height), new Laya.Point(0, weapon.height)];
            for (const p of points) { weapon.localToGlobal(p, false); wall.globalToLocal(p, false); }
            const intersections: number[] = [];
            for (let i = 0; i < 4; i++) {
                const a = points[i], b = points[(i + 1) % 4];
                if ((a.y <= edge && b.y > edge) || (b.y <= edge && a.y > edge)) {
                    intersections.push(a.x + (b.x - a.x) * (edge - a.y) / (b.y - a.y));
                }
            }
            if (intersections.length >= 2 && Math.max(...intersections) > obstacle.blockX &&
                Math.min(...intersections) < obstacle.blockX + obstacle.blockWidth) return true;
        }
        return false;
    }

    private readonly from = new Laya.Point();
    private readonly to = new Laya.Point();
    private readonly left = new Laya.Point();
    private readonly right = new Laya.Point();
    private readonly back = new Laya.Point();
    private readonly front = new Laya.Point();

    onEnable(): void { DepthObstacle.active.add(this); DepthObstacle.dynamic.add(this); }
    onDisable(): void { DepthObstacle.active.delete(this);this.removeFromIndex();DepthObstacle.dynamic.delete(this); }
    onDestroy(): void { this.onDisable(); }

    public static blocksMove(actor: Laya.Sprite, fromX: number, fromY: number,
        toX: number, toY: number, footY: number, halfWidth: number, halfDepth: number = 0): boolean {
        const candidates=function*(parent:Laya.Sprite):Iterable<DepthObstacle>{
            yield* DepthObstacle.dynamic;
            for(const [world,index] of DepthObstacle.walls){
                if(world===parent){
                    // Conservative envelope of the existing expanded UV test.
                    const px=halfWidth+2*index.aspectX*halfDepth,py=halfDepth+.5*index.aspectY*halfWidth;
                    yield* index.grid.query(Math.min(fromX,toX)-px,Math.min(fromY,toY)+footY-py,
                        Math.max(fromX,toX)+px,Math.max(fromY,toY)+footY+py);
                }else if(world.scene===actor.scene)yield* index.grid.values();
            }
        };
        for (const obstacle of candidates(actor.parent as Laya.Sprite)) {
            if (obstacle.owner !== actor && obstacle.owner.scene === actor.scene &&
                obstacle.blockWidth > 0 && obstacle.blockHeight > 0 &&
                obstacle.blocks(actor, fromX, fromY, toX, toY, footY, halfWidth, halfDepth)) return true;
        }
        return false;
    }

    private blocks(actor: Laya.Sprite, fromX: number, fromY: number,
        toX: number, toY: number, footY: number, halfWidth: number, halfDepth: number): boolean {
        const parent = actor.parent as Laya.Sprite;
        const owner = this.owner as Laya.Sprite;
        if (!parent || owner.destroyed || !owner.activeInHierarchy) return false;
        // Generated wall footprints share ActorLayer with the actor. Reject a
        // distant sweep before doing six pairs of global/local transforms.
        // Rotated/skewed or differently parented objects use the original path.
        if(owner.parent===parent&&!owner.rotation&&!owner.skewX&&!owner.skewY&&
            !owner.pivotX&&!owner.pivotY){
            const x=this.blockX,y=this.blockY,w=this.blockWidth,h=this.blockHeight;
            const sx=owner.scaleX,sy=owner.scaleY;
            const x0=this.isometricGround?128*(x-y-h):x;
            const x1=this.isometricGround?128*(x+w-y):x+w;
            const y0=this.isometricGround?64*(x+y):y;
            const y1=this.isometricGround?64*(x+w+y+h):y+h;
            // Enclose the narrow phase's expanded UV rectangle, including its
            // conservative corner area (not just the physical foot ellipse).
            const support=this.isometricGround?Math.hypot(halfWidth/(256*sx),halfDepth/(128*sy)):0;
            const padX=this.isometricGround?Math.abs(256*sx*support):halfWidth;
            const padY=this.isometricGround?Math.abs(128*sy*support):halfDepth;
            const minX=owner.x+Math.min(x0*sx,x1*sx)-padX;
            const maxX=owner.x+Math.max(x0*sx,x1*sx)+padX;
            const minY=owner.y+Math.min(y0*sy,y1*sy)-padY;
            const maxY=owner.y+Math.max(y0*sy,y1*sy)+padY;
            if(Math.max(fromX,toX)<minX||Math.min(fromX,toX)>maxX||
                Math.max(fromY,toY)+footY<minY||Math.min(fromY,toY)+footY>maxY)return false;
        }
        const map = (p: Laya.Point, x: number, y: number): void => {
            p.setTo(x, y + footY);
            parent.localToGlobal(p, false);
            owner.globalToLocal(p, false);
            if(this.isometricGround){
                // Keep the Sprite transform orthogonal. Laya decomposes a sheared
                // Sprite matrix incorrectly; invert the 256x128 basis explicitly.
                const u=p.x/256+p.y/128,v=-p.x/256+p.y/128;
                p.setTo(u,v);
            }
        };
        map(this.from, fromX, fromY); map(this.to, toX, toY);
        map(this.left, fromX - halfWidth, fromY); map(this.right, fromX + halfWidth, fromY);
        map(this.back,fromX,fromY-halfDepth);map(this.front,fromX,fromY+halfDepth);
        // Elliptical foot area, including front/back extent. Its support radius
        // along each wall axis works for both diagonal directions and scaling.
        const ex = Math.hypot(this.right.x-this.left.x,this.front.x-this.back.x)*.5;
        const ey = Math.hypot(this.right.y-this.left.y,this.front.y-this.back.y)*.5;
        const minX = this.blockX - ex, maxX = this.blockX + this.blockWidth + ex;
        const minY = this.blockY - ey, maxY = this.blockY + this.blockHeight + ey;
        const inside = (x: number, y: number) => x > minX && x < maxX && y > minY && y < maxY;
        // Recover an overlapping spawn only through its nearest face. Previously
        // any outside destination was accepted, including one across the whole wall.
        if (inside(this.from.x, this.from.y)) {
            const distances=[this.from.x-minX,maxX-this.from.x,this.from.y-minY,maxY-this.from.y];
            const dx=this.to.x-this.from.x,dy=this.to.y-this.from.y;
            const outward=[-dx,dx,-dy,dy];
            const nearest=Math.min(...distances),epsilon=1e-9;
            let firstExit=Infinity;
            for(let i=0;i<4;i++)if(outward[i]>0)firstExit=Math.min(firstExit,distances[i]/outward[i]);
            for(let i=0;i<4;i++){
                if(distances[i]>nearest+epsilon||outward[i]<=0)continue;
                // The segment must reach the nearest face before a different side.
                if(firstExit>=1||distances[i]/outward[i]<=firstExit+epsilon)return false;
            }
            return true;
        }
        let enter = 0, leave = 1;
        for (const axis of ["x", "y"] as const) {
            const start = this.from[axis], delta = this.to[axis] - start;
            const low = axis === "x" ? minX : minY, high = axis === "x" ? maxX : maxY;
            if (Math.abs(delta) < 1e-8) {
                if (start <= low || start >= high) return false;
            } else {
                const a = (low - start) / delta, b = (high - start) / delta;
                enter = Math.max(enter, Math.min(a, b));
                leave = Math.min(leave, Math.max(a, b));
                if (enter >= leave) return false;
            }
        }
        return enter < 1 && leave > 0;
    }
}
