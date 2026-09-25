const { regClass } = Laya;

/** Editor gallery only: preview opening art without creating loot or modifying saves. */
@regClass()
export class LootPointGallery extends Laya.Script {
    onAwake(): void {
        for (let i=0;i<this.owner.numChildren;i++) {
            const node=this.owner.getChildAt(i) as Laya.Sprite;
            const image=node.getChildByName('img') as any;
            if(!image)continue;
            const closed=image.src;
            node.mouseEnabled=true;
            node.on(Laya.Event.CLICK,this,async()=>{
                const config=(node as any)._components.find((c:any)=>typeof c.visualId==='string');
                if(!config)return;
                const frames=config.getOpenVisualFrames();
                await Laya.loader.load(frames);
                if(node.destroyed)return;
                Laya.timer.clearAll(node);
                frames.forEach((src:string,index:number)=>Laya.timer.once(index*125,node,()=>{if(!node.destroyed)image.src=src;}));
                Laya.timer.once(1800,node,()=>{if(!node.destroyed)image.src=closed;});
            });
        }
    }
}
