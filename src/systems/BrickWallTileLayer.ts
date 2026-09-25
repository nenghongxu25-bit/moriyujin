import { DepthObstacle } from './DepthObstacle';
import { wallFootprints, wallGroundAtX, wallConnectorCap, wallCapAlpha } from './BrickWallGeometry';
import {wallBackAtX,wallBlocksSight} from './WallVisionGeometry';
import {houseInteriorState} from './HouseInteriorState';
import {worldViewportCorners} from './WorldViewport';
import {installWallDepthSort} from './WallDepthSort';
import {SpatialBuckets} from './SpatialBuckets';
const { regClass, property } = Laya;

/** Paint real tiles in the editor; expand them for actor interleaving at runtime. */
@regClass('818f8acf-a35f-42d4-b285-b2d8b67d5af8')
@Laya.runInEditor
export class BrickWallTileLayer extends Laya.Script {
    private static readonly live = new Set<BrickWallTileLayer>();
    /** Invalidates light visibility caches when wall footprints are rebuilt or removed. */
    public static sightRevision=0;
    private static sightIndexes=new WeakMap<Laya.Sprite,{revision:number;grid:SpatialBuckets<BrickWallTileLayer['surfaces'][number]>}>();
    public static readonly viewers = new Map<Laya.Sprite,{x:number;foot:number;halfWidth:number}>();
    private target: Laya.Sprite | null = null;
    private surfaces: {mask:number;x:number;y:number;a:number;d:number;nodes?:Laya.Sprite[];caps?:{node:Laya.Sprite;bit:number}[];opacity?:number;buildVisual?:()=>void;clearVisual?:()=>void}[] = [];
    private visionElapsed=100;
    private revealed=new Set<object>();
    private static darknessDepth=new Map<Laya.Sprite,number>();
    private static darknessGround=new Map<Laya.Sprite,(x:number,y:number)=>boolean>();
    private darknessFaces=new WeakMap<object,boolean>();
    private groundDepth=new WeakMap<Laya.Sprite,number>();
    private appliedLighting=new WeakMap<object,{foreground:boolean;depth:number}>();
    private capLinks=new WeakMap<object,{revision:number;bits:Map<number,{layer:BrickWallTileLayer;surface:BrickWallTileLayer['surfaces'][number]}[]>}>();

    private static litDepth(overlay:number,ground:number):number {
        return overlay+.5+Math.atan(ground)/Math.PI*.49;
    }
    /** Keep an actor (including its weapon) in the same depth band as a front wall. */
    public static lightingActorDepth(parent:Laya.Sprite,x:number,foot:number,groundDepth:number,reach:number):number {
        const overlay=this.darknessDepth.get(parent);
        if(overlay===undefined)return groundDepth;
        for(const layer of this.live){
            if(layer.target!==parent)continue;
            for(const s of layer.surfaces){
                if(!layer.lightingForeground(s))continue;
                if(Math.abs(x-s.x)>128*s.a+reach)continue;
                // Use the same physical strip depths used by the wall renderer.
                const localX=Math.max(-127,Math.min(127,(x-s.x)/s.a));
                const direct=wallGroundAtX(s.mask,localX);
                const samples=reach>0?Array.from({length:64},(_,i)=>-126+i*4):[localX];
                for(const sx of samples){
                    if(Math.abs(s.x+sx*s.a-x)>Math.max(reach,1))continue;
                    const g=wallGroundAtX(s.mask,sx);
                    if(g===null)continue;
                    const wallDepth=s.y+g*s.d;
                    if(groundDepth>=wallDepth&&foot-wallDepth<=256*s.d+reach&&
                        (direct===null||foot>=s.y+direct*s.d))return this.litDepth(overlay,groundDepth);
                }
            }
        }
        return groundDepth;
    }

