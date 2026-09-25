import { TileBlockMovement } from './TileBlockMovement';
import { DepthObstacle } from './DepthObstacle';
const { regClass, property } = Laya;

/** Keyboard movement in the single wall kit sample, using the game's movement collision. */
@regClass('f46d1f31-2b7f-4f2f-88bb-64a6e40a1f51')
export class BrickWallWalkthrough extends Laya.Script {
    @property({type:Boolean,caption:'启动时执行完整碰撞检查（较慢）'})
    public auditCollisionOnStart=false;
    @property({type:Number,caption:'人物脚底碰撞半宽'})
    public collisionHalfWidth=48;
    @property({type:Number,caption:'人物脚底碰撞前后半径'})
    public collisionHalfDepth=28;
    private move = new TileBlockMovement();
    private keys = new Set<string>();
    private down = (e: any) => this.keys.add(String(e.key || '').toLowerCase());
    private up = (e: any) => { this.keys.delete(String(e.key || '').toLowerCase()); const a=this.owner as Laya.Sprite;console.info(`[BrickWallWalkthrough] position ${a.x.toFixed(1)},${a.y.toFixed(1)}`); };
    onEnable(): void { Laya.stage.on(Laya.Event.KEY_DOWN,this,this.down); Laya.stage.on(Laya.Event.KEY_UP,this,this.up); }
    onDisable(): void { Laya.stage.off(Laya.Event.KEY_DOWN,this,this.down); Laya.stage.off(Laya.Event.KEY_UP,this,this.up);this.keys.clear(); }
    onStart(): void { Laya.timer.once(300,this,this.verify); }
    onDestroy(): void { Laya.timer.clearAll(this); }
    private verify(): void {
        const actor=this.owner as Laya.Sprite;
        const count=Array.from(DepthObstacle.activeObstacles).filter(o=>o.owner.scene===actor.scene).length;
        console.info(`[BrickWallWalkthrough] Ready: ${count} wall footprints; WASD / arrow keys.`);
        let misses=0;
        for(const obstacle of DepthObstacle.activeObstacles){
            if(obstacle.owner.scene!==actor.scene)continue;
            const wall=obstacle.owner as Laya.Sprite,parent=actor.parent as Laya.Sprite;
            const mid=obstacle.blockY+obstacle.blockHeight/2;
            const point=(u:number,v:number)=>obstacle.isometricGround?new Laya.Point(128*(u-v),64*(u+v)):new Laya.Point(u,v);
            const p=parent.globalToLocal(wall.localToGlobal(point(obstacle.blockX-1,mid),false),false);
            const q=parent.globalToLocal(wall.localToGlobal(point(obstacle.blockX+obstacle.blockWidth+1,mid),false),false);
            if(!DepthObstacle.blocksMove(actor,p.x,p.y,q.x,q.y,0,this.collisionHalfWidth,this.collisionHalfDepth))misses++;
        }
        console.info(`[BrickWallWalkthrough] collision sweep misses=${misses}/${count}`);
        if(!this.auditCollisionOnStart)return;
        const savedX=actor.x,savedY=actor.y;
        let crossings=0,trials=0;
        try{
            for(const obstacle of DepthObstacle.activeObstacles){
                if(obstacle.owner.scene!==actor.scene)continue;
                const wall=obstacle.owner as Laya.Sprite,parent=actor.parent as Laya.Sprite;
                const point=(u:number,v:number)=>parent.globalToLocal(wall.localToGlobal(obstacle.isometricGround?new Laya.Point(128*(u-v),64*(u+v)):new Laya.Point(u,v),false),false);
                for(const axis of [0,1])for(const sign of [-1,1]){
                    const u=obstacle.blockX+obstacle.blockWidth/2,v=obstacle.blockY+obstacle.blockHeight/2;
                    const p=point(u+(axis===0?sign*(obstacle.blockWidth/2+.5):0),v+(axis===1?sign*(obstacle.blockHeight/2+.5):0));
                    const q=point(u-(axis===0?sign*(obstacle.blockWidth/2+.5):0),v-(axis===1?sign*(obstacle.blockHeight/2+.5):0));
                    actor.pos(p.x,p.y);const steps=Math.ceil(Math.hypot(q.x-p.x,q.y-p.y)/3);
                    for(let i=0;i<steps;i++)this.move.move(actor,(q.x-p.x)/steps,(q.y-p.y)/steps,{footOffsetY:0,halfWidth:this.collisionHalfWidth,halfDepth:this.collisionHalfDepth});
                    trials++;if(Math.hypot(actor.x-q.x,actor.y-q.y)<1)crossings++;
                }
            }
        }finally{actor.pos(savedX,savedY);}
        console.info(`[BrickWallWalkthrough] stepped wall crossings=${crossings}/${trials}`);
        // The sample is user-editable: do not assert collisions at old fixed room coordinates.
    }
    onUpdate(): void {
        const x=Number(this.keys.has('d')||this.keys.has('arrowright'))-Number(this.keys.has('a')||this.keys.has('arrowleft'));
        const y=Number(this.keys.has('s')||this.keys.has('arrowdown'))-Number(this.keys.has('w')||this.keys.has('arrowup'));
        if(!x&&!y)return;
        const step=180*Math.min(Laya.timer.delta/1000,.05)/Math.hypot(x,y);
        this.move.move(this.owner as Laya.Sprite,x*step,y*step,{footOffsetY:0,halfWidth:this.collisionHalfWidth,halfDepth:this.collisionHalfDepth});
    }
}
