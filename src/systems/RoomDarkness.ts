import {RoomRegion} from './RoomRegion';
import {BrickWallTileLayer} from './BrickWallTileLayer';
import {PlayerController} from '../Player/PlayerController';
import {Joystick} from '../PlayUI/playerui/Joystick';
import {attack as AttackControl} from '../PlayUI/playerui/attack';
import {worldViewportCorners} from './WorldViewport';
const {regClass,property}=Laya;

type RoomPatch={x:number;y:number;halfW:number;halfH:number;outline:number[]};
type RenderWindow={x:number;y:number;width:number;height:number};

/** Keep a fixed-size cache until the visible rectangle approaches its guard band. */
export function stableRoomWindow(view:RenderWindow,previous:RenderWindow):RenderWindow {
    const grid=64,padding=128,guard=32;
    const width=Math.ceil(view.width/grid)*grid+padding*2,height=Math.ceil(view.height/grid)*grid+padding*2;
    if(previous&&previous.width===width&&previous.height===height&&
       view.x>=previous.x+guard&&view.y>=previous.y+guard&&
       view.x+view.width<=previous.x+previous.width-guard&&view.y+view.height<=previous.y+previous.height-guard)return previous;
    return {x:Math.floor(view.x/grid)*grid-padding,y:Math.floor(view.y/grid)*grid-padding,width,height};
}

/** Clip the projected shade, including the raised wall face, to a bounded cache. */
export function clipRoomPolygon(points:number[],bounds:RenderWindow):number[] {
    let result=points;
    for(let edge=0;edge<4;edge++){
        const input=result;result=[];if(input.length<6)break;
        const axis=edge%2,limit=edge<2?(axis?bounds.y:bounds.x):(axis?bounds.y+bounds.height:bounds.x+bounds.width);
        const inside=(x:number,y:number)=>(edge<2?1:-1)*((axis?y:x)-limit)>=0;
        let ax=input[input.length-2],ay=input[input.length-1],aIn=inside(ax,ay);
        for(let i=0;i<input.length;i+=2){
            const bx=input[i],by=input[i+1],bIn=inside(bx,by);
            if(aIn!==bIn){const t=(limit-(axis?ay:ax))/((axis?by:bx)-(axis?ay:ax));result.push(ax+(bx-ax)*t,ay+(by-ay)*t);}
            if(bIn)result.push(bx,by);
            ax=bx;ay=by;aIn=bIn;
        }
    }
    return result.length>=6?result:[];
}

export function additionalRoomDarkness(room:number,ambient:number):number {
    room=Math.max(0,Math.min(1,room));ambient=Math.max(0,Math.min(1,ambient));
    return ambient>=room?0:(room-ambient)/(1-ambient);
}