    public static setDarknessDepth(parent:Laya.Sprite,depth:number|null,containsGround?:(x:number,y:number)=>boolean):void {
        if(depth===null)this.darknessDepth.delete(parent);else this.darknessDepth.set(parent,depth);
        if(depth!==null&&containsGround)this.darknessGround.set(parent,containsGround);else this.darknessGround.delete(parent);
        for(const layer of this.live)if(layer.target===parent){layer.darknessFaces=new WeakMap();layer.updateLightingDepth();}
    }
    private lightingForeground(s:typeof this.surfaces[number]):boolean {
        if(!BrickWallTileLayer.darknessDepth.has(this.target))return false;
        // The exterior shell and its shared caps must use the same lighting band.
        if(houseInteriorState(this.owner as Laya.Sprite)===false)return true;
        const contains=BrickWallTileLayer.darknessGround.get(this.target);
            if(contains&&!this.darknessFaces.has(s)){
                let front=false;
                for(let x=-112;x<=112&&!front;x+=32){
                    const back=wallBackAtX(s.mask,x);
                    if(back!==null)front=contains(s.x+x*s.a,s.y+(back-2)*s.d);
                }
                this.darknessFaces.set(s,front);
            }
        return !!(this.darknessFaces.get(s)||(s.opacity??1)<.999);
    }
    private updateLightingDepth():void {
        const depth=BrickWallTileLayer.darknessDepth.get(this.target);
        for(const s of this.surfaces){
            const foreground=this.lightingForeground(s);
            const applied=this.appliedLighting.get(s);
            if(applied&&applied.foreground===foreground&&applied.depth===depth)continue;
            this.appliedLighting.set(s,{foreground,depth});
            const apply=(node:Laya.Sprite)=>{
                if(!this.groundDepth.has(node))this.groundDepth.set(node,node.zOrder);
                const ground=this.groundDepth.get(node);
                // Preserve strip ordering in the band between darkness and gables.
                const order=foreground?BrickWallTileLayer.litDepth(depth,ground):ground;
                if(node.zOrder!==order)node.zOrder=order;
            };
            for(const node of s.nodes||[])apply(node);
            for(const cap of s.caps||[])apply(cap.node);
        }
    }

    public static canSeeGround(parent:Laya.Sprite,ax:number,ay:number,bx:number,by:number):boolean {
        let index=this.sightIndexes.get(parent);
        if(!index||index.revision!==this.sightRevision){
            index={revision:this.sightRevision,grid:new SpatialBuckets()};
            for(const layer of this.live){
                if(layer.target!==parent)continue;
                for(const s of layer.surfaces)index.grid.add(s,s.x-128*s.a,s.y-64*s.d,s.x+128*s.a,s.y+64*s.d);
            }
            this.sightIndexes.set(parent,index);
        }
        for(const surface of index.grid.query(Math.min(ax,bx),Math.min(ay,by),Math.max(ax,bx),Math.max(ay,by)))
            if(wallBlocksSight(surface,ax,ay,bx,by))return false;
        return true;
    }

    /** null means this scene has no active observer; preserve normal rendering. */
    public static targetVisible(node:Laya.Sprite,foot:number):boolean|null {
        let hasViewer=false;
        const parent=node.parent as Laya.Sprite;
        if(!parent)return null;
        for(const [actor,view] of this.viewers){
            if(actor.destroyed||!actor.activeInHierarchy||!actor.visible||actor.scene!==node.scene||!actor.parent)continue;
            if(actor===node)return true;
            hasViewer=true;
            const world=actor.parent as Laya.Sprite;
            const p=world.globalToLocal(parent.localToGlobal(new Laya.Point(node.x,foot),false),false);
            if(this.canSeeGround(world,view.x,view.foot,p.x,p.y))return true;
        }
        return hasViewer?false:null;
    }

