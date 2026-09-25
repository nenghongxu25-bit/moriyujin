const {regClass,property}=Laya;

/** A normal TileMapLayer above the walls. Also protects editor tile serialization. */
@regClass('3591ef95-3f88-4957-88b2-bb349b43fcb1')
@Laya.runInEditor
export class RoofTileLayer extends Laya.Script {
    @property({type:Number,caption:'显示顺序（山墙低于屋顶）'})
    public displayOrder=100000;
    private display:Laya.Sprite=null;
    private renderer:Laya.TileMapLayer=null;
    private wasEnabled=true;
    private textures:Laya.Texture[]=[];
    private started=false;
    onEnable(): void { (this.owner as Laya.Sprite).zOrder=this.displayOrder; this.protect(); if(Laya.LayaEnv.isPlaying&&this.started)this.rebuild(); }
    onStart():void {if(Laya.LayaEnv.isPlaying){this.started=true;this.rebuild();}}
    onUpdate(): void {
        if (!Laya.LayaEnv.isPlaying) this.protect();
        else if(this.display)this.syncDisplay();
    }
    onDisable():void {this.clear();}
    onDestroy():void {this.clear();}
    public rebuild():void {
        this.clear();this.protect();
        const owner=this.owner as Laya.Sprite,layer=owner.getComponent(Laya.TileMapLayer);
        let world=owner.parent;
        while(world&&world.name!=='ActorLayer')world=world.parent;
        if(!world||!layer?.tileSet)return;
        this.display=new Laya.Sprite();this.display.name=this.owner.name+'Display';world.addChild(this.display);this.display.zOrder=this.displayOrder;
        const chunks=(layer as any)._chunkDatas;
        for(const row of Object.values(chunks))for(const item of Object.values(row)){
            const chunk=item as Laya.TileMapChunkData;
            for(const indices of Object.values(chunk.compressData))for(const index of indices){
                const cell=chunk.getCell(index)?.cell;if(!cell)continue;
                const alt=cell.cellowner,g=alt.owner,size=g.textureRegionSize;
                const base=new Laya.Texture(g.atlas);this.textures.push(base);
                const texture=Laya.Texture.createFromTexture(base,g.margin.x+alt.localPos.x*(size.x+g.separation.x),g.margin.y+alt.localPos.y*(size.y+g.separation.y),size.x,size.y);this.textures.push(texture);
                const p=new Laya.Vector2();layer.gridToPixel(chunk.chunkX*layer.renderTileSize+index%layer.renderTileSize,chunk.chunkY*layer.renderTileSize+Math.floor(index/layer.renderTileSize),p);
                const tile=new Laya.Sprite();tile.texture=texture;tile.pos(p.x+cell.texture_origin.x-size.x/2,p.y+cell.texture_origin.y-size.y/2);tile.zOrder=p.y;this.display.addChild(tile);
            }
        }
        this.renderer=layer;this.wasEnabled=layer.enabled;layer.enabled=false;this.syncDisplay();
    }
    private syncDisplay():void {
        const owner=this.owner as Laya.Sprite,world=this.display.parent as Laya.Sprite;
        const map=(x:number,y:number)=>world.globalToLocal(owner.localToGlobal(new Laya.Point(x,y),false),false);
        const p=map(0,0),x=map(1,0),y=map(0,1);
        this.display.transform=new Laya.Matrix(x.x-p.x,x.y-p.y,y.x-p.x,y.y-p.y,p.x,p.y);
        let alpha=1,visible=true,node:Laya.Node=owner;
        while(node&&node!==world){const s=node as Laya.Sprite;alpha*=s.alpha;visible=visible&&s.visible&&s.active;node=node.parent;}
        this.display.alpha=alpha;this.display.visible=visible;
    }
    private clear():void {
        this.display?.destroy(true);this.display=null;
        for(let i=this.textures.length-1;i>=0;i--)this.textures[i].destroy();this.textures=[];
        if(this.renderer&&!this.renderer.destroyed)this.renderer.enabled=this.wasEnabled;this.renderer=null;
    }
    private protect(): void {
        const layer=this.owner.getComponent(Laya.TileMapLayer);
        const chunks=layer && (layer as any)._chunkDatas;
        if (!chunks) return;
        for(const row of Object.values(chunks))for(const item of Object.values(row)){
            const chunk=item as any;
            if(!chunk._cellDataRefMap||!chunk._refGids)continue;
            const repair=()=>{const gids=Object.keys(chunk._cellDataRefMap).filter(k=>chunk._cellDataRefMap[k]?.length>0).map(Number);chunk._refGids.splice(0,chunk._refGids.length,...gids);};
            repair();
            if(Object.prototype.hasOwnProperty.call(chunk,'compressData'))continue;
            const descriptor=Object.getOwnPropertyDescriptor(Object.getPrototypeOf(chunk),'compressData');
            if(!descriptor?.get||!descriptor.set)continue;
            Object.defineProperty(chunk,'compressData',{configurable:true,get:()=>{repair();return descriptor.get.call(chunk);},set:value=>descriptor.set.call(chunk,value)});
        }
    }
}
