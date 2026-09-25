const { regClass } = Laya;

/** Preview existing authored panels only. Arrow keys switch pages; no mock rewards or UI generation. */
@regClass("c8e09930-0428-4097-b41f-6c5b53096285")
export class SurvivalUIStylePreview extends Laya.Script {
    private index=0;
    private previousBackground="";
    onStart():void {
        this.previousBackground=Laya.stage.bgColor;
        Laya.stage.bgColor="#101a18";
        Laya.stage.on(Laya.Event.KEY_DOWN,this,this.onKey);
        this.show(0);
    }
    private onKey(e:Laya.Event):void {
        if(e.keyCode===39)this.show(this.index+1);
        else if(e.keyCode===37)this.show(this.index-1);
        else if(e.keyCode>=49&&e.keyCode<=57)this.show(e.keyCode-49);
    }
    private show(index:number):void {
        const root=this.owner as Laya.Sprite,count=root.numChildren;
        this.index=(index+count)%count;
        for(let i=0;i<count;i++){
            const node=root.getChildAt(i) as Laya.Sprite;
            node.active=node.visible=i===this.index;
        }
        console.log("[UIStylePreview]",this.index+1,root.getChildAt(this.index).name);
    }
    onDestroy():void {
        Laya.stage.offAllCaller(this);
        Laya.stage.bgColor=this.previousBackground;
    }
}