    /** A foreground actor is one draw unit, including its held weapon. */
    public static foregroundDepth(parent:Laya.Sprite,x:number,foot:number,reach:number):number {
        if(!parent||reach<=0)return foot;
        // A neighbouring face must never promote an actor through the wall
        // directly in front of their feet (notably on the inside of corners).
        for(const layer of this.live){
            if(layer.target!==parent)continue;
            for(const s of layer.surfaces){
                const ground=wallGroundAtX(s.mask,(x-s.x)/s.a);
                if(ground===null)continue;
                const gap=s.y+ground*s.d-foot;
                if(gap>0&&gap<=256*s.d)return foot;
            }
        }
        let depth=foot;
        for(const layer of this.live){
            if(layer.target!==parent)continue;
            for(const s of layer.surfaces){
                const localX=(x-s.x)/s.a;
                // Follow the face across tile seams within the weapon's span.
                if(Math.abs(localX)>128+reach/s.a)continue;
                let ground=wallGroundAtX(s.mask,localX);
                if(ground===null){
                    // The muzzle can overlap an adjacent corner tile even when
                    // the feet are outside that tile's horizontal image span.
                    const sign=localX<0?-1:1;
                    for(let edge=126;edge>=0;edge-=2){
                        const px=edge*sign,g=wallGroundAtX(s.mask,px);
                        const inner=wallGroundAtX(s.mask,px-sign*2);
                        if(g===null||inner===null)continue;
                        ground=g+(g-inner)/(sign*2)*(localX-px);break;
                    }
                }
                if(ground===null)continue;
                const face=s.y+ground*s.d;
                if(foot<face||foot-face>reach)continue;
                for(let sx=0;sx<256;sx+=4){
                    const px=s.x+(sx+2-128)*s.a;
                    if(Math.abs(px-x)>reach)continue;
                    const g=wallGroundAtX(s.mask,sx+2-128);
                    if(g!==null)depth=Math.max(depth,s.y+g*s.d+.01);
                }
            }
        }
        return depth;
    }
    @property({ type: Laya.Sprite, caption: '人物所在层（空则自动查找ActorLayer）' })
    public actorLayer: Laya.Sprite | null = null;
    @property({type:Number,caption:'遮挡玩家时墙体不透明度'})
    public occludedAlpha=.28;
    @property({type:Number,caption:'墙体透明过渡秒数'})
    public occlusionFadeSeconds=.18;
    private pieces: Laya.Sprite[] = [];
    private textures: Laya.Texture[] = [];
    private renderer: Laya.TileMapLayer | null = null;
    private started = false;
    private originalEnabled = true;

