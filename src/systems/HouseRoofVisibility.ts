import {PlayerController} from '../Player/PlayerController';
import {setHouseInterior} from './HouseInteriorState';
import {RoomRegion} from './RoomRegion';
const {regClass,property}=Laya;

/** Logical rooms drive house visibility; legacy houses may still use painted floors. */
@regClass('4970ea9d-81c3-4897-b5a2-360a7281ca0d')
export class HouseRoofVisibility extends Laya.Script {
    @property({type:Laya.Sprite,caption:'玩家（空则自动找正式玩家）'})
    public player:Laya.Sprite=null;
    @property({type:Number,caption:'试样玩家脚底偏移'})
    public footOffsetY=0;
    @property({type:Number,caption:'淡入淡出秒数'})
    public fadeSeconds=.2;
    private roof:Laya.Sprite=null;
    private floor:Laya.Sprite=null;
    private regions:Laya.Node=null;
    /** Exact current room, without the roof's exit grace period. */
    public activeRoom:RoomRegion|null=null;
    private originalAlpha=1;
    private inside:boolean|null=null;
    private outsideMs=0;
    onStart():void {
        setHouseInterior(this.owner,false);
        (this.owner as Laya.Sprite).zOrder=-10000;
        this.roof=this.owner.getChildByName('RoofLayer') as Laya.Sprite;
        this.floor=this.owner.getChildByName('IndoorFloorLayer') as Laya.Sprite;
        this.regions=this.owner.getChildByName('RoomRegions');
        if(!this.roof||(!this.regions&&!this.floor)){console.error('[HouseRoofVisibility] House needs RoofLayer and RoomRegions (or legacy IndoorFloorLayer).');return;}
        this.originalAlpha=this.roof.alpha;
    }
    public containsFoot(globalFoot:Laya.Point):boolean {
        if(this.regions)return this.roomAtFoot(globalFoot)!==null;
        const visit=(node:Laya.Node):boolean=>{
            if(!node.activeInHierarchy)return false;
            const map=node.getComponent(Laya.TileMapLayer);
            if(map){const p=(node as Laya.Sprite).globalToLocal(new Laya.Point(globalFoot.x,globalFoot.y),false);if(map.getCellData(p.x,p.y,true)?.cell)return true;}
            return node.children.some(visit);
        };
        return !!this.floor && visit(this.floor);
    }
    public roomAtFoot(globalFoot:Laya.Point):RoomRegion|null {
        const visit=(node:Laya.Node):RoomRegion|null=>{
            if(!node.activeInHierarchy)return null;
            const room=node.getComponent(RoomRegion);
            if(room?.containsFoot(globalFoot))return room;
            for(const child of node.children){const found=visit(child);if(found)return found;}
            return null;
        };
        return this.regions?visit(this.regions):null;
    }
    onLateUpdate():void {
        if(!this.roof||(!this.regions&&!this.floor))return;
        const controller=PlayerController.activeInstance;
        const actor=this.player||controller?.owner as Laya.Sprite;
        if(!actor||actor.destroyed||!actor.parent||actor.scene!==this.owner.scene){this.activeRoom=null;this.inside=false;this.outsideMs=0;setHouseInterior(this.owner,false);this.fadeTo(this.originalAlpha);return;}
        const offset=controller?.owner===actor?controller.tileBlockFootOffsetY:this.footOffsetY;
        const foot=(actor.parent as Laya.Sprite).localToGlobal(new Laya.Point(actor.x,actor.y+offset),false);
        const room=this.roomAtFoot(foot);
        if(room!==this.activeRoom){this.activeRoom=room;console.info(`[HouseRoofVisibility] ${this.owner.name}: room=${room?.owner.name||'none'}`);}
        const onFloor=this.regions?room!==null:this.containsFoot(foot);
        this.outsideMs=onFloor?0:this.outsideMs+Math.min(Laya.timer.delta,100);
        // Avoid a roof flash while stepping across a painted boundary at the door.
        const inside=onFloor||(this.inside===true&&this.outsideMs<200);
        setHouseInterior(this.owner,inside);
        if(this.inside!==inside){this.inside=inside;console.info(`[HouseRoofVisibility] ${this.owner.name}: ${inside?'inside / roof hidden':'outside / roof shown'}`);}
        this.fadeTo(inside?0:this.originalAlpha);
    }
    private fadeTo(target:number):void {
        const step=this.fadeSeconds<=0?1:Math.min(1,Laya.timer.delta/(1000*this.fadeSeconds));
        const difference=target-this.roof.alpha;
        this.roof.alpha+=Math.sign(difference)*Math.min(Math.abs(difference),step*this.originalAlpha);
        if(Math.abs(target-this.roof.alpha)<1e-6)this.roof.alpha=target;
    }
    onDisable():void {setHouseInterior(this.owner,false);if(this.roof&&!this.roof.destroyed)this.roof.alpha=this.originalAlpha;this.activeRoom=null;this.inside=null;this.outsideMs=0;}
}