/** One world-space dark surface for every logical room under the shared ActorLayer. */
@regClass('c21b8ba5-48c5-43d2-9476-a93783851231')
export class RoomDarkness extends Laya.Script {
    private static live=new Set<RoomDarkness>();
    public static updateAfterNight(night:Laya.Sprite):void {
        for(const effect of this.live)if(effect.externalNightLayer===night)effect.updateSharedLights();
    }
    @property({type:Laya.Sprite,caption:'已有环境黑夜层（空为独立试样）'})
    public externalNightLayer:Laya.Sprite=null;
    private sharedLights=new Map<Laya.Sprite,{node:Laya.Sprite;mask:Laya.Sprite;light:Laya.Sprite}>();
    @property({type:Laya.Sprite,caption:'玩家（空则查找正式玩家）'})
    public player:Laya.Sprite=null;
    @property({type:Number,caption:'室内黑暗强度'}) public darkness=.86;
    @property({type:Number,caption:'墙高／黑暗投影高度'}) public wallHeight=256;
    @property({type:Boolean,caption:'启用手电'}) public flashlightOn=true;
    @property({type:Boolean,caption:'启用示范室内灯'}) public lampOn=true;
    @property({type:Number,caption:'试样玩家脚底偏移'}) public footOffsetY=0;
    @property({type:Number,caption:'手电离脚底高度'}) public flashlightHeight=72;
    private patches:RoomPatch[]=[];
    private renderPatches:RoomPatch[]=[];
    private renderWindow:RenderWindow=null;
    private sharedRayCache:{x:number;y:number;revision:number;patches:RoomPatch[]}[]=[];
    private visibilityCache=new WeakMap<Laya.Sprite,{x:number;y:number;revision:number;patches:RoomPatch[];matrix:number[]}>();
    private world:Laya.Sprite;
    private black:Laya.Sprite;
    private beam:Laya.Sprite;
    private beamMask:Laya.Sprite;
    private lamp:Laya.Sprite;
    private lampMask:Laya.Sprite;
    private timer=100;
    private lastX=NaN;private lastY=NaN;private direction=0;
    private keys=new Set<string>();
    private down=(e:any)=>{const k=String(e.key||'').toLowerCase();this.keys.add(k);if(!e.repeat&&k==='f')this.flashlightOn=!this.flashlightOn;if(!e.repeat&&k==='l')this.lampOn=!this.lampOn;};
    private up=(e:any)=>this.keys.delete(String(e.key||'').toLowerCase());
    onEnable():void {RoomDarkness.live.add(this);Laya.stage.on(Laya.Event.KEY_DOWN,this,this.down);Laya.stage.on(Laya.Event.KEY_UP,this,this.up);if(this.world)this.rebuild();}
    onStart():void {
        const owner=this.owner as Laya.Sprite;this.world=owner.parent as Laya.Sprite;
        this.black=owner.getChildByName('RoomShade') as Laya.Sprite;
        this.beam=owner.getChildByName('circle_cutout') as Laya.Sprite;
        this.lamp=owner.getChildByName('lamp_cutout') as Laya.Sprite;
        this.beamMask=owner.getChildByName('FlashlightVisibility') as Laya.Sprite;
        this.lampMask=owner.getChildByName('LampVisibility') as Laya.Sprite;
        if(!this.black||!this.beam||!this.lamp||!this.beamMask||!this.lampMask){console.error('[RoomDarkness] Use the room-lighting prefab.');return;}
        owner.cacheAs='bitmap';owner.zOrder=99998;owner.mouseEnabled=false;
        // Masks must not also render as ordinary children of the cached dark layer.
        this.beamMask.removeSelf();this.lampMask.removeSelf();
        this.beam.mask=this.beamMask;this.lamp.mask=this.lampMask;
        this.rebuild();
    }
    public rebuild():void {
        if(!this.world||!this.black)return;
        this.patches=[];this.black.graphics.clear();
        this.visibilityCache=new WeakMap();
        const visit=(node:Laya.Node)=>{
            const region=node.getComponent(RoomRegion),sprite=node as Laya.Sprite;
            if(region&&node.activeInHierarchy){
                const map=node.getComponent(Laya.TileMapLayer),chunks=(map as any)?._chunkDatas;
                if(map&&chunks){
                    const size=map.renderTileSize,center=new Laya.Vector2();
                    const halfW=map.tileSet.tileSize.x/2,halfH=map.tileSet.tileSize.y/2;
                    const origin=this.toWorld(sprite,0,0),up=this.toWorld(sprite,0,-this.wallHeight/Math.max(.0001,sprite.scaleY));
                    const rise=origin.y-up.y;
                    for(const row of Object.values(chunks))for(const chunk of Object.values(row) as any[]){
                        if(!chunk?.compressData)continue;
                        for(const indices of Object.values(chunk.compressData) as any[])if(Array.isArray(indices))for(const index of indices){
                            map.gridToPixel(chunk.chunkX*size+index%size,chunk.chunkY*size+Math.floor(index/size),center);
                            const c=this.toWorld(sprite,center.x,center.y);
                            const t=this.toWorld(sprite,center.x,center.y-halfH),r=this.toWorld(sprite,center.x+halfW,center.y);
                            const b=this.toWorld(sprite,center.x,center.y+halfH),l=this.toWorld(sprite,center.x-halfW,center.y);
                            const outline=[t.x,t.y-rise,r.x,r.y-rise,r.x,r.y,b.x,b.y,l.x,l.y,l.x,l.y-rise];
                            this.patches.push({x:c.x,y:c.y,halfW:Math.abs(r.x-c.x),halfH:Math.abs(b.y-c.y),outline});
                        }
                    }
                }
            }
            for(const child of node.children)visit(child);
        };
        visit(this.world);
        BrickWallTileLayer.setDarknessDepth(this.world,this.patches.length?99998:null,(x,y)=>this.patches.some(p=>
            Math.abs(x-p.x)/p.halfW+Math.abs(y-p.y)/p.halfH<=1.001));
        // Opaque union is cached before applying a single darkness alpha.
        this.black.cacheAs='bitmap';this.black.alpha=1;
        this.refreshRenderWindow(true);
        this.timer=100;console.info(`[RoomDarkness] ${this.patches.length} logical cells; one indoor darkness layer.`);
    }
    private toWorld(node:Laya.Sprite,x:number,y:number):Laya.Point {
        return this.world.globalToLocal(node.localToGlobal(new Laya.Point(x,y),false),false);
    }
    private refreshRenderWindow(force=false):void {
        let bounds:RenderWindow=null;
        if(Laya.stage?.width>0&&Laya.stage?.height>0){
            const corners=worldViewportCorners(this.world,0);
            const x=Math.floor(Math.min(...corners.map(p=>p.x))),y=Math.floor(Math.min(...corners.map(p=>p.y)));
            bounds=stableRoomWindow({x,y,width:Math.ceil(Math.max(...corners.map(p=>p.x)))-x,height:Math.ceil(Math.max(...corners.map(p=>p.y)))-y},this.renderWindow);
        }
        const old=this.renderWindow;
        if(!force&&!bounds)return;
        if(!force&&bounds&&old&&bounds.x===old.x&&bounds.y===old.y&&bounds.width===old.width&&bounds.height===old.height)return;
        this.renderWindow=bounds;
        this.renderPatches=[];this.visibilityCache=new WeakMap();
        this.sharedRayCache=[];
        this.black.graphics.clear();
        for(const patch of this.patches){
            const outline=bounds?clipRoomPolygon(patch.outline,bounds):patch.outline;
            if(!outline.length)continue;
            this.renderPatches.push({...patch,outline});
            this.black.graphics.drawPoly(0,0,outline,'#000000');
        }
        const rect=bounds?new Laya.Rectangle(bounds.x,bounds.y,bounds.width,bounds.height):this.black.getBounds();
        (this.owner as Laya.Sprite).setSelfBounds(rect);
        if(this.black.setSelfBounds)this.black.setSelfBounds(rect);
        this.black.reCache?.();
        // Never let world-spanning light masks create world-spanning render targets.
        for(const copy of this.sharedLights.values()){
            copy.node.setSelfBounds(rect);copy.mask.setSelfBounds(rect);
        }
    }
    private visibility(light:Laya.Sprite,mask:Laya.Sprite,x:number,y:number):void {
        const revision=BrickWallTileLayer.sightRevision;
        let cached=this.visibilityCache.get(mask);
        const raysChanged=!cached||cached.x!==x||cached.y!==y||cached.revision!==revision;
        let shapeChanged=!cached;
        if(raysChanged){
            // Flashlight and its soft glow share an origin and therefore the same wall rays.
            let shared=this.sharedRayCache.find(entry=>entry.x===x&&entry.y===y&&entry.revision===revision);
            if(!shared){
                shared={x,y,revision,patches:this.renderPatches.filter(p=>BrickWallTileLayer.canSeeGround(this.world,x,y,p.x,p.y))};
                this.sharedRayCache.push(shared);if(this.sharedRayCache.length>8)this.sharedRayCache.shift();
            }
            const patches=shared.patches;
            shapeChanged=!cached||cached.patches.length!==patches.length||patches.some((patch,i)=>patch!==cached.patches[i]);
            cached={x,y,revision,patches,matrix:cached?.matrix||[]};
            this.visibilityCache.set(mask,cached);
        }
        // A camera move changes the transform, not the world-space occlusion rays.
        // Convert the affine basis once, instead of six global conversions per cell.
        const convert=(px:number,py:number)=>light.globalToLocal(this.world.localToGlobal(new Laya.Point(px,py),false),false);
        const o=convert(0,0),u=convert(1,0),v=convert(0,1);
        const matrix=[u.x-o.x,u.y-o.y,v.x-o.x,v.y-o.y,o.x,o.y];
        if(!shapeChanged&&matrix.every((value,i)=>value===cached.matrix[i]))return;
        cached.matrix=matrix;
        mask.graphics.clear();
        for(const p of cached.patches){
            const polygon:number[]=[];
            for(let i=0;i<p.outline.length;i+=2){
                const px=p.outline[i],py=p.outline[i+1];
                polygon.push(matrix[0]*px+matrix[2]*py+matrix[4],matrix[1]*px+matrix[3]*py+matrix[5]);
            }
            mask.graphics.drawPoly(0,0,polygon,'#ffffff');
        }
    }
    onLateUpdate():void {
        if(!this.black||!this.beam)return;
        // The city driver calls us after its camera, flashlight, lightning and fire updates.
        if(this.externalNightLayer&&!this.externalNightLayer.destroyed)return;
        this.refreshRenderWindow();
        const owner=this.owner as Laya.Sprite;owner.alpha=Math.max(0,Math.min(1,this.darkness));
        const controller=PlayerController.activeInstance,actor=this.player||controller?.owner as Laya.Sprite;
        this.beam.visible=this.flashlightOn&&!!actor&&!actor.destroyed;
        this.lamp.visible=this.lampOn;
        if(actor&&!actor.destroyed){
            const foot=this.toWorld(actor,0,controller?.owner===actor?controller.tileBlockFootOffsetY:this.footOffsetY);
            let dx=AttackControl.directionActive?AttackControl.activeDirectionX:Joystick.instance?.valueX||0;
            let dy=AttackControl.directionActive?AttackControl.activeDirectionY:Joystick.instance?.valueY||0;
            if(!dx&&!dy){dx=Number(this.keys.has('d')||this.keys.has('arrowright'))-Number(this.keys.has('a')||this.keys.has('arrowleft'));dy=Number(this.keys.has('s')||this.keys.has('arrowdown'))-Number(this.keys.has('w')||this.keys.has('arrowup'));}
            if(!dx&&!dy&&Number.isFinite(this.lastX)){dx=foot.x-this.lastX;dy=foot.y-this.lastY;}
            if(dx*dx+dy*dy>.0001)this.direction=Math.atan2(dy,dx)*180/Math.PI;
            this.lastX=foot.x;this.lastY=foot.y;
            this.beam.pos(foot.x,foot.y-this.flashlightHeight);this.beam.rotation=this.direction;
            // Mask coordinates depend on the current moving/rotating light transform.
            if(this.flashlightOn)this.visibility(this.beam,this.beamMask,foot.x,foot.y);
        }
        this.timer+=Laya.timer.delta;
        if(this.lampOn&&this.timer>=100){this.timer=0;this.visibility(this.lamp,this.lampMask,this.lamp.x,this.lamp.y+this.flashlightHeight);}
        owner.reCache();
    }
    private updateSharedLights():void {
        if(!this.world||!this.black||!this.beam)return;
        this.refreshRenderWindow();
        const night=this.externalNightLayer,owner=this.owner as Laya.Sprite;
        if(!this.patches.length){owner.alpha=0;return;}
        const background=night.getChildByName('black_rect') as Laya.Sprite;
        const ambient=night.visible&&background?.visible?night.alpha*background.alpha:0;
        // Lightning fades the shared night layer. Fade the room target with it
        // instead of compensating the flash by making the room layer darker.
        const roomTarget=this.darkness*(night.visible?Math.max(0,Math.min(1,night.alpha)):1);
        owner.alpha=additionalRoomDarkness(roomTarget,ambient);
        this.beam.visible=false;this.lamp.visible=false;
        const controller=PlayerController.activeInstance,actor=this.player||controller?.owner as Laya.Sprite;
        const foot=actor&&!actor.destroyed?this.toWorld(actor,0,controller?.owner===actor?controller.tileBlockFootOffsetY:this.footOffsetY):null;
        const sources=new Set<Laya.Sprite>();
        for(const child of night.children){
            const source=child as Laya.Sprite;
            if(!source.texture||source.blendMode!=='destinationOut')continue;
            sources.add(source);
            let copy=this.sharedLights.get(source);
            if(!copy){
                const node=new Laya.Sprite(),mask=new Laya.Sprite(),light=new Laya.Sprite();
                node.name='Shared_'+source.name;node.blendMode='destinationOut';node.mouseEnabled=false;
                // Keep the mask's cached render target in world space. Rotating the
                // masked sprite itself also rotates its cache bounds and clips light.
                node.addChild(light);owner.addChild(node);node.mask=mask;
                if(this.renderWindow){const b=this.renderWindow,rect=new Laya.Rectangle(b.x,b.y,b.width,b.height);node.setSelfBounds(rect);mask.setSelfBounds(rect);}
                copy={node,mask,light};this.sharedLights.set(source,copy);
            }
            const node=copy.node;
            node.visible=source.visible&&source.activeInHierarchy;
            if(!node.visible)continue;
            const light=copy.light;
            light.texture=source.texture;light.size(source.width,source.height);node.alpha=source.alpha;
            const o=this.toWorld(source,0,0),x=this.toWorld(source,1,0),y=this.toWorld(source,0,1);
            light.transform=new Laya.Matrix(x.x-o.x,x.y-o.y,y.x-o.x,y.y-o.y,o.x,o.y);
            const playerLight=source.name==='circle_cutout'||source.name==='vision_glow';
            const origin=playerLight&&foot?foot:this.toWorld(source,source.width/2,source.height/2);
            this.visibility(node,copy.mask,origin.x,origin.y+(playerLight?0:this.flashlightHeight));
        }
        for(const [source,copy] of this.sharedLights)if(!sources.has(source)||source.destroyed){
            copy.node.mask=null;copy.node.destroy();copy.mask.destroy();this.sharedLights.delete(source);
        }
        owner.reCache();
    }
    onDisable():void {
        RoomDarkness.live.delete(this);
        if(this.world)BrickWallTileLayer.setDarknessDepth(this.world,null);
        Laya.stage.off(Laya.Event.KEY_DOWN,this,this.down);Laya.stage.off(Laya.Event.KEY_UP,this,this.up);this.keys.clear();
        if(this.black&&!this.black.destroyed)this.black.graphics.clear();
    }
    onDestroy():void {
        RoomDarkness.live.delete(this);
        for(const copy of this.sharedLights.values()){
            if(!copy.node.destroyed){copy.node.mask=null;copy.node.destroy();}
            if(!copy.mask.destroyed)copy.mask.destroy();
        }
        this.sharedLights.clear();
        if(this.beam&&!this.beam.destroyed)this.beam.mask=null;
        if(this.lamp&&!this.lamp.destroyed)this.lamp.mask=null;
        if(this.beamMask&&!this.beamMask.destroyed)this.beamMask.destroy();
        if(this.lampMask&&!this.lampMask.destroyed)this.lampMask.destroy();
    }
}