    onStart(): void { if (!Laya.LayaEnv.isPlaying) return; this.started = true; this.rebuild(); }
    onEnable(): void { this.protectPaintedCells(); if (Laya.LayaEnv.isPlaying && this.started) this.rebuild(); }
    onUpdate(): void { if (!Laya.LayaEnv.isPlaying) this.protectPaintedCells(); }
    onLateUpdate():void {
        if(!Laya.LayaEnv.isPlaying)return;
        this.updateVisibleSurfaces();
        const owner=this.owner as Laya.Sprite;
        this.revealed.clear();
        for(const s of this.surfaces){
            s.opacity=1;
            for(const node of s.nodes||[]){
                if(node.alpha!==owner.alpha)node.alpha=owner.alpha;
                if(node.visible!==owner.visible)node.visible=owner.visible;
            }
        }
        this.updateLightingDepth();
    }
    private updateCaps():void {
        const owner=this.owner as Laya.Sprite;
        for(const s of this.surfaces){
            const own=owner.visible&&owner.activeInHierarchy?owner.alpha*(s.opacity??1):0;
            const opacityByBit=new Map<number,number>();
            for(const cap of s.caps||[]){
                if(opacityByBit.has(cap.bit)){
                    const alpha=opacityByBit.get(cap.bit),visible=owner.visible&&alpha>0;
                    if(cap.node.alpha!==alpha)cap.node.alpha=alpha;
                    if(cap.node.visible!==visible)cap.node.visible=visible;
                    continue;
                }
                const x=s.x+(cap.bit===1?128:-128)*s.a,y=s.y+64*s.d;
                let neighbour=0;
                let links=this.capLinks.get(s);
                if(!links||links.revision!==BrickWallTileLayer.sightRevision){
                    links={revision:BrickWallTileLayer.sightRevision,bits:new Map()};this.capLinks.set(s,links);
                }
                if(!links.bits.has(cap.bit)){
                    const matches:{layer:BrickWallTileLayer;surface:typeof s}[]=[];
                    for(const layer of BrickWallTileLayer.live){
                        if(layer.target!==this.target)continue;
                        for(const other of layer.surfaces){
                            if(other===s||!(other.mask&(cap.bit===1?4:8)))continue;
                            if(Math.abs(other.x-x)>.01||Math.abs(other.y-y)>.01||Math.abs(other.a-s.a)>.001||Math.abs(other.d-s.d)>.001)continue;
                            matches.push({layer,surface:other});
                        }
                    }
                    links.bits.set(cap.bit,matches);
                }
                for(const {layer,surface:other} of links.bits.get(cap.bit)){
                    if(!BrickWallTileLayer.live.has(layer))continue;
                    if(layer.target!==this.target)continue;
                    const otherOwner=layer.owner as Laya.Sprite;
                    if(!otherOwner.visible||!otherOwner.activeInHierarchy)continue;
                        if(other===s||!(other.mask&(cap.bit===1?4:8)))continue;
                        if(Math.abs(other.x-x)>.01||Math.abs(other.y-y)>.01||Math.abs(other.a-s.a)>.001||Math.abs(other.d-s.d)>.001)continue;
                        // A face below the dark overlay cannot cover a cap above it.
                        if(this.lightingForeground(s)&&!layer.lightingForeground(other))continue;
                        neighbour=Math.max(neighbour,otherOwner.alpha*(other.opacity??1));
                }
                const alpha=wallCapAlpha(own,neighbour),visible=owner.visible&&alpha>0;
                if(cap.node.alpha!==alpha)cap.node.alpha=alpha;
                opacityByBit.set(cap.bit,alpha);
                if(cap.node.visible!==visible)cap.node.visible=visible;
            }
        }
    }
    onDisable(): void { this.clear(); }
    onDestroy(): void { this.clear(); }

    /** Keep physics everywhere, but allocate detailed wall strips only near the camera. */
    private updateVisibleSurfaces():void {
        if(!this.target||!Laya.stage?.width||!Laya.stage?.height)return;
        const points=worldViewportCorners(this.target,128);
        const left=Math.min(...points.map(p=>p.x)),right=Math.max(...points.map(p=>p.x));
        const top=Math.min(...points.map(p=>p.y)),bottom=Math.max(...points.map(p=>p.y));
        // Retain existing strips beyond the entry boundary; small back-and-forth
        // camera motion must not repeatedly allocate and destroy the same tile.
        const retain=worldViewportCorners(this.target,384);
        const keepLeft=Math.min(...retain.map(p=>p.x)),keepRight=Math.max(...retain.map(p=>p.x));
        const keepTop=Math.min(...retain.map(p=>p.y)),keepBottom=Math.max(...retain.map(p=>p.y));
        const owner=this.owner as Laya.Sprite;
        for(const s of this.surfaces){
            const loaded=!!(s.nodes?.length||s.caps?.length);
            const visible=owner.visible&&s.x+128*s.a>=(loaded?keepLeft:left)&&s.x-128*s.a<=(loaded?keepRight:right)&&s.y+48*s.d>=(loaded?keepTop:top)&&s.y-336*s.d<=(loaded?keepBottom:bottom);
            if(visible){if(!s.nodes?.length&&!s.caps?.length){s.buildVisual?.();this.appliedLighting.delete(s);}}
            else if(s.nodes?.length||s.caps?.length){s.clearVisual?.();this.appliedLighting.delete(s);}
        }
    }

    /** Engine _setCell removes the new gid from _refGids when replacing the
     * last cell of the old gid. Keep serialization based on the actual cells.
     * Scoped to this wall layer; never changes the editor's global prototypes. */
    private protectPaintedCells(): void {
        const layer = this.owner.getComponent(Laya.TileMapLayer);
        const chunks = layer && (layer as any)._chunkDatas;
        if (!chunks) return;
        for (const row of Object.values(chunks)) for (const chunk of Object.values(row)) {
            const data = chunk as any;
            if (!data._cellDataRefMap || !data._refGids) continue;
            const repair = () => {
                const gids = Object.keys(data._cellDataRefMap)
                    .filter(key => data._cellDataRefMap[key]?.length > 0).map(Number);
                data._refGids.splice(0, data._refGids.length, ...gids);
            };
            repair();
            if (Object.prototype.hasOwnProperty.call(data, 'compressData')) continue;
            const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(data), 'compressData');
            if (!descriptor?.get || !descriptor.set) continue;
            Object.defineProperty(data, 'compressData', {
                configurable: true,
                get: () => { repair(); return descriptor.get.call(data); },
                set: value => descriptor.set.call(data, value)
            });
        }
    }

    private find(root: Laya.Node): Laya.Sprite | null {
        if (root.name === 'ActorLayer') return root as Laya.Sprite;
        for (const child of root.children) { const found = this.find(child); if (found) return found; }
        return null;
    }

    /** Call after runtime tile edits; normal editor painting rebuilds on Play. */
    public rebuild(): void {
        if (!Laya.LayaEnv.isPlaying) return;
        this.protectPaintedCells();
        this.clear();
        const owner = this.owner as Laya.Sprite;
        const target = this.actorLayer || (owner.scene && this.find(owner.scene));
        const layer = owner.getComponent(Laya.TileMapLayer);
        if (!target || !layer?.tileSet) { console.error('[BrickWallTileLayer] Missing ActorLayer or TileSet.'); return; }
        this.target=target;BrickWallTileLayer.live.add(this);
        installWallDepthSort(target);
        // This engine has no public cell iterator. Read its chunk table, then use public
        // chunk accessors; screen bounds are unreliable for overhanging tall tiles.
        const chunks = (layer as any)._chunkDatas as Record<string, Record<string, Laya.TileMapChunkData>>;
        if (!chunks) { console.error('[BrickWallTileLayer] Unsupported engine chunk layout.'); return; }
        const map = (x: number, y: number): Laya.Point => target.globalToLocal(owner.localToGlobal(new Laya.Point(x,y), false), false);
        const origin = map(0,0), ax = map(1,0), ay = map(0,1);
        const a=ax.x-origin.x,b=ax.y-origin.y,c=ay.x-origin.x,d=ay.y-origin.y;
        // Rotating the whole wall layer would invalidate screen-space vertical sorting.
        if (Math.abs(b)>1e-5 || Math.abs(c)>1e-5 || a<=0 || d<=0) { console.error('[BrickWallTileLayer] Keep wall layer axes unrotated and scales positive.'); return; }
        let count = 0;
        const center = new Laya.Vector2();
        const cells: {x:number;y:number;info:Laya.ChunkCellInfo}[]=[];
        for(const row of Object.values(chunks))for(const chunk of Object.values(row)){
            for(const indices of Object.values(chunk.compressData))for(const index of indices){
                const size=layer.renderTileSize;
                cells.push({x:chunk.chunkX*size+index%size,y:chunk.chunkY*size+Math.floor(index/size),info:chunk.getCell(index)});
            }
        }
        for (const {x,y,info} of cells) {
            if (!info?.cell) continue;
            const cell=info.cell, alt=cell.cellowner, group=alt.owner;
            const mask=group.id===1 ? 16+alt.localPos.x : alt.localPos.y*4+alt.localPos.x;
            if (mask<0 || mask>17 || info._transFlag || cell.transFlag) {
                console.error('[BrickWallTileLayer] Use the supplied direction tiles without rotate/flip.'); continue;
            }
            layer.gridToPixel(x,y,center);
            const surface=map(center.x,center.y);
            const nodes:Laya.Sprite[]=[];
            const caps:{node:Laya.Sprite;bit:number}[]=[];
            const entry:typeof this.surfaces[number]={mask,x:surface.x,y:surface.y,a,d,nodes,caps,opacity:1};
            this.surfaces.push(entry);
            const texture=new Laya.Texture(group.atlas); this.textures.push(texture);
            const atlasX=2+alt.localPos.x*260,atlasY=2+alt.localPos.y*388;
            const cellX=center.x,cellY=center.y;
            const visualTextures:Laya.Texture[]=[];
            entry.clearVisual=()=>{
                for(const node of nodes)if(!node.destroyed)node.destroy(true);
                for(const cap of caps)if(!cap.node.destroyed)cap.node.destroy(true);
                nodes.length=0;caps.length=0;
                for(let i=visualTextures.length-1;i>=0;i--)visualTextures[i].destroy();
                visualTextures.length=0;
            };
            entry.buildVisual=()=>{
                // One complete image per painted wall tile. Occlusion is now
                // intentional; the existing actor outline remains visible.
                const cut=Laya.Texture.createFromTexture(texture,atlasX,atlasY,256,384);
                visualTextures.push(cut);
                const node=new Laya.Sprite();node.name='BrickWallVisual';
                // Retain the painted wall topology for optional merged Light2D blockers.
                const nativeWall=node as any;
                nativeWall.__nativeWallMask=mask;
                nativeWall.__nativeWallCenterX=surface.x;
                nativeWall.__nativeWallCenterY=surface.y;
                nativeWall.__nativeWallScaleX=a;
                nativeWall.__nativeWallScaleY=d;
                node.texture=cut;node.size(256,384);
                const pos=map(cellX-128,cellY-336);
                target.addChild(node);node.pos(pos.x,pos.y);node.scale(a,d);
                node.zOrder=map(cellX,cellY+48).y;
                node.visible=owner.visible;node.alpha=owner.alpha;
                nodes.push(node);
            };
            for(const [u,v,w,h] of wallFootprints(mask)){
                const node=new Laya.Sprite();node.name='BrickWallFootprint';target.addChild(node);
                const p=map(center.x,center.y);
                node.pos(p.x,p.y);node.scale(a,d);
                const obstacle=node.addComponent(DepthObstacle);
                obstacle.isometricGround=true;
                obstacle.blockX=u;obstacle.blockY=v;obstacle.blockWidth=w;obstacle.blockHeight=h;
                obstacle.indexStaticWall();
                this.pieces.push(node);
            }
            count++;
        }
        this.renderer=layer;this.originalEnabled=layer.enabled;layer.enabled=false;
        this.updateVisibleSurfaces();
        BrickWallTileLayer.sightRevision++;
        // A newly built layer may provide a neighbour to an already built layer.

        const visuals=this.surfaces.reduce((sum,s)=>sum+s.nodes.length+s.caps.length,0);
        console.info(`[BrickWallTileLayer] ${count} painted cells, ${visuals} visible render pieces, ${this.pieces.length} collision pieces, height=256.`);
    }

    private clear(): void {
        if(this.surfaces.length)BrickWallTileLayer.sightRevision++;
        for(const s of this.surfaces)s.clearVisual?.();
        BrickWallTileLayer.live.delete(this);this.surfaces.length=0;this.target=null;
        this.revealed.clear();this.visionElapsed=100;
        for (const node of this.pieces) if(!node.destroyed) node.destroy(true);
        this.pieces.length=0;
        for (let i=this.textures.length-1;i>=0;i--) this.textures[i].destroy();
        this.textures.length=0;
        if(this.renderer && !this.renderer.destroyed) this.renderer.enabled=this.originalEnabled;
        this.renderer=null;
    }
}
